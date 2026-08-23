import type { ThaiVowel } from "./types";

const VOWEL_MARK: Record<ThaiVowel, string> = {
  "า": "า",
  "ี": "◌ี",
  "ู": "◌ู",
};

const VOWEL_NAME: Record<ThaiVowel, string> = {
  "า": "อา",
  "ี": "อี",
  "ู": "อู",
};

const thaiSegmenter = new Intl.Segmenter("th", { granularity: "grapheme" });
const THAI_MARK_RANK: Record<string, number> = {
  "ุ": 1, "ู": 1, "ฺ": 1,
  "ั": 2, "ิ": 2, "ี": 2, "ึ": 2, "ื": 2,
  "็": 3, "่": 3, "้": 3, "๊": 3, "๋": 3,
  "์": 4, "ํ": 4, "๎": 4,
};

export function segmentThai(text: string): string[] {
  return Array.from(thaiSegmenter.segment(text), ({ segment }) => segment);
}

export function hasValidThaiOrder(text: string): boolean {
  if (!text || text !== text.normalize("NFC")) return false;
  return segmentThai(text).every((grapheme) => {
    const characters = Array.from(grapheme);
    if (THAI_MARK_RANK[characters[0]]) return false;
    let previousRank = 0;
    for (const character of characters.slice(1)) {
      const rank = THAI_MARK_RANK[character];
      if (rank && rank < previousRank) return false;
      if (rank) previousRank = rank;
    }
    return true;
  });
}

/** Makes combining vowels visible when they are shown without a consonant. */
export function displayThaiVowel(vowel: ThaiVowel): string {
  return VOWEL_MARK[vowel];
}

export function thaiVowelLabel(vowel: ThaiVowel): string {
  return `สระ “${displayThaiVowel(vowel)}”`;
}

export function thaiVowelAriaLabel(vowel: ThaiVowel): string {
  return `สระ${VOWEL_NAME[vowel]}`;
}
