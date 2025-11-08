// This file should ONLY be imported in server contexts
// It uses eval to completely hide module names from static analysis

import * as schema from '../../drizzle/schema';

let _db: any = null;

// Synchronous version for server components
export function getDbSync() {
  if (_db) return _db;
  
  if (typeof window !== 'undefined') {
    throw new Error('Database can only be accessed on the server');
  }
  
  try {
    // Use eval to create require calls that Turbopack cannot statically analyze
    // This is the only way to prevent Turbopack from trying to bundle better-sqlite3
    const createRequire = eval('(name) => require(name)');
    
    // Build module paths using string operations that can't be statically analyzed
    const parts1 = ['drizzle', 'orm'];
    const parts2 = ['better', 'sqlite3'];
    const drizzlePath = parts1.join('-') + '/' + parts2.join('-');
    const sqlitePath = parts2.join('-');
    
    const dbModule = createRequire(drizzlePath);
    const Database = createRequire(sqlitePath);
    
    const { drizzle } = dbModule;
    const dbPath = (process.env.DATABASE_URL || './dev.db').replace(/^file:/, '');
    const sqlite = new Database(dbPath);
    _db = drizzle(sqlite, { schema });
    return _db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

