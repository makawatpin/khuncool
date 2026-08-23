import type { ThaiVowel, ThaiWord, VowelPosition } from "./types";
import { thaiVowelLabel } from "./thaiText.ts";

const asset = (id: string, type: "words" | "audio", extension: "svg" | "wav") => `/assets/thai-kingdom/${type}/${id}.${extension}`;
const position: Record<ThaiVowel, VowelPosition> = { "า": "right", "ี": "above", "ู": "below" };

type Row = [id: string, word: string, consonant: string, vowel: ThaiVowel, distractors: string[], difficulty: 1 | 2 | 3, tags: string[], toneMark?: "่" | "้"];

const rows: Row[] = [
  ["ka", "กา", "ก", "า", ["kha", "cha", "na"], 1, ["animal", "concrete"]],
  ["kha", "ขา", "ข", "า", ["ka", "ya", "fa"], 1, ["body", "concrete"]],
  ["cha", "ชา", "ช", "า", ["na", "ya", "ka"], 1, ["food", "concrete"]],
  ["na", "นา", "น", "า", ["cha", "fa", "ya"], 1, ["place", "concrete"]],
  ["pa", "ปา", "ป", "า", ["ka", "na", "maa"], 2, ["action"]],
  ["fa", "ฝา", "ฝ", "า", ["kha", "ya", "cha"], 1, ["object", "concrete"]],
  ["ya", "ยา", "ย", "า", ["fa", "na", "kha"], 1, ["object", "concrete"]],
  ["maa", "ม้า", "ม", "า", ["ka", "kha", "ya"], 2, ["animal", "tone"], "้"],
  ["khii", "ขี่", "ข", "ี", ["chii", "tii", "mii"], 2, ["action", "tone"], "่"],
  ["chii", "ชี้", "ช", "ี", ["khii", "dii", "sii"], 2, ["action", "tone"], "้"],
  ["dii", "ดี", "ด", "ี", ["tii", "pii", "sii"], 1, ["quality"]],
  ["tii", "ตี", "ต", "ี", ["dii", "mii", "phii"], 1, ["action"]],
  ["pii", "ปี", "ป", "ี", ["sii", "dii", "mii"], 1, ["time"]],
  ["phii", "ผี", "ผ", "ี", ["pii", "tii", "sii"], 1, ["character", "concrete"]],
  ["mii", "มี", "ม", "ี", ["dii", "tii", "sii"], 1, ["verb"]],
  ["sii", "สี", "ส", "ี", ["pii", "phii", "dii"], 1, ["object", "concrete"]],
  ["khuu", "คู่", "ค", "ู", ["nguu", "puu", "ruu"], 2, ["quantity", "tone"], "่"],
  ["nguu", "งู", "ง", "ู", ["puu", "huu", "ruu"], 1, ["animal", "concrete"]],
  ["chuu", "ชู", "ช", "ู", ["duu", "puu", "tuu"], 1, ["action"]],
  ["duu", "ดู", "ด", "ู", ["chuu", "ruu", "huu"], 1, ["action"]],
  ["puu", "ปู", "ป", "ู", ["nguu", "huu", "tuu"], 1, ["animal", "concrete"]],
  ["ruu", "รู", "ร", "ู", ["huu", "puu", "duu"], 1, ["object", "concrete"]],
  ["huu", "หู", "ห", "ู", ["ruu", "nguu", "puu"], 1, ["body", "concrete"]],
  ["tuu", "ตู้", "ต", "ู", ["puu", "huu", "chuu"], 2, ["object", "tone"], "้"],
];

export const THAI_WORDS: ThaiWord[] = rows.map(([id, word, consonant, vowel, distractors, difficulty, tags, toneMark]) => ({
  id,
  word,
  consonant,
  vowel,
  image: asset(id, "words", "svg"),
  audio: asset(id, "audio", "wav"),
  distractors,
  difficulty,
  tags,
  composition: { initial: consonant, vowelGlyph: vowel, vowelPosition: position[vowel], ...(toneMark ? { toneMark } : {}) },
}));

export const WORD_BY_ID = new Map(THAI_WORDS.map((word) => [word.id, word]));
export const CONSONANT_SETS = {
  starter: ["ก", "ข", "ช", "ด", "ต", "น", "ป", "ม"],
  extended: ["ค", "ง", "ผ", "ฝ", "ย", "ร", "ส", "ห"],
  all: Array.from(new Set(THAI_WORDS.map((word) => word.consonant))),
} as const;

export const PRESETS = [
  { id: "aa", label: thaiVowelLabel("า"), vowels: ["า"] as ThaiVowel[] },
  { id: "ii", label: thaiVowelLabel("ี"), vowels: ["ี"] as ThaiVowel[] },
  { id: "uu", label: thaiVowelLabel("ู"), vowels: ["ู"] as ThaiVowel[] },
  { id: "mixed", label: "ทบทวนแบบผสม", vowels: ["า", "ี", "ู"] as ThaiVowel[] },
];
