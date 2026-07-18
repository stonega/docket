import { getD1Database, getDb } from "@/lib/prisma";
import {
  emptyResponse,
  errorResponse,
  jsonResponse,
  optionsResponse,
  requireUserId,
} from "@/lib/api";
import { getArticleBucket } from "@/lib/article-storage";
import { deleteArticle, getArticleDetail } from "@/lib/article-service";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return jsonResponse(await getArticleDetail({ db: getDb(), userId, articleId: id }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteArticle({
      db: getDb(),
      database: getD1Database(),
      bucket: getArticleBucket(),
      userId,
      articleId: id,
    });
    return emptyResponse();
  } catch (error) {
    return errorResponse(error);
  }
}
