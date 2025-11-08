import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Database from "better-sqlite3";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

// Detect if using PostgreSQL or SQLite
const isPostgres = databaseUrl?.includes("postgresql");

let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>;

if (isPostgres && databaseUrl) {
  // PostgreSQL configuration
  const client = postgres(databaseUrl);
  db = drizzlePg(client, { schema });
} else {
  // SQLite configuration (default for development)
  const sqlite = new Database(databaseUrl || "file:./dev.db");
  sqlite.pragma("journal_mode = WAL");
  db = drizzle(sqlite, { schema });
}

export { db };

