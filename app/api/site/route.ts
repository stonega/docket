import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDocUrl, getSubPaths } from "@/lib/utils";
import urlMetadata from "url-metadata";

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
      updateAt: "desc",
    },
  });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { url, icon, title, create } = await request.json();
  const urls = getSubPaths(encodeURI(url));
  // Check if url already existed
  const record = await prisma.site.findFirst({
    where: {
      userId,
      OR: urls?.map((u) => ({ url: u })),
    },
  });
  if (!create) {
    if (record) {
      const items = await prisma.excerpt.findMany({
        where: {
          siteId: record.id,
        },
      });
      return Response.json(
        {
          ...record,
          excerptCount: items.length,
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }
    // Insert new site
    const docUrl = getDocUrl(url);
    if (!docUrl)
      return new NextResponse("Internal error", {
        status: 500,
      });
    let metadata: any = {};
    try {
      metadata = await urlMetadata(docUrl);
    } catch (error) {
      console.error(error);
    }

    const siteData = {
      userId: userId!,
      description: (metadata.description ?? "") as string,
      title: (metadata.title ?? title ?? "") as string,
      icon,
      url: docUrl!,
    };
    return Response.json(siteData, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  if (record) {
    await prisma.site.update({
      where: {
        id: record.id,
      },
      data: {
        updateAt: new Date(),
      },
    });
    return Response.json(record, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  // Insert new site
  const docUrl = getDocUrl(url);
  if (!docUrl)
    return new NextResponse("Internal error", {
      status: 500,
    });
  let metadata: any = {};
  try {
    metadata = await urlMetadata(docUrl);
  } catch (error) {
    console.error(error);
  }
  const siteData = {
    userId: userId!,
    description: (metadata.description ?? "") as string,
    title: (metadata.title ?? title ?? "") as string,
    icon,
    url: docUrl!,
  };
  const data = await prisma.site.create({
    data: siteData,
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
  const { description, title, icon, id } = await request.json();
  const where = {
    id,
  };
  const edit: any = {};
  if (title) edit.title = title;
  if (description) edit.description = description;
  if (icon) edit.icon = icon;

  const data = await prisma.site.update({
    where,
    data: edit,
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

export async function DELETE(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await request.json();
  const where = {
    id,
    userId,
  };
  const data = await prisma.site.delete({
    where,
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
