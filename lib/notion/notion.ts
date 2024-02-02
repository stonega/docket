import { Client } from "@notionhq/client";
import { prisma } from "../../lib/prisma";
import { htmlToNotion } from "html-to-notion-blocks";
import { Excerpt, Site } from "@prisma/client";
import { getIconUrl } from "./utils";

export class Notion {
  client?: Client = undefined;
  constructor({ auth }: { auth: string }) {
    this.client = new Client({ auth });
  }
  /**
   * initial sync with notion
   * @param userId
   */
  async initialSync({ userId }: { userId: string }) {
    const rootPage = await this.getRootPage();
    if (!rootPage) {
      throw new Error("Root page not found");
    }
    const database = await this.createDatabase({ pageId: rootPage.id });
    await prisma.notion.create({
      data: {
        userId,
        databaseId: database.id,
        pageId: rootPage.id,
      },
    });
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

  /**
   * add new excerpt to notion
   * @param site
   * @param excerpt
   */
  async addNewExcerpt({ site, excerpt }: { site: Site; excerpt: Excerpt }) {
    const database = await this.getDatabase({ userId: site.userId });
    if (!database) {
      await this.initialSync({ userId: site.userId });
      return;
    }
    const response = await this.client!.databases.query({
      database_id: database.id,
      filter: {
        or: [
          {
            property: "Id",
            rich_text: {
              equals: site.id,
            },
          },
        ],
      },
    });

    if (response) {
      const pageId = response.results[0].id;
      const children = htmlToNotion(excerpt.content);
      const page = await this.retrievePage(pageId);
      const res = await this.client!.blocks.children.append({
        block_id: page.id,
        children,
      });
    }
  }

  /**
   * get notion database
   * @param userId
   */
  async getDatabase({ userId }: { userId: string }) {
    const notionConfig = await prisma.notion.findFirst({
      where: {
        userId,
      },
    });
    if (notionConfig) {
      const databaseId = notionConfig.databaseId;
      const response = this.retrieveDatabase(databaseId);
      return response;
    } else {
      return undefined;
    }
  }

  /**
   * get root page to create database
   */
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
  /**
   * add page to database
   * @param site
   * @param databaseId
   */
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
    const page = await this.client!.pages.create({
      icon: {
        type: "external",
        external: {
          url: getIconUrl(site.icon),
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
    });
    for (const excerpt of excerpts) {
      const blocks = htmlToNotion(excerpt.content);
      if (blocks.length > 1) {
        console.log("block id", page.id);
        const block = await this.client!.blocks.children.append({
          block_id: page.id,
          children: [blocks[0]],
        });
        console.log("block id", { block });
        await this.client!.blocks.children.append({
          block_id: block.results[0].id,
          children: blocks,
        });
      } else {
        await this.client!.blocks.children.append({
          block_id: page.id,
          children: blocks,
        });
      }
    }
  }

  async retrievePage(pageId: string) {
    const response = await this.client!.pages.retrieve({
      page_id: pageId,
    });
    return response;
  }

  async retrieveDatabase(databaseId: string) {
    const response = await this.client!.databases.retrieve({
      database_id: databaseId,
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
        Id: {
          rich_text: {},
        },
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
