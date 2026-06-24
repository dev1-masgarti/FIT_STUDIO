import postgres from 'postgres';

let sql: postgres.Sql | null = null;

export const getDb = (): postgres.Sql => {
  if (sql) return sql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it to apps/backend/.env (use the Supabase Postgres connection string).',
    );
  }

  const isLocal = url.includes('127.0.0.1') || url.includes('localhost');
  sql = postgres(url, {
    ssl: isLocal ? false : 'require',
    max: 10,
  });
  return sql;
};

export const closeDb = async (): Promise<void> => {
  if (sql) {
    await sql.end({ timeout: 5 });
    sql = null;
  }
};
