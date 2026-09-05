import { mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync, spawn } from "node:child_process";

const artifacts = resolve(".artifacts");
mkdirSync(artifacts, { recursive: true });
for (const suffix of ["", "-journal", "-shm", "-wal"]) {
  const file = resolve(artifacts, `e2e.db${suffix}`);
  if (dirname(file) !== artifacts)
    throw new Error("Invalid test database path");
  rmSync(file, { force: true });
}
for (const args of [
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"],
]) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3107",
  ],
  { stdio: "inherit", env: process.env },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 0));
