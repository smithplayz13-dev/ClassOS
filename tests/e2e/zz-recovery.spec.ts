import { expect, test } from "@playwright/test";
import { addDays, dateInTimezone } from "../../src/lib/domain/dates";

test("reviews extracted work before creating tasks, caches notes, and applies a plan", async ({
  page,
}) => {
  await page.goto("/catch-up");
  const absence = page.locator(".absence-section").first();
  await absence.getByText("Add lesson notes", { exact: true }).click();
  await absence.getByLabel("Note title").fill("Recovery integration notes");
  await absence
    .getByLabel("Lesson text")
    .fill("Review integration algebra\nComplete integration worksheet");
  await absence.getByRole("button", { name: "Extract missed work" }).click();
  await expect(absence.locator(".review-item")).toHaveCount(2);
  await page.goto("/assignments");
  await expect(
    page.getByText("Review integration algebra", { exact: true }),
  ).toHaveCount(0);
  await page.goto("/catch-up");
  const review = page.locator(".review-work").first();
  await review
    .getByRole("combobox", { name: "Subject", exact: true })
    .first()
    .selectOption("math");
  await review
    .getByLabel("Due date")
    .first()
    .fill(addDays(dateInTimezone(new Date(), "Asia/Kolkata"), 3));
  await review.getByLabel("Task 2", { exact: true }).uncheck();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.artifacts/recovery-${width}.png`,
      fullPage: true,
    });
  }
  await review.getByRole("button", { name: "Accept selected tasks" }).click();
  await expect(page.locator(".review-work")).toHaveCount(0);
  await expect(
    page.getByText("Review integration algebra", { exact: true }),
  ).toBeVisible();
  await absence.getByText("Add lesson notes", { exact: true }).click();
  await absence
    .getByLabel("Lesson text")
    .fill("Review integration algebra\nComplete integration worksheet");
  await absence.getByRole("button", { name: "Extract missed work" }).click();
  await expect(absence.getByRole("status")).toContainText("already accepted");
  await page.goto("/planner");
  await page.getByRole("button", { name: "Apply this plan" }).click();
  await expect(
    page.locator(".schedule-review").getByRole("status"),
  ).toContainText("up to date");
  await page.reload();
  await expect(page.locator(".schedule-review .pill")).toHaveText("Up to date");
  await page.screenshot({ path: ".artifacts/planner-320.png", fullPage: true });
});

test("edits assignments with empty descriptions and checks timetable overlaps", async ({
  page,
}) => {
  await page.goto("/assignments");
  await page
    .getByRole("button", {
      name: "Edit Review integration algebra",
      exact: true,
    })
    .click();
  const task = page.getByRole("dialog", { name: "Edit assignment" });
  await task.getByLabel("Description", { exact: true }).fill("");
  await task.getByLabel("Estimated minutes").fill("45");
  await task.getByRole("button", { name: "Save changes" }).click();
  await expect(task.getByRole("status")).toHaveText("Assignment updated.");
  await page.keyboard.press("Escape");
  await page.goto("/timetable");
  await page.getByRole("button", { name: "Add class", exact: true }).click();
  const lesson = page.getByRole("dialog", { name: "Add class" });
  await lesson
    .getByRole("combobox", { name: "Day", exact: true })
    .selectOption("0");
  await lesson.getByRole("button", { name: "Save changes" }).click();
  await expect(lesson.getByRole("status")).toHaveText("Timetable saved.");
  await lesson
    .getByRole("combobox", { name: "Day", exact: true })
    .selectOption("0");
  await lesson.getByRole("button", { name: "Save changes" }).click();
  await expect(lesson.getByRole("alert")).toContainText("overlaps");
});

test("validates file signatures and extracts actual PDF and image text", async ({
  page,
  browser,
}) => {
  test.setTimeout(120_000);
  await page.goto("/catch-up");
  const absence = page.locator(".absence-section").first();
  await absence.getByText("Add lesson notes", { exact: true }).click();
  await absence
    .getByRole("button", { name: "Upload file", exact: true })
    .click();
  const upload = absence.locator('input[type="file"]');
  await upload.setInputFiles({
    name: "invalid.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("Not a PDF"),
  });
  await absence.getByRole("button", { name: "Extract missed work" }).click();
  await expect(absence.getByRole("alert")).toContainText("valid PDF");
  const fixture = await browser.newPage({
    viewport: { width: 1000, height: 250 },
  });
  await fixture.setContent(
    '<html><body style="background:white;color:black;font:32px Arial;padding:30px">Read the chapter on quadratic equations.</body></html>',
  );
  const pdf = await fixture.pdf();
  await upload.setInputFiles({
    name: "lesson.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });
  await absence.getByRole("button", { name: "Extract missed work" }).click();
  await expect(absence.locator(".review-work")).toHaveCount(1, {
    timeout: 55_000,
  });
  await expect(
    absence.locator(".review-work").getByLabel("Task title").first(),
  ).toHaveValue(/quadratic/);
  const png = await fixture.screenshot();
  await fixture.close();
  await upload.setInputFiles({
    name: "lesson.png",
    mimeType: "image/png",
    buffer: png,
  });
  await absence.getByRole("button", { name: "Extract missed work" }).click();
  await expect(absence.locator(".review-work")).toHaveCount(2, {
    timeout: 55_000,
  });
  await expect(
    absence.locator(".review-work").last().getByLabel("Task title").first(),
  ).toHaveValue(/quadratic/);
});

test("provides an install manifest, reduced-motion navigation, and an offline fallback", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Navigation", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "All pages" })
    .getByRole("link", { name: "Progress", exact: true })
    .click();
  await expect(page.locator("main h1")).toHaveText("Progress");
  const manifest = await page.request.get("/manifest.webmanifest");
  expect((await manifest.json()).display).toBe("standalone");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.goto("/offline-test");
  await expect(
    page.getByRole("heading", { name: "A moment offline" }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("locks, replans, and records real study time without completing its task", async ({
  page,
}) => {
  await page.goto("/progress");
  const before = Number(
    (await page
      .locator(".progress-stats > div")
      .nth(1)
      .locator("strong")
      .textContent())!.replace(/\D/g, ""),
  );
  await page.goto("/planner");
  const locked = page
    .locator(".session-row")
    .filter({
      has: page.getByRole("button", { name: "Unlock session", exact: true }),
    })
    .first();
  await expect(locked).toBeVisible();
  const title = await locked.locator("strong").first().textContent();
  await page.getByRole("button", { name: "Apply this plan" }).click();
  await expect(
    page.locator(".schedule-review").getByRole("status"),
  ).toContainText("up to date");
  await expect(locked).toContainText(title!);
  await locked.getByRole("button", { name: "Log completed study" }).click();
  await expect(locked).toHaveCount(0);
  await page.goto("/progress");
  const after = Number(
    (await page
      .locator(".progress-stats > div")
      .nth(1)
      .locator("strong")
      .textContent())!.replace(/\D/g, ""),
  );
  expect(after).toBeGreaterThan(before);
  await page.goto("/assignments");
  await expect(
    page.getByRole("checkbox", { name: `Mark ${title} complete`, exact: true }),
  ).toBeVisible();
});

test("keeps test preparation synchronized after editing a test", async ({
  page,
}) => {
  await page.goto("/assignments");
  await page.getByRole("button", { name: "Add test", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add test" });
  await dialog.getByLabel("Test title").fill("Integration assessment");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Test saved.");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Edit Integration assessment", exact: true })
    .click();
  const edit = page.getByRole("dialog", { name: "Edit test" });
  await edit.getByLabel("Test title").fill("Revised assessment");
  await edit.getByRole("button", { name: "Save changes" }).click();
  await expect(edit.getByRole("status")).toHaveText("Test saved.");
  await page.keyboard.press("Escape");
  await expect(
    page.getByText("Prepare: Revised assessment", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Prepare: Integration assessment", { exact: true }),
  ).toHaveCount(0);
});
