import { describe, expect, it } from "vitest";
import { IDIOMS, IDIOM_COUNT } from "../app/media/thai/thai-idiom-detective/idiomData";

describe("Thai idiom bank", () => {
  it("contains exactly 50 unique idioms", () => {
    expect(IDIOM_COUNT).toBe(50);
    expect(new Set(IDIOMS.map((item) => item.id)).size).toBe(50);
    expect(new Set(IDIOMS.map((item) => item.phrase)).size).toBe(50);
  });

  it("has complete teaching content for every idiom", () => {
    for (const idiom of IDIOMS) {
      expect(idiom.phrase.length).toBeGreaterThan(3);
      expect(idiom.meaning.length).toBeGreaterThan(10);
      expect(idiom.situation.length).toBeGreaterThan(15);
      expect(idiom.emoji.length).toBeGreaterThan(0);
    }
  });
});
