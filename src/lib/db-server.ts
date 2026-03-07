// This file should ONLY be imported in server contexts

import * as schema from '../../drizzle/schema';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

let _db: any = null;

// Synchronous version for server components
export function getDbSync() {
  // Always create fresh connection to ensure correct database path
  _db = null;

  if (typeof window !== 'undefined') {
    throw new Error('Database can only be accessed on the server');
  }

  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_TURSO_DATABASE_URL;

    console.log('[DB] Connecting to Turso database:');
    const client = createClient({
      url: databaseUrl || 'file:./dev.db',
      authToken: process.env.DATABASE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
    });

    _db = drizzle(client, { schema });
    return _db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
