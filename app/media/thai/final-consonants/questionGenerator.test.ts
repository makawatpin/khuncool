import assert from "node:assert/strict";
import test from "node:test";
import { FAMILIES } from "./familyData.ts";
import { generateQuestions } from "./questionGenerator.ts";
import { WORDS } from "./wordData.ts";

const seeded = (seed = 1) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

test("assigns every word to an existing family", () => {
  const ids = new Set(FAMILIES.map((family) => family.id));
  assert.ok(WORDS.every((word) => ids.has(word.familyId)));
});

test("only publishes complete family SEO content", () => {
  const readyFamilies = FAMILIES.filter((item) => item.seo.status === "ready");
  for (const family of readyFamilies) {
    assert.ok(family.seo.uniqueIntroduction.length > 40);
    assert.ok(family.seo.soundExplanation.length > 40);
    assert.ok(family.seo.consonantExplanation.length > 40);
    assert.ok(family.seo.commonErrors.length >= 5);
    assert.ok(family.seo.contrastExplanation.length > 40);
    assert.ok(family.seo.classroomActivity.length > 40);
    assert.ok(family.seo.teacherCheck.length > 40);
    assert.ok(family.seo.faqs.length >= 3);
    assert.ok(family.seo.metaTitle.includes(family.name));
    assert.ok(family.seo.metaDescription.length > 60);
  }
  assert.equal(new Set(readyFamilies.map((family) => family.seo.metaTitle)).size, readyFamilies.length);
  assert.equal(new Set(readyFamilies.map((family) => family.seo.metaDescription)).size, readyFamilies.length);
});

test("uses a 4:3:3 split for a ten-question focused game", () => {
  const questions = generateQuestions({ focusFamily: "kot", questionCount: 10, difficulty: 3 }, seeded());
  const counts = questions.reduce<Record<string, number>>((sum, question) => ({ ...sum, [question.answer]: (sum[question.answer] || 0) + 1 }), {});
  assert.deepEqual(counts, { kot: 4, kok: 3, kop: 3 });
});

test("never offers only the focus family", () => {
  const questions = generateQuestions({ focusFamily: "kot", questionCount: 10, difficulty: 3 }, seeded(8));
  assert.ok(questions.every((question) => question.options.sort().join(",") === "kok,kop,kot"));
});

test("does not repeat a word in one round", () => {
  const questions = generateQuestions({ focusFamily: "kot", questionCount: 15, difficulty: 3 }, seeded(15));
  assert.equal(new Set(questions.map((question) => question.word.id)).size, 15);
});
