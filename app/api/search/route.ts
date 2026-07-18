import { getDb } from "@/lib/prisma";
import {
  errorResponse,
  jsonResponse,
  optionsResponse,
  parsePagination,
  requireUserId,
} from "@/lib/api";
import { searchLibrary } from "@/lib/library-search";
import type { NextRequest } from "next/server";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { skip, pageSize } = parsePagination(request.nextUrl.searchParams);
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    return jsonResponse(await searchLibrary({
      db: getDb(),
      userId,
      query,
      skip,
      take: pageSize,
    }));
  } catch (error) {
    return errorResponse(error);
  }
}
