import { expect, test } from "@playwright/test";

test("product tour and FAQ are usable with the keyboard", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const day = page.getByRole("tab", { name: "Your day", exact: true });
  await day.focus();
  await day.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Your plan", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Find your rhythm.");
  await expect(page.getByRole("tabpanel").locator("img")).toHaveJSProperty(
    "complete",
    true,
  );
  await expect(page.getByRole("tabpanel").locator("img")).not.toHaveJSProperty(
    "naturalWidth",
    0,
  );
  await page.getByRole("tab", { name: "Your plan", exact: true }).press("End");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Give every deadline a home.",
  );
  const question = page.getByRole("button", {
    name: "What happens when I miss a day?",
    exact: true,
  });
  await question.focus();
  await question.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("region", { name: "What happens when I miss a day?" }),
  ).toContainText("Review the extracted tasks");
  await question.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "false");
  expect(errors).toEqual([]);
});

test("mobile navigation, anchors, and responsive sections remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "School, sorted.",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width < 834) {
      const menu = page.getByRole("button", { name: /navigation$/ });
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(menu).toBeFocused();
      await menu.click();
      await page
        .locator("#landing-mobile-menu")
        .getByRole("link", { name: "How it works" })
        .click();
      await expect(page).toHaveURL(/#how-it-works$/);
      await expect(page.locator("#landing-mobile-menu")).toHaveCount(0);
    }
    await page
      .getByRole("link", { name: "Make it yours", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/#setup$/);
    await expect(page.locator("#setup")).toBeInViewport();
  }
});

test("reduced motion and a direct setup link keep content visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/#setup");
  await expect(
    page.getByRole("heading", { name: "A fresh start. Made for you." }),
  ).toBeVisible();
  await expect(page.locator("#setup")).toBeInViewport();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  const legal = page.locator("#setup").getByRole("checkbox");
  await expect(legal).not.toBeChecked();
  await expect(legal).toHaveAttribute("required", "");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("link", { name: "Back to the top" }).click();
  await expect(page).toHaveURL(/#overview$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
});
