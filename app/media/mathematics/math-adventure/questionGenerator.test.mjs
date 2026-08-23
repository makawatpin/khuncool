import assert from "node:assert/strict";
import test from "node:test";
import { createQuestion, generateQuestions, makeNumericOptions } from "./questionGenerator.ts";

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("subtraction never produces a negative answer", () => {
  const rows = generateQuestions({ count: 500, limit: 20, operation: "subtraction", rng: seeded(7) });
  assert.ok(rows.every((q) => q.a >= q.b && q.a - q.b >= 0));
});

test("addition stays inside the selected limit", () => {
  const rows = generateQuestions({ count: 500, limit: 10, operation: "addition", rng: seeded(9) });
  assert.ok(rows.every((q) => q.a + q.b <= 10));
});

test("numeric choices are unique and contain the answer", () => {
  for (let answer = 0; answer <= 20; answer++) {
    const options = makeNumericOptions(answer, 20, seeded(answer + 1));
    assert.equal(options.length, 3);
    assert.equal(new Set(options).size, 3);
    assert.ok(options.includes(String(answer)));
  }
});

test("operator questions have three distinct symbols", () => {
  const q = createQuestion({ limit: 20, operation: "mixed", kind: "operator", rng: seeded(3) });
  assert.deepEqual(new Set(q.options), new Set(["+", "−", "="]));
  assert.ok(q.options.includes(q.answer));
});
