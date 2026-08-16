#!/usr/bin/env node
/**
 * Headless responsive audit for /media games.
 *
 * Loads each configured game at every viewport x mode (in-page / fullscreen)
 * x sub-screen combo, runs `auditStage()` (scripts/audit-stage.js) in-page,
 * and saves a PNG screenshot of the stage for visual review (font sizing and
 * emoji rendering are not something the JSON alone can judge).
 *
 * Usage:
 *   node scripts/audit-games.mjs                    // all configured games
 *   node scripts/audit-games.mjs phonics-bingo       // one game
 *   node scripts/audit-games.mjs phonics-bingo talk-card
 *   node scripts/audit-games.mjs --seeds=1,2,3,4,5,6 motion-lab
 *
 * Requires the Next dev server running at BASE_URL (default
 * http://localhost:3000) — start it yourself first:
 *   npm run dev
 *
 * Output: audit-output/<game>/results.json + one PNG per
 * screen x size x mode combo (gitignored, regenerate on demand).
 *
 * Randomised content
 * ------------------
 * Some games draw their content at random — Motion Lab picks 4 of 6 quiz
 * questions per load — so the same cell could pass one run and fail the next,
 * and two runs were not comparable at all. Math.random is therefore seeded
 * before any page script runs.
 *
 * Seeding alone would be a trap: it would freeze one draw forever and a game
 * could pass every run while still breaking in a classroom the moment a child
 * drew a longer set. So the default seed is chosen to produce the WORST draw
 * rather than a convenient one — for Motion Lab that means the question whose
 * options are full sentences — and --seeds sweeps several draws, failing a
 * cell if ANY seed fails it. Fix against the worst case, then confirm across
 * the sweep.
 */
import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(ROOT, "audit-output");

const AUDIT_STAGE_SRC = await readFile(
  path.join(ROOT, "scripts", "audit-stage.js"),
  "utf8",
);

/**
 * Default seed, chosen rather than picked arbitrarily.
 *
 * Sweeping seeds 1-40 and recording Motion Lab's first quiz question shows how
 * wide the spread is: most draws open with an option like "-60 เมตร" at 9
 * characters, while seeds 15, 17, 24, 27 and 38 open with the conceptual
 * question whose options are full sentences — 63 characters, seven times
 * longer. A seed from the common group would have let the game pass every run
 * forever and still wrap badly in a classroom the first time a child drew the
 * long set.
 *
 * 15 is therefore the default: the baseline run measures the hard draw. Use
 * --seeds to confirm a fix holds across the others too, and re-run the sweep
 * if the question pool changes.
 */
const DEFAULT_SEED = 15;

/** mulberry32 — small, deterministic, good enough to pick list indices. */
const seedScript = (seed) => `(() => {
  let s = ${seed} >>> 0;
  Math.random = function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;

/**
 * Which of two results for the same cell is the one worth keeping when
 * sweeping seeds: an error beats a failure, a failure beats a pass, and
 * between two passes the one hiding more controls wins.
 */
function severity(row) {
  if (row.error) return [3, 0];
  const hidden = (row.contentHiddenBehindScroll || []).reduce(
    (sum, region) => sum + (region.hiddenControls || 0),
    0,
  );
  return [row.pass === false ? 2 : 1, hidden];
}

function isWorse(candidate, current) {
  const a = severity(candidate);
  const b = severity(current);
  return a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1];
}

// 6 sizes x 2 modes, per docs/media-stage-contract.md checklist.
const SIZES = [
  { label: "375x812-mobile-portrait", width: 375, height: 812 },
  { label: "844x390-mobile-landscape", width: 844, height: 390 },
  { label: "768x1024-tablet-portrait", width: 768, height: 1024 },
  { label: "1024x768-tablet-landscape", width: 1024, height: 768 },
  { label: "1280x800-desktop", width: 1280, height: 800 },
  { label: "1920x1080-projector", width: 1920, height: 1080 },
];

const FULLSCREEN_LABEL = "เต็มจอ";

/**
 * Per-game config.
 *
 * `path` — route under BASE_URL.
 * `screens` — ordered sub-screens to capture. Each has a `name` and an
 * optional `enter(page)` step that clicks/advances from the previous screen
 * (screens run in order, state carries over — same as a real play session).
 */
// `enter` steps click by a regex substring match on accessible name — button
// text is often split across sibling text/icon nodes, which makes the exact
// accessible name unpredictable (spacing, icon placement). Screens that only
// exist after real gameplay (finishing a round, answering all questions, a
// timer elapsing) are intentionally left out — this config only automates
// screens reachable by clicking through setup/menus.
const click = (text) => async (page) => {
  await page.getByRole("button", { name: text }).click();
};

const GAMES = {
  "phonics-bingo": {
    path: "/media/english/phonics-bingo",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มเล่น/) },
    ],
  },
  "digital-sort": {
    path: "/media/computer/digital-sort",
    screens: [
      { name: "home" },
      { name: "play", enter: click(/เริ่มภารกิจ/) },
    ],
  },
  "coding-maze": {
    path: "/media/computer/coding-maze",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มภารกิจ/) },
    ],
  },
  "typing-defense": {
    path: "/media/computer/typing-defense",
    screens: [
      { name: "home" },
      { name: "select", enter: click(/เริ่มฝึกพิมพ์/) },
    ],
  },
  "asean-matching": {
    path: "/media/social-studies/asean-matching",
    screens: [
      { name: "home" },
      { name: "play", enter: click(/เริ่มภารกิจ/) },
    ],
  },
  "law-daily": {
    path: "/media/social-studies/law-daily",
    // Runs the actual game in a same-origin iframe by design (see
    // LawDailyEmbed.tsx) — the outer .kc-stage/.kc-stage-body shell is the
    // only part in scope for this contract; content inside the iframe is a
    // separate document that audit-stage.js's querySelectorAll cannot see,
    // and is intentionally outside the stage's container-query contract.
    screens: [{ name: "shell" }],
  },
  "family-tree": {
    path: "/media/english/family-tree",
    screens: [
      { name: "intro" },
      { name: "hub", enter: click(/เริ่มเล่น/) },
      { name: "plant-tree", enter: click(/ปลูกต้นไม้ครอบครัว/) },
    ],
  },
  "vocabulary-arcade": {
    path: "/media/english/vocabulary-arcade",
    screens: [
      { name: "intro" },
      { name: "category-picker", enter: click(/เลือกหมวดคำศัพท์/) },
      { name: "mode-picker", enter: click(/Animals/) },
      { name: "play", enter: click(/Picture Match/) },
    ],
  },
  "classroom-objects": {
    path: "/media/english/classroom-objects",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มเล่น/) },
    ],
  },
  "is-are-sorting": {
    path: "/media/english/is-are-sorting",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มเล่น/) },
    ],
  },
  "talk-card": {
    path: "/media/english/talk-card",
    screens: [
      { name: "setup" },
      { name: "play", enter: click(/เริ่มสุ่มการ์ด/) },
    ],
  },
  "sound-wheel": {
    path: "/media/english/sound-wheel",
    screens: [
      { name: "setup" },
      { name: "play", enter: click(/เริ่มเล่น/) },
    ],
  },
  "math-bomb-defusal": {
    path: "/media/mathematics/math-bomb-defusal",
    screens: [
      { name: "intro" },
      { name: "setup", enter: click(/ตั้งค่าภารกิจ/) },
      { name: "game", enter: click(/เริ่ม 10 ภารกิจ/) },
    ],
  },
  "science-lab-crisis": {
    path: "/media/science/science-lab-crisis",
    screens: [
      { name: "intro" },
      { name: "setup", enter: click(/รับบัตรนักวิจัย/) },
      { name: "game", enter: click(/เริ่ม 10 ภารกิจ/) },
    ],
  },
  "motion-lab": {
    path: "/media/science/motion-lab",
    screens: [
      { name: "intro" },
      { name: "lab", enter: click(/เข้าสู่ห้องทดลอง/) },
      { name: "quiz", enter: click(/โจทย์จากการทดลอง/) },
    ],
  },
  "density-lab": {
    path: "/media/science/density-lab",
    screens: [
      { name: "intro" },
      { name: "setup", enter: click(/เริ่มการทดลอง/) },
      { name: "result", enter: click(/ปล่อยวัตถุลงถัง/) },
      { name: "quiz", enter: click(/ตอบโจทย์/) },
    ],
  },
};

function slugify(label) {
  return label.replace(/[^a-z0-9-]+/gi, "-");
}

async function auditOneScreen({ page, game, gameKey, screen, size, mode, outDir, suffix = "" }) {
  // Force the CSS-fallback fullscreen path (see useStage.ts) instead of the
  // real browser Fullscreen API, which headless Chromium does not reliably
  // enter — the fallback renders identically per the stage contract, and
  // gives a deterministic click-to-toggle without a flaky async API race.
  if (mode === "fullscreen") {
    const btn = page.getByRole("button", { name: FULLSCREEN_LABEL, exact: true });
    await btn.click();
    await page.waitForTimeout(150);
  }

  // Park the pointer before measuring. Playwright leaves the cursor wherever it
  // last clicked, so after the fullscreen toggle the mouse sits inside the
  // stage — and whatever is under it is hovered. Digital Sort's software bin
  // scales 1.06 on hover, which grew its measured box by 56px and reported it
  // as 12px past the stage in four cells; its actual layout height fitted with
  // 16px to spare. getBoundingClientRect returns the visual box, transform
  // included, so a hover effect reads exactly like an overflow.
  //
  // The wait is part of the fix rather than padding: that bin transitions its
  // transform over 0.18s, so moving the pointer away and measuring straight
  // after still catches the scale part-way back and reports a smaller phantom
  // overflow instead of none.
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);

  // Measure from the scroll position a player actually lands on.
  //
  // Playwright scrolls an element into view before clicking it, and a game
  // whose start button sits past the stage edge gets its container scrolled to
  // reach it — a scroll a real player, facing overflow:hidden, could never
  // perform. That offset then persists into the next screen and every box below
  // is measured against it: an early run of this script reported four games as
  // rendering blank at 844x390 because the container was still scrolled 301px
  // down from the click that entered the screen. Resetting first costs nothing
  // and keeps the numbers describing the game rather than the harness.
  await page.evaluate(() => {
    document.querySelectorAll("*").forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
      if (el.scrollLeft) el.scrollLeft = 0;
    });
  });
  await page.waitForTimeout(100);

  const result = await page.evaluate((min) => window.auditStage({ min }), 11);

  const fileBase = `${screen.name}__${size.label}__${mode}${suffix}`;
  const screenshotPath = path.join(outDir, `${fileBase}.png`);
  const stageHandle = await page.$(".kc-stage, .kc-game, [class*='__shell'], [class*='__lab'], [class*='__game']");
  if (stageHandle) {
    await stageHandle.screenshot({ path: screenshotPath });
  } else {
    await page.screenshot({ path: screenshotPath, fullPage: false });
  }

  if (mode === "fullscreen") {
    const exitBtn = page.getByRole("button", { name: "ออกจากเต็มจอ", exact: true });
    if (await exitBtn.count()) await exitBtn.click();
    await page.waitForTimeout(150);
  }

  return {
    game: gameKey,
    screen: screen.name,
    size: size.label,
    mode,
    screenshot: path.relative(ROOT, screenshotPath),
    ...result,
  };
}

async function auditGame(browser, gameKey, game, seed, tagScreenshots) {
  const outDir = path.join(OUT_DIR, gameKey);
  await mkdir(outDir, { recursive: true });

  const rows = [];

  for (const size of SIZES) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      // Force the mobile UA branch in useStage.ts's preferCssFullscreen check
      // so the fullscreen toggle always uses the deterministic CSS fallback
      // (see comment in auditOneScreen). Layout itself only reads container
      // query units per the stage contract, so this does not skew rendering.
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    });
    const page = await context.newPage();
    // Before auditStage, and before any page script: the games read Math.random
    // during their first render.
    await page.addInitScript(seedScript(seed));
    await page.addInitScript(AUDIT_STAGE_SRC);

    await page.goto(`${BASE_URL}${game.path}`, { waitUntil: "networkidle" });

    for (const screen of game.screens) {
      // A screen whose entry control sits outside the stage with no way to
      // scroll to it is not actually reachable: the harness can force the
      // click, a player cannot. Record that, because a later screen passing
      // its own checks means little if nobody can get there.
      let reachedByForcedScroll = false;
      if (screen.enter) {
        reachedByForcedScroll = await page.evaluate(() => {
          const stage = document.querySelector(".kc-stage");
          if (!stage) return false;
          const box = stage.getBoundingClientRect();
          const blocked = [...stage.querySelectorAll("button,a[href],[role='button']")].some((el) => {
            const cs = getComputedStyle(el);
            if (cs.pointerEvents === "none" || cs.visibility === "hidden" || cs.display === "none") return false;
            const r = el.getBoundingClientRect();
            if (!r.width) return false;
            const outside = r.bottom > box.bottom + 1 || r.top < box.top - 1;
            if (!outside) return false;
            for (let p = el.parentElement; p && p !== stage.parentElement; p = p.parentElement) {
              const pcs = getComputedStyle(p);
              if (/auto|scroll/.test(pcs.overflowY + pcs.overflowX) && p.scrollHeight > p.clientHeight) return false;
            }
            return true;
          });
          return blocked;
        });
        await screen.enter(page);
      }
      await page.waitForTimeout(200);

      for (const mode of ["in-page", "fullscreen"]) {
        const suffix = tagScreenshots ? `__seed${seed}` : "";
        try {
          const row = await auditOneScreen({ page, game, gameKey, screen, size, mode, outDir, suffix });
          if (reachedByForcedScroll) row.reachedByForcedScroll = true;
          row.seed = seed;
          rows.push(row);
          console.log(
            `${gameKey} / ${screen.name} / ${size.label} / ${mode}: ${row.pass ? "PASS" : "FAIL"}` +
              (row.contentHiddenBehindScroll?.length
                ? ` (contentHiddenBehindScroll: ${row.contentHiddenBehindScroll.length})`
                : ""),
          );
        } catch (err) {
          rows.push({
            game: gameKey,
            screen: screen.name,
            size: size.label,
            mode,
            seed,
            error: String(err),
          });
          console.error(`${gameKey} / ${screen.name} / ${size.label} / ${mode}: ERROR ${err}`);
        }
      }
    }

    await context.close();
  }

  return rows;
}

/**
 * Audit a game across every seed and keep, per cell, the worst result any seed
 * produced. A game that only survives some draws has not been fixed.
 */
async function auditGameAcrossSeeds(browser, gameKey, game, seeds) {
  const sweeping = seeds.length > 1;
  const worst = new Map();

  for (const seed of seeds) {
    if (sweeping) console.log(`-- seed ${seed}`);
    const rows = await auditGame(browser, gameKey, game, seed, sweeping);
    for (const row of rows) {
      const key = `${row.screen}|${row.size}|${row.mode}`;
      const current = worst.get(key);
      if (!current || isWorse(row, current)) worst.set(key, row);
    }
  }

  const rows = [...worst.values()];
  const outDir = path.join(OUT_DIR, gameKey);
  await writeFile(path.join(outDir, "results.json"), JSON.stringify(rows, null, 2), "utf8");
  return rows;
}

async function main() {
  const args = process.argv.slice(2);
  const seedArg = args.find((a) => a.startsWith("--seeds="));
  const seeds = seedArg
    ? seedArg.slice("--seeds=".length).split(",").map(Number).filter((n) => Number.isFinite(n))
    : [DEFAULT_SEED];

  const requested = args.filter((a) => !a.startsWith("--"));
  const gameKeys = requested.length ? requested : Object.keys(GAMES);

  for (const key of gameKeys) {
    if (!GAMES[key]) {
      console.error(`Unknown game "${key}". Configured: ${Object.keys(GAMES).join(", ")}`);
      process.exitCode = 1;
      return;
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  const allResults = {};
  try {
    for (const key of gameKeys) {
      console.log(`\n=== ${key} ===${seeds.length > 1 ? ` (seeds ${seeds.join(",")}, worst kept)` : ""}`);
      allResults[key] = await auditGameAcrossSeeds(browser, key, GAMES[key], seeds);
    }
  } finally {
    await browser.close();
  }

  const failing = Object.values(allResults)
    .flat()
    .filter((r) => r.error || r.pass === false);
  console.log(`\nDone. ${failing.length} failing/error rows across ${gameKeys.length} game(s).`);
  console.log(`Output: ${path.relative(ROOT, OUT_DIR)}/<game>/results.json + screenshots`);
}

main();
