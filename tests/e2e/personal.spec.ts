import { expect, test } from "@playwright/test";

test("personal setup persists real coursework independently of the demo", async ({
  page,
}) => {
  await page.goto("/onboarding");
  await page.getByLabel("Your name").fill("Personal Student");
  await page.getByLabel("Subjects (one per line)").fill("Biology\nChemistry");
  await page.getByRole("button", { name: "Create my workspace" }).click();
  await expect(page).toHaveURL(/\/timetable$/);
  await expect(page.locator(".demo-tag")).toHaveCount(0);
  await expect(page.locator(".lesson")).toHaveCount(0);

  await page.getByRole("button", { name: "Add class", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "Add class", exact: true });
  await dialog
    .getByRole("combobox", { name: "Subject", exact: true })
    .selectOption({ label: "Biology" });
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog.getByRole("status")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator(".lesson")).toHaveCount(1);

  await page.goto("/settings");
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Personal Student",
  );
  await page.getByRole("button", { name: "Add subject", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Add subject", exact: true });
  await dialog.getByLabel("Subject name").fill("Art");
  await dialog.getByLabel("Teacher").fill("Ms. Rivera");
  await dialog.getByLabel("Room").fill("Studio 2");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Subject saved.");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.getByText("Ms. Rivera / Studio 2")).toBeVisible();

  await page.goto("/assignments");
  await expect(page.locator(".task-row")).toHaveCount(0);
  await page.getByRole("button", { name: "New assignment" }).click();
  dialog = page.getByRole("dialog", { name: "New assignment" });
  await dialog
    .getByLabel("Title", { exact: true })
    .fill("Personal biology report");
  await dialog
    .getByRole("combobox", { name: "Subject", exact: true })
    .selectOption({ label: "Biology" });
  await dialog
    .getByRole("button", { name: "Add assignment", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Assignment added.");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(
    page.getByText("Personal biology report", { exact: true }),
  ).toBeVisible();
  await page.goto("/planner");
  await expect(
    page.getByRole("heading", { name: "Planner", exact: true }),
  ).toBeVisible();

  await page.goto("/settings");
  await page.getByRole("button", { name: "Edit Biology", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Edit subject", exact: true });
  page.once("dialog", (prompt) => prompt.accept());
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Move or remove");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open demo workspace" }).click();
  await expect(page.locator(".demo-tag")).toHaveText("DEMO");
  await page.goto("/assignments");
  await expect(
    page.getByText("Personal biology report", { exact: true }),
  ).toHaveCount(0);
  await page.goto("/onboarding");
  await page
    .getByRole("button", { name: "Continue as Personal Student" })
    .click();
  await expect(page).toHaveURL("http://127.0.0.1:3107/");
  await expect(page.locator(".demo-tag")).toHaveCount(0);
  await page.goto("/assignments");
  await expect(
    page.getByText("Personal biology report", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/settings");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".artifacts/personal-settings-mobile.png",
    fullPage: true,
  });
});
