import { WORD_PROBLEMS } from "./gameData.ts";
import type { MathQuestion, Operation, OperationSetting, QuestionKind, VisualObject } from "./types";

export type RandomSource = () => number;

const KINDS: QuestionKind[] = ["picture-count", "number-line", "missing", "operator", "word-problem"];
const OBJECTS: VisualObject[] = ["apple", "ball", "pencil", "cat"];

function pick<T>(items: readonly T[], rng: RandomSource): T {
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}

function shuffle<T>(items: readonly T[], rng: RandomSource): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function makeNumericOptions(answer: number, limit: number, rng: RandomSource): string[] {
  const values = new Set<number>([answer]);
  const offsets = shuffle([-3, -2, -1, 1, 2, 3], rng);
  for (const offset of offsets) {
    const value = answer + offset;
    if (value >= 0 && value <= limit) values.add(value);
    if (values.size === 3) break;
  }
  for (let value = 0; values.size < 3 && value <= limit; value++) values.add(value);
  return shuffle([...values].slice(0, 3).map(String), rng);
}

export function createQuestion({
  limit,
  operation,
  rng = Math.random,
  kind,
  id = "q",
}: {
  limit: 10 | 20;
  operation: OperationSetting;
  rng?: RandomSource;
  kind?: QuestionKind;
  id?: string;
}): MathQuestion {
  const op: Operation = operation === "mixed" ? pick(["addition", "subtraction"] as const, rng) : operation;
  const a = Math.floor(rng() * (limit + 1));
  const b = op === "addition"
    ? Math.floor(rng() * (limit - a + 1))
    : Math.floor(rng() * (a + 1));
  const result = op === "addition" ? a + b : a - b;
  const selectedKind = kind ?? pick(KINDS, rng);
  const object = pick(OBJECTS, rng);
  const symbol = op === "addition" ? "+" : "−";
  let answer = String(result);
  let prompt = `${a} ${symbol} ${b} เท่ากับเท่าไร`;
  let hint = op === "addition" ? `เริ่มที่ ${a} แล้วเดินหน้า ${b} ช่อง` : `เริ่มที่ ${a} แล้วถอยหลัง ${b} ช่อง`;
  let options = makeNumericOptions(result, limit, rng);

  if (selectedKind === "missing") {
    answer = String(b);
    prompt = `${a} ${symbol} □ = ${result}  ในช่องว่างคือเลขอะไร`;
    hint = op === "addition" ? `นับต่อจาก ${a} จนถึง ${result}` : `นับถอยจาก ${a} จนถึง ${result}`;
    options = makeNumericOptions(b, limit, rng);
  } else if (selectedKind === "operator") {
    answer = symbol;
    prompt = `${a} □ ${b} = ${result}  ควรใส่เครื่องหมายใด`;
    hint = op === "addition" ? "จำนวนมากขึ้น ใช้เครื่องหมายบวก" : "จำนวนลดลง ใช้เครื่องหมายลบ";
    options = shuffle(["+", "−", "="], rng);
  } else if (selectedKind === "word-problem") {
    prompt = pick(WORD_PROBLEMS[op], rng)(a, b);
  } else if (selectedKind === "picture-count") {
    prompt = op === "addition" ? "รวมวัตถุสองกลุ่ม แล้วเลือกจำนวนทั้งหมด" : "เอาวัตถุที่ขีดออก แล้วเลือกจำนวนที่เหลือ";
  }

  return { id, kind: selectedKind, operation: op, a, b, answer, options, prompt, hint, object };
}

export function generateQuestions({
  count,
  limit,
  operation,
  rng = Math.random,
  kinds,
}: {
  count: number;
  limit: 10 | 20;
  operation: OperationSetting;
  rng?: RandomSource;
  kinds?: QuestionKind[];
}): MathQuestion[] {
  return Array.from({ length: count }, (_, index) => createQuestion({
    limit,
    operation,
    rng,
    kind: kinds?.[index % kinds.length],
    id: `q-${index + 1}`,
  }));
}
