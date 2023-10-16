import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDocUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("page_size") ?? 20);
  const skip = (page - 1) * pageSize;
  const where: any = {
    userId: { equals: userId },
  };
  const data = await prisma.site.findMany({
    skip,
    take: pageSize,
    where,
    orderBy: {
      createAt: "desc",
    },
  });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { description, title, icon, url } = await request.json();
  const docUrl = getDocUrl(url);
  console.log(url, docUrl);
  const where = {
    url: docUrl,
  };
  const data = await prisma.site.upsert({
    where,
    update: {
      description,
      title,
      icon,
    },
    create: {
      userId,
      description,
      title,
      icon,
      url: docUrl!,
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

export async function PUT(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { description, title, icon, url, id } = await request.json();
  const where = {
    id,
  };
  const data = await prisma.site.update({
    where,
    data: {
      description,
      title,
      icon,
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
