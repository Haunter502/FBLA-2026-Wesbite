import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "drizzle-orm", "drizzle-orm/better-sqlite3", "drizzle-orm/sqlite-core"],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Speeds up dev/build by reducing bundle + transform work.
    // Safe: does not remove any features/animations.
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
    ],
  },
};

export default nextConfig;
