import { execFile } from "node:child_process";
import process from "node:process";
import { promisify } from "node:util";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must point to the Railway PostgreSQL database");
}

const { Client } = pg;
const execFileAsync = promisify(execFile);
const tableNames = ["BasicSite", "Site", "Excerpt", "Notion"];
const countSql = tableNames
  .map(
    (tableName) =>
      `SELECT '${tableName}' AS table_name, COUNT(*) AS row_count FROM "${tableName}"`,
  )
  .join(" UNION ALL ");

const railway = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15_000,
  statement_timeout: 60_000,
  ...(process.env.DATABASE_SSL === "true"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});
await railway.connect();

let railwayCounts;
try {
  const result = await railway.query(countSql);
  railwayCounts = new Map(
    result.rows.map(({ table_name, row_count }) => [table_name, Number(row_count)]),
  );
} finally {
  await railway.end();
}

const { stdout } = await execFileAsync(
  "pnpm",
  [
    "exec",
    "wrangler",
    "d1",
    "execute",
    "docket",
    "--remote",
    "--json",
    "--command",
    countSql,
  ],
  { maxBuffer: 10 * 1024 * 1024 },
);

const response = JSON.parse(stdout);
const resultSets = Array.isArray(response) ? response : [response];
const d1Rows = resultSets.flatMap((entry) => entry.results ?? entry.result?.results ?? []);
const d1Counts = new Map(
  d1Rows.map(({ table_name, row_count }) => [table_name, Number(row_count)]),
);

let valid = true;
for (const tableName of tableNames) {
  const source = railwayCounts.get(tableName);
  const destination = d1Counts.get(tableName);
  const matches = source === destination;
  valid &&= matches;
  console.log(`${tableName}: Railway=${source} D1=${destination} ${matches ? "OK" : "MISMATCH"}`);
}

if (!valid) process.exitCode = 1;
