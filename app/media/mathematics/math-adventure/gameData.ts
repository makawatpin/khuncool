import type { VisualObject } from "./types";

export const OBJECTS: Record<VisualObject, { emoji: string; label: string; unit: string }> = {
  apple: { emoji: "🍎", label: "แอปเปิล", unit: "ลูก" },
  ball: { emoji: "⚽", label: "ลูกบอล", unit: "ลูก" },
  pencil: { emoji: "✏️", label: "ดินสอ", unit: "แท่ง" },
  cat: { emoji: "🐱", label: "แมว", unit: "ตัว" },
};

type LessonExample = { a: number; b: number; object: VisualObject; operation?: "addition" | "subtraction" };

const ADDITION_EXAMPLES: LessonExample[] = [
  { a: 1, b: 2, object: "apple" },
  { a: 2, b: 3, object: "ball" },
  { a: 4, b: 2, object: "pencil" },
  { a: 3, b: 4, object: "cat" },
  { a: 5, b: 3, object: "apple" },
  { a: 6, b: 4, object: "ball" },
  { a: 7, b: 5, object: "pencil" },
  { a: 8, b: 6, object: "cat" },
  { a: 9, b: 7, object: "apple" },
  { a: 11, b: 9, object: "ball" },
];

const SUBTRACTION_EXAMPLES: LessonExample[] = [
  { a: 3, b: 1, object: "cat" },
  { a: 5, b: 2, object: "ball" },
  { a: 6, b: 3, object: "apple" },
  { a: 8, b: 4, object: "pencil" },
  { a: 9, b: 5, object: "cat" },
  { a: 10, b: 3, object: "ball" },
  { a: 12, b: 5, object: "apple" },
  { a: 14, b: 6, object: "pencil" },
  { a: 17, b: 8, object: "cat" },
  { a: 20, b: 9, object: "ball" },
];

export const LESSONS = [
  {
    id: "add",
    eyebrow: "การบวก = รวมกัน",
    title: "เอาของสองกลุ่มมารวมกัน",
    operation: "addition" as const,
    examples: ADDITION_EXAMPLES,
  },
  {
    id: "subtract",
    eyebrow: "การลบ = เอาออก",
    title: "เอาของออก แล้วนับที่เหลือ",
    operation: "subtraction" as const,
    examples: SUBTRACTION_EXAMPLES,
  },
  {
    id: "line",
    eyebrow: "เส้นจำนวน 0–20",
    title: "บวกเดินหน้า ลบเดินถอยหลัง",
    operation: "addition" as const,
    examples: [
      { a: 7, b: 4, object: "pencil", operation: "addition" },
      { a: 3, b: 5, object: "apple", operation: "addition" },
      { a: 9, b: 6, object: "ball", operation: "addition" },
      { a: 12, b: 7, object: "cat", operation: "addition" },
      { a: 5, b: 10, object: "pencil", operation: "addition" },
      { a: 14, b: 3, object: "apple", operation: "subtraction" },
      { a: 10, b: 6, object: "ball", operation: "subtraction" },
      { a: 18, b: 5, object: "cat", operation: "subtraction" },
      { a: 20, b: 8, object: "pencil", operation: "subtraction" },
      { a: 11, b: 9, object: "apple", operation: "subtraction" },
    ] satisfies LessonExample[],
  },
];

export const MODE_CARDS = [
  { mode: "lesson" as const, icon: "🧭", title: "เรียนรู้", desc: "ดูภาพเคลื่อนไหวและเส้นจำนวน", tone: "violet" },
  { mode: "practice" as const, icon: "🧩", title: "ฝึกทำ", desc: "นับภาพ เติมคำ และลากวัตถุ", tone: "mint" },
  { mode: "train" as const, icon: "🚂", title: "รถไฟเก็บดาว", desc: "ผลัดกันตอบ 10 ข้อ", tone: "orange" },
  { mode: "quiz" as const, icon: "🏅", title: "แบบทดสอบ", desc: "เช็กความเข้าใจหลังเรียน", tone: "blue" },
];

export const TEAM_NAMES = ["ทีมดาว", "ทีมจรวด", "ทีมสายรุ้ง", "ทีมใบไม้"];

export const WORD_PROBLEMS = {
  addition: [
    (a: number, b: number) => `มีดินสอ ${a} แท่ง ได้เพิ่ม ${b} แท่ง มีทั้งหมดกี่แท่ง`,
    (a: number, b: number) => `มีแมว ${a} ตัว เดินมาอีก ${b} ตัว ตอนนี้มีกี่ตัว`,
  ],
  subtraction: [
    (a: number, b: number) => `มีลูกบอล ${a} ลูก นำไปเล่น ${b} ลูก เหลือกี่ลูก`,
    (a: number, b: number) => `มีแอปเปิล ${a} ลูก กินไป ${b} ลูก เหลือกี่ลูก`,
  ],
};
