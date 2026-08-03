import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is required (Postgres). SQLite is not supported.");
    }
    if (/sqlite|file:|\.db$/i.test(url)) {
      throw new Error("SQLite is forbidden. Use Postgres DATABASE_URL.");
    }
    pool = new Pool({ connectionString: url, max: 10 });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return getPool().query<T>(text, params);
}
