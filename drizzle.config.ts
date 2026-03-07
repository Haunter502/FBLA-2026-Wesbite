import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.DATABASE_TURSO_DATABASE_URL || 'file:./dev.db',
  },
  verbose: true,
  strict: true,
});

