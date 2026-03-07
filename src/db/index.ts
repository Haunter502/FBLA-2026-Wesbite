import { createClient, Client } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "./schema"

declare global {
  // eslint-disable-next-line no-var
  var __db__: ReturnType<typeof drizzle> | undefined
  // eslint-disable-next-line no-var
  var __sqlite__: Client | undefined
}

const databaseUrl =
  (process.env.SQLITE_DB_PATH ??
    (process.env.DATABASE_URL?.startsWith("file:")
      ? process.env.DATABASE_URL.replace(/^file:/, "file:./")
      : process.env.DATABASE_URL)) || process.env.DATABASE_TURSO_DATABASE_URL

function createSqliteDb() {
  if (!global.__sqlite__) {
    const filePath = databaseUrl ?? "file:./drizzle/dev.db"
    global.__sqlite__ = createClient({
      url: filePath,
      authToken: process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN
    });
  }

  return drizzle(global.__sqlite__!, { schema, logger: process.env.NODE_ENV === "development" })
}

export const db = (() => {
  if (global.__db__) return global.__db__

  const instance = createSqliteDb()
  global.__db__ = instance
  return instance
})()

export type DbClient = typeof db
export { schema }

