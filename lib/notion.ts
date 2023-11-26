import { Client } from "@notionhq/client";
import { prisma } from "../lib/prisma";
import { htmlToNotion } from "html-to-notion-blocks";

export class Notion {
  client?: Client = undefined;
  constructor({ auth }: { auth: string }) {
    this.client = new Client({ auth });
  }
  // Full sync
  async initSync({ userId }: { userId: string }) {
    const rootPage = await this.getRootPage();
    if (!rootPage) {
      throw new Error("Root page not found");
    }
    const database = await this.createDatabase({ pageId: rootPage.id });
    const sites = await prisma.site.findMany({
      where: {
        userId: { equals: userId },
      },
    });
    for (const site of sites) {
      console.log("syncing", site.title, site.id);
      await this.createPage({
        site,
        databaseId: database.id,
      });
    }
    return true;
  }

  async getRootPage() {
    const response = await this.client!.search({
      filter: {
        property: "object",
        value: "page",
      },
    });
    const rootPage = response.results[response.results.length - 1];
    if (rootPage) {
      await this.client!.pages.update({
        page_id: rootPage.id,
        icon: {
          type: "external",
          external: {
            url: "https://docket.stonegate.me/docket.png",
          },
        },
      });
    }
    return rootPage;
  }
  async createPage({
    site,
    databaseId,
  }: {
    site: {
      icon: string;
      title: string;
      description: string;
      id: string;
      url: string;
    };
    databaseId: string;
  }) {
    const excerpts = await prisma.excerpt.findMany({
      where: { siteId: site.id },
      orderBy: {
        createAt: "asc",
      },
    });
    const children = excerpts.map((e) => htmlToNotion(e.content)).flat();
    await this.client!.pages.create({
      icon: {
        type: "external",
        external: {
          url: `https://avatar.tobi.sh/${site.id}.png`,
        },
      },
      parent: {
        type: "database_id",
        database_id: databaseId,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: site.title ?? "Empty",
              },
            },
          ],
        },
        Description: {
          rich_text: [
            {
              text: {
                content: site.description ?? "",
              },
            },
          ],
        },
      },
      children,
    });
  }

  async retrievePage(pageId: string) {
    const response = await this.client!.pages.retrieve({
      page_id: pageId,
    });
    return response;
  }

  async createDatabase({ pageId }: { pageId: string }) {
    const response = await this.client!.databases.create({
      parent: {
        type: "page_id",
        page_id: pageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: "Library",
          },
        },
      ],
      properties: {
        Name: {
          title: {},
        },
        Description: {
          rich_text: {},
        },
        "Created time": {
          type: "created_time",
          created_time: {},
        },
      },
      is_inline: true,
    });
    return response;
  }
}
