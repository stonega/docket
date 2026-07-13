import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

const { Client } = pg;
const outputPath = resolve(process.argv[2] ?? ".migration/railway-data.sql");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must point to the Railway PostgreSQL database");
}

const tables = [
  {
    name: "BasicSite",
    columns: ["id", "create_at", "title", "icon", "url", "description"],
  },
  {
    name: "Site",
    columns: [
      "id",
      "create_at",
      "update_at",
      "title",
      "icon",
      "url",
      "description",
      "user_id",
    ],
  },
  {
    name: "Excerpt",
    columns: [
      "id",
      "create_at",
      "url",
      "site_id",
      "content",
      "source",
      "source_id",
      "user_id",
    ],
  },
  {
    name: "Notion",
    columns: ["id", "create_at", "user_id", "page_id", "database_id"],
  },
];

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  const serialized = value instanceof Date ? value.toISOString() : String(value);
  return `'${serialized.replaceAll("'", "''")}'`;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15_000,
  statement_timeout: 60_000,
  ...(process.env.DATABASE_SSL === "true"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});
await client.connect();

try {
  const statements = ["-- Generated from Railway PostgreSQL for Cloudflare D1."];

  for (const table of tables) {
    const columnList = table.columns.map(quoteIdentifier).join(", ");
    const result = await client.query(
      `SELECT ${columnList} FROM ${quoteIdentifier(table.name)} ORDER BY ${quoteIdentifier("id")}`,
    );

    statements.push(`-- ${table.name}: ${result.rowCount ?? result.rows.length} rows`);
    for (const row of result.rows) {
      const values = table.columns.map((column) => sqlLiteral(row[column])).join(", ");
      statements.push(
        `INSERT INTO ${quoteIdentifier(table.name)} (${columnList}) VALUES (${values});`,
      );
    }
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${statements.join("\n")}\n`, "utf8");
  console.log(`Wrote D1 import data to ${outputPath}`);
} finally {
  await client.end();
}
