import { expect, type Page } from "@playwright/test";

export async function enterDemo(page: Page) {
  await page.goto("/");
  const form = page.locator("form").filter({
    has: page.getByRole("button", {
      name: "Open demo workspace",
      exact: true,
    }),
  });
  await form
    .getByRole("button", { name: "Open demo workspace", exact: true })
    .click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
