import assert from "node:assert/strict";
import test from "node:test";
import { CHOICE_QUESTIONS, LESSON_SLIDES, PAINT_QUESTIONS, QUIZ_QUESTIONS } from "./fractionsData.ts";
import { UNEQUAL_PARTS } from "./fractionGeometry.ts";

/** รวมทุก ShapeSpec ที่ปรากฏในข้อมูลทั้งไฟล์ พร้อมที่อยู่ไว้บอกตอนเทสต์ตก */
function everyShape() {
  const rows = [];
  for (const slide of LESSON_SLIDES)
    slide.steps.forEach((step, i) =>
      step.shapes.forEach((shape, j) => rows.push([`lesson ${slide.id} step${i} shape${j}`, shape])));
  for (const q of CHOICE_QUESTIONS)
    q.options.forEach((shape, i) => rows.push([`choice ${q.id} option${i}`, shape]));
  for (const q of QUIZ_QUESTIONS)
    q.shapes.forEach((shape, i) => rows.push([`quiz ${q.id} shape${i}`, shape]));
  return rows;
}

test("ทุกรูปมี filled ที่ไม่ซ้ำและไม่หลุดขอบ", () => {
  for (const [where, shape] of everyShape()) {
    assert.ok(shape.parts >= 1 && shape.parts <= 6, `${where}: parts=${shape.parts} นอกช่วง 1-6`);
    assert.equal(new Set(shape.filled).size, shape.filled.length, `${where}: filled ซ้ำ`);
    for (const index of shape.filled)
      assert.ok(index >= 0 && index < shape.parts, `${where}: filled มี ${index} แต่มีแค่ ${shape.parts} ส่วน`);
  }
});

test("บทเรียนมี 5 สไลด์ สไลด์ละ 3 สเต็ป", () => {
  assert.equal(LESSON_SLIDES.length, 5);
  for (const slide of LESSON_SLIDES) {
    assert.equal(slide.steps.length, 3, `สไลด์ ${slide.id} มี ${slide.steps.length} สเต็ป`);
    for (const step of slide.steps) {
      assert.ok(step.caption.length > 0, `สไลด์ ${slide.id} มีสเต็ปที่ไม่มีคำบรรยาย`);
      assert.ok(step.shapes.length > 0, `สไลด์ ${slide.id} มีสเต็ปที่ไม่มีรูป`);
    }
  }
});

test("สไลด์ที่จะโชว์ตัวเลขต้องมี fraction กำกับ", () => {
  for (const slide of LESSON_SLIDES) {
    const showsNumber = slide.steps.some((step) => step.reveal !== "none");
    if (showsNumber) assert.ok(slide.fraction, `สไลด์ ${slide.id} จะโชว์ตัวเลขแต่ไม่มี fraction`);
  }
});

/** ตัวเลือกที่ถูกคือรูปที่แบ่งเท่ากัน จำนวนส่วนตรงตัวส่วน และระบายตรงตัวเศษ */
const describes = (shape, numerator, denominator) =>
  !shape.unequal && shape.parts === denominator && shape.filled.length === numerator;

test("เกมเลือกภาพมี 6 ข้อ ข้อละ 3 ตัวเลือก และถูกได้ข้อเดียว", () => {
  assert.equal(CHOICE_QUESTIONS.length, 6);
  for (const q of CHOICE_QUESTIONS) {
    assert.equal(q.options.length, 3, `ข้อ ${q.id} มี ${q.options.length} ตัวเลือก`);
    assert.ok(q.answerIndex >= 0 && q.answerIndex < 3, `ข้อ ${q.id} answerIndex หลุดขอบ`);
    const correct = q.options.filter((shape) => describes(shape, q.numerator, q.denominator));
    assert.equal(correct.length, 1, `ข้อ ${q.id} มีตัวเลือกที่ถูก ${correct.length} ข้อ ต้องมี 1`);
    assert.ok(describes(q.options[q.answerIndex], q.numerator, q.denominator),
      `ข้อ ${q.id} answerIndex ชี้ผิดตัว`);
  }
});

test("เกมเลือกภาพมีตัวลวงที่แบ่งไม่เท่ากันอย่างน้อย 1 ข้อ", () => {
  const hasUnequalTrap = CHOICE_QUESTIONS.some((q) => q.options.some((shape) => shape.unequal));
  assert.ok(hasUnequalTrap, "ต้องมีตัวลวงแบบแบ่งไม่เท่ากัน ไม่งั้นสไลด์ 1 ไม่ถูกฝึกเลย");
});

test("เกมแตะระบายมี 6 ข้อ เศษน้อยกว่าส่วน และไม่เกิน 6 ส่วน", () => {
  assert.equal(PAINT_QUESTIONS.length, 6);
  for (const q of PAINT_QUESTIONS) {
    assert.ok(q.numerator >= 1, `ข้อ ${q.id} ตัวเศษต้องอย่างน้อย 1`);
    assert.ok(q.numerator < q.denominator, `ข้อ ${q.id} ตัวเศษต้องน้อยกว่าตัวส่วน`);
    assert.ok(q.denominator <= 6, `ข้อ ${q.id} เกิน 6 ส่วน เป้าแตะจะเล็กกว่า 24px บนมือถือ`);
  }
});

test("คำถามหน้าชั้นมี 8 ข้อ มีคำถามและคำตอบครบ", () => {
  assert.equal(QUIZ_QUESTIONS.length, 8);
  for (const q of QUIZ_QUESTIONS) {
    assert.ok(q.question.length > 0, `ข้อ ${q.id} ไม่มีคำถาม`);
    assert.ok(q.answer.length > 0, `ข้อ ${q.id} ไม่มีคำตอบ`);
    assert.ok(q.note.length > 0, `ข้อ ${q.id} ไม่มีคำอธิบายประกอบเฉลย`);
  }
});

test("ทุก id ไม่ซ้ำกันภายในชุดของตัวเอง", () => {
  for (const [name, rows] of [["lesson", LESSON_SLIDES], ["choice", CHOICE_QUESTIONS],
    ["paint", PAINT_QUESTIONS], ["quiz", QUIZ_QUESTIONS]]) {
    const ids = rows.map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length, `${name} มี id ซ้ำ`);
  }
});

test("รูปที่แบ่งไม่เท่ากันต้องมีสัดส่วนกำหนดไว้จริง ไม่งั้นจะถูกวาดเป็นแบ่งเท่ากัน", () => {
  for (const [where, shape] of everyShape()) {
    if (!shape.unequal) continue;
    assert.ok(
      UNEQUAL_PARTS.includes(shape.parts),
      `${where}: ตั้ง unequal ไว้แต่ parts=${shape.parts} ไม่มีสัดส่วนกำหนดไว้ จะถูกวาดเป็นแบ่งเท่ากัน`,
    );
  }
});

test("รูปวงกลมตั้ง unequal ไม่ได้ เพราะ FractionShape วาดวงกลมเป็นชิ้นเท่ากันเสมอ", () => {
  for (const [where, shape] of everyShape()) {
    if (!shape.unequal) continue;
    assert.notEqual(
      shape.shape,
      "circle",
      `${where}: วงกลมจะถูกวาดเป็นชิ้นเท่ากันเสมอ ตั้ง unequal แล้วจะไม่มีผล ให้ใช้ bar หรือ square แทน`,
    );
  }
});
