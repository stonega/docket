import { getD1Database, getDb } from "@/lib/prisma";
import {
  ApiError,
  errorResponse,
  isRecord,
  jsonResponse,
  optionsResponse,
  readJsonBody,
  requireUserId,
} from "@/lib/api";
import { getArticleBucket } from "@/lib/article-storage";
import { restoreArticleVersion } from "@/lib/article-service";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const body = await readJsonBody(request, 64 * 1024);
    if (!isRecord(body) || typeof body.versionId !== "string" || !body.versionId.trim()) {
      throw new ApiError(400, "invalid_request", "versionId is required");
    }
    const { id } = await params;
    return jsonResponse(await restoreArticleVersion({
      db: getDb(),
      database: getD1Database(),
      bucket: getArticleBucket(),
      userId,
      articleId: id,
      versionId: body.versionId,
    }));
  } catch (error) {
    return errorResponse(error);
  }
}
