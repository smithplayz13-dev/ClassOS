import { resolve } from "node:path";

// Prisma migrations resolve relative SQLite paths against the schema; the adapter uses cwd.
export function resolveDatabaseUrl(url: string): string {
  if (!url.startsWith("file:") || url === "file::memory:") return url;
  return `file:${resolve(url.slice(5)).replaceAll("\\", "/")}`;
}
