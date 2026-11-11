// Visits candidate pages on the live site at phone size and reports, per page:
// does it load, does it overflow sideways, is there a fullscreen control,
// and saves a screenshot to audio/survey/ (gitignored) for a contact sheet.
import { chromium, devices } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE ?? "https://khuncool.com";
export const PAGES = [
  "/", "/duck-race", "/random-name-picker", "/group-maker", "/timer",
  "/classroom-noise-meter", "/group-scoreboard", "/mystery-board", "/media",
  "/media/computer/typing-defense", "/media/mathematics/math-bomb-defusal",
  "/media/english/santa-sleigh", "/media/english/vocabulary-arcade",
  "/media/social-studies/krathong", "/media/science/density-lab",
  "/media/thai/thai-kingdom", "/tools/attendance", "/tools/toothbrushing",
  "/tools/milk", "/tools/savings",
];

const OUT = "audio/survey";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "th-TH" });
const page = await ctx.newPage();
for (const p of PAGES) {
  const name = p === "/" ? "home" : p.slice(1).replaceAll("/", "_");
  try {
    const res = await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => ({
      url: location.pathname,
      overflow: document.documentElement.scrollWidth - innerWidth,
      fullscreen: [...document.querySelectorAll("button,[role=button],a")]
        .map((b) => (b.getAttribute("aria-label") || b.textContent || "").trim())
        .filter((t) => /เต็มจอ|fullscreen/i.test(t)).slice(0, 2),
      login: /เข้าสู่ระบบ|login|sign in/i.test(document.body.innerText.slice(0, 1500)),
    }));
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(`${res?.status()} ${p} -> ${info.url} overflow=${info.overflow} fs=${JSON.stringify(info.fullscreen)} loginText=${info.login}`);
  } catch (e) {
    console.log(`ERR ${p} ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
