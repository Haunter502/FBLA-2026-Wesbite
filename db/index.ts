import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_TURSO_DATABASE_URL;

// For development, use SQLite
// For production with Postgres or Turso, you'd initialize differently
// This keeps it simple for the development/demo environment
const client = createClient({
    url: databaseUrl || "file:./dev.db",
    authToken: process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
});
const db = drizzleLibsql(client, { schema });

export { db };
export * from "./schema";

