/*
 * Roll-number rosters for the duck race.
 *
 * Thai schools call students by เลขที่ far more than by name — it is the
 * number already written in the attendance book, on the worksheet and in the
 * score sheet. Search Console shows teachers asking for exactly this and
 * spelling out the class size while they do it: "สุ่มเลขที่ 1 30 เป็ด",
 * "สุ่มเลขที่ 1 39 เป็ด", "เป็ดสุ่มเลขที่", "สุ่มเลขที่เป็ด". Until now the
 * only way to race numbers was to type 1, 2, 3 … by hand, forty times.
 *
 * The range is inclusive at both ends, because a teacher saying "เลขที่ 1 ถึง
 * 40" means forty students, not thirty-nine.
 */

/** Lowest เลขที่ a class uses. */
export const ROLL_MIN = 1;

/*
 * No Thai classroom has 200 students, and the race draws every duck on one
 * canvas, so this is where "my class" stops and "a typo" starts. It caps only
 * what this generator produces: pasting a longer list by hand still works.
 */
export const ROLL_MAX = 200;

/**
 * Coerces whatever a number input hands back into a usable เลขที่.
 *
 * `<input type="number">` yields "" (NaN once parsed) while the field is
 * being edited, and a pasted "12.5" is still a number as far as it cares, so
 * both have to land somewhere sensible rather than produce an empty race.
 */
export function clampRoll(value: number): number {
  if (!Number.isFinite(value)) return ROLL_MIN;
  const whole = Math.floor(value);
  if (whole < ROLL_MIN) return ROLL_MIN;
  if (whole > ROLL_MAX) return ROLL_MAX;
  return whole;
}

/**
 * Builds the roster for a เลขที่ range, inclusive of both ends.
 *
 * Takes the two bounds in either order: a teacher who fills in the second
 * field first gets the class they meant, not an empty track.
 */
export function buildRollNumbers(from: number, to: number): string[] {
  const a = clampRoll(from);
  const b = clampRoll(to);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);

  const roster: string[] = [];
  for (let n = lo; n <= hi; n += 1) roster.push(String(n));
  return roster;
}
