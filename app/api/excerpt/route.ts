import { getD1Database, getDb } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  isRecord,
  jsonResponse,
  optionsResponse,
  parsePagination,
  readJsonBody,
  requireUserId,
} from "@/lib/api";
import {
  buildSearchDocuments,
  htmlToPlainText,
  normalizeUrl,
  sanitizeArticleHtml,
} from "@/lib/articles";
import { findOwnedArticleForPage, serializeExcerpt } from "@/lib/article-service";
import {
  excerptWithArticleInclude,
  listExcerptRecords,
} from "@/lib/excerpt-service";
import type { NextRequest } from "next/server";
import { prepareD1, runD1Batch } from "@/lib/d1";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const searchParams = request.nextUrl.searchParams;
    const { skip, pageSize } = parsePagination(searchParams);
    const siteId = searchParams.get("site_id")?.trim();
    const url = searchParams.get("url");
    const search = searchParams.get("search")?.trim();
    const db = getDb();
    const excerpts = await listExcerptRecords({
      db,
      userId,
      url: url || undefined,
      siteId: siteId || undefined,
      search: search || undefined,
      skip,
      take: pageSize,
    });
    return jsonResponse(excerpts.map(serializeExcerpt));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await readJsonBody(request, 2 * 1024 * 1024);
    if (!isRecord(body)) {
      throw new ApiError(400, "invalid_request", "Request body must be an object");
    }
    const siteId = typeof body.siteId === "string" ? body.siteId : undefined;
    const content = typeof body.content === "string" ? body.content : undefined;
    const url = typeof body.url === "string" ? body.url : undefined;
    const canonicalUrl = typeof body.canonicalUrl === "string" ? body.canonicalUrl : null;
    const source = typeof body.source === "string" ? body.source : undefined;
    const sourceId = typeof body.sourceId === "string" ? body.sourceId : undefined;
    if (!siteId || !content || !url) {
      throw new ApiError(400, "missing_fields", "siteId, content, and url are required");
    }

    const db = getDb();
    const site = await db.site.findFirst({ where: { id: siteId, userId } });
    if (!site) throw new ApiError(404, "site_not_found", "Site not found");
    const sanitizedContent = sanitizeArticleHtml(content);
    const normalizedSourceUrl = normalizeUrl(url);
    const normalizedCanonicalUrl = canonicalUrl ? normalizeUrl(canonicalUrl) : null;
    let pageMatch = await findOwnedArticleForPage({
      db,
      userId,
      url: canonicalUrl ?? url,
    });
    if (
      !pageMatch.id &&
      normalizedCanonicalUrl &&
      normalizedCanonicalUrl !== normalizedSourceUrl
    ) {
      pageMatch = await findOwnedArticleForPage({ db, userId, url });
    }
    const excerptId = crypto.randomUUID();
    const searchDocuments = buildSearchDocuments({
      kind: "excerpt",
      entityId: excerptId,
      userId,
      title: site.title,
      plainText: htmlToPlainText(sanitizedContent),
    });
    const database = getD1Database();
    const statements = [
      prepareD1(
        database,
        `INSERT INTO "Excerpt" (
          "id", "url", "canonical_url", "normalized_page_key", "site_id",
          "article_id", "content", "source", "source_id", "user_id"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          excerptId,
          url,
          normalizedCanonicalUrl,
          normalizedCanonicalUrl ?? normalizedSourceUrl,
          siteId,
          pageMatch.id,
          sanitizedContent,
          source ?? null,
          sourceId ?? null,
          userId,
        ],
      ),
      prepareD1(
        database,
        `UPDATE "Site" SET "update_at" = ? WHERE "id" = ? AND "user_id" = ?`,
        [new Date().toISOString(), siteId, userId],
      ),
    ];
    for (const document of searchDocuments) {
      statements.push(prepareD1(
        database,
        `INSERT INTO "SearchDocument" (
          "id", "user_id", "kind", "entity_id", "chunk_index", "title",
          "content", "article_id", "excerpt_id"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          document.id,
          document.userId,
          document.kind,
          document.entityId,
          document.chunkIndex,
          document.title,
          document.content,
          document.articleId,
          document.excerptId,
        ],
      ));
    }
    await runD1Batch(database, statements);

    const excerpt = await db.excerpt.findFirst({
      where: { id: excerptId, userId },
      include: excerptWithArticleInclude,
    });
    if (!excerpt) throw new ApiError(500, "excerpt_unavailable", "Excerpt could not be loaded");
    return jsonResponse(serializeExcerpt(excerpt), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await readJsonBody(request, 64 * 1024);
    if (!isRecord(body)) {
      throw new ApiError(400, "invalid_request", "Request body must be an object");
    }
    const id = typeof body.id === "string" ? body.id : undefined;
    const sourceId = typeof body.sourceId === "string" ? body.sourceId : undefined;
    if (!id && !sourceId) {
      throw new ApiError(400, "missing_fields", "id or sourceId is required");
    }

    const db = getDb();
    const excerpts = await db.excerpt.findMany({
      where: { userId, ...(id ? { id } : { sourceId }) },
      include: excerptWithArticleInclude,
    });
    if (id && excerpts.length === 0) {
      throw new ApiError(404, "excerpt_not_found", "Excerpt not found");
    }
    const excerptIds = excerpts.map((excerpt) => excerpt.id);
    if (excerptIds.length > 0) {
      const database = getD1Database();
      const placeholders = excerptIds.map(() => "?").join(", ");
      await runD1Batch(database, [
        prepareD1(
          database,
          `DELETE FROM "SearchDocument" WHERE "excerpt_id" IN (${placeholders})`,
          excerptIds,
        ),
        prepareD1(
          database,
          `DELETE FROM "Excerpt"
           WHERE "id" IN (${placeholders}) AND "user_id" = ?`,
          [...excerptIds, userId],
        ),
      ]);
    }
    return jsonResponse(id ? serializeExcerpt(excerpts[0]) : { count: excerpts.length });
  } catch (error) {
    return errorResponse(error);
  }
}
