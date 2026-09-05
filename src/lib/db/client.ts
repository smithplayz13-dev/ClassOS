import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { resolveDatabaseUrl } from "./url";

export function createDatabaseClient() {
  const url = process.env.DATABASE_URL;
  if (!url)
    throw new Error(
      "DATABASE_URL is required. Copy .env.example to .env and run npm run db:setup.",
    );
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: resolveDatabaseUrl(url) }),
  });
}
