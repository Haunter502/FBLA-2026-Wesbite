import * as dotenv from "dotenv";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { createClient } from "@libsql/client";
import postgres from "postgres";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

// Vercel + Neon often set POSTGRES_URL; app also supports DATABASE_URL
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.DATABASE_TURSO_DATABASE_URL;

// Detect if using PostgreSQL or SQLite
const isPostgres = Boolean(databaseUrl?.includes("postgresql"));

let db: ReturnType<typeof drizzleLibsql> | ReturnType<typeof drizzlePg>;

if (isPostgres && databaseUrl) {
  // PostgreSQL configuration
  const client = postgres(databaseUrl);
  db = drizzlePg(client, { schema });
} else {
  // LibSQL/Turso configuration
  const client = createClient({
    url: databaseUrl || "file:./dev.db",
    authToken: process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzleLibsql(client, { schema });
}

export { db };

