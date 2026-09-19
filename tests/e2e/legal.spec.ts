import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { LEGAL_VERSION } from "../../src/lib/legal";

const database = () =>
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: `file:${resolve(".artifacts/e2e.db")}`,
    }),
  });

test("the root link opens the landing page and scrolls gently", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main h1")).toContainText("School, sorted.");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("smooth");
  await page.getByRole("link", { name: "Make it yours" }).first().click();
  await expect(page).toHaveURL(/\/#setup$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});

test("legal pages are public and readable on mobile", async ({
  page,
  context,
}) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/terms", "/privacy"]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.artifacts/legal-${route.slice(1)}-${width}.png`,
        fullPage: true,
      });
    }
  }
  expect(
    (await context.cookies()).some((cookie) => cookie.name === "classos-legal"),
  ).toBe(false);
});

test("the demo workspace opens without an agreement", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const form = page.locator("form").filter({
    has: page.getByRole("button", {
      name: "Open demo workspace",
      exact: true,
    }),
  });
  await expect(form.getByRole("checkbox")).toHaveCount(0);
  await form.getByRole("button").click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator(".demo-tag")).toHaveText("DEMO");
  expect(
    (await context.cookies()).some((cookie) => cookie.name === "classos-legal"),
  ).toBe(false);
  await page.goto("/planner");
  await expect(
    page.getByRole("heading", { name: "Planner", exact: true }),
  ).toBeVisible();
});

test("setup rejects missing agreement and policy links preserve the form", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const form = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Create my workspace" }) });
  await form.getByLabel("Your name").fill("Unsigned Student");
  await form.getByLabel("Subjects (one per line)").fill("Biology");
  const popupPromise = context.waitForEvent("page");
  await form.getByRole("link", { name: /Read Privacy Policy/ }).click();
  const popup = await popupPromise;
  await expect(popup.locator("main h1")).toHaveText("Privacy Policy");
  await popup.close();
  await expect(form.getByLabel("Your name")).toHaveValue("Unsigned Student");
  await form.getByRole("checkbox").evaluate((input: HTMLInputElement) => {
    input.required = false;
  });
  await form.getByRole("button").click();
  await expect(form.getByRole("alert")).toContainText("Please agree");
  const db = database();
  try {
    expect(await db.student.count({ where: { id: "student-personal" } })).toBe(
      0,
    );
  } finally {
    await db.$disconnect();
  }
});

test("personal agreement is recorded, persists, and stale versions require a fresh agreement", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const setup = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Create my workspace" }) });
  await setup.getByLabel("Your name").fill("Agreement Student");
  await setup.getByLabel("Subjects (one per line)").fill("Biology");
  await setup.getByRole("checkbox").check();
  await setup.getByRole("button").click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const cookie = (await context.cookies()).find(
    (cookie) => cookie.name === "classos-legal",
  );
  expect(cookie?.httpOnly).toBe(true);
  const tokenHash = createHash("sha256").update(cookie!.value).digest("hex");
  const db = database();
  try {
    const record = await db.legalAcceptance.findUniqueOrThrow({
      where: { tokenHash },
    });
    expect(record.version).toBe(LEGAL_VERSION);
    expect(record.studentId).toBe("student-personal");
    expect(Date.now() - record.acceptedAt.getTime()).toBeLessThan(60000);
    await page.reload();
    await expect(page.locator("main h1")).toContainText("Today, at your pace.");
    await db.legalAcceptance.update({
      where: { tokenHash },
      data: { version: "outdated" },
    });
    await page.goto("/progress");
    await expect(page).toHaveURL(/agreement=required/);
    const returning = page.locator("form").filter({
      has: page.getByRole("button", { name: "Continue as Agreement Student" }),
    });
    await returning.getByRole("checkbox").check();
    await returning.getByRole("button").click();
    await context.clearCookies({ name: "classos-legal" });
    await page.goto("/settings");
    await expect(page).toHaveURL(/agreement=required/);
  } finally {
    await db.student.deleteMany({ where: { id: "student-personal" } });
    await db.$disconnect();
  }
});
