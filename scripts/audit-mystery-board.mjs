#!/usr/bin/env node
/**
 * Focused responsive audit for /mystery-board.
 *
 * Covers setup, a 20-tile board, and the reveal card at the same seven
 * viewports used by the media-stage audit, in-page and fullscreen-fallback.
 * The JSON keeps the geometry reproducible while PNGs remain the source of
 * truth for visual balance and legibility.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(ROOT, "audit-output", "mystery-board");

const SIZES = [
  { name: "375x812", width: 375, height: 812 },
  { name: "844x390", width: 844, height: 390 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "956x440", width: 956, height: 440 },
];

const SCREENS = [
  "setup",
  "question-setup",
  "board-12",
  "board",
  "board-30",
  "reveal",
  "question-reveal",
];
const MODES = ["in-page", "fullscreen"];
const LONG_QUESTION =
  "ถ้านักเรียนต้องอธิบายให้เพื่อนฟังว่าเหตุใดเราจึงควรช่วยกันประหยัดน้ำและดูแลแหล่งน้ำในชุมชน นักเรียนจะยกเหตุผลและตัวอย่างใดประกอบคำตอบ";
const option = (name) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
const sizeFilter = option("size");
const screenFilter = option("screen");
const modeFilter = option("mode");
const selectedSizes = sizeFilter ? SIZES.filter((size) => size.name === sizeFilter) : SIZES;
const requestedScreens = new Set(screenFilter?.split(",") ?? []);
const selectedScreens = screenFilter
  ? SCREENS.filter((screen) => requestedScreens.has(screen))
  : SCREENS;
const selectedModes = modeFilter ? MODES.filter((mode) => mode === modeFilter) : MODES;

function round(value) {
  return Math.round(value * 10) / 10;
}

async function enterScreen(page, screen) {
  if (screen === "setup") return;
  // Hydration restores persisted settings in a zero-delay effect. Waiting for
  // the button alone is insufficient because its server-rendered copy exists
  // before the client event handler is attached.
  await page.waitForTimeout(500);
  if (screen.startsWith("question-")) {
    await page.getByRole("button", { name: /โหมดคำถาม/ }).click();
    await page.getByLabel("คำถามของคุณครู").fill(LONG_QUESTION);
    if (screen === "question-setup") return;
  }
  if (screen === "board-12") {
    await page.getByRole("button", { name: "12 ป้าย", exact: true }).click();
  }
  if (screen === "board-30") {
    await page.getByRole("button", { name: "30 ป้าย", exact: true }).click();
  }
  await page.getByRole("button", { name: /เริ่มเกม/ }).click();
  await page.locator('button[aria-label*="ป้ายหมายเลข"]').first().waitFor();
  // The 30-tile board has a 40ms stagger, including in reduced-motion mode.
  await page.waitForTimeout(1300);
  if (screen.endsWith("reveal")) {
    await page.locator('button[aria-label*="ป้ายหมายเลข"]').first().click();
    await page.waitForTimeout(220);
  }
}

async function measure(page, { size, mode, screen }) {
  return page.evaluate(
    ({ size, mode, screen }) => {
      const one = (selector) => document.querySelector(selector);
      const all = (selector) => [...document.querySelectorAll(selector)];
      const rect = (element) => {
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return {
          x: Math.round(box.x * 10) / 10,
          y: Math.round(box.y * 10) / 10,
          width: Math.round(box.width * 10) / 10,
          height: Math.round(box.height * 10) / 10,
          right: Math.round(box.right * 10) / 10,
          bottom: Math.round(box.bottom * 10) / 10,
        };
      };
      const shell = one('[class*="shell"]');
      const tiles = all('button[aria-label*="ป้ายหมายเลข"]');
      const cluster = (values) => {
        const sorted = values.sort((a, b) => a - b);
        return sorted.reduce((groups, value) => {
          if (!groups.length || Math.abs(value - groups.at(-1)) > 3) groups.push(value);
          return groups;
        }, []).length;
      };
      const textSizes = all('[class*="shell"] *')
        .filter((element) => element.childElementCount === 0 && element.textContent?.trim())
        .map((element) => parseFloat(getComputedStyle(element).fontSize))
        .filter(Number.isFinite);
      const card = one('[class*="cardShowBack"]');
      const cardScore = card?.querySelector('[class*="cardScore"]');
      const cardQuestion = card?.querySelector('[class*="cardQuestion"]');
      const primaryAction = all("button").find((button) =>
        /เริ่มเกม|สุ่มป้าย|กลับกระดาน/.test(button.textContent || ""),
      );
      const tileNumber = tiles[0]?.querySelector('span');
      return {
        size,
        mode,
        screen,
        viewport: { width: innerWidth, height: innerHeight },
        documentOverflowX: document.documentElement.scrollWidth > innerWidth + 1,
        shell: rect(shell),
        shellClient: shell
          ? {
              width: shell.clientWidth,
              height: shell.clientHeight,
              scrollWidth: shell.scrollWidth,
              scrollHeight: shell.scrollHeight,
            }
          : null,
        bar: rect(one('[class*="bar"]')),
        body: rect(one('[class*="body"]')),
        setup: rect(one('[class*="setup"]')),
        grid: rect(one('[class*="grid"]')),
        tile: rect(tiles[0]),
        tileColumns: cluster(tiles.map((tile) => tile.getBoundingClientRect().x)),
        tileRows: cluster(tiles.map((tile) => tile.getBoundingClientRect().y)),
        tileNumberFont: tileNumber ? parseFloat(getComputedStyle(tileNumber).fontSize) : null,
        card: rect(card),
        cardScoreFont: cardScore ? parseFloat(getComputedStyle(cardScore).fontSize) : null,
        cardQuestionFont: cardQuestion
          ? parseFloat(getComputedStyle(cardQuestion).fontSize)
          : null,
        cardQuestion: rect(cardQuestion),
        primaryAction: rect(primaryAction),
        minTextFont: textSizes.length ? Math.min(...textSizes) : null,
      };
    },
    { size: size.name, mode, screen },
  );
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
const results = [];

try {
  for (const size of selectedSizes) {
    for (const mode of selectedModes) {
      for (const screen of selectedScreens) {
        const context = await browser.newContext({
          viewport: { width: size.width, height: size.height },
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        await page.addInitScript(() => {
          // Exercise the iOS/fullscreen-fallback CSS path deterministically.
          Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
            configurable: true,
            value: undefined,
          });
          localStorage.clear();
        });
        await page.goto(`${BASE_URL}/mystery-board`, { waitUntil: "networkidle" });
        if (mode === "fullscreen") {
          await page.getByRole("button", { name: /เต็มจอ/ }).click();
          await page.waitForTimeout(150);
        }
        await enterScreen(page, screen);
        if (mode === "in-page") {
          await page.locator('[class*="shell"]').scrollIntoViewIfNeeded();
          await page.waitForTimeout(80);
        }
        await page.mouse.move(0, 0);
        const result = await measure(page, { size, mode, screen });
        results.push(result);
        const file = `${screen}--${size.name}--${mode}.png`;
        await page.screenshot({
          path: path.join(OUT_DIR, file),
          fullPage: false,
          animations: "disabled",
        });
        console.log(
          `${screen.padEnd(6)} ${size.name.padEnd(9)} ${mode.padEnd(10)} ` +
            `shell ${round(result.shell?.width ?? 0)}x${round(result.shell?.height ?? 0)} ` +
            (result.tile
              ? `tile ${round(result.tile.width)}x${round(result.tile.height)} ${result.tileColumns}x${result.tileRows}`
              : result.card
                ? `card ${round(result.card.width)}x${round(result.card.height)}`
                : ""),
        );
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

const resultSuffix = [sizeFilter, screenFilter, modeFilter]
  .filter(Boolean)
  .join("--")
  .replaceAll(",", "_");
await writeFile(
  path.join(OUT_DIR, resultSuffix ? `results--${resultSuffix}.json` : "results.json"),
  `${JSON.stringify(results, null, 2)}\n`,
  "utf8",
);
console.log(`Output: ${path.relative(ROOT, OUT_DIR)}`);
