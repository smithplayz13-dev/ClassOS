import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "../../src/lib/db/url";

describe("shared database URL resolution", () => {
  it("uses the same absolute SQLite path for the CLI and runtime", () => {
    expect(resolveDatabaseUrl("file:./prisma/classos.db")).toBe(
      `file:${resolve("prisma/classos.db").replaceAll("\\", "/")}`,
    );
  });
  it("does not resolve an absolute path twice", () => {
    const url = resolveDatabaseUrl("file:./.artifacts/test.db");
    expect(resolveDatabaseUrl(url)).toBe(url);
  });
  it("leaves non-file connection strings unchanged", () => {
    expect(resolveDatabaseUrl("postgresql://localhost/classos")).toBe(
      "postgresql://localhost/classos",
    );
  });
});
