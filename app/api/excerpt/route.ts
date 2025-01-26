import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import DOMPurify from "isomorphic-dompurify";

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("page_size") ?? 20);
  const siteId = searchParams.get("site_id");
  const url = searchParams.get("url");
  const search = searchParams.get("search");
  const skip = (page - 1) * pageSize;
  const where: any = {
    userId: { equals: userId },
  };
  if (url) {
    where.url = { equals: url };
  }
  if (siteId) {
    where.siteId = { equals: siteId };
  }
  if (search) {
    where.content = { search };
  }
  const data = await prisma.excerpt.findMany({
    skip,
    take: pageSize,
    where,
    orderBy: {
      createAt: "asc",
    },
  });
  return Response.json(data, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { siteId, content, url, source, sourceId } = await request.json();
  if (!siteId || !content || !url)
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  const htmlString = DOMPurify.sanitize(content);
  const data: any = {
    userId,
    siteId,
    content: htmlString,
    url,
    source,
    sourceId,
  };
  const result = await prisma.excerpt.create({
    data,
  });
  return Response.json(result, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function DELETE(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, sourceId } = await request.json();
  if (!id && !sourceId)
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  let data;
  if (id)
    data = await prisma.excerpt.delete({
      where: {
        id,
        userId,
      },
    });
  if (sourceId) {
    data = await prisma.excerpt.deleteMany({
      where: {
        sourceId,
        userId,
      },
    });
  }
  return Response.json(data, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
