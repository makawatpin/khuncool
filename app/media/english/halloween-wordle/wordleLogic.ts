// Pure rules for the Halloween Wordle: scoring a guess, merging keyboard
// colours, and turning a result into stars. Kept free of React so it can be
// unit tested.

export type LetterState = "correct" | "present" | "absent";

export const MAX_GUESSES = 6;
export const MAX_HINTS = 3;

/**
 * Score a guess against the answer, Wordle rules: greens are claimed first,
 * then each remaining answer letter can colour at most one yellow. Two passes
 * is what stops a doubled letter from lighting up more times than the answer
 * actually holds it.
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const result: LetterState[] = Array(g.length).fill("absent");
  const remaining = new Map<string, number>();

  for (let i = 0; i < a.length; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
    } else {
      remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1);
    }
  }
  for (let i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;
    const left = remaining.get(g[i]) ?? 0;
    if (left > 0) {
      result[i] = "present";
      remaining.set(g[i], left - 1);
    }
  }
  return result;
}

const RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/** Best known state per letter, so a key never goes from green back to grey. */
export function keyboardStates(
  guesses: string[],
  answer: string,
): Record<string, LetterState> {
  const out: Record<string, LetterState> = {};
  for (const guess of guesses) {
    const states = evaluateGuess(guess, answer);
    states.forEach((state, i) => {
      const letter = guess[i].toLowerCase();
      if (!out[letter] || RANK[state] > RANK[out[letter]]) out[letter] = state;
    });
  }
  return out;
}

/**
 * Stars for one word, 0–3. Fewer guesses earn more; the first hint is free
 * (it is only a picture) and every hint after it costs a star, but a solved
 * word is never worth less than one star.
 */
export function starsFor(solved: boolean, guessCount: number, hintsUsed: number): number {
  if (!solved) return 0;
  const base = guessCount <= 3 ? 3 : guessCount <= 5 ? 2 : 1;
  const penalty = Math.max(0, hintsUsed - 1);
  return Math.max(1, base - penalty);
}

/** Fisher–Yates over a copy, with an injectable random for tests. */
export function pickRound<T>(
  pool: readonly T[],
  size: number,
  random: () => number = Math.random,
): T[] {
  const copy = pool.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(size, copy.length));
}
