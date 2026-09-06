import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.UI_BASE_URL ?? "http://127.0.0.1:3000";
await mkdir(".artifacts/ui-revamp", { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const results = [];
try {
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: width > 760 ? 1000 : 844 });
    for (const route of [
      "/",
      "/assignments",
      "/timetable",
      "/planner",
      "/catch-up",
      "/progress",
      "/settings",
      "/onboarding",
    ]) {
      const response = await page.goto(`${origin}${route}`);
      await page.locator("main h1").waitFor();
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        headingLines: (() => {
          const heading = document.querySelector("main h1");
          return Math.round(
            heading.getBoundingClientRect().height /
              parseFloat(getComputedStyle(heading).lineHeight),
          );
        })(),
      }));
      if (
        response.status() !== 200 ||
        geometry.overflow ||
        geometry.headingLines > 3
      )
        throw new Error(
          `${width} ${route}: ${JSON.stringify(geometry)} HTTP ${response.status()}`,
        );
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: `.artifacts/ui-revamp/${route.slice(1) || "dashboard"}-${width}.png`,
          fullPage: true,
        });
      results.push({ width, route, ...geometry });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  await page.getByRole("button", { name: /Find a page/ }).click();
  const switcher = page.getByRole("dialog", {
    name: "Find a page",
    exact: true,
  });
  await switcher.getByRole("searchbox").fill("planner");
  await switcher.getByRole("link", { name: "Planner", exact: true }).click();
  await page.waitForURL("**/planner");
  await page.keyboard.press("Control+k");
  await switcher.waitFor();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog", { name: "Navigation", exact: true })
    .getByRole("link", { name: "Settings", exact: true })
    .click();
  await page.waitForURL("**/settings");
  await page
    .getByRole("navigation", { name: "Quick navigation" })
    .getByRole("link", { name: "Assignments", exact: true })
    .click();
  await page.waitForURL("**/assignments");
  await page
    .getByRole("button", { name: "New assignment", exact: true })
    .click();
  const modal = page.getByRole("dialog", {
    name: "New assignment",
    exact: true,
  });
  await modal.waitFor();
  // Interior whitespace must not dismiss the form.
  await modal.click({ position: { x: 8, y: 8 } });
  if (!(await modal.isVisible()))
    throw new Error("Clicking dialog padding dismissed the form");
  await page.keyboard.press("Escape");
  await page.goto(`${origin}/onboarding`);
  await page.getByRole("button", { name: "Find your rhythm" }).click();
  if (
    (await page
      .getByRole("button", { name: "Find your rhythm" })
      .getAttribute("aria-expanded")) !== "true"
  )
    throw new Error("Feature accordion did not open");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const animation = await page
    .locator(".marquee-track")
    .evaluate((element) => getComputedStyle(element).animationName);
  if (animation !== "none")
    throw new Error("Reduced motion did not stop marquee");
  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(
    ".artifacts/ui-revamp/checks.json",
    JSON.stringify({ results, interactions: "passed", errors }, null, 2),
  );
  console.log(
    `Passed ${results.length} route/viewport checks, page finder, mobile navigation, dialog, accordion, and reduced motion checks.`,
  );
} finally {
  await browser.close();
}
