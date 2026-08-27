# Mystery Board (/mystery-board) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างเครื่องมือ "กระดานป้ายปริศนา" ที่ `/mystery-board` — นักเรียนเลือกหรือสุ่มเปิดป้ายบนกระดาน ป้ายพลิก 3D เผยคะแนน/การ์ดพิเศษ หรือคำถามที่ครูเตรียมไว้ พร้อมแอนิเมชันและเสียงจัดเต็ม

**Architecture:** Client component เดียวถือ state ทั้งหมด (`MysteryBoardApp.tsx`) แยก logic ล้วนไปที่ `boardModel.ts`, เสียงไปที่ `useBoardSound.ts`, และ UI สามหน้าจอไปที่ `SetupPanel.tsx` / `BoardGrid.tsx` / `RevealOverlay.tsx` — แอนิเมชันทั้งหมดอยู่ใน `MysteryBoard.module.css` ไม่มี state บนเซิร์ฟเวอร์ เก็บเฉพาะ `Settings` ลง `localStorage`

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (utility ใน TSX) + CSS Module (แอนิเมชัน), Web Audio API, Web Animations API — **ไม่เพิ่ม dependency ใหม่**

**Spec:** [docs/superpowers/specs/2026-08-27-mystery-board-design.md](../specs/2026-08-27-mystery-board-design.md)

---

## หมายเหตุเรื่องการทดสอบ (อ่านก่อนเริ่ม)

โปรเจกต์นี้ **ไม่มี test runner** — ไม่มี jest/vitest ใน `package.json` มีแต่
`playwright` เป็น devDependency ที่ใช้กับสคริปต์ถ่ายภาพหน้าจอใน `scripts/`
เท่านั้น การเพิ่ม test framework ใหม่อยู่นอกขอบเขตงานนี้

การตรวจแต่ละ task จึงใช้สามอย่างนี้แทน และ **ต้องรันจริงก่อนติ๊ก checkbox**:

1. `npm run lint` — ต้องไม่มี error
2. `npm run build` — ต้องผ่าน (จับ type error ทั้งโปรเจกต์)
3. ตรวจด้วยเบราว์เซอร์บน dev server (`npm run dev` แล้วเปิด
   `http://localhost:3000/mystery-board`) ตามข้อ "ตรวจในเบราว์เซอร์" ของแต่ละ task

Task 2 มีฟังก์ชัน logic ล้วน ตรวจด้วยสคริปต์ที่รันได้จริงแทน unit test — ดูขั้นตอนใน task นั้น

---

## File Structure

| ไฟล์ | สร้าง/แก้ | หน้าที่ |
|---|---|---|
| `app/mystery-board/boardModel.ts` | สร้าง | types, ตารางรางวัล, shuffle, `buildTiles`, `parseQuestions` — logic ล้วน ไม่มี React |
| `app/mystery-board/useBoardSound.ts` | สร้าง | hook ห่อ Web Audio: `play(kind)` + ปิด `AudioContext` ตอน unmount |
| `app/mystery-board/SetupPanel.tsx` | สร้าง | หน้าจอตั้งค่า (โหมด/ขนาด/ธีม/คำถาม) — controlled ทั้งหมด รับ props |
| `app/mystery-board/BoardGrid.tsx` | สร้าง | กริดป้าย + แถบบน + ปุ่มสุ่ม |
| `app/mystery-board/RevealOverlay.tsx` | สร้าง | overlay เผยผล + flip 3D + focus trap เบา ๆ |
| `app/mystery-board/MysteryBoardApp.tsx` | สร้าง | `"use client"` ถือ state ทั้งหมด, localStorage, การสุ่ม, ไฟวิ่ง, คอนเฟตตี |
| `app/mystery-board/MysteryBoard.module.css` | สร้าง | keyframes + คลาสแอนิเมชัน + ธีม + reduced-motion + fullscreen fallback |
| `app/mystery-board/page.tsx` | สร้าง | server component: metadata, JSON-LD, breadcrumb, header, howto/usecase/FAQ |
| `app/tools/data.ts` | แก้ | เพิ่ม entry ใน `TOOLS` และ `CASES` |

`app/sitemap.ts` **ไม่ต้องแก้** — สร้าง route จาก `TOOLS` ให้เองอยู่แล้ว (`app/sitemap.ts:38-41`)

---

### Task 1: Scaffold route + หน้าตั้งค่าที่บันทึกได้

**Files:**
- Create: `app/mystery-board/boardModel.ts` (เฉพาะส่วน types + settings)
- Create: `app/mystery-board/MysteryBoardApp.tsx`
- Create: `app/mystery-board/page.tsx` (ฉบับย่อ — เนื้อหา SEO เต็มอยู่ Task 9)
- Create: `app/mystery-board/MysteryBoard.module.css` (ฉบับย่อ)

- [ ] **Step 1: สร้าง `app/mystery-board/boardModel.ts` ส่วน types และ settings**

```ts
export type Mode = "score" | "question";
export type Theme = "space" | "treasure" | "neon";
export type PrizeKind = "points" | "double" | "steal" | "bomb" | "lucky";

export type Prize = {
  kind: PrizeKind;
  value: number;
  label: string;
  emoji: string;
};

export type Tile = {
  id: number;
  opened: boolean;
  prize?: Prize;
  question?: string;
};

export const BOARD_SIZES = [12, 20, 30] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export type Settings = {
  mode: Mode;
  size: BoardSize;
  theme: Theme;
  soundOn: boolean;
  questions: string[];
};

export const LS_KEY = "khuncool.mysteryboard";

export const DEFAULT_SETTINGS: Settings = {
  mode: "score",
  size: 20,
  theme: "space",
  soundOn: true,
  questions: [],
};

export const THEME_LABELS: Record<Theme, string> = {
  space: "อวกาศ",
  treasure: "สมบัติโจรสลัด",
  neon: "นีออน",
};

export const MODE_LABELS: Record<Mode, string> = {
  score: "โหมดคะแนน",
  question: "โหมดคำถาม",
};

/** 1 บรรทัด = 1 คำถาม ตัดช่องว่างหัวท้ายและบรรทัดว่างทิ้ง */
export function parseQuestions(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** อ่าน Settings จาก localStorage แบบไม่มีวันโยน error */
export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings> | null;
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    return {
      mode: parsed.mode === "question" ? "question" : "score",
      size: BOARD_SIZES.includes(parsed.size as BoardSize)
        ? (parsed.size as BoardSize)
        : DEFAULT_SETTINGS.size,
      theme:
        parsed.theme === "treasure" || parsed.theme === "neon"
          ? parsed.theme
          : "space",
      soundOn: parsed.soundOn !== false,
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.filter((q): q is string => typeof q === "string")
        : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(settings));
  } catch {
    /* โหมดส่วนตัวของ Safari เขียนไม่ได้ — ปล่อยผ่าน */
  }
}
```

- [ ] **Step 2: สร้าง `app/mystery-board/MysteryBoard.module.css` ฉบับย่อ**

ไฟล์นี้จะโตขึ้นเรื่อย ๆ ใน task ถัด ๆ ไป เริ่มด้วยเปลือกและ fullscreen fallback:

```css
.shell {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border, #e3e6ee);
  border-radius: 20px;
  background: #0b1020;
  color: #fff;
}

/* คู่กับ useToolFullscreen: native :fullscreen และ fallback ของ iOS
   ต้องหน้าตาเหมือนกันเป๊ะ */
.shell:fullscreen,
.shell.fsFallback {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483646 !important;
  width: 100vw !important;
  height: 100dvh !important;
  border-radius: 0 !important;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

.barTitle {
  font-size: 14px;
  font-weight: 700;
}

.iconBtn {
  min-width: 40px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.iconBtn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.iconBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.body {
  padding: 18px 14px 26px;
}
```

- [ ] **Step 3: สร้าง `app/mystery-board/MysteryBoardApp.tsx` — state + หน้าตั้งค่าแบบ inline**

หน้าตั้งค่าเขียน inline ก่อนใน task นี้ แล้วค่อยแยกออกเป็น `SetupPanel.tsx` ใน Task 3
(ยังไม่รู้ครบว่าต้องส่ง props อะไรบ้างจนกว่ากระดานจะเสร็จ)

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import styles from "./MysteryBoard.module.css";
import {
  BOARD_SIZES,
  DEFAULT_SETTINGS,
  MODE_LABELS,
  THEME_LABELS,
  loadSettings,
  parseQuestions,
  saveSettings,
  type BoardSize,
  type Mode,
  type Settings,
  type Theme,
} from "./boardModel";

export default function MysteryBoardApp() {
  useTrackToolUse("mystery-board");

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [questionText, setQuestionText] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(
    frameRef,
    styles.fsFallback,
  );

  // โหลดค่าที่บันทึกไว้หลัง mount เท่านั้น กัน hydration mismatch
  useEffect(() => {
    const restored = loadSettings();
    setSettings(restored);
    setQuestionText(restored.questions.join("\n"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  const questions = parseQuestions(questionText);
  const canStart = settings.mode === "score" || questions.length > 0;

  return (
    <div
      ref={frameRef}
      className={`${styles.shell} ${fullscreenClassName}`}
      data-theme={settings.theme}
    >
      <div className={styles.bar}>
        <span className={styles.barTitle}>🎁 กระดานป้ายปริศนา</span>
        <button type="button" className={styles.iconBtn} onClick={toggle}>
          ⛶ {isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
        </button>
      </div>

      <div className={styles.body}>
        <fieldset>
          <legend>โหมด</legend>
          {(Object.keys(MODE_LABELS) as Mode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={styles.iconBtn}
              aria-pressed={settings.mode === mode}
              onClick={() => setSettings((s) => ({ ...s, mode }))}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </fieldset>

        <fieldset>
          <legend>จำนวนป้าย</legend>
          {BOARD_SIZES.map((size: BoardSize) => (
            <button
              key={size}
              type="button"
              className={styles.iconBtn}
              aria-pressed={settings.size === size}
              onClick={() => setSettings((s) => ({ ...s, size }))}
            >
              {size} ป้าย
            </button>
          ))}
        </fieldset>

        <fieldset>
          <legend>ธีม</legend>
          {(Object.keys(THEME_LABELS) as Theme[]).map((theme) => (
            <button
              key={theme}
              type="button"
              className={styles.iconBtn}
              aria-pressed={settings.theme === theme}
              onClick={() => setSettings((s) => ({ ...s, theme }))}
            >
              {THEME_LABELS[theme]}
            </button>
          ))}
        </fieldset>

        {settings.mode === "question" && (
          <label>
            <span>คำถาม (1 บรรทัด = 1 คำถาม)</span>
            <textarea
              rows={6}
              value={questionText}
              onChange={(e) => {
                const next = e.target.value;
                setQuestionText(next);
                setSettings((s) => ({ ...s, questions: parseQuestions(next) }));
              }}
            />
            <span>{questions.length} คำถาม</span>
          </label>
        )}

        <button type="button" className={styles.iconBtn} disabled={!canStart}>
          เริ่มเกม
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: สร้าง `app/mystery-board/page.tsx` ฉบับย่อ**

```tsx
import type { Metadata } from "next";
import MysteryBoardApp from "./MysteryBoardApp";

export const metadata: Metadata = {
  title: "กระดานป้ายปริศนา สุ่มเปิดป้ายตอบคำถาม ใช้ฟรี | khuncool",
  description:
    "กระดานป้ายปริศนาสำหรับห้องเรียน ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถาม ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
};

export default function MysteryBoardPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <div className="px-4 pb-8 pt-4 md:px-8">
        <h1 className="m-0 mb-2 text-[22px] md:text-[28px]">
          กระดานป้ายปริศนา
        </h1>
        <MysteryBoardApp />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error (warning เดิมของโปรเจกต์ที่ไม่เกี่ยวกับไฟล์ใหม่ปล่อยได้)

```bash
npm run build
```

Expected: build สำเร็จ และเห็น route `/mystery-board` ในตาราง route ที่พิมพ์ออกมา

- [ ] **Step 6: ตรวจในเบราว์เซอร์**

เปิด dev server แล้วเข้า `http://localhost:3000/mystery-board`:
- กดเปลี่ยนโหมด/ขนาด/ธีม แล้วรีเฟรช — ค่าที่เลือกต้องคงอยู่
- สลับเป็นโหมดคำถาม พิมพ์ 3 บรรทัด — ตัวนับต้องขึ้น "3 คำถาม" และคงอยู่หลังรีเฟรช
- โหมดคำถามที่ยังไม่มีคำถาม — ปุ่ม "เริ่มเกม" ต้อง disabled
- console ต้องไม่มี hydration warning

- [ ] **Step 7: Commit**

```bash
git add app/mystery-board
git commit -m "feat(mystery-board): scaffold route with persisted settings"
```

---

### Task 2: ตารางรางวัลและการสร้างป้าย

**Files:**
- Modify: `app/mystery-board/boardModel.ts` (เพิ่มต่อท้ายไฟล์จาก Task 1)

- [ ] **Step 1: เพิ่มฟังก์ชัน shuffle, buildPrizes, buildTiles**

ต่อท้าย `boardModel.ts`:

```ts
/** Fisher–Yates — คืน array ใหม่เสมอ ไม่แก้ของเดิม */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const JACKPOT: Prize = {
  kind: "points",
  value: 50,
  label: "แจ็กพอต! ได้ 50 คะแนน",
  emoji: "💎",
};

const BOMB: Prize = {
  kind: "bomb",
  value: -15,
  label: "ระเบิด! เสีย 15 คะแนน",
  emoji: "💣",
};

/** น้ำหนักเป็นเปอร์เซ็นต์โดยประมาณ รวมกันได้ 100 */
const PRIZE_WEIGHTS: { weight: number; prize: Prize }[] = [
  { weight: 20, prize: { kind: "points", value: 5, label: "ได้ 5 คะแนน", emoji: "🎉" } },
  { weight: 22, prize: { kind: "points", value: 10, label: "ได้ 10 คะแนน", emoji: "🎉" } },
  { weight: 13, prize: { kind: "points", value: 20, label: "ได้ 20 คะแนน", emoji: "🎊" } },
  { weight: 8, prize: JACKPOT },
  { weight: 10, prize: { kind: "double", value: 2, label: "คะแนนรอบนี้ ×2", emoji: "✨" } },
  { weight: 10, prize: { kind: "steal", value: 10, label: "ขโมย 10 คะแนนจากทีมอื่น", emoji: "🦝" } },
  { weight: 12, prize: BOMB },
  { weight: 5, prize: { kind: "lucky", value: 1, label: "โชคดี! เลือกเปิดป้ายเพิ่มอีก 1 ใบ", emoji: "🍀" } },
];

export function isJackpot(prize: Prize): boolean {
  return prize.kind === "points" && prize.value >= 50;
}

/** แทนที่ป้ายแต้มธรรมดา 1 ใบด้วย target ถ้ากระดานยังไม่มีของแบบนั้นเลย */
function ensureOne(prizes: Prize[], target: Prize, has: (p: Prize) => boolean) {
  if (prizes.some(has)) return;
  const i = prizes.findIndex((p) => p.kind === "points" && p.value < 50);
  prizes[i >= 0 ? i : 0] = target;
}

/** คืนรางวัลจำนวน count ใบ สับแล้ว การันตีว่ามีแจ็กพอตและระเบิดอย่างละใบ */
export function buildPrizes(count: number): Prize[] {
  const deck: Prize[] = [];
  for (const { weight, prize } of PRIZE_WEIGHTS) {
    const n = Math.max(1, Math.round((weight / 100) * count));
    for (let i = 0; i < n; i++) deck.push(prize);
  }
  const picked = shuffle(deck).slice(0, count);
  while (picked.length < count) picked.push(PRIZE_WEIGHTS[1].prize);
  ensureOne(picked, JACKPOT, isJackpot);
  ensureOne(picked, BOMB, (p) => p.kind === "bomb");
  return picked;
}

/**
 * สร้างป้ายของกระดานหนึ่งรอบ
 *
 * โหมดคำถาม: ถ้าคำถามน้อยกว่าขนาดที่เลือก จำนวนป้ายจะลดลงเท่าจำนวนคำถาม
 * (ป้ายเปล่าไม่มีประโยชน์) ผู้เรียกต้องอ่านจำนวนป้ายจริงจาก tiles.length
 * ไม่ใช่ settings.size
 */
export function buildTiles(settings: Settings): Tile[] {
  if (settings.mode === "question") {
    return shuffle(settings.questions)
      .slice(0, settings.size)
      .map((question, i) => ({ id: i + 1, opened: false, question }));
  }
  return buildPrizes(settings.size).map((prize, i) => ({
    id: i + 1,
    opened: false,
    prize,
  }));
}

/** ข้อความย่อบนป้ายที่เปิดแล้ว */
export function tileSummary(tile: Tile): string {
  if (tile.prize) return `${tile.prize.emoji} ${tile.prize.value > 0 ? "+" : ""}${tile.prize.value}`;
  return "✓";
}
```

- [ ] **Step 2: ตรวจ logic ด้วยสคริปต์ที่รันได้จริง**

โปรเจกต์ไม่มี test runner จึงตรวจด้วย Node ที่คอมไพล์ TS ผ่าน `next build` ไม่ได้ —
ใช้วิธีคัดลอก logic ไปรันชั่วคราวแทน สร้างไฟล์ **นอก repo** ที่
`<scratchpad>/check-board-model.mjs` โดยคัดลอกเนื้อฟังก์ชัน `shuffle`,
`PRIZE_WEIGHTS`, `buildPrizes`, `ensureOne`, `isJackpot` (ลบ type annotation ออก)
แล้วต่อท้ายด้วย:

```js
for (const size of [12, 20, 30]) {
  for (let run = 0; run < 200; run++) {
    const prizes = buildPrizes(size);
    if (prizes.length !== size) throw new Error(`size ${size}: got ${prizes.length}`);
    if (!prizes.some(isJackpot)) throw new Error(`size ${size}: no jackpot`);
    if (!prizes.some((p) => p.kind === "bomb")) throw new Error(`size ${size}: no bomb`);
  }
}
console.log("OK: ทุกกระดานได้จำนวนป้ายถูกต้อง มีแจ็กพอตและระเบิดครบ");
```

Run: `node <scratchpad>/check-board-model.mjs`
Expected: พิมพ์ `OK: ...` ไม่มี error

ถ้า assertion ล้ม ให้แก้ `buildPrizes` ใน `boardModel.ts` แล้วคัดลอกใหม่และรันซ้ำ
ไฟล์สคริปต์นี้เป็นของชั่วคราว **ห้าม commit เข้า repo**

- [ ] **Step 3: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 4: Commit**

```bash
git add app/mystery-board/boardModel.ts
git commit -m "feat(mystery-board): add prize table and tile builder"
```

---

### Task 3: กระดานป้าย เปิดได้จริง (ยังไม่มีแอนิเมชัน)

**Files:**
- Create: `app/mystery-board/SetupPanel.tsx`
- Create: `app/mystery-board/BoardGrid.tsx`
- Modify: `app/mystery-board/MysteryBoardApp.tsx`
- Modify: `app/mystery-board/MysteryBoard.module.css`

- [ ] **Step 1: ย้ายหน้าตั้งค่าออกมาเป็น `SetupPanel.tsx`**

```tsx
"use client";

import styles from "./MysteryBoard.module.css";
import {
  BOARD_SIZES,
  MODE_LABELS,
  THEME_LABELS,
  type BoardSize,
  type Mode,
  type Settings,
  type Theme,
} from "./boardModel";

type Props = {
  settings: Settings;
  questionText: string;
  questionCount: number;
  onChange: (patch: Partial<Settings>) => void;
  onQuestionTextChange: (text: string) => void;
  onStart: () => void;
};

export default function SetupPanel({
  settings,
  questionText,
  questionCount,
  onChange,
  onQuestionTextChange,
  onStart,
}: Props) {
  const canStart = settings.mode === "score" || questionCount > 0;
  const effectiveTiles =
    settings.mode === "question"
      ? Math.min(settings.size, questionCount)
      : settings.size;

  return (
    <div className={styles.setup}>
      <div className={styles.setupGroup}>
        <span className={styles.setupLabel}>เลือกโหมด</span>
        <div className={styles.chipRow}>
          {(Object.keys(MODE_LABELS) as Mode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={styles.chip}
              aria-pressed={settings.mode === mode}
              onClick={() => onChange({ mode })}
            >
              {mode === "score" ? "🎁" : "❓"} {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <p className={styles.setupHint}>
          {settings.mode === "score"
            ? "หลังป้ายเป็นคะแนนและการ์ดพิเศษ ระบบสุ่มให้เอง ไม่ต้องเตรียมอะไร"
            : "หลังป้ายเป็นคำถามที่คุณครูพิมพ์ไว้ 1 บรรทัด = 1 คำถาม"}
        </p>
      </div>

      <div className={styles.setupGroup}>
        <span className={styles.setupLabel}>จำนวนป้าย</span>
        <div className={styles.chipRow}>
          {BOARD_SIZES.map((size: BoardSize) => (
            <button
              key={size}
              type="button"
              className={styles.chip}
              aria-pressed={settings.size === size}
              onClick={() => onChange({ size })}
            >
              {size} ป้าย
            </button>
          ))}
        </div>
      </div>

      <div className={styles.setupGroup}>
        <span className={styles.setupLabel}>ธีม</span>
        <div className={styles.chipRow}>
          {(Object.keys(THEME_LABELS) as Theme[]).map((theme) => (
            <button
              key={theme}
              type="button"
              className={styles.chip}
              aria-pressed={settings.theme === theme}
              onClick={() => onChange({ theme })}
            >
              {THEME_LABELS[theme]}
            </button>
          ))}
        </div>
      </div>

      {settings.mode === "question" && (
        <div className={styles.setupGroup}>
          <label className={styles.setupLabel} htmlFor="mystery-questions">
            คำถามของคุณครู
          </label>
          <textarea
            id="mystery-questions"
            className={styles.textarea}
            rows={7}
            placeholder={"เมืองหลวงของไทยคือจังหวัดอะไร\n7 × 8 เท่ากับเท่าไร\nสัตว์เลี้ยงลูกด้วยนมคืออะไร"}
            value={questionText}
            onChange={(e) => onQuestionTextChange(e.target.value)}
          />
          <div className={styles.setupHint}>
            {questionCount} คำถาม
            {questionCount > 0 && questionCount < settings.size && (
              <> — กระดานจะเหลือ {questionCount} ป้ายตามจำนวนคำถาม</>
            )}
            {questionCount > settings.size && (
              <> — จะสุ่มมาใช้ {settings.size} คำถาม</>
            )}
          </div>
          {questionText.length > 0 && (
            <button
              type="button"
              className={styles.chip}
              onClick={() => onQuestionTextChange("")}
            >
              ล้างคำถาม
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.primaryBtn}
        disabled={!canStart}
        onClick={onStart}
      >
        เริ่มเกม · {effectiveTiles} ป้าย
      </button>
    </div>
  );
}
```

- [ ] **Step 2: สร้าง `BoardGrid.tsx`**

`spotlightId` คือป้ายที่ไฟวิ่งกำลังส่องอยู่ (ใช้จริงใน Task 5 — ตอนนี้ส่ง `null` มาก่อน)

```tsx
"use client";

import styles from "./MysteryBoard.module.css";
import { tileSummary, type Tile } from "./boardModel";

type Props = {
  tiles: Tile[];
  spotlightId: number | null;
  busy: boolean;
  onPick: (id: number) => void;
};

export default function BoardGrid({ tiles, spotlightId, busy, onPick }: Props) {
  return (
    <div className={styles.grid}>
      {tiles.map((tile, index) => (
        <button
          key={tile.id}
          type="button"
          className={`${styles.tile} ${tile.opened ? styles.tileOpened : ""} ${
            spotlightId === tile.id ? styles.tileSpotlight : ""
          }`}
          style={{ ["--i" as string]: index }}
          disabled={busy}
          aria-label={
            tile.opened
              ? `ป้ายหมายเลข ${tile.id} เปิดแล้ว`
              : `ป้ายหมายเลข ${tile.id} ยังไม่เปิด`
          }
          onClick={() => onPick(tile.id)}
        >
          <span className={styles.tileNumber}>{tile.id}</span>
          {tile.opened && (
            <span className={styles.tileSummary}>{tileSummary(tile)}</span>
          )}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: เพิ่ม CSS ของ setup และกริดใน `MysteryBoard.module.css`**

ต่อท้ายไฟล์:

```css
.setup {
  display: grid;
  gap: 18px;
  max-width: 640px;
  margin: 0 auto;
}

.setupGroup {
  display: grid;
  gap: 8px;
}

.setupLabel {
  font-size: 14px;
  font-weight: 700;
}

.setupHint {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.66);
}

.chipRow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.chip[aria-pressed="true"] {
  border-color: #8b7bf0;
  background: linear-gradient(135deg, #5c5ee6, #8b7bf0);
  box-shadow: 0 6px 20px rgba(92, 94, 230, 0.45);
}

.textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 14px;
  line-height: 1.8;
  resize: vertical;
}

.primaryBtn {
  min-height: 52px;
  padding: 0 26px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #f97316, #fbbf24);
  color: #1b1200;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
}

.primaryBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 10px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 14px;
  }
}

.tile {
  position: relative;
  display: grid;
  place-items: center;
  gap: 4px;
  aspect-ratio: 1 / 1;
  min-height: 84px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  background: linear-gradient(150deg, #2a2f6d, #171a3c);
  color: #fff;
  cursor: pointer;
}

.tileNumber {
  font-size: clamp(26px, 6vw, 44px);
  font-weight: 900;
  line-height: 1;
}

.tileSummary {
  font-size: 12.5px;
  font-weight: 700;
  opacity: 0.9;
}

.tileOpened {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
}

.boardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.counter {
  font-size: 14px;
  font-weight: 700;
}

.boardFooter {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.doneBanner {
  margin: 14px 0 0;
  padding: 14px;
  border-radius: 16px;
  background: rgba(251, 191, 36, 0.16);
  text-align: center;
  font-size: 16px;
  font-weight: 800;
}
```

- [ ] **Step 4: ต่อ state ของกระดานใน `MysteryBoardApp.tsx`**

แทนที่ทั้งไฟล์ด้วยเวอร์ชันนี้ (ยังไม่มี overlay — กดป้ายแล้วเปิดทันที เพิ่ม overlay ใน Task 4):

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import styles from "./MysteryBoard.module.css";
import BoardGrid from "./BoardGrid";
import SetupPanel from "./SetupPanel";
import {
  DEFAULT_SETTINGS,
  buildTiles,
  loadSettings,
  parseQuestions,
  saveSettings,
  type Settings,
  type Tile,
} from "./boardModel";

type Phase = "setup" | "board";

export default function MysteryBoardApp() {
  useTrackToolUse("mystery-board");

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [questionText, setQuestionText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>("setup");
  const [tiles, setTiles] = useState<Tile[]>([]);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(
    frameRef,
    styles.fsFallback,
  );

  useEffect(() => {
    const restored = loadSettings();
    setSettings(restored);
    setQuestionText(restored.questions.join("\n"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const handleQuestionText = useCallback((text: string) => {
    setQuestionText(text);
    setSettings((s) => ({ ...s, questions: parseQuestions(text) }));
  }, []);

  const startGame = useCallback(() => {
    setTiles(buildTiles(settings));
    setPhase("board");
  }, [settings]);

  const openTile = useCallback((id: number) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, opened: true } : t)),
    );
  }, []);

  const openedCount = tiles.filter((t) => t.opened).length;
  const allOpened = tiles.length > 0 && openedCount === tiles.length;

  return (
    <div
      ref={frameRef}
      className={`${styles.shell} ${fullscreenClassName}`}
      data-theme={settings.theme}
    >
      <div className={styles.bar}>
        <span className={styles.barTitle}>🎁 กระดานป้ายปริศนา</span>
        <div className={styles.chipRow}>
          {phase === "board" && (
            <>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setPhase("setup")}
              >
                ⚙️ ตั้งค่า
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={startGame}
              >
                🔄 เริ่มใหม่
              </button>
            </>
          )}
          <button type="button" className={styles.iconBtn} onClick={toggle}>
            ⛶ {isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {phase === "setup" ? (
          <SetupPanel
            settings={settings}
            questionText={questionText}
            questionCount={parseQuestions(questionText).length}
            onChange={patchSettings}
            onQuestionTextChange={handleQuestionText}
            onStart={startGame}
          />
        ) : (
          <>
            <div className={styles.boardTop}>
              <span className={styles.counter}>
                เปิดแล้ว {openedCount}/{tiles.length}
              </span>
            </div>
            <BoardGrid
              tiles={tiles}
              spotlightId={null}
              busy={false}
              onPick={openTile}
            />
            {allOpened && (
              <p className={styles.doneBanner}>
                🎉 เปิดครบทุกป้ายแล้ว! กด &quot;เริ่มใหม่&quot; เพื่อเล่นอีกรอบ
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 6: ตรวจในเบราว์เซอร์**

- โหมดคะแนน 12 ป้าย → กด "เริ่มเกม" ต้องได้กริด 12 ป้ายเลข 1–12
- กดป้าย → ป้ายจางลงและตัวนับเพิ่มเป็น 1/12
- เปิดครบทุกป้าย → เห็นแบนเนอร์ "เปิดครบทุกป้ายแล้ว!"
- กด "เริ่มใหม่" → ป้ายทั้งหมดกลับมาปิด
- โหมดคำถามที่พิมพ์ 5 คำถามแต่เลือก 20 ป้าย → กระดานต้องมี 5 ป้าย และปุ่มเริ่มเกมเขียนว่า "เริ่มเกม · 5 ป้าย"
- ย่อหน้าจอเป็นขนาดมือถือ → กริดต้องเหลือ 3 คอลัมน์และไม่มี scroll แนวนอน

- [ ] **Step 7: Commit**

```bash
git add app/mystery-board
git commit -m "feat(mystery-board): add playable board grid and setup panel"
```

---

### Task 4: Overlay เผยผล + ป้ายพลิก 3D

**Files:**
- Create: `app/mystery-board/RevealOverlay.tsx`
- Modify: `app/mystery-board/MysteryBoardApp.tsx`
- Modify: `app/mystery-board/MysteryBoard.module.css`

- [ ] **Step 1: สร้าง `RevealOverlay.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MysteryBoard.module.css";
import { isJackpot, type Tile } from "./boardModel";

type Props = {
  tile: Tile;
  /** true เมื่อเป็นการเปิดครั้งแรก (เล่นแอนิเมชัน) — false เมื่อกดดูย้อนหลัง */
  animate: boolean;
  onClose: () => void;
};

export default function RevealOverlay({ tile, animate, onClose }: Props) {
  const [flipped, setFlipped] = useState(!animate);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!animate) return;
    const id = window.setTimeout(() => setFlipped(true), 260);
    return () => window.clearTimeout(id);
  }, [animate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const prize = tile.prize;
  const celebrate = prize ? isJackpot(prize) : false;
  const dangerous = prize?.kind === "bomb";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`ผลของป้ายหมายเลข ${tile.id}`}
      onClick={onClose}
    >
      <div
        className={`${styles.card} ${flipped ? styles.cardFlipped : ""} ${
          celebrate ? styles.cardJackpot : ""
        } ${dangerous ? styles.cardBomb : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.cardFace}>
          <span className={styles.cardNumber}>{tile.id}</span>
        </div>
        <div className={`${styles.cardFace} ${styles.cardBack}`}>
          {prize ? (
            <>
              <span className={styles.cardEmoji}>{prize.emoji}</span>
              <span className={styles.cardLabel}>{prize.label}</span>
            </>
          ) : (
            <p className={styles.cardQuestion}>{tile.question}</p>
          )}
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        className={styles.primaryBtn}
        onClick={onClose}
      >
        กลับกระดาน
      </button>
    </div>
  );
}
```

- [ ] **Step 2: เพิ่ม CSS ของ overlay และการพลิก**

ต่อท้าย `MysteryBoard.module.css`:

```css
.overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: grid;
  place-content: center;
  gap: 26px;
  justify-items: center;
  padding: 20px;
  background: rgba(6, 9, 22, 0.72);
  backdrop-filter: blur(10px);
  animation: overlayIn 0.22s ease-out both;
}

@keyframes overlayIn {
  from {
    opacity: 0;
  }
}

.card {
  position: relative;
  width: min(78vw, 460px);
  min-height: min(52vh, 320px);
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1);
  animation: cardRise 0.34s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
}

@keyframes cardRise {
  from {
    transform: scale(0.7) translateY(28px);
    opacity: 0;
  }
}

.cardFlipped {
  transform: rotateY(180deg);
}

.cardFace {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 14px;
  justify-items: center;
  padding: 26px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 26px;
  background: linear-gradient(150deg, #2a2f6d, #171a3c);
  backface-visibility: hidden;
  text-align: center;
}

.cardBack {
  transform: rotateY(180deg);
  background: linear-gradient(150deg, #5c5ee6, #8b7bf0);
}

.cardJackpot .cardBack {
  background: linear-gradient(150deg, #f59e0b, #fbbf24);
  color: #1b1200;
}

.cardBomb .cardBack {
  background: linear-gradient(150deg, #b91c1c, #ef4444);
}

.cardNumber {
  font-size: clamp(64px, 16vw, 128px);
  font-weight: 900;
  line-height: 1;
}

.cardEmoji {
  font-size: clamp(56px, 14vw, 104px);
  line-height: 1;
}

.cardLabel {
  font-size: clamp(20px, 4vw, 30px);
  font-weight: 800;
  line-height: 1.4;
}

.cardQuestion {
  margin: 0;
  font-size: clamp(20px, 3.6vw, 34px);
  font-weight: 700;
  line-height: 1.5;
}
```

- [ ] **Step 3: ต่อ overlay เข้ากับ `MysteryBoardApp.tsx`**

เพิ่ม import และ state:

```tsx
import RevealOverlay from "./RevealOverlay";
```

```tsx
  const [revealId, setRevealId] = useState<number | null>(null);
  const [revealAnimate, setRevealAnimate] = useState(true);
```

แทนที่ `openTile` เดิมด้วย:

```tsx
  const openTile = useCallback(
    (id: number) => {
      const tile = tiles.find((t) => t.id === id);
      if (!tile) return;
      setRevealAnimate(!tile.opened);
      setRevealId(id);
      if (!tile.opened) {
        setTiles((prev) =>
          prev.map((t) => (t.id === id ? { ...t, opened: true } : t)),
        );
      }
    },
    [tiles],
  );
```

เพิ่มก่อนปิด `</div>` ของ `styles.body`:

```tsx
        {revealTile && (
          <RevealOverlay
            tile={revealTile}
            animate={revealAnimate}
            onClose={() => setRevealId(null)}
          />
        )}
```

และคำนวณ `revealTile` ก่อน return:

```tsx
  const revealTile = tiles.find((t) => t.id === revealId) ?? null;
```

`startGame` ต้องล้าง overlay ด้วย — เพิ่ม `setRevealId(null);` เข้าไปใน `startGame`

- [ ] **Step 4: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 5: ตรวจในเบราว์เซอร์**

- กดป้ายที่ยังไม่เปิด → overlay ขึ้น ป้ายพลิก 3D เห็นรางวัล
- กด "กลับกระดาน" หรือ Esc หรือคลิกพื้นหลัง → overlay ปิด ป้ายกลายเป็นเปิดแล้ว
- กดป้ายเดิมซ้ำ → overlay ขึ้นแบบไม่พลิก (เห็นผลทันที)
- โหมดคำถาม → overlay ต้องโชว์ข้อความคำถามตัวใหญ่ อ่านจากไกลได้
- กด Tab หลังเปิด overlay → โฟกัสต้องอยู่ที่ปุ่ม "กลับกระดาน" ตั้งแต่แรก

- [ ] **Step 6: Commit**

```bash
git add app/mystery-board
git commit -m "feat(mystery-board): add reveal overlay with 3D card flip"
```

---

### Task 5: ปุ่มสุ่มป้าย + ไฟวิ่งไล่

**Files:**
- Modify: `app/mystery-board/MysteryBoardApp.tsx`
- Modify: `app/mystery-board/MysteryBoard.module.css`

- [ ] **Step 1: เพิ่ม CSS ของไฟวิ่งและ hover ป้าย**

ต่อท้าย `MysteryBoard.module.css`:

```css
.tile:not(.tileOpened):hover,
.tile:not(.tileOpened):focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 14px 34px rgba(92, 94, 230, 0.45);
  outline: none;
}

.tile {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  animation: tileIn 0.34s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
  animation-delay: calc(var(--i) * 40ms);
}

@keyframes tileIn {
  from {
    transform: scale(0.7) translateY(16px);
    opacity: 0;
  }
}

.tileSpotlight {
  transform: translateY(-6px) scale(1.06);
  border-color: #fbbf24;
  box-shadow:
    0 0 0 3px rgba(251, 191, 36, 0.8),
    0 16px 40px rgba(251, 191, 36, 0.45);
}
```

- [ ] **Step 2: เพิ่ม state และ logic การสุ่มใน `MysteryBoardApp.tsx`**

เพิ่ม refs และ state:

```tsx
  const [spotlightId, setSpotlightId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
```

เพิ่มตัวช่วยจัดการ timeout (วางไว้เหนือ `startGame`):

```tsx
  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  const clearTimeouts = useCallback(() => {
    for (const id of timeoutsRef.current) clearTimeout(id);
    timeoutsRef.current.clear();
  }, []);

  // ไฟวิ่งใช้ timeout หลายสิบตัว ถ้าไม่เคลียร์จะยิงหลัง unmount
  useEffect(() => clearTimeouts, [clearTimeouts]);
```

เพิ่มฟังก์ชันสุ่ม:

```tsx
  /** สุ่มเป้าหมายก่อน แล้วค่อยเล่นไฟวิ่งให้ไปจบที่ป้ายนั้น */
  const randomPick = useCallback(() => {
    if (busy) return;
    const closed = tiles.filter((t) => !t.opened);
    if (closed.length === 0) return;

    const target = closed[Math.floor(Math.random() * closed.length)];
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      openTile(target.id);
      return;
    }

    setBusy(true);
    clearTimeouts();

    // ไล่ไฟผ่านป้ายที่ยังไม่เปิด 2 รอบครึ่ง แล้วหน่วงลงเรื่อย ๆ
    const path: number[] = [];
    const loops = 2;
    for (let l = 0; l < loops; l++) for (const t of closed) path.push(t.id);
    const targetIndex = closed.findIndex((t) => t.id === target.id);
    for (let i = 0; i <= targetIndex; i++) path.push(closed[i].id);

    let elapsed = 0;
    path.forEach((id, i) => {
      const progress = i / Math.max(1, path.length - 1);
      // 45ms ตอนต้น ค่อย ๆ ยืดเป็น ~230ms ตอนใกล้หยุด
      elapsed += 45 + Math.pow(progress, 3) * 185;
      trackedTimeout(() => setSpotlightId(id), elapsed);
    });

    trackedTimeout(() => {
      setSpotlightId(null);
      setBusy(false);
      openTile(target.id);
    }, elapsed + 420);
  }, [busy, tiles, openTile, clearTimeouts, trackedTimeout]);
```

`startGame` ต้องหยุดไฟวิ่งที่ค้างอยู่ด้วย — เพิ่มที่บรรทัดแรกของ `startGame`:

```tsx
    clearTimeouts();
    setSpotlightId(null);
    setBusy(false);
```

- [ ] **Step 3: ต่อปุ่มสุ่มเข้ากับ UI**

ส่ง `spotlightId` และ `busy` ให้ `BoardGrid` (แทน `null` / `false` เดิม) แล้วเพิ่ม
ปุ่มสุ่มใต้กริด ก่อนแบนเนอร์ "เปิดครบ":

```tsx
            <div className={styles.boardFooter}>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={busy || allOpened}
                onClick={randomPick}
              >
                🎲 สุ่มป้าย
              </button>
            </div>
```

- [ ] **Step 4: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 5: ตรวจในเบราว์เซอร์**

- กด "🎲 สุ่มป้าย" → ไฟวิ่งไล่ทั่วกระดานเร็วแล้วช้าลง หยุดที่ป้ายหนึ่ง แล้ว overlay เปิดป้ายนั้น
- ระหว่างไฟวิ่ง ปุ่มสุ่มและป้ายทุกใบต้องกดไม่ได้ (disabled)
- กดสุ่มจนเหลือป้ายสุดท้าย → ต้องไปจบที่ป้ายที่ยังไม่เปิดเสมอ ไม่เคยเลือกป้ายที่เปิดแล้ว
- เปิดครบแล้ว → ปุ่มสุ่ม disabled
- กด "เริ่มใหม่" ระหว่างไฟวิ่ง → ไฟต้องหยุดทันที ไม่มีป้ายเปิดเองทีหลัง
- เปิด DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` แล้วกดสุ่ม → ต้องเปิดป้ายทันทีโดยไม่มีไฟวิ่ง
- ออกจากหน้า `/mystery-board` ระหว่างไฟวิ่ง → console ต้องไม่มี warning เรื่อง state update หลัง unmount

- [ ] **Step 6: Commit**

```bash
git add app/mystery-board
git commit -m "feat(mystery-board): add random pick with spotlight run"
```

---

### Task 6: เสียงและเอฟเฟกต์ฉลอง

**Files:**
- Create: `app/mystery-board/useBoardSound.ts`
- Modify: `app/mystery-board/MysteryBoardApp.tsx`
- Modify: `app/mystery-board/MysteryBoard.module.css`

- [ ] **Step 1: สร้าง `useBoardSound.ts`**

สังเคราะห์เสียงเองด้วย Web Audio ตามแบบ `beep()` ใน `app/duck-race/DuckRaceApp.tsx:279`
— ไม่โหลดไฟล์เสียง

```ts
"use client";

import { useCallback, useEffect, useRef } from "react";

export type SoundKind = "tick" | "flip" | "jackpot" | "bomb";

/**
 * เสียงประกอบกระดาน สร้าง AudioContext ตอนผู้ใช้กดครั้งแรกเท่านั้น
 * (เบราว์เซอร์บล็อกการสร้างก่อนมี user gesture) และปิดตอน unmount
 */
export function useBoardSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  const context = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctxRef.current = new Ctor();
      } catch {
        ctxRef.current = null;
      }
    }
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (
      ctx: AudioContext,
      freq: number,
      start: number,
      dur: number,
      type: OscillatorType,
      vol: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    },
    [],
  );

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabledRef.current) return;
      const ctx = context();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const t = ctx.currentTime;

      switch (kind) {
        case "tick":
          tone(ctx, 880, t, 0.05, "square", 0.05);
          break;
        case "flip":
          tone(ctx, 320, t, 0.14, "triangle", 0.12);
          tone(ctx, 640, t + 0.06, 0.16, "triangle", 0.1);
          break;
        case "jackpot":
          [523, 659, 784, 1047].forEach((f, i) =>
            tone(ctx, f, t + i * 0.09, 0.3, "triangle", 0.14),
          );
          break;
        case "bomb":
          tone(ctx, 180, t, 0.3, "sawtooth", 0.18);
          tone(ctx, 90, t + 0.05, 0.45, "sawtooth", 0.16);
          break;
      }
    },
    [context, tone],
  );

  return play;
}
```

- [ ] **Step 2: เพิ่ม CSS ของคอนเฟตตี จอสั่น และแดงวูบ**

ต่อท้าย `MysteryBoard.module.css`:

```css
.shakeNow {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translateX(-3px);
  }
  20%,
  80% {
    transform: translateX(5px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-8px);
  }
  40%,
  60% {
    transform: translateX(8px);
  }
}

.dangerFlash {
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.5), transparent 70%);
  animation: dangerFlash 0.6s ease-out both;
}

@keyframes dangerFlash {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shell *,
  .shell *::before,
  .shell *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: ต่อเสียงและคอนเฟตตีเข้ากับ `MysteryBoardApp.tsx`**

เพิ่ม `isJackpot` เข้าไปใน import จาก `./boardModel` ที่มีอยู่แล้ว (อย่าเขียน
import ซ้ำสองบรรทัด — ESLint จะฟ้อง) แล้วเพิ่ม import ของ hook เสียง:

```tsx
import { useBoardSound } from "./useBoardSound";
```

วาง constant สีคอนเฟตตีไว้ที่ **module scope** เหนือ component (ไม่ต้องสร้างใหม่ทุก render):

```tsx
const CONFETTI_COLORS = ["#fbbf24", "#f97316", "#5c5ee6", "#22b8a0", "#ef4444"];
```

เพิ่มใน component:

```tsx
  const [danger, setDanger] = useState(false);
  const play = useBoardSound(settings.soundOn);
```

เพิ่มฟังก์ชันคอนเฟตตี — ยืมวิธีจาก `burst()` ใน `app/duck-race/DuckRaceApp.tsx:481`
(สร้าง div แล้วใช้ `element.animate()` ไม่ต้องมี canvas):

```tsx
  const burst = useCallback(() => {
    const host = frameRef.current;
    if (!host) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const height = host.clientHeight;
    for (let i = 0; i < 40; i++) {
      const bit = document.createElement("div");
      const size = 6 + Math.random() * 7;
      bit.style.cssText = `position:absolute;top:-16px;left:${(
        Math.random() * 100
      ).toFixed(1)}%;width:${size}px;height:${(size * 0.5).toFixed(
        1,
      )}px;background:${
        CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      };border-radius:2px;z-index:60;pointer-events:none`;
      host.appendChild(bit);
      const dur = 1700 + Math.random() * 1200;
      bit.animate(
        [
          { transform: "translateY(0) rotate(0)", opacity: 1 },
          {
            transform: `translateY(${height + 60}px) rotate(${
              Math.random() * 720
            }deg)`,
            opacity: 0.9,
          },
        ],
        { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" },
      );
      trackedTimeout(() => bit.remove(), dur + 80);
    }
  }, [trackedTimeout]);
```

ใน `openTile` หลังจากตั้ง `setRevealId(id)` เพิ่มเอฟเฟกต์ตามผลลัพธ์:

```tsx
      if (!tile.opened) {
        play("flip");
        if (tile.prize && isJackpot(tile.prize)) {
          trackedTimeout(() => {
            play("jackpot");
            burst();
          }, 620);
        } else if (tile.prize?.kind === "bomb") {
          trackedTimeout(() => {
            play("bomb");
            setDanger(true);
            trackedTimeout(() => setDanger(false), 620);
          }, 620);
        }
      }
```

(dependency array ของ `openTile` ต้องเพิ่ม `play`, `burst`, `trackedTimeout`)

ใน `randomPick` เพิ่ม `play("tick")` เข้าไปใน callback ของไฟวิ่ง:

```tsx
      trackedTimeout(() => {
        setSpotlightId(id);
        play("tick");
      }, elapsed);
```

(dependency array ของ `randomPick` ต้องเพิ่ม `play`)

เพิ่ม `styles.shakeNow` ตอน danger และวาง overlay สีแดง — แก้ className ของ shell:

```tsx
      className={`${styles.shell} ${fullscreenClassName} ${
        danger ? styles.shakeNow : ""
      }`}
```

และเพิ่มก่อนปิด shell:

```tsx
      {danger && <div className={styles.dangerFlash} />}
```

เพิ่มปุ่มปิดเสียงในแถบบน (ก่อนปุ่มเต็มจอ):

```tsx
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={settings.soundOn ? "ปิดเสียง" : "เปิดเสียง"}
            onClick={() => patchSettings({ soundOn: !settings.soundOn })}
          >
            {settings.soundOn ? "🔊" : "🔇"}
          </button>
```

- [ ] **Step 4: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error (โดยเฉพาะ `react-hooks/exhaustive-deps`)

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 5: ตรวจในเบราว์เซอร์**

- กดสุ่ม → ได้ยินเสียง tick ตามจังหวะไฟวิ่ง และเสียง flip ตอนพลิก
- เปิดจนเจอแจ็กพอต (💎) → มีคอนเฟตตีตกและเสียงไล่โน้ตขึ้น
- เปิดจนเจอระเบิด (💣) → จอสั่น แดงวูบ และมีเสียงต่ำ
- กดปุ่ม 🔇 → เอฟเฟกต์ภาพยังอยู่แต่ไม่มีเสียงเลย และค่านี้คงอยู่หลังรีเฟรช
- เปิด `prefers-reduced-motion: reduce` → ไม่มีคอนเฟตตี ไม่มีการสั่น
- ออกจากหน้าระหว่างคอนเฟตตีกำลังตก → console ต้องไม่มี error

- [ ] **Step 6: Commit**

```bash
git add app/mystery-board
git commit -m "feat(mystery-board): add sound effects, confetti and bomb shake"
```

---

### Task 7: ธีมสามแบบ

**Files:**
- Modify: `app/mystery-board/MysteryBoard.module.css`

`MysteryBoardApp` ใส่ `data-theme={settings.theme}` ที่ shell มาตั้งแต่ Task 1 แล้ว
task นี้เติมแค่ CSS

- [ ] **Step 1: เพิ่ม CSS ธีมต่อท้ายไฟล์**

```css
/* ---- ธีม: อวกาศ (ค่าเริ่มต้น) ---- */
.shell[data-theme="space"] {
  background:
    radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 70% 60%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1.5px 1.5px at 45% 80%, rgba(255, 255, 255, 0.6), transparent),
    linear-gradient(160deg, #0b1020, #1b1147 60%, #0b1020);
  background-size:
    420px 420px,
    420px 420px,
    420px 420px,
    100% 100%;
  animation: driftStars 42s linear infinite;
}

@keyframes driftStars {
  to {
    background-position:
      420px 420px,
      -420px 420px,
      420px -420px,
      0 0;
  }
}

/* ---- ธีม: สมบัติโจรสลัด ---- */
.shell[data-theme="treasure"] {
  background: linear-gradient(160deg, #2b1a08, #5b3410 55%, #2b1a08);
}

.shell[data-theme="treasure"] .tile {
  background: linear-gradient(150deg, #8a5a1c, #52300c);
  border-color: rgba(251, 191, 36, 0.4);
}

.shell[data-theme="treasure"] .chip[aria-pressed="true"] {
  background: linear-gradient(135deg, #b45309, #f59e0b);
  border-color: #fbbf24;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
}

.shell[data-theme="treasure"] .cardFace {
  background: linear-gradient(150deg, #8a5a1c, #52300c);
}

.shell[data-theme="treasure"] .cardBack {
  background: linear-gradient(150deg, #f59e0b, #fbbf24);
  color: #2b1a08;
}

/* ---- ธีม: นีออน ---- */
.shell[data-theme="neon"] {
  background: linear-gradient(160deg, #06060f, #10102a 55%, #06060f);
}

.shell[data-theme="neon"] .tile {
  background: rgba(12, 12, 32, 0.9);
  border-color: rgba(34, 211, 238, 0.55);
  box-shadow: inset 0 0 18px rgba(34, 211, 238, 0.22);
}

.shell[data-theme="neon"] .tile:not(.tileOpened):hover,
.shell[data-theme="neon"] .tile:not(.tileOpened):focus-visible {
  box-shadow:
    0 0 0 2px rgba(34, 211, 238, 0.8),
    0 14px 34px rgba(34, 211, 238, 0.4);
}

.shell[data-theme="neon"] .chip[aria-pressed="true"] {
  background: linear-gradient(135deg, #0891b2, #22d3ee);
  border-color: #22d3ee;
  box-shadow: 0 6px 20px rgba(34, 211, 238, 0.45);
}

.shell[data-theme="neon"] .cardFace {
  background: rgba(12, 12, 32, 0.95);
  border-color: rgba(34, 211, 238, 0.5);
}

.shell[data-theme="neon"] .cardBack {
  background: linear-gradient(150deg, #0891b2, #22d3ee);
  color: #04121a;
}
```

- [ ] **Step 2: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 3: ตรวจในเบราว์เซอร์**

- สลับธีมทั้งสามแบบในหน้าตั้งค่า → พื้นหลัง ป้าย และ chip ที่เลือกอยู่ต้องเปลี่ยนตาม
- เข้าเกมแล้วเปิดป้าย → หน้าหลังการ์ดต้องใช้สีของธีมนั้น
- รีเฟรช → ธีมที่เลือกไว้ต้องคงอยู่
- ธีมอวกาศ: ดาวพื้นหลังต้องเคลื่อนช้า ๆ และหยุดเมื่อเปิด reduced-motion

- [ ] **Step 4: Commit**

```bash
git add app/mystery-board/MysteryBoard.module.css
git commit -m "feat(mystery-board): add space, treasure and neon themes"
```

---

### Task 8: หน้า landing เต็มรูปแบบ (SEO)

**Files:**
- Modify: `app/mystery-board/page.tsx`

- [ ] **Step 1: เขียน `page.tsx` ฉบับเต็ม**

โครงตาม `app/group-scoreboard/page.tsx` — metadata + JSON-LD `@graph` +
breadcrumb + header + สาม section ท้ายหน้า

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import MysteryBoardApp from "./MysteryBoardApp";

const URL = "https://www.khuncool.com/mystery-board";
const TITLE = "กระดานป้ายปริศนา สุ่มเปิดป้ายตอบคำถาม ใช้ฟรี | khuncool";
const DESCRIPTION =
  "กระดานป้ายปริศนาสำหรับห้องเรียน ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถาม มีแอนิเมชันและเสียงประกอบ ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "กระดานป้ายปริศนา",
    "สุ่มเปิดป้าย",
    "เกมในห้องเรียน",
    "สุ่มคำถาม",
    "mystery box",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    locale: "th_TH",
  },
  twitter: { card: "summary_large_image" },
};

const HOWTO_STEPS = [
  {
    name: "เลือกโหมดและจำนวนป้าย",
    text: "เลือกโหมดคะแนนถ้าอยากให้ระบบสุ่มรางวัลให้เอง หรือโหมดคำถามถ้าจะใส่คำถามของตัวเอง แล้วเลือกจำนวนป้าย 12 20 หรือ 30 ป้าย",
  },
  {
    name: "พิมพ์คำถาม (เฉพาะโหมดคำถาม)",
    text: "พิมพ์คำถามบรรทัดละหนึ่งข้อ ระบบบันทึกไว้ในเบราว์เซอร์ให้ใช้ซ้ำในคาบถัดไปได้ทันที",
  },
  {
    name: "ให้นักเรียนเลือกป้าย",
    text: "ฉายกระดานขึ้นจอหน้าห้อง ให้นักเรียนเลือกป้ายที่อยากเปิด หรือกดปุ่มสุ่มป้ายให้ระบบเลือกแทน",
  },
  {
    name: "เปิดป้ายแล้วตอบคำถาม",
    text: "ป้ายจะพลิกเผยคะแนนหรือคำถามพร้อมเอฟเฟกต์ ให้นักเรียนตอบแล้วกดกลับกระดานเพื่อเล่นป้ายถัดไป",
  },
];

const USE_CASES = [
  {
    icon: "📝",
    head: "ทบทวนบทเรียนท้ายคาบ",
    body: "ใส่คำถามทบทวนแล้วให้นักเรียนเลือกป้าย เปลี่ยนการทบทวนให้เป็นเกมที่ทุกคนอยากมีส่วนร่วม",
  },
  {
    icon: "🎁",
    head: "กิจกรรมแจกคะแนนพิเศษ",
    body: "ใช้โหมดคะแนนให้ระบบสุ่มรางวัลและกับดักเอง ครูไม่ต้องเตรียมอะไรก่อนเข้าคาบ",
  },
  {
    icon: "🏆",
    head: "แข่งขันเป็นทีม",
    body: "ใช้คู่กับกระดานคะแนนกลุ่มเพื่อบันทึกแต้มที่แต่ละทีมเปิดได้ตลอดกิจกรรม",
  },
  {
    icon: "📺",
    head: "ฉายขึ้นจอโปรเจกเตอร์",
    body: "ตัวเลขและคำถามใหญ่ อ่านได้จากหลังห้อง กดเต็มจอได้ทั้งบนคอมและแท็บเล็ต",
  },
];

const FAQS = [
  {
    q: "กระดานป้ายปริศนานี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ต้องเตรียมคำถามก่อนใช้ไหม",
    a: "ไม่ต้อง ถ้าเลือกโหมดคะแนนระบบจะสุ่มรางวัลและกับดักหลังป้ายให้เอง ส่วนโหมดคำถามค่อยพิมพ์คำถามของตัวเองเมื่อพร้อม",
  },
  {
    q: "คำถามที่พิมพ์ไว้จะหายไหมถ้าปิดหน้าเว็บ",
    a: "ไม่หาย ระบบบันทึกโหมด ธีม และชุดคำถามไว้ในเบราว์เซอร์ของเครื่องให้อัตโนมัติ ส่วนป้ายที่เปิดไปแล้วจะรีเซ็ตใหม่ทุกครั้งที่เริ่มเกม",
  },
  {
    q: "ใช้กี่ป้ายได้บ้าง",
    a: "เลือกได้ 12 20 หรือ 30 ป้าย ถ้าใช้โหมดคำถามและมีคำถามน้อยกว่าที่เลือก ระบบจะลดจำนวนป้ายลงให้เท่าจำนวนคำถามโดยอัตโนมัติ",
  },
  {
    q: "ปิดเสียงและแอนิเมชันได้ไหม",
    a: "ปิดเสียงได้จากปุ่มลำโพงบนแถบด้านบน ส่วนแอนิเมชันจะลดลงอัตโนมัติถ้าตั้งค่าเครื่องให้ลดการเคลื่อนไหว",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "กระดานป้ายปริศนา Khuncool",
      url: URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้กระดานป้ายปริศนา Khuncool",
      description:
        "ขั้นตอนการใช้กระดานป้ายปริศนาในห้องเรียน ตั้งแต่เลือกโหมดจนถึงเปิดป้ายตอบคำถาม",
      inLanguage: "th",
      step: HOWTO_STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const RELATED = [
  { label: "กระดานคะแนนกลุ่ม", href: "/group-scoreboard" },
  { label: "วงล้อสุ่มชื่อนักเรียน", href: "/random-name-picker" },
  { label: "สุ่มคำถามหน้าชั้น", href: "/random-question" },
];

export default function MysteryBoardPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">
            หน้าแรก
          </Link>
          <span>›</span>
          <Link href="/tools" className="text-ink-faint">
            เครื่องมือครู
          </Link>
          <span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">
            กระดานป้ายปริศนา
          </span>
        </div>
      </nav>

      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          กระดานป้ายปริศนา
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ให้นักเรียนเลือกป้าย เปิดเผยคะแนนหรือคำถาม ใช้ฟรี ไม่ต้องติดตั้ง
          </span>
          <span className="hidden md:inline">
            ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถามพร้อมเอฟเฟกต์
            ฉายขึ้นจอหน้าห้องได้ เหมาะกับการทบทวนบทเรียนและกิจกรรมแข่งขันในชั้นเรียน
          </span>
        </p>
      </div>

      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <MysteryBoardApp />
      </div>

      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">วิธีใช้งาน</h2>
        <div className="mt-3 flex flex-col gap-3 md:max-w-[62ch] md:gap-3.5">
          {HOWTO_STEPS.map((s, i) => (
            <div key={s.name} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[#ECEDFE] text-[12.5px] font-bold text-[#4A46D6] md:h-[30px] md:w-[30px] md:rounded-[10px] md:text-[15px]">
                {i + 1}
              </span>
              <div>
                <div className="mb-0.5 text-sm font-bold md:text-base">
                  {s.name}
                </div>
                <p className="m-0 text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          ใช้ทำอะไรได้บ้าง
        </h2>
        <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
          {USE_CASES.map((u) => (
            <div
              key={u.head}
              className="rounded-2xl border border-border bg-surface-card p-3.5 md:p-4"
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="text-lg md:text-[19px]">{u.icon}</span>
                <span className="text-sm font-bold md:text-[15.5px]">
                  {u.head}
                </span>
              </div>
              <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                {u.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          คำถามที่ครูถามบ่อย
        </h2>
        <div className="flex flex-col gap-2 md:max-w-[62ch] md:gap-[9px]">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-border bg-surface-card p-[13px] md:rounded-[15px] md:p-[15px_17px]"
            >
              <div className="mb-1 text-[13.5px] font-semibold leading-snug md:text-[15px]">
                {f.q}
              </div>
              <p className="m-0 text-[13px] leading-relaxed text-ink-secondary md:text-sm md:leading-[1.75]">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-xl">
          เครื่องมือที่ใช้คู่กันได้
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {RELATED.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:border-primary/40"
            >
              {item.label} ›
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 3: ตรวจในเบราว์เซอร์**

- breadcrumb, h1, คำโปรย, ตัวเกม, วิธีใช้งาน, ใช้ทำอะไรได้บ้าง, FAQ, ลิงก์ที่เกี่ยวข้อง ครบทุกส่วน
- View source → มี `<script type="application/ld+json">` และ JSON แตกเป็น object ได้ (วางเช็คที่ https://validator.schema.org ถ้าสะดวก)
- ลิงก์ทั้งสามใน "เครื่องมือที่ใช้คู่กันได้" กดแล้วไปหน้าที่มีอยู่จริง

- [ ] **Step 4: Commit**

```bash
git add app/mystery-board/page.tsx
git commit -m "feat(mystery-board): add landing content and structured data"
```

---

### Task 9: ลงทะเบียนในหน้า /tools

**Files:**
- Modify: `app/tools/data.ts`
- Create: `public/assets/tool-covers/mystery-board.webp`

- [ ] **Step 1: เตรียมรูป cover**

การ์ดบนหน้า `/tools` ใช้ `image` เป็นรูปปก ต้องมีไฟล์
`public/assets/tool-covers/mystery-board.webp` ก่อน (ขนาดและอัตราส่วนเดียวกับ
ไฟล์อื่นในโฟลเดอร์นั้น — ตรวจด้วย `ls -la public/assets/tool-covers/`)

ถ้ายังไม่มีรูป **ให้หยุดและถามเจ้าของโปรเจกต์** ว่าจะให้ทำรูปยังไง อย่าปล่อย
path ที่ชี้ไปไฟล์ที่ไม่มีอยู่จริง เพราะการ์ดจะรูปแตกทั้งหน้า

- [ ] **Step 2: เพิ่ม entry ใน `TOOLS` ของ `app/tools/data.ts`**

แทรกต่อจาก entry ของ `/random-question`:

```ts
  {
    icon: "🎁",
    title: "กระดานป้ายปริศนา",
    href: "/mystery-board",
    bg: "#FFEAD5",
    image: "/assets/tool-covers/mystery-board.webp",
    short: "เลือกป้าย เปิดเผยคะแนนหรือคำถาม",
    desc: "ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถามพร้อมเอฟเฟกต์ ใช้ทบทวนบทเรียนท้ายคาบให้สนุกขึ้น",
  },
```

- [ ] **Step 3: เพิ่ม entry ใน `CASES` ของไฟล์เดียวกัน**

```ts
  {
    q: "อยากให้ช่วงทบทวนท้ายคาบสนุกขึ้น ไม่ให้เด็กเบื่อ",
    a: "กระดานป้ายปริศนา",
    href: "/mystery-board",
  },
```

- [ ] **Step 4: ตรวจ lint และ build**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน

- [ ] **Step 5: ตรวจในเบราว์เซอร์**

- `/tools` → เห็นการ์ด "กระดานป้ายปริศนา" พร้อมรูปปก (ไม่รูปแตก) กดแล้วไป `/mystery-board`
- `/tools` ส่วน "เจอปัญหาแบบนี้ ใช้อันไหนดี" → เห็นเคสใหม่และลิงก์ทำงาน
- `/sitemap.xml` → มี `https://www.khuncool.com/mystery-board`

- [ ] **Step 6: Commit**

```bash
git add app/tools/data.ts public/assets/tool-covers/mystery-board.webp
git commit -m "feat(tools): list mystery board on the tools hub"
```

---

### Task 10: ตรวจงานรอบสุดท้าย

**Files:** ไม่มีการแก้ไฟล์ นอกจากเจอบั๊กระหว่างตรวจ

- [ ] **Step 1: รัน lint และ build จากสถานะสะอาด**

```bash
npm run lint
```

Expected: ไม่มี error

```bash
npm run build
```

Expected: build ผ่าน และเห็น `/mystery-board` ในตาราง route

- [ ] **Step 2: ไล่เช็กลิสต์ข้อ 9 ของสเปกให้ครบ**

ทำทีละข้อบน dev server แล้วบันทึกผลจริง (ผ่าน/ไม่ผ่าน) ไม่ใช่เดา:

1. setup → board → reveal → เปิดครบ → เริ่มใหม่ ครบวงจร
2. โหมดคำถาม: คำถามน้อยกว่าป้าย / มากกว่าป้าย / ไม่มีคำถาม
3. รีเฟรช — โหมด ขนาด ธีม เสียง และชุดคำถามคงอยู่ ป้ายรีเซ็ต
4. เต็มจอบนเดสก์ท็อป (native) และย่อจอเป็นมือถือแล้วกดเต็มจอ (fallback) — แถบบนและกริดต้องยังใช้งานได้ทั้งสองแบบ
5. `prefers-reduced-motion: reduce` — ไม่มีสั่น ไม่มีคอนเฟตตี ไม่มีไฟวิ่ง
6. console ไม่มี error และไม่มี warning เรื่อง state update หลัง unmount
7. ไม่มี scroll แนวนอนที่ความกว้าง 360px

- [ ] **Step 3: แก้บั๊กที่เจอ (ถ้ามี) แล้ว commit**

```bash
git add -A
git commit -m "fix(mystery-board): address issues found in final verification"
```

ถ้าไม่เจอบั๊ก ข้าม step นี้ไปได้ — ห้าม commit เปล่า

---

## สรุปการครอบคลุมสเปก

| หัวข้อในสเปก | Task |
|---|---|
| 2. โครงไฟล์ + ลงทะเบียนเครื่องมือ | 1, 3, 9 |
| 3. โมเดลข้อมูล + localStorage | 1, 2 |
| 4. รางวัลโหมดคะแนน / โหมดคำถาม | 2, 3 |
| 5.1 หน้าตั้งค่า | 1, 3 |
| 5.2 กระดาน + ป้ายที่เปิดแล้ว + เปิดครบ | 3, 5 |
| 5.3 overlay เผยผล | 4 |
| 6. แอนิเมชัน เสียง a11y cleanup | 4, 5, 6, 7 |
| 7. เต็มจอ + trackToolEvent | 1 |
| 8. SEO / เนื้อหาหน้า | 8 |
| 9. การทดสอบ | 10 (และ step ตรวจของทุก task) |
| 10. ความเสี่ยง (busy flag, กริดมือถือ, CSS อ่านง่าย) | 3, 5, 10 |
