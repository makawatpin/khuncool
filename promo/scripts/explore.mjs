// Desktop-size pass over the pages we plan to film: press the page's own
// "เต็มจอ" button, then list the visible buttons and screenshot the result,
// so recording scripts know what to click. Output: audio/explore/*.png
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE ?? "https://khuncool.com";
const PAGES = (process.env.PAGES ?? [
  "/duck-race", "/group-maker", "/timer", "/classroom-noise-meter",
  "/media/computer/typing-defense", "/media/mathematics/math-bomb-defusal",
  "/media/english/santa-sleigh", "/media/english/vocabulary-arcade",
  "/media/science/density-lab", "/media/thai/thai-kingdom",
  "/media/social-studies/krathong-designer", "/tools/attendance",
].join(",")).split(",");

const OUT = "audio/explore";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
});
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "th-TH", permissions: ["microphone"] });
// Accept only essential cookies up front so the consent banner never shows.
const page = await ctx.newPage();

const visibleButtons = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button,[role=button]")]
      .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; })
      .map((b) => (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30))
      .filter(Boolean),
  );

for (const p of PAGES) {
  const name = p.slice(1).replaceAll("/", "_");
  try {
    await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(1000);
    const fsBtn = page.getByRole("button", { name: /เต็มจอ/ }).first();
    let fsState = "no button";
    if (await fsBtn.count()) {
      await fsBtn.click();
      await page.waitForTimeout(1200);
      fsState = await page.evaluate(() =>
        document.fullscreenElement ? `api:${document.fullscreenElement.tagName}.${String(document.fullscreenElement.className).slice(0, 40)}` : "no fullscreenElement");
    }
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(`${p}\n  fullscreen: ${fsState}\n  buttons: ${JSON.stringify(await visibleButtons())}`);
    if (await page.evaluate(() => !!document.fullscreenElement)) await page.evaluate(() => document.exitFullscreen());
  } catch (e) {
    console.log(`ERR ${p} ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
