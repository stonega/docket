import { Prisma } from "@prisma/client";
import type { DbClient } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import type { LibrarySearchResult } from "@/types/library";

interface SearchMatch {
  kind: "article" | "excerpt";
  entityId: string;
  rank: number;
  titleSnippet: string;
  snippet: string;
}

export function toFtsQuery(search: string) {
  const normalized = search.trim();
  if (normalized.length > 200) {
    throw new ApiError(400, "search_too_long", "Search queries may be at most 200 characters");
  }
  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 10)
    .map((term) => `"${term.slice(0, 64).replace(/"/g, '""')}"*`)
    .join(" AND ");
}

export async function searchLibrary({
  db,
  userId,
  query,
  skip,
  take,
}: {
  db: DbClient;
  userId: string;
  query: string;
  skip: number;
  take: number;
}): Promise<LibrarySearchResult[]> {
  const ftsQuery = toFtsQuery(query);
  if (!ftsQuery) return [];

  const matches = await db.$queryRaw<SearchMatch[]>(Prisma.sql`
    WITH matches AS MATERIALIZED (
      SELECT
        search_document."kind" AS "kind",
        search_document."entity_id" AS "entityId",
        bm25("SearchDocument_fts", 0.0, 0.0, 0.0, 0.0, 8.0, 1.0) AS "rank",
        snippet("SearchDocument_fts", 4, '<mark>', '</mark>', ' … ', 16) AS "titleSnippet",
        snippet("SearchDocument_fts", 5, '<mark>', '</mark>', ' … ', 32) AS "snippet"
      FROM "SearchDocument_fts"
      INNER JOIN "SearchDocument" AS search_document
        ON search_document.rowid = "SearchDocument_fts".rowid
      LEFT JOIN "Article" AS article
        ON article."id" = search_document."article_id"
      WHERE "SearchDocument_fts" MATCH ${ftsQuery}
        AND search_document."user_id" = ${userId}
        AND (search_document."kind" <> 'article' OR article."status" = 'ACTIVE')
    ), collapsed AS (
      SELECT
        "kind",
        "entityId",
        MIN("rank") AS "rank",
        "titleSnippet",
        "snippet"
      FROM matches
      GROUP BY "kind", "entityId"
    )
    SELECT "kind", "entityId", "rank", "titleSnippet", "snippet"
    FROM collapsed
    ORDER BY "rank" ASC, "entityId" ASC
    LIMIT ${take} OFFSET ${skip}
  `);

  const articleIds = matches
    .filter((match) => match.kind === "article")
    .map((match) => match.entityId);
  const excerptIds = matches
    .filter((match) => match.kind === "excerpt")
    .map((match) => match.entityId);
  const [articles, excerpts] = await Promise.all([
    articleIds.length
      ? db.article.findMany({
          where: { id: { in: articleIds }, userId, status: "ACTIVE" },
          include: { site: { select: { title: true } } },
        })
      : [],
    excerptIds.length
      ? db.excerpt.findMany({
          where: { id: { in: excerptIds }, userId },
          include: {
            site: { select: { title: true } },
            article: { select: { id: true, title: true, status: true } },
          },
        })
      : [],
  ]);
  const articleMap = new Map(articles.map((article) => [article.id, article]));
  const excerptMap = new Map(excerpts.map((excerpt) => [excerpt.id, excerpt]));

  return matches.flatMap((match): LibrarySearchResult[] => {
    if (match.kind === "article") {
      const article = articleMap.get(match.entityId);
      if (!article) return [];
      return [{
        kind: "article",
        id: article.id,
        title: article.title,
        titleSnippet: match.titleSnippet,
        snippet: match.snippet,
        sourceUrl: article.sourceUrl,
        imageUrl: article.imageUrl,
        siteTitle: article.site.title,
        wordCount: article.wordCount,
        updatedAt: article.updateAt.toISOString(),
      }];
    }

    const excerpt = excerptMap.get(match.entityId);
    if (!excerpt) return [];
    return [{
      kind: "excerpt",
      id: excerpt.id,
      title: excerpt.site.title,
      titleSnippet: match.titleSnippet,
      snippet: match.snippet,
      sourceUrl: excerpt.url,
      createdAt: excerpt.createAt.toISOString(),
      article: excerpt.article?.status === "ACTIVE"
        ? { id: excerpt.article.id, title: excerpt.article.title }
        : null,
    }];
  });
}
