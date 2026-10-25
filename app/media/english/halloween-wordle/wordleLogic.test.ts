import { describe, expect, it } from "vitest";
import { evaluateGuess, keyboardStates, pickRound, starsFor } from "./wordleLogic";
import { LENGTH_INFO, ROUND_SIZE, WORDS, WORD_LENGTHS } from "./wordData";

describe("evaluateGuess", () => {
  it("marks an exact match all correct", () => {
    expect(evaluateGuess("ghost", "ghost")).toEqual(Array(5).fill("correct"));
  });

  it("marks letters in the wrong place as present", () => {
    expect(evaluateGuess("tomb", "mobt")).toEqual(["present", "correct", "present", "present"]);
  });

  it("does not colour a repeated letter more often than the answer holds it", () => {
    // "bone" has one "o"; "moon" guesses two
    expect(evaluateGuess("moon", "bone")).toEqual(["absent", "correct", "absent", "present"]);
  });

  it("gives the green its letter before a yellow can claim it", () => {
    // "spell" holds two l, in positions 3 and 4
    expect(evaluateGuess("lllll", "spell")).toEqual(["absent", "absent", "absent", "correct", "correct"]);
  });

  it("is case blind", () => {
    expect(evaluateGuess("WITCH", "witch")).toEqual(Array(5).fill("correct"));
  });
});

describe("keyboardStates", () => {
  it("keeps the strongest state seen for a letter", () => {
    const states = keyboardStates(["bone", "moon"], "tomb");
    expect(states.o).toBe("correct");
    expect(states.m).toBe("present");
    expect(states.n).toBe("absent");
  });

  it("never downgrades a correct letter", () => {
    const states = keyboardStates(["ghost", "tooth"], "ghost");
    expect(states.o).toBe("correct");
  });
});

describe("starsFor", () => {
  it("gives nothing for a miss", () => {
    expect(starsFor(false, 6, 0)).toBe(0);
  });
  it("rewards quick solves", () => {
    expect(starsFor(true, 2, 0)).toBe(3);
    expect(starsFor(true, 4, 0)).toBe(2);
    expect(starsFor(true, 6, 0)).toBe(1);
  });
  it("makes the first hint free and charges for the rest", () => {
    expect(starsFor(true, 2, 1)).toBe(3);
    expect(starsFor(true, 2, 2)).toBe(2);
    expect(starsFor(true, 2, 3)).toBe(1);
  });
  it("never drops a solved word below one star", () => {
    expect(starsFor(true, 6, 3)).toBe(1);
  });
});

describe("pickRound", () => {
  it("returns distinct items, no more than asked", () => {
    const out = pickRound([1, 2, 3, 4, 5, 6, 7], 5);
    expect(out).toHaveLength(5);
    expect(new Set(out).size).toBe(5);
  });
  it("copes with a pool smaller than the round", () => {
    expect(pickRound([1, 2], 5)).toHaveLength(2);
  });
});

describe("word list", () => {
  it("has the stated number of letters in every word, no duplicates", () => {
    for (const len of WORD_LENGTHS) {
      const list = WORDS[len];
      expect(list.length).toBeGreaterThanOrEqual(ROUND_SIZE);
      expect(new Set(list.map((w) => w.en)).size).toBe(list.length);
      for (const w of list) {
        expect(w.en).toMatch(/^[a-z]+$/);
        expect(w.en).toHaveLength(len);
        expect(w.sentence).toContain("___");
        expect(w.th.length).toBeGreaterThan(0);
      }
    }
  });
  it("describes every length", () => {
    for (const len of WORD_LENGTHS) expect(LENGTH_INFO[len].label).toBeTruthy();
  });
});
