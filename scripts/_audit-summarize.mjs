import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.cwd(), "audit-output");

const games = (await readdir(OUT_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const hardFails = [];
const errors = [];
const hiddenScrollRows = [];

for (const game of games) {
  const rows = JSON.parse(await readFile(path.join(OUT_DIR, game, "results.json"), "utf8"));
  for (const r of rows) {
    if (r.error) {
      errors.push(r);
      continue;
    }
    if (r.pass === false) {
      const reasons = [];
      if (r.unreachable?.length) reasons.push(`unreachable(${r.unreachable.length})`);
      if (r.undersizedTargets?.length) reasons.push(`undersizedTargets(${r.undersizedTargets.length})`);
      if (r.smallText?.length) reasons.push(`smallText(${r.smallText.length})`);
      if (r.pageScrollsSideways) reasons.push("pageScrollsSideways");
      if (r.bodyUnbound) reasons.push("bodyUnbound");
      hardFails.push({ ...r, reasons });
    }
    if (r.contentHiddenBehindScroll?.length) {
      for (const region of r.contentHiddenBehindScroll) {
        hiddenScrollRows.push({
          game: r.game,
          screen: r.screen,
          size: r.size,
          mode: r.mode,
          screenshot: r.screenshot,
          ...region,
        });
      }
    }
  }
}

console.log(`games: ${games.length}`);
console.log(`hardFails: ${hardFails.length}`);
console.log(`errors: ${errors.length}`);
console.log(`contentHiddenBehindScroll rows: ${hiddenScrollRows.length}`);

const fs = await import("node:fs/promises");
await fs.writeFile(path.join(OUT_DIR, "_hardFails.json"), JSON.stringify(hardFails, null, 2));
await fs.writeFile(path.join(OUT_DIR, "_errors.json"), JSON.stringify(errors, null, 2));
await fs.writeFile(path.join(OUT_DIR, "_hiddenScroll.json"), JSON.stringify(hiddenScrollRows, null, 2));
