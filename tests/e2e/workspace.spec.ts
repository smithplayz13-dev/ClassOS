import { expect, test } from "@playwright/test";
import { addDays, dateInTimezone } from "../../src/lib/domain/dates";

test("all workspace routes render at desktop and mobile sizes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const viewport of [
    { width: 1440, height: 1080 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of [
      "/",
      "/timetable",
      "/assignments",
      "/planner",
      "/catch-up",
      "/progress",
      "/settings",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Main navigation" }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto("/");
    await page.screenshot({
      path: `.artifacts/dashboard-${viewport.width}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

test("creates an assignment, persists it, and completes it", async ({
  page,
}) => {
  await page.goto("/assignments");
  await page.getByRole("button", { name: "New assignment" }).click();
  const dialog = page.getByRole("dialog", { name: "New assignment" });
  await dialog
    .getByLabel("Title", { exact: true })
    .fill("Review photosynthesis notes");
  await dialog.getByLabel("Subject").selectOption("science");
  await dialog.getByLabel("Estimated minutes").fill("25");
  await dialog
    .getByRole("button", { name: "Add assignment", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Assignment added.");
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  await expect(
    page.getByText("Review photosynthesis notes", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Mark Review photosynthesis notes complete",
      exact: true,
    })
    .click();
  await page.getByRole("link", { name: "Completed", exact: true }).click();
  await expect(
    page.getByText("Review photosynthesis notes", { exact: true }),
  ).toBeVisible();
});

test("records an absence, prevents duplicates, and retains its notes", async ({
  page,
}) => {
  await page.goto("/catch-up");
  await page.getByRole("button", { name: "I missed school" }).click();
  const dialog = page.getByRole("dialog", { name: "I missed school" });
  const date = addDays(dateInTimezone(new Date(), "Asia/Kolkata"), -10);
  await dialog.getByLabel("Date", { exact: true }).fill(date);
  await dialog
    .getByLabel("Notes")
    .fill("Medical appointment; collected notes afterwards.");
  await dialog.getByRole("button", { name: "Record absence" }).click();
  await expect(dialog.getByRole("status")).toContainText("Absence recorded");
  await dialog.getByLabel("Date", { exact: true }).fill(date);
  await dialog.getByRole("button", { name: "Record absence" }).click();
  await expect(dialog.getByRole("alert")).toContainText("already recorded");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(
    page.getByText("Medical appointment; collected notes afterwards."),
  ).toBeVisible();
});

test("validates settings and persists valid preferences", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Timezone", { exact: true }).fill("Invalid/Zone");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.locator(".settings-form").getByRole("alert")).toContainText(
    "valid IANA timezone",
  );
  await page.getByLabel("Timezone", { exact: true }).fill("Asia/Kolkata");
  await page.getByLabel("Daily study limit").fill("150");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toHaveText("Preferences saved.");
  await page.reload();
  await expect(page.getByLabel("Daily study limit")).toHaveValue("150");
  await page.getByLabel("Daily study limit").fill("120");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toHaveText("Preferences saved.");
});

test("filters coursework and changes planner dates", async ({ page }) => {
  await page.goto("/assignments");
  await page
    .getByRole("navigation", { name: "Filter by subject" })
    .getByRole("link", { name: "History" })
    .click();
  await expect(page.locator(".task-row")).toHaveCount(1);
  await expect(
    page.getByText("Industrial Revolution source analysis", { exact: true }),
  ).toBeVisible();
  await page.goto("/planner");
  const current = await page.locator(".date-controls h2").textContent();
  await page.getByRole("link", { name: "Next day", exact: true }).click();
  await expect(page.locator(".date-controls h2")).not.toHaveText(current!);
  await page.getByRole("link", { name: "Today", exact: true }).click();
  await expect(page.locator(".date-controls h2")).toHaveText(current!);
});
