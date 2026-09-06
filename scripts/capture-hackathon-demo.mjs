import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, ".artifacts", "hackathon-demo");
await mkdir(outputDir, { recursive: true });
await rm(path.join(outputDir, "raw.webm"), { force: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  recordVideo: { dir: outputDir, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
const video = page.video();

const pause = (ms) => page.waitForTimeout(ms);

async function installDemoLayer(label) {
  await page.addStyleTag({
    content: `
      html { scroll-behavior: smooth !important; }
      * { cursor: none !important; }
      #demo-pointer { position: fixed; z-index: 2147483647; width: 22px; height: 22px;
        border: 2px solid rgba(255,255,255,.95); border-radius: 50%; pointer-events: none;
        transform: translate(-50%,-50%); box-shadow: 0 0 0 5px rgba(94,106,210,.22), 0 4px 18px rgba(0,0,0,.5); }
      #demo-pointer.clicking { animation: demo-pulse .45s ease-out; }
      #demo-chapter { position: fixed; z-index: 2147483646; left: 34px; bottom: 30px;
        padding: 10px 14px; color: #f7f8f8; background: rgba(8,9,12,.82);
        border: 1px solid rgba(130,143,255,.45); border-radius: 999px;
        font: 600 13px/1.1 Arial,sans-serif; letter-spacing: .08em; text-transform: uppercase;
        backdrop-filter: blur(14px); box-shadow: 0 12px 35px rgba(0,0,0,.35); }
      #demo-watermark { position: fixed; z-index: 2147483646; right: 28px; top: 24px;
        color: rgba(247,248,248,.72); font: 600 12px/1 Arial,sans-serif; letter-spacing: .12em; }
      @keyframes demo-pulse { 0% { transform:translate(-50%,-50%) scale(1); }
        45% { transform:translate(-50%,-50%) scale(.72); background:rgba(130,143,255,.8); }
        100% { transform:translate(-50%,-50%) scale(1); } }
    `,
  });
  await page.evaluate((chapter) => {
    const pointer = document.createElement("div");
    pointer.id = "demo-pointer";
    pointer.style.left = "960px";
    pointer.style.top = "540px";
    const tag = document.createElement("div");
    tag.id = "demo-chapter";
    tag.textContent = chapter;
    const watermark = document.createElement("div");
    watermark.id = "demo-watermark";
    watermark.textContent = "CLASSOS  /  HACKATHON DEMO";
    document.body.append(pointer, tag, watermark);
    addEventListener("mousemove", (event) => {
      pointer.style.left = `${event.clientX}px`;
      pointer.style.top = `${event.clientY}px`;
    });
    addEventListener("click", () => {
      pointer.classList.remove("clicking");
      void pointer.offsetWidth;
      pointer.classList.add("clicking");
    });
  }, label);
}

async function visit(route, chapter) {
  await page.goto(`http://127.0.0.1:3000${route}`, {
    waitUntil: "networkidle",
  });
  await installDemoLayer(chapter);
  await pause(1200);
}

async function moveTo(locator) {
  if ((await locator.count()) === 0) return false;
  const box = await locator.first().boundingBox();
  if (!box) return false;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 28,
  });
  return true;
}

async function clickIf(locator) {
  if (!(await moveTo(locator))) return false;
  await pause(450);
  await locator.first().click();
  return true;
}

async function smoothScroll(y, hold = 1800) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "smooth" }), y);
  await pause(hold);
}

await page.setContent(`<!doctype html><html><head><style>
  *{box-sizing:border-box} body{margin:0;overflow:hidden;background:#010102;color:#f7f8f8;
  font-family:Arial,sans-serif} .grid{position:absolute;inset:-30%;background-image:
  linear-gradient(rgba(130,143,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(130,143,255,.08) 1px,transparent 1px);
  background-size:72px 72px;transform:perspective(850px) rotateX(62deg) translateY(-10%);
  animation:drift 11s linear infinite}.orb{position:absolute;width:760px;height:760px;border-radius:50%;
  background:radial-gradient(circle,rgba(94,106,210,.33),rgba(94,106,210,0) 68%);left:50%;top:50%;
  transform:translate(-50%,-50%);animation:breathe 4s ease-in-out infinite}.content{position:absolute;inset:0;
  display:grid;place-content:center;text-align:center;padding:100px}.eyebrow{font-size:16px;letter-spacing:.28em;
  color:#828fff;margin-bottom:30px;animation:rise 1s .2s both}.hook{font-size:76px;line-height:1.04;
  letter-spacing:-.055em;max-width:1450px;margin:0 auto;font-weight:700}.hook span{display:inline-block;
  opacity:0;transform:translateY(45px);animation:word .8s cubic-bezier(.2,.8,.2,1) forwards}.hook span:nth-child(1){animation-delay:.9s}
  .hook span:nth-child(2){animation-delay:1.15s}.hook span:nth-child(3){animation-delay:1.4s}.hook span:nth-child(4){animation-delay:1.65s}
  .hook span:nth-child(5){animation-delay:1.9s}.hook span:nth-child(6){animation-delay:2.15s}.brand{font-size:22px;
  margin-top:42px;color:#d0d6e0;opacity:0;animation:rise 1s 3s forwards}.brand b{color:#828fff}
  @keyframes word{to{opacity:1;transform:translateY(0)}}@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
  @keyframes drift{to{transform:perspective(850px) rotateX(62deg) translateY(62px)}}@keyframes breathe{50%{transform:translate(-50%,-50%) scale(1.16)}}
  </style></head><body><div class="grid"></div><div class="orb"></div><main class="content">
  <div class="eyebrow">INTRODUCING CLASSOS</div><h1 class="hook"><span>School</span> <span>plans</span> <span>should</span> <span>adapt</span> <span>to</span> <span>life.</span></h1>
  <div class="brand">One calm workspace. <b>Every moving part.</b></div></main></body></html>`);
await pause(10500);

await visit("/", "01  /  Adaptive dashboard");
await moveTo(page.locator(".focus-now").first());
await pause(2800);
await smoothScroll(520, 2600);
await smoothScroll(980, 2600);
await smoothScroll(0, 1800);

await visit("/timetable", "02  /  Timetable intelligence");
await moveTo(page.locator(".timetable-day.current-day").first());
await pause(2200);
await smoothScroll(500, 2400);
await clickIf(page.getByRole("button", { name: "Add class", exact: true }));
await pause(2600);
await page.keyboard.press("Escape");
await pause(1100);

await visit("/assignments", "03  /  Assignments + tests");
await clickIf(
  page
    .getByRole("navigation", { name: "Filter by subject" })
    .getByRole("link", { name: "History" }),
);
await pause(2200);
await clickIf(page.getByRole("link", { name: "All" }).first());
await pause(1700);
await clickIf(page.getByRole("button", { name: "New assignment" }));
await pause(2500);
await page.keyboard.press("Escape");
await clickIf(page.getByRole("button", { name: "Add test", exact: true }));
await pause(2500);
await page.keyboard.press("Escape");
await smoothScroll(620, 2300);

await visit("/planner", "04  /  Explainable 14-day planner");
await clickIf(page.getByRole("link", { name: "Next day", exact: true }));
await pause(2300);
await clickIf(page.getByRole("link", { name: "Today", exact: true }));
await pause(1800);
await smoothScroll(700, 2500);
const details = page.locator(".proposal-days details").first();
if (await details.count()) {
  await clickIf(details.locator("summary"));
  await pause(3000);
}
await moveTo(page.getByRole("button", { name: "Apply this plan" }));
await pause(1800);

await visit("/catch-up", "05  /  Missed-work recovery");
await smoothScroll(360, 2200);
const source = page.locator(".source-details").first();
if (await source.count()) {
  await clickIf(source.locator("summary"));
  await pause(2400);
}
await smoothScroll(760, 2400);
const addNotes = page.getByText("Add lesson notes", { exact: true }).first();
if (await addNotes.count()) {
  await clickIf(addNotes);
  await pause(2700);
}
await smoothScroll(1080, 2300);
await moveTo(
  page.getByRole("link", { name: "Build My Catch-Up Plan" }).first(),
);
await pause(2000);

await visit("/progress", "06  /  Progress that tells the truth");
await moveTo(page.locator(".progress-stats").first());
await pause(2800);
await smoothScroll(430, 2800);
await smoothScroll(820, 2400);

await visit("/settings", "07  /  Personal study constraints");
await moveTo(page.getByLabel("Daily study limit"));
await pause(1800);
await moveTo(page.getByLabel("Preferred study start"));
await pause(1800);
await moveTo(page.getByRole("button", { name: "Save preferences" }));
await pause(1800);

await visit("/onboarding", "08  /  Fast onboarding + local-first PWA");
await smoothScroll(340, 2200);
await moveTo(page.getByRole("link", { name: "Go to dashboard" }));
await pause(1800);

await context.setOffline(true);
await page.goto("http://127.0.0.1:3000/offline-test").catch(() => {});
await pause(7000);
await context.setOffline(false);

await page.setContent(`<!doctype html><html><head><style>
  body{margin:0;background:#010102;color:#f7f8f8;font-family:Arial,sans-serif;overflow:hidden}
  .flare{position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,rgba(94,106,210,.38),transparent 32%);animation:pulse 3s ease-in-out infinite}
  main{position:absolute;inset:0;display:grid;place-content:center;text-align:center}.mark{font-size:118px;font-weight:800;letter-spacing:-.07em;
  opacity:0;transform:scale(.85);animation:arrive 1.1s .2s cubic-bezier(.2,.8,.2,1) forwards}.mark span{color:#828fff}
  p{font-size:25px;color:#d0d6e0;letter-spacing:.02em;opacity:0;animation:arrive .8s 1.15s forwards}.tag{margin-top:40px;
  font-size:14px;letter-spacing:.24em;color:#8a8f98;opacity:0;animation:arrive .8s 1.8s forwards}
  @keyframes arrive{to{opacity:1;transform:none}}@keyframes pulse{50%{transform:scale(1.15)}}
  </style></head><body><div class="flare"></div><main><div class="mark">Class<span>OS</span></div>
  <p>Your school schedule—ready for real life.</p><div class="tag">ADAPT  •  RECOVER  •  PROGRESS</div></main></body></html>`);
await pause(8500);

await page.close();
await context.close();
await browser.close();
const recordedPath = await video.path();
await import("node:fs/promises").then(({ rename }) =>
  rename(recordedPath, path.join(outputDir, "raw.webm")),
);
console.log(path.join(outputDir, "raw.webm"));
