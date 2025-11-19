import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "drizzle-orm", "drizzle-orm/better-sqlite3", "drizzle-orm/sqlite-core"],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Allow larger file uploads for API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default nextConfig;
