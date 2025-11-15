import 'server-only';

// Re-export from db-server to maintain compatibility
// This file acts as a proxy to avoid Turbopack analyzing the actual implementation
import { getDbSync } from './db-server';

// Export the database instance (not the function)
export const db = getDbSync();
