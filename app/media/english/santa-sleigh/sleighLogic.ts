// Pure rules for Santa's Sleigh, kept free of React so they can be unit tested.

import type { SleighWord } from "./sleighData";

/** The sentence a child says — and the game reads aloud. */
export function wantSentence(word: SleighWord): string {
  const det = word.det ? `${word.det} ` : "";
  return `I want ${det}${word.en}.`;
}

/** Stars for one house: clean delivery 3, one wrong try 2, more than that 1. */
export function houseStars(wrongTries: number): number {
  if (wrongTries <= 0) return 3;
  if (wrongTries === 1) return 2;
  return 1;
}

/** Fisher–Yates over a copy, with an injectable random for tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * The gifts on offer for one house: the right one plus distractors from the
 * same set, shuffled. Distractors never repeat the answer's word or picture, so
 * two gifts can never both look right.
 */
export function buildChoices(
  correct: SleighWord,
  pool: readonly SleighWord[],
  count: number,
  random: () => number = Math.random,
): SleighWord[] {
  const others = shuffle(
    pool.filter((p) => p.id !== correct.id && p.emoji !== correct.emoji && p.en !== correct.en),
    random,
  ).slice(0, Math.max(0, count - 1));
  return shuffle([correct, ...others], random);
}
