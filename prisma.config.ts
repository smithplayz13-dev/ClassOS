import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { resolveDatabaseUrl } from "./src/lib/db/url";

// Prisma needs INFO-level engine diagnostics to detect a missing SQLite file.
process.env.RUST_LOG = "info";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: resolveDatabaseUrl(env("DATABASE_URL")) },
});
