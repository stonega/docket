import { getDb } from "@/lib/prisma";
import {
  errorResponse,
  jsonResponse,
  optionsResponse,
  parsePagination,
  requireUserId,
} from "@/lib/api";
import { listArticleVersions } from "@/lib/article-service";
import type { NextRequest } from "next/server";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const { skip, pageSize } = parsePagination(request.nextUrl.searchParams);
    return jsonResponse(await listArticleVersions({
      db: getDb(),
      userId,
      articleId: id,
      skip,
      take: pageSize,
    }));
  } catch (error) {
    return errorResponse(error);
  }
}
