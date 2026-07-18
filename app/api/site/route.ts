import { getD1Database, getDb } from "@/lib/prisma";
import { getDocUrl, getSubPaths } from "@/lib/utils";
import urlMetadata from "url-metadata";
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
import { getArticleBucket } from "@/lib/article-storage";
import { deleteArticle } from "@/lib/article-service";
import type { NextRequest } from "next/server";
import { prepareD1, runD1Batch } from "@/lib/d1";

export function OPTIONS() {
  return optionsResponse();
}

function validateSiteUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.length > 4_096) {
    throw new ApiError(400, "invalid_url", "A valid URL is required");
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ApiError(400, "invalid_url", "A valid URL is required");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiError(400, "invalid_url", "The URL must use HTTP or HTTPS");
  }
  return value;
}

async function getSiteCounts(db: ReturnType<typeof getDb>, siteId: string, userId: string) {
  const [excerptCount, articleCount] = await Promise.all([
    db.excerpt.count({ where: { siteId, userId } }),
    db.article.count({ where: { siteId, userId, status: "ACTIVE" } }),
  ]);
  return { excerptCount, articleCount };
}

async function fetchSiteMetadata(docUrl: string) {
  try {
    const metadata = await urlMetadata(docUrl) as Record<string, unknown>;
    return {
      title: typeof metadata.title === "string" ? metadata.title : "",
      description: typeof metadata.description === "string" ? metadata.description : "",
    };
  } catch (error) {
    console.error({
      event: "site_metadata_lookup_failed",
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return { title: "", description: "" };
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { skip, pageSize } = parsePagination(request.nextUrl.searchParams);
    const data = await getDb().site.findMany({
      skip,
      take: pageSize,
      where: { userId },
      orderBy: [{ updateAt: "desc" }, { id: "desc" }],
      include: {
        _count: {
          select: {
            Excerpt: true,
            Article: { where: { status: "ACTIVE" } },
          },
        },
      },
    });
    return jsonResponse(data.map(({ _count, ...site }) => ({
      ...site,
      excerptCount: _count.Excerpt,
      articleCount: _count.Article,
    })));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await readJsonBody(request, 512 * 1024);
    if (!isRecord(body)) {
      throw new ApiError(400, "invalid_request", "Request body must be an object");
    }
    const url = validateSiteUrl(body.url);
    const icon = typeof body.icon === "string" ? body.icon.slice(0, 4_096) : "";
    const suppliedTitle = typeof body.title === "string" ? body.title.slice(0, 500) : "";
    const create = body.create === true;
    const db = getDb();
    const urls = getSubPaths(url) ?? [];
    const record = await db.site.findFirst({
      where: { userId, OR: urls.map((candidate) => ({ url: candidate })) },
    });

    if (record) {
      const site = create
        ? await db.site.update({
            where: { id: record.id },
            data: { updateAt: new Date() },
          })
        : record;
      return jsonResponse({
        ...site,
        ...await getSiteCounts(db, site.id, userId),
      });
    }

    const docUrl = getDocUrl(url);
    if (!docUrl) throw new ApiError(422, "unsupported_url", "This page URL is not supported");
    const metadata = await fetchSiteMetadata(docUrl);
    const siteData = {
      userId,
      description: metadata.description,
      title: metadata.title || suppliedTitle,
      icon,
      url: docUrl,
    };
    if (!create) return jsonResponse(siteData);

    const site = await db.site.create({ data: siteData });
    return jsonResponse({ ...site, excerptCount: 0, articleCount: 0 }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await readJsonBody(request, 512 * 1024);
    if (!isRecord(body) || typeof body.id !== "string") {
      throw new ApiError(400, "invalid_request", "id is required");
    }
    const db = getDb();
    const site = await db.site.findFirst({ where: { id: body.id, userId } });
    if (!site) throw new ApiError(404, "site_not_found", "Site not found");

    const title = typeof body.title === "string" ? body.title.slice(0, 500) : undefined;
    const description = typeof body.description === "string"
      ? body.description.slice(0, 2_000)
      : undefined;
    const icon = typeof body.icon === "string" ? body.icon.slice(0, 4_096) : undefined;
    const now = new Date().toISOString();
    const assignments = ["\"update_at\" = ?"];
    const values: Array<string | number | null> = [now];
    if (title !== undefined) {
      assignments.push("\"title\" = ?");
      values.push(title);
    }
    if (description !== undefined) {
      assignments.push("\"description\" = ?");
      values.push(description);
    }
    if (icon !== undefined) {
      assignments.push("\"icon\" = ?");
      values.push(icon);
    }

    const database = getD1Database();
    const statements = [prepareD1(
      database,
      `UPDATE "Site" SET ${assignments.join(", ")}
       WHERE "id" = ? AND "user_id" = ?`,
      [...values, site.id, userId],
    )];
    if (title !== undefined) {
      statements.push(prepareD1(
        database,
        `UPDATE "SearchDocument"
         SET "title" = ?, "update_at" = ?
         WHERE "kind" = 'excerpt'
           AND "excerpt_id" IN (
             SELECT "id" FROM "Excerpt" WHERE "site_id" = ? AND "user_id" = ?
           )`,
        [title, now, site.id, userId],
      ));
    }
    await runD1Batch(database, statements);
    return jsonResponse(await db.site.findUnique({ where: { id: site.id } }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await readJsonBody(request, 64 * 1024);
    if (!isRecord(body) || typeof body.id !== "string") {
      throw new ApiError(400, "invalid_request", "id is required");
    }
    const db = getDb();
    const site = await db.site.findFirst({ where: { id: body.id, userId } });
    if (!site) throw new ApiError(404, "site_not_found", "Site not found");

    const articles = await db.article.findMany({
      where: { siteId: site.id, userId },
      select: { id: true },
    });
    const bucket = articles.length > 0 ? getArticleBucket() : null;
    for (const article of articles) {
      await deleteArticle({
        db,
        database: getD1Database(),
        bucket: bucket!,
        userId,
        articleId: article.id,
      });
    }
    return jsonResponse(await db.site.delete({ where: { id: site.id } }));
  } catch (error) {
    return errorResponse(error);
  }
}
