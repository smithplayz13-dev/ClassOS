import { expect, test, type Page } from "@playwright/test";
import { enterDemo } from "./legal-helpers";

async function theme(page: Page) {
  return page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
}

function luminance(rgb: [number, number, number]) {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

async function contrast(page: Page, fgSelector: string, bgSelector: string) {
  return page.evaluate(
    ({ fgSelector, bgSelector }) => {
      const channel = (color: string): [number, number, number] => {
        const m = color.match(/[\d.]+/g)!.map(Number);
        return [m[0], m[1], m[2]];
      };
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (c: [number, number, number]) =>
        0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      const fg = channel(
        getComputedStyle(document.querySelector(fgSelector)!).color,
      );
      const bg = channel(
        getComputedStyle(document.querySelector(bgSelector)!).backgroundColor,
      );
      const l1 = lum(fg);
      const l2 = lum(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    },
    { fgSelector, bgSelector },
  );
}

test.beforeEach(async ({ page }) => {
  await enterDemo(page);
});

test("theme script applies before paint and Settings choice persists", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/dashboard");
  // Blocking inline script from the root layout, before any paint.
  const script = await page.evaluate(() =>
    Array.from(document.head.querySelectorAll("script")).some((el) =>
      el.textContent?.includes("classos-theme"),
    ),
  );
  expect(script).toBe(true);
  expect(await theme(page)).toBe("light");

  await page.goto("/settings");
  const dark = page.getByRole("radio", { name: "Dark" });
  await dark.check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("classos-theme"))).toBe(
    "dark",
  );

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Dark" })).toBeChecked();

  // Sidebar switch reflects the same stored choice and can go back.
  await page.goto("/dashboard");
  const sidebar = page.locator("aside.sidebar");
  await expect(
    sidebar.getByRole("button", { name: "Dark", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await sidebar.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("system choice follows the device scheme", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "System" }).check();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("dark theme keeps dialogs, charts, and text contrast usable", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "Dark" }).check();

  await page.goto("/dashboard");
  expect(await theme(page)).toBe("dark");
  await expect(page.locator("main h1")).toBeVisible();
  // Chart stays exposed to assistive tech and keeps its meaning.
  await expect(page.locator(".workload-chart .chart-plot")).toHaveAttribute(
    "aria-label",
    /minutes completed/,
  );
  // Dialogs render above the ink surface.
  await page.getByRole("button", { name: "I missed school" }).click();
  await expect(
    page.getByRole("dialog", { name: "I missed school" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  for (const choice of ["light", "dark"] as const) {
    await page.goto("/settings");
    await page
      .getByRole("radio", { name: choice === "light" ? "Light" : "Dark" })
      .check();
    await page.goto("/dashboard");
    const body = await contrast(page, "body", "body");
    expect(body, `${choice} body contrast`).toBeGreaterThanOrEqual(4.5);
    const muted = await page.evaluate(() => {
      const channel = (color: string) => {
        const m = color.match(/[\d.]+/g)!.map(Number);
        return [m[0], m[1], m[2]] as [number, number, number];
      };
      const probe = document.createElement("span");
      probe.className = "muted";
      probe.textContent = "probe";
      probe.style.position = "absolute";
      document.body.appendChild(probe);
      const fg = channel(getComputedStyle(probe).color);
      const bg = channel(getComputedStyle(document.body).backgroundColor);
      probe.remove();
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (c: [number, number, number]) =>
        0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      const l1 = lum(fg);
      const l2 = lum(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    });
    expect(muted, `${choice} muted contrast`).toBeGreaterThanOrEqual(4.5);
    // Filled primary actions keep white text at AA in both themes.
    await page.goto("/assignments");
    const primary = await page.evaluate(() => {
      const channel = (color: string) => {
        const m = color.match(/[\d.]+/g)!.map(Number);
        return [m[0], m[1], m[2]] as [number, number, number];
      };
      const el = document.querySelector("main .button.primary") as HTMLElement;
      const fg = channel(getComputedStyle(el).color);
      const bg = channel(getComputedStyle(el).backgroundColor);
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (c: [number, number, number]) =>
        0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      const l1 = lum(fg);
      const l2 = lum(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    });
    expect(primary, `${choice} primary-button contrast`).toBeGreaterThanOrEqual(
      4.5,
    );
  }
  expect(luminance([0, 0, 0])).toBe(0);
});

test("landing, legal, and offline pages follow the theme", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("classos-theme", "dark");
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "School, sorted.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.goto("/privacy");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy" }),
  ).toBeVisible();

  await page.goto("/offline.html");
  const bg = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor.replace(/\s+/g, ""),
  );
  expect(bg).not.toBe("rgb(247,247,245)");
});

test("mobile drawer exposes the theme switch", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
