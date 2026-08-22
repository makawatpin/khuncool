/**
 * Two-way self-test for the covered-control pass.
 *
 *   node scripts/audit-covered-selftest.mjs      (needs `npm run dev` running)
 *
 * A check that reports nothing is indistinguishable from a check that is not
 * running, and the previous attempt at this one shipped silent for exactly that
 * reason: a "behind a modal" filter matched every element on every screen and
 * disabled the whole thing, and the empty result looked like good news. So the
 * bar here is two-way — the fixed page must be QUIET and the bugged page must
 * be LOUD — and it is run against the two real bugs this check exists for:
 *
 *   1. is-are-sorting at 844x390. An overflowing question card sat on the
 *      IS/ARE buttons and the game could not be played at all; every check in
 *      audit-stage.js passed it. Fixed in 532a870.
 *
 *   2. math-bomb-defusal at 768x1024. `.energyRing`, a 445x589 ellipse
 *      spinning on a 9s loop, had no `pointer-events:none` and took turns
 *      covering all four wire cards. This one is INTERMITTENT, which is why the
 *      pass samples over time: a single hit-test catches it only by luck, and
 *      Playwright's own click never fails on it because it retries until the
 *      ring rotates clear.
 *
 * Case 1 is also checked against Playwright's own actionability verdict, which
 * is what actually decides whether a click lands.
 */
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SRC = await readFile(new URL("./audit-covered.js", import.meta.url), "utf8");

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}: got ${actual}, expected ${expected}`);
};

// The pass assumes two things about the page, and both were found by getting
// them wrong: a hovered button can lift out from under whatever covers it, and
// a stale scroll offset moves the point a click would land on.
const settle = async (page) => {
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    document.querySelectorAll("*").forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
      if (el.scrollLeft) el.scrollLeft = 0;
    });
  });
  await page.waitForTimeout(120);
  return page.evaluate(() => window.auditCoveredControls());
};

const trial = async (page, name) => {
  try {
    await page.getByRole("button", { name, exact: true }).click({ trial: true, timeout: 1500 });
    return "clickable";
  } catch {
    return "refused";
  }
};

const browser = await chromium.launch();

// ---------------------------------------------------------------- case 1
//
// Each state gets its own page, and the Playwright trial always runs AFTER the
// measurement it is checking. That is not tidiness. Running a trial click first
// changes what the next measurement sees: with a trial on IS beforehand, this
// case reported 1 covered button instead of 2, three runs out of three, while a
// raw hit-test on the same page at the same moment showed both of them covered.
// The mechanism was not identified — it is not focus, z-index or geometry, all
// of which were measured and unchanged. What is established is that a trial
// perturbs the page enough to hide a real finding, so nothing may touch the
// page between settling it and reading it.
{
  console.log("\nis-are-sorting @ 844x390 — a card parked on the answer buttons");

  const open = async () => {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
    const page = await ctx.newPage();
    await page.addInitScript(SRC);
    await page.goto(`${BASE_URL}/media/english/is-are-sorting`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "เต็มจอ", exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /เริ่มเล่น/ }).click();
    await page.waitForTimeout(800);
    return { ctx, page };
  };

  {
    const { ctx, page } = await open();
    const r = await settle(page);
    check("controls were actually hit-tested", r.controlsTested > 0, true);
    check("fixed page is quiet", r.coveredControls.length, 0);
    check("playwright agrees IS is clickable", await trial(page, "IS"), "clickable");
    await ctx.close();
  }

  {
    const { ctx, page } = await open();
    // Reproduce the geometry of the bug 532a870 fixed. The original card was
    // 189px in a 46px area; on today's compacted layout 189px overlaps only
    // 24px of a 64px button row, which both this check and Playwright correctly
    // call still-clickable, so the height here is the one that covers the row
    // outright the way the original did.
    await page.addStyleTag({
      content: `
        [class*="cardArea"] { align-items: center !important; overflow: visible !important; }
        [class*="cardArea"] > div { height: 300px !important; }
      `,
    });
    await page.waitForTimeout(400);
    const r = await settle(page);
    check("bugged page reports both answer buttons", r.coveredControls.length, 2);
    check("and names the card as the blocker", r.coveredByBlocker[0]?.blocker.startsWith("DIV"), true);
    check(
      "as parked, not sweeping",
      r.coveredControls.every((x) => x.blockedSamples === x.totalSamples),
      true,
    );
    check("playwright agrees IS is now refused", await trial(page, "IS"), "refused");
    await ctx.close();
  }
}

// ---------------------------------------------------------------- case 2
{
  console.log("\nmath-bomb-defusal @ 768x1024 — a spinning ring sweeping the wires");
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await ctx.newPage();
  await page.addInitScript(SRC);
  await page.goto(`${BASE_URL}/media/mathematics/math-bomb-defusal`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "เต็มจอ", exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /ตั้งค่าภารกิจ/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /เริ่ม 10 ภารกิจ/ }).click();
  await page.waitForTimeout(1500);

  const before = await settle(page);
  check("controls were actually hit-tested", before.controlsTested > 0, true);
  check("fixed page is quiet", before.coveredControls.length, 0);

  // Undo the fix in MathBombGame.module.css and nothing else.
  await page.addStyleTag({
    content: `[class*="energyRing"] { pointer-events: auto !important; }`,
  });
  await page.waitForTimeout(300);

  const after = await settle(page);
  check("bugged page reports at least one wire card", after.coveredControls.length > 0, true);
  check(
    "and names the ring as the blocker",
    after.coveredByBlocker[0]?.blocker.includes("energyRing"),
    true,
  );
  await ctx.close();
}

await browser.close();
console.log(`\n${failures ? `${failures} assertion(s) FAILED` : "all assertions passed"}`);
process.exit(failures ? 1 : 0);
