import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/prisma";
import { getDocUrl, getSubPaths } from "@/lib/utils";
import urlMetadata from "url-metadata";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
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
  const db = getDb();
  const data = await db.site.findMany({
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
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body: unknown = await request.json();
  if (!isRecord(body) || typeof body.url !== "string") {
    return new NextResponse("Invalid request body", { status: 400 });
  }
  const url = body.url;
  const icon = typeof body.icon === "string" ? body.icon : "";
  const title = typeof body.title === "string" ? body.title : "";
  const create = body.create === true;
  const db = getDb();
  const urls = getSubPaths(encodeURI(url));
  // Check if url already existed
  const record = await db.site.findFirst({
    where: {
      userId,
      OR: urls?.map((u) => ({ url: u })),
    },
  });
  if (!create) {
    if (record) {
      const excerptCount = await db.excerpt.count({
        where: {
          siteId: record.id,
        },
      });
      return Response.json(
        {
          ...record,
          excerptCount,
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
    const updated = await db.site.update({
      where: {
        id: record.id,
      },
      data: {
        updateAt: new Date(),
      },
    });
    return Response.json(updated, {
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
  const data = await db.site.create({
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
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body: unknown = await request.json();
  if (!isRecord(body) || typeof body.id !== "string") {
    return new NextResponse("Invalid request body", { status: 400 });
  }
  const id = body.id;
  const description = typeof body.description === "string" ? body.description : undefined;
  const title = typeof body.title === "string" ? body.title : undefined;
  const icon = typeof body.icon === "string" ? body.icon : undefined;
  const db = getDb();
  const site = await db.site.findFirst({ where: { id, userId } });
  if (!site) {
    return new NextResponse("Not found", { status: 404 });
  }
  const where = {
    id,
  };
  const edit: any = {};
  if (title) edit.title = title;
  if (description) edit.description = description;
  if (icon) edit.icon = icon;

  const data = await db.site.update({
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
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body: unknown = await request.json();
  if (!isRecord(body) || typeof body.id !== "string") {
    return new NextResponse("Invalid request body", { status: 400 });
  }
  const id = body.id;
  const db = getDb();
  const site = await db.site.findFirst({ where: { id, userId } });
  if (!site) {
    return new NextResponse("Not found", { status: 404 });
  }
  const data = await db.site.delete({ where: { id } });

  return Response.json(data, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
