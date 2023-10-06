import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("page_size") ?? 20);
  const siteId = searchParams.get("site_id");
  const url = searchParams.get("url");
  const skip = (page - 1) * pageSize;
  const where: any = {
    userId: { equals: userId },
  };
  if (url) {
    where.url = { equals: url };
  }
  if (siteId) {
    where.site_id = { equals: siteId };
  }
  const data = await prisma.excerpt.findMany({
    skip,
    take: pageSize,
    where,
    orderBy: {
      createAt: "desc",
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
  const { userId } = auth();
  console.log(userId);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { siteId, content, url } = await request.json();
  const data = await prisma.excerpt.create({
    data: {
      userId,
      siteId,
      content,
      url,
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
