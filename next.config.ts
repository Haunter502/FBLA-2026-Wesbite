import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "drizzle-orm", "drizzle-orm/better-sqlite3", "drizzle-orm/sqlite-core"],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Configure Turbopack to externalize native modules
    turbo: {
      resolveAlias: {
        // Prevent Turbopack from bundling these packages
        'better-sqlite3': false,
        'drizzle-orm': false,
        'drizzle-orm/better-sqlite3': false,
        'drizzle-orm/sqlite-core': false,
      },
    },
  },
};

export default nextConfig;
