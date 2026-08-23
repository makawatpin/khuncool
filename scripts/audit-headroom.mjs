/**
 * How much vertical room does each screen have left before it breaks?
 *
 *   node scripts/audit-headroom.mjs            (needs `npm run dev` running)
 *   node scripts/audit-headroom.mjs sound-wheel classroom-objects
 *
 * Why this exists
 * ---------------
 * audit-games.mjs answers "does it fit at these six sizes". It cannot answer
 * "by how much", and that turned out to matter: closing the tap-target work
 * showed Classroom Objects had 6px of slack on a phone, Family Tree's canvas
 * had 0.3px before its cards dropped under the WCAG minimum, and Sound Wheel
 * had none at all. Nobody knew that, because a pass and a pass-by-a-hair look
 * identical in the report.
 *
 * A margin that thin is a problem on its own, because the headless viewport is
 * not what a classroom has. A real tablet loses height to the browser's URL
 * bar, to a safe-area inset, sometimes to a pinned toolbar; a real phone in
 * landscape loses more. None of that exists here. So this walks each screen
 * down in 8px steps and reports the height at which it stops working — which is
 * the honest way to say "this screen survives losing N pixels" without claiming
 * to have tested a device.
 *
 * Two numbers, because they answer different questions. The hard-fail figure is
 * the audit's own bar: something has left the board and nothing can reach it.
 * The scroll figure is where a control first ends up behind a scrollbar, which
 * is advisory in the report and extremely visible to a class, and it is almost
 * always the smaller of the two. Sound Wheel's play screen is the example: it
 * has over 120px before anything hard-fails and none at all before its own
 * buttons start needing a scroll.
 *
 * It reuses auditStage() rather than reimplementing the checks, so "broken"
 * here means exactly what it means in the main audit.
 */
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const AUDIT_SRC = await readFile(path.join(ROOT, "scripts", "audit-stage.js"), "utf8");

// The screens worth probing are the ones a class actually sits on: the entry
// screen and the first play screen. Walking every screen would multiply the
// runtime for little more information — a result screen that breaks 40px down
// is a different, smaller problem than a play screen that does.
const GAMES = {
  "math-adventure": { path: "/media/mathematics/math-adventure", start: [/ฝึกทำ/, /เริ่มภารกิจ/], seed: 15 },
  "thai-kingdom": { path: "/media/thai/thai-kingdom", start: [/ฝึกทำ/, /เริ่มภารกิจ/], seed: 17 },
  "classroom-objects": { path: "/media/english/classroom-objects", start: /เริ่มเล่น/ },
  "family-tree": { path: "/media/english/family-tree", start: /เริ่มเล่น/ },
  "phonics-bingo": { path: "/media/english/phonics-bingo", start: /เริ่มเล่น/ },
  "sound-wheel": { path: "/media/english/sound-wheel", start: /เริ่มเล่น/ },
  "talk-card": { path: "/media/english/talk-card", start: /เริ่มสุ่มการ์ด/ },
  "is-are-sorting": { path: "/media/english/is-are-sorting", start: /เริ่มเล่น/ },
  "vocabulary-arcade": { path: "/media/english/vocabulary-arcade", start: null },
  "asean-matching": { path: "/media/social-studies/asean-matching", start: /เริ่มภารกิจ/ },
  "coding-maze": { path: "/media/computer/coding-maze", start: /เริ่ม/ },
  "digital-sort": { path: "/media/computer/digital-sort", start: /เริ่มภารกิจ/ },
  "typing-defense": { path: "/media/computer/typing-defense", start: null },
  "math-bomb-defusal": { path: "/media/mathematics/math-bomb-defusal", start: /ตั้งค่าภารกิจ/ },
  "science-lab-crisis": { path: "/media/science/science-lab-crisis", start: null },
  "motion-lab": { path: "/media/science/motion-lab", start: null },
  "density-lab": { path: "/media/science/density-lab", start: null },
};

// The two shapes with the least room to give. Portrait phone is where the
// tap-target work ran out of space; landscape phone is the shallowest board
// any of these games has to render on.
const SIZES = [
  { label: "375x812 phone upright", width: 375, height: 812 },
  { label: "844x390 phone sideways", width: 844, height: 390 },
];

const STEP = 8;
const MAX_LOSS = 120; // past this the screen is a different layout, not a squeeze

// Two thresholds, because they answer different questions. A hard failure is
// the audit's own bar: something is off the board and nothing can reach it. But
// a screen can stop being usable well before that — Sound Wheel's play screen
// pushed two of its own buttons behind a scroll with 4px less room, which is
// advisory in the report and very visible to a class. The scroll threshold is
// the sensitive one and usually the number worth acting on.
const scrollsControls = (r) =>
  (r?.contentHiddenBehindScroll || []).some((x) => x.hiddenControls > 0);

const hardFailures = (r) => {
  if (!r || r.error) return ["error: " + (r && r.error)];
  const out = [];
  if (r.unreachable?.length) out.push(`unreachable:${r.unreachable.length} (${r.unreachable[0].control})`);
  if (r.undersizedTargets?.length) out.push(`undersized:${r.undersizedTargets.length} (${r.undersizedTargets[0].control} ${r.undersizedTargets[0].width}x${r.undersizedTargets[0].height})`);
  if (r.smallText?.length) out.push(`smallText:${r.smallText.length}`);
  if (r.pageScrollsSideways) out.push("pageScrollsSideways");
  if (r.bodyUnbound) out.push("bodyUnbound");
  return out;
};

const requested = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const keys = requested.length ? requested : Object.keys(GAMES);
for (const k of keys) if (!GAMES[k]) { console.error(`unknown game "${k}"`); process.exit(1); }

const browser = await chromium.launch();
const results = [];

for (const key of keys) {
  const game = GAMES[key];
  for (const size of SIZES) {
    let firstBreak = null;
    let reason = null;
    let firstScroll = null;
    for (let loss = 0; loss <= MAX_LOSS; loss += STEP) {
      const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height - loss } });
      const page = await ctx.newPage();
      if (game.seed !== undefined) {
        await page.addInitScript((seed) => {
          let s = seed >>> 0;
          Math.random = function () {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
        }, game.seed);
      }
      await page.addInitScript(AUDIT_SRC);
      try {
        await page.goto(`${BASE_URL}${game.path}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);
        if (game.start) {
          const steps = Array.isArray(game.start) ? game.start : [game.start];
          for (const name of steps) {
            try { await page.getByRole("button", { name }).first().click({ timeout: 3500 }); } catch {}
            await page.waitForTimeout(400);
          }
        }
        await page.mouse.move(0, 0);
        await page.evaluate(() => {
          document.querySelectorAll("*").forEach((el) => { if (el.scrollTop) el.scrollTop = 0; if (el.scrollLeft) el.scrollLeft = 0; });
        });
        await page.waitForTimeout(120);
        const r = await page.evaluate((min) => window.auditStage({ min }), 11);
        if (firstScroll === null && scrollsControls(r)) firstScroll = loss;
        const fails = hardFailures(r);
        if (fails.length) { firstBreak = loss; reason = fails.join(", "); }
      } catch (e) {
        firstBreak = loss;
        reason = "harness: " + String(e).split("\n")[0].slice(0, 60);
      }
      await ctx.close();
      if (firstBreak !== null) break;
    }
    const hardTxt = firstBreak === null ? `>${MAX_LOSS}` : String(firstBreak);
    const scrollTxt = firstScroll === null ? `>${MAX_LOSS}` : String(firstScroll);
    results.push({ game: key, size: size.label, headroom: hardTxt, scrollroom: scrollTxt, reason });
    console.log(
      `${key.padEnd(20)} ${size.label.padEnd(22)} scroll at ${(scrollTxt + "px").padStart(7)}  hard fail at ${(hardTxt + "px").padStart(7)}${reason ? "   " + reason : ""}`,
    );
  }
}
await browser.close();

const num = (v) => (String(v).startsWith(">") ? 9999 : Number(v));

console.log("\n--- least room before a control needs scrolling");
for (const r of results.map((x) => ({ ...x, n: num(x.scrollroom) })).sort((a, b) => a.n - b.n).slice(0, 8)) {
  console.log(`  ${String(r.scrollroom).padStart(5)}px  ${r.game} / ${r.size}`);
}
console.log("\n--- least room before a hard failure");
for (const r of results.map((x) => ({ ...x, n: num(x.headroom) })).sort((a, b) => a.n - b.n).slice(0, 8)) {
  console.log(`  ${String(r.headroom).padStart(5)}px  ${r.game} / ${r.size}${r.reason ? "  — " + r.reason : ""}`);
}
