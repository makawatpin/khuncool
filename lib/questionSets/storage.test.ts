import { describe, expect, it } from "vitest";
import {
  MAX_QUESTIONS,
  MAX_QUESTION_LENGTH,
  normalizeQuestions,
  questionsFromText,
  sanitizeQuestionSetStore,
} from "./storage";

describe("normalizeQuestions", () => {
  it("trims, collapses inner whitespace and drops blanks", () => {
    expect(normalizeQuestions(["  ถามอะไร  ", "", "   ", "ตอบ   ยาก  ไหม"])).toEqual([
      "ถามอะไร",
      "ตอบ ยาก ไหม",
    ]);
  });

  it("drops duplicates, keeping the first occurrence", () => {
    expect(normalizeQuestions(["ก", "ข", "ก", " ก "])).toEqual(["ก", "ข"]);
  });

  it("caps the number of questions", () => {
    const many = Array.from({ length: MAX_QUESTIONS + 25 }, (_, i) => `ข้อ ${i}`);
    expect(normalizeQuestions(many)).toHaveLength(MAX_QUESTIONS);
  });

  it("caps the length of a single question", () => {
    const [only] = normalizeQuestions(["ก".repeat(MAX_QUESTION_LENGTH + 50)]);
    expect(only).toHaveLength(MAX_QUESTION_LENGTH);
  });
});

describe("questionsFromText", () => {
  it("splits one question per line", () => {
    expect(questionsFromText("หนึ่ง\nสอง\n\nสาม")).toEqual([
      "หนึ่ง",
      "สอง",
      "สาม",
    ]);
  });
});

describe("sanitizeQuestionSetStore", () => {
  const set = (over: Record<string, unknown> = {}) => ({
    id: "qset_1",
    name: "ชุดทดสอบ",
    questions: ["ก", "ข"],
    createdAt: 1,
    updatedAt: 2,
    ...over,
  });

  it("rejects anything that is not a v1 store", () => {
    expect(sanitizeQuestionSetStore(null)).toBeNull();
    expect(sanitizeQuestionSetStore({ version: 2, sets: [] })).toBeNull();
    expect(sanitizeQuestionSetStore({ version: 1 })).toBeNull();
  });

  it("drops malformed sets but keeps the valid ones", () => {
    const result = sanitizeQuestionSetStore({
      version: 1,
      activeSetId: "qset_1",
      sets: [set(), null, { id: "no-name" }, set({ id: "qset_2" })],
    });
    expect(result?.sets.map((s) => s.id)).toEqual(["qset_1", "qset_2"]);
  });

  it("falls back to the first set when activeSetId points nowhere", () => {
    const result = sanitizeQuestionSetStore({
      version: 1,
      activeSetId: "gone",
      sets: [set()],
    });
    expect(result?.activeSetId).toBe("qset_1");
  });

  it("leaves activeSetId null for an empty library", () => {
    const result = sanitizeQuestionSetStore({
      version: 1,
      activeSetId: "gone",
      sets: [],
    });
    expect(result?.activeSetId).toBeNull();
  });

  it("normalizes questions inside stored sets", () => {
    const result = sanitizeQuestionSetStore({
      version: 1,
      activeSetId: "qset_1",
      sets: [set({ questions: [" ก ", "ก", "", 42, "ข"] })],
    });
    expect(result?.sets[0].questions).toEqual(["ก", "ข"]);
  });

  it("gives an unnamed set a fallback name", () => {
    const result = sanitizeQuestionSetStore({
      version: 1,
      activeSetId: "qset_1",
      sets: [set({ name: "   " })],
    });
    expect(result?.sets[0].name).toBe("ชุดคำถาม");
  });
});
