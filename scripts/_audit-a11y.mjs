/**
 * Aggregate the audit's nonSemanticControls into something decidable.
 *
 * Reports counts, not fixes. A clickable element that is not a semantic control
 * fails WCAG 2.1.1 (Keyboard) and 4.1.2 (Name, Role, Value), but the fix is not
 * the same in every case, so the buckets matter:
 *
 *   drag        draggable="true" — legitimately not a button, still needs a
 *               keyboard path. A different job from relabelling.
 *   labelled    has a role or a tabindex — partially declared already.
 *   plain       neither. A span or div with onClick and nothing else.
 *   offStage    additionally outside the stage with no scroll to it, so
 *               unreachable by pointer as well as by keyboard.
 *
 * Deduplicated per game by control label, since the same element reappears in
 * every viewport and mode.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "audit-output");
const games = (await readdir(OUT, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const perGame = [];

for (const game of games) {
  const rows = JSON.parse(await readFile(path.join(OUT, game, "results.json"), "utf8"));
  const seen = new Map();
  for (const row of rows) {
    for (const c of row.nonSemanticControls || []) {
      const key = `${row.screen}|${c.tag}|${c.control}`;
      const prev = seen.get(key);
      seen.set(key, {
        ...c,
        screen: row.screen,
        // keep the worst sighting: off-stage anywhere is off-stage
        offStage: (prev?.offStage || c.offStage) === true,
      });
    }
  }
  const all = [...seen.values()];
  perGame.push({
    game,
    total: all.length,
    drag: all.filter((c) => c.dragAffordance || c.draggable).length,
    labelled: all.filter((c) => !(c.dragAffordance || c.draggable) && (c.role || c.tabbable)).length,
    plain: all.filter((c) => !(c.dragAffordance || c.draggable) && !c.role && !c.tabbable).length,
    offStage: all.filter((c) => c.offStage).length,
    items: all,
  });
}

const withAny = perGame.filter((g) => g.total > 0).sort((a, b) => b.total - a.total);

console.log("game                 total   drag  labelled  plain  offStage");
console.log("-".repeat(62));
for (const g of withAny) {
  console.log(
    `${g.game.padEnd(20)} ${String(g.total).padStart(5)} ${String(g.drag).padStart(6)} ${String(g.labelled).padStart(9)} ${String(g.plain).padStart(6)} ${String(g.offStage).padStart(9)}`,
  );
}
const sum = (k) => withAny.reduce((a, g) => a + g[k], 0);
console.log("-".repeat(62));
console.log(
  `${"TOTAL".padEnd(20)} ${String(sum("total")).padStart(5)} ${String(sum("drag")).padStart(6)} ${String(sum("labelled")).padStart(9)} ${String(sum("plain")).padStart(6)} ${String(sum("offStage")).padStart(9)}`,
);
console.log(`\ngames clean: ${perGame.length - withAny.length} of ${perGame.length}`);

if (process.argv.includes("--detail")) {
  for (const g of withAny) {
    console.log(`\n=== ${g.game} ===`);
    for (const c of g.items) {
      const flags = [
        c.dragAffordance || c.draggable ? "drag" : null,
        c.role ? `role=${c.role}` : null,
        c.tabbable ? "tabbable" : null,
        c.offStage ? "OFF-STAGE" : null,
      ].filter(Boolean).join(" ");
      console.log(`  ${c.screen.padEnd(16)} ${c.tag.padEnd(7)} ${String(c.control).slice(0, 30).padEnd(31)} ${flags}`);
    }
  }
}
