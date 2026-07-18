export type D1BindValue = string | number | null;

export function prepareD1(
  database: D1Database,
  sql: string,
  values: D1BindValue[] = [],
) {
  return database.prepare(sql).bind(...values);
}

export async function runD1Batch(
  database: D1Database,
  statements: D1PreparedStatement[],
) {
  if (statements.length === 0) return [];
  return database.batch(statements);
}
