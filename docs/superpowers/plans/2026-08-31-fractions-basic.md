# สื่อ "รู้จักเศษส่วน" ป.2–3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างสื่อการสอนเศษส่วนพื้นฐานสำหรับ ป.2–3 ที่ `/media/mathematics/fractions-basic` — บทเรียน 5 สไลด์ เกมฝึก 2 เกม 12 ข้อ และคำถามหน้าชั้น 8 ข้อ สำหรับครูฉายขึ้นจอ

**Architecture:** client component เดียวเป็น state machine `home → lesson → game-choice → game-paint → quiz → result` วางบน `.kc-stage` ตาม `docs/media-stage-contract.md` เนื้อหาทั้งหมดเป็นชุดตายตัวใน `fractionsData.ts` ตรรกะการวาดรูปเศษส่วนแยกเป็นฟังก์ชันบริสุทธิ์ใน `fractionGeometry.ts` ที่ทดสอบได้ ส่วนที่เหลือเป็น presentational component ที่ตรวจด้วย audit + ดูภาพจริง

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules + container queries · `node:test` สำหรับ unit test · Playwright ผ่าน `scripts/audit-games.mjs`

**เอกสารที่ต้องอ่านก่อนเริ่ม:**
- `docs/superpowers/specs/2026-08-31-fractions-basic-design.md` — สเปกของงานนี้
- `docs/media-stage-contract.md` — ข้อ 1–3, Checklist, ข้อ 4.5 **บังคับ**
- `docs/how-to-brief.md` — ลำดับการวัดและกับดักของเครื่องมือ

---

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `app/media/mathematics/fractions-basic/types.ts` | type ทั้งหมดของสื่อนี้ |
| `app/media/mathematics/fractions-basic/fractionGeometry.ts` | ฟังก์ชันบริสุทธิ์: พาธ SVG ของชิ้นวงกลม, ความกว้างแถบ, การแบ่งไม่เท่ากัน |
| `app/media/mathematics/fractions-basic/fractionGeometry.test.mjs` | เทสต์ของ geometry |
| `app/media/mathematics/fractions-basic/fractionsData.ts` | เนื้อหาทั้งหมด: 5 สไลด์ · 6+6 ข้อเกม · 8 คำถาม |
| `app/media/mathematics/fractions-basic/fractionsData.test.mjs` | เทสต์ค่าคงที่ของข้อมูล (ตัวเลือกถูก 1 เดียว, index ไม่หลุดขอบ ฯลฯ) |
| `app/media/mathematics/fractions-basic/FractionsApp.tsx` | state machine + toolbar + หน้า home |
| `app/media/mathematics/fractions-basic/FractionsApp.module.css` | ขนาดและการจัดวางทั้งหมดของสื่อ |
| `app/media/mathematics/fractions-basic/page.tsx` | metadata + JSON-LD + หน้าห่อ |
| `.../components/FractionShape.tsx` + `.module.css` | วาดรูปเศษส่วน ใช้ทุกหน้าจอ |
| `.../components/FractionNumber.tsx` + `.module.css` | ตัวเลขเศษส่วนที่ประกอบขึ้นทีละส่วน |
| `.../components/Mascot.tsx` + `.module.css` | มาสคอต SVG เขียนใหม่ |
| `.../components/LessonScreen.tsx` | บทเรียน 5 สไลด์ |
| `.../components/ChoiceGame.tsx` | เกม A เลือกภาพให้ตรงเลข |
| `.../components/PaintGame.tsx` | เกม B แตะระบายให้ถูก |
| `.../components/QuizScreen.tsx` | คำถามหน้าชั้น |
| `.../components/ResultScreen.tsx` | หน้าสรุปปิดคาบ |
| `app/media/subjectContent.ts` | เพิ่มการ์ดเข้าหน้าวิชาคณิตศาสตร์ |
| `scripts/audit-games.mjs` | เพิ่ม config ของเกมนี้ |

**หมายเหตุเรื่องสไตล์:** ทุก `.module.css` ถือขนาด ระยะห่าง และการจัดวาง — inline style เก็บได้แค่สีที่ผูกกับ state เท่านั้น (contract §3) ขนาดที่มาจาก prop ให้ใช้ **class** (`sizeSm` / `sizeMd` / `sizeLg`) ไม่ใช่ custom property inline เพราะ custom property ที่เขียน inline ก็ชนะ stylesheet เหมือนกัน และ container query จะต้องใช้ `!important` เพื่อยกค่า

---

## Task 1: types + fractionGeometry

**Files:**
- Create: `app/media/mathematics/fractions-basic/types.ts`
- Create: `app/media/mathematics/fractions-basic/fractionGeometry.ts`
- Test: `app/media/mathematics/fractions-basic/fractionGeometry.test.mjs`

- [ ] **Step 1: สร้าง types.ts**

```ts
export type ShapeKind = "circle" | "bar" | "square";

/** รูปเศษส่วนหนึ่งรูป — แบ่ง `parts` ส่วน ระบายส่วนที่อยู่ใน `filled` */
export type ShapeSpec = {
  shape: ShapeKind;
  parts: number;
  filled: number[];
  /** true = แบ่งไม่เท่ากัน ใช้เป็นตัวลวางและตัวอย่าง "แบบนี้ไม่ใช่เศษส่วน" */
  unequal?: boolean;
};

/** หนึ่งสเต็ปของสไลด์บทเรียน ครูกด → ทีละสเต็ป หรือกด ▶ ให้เดินเอง */
export type LessonStep = {
  caption: string;
  shapes: ShapeSpec[];
  /** ตัวเลขเศษส่วนโผล่แค่ไหนในสเต็ปนี้ */
  reveal: "none" | "denominator" | "full";
  /** ส่วนที่ให้กะพริบเน้นในสเต็ปนี้ */
  highlight?: "all" | "filled";
};

export type LessonSlide = {
  id: string;
  title: string;
  /** ตัวเลขเศษส่วนที่สไลด์นี้กำลังสอน null = สไลด์ที่ไม่มีตัวเลข */
  fraction: { numerator: number; denominator: number } | null;
  steps: LessonStep[];
};

export type ChoiceQuestion = {
  id: string;
  numerator: number;
  denominator: number;
  options: ShapeSpec[];
  answerIndex: number;
  explain: string;
};

export type PaintQuestion = {
  id: string;
  numerator: number;
  denominator: number;
  shape: ShapeKind;
  explain: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  shapes: ShapeSpec[];
  answer: string;
  note: string;
};

export type Screen = "home" | "lesson" | "game-choice" | "game-paint" | "quiz" | "result";
```

- [ ] **Step 2: เขียนเทสต์ที่ยังไม่ผ่าน**

สร้าง `fractionGeometry.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { slicePath, stripBounds, unequalWeights } from "./fractionGeometry.ts";

test("slicePath ของแต่ละชิ้นต่อกันสนิท", () => {
  for (const parts of [2, 3, 4, 5, 6]) {
    for (let i = 0; i < parts - 1; i++) {
      const end = slicePath(i, parts).match(/A50 50 0 \d 1 ([\d.-]+) ([\d.-]+)/);
      const start = slicePath(i + 1, parts).match(/L([\d.-]+) ([\d.-]+)/);
      assert.equal(end[1], start[1], `parts=${parts} ชิ้น ${i} จบไม่ตรงที่ชิ้น ${i + 1} เริ่ม`);
      assert.equal(end[2], start[2], `parts=${parts} ชิ้น ${i} จบไม่ตรงที่ชิ้น ${i + 1} เริ่ม`);
    }
  }
});

test("slicePath ชิ้นแรกเริ่มที่ 12 นาฬิกา", () => {
  const start = slicePath(0, 4).match(/L([\d.-]+) ([\d.-]+)/);
  assert.equal(Number(start[1]), 50);
  assert.equal(Number(start[2]), 0);
});

test("parts=1 ได้วงกลมเต็มใบ ไม่ใช่ชิ้นที่ลากเข้าจุดศูนย์กลาง", () => {
  const path = slicePath(0, 1);
  assert.ok(!path.includes("M50 50 L"), "วงกลมเต็มใบต้องไม่มีเส้นลากเข้าศูนย์กลาง");
  assert.ok(path.includes("A"), "ต้องเป็นส่วนโค้ง");
});

test("slicePath ของทุกชิ้นในรูปเดียวกันไม่ซ้ำกัน", () => {
  for (const parts of [2, 3, 4, 5, 6]) {
    const paths = Array.from({ length: parts }, (_, i) => slicePath(i, parts));
    assert.equal(new Set(paths).size, parts);
  }
});

test("stripBounds แบ่งเท่ากันและเต็ม 100 พอดี", () => {
  for (const parts of [2, 3, 4, 5, 6]) {
    const bounds = Array.from({ length: parts }, (_, i) => stripBounds(i, parts));
    assert.equal(bounds.length, parts);
    assert.equal(bounds[0].x, 0);
    const last = bounds[parts - 1];
    assert.equal(Math.round((last.x + last.width) * 1000) / 1000, 100);
    const widths = new Set(bounds.map((b) => b.width));
    assert.equal(widths.size, 1, "แบ่งเท่ากันต้องกว้างเท่ากันทุกช่อง");
  }
});

test("stripBounds แบบไม่เท่ากันยังเต็ม 100 แต่กว้างไม่เท่ากัน", () => {
  for (const parts of [2, 3, 4]) {
    const bounds = Array.from({ length: parts }, (_, i) => stripBounds(i, parts, true));
    const last = bounds[parts - 1];
    assert.equal(Math.round((last.x + last.width) * 1000) / 1000, 100);
    assert.equal(new Set(bounds.map((b) => b.width)).size, parts, "ต้องกว้างไม่ซ้ำกันเลย");
  }
});

test("unequalWeights รวมได้ 1 และไม่มีค่าซ้ำ", () => {
  for (const parts of [2, 3, 4]) {
    const weights = unequalWeights(parts);
    assert.equal(weights.length, parts);
    assert.equal(Math.round(weights.reduce((sum, w) => sum + w, 0) * 1000) / 1000, 1);
    assert.equal(new Set(weights).size, parts);
    assert.ok(weights.every((w) => w > 0));
  }
});

test("unequalWeights ของจำนวนส่วนที่ไม่ได้กำหนดไว้ ถอยไปเป็นแบ่งเท่ากัน", () => {
  const weights = unequalWeights(5);
  assert.equal(weights.length, 5);
  assert.equal(new Set(weights).size, 1);
});
```

- [ ] **Step 3: รันเทสต์ให้เห็นว่าไม่ผ่าน**

```bash
node --test app/media/mathematics/fractions-basic/fractionGeometry.test.mjs
```

Expected: FAIL — `Cannot find module './fractionGeometry.ts'`

- [ ] **Step 4: เขียน fractionGeometry.ts**

```ts
/**
 * เรขาคณิตของรูปเศษส่วน — ฟังก์ชันบริสุทธิ์ล้วน ไม่แตะ DOM ไม่แตะ React
 *
 * ทุกพิกัดอยู่ในระบบ viewBox "0 0 100 100" ขนาดจริงบนจอถูกกำหนดจาก CSS module
 * ของ FractionShape เท่านั้น (contract ข้อ 3 — ขนาดห้ามอยู่ใน inline style)
 */

const CX = 50;
const CY = 50;
const R = 50;

/** ปัดให้พาธสั้นและเทียบกันได้ตรง ๆ ระหว่างชิ้นที่ติดกัน */
const round = (value: number) => Math.round(value * 1000) / 1000;

const pointAt = (turns: number) => {
  // เริ่มที่ 12 นาฬิกา เดินตามเข็ม
  const angle = turns * Math.PI * 2 - Math.PI / 2;
  return { x: round(CX + R * Math.cos(angle)), y: round(CY + R * Math.sin(angle)) };
};

/**
 * พาธของชิ้นที่ `index` เมื่อวงกลมถูกแบ่ง `parts` ส่วนเท่า ๆ กัน
 *
 * `parts === 1` คืนวงกลมเต็มใบด้วยส่วนโค้งสองท่อน เพราะชิ้นเดียว 360°
 * จะมีจุดเริ่มกับจุดจบทับกันพอดี ทำให้ `A` วาดอะไรไม่ออก
 */
export function slicePath(index: number, parts: number): string {
  if (parts <= 1) {
    return `M${CX} ${CY - R} A${R} ${R} 0 1 1 ${CX} ${CY + R} A${R} ${R} 0 1 1 ${CX} ${CY - R} Z`;
  }
  const start = pointAt(index / parts);
  const end = pointAt((index + 1) / parts);
  const large = 1 / parts > 0.5 ? 1 : 0;
  return `M${CX} ${CY} L${start.x} ${start.y} A${R} ${R} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

/**
 * สัดส่วนความกว้างของการแบ่งแบบ "ไม่เท่ากัน" ใช้กับสไลด์ 1 (ตัวอย่างที่ไม่ใช่
 * เศษส่วน) และตัวลวงในเกม A ค่าคงที่ตายตัวเพื่อให้ภาพเหมือนเดิมทุกครั้ง
 * และเทสต์ทำซ้ำได้ จำนวนส่วนที่ไม่ได้กำหนดไว้ถอยไปเป็นแบ่งเท่ากัน
 */
const UNEQUAL: Record<number, number[]> = {
  2: [0.62, 0.38],
  3: [0.5, 0.3, 0.2],
  4: [0.4, 0.28, 0.19, 0.13],
};

export function unequalWeights(parts: number): number[] {
  return UNEQUAL[parts] ?? Array.from({ length: parts }, () => 1 / parts);
}

/** ขอบซ้ายและความกว้างของแถบที่ `index` ในระบบ 0–100 */
export function stripBounds(index: number, parts: number, unequal = false): { x: number; width: number } {
  const weights = unequal ? unequalWeights(parts) : Array.from({ length: parts }, () => 1 / parts);
  const before = weights.slice(0, index).reduce((sum, w) => sum + w, 0);
  return { x: round(before * 100), width: round(weights[index] * 100) };
}

/** อ่านเศษส่วนเป็นภาษาไทยสำหรับ aria-label และคำบรรยาย */
export function readFraction(numerator: number, denominator: number): string {
  if (numerator === 1 && denominator === 2) return "ครึ่งหนึ่ง";
  return `${numerator} ส่วน ${denominator}`;
}
```

- [ ] **Step 5: รันเทสต์ให้ผ่าน**

```bash
node --test app/media/mathematics/fractions-basic/fractionGeometry.test.mjs
```

Expected: PASS ทั้ง 7 เทสต์

- [ ] **Step 6: Commit**

```bash
git add app/media/mathematics/fractions-basic/types.ts app/media/mathematics/fractions-basic/fractionGeometry.ts app/media/mathematics/fractions-basic/fractionGeometry.test.mjs
git commit -m "$(cat <<'EOF'
feat(fractions): add the geometry the fraction shapes are drawn from

Pure functions in the 0-100 viewBox space, so the shape component can be
sized entirely from CSS. parts=1 is a full circle rather than a 360-degree
wedge, whose start and end points would coincide and draw nothing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: fractionsData

**Files:**
- Create: `app/media/mathematics/fractions-basic/fractionsData.ts`
- Test: `app/media/mathematics/fractions-basic/fractionsData.test.mjs`

- [ ] **Step 1: เขียนเทสต์ที่ยังไม่ผ่าน**

สร้าง `fractionsData.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { CHOICE_QUESTIONS, LESSON_SLIDES, PAINT_QUESTIONS, QUIZ_QUESTIONS } from "./fractionsData.ts";

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
```

- [ ] **Step 2: รันเทสต์ให้เห็นว่าไม่ผ่าน**

```bash
node --test app/media/mathematics/fractions-basic/fractionsData.test.mjs
```

Expected: FAIL — `Cannot find module './fractionsData.ts'`

- [ ] **Step 3: เขียน fractionsData.ts**

```ts
import type { ChoiceQuestion, LessonSlide, PaintQuestion, QuizQuestion } from "./types";

/**
 * เนื้อหาทั้งหมดของสื่อนี้ — ตายตัว ไม่สุ่ม
 *
 * ครูฉายจอหน้าชั้นและเดินตามลำดับ ความคาดเดาได้สำคัญกว่าความหลากหลาย
 * และการไม่สุ่มทำให้ audit ไม่ต้อง sweep seed
 */

export const LESSON_SLIDES: LessonSlide[] = [
  {
    id: "equal-parts",
    title: "แบ่งเท่า ๆ กันคืออะไร",
    fraction: null,
    steps: [
      {
        caption: "นี่คือพิซซ่า 1 ถาด เราเรียกทั้งถาดนี้ว่า 1 ทั้งหมด",
        shapes: [{ shape: "circle", parts: 1, filled: [] }],
        reveal: "none",
      },
      {
        caption: "ตัดครึ่งให้สองชิ้นเท่ากันพอดี แบบนี้แบ่งเท่า ๆ กัน ใช้ได้",
        shapes: [{ shape: "circle", parts: 2, filled: [] }],
        reveal: "none",
        highlight: "all",
      },
      {
        caption: "แต่ถ้าตัดแล้วชิ้นไม่เท่ากัน แบบนี้ยังไม่ใช่เศษส่วนนะ",
        shapes: [
          { shape: "bar", parts: 2, filled: [] },
          { shape: "bar", parts: 2, filled: [], unequal: true },
        ],
        reveal: "none",
      },
    ],
  },
  {
    id: "one-half",
    title: "ครึ่งหนึ่ง",
    fraction: { numerator: 1, denominator: 2 },
    steps: [
      {
        caption: "เค้ก 1 ก้อน ตัดออกเป็น 2 ชิ้นเท่ากัน",
        shapes: [{ shape: "circle", parts: 2, filled: [] }],
        reveal: "none",
      },
      {
        caption: "ระบายสีไว้ 1 ชิ้น",
        shapes: [{ shape: "circle", parts: 2, filled: [0] }],
        reveal: "denominator",
        highlight: "all",
      },
      {
        caption: "เขียนได้ว่า 1 ส่วน 2 อ่านว่า หนึ่งส่วนสอง หรือ ครึ่งหนึ่ง",
        shapes: [{ shape: "circle", parts: 2, filled: [0] }],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
  {
    id: "one-quarter",
    title: "หนึ่งส่วนสี่",
    fraction: { numerator: 1, denominator: 4 },
    steps: [
      {
        caption: "ช็อกโกแลตแท่งนี้หักได้ 4 ชิ้นเท่ากัน",
        shapes: [{ shape: "bar", parts: 4, filled: [] }],
        reveal: "none",
      },
      {
        caption: "กินไป 1 ชิ้น",
        shapes: [{ shape: "bar", parts: 4, filled: [0] }],
        reveal: "denominator",
        highlight: "all",
      },
      {
        caption: "เขียนได้ว่า 1 ส่วน 4 — ไม่ใช่พิซซ่าก็เป็นเศษส่วนได้",
        shapes: [{ shape: "bar", parts: 4, filled: [0] }],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
  {
    id: "parts-meaning",
    title: "ตัวเศษ ตัวส่วน บอกอะไร",
    fraction: { numerator: 3, denominator: 5 },
    steps: [
      {
        caption: "แท่งนี้แบ่ง 5 ส่วน ระบายไว้ 3 ส่วน",
        shapes: [{ shape: "bar", parts: 5, filled: [0, 1, 2] }],
        reveal: "none",
      },
      {
        caption: "ตัวเลขข้างล่างคือ ตัวส่วน บอกว่าแบ่งทั้งหมดกี่ส่วน — นับได้ 5",
        shapes: [{ shape: "bar", parts: 5, filled: [0, 1, 2] }],
        reveal: "denominator",
        highlight: "all",
      },
      {
        caption: "ตัวเลขข้างบนคือ ตัวเศษ บอกว่าเอามากี่ส่วน — นับได้ 3",
        shapes: [{ shape: "bar", parts: 5, filled: [0, 1, 2] }],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
  {
    id: "same-fraction",
    title: "รูปเดียวกัน เขียนได้แบบเดียว",
    fraction: { numerator: 1, denominator: 2 },
    steps: [
      {
        caption: "วงกลมใบนี้ระบายไว้ครึ่งหนึ่ง",
        shapes: [{ shape: "circle", parts: 2, filled: [0] }],
        reveal: "none",
      },
      {
        caption: "แท่งกับสี่เหลี่ยมก็ระบายไว้ครึ่งหนึ่งเหมือนกัน",
        shapes: [
          { shape: "circle", parts: 2, filled: [0] },
          { shape: "bar", parts: 2, filled: [0] },
          { shape: "square", parts: 2, filled: [0] },
        ],
        reveal: "none",
      },
      {
        caption: "รูปต่างกันแต่เขียนเป็นเศษส่วนได้เหมือนกันหมด คือ 1 ส่วน 2",
        shapes: [
          { shape: "circle", parts: 2, filled: [0] },
          { shape: "bar", parts: 2, filled: [0] },
          { shape: "square", parts: 2, filled: [0] },
        ],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
];

export const CHOICE_QUESTIONS: ChoiceQuestion[] = [
  {
    id: "c1",
    numerator: 1,
    denominator: 2,
    options: [
      { shape: "circle", parts: 2, filled: [0] },
      { shape: "circle", parts: 4, filled: [0] },
      { shape: "circle", parts: 3, filled: [0] },
    ],
    answerIndex: 0,
    explain: "แบ่ง 2 ส่วน ระบาย 1 ส่วน จึงเป็น 1 ส่วน 2",
  },
  {
    id: "c2",
    numerator: 1,
    denominator: 4,
    options: [
      { shape: "bar", parts: 3, filled: [0] },
      { shape: "bar", parts: 4, filled: [0] },
      { shape: "bar", parts: 4, filled: [0, 1] },
    ],
    answerIndex: 1,
    explain: "ต้องแบ่ง 4 ส่วน และระบายแค่ 1 ส่วน",
  },
  {
    id: "c3",
    numerator: 1,
    denominator: 3,
    options: [
      { shape: "circle", parts: 3, filled: [0], unequal: true },
      { shape: "circle", parts: 4, filled: [0] },
      { shape: "circle", parts: 3, filled: [0] },
    ],
    answerIndex: 2,
    explain: "รูปแรกแบ่งไม่เท่ากันจึงใช้ไม่ได้ ต้องแบ่งเท่ากัน 3 ส่วนแล้วระบาย 1 ส่วน",
  },
  {
    id: "c4",
    numerator: 3,
    denominator: 4,
    options: [
      { shape: "square", parts: 4, filled: [0, 1, 2] },
      { shape: "square", parts: 4, filled: [0] },
      { shape: "square", parts: 3, filled: [0, 1, 2] },
    ],
    answerIndex: 0,
    explain: "แบ่ง 4 ส่วน ระบาย 3 ส่วน จึงเป็น 3 ส่วน 4",
  },
  {
    id: "c5",
    numerator: 2,
    denominator: 5,
    options: [
      { shape: "bar", parts: 5, filled: [0, 1, 2] },
      { shape: "bar", parts: 5, filled: [0, 1] },
      { shape: "bar", parts: 2, filled: [0] },
    ],
    answerIndex: 1,
    explain: "แบ่ง 5 ส่วน ระบาย 2 ส่วน — นับสีให้ครบก่อนตอบ",
  },
  {
    id: "c6",
    numerator: 4,
    denominator: 6,
    options: [
      { shape: "circle", parts: 6, filled: [0, 1, 2] },
      { shape: "bar", parts: 6, filled: [0, 1, 2, 3], unequal: true },
      { shape: "circle", parts: 6, filled: [0, 1, 2, 3] },
    ],
    answerIndex: 2,
    explain: "แบ่งเท่ากัน 6 ส่วน แล้วระบาย 4 ส่วน",
  },
];

export const PAINT_QUESTIONS: PaintQuestion[] = [
  { id: "p1", numerator: 1, denominator: 2, shape: "bar", explain: "แบ่ง 2 ส่วน ระบาย 1 ส่วน" },
  { id: "p2", numerator: 1, denominator: 3, shape: "circle", explain: "แบ่ง 3 ส่วน ระบาย 1 ส่วน" },
  { id: "p3", numerator: 2, denominator: 4, shape: "square", explain: "แบ่ง 4 ส่วน ระบาย 2 ส่วน" },
  { id: "p4", numerator: 3, denominator: 4, shape: "bar", explain: "แบ่ง 4 ส่วน ระบาย 3 ส่วน" },
  { id: "p5", numerator: 2, denominator: 5, shape: "bar", explain: "แบ่ง 5 ส่วน ระบาย 2 ส่วน" },
  { id: "p6", numerator: 5, denominator: 6, shape: "circle", explain: "แบ่ง 6 ส่วน ระบาย 5 ส่วน" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "รูปไหนถูกแบ่งเท่า ๆ กัน",
    shapes: [
      { shape: "bar", parts: 3, filled: [] },
      { shape: "bar", parts: 3, filled: [], unequal: true },
    ],
    answer: "รูปแรก",
    note: "รูปที่สองแต่ละชิ้นกว้างไม่เท่ากัน จึงเขียนเป็นเศษส่วนไม่ได้",
  },
  {
    id: "q2",
    question: "รูปนี้ระบายไว้เท่าไรของทั้งหมด",
    shapes: [{ shape: "circle", parts: 2, filled: [0] }],
    answer: "ครึ่งหนึ่ง หรือ 1 ส่วน 2",
    note: "แบ่ง 2 ส่วนเท่ากัน ระบายไว้ 1 ส่วน",
  },
  {
    id: "q3",
    question: "แท่งนี้แบ่งทั้งหมดกี่ส่วน",
    shapes: [{ shape: "bar", parts: 4, filled: [0] }],
    answer: "4 ส่วน",
    note: "จำนวนส่วนทั้งหมดคือตัวส่วน เขียนไว้ข้างล่างเส้นคั่น",
  },
  {
    id: "q4",
    question: "รูปนี้เขียนเป็นเศษส่วนว่าอย่างไร",
    shapes: [{ shape: "square", parts: 4, filled: [0, 1, 2] }],
    answer: "3 ส่วน 4",
    note: "ระบาย 3 ส่วนจากทั้งหมด 4 ส่วน ตัวเศษคือ 3 ตัวส่วนคือ 4",
  },
  {
    id: "q5",
    question: "ตัวเศษของ 2 ส่วน 5 คือเลขอะไร และบอกอะไรเรา",
    shapes: [{ shape: "bar", parts: 5, filled: [0, 1] }],
    answer: "คือ 2 บอกว่าเราเอามา 2 ส่วน",
    note: "ตัวเศษอยู่ข้างบนเส้นคั่น บอกจำนวนส่วนที่เราเอามา",
  },
  {
    id: "q6",
    question: "สองรูปนี้ระบายไว้เท่ากันไหม",
    shapes: [
      { shape: "circle", parts: 2, filled: [0] },
      { shape: "square", parts: 2, filled: [0] },
    ],
    answer: "เท่ากัน ทั้งคู่คือครึ่งหนึ่ง",
    note: "รูปทรงต่างกันได้ แต่ถ้าแบ่งเท่ากันและระบายเท่ากัน ก็เป็นเศษส่วนเดียวกัน",
  },
  {
    id: "q7",
    question: "รูปนี้ยังไม่ได้ระบายอยู่กี่ส่วน",
    shapes: [{ shape: "bar", parts: 6, filled: [0, 1, 2, 3] }],
    answer: "2 ส่วน หรือ 2 ส่วน 6",
    note: "ทั้งหมด 6 ส่วน ระบายไปแล้ว 4 ส่วน จึงเหลือ 2 ส่วน",
  },
  {
    id: "q8",
    question: "แม่ทำขนมมา 1 ถาด ตัดแบ่งเท่า ๆ กันให้เพื่อน 4 คน แต่ละคนจะได้ขนมเท่าไรของทั้งถาด",
    shapes: [{ shape: "circle", parts: 4, filled: [0] }],
    answer: "คนละ 1 ส่วน 4",
    note: "แบ่งเท่ากัน 4 ส่วน คนหนึ่งได้ 1 ส่วน จึงเป็น 1 ส่วน 4 ของทั้งถาด",
  },
];
```

- [ ] **Step 4: รันเทสต์ให้ผ่าน**

```bash
node --test app/media/mathematics/fractions-basic/fractionsData.test.mjs
```

Expected: PASS ทั้ง 8 เทสต์

- [ ] **Step 5: Commit**

```bash
git add app/media/mathematics/fractions-basic/fractionsData.ts app/media/mathematics/fractions-basic/fractionsData.test.mjs
git commit -m "$(cat <<'EOF'
feat(fractions): write the lesson, game and quiz content

Fixed content, never randomised: the teacher walks a class through it in
order, so predictability beats variety, and the audit needs no seed sweep.

The tests encode what a typo would break - a choice question with two
correct pictures, a filled index past the last slice, a paint question
split into more than six parts, where the tap targets fall under 24px.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: FractionShape

**Files:**
- Create: `app/media/mathematics/fractions-basic/components/FractionShape.tsx`
- Create: `app/media/mathematics/fractions-basic/components/FractionShape.module.css`

- [ ] **Step 1: เขียน FractionShape.tsx**

```tsx
"use client";

import { slicePath, stripBounds } from "../fractionGeometry";
import type { ShapeKind } from "../types";
import styles from "./FractionShape.module.css";

type Props = {
  shape: ShapeKind;
  parts: number;
  filled: number[];
  unequal?: boolean;
  /** ขนาดเป็น class ไม่ใช่ค่า inline — container query จึงยกค่าได้ (contract ข้อ 3) */
  size?: "sm" | "md" | "lg";
  /** เน้นส่วนไหน: ทุกส่วน (สอนตัวส่วน) หรือเฉพาะที่ระบาย (สอนตัวเศษ) */
  highlight?: "all" | "filled";
  /** ให้แตะเลือกได้ ใช้ใน PaintGame */
  onTapPart?: (index: number) => void;
  /** คำบรรยายรูปสำหรับคนที่มองไม่เห็น */
  label: string;
};

const SIZE_CLASS = { sm: styles.sizeSm, md: styles.sizeMd, lg: styles.sizeLg };

export default function FractionShape({
  shape, parts, filled, unequal = false, size = "md", highlight, onTapPart, label,
}: Props) {
  const interactive = Boolean(onTapPart);
  const indices = Array.from({ length: parts }, (_, i) => i);

  const partProps = (index: number) => {
    const isFilled = filled.includes(index);
    const classes = [
      styles.part,
      isFilled ? styles.filled : styles.empty,
      highlight === "all" ? styles.pulse : "",
      highlight === "filled" && isFilled ? styles.pulse : "",
      interactive ? styles.tappable : "",
    ].filter(Boolean).join(" ");

    if (!interactive) return { className: classes, "aria-hidden": true as const };

    return {
      className: classes,
      role: "checkbox",
      tabIndex: 0,
      "aria-checked": isFilled,
      "aria-label": `ส่วนที่ ${index + 1}`,
      onClick: () => onTapPart?.(index),
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onTapPart?.(index);
        }
      },
    };
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.shape} ${SIZE_CLASS[size]} ${shape === "bar" ? styles.bar : ""}`}
      role={interactive ? "group" : "img"}
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {shape === "circle"
        ? indices.map((i) => <path key={i} d={slicePath(i, parts)} {...partProps(i)} />)
        : indices.map((i) => {
            const { x, width } = stripBounds(i, parts, unequal);
            return <rect key={i} x={x} y={0} width={width} height={100} {...partProps(i)} />;
          })}
    </svg>
  );
}
```

**หมายเหตุ:** `unequal` มีผลเฉพาะ `bar`/`square` โดยตั้งใจ — วงกลมที่แบ่งไม่เท่ากัน
อ่านยากบนโปรเจกเตอร์และข้อมูลใน Task 2 ใช้ `unequal` กับวงกลมแค่ข้อ `c3` ซึ่งเป็นตัวลวง
ที่เด็กต้อง "ตัดออก" อยู่แล้ว ให้ `c3` เรนเดอร์เป็นวงกลมแบ่งเท่ากันแต่ผิดจำนวนส่วนแทน
ถ้าภาพจริงดูแล้วไม่สื่อ ให้เปลี่ยนข้อมูลของ `c3` เป็น `shape: "bar"` ใน Task 6

- [ ] **Step 2: เขียน FractionShape.module.css**

```css
/* รูปเศษส่วน — ขนาดทั้งหมดคุมจากที่นี่ ไม่มีค่าไหนอยู่ใน inline style
   viewBox เป็น 0 0 100 100 เสมอ สิ่งที่เปลี่ยนคือกล่องที่ SVG ถูกวางลงไป */

.shape {
  display: block;
  flex: none;
  overflow: visible;
}

.sizeSm { width: max(64px, 14cqi); height: max(64px, 14cqi) }
.sizeMd { width: max(96px, 20cqi); height: max(96px, 20cqi) }
.sizeLg { width: max(120px, 28cqi); height: max(120px, 28cqi) }

/* แท่งช็อกโกแลตเตี้ยกว่าที่มันกว้าง ไม่งั้นจะดูเหมือนสี่เหลี่ยมจัตุรัส */
.bar.sizeSm { height: max(30px, 6cqi) }
.bar.sizeMd { height: max(42px, 8cqi) }
.bar.sizeLg { height: max(52px, 11cqi) }

.part {
  stroke: #1F2A44;
  stroke-width: 1.5;
  stroke-linejoin: round;
  transition: fill 0.32s ease;
}

.filled { fill: #F4A261 }
.empty { fill: #FFF6EC }

.tappable { cursor: pointer }
.tappable:focus-visible { outline: 3px solid #625CE7; outline-offset: 2px }

.pulse { animation: fractionPulse 1.1s ease-in-out infinite }

@keyframes fractionPulse {
  0%, 100% { stroke-width: 1.5 }
  50% { stroke-width: 3.5 }
}

/* ทรงตั้ง — เวทีแคบ ความกว้างคือของหายาก ให้รูปกินพื้นที่มากขึ้นตามสัดส่วน */
@container kcstage (aspect-ratio < 0.9) {
  .sizeSm { width: max(64px, 26cqi); height: max(64px, 26cqi) }
  .sizeMd { width: max(96px, 38cqi); height: max(96px, 38cqi) }
  .sizeLg { width: max(120px, 52cqi); height: max(120px, 52cqi) }
  .bar.sizeSm { height: max(30px, 11cqi) }
  .bar.sizeMd { height: max(42px, 15cqi) }
  .bar.sizeLg { height: max(52px, 20cqi) }
}

/* ทรงเตี้ย — ความสูงคือของหายาก วัดจาก cqb แทน cqi (contract ข้อ 5 ขั้น 2)
   ต้องอยู่หลังบล็อกทรงตั้งเพราะ specificity เท่ากัน ตัวหลังชนะ */
@container kcstage (aspect-ratio >= 0.9) and (height < 480px) {
  .sizeSm { width: max(56px, 22cqb); height: max(56px, 22cqb) }
  .sizeMd { width: max(72px, 34cqb); height: max(72px, 34cqb) }
  .sizeLg { width: max(88px, 46cqb); height: max(88px, 46cqb) }
  .bar.sizeSm { height: max(26px, 9cqb) }
  .bar.sizeMd { height: max(32px, 13cqb) }
  .bar.sizeLg { height: max(40px, 17cqb) }
}
```

⚠️ **ห้ามใส่ comma ใน `@container`** — PostCSS ของโปรเจกต์นี้ parse ไม่ได้และทั้ง
stylesheet คอมไพล์ไม่ผ่าน หน้าเว็บขึ้น 500 ทันที ถ้าต้องใช้เงื่อนไขสองชุดให้เขียนแยกสองบล็อก

- [ ] **Step 3: ตรวจว่า TypeScript และ lint ผ่าน**

```bash
npx tsc --noEmit
```

Expected: ไม่มี error ที่ไฟล์ใน `fractions-basic/`

- [ ] **Step 4: Commit**

```bash
git add app/media/mathematics/fractions-basic/components/FractionShape.tsx app/media/mathematics/fractions-basic/components/FractionShape.module.css
git commit -m "$(cat <<'EOF'
feat(fractions): draw the fraction shapes

Size comes from classes rather than an inline custom property, so the
container queries can raise it without needing !important to beat an inline
declaration.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: FractionNumber + Mascot

**Files:**
- Create: `app/media/mathematics/fractions-basic/components/FractionNumber.tsx`
- Create: `app/media/mathematics/fractions-basic/components/FractionNumber.module.css`
- Create: `app/media/mathematics/fractions-basic/components/Mascot.tsx`
- Create: `app/media/mathematics/fractions-basic/components/Mascot.module.css`

- [ ] **Step 1: เขียน FractionNumber.tsx**

```tsx
"use client";

import { readFraction } from "../fractionGeometry";
import styles from "./FractionNumber.module.css";

type Props = {
  numerator: number;
  denominator: number;
  /** ตัวส่วนขึ้นก่อน ตัวเศษขึ้นทีหลัง — ผูกตัวเลขกับภาพทีละครึ่ง */
  reveal?: "denominator" | "full";
  size?: "md" | "lg";
};

export default function FractionNumber({ numerator, denominator, reveal = "full", size = "md" }: Props) {
  const showNumerator = reveal === "full";
  return (
    <span
      className={`${styles.fraction} ${size === "lg" ? styles.lg : styles.md}`}
      aria-label={showNumerator ? readFraction(numerator, denominator) : `แบ่ง ${denominator} ส่วน`}
    >
      <b className={showNumerator ? styles.numeratorIn : styles.numeratorHidden} aria-hidden="true">
        {showNumerator ? numerator : ""}
      </b>
      <i className={styles.rule} aria-hidden="true" />
      <b className={styles.denominator} aria-hidden="true">{denominator}</b>
    </span>
  );
}
```

- [ ] **Step 2: เขียน FractionNumber.module.css**

```css
.fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  color: #1F2A44;
  font-weight: 800;
}

.md { font-size: var(--kc-fs-title) }
.lg { font-size: var(--kc-fs-display) }

.numeratorIn { animation: numeratorIn 0.42s ease both }
/* ที่ว่างของตัวเศษต้องถูกจองไว้ตั้งแต่แรก ไม่งั้นเส้นคั่นกระโดดตอนตัวเลขโผล่ */
.numeratorHidden { visibility: hidden }
.numeratorIn::after, .numeratorHidden::after { content: "0"; visibility: hidden; width: 0; display: block; height: 0 }

.rule {
  display: block;
  width: 1.35em;
  height: 0.11em;
  min-height: 2px;
  margin: 0.12em 0;
  background: currentColor;
  border-radius: 999px;
}

@keyframes numeratorIn {
  from { opacity: 0; transform: translateY(0.35em) scale(0.7) }
  to { opacity: 1; transform: none }
}
```

- [ ] **Step 3: เขียน Mascot.tsx**

```tsx
"use client";

import styles from "./Mascot.module.css";

type Props = {
  /** idle ตอนสอน cheer ตอนตอบถูก think ตอนตอบผิด */
  mood?: "idle" | "cheer" | "think";
  size?: "sm" | "md";
};

/**
 * มาสคอตของสื่อเศษส่วน เขียนใหม่แทนการใช้ KcFace ของ /media/english
 *
 * KcFace วาง geometry ไว้ใน inline style ทั้งหมด (width, height, position, top)
 * ซึ่ง container query เอื้อมไม่ถึงและ inline ชนะทุกกฎ — เป็นข้อผิดพลาดชุดเดียวกับ
 * ที่ media-stage-contract.md ข้อ 3 บันทึกไว้ และมี 7 เกมใช้ KcFace อยู่
 * การแก้ที่ต้นทางจะกระทบทั้งหมด จึงเขียนตัวใหม่ที่คุมขนาดจาก CSS ตั้งแต่แรก
 */
export default function Mascot({ mood = "idle", size = "md" }: Props) {
  return (
    <svg
      viewBox="0 0 64 74"
      className={`${styles.mascot} ${size === "sm" ? styles.sm : styles.md} ${styles[mood]}`}
      role="img"
      aria-label="เพื่อนในบทเรียน"
    >
      <ellipse className={styles.shadow} cx="32" cy="71" rx="18" ry="3" />
      <rect className={styles.body} x="14" y="44" width="36" height="26" rx="12" />
      <circle className={styles.head} cx="32" cy="28" r="20" />
      <circle className={styles.eye} cx="25" cy="27" r="3" />
      <circle className={styles.eye} cx="39" cy="27" r="3" />
      <path className={styles.mouth} d="M26 35 Q32 40 38 35" fill="none" />
      <circle className={styles.cheek} cx="19" cy="33" r="3.2" />
      <circle className={styles.cheek} cx="45" cy="33" r="3.2" />
    </svg>
  );
}
```

- [ ] **Step 4: เขียน Mascot.module.css**

```css
.mascot { display: block; flex: none; overflow: visible }

.sm { width: max(44px, 8cqi); height: auto }
.md { width: max(64px, 12cqi); height: auto }

.shadow { fill: rgba(31, 42, 68, 0.12) }
.body { fill: #625CE7 }
.head { fill: #FFE0BD; stroke: #1F2A44; stroke-width: 1.5 }
.eye { fill: #1F2A44 }
.mouth { stroke: #1F2A44; stroke-width: 2; stroke-linecap: round }
.cheek { fill: #FFB3C1; opacity: 0.75 }

.idle { animation: mascotBreathe 3.2s ease-in-out infinite }
.cheer { animation: mascotCheer 0.5s ease-in-out 2 }
.think .mouth { d: path("M26 38 Q32 34 38 38") }

@keyframes mascotBreathe {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-2px) }
}

@keyframes mascotCheer {
  0%, 100% { transform: translateY(0) rotate(0) }
  30% { transform: translateY(-8px) rotate(-6deg) }
  60% { transform: translateY(-4px) rotate(5deg) }
}

@container kcstage (aspect-ratio >= 0.9) and (height < 480px) {
  .sm { width: max(36px, 9cqb) }
  .md { width: max(46px, 13cqb) }
}
```

- [ ] **Step 5: ตรวจว่า TypeScript ผ่าน**

```bash
npx tsc --noEmit
```

Expected: ไม่มี error ที่ไฟล์ใน `fractions-basic/`

- [ ] **Step 6: Commit**

```bash
git add app/media/mathematics/fractions-basic/components/FractionNumber.tsx app/media/mathematics/fractions-basic/components/FractionNumber.module.css app/media/mathematics/fractions-basic/components/Mascot.tsx app/media/mathematics/fractions-basic/components/Mascot.module.css
git commit -m "$(cat <<'EOF'
feat(fractions): add the fraction numeral and the mascot

The numeral reserves the numerator's space while it is still hidden, so the
rule does not jump when the number arrives on the third lesson step.

The mascot is written fresh rather than reusing KcFace, whose geometry is
inline and therefore out of reach of every container query; KcFace has seven
callers, so fixing it at the source is a separate job.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: App shell + หน้า home + route ที่เปิดได้จริง

**Files:**
- Create: `app/media/mathematics/fractions-basic/FractionsApp.tsx`
- Create: `app/media/mathematics/fractions-basic/FractionsApp.module.css`
- Create: `app/media/mathematics/fractions-basic/page.tsx`

- [ ] **Step 1: เขียน FractionsApp.tsx (โครง + home เท่านั้น)**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { KcSfx, hoverSfxDelegate } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import Mascot from "./components/Mascot";
import type { Screen } from "./types";
import styles from "./FractionsApp.module.css";

const HOME_CARDS: { screen: Screen; icon: string; title: string; desc: string }[] = [
  { screen: "lesson", icon: "📖", title: "บทเรียน", desc: "รู้จักเศษส่วนจากภาพ 5 สไลด์" },
  { screen: "game-choice", icon: "🎯", title: "เกมฝึก", desc: "2 เกม รวม 12 ข้อ" },
  { screen: "quiz", icon: "🙋", title: "ถามหน้าชั้น", desc: "8 คำถาม ครูถาม เด็กชูมือ" },
];

export default function FractionsApp() {
  useTrackToolUse("media-mathematics-fractions-basic");
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const [screen, setScreen] = useState<Screen>("home");
  const [sound, setSound] = useState(true);

  const play = (name: Parameters<typeof KcSfx.play>[0]) => { if (sound) KcSfx.play(name); };
  const go = (next: Screen) => { play("click"); setScreen(next); };
  const home = () => setScreen("home");

  return (
    <div {...stageProps} className="kc-stage">
      <div className={`kc-stage-body ${styles.body}`} onMouseOver={hoverSfxDelegate}>
        <div className={styles.decorations} aria-hidden="true">
          <span>½</span><span>¼</span><span>●</span><span>◔</span><span>⅓</span>
        </div>

        <header className={styles.toolbar}>
          <button type="button" className={`kc-tap-chrome ${styles.brandButton}`} onClick={home} aria-label="กลับเมนูสื่อ">
            <strong className="kc-title">รู้จักเศษส่วน</strong>
          </button>
          <div className={styles.toolbarActions}>
            <Link href="/media/mathematics" className={`kc-tap-chrome ${styles.toolbarButton}`}>☰ <span>เมนู</span></Link>
            <button
              type="button"
              className={`kc-tap-chrome ${styles.toolbarButton}`}
              aria-pressed={!sound}
              aria-label={sound ? "ปิดเสียง" : "เปิดเสียง"}
              onClick={() => { const next = !sound; setSound(next); KcSfx.setMuted(!next); }}
            >{sound ? "🔊" : "🔇"}</button>
            <button
              type="button"
              className={`kc-tap-chrome ${styles.toolbarButton}`}
              onClick={toggle}
              aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            >{isFull ? "↙" : "⛶"}</button>
          </div>
        </header>

        {screen === "home" && (
          <main className={`${styles.screen} ${styles.home}`} data-stage="home">
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>คณิตศาสตร์ ป.2–3</span>
              <h1>รู้จักเศษส่วน</h1>
              <p className={styles.heroLead}>แบ่งเท่า ๆ กัน แล้วเขียนเป็นตัวเลขได้ยังไง</p>
            </div>
            <div className={styles.homeGrid}>
              {HOME_CARDS.map((card) => (
                <button key={card.screen} type="button" className={`kc-tap ${styles.homeCard}`} onClick={() => go(card.screen)}>
                  <span className={styles.homeIcon} aria-hidden="true">{card.icon}</span>
                  <span className={styles.homeText}>
                    <strong>{card.title}</strong>
                    <small>{card.desc}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.homeFooter}>
              <Mascot size="sm" />
              <button type="button" className={`kc-tap ${styles.primary}`} onClick={() => go("lesson")}>
                ▶️ เริ่มตั้งแต่ต้น
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: เขียน FractionsApp.module.css**

```css
/* เวทีของสื่อเศษส่วน — ขนาดทุกอย่างของทุกหน้าจออยู่ในไฟล์นี้
   ห้ามใช้ vw/vh/dvh/innerWidth ที่ไหนเลย (media-stage-contract ข้อ 1) */

.body {
  background: linear-gradient(160deg, #FFF9F2 0%, #F3F1FF 100%);
  color: #1F2A44;
  display: flex;
  flex-direction: column;
  font-size: var(--kc-fs-body);
}

/* ของตกแต่ง — pointer-events:none บังคับตาม contract ข้อ 4.5
   ทั้งเพื่อไม่ให้บังปุ่ม และเพื่อให้ audit-stage แยกออกจากเนื้อหาที่หลุดเวที */
.decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.16;
  font-size: var(--kc-fs-display);
}
.decorations > span { position: absolute; animation: fractionDrift 14s ease-in-out infinite }
.decorations > span:nth-child(1) { top: 12%; left: 6% }
.decorations > span:nth-child(2) { top: 68%; left: 12%; animation-delay: -3s }
.decorations > span:nth-child(3) { top: 22%; right: 9%; animation-delay: -6s }
.decorations > span:nth-child(4) { top: 74%; right: 14%; animation-delay: -9s }
.decorations > span:nth-child(5) { top: 45%; right: 4%; animation-delay: -12s }

@keyframes fractionDrift {
  0%, 100% { transform: translate3d(0, 0, 0) }
  50% { transform: translate3d(6px, -12px, 0) }
}

.toolbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kc-gap);
  padding: 8px var(--kc-pad);
  flex: none;
}

.brandButton {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: var(--kc-fs-head);
  cursor: pointer;
  padding: 0 6px;
}

.toolbarActions { display: flex; align-items: center; gap: 6px }

.toolbarButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 10px;
  border: 1px solid rgba(31, 42, 68, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  color: inherit;
  font-size: var(--kc-fs-label);
  text-decoration: none;
  cursor: pointer;
}

/* ทุกหน้าจอกินที่ที่เหลือแล้วจัดกึ่งกลางแบบ safe — ถ้าเนื้อหาสูงเกิน
   ส่วนเกินไปกองข้างล่างที่ยังเห็นได้ ไม่ใช่ลอยเหนือเวทีจนหาไม่เจอ (contract ข้อ 5) */
.screen {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  gap: var(--kc-gap);
  padding: 0 var(--kc-pad) var(--kc-pad);
  text-align: center;
}

/* class ประจำแต่ละหน้าจอ — มีไว้ให้แต่ละหน้าจอมีที่ยึดของตัวเองเวลาต้องแก้
   ทรงใดทรงหนึ่ง และเพื่อไม่ให้ styles.lesson เป็น undefined ตอนต่อ className */
.lesson, .game, .quiz, .result { width: 100% }

.heroCopy { display: flex; flex-direction: column; align-items: center; gap: 4px }
.eyebrow {
  font-size: var(--kc-fs-label);
  font-weight: 700;
  color: #C85C12;
  background: #FFF0E4;
  padding: 3px 10px;
  border-radius: 999px;
}
.heroCopy h1 { margin: 0; font-size: var(--kc-fs-display); line-height: 1.2 }
.heroLead { margin: 0; font-size: var(--kc-fs-body); color: #4A5570 }

.homeGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--kc-gap);
  width: 100%;
  max-width: 720px;
}

.homeCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--kc-pad);
  border: 1px solid rgba(31, 42, 68, 0.1);
  border-radius: var(--kc-radius);
  background: #fff;
  color: inherit;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(31, 42, 68, 0.06);
}
.homeCard:hover { transform: translateY(-2px); transition: transform 0.18s ease }
.homeIcon { font-size: var(--kc-fs-title) }
.homeText { display: flex; flex-direction: column; gap: 2px }
.homeText strong { font-size: var(--kc-fs-head) }
.homeText small { font-size: var(--kc-fs-label); color: #4A5570; line-height: 1.45 }

.homeFooter { display: flex; align-items: center; gap: var(--kc-gap) }

.primary {
  padding: 10px 22px;
  border: 0;
  border-radius: 999px;
  background: #625CE7;
  color: #fff;
  font-size: var(--kc-fs-head);
  font-weight: 700;
  cursor: pointer;
}

/* ทรงตั้ง — ขาดความกว้าง การ์ดเรียงลงมา เก็บเนื้อหาครบ แค่บีบระยะห่าง
   (contract ข้อ 5 ตารางแนวนอน/แนวตั้ง) */
@container kcstage (aspect-ratio < 0.9) {
  .homeGrid { grid-template-columns: minmax(0, 1fr); max-width: 420px }
  .homeCard { flex-direction: row; text-align: left; align-items: center }
  .homeText { align-items: flex-start }
}

/* ทรงเตี้ย — ขาดความสูง ตัดคำอธิบายใต้การ์ดและคำโปรยทิ้ง (ขั้น 4)
   margin/padding เป็น px คงที่ ไม่ใช่ cqi ที่โตพอดีตอนที่เหลือน้อยที่สุด (ขั้น 1) */
@container kcstage (aspect-ratio >= 0.9) and (height < 480px) {
  .screen { gap: 8px; padding: 0 12px 10px }
  .heroLead { display: none }
  .homeText small { display: none }
  .homeCard { padding: 8px 10px }
  .homeGrid { max-width: 620px }
}
```

- [ ] **Step 3: เขียน page.tsx**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import FractionsApp from "./FractionsApp";

const PAGE_URL = "https://www.khuncool.com/media/mathematics/fractions-basic";
const TITLE = "รู้จักเศษส่วน สื่อการสอนคณิตศาสตร์ ป.2-3 | khuncool";
const DESCRIPTION = "สื่อการสอนเศษส่วน ป.2-3 เริ่มจากการแบ่งเท่า ๆ กัน อ่านและเขียนเศษส่วนจากภาพ พร้อมเกมฝึก 12 ข้อและคำถามหน้าชั้น 8 ข้อ ใช้ฟรีบนจอห้องเรียน มือถือ และแท็บเล็ต";

const OG_IMAGE = {
  url: "https://www.khuncool.com/assets/game-covers/fractions-basic.webp",
  width: 960,
  height: 540,
  alt: "สื่อการสอนรู้จักเศษส่วน สำหรับนักเรียนชั้น ป.2-3",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["สื่อการสอนเศษส่วน", "เศษส่วน ป.2", "เศษส่วน ป.3", "เกมเศษส่วน", "ตัวเศษ ตัวส่วน", "สื่อคณิตศาสตร์ประถม"],
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: "khuncool", locale: "th_TH", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE.url] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "สื่อคณิตศาสตร์", item: "https://www.khuncool.com/media/mathematics" },
        { "@type": "ListItem", position: 3, name: "รู้จักเศษส่วน", item: PAGE_URL },
      ],
    },
    {
      "@type": "LearningResource",
      name: "รู้จักเศษส่วน",
      url: PAGE_URL,
      image: OG_IMAGE.url,
      inLanguage: "th-TH",
      educationalLevel: "ประถมศึกษาปีที่ 2–3",
      learningResourceType: "Interactive educational game",
      teaches: ["การแบ่งเท่า ๆ กัน", "การอ่านและเขียนเศษส่วนจากภาพ", "ความหมายของตัวเศษและตัวส่วน"],
      isAccessibleForFree: true,
    },
  ],
};

export default function FractionsBasicPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/">หน้าแรก</Link><span>›</span>
          <Link href="/media/mathematics">สื่อคณิตศาสตร์</Link><span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">รู้จักเศษส่วน</span>
        </div>
      </nav>
      <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <div className="mb-2 flex gap-2">
          <span className="rounded-full bg-[#FFF0E4] px-2.5 py-1 text-[10px] font-bold text-[#C85C12]">คณิตศาสตร์ ป.2–3</span>
          <span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">ใช้ฟรี ไม่ต้องสมัคร</span>
        </div>
        <h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">รู้จักเศษส่วน 🍕</h1>
        <p className="m-0 max-w-[86ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">
          เริ่มจากคำถามว่าอะไรคือการแบ่งเท่า ๆ กัน แล้วค่อยอ่านและเขียนเศษส่วนจากภาพ ปิดท้ายด้วยเกมฝึกและคำถามหน้าชั้น ออกแบบให้ครูฉายขึ้นจอและคุมจังหวะเองได้ทั้งคาบ
        </p>
      </header>
      <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="สื่อรู้จักเศษส่วน">
        <FractionsApp />
        <p className="mx-auto mt-3 text-center text-xs leading-6 text-ink-faint md:text-sm">
          ไม่มีการจับเวลาและไม่เก็บคะแนนรายคน เด็กตอบผิดลองใหม่ได้ทันที
        </p>
      </section>
      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="m-0 mb-2 text-lg md:text-2xl">เด็กจะได้เรียนรู้อะไร</h2>
            <p className="m-0 text-sm leading-7 text-ink-secondary">
              แยกได้ว่าอะไรคือการแบ่งเท่า ๆ กันและอะไรไม่ใช่ อ่านและเขียนเศษส่วนอย่างง่ายจากภาพ และบอกได้ว่าตัวเศษกับตัวส่วนบอกอะไร
            </p>
          </div>
          <div>
            <h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2>
            <p className="m-0 text-sm leading-7 text-ink-secondary">
              เดินบทเรียน 5 สไลด์พร้อมชวนเด็กอธิบายภาพที่เห็น จากนั้นเล่นเกมฝึกทั้งห้องโดยให้เด็กออกมากดที่จอ ปิดคาบด้วยคำถามหน้าชั้น 8 ข้อ
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: เปิด dev server แล้วดูว่า route ขึ้นจริง**

```bash
npm run dev
```

เปิด `http://localhost:3000/media/mathematics/fractions-basic` ต้องเห็นหน้า home
ที่มีการ์ด 3 ใบและปุ่ม "เริ่มตั้งแต่ต้น" กดปุ่มเต็มจอแล้วเวทีต้องเต็มจอจริง

⚠️ ถ้า route คืน 404 ทันทีใน 0.04 วินาทีโดยไม่พยายาม compile นั่นคือ dev server ตาย
ไม่ใช่โค้ดพัง — `npm run dev` ซ้ำเฉย ๆ ไม่ช่วยเพราะตัวเก่ายังถือ port 3000:

```bash
netstat -ano | grep ":3000"
taskkill /PID <pid> /F
npm run dev
```

- [ ] **Step 5: Commit**

```bash
git add app/media/mathematics/fractions-basic/FractionsApp.tsx app/media/mathematics/fractions-basic/FractionsApp.module.css app/media/mathematics/fractions-basic/page.tsx
git commit -m "$(cat <<'EOF'
feat(fractions): put the media on a stage with its home screen

The home screen is where most of the suite's failures live, so it gets the
treatment section 5 of the contract prescribes up front: it takes the
remaining space and safe-centres, and the short shape drops the lead line
and the card captions rather than trying to fit them.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: LessonScreen

**Files:**
- Create: `app/media/mathematics/fractions-basic/components/LessonScreen.tsx`
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.module.css` (เพิ่มสไตล์ของบทเรียน)
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.tsx` (ต่อหน้าจอเข้า state machine)

- [ ] **Step 1: เขียน LessonScreen.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import FractionNumber from "./FractionNumber";
import FractionShape from "./FractionShape";
import { LESSON_SLIDES } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = { onFinish: () => void; onSound: (name: "click" | "pop") => void };

export default function LessonScreen({ onFinish, onSound }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const slide = LESSON_SLIDES[slideIndex];
  const current = slide.steps[step];
  const isLastStep = step === slide.steps.length - 1;
  const isLastSlide = slideIndex === LESSON_SLIDES.length - 1;

  // เล่นอัตโนมัติ 900ms/สเต็ป แล้วหยุดเองเมื่อจบสไลด์ ครูกดหยุดได้ตลอด
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setStep((value) => {
        if (value >= slide.steps.length - 1) { setPlaying(false); return value; }
        return value + 1;
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [playing, slide.steps.length]);

  const goSlide = (next: number) => {
    onSound("click");
    setSlideIndex(next);
    setStep(0);
    setPlaying(false);
  };

  const nextStep = () => {
    onSound("pop");
    setPlaying(false);
    if (!isLastStep) { setStep(step + 1); return; }
    if (!isLastSlide) { goSlide(slideIndex + 1); return; }
    onFinish();
  };

  const prevStep = () => {
    onSound("pop");
    setPlaying(false);
    if (step > 0) { setStep(step - 1); return; }
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
      setStep(LESSON_SLIDES[slideIndex - 1].steps.length - 1);
    }
  };

  return (
    <main className={`${styles.screen} ${styles.lesson}`} data-stage="lesson">
      <div className={styles.lessonTabs} role="tablist" aria-label="หัวข้อบทเรียน">
        {LESSON_SLIDES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={slideIndex === index}
            className={`kc-tap ${styles.lessonTab} ${slideIndex === index ? styles.lessonTabOn : ""}`}
            onClick={() => goSlide(index)}
          >{index + 1}</button>
        ))}
      </div>

      <div className={styles.lessonStage} role="status" aria-live="polite">
        <h2 className={styles.lessonTitle}>{slide.title}</h2>
        <div className={styles.lessonShapes}>
          {current.shapes.map((shape, index) => (
            <FractionShape
              key={`${slide.id}-${step}-${index}`}
              shape={shape.shape}
              parts={shape.parts}
              filled={shape.filled}
              unequal={shape.unequal}
              highlight={current.highlight}
              size={current.shapes.length > 1 ? "md" : "lg"}
              label={shape.unequal
                ? `รูปที่แบ่ง ${shape.parts} ส่วนไม่เท่ากัน`
                : `รูปแบ่ง ${shape.parts} ส่วนเท่ากัน ระบาย ${shape.filled.length} ส่วน`}
            />
          ))}
          {slide.fraction && current.reveal !== "none" && (
            <FractionNumber
              numerator={slide.fraction.numerator}
              denominator={slide.fraction.denominator}
              reveal={current.reveal}
              size="lg"
            />
          )}
        </div>
        <p className={styles.lessonCaption}>{current.caption}</p>
      </div>

      <div className={styles.lessonControls}>
        <button
          type="button"
          className={`kc-tap ${styles.ghost}`}
          onClick={prevStep}
          disabled={slideIndex === 0 && step === 0}
        >← ก่อนหน้า</button>
        <button
          type="button"
          className={`kc-tap ${styles.ghost}`}
          onClick={() => { onSound("click"); setStep(0); setPlaying(!playing); }}
          aria-pressed={playing}
        >{playing ? "⏸ หยุด" : "▶ เล่นเอง"}</button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={nextStep}>
          {isLastSlide && isLastStep ? "ไปเล่นเกม →" : "ถัดไป →"}
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: เพิ่มสไตล์ของบทเรียนต่อท้าย FractionsApp.module.css**

วางไว้ **ก่อน** บล็อก `@container` ที่มีอยู่แล้ว จากนั้นเพิ่มกฎทรงลงในบล็อกเดิม

```css
.lessonTabs { display: flex; gap: 6px; flex: none }

.lessonTab {
  width: 40px;
  border: 1px solid rgba(31, 42, 68, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: inherit;
  font-size: var(--kc-fs-label);
  font-weight: 700;
  cursor: pointer;
}
.lessonTabOn { background: #625CE7; border-color: #625CE7; color: #fff }

.lessonStage {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  gap: var(--kc-gap);
  width: 100%;
}

.lessonTitle { margin: 0; font-size: var(--kc-fs-title) }

.lessonShapes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--kc-gap);
  flex-wrap: wrap;
}

.lessonCaption {
  margin: 0;
  max-width: 56ch;
  font-size: var(--kc-fs-body);
  line-height: 1.6;
  color: #4A5570;
}

.lessonControls { display: flex; gap: var(--kc-gap); flex: none; flex-wrap: wrap; justify-content: center }

.ghost {
  padding: 8px 16px;
  border: 1px solid rgba(31, 42, 68, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: inherit;
  font-size: var(--kc-fs-label);
  font-weight: 600;
  cursor: pointer;
}
.ghost:disabled { opacity: 0.4; cursor: default }
```

จากนั้นเพิ่มกฎเข้าไปใน **บล็อกทรงเตี้ยที่มีอยู่แล้ว** (`aspect-ratio >= 0.9` และ `height < 480px`):

```css
  .lessonTitle { font-size: var(--kc-fs-head) }
  .lessonCaption { font-size: var(--kc-fs-label); line-height: 1.45 }
  .lessonShapes { gap: 10px }
```

- [ ] **Step 3: ต่อ LessonScreen เข้า FractionsApp.tsx**

เพิ่ม import และเรนเดอร์ต่อจากบล็อก `screen === "home"`:

```tsx
import LessonScreen from "./components/LessonScreen";
```

```tsx
        {screen === "lesson" && (
          <LessonScreen onFinish={() => go("game-choice")} onSound={play} />
        )}
```

- [ ] **Step 4: ตรวจด้วยตาในเบราว์เซอร์**

เปิด `/media/mathematics/fractions-basic` → กด "บทเรียน" → เดินครบ 5 สไลด์ × 3 สเต็ป
ต้องเห็น:
- สไลด์ 1 สเต็ป 1 เป็นวงกลมเต็มใบไม่มีเส้นแบ่ง
- สไลด์ 2 สเต็ป 2 ตัวส่วนขึ้นก่อนโดยที่ตัวเศษยังว่าง เส้นคั่นไม่กระโดดตอนสเต็ป 3
- สไลด์ 1 สเต็ป 3 แท่งขวาแบ่งไม่เท่ากันจริง
- กด ▶ แล้วเดินเองจนจบสไลด์แล้วหยุด

- [ ] **Step 5: Commit**

```bash
git add app/media/mathematics/fractions-basic/components/LessonScreen.tsx app/media/mathematics/fractions-basic/FractionsApp.tsx app/media/mathematics/fractions-basic/FractionsApp.module.css
git commit -m "$(cat <<'EOF'
feat(fractions): teach the five lesson slides

The denominator appears a step before the numerator so each number is tied
to the part of the picture it counts - the whole, then the shaded slices.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: ChoiceGame

**Files:**
- Create: `app/media/mathematics/fractions-basic/components/ChoiceGame.tsx`
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.module.css`
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.tsx`

- [ ] **Step 1: เขียน ChoiceGame.tsx**

```tsx
"use client";

import { useState } from "react";
import FractionNumber from "./FractionNumber";
import FractionShape from "./FractionShape";
import Mascot from "./Mascot";
import { CHOICE_QUESTIONS } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = {
  onFinish: () => void;
  onSound: (name: "correct" | "pop" | "click") => void;
};

export default function ChoiceGame({ onFinish, onSound }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const question = CHOICE_QUESTIONS[index];
  const isCorrect = picked !== null && picked === question.answerIndex;

  const pick = (option: number) => {
    if (isCorrect) return;
    setPicked(option);
    if (option !== question.answerIndex) { onSound("pop"); return; }
    onSound("correct");
    window.setTimeout(() => {
      if (index + 1 >= CHOICE_QUESTIONS.length) { onFinish(); return; }
      setIndex(index + 1);
      setPicked(null);
    }, 1200);
  };

  return (
    <main className={`${styles.screen} ${styles.game}`} data-stage="game" data-game="choice">
      {isCorrect && (
        <div className={styles.burst} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className={styles.burstStar}>★</span>)}
        </div>
      )}

      <div className={styles.progress} aria-label={`ข้อ ${index + 1} จาก ${CHOICE_QUESTIONS.length}`}>
        {CHOICE_QUESTIONS.map((row, i) => (
          <span key={row.id} className={i < index || (i === index && isCorrect) ? styles.starOn : styles.starOff} aria-hidden="true">★</span>
        ))}
      </div>

      <div className={styles.gameBoard}>
        <div className={styles.gamePrompt}>
          <p className={styles.gameLead}>เลือกภาพที่ตรงกับเลขนี้</p>
          <FractionNumber numerator={question.numerator} denominator={question.denominator} size="lg" />
        </div>

        <div className={styles.optionRow}>
          {question.options.map((option, i) => (
            <button
              key={`${question.id}-${i}`}
              type="button"
              className={`kc-tap ${styles.option} ${picked === i ? (isCorrect ? styles.optionRight : styles.optionWrong) : ""}`}
              onClick={() => pick(i)}
            >
              <FractionShape
                shape={option.shape}
                parts={option.parts}
                filled={option.filled}
                unequal={option.unequal}
                size="sm"
                label={option.unequal
                  ? `ตัวเลือกที่ ${i + 1} แบ่ง ${option.parts} ส่วนไม่เท่ากัน ระบาย ${option.filled.length} ส่วน`
                  : `ตัวเลือกที่ ${i + 1} แบ่ง ${option.parts} ส่วนเท่ากัน ระบาย ${option.filled.length} ส่วน`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {isCorrect && <><Mascot mood="cheer" size="sm" /><strong className={styles.feedbackGood}>ถูกต้อง! {question.explain}</strong></>}
        {picked !== null && !isCorrect && (
          <>
            <Mascot mood="think" size="sm" />
            <span className={styles.feedbackRetry}>ยังไม่ใช่ ลองอีกที — {question.explain}</span>
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: เพิ่มสไตล์ของเกมต่อท้าย FractionsApp.module.css (ก่อนบล็อก `@container`)**

```css
.progress { display: flex; gap: 4px; flex: none; font-size: var(--kc-fs-head) }
.starOn { color: #F4A261 }
.starOff { color: rgba(31, 42, 68, 0.16) }

.gameBoard {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  gap: var(--kc-gap);
  width: 100%;
}

.gamePrompt { display: flex; flex-direction: column; align-items: center; gap: 4px }
.gameLead { margin: 0; font-size: var(--kc-fs-body); color: #4A5570 }

.optionRow { display: flex; gap: var(--kc-gap); flex-wrap: wrap; justify-content: center }

.option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--kc-pad);
  border: 2px solid rgba(31, 42, 68, 0.12);
  border-radius: var(--kc-radius);
  background: #fff;
  cursor: pointer;
}
.optionRight { border-color: #2A9D8F; background: #E8F7F4 }
/* ตอบผิดใช้โทนอำพัน ไม่ใช่แดง — เพื่อนทั้งห้องเห็นจอเดียวกัน */
.optionWrong { border-color: #E9A23B; background: #FFF4E2; animation: optionShake 0.36s ease }

@keyframes optionShake {
  0%, 100% { transform: translateX(0) }
  25% { transform: translateX(-5px) }
  75% { transform: translateX(5px) }
}

.feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: none;
  min-height: 2.6em;
  font-size: var(--kc-fs-body);
  text-align: left;
}
.feedbackGood { color: #1D7A6E }
.feedbackRetry { color: #A9671A }

/* คอนเฟตตี้ — pointer-events:none บังคับตาม contract ข้อ 4.5
   talk-card เคยให้คอนเฟตตี้บังปุ่มจริง 1.5-3 วินาทีเพราะขาดบรรทัดนี้ */
.burst { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 3 }
.burstStar {
  position: absolute;
  top: 40%;
  left: 50%;
  color: #F4A261;
  font-size: var(--kc-fs-head);
  animation: burstOut 1.1s ease-out forwards;
}
.burstStar:nth-child(2n) { color: #625CE7 }
.burstStar:nth-child(3n) { color: #2A9D8F }
.burstStar:nth-child(1) { --burst-x: -180px; --burst-y: -120px }
.burstStar:nth-child(2) { --burst-x: 150px; --burst-y: -140px }
.burstStar:nth-child(3) { --burst-x: -120px; --burst-y: 90px }
.burstStar:nth-child(4) { --burst-x: 190px; --burst-y: 70px }
.burstStar:nth-child(5) { --burst-x: -220px; --burst-y: 20px }
.burstStar:nth-child(6) { --burst-x: 60px; --burst-y: -190px }
.burstStar:nth-child(7) { --burst-x: -60px; --burst-y: -200px }
.burstStar:nth-child(8) { --burst-x: 230px; --burst-y: -30px }
.burstStar:nth-child(9) { --burst-x: -160px; --burst-y: 150px }
.burstStar:nth-child(10) { --burst-x: 110px; --burst-y: 160px }
.burstStar:nth-child(11) { --burst-x: 20px; --burst-y: 200px }
.burstStar:nth-child(12) { --burst-x: -20px; --burst-y: -150px }

@keyframes burstOut {
  from { opacity: 1; transform: translate(-50%, -50%) scale(0.4) }
  to { opacity: 0; transform: translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y))) scale(1.1) }
}
```

เพิ่มเข้า **บล็อกทรงเตี้ยเดิม**:

```css
  .gameBoard { flex-direction: row; gap: 12px }
  .gamePrompt { flex: 0 0 auto }
  .gameLead { font-size: var(--kc-fs-label) }
  .option { padding: 8px }
  .feedback { min-height: 2em; font-size: var(--kc-fs-label) }
```

- [ ] **Step 3: ต่อ ChoiceGame เข้า FractionsApp.tsx**

```tsx
import ChoiceGame from "./components/ChoiceGame";
```

```tsx
        {screen === "game-choice" && (
          <ChoiceGame onFinish={() => setScreen("game-paint")} onSound={play} />
        )}
```

- [ ] **Step 4: ตรวจด้วยตาในเบราว์เซอร์**

เล่นเกมให้ครบ 6 ข้อ ตรวจว่า:
- กดผิดแล้วขอบเป็นสีอำพัน ไม่ใช่แดง และเล่นต่อได้
- กดถูกแล้วดาวกระจายและเดินไปข้อถัดไปเองใน ~1.2 วิ
- แถบดาวข้างบนเพิ่มขึ้นตามข้อที่ผ่าน
- ข้อ `c3` (ตัวลวงแบ่งไม่เท่ากัน) ภาพสื่อความจริงว่าแบ่งไม่เท่ากัน
  ถ้าวงกลมดูไม่ออก ให้เปลี่ยน `c3` ใน `fractionsData.ts` เป็น `shape: "bar"` ทั้งสามตัวเลือก
  แล้วรัน `node --test app/media/mathematics/fractions-basic/fractionsData.test.mjs` ซ้ำ

- [ ] **Step 5: Commit**

```bash
git add app/media/mathematics/fractions-basic/components/ChoiceGame.tsx app/media/mathematics/fractions-basic/FractionsApp.tsx app/media/mathematics/fractions-basic/FractionsApp.module.css
git commit -m "$(cat <<'EOF'
feat(fractions): add the pick-the-picture game

A wrong answer is amber and keeps the question open rather than red and
final: the whole class is watching one screen, and the point is to look at
the picture again.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: PaintGame

**Files:**
- Create: `app/media/mathematics/fractions-basic/components/PaintGame.tsx`
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.module.css`
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.tsx`

- [ ] **Step 1: เขียน PaintGame.tsx**

```tsx
"use client";

import { useState } from "react";
import FractionNumber from "./FractionNumber";
import FractionShape from "./FractionShape";
import Mascot from "./Mascot";
import { PAINT_QUESTIONS } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = {
  onFinish: () => void;
  onSound: (name: "correct" | "pop" | "click") => void;
};

export default function PaintGame({ onFinish, onSound }: Props) {
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState<number[]>([]);
  const [checked, setChecked] = useState<"right" | "wrong" | null>(null);

  const question = PAINT_QUESTIONS[index];
  // ระบายส่วนไหนก็ได้ ขอให้ครบจำนวน — เศษส่วนไม่สนใจว่าเป็นชิ้นไหน
  const isRight = filled.length === question.numerator;

  const toggle = (part: number) => {
    if (checked === "right") return;
    setChecked(null);
    onSound("click");
    setFilled((current) =>
      current.includes(part) ? current.filter((value) => value !== part) : [...current, part]);
  };

  const check = () => {
    if (!isRight) { setChecked("wrong"); onSound("pop"); return; }
    setChecked("right");
    onSound("correct");
    window.setTimeout(() => {
      if (index + 1 >= PAINT_QUESTIONS.length) { onFinish(); return; }
      setIndex(index + 1);
      setFilled([]);
      setChecked(null);
    }, 1200);
  };

  return (
    <main className={`${styles.screen} ${styles.game}`} data-stage="game" data-game="paint">
      {checked === "right" && (
        <div className={styles.burst} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className={styles.burstStar}>★</span>)}
        </div>
      )}

      <div className={styles.progress} aria-label={`ข้อ ${index + 1} จาก ${PAINT_QUESTIONS.length}`}>
        {PAINT_QUESTIONS.map((row, i) => (
          <span key={row.id} className={i < index || (i === index && checked === "right") ? styles.starOn : styles.starOff} aria-hidden="true">★</span>
        ))}
      </div>

      <div className={styles.gameBoard}>
        <div className={styles.gamePrompt}>
          <p className={styles.gameLead}>แตะให้ระบายได้เท่านี้</p>
          <FractionNumber numerator={question.numerator} denominator={question.denominator} size="lg" />
        </div>

        <FractionShape
          key={question.id}
          shape={question.shape}
          parts={question.denominator}
          filled={filled}
          size="lg"
          onTapPart={toggle}
          label={`แตะเพื่อระบาย รูปแบ่ง ${question.denominator} ส่วน`}
        />

        {/* ตัวนับสด — เปลี่ยนเองโดยผู้ใช้ไม่ได้เปลี่ยนหน้า จึงต้องอยู่ใน live region */}
        <p className={styles.paintCount} role="status" aria-live="polite">
          ตอนนี้ระบายไว้ {filled.length} จาก {question.denominator} ส่วน
        </p>
      </div>

      <div className={styles.paintControls}>
        <button type="button" className={`kc-tap ${styles.ghost}`} onClick={() => { onSound("click"); setFilled([]); setChecked(null); }}>
          ล้างสี
        </button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={check} disabled={checked === "right"}>
          ตรวจคำตอบ
        </button>
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {checked === "right" && <><Mascot mood="cheer" size="sm" /><strong className={styles.feedbackGood}>ถูกต้อง! {question.explain}</strong></>}
        {checked === "wrong" && (
          <>
            <Mascot mood="think" size="sm" />
            <span className={styles.feedbackRetry}>
              ยังไม่ใช่ — ต้องระบาย {question.numerator} ส่วน ตอนนี้ระบายไว้ {filled.length} ส่วน
            </span>
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: เพิ่มสไตล์ต่อท้าย FractionsApp.module.css (ก่อนบล็อก `@container`)**

```css
.paintCount { margin: 0; font-size: var(--kc-fs-body); color: #4A5570 }
.paintControls { display: flex; gap: var(--kc-gap); flex: none; justify-content: center; flex-wrap: wrap }
.primary:disabled { opacity: 0.5; cursor: default }
```

เพิ่มเข้า **บล็อกทรงเตี้ยเดิม**:

```css
  .paintCount { font-size: var(--kc-fs-label) }
```

- [ ] **Step 3: ต่อ PaintGame เข้า FractionsApp.tsx**

```tsx
import PaintGame from "./components/PaintGame";
```

```tsx
        {screen === "game-paint" && (
          <PaintGame onFinish={() => setScreen("quiz")} onSound={play} />
        )}
```

- [ ] **Step 4: ตรวจด้วยตาและวัดขนาดเป้าแตะ**

เปิดที่ 375×812 (มือถือแนวตั้ง) เล่นข้อ `p6` ซึ่งแบ่ง 6 ส่วน — ข้อที่ส่วนย่อยเล็กที่สุด
รันใน devtools console:

```js
[...document.querySelectorAll('[role="button"]')].map((el) => {
  const r = el.getBoundingClientRect();
  return `${Math.round(r.width)}x${Math.round(r.height)}`;
});
```

Expected: ทุกค่า ≥ 24 ทั้งกว้างและสูง (WCAG 2.2 · 2.5.8 — เป็นเกณฑ์ตกของ audit)
ถ้าไม่ถึง ให้เพิ่มขนาดของ `.sizeLg` ในบล็อกทรงตั้งของ `FractionShape.module.css`
**ไม่ใช่** ลดจำนวนส่วนของข้อ `p6`

- [ ] **Step 5: Commit**

```bash
git add app/media/mathematics/fractions-basic/components/PaintGame.tsx app/media/mathematics/fractions-basic/FractionsApp.tsx app/media/mathematics/fractions-basic/FractionsApp.module.css
git commit -m "$(cat <<'EOF'
feat(fractions): add the shade-the-parts game

Any parts count as long as the total is right - a fraction does not care
which slices were taken - and a live counter next to the shape ties the
numerator to what the child just tapped.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: QuizScreen + ResultScreen

**Files:**
- Create: `app/media/mathematics/fractions-basic/components/QuizScreen.tsx`
- Create: `app/media/mathematics/fractions-basic/components/ResultScreen.tsx`
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.module.css`
- Modify: `app/media/mathematics/fractions-basic/FractionsApp.tsx`

- [ ] **Step 1: เขียน QuizScreen.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { loadActiveRosterNames } from "@/lib/classrooms/storage";
import FractionShape from "./FractionShape";
import { QUIZ_QUESTIONS } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = { onFinish: () => void; onSound: (name: "click" | "pop") => void };

export default function QuizScreen({ onFinish, onSound }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [roster, setRoster] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);

  // อ่านรายชื่อห้องที่ครูบันทึกไว้ใน /classrooms ถ้าไม่มีก็ซ่อนปุ่มสุ่มไปเลย
  // ไม่ขึ้นข้อความชวนไปสร้าง — ครูกำลังสอนอยู่ ไม่ใช่เวลาชวนตั้งค่า
  // อ่านใน effect เพราะ localStorage ไม่มีบน server และจะทำให้ hydration ไม่ตรงกัน
  useEffect(() => {
    try { setRoster(loadActiveRosterNames()); } catch { setRoster([]); }
  }, []);

  const question = QUIZ_QUESTIONS[index];
  const isLast = index === QUIZ_QUESTIONS.length - 1;

  const pickStudent = () => {
    if (roster.length === 0) return;
    onSound("pop");
    setPicked(roster[Math.floor(Math.random() * roster.length)]);
  };

  const next = () => {
    onSound("click");
    setPicked(null);
    if (isLast) { onFinish(); return; }
    setIndex(index + 1);
    setRevealed(false);
  };

  return (
    <main className={`${styles.screen} ${styles.quiz}`} data-stage="quiz">
      <div className={styles.quizTop}>
        <span className={styles.quizCount}>ข้อ {index + 1} จาก {QUIZ_QUESTIONS.length}</span>
        {roster.length > 0 && (
          <button type="button" className={`kc-tap-chrome ${styles.toolbarButton}`} onClick={pickStudent}>
            🎲 สุ่มคนตอบ
          </button>
        )}
        {picked && <span className={styles.picked} role="status" aria-live="polite">🙋 {picked}</span>}
      </div>

      <div className={styles.quizBoard} role="status" aria-live="polite">
        <h2 className={styles.quizQuestion}>{question.question}</h2>
        <div className={styles.quizShapes}>
          {question.shapes.map((shape, i) => (
            <FractionShape
              key={`${question.id}-${i}`}
              shape={shape.shape}
              parts={shape.parts}
              filled={shape.filled}
              unequal={shape.unequal}
              size={question.shapes.length > 1 ? "md" : "lg"}
              label={shape.unequal
                ? `รูปที่ ${i + 1} แบ่ง ${shape.parts} ส่วนไม่เท่ากัน ระบาย ${shape.filled.length} ส่วน`
                : `รูปที่ ${i + 1} แบ่ง ${shape.parts} ส่วนเท่ากัน ระบาย ${shape.filled.length} ส่วน`}
            />
          ))}
        </div>
        {revealed && (
          <div className={styles.quizAnswer}>
            <strong>{question.answer}</strong>
            <span>{question.note}</span>
          </div>
        )}
      </div>

      <div className={styles.quizControls}>
        <button
          type="button"
          className={`kc-tap ${styles.ghost}`}
          onClick={() => { onSound("pop"); setRevealed(true); }}
          disabled={revealed}
        >เฉลย</button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={next}>
          {isLast ? "จบบทเรียน →" : "ข้อถัดไป →"}
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: เขียน ResultScreen.tsx**

```tsx
"use client";

import Mascot from "./Mascot";
import styles from "../FractionsApp.module.css";

type Props = { onHome: () => void; onReplay: () => void };

const LEARNED = [
  "เศษส่วนต้องแบ่งเท่า ๆ กันเท่านั้น",
  "ตัวส่วนบอกว่าแบ่งทั้งหมดกี่ส่วน ตัวเศษบอกว่าเอามากี่ส่วน",
  "รูปทรงต่างกันเขียนเป็นเศษส่วนเดียวกันได้",
];

export default function ResultScreen({ onHome, onReplay }: Props) {
  return (
    <main className={`${styles.screen} ${styles.result}`} data-stage="result">
      <div className={styles.burst} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <span key={i} className={styles.burstStar}>★</span>)}
      </div>
      <Mascot mood="cheer" />
      <h2 className={styles.resultTitle}>เก่งมาก! วันนี้เราเรียนเรื่อง</h2>
      <ul className={styles.resultList}>
        {LEARNED.map((line) => <li key={line}>{line}</li>)}
      </ul>
      <div className={styles.resultControls}>
        <button type="button" className={`kc-tap ${styles.ghost}`} onClick={onReplay}>เล่นเกมอีกครั้ง</button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={onHome}>กลับหน้าแรก</button>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: เพิ่มสไตล์ต่อท้าย FractionsApp.module.css (ก่อนบล็อก `@container`)**

```css
.quizTop { display: flex; align-items: center; gap: var(--kc-gap); flex: none; flex-wrap: wrap; justify-content: center }
.quizCount { font-size: var(--kc-fs-label); color: #4A5570 }

.quizBoard {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  gap: var(--kc-gap);
  width: 100%;
}

.quizQuestion { margin: 0; max-width: 40ch; font-size: var(--kc-fs-title); line-height: 1.4 }
.quizShapes { display: flex; gap: var(--kc-gap); align-items: center; justify-content: center; flex-wrap: wrap }

.quizAnswer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 52ch;
  padding: 10px 16px;
  border-radius: var(--kc-radius);
  background: #E8F7F4;
  animation: quizAnswerIn 0.3s ease both;
}
.quizAnswer strong { font-size: var(--kc-fs-head); color: #1D7A6E }
.quizAnswer span { font-size: var(--kc-fs-label); color: #4A5570; line-height: 1.5 }

@keyframes quizAnswerIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.96) }
  to { opacity: 1; transform: none }
}

.quizControls { display: flex; gap: var(--kc-gap); flex: none; justify-content: center; flex-wrap: wrap }

.picked {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #E1E3FD;
  font-size: var(--kc-fs-label);
  font-weight: 700;
  color: #3B35B8;
  animation: quizAnswerIn 0.3s ease both;
}

.resultTitle { margin: 0; font-size: var(--kc-fs-title) }
.resultList {
  margin: 0;
  padding-left: 1.2em;
  max-width: 52ch;
  text-align: left;
  font-size: var(--kc-fs-body);
  line-height: 1.7;
  color: #4A5570;
}
.resultControls { display: flex; gap: var(--kc-gap); flex-wrap: wrap; justify-content: center }
```

เพิ่มเข้า **บล็อกทรงเตี้ยเดิม**:

```css
  .quizQuestion { font-size: var(--kc-fs-head) }
  .quizAnswer { padding: 6px 12px }
  .resultList { line-height: 1.45 }
```

- [ ] **Step 4: ต่อสองหน้าจอเข้า FractionsApp.tsx**

```tsx
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
```

```tsx
        {screen === "quiz" && <QuizScreen onFinish={() => setScreen("result")} onSound={play} />}
        {screen === "result" && (
          <ResultScreen onHome={home} onReplay={() => go("game-choice")} />
        )}
```

- [ ] **Step 5: เดินให้ครบตั้งแต่ต้นจนจบในเบราว์เซอร์**

home → บทเรียน 5 สไลด์ → เกม A 6 ข้อ → เกม B 6 ข้อ → quiz 8 ข้อ → result
ทุกหน้าจอต้องมีปุ่มไปหน้าถัดไปที่กดได้จริงและมองเห็นโดยไม่ต้องเลื่อน

ตรวจปุ่มสุ่มคนตอบทั้งสองทาง:
- ยังไม่เคยสร้างห้องเรียน → ปุ่ม 🎲 **ต้องไม่ขึ้น** และไม่มีข้อความชวนไปสร้าง
- สร้างห้องที่ `/classrooms` ใส่ชื่อ 3 คน แล้วกลับมา → ปุ่มขึ้น กดแล้วได้ชื่อจากในห้อง
  และชื่อหายไปเมื่อกดข้อถัดไป

- [ ] **Step 6: Commit**

```bash
git add app/media/mathematics/fractions-basic/components/QuizScreen.tsx app/media/mathematics/fractions-basic/components/ResultScreen.tsx app/media/mathematics/fractions-basic/FractionsApp.tsx app/media/mathematics/fractions-basic/FractionsApp.module.css
git commit -m "$(cat <<'EOF'
feat(fractions): add the class question round and the closing screen

The question round keeps no score: the teacher asks, the class answers out
loud, and the reveal is a button the teacher presses when the talking is
done.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: เชื่อมเข้าหน้าวิชาคณิตศาสตร์

**Files:**
- Modify: `app/media/subjectContent.ts:11-13`

- [ ] **Step 1: เพิ่มการ์ดเข้า `SUBJECT_CONTENT.mathematics.resources`**

แทรกเป็นรายการแรกของ `resources` (เรียงตามระดับชั้นจากน้อยไปมาก — math-adventure คือ ป.1
สื่อนี้คือ ป.2–3 จึงอยู่ระหว่าง math-adventure กับ math-bomb-defusal):

```ts
      { title: "รู้จักเศษส่วน", description: "เรียนจากภาพว่าแบ่งเท่า ๆ กันคืออะไร อ่านและเขียนเศษส่วน แล้วฝึกด้วยเกม 12 ข้อและคำถามหน้าชั้น", grades: "ป.2–ป.3 · 25–30 นาที", type: "เศษส่วน", href: "/media/mathematics/fractions-basic", image: "/assets/game-covers/fractions-basic.webp" },
```

วางไว้หลังบรรทัดของ math-adventure และก่อนบรรทัดของ math-bomb-defusal

- [ ] **Step 2: อัปเดตวันที่ของวิชา**

ในบล็อก `mathematics` เปลี่ยน `updated: "2026-08-24"` เป็น `updated: "2026-08-31"`

- [ ] **Step 3: ทำภาพปก**

สร้าง `public/assets/game-covers/fractions-basic.webp` ขนาด 960×540
ถ้ายังไม่มีภาพจริง ให้ **ลบฟิลด์ `image` ออกจากรายการ** ชั่วคราว — `SubjectResourcePage`
รองรับรายการที่ไม่มี `image` อยู่แล้ว (motion-lab กับ density-lab ก็ไม่มี)
อย่าชี้ไปที่ไฟล์ที่ไม่มีอยู่ เพราะ OG image ใน `page.tsx` จะพังเงียบ ๆ

- [ ] **Step 4: ตรวจว่าการ์ดขึ้นและตัวนับเพิ่ม**

เปิด `http://localhost:3000/media/mathematics` — ต้องเห็นการ์ด "รู้จักเศษส่วน"
และเปิด `http://localhost:3000/media` — badge ของคณิตศาสตร์ต้องเปลี่ยนจาก "2 สื่อ" เป็น "3 สื่อ"
(`catalog.ts` นับจาก `resources` ที่มี `href` ให้เอง ไม่ต้องแก้ที่ไหนอีก)

- [ ] **Step 5: Commit**

```bash
git add app/media/subjectContent.ts public/assets/game-covers/
git commit -m "$(cat <<'EOF'
feat(fractions): list the fractions media on the mathematics page

The subject already claimed เศษส่วน in its topics with nothing behind it.
catalog.ts counts the resource list, so the subject badge and the site total
follow on their own.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: เพิ่มเข้า audit-games.mjs

**Files:**
- Modify: `scripts/audit-games.mjs` (เพิ่ม solver ใกล้ `solveMathAdventure` ราวบรรทัด 380 และ config ใน `GAMES` ราวบรรทัด 757)

- [ ] **Step 1: เพิ่ม solver สองตัว วางต่อจาก `solveThaiKingdom`**

```js
/** เกมเลือกภาพของ fractions-basic: ไล่กดตัวเลือกจนกว่าจะเจอตัวที่ถูก
 * ตัวที่ถูกทำให้ข้อเดินไปเองใน 1200ms จึงรอ 1300 ให้ข้อถัดไปติดตั้งเสร็จ */
const solveFractionChoice = (count = 6) => async (page) => {
  for (let round = 0; round < count; round++) {
    const options = page.locator('[data-game="choice"] [class*="__option"]');
    let solved = false;
    for (let i = 0; i < await options.count(); i++) {
      await options.nth(i).click({ force: true });
      await page.waitForTimeout(150);
      if (await page.locator('[class*="__feedbackGood"]').count()) {
        solved = true;
        await page.waitForTimeout(1300);
        break;
      }
    }
    if (!solved) throw new Error(`fractions-basic: choice question ${round + 1} was not solved`);
  }
};

/** เกมแตะระบาย: แตะส่วนทีละส่วนแล้วกดตรวจ ถ้ายังไม่ถูกก็แตะเพิ่มอีกส่วน
 * จำนวนส่วนสูงสุดคือ 6 จึงวนไม่เกิน 6 รอบต่อข้อ */
const solveFractionPaint = (count = 6) => async (page) => {
  for (let round = 0; round < count; round++) {
    const parts = page.locator('[data-game="paint"] [role="button"]');
    const total = await parts.count();
    let solved = false;
    for (let taps = 0; taps < total; taps++) {
      await parts.nth(taps).click({ force: true });
      await page.waitForTimeout(80);
      await page.getByRole("button", { name: "ตรวจคำตอบ" }).click();
      await page.waitForTimeout(150);
      if (await page.locator('[class*="__feedbackGood"]').count()) {
        solved = true;
        await page.waitForTimeout(1300);
        break;
      }
    }
    if (!solved) throw new Error(`fractions-basic: paint question ${round + 1} was not solved`);
  }
};

/** คำถามหน้าชั้น: กดเฉลยแล้วกดข้อถัดไป ไม่มีคำตอบให้เลือก */
const walkFractionQuiz = (count = 8) => async (page) => {
  for (let round = 0; round < count; round++) {
    await page.getByRole("button", { name: "เฉลย" }).click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: round === count - 1 ? /จบบทเรียน/ : /ข้อถัดไป/ }).click();
    await page.waitForTimeout(150);
  }
};
```

- [ ] **Step 2: เพิ่ม config เข้า `GAMES` ต่อจาก `"math-adventure"`**

```js
  "fractions-basic": {
    path: "/media/mathematics/fractions-basic",
    stress: {
      selector: '[class*="__quizQuestion"]',
      text: "แม่ทำขนมมา 1 ถาด ตัดแบ่งเท่า ๆ กันให้เพื่อน 4 คน แต่ละคนจะได้ขนมเท่าไรของทั้งถาด",
    },
    screens: [
      { name: "home" },
      { name: "lesson", enter: click(/บทเรียน/), expect: '[data-stage="lesson"]' },
      {
        name: "game-choice",
        async enter(page) {
          await page.getByRole("button", { name: "กลับเมนูสื่อ" }).click();
          await page.getByRole("button", { name: /เกมฝึก/ }).click();
        },
        expect: '[data-game="choice"]',
      },
      { name: "game-paint", enter: solveFractionChoice(6), expect: '[data-game="paint"]' },
      { name: "quiz", enter: solveFractionPaint(6), expect: '[data-stage="quiz"]' },
      { name: "result", enter: walkFractionQuiz(8), expect: '[data-stage="result"]' },
    ],
  },
```

- [ ] **Step 3: พิสูจน์ว่า `stress` ทำงานจริง**

ใส่ข้อความยาวเกินจริงชั่วคราวแทนค่าจริง:

```js
      text: "แม่ทำขนมมา 1 ถาด ตัดแบ่งเท่า ๆ กันให้เพื่อน 4 คน แต่ละคนจะได้ขนมเท่าไรของทั้งถาด และถ้าเพื่อนมาเพิ่มอีกสองคนแล้วต้องแบ่งใหม่ให้เท่ากันทุกคนจะได้คนละเท่าไรของทั้งถาดกันแน่",
```

รันเฉพาะขนาดเดียวเพื่อดูเร็ว ๆ:

```bash
node scripts/audit-games.mjs fractions-basic
```

Expected: ผลของหน้าจอ `quiz` **แย่ลง** เมื่อเทียบกับตอนใช้ข้อความจริง
ถ้าผลไม่เปลี่ยนเลย แปลว่า selector `[class*="__quizQuestion"]` ไม่ตรง ไม่ใช่ layout ทน —
ให้แก้ selector ก่อน แล้วค่อยเปลี่ยน `text` กลับเป็นค่าจริง

- [ ] **Step 4: เปลี่ยน `text` กลับเป็นคำถามจริง แล้ว commit**

```bash
git add scripts/audit-games.mjs
git commit -m "$(cat <<'EOF'
test(fractions): put the fractions media in the audit suite

Every screen past the menu is reached by playing, so each carries an
expect selector - without one the walk can drift and measure the wrong
screen under the right name, and report green.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: วัด แก้ และยืนยัน

**Files:** ตามที่การวัดชี้ — น่าจะเป็น `FractionsApp.module.css` และ `FractionShape.module.css`

- [ ] **Step 1: วัด headroom ก่อน เพราะถูกที่สุดและชี้ปัญหาได้ตรงที่สุด**

```bash
node scripts/audit-headroom.mjs fractions-basic
```

Expected: **ที่ 844×390 ต้องเหลืออย่างน้อย 60px ก่อน hard fail**

ถ้าไม่ถึง ให้ไล่ตามลำดับของ contract ข้อ 7 — **อย่าไปแก้รูปเศษส่วนก่อน**:

1. ตัวที่ไม่ยอมย่อ (`flex` ที่ยุบไม่ได้)
2. margin/padding/gap ที่เขียนด้วย `cqi`/`%` → เปลี่ยนเป็น px คงที่ในบล็อกทรงเตี้ย
3. chrome ที่อธิบายสิ่งที่ UI บอกอยู่แล้ว (`.gameLead`, `.quizCount`)
4. แล้วค่อยถึงขนาดรูป

- [ ] **Step 2: ตรวจว่ากฎในบล็อกทรงเตี้ยมีผลจริง ไม่ได้ตายเงียบ**

กฎที่แพ้ specificity ผ่าน audit ได้สบาย ๆ เพราะ `auditStage()` วัดกล่อง ไม่ได้วัดว่ากฎ
ถูกใช้จริงไหม — motion-lab พลาดข้อนี้ซ้ำหลังจากมีคำเตือนเขียนไว้แล้ว

ยิงกฎด้วย property ที่ไม่มีใครตั้ง (`outline-width`) ใน devtools ที่ 844×390:

```js
const probe = document.createElement("style");
probe.textContent = `
  @container kcstage (aspect-ratio >= 0.9) and (height < 480px) {
    [class*="__gameLead"] { outline-width: 7px }
  }`;
document.head.append(probe);
getComputedStyle(document.querySelector('[class*="__gameLead"]')).outlineWidth;
```

Expected: `"7px"` = container query match จริง
ถ้าได้ `"0px"` แปลว่า gate ไม่ match — ต้องแก้เงื่อนไข ไม่ใช่แก้ selector

- [ ] **Step 3: รัน audit เต็มของเกมนี้**

⚠️ **ห้ามแก้ไฟล์ระหว่างรัน** — dev server hot-reload แล้ว Playwright timeout ทิ้งทั้งรอบ
ใช้เวลา 5–8 นาที

```bash
node scripts/audit-games.mjs fractions-basic
```

Expected:
- hard fails = 0
- `unreachable` = 0
- `undersizedTargets` = 0
- `smallText` = 0
- `bodyUnbound` = 0
- `contentAboveStage` ไม่มีแถวที่เป็นของตกแต่ง (ถ้ามี แปลว่าลืม `pointer-events: none`)

- [ ] **Step 4: อ่าน `contentHiddenBehindScroll` ทุกหน้าจอ ไม่ใช่แค่ดู pass**

ดูช่อง `sample` ว่าอะไรถูกซ่อน:

| ที่ถูกซ่อน | ทำอย่างไร |
|---|---|
| ปุ่มตัวเลือกในเกม / ปุ่ม "ตรวจคำตอบ" / ปุ่ม "ข้อถัดไป" | **ต้องแก้ layout** ผู้เล่นเห็นตัวเลือกไม่ครบ |
| ท้ายคำอธิบายในบทเรียน / ท้ายรายการในหน้า result | ปล่อยได้ |

Phonics Bingo เคยขึ้น `pass: true` ทั้งที่แสดงการ์ด 12 จาก 16 ใบ — ช่องนี้จับได้ตัวเดียว

- [ ] **Step 5: เปิดดู screenshot ทุกหน้าจอด้วยตา**

audit วัดเงื่อนไขความพัง ไม่มี check ตัวไหนวัดความสมดุล — เกมที่เนื้อหากองมุมเดียว
เหลือที่ว่าง 60% ผ่านเขียวสนิททุกช่อง (sound-wheel เคยวาดวงล้อขาดไปสองด้านโดย audit เขียวครบ)

ดูภาพใน `audit-output/` ทั้ง 6 หน้าจอ × 6 ขนาด × 2 โหมด แล้วตอบสามคำถามนี้ต่อภาพ:
- เนื้อหาอยู่กึ่งกลางหรือกองอยู่มุมเดียว
- ตัวหนังสืออ่านออกจากหลังห้องไหมที่ 1920×1080
- รูปเศษส่วนใหญ่พอให้เห็นจำนวนส่วนไหม

- [ ] **Step 6: รันเทสต์ทั้งหมดซ้ำก่อนปิดงาน**

```bash
node --test app/media/mathematics/fractions-basic/fractionGeometry.test.mjs app/media/mathematics/fractions-basic/fractionsData.test.mjs
npm run lint
npx tsc --noEmit
```

Expected: เทสต์ผ่านทั้ง 15 ตัว · lint และ tsc ไม่มี error ใหม่

- [ ] **Step 7: Commit ผลการแก้จากการวัด**

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix(fractions): give the short shape the room the audit says it needs

Measured at 844x390, where a real mobile browser spends another 44-60px of
height on its URL bar that headless never shows.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## เกณฑ์ที่ถือว่างานนี้เสร็จ

ไม่ใช่ "ผ่าน 12 ช่อง" แต่คือ:

- [ ] เทสต์ 15 ตัวใน `fractionGeometry.test.mjs` และ `fractionsData.test.mjs` ผ่านหมด
- [ ] `npm run lint` และ `npx tsc --noEmit` ไม่มี error ใหม่
- [ ] hard fails = 0 · `unreachable` / `undersizedTargets` / `smallText` / `bodyUnbound` = 0
- [ ] เหลือที่ว่างอย่างน้อย 60px ที่ 844×390
- [ ] `contentHiddenBehindScroll` ไม่มีแถวที่ซ่อนปุ่มตัวเลือกหรือปุ่มไปหน้าถัดไป
- [ ] ดู screenshot ครบทุกหน้าจอด้วยตาแล้ว
- [ ] การ์ดขึ้นที่ `/media/mathematics` และ badge ที่ `/media` นับเป็น 3 สื่อ
