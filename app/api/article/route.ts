import { getD1Database, getDb } from "@/lib/prisma";
import {
  errorResponse,
  jsonResponse,
  optionsResponse,
  parsePagination,
  readJsonBody,
  requireUserId,
} from "@/lib/api";
import { getArticleBucket } from "@/lib/article-storage";
import { listArticles, saveArticleSnapshot } from "@/lib/article-service";
import { validateArticleSaveRequest } from "@/lib/articles";
import type { NextRequest } from "next/server";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { skip, pageSize } = parsePagination(request.nextUrl.searchParams);
    const siteId = request.nextUrl.searchParams.get("site_id")?.trim() || undefined;
    const articles = await listArticles({
      db: getDb(),
      userId,
      siteId,
      skip,
      take: pageSize,
    });
    return jsonResponse(articles);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    // JSON escaping and metadata add overhead beyond the 5 MiB sanitized HTML
    // limit. Keep the transport bounded without rejecting a valid snapshot.
    const body = await readJsonBody(request, 16 * 1024 * 1024);
    const snapshot = await validateArticleSaveRequest(body);
    const response = await saveArticleSnapshot({
      db: getDb(),
      database: getD1Database(),
      bucket: getArticleBucket(),
      userId,
      snapshot,
    });
    return jsonResponse(response, { status: response.outcome === "created" ? 201 : 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
