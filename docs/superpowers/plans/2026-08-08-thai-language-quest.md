# Thai Language Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/media/thai/thai-language-quest`, a single quiz game covering three Thai-language skills (spelling, meaning, grammar) across ป.1–ป.6, built for teacher-operated play on a classroom TV with full SEO.

**Architecture:** Reuse the existing `/media/english` game infrastructure as-is — the shared `useFullscreen` hook and `GameBackdrop` component (imported cross-folder, the way `math-bomb-defusal` already imports `useFullscreen` from `../../english/useFullscreen`), and the global `.kc-game` 16:9-canvas CSS system in `app/globals.css`. New code is scoped to a new `app/media/thai/thai-language-quest/` folder: a typed static question bank (`data.ts`), a CSS Module for the two-tier (desktop/mobile) typography and visual design (`ThaiLanguageQuestApp.module.css`), the game component itself, and a `page.tsx` with metadata/JSON-LD/FAQ following the `vocabulary-arcade` page pattern.

**Tech Stack:** Next.js App Router, TypeScript, React (client component), CSS Modules, no test framework in this repo (verification is `npm run lint`, `npm run build`, and manual browser check via the dev server — this matches how every existing `/media/*` game in this codebase is verified; there are no `.test.*` files anywhere in `app/media`).

**Scope decision locked in during planning (resolves the spec's open questions):**
- **Launch content:** ป.1–ป.6, **one unit per grade** (not two) to keep the initial data set real and complete rather than padded with placeholders. Adding a second unit per grade later is a pure `data.ts` edit — no component changes needed, per the spec's design.
- **Scoring:** in-game-only point tally (no Scoreboard tool integration in this iteration).
- **Audio:** not included in this iteration (Vocabulary Arcade's `KcSfx` sound layer is a nice-to-have follow-up, not required by the spec's "animation and effects" requirement, which this plan satisfies with visual effects: confetti, card bounce/shake, combo glow).

---

## File Structure

- **Create:** `app/media/thai/thai-language-quest/data.ts` — types + full question bank (ป.1–ป.6 × 3 modes × 4 questions each = 72 questions).
- **Create:** `app/media/thai/thai-language-quest/ThaiLanguageQuestApp.module.css` — two-tier typography, mode color themes, layout for all 5 stages.
- **Create:** `app/media/thai/thai-language-quest/ThaiLanguageQuestApp.tsx` — the game component (client component, 5 stages: intro → grade → unit/mode → play → results).
- **Create:** `app/media/thai/thai-language-quest/page.tsx` — route page: metadata, JSON-LD, breadcrumb, header, `GameFaq`, related links.
- **Modify:** `app/media/subjectContent.ts` — add the game as a real resource entry under `SUBJECT_CONTENT.thai.resources`, replacing the "กำลังเตรียม" placeholder.

No modifications to `app/globals.css` are needed — the `.kc-game` 16:9/fullscreen system already applies to any element carrying the `kc-game` class, and this game's own typography/animation rules live in its own CSS Module instead of adding more per-game selectors to the global stylesheet (avoids growing the already-large shared file further, per the spec's note that fullscreen scaling should not require new global rules for correct behavior — only per-game visual rules, which belong in the module).

---

### Task 1: Question bank data model and content

**Files:**
- Create: `app/media/thai/thai-language-quest/data.ts`

- [ ] **Step 1: Write the data file**

```typescript
// app/media/thai/thai-language-quest/data.ts

export type ModeKey = "spelling" | "meaning" | "grammar";

export type Question = {
  prompt: string;
  correct: string;
  distractors: string[];
};

export type Unit = {
  key: string;
  title: string;
  questions: Record<ModeKey, Question[]>;
};

export type GradeContent = {
  key: string;
  label: string;
  unit: Unit;
};

export const MODES: { key: ModeKey; emoji: string; label: string; desc: string }[] = [
  { key: "spelling", emoji: "🔤", label: "สะกดคำ", desc: "เลือกคำที่สะกดถูกต้อง" },
  { key: "meaning", emoji: "📖", label: "ความหมาย", desc: "เลือกความหมายที่ถูกต้องของคำ" },
  { key: "grammar", emoji: "✏️", label: "หลักภาษา", desc: "วิเคราะห์ชนิดคำและโครงสร้างประโยค" },
];

export const GRADES: GradeContent[] = [
  {
    key: "p1",
    label: "ป.1",
    unit: {
      key: "basic-words",
      title: "การประสมคำและสระพื้นฐาน",
      questions: {
        spelling: [
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "ปลา", distractors: ["ปาล", "พลา"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "แม่", distractors: ["แม", "แม้"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "น้ำ", distractors: ["นำ", "น่ำ"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "เสือ", distractors: ["เสีอ", "เสื่อ"] },
        ],
        meaning: [
          { prompt: "\"แมว\" หมายถึงอะไร", correct: "สัตว์เลี้ยงสี่ขา ร้องเหมียว", distractors: ["สัตว์ปีก บินได้", "สัตว์น้ำ มีเกล็ด"] },
          { prompt: "\"หนังสือ\" หมายถึงอะไร", correct: "สิ่งของใช้อ่านและเรียน มีตัวอักษร", distractors: ["เครื่องใช้สำหรับเขียน มีไส้หมึก", "ภาชนะใส่น้ำดื่ม"] },
          { prompt: "\"ดวงอาทิตย์\" หมายถึงอะไร", correct: "ดาวฤกษ์ให้แสงสว่างและความร้อนแก่โลก", distractors: ["ดาวเคราะห์ที่อยู่ใกล้โลกที่สุด", "แสงสว่างที่มนุษย์สร้างขึ้น"] },
          { prompt: "\"ประตู\" หมายถึงอะไร", correct: "ช่องทางเข้าออกของบ้านหรืออาคาร ปิดเปิดได้", distractors: ["ช่องรับแสงบนกำแพง มีกระจก", "สิ่งของสำหรับนั่ง มีขา 4 ขา"] },
        ],
        grammar: [
          { prompt: "\"แมววิ่ง\" คำใดเป็นคำกริยา", correct: "วิ่ง", distractors: ["แมว", "เร็ว"] },
          { prompt: "\"เด็กกินข้าว\" คำใดเป็นคำกริยา", correct: "กิน", distractors: ["เด็ก", "ข้าว"] },
          { prompt: "\"นกบินสูง\" คำใดเป็นคำนาม", correct: "นก", distractors: ["บิน", "สูง"] },
          { prompt: "\"ฝนตกหนัก\" คำใดเป็นคำวิเศษณ์", correct: "หนัก", distractors: ["ฝน", "ตก"] },
        ],
      },
    },
  },
  {
    key: "p2",
    label: "ป.2",
    unit: {
      key: "final-consonants",
      title: "มาตราตัวสะกด",
      questions: {
        spelling: [
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "นก", distractors: ["นค", "นข"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "จาน", distractors: ["จาร", "จาล"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "รถ", distractors: ["รด", "รฏ"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "ครบ", distractors: ["คบ", "ครม"] },
        ],
        meaning: [
          { prompt: "\"มาตราตัวสะกด\" หมายถึงอะไร", correct: "หลักการเขียนพยัญชนะท้ายคำให้ออกเสียงตามแม่ที่กำหนด", distractors: ["การเรียงลำดับตัวอักษร ก ถึง ฮ", "การผันเสียงวรรณยุกต์ของคำ"] },
          { prompt: "\"แม่กก\" หมายถึงอะไร", correct: "มาตราตัวสะกดที่ใช้ ก ข ค ฆ", distractors: ["มาตราตัวสะกดที่ใช้ ง เป็นตัวสะกด", "มาตราตัวสะกดที่ไม่มีตัวสะกด"] },
          { prompt: "\"แม่กง\" หมายถึงอะไร", correct: "มาตราตัวสะกดที่ใช้ ง เป็นตัวสะกด", distractors: ["มาตราตัวสะกดที่ใช้ น เป็นตัวสะกด", "มาตราตัวสะกดที่ใช้ ม เป็นตัวสะกด"] },
          { prompt: "\"แม่กด\" หมายถึงอะไร", correct: "มาตราตัวสะกดที่ใช้ ด จ ช ซ ต ถ ท ธ ศ ษ ส", distractors: ["มาตราตัวสะกดที่ใช้ บ ป พ ฟ ภ", "มาตราตัวสะกดที่ใช้ ย เป็นตัวสะกด"] },
        ],
        grammar: [
          { prompt: "\"เด็กชายอ่านหนังสือ\" ประโยคนี้มีประธานคือคำใด", correct: "เด็กชาย", distractors: ["อ่าน", "หนังสือ"] },
          { prompt: "\"คุณครูสอนภาษาไทย\" ประโยคนี้มีกริยาคือคำใด", correct: "สอน", distractors: ["คุณครู", "ภาษาไทย"] },
          { prompt: "\"แม่ทำอาหารอร่อย\" คำใดเป็นกรรม", correct: "อาหาร", distractors: ["แม่", "ทำ"] },
          { prompt: "\"รถวิ่งเร็วมาก\" คำใดขยายคำว่า เร็ว", correct: "มาก", distractors: ["รถ", "วิ่ง"] },
        ],
      },
    },
  },
  {
    key: "p3",
    label: "ป.3",
    unit: {
      key: "homophones",
      title: "คำพ้องเสียง คำพ้องรูป",
      questions: {
        spelling: [
          { prompt: "คำที่สะกดถูกต้องและหมายถึง \"ถาดใส่ของ\" คือ", correct: "พาน", distractors: ["พาล", "พาร"] },
          { prompt: "คำที่สะกดถูกต้องและหมายถึง \"ทำร้าย\" คือ", correct: "พาล", distractors: ["พาน", "พาม"] },
          { prompt: "คำที่สะกดถูกต้องและหมายถึง \"ทะเล\" คือ", correct: "ทะเล", distractors: ["ทเล", "ทเล่"] },
          { prompt: "คำที่สะกดถูกต้องและหมายถึง \"ต้นไม้\" คือ", correct: "ต้นไม้", distractors: ["ตนไม้", "ต้นไม"] },
        ],
        meaning: [
          { prompt: "\"คำพ้องเสียง\" หมายถึงอะไร", correct: "คำที่ออกเสียงเหมือนกันแต่เขียนต่างกันและความหมายต่างกัน", distractors: ["คำที่เขียนเหมือนกันแต่ออกเสียงต่างกัน", "คำที่มีความหมายเหมือนกันทุกประการ"] },
          { prompt: "\"คำพ้องรูป\" หมายถึงอะไร", correct: "คำที่เขียนเหมือนกันแต่ออกเสียงและความหมายต่างกัน", distractors: ["คำที่ออกเสียงเหมือนกันทุกประการ", "คำที่มาจากภาษาต่างประเทศ"] },
          { prompt: "\"เพลา\" อ่านว่า เพ-ลา หมายถึงอะไร", correct: "เวลา", distractors: ["แกนล้อรถ", "เบาลง"] },
          { prompt: "\"ไก่ขันตอนเช้า\" คำว่า ขัน หมายถึงอะไร", correct: "ส่งเสียงร้องของไก่", distractors: ["ภาชนะตักน้ำ", "ความรู้สึกขบขัน"] },
        ],
        grammar: [
          { prompt: "\"เขาวิ่งอย่างรวดเร็ว\" คำว่า รวดเร็ว เป็นคำชนิดใด", correct: "คำวิเศษณ์", distractors: ["คำนาม", "คำสรรพนาม"] },
          { prompt: "\"เธอไปโรงเรียน\" คำว่า เธอ เป็นคำชนิดใด", correct: "คำสรรพนาม", distractors: ["คำนาม", "คำกริยา"] },
          { prompt: "\"และ, แต่, หรือ\" จัดเป็นคำชนิดใด", correct: "คำสันธาน", distractors: ["คำบุพบท", "คำอุทาน"] },
          { prompt: "\"โต๊ะ, เก้าอี้\" เป็นคำชนิดใด", correct: "คำนาม", distractors: ["คำกริยา", "คำวิเศษณ์"] },
        ],
      },
    },
  },
  {
    key: "p4",
    label: "ป.4",
    unit: {
      key: "royal-words-idioms",
      title: "คำราชาศัพท์และสำนวนไทยเบื้องต้น",
      questions: {
        spelling: [
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "เสวย", distractors: ["เสวยย์", "สะเหวย"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "บรรทม", distractors: ["บันทม", "บันธม"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "สำนวน", distractors: ["สำนวล", "สัมนวน"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "โบราณ", distractors: ["โบราน", "โบราร"] },
        ],
        meaning: [
          { prompt: "\"คำราชาศัพท์\" หมายถึงอะไร", correct: "คำที่ใช้พูดหรือเขียนกับพระมหากษัตริย์และพระบรมวงศานุวงศ์", distractors: ["คำที่ใช้เฉพาะในบทกวี", "คำที่ยืมมาจากภาษาอังกฤษ"] },
          { prompt: "\"เสวย\" ใช้แทนคำว่าอะไร", correct: "กิน", distractors: ["นอน", "เดิน"] },
          { prompt: "สำนวน \"น้ำท่วมปาก\" หมายถึงอะไร", correct: "พูดความจริงไม่ได้เพราะเกรงจะเดือดร้อน", distractors: ["พูดเก่งมาก", "น้ำท่วมบ้าน"] },
          { prompt: "สำนวน \"ไก่งามเพราะขน\" หมายถึงอะไร", correct: "คนงามเพราะรู้จักแต่งตัว", distractors: ["ไก่ที่มีขนสวยงาม", "คนที่เลี้ยงไก่เก่ง"] },
        ],
        grammar: [
          { prompt: "\"สวยงาม\" เป็นคำชนิดใด", correct: "คำวิเศษณ์", distractors: ["คำกริยา", "คำนาม"] },
          { prompt: "\"เขาไปโรงเรียนแต่ลืมหนังสือ\" มีคำสันธานคือคำใด", correct: "แต่", distractors: ["ไป", "ลืม"] },
          { prompt: "\"ใต้ต้นไม้\" คำว่า ใต้ เป็นคำชนิดใด", correct: "คำบุพบท", distractors: ["คำสันธาน", "คำอุทาน"] },
          { prompt: "\"โอ้โห สวยจัง\" คำว่า โอ้โห เป็นคำชนิดใด", correct: "คำอุทาน", distractors: ["คำวิเศษณ์", "คำสรรพนาม"] },
        ],
      },
    },
  },
  {
    key: "p5",
    label: "ป.5",
    unit: {
      key: "loan-words",
      title: "คำไทยแท้ คำยืมจากภาษาอื่น",
      questions: {
        spelling: [
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "คอมพิวเตอร์", distractors: ["คอมพิวเตอ", "คอมพิวเตอร"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "โทรทัศน์", distractors: ["โทรทัษน์", "โทรทัด"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "กรรไกร", distractors: ["กันไกร", "กรรไกล"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "พยาบาล", distractors: ["พะยาบาล", "พยาบาน"] },
        ],
        meaning: [
          { prompt: "คำไทยแท้มีลักษณะอย่างไร", correct: "ส่วนใหญ่เป็นคำพยางค์เดียวและไม่มีตัวการันต์", distractors: ["มักมีตัวการันต์และหลายพยางค์เสมอ", "ยืมมาจากภาษาบาลีสันสกฤตทั้งหมด"] },
          { prompt: "\"คอมพิวเตอร์\" เป็นคำยืมจากภาษาใด", correct: "ภาษาอังกฤษ", distractors: ["ภาษาบาลี", "ภาษาเขมร"] },
          { prompt: "\"กังฟู\" เป็นคำยืมจากภาษาใด", correct: "ภาษาจีน", distractors: ["ภาษาญี่ปุ่น", "ภาษาฝรั่งเศส"] },
          { prompt: "\"บิดา มารดา\" เป็นคำยืมจากภาษาใด", correct: "ภาษาบาลีสันสกฤต", distractors: ["ภาษาอังกฤษ", "ภาษาเขมร"] },
        ],
        grammar: [
          { prompt: "\"เขากินข้าวและดื่มน้ำ\" คำสันธานเชื่อมประโยคคือคำใด", correct: "และ", distractors: ["กิน", "ดื่ม"] },
          { prompt: "การเรียงประโยคภาษาไทยพื้นฐานเรียงลำดับแบบใด", correct: "ประธาน กริยา กรรม", distractors: ["กริยา ประธาน กรรม", "กรรม ประธาน กริยา"] },
          { prompt: "\"ถึงแม้จะฝนตก เขาก็ยังไปโรงเรียน\" เป็นประโยคชนิดใด", correct: "ประโยคความซ้อน", distractors: ["ประโยคความเดียว", "ประโยคความรวม"] },
          { prompt: "\"เขาไม่ไปโรงเรียนเพราะป่วย\" คำว่า เพราะ ทำหน้าที่ใด", correct: "เชื่อมประโยคแสดงเหตุผล", distractors: ["ขยายคำนาม", "แสดงคำถาม"] },
        ],
      },
    },
  },
  {
    key: "p6",
    label: "ป.6",
    unit: {
      key: "figures-of-speech",
      title: "โวหารภาพพจน์และการใช้คำเชื่อม",
      questions: {
        spelling: [
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "อุปมา", distractors: ["อุปะมา", "อุบมา"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "อุปลักษณ์", distractors: ["อุปปลักษณ์", "อุบลักษณ์"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "บุคคลวัต", distractors: ["บุคคลวัติ", "บุคลวัต"] },
          { prompt: "คำที่สะกดถูกต้องคือข้อใด", correct: "เปรียบเทียบ", distractors: ["เปรียบเทียม", "เปรียบเที่ยบ"] },
        ],
        meaning: [
          { prompt: "\"สวยราวกับนางฟ้า\" เป็นโวหารภาพพจน์ชนิดใด", correct: "อุปมา (เปรียบเทียบโดยใช้คำเชื่อม เช่น ราวกับ)", distractors: ["อุปลักษณ์ (เปรียบเป็นสิ่งเดียวกัน)", "บุคคลวัต (สมมติสิ่งไม่มีชีวิตให้มีกิริยาอาการ)"] },
          { prompt: "\"เธอคือดวงตะวันของฉัน\" เป็นโวหารภาพพจน์ชนิดใด", correct: "อุปลักษณ์", distractors: ["อุปมา", "อติพจน์"] },
          { prompt: "\"สายลมกระซิบข้างหู\" เป็นโวหารภาพพจน์ชนิดใด", correct: "บุคคลวัต (สมมติสิ่งไม่มีชีวิตให้มีกิริยาอย่างคน)", distractors: ["อุปมา", "อติพจน์ (พูดเกินจริง)"] },
          { prompt: "\"ร้องไห้จนน้ำตาเป็นสายเลือด\" เป็นโวหารภาพพจน์ชนิดใด", correct: "อติพจน์ (พูดเกินจริง)", distractors: ["อุปลักษณ์", "บุคคลวัต"] },
        ],
        grammar: [
          { prompt: "\"เขาเรียนเก่งแต่ขี้เกียจ\" คำว่า แต่ ทำหน้าที่ใด", correct: "เชื่อมประโยคที่มีความขัดแย้งกัน", distractors: ["เชื่อมประโยคที่มีความคล้อยตามกัน", "แสดงคำถาม"] },
          { prompt: "\"ฉันจะไปเที่ยวหรือจะอยู่บ้านดี\" คำว่า หรือ ทำหน้าที่ใด", correct: "เชื่อมประโยคแสดงทางเลือก", distractors: ["เชื่อมประโยคแสดงเหตุผล", "ขยายคำกริยา"] },
          { prompt: "\"เพราะฝนตกหนัก น้ำจึงท่วม\" เป็นประโยคที่แสดงความสัมพันธ์แบบใด", correct: "เหตุและผล", distractors: ["ขัดแย้งกัน", "ทางเลือก"] },
          { prompt: "คำเชื่อมที่ใช้แสดงลำดับเหตุการณ์คือข้อใด", correct: "แล้วจึง", distractors: ["แต่", "หรือ"] },
        ],
      },
    },
  },
];
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `data.ts` (pre-existing unrelated errors elsewhere, if any, are not this task's concern).

- [ ] **Step 3: Commit**

```bash
git add app/media/thai/thai-language-quest/data.ts
git commit -m "feat: add Thai Language Quest question bank (p1-p6)"
```

---

### Task 2: Two-tier typography and visual style (CSS Module)

**Files:**
- Create: `app/media/thai/thai-language-quest/ThaiLanguageQuestApp.module.css`

This module implements the spec's typography table directly: one `clamp()` range for phones, a visibly larger, TV-legible range once the `900px` breakpoint (the same breakpoint the global `.kc-game` 16:9 canvas rule already uses) is crossed. It reuses the global keyframes already defined in `app/globals.css` (`confettiFall`, `bounceIn`, `shake`, `popIn`, `slideUp`, `floatY`, `pulseGlow`) — these are not redefined here, only referenced by name, which works because Next.js CSS Modules only hash class/id selectors, not `@keyframes` names.

- [ ] **Step 1: Write the CSS module**

```css
/* app/media/thai/thai-language-quest/ThaiLanguageQuestApp.module.css */

.root {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(170deg, #FDF2F8 0%, #FFF7ED 50%, #F0FDFA 100%);
}

.topBar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-fredoka), var(--font-anuphan), sans-serif;
  font-weight: 600;
  font-size: 18px;
}

.pillButton {
  font-weight: 600;
  font-size: 14px;
  color: #B4477C;
  background: #FDE8F3;
  border: none;
  border-radius: 999px;
  padding: 9px 16px;
  cursor: pointer;
  text-decoration: none;
}

.iconButton {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #E5E8EE;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
}

.iconButton.active {
  background: #FDE8F3;
}

.starBadge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #E5E8EE;
  border-radius: 999px;
  padding: 7px 14px;
  font-weight: 600;
  color: #C2500B;
}

/* ---- Stage-shared layout ---- */

.stage {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding: 6px 20px clamp(20px, 6vh, 100px);
  text-align: center;
}

.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(45%, 200px), 1fr));
  gap: clamp(10px, 3vw, 16px);
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 2px solid #F3C6DE;
  border-radius: clamp(14px, 4vw, 24px);
  padding: clamp(12px, 3vw, 22px) clamp(8px, 2vw, 14px);
  background: #fff;
  cursor: pointer;
  box-shadow: 0 12px 24px -18px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s ease both;
}

.card.selected {
  border-color: #B4477C;
  background: #FDE8F3;
}

/* ---- Typography tier 1: mobile (default) ---- */

.questionText {
  font-family: var(--font-anuphan), sans-serif;
  font-weight: 700;
  font-size: clamp(22px, 6vw, 32px);
  line-height: 1.4;
}

.optionText {
  font-family: var(--font-anuphan), sans-serif;
  font-weight: 600;
  font-size: clamp(14px, 3.6vw, 18px);
  line-height: 1.4;
}

.bodyText {
  font-family: var(--font-sarabun), sans-serif;
  font-size: clamp(12px, 3vw, 14px);
  line-height: 1.6;
  color: #5A6273;
}

.chromeText {
  font-family: var(--font-sarabun), sans-serif;
  font-size: 13px;
  font-weight: 600;
}

/* ---- Typography tier 2: desktop/TV (>=900px, matches the .kc-game canvas breakpoint) ---- */

@media (min-width: 900px) {
  .questionText {
    font-size: clamp(48px, 6vw, 88px);
  }

  .optionText {
    font-size: clamp(24px, 2.6vw, 36px);
  }

  .bodyText {
    font-size: clamp(17px, 1.4vw, 20px);
  }

  .chromeText {
    font-size: 17px;
  }
}

/* ---- Play stage ---- */

.optionButton {
  composes: optionText;
  position: relative;
  min-height: 82px;
  border-radius: 22px;
  border: 3px solid #E5E8EE;
  background: #fff;
  padding: 14px 12px;
  cursor: pointer;
  animation: popIn 0.35s ease;
  box-shadow: 0 12px 24px -20px rgba(0, 0, 0, 0.8);
}

.optionButton.correct {
  border-color: #14B79A;
  background: #D0FBEF;
  color: #0A7F70;
}

.optionButton.wrong {
  border-color: #FF5470;
  background: #FFE4E9;
  color: #C21A3E;
}

.cardShake {
  animation: shake 0.45s ease;
}

.cardBounce {
  animation: bounceIn 0.35s ease;
}

.comboBadge {
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(135deg, #FF8A3D, #FF5470);
  border-radius: 999px;
  padding: 6px 14px;
}

.startButton {
  composes: optionText;
  color: #fff;
  background: linear-gradient(135deg, #B4477C, #14B79A);
  border: none;
  border-radius: 999px;
  padding: 16px 44px;
  cursor: pointer;
  animation: pulseGlow 2.4s ease-in-out infinite;
}

.confettiPiece {
  position: absolute;
  top: -30px;
  border-radius: 3px;
  animation-name: confettiFall;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/media/thai/thai-language-quest/ThaiLanguageQuestApp.module.css
git commit -m "feat: add Thai Language Quest typography and visual styles"
```

---

### Task 3: Game component

**Files:**
- Create: `app/media/thai/thai-language-quest/ThaiLanguageQuestApp.tsx`

Five stages, mirroring the flow already validated by `VocabularyArcadeApp.tsx`: `0` intro, `1` grade picker, `2` unit+mode picker, `3` play, `4` results. The play loop implements the "teacher clicks one option to reveal" mechanic from the spec — there is no separate submit step, and no student input device.

- [ ] **Step 1: Write the component**

```tsx
// app/media/thai/thai-language-quest/ThaiLanguageQuestApp.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useFullscreen } from "../../english/useFullscreen";
import GameBackdrop from "../../english/GameBackdrop";
import { GRADES, MODES, type ModeKey, type Question } from "./data";
import styles from "./ThaiLanguageQuestApp.module.css";

type PlayQuestion = Question & { options: string[] };

type ResultRow = { q: PlayQuestion; ok: boolean };

type ConfettiPiece = {
  id: number;
  left: number;
  width: number;
  height: number;
  color: string;
  duration: string;
  delay: string;
};

const CONFETTI_COLORS = ["#B4477C", "#14B79A", "#FFD166", "#FF8A3D", "#FF5470", "#7BD3F7"];

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(mode: ModeKey, questions: Question[]): PlayQuestion[] {
  return shuffle(questions).map((q) => ({
    ...q,
    options: shuffle([q.correct, ...q.distractors]),
  }));
}

export default function ThaiLanguageQuestApp() {
  const { ref: fullRef, isFull, fullscreenClassName, toggle: toggleFull } = useFullscreen<HTMLDivElement>();

  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [gradeI, setGradeI] = useState(0);
  const [mode, setMode] = useState<ModeKey>("spelling");
  const [questions, setQuestions] = useState<PlayQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [combo, setCombo] = useState(0);
  const [stars, setStars] = useState(0);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const timeouts = timeoutsRef.current;
    return () => {
      mountedRef.current = false;
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
    };
  }, []);

  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      if (!mountedRef.current) return;
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  const burst = useCallback(() => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 24; i++) {
      pieces.push({
        id: Math.random(),
        left: Math.round(Math.random() * 100),
        width: 6 + Math.round(Math.random() * 8),
        height: 9 + Math.round(Math.random() * 12),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: (1.6 + Math.random() * 1.2).toFixed(2),
        delay: (Math.random() * 0.4).toFixed(2),
      });
    }
    setConfetti(pieces);
    trackedTimeout(() => setConfetti([]), 2600);
  }, [trackedTimeout]);

  const grade = GRADES[gradeI];

  const startGame = useCallback(
    (m: ModeKey) => {
      const qs = buildQuestions(m, grade.unit.questions[m]);
      setMode(m);
      setQuestions(qs);
      setQi(0);
      setPicked(null);
      setLocked(false);
      setCombo(0);
      setResults([]);
      setConfetti([]);
      setStage(3);
    },
    [grade],
  );

  const next = useCallback(() => {
    setQi((prevQi) => {
      const nextQi = prevQi + 1;
      if (nextQi >= questions.length) {
        setLocked(false);
        setPicked(null);
        setStage(4);
        return prevQi;
      }
      setPicked(null);
      setLocked(false);
      return nextQi;
    });
  }, [questions.length]);

  const answer = useCallback(
    (option: string) => {
      if (locked) return;
      const q = questions[qi];
      if (!q) return;
      const ok = option === q.correct;
      const nextCombo = ok ? combo + 1 : 0;
      const nextStars = stars + (ok ? (nextCombo >= 3 ? 2 : 1) : 0);
      if (ok) burst();
      setLocked(true);
      setPicked(option);
      setCombo(nextCombo);
      setStars(nextStars);
      setResults((r) => [...r, { q, ok }]);
      trackedTimeout(() => next(), ok ? 1150 : 1600);
    },
    [locked, questions, qi, combo, stars, burst, trackedTimeout, next],
  );

  const goGrades = useCallback(() => setStage(1), []);
  const goModes = useCallback(() => setStage(2), []);
  const replay = useCallback(() => startGame(mode), [startGame, mode]);

  const q = stage === 3 ? questions[qi] : undefined;
  const total = questions.length;
  const progressPct = total ? Math.round((qi / total) * 100) : 0;
  const last = results[results.length - 1];

  return (
    <div
      ref={fullRef}
      className={`kc-game ${styles.root} ${fullscreenClassName}`}
    >
      <GameBackdrop
        sun={{ top: 30, right: "6%", size: 130, from: "#FCE1EF", via: "#F3A6CB" }}
        blobs={[
          { top: -90, left: -110, size: 360, color: "#FDE8F3" },
          { top: 260, right: -140, size: 420, color: "#DCFCE7" },
        ]}
        clouds={[{ top: 90, dur: 52 }]}
      />

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 60, overflow: "hidden" }}>
        {confetti.map((c) => (
          <div
            key={c.id}
            className={styles.confettiPiece}
            style={{
              left: `${c.left}%`,
              width: c.width,
              height: c.height,
              background: c.color,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.topBar}>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/khuncool-logo.webp"
            alt="KhunCool"
            style={{ width: 38, height: 38, objectFit: "contain" }}
          />
          <span>ตะลุยด่านภาษาไทย</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Link href="/media/thai" className={styles.pillButton}>
            ☰ เมนู
          </Link>
          {stage >= 2 && (
            <button type="button" onClick={goGrades} className={styles.pillButton}>
              ☰ เปลี่ยนชั้นปี
            </button>
          )}
          <button
            type="button"
            onClick={toggleFull}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            className={`${styles.iconButton} ${isFull ? styles.active : ""}`}
          >
            ⛶
          </button>
          <div className={styles.starBadge}>
            <span>⭐</span>
            <span>{stars}</span>
          </div>
        </div>
      </div>

      {stage === 0 && (
        <div className={styles.stage}>
          <h1 className={styles.questionText} style={{ marginBottom: 14 }}>
            ตะลุยด่านภาษาไทย
          </h1>
          <p className={styles.bodyText} style={{ marginBottom: 30 }}>
            สะกดคำ · ความหมาย · หลักภาษา ป.1–ป.6
            <br />
            เลือกชั้นปี แล้วเล่นพร้อมกันทั้งห้องได้เลย
          </p>
          <button type="button" onClick={goGrades} className={styles.startButton}>
            เลือกชั้นปี 🚀
          </button>
        </div>
      )}

      {stage === 1 && (
        <div className={styles.stage}>
          <h2 className={styles.optionText} style={{ marginBottom: 16 }}>
            เลือกชั้นปีที่จะเล่น 📚
          </h2>
          <div className={styles.cardGrid}>
            {GRADES.map((g, i) => (
              <button
                key={g.key}
                type="button"
                onClick={() => {
                  setGradeI(i);
                  setStage(2);
                }}
                className={styles.card}
              >
                <span className={styles.optionText}>{g.label}</span>
                <span className={styles.bodyText}>{g.unit.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className={styles.stage}>
          <h2 className={styles.optionText} style={{ marginBottom: 4 }}>
            {grade.label} · {grade.unit.title}
          </h2>
          <p className={styles.bodyText} style={{ marginBottom: 20 }}>เลือกโหมดที่จะเล่น</p>
          <div className={styles.cardGrid}>
            {MODES.map((m) => (
              <button key={m.key} type="button" onClick={() => startGame(m.key)} className={styles.card}>
                <span style={{ fontSize: "clamp(30px,7vw,42px)" }}>{m.emoji}</span>
                <span className={styles.optionText}>{m.label}</span>
                <span className={styles.bodyText}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 3 && q && (
        <div className={styles.stage}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180, height: 14, borderRadius: 999, background: "#fff", border: "1px solid #E5E8EE", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 999, background: "linear-gradient(90deg,#B4477C,#14B79A)" }} />
            </div>
            <span className={styles.chromeText}>ข้อ {qi + 1} / {total}</span>
            {combo >= 2 && <span className={styles.comboBadge}>🔥 คอมโบ ×{combo}</span>}
          </div>

          <div className={`${styles.card} ${locked && last && !last.ok ? styles.cardShake : styles.cardBounce}`} style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(18px,3vw,34px)" }}>
            <p className={styles.chromeText} style={{ color: "#B4477C", marginBottom: 12 }}>
              {MODES.find((m) => m.key === mode)?.label} · {grade.label}
            </p>
            <p className={styles.questionText} style={{ marginBottom: 24 }}>{q.prompt}</p>
            <div className={styles.cardGrid}>
              {q.options.map((opt) => {
                const isCorrect = opt === q.correct;
                const isPicked = picked === opt;
                const state = locked ? (isCorrect ? styles.correct : isPicked ? styles.wrong : "") : "";
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={locked}
                    onClick={() => answer(opt)}
                    className={`${styles.optionButton} ${state}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {locked && last && (
              <p className={styles.bodyText} style={{ marginTop: 20, fontWeight: 600 }}>
                {last.ok ? "ถูกต้อง! 🎉" : `คำตอบคือ ${q.correct}`}
              </p>
            )}
          </div>
        </div>
      )}

      {stage === 4 &&
        (() => {
          const rTotal = results.length || 1;
          const correct = results.filter((r) => r.ok).length;
          const pct = correct / rTotal;
          const resultEmoji = pct === 1 ? "🏆" : pct >= 0.7 ? "🎉" : pct >= 0.4 ? "💪" : "🌱";
          return (
            <div className={styles.stage}>
              <div style={{ fontSize: 74 }}>{resultEmoji}</div>
              <h2 className={styles.questionText} style={{ margin: "6px 0" }}>
                ตอบถูก {correct} จาก {rTotal} ข้อ
              </h2>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                <button type="button" onClick={replay} className={styles.startButton}>
                  เล่นอีกครั้ง 🔁
                </button>
                <button type="button" onClick={goModes} className={styles.pillButton}>
                  เปลี่ยนโหมด 🎮
                </button>
                <button type="button" onClick={goGrades} className={styles.pillButton}>
                  ชั้นปีอื่น 📚
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors in `ThaiLanguageQuestApp.tsx` (pre-existing warnings elsewhere are not this task's concern).

- [ ] **Step 3: Commit**

```bash
git add app/media/thai/thai-language-quest/ThaiLanguageQuestApp.tsx
git commit -m "feat: add Thai Language Quest game component"
```

---

### Task 4: Route page with SEO

**Files:**
- Create: `app/media/thai/thai-language-quest/page.tsx`

Mirrors `app/media/english/vocabulary-arcade/page.tsx`: `metadata` export, inline JSON-LD (`BreadcrumbList` + `WebApplication`), breadcrumb nav, header, the game, `GameFaq` (imported cross-folder from `../../english`, the same way `useFullscreen` is imported cross-folder), and related links back to `/media/thai`.

- [ ] **Step 1: Write the page**

```tsx
// app/media/thai/thai-language-quest/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ThaiLanguageQuestApp from "./ThaiLanguageQuestApp";
import GameFaq from "../../english/GameFaq";
import { gameFaqs } from "../../english/seo";

const PAGE_URL = "https://www.khuncool.com/media/thai/thai-language-quest";
const faqs = gameFaqs("ตะลุยด่านภาษาไทย", "ป.1–ป.6");

export const metadata: Metadata = {
  title: "ตะลุยด่านภาษาไทย เกมสะกดคำ ความหมาย หลักภาษา ป.1–ป.6 | khuncool",
  description:
    "เกมสื่อการสอนภาษาไทย 3 โหมด สะกดคำ ความหมาย และหลักภาษา ครอบคลุม ป.1 ถึง ป.6 เล่นบนจอทีวีหน้าชั้นเรียนได้ทันที ไม่ต้องใช้อุปกรณ์นักเรียน เล่นฟรีทั้งคอมพิวเตอร์และมือถือ",
  keywords: [
    "เกมภาษาไทย",
    "สื่อการสอนภาษาไทย",
    "เกมสะกดคำ",
    "เกมหลักภาษาไทย",
    "ตะลุยด่านภาษาไทย",
    "สื่อการสอนประถม",
    "เครื่องมือครู",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    title: "ตะลุยด่านภาษาไทย เกมสะกดคำ ความหมาย หลักภาษา ป.1–ป.6 | khuncool",
    description: "เกมภาษาไทย 3 โหมด (สะกดคำ, ความหมาย, หลักภาษา) เล่นบนจอทีวีหน้าชั้นเรียน ครูคลิกเดียวเฉลยได้ทันที",
    url: PAGE_URL,
    locale: "th_TH",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "สื่อการสอนภาษาไทย", item: "https://www.khuncool.com/media/thai" },
        { "@type": "ListItem", position: 3, name: "ตะลุยด่านภาษาไทย", item: PAGE_URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "ตะลุยด่านภาษาไทย Khuncool",
      url: PAGE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "เกมสะกดคำ ความหมาย และหลักภาษาไทย ป.1–ป.6 เล่นบนจอทีวีหน้าชั้นเรียนได้ทันที",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
  ],
};

export default function ThaiLanguageQuestPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">หน้าแรก</Link>
          <span>›</span>
          <Link href="/media/thai" className="text-ink-faint">สื่อการสอนภาษาไทย</Link>
          <span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">ตะลุยด่านภาษาไทย</span>
        </div>
      </nav>

      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          ตะลุยด่านภาษาไทย 🎮
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          เกมภาษาไทย 3 โหมด สะกดคำ ความหมาย และหลักภาษา ครอบคลุม ป.1 ถึง ป.6
          ครูเลือกชั้นปีและโหมด แล้วคลิกเดียวเฉลยคำตอบได้ทันที เหมาะสำหรับเล่นบนจอทีวีหน้าชั้นเรียน
        </p>
      </div>

      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <ThaiLanguageQuestApp />
      </div>

      <GameFaq
        items={faqs}
        title="ตะลุยด่านภาษาไทย"
        url={PAGE_URL}
        grade="ป.1–ป.6"
        teaches={["การสะกดคำภาษาไทย", "ความหมายของคำศัพท์", "หลักภาษาไทยและชนิดของคำ"]}
      />

      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">สื่อการสอนที่เกี่ยวข้อง</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/media/thai" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">
            🧰 สื่อการสอนภาษาไทยทั้งหมด
          </Link>
          <Link href="/group-scoreboard" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">
            🏆 กระดานคะแนน
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint`
Expected: no errors in `page.tsx`.

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new type errors from this file.

- [ ] **Step 3: Commit**

```bash
git add app/media/thai/thai-language-quest/page.tsx
git commit -m "feat: add Thai Language Quest route page with SEO metadata"
```

---

### Task 5: Register the game on the Thai hub page

**Files:**
- Modify: `app/media/subjectContent.ts:29-31`

Replace the single "กำลังเตรียม" placeholder resource with a real entry linking to the new game, so `/media/thai` stops saying "coming soon" once this ships.

- [ ] **Step 1: Read the current block**

Current (`app/media/subjectContent.ts:29-31`):

```typescript
    resources: [
      { title: "สื่อการสอนภาษาไทย", description: "สื่อฝึกอ่าน สระ วรรณยุกต์ การประสมคำ หลักภาษา การเขียน และการอ่านจับใจความ กำลังอยู่ระหว่างเตรียมเนื้อหา", grades: "ป.1–ป.6 · กำลังเตรียม", type: "ภาษาไทย" },
    ],
```

- [ ] **Step 2: Replace it**

New:

```typescript
    resources: [
      { title: "ตะลุยด่านภาษาไทย", description: "เกมสะกดคำ ความหมาย และหลักภาษาไทย ป.1–ป.6 เล่นบนจอทีวีหน้าชั้นเรียนได้ทันที", grades: "ป.1–ป.6", type: "เกม", href: "/media/thai/thai-language-quest" },
    ],
```

If the `resources` item type in this file does not already have an `href` field, check its type definition first:

Run: `npx tsc --noEmit -p tsconfig.json`

If this reports a missing `href` property on the resource type, find that type (search `app/media/subjectContent.ts` for `resources:` or an exported `Resource`/`SubjectResource` type) and add `href?: string` to it, then confirm the type-check passes. Do not guess the field name — read the type definition in this file before editing it, since other subjects (`SUBJECT_CONTENT.mathematics`, etc.) already list shipped games and their resource entries show the exact shape a "shipped" entry should have; copy that shape.

- [ ] **Step 3: Verify the hub page still builds**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/media/subjectContent.ts
git commit -m "feat: link Thai Language Quest from the /media/thai hub page"
```

---

### Task 6: Manual verification in the browser

**Files:** none (verification only)

This repo has no test framework — every existing `/media/*` game is verified by running it in a browser, per the project's established practice. Do the same here, checking every requirement from the spec explicitly.

- [ ] **Step 1: Start the dev server and open the game**

Use the preview tool to start the Next.js dev server (`npm run dev`) and navigate to `http://localhost:3000/media/thai/thai-language-quest`.

- [ ] **Step 2: Check desktop 16:9 canvas and fullscreen parity**

At a desktop viewport (≥1280px wide):
- Confirm the game renders inside a fixed 16:9 box (not full-bleed).
- Click through intro → grade → mode → play → results once.
- Click the ⛶ fullscreen button. Confirm the layout, button positions, and text all look identical to the windowed view, just scaled up — no reflow, no elements appearing/disappearing/moving relative to each other.
- Exit fullscreen and confirm the game returns to the same state it was in before entering fullscreen.

- [ ] **Step 3: Check TV-scale legibility**

Zoom the browser out to simulate a large screen, or use `computer{action:"zoom"}` on the question card region. Confirm the question text and answer options are the large desktop typography tier (not the mobile-sized clamp values) — this is the ≥900px tier defined in `ThaiLanguageQuestApp.module.css`.

- [ ] **Step 4: Check mobile single-screen fit**

Use `resize_window` with the `mobile` preset (375×812) and reload. Confirm:
- The entire play screen (question + options) fits without vertical scrolling.
- Typography is the smaller mobile tier, not the desktop sizes.
- The fullscreen button works and produces the same `100dvh` single-screen fullscreen behavior other `/media/english` games use.

- [ ] **Step 5: Check SEO output**

Use `get_page_text` or `read_page` on the page, or view source, and confirm:
- The `<title>` and meta description match what was set in `page.tsx`.
- The JSON-LD `<script type="application/ld+json">` blocks are present (`BreadcrumbList`, `WebApplication`, and — from `GameFaq` — `LearningResource` + `FAQPage`).

- [ ] **Step 6: Check the hub page link**

Navigate to `http://localhost:3000/media/thai` and confirm the "ตะลุยด่านภาษาไทย" resource card links to `/media/thai/thai-language-quest` and no longer shows the "กำลังเตรียม" placeholder copy.

- [ ] **Step 7: Run the full build**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 8: Final commit (if any fixes were made during verification)**

```bash
git add -A
git commit -m "fix: address issues found during Thai Language Quest browser verification"
```

(Skip this commit if verification found no issues.)

---

## Plan Self-Review

**Spec coverage:**
- ✅ 3 modes in one hub game (Task 1 data model, Task 3 component `MODES`/`mode` state).
- ✅ Teacher-click, no student devices (Task 3 `answer()` — single click per option, no submit step).
- ✅ Pre-built question bank by grade/unit (Task 1, full ป.1–ป.6 content; scope narrowed to 1 unit/grade at launch, documented as a locked-in decision, with second-unit expansion being pure data edits).
- ✅ Desktop 16:9 canvas + fullscreen UI parity (Task 3 reuses `.kc-game` + `useFullscreen`; verified explicitly in Task 6 Step 2).
- ✅ Mobile single-screen fit + fullscreen (Task 6 Step 4).
- ✅ Two explicit typography tiers, desktop sized for back-of-classroom TV viewing (Task 2).
- ✅ Energetic animation/effects (Task 2 confetti/bounce/shake/pulse classes referencing existing global keyframes; Task 3 wires them to game state).
- ✅ SEO (Task 4: metadata, JSON-LD, FAQ; verified in Task 6 Step 5).
- ✅ Hub page integration (Task 5).

**Placeholder scan:** No "TBD"/"TODO"/"add appropriate X" language in any task. Task 5 has a conditional step (checking whether `href` exists on the resource type) because the exact shape of that pre-existing type wasn't read during planning — this is a real, actionable instruction ("read the type, copy the shape used by shipped games"), not a placeholder.

**Type consistency:** `ModeKey`, `Question`, `Unit`, `GradeContent`, `MODES`, `GRADES` are defined once in Task 1's `data.ts` and imported with those exact names in Task 3. `PlayQuestion` (adds `options: string[]`) and `ResultRow` are defined once in Task 3 and used consistently within that same file. CSS Module class names (`styles.root`, `styles.card`, `styles.optionButton`, `styles.correct`, `styles.wrong`, `styles.cardShake`, `styles.cardBounce`, `styles.comboBadge`, `styles.startButton`, `styles.pillButton`, `styles.iconButton`, `styles.starBadge`, `styles.stage`, `styles.cardGrid`, `styles.questionText`, `styles.optionText`, `styles.bodyText`, `styles.chromeText`, `styles.confettiPiece`, `styles.brand`, `styles.topBar`, `styles.active`, `styles.selected`) are all defined in Task 2's module and consumed with matching names in Task 3.
