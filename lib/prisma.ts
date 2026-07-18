import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";

function createClient(database: D1Database) {
  return new PrismaClient({ adapter: new PrismaD1(database) });
}

export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  return createClient(env.DB);
});

export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return createClient(env.DB);
});

export function getD1Database() {
  return getCloudflareContext().env.DB;
}

export async function getD1DatabaseAsync() {
  return (await getCloudflareContext({ async: true })).env.DB;
}

export type DbClient = ReturnType<typeof createClient>;
