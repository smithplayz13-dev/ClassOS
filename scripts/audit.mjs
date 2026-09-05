import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { resolve } from "node:path";

const url = "http://127.0.0.1:3108";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3108",
  ],
  { stdio: "ignore", windowsHide: true },
);
await mkdir(resolve(".artifacts/lighthouse-profile"), { recursive: true });
let chrome;
try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Audit server did not start");
  chrome = await launch({
    chromePath: chromium.executablePath(),
    userDataDir: resolve(".artifacts/lighthouse-profile"),
    chromeFlags: ["--headless", "--no-sandbox"],
    logLevel: "silent",
  });
  const result = await lighthouse(url, {
    port: chrome.port,
    output: ["json", "html"],
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices"],
  });
  await mkdir(".artifacts", { recursive: true });
  await writeFile(".artifacts/lighthouse-dashboard.json", result.report[0]);
  await writeFile(".artifacts/lighthouse-dashboard.html", result.report[1]);
  console.log(
    JSON.stringify(
      {
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, value]) => [
            key,
            value.score,
          ]),
        ),
        metrics: Object.fromEntries(
          [
            "largest-contentful-paint",
            "cumulative-layout-shift",
            "total-blocking-time",
          ].map((key) => [key, result.lhr.audits[key].displayValue]),
        ),
        failures: Object.values(result.lhr.audits)
          .filter((a) => a.score !== null && a.score < 1)
          .map((a) => ({ id: a.id, title: a.title, details: a.details })),
      },
      null,
      2,
    ),
  );
} finally {
  try {
    if (chrome) await chrome.kill();
  } finally {
    server.kill();
  }
}
