import { describe, expect, it } from "vitest";
import { buildChoices, houseStars, shuffle, wantSentence } from "./sleighLogic";
import { HOUSES_PER_ROUND, SETS } from "./sleighData";

describe("wantSentence", () => {
  it("uses the right article", () => {
    expect(wantSentence({ id: "a", en: "ball", th: "", emoji: "⚽", det: "a" })).toBe("I want a ball.");
    expect(wantSentence({ id: "b", en: "milk", th: "", emoji: "🥛", det: "some" })).toBe("I want some milk.");
    expect(wantSentence({ id: "c", en: "boots", th: "", emoji: "🥾", det: "" })).toBe("I want boots.");
  });
});

describe("houseStars", () => {
  it("rewards a clean delivery and never goes below one star", () => {
    expect(houseStars(0)).toBe(3);
    expect(houseStars(1)).toBe(2);
    expect(houseStars(2)).toBe(1);
    expect(houseStars(9)).toBe(1);
  });
});

describe("shuffle", () => {
  it("keeps every item and does not touch the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("buildChoices", () => {
  it("always contains the answer exactly once, with the requested count", () => {
    for (const set of SETS) {
      for (const word of set.words) {
        for (const count of [3, 4]) {
          const choices = buildChoices(word, set.words, count);
          expect(choices).toHaveLength(count);
          expect(choices.filter((c) => c.id === word.id)).toHaveLength(1);
          expect(new Set(choices.map((c) => c.emoji)).size).toBe(count);
        }
      }
    }
  });
});

describe("word sets", () => {
  it("has enough distinct words for a round and for the distractors", () => {
    for (const set of SETS) {
      expect(set.words.length).toBeGreaterThanOrEqual(HOUSES_PER_ROUND + 2);
      expect(new Set(set.words.map((w) => w.id)).size).toBe(set.words.length);
      expect(new Set(set.words.map((w) => w.emoji)).size).toBe(set.words.length);
    }
  });
});
