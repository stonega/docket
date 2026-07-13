import { getDb } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import DOMPurify from "isomorphic-dompurify";
import { type NextRequest } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function positiveInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function toFtsQuery(search: string) {
  return search
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `"${term.replaceAll('"', '""')}"*`)
    .join(" AND ");
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const searchParams = request.nextUrl.searchParams;
  const page = positiveInteger(searchParams.get("page"), 1, 100_000);
  const pageSize = positiveInteger(searchParams.get("page_size"), 20, 100);
  const siteId = searchParams.get("site_id");
  const url = searchParams.get("url");
  const search = searchParams.get("search")?.trim();
  const skip = (page - 1) * pageSize;
  const where: Prisma.ExcerptWhereInput = { userId };

  if (url) where.url = url;
  if (siteId) where.siteId = siteId;

  if (search) {
    const ftsQuery = toFtsQuery(search);
    const matches = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT excerpt.id AS id
      FROM "Excerpt" AS excerpt
      INNER JOIN "Excerpt_fts"
        ON "Excerpt_fts".rowid = excerpt.rowid
      WHERE "Excerpt_fts" MATCH ${ftsQuery}
        AND excerpt."user_id" = ${userId}
        ${url ? Prisma.sql`AND excerpt.url = ${url}` : Prisma.empty}
        ${siteId ? Prisma.sql`AND excerpt."site_id" = ${siteId}` : Prisma.empty}
      ORDER BY excerpt."create_at" ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `);

    if (matches.length === 0) {
      return Response.json([], { status: 200, headers: corsHeaders });
    }
    where.id = { in: matches.map(({ id }) => id) };
  }

  const data = await db.excerpt.findMany({
    skip: search ? undefined : skip,
    take: search ? undefined : pageSize,
    where,
    orderBy: { createAt: "asc" },
  });

  return Response.json(data, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!isRecord(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const siteId = typeof body.siteId === "string" ? body.siteId : undefined;
  const content = typeof body.content === "string" ? body.content : undefined;
  const url = typeof body.url === "string" ? body.url : undefined;
  const source = typeof body.source === "string" ? body.source : undefined;
  const sourceId = typeof body.sourceId === "string" ? body.sourceId : undefined;
  if (!siteId || !content || !url) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const site = await db.site.findFirst({ where: { id: siteId, userId } });
  if (!site) {
    return Response.json({ error: "Site not found" }, { status: 404 });
  }

  const result = await db.excerpt.create({
    data: {
      userId,
      siteId,
      content: DOMPurify.sanitize(content),
      url,
      source,
      sourceId,
    },
  });

  return Response.json(result, { status: 200, headers: corsHeaders });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!isRecord(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : undefined;
  const sourceId = typeof body.sourceId === "string" ? body.sourceId : undefined;
  if (!id && !sourceId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  if (id) {
    const excerpt = await db.excerpt.findFirst({ where: { id, userId } });
    if (!excerpt) {
      return Response.json({ error: "Excerpt not found" }, { status: 404 });
    }
    const data = await db.excerpt.delete({ where: { id } });
    return Response.json(data, { status: 200, headers: corsHeaders });
  }

  const data = await db.excerpt.deleteMany({ where: { sourceId, userId } });
  return Response.json(data, { status: 200, headers: corsHeaders });
}
