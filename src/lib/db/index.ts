import "server-only";
import { createDatabaseClient } from "./client";

const globalDatabase = globalThis as unknown as {
  classosDatabase?: ReturnType<typeof createDatabaseClient>;
};
export const db = globalDatabase.classosDatabase ?? createDatabaseClient();
if (process.env.NODE_ENV !== "production") globalDatabase.classosDatabase = db;
