import { auth } from "@clerk/nextjs/server";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new ApiError(401, "unauthorized", "Authentication required");
  return userId;
}

export function parsePagination(
  searchParams: URLSearchParams,
  options: { defaultPageSize?: number; maxPageSize?: number } = {},
) {
  const defaultPageSize = options.defaultPageSize ?? 20;
  const maxPageSize = options.maxPageSize ?? 100;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("page_size") ?? defaultPageSize);

  if (!Number.isInteger(page) || page < 1 || page > 100_000) {
    throw new ApiError(400, "invalid_pagination", "page must be a positive integer");
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > maxPageSize) {
    throw new ApiError(
      400,
      "invalid_pagination",
      `page_size must be between 1 and ${maxPageSize}`,
    );
  }

  return { page, pageSize, skip: (page - 1) * pageSize };
}

export async function readJsonBody(
  request: Request,
  maxBytes = 6 * 1024 * 1024,
): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ApiError(413, "request_too_large", "Request body is too large");
  }

  if (!request.body) {
    throw new ApiError(400, "invalid_json", "A JSON request body is required");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new ApiError(413, "request_too_large", "Request body is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be valid UTF-8 JSON");
  }
}

export function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    ...init,
    headers: { ...corsHeaders, ...init.headers },
  });
}

export function emptyResponse(status = 204) {
  return new Response(null, { status, headers: corsHeaders });
}

export function optionsResponse() {
  return emptyResponse(204);
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return jsonResponse(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  console.error({ event: "api_error", errorType: error instanceof Error ? error.name : "unknown" });
  return jsonResponse(
    { error: { code: "internal_error", message: "The request could not be completed" } },
    { status: 500 },
  );
}
