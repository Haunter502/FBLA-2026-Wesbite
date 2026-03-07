import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { createClient } from '@libsql/client';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_TURSO_DATABASE_URL || '';

// Determine if we're using Postgres or SQLite/LibSQL
const isPostgres = DATABASE_URL.startsWith('postgres');

let db: ReturnType<typeof drizzleLibsql> | ReturnType<typeof drizzlePostgres>;

if (isPostgres) {
  // PostgreSQL setup
  const client = postgres(DATABASE_URL);
  db = drizzlePostgres(client, { schema });
} else {
  // LibSQL/Turso setup
  const client = createClient({
    url: DATABASE_URL || 'file:./dev.db',
    authToken: process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzleLibsql(client, { schema });
}

export { db };
export * from './schema';

