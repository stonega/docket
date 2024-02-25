import { Notion } from "../lib/notion/notion";
import { expect, test } from "vitest";
import "dotenv/config";

test(
  "Notion test",
  async () => {
    const accessKey = process.env.NOTION_TEST_TOKEN;
    const client = new Notion({ auth: accessKey! });
    const complete = await client.initialSync({
      userId: "user_2VD2zdHmaIDyAoIKs9bwzpk4F2s",
    });
    expect(complete).toBe(true);
  },
  {
    timeout: 600000,
  }
);
