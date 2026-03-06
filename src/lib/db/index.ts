import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || '';

// Determine if we're using Postgres or SQLite
const isPostgres = DATABASE_URL.startsWith('postgres');

let db: ReturnType<typeof drizzleSqlite> | ReturnType<typeof drizzlePostgres>;

if (isPostgres) {
  // PostgreSQL setup
  const client = postgres(DATABASE_URL);
  db = drizzlePostgres(client, { schema });
} else {
  // SQLite setup (dev)
  const sqlite = new Database(DATABASE_URL || './dev.db');
  db = drizzleSqlite(sqlite, { schema });
}

export { db };
export * from './schema';

