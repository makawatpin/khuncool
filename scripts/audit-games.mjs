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
 *   node scripts/audit-games.mjs --size=1920x1080 thai-kingdom
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
import { readFileSync } from "node:fs";
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

const AUDIT_COVERED_SRC = await readFile(
  path.join(ROOT, "scripts", "audit-covered.js"),
  "utf8",
);

// Cross-check every covered-control finding against Playwright's own
// actionability check. Off by default because a trial click per finding costs
// a round trip; run it whenever the check or the games change enough that its
// agreement with the real thing is worth re-establishing.
const VERIFY_COVERED = process.argv.includes("--verify-covered");

/**
 * Science Lab Crisis's `won` screen — 10 correct answers in a row — needs to
 * know which option is correct each round, and every question's options are
 * re-shuffled per round (`optionOrder`), so "click index 0" only works before
 * the first shuffle. What holds across every shuffle is the option's TEXT:
 * `source.answer` is 0 for all 30 questions in this file (checked directly,
 * not assumed), so the correct option is always whichever button's text
 * matches that question's first-listed option in the source. Read from the
 * source rather than transcribed by hand — 30 Thai strings copied by eye is
 * exactly the kind of place a typo hides, and re-reading the source survives
 * the question bank changing later where a hardcoded list would not.
 */
const SCIENCE_LAB_ANSWERS = (() => {
  const src = readFileSync(
    path.join(ROOT, "app/media/science/science-lab-crisis/ScienceLabGame.tsx"),
    "utf8",
  );
  const re = /situation:"([^"]*)",question:"[^"]*",options:\[("[^"]*"(?:,"[^"]*")*)\],answer:(\d)/g;
  const map = new Map();
  let m;
  while ((m = re.exec(src))) {
    const [, situation, optionsRaw, answerIndex] = m;
    const options = JSON.parse(`[${optionsRaw}]`);
    map.set(situation, options[Number(answerIndex)]);
  }
  return map;
})();

/**
 * Classroom Objects' word list, for solving its memory game.
 *
 * Read from the source for the same reason Science Lab's answers are: a
 * hand-copied list of 47 Thai/English/emoji triples is where a typo hides, and
 * re-reading survives the list changing later.
 */
const CLASSROOM_WORDS = (() => {
  const src = readFileSync(
    path.join(ROOT, "app/media/english/classroom-objects/ClassroomObjectsApp.tsx"),
    "utf8",
  );
  const re = /\{ emoji: "([^"]*)", en: "([^"]*)", th: "([^"]*)" \}/g;
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push({ emoji: m[1], en: m[2], th: m[3] });
  return out;
})();

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
  // Content shoved above the stage top counts too: it is strictly worse than
  // content behind a scrollbar, since nothing can scroll up to it at all.
  const above = (row.contentAboveStage || []).length;
  return [row.pass === false ? 2 : 1, hidden + above];
}

function isWorse(candidate, current) {
  const a = severity(candidate);
  const b = severity(current);
  return a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1];
}

// Responsive sizes x 2 modes, per docs/media-stage-contract.md checklist.
const ALL_SIZES = [
  { label: "375x812-mobile-portrait", width: 375, height: 812 },
  { label: "844x390-mobile-landscape", width: 844, height: 390 },
  // A big phone sideways, and the reason this row exists rather than being one
  // more device for the sake of it: the stage's "short" shape was gated at
  // `height < 440px`, and this viewport makes the fullscreen stage exactly
  // 440px tall. It missed the gate by nothing at all, so every game fell back
  // to its desktop layout on the screen a teacher gets when they press
  // fullscreen on that phone — Family Tree's diagram came out at scale 0.27
  // against 0.66 on a phone 10px shorter.
  //
  // The gate moved to 480px, but nothing in this suite could have caught that
  // regression or can confirm the fix: stage heights across the other six
  // sizes are 304, 390, 396, 540, 617, 768, 800, 1024 and 1080, and not one of
  // them lands between 440 and 480. The whole band was untested. It is tested
  // now, which is what stops the same thing happening at the next threshold.
  { label: "956x440-mobile-landscape-tall", width: 956, height: 440 },
  { label: "768x1024-tablet-portrait", width: 768, height: 1024 },
  { label: "1024x768-tablet-landscape", width: 1024, height: 768 },
  { label: "1280x800-desktop", width: 1280, height: 800 },
  { label: "1920x1080-projector", width: 1920, height: 1080 },
];
const sizeArg = process.argv.find((argument) => argument.startsWith("--size="));
const requestedSize = sizeArg?.slice("--size=".length);
const SIZES = requestedSize ? ALL_SIZES.filter((size) => size.label.startsWith(requestedSize)) : ALL_SIZES;

const FULLSCREEN_LABEL = "เต็มจอ";

/**
 * Per-game config.
 *
 * `path` — route under BASE_URL.
 * `screens` — ordered sub-screens to capture. Each has a `name` and an
 * optional `enter(page)` step that clicks/advances from the previous screen
 * (screens run in order, state carries over — same as a real play session).
 * `warmup(page)` — optional, runs after `enter` and before measuring, to drive
 * the screen to the tallest state it can reach. See below.
 * `expect` — optional selector that must match once `enter`/`warmup` are done.
 * Required in practice for any screen reached by playing rather than by
 * clicking a menu, since those depend on constants that can drift; without it
 * a drifted walk measures the wrong screen under the right name and passes.
 *
 * Warmup: measure the worst state, not the first one
 * --------------------------------------------------
 * `enter` lands on a screen and the audit measured it right there, which is
 * the screen at its emptiest: no answer given yet, no result card, no history.
 * That is the SHORTEST a play screen is ever going to be, and it is the one
 * state a class never sees for more than a few seconds.
 *
 * Sound Wheel is what showed this up. Measured cold, its play screen hid 2 of
 * 3 controls and the wheel was already clipped 18px off the top of the stage.
 * Spun to the history cap of 12 — a normal few minutes of class — it hid 5 of
 * 6, and the three it added are the ones that score the round: listen again,
 * try again, and got it right. Every number the audit had ever reported for
 * that screen was of a state nobody plays in.
 *
 * So a screen whose height grows with play declares how to grow it. This costs
 * real time (the warmup runs once per viewport, and Sound Wheel's spin
 * animation alone is ~5s), which is the price of the numbers describing the
 * game rather than its first frame.
 */
// `enter` steps click by a regex substring match on accessible name — button
// text is often split across sibling text/icon nodes, which makes the exact
// accessible name unpredictable (spacing, icon placement).
const click = (text) => async (page) => {
  await page.getByRole("button", { name: text }).click();
};

/** Vocabulary Arcade's modes are siblings, reached back through the pickers. */
const pickVocabMode = (mode) => async (page) => {
  await page.getByRole("button", { name: /เปลี่ยนหมวด/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /Animals/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: mode }).click();
};

/** Family Tree's minigames are siblings, so each is reached via the hub. */
const backToHub = (text) => async (page) => {
  await page.getByRole("button", { name: /มินิเกม/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: text }).click();
};

/**
 * Result screens reached by finishing a round, not by clicking through a menu.
 * media-stage-remaining.md §2 costed these out in two groups.
 *
 * Group A — any answer, right or wrong, advances the round, so which button
 * gets clicked does not matter. `clickFirst` just clicks the first match in
 * `selector` on a fixed schedule: `count` times, `waitMs` after each for the
 * round's own timeout to fire (chosen from the game's slower branch, plus a
 * buffer) — until the round counter reaches the game's own length and the
 * result screen replaces the selector's targets. Reused across asean-matching,
 * digital-sort, is-are-sorting and talk-card because all four share this
 * shape; only the selector, count and wait differ.
 *
 * Deliberately NOT `{ force: true }`. Force skips the actionability check and
 * dispatches at the element's centre point regardless of what is on top of it,
 * so a control covered by another element takes the click silently and the
 * walk just does not advance. That is precisely how is-are-sorting hid a
 * question card sitting on top of both answer buttons at 844x390 — the game
 * was unplayable at that size and twelve force-clicks left the round counter
 * at 1/12 without a word. Unforced, Playwright refuses and names the
 * intercepting element, which is the bug report writing itself.
 */
const clickFirst = (selector, count, waitMs) => async (page) => {
  for (let round = 0; round < count; round++) {
    await page.locator(selector).first().click();
    if (waitMs) await page.waitForTimeout(waitMs);
  }
};


/**
 * Phonics Bingo's win screen — written off earlier as un-drivable because
 * winning means hearing a sound and tapping the right square, and the harness
 * has no ears. The way in is the game's own "👀 ครูดูเฉลย" button: it is there
 * so a teacher can see which sound was called, and with it on, the called
 * sound is rendered as /xx/ in the panel and can simply be read.
 *
 * The card is only finished when EVERY square is marked, not on one line, so
 * this fills all sixteen. Two details the first attempt got wrong and that the
 * comment exists to save the next person:
 *
 *   - a square counts as marked by its border colour, not by its markup. Every
 *     square carries the same three children whether it is marked or not, so a
 *     structural test reports the whole card as finished on the first frame.
 *   - the called sound is sometimes not on the card, or is one already marked.
 *     There is no "skip" control; tapping any unmarked square is what advances
 *     to the next call, at the cost of a wrong answer nobody is scoring.
 *
 * Measured at the default seed: sixteen squares in 19 taps and 4 of those
 * forced skips, comfortably inside the cap.
 */
const fillBingoCard = () => async (page) => {
  const CELLS = '[class*="__card"] button';
  const MARKED = /rgb\(255, 176, 32\)|rgb\(182, 243, 228\)/;

  await page.getByRole("button", { name: /ครูดูเฉลย/ }).click();
  await page.waitForTimeout(400);

  for (let step = 0; step < 90; step++) {
    const s = await page.evaluate(
      ({ cells, marked }) => {
        const body = document.querySelector(".kc-stage-body");
        if (body.querySelector('[class*="__result"]')) return { won: true };
        const call = [...body.querySelectorAll("*")]
          .map((e) => (e.children.length ? "" : (e.textContent || "").trim()))
          .find((t) => /^\/[a-z]+\/$/.test(t));
        const buttons = [...body.querySelectorAll(cells)];
        return {
          won: false,
          call,
          letters: buttons.map((b) => (b.textContent || "").trim().replace(/[^a-z]/gi, "")),
          marked: buttons.map((b) => new RegExp(marked).test(getComputedStyle(b).borderTopColor)),
        };
      },
      { cells: CELLS, marked: MARKED.source },
    );
    if (s.won) return;
    if (!s.call) throw new Error("phonics-bingo: no sound is revealed — did the peek button toggle off?");

    const want = s.call.replace(/\//g, "");
    let idx = s.letters.findIndex((t, i) => t === want && !s.marked[i]);
    if (idx < 0) idx = s.marked.findIndex((m) => !m);
    if (idx < 0) throw new Error("phonics-bingo: every square is marked but no result screen appeared");

    await page.locator(CELLS).nth(idx).click();
    await page.waitForTimeout(850);
  }
  throw new Error("phonics-bingo: did not finish the card within 90 taps");
};

/**
 * Group B — losing is easier than winning (3 lives, 10 missions to win all of
 * them), and per-round the `lost` screen already appears after a single wrong
 * answer — the 3 lives only decide whether the NEXT click goes to another
 * mission or to the final "gameover" summary. So the shortcut is not "lose
 * three times", it is "answer wrong once", and clicking the same option every
 * round gets there: Math.random is seeded per the audit's default, so which
 * option sits first is fixed for a given seed but not guaranteed wrong, and a
 * win just costs one extra round while the loop tries again. Verified this
 * reaches `lost` well inside the 10-mission cap at the default seed before
 * relying on it.
 */
const loseOnFirstWrong = ({ optionSelector, verifyWaitMs, lostSelector, advanceName }) => async (page) => {
  for (let round = 0; round < 10; round++) {
    await page.locator(optionSelector).first().click({ force: true });
    await page.waitForTimeout(verifyWaitMs);
    if (await page.locator(lostSelector).count()) return;
    await page.getByRole("button", { name: advanceName }).click();
    await page.waitForTimeout(250);
  }
};

/** Math Adventure keeps a question in place after a wrong answer, so trying
 * each of its three unique choices is deterministic and still exercises the
 * encouraging retry state. The correct choice advances after 850ms. */
const solveMathAdventure = (count = 10) => async (page) => {
  for (let round = 0; round < count; round++) {
    const options = page.locator('[class*="__answerGrid"] button');
    let solved = false;
    for (let i = 0; i < await options.count(); i++) {
      await options.nth(i).click({ force: true });
      await page.waitForTimeout(120);
      if (await page.locator('[class*="__correctMessage"]').count()) {
        solved = true;
        await page.waitForTimeout(900);
        break;
      }
    }
    if (!solved) throw new Error(`math-adventure: question ${round + 1} was not solved`);
  }
};

/** Thai Kingdom uses three-choice questions plus a two-piece tap/drag word
 * builder. Try every choice for deterministic progress; for arrange screens,
 * tapping both native buttons exercises the touch-equivalent interaction. */
const solveThaiKingdom = (count = 10) => async (page) => {
  for (let round = 0; round < count; round++) {
    const arrange = page.locator('[data-question-kind="arrange"] button[draggable="true"]');
    if (await arrange.count()) {
      for (let i = 0; i < await arrange.count(); i++) await arrange.nth(i).click({ force: true });
      await page.waitForTimeout(1000);
      continue;
    }
    const options = page.locator('[class*="__answerGrid"] button');
    let solved = false;
    for (let i = 0; i < await options.count(); i++) {
      await options.nth(i).click({ force: true });
      await page.waitForTimeout(120);
      if (await page.locator('[class*="__correctMessage"]').count()) {
        solved = true;
        await page.waitForTimeout(950);
        break;
      }
    }
    if (!solved) throw new Error(`thai-kingdom: question ${round + 1} was not solved`);
  }
};

const GAMES = {
  "phonics-bingo": {
    path: "/media/english/phonics-bingo",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มเล่น/) },
      { name: "won", enter: fillBingoCard(), expect: '[class*="__result"]' },
    ],
  },
  "digital-sort": {
    path: "/media/computer/digital-sort",
    screens: [
      { name: "home" },
      { name: "play", enter: click(/เริ่มภารกิจ/) },
      // Either bin sorts the current card and advances — correct or wrong,
      // both call `sort()`, and the two bin buttons are themselves the click
      // targets (`onClick={() => sort(kind)}`), so no drag simulation is
      // needed despite the tool needed for it. 12 cards, matching ROUND_SIZE.
      {
        name: "result",
        enter: clickFirst('[class*="__bin"]', 12, 1500),
        expect: '[data-stage="result"]',
      },
    ],
  },
  "coding-maze": {
    path: "/media/computer/coding-maze",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มภารกิจ/) },
      {
        name: "lost",
        // Every level's solution turns at least once (buildLevel always bakes
        // in a direction change), and this level's very first path segment
        // already matches the robot's starting facing — so a queue of nothing
        // but "forward" follows the correct path for exactly one step and
        // then walks into a wall on the second. Queuing more than needed is
        // harmless; excess commands past the crash are simply never run.
        async enter(page) {
          for (let i = 0; i < 3; i++) {
            await page.getByRole("button", { name: /เดินหน้า/ }).click({ force: true });
          }
          await page.getByRole("button", { name: /RUN/ }).click();
          await page.waitForTimeout(2000);
        },
        expect: '[data-stage="lost"]',
      },
      {
        name: "won",
        // Level 1's path, read off its own definition (buildLevel("ด่าน 1", 5,
        // [{dir:1,steps:1},{dir:2,steps:2},{dir:1,steps:2},{dir:2,steps:2}])):
        // the robot starts facing dir 1, so the first segment costs no turn,
        // then each direction change is one command (`(dir-from+4)%4` of 1
        // turns right, 3 turns left — never the 2-cost U-turn here). Resets
        // first: the `lost` screen above ends with the robot crashed.
        async enter(page) {
          await page.getByRole("button", { name: /ลองใหม่/ }).click();
          await page.waitForTimeout(300);
          const seq = ["เดินหน้า", "เลี้ยวขวา", "เดินหน้า", "เดินหน้า", "เลี้ยวซ้าย", "เดินหน้า", "เดินหน้า", "เลี้ยวขวา", "เดินหน้า", "เดินหน้า"];
          for (const label of seq) {
            await page.getByRole("button", { name: new RegExp(label) }).click();
          }
          await page.getByRole("button", { name: /RUN/ }).click();
          await page.waitForTimeout(5500);
        },
        expect: '[data-stage="won"]',
      },
    ],
  },
  "typing-defense": {
    path: "/media/computer/typing-defense",
    screens: [
      { name: "home" },
      { name: "select", enter: click(/เริ่มฝึกพิมพ์/) },
      {
        name: "play",
        // The start button runs a countdown before the board appears, so this
        // waits it out rather than measuring the countdown overlay. The board
        // itself was never measured before.
        async enter(page) {
          await page.getByRole("button", { name: /เริ่มฝึก|เริ่มด่าน/ }).click();
          await page.waitForTimeout(4200);
        },
      },
    ],
  },
  "asean-matching": {
    path: "/media/social-studies/asean-matching",
    screens: [
      { name: "home" },
      { name: "play", enter: click(/เริ่มภารกิจ/) },
      // Any of the four choices advances — `choose()` runs the same timeout
      // either way — so the first is clicked every round. 11 questions.
      {
        name: "result",
        enter: clickFirst('[class*="__answers"] button', 11, 1500),
        expect: '[data-stage="result"]',
      },
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
    // Four minigames hang off the hub, and for a long time this config walked
    // only the first. The other three were never measured at all, which is why
    // "0 hard failures" was a narrower claim than it sounded. Each one is
    // reached by returning to the hub first, so `enter` clicks twice.
    screens: [
      { name: "intro" },
      { name: "hub", enter: click(/เริ่มเล่น/) },
      { name: "plant-tree", enter: click(/ปลูกต้นไม้ครอบครัว/) },
      { name: "matching", enter: backToHub(/จับคู่คำศัพท์/) },
      { name: "listening", enter: backToHub(/ฟังแล้วเดา/) },
      { name: "fill-blank", enter: backToHub(/เติมคำในเรื่อง/) },
    ],
  },
  "vocabulary-arcade": {
    path: "/media/english/vocabulary-arcade",
    // "triangle ruler" is the longest word across all ten categories, at 14
    // characters against a median of about 5. Every answer gets it, so the
    // options are measured at the width the game can actually produce rather
    // than at whatever this run happened to draw.
    stress: { selector: ".kc-vocab-options button", text: "triangle ruler" },
    screens: [
      { name: "intro" },
      { name: "category-picker", enter: click(/เลือกหมวดคำศัพท์/) },
      { name: "mode-picker", enter: click(/Animals/) },
      // The four answer modes lay out differently — Word → Picture answers with
      // pictures, Spelling Builder with letter tiles — so measuring only
      // Picture Match left three layouts unchecked.
      { name: "play-picture", enter: click(/Picture Match/) },
      { name: "play-word", enter: pickVocabMode(/Word → Picture/) },
      { name: "play-spelling", enter: pickVocabMode(/Spelling Builder/) },
      { name: "play-mixed", enter: pickVocabMode(/Mixed Challenge/) },
      // 20 questions, any answer advances — `next()` runs on the same ~1.2s
      // schedule whether the pick was right or wrong, so no solving needed,
      // only patience.
      //
      // Restarts in Picture Match rather than carrying on from play-mixed:
      // Mixed Challenge rotates the answer UI per question, and the spelling
      // rounds have letter tiles instead of `.kc-vocab-options`, so the walk
      // stalls the first time one comes up. One mode all the way through keeps
      // a single selector valid for all 20.
      {
        name: "result",
        async enter(page) {
          await pickVocabMode(/Picture Match/)(page);
          await page.waitForTimeout(400);
          await clickFirst(".kc-vocab-options button", 20, 1400)(page);
        },
        // A global class, not a CSS-module one — this screen is `.screen
        // kc-vocab-result`, so `[class*="__result"]` matches nothing.
        expect: ".kc-vocab-result",
      },
    ],
  },
  "classroom-objects": {
    path: "/media/english/classroom-objects",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มเล่น/) },
      {
        name: "result",
        // A memory game, solved rather than brute-forced. Every card's face
        // text is already in the DOM while it is face down — the flip is a CSS
        // transform, not a render swap — so the whole board can be read before
        // touching it, and the pairs matched with zero wrong flips.
        //
        // The two halves of a pair share no text: one card shows the English
        // word, the other the emoji and the Thai. Pairing therefore comes from
        // the game's own word list, matched on EXACT equality after stripping
        // the card-back letter. Not `includes` — the list holds book/notebook,
        // pen/pencil and paper/paper clip, so substring matching pairs the
        // wrong cards and the round never ends.
        async enter(page) {
          const cardSel = '[class*="__grid"] > button';
          const texts = (await page.locator(cardSel).allTextContents()).map((t) => t.trim());
          const byWord = new Map();
          texts.forEach((t, i) => {
            const w = CLASSROOM_WORDS.findIndex(
              (x) => t.slice(1) === x.en || t.slice(1) === x.emoji + x.th,
            );
            if (w < 0) return;
            if (!byWord.has(w)) byWord.set(w, []);
            byWord.get(w).push(i);
          });
          // Re-queried on every click: React replaces the card nodes as they
          // flip, so element handles detach and nth() shifts underneath.
          const clickByText = async (want) => {
            const all = page.locator(cardSel);
            const now = await all.allTextContents();
            const i = now.findIndex((t) => t.trim() === want);
            if (i >= 0) await all.nth(i).click();
          };
          for (const [, pair] of byWord) {
            if (pair.length !== 2) continue;
            // The board empties the moment the last pair lands, and the loop
            // must not keep clicking into the result screen.
            if (!(await page.locator(cardSel).count())) break;
            await clickByText(texts[pair[0]]);
            await page.waitForTimeout(220);
            await clickByText(texts[pair[1]]);
            await page.waitForTimeout(900);
          }
          await page.waitForTimeout(1200);
        },
        expect: '[class*="__result"]',
      },
    ],
  },
  "is-are-sorting": {
    path: "/media/english/is-are-sorting",
    screens: [
      { name: "intro" },
      { name: "play", enter: click(/เริ่มเล่น/) },
      // IS or ARE, either advances via `next()` on the same schedule.
      // QUESTION_COUNT = 12.
      {
        name: "result",
        enter: clickFirst('[class*="__answers"] button', 12, 2200),
        expect: '[class*="__resultScreen"]',
      },
    ],
  },
  "talk-card": {
    path: "/media/english/talk-card",
    screens: [
      { name: "setup" },
      { name: "play", enter: click(/เริ่มสุ่มการ์ด/) },
      // `go(1)` advances synchronously — no round timeout to wait out, just the
      // card's own animation. Default deck size is 10 (`count` state). The
      // next/finish button carries no CSS-module class (inline styles only),
      // so it is found by accessible name rather than by `clickFirst`'s
      // selector-based lookup.
      {
        name: "result",
        async enter(page) {
          for (let i = 0; i < 10; i++) {
            await page.getByRole("button", { name: /การ์ดใบถัดไป|จบเกม/ }).click();
            await page.waitForTimeout(400);
          }
        },
        expect: ".kc-talk-result",
      },
    ],
  },
  "sound-wheel": {
    path: "/media/english/sound-wheel",
    screens: [
      { name: "setup" },
      {
        name: "play",
        enter: click(/เริ่มเล่น/),
        // The result card only exists after a spin, and the history grows one
        // chip per spin to a cap of 12. Both sit in the right-hand column, so
        // the column measured on arrival is the shortest it ever is. Spin to
        // the cap: that is the state the screen spends the lesson in.
        async warmup(page) {
          for (let i = 0; i < 12; i++) {
            await page
              .getByRole("button", { name: /หมุนวงล้อ|หมุนอีกครั้ง/ })
              .click({ force: true });
            // spin runs 4200-5100ms, then a 260ms timer speaks the word
            await page.waitForTimeout(5400);
          }
        },
      },
    ],
  },
  "math-adventure": {
    path: "/media/mathematics/math-adventure",
    stress: {
      selector: '[data-question-kind="word-problem"] h2',
      text: "มีดินสอ 12 แท่ง ได้เพิ่มอีก 8 แท่ง ตอนนี้มีดินสอทั้งหมดกี่แท่ง",
    },
    screens: [
      { name: "home" },
      { name: "practice-settings", enter: click(/ฝึกทำ/) },
      { name: "practice", enter: click(/เริ่มภารกิจ/), expect: '[data-stage="practice"]' },
      { name: "practice-result", enter: solveMathAdventure(10), expect: '[data-stage="result"]' },
      {
        name: "lesson",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /เรียนรู้/ }).click();
        },
        expect: '[data-stage="lesson"]',
      },
      {
        name: "lesson-number-line-10",
        async enter(page) {
          await page.getByRole("tab", { name: /เส้นจำนวน 0–20/ }).click();
          const nextExample = page.getByRole("button", { name: "ตัวอย่างถัดไป" });
          for (let index = 1; index < 10; index += 1) await nextExample.click();
        },
        expect: 'text="ตัวอย่าง 10/10"',
      },
      {
        name: "train-settings",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /รถไฟเก็บดาว/ }).click();
          await page.getByRole("button", { name: "แบ่งทีม" }).click();
          await page.getByRole("button", { name: "3 ทีม" }).click();
        },
        expect: '[data-stage="settings"]',
      },
      { name: "train", enter: click(/เริ่มภารกิจ/), expect: '[data-stage="train"]' },
      { name: "train-result", enter: solveMathAdventure(10), expect: '[data-stage="result"]' },
      {
        name: "quiz-settings",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /แบบทดสอบ/ }).click();
        },
        expect: '[data-stage="settings"]',
      },
      { name: "quiz", enter: click(/เริ่มภารกิจ/), expect: '[data-stage="quiz"]' },
      { name: "quiz-long", enter: solveMathAdventure(3), expect: '[data-question-kind="word-problem"]' },
      { name: "quiz-result", enter: solveMathAdventure(7), expect: '[data-stage="result"]' },
    ],
  },
  "thai-kingdom": {
    path: "/media/thai/thai-kingdom",
    stress: {
      selector: '[data-stage="question"] h2',
      text: "ฟังเสียงแล้วเลือกพยัญชนะต้นที่ถูกต้องจากตัวเลือกต่อไปนี้",
    },
    screens: [
      { name: "home" },
      { name: "practice-settings", enter: click(/ฝึกทำ/) },
      { name: "practice", enter: click(/เริ่มภารกิจ/), expect: '[data-stage="practice"]' },
      { name: "practice-result", enter: solveThaiKingdom(10), expect: '[data-stage="result"]' },
      {
        name: "lesson-consonant",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /เรียนรู้/ }).click();
        },
        expect: '[data-stage="lesson"]',
      },
      ...[0, 1, 2].map((vowelIndex) => ({
        name: `lesson-vowel-${["aa", "ii", "uu"][vowelIndex]}`,
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /เรียนรู้/ }).click();
          await page.getByRole("tab", { name: /ตำแหน่งสระ/ }).click();
          for (let step = 0; step < vowelIndex; step += 1) {
            await page.getByRole("button", { name: "ตัวอย่างถัดไป" }).click();
          }
        },
        expect: '[data-stage="lesson"]',
      })),
      {
        name: "lesson-builder",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /เรียนรู้/ }).click();
          await page.getByRole("tab", { name: /โรงงานสร้างคำ/ }).click();
        },
        expect: '[data-stage="lesson"]',
      },
      {
        name: "train-settings",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /รถไฟเก็บคำ/ }).click();
          await page.getByRole("button", { name: "แบ่งทีม" }).click();
          await page.getByRole("button", { name: "3 ทีม" }).click();
        },
        expect: '[data-stage="settings"]',
      },
      { name: "train", enter: click(/เริ่มภารกิจ/), expect: '[data-stage="train"]' },
      { name: "train-result", enter: solveThaiKingdom(10), expect: '[data-stage="result"]' },
      {
        name: "quiz-settings",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูเกม" }).click();
          await page.getByRole("button", { name: /แบบทดสอบ/ }).click();
        },
        expect: '[data-stage="settings"]',
      },
      { name: "quiz", enter: click(/เริ่มภารกิจ/), expect: '[data-stage="quiz"]' },
      { name: "quiz-result", enter: solveThaiKingdom(10), expect: '[data-stage="result"]' },
    ],
  },
  "math-bomb-defusal": {
    path: "/media/mathematics/math-bomb-defusal",
    screens: [
      { name: "intro" },
      { name: "setup", enter: click(/ตั้งค่าภารกิจ/) },
      { name: "game", enter: click(/เริ่ม 10 ภารกิจ/) },
      // `won` needs 10 correct missions in a row and is the expensive branch;
      // `lost` needs exactly one wrong wire, which is what this measures.
      {
        name: "lost",
        enter: loseOnFirstWrong({
          optionSelector: '[class*="__wireCard"]',
          // 1550ms verify sequence + a .65s "explode" keyframe that starts the
          // moment the overlay appears — measuring before it settles catches
          // the icon transiently scaled to 1.45x, inflating the card's height
          // and reporting overflow that is not there at rest.
          verifyWaitMs: 2500,
          lostSelector: '[class*="__failure"]',
          advanceName: /ภารกิจต่อไป|ดูผลภารกิจ/,
        }),
        expect: '[class*="__failure"]',
      },
      {
        name: "won",
        // 10 correct missions in a row — unlike Science Lab Crisis's fixed
        // answer index, correctness here is arithmetic: each wire shows an
        // equation and the mission prompt says whether the target wire's
        // value is the largest or the smallest of the four. Computed from
        // what is on screen each round rather than from the source, since the
        // wire ORDER is shuffled per round (`wireOrder`) but the equations
        // and the prompt are exactly what a player reads.
        async enter(page) {
          // `lost` above leaves the game mid-run, and the button back to
          // setup (`.changeButton`) is `display:none` in portrait — a full
          // reload sidesteps that rather than depending on a control this
          // shape hides on purpose.
          await page.reload({ waitUntil: "networkidle" });
          await page.getByRole("button", { name: /ตั้งค่าภารกิจ/ }).click();
          await page.waitForTimeout(200);
          await page.getByRole("button", { name: /เริ่ม 10 ภารกิจ/ }).click();
          await page.waitForTimeout(200);
          for (let round = 0; round < 10; round++) {
            const wantMax = /มากที่สุด/.test(await page.locator('[class*="__mission"] strong').textContent());
            // Direct child only: `.wireCard` also has a decorative, empty
            // `<b/>` two levels down inside its aria-hidden `.cutter` icon.
            const equations = await page.locator('[class*="__wireCard"] > b').allTextContents();
            const values = equations.map((eq) => {
              const [, a, op, b] = eq.match(/(-?\d+)\s*([×÷+−-])\s*(-?\d+)/);
              const x = Number(a), y = Number(b);
              return { "×": x * y, "÷": x / y, "+": x + y, "−": x - y, "-": x - y }[op];
            });
            const targetIndex = values.reduce(
              (best, v, i) => ((wantMax ? v > values[best] : v < values[best]) ? i : best),
              0,
            );
            await page.locator('[class*="__wireCard"]').nth(targetIndex).click();
            await page.waitForTimeout(2500); // verify sequence + explode settle, per the `lost` screen's own note
            await page.getByRole("button", { name: /ภารกิจต่อไป|ดูผลภารกิจ/ }).click();
            await page.waitForTimeout(300);
          }
        },
        // The all-10 summary card, not a single mission's win overlay: answer
        // one wire wrong and the run ends on `.finalCard` too, but reading
        // MISSION FAILED. Both the card and the text, so a silently-lost run
        // cannot pass as a won one.
        expect: '[class*="__finalCard"]:has-text("MISSION COMPLETE")',
      },
    ],
  },
  "science-lab-crisis": {
    path: "/media/science/science-lab-crisis",
    screens: [
      { name: "intro" },
      { name: "setup", enter: click(/รับบัตรนักวิจัย/) },
      { name: "game", enter: click(/เริ่ม 10 ภารกิจ/) },
      {
        name: "lost",
        enter: loseOnFirstWrong({
          optionSelector: '[class*="__options"] button',
          verifyWaitMs: 1200, // 900ms verify + buffer
          lostSelector: '[class*="__fail"]',
          advanceName: /ภารกิจต่อไป|ดูสรุปภารกิจ/,
        }),
        expect: '[class*="__fail"]',
      },
      {
        name: "won",
        // The doc's costing calls this "won" but means all 10 missions
        // correct — the final summary screen, not a single round's overlay.
        // The `lost` screen above leaves the previous mission wrong (2/3
        // lives), so this restarts clean.
        async enter(page) {
          // `lost` above leaves the game mid-run, past the setup screen, so
          // "รับบัตรนักวิจัย" (the intro's own start button) is gone; the
          // in-game settings button returns to setup instead. By text rather
          // than accessible name/role — role-based lookup intermittently
          // missed this exact button (present in a plain text search every
          // time it was checked, absent from getByRole often enough to be a
          // real flake rather than a one-off), and was not worth chasing
          // further when the plain-text path is reliable.
          await page.locator("button", { hasText: "ตั้งค่า" }).click();
          await page.waitForTimeout(200);
          await page.getByRole("button", { name: /เริ่ม 10 ภารกิจ/ }).click();
          await page.waitForTimeout(200);
          for (let round = 0; round < 10; round++) {
            const situation = await page.locator('[class*="__missionLine"] strong').textContent();
            const correctText = SCIENCE_LAB_ANSWERS.get(situation.trim());
            if (!correctText) throw new Error(`No answer on file for situation: "${situation}"`);
            await page.locator('[class*="__options"] button', { hasText: correctText }).click();
            await page.waitForTimeout(1200);
            await page.getByRole("button", { name: /ภารกิจต่อไป|ดูสรุปภารกิจ/ }).click();
            await page.waitForTimeout(250);
          }
        },
        // Same shape as math-bomb's: the summary card is also where a lost run
        // ends, so the win banner is what separates them.
        //
        // Matched on `__result`, not `__final`, because `styles.final` does not
        // exist in this game's CSS module — only `.finalButtons` does. The JSX
        // still writes `${styles.result} ${styles.final}`, so the card ships
        // with the literal class `undefined` and the intended modifier never
        // applied. Worth fixing in the game; this selector just has to match
        // what is actually rendered.
        expect: '[class*="__result"]:has-text("ALL SYSTEMS SECURED")',
      },
    ],
  },
  "motion-lab": {
    path: "/media/science/motion-lab",
    screens: [
      { name: "intro" },
      { name: "lab", enter: click(/เข้าสู่ห้องทดลอง/) },
      { name: "quiz", enter: click(/โจทย์จากการทดลอง/) },
      // The last of the 4 quiz questions, with an answer picked: the only
      // state where the explanation panel is visible and the nav button reads
      // "ปรับการทดลองใหม่" instead of "ข้อต่อไป" — a different layout that the
      // first-question screen above never exercises. "ข้อต่อไป" carries no
      // `disabled` tied to whether an answer was picked, so advancing needs no
      // choice made along the way.
      {
        name: "quiz-last",
        async enter(page) {
          for (let i = 0; i < 3; i++) {
            await page.getByRole("button", { name: "ข้อต่อไป →", exact: true }).click();
            await page.waitForTimeout(150);
          }
          await page.locator('[class*="__choices"] button').first().click();
        },
        // The nav button only reads this on the last question — on any earlier
        // one it is still "ข้อต่อไป", which is exactly the screen this row is
        // meant to be different from. `.explain` confirms an answer is picked.
        expect: 'button:has-text("ปรับการทดลองใหม่")',
      },
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

  let result = await page.evaluate((min) => window.auditStage({ min }), 11);

  // Second pass with the game's longest possible label forced into every
  // answer. Seeding fixed which items are drawn but not how long they are, and
  // a game whose vocabulary runs from "bee" to "triangle ruler" can pass every
  // run on the short words and still overflow the first time a class draws the
  // long one. The worst of the two passes is what gets reported.
  if (game.stress) {
    const applied = await page.evaluate(({ selector, text }) => {
      const originals = [];
      // Only swap a real word. The picture-answer mode leaves its label span
      // empty, so "first span with any text" picked the emoji and the pass
      // replaced a picture with a word the game never shows there, reporting
      // an overflow that cannot happen. Two or more letters is a label.
      const LABEL = /[A-Za-z฀-๿]{2,}/;
      for (const el of document.querySelectorAll(selector)) {
        const span = [...el.querySelectorAll("span")].find((s) =>
          LABEL.test((s.textContent || "").trim()),
        );
        if (!span) continue;
        const target = span;
        originals.push([target, target.textContent]);
        target.textContent = text;
      }
      window.__kcStress = originals;
      return originals.length;
    }, game.stress);

    if (applied) {
      await page.waitForTimeout(150);
      const stressed = await page.evaluate((min) => window.auditStage({ min }), 11);
      if (isWorse(stressed, result)) {
        result = stressed;
        result.stressedBy = game.stress.text;
      }
      await page.evaluate(() => {
        for (const [el, text] of window.__kcStress || []) el.textContent = text;
        window.__kcStress = null;
      });
    }
  }

  const fileBase = `${screen.name}__${size.label}__${mode}${suffix}`;
  const screenshotPath = path.join(outDir, `${fileBase}.png`);
  const stageHandle = await page.$(".kc-stage, .kc-game, [class*='__shell'], [class*='__lab'], [class*='__game']");
  if (stageHandle) {
    await stageHandle.screenshot({ path: screenshotPath });
  } else {
    await page.screenshot({ path: screenshotPath, fullPage: false });
  }


  // Can each control actually be pressed?
  // -------------------------------------
  // Runs after the screenshot, because unlike every check in auditStage() this
  // one has to scroll controls into view — that is the whole point of it, see
  // the header of scripts/audit-covered.js — and the screenshot has to show the
  // screen at the reset scroll position.
  //
  // Both preconditions matter and both were found by getting them wrong:
  // the mouse has to be parked, or a hovered button lifts out from under
  // whatever covers it and the pass under-reports; and the scroll has to be
  // back at the reset position, so the pass starts from the same place the
  // screenshot and the other checks describe.
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    document.querySelectorAll("*").forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
      if (el.scrollLeft) el.scrollLeft = 0;
    });
  });
  await page.waitForTimeout(120);
  const covered = await page.evaluate(() => window.auditCoveredControls());

  if (VERIFY_COVERED && covered.coveredControls?.length) {
    // Ask Playwright the same question about the same elements. A finding it
    // disagrees with is a false positive, and the last attempt at this check
    // died of thirty-five of them.
    const tagged = await page.evaluate(async () => {
      const marked = [];
      for (const el of document.querySelectorAll("[data-kc-covered]")) el.removeAttribute("data-kc-covered");
      // Async since it samples over time; without the await this is a Promise
      // and the loop below throws "not iterable" — which turned every row that
      // HAD a finding into an ERROR row and hid the findings entirely.
      const r = await window.auditCoveredControls();
      // Re-derive the same set, this time leaving a marker on each element so a
      // locator can address it.
      const stage = document.querySelector(".kc-stage") || document.querySelector(".kc-game");
      const controls = [...stage.querySelectorAll("button,a[href],input,select,textarea,[role='button']")];
      let i = 0;
      for (const row of r.coveredControls) {
        const el = controls.find(
          (c) => !c.hasAttribute("data-kc-covered") &&
            (c.textContent || c.getAttribute("aria-label") || c.tagName).trim().slice(0, 24) === row.control,
        );
        if (el) { el.setAttribute("data-kc-covered", String(i)); marked.push(i); }
        i++;
      }
      return marked;
    });
    covered.playwrightVerdict = [];
    for (const i of tagged) {
      const loc = page.locator(`[data-kc-covered="${i}"]`);
      let agrees;
      try { await loc.click({ trial: true, timeout: 1500 }); agrees = false; }
      catch { agrees = true; }
      covered.playwrightVerdict.push({ index: i, playwrightAlsoRefuses: agrees });
    }
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("[data-kc-covered]")) el.removeAttribute("data-kc-covered");
    });
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
    controlsTested: covered.controlsTested ?? null,
    coveredControls: covered.coveredControls || [],
    coveredByBlocker: covered.coveredByBlocker || [],
    notOnScreenAfterScroll: covered.notOnScreenAfterScroll || [],
    ...(covered.playwrightVerdict ? { coveredPlaywrightVerdict: covered.playwrightVerdict } : {}),
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
    await page.addInitScript(AUDIT_COVERED_SRC);

    await page.goto(`${BASE_URL}${game.path}`, { waitUntil: "networkidle" });

    for (const screen of game.screens) {
      // A screen whose entry control sits outside the stage with no way to
      // scroll to it is not actually reachable: the harness can force the
      // click, a player cannot. Record that, because a later screen passing
      // its own checks means little if nobody can get there.
      let reachedByForcedScroll = false;
      // Getting onto the screen is its own failure surface, separate from
      // measuring it. A throw here used to escape the per-mode try/catch below
      // and abort the entire run — one bad locator in one game losing every
      // game queued behind it. Both modes get an error row and the walk moves
      // on to the next screen instead.
      try {
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

        // Grow the screen to its tallest reachable state before anything is
        // measured, so both modes below see the state a class actually plays in
        // rather than the frame the screen opens on.
        if (screen.warmup) await screen.warmup(page);

        // Prove we are where we say we are.
        //
        // Everything above drives the game by clicking and waiting on fixed
        // schedules built from constants read out of the source: round counts,
        // a maze's move sequence, which option is correct. When one of those
        // drifts the walk does not crash — it lands somewhere else and the
        // screen gets measured and reported under the name it was supposed to
        // reach. `loseOnFirstWrong` is the sharpest case: it returns as soon as
        // it sees a loss, but answer correctly ten times and it falls out of
        // the loop on the game's WIN summary, which would then be filed as the
        // `lost` row, passing.
        //
        // So a screen that is driven rather than clicked to declares a selector
        // that only exists once it is really there. Cheap, and it converts the
        // whole class of silent mislabelling into a loud error row — which
        // matters because every "0 hard fails across N cells" claim this
        // harness makes is only worth the accuracy of these labels.
        if (screen.expect) {
          const found = await page.locator(screen.expect).count();
          if (!found) {
            throw new Error(
              `screen "${screen.name}" was not reached: nothing matches ${screen.expect}`,
            );
          }
        }
      } catch (err) {
        for (const mode of ["in-page", "fullscreen"]) {
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
        continue;
      }

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
              (row.coveredControls?.length
                ? ` (coveredControls: ${row.coveredControls.length}` +
                  // A blocker carrying its own buttons is a surface meant to be
                  // used instead of what is behind it. Said on the line so a
                  // result overlay does not read like a broken screen — the
                  // rows themselves are reported either way.
                  row.coveredByBlocker
                    .map((x) => ` — ${x.controlsCovered} by ${x.blocker}${x.ownControls ? ` (has ${x.ownControls} controls of its own)` : ""}`)
                    .join("") +
                  ")"
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
  if (requestedSize && SIZES.length === 0) {
    console.error(`Unknown size "${requestedSize}". Configured: ${ALL_SIZES.map((size) => size.label).join(", ")}`);
    process.exitCode = 1;
    return;
  }
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
