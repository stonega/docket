import { Prisma } from "@prisma/client";
import type { DbClient } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { prepareD1, runD1Batch } from "@/lib/d1";
import {
  articleContentKey,
  buildSearchDocuments,
  htmlToPlainText,
  normalizeUrl,
  sha256Hex,
  type ValidatedArticleSnapshot,
} from "@/lib/articles";
import { getDocUrl } from "@/lib/utils";
import {
  deleteArticleObjects,
  getArticleHtml,
  putArticleHtml,
} from "@/lib/article-storage";
import type {
  ArticleDetail,
  ArticleSaveResponse,
  ArticleSummary,
  ArticleVersionSummary,
  ExcerptWithArticle,
} from "@/types/library";
import { newestExcerptFirstOrder } from "@/lib/excerpt-service";

const articleSummaryInclude = {
  site: { select: { id: true, title: true, url: true } },
  _count: { select: { versions: true, excerpts: true } },
} satisfies Prisma.ArticleInclude;

type ArticleSummaryRecord = Prisma.ArticleGetPayload<{
  include: typeof articleSummaryInclude;
}>;

type VersionRecord = Prisma.ArticleVersionGetPayload<Record<string, never>>;

const excerptArticleSelect = {
  id: true,
  title: true,
} satisfies Prisma.ArticleSelect;

type ExcerptRecord = Prisma.ExcerptGetPayload<{
  include: { article: { select: typeof excerptArticleSelect } };
}>;

interface SiteResolution {
  id: string;
  createData: {
    id: string;
    userId: string;
    url: string;
    title: string;
    description: string;
    icon: string;
    updateAt: Date;
  } | null;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  ) || /SQLITE_CONSTRAINT_UNIQUE|UNIQUE constraint failed/i.test(String(error));
}

function isArticleVersionConflict(error: unknown) {
  return isUniqueConstraintError(error) || String(error).includes("article_version_conflict");
}

async function deleteUnreferencedObject({
  db,
  bucket,
  articleId,
  contentKey,
}: {
  db: DbClient;
  bucket: R2Bucket;
  articleId: string;
  contentKey: string;
}) {
  try {
    const [article, references] = await Promise.all([
      db.article.findUnique({
        where: { id: articleId },
        select: { status: true },
      }),
      db.articleVersion.count({ where: { articleId, contentKey } }),
    ]);
    if (!article || article.status === "DELETING" || references === 0) {
      await bucket.delete(contentKey);
    }
  } catch {
    // A cleanup retry is safe because article bodies use content-addressed keys.
  }
}

export function serializeArticleSummary(article: ArticleSummaryRecord): ArticleSummary {
  return {
    id: article.id,
    sourceUrl: article.sourceUrl,
    canonicalUrl: article.canonicalUrl,
    title: article.title,
    author: article.author,
    description: article.description,
    siteName: article.siteName,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    imageUrl: article.imageUrl,
    faviconUrl: article.faviconUrl,
    language: article.language,
    wordCount: article.wordCount,
    savedAt: article.savedAt.toISOString(),
    updatedAt: article.updateAt.toISOString(),
    versionCount: article._count.versions,
    excerptCount: article._count.excerpts,
    site: article.site,
  };
}

export function serializeArticleVersion(
  version: VersionRecord,
  currentVersionId: string,
): ArticleVersionSummary {
  return {
    id: version.id,
    savedAt: version.createAt.toISOString(),
    title: version.title,
    author: version.author,
    wordCount: version.wordCount,
    contentHash: version.contentHash,
    contentSize: version.contentSize,
    isCurrent: version.id === currentVersionId,
    restoredFromVersionId: version.restoredFromVersionId,
  };
}

export function serializeExcerpt(excerpt: ExcerptRecord): ExcerptWithArticle {
  return {
    id: excerpt.id,
    createAt: excerpt.createAt.toISOString(),
    url: excerpt.url,
    canonicalUrl: excerpt.canonicalUrl,
    siteId: excerpt.siteId,
    content: excerpt.content,
    source: excerpt.source,
    sourceId: excerpt.sourceId,
    article: excerpt.article,
  };
}

function versionMetadata(version: VersionRecord) {
  return {
    sourceUrl: version.sourceUrl,
    canonicalUrl: version.canonicalUrl,
    title: version.title,
    author: version.author,
    description: version.description,
    siteName: version.siteName,
    publishedAt: version.publishedAt?.toISOString() ?? null,
    imageUrl: version.imageUrl,
    faviconUrl: version.faviconUrl,
    language: version.language,
    wordCount: version.wordCount,
    parseDurationMs: version.parseDurationMs,
  };
}

function aliasesForSnapshot(snapshot: ValidatedArticleSnapshot) {
  const aliases = new Map<string, "source" | "canonical">();
  aliases.set(snapshot.normalizedSourceUrl, "source");
  if (!aliases.has(snapshot.normalizedCanonicalUrl)) {
    aliases.set(snapshot.normalizedCanonicalUrl, "canonical");
  }
  return Array.from(aliases.entries()).map(([normalizedUrl, kind]) => ({ normalizedUrl, kind }));
}

function metadataValues(snapshot: ValidatedArticleSnapshot | VersionRecord) {
  return [
    snapshot.sourceUrl,
    snapshot.canonicalUrl,
    snapshot.title,
    snapshot.author,
    snapshot.description,
    snapshot.siteName,
    snapshot.publishedAt instanceof Date
      ? snapshot.publishedAt.toISOString()
      : snapshot.publishedAt,
    snapshot.imageUrl,
    snapshot.faviconUrl,
    snapshot.language,
    snapshot.wordCount,
    snapshot.parseDurationMs,
  ];
}

function aliasStatements({
  database,
  userId,
  articleId,
  aliases,
  existingUrls,
}: {
  database: D1Database;
  userId: string;
  articleId: string;
  aliases: ReturnType<typeof aliasesForSnapshot>;
  existingUrls: Set<string>;
}) {
  return aliases
    .filter((alias) => !existingUrls.has(alias.normalizedUrl))
    .map((alias) => prepareD1(
      database,
      `INSERT INTO "ArticleUrlAlias"
        ("id", "user_id", "article_id", "normalized_url", "kind")
       VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, articleId, alias.normalizedUrl, alias.kind],
    ));
}

function excerptLinkStatement({
  database,
  userId,
  articleId,
  snapshot,
}: {
  database: D1Database;
  userId: string;
  articleId: string;
  snapshot: ValidatedArticleSnapshot;
}) {
  const normalizedUrls = Array.from(new Set([
    snapshot.normalizedSourceUrl,
    snapshot.normalizedCanonicalUrl,
  ]));
  const urlValues = Array.from(new Set([
    snapshot.sourceUrl,
    snapshot.canonicalUrl,
    ...normalizedUrls,
    ...snapshot.legacyMatchUrls,
  ]));
  const normalizedPlaceholders = normalizedUrls.map(() => "?").join(", ");
  const urlPlaceholders = urlValues.map(() => "?").join(", ");
  return prepareD1(
    database,
    `UPDATE "Excerpt"
     SET "article_id" = ?
     WHERE "user_id" = ?
       AND "article_id" IS NULL
       AND (
         "normalized_page_key" IN (${normalizedPlaceholders})
         OR "url" IN (${urlPlaceholders})
         OR "canonical_url" IN (${urlPlaceholders})
       )`,
    [articleId, userId, ...normalizedUrls, ...urlValues, ...urlValues],
  );
}

function searchDocumentStatements(
  database: D1Database,
  documents: ReturnType<typeof buildSearchDocuments>,
) {
  const statements: D1PreparedStatement[] = [];
  for (let offset = 0; offset < documents.length; offset += 10) {
    const batch = documents.slice(offset, offset + 10);
    const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const values = batch.flatMap((document) => [
      document.id,
      document.userId,
      document.kind,
      document.entityId,
      document.chunkIndex,
      document.title,
      document.content,
      document.articleId,
      document.excerptId,
    ]);
    statements.push(prepareD1(
      database,
      `INSERT INTO "SearchDocument"
        ("id", "user_id", "kind", "entity_id", "chunk_index", "title", "content", "article_id", "excerpt_id")
       VALUES ${placeholders}`,
      values,
    ));
  }
  return statements;
}

function versionInsertStatement({
  database,
  id,
  articleId,
  createAt,
  restoredFromVersionId = null,
  previousVersionId = null,
  metadata,
  contentKey,
  contentHash,
  contentSize,
  fingerprint,
}: {
  database: D1Database;
  id: string;
  articleId: string;
  createAt: Date;
  restoredFromVersionId?: string | null;
  previousVersionId?: string | null;
  metadata: ValidatedArticleSnapshot | VersionRecord;
  contentKey: string;
  contentHash: string;
  contentSize: number;
  fingerprint: string;
}) {
  return prepareD1(
    database,
    `INSERT INTO "ArticleVersion" (
      "id", "article_id", "create_at", "restored_from_version_id", "previous_version_id",
      "source_url", "canonical_url", "title", "author", "description", "site_name",
      "published_at", "image_url", "favicon_url", "language", "word_count", "parse_duration_ms",
      "content_key", "content_hash", "content_size", "fingerprint"
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      articleId,
      createAt.toISOString(),
      restoredFromVersionId,
      previousVersionId,
      ...metadataValues(metadata),
      contentKey,
      contentHash,
      contentSize,
      fingerprint,
    ],
  );
}

async function resolveSite(
  db: DbClient,
  userId: string,
  snapshot: ValidatedArticleSnapshot,
): Promise<SiteResolution> {
  const source = new URL(snapshot.normalizedSourceUrl);
  const sites = await db.site.findMany({
    where: { userId },
    select: { id: true, url: true },
  });

  const matchingSite = sites
    .map((site) => {
      try {
        const normalized = new URL(normalizeUrl(site.url));
        const sameOrigin = normalized.origin === source.origin;
        const sitePath = normalized.pathname === "/" ? "/" : `${normalized.pathname}/`;
        const sourcePath = source.pathname === "/" ? "/" : `${source.pathname}/`;
        return {
          ...site,
          matches: sameOrigin && sourcePath.startsWith(sitePath),
          specificity: normalized.pathname.length,
        };
      } catch {
        return { ...site, matches: false, specificity: 0 };
      }
    })
    .filter((site) => site.matches)
    .sort((left, right) => right.specificity - left.specificity)[0];

  if (matchingSite) return { id: matchingSite.id, createData: null };

  const id = crypto.randomUUID();
  const docUrl = getDocUrl(snapshot.normalizedSourceUrl) ?? source.origin;
  return {
    id,
    createData: {
      id,
      userId,
      url: normalizeUrl(docUrl),
      title: snapshot.siteName ?? source.hostname.replace(/^www\./, ""),
      description: snapshot.description ?? "",
      icon: snapshot.faviconUrl ?? "",
      updateAt: new Date(),
    },
  };
}

async function findArticleForAliases(
  db: DbClient,
  userId: string,
  normalizedUrls: string[],
) {
  const matches = await db.articleUrlAlias.findMany({
    where: { userId, normalizedUrl: { in: normalizedUrls } },
    include: { article: true },
  });
  const articleIds = new Set(matches.map((match) => match.articleId));
  if (articleIds.size > 1) {
    throw new ApiError(
      409,
      "article_alias_conflict",
      "The source and canonical URLs belong to different saved articles",
    );
  }
  const article = matches[0]?.article ?? null;
  if (article?.status === "DELETING") {
    throw new ApiError(409, "article_deleting", "This article is currently being deleted");
  }
  return { article, matches };
}

async function getSummaryRecord(db: DbClient, userId: string, articleId: string) {
  const article = await db.article.findFirst({
    where: { id: articleId, userId, status: "ACTIVE" },
    include: articleSummaryInclude,
  });
  if (!article) throw new ApiError(404, "article_not_found", "Article not found");
  return article;
}

async function unchangedSave({
  db,
  database,
  userId,
  article,
  snapshot,
  aliases,
  matchedAliasUrls,
}: {
  db: DbClient;
  database: D1Database;
  userId: string;
  article: NonNullable<Awaited<ReturnType<typeof findArticleForAliases>>["article"]>;
  snapshot: ValidatedArticleSnapshot;
  aliases: ReturnType<typeof aliasesForSnapshot>;
  matchedAliasUrls: Set<string>;
}): Promise<ArticleSaveResponse> {
  const statements = [
    ...aliasStatements({
      database,
      userId,
      articleId: article.id,
      aliases,
      existingUrls: matchedAliasUrls,
    }),
    excerptLinkStatement({
      database,
      userId,
      articleId: article.id,
      snapshot,
    }),
    prepareD1(
      database,
      `UPDATE "Site" SET "update_at" = ? WHERE "id" = ? AND "user_id" = ?`,
      [new Date().toISOString(), article.siteId, userId],
    ),
  ];
  await runD1Batch(database, statements);
  const summary = await getSummaryRecord(db, userId, article.id);
  return {
    outcome: "unchanged",
    article: serializeArticleSummary(summary),
    versionId: article.currentVersionId,
    linkedExcerptCount: summary._count.excerpts,
  };
}

async function createArticle({
  db,
  database,
  bucket,
  userId,
  snapshot,
  aliases,
}: {
  db: DbClient;
  database: D1Database;
  bucket: R2Bucket;
  userId: string;
  snapshot: ValidatedArticleSnapshot;
  aliases: ReturnType<typeof aliasesForSnapshot>;
}): Promise<ArticleSaveResponse> {
  const articleId = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const contentKey = articleContentKey(userId, articleId, snapshot.contentHash);
  const site = await resolveSite(db, userId, snapshot);

  await putArticleHtml({
    bucket,
    key: contentKey,
    html: snapshot.html,
    language: snapshot.language,
    contentHash: snapshot.contentHash,
  });

  const searchDocuments = buildSearchDocuments({
    kind: "article",
    entityId: articleId,
    userId,
    title: snapshot.title,
    plainText: snapshot.plainText,
  });
  const now = new Date();
  const statements: D1PreparedStatement[] = [];
  if (site.createData) {
    statements.push(prepareD1(
      database,
      `INSERT INTO "Site"
        ("id", "update_at", "title", "icon", "url", "description", "user_id")
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        site.createData.id,
        site.createData.updateAt.toISOString(),
        site.createData.title,
        site.createData.icon,
        site.createData.url,
        site.createData.description,
        site.createData.userId,
      ],
    ));
  }
  statements.push(
    prepareD1(
      database,
      `INSERT INTO "Article" (
        "id", "create_at", "update_at", "saved_at", "user_id", "site_id", "status",
        "source_url", "canonical_url", "title", "author", "description", "site_name",
        "published_at", "image_url", "favicon_url", "language", "word_count", "parse_duration_ms",
        "current_version_id", "current_content_key", "current_content_hash",
        "current_content_size", "current_fingerprint"
      ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        articleId,
        now.toISOString(),
        now.toISOString(),
        now.toISOString(),
        userId,
        site.id,
        ...metadataValues(snapshot),
        versionId,
        contentKey,
        snapshot.contentHash,
        snapshot.contentSize,
        snapshot.fingerprint,
      ],
    ),
    versionInsertStatement({
      database,
      id: versionId,
      articleId,
      createAt: now,
      metadata: snapshot,
      contentKey,
      contentHash: snapshot.contentHash,
      contentSize: snapshot.contentSize,
      fingerprint: snapshot.fingerprint,
    }),
    ...aliasStatements({
      database,
      userId,
      articleId,
      aliases,
      existingUrls: new Set(),
    }),
    ...searchDocumentStatements(database, searchDocuments),
    excerptLinkStatement({
      database,
      userId,
      articleId,
      snapshot,
    }),
  );
  if (!site.createData) {
    statements.push(prepareD1(
      database,
      `UPDATE "Site" SET "update_at" = ? WHERE "id" = ? AND "user_id" = ?`,
      [now.toISOString(), site.id, userId],
    ));
  }

  try {
    await runD1Batch(database, statements);
  } catch (error) {
    try {
      await bucket.delete(contentKey);
    } catch {
      // The failed article has a unique key and can be cleaned up safely later.
    }
    throw error;
  }

  const summary = await getSummaryRecord(db, userId, articleId);
  return {
    outcome: "created",
    article: serializeArticleSummary(summary),
    versionId,
    linkedExcerptCount: summary._count.excerpts,
  };
}

async function createVersion({
  db,
  database,
  bucket,
  userId,
  article,
  snapshot,
  aliases,
  matchedAliasUrls,
}: {
  db: DbClient;
  database: D1Database;
  bucket: R2Bucket;
  userId: string;
  article: NonNullable<Awaited<ReturnType<typeof findArticleForAliases>>["article"]>;
  snapshot: ValidatedArticleSnapshot;
  aliases: ReturnType<typeof aliasesForSnapshot>;
  matchedAliasUrls: Set<string>;
}): Promise<ArticleSaveResponse> {
  const versionId = crypto.randomUUID();
  const contentKey = articleContentKey(userId, article.id, snapshot.contentHash);
  await putArticleHtml({
    bucket,
    key: contentKey,
    html: snapshot.html,
    language: snapshot.language,
    contentHash: snapshot.contentHash,
  });

  const searchDocuments = buildSearchDocuments({
    kind: "article",
    entityId: article.id,
    userId,
    title: snapshot.title,
    plainText: snapshot.plainText,
  });
  const now = new Date();
  const statements = [
    versionInsertStatement({
      database,
      id: versionId,
      articleId: article.id,
      createAt: now,
      previousVersionId: article.currentVersionId,
      metadata: snapshot,
      contentKey,
      contentHash: snapshot.contentHash,
      contentSize: snapshot.contentSize,
      fingerprint: snapshot.fingerprint,
    }),
    prepareD1(
      database,
      `UPDATE "Article" SET
        "source_url" = ?, "canonical_url" = ?, "title" = ?, "author" = ?,
        "description" = ?, "site_name" = ?, "published_at" = ?, "image_url" = ?,
        "favicon_url" = ?, "language" = ?, "word_count" = ?, "parse_duration_ms" = ?,
        "current_version_id" = ?, "current_content_key" = ?, "current_content_hash" = ?,
        "current_content_size" = ?, "current_fingerprint" = ?, "update_at" = ?, "saved_at" = ?
       WHERE "id" = ? AND "user_id" = ? AND "status" = 'ACTIVE'
         AND "current_version_id" = ?`,
      [
        ...metadataValues(snapshot),
        versionId,
        contentKey,
        snapshot.contentHash,
        snapshot.contentSize,
        snapshot.fingerprint,
        now.toISOString(),
        now.toISOString(),
        article.id,
        userId,
        article.currentVersionId,
      ],
    ),
    ...aliasStatements({
      database,
      userId,
      articleId: article.id,
      aliases,
      existingUrls: matchedAliasUrls,
    }),
    prepareD1(
      database,
      `DELETE FROM "SearchDocument" WHERE "article_id" = ?`,
      [article.id],
    ),
    ...searchDocumentStatements(database, searchDocuments),
    excerptLinkStatement({
      database,
      userId,
      articleId: article.id,
      snapshot,
    }),
    prepareD1(
      database,
      `UPDATE "Site" SET "update_at" = ? WHERE "id" = ? AND "user_id" = ?`,
      [now.toISOString(), article.siteId, userId],
    ),
  ];
  try {
    await runD1Batch(database, statements);
  } catch (error) {
    await deleteUnreferencedObject({
      db,
      bucket,
      articleId: article.id,
      contentKey,
    });
    throw error;
  }

  const summary = await getSummaryRecord(db, userId, article.id);
  return {
    outcome: "versioned",
    article: serializeArticleSummary(summary),
    versionId,
    linkedExcerptCount: summary._count.excerpts,
  };
}

export async function saveArticleSnapshot({
  db,
  database,
  bucket,
  userId,
  snapshot,
}: {
  db: DbClient;
  database: D1Database;
  bucket: R2Bucket;
  userId: string;
  snapshot: ValidatedArticleSnapshot;
}) {
  const aliases = aliasesForSnapshot(snapshot);
  const normalizedUrls = aliases.map((alias) => alias.normalizedUrl);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const match = await findArticleForAliases(db, userId, normalizedUrls);
      if (!match.article) {
        return await createArticle({ db, database, bucket, userId, snapshot, aliases });
      }
      const matchedAliasUrls = new Set(match.matches.map((alias) => alias.normalizedUrl));
      if (match.article.currentFingerprint === snapshot.fingerprint) {
        return await unchangedSave({
          db,
          database,
          userId,
          article: match.article,
          snapshot,
          aliases,
          matchedAliasUrls,
        });
      }
      return await createVersion({
        db,
        database,
        bucket,
        userId,
        article: match.article,
        snapshot,
        aliases,
        matchedAliasUrls,
      });
    } catch (error) {
      if (!isArticleVersionConflict(error)) throw error;
      if (attempt === 1) {
        throw new ApiError(
          409,
          "concurrent_save",
          "The article changed during this save; try again",
        );
      }
    }
  }
  throw new ApiError(409, "concurrent_save", "The article changed during this save; try again");
}

export async function listArticles({
  db,
  userId,
  siteId,
  skip,
  take,
}: {
  db: DbClient;
  userId: string;
  siteId?: string;
  skip: number;
  take: number;
}) {
  const articles = await db.article.findMany({
    where: { userId, status: "ACTIVE", ...(siteId ? { siteId } : {}) },
    include: articleSummaryInclude,
    orderBy: [{ updateAt: "desc" }, { id: "desc" }],
    skip,
    take,
  });
  return articles.map(serializeArticleSummary);
}

export async function getArticleDetail({
  db,
  userId,
  articleId,
}: {
  db: DbClient;
  userId: string;
  articleId: string;
}): Promise<ArticleDetail> {
  const article = await getSummaryRecord(db, userId, articleId);
  const [versions, excerpts] = await Promise.all([
    db.articleVersion.findMany({
      where: { articleId },
      orderBy: [{ createAt: "desc" }, { id: "desc" }],
      take: 20,
    }),
    db.excerpt.findMany({
      where: { articleId, userId },
      include: { article: { select: excerptArticleSelect } },
      orderBy: newestExcerptFirstOrder,
    }),
  ]);
  const currentVersion = versions.find((version) => version.id === article.currentVersionId)
    ?? await db.articleVersion.findFirst({ where: { id: article.currentVersionId, articleId } });
  if (!currentVersion) {
    throw new ApiError(503, "article_version_unavailable", "Current article version is unavailable");
  }

  return {
    ...serializeArticleSummary(article),
    currentVersion: serializeArticleVersion(currentVersion, article.currentVersionId),
    versions: versions.map((version) => serializeArticleVersion(version, article.currentVersionId)),
    excerpts: excerpts.map(serializeExcerpt),
  };
}

export async function listArticleVersions({
  db,
  userId,
  articleId,
  skip,
  take,
}: {
  db: DbClient;
  userId: string;
  articleId: string;
  skip: number;
  take: number;
}) {
  const article = await db.article.findFirst({
    where: { id: articleId, userId, status: "ACTIVE" },
    select: { currentVersionId: true },
  });
  if (!article) throw new ApiError(404, "article_not_found", "Article not found");
  const versions = await db.articleVersion.findMany({
    where: { articleId },
    orderBy: [{ createAt: "desc" }, { id: "desc" }],
    skip,
    take,
  });
  return versions.map((version) => serializeArticleVersion(version, article.currentVersionId));
}

export async function getArticleReaderData({
  db,
  bucket,
  userId,
  articleId,
  versionId,
}: {
  db: DbClient;
  bucket: R2Bucket;
  userId: string;
  articleId: string;
  versionId?: string;
}) {
  const detail = await getArticleDetail({ db, userId, articleId });
  const selectedVersionId = versionId ?? detail.currentVersion.id;
  const version = await db.articleVersion.findFirst({
    where: { id: selectedVersionId, articleId },
  });
  if (!version) throw new ApiError(404, "article_version_not_found", "Article version not found");
  let html: string | null = null;
  let contentUnavailable = false;
  try {
    html = await getArticleHtml(bucket, version.contentKey);
    contentUnavailable = html === null || (await sha256Hex(html)) !== version.contentHash;
    if (contentUnavailable) html = null;
  } catch {
    contentUnavailable = true;
  }
  return {
    detail,
    selectedVersion: serializeArticleVersion(version, detail.currentVersion.id),
    selectedMetadata: versionMetadata(version),
    html,
    contentUnavailable,
  };
}

export async function restoreArticleVersion({
  db,
  database,
  bucket,
  userId,
  articleId,
  versionId,
}: {
  db: DbClient;
  database: D1Database;
  bucket: R2Bucket;
  userId: string;
  articleId: string;
  versionId: string;
}) {
  const article = await db.article.findFirst({
    where: { id: articleId, userId, status: "ACTIVE" },
  });
  if (!article) throw new ApiError(404, "article_not_found", "Article not found");
  if (article.currentVersionId === versionId) {
    throw new ApiError(409, "version_is_current", "This version is already current");
  }
  const version = await db.articleVersion.findFirst({ where: { id: versionId, articleId } });
  if (!version) throw new ApiError(404, "article_version_not_found", "Article version not found");
  const html = await getArticleHtml(bucket, version.contentKey);
  if (html === null || (await sha256Hex(html)) !== version.contentHash) {
    throw new ApiError(503, "article_content_unavailable", "Saved article content is unavailable");
  }

  const newVersionId = crypto.randomUUID();
  const now = new Date();
  const documents = buildSearchDocuments({
    kind: "article",
    entityId: article.id,
    userId,
    title: version.title,
    plainText: htmlToPlainText(html),
  });
  const statements = [
    versionInsertStatement({
      database,
      id: newVersionId,
      articleId,
      createAt: now,
      previousVersionId: article.currentVersionId,
      restoredFromVersionId: version.id,
      metadata: version,
      contentKey: version.contentKey,
      contentHash: version.contentHash,
      contentSize: version.contentSize,
      fingerprint: version.fingerprint,
    }),
    prepareD1(
      database,
      `UPDATE "Article" SET
        "source_url" = ?, "canonical_url" = ?, "title" = ?, "author" = ?,
        "description" = ?, "site_name" = ?, "published_at" = ?, "image_url" = ?,
        "favicon_url" = ?, "language" = ?, "word_count" = ?, "parse_duration_ms" = ?,
        "current_version_id" = ?, "current_content_key" = ?, "current_content_hash" = ?,
        "current_content_size" = ?, "current_fingerprint" = ?, "update_at" = ?, "saved_at" = ?
       WHERE "id" = ? AND "user_id" = ? AND "status" = 'ACTIVE'
         AND "current_version_id" = ?`,
      [
        ...metadataValues(version),
        newVersionId,
        version.contentKey,
        version.contentHash,
        version.contentSize,
        version.fingerprint,
        now.toISOString(),
        now.toISOString(),
        articleId,
        userId,
        article.currentVersionId,
      ],
    ),
    prepareD1(
      database,
      `DELETE FROM "SearchDocument" WHERE "article_id" = ?`,
      [articleId],
    ),
    ...searchDocumentStatements(database, documents),
    prepareD1(
      database,
      `UPDATE "Site" SET "update_at" = ? WHERE "id" = ? AND "user_id" = ?`,
      [now.toISOString(), article.siteId, userId],
    ),
  ];
  try {
    await runD1Batch(database, statements);
  } catch (error) {
    if (isArticleVersionConflict(error)) {
      throw new ApiError(409, "concurrent_restore", "The article changed during restore; try again");
    }
    throw error;
  }
  return { versionId: newVersionId };
}

export async function deleteArticle({
  db,
  database,
  bucket,
  userId,
  articleId,
}: {
  db: DbClient;
  database: D1Database;
  bucket: R2Bucket;
  userId: string;
  articleId: string;
}) {
  const article = await db.article.findFirst({
    where: { id: articleId, userId },
    select: { id: true, status: true },
  });
  if (!article) return;

  if (article.status !== "DELETING") {
    await prepareD1(
      database,
      `UPDATE "Article" SET "status" = 'DELETING'
       WHERE "id" = ? AND "user_id" = ? AND "status" = 'ACTIVE'`,
      [articleId, userId],
    ).run();
  }
  const deletingArticle = await db.article.findFirst({
    where: { id: articleId, userId, status: "DELETING" },
    select: {
      currentContentKey: true,
      versions: { select: { contentKey: true } },
    },
  });
  if (!deletingArticle) return;
  await deleteArticleObjects(bucket, [
    deletingArticle.currentContentKey,
    ...deletingArticle.versions.map((version) => version.contentKey),
  ]);
  await runD1Batch(database, [
    prepareD1(
      database,
      `UPDATE "Excerpt" SET "article_id" = NULL
       WHERE "article_id" = ? AND "user_id" = ?`,
      [articleId, userId],
    ),
    prepareD1(database, `DELETE FROM "SearchDocument" WHERE "article_id" = ?`, [articleId]),
    prepareD1(database, `DELETE FROM "ArticleUrlAlias" WHERE "article_id" = ?`, [articleId]),
    prepareD1(database, `DELETE FROM "ArticleVersion" WHERE "article_id" = ?`, [articleId]),
    prepareD1(
      database,
      `DELETE FROM "Article" WHERE "id" = ? AND "user_id" = ?`,
      [articleId, userId],
    ),
  ]);
}

export async function findOwnedArticleForPage({
  db,
  userId,
  url,
}: {
  db: DbClient;
  userId: string;
  url: string;
}) {
  const normalizedUrl = normalizeUrl(url);
  const alias = await db.articleUrlAlias.findUnique({
    where: { userId_normalizedUrl: { userId, normalizedUrl } },
    include: { article: { select: { id: true, title: true, status: true } } },
  });
  return alias?.article.status === "ACTIVE"
    ? { id: alias.article.id, title: alias.article.title, normalizedUrl }
    : { id: null, title: null, normalizedUrl };
}
