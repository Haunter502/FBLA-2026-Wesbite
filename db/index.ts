import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// For development, use SQLite
// For production with Postgres, you'd initialize differently
// This keeps it simple for the development/demo environment
const sqlite = new Database(databaseUrl || "./dev.db");
const db = drizzleSqlite(sqlite, { schema });

export { db };
export * from "./schema";

