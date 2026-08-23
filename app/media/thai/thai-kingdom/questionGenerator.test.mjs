import assert from "node:assert/strict";
import test from "node:test";
import { generateQuestions } from "./questionGenerator.ts";
import { displayThaiVowel, hasValidThaiOrder, segmentThai, thaiVowelLabel } from "./thaiText.ts";
import { THAI_WORDS } from "./wordData.ts";

const config = { consonantSet: "all", vowels: ["า", "ี", "ู"], questionCount: 10, difficulty: 2, sound: true, hints: true, timer: false, playMode: "whole", teamCount: 2, instantAnswer: true };
const seeded = () => .42;

test("whitelist has 24 unique words and ids", () => {
  assert.equal(THAI_WORDS.length, 24);
  assert.equal(new Set(THAI_WORDS.map((word) => word.id)).size, 24);
  assert.equal(new Set(THAI_WORDS.map((word) => word.word)).size, 24);
});

test("Thai combining characters remain grapheme-safe", () => {
  assert.deepEqual(segmentThai("ขี่"), ["ขี่"]);
  assert.ok(THAI_WORDS.every((word) => hasValidThaiOrder(word.word)));
});

test("standalone combining vowels use a visible dotted-circle carrier", () => {
  assert.equal(thaiVowelLabel("า"), "สระ “า”");
  assert.equal(displayThaiVowel("ี"), "◌ี");
  assert.equal(displayThaiVowel("ู"), "◌ู");
  assert.deepEqual(segmentThai("สี"), ["สี"]);
});

test("generated choices are unique and contain the answer", () => {
  const questions = generateQuestions({ count: 25, config, rng: seeded });
  for (const question of questions.filter((item) => item.kind !== "arrange")) {
    assert.equal(new Set(question.options).size, 3);
    assert.ok(question.options.includes(question.answer));
  }
});

test("generator respects selected vowels and difficulty", () => {
  const questions = generateQuestions({ count: 15, config: { ...config, vowels: ["ู"], difficulty: 1 }, rng: seeded });
  assert.ok(questions.every((question) => question.word.vowel === "ู"));
  assert.ok(questions.every((question) => question.word.difficulty <= 1));
});

test("every generated word comes from the approved whitelist", () => {
  const approved = new Set(THAI_WORDS.map((word) => word.id));
  const questions = generateQuestions({ count: 50, config, rng: Math.random });
  assert.ok(questions.every((question) => approved.has(question.word.id)));
});
