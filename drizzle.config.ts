// @ts-nocheck

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const config = {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      process.env.DATABASE_TURSO_DATABASE_URL ||
      'file:./dev.db',
    authToken:
      process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
};

export default config;

