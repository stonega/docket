import { Prisma } from "@prisma/client";
import type { DbClient } from "@/lib/prisma";
import { toFtsQuery } from "@/lib/library-search";

export const excerptWithArticleInclude = {
  article: { select: { id: true, title: true } },
} satisfies Prisma.ExcerptInclude;

export const newestExcerptFirstOrder = [
  { createAt: "desc" },
  { id: "desc" },
] satisfies Prisma.ExcerptOrderByWithRelationInput[];

export async function listExcerptRecords({
  db,
  userId,
  url,
  siteId,
  search,
  skip,
  take,
}: {
  db: DbClient;
  userId: string;
  url?: string;
  siteId?: string;
  search?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.ExcerptWhereInput = { userId };
  if (url) where.url = url;
  if (siteId) where.siteId = siteId;

  let orderedIds: string[] | null = null;
  if (search) {
    const ftsQuery = toFtsQuery(search);
    const matches = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT excerpt."id" AS "id"
      FROM "Excerpt" AS excerpt
      INNER JOIN "Excerpt_fts"
        ON "Excerpt_fts".rowid = excerpt.rowid
      WHERE "Excerpt_fts" MATCH ${ftsQuery}
        AND excerpt."user_id" = ${userId}
        ${url ? Prisma.sql`AND excerpt."url" = ${url}` : Prisma.empty}
        ${siteId ? Prisma.sql`AND excerpt."site_id" = ${siteId}` : Prisma.empty}
      ORDER BY excerpt."create_at" DESC, excerpt."id" DESC
      LIMIT ${take} OFFSET ${skip}
    `);
    orderedIds = matches.map(({ id }) => id);
    if (orderedIds.length === 0) return [];
    where.id = { in: orderedIds };
  }

  const excerpts = await db.excerpt.findMany({
    skip: orderedIds ? undefined : skip,
    take: orderedIds ? undefined : take,
    where,
    include: excerptWithArticleInclude,
    orderBy: newestExcerptFirstOrder,
  });
  if (!orderedIds) return excerpts;

  const byId = new Map(excerpts.map((excerpt) => [excerpt.id, excerpt]));
  return orderedIds.flatMap((id) => {
    const excerpt = byId.get(id);
    return excerpt ? [excerpt] : [];
  });
}
