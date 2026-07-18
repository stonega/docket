// @vitest-environment node

import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  deleteArticle,
  findOwnedArticleForPage,
  getArticleDetail,
  getArticleReaderData,
  listArticles,
  restoreArticleVersion,
  saveArticleSnapshot,
} from "../lib/article-service";
import { normalizeUrl, validateArticleSaveRequest } from "../lib/articles";
import { listExcerptRecords } from "../lib/excerpt-service";

let runtime: Miniflare;
let database: D1Database;
let bucket: R2Bucket;
let db: PrismaClient;

async function snapshot(
  sourceUrl: string,
  options: { html?: string; title?: string; canonicalUrl?: string } = {},
) {
  return validateArticleSaveRequest({
    html: options.html ?? "<article><h1>Saved locally</h1><p>The original searchable article body.</p></article>",
    sourceUrl,
    canonicalUrl: options.canonicalUrl ?? sourceUrl,
    title: options.title ?? "Saved locally",
    author: "Docket Test",
    site: "Example",
  });
}

beforeEach(async () => {
  runtime = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response('ok') } }",
    compatibilityDate: "2026-07-12",
    d1Databases: ["DB"],
    r2Buckets: ["ARTICLE_BUCKET"],
  });
  database = await runtime.getD1Database("DB") as unknown as D1Database;
  bucket = await runtime.getR2Bucket("ARTICLE_BUCKET") as unknown as R2Bucket;
  for (const migration of [
    "migrations/0001_initial_schema.sql",
    "migrations/0002_excerpt_fts.sql",
    "migrations/0003_article_library.sql",
  ]) {
    const sql = (await readFile(migration, "utf8"))
      .replace(/--[^\n]*/g, "")
      .replace(/\s*\r?\n\s*/g, " ");
    await database.exec(sql);
  }
  db = new PrismaClient({ adapter: new PrismaD1(database) });
});

afterEach(async () => {
  await db?.$disconnect();
  await runtime?.dispose();
});

describe("article lifecycle on D1 and R2", () => {
  test("creates, links, versions, restores, isolates, and deletes without losing excerpts", async () => {
    const userId = "user-one";
    const sourceUrl = "https://example.com/article?utm_source=fixture#section";
    const canonicalUrl = "https://example.com/library/article";
    await db.site.create({
      data: {
        id: "site-before",
        userId,
        title: "Example",
        icon: "",
        description: "",
        url: "https://example.com",
      },
    });
    await db.excerpt.create({
      data: {
        id: "excerpt-before",
        createAt: new Date("2026-01-01T00:00:00.000Z"),
        userId,
        siteId: "site-before",
        url: sourceUrl,
        // Simulate migration 0003, which could only copy the legacy URL
        // verbatim before the application had a normalized page key.
        normalizedPageKey: sourceUrl,
        content: "An excerpt saved before its article.",
      },
    });

    const original = await snapshot(sourceUrl, { canonicalUrl });
    const created = await saveArticleSnapshot({
      db,
      database,
      bucket,
      userId,
      snapshot: original,
    });
    expect(created.outcome).toBe("created");
    expect(created.linkedExcerptCount).toBe(1);
    expect(await bucket.get(`articles/${userId}/${created.article.id}/${original.contentHash}.html`))
      .not.toBeNull();
    expect(await db.site.count({ where: { userId } })).toBe(1);
    expect(await db.excerpt.findUnique({ where: { id: "excerpt-before" } }))
      .toMatchObject({ articleId: created.article.id });

    const unchanged = await saveArticleSnapshot({
      db,
      database,
      bucket,
      userId,
      snapshot: original,
    });
    expect(unchanged.outcome).toBe("unchanged");
    expect(unchanged.versionId).toBe(created.versionId);
    expect(await db.articleVersion.count({ where: { articleId: created.article.id } })).toBe(1);

    const pageMatch = await findOwnedArticleForPage({
      db,
      userId,
      url: `${canonicalUrl}?utm_campaign=ignored`,
    });
    expect(pageMatch.id).toBe(created.article.id);
    await db.excerpt.create({
      data: {
        id: "excerpt-after",
        createAt: new Date("2026-01-02T00:00:00.000Z"),
        userId,
        siteId: "site-before",
        url: canonicalUrl,
        normalizedPageKey: pageMatch.normalizedUrl,
        articleId: pageMatch.id,
        content: "An excerpt saved after its article.",
      },
    });

    const changedSnapshot = await snapshot(sourceUrl, {
      canonicalUrl,
      title: "Saved locally, revised",
      html: "<article><h1>Saved locally, revised</h1><p>The revised searchable article body.</p></article>",
    });
    const versioned = await saveArticleSnapshot({
      db,
      database,
      bucket,
      userId,
      snapshot: changedSnapshot,
    });
    expect(versioned.outcome).toBe("versioned");
    expect(versioned.linkedExcerptCount).toBe(2);
    expect(await db.articleVersion.count({ where: { articleId: created.article.id } })).toBe(2);
    const indexed = await db.searchDocument.findMany({
      where: { articleId: created.article.id },
      orderBy: { chunkIndex: "asc" },
    });
    expect(indexed.map(({ content }) => content).join(" ")).toContain("revised searchable");
    expect(indexed.map(({ content }) => content).join(" ")).not.toContain("original searchable");

    expect(await listArticles({ db, userId: "another-user", skip: 0, take: 20 }))
      .toEqual([]);
    await expect(getArticleDetail({
      db,
      userId: "another-user",
      articleId: created.article.id,
    })).rejects.toMatchObject({ status: 404, code: "article_not_found" });

    const currentVersion = await db.articleVersion.findUnique({
      where: { id: versioned.versionId },
    });
    await bucket.delete(currentVersion!.contentKey);
    const unavailable = await getArticleReaderData({
      db,
      bucket,
      userId,
      articleId: created.article.id,
    });
    expect(unavailable).toMatchObject({ html: null, contentUnavailable: true });

    const restored = await restoreArticleVersion({
      db,
      database,
      bucket,
      userId,
      articleId: created.article.id,
      versionId: created.versionId,
    });
    const detail = await getArticleDetail({ db, userId, articleId: created.article.id });
    expect(detail.excerpts.map(({ id }) => id)).toEqual([
      "excerpt-after",
      "excerpt-before",
    ]);
    expect(detail.currentVersion.id).toBe(restored.versionId);
    expect(detail.currentVersion.restoredFromVersionId).toBe(created.versionId);
    expect(detail.versionCount).toBe(3);
    expect((await db.searchDocument.findMany({ where: { articleId: created.article.id } }))
      .map(({ content }) => content).join(" ")).toContain("original searchable");

    const storedKeys = (await db.articleVersion.findMany({
      where: { articleId: created.article.id },
      select: { contentKey: true },
    })).map(({ contentKey }) => contentKey);
    await deleteArticle({ db, database, bucket, userId, articleId: created.article.id });
    await deleteArticle({ db, database, bucket, userId, articleId: created.article.id });
    expect(await db.article.findUnique({ where: { id: created.article.id } })).toBeNull();
    expect(await db.articleVersion.count({ where: { articleId: created.article.id } })).toBe(0);
    expect(await db.articleUrlAlias.count({ where: { articleId: created.article.id } })).toBe(0);
    expect(await db.searchDocument.count({ where: { articleId: created.article.id } })).toBe(0);
    expect(await db.excerpt.findMany({ where: { userId }, orderBy: { id: "asc" } }))
      .toEqual([
        expect.objectContaining({ id: "excerpt-after", articleId: null }),
        expect.objectContaining({ id: "excerpt-before", articleId: null }),
      ]);
    for (const key of Array.from(new Set(storedKeys))) {
      expect(await bucket.get(key)).toBeNull();
    }
  });

  test("serializes concurrent saves into one linear history", async () => {
    const userId = "concurrent-user";
    const base = await snapshot("https://concurrent.example/article");
    const initialResults = await Promise.all([
      saveArticleSnapshot({ db, database, bucket, userId, snapshot: base }),
      saveArticleSnapshot({ db, database, bucket, userId, snapshot: base }),
    ]);
    expect(initialResults.map(({ outcome }) => outcome).sort()).toEqual([
      "created",
      "unchanged",
    ]);
    const articleId = initialResults[0].article.id;
    expect(new Set(initialResults.map(({ article }) => article.id))).toEqual(new Set([articleId]));

    const [left, right] = await Promise.all([
      snapshot("https://concurrent.example/article", {
        title: "Left revision",
        html: "<article><h1>Left revision</h1><p>A distinct left-side article revision.</p></article>",
      }),
      snapshot("https://concurrent.example/article", {
        title: "Right revision",
        html: "<article><h1>Right revision</h1><p>A distinct right-side article revision.</p></article>",
      }),
    ]);
    const revisionResults = await Promise.all([
      saveArticleSnapshot({ db, database, bucket, userId, snapshot: left }),
      saveArticleSnapshot({ db, database, bucket, userId, snapshot: right }),
    ]);
    expect(revisionResults.map(({ outcome }) => outcome)).toEqual(["versioned", "versioned"]);

    const versions = await db.articleVersion.findMany({ where: { articleId } });
    expect(versions).toHaveLength(3);
    expect(new Set(versions.map(({ previousVersionId }) => previousVersionId).filter(Boolean)).size)
      .toBe(2);
    expect(await db.site.count({ where: { userId } })).toBe(1);
    expect((await bucket.list({ prefix: `articles/${userId}/${articleId}/` })).objects)
      .toHaveLength(3);
  });

  test("keeps failed storage and retryable deletion boundaries consistent", async () => {
    const userId = "failure-user";
    const articleSnapshot = await snapshot("https://failures.example/article");
    const unavailableBucket = {
      put: async () => { throw new Error("R2 put unavailable"); },
    } as unknown as R2Bucket;
    await expect(saveArticleSnapshot({
      db,
      database,
      bucket: unavailableBucket,
      userId,
      snapshot: articleSnapshot,
    })).rejects.toThrow("R2 put unavailable");
    expect(await db.article.count({ where: { userId } })).toBe(0);
    expect(await db.site.count({ where: { userId } })).toBe(0);

    const created = await saveArticleSnapshot({
      db,
      database,
      bucket,
      userId,
      snapshot: articleSnapshot,
    });
    const key = (await db.articleVersion.findUnique({ where: { id: created.versionId } }))!
      .contentKey;
    const failingDeleteBucket = {
      delete: async () => { throw new Error("R2 delete unavailable"); },
    } as unknown as R2Bucket;
    await expect(deleteArticle({
      db,
      database,
      bucket: failingDeleteBucket,
      userId,
      articleId: created.article.id,
    })).rejects.toThrow("R2 delete unavailable");
    expect(await db.article.findUnique({ where: { id: created.article.id } }))
      .toMatchObject({ status: "DELETING" });
    expect(await listArticles({ db, userId, skip: 0, take: 20 })).toEqual([]);

    await deleteArticle({ db, database, bucket, userId, articleId: created.article.id });
    expect(await db.article.findUnique({ where: { id: created.article.id } })).toBeNull();
    expect(await bucket.get(key)).toBeNull();
  });
});

describe("excerpt listing on D1", () => {
  test("returns regular and searched pages newest first with stable ties", async () => {
    const userId = "excerpt-order-user";
    const siteId = "excerpt-order-site";
    await db.site.create({
      data: {
        id: siteId,
        userId,
        title: "Excerpt ordering",
        icon: "",
        description: "",
        url: "https://ordering.example",
      },
    });

    for (const excerpt of [
      { id: "excerpt-old", createAt: "2026-01-01T00:00:00.000Z" },
      { id: "excerpt-middle", createAt: "2026-01-02T00:00:00.000Z" },
      { id: "excerpt-y", createAt: "2026-01-03T00:00:00.000Z" },
      { id: "excerpt-z", createAt: "2026-01-03T00:00:00.000Z" },
    ]) {
      await db.excerpt.create({
        data: {
          id: excerpt.id,
          createAt: new Date(excerpt.createAt),
          userId,
          siteId,
          url: `https://ordering.example/${excerpt.id}`,
          content: `<p>Shared ordering phrase: ${excerpt.id}</p>`,
        },
      });
    }

    const listIds = async (search: string | undefined, skip: number) => (
      await listExcerptRecords({
        db,
        userId,
        search,
        skip,
        take: 2,
      })
    ).map(({ id }) => id);

    await expect(listIds(undefined, 0)).resolves.toEqual(["excerpt-z", "excerpt-y"]);
    await expect(listIds(undefined, 2)).resolves.toEqual(["excerpt-middle", "excerpt-old"]);
    await expect(listIds("shared ordering", 0)).resolves.toEqual(["excerpt-z", "excerpt-y"]);
    await expect(listIds("shared ordering", 2)).resolves.toEqual([
      "excerpt-middle",
      "excerpt-old",
    ]);
  });
});
