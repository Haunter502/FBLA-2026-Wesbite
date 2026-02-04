/**
 * Prisma seed script. Not imported by the Next app (app uses Drizzle at runtime).
 * Run with: npm run prisma:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // No-op: application uses Drizzle for runtime DB. Kept for Prisma tooling/build.
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
