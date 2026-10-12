# จับฉลากแลกของขวัญ (/gift-exchange) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เครื่องมือหน้าชั้นเรียนที่ให้นักเรียนออกมาเปิดกล่องของขวัญบนจอทีละคนแบบห่วงโซ่ จนวนกลับมาที่คนแรก พร้อมแอนิเมชันและเสียงจัดเต็ม

**Architecture:** logic ทั้งหมด (สุ่มคนเริ่ม สุ่มคนรับทีละกล่อง ติ๊กขาด/เพิ่มคน โหลด/บันทึก) อยู่ใน `chainModel.ts` ที่เป็น pure function ทดสอบด้วย Vitest ส่วน UI แยกเป็น component ต่อจอ โดย `GiftExchangeApp.tsx` ถือ `GameState` ก้อนเดียวและบันทึกลง localStorage ทุกครั้งที่เปลี่ยน แอนิเมชันเป็น CSS keyframes บน SVG แยกชิ้น เสียงเป็น WebAudio ล้วน

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Vitest 4, sharp (ทำภาพปก)

**Spec:** `docs/superpowers/specs/2026-10-13-gift-exchange-design.md`

## Global Constraints

- Route: `/gift-exchange`; ชื่อบนหน้า: "จับฉลากแลกของขวัญ"
- localStorage key: `khuncool.giftexchange` (ขึ้นต้น `khuncool.` เพื่อให้ `getKhuncoolLocalStorageKeys()` ใน `lib/khuncoolLocalKeys.ts` เก็บกวาดตอน sign out ได้เอง — ไม่ต้องแก้ไฟล์นั้น)
- `trackToolEvent` tool name: `"gift-exchange"`
- ต้องมีคน active อย่างน้อย 3 คนจึงเริ่มได้
- ไม่มีไฟล์เสียง ไม่เพิ่ม dependency ใหม่ ไม่ใช้เพลงที่มีลิขสิทธิ์ (ทำนองแต่งเองในโค้ด)
- ข้อความทั้งหมดบนหน้าจอเป็นภาษาไทย
- `prefers-reduced-motion: reduce` → ไม่มีการสั่น แฟลช อนุภาค ลำดับเปิดกล่อง ~1.5s
- แฟลชขาวครั้งเดียว ≤ 160ms ไม่กะพริบซ้ำ
- ไม่ refactor `app/duck-race` หรือ `app/mystery-board`
- Font: หัวข้อ/UI `var(--font-anuphan)`, เนื้อหา `var(--font-sarabun)` (ตั้งไว้แล้วใน `app/globals.css`)
- ESLint ของโปรเจกต์เปิดกฎ React Compiler (`react-hooks/set-state-in-effect`, `react-hooks/refs`): ห้ามเรียก setState ตรงๆ ใน body ของ `useEffect` (ให้เรียกใน callback ของ `setTimeout` แบบที่ `MysteryBoardApp.tsx` ทำ) และห้ามเขียน `ref.current` ระหว่าง render

## Review Focus

1. **รีเฟรชกลางฉากเปิดกล่อง** — ครูหรือเด็กเผลอกด F5 ตอนกล่องกำลังสั่น: กลับมาต้องเห็นชื่อเดิม ไม่สุ่มใหม่ (Task 1 ทดสอบ `openBox` → `serializeState` → `loadState` → `currentTurn` ได้คู่เดิม)
2. **กดกล่องรัวๆ** — เด็กกดกล่องหลายครั้งระหว่างแอนิเมชัน: ต้องเผยแค่คนเดียว (Task 1 ทดสอบ `openBox` ซ้ำตอน `boxOpen` เป็น no-op; Task 5 ปิดปุ่มเมื่อ `anim !== "idle"`)
3. **ชื่อซ้ำในห้อง** — มี "ต้น" สองคน: ต้องเป็นผู้เล่นสองคนแยกกัน แสดง "ต้น (2)" และการแก้ textarea ต้องไม่ทำให้สถานะ "ขาด" ของคนเดิมหลุด (Task 1 ทดสอบ `syncPlayers` และ `playerLabels`)
4. **ติ๊กขาดจนคนเริ่มเหลือคนเดียว** — ต้องกันไม่ให้คนเริ่มได้ชื่อตัวเอง (Task 1 ทดสอบ `canToggle`/`setActive`)
5. **localStorage เสีย / ใช้ไม่ได้** — JSON เสีย, เวอร์ชันเก่า, chain อ้าง id ที่ไม่มี, หรือ `setItem` โยน error ในโหมดส่วนตัว: ต้องไม่พัง เริ่มจอตั้งค่าว่าง (Task 1 ทดสอบ `loadState` และ `writeSaved` กับ storage ที่โยน error)

## ปรับจาก spec

- เพิ่ม `boxOpen: boolean` ใน `GameState` — spec ต้องการให้ "รีเฟรชแล้วจอ 3 แสดงผลล่าสุดในสถานะเปิดแล้ว" ซึ่งต้องรู้ว่ากล่องของตาปัจจุบันเปิดไปแล้วหรือยัง `chain` อย่างเดียวบอกไม่ได้
- ชื่อฟังก์ชันใน spec (`load`/`serialize`/`reset`) ใช้ชื่อเต็ม `loadState`/`serializeState`/`resetGame` เพื่อไม่ชนกับชื่อทั่วไปตอน import
- แยก `RosterPanel.tsx`, `ChainStrip.tsx` และ `fx.ts` (คอนเฟตตี/ดอกไม้ไฟ) ออกจาก `GiftStage.tsx` ให้ไฟล์เล็ก

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `app/gift-exchange/chainModel.ts` | pure logic + อ่าน/เขียน storage |
| `app/gift-exchange/chainModel.test.ts` | Vitest |
| `app/gift-exchange/useGiftSound.ts` | เพลงวน + เอฟเฟกต์ WebAudio |
| `app/gift-exchange/fx.ts` | คอนเฟตตีปืนใหญ่สองฝั่ง + ดอกไม้ไฟ (DOM + Web Animations) |
| `app/gift-exchange/GiftBox.tsx` | SVG กล่องแยกชิ้น + ชุดสี |
| `app/gift-exchange/SetupPanel.tsx` | จอ 1 |
| `app/gift-exchange/StarterSpin.tsx` | จอ 2 |
| `app/gift-exchange/GiftStage.tsx` | จอ 3 (ฉากเปิดกล่อง) |
| `app/gift-exchange/ChainStrip.tsx` | แถบโซ่ด้านล่างจอ 3 |
| `app/gift-exchange/RosterPanel.tsx` | แผงจัดการรายชื่อกลางเกม |
| `app/gift-exchange/FinaleChain.tsx` | จอ 4 วงโซ่ทั้งห้อง |
| `app/gift-exchange/GiftExchangeApp.tsx` | `"use client"` ถือ state, routing จอ, persistence, เสียง, เต็มจอ |
| `app/gift-exchange/GiftExchange.module.css` | สไตล์และ keyframes ทั้งหมด (สร้างใน Task 3 แล้วต่อท้ายในแต่ละ task) |
| `app/gift-exchange/page.tsx` | server component: metadata, JSON-LD, เนื้อหา SEO |
| `vitest.config.ts` | เพิ่ม include ให้รันเทสต์ใน `app/gift-exchange` |
| `app/tools/data.ts` | ลงทะเบียน TOOLS + CASES |
| `scripts/make-gift-exchange-cover.mjs` | สร้างภาพปก SVG → webp |
| `public/assets/tool-covers/gift-exchange.webp` | ภาพปก 960×540 |

---

### Task 1: chainModel — logic ห่วงโซ่ + การบันทึก

**Files:**
- Create: `app/gift-exchange/chainModel.ts`
- Create: `app/gift-exchange/chainModel.test.ts`
- Modify: `vitest.config.ts` (บรรทัด `include`)

**Interfaces:**
- Consumes: —
- Produces (ทุก task ถัดไปใช้):
  ```ts
  type Player = { id: string; name: string; active: boolean };
  type Phase = "setup" | "starter" | "stage" | "finale";
  type GameState = { version: 1; players: Player[]; chain: string[]; phase: Phase; boxOpen: boolean; soundOn: boolean };
  type Rng = () => number;
  type OpenResult = { state: GameState; receiverId: string | null; closesLoop: boolean };
  type Turn = { giverId: string; receiverId: string | null };
  const STORAGE_KEY: "khuncool.giftexchange"; const MIN_PLAYERS: 3; const EMPTY_STATE: GameState;
  parseNames(text: string): string[]
  syncPlayers(prev: Player[], names: string[]): Player[]
  setNames(state: GameState, names: string[]): GameState
  playerLabels(players: Player[]): Record<string, string>
  activePlayers(state): Player[]; pool(state): Player[]; canStart(state): boolean
  pickStarter(state, rng): GameState; beginStage(state): GameState
  openBox(state, rng): OpenResult; nextTurn(state): GameState
  currentTurn(state): Turn | null
  canToggle(state, id): boolean; setActive(state, id, active): GameState
  addPlayer(state, name): GameState; resetGame(state): GameState
  boxesOpened(state): number; totalBoxes(state): number
  loadState(raw: string | null): GameState | null; serializeState(state): string
  browserStorage(): Storage | undefined
  readSaved(storage?: Pick<Storage, "getItem">): GameState | null
  writeSaved(storage: Pick<Storage, "setItem"> | undefined, state: GameState): void
  ```

- [ ] **Step 1: ให้ Vitest เห็นเทสต์ในโฟลเดอร์นี้**

`vitest.config.ts` ตอนนี้ include แค่ `lib/**/*.test.ts` แก้เป็น:

```ts
    include: ["lib/**/*.test.ts", "app/gift-exchange/**/*.test.ts"],
```

(ระบุโฟลเดอร์ตรงๆ ไม่ใช้ `app/**` เพราะคอมเมนต์ในไฟล์บอกว่ามี `*.test.mjs` ใต้ `app/media/**` ที่รันด้วย `node:test`)

- [ ] **Step 2: เขียนเทสต์ที่ fail**

สร้าง `app/gift-exchange/chainModel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  EMPTY_STATE,
  STORAGE_KEY,
  activePlayers,
  addPlayer,
  beginStage,
  boxesOpened,
  canStart,
  canToggle,
  currentTurn,
  loadState,
  nextTurn,
  openBox,
  parseNames,
  pickStarter,
  playerLabels,
  pool,
  readSaved,
  resetGame,
  serializeState,
  setActive,
  setNames,
  syncPlayers,
  totalBoxes,
  writeSaved,
  type GameState,
  type Rng,
} from "./chainModel";

const first: Rng = () => 0;

function withNames(...names: string[]): GameState {
  return setNames(EMPTY_STATE, names);
}

function idOf(state: GameState, name: string): string {
  const p = state.players.find((x) => x.name === name);
  if (!p) throw new Error(`no player ${name}`);
  return p.id;
}

function nameOf(state: GameState, id: string): string {
  return state.players.find((x) => x.id === id)!.name;
}

/** เล่นตั้งแต่สุ่มคนเริ่มจนปิดวง คืน state สุดท้ายและคู่ทั้งหมด */
function playToEnd(start: GameState, rng: Rng) {
  let state = beginStage(pickStarter(start, rng));
  const pairs: [string, string][] = [];
  for (let guard = 0; guard < 500; guard++) {
    const giver = currentTurn(state)!.giverId;
    const r = openBox(state, rng);
    expect(r.receiverId).not.toBeNull();
    pairs.push([giver, r.receiverId!]);
    state = r.state;
    if (r.closesLoop) return { state, pairs };
    state = nextTurn(state);
  }
  throw new Error("game never closed");
}

describe("parseNames", () => {
  it("ตัดช่องว่างหัวท้ายและข้ามบรรทัดว่าง รองรับ CRLF", () => {
    expect(parseNames("  ต้น \r\n\r\nฝน\n  \nบี")).toEqual(["ต้น", "ฝน", "บี"]);
  });
});

describe("syncPlayers / playerLabels — ชื่อซ้ำ", () => {
  it("ชื่อซ้ำเป็นผู้เล่นแยกกัน และติดเลขต่อท้ายตั้งแต่คนที่สอง", () => {
    const s = withNames("ต้น", "ฝน", "ต้น");
    expect(s.players).toHaveLength(3);
    expect(new Set(s.players.map((p) => p.id)).size).toBe(3);
    const labels = playerLabels(s.players);
    expect(s.players.map((p) => labels[p.id])).toEqual(["ต้น", "ฝน", "ต้น (2)"]);
  });

  it("แก้รายชื่อแล้วคนเดิมยังคง id และสถานะขาด", () => {
    let s = withNames("ต้น", "ฝน", "ต้น");
    const secondTon = s.players[2].id;
    s = setActive(s, secondTon, false);
    const next = syncPlayers(s.players, ["บี", "ต้น", "ฝน", "ต้น"]);
    const kept = next.find((p) => p.id === secondTon);
    expect(kept?.active).toBe(false);
    expect(next.filter((p) => p.name === "ต้น")).toHaveLength(2);
    expect(next.find((p) => p.name === "บี")?.active).toBe(true);
  });

  it("setNames ไม่มีผลเมื่อเกมเริ่มแล้ว", () => {
    const started = pickStarter(withNames("ก", "ข", "ค"), first);
    expect(setNames(started, ["x"])).toBe(started);
  });
});

describe("canStart", () => {
  it("ต้องมีคน active อย่างน้อย 3 คน", () => {
    expect(canStart(withNames("ก", "ข"))).toBe(false);
    expect(canStart(withNames("ก", "ข", "ค"))).toBe(true);
    const s = withNames("ก", "ข", "ค");
    expect(canStart(setActive(s, idOf(s, "ค"), false))).toBe(false);
  });

  it("pickStarter ไม่ทำอะไรถ้ายังเริ่มไม่ได้", () => {
    const s = withNames("ก", "ข");
    expect(pickStarter(s, first)).toBe(s);
  });
});

describe("เล่นจนจบ", () => {
  it("ทุกคนได้รับของครั้งเดียว และกล่องสุดท้ายวนกลับคนแรก", () => {
    const s = withNames("ก", "ข", "ค", "ง", "จ");
    const { state, pairs } = playToEnd(s, first);
    expect(state.phase).toBe("finale");
    expect(state.chain.map((id) => nameOf(state, id))).toEqual(["ก", "ข", "ค", "ง", "จ"]);
    const receivers = pairs.map(([, r]) => r).sort();
    expect(receivers).toEqual([...state.chain].sort());
    expect(pairs.at(-1)![1]).toBe(state.chain[0]);
    expect(currentTurn(state)).toEqual({ giverId: state.chain.at(-1), receiverId: state.chain[0] });
  });

  it("สุ่มจริง 2000 รอบ: ไม่มีใครได้ตัวเอง และเป็นวงเดียวครอบทุกคน", () => {
    for (let round = 0; round < 2000; round++) {
      const n = 3 + Math.floor(Math.random() * 38);
      const s = withNames(...Array.from({ length: n }, (_, i) => `คน${i}`));
      const { state, pairs } = playToEnd(s, Math.random);
      expect(pairs).toHaveLength(n);
      for (const [g, r] of pairs) expect(g).not.toBe(r);
      expect(new Set(state.chain).size).toBe(n);
      const givers = new Set(pairs.map(([g]) => g));
      expect(givers.size).toBe(n);
    }
  });

  it("boxesOpened / totalBoxes นับกล่องที่เปิดแล้ว", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    expect(boxesOpened(s)).toBe(0);
    expect(totalBoxes(s)).toBe(3);
    s = nextTurn(openBox(s, first).state);
    expect(boxesOpened(s)).toBe(1);
    s = nextTurn(openBox(s, first).state);
    expect(boxesOpened(s)).toBe(2);
    s = openBox(s, first).state;
    expect(s.phase).toBe("finale");
    expect(boxesOpened(s)).toBe(3);
  });
});

describe("openBox — กันกดซ้ำ", () => {
  it("เปิดซ้ำตอนกล่องเปิดอยู่แล้วไม่มีผล", () => {
    const s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ง"), first));
    const once = openBox(s, first);
    const twice = openBox(once.state, first);
    expect(twice.receiverId).toBeNull();
    expect(twice.state).toBe(once.state);
    expect(once.state.chain).toHaveLength(2);
  });

  it("เปิดไม่ได้ก่อนเข้าเวที", () => {
    const s = pickStarter(withNames("ก", "ข", "ค"), first);
    expect(openBox(s, first).receiverId).toBeNull();
  });
});

describe("currentTurn", () => {
  it("ก่อนเปิด: ผู้ให้คือคนท้ายโซ่ ยังไม่มีผู้รับ / หลังเปิด: ผู้ให้คือคนก่อนท้าย", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    expect(currentTurn(s)).toEqual({ giverId: s.chain[0], receiverId: null });
    s = openBox(s, first).state;
    expect(currentTurn(s)).toEqual({ giverId: s.chain[0], receiverId: s.chain[1] });
    s = nextTurn(s);
    expect(currentTurn(s)).toEqual({ giverId: s.chain[1], receiverId: null });
  });

  it("ยังไม่มีโซ่ คืน null", () => {
    expect(currentTurn(withNames("ก", "ข", "ค"))).toBeNull();
  });
});

describe("แก้รายชื่อกลางเกม", () => {
  it("ติ๊กขาดคนที่ยังไม่ถูกจับ แล้วคนนั้นไม่ถูกเผย", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ง"), first));
    s = setActive(s, idOf(s, "ข"), false);
    const { state } = playToEndFromStage(s);
    expect(state.chain.map((id) => nameOf(state, id))).not.toContain("ข");
  });

  it("ติ๊กคนที่อยู่ในโซ่แล้วไม่ได้", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    s = nextTurn(openBox(s, first).state);
    const inChain = s.chain[1];
    expect(canToggle(s, inChain)).toBe(false);
    expect(setActive(s, inChain, false)).toBe(s);
  });

  it("กันติ๊กคนสุดท้ายใน pool ออก เมื่อเพิ่งมีแค่คนเริ่ม", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    s = setActive(s, idOf(s, "ข"), false);
    const last = pool(s)[0].id;
    expect(canToggle(s, last)).toBe(false);
    expect(setActive(s, last, false)).toBe(s);
    // ติ๊กกลับเข้ามาได้เสมอ
    expect(canToggle(s, idOf(s, "ข"))).toBe(true);
  });

  it("ติ๊กขาดจน pool ว่างตอนโซ่ยาว ≥ 2 แค่ทำให้ปิดวงเร็วขึ้น", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ง"), first));
    s = nextTurn(openBox(s, first).state); // ก → ข
    s = setActive(s, idOf(s, "ค"), false);
    s = setActive(s, idOf(s, "ง"), false);
    const r = openBox(s, first);
    expect(r.closesLoop).toBe(true);
    expect(r.receiverId).toBe(s.chain[0]);
  });

  it("เพิ่มคนมาสายกลางเกม แล้วคนนั้นถูกเผยก่อนปิดวง", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    s = addPlayer(s, "  มาสาย ");
    expect(s.players.at(-1)?.name).toBe("มาสาย");
    const { state } = playToEndFromStage(s);
    expect(state.chain.map((id) => nameOf(state, id))).toContain("มาสาย");
  });

  it("เพิ่มชื่อว่าง หรือเพิ่มตอนจบเกมแล้ว ไม่มีผล", () => {
    const s = withNames("ก", "ข", "ค");
    expect(addPlayer(s, "   ")).toBe(s);
    const { state } = playToEnd(s, first);
    expect(addPlayer(state, "x")).toBe(state);
  });
});

describe("resetGame", () => {
  it("ล้างโซ่ กลับจอตั้งค่า คงรายชื่อและสถานะขาด", () => {
    let s = withNames("ก", "ข", "ค", "ง");
    s = setActive(s, idOf(s, "ง"), false);
    const { state } = playToEnd(s, first);
    const r = resetGame(state);
    expect(r.phase).toBe("setup");
    expect(r.chain).toEqual([]);
    expect(r.boxOpen).toBe(false);
    expect(r.players).toEqual(state.players);
    expect(activePlayers(r)).toHaveLength(3);
  });
});

describe("loadState / serializeState", () => {
  it("round-trip ได้ state เท่าเดิม และผลที่เผยแล้วไม่เปลี่ยน (รีเฟรชกลางฉาก)", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ต้น", "ต้น"), Math.random));
    const opened = openBox(s, Math.random);
    s = opened.state;
    const back = loadState(serializeState(s));
    expect(back).toEqual(s);
    expect(currentTurn(back!)).toEqual(currentTurn(s));
    expect(currentTurn(back!)!.receiverId).toBe(opened.receiverId);
  });

  it.each([
    ["null", null],
    ["JSON เสีย", "{oops"],
    ["ไม่ใช่ object", "42"],
    ["version ผิด", JSON.stringify({ ...EMPTY_STATE, version: 2 })],
    ["phase ผิด", JSON.stringify({ ...EMPTY_STATE, phase: "lobby" })],
    ["players ไม่ใช่ array", JSON.stringify({ ...EMPTY_STATE, players: "x" })],
    ["player ขาด field", JSON.stringify({ ...EMPTY_STATE, players: [{ id: "a", name: "ก" }] })],
    ["id ซ้ำ", JSON.stringify({ ...EMPTY_STATE, players: [{ id: "a", name: "ก", active: true }, { id: "a", name: "ข", active: true }] })],
    ["chain อ้าง id ที่ไม่มี", JSON.stringify({ ...EMPTY_STATE, phase: "stage", players: [{ id: "a", name: "ก", active: true }], chain: ["zzz"] })],
    ["setup แต่มี chain", JSON.stringify({ ...EMPTY_STATE, players: [{ id: "a", name: "ก", active: true }], chain: ["a"] })],
    ["stage แต่ chain ว่าง", JSON.stringify({ ...EMPTY_STATE, phase: "stage" })],
    ["boxOpen หาย", JSON.stringify({ version: 1, players: [], chain: [], phase: "setup", soundOn: true })],
  ])("คืน null เมื่อ %s", (_label, raw) => {
    expect(loadState(raw as string | null)).toBeNull();
  });
});

describe("readSaved / writeSaved", () => {
  it("อ่านเขียนผ่าน storage ด้วยคีย์ที่กำหนด", () => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
    };
    const s = withNames("ก", "ข", "ค");
    writeSaved(storage, s);
    expect(mem.has(STORAGE_KEY)).toBe(true);
    expect(readSaved(storage)).toEqual(s);
  });

  it("storage โยน error (โหมดส่วนตัว/เต็ม) แล้วไม่พัง", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(() => writeSaved(broken, EMPTY_STATE)).not.toThrow();
    expect(readSaved(broken)).toBeNull();
    expect(readSaved(undefined)).toBeNull();
  });
});

/** เล่นต่อจาก state ที่อยู่บนเวทีแล้ว จนปิดวง */
function playToEndFromStage(start: GameState) {
  let state = start;
  for (let guard = 0; guard < 500; guard++) {
    const r = openBox(state, first);
    state = r.state;
    if (r.closesLoop) return { state };
    state = nextTurn(state);
  }
  throw new Error("game never closed");
}
```

- [ ] **Step 3: รันเทสต์ให้เห็นว่า fail**

Run: `npx vitest run app/gift-exchange`
Expected: FAIL — `Failed to resolve import "./chainModel"`

- [ ] **Step 4: เขียน `chainModel.ts`**

```ts
// logic ของจับฉลากแลกของขวัญแบบห่วงโซ่ — pure ทั้งหมด ยกเว้นตัวอ่าน/เขียน
// storage ท้ายไฟล์ที่ห่อ try/catch ไว้
//
// ทำไมสุ่มทีละกล่องแทนการจับคู่ล่วงหน้า: ต่อท้ายโซ่ด้วยคนที่สุ่มแบบสม่ำเสมอ
// จาก pool ทีละครั้ง ได้ผลเป็นวงเดียว (single cycle) ที่สุ่มเท่ากันทุกแบบ
// ไม่มีใครได้ตัวเองและไม่มีวงย่อย (derangement ธรรมดาเกิดวงย่อยได้ ซึ่งทำให้
// โซ่ขาดกลางทาง) และยังเปิดให้ติ๊กขาด/เพิ่มคนระหว่างเกมได้

export type Player = { id: string; name: string; active: boolean };

export type Phase = "setup" | "starter" | "stage" | "finale";

export type GameState = {
  version: 1;
  players: Player[];
  /** id ตามลำดับที่ถูกเผย; chain[0] = คนเริ่ม */
  chain: string[];
  phase: Phase;
  /** กล่องของตาปัจจุบันเปิดแล้ว (เผยชื่อแล้ว) แต่ยังไม่กด "ต่อไป" */
  boxOpen: boolean;
  soundOn: boolean;
};

export type Rng = () => number;

export type OpenResult = {
  state: GameState;
  receiverId: string | null;
  closesLoop: boolean;
};

export type Turn = { giverId: string; receiverId: string | null };

export const STORAGE_KEY = "khuncool.giftexchange";
export const MIN_PLAYERS = 3;

export const EMPTY_STATE: GameState = {
  version: 1,
  players: [],
  chain: [],
  phase: "setup",
  boxOpen: false,
  soundOn: true,
};

const PHASES: readonly Phase[] = ["setup", "starter", "stage", "finale"];

let idSeq = 0;
function makeId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  idSeq += 1;
  return `p${Date.now().toString(36)}${idSeq}`;
}

function pickFrom<T>(items: T[], rng: Rng): T {
  const i = Math.min(items.length - 1, Math.floor(rng() * items.length));
  return items[i];
}

export function parseNames(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((n) => n.trim())
    .filter(Boolean);
}

/**
 * สร้างรายชื่อผู้เล่นจากรายชื่อใหม่ โดยจับคู่กับผู้เล่นเดิมที่ชื่อตรงกันตาม
 * ลำดับ (ต้นคนแรกจับกับต้นคนแรก) เพื่อคง id และสถานะ "ขาด" ไว้ตอนครูแก้ textarea
 */
export function syncPlayers(prev: Player[], names: string[]): Player[] {
  const unused = [...prev];
  return names.map((name) => {
    const i = unused.findIndex((p) => p.name === name);
    if (i >= 0) return unused.splice(i, 1)[0];
    return { id: makeId(), name, active: true };
  });
}

export function setNames(state: GameState, names: string[]): GameState {
  if (state.phase !== "setup") return state;
  return { ...state, players: syncPlayers(state.players, names) };
}

/** ป้ายชื่อที่แสดงบนจอ — ชื่อซ้ำติดเลขต่อท้ายตั้งแต่คนที่สอง เช่น "ต้น (2)" */
export function playerLabels(players: Player[]): Record<string, string> {
  const seen = new Map<string, number>();
  const labels: Record<string, string> = {};
  for (const p of players) {
    const n = (seen.get(p.name) ?? 0) + 1;
    seen.set(p.name, n);
    labels[p.id] = n === 1 ? p.name : `${p.name} (${n})`;
  }
  return labels;
}

export function activePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.active);
}

/** คนที่ยังรอรับของ: มาเรียน และยังไม่อยู่ในโซ่ */
export function pool(state: GameState): Player[] {
  const inChain = new Set(state.chain);
  return state.players.filter((p) => p.active && !inChain.has(p.id));
}

export function canStart(state: GameState): boolean {
  return activePlayers(state).length >= MIN_PLAYERS;
}

export function pickStarter(state: GameState, rng: Rng): GameState {
  if (state.phase !== "setup" || !canStart(state)) return state;
  const starter = pickFrom(activePlayers(state), rng);
  return { ...state, chain: [starter.id], phase: "starter", boxOpen: false };
}

export function beginStage(state: GameState): GameState {
  if (state.phase !== "starter") return state;
  return { ...state, phase: "stage" };
}

/**
 * เปิดกล่องของตาปัจจุบัน ผลถูกสุ่มและใส่ลง state ทันที (ผู้เรียกบันทึกลง
 * storage ก่อนเล่นแอนิเมชัน) จึงรีเฟรชกลางฉากแล้วไม่สุ่มใหม่
 */
export function openBox(state: GameState, rng: Rng): OpenResult {
  const noop: OpenResult = { state, receiverId: null, closesLoop: false };
  if (state.phase !== "stage" || state.boxOpen || state.chain.length === 0) return noop;
  const candidates = pool(state);
  if (candidates.length === 0) {
    // โซ่ยาว 1 แล้ว pool ว่าง = คนเริ่มจะได้ตัวเอง; canToggle กันไว้แล้ว แต่กันซ้ำอีกชั้น
    if (state.chain.length < 2) return noop;
    return {
      state: { ...state, phase: "finale", boxOpen: true },
      receiverId: state.chain[0],
      closesLoop: true,
    };
  }
  const receiver = pickFrom(candidates, rng);
  return {
    state: { ...state, chain: [...state.chain, receiver.id], boxOpen: true },
    receiverId: receiver.id,
    closesLoop: false,
  };
}

export function nextTurn(state: GameState): GameState {
  if (state.phase !== "stage" || !state.boxOpen) return state;
  return { ...state, boxOpen: false };
}

export function currentTurn(state: GameState): Turn | null {
  const { chain, phase, boxOpen } = state;
  if (chain.length === 0) return null;
  if (phase === "finale") return { giverId: chain[chain.length - 1], receiverId: chain[0] };
  if (phase === "stage" && boxOpen) {
    return { giverId: chain[chain.length - 2], receiverId: chain[chain.length - 1] };
  }
  return { giverId: chain[chain.length - 1], receiverId: null };
}

export function canToggle(state: GameState, id: string): boolean {
  if (state.phase === "finale") return false;
  if (state.chain.includes(id)) return false;
  const player = state.players.find((p) => p.id === id);
  if (!player) return false;
  if (player.active && state.chain.length === 1) {
    const rest = pool(state).filter((p) => p.id !== id);
    if (rest.length === 0) return false;
  }
  return true;
}

export function setActive(state: GameState, id: string, active: boolean): GameState {
  const player = state.players.find((p) => p.id === id);
  if (!player || player.active === active || !canToggle(state, id)) return state;
  return {
    ...state,
    players: state.players.map((p) => (p.id === id ? { ...p, active } : p)),
  };
}

export function addPlayer(state: GameState, name: string): GameState {
  const trimmed = name.trim();
  if (!trimmed || state.phase === "finale") return state;
  return {
    ...state,
    players: [...state.players, { id: makeId(), name: trimmed, active: true }],
  };
}

export function resetGame(state: GameState): GameState {
  return { ...state, chain: [], phase: "setup", boxOpen: false };
}

export function boxesOpened(state: GameState): number {
  if (state.chain.length === 0) return 0;
  return state.chain.length - 1 + (state.phase === "finale" ? 1 : 0);
}

export function totalBoxes(state: GameState): number {
  return activePlayers(state).length;
}

export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

/** คืน null ถ้าข้อมูลเสีย/เวอร์ชันไม่ตรง/โครงสร้างไม่สอดคล้อง — ผู้เรียกเริ่มใหม่ */
export function loadState(raw: string | null): GameState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.version !== 1) return null;
  if (!Array.isArray(d.players) || !Array.isArray(d.chain)) return null;
  if (!PHASES.includes(d.phase as Phase)) return null;
  if (typeof d.boxOpen !== "boolean" || typeof d.soundOn !== "boolean") return null;

  const players: Player[] = [];
  const ids = new Set<string>();
  for (const item of d.players) {
    if (!item || typeof item !== "object") return null;
    const { id, name, active } = item as Record<string, unknown>;
    if (typeof id !== "string" || typeof name !== "string" || typeof active !== "boolean") {
      return null;
    }
    if (ids.has(id)) return null;
    ids.add(id);
    players.push({ id, name, active });
  }

  const chain: string[] = [];
  const seen = new Set<string>();
  for (const id of d.chain) {
    if (typeof id !== "string" || !ids.has(id) || seen.has(id)) return null;
    seen.add(id);
    chain.push(id);
  }

  const phase = d.phase as Phase;
  if ((phase === "setup") !== (chain.length === 0)) return null;

  return { version: 1, players, chain, phase, boxOpen: d.boxOpen, soundOn: d.soundOn };
}

export function browserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function readSaved(storage?: Pick<Storage, "getItem">): GameState | null {
  try {
    return loadState(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return null;
  }
}

export function writeSaved(
  storage: Pick<Storage, "setItem"> | undefined,
  state: GameState,
): void {
  try {
    storage?.setItem(STORAGE_KEY, serializeState(state));
  } catch {
    // โหมดส่วนตัว/พื้นที่เต็ม — เล่นต่อได้ แค่รีเฟรชแล้วไม่จำ
  }
}
```

- [ ] **Step 5: รันเทสต์ให้ผ่าน**

Run: `npx vitest run app/gift-exchange`
Expected: PASS ทั้งหมด

Run: `npm test`
Expected: PASS (เทสต์เดิมใน `lib/` ยังผ่าน)

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts app/gift-exchange/chainModel.ts app/gift-exchange/chainModel.test.ts
git commit -m "feat(gift-exchange): add the gift chain model"
```

---

### Task 2: เสียงและเอฟเฟกต์อนุภาค

**Files:**
- Create: `app/gift-exchange/useGiftSound.ts`
- Create: `app/gift-exchange/fx.ts`

**Interfaces:**
- Consumes: —
- Produces:
  ```ts
  type GiftSound = "tick" | "fanfare" | "drumroll" | "pop" | "celebrate" | "finale";
  useGiftSound(enabled: boolean): {
    play(kind: GiftSound, durationMs?: number): void; // drumroll ใช้ durationMs
    startMusic(): void; stopMusic(): void;
  }
  reducedMotion(): boolean
  sideCannons(host: HTMLElement | null, pieces?: number): void
  fireworks(host: HTMLElement | null, bursts?: number): void
  clearFx(host: HTMLElement | null): void
  ```

ไม่มี unit test สำหรับ task นี้ (WebAudio/DOM animation ทดสอบใน node ไม่ได้) — ตรวจด้วย typecheck/lint ตอนนี้ และฟังจริงใน Task 7

- [ ] **Step 1: เขียน `useGiftSound.ts`**

โครงเดียวกับ `app/mystery-board/useBoardSound.ts`: สร้าง `AudioContext` ตอนเรียกครั้งแรก (หลัง user gesture), เพลงสร้างเป็น `AudioBuffer` ครั้งเดียวแล้ววนลูป, ปิด context ตอน unmount

```ts
"use client";

import { useCallback, useEffect, useRef } from "react";

export type GiftSound = "tick" | "fanfare" | "drumroll" | "pop" | "celebrate" | "finale";

const MUSIC_LOOP_SECONDS = 8;
const MUSIC_VOLUME = 0.2;
const EIGHTH = 0.25; // 120 BPM

// ทำนองแต่งเองสำหรับเครื่องมือนี้ (ไม่ใช่เพลงที่มีลิขสิทธิ์) — [เริ่ม(ตัวเขบ็ต), ยาว, ความถี่]
const MELODY: [number, number, number][] = [
  [0, 2, 659.25], [2, 1, 783.99], [3, 1, 880], [4, 2, 783.99], [6, 2, 659.25],
  [8, 2, 493.88], [10, 1, 659.25], [11, 1, 783.99], [12, 3, 987.77], [15, 1, 880],
  [16, 2, 880], [18, 1, 1046.5], [19, 1, 880], [20, 2, 698.46], [22, 2, 880],
  [24, 1, 783.99], [25, 1, 698.46], [26, 1, 587.33], [27, 1, 493.88], [28, 2, 587.33], [30, 2, 783.99],
];

// C · Em · F · G คอร์ดละ 1 ห้อง
const CHORDS = [
  { bass: 130.81, pad: [261.63, 329.63, 392] },
  { bass: 82.41, pad: [329.63, 392, 493.88] },
  { bass: 87.31, pad: [349.23, 440, 523.25] },
  { bass: 98, pad: [392, 493.88, 587.33] },
];

/** เพลงเทศกาลวนลูป: ระฆังเล่นทำนอง + กระดิ่งเลื่อน + เบส + pad */
function createMusic(ctx: AudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const frames = Math.floor(rate * MUSIC_LOOP_SECONDS);
  const buffer = ctx.createBuffer(2, frames, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const add = (start: number, dur: number, pan: number, sample: (t: number) => number) => {
    const first = Math.floor(start * rate);
    const count = Math.min(Math.floor(dur * rate), frames - first);
    const l = Math.sqrt((1 - pan) / 2);
    const r = Math.sqrt((1 + pan) / 2);
    for (let i = 0; i < count; i++) {
      const v = sample(i / rate);
      left[first + i] += v * l;
      right[first + i] += v * r;
    }
  };

  // ระฆัง (glockenspiel): sine + partial ไม่ลงตัว 2.76 เท่า ที่หายเร็วกว่า
  const bell = (start: number, dur: number, f: number, vol: number, pan: number) =>
    add(start, dur + 0.4, pan, (t) => {
      const attack = Math.min(1, t / 0.004);
      const a = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3.2);
      const b = Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 9) * 0.35;
      return (a + b) * attack * vol;
    });

  MELODY.forEach(([at, len, f], i) => bell(at * EIGHTH, len * EIGHTH, f, 0.11, i % 2 ? 0.25 : -0.25));

  CHORDS.forEach((chord, bar) => {
    const barStart = bar * 2;
    chord.pad.forEach((f, i) =>
      add(barStart, 1.95, (i - 1) * 0.5, (t) => {
        const env = Math.min(1, t / 0.12) * Math.min(1, (1.95 - t) / 0.25);
        return (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 0.5 * t) * 0.2) * env * 0.022;
      }),
    );
    for (let beat = 0; beat < 4; beat++) {
      add(barStart + beat * 0.5, 0.4, -0.05, (t) => {
        const env = Math.min(1, t / 0.01) * Math.exp(-t * 6);
        return Math.sin(2 * Math.PI * chord.bass * t) * env * 0.12;
      });
    }
  });

  // กระดิ่งเลื่อน: noise ย่านสูงสั้นๆ ทุกเขบ็ต จังหวะยกดังกว่า
  for (let step = 0; step < 32; step++) {
    const vol = step % 2 ? 0.05 : 0.025;
    add(step * EIGHTH, 0.08, step % 4 < 2 ? 0.4 : -0.4, (t) => {
      const n = Math.random() * 2 - 1;
      const ring = Math.sin(2 * Math.PI * 7200 * t) * 0.5;
      return (n * 0.6 + ring) * Math.exp(-t * 55) * vol;
    });
  }

  for (let i = 0; i < frames; i++) {
    left[i] = Math.tanh(left[i] * 1.2) * 0.8;
    right[i] = Math.tanh(right[i] * 1.2) * 0.8;
  }
  return buffer;
}

export function useGiftSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const musicBufferRef = useRef<AudioBuffer | null>(null);
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      try {
        musicSourceRef.current?.stop();
      } catch {
        /* หยุดไปแล้ว */
      }
      musicSourceRef.current = null;
      musicGainRef.current = null;
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  const context = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Ctor();
      } catch {
        ctxRef.current = null;
      }
    }
    const ctx = ctxRef.current;
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }, []);

  const noise = useCallback((ctx: AudioContext): AudioBuffer => {
    if (!noiseRef.current || noiseRef.current.sampleRate !== ctx.sampleRate) {
      const len = Math.floor(ctx.sampleRate * 1.4);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      noiseRef.current = buf;
    }
    return noiseRef.current;
  }, []);

  const stopMusic = useCallback(() => {
    const ctx = ctxRef.current;
    const source = musicSourceRef.current;
    const gain = musicGainRef.current;
    if (!ctx || !source) return;
    musicSourceRef.current = null;
    musicGainRef.current = null;
    if (gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    }
    try {
      source.stop(ctx.currentTime + 0.34);
    } catch {
      /* จบพร้อมกันพอดี */
    }
  }, []);

  /** ผู้เรียกตัดสินเองว่าเสียงเปิดอยู่ไหม (enabledRef อัปเดตหลัง render ช้าไปหนึ่งจังหวะ
   *  ตอนครูเพิ่งกดเปิดเสียง) — `play` ยังเช็ก enabledRef ตามปกติ */
  const startMusic = useCallback(() => {
    if (musicSourceRef.current) return;
    const ctx = context();
    if (!ctx) return;
    if (!musicBufferRef.current || musicBufferRef.current.sampleRate !== ctx.sampleRate) {
      musicBufferRef.current = createMusic(ctx);
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = musicBufferRef.current;
    source.loop = true;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, ctx.currentTime + 0.5);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.onended = () => {
      if (musicSourceRef.current === source) {
        musicSourceRef.current = null;
        musicGainRef.current = null;
      }
    };
    musicSourceRef.current = source;
    musicGainRef.current = gain;
    source.start();
  }, [context]);

  useEffect(() => {
    if (!enabled) stopMusic();
  }, [enabled, stopMusic]);

  /** หรี่เพลงลงช่วง `seconds` แล้วค่อยๆ กลับ */
  const duck = useCallback((ctx: AudioContext, start: number, seconds: number) => {
    const gain = musicGainRef.current;
    if (!gain) return;
    gain.gain.cancelScheduledValues(start);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), start);
    gain.gain.exponentialRampToValueAtTime(0.03, start + 0.25);
    gain.gain.setValueAtTime(0.03, start + seconds);
    gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, start + seconds + 0.9);
  }, []);

  const tone = useCallback(
    (
      ctx: AudioContext,
      f: number,
      start: number,
      dur: number,
      type: OscillatorType,
      vol: number,
      dest: AudioNode = ctx.destination,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    },
    [],
  );

  /** ทุกเสียงฉลองผ่าน compressor ตัวเดียว ซ้อนโน้ตหลายตัวได้โดยไม่แตก */
  const bus = useCallback((ctx: AudioContext, start: number, level: number) => {
    const comp = ctx.createDynamicsCompressor();
    const master = ctx.createGain();
    comp.threshold.setValueAtTime(-18, start);
    comp.ratio.setValueAtTime(5, start);
    master.gain.setValueAtTime(level, start);
    master.connect(comp);
    comp.connect(ctx.destination);
    return master;
  }, []);

  const brassChord = useCallback(
    (ctx: AudioContext, dest: AudioNode, start: number, freqs: number[], dur: number) => {
      freqs.forEach((f, i) => {
        tone(ctx, f, start + i * 0.01, dur, "triangle", 0.09, dest);
        tone(ctx, f / 2, start + i * 0.01, dur * 0.7, "sawtooth", 0.02, dest);
      });
    },
    [tone],
  );

  const play = useCallback(
    (kind: GiftSound, durationMs = 0) => {
      if (!enabledRef.current) return;
      const ctx = context();
      if (!ctx) return;
      const t = ctx.currentTime;

      switch (kind) {
        case "tick":
          tone(ctx, 1100, t, 0.045, "square", 0.045);
          break;

        // "ตะ-ตะ-ต๊าาา" ตอนได้คนเริ่ม
        case "fanfare": {
          const out = bus(ctx, t, 0.7);
          brassChord(ctx, out, t, [392], 0.12);
          brassChord(ctx, out, t + 0.15, [392], 0.12);
          brassChord(ctx, out, t + 0.3, [523.25, 659.25, 783.99], 0.9);
          break;
        }

        // กลองรัวเร่งขึ้นและดังขึ้นตลอดช่วงลุ้น ยาวเท่าที่ผู้เรียกบอก
        case "drumroll": {
          const dur = Math.max(0.3, durationMs / 1000);
          duck(ctx, t, dur);
          const out = bus(ctx, t, 0.9);
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(2200, t);
          filter.Q.setValueAtTime(0.8, t);
          filter.connect(out);
          let at = 0;
          let step = 0.075;
          let hit = 0;
          while (at < dur) {
            const progress = at / dur;
            const src = ctx.createBufferSource();
            const g = ctx.createGain();
            src.buffer = noise(ctx);
            const vol = 0.05 + 0.2 * progress ** 1.5;
            g.gain.setValueAtTime(vol, t + at);
            g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.05);
            src.connect(g);
            g.connect(filter);
            src.start(t + at, Math.random(), 0.06);
            if (hit % 4 === 0) tone(ctx, 110, t + at, 0.12, "sine", 0.06 + 0.1 * progress, out);
            hit++;
            step = Math.max(0.028, step * 0.97);
            at += step;
          }
          break;
        }

        // "ปัง!" ตอนฝาระเบิด: กลองใหญ่ดิ่งลง + ฉาบ
        case "pop": {
          const out = bus(ctx, t, 0.85);
          const boom = ctx.createOscillator();
          const bg = ctx.createGain();
          boom.type = "sine";
          boom.frequency.setValueAtTime(170, t);
          boom.frequency.exponentialRampToValueAtTime(42, t + 0.5);
          bg.gain.setValueAtTime(0.4, t);
          bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
          boom.connect(bg);
          bg.connect(out);
          boom.start(t);
          boom.stop(t + 0.72);
          const crash = ctx.createBufferSource();
          const hp = ctx.createBiquadFilter();
          const cg = ctx.createGain();
          crash.buffer = noise(ctx);
          hp.type = "highpass";
          hp.frequency.setValueAtTime(3000, t);
          cg.gain.setValueAtTime(0.22, t);
          cg.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
          crash.connect(hp);
          hp.connect(cg);
          cg.connect(out);
          crash.start(t, 0, 1.25);
          break;
        }

        // แตรเฉลิมฉลองตอนเผยชื่อ: ไล่ขึ้นแล้วค้างคอร์ด + ประกาย
        case "celebrate": {
          const out = bus(ctx, t, 0.75);
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
            tone(ctx, f, t + i * 0.07, 0.35, "triangle", 0.1, out),
          );
          brassChord(ctx, out, t + 0.3, [523.25, 659.25, 783.99], 1.2);
          [1318.51, 1567.98, 2093].forEach((f, i) =>
            tone(ctx, f, t + 0.42 + i * 0.09, 0.4, "sine", 0.06, out),
          );
          break;
        }

        // กล่องสุดท้าย: สองวลี ปิดด้วยคอร์ดยาว
        case "finale": {
          const out = bus(ctx, t, 0.85);
          [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
            tone(ctx, f, t + i * 0.08, 0.32, "triangle", 0.1, out),
          );
          brassChord(ctx, out, t + 0.45, [349.23, 440, 523.25], 0.5);
          brassChord(ctx, out, t + 0.95, [392, 493.88, 587.33], 0.5);
          brassChord(ctx, out, t + 1.45, [523.25, 659.25, 783.99, 1046.5], 1.8);
          [1567.98, 2093, 2637].forEach((f, i) =>
            tone(ctx, f, t + 1.5 + i * 0.1, 0.5, "sine", 0.06, out),
          );
          break;
        }
      }
    },
    [brassChord, bus, context, duck, noise, tone],
  );

  return { play, startMusic, stopMusic };
}
```

- [ ] **Step 2: เขียน `fx.ts`**

```ts
// เอฟเฟกต์อนุภาคแบบ DOM + Web Animations (แนวเดียวกับคอนเฟตตีใน mystery-board)
// host ต้องเป็นเลเยอร์ position:absolute; overflow:hidden; pointer-events:none

const COLORS = ["#fbbf24", "#f97316", "#ef4444", "#22c55e", "#38bdf8", "#a78bfa", "#ffffff"];

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function track(el: HTMLElement, anim: Animation) {
  anim.onfinish = () => el.remove();
  anim.oncancel = () => el.remove();
}

/** คอนเฟตตียิงจากมุมล่างซ้าย-ขวาพร้อมกัน พุ่งขึ้นแล้วร่วง */
export function sideCannons(host: HTMLElement | null, pieces = 70): void {
  if (!host || reducedMotion()) return;
  const w = host.clientWidth;
  const h = host.clientHeight;
  for (let i = 0; i < pieces; i++) {
    const fromLeft = i % 2 === 0;
    const bit = document.createElement("span");
    const size = 7 + Math.random() * 8;
    bit.style.cssText = `position:absolute;bottom:-12px;${fromLeft ? "left" : "right"}:-12px;width:${size.toFixed(1)}px;height:${(size * 0.55).toFixed(1)}px;background:${COLORS[i % COLORS.length]};border-radius:2px`;
    host.appendChild(bit);
    const dx = (0.25 + Math.random() * 0.5) * w * (fromLeft ? 1 : -1);
    const peak = -(0.55 + Math.random() * 0.4) * h;
    const anim = bit.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${(dx * 0.6).toFixed(0)}px,${peak.toFixed(0)}px) rotate(${(Math.random() * 360).toFixed(0)}deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${dx.toFixed(0)}px,${(peak * 0.15).toFixed(0)}px) rotate(${(Math.random() * 900).toFixed(0)}deg)`,
          opacity: 0,
        },
      ],
      { duration: 1700 + Math.random() * 1100, easing: "cubic-bezier(.15,.7,.4,1)" },
    );
    track(bit, anim);
  }
}

/** ดอกไม้ไฟหลายลูกทยอยแตกทั่วครึ่งบนของจอ */
export function fireworks(host: HTMLElement | null, bursts = 6): void {
  if (!host || reducedMotion()) return;
  const w = host.clientWidth;
  const h = host.clientHeight;
  for (let b = 0; b < bursts; b++) {
    const cx = w * (0.15 + Math.random() * 0.7);
    const cy = h * (0.12 + Math.random() * 0.45);
    const color = COLORS[b % COLORS.length];
    const delay = b * 380 + Math.random() * 200;
    const sparks = 28;
    for (let i = 0; i < sparks; i++) {
      const angle = (i / sparks) * Math.PI * 2;
      const dist = 70 + Math.random() * 90;
      const dot = document.createElement("span");
      dot.style.cssText = `position:absolute;left:${cx.toFixed(0)}px;top:${cy.toFixed(0)}px;width:6px;height:6px;margin:-3px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};opacity:0`;
      host.appendChild(dot);
      const anim = dot.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          {
            transform: `translate(${(Math.cos(angle) * dist).toFixed(0)}px,${(Math.sin(angle) * dist + 30).toFixed(0)}px) scale(.3)`,
            opacity: 0,
          },
        ],
        { duration: 1300, delay, easing: "cubic-bezier(.1,.8,.3,1)" },
      );
      track(dot, anim);
    }
  }
}

export function clearFx(host: HTMLElement | null): void {
  host?.replaceChildren();
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit`
Expected: ไม่มี error

Run: `npx eslint app/gift-exchange`
Expected: ไม่มี error

- [ ] **Step 4: Commit**

```bash
git add app/gift-exchange/useGiftSound.ts app/gift-exchange/fx.ts
git commit -m "feat(gift-exchange): add festive music, sound effects and particle bursts"
```

---

### Task 3: กล่องของขวัญ SVG + สไตล์พื้นฐาน

**Files:**
- Create: `app/gift-exchange/GiftBox.tsx`
- Create: `app/gift-exchange/GiftExchange.module.css`

**Interfaces:**
- Consumes: —
- Produces:
  ```ts
  type GiftPalette = { box: string; boxDark: string; ribbon: string; ribbonDark: string };
  type GiftState = "idle" | "charging" | "burst" | "open";
  const GOLD: GiftPalette;
  paletteFor(index: number): GiftPalette
  <GiftBox palette={GiftPalette} state={GiftState} chargeMs={number} />
  ```
  CSS classes ที่ task ถัดไปใช้: `shell`, `fsFallback`, `bar`, `barTitle`, `barActions`, `iconBtn`, `iconBtnLabel`, `body`, `snow`, `flake`, `fxLayer`, `primaryBtn`, `ghostBtn`, `srOnly`

- [ ] **Step 1: เขียน `GiftBox.tsx`**

```tsx
"use client";

import { useId, type CSSProperties } from "react";
import styles from "./GiftExchange.module.css";

export type GiftPalette = { box: string; boxDark: string; ribbon: string; ribbonDark: string };

export type GiftState = "idle" | "charging" | "burst" | "open";

const PALETTES: GiftPalette[] = [
  { box: "#ef4444", boxDark: "#991b1b", ribbon: "#fde68a", ribbonDark: "#d97706" },
  { box: "#22c55e", boxDark: "#166534", ribbon: "#fecaca", ribbonDark: "#dc2626" },
  { box: "#3b82f6", boxDark: "#1e3a8a", ribbon: "#f1f5f9", ribbonDark: "#94a3b8" },
  { box: "#a855f7", boxDark: "#581c87", ribbon: "#fbcfe8", ribbonDark: "#db2777" },
  { box: "#f97316", boxDark: "#9a3412", ribbon: "#fef3c7", ribbonDark: "#b45309" },
  { box: "#14b8a6", boxDark: "#115e59", ribbon: "#fde68a", ribbonDark: "#ca8a04" },
];

/** กล่องใบสุดท้าย */
export const GOLD: GiftPalette = { box: "#fbbf24", boxDark: "#b45309", ribbon: "#ef4444", ribbonDark: "#991b1b" };

export function paletteFor(index: number): GiftPalette {
  const n = PALETTES.length;
  return PALETTES[((index % n) + n) % n];
}

type Props = { palette: GiftPalette; state: GiftState; chargeMs: number };

/**
 * กล่องแยกชิ้นเพื่อให้ CSS ขยับแต่ละส่วนได้เอง: ชั้น float (ลอยตอนรอ),
 * shake (สั่นแรงขึ้นตอนลุ้น), jitter (สั่นถี่), ฝา+โบว์ (พุ่งออกตอนระเบิด),
 * ริบบิ้นตัวกล่อง (ขาดหลุด), แสงรั่วตามรอยต่อ และแสงข้างในกล่อง
 */
export default function GiftBox({ palette, state, chargeMs }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      viewBox="0 0 240 240"
      className={styles.gift}
      data-state={state}
      style={{ "--charge-ms": `${chargeMs}ms` } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.box} />
          <stop offset="1" stopColor={palette.boxDark} />
        </linearGradient>
        <linearGradient id={id("rib")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.ribbonDark} />
          <stop offset=".5" stopColor={palette.ribbon} />
          <stop offset="1" stopColor={palette.ribbonDark} />
        </linearGradient>
        <radialGradient id={id("glow")}>
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset=".5" stopColor="#fde68a" stopOpacity=".8" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <rect x="40" y="104" width="160" height="108" rx="10" />
        </clipPath>
        <filter id={id("blur")} x="-50%" y="-300%" width="200%" height="700%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="120" cy="224" rx="84" ry="9" fill="#000" opacity=".3" />

      <g className={styles.giftFloat}>
        <g className={styles.giftShake}>
          <g className={styles.giftJitter}>
            <ellipse className={styles.innerGlow} cx="120" cy="104" rx="86" ry="26" fill={url("glow")} />
            <rect x="40" y="104" width="160" height="108" rx="10" fill={url("body")} />
            <rect x="40" y="104" width="160" height="14" fill="#000" opacity=".16" />
            <g className={styles.bodyRibbon}>
              <rect x="108" y="104" width="24" height="108" fill={url("rib")} />
            </g>
            <g clipPath={url("clip")}>
              <rect className={styles.sheen} x="40" y="96" width="44" height="130" fill={url("sheen")} />
            </g>
            <rect className={styles.leak} x="34" y="98" width="172" height="12" rx="6" fill="#fde68a" filter={url("blur")} />

            <g className={styles.lid}>
              <rect x="30" y="80" width="180" height="30" rx="8" fill={url("body")} />
              <rect x="30" y="80" width="180" height="8" rx="4" fill="#fff" opacity=".22" />
              <rect x="106" y="80" width="28" height="30" fill={url("rib")} />
              <path d="M120 78 C 98 40, 58 44, 70 70 C 77 86, 104 82, 120 78 Z" fill={palette.ribbon} stroke={palette.ribbonDark} strokeWidth="3" />
              <path d="M120 78 C 142 40, 182 44, 170 70 C 163 86, 136 82, 120 78 Z" fill={palette.ribbon} stroke={palette.ribbonDark} strokeWidth="3" />
              <path d="M84 66 C 92 58, 104 62, 112 72" fill="none" stroke={palette.ribbonDark} strokeWidth="2.5" opacity=".6" />
              <path d="M156 66 C 148 58, 136 62, 128 72" fill="none" stroke={palette.ribbonDark} strokeWidth="2.5" opacity=".6" />
              <rect x="109" y="66" width="22" height="22" rx="7" fill={palette.ribbon} stroke={palette.ribbonDark} strokeWidth="3" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: สร้าง `GiftExchange.module.css` — โครง shell, แถบบน, หิมะ, ปุ่ม, กล่อง**

```css
/* ===== shell ===== */
.shell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 600px;
  overflow: hidden;
  container: giftexchange / inline-size;
  border-radius: 20px;
  background: radial-gradient(120% 90% at 50% 0%, #3b2a7a 0%, #1d1b4f 45%, #0f1030 100%);
  color: #fff;
  font-family: var(--font-anuphan), sans-serif;
}

/* คู่กับ useToolFullscreen: native :fullscreen และ fallback ของ iOS ต้องหน้าตาเหมือนกัน */
.shell:fullscreen,
.shell.fsFallback {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483646 !important;
  width: 100vw !important;
  height: 100vh !important;
  height: 100dvh !important;
  min-height: 0;
  border-radius: 0 !important;
}

.fxLayer {
  position: absolute;
  inset: 0;
  z-index: 45;
  overflow: hidden;
  pointer-events: none;
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ===== แถบบน ===== */
.bar {
  position: relative;
  z-index: 5;
  flex: none;
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
  white-space: nowrap;
}

.barActions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.iconBtn {
  min-width: 40px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.iconBtn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.iconBtnLabel {
  display: none;
}

@container giftexchange (min-width: 640px) {
  .iconBtnLabel {
    display: inline;
  }
}

.body {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px 14px 20px;
}

/* ===== หิมะ/ประกายลอยตลอดเวลา ===== */
.snow {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.flake {
  position: absolute;
  top: -12px;
  left: var(--x);
  width: var(--s);
  height: var(--s);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  opacity: 0.7;
  animation: flakeFall var(--d) linear var(--delay) infinite;
}

@keyframes flakeFall {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(var(--drift), 120vh, 0);
  }
}

/* ===== ปุ่ม ===== */
.primaryBtn {
  min-height: 52px;
  padding: 0 28px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #3b1d00;
  font: inherit;
  font-size: clamp(16px, 2.6cqi, 22px);
  font-weight: 800;
  box-shadow: 0 10px 24px -8px rgba(249, 115, 22, 0.7);
  cursor: pointer;
}

.primaryBtn:hover {
  filter: brightness(1.06);
}

.primaryBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.primaryBtn:focus-visible,
.ghostBtn:focus-visible,
.iconBtn:focus-visible {
  outline: 3px solid #fde68a;
  outline-offset: 3px;
}

.ghostBtn {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #d3d8e1;
  border-radius: 999px;
  background: #fff;
  color: var(--color-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.ghostBtn:hover {
  background: #f1f3f6;
}

/* ===== กล่องของขวัญ (GiftBox.tsx) ===== */
.gift {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.giftFloat,
.giftShake,
.giftJitter,
.lid,
.bodyRibbon,
.sheen {
  transform-box: fill-box;
  transform-origin: center;
}

.giftShake {
  transform-origin: center bottom;
}

.sheen {
  transform: skewX(-18deg);
  animation: sheen 3.4s ease-in-out infinite;
}

@keyframes sheen {
  0%,
  45% {
    transform: translateX(-80px) skewX(-18deg);
  }
  75%,
  100% {
    transform: translateX(200px) skewX(-18deg);
  }
}

.leak,
.innerGlow {
  opacity: 0;
}

.gift[data-state="idle"] .giftFloat {
  animation: giftFloat 2.6s ease-in-out infinite;
}

@keyframes giftFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ลุ้น: สั่นแรงขึ้นเรื่อยๆ + ขยาย + แสงรั่วตามรอยต่อฝา */
.gift[data-state="charging"] .giftShake {
  animation: giftCharge var(--charge-ms, 2000ms) cubic-bezier(0.5, 0, 1, 1) forwards;
}

.gift[data-state="charging"] .giftJitter {
  animation: giftJitter 90ms linear infinite;
}

.gift[data-state="charging"] .leak {
  animation: leakGrow var(--charge-ms, 2000ms) ease-in forwards;
}

@keyframes giftCharge {
  0% { transform: scale(1) rotate(0deg); }
  10% { transform: scale(1.01) rotate(-2deg); }
  20% { transform: scale(1.02) rotate(2deg); }
  30% { transform: scale(1.03) rotate(-3deg); }
  40% { transform: scale(1.05) rotate(3deg) translateX(-2px); }
  50% { transform: scale(1.06) rotate(-4deg) translateX(3px); }
  60% { transform: scale(1.08) rotate(5deg) translateX(-4px); }
  70% { transform: scale(1.1) rotate(-6deg) translateX(5px); }
  80% { transform: scale(1.12) rotate(7deg) translateX(-6px); }
  90% { transform: scale(1.14) rotate(-8deg) translateX(6px); }
  100% { transform: scale(1.15) rotate(0deg); }
}

@keyframes giftJitter {
  0% { transform: translate(0, 0); }
  25% { transform: translate(1.5px, -1px); }
  50% { transform: translate(-1.5px, 1px); }
  75% { transform: translate(1px, 1.5px); }
  100% { transform: translate(0, 0); }
}

@keyframes leakGrow {
  0% { opacity: 0; }
  60% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* ระเบิด: ฝาพุ่งหมุนออกนอกจอ ริบบิ้นขาดหลุด แสงในกล่องสว่าง */
.gift[data-state="burst"] .giftShake,
.gift[data-state="open"] .giftShake {
  transform: scale(1.15);
}

.gift[data-state="burst"] .lid {
  animation: lidFly 800ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}

.gift[data-state="open"] .lid {
  display: none;
}

.gift[data-state="burst"] .bodyRibbon,
.gift[data-state="open"] .bodyRibbon {
  animation: ribbonSnap 600ms ease-in forwards;
}

.gift[data-state="burst"] .innerGlow,
.gift[data-state="open"] .innerGlow {
  opacity: 1;
}

.gift[data-state="burst"] .sheen,
.gift[data-state="open"] .sheen {
  animation: none;
  opacity: 0;
}

@keyframes lidFly {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(150px, -380px) rotate(200deg); opacity: 0; }
}

@keyframes ribbonSnap {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(-40px, 40px) rotate(-35deg); opacity: 0; }
}

@keyframes lidFade {
  to { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .gift .giftFloat,
  .gift .giftShake,
  .gift .giftJitter,
  .gift .sheen,
  .gift .bodyRibbon {
    animation: none !important;
  }
  .gift[data-state="burst"] .lid {
    animation: lidFade 300ms ease forwards !important;
  }
  .snow {
    display: none;
  }
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit` แล้ว `npx eslint app/gift-exchange`
Expected: ไม่มี error

- [ ] **Step 4: Commit**

```bash
git add app/gift-exchange/GiftBox.tsx app/gift-exchange/GiftExchange.module.css
git commit -m "feat(gift-exchange): draw the animated gift box"
```

---

### Task 4: จอตั้งค่า + จอสุ่มคนเริ่ม

**Files:**
- Create: `app/gift-exchange/SetupPanel.tsx`
- Create: `app/gift-exchange/StarterSpin.tsx`
- Modify: `app/gift-exchange/GiftExchange.module.css` (ต่อท้ายไฟล์)

**Interfaces:**
- Consumes: `Player`, `MIN_PLAYERS` จาก Task 1; `GiftSound` จาก Task 2; `reducedMotion` จาก `fx.ts`; `ClassroomRosterPicker` (`components/ClassroomRosterPicker.tsx`, prop `onSelect(roster: { studentNames: string[] })`, `buttonLabel`, `className`, `disabled`)
- Produces:
  ```ts
  <SetupPanel
    namesText={string} players={Player[]} labels={Record<string,string>}
    activeCount={number} canStart={boolean} locked={boolean}
    resume={{ opened: number; total: number } | null}
    onNamesText={(text: string) => void} onRoster={(names: string[]) => void}
    onToggle={(id: string) => void} onStart={() => void}
    onResume={() => void} onDiscard={() => void} />
  <StarterSpin names={string[]} starterLabel={string} animate={boolean}
    play={(k: GiftSound) => void} onLanded={() => void} onContinue={() => void} />
  ```

- [ ] **Step 1: เขียน `SetupPanel.tsx`**

```tsx
"use client";

import ClassroomRosterPicker from "@/components/ClassroomRosterPicker";
import { MIN_PLAYERS, type Player } from "./chainModel";
import styles from "./GiftExchange.module.css";

type Props = {
  namesText: string;
  players: Player[];
  labels: Record<string, string>;
  activeCount: number;
  canStart: boolean;
  /** มีเกมค้างรอครูเลือก "เล่นต่อ/เริ่มใหม่" — ห้ามแก้รายชื่อจนกว่าจะเลือก */
  locked: boolean;
  resume: { opened: number; total: number } | null;
  onNamesText: (text: string) => void;
  onRoster: (names: string[]) => void;
  onToggle: (id: string) => void;
  onStart: () => void;
  onResume: () => void;
  onDiscard: () => void;
};

export default function SetupPanel({
  namesText,
  players,
  labels,
  activeCount,
  canStart,
  locked,
  resume,
  onNamesText,
  onRoster,
  onToggle,
  onStart,
  onResume,
  onDiscard,
}: Props) {
  return (
    <div className={styles.setupWrap}>
      {resume && (
        <div className={styles.resumeBanner} role="status">
          <span>
            มีเกมค้างอยู่ (เปิดไปแล้ว {resume.opened}/{resume.total})
          </span>
          <span className={styles.resumeActions}>
            <button type="button" className={styles.primaryBtnSm} onClick={onResume}>
              เล่นต่อ
            </button>
            <button type="button" className={styles.ghostBtn} onClick={onDiscard}>
              เริ่มใหม่
            </button>
          </span>
        </div>
      )}

      <div className={styles.setupCard}>
        <div className={styles.setupHead}>
          <h2 className={styles.setupTitle}>🎄 รายชื่อคนจับฉลาก</h2>
          <ClassroomRosterPicker
            onSelect={(roster) => onRoster(roster.studentNames)}
            disabled={locked}
            className={styles.ghostBtn}
          />
        </div>

        <label className={styles.fieldLabel} htmlFor="gift-names">
          วางรายชื่อ บรรทัดละคน
        </label>
        <textarea
          id="gift-names"
          className={styles.textarea}
          value={namesText}
          readOnly={locked}
          onChange={(e) => onNamesText(e.target.value)}
          placeholder={"ต้น\nฝน\nบี\n..."}
          rows={6}
        />

        {players.length > 0 && (
          <>
            <p className={styles.hint}>แตะชื่อเพื่อสลับ มา / ขาด — คนที่ขาดจะไม่ถูกจับ</p>
            <ul className={styles.chips}>
              {players.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={styles.chip}
                    aria-pressed={p.active}
                    disabled={locked}
                    onClick={() => onToggle(p.id)}
                  >
                    {labels[p.id]}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className={styles.setupFoot}>
          <span className={styles.countPill}>มา {activeCount} คน</span>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!canStart || locked}
            onClick={onStart}
          >
            🎁 เริ่มจับฉลาก
          </button>
        </div>
        {!canStart && !locked && (
          <p className={styles.hint}>ต้องมีคนมาอย่างน้อย {MIN_PLAYERS} คนจึงจะเริ่มได้</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: เขียน `StarterSpin.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "./fx";
import type { GiftSound } from "./useGiftSound";
import styles from "./GiftExchange.module.css";

const STEPS = 20;
const FIRST_DELAY = 50;
const SLOWDOWN = 1.15;
const MAX_DELAY = 280;

type Props = {
  names: string[];
  starterLabel: string;
  /** false = กลับมาจากเกมค้าง แสดงผลเลยไม่ต้องหมุน */
  animate: boolean;
  play: (kind: GiftSound) => void;
  onLanded: () => void;
  onContinue: () => void;
};

/** ลำดับชื่อที่วิ่งผ่านช่องสล็อต จบที่คนเริ่มเสมอ */
function spinOrder(names: string[], starter: string): string[] {
  const offset = Math.floor(Math.random() * names.length);
  const order = Array.from({ length: STEPS }, (_, i) => names[(offset + i) % names.length]);
  order[order.length - 1] = starter;
  return order;
}

export default function StarterSpin({ names, starterLabel, animate, play, onLanded, onContinue }: Props) {
  const [skip] = useState(() => !animate || names.length < 2 || reducedMotion());
  const [shown, setShown] = useState(skip ? starterLabel : names[0]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(skip);
  const playRef = useRef(play);
  const landedRef = useRef(onLanded);

  useEffect(() => {
    playRef.current = play;
    landedRef.current = onLanded;
  });

  useEffect(() => {
    const timers: number[] = [];
    if (skip) {
      if (animate) timers.push(window.setTimeout(() => landedRef.current(), 0));
      return () => timers.forEach(clearTimeout);
    }
    const order = spinOrder(names, starterLabel);
    let at = 0;
    let delay = FIRST_DELAY;
    order.forEach((name, i) => {
      timers.push(
        window.setTimeout(() => {
          setShown(name);
          setStep(i);
          if (i === order.length - 1) {
            setDone(true);
            landedRef.current();
          } else {
            playRef.current("tick");
          }
        }, at),
      );
      at += delay;
      delay = Math.min(MAX_DELAY, delay * SLOWDOWN);
    });
    return () => timers.forEach(clearTimeout);
    // หมุนครั้งเดียวตอน mount — App เปลี่ยน key ถ้าต้องหมุนใหม่
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.starter}>
      <p className={styles.starterLead}>{done ? "ได้คนเริ่มแล้ว!" : "กำลังสุ่มคนเริ่ม..."}</p>
      <div className={`${styles.slotWindow} ${done ? styles.slotDone : ""}`}>
        <span key={step} className={styles.slotName}>
          {shown}
        </span>
      </div>
      <p className={styles.srOnly} aria-live="polite">
        {done ? `${starterLabel} เริ่มก่อน` : ""}
      </p>
      {done && (
        <>
          <p className={styles.starterResult}>🎉 {starterLabel} เริ่มก่อน!</p>
          <button type="button" className={`${styles.primaryBtn} ${styles.appear}`} onClick={onContinue}>
            ไปที่กล่องของขวัญ 🎁
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: ต่อท้าย CSS**

```css
/* ===== จอตั้งค่า ===== */
.setupWrap {
  display: grid;
  gap: 12px;
  width: min(760px, 100%);
  margin: 0 auto;
}

.setupCard {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: #fff;
  color: var(--color-ink);
  box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.6);
}

.setupHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.setupTitle {
  margin: 0;
  font-size: 20px;
}

.fieldLabel {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink-secondary);
}

.textarea {
  width: 100%;
  min-height: 140px;
  padding: 12px 14px;
  border: 1px solid #d3d8e1;
  border-radius: 12px;
  font-family: var(--font-sarabun), sans-serif;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
}

.textarea:focus {
  outline: 3px solid #c6c9fb;
  border-color: #5c5ee6;
}

.hint {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink-muted);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chip {
  max-width: 14em;
  padding: 6px 12px;
  overflow: hidden;
  border: 1px solid #d3d8e1;
  border-radius: 999px;
  background: #f1f3f6;
  color: var(--color-ink);
  font: inherit;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.chip[aria-pressed="true"] {
  border-color: #a5b4fc;
  background: #eef0ff;
}

.chip[aria-pressed="false"] {
  opacity: 0.5;
  text-decoration: line-through;
}

.chip:disabled {
  cursor: not-allowed;
}

.setupFoot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.countPill {
  padding: 6px 12px;
  border-radius: 999px;
  background: #d0fbef;
  color: #0a9380;
  font-weight: 700;
}

.resumeBanner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border: 1px solid #fde68a;
  border-radius: 14px;
  background: #fffbeb;
  color: #92600a;
  font-weight: 600;
}

.resumeActions {
  display: flex;
  gap: 8px;
}

.primaryBtnSm {
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #3b1d00;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

/* ===== จอสุ่มคนเริ่ม ===== */
.starter {
  flex: 1;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 18px;
  padding: 24px 12px;
  text-align: center;
}

.starterLead {
  margin: 0;
  font-size: clamp(18px, 3.4cqi, 30px);
  font-weight: 700;
  opacity: 0.85;
}

.slotWindow {
  display: grid;
  place-items: center;
  width: min(560px, 92cqi);
  height: clamp(84px, 16cqi, 150px);
  overflow: hidden;
  border-radius: 22px;
  background: linear-gradient(#fff, #f3f0ff);
  color: #1a1d26;
  box-shadow:
    inset 0 6px 12px rgba(0, 0, 0, 0.18),
    0 0 0 6px #fbbf24,
    0 0 40px rgba(251, 191, 36, 0.45);
}

.slotName {
  max-width: 94%;
  overflow: hidden;
  font-size: clamp(30px, 8cqi, 84px);
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: slotTick 110ms ease-out;
}

@keyframes slotTick {
  from {
    transform: translateY(-45%);
    opacity: 0.2;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slotDone {
  animation: slotGlow 1.2s ease-in-out infinite;
}

@keyframes slotGlow {
  0%,
  100% {
    box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.18), 0 0 0 6px #fbbf24, 0 0 40px rgba(251, 191, 36, 0.45);
  }
  50% {
    box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.18), 0 0 0 8px #fde68a, 0 0 80px rgba(251, 191, 36, 0.85);
  }
}

.starterResult {
  margin: 0;
  font-size: clamp(22px, 4.6cqi, 46px);
  font-weight: 800;
  color: #fde68a;
}

.appear {
  animation: fadeUp 450ms ease-out both;
}

@keyframes fadeUp {
  from {
    transform: translateY(14px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slotName,
  .slotDone,
  .appear {
    animation: none;
  }
}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit` แล้ว `npx eslint app/gift-exchange`
Expected: ไม่มี error (ถ้า `react-hooks/set-state-in-effect` เตือนใน StarterSpin ให้ตรวจว่า setState ทุกตัวอยู่ใน callback ของ `setTimeout` แล้ว)

- [ ] **Step 5: Commit**

```bash
git add app/gift-exchange/SetupPanel.tsx app/gift-exchange/StarterSpin.tsx app/gift-exchange/GiftExchange.module.css
git commit -m "feat(gift-exchange): add the roster setup and starter spin screens"
```

---

### Task 5: เวทีเปิดกล่อง + แถบโซ่ + แผงรายชื่อ

**Files:**
- Create: `app/gift-exchange/GiftStage.tsx`
- Create: `app/gift-exchange/ChainStrip.tsx`
- Create: `app/gift-exchange/RosterPanel.tsx`
- Modify: `app/gift-exchange/GiftExchange.module.css` (ต่อท้ายไฟล์)

**Interfaces:**
- Consumes: `GiftBox`, `GOLD`, `paletteFor` (Task 3); `GiftSound` (Task 2); `reducedMotion` (fx.ts); `Player` (Task 1)
- Produces:
  ```ts
  <GiftStage
    giverLabel={string} receiverLabel={string | null} boxOpen={boolean}
    closesLoop={boolean} isLastBox={boolean} paletteIndex={number}
    remaining={number} chainLabels={string[]}
    play={(k: GiftSound, ms?: number) => void}
    onCannons={() => void} onFireworks={() => void}
    onOpen={() => void} onNext={() => void} onShowFinale={() => void}
    rosterButton={ReactNode} />
  <ChainStrip labels={string[]} />
  <RosterPanel players={Player[]} labels={Record<string,string>} chainIds={string[]}
    canToggle={(id: string) => boolean} onToggle={(id: string) => void}
    onAdd={(name: string) => void} onClose={() => void} />
  ```
  GiftStage ต้องถูก render ด้วย `key={giverId}` จาก App เพื่อรีเซ็ตแอนิเมชันทุกตาใหม่

- [ ] **Step 1: เขียน `ChainStrip.tsx`**

```tsx
"use client";

import { Fragment, useEffect, useRef } from "react";
import styles from "./GiftExchange.module.css";

export default function ChainStrip({ labels }: { labels: string[] }) {
  const ref = useRef<HTMLOListElement | null>(null);

  // เลื่อนให้คนล่าสุดอยู่ในจอเสมอ
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [labels.length]);

  if (labels.length === 0) return null;
  return (
    <ol ref={ref} className={styles.chainStrip} aria-label="ลำดับการแลกของขวัญ">
      {labels.map((label, i) => (
        <Fragment key={`${i}-${label}`}>
          {i > 0 && (
            <li className={styles.chainArrow} aria-hidden="true">
              →
            </li>
          )}
          <li className={`${styles.chainChip} ${i === labels.length - 1 ? styles.chainChipLast : ""}`}>
            {label}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: เขียน `RosterPanel.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "./chainModel";
import styles from "./GiftExchange.module.css";

type Props = {
  players: Player[];
  labels: Record<string, string>;
  chainIds: string[];
  canToggle: (id: string) => boolean;
  onToggle: (id: string) => void;
  onAdd: (name: string) => void;
  onClose: () => void;
};

export default function RosterPanel({ players, labels, chainIds, canToggle, onToggle, onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inChain = new Set(chainIds);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.panelBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-roster-title"
        tabIndex={-1}
      >
        <div className={styles.panelHead}>
          <h2 id="gift-roster-title" className={styles.setupTitle}>
            👥 รายชื่อ
          </h2>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            ปิด
          </button>
        </div>
        <p className={styles.hint}>
          ติ๊กคนขาดออกหรือเพิ่มคนมาสายได้ — คนที่มี 🔒 ถูกจับชื่อไปแล้ว จึงแก้ไม่ได้
        </p>
        <ul className={styles.chips}>
          {players.map((p) => {
            const locked = inChain.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className={styles.chip}
                  aria-pressed={p.active}
                  disabled={!canToggle(p.id)}
                  title={locked ? "ถูกจับชื่อแล้ว" : undefined}
                  onClick={() => onToggle(p.id)}
                >
                  {locked ? "🔒 " : ""}
                  {labels[p.id]}
                </button>
              </li>
            );
          })}
        </ul>
        <form
          className={styles.addRow}
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onAdd(name);
            setName("");
          }}
        >
          <input
            className={styles.addInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เพิ่มชื่อคนมาสาย"
            aria-label="เพิ่มชื่อคนมาสาย"
          />
          <button type="submit" className={styles.primaryBtnSm} disabled={!name.trim()}>
            เพิ่ม
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: เขียน `GiftStage.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ChainStrip from "./ChainStrip";
import GiftBox, { GOLD, paletteFor } from "./GiftBox";
import { reducedMotion } from "./fx";
import type { GiftSound } from "./useGiftSound";
import styles from "./GiftExchange.module.css";

const CHARGE_MS = 2000;
const FINAL_CHARGE_MS = 3000;
const REDUCED_CHARGE_MS = 500;
const BURST_MS = 200;

const STARS = Array.from({ length: 12 }, (_, i) => i * 30);

type Anim = "idle" | "charging" | "burst" | "shown";

type Props = {
  giverLabel: string;
  receiverLabel: string | null;
  boxOpen: boolean;
  closesLoop: boolean;
  isLastBox: boolean;
  paletteIndex: number;
  remaining: number;
  chainLabels: string[];
  play: (kind: GiftSound, durationMs?: number) => void;
  onCannons: () => void;
  onFireworks: () => void;
  onOpen: () => void;
  onNext: () => void;
  onShowFinale: () => void;
  rosterButton: ReactNode;
};

export default function GiftStage({
  giverLabel,
  receiverLabel,
  boxOpen,
  closesLoop,
  isLastBox,
  paletteIndex,
  remaining,
  chainLabels,
  play,
  onCannons,
  onFireworks,
  onOpen,
  onNext,
  onShowFinale,
  rosterButton,
}: Props) {
  // กลับมาจากเกมค้างที่เปิดกล่องไปแล้ว → แสดงผลเลยไม่เล่นแอนิเมชันซ้ำ
  const [anim, setAnim] = useState<Anim>(boxOpen ? "shown" : "idle");
  const [chargeMs, setChargeMs] = useState(CHARGE_MS);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const lastBox = isLastBox || closesLoop;

  const open = useCallback(() => {
    if (anim !== "idle") return;
    const final = isLastBox;
    const charge = reducedMotion() ? REDUCED_CHARGE_MS : final ? FINAL_CHARGE_MS : CHARGE_MS;
    // ผลถูกสุ่มและบันทึกตอนนี้เลย (ใน App) ก่อนเริ่มแอนิเมชัน
    onOpen();
    setChargeMs(charge);
    setAnim("charging");
    play("drumroll", charge);
    timers.current.push(
      window.setTimeout(() => {
        setAnim("burst");
        play("pop");
        onCannons();
      }, charge),
      window.setTimeout(() => {
        setAnim("shown");
        play(final ? "finale" : "celebrate");
        if (final) onFireworks();
      }, charge + BURST_MS),
    );
  }, [anim, isLastBox, onCannons, onFireworks, onOpen, play]);

  const revealed = anim === "shown" && receiverLabel !== null;
  // ระหว่างลุ้น ห้ามแถบโซ่/ตัวนับเฉลยก่อนกล่องเปิด
  const hiding = boxOpen && !closesLoop && (anim === "charging" || anim === "burst");
  const visibleChain = hiding ? chainLabels.slice(0, -1) : chainLabels;
  const visibleRemaining = hiding ? remaining + 1 : remaining;

  return (
    <div className={styles.stage} data-anim={anim}>
      {anim === "charging" && <div className={styles.dim} />}
      {anim === "burst" && <div className={styles.flash} />}

      <p className={styles.turnTitle}>
        {lastBox && <span className={styles.lastTag}>🌟 กล่องสุดท้าย! </span>}
        ตาของ <strong>{giverLabel}</strong>
        {anim === "idle" && <span className={styles.turnHint}> — แตะกล่องเลย!</span>}
      </p>

      <div className={styles.boxArea}>
        <div className={styles.spotlight} />
        <div className={`${styles.beams} ${anim === "burst" || anim === "shown" ? styles.beamsOn : ""}`} />
        <button
          type="button"
          className={styles.boxBtn}
          onClick={open}
          disabled={anim !== "idle"}
          aria-label={`เปิดกล่องของขวัญของ ${giverLabel}`}
        >
          <GiftBox
            palette={lastBox ? GOLD : paletteFor(paletteIndex)}
            state={anim === "shown" ? "open" : anim}
            chargeMs={chargeMs}
          />
        </button>
        {revealed && (
          <div className={styles.reveal}>
            <div className={styles.starBurst} aria-hidden="true">
              {STARS.map((a) => (
                <span key={a} style={{ "--a": `${a}deg` } as CSSProperties} />
              ))}
            </div>
            <span
              className={styles.revealName}
              style={{ "--len": Math.max(3, receiverLabel.length) } as CSSProperties}
            >
              {receiverLabel}
            </span>
          </div>
        )}
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {revealed ? `${giverLabel} มอบของขวัญให้ ${receiverLabel}` : ""}
      </p>

      <div className={styles.stageAfter}>
        {revealed && (
          <>
            <p className={styles.pairLine}>
              {giverLabel} 🎁 → {receiverLabel}
              {closesLoop ? " — ครบวงแล้ว! 🎉" : ""}
            </p>
            {closesLoop ? (
              <button type="button" className={`${styles.primaryBtn} ${styles.nextBtn}`} onClick={onShowFinale}>
                ดูวงทั้งห้อง 🎉
              </button>
            ) : (
              <button type="button" className={`${styles.primaryBtn} ${styles.nextBtn}`} onClick={onNext}>
                ต่อไป: ตาของ {receiverLabel}
              </button>
            )}
          </>
        )}
      </div>

      <div className={styles.stageFooter}>
        <span className={styles.counter}>เหลือ {visibleRemaining} คน</span>
        {rosterButton}
      </div>
      <ChainStrip labels={visibleChain} />
    </div>
  );
}
```

- [ ] **Step 4: ต่อท้าย CSS**

```css
/* ===== เวทีเปิดกล่อง ===== */
.stage {
  position: relative;
  flex: 1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto auto;
  justify-items: center;
  align-items: center;
  gap: 8px;
  min-height: 520px;
  text-align: center;
}

.turnTitle {
  position: relative;
  z-index: 3;
  margin: 0;
  font-size: clamp(20px, 4.2cqi, 44px);
  font-weight: 700;
}

.turnTitle strong {
  color: #fde68a;
}

.turnHint {
  font-weight: 500;
  opacity: 0.8;
}

.lastTag {
  color: #fbbf24;
}

.boxArea {
  position: relative;
  z-index: 3;
  display: grid;
  place-items: center;
  width: min(72cqi, 400px);
  aspect-ratio: 1;
}

.shell:fullscreen .boxArea,
.shell.fsFallback .boxArea {
  width: min(48vh, 70cqi, 560px);
}

.shell:fullscreen .stage,
.shell.fsFallback .stage {
  min-height: 0;
}

.spotlight {
  position: absolute;
  inset: -30% -45% -5%;
  background: radial-gradient(closest-side, rgba(255, 236, 170, 0.33), transparent 72%);
  pointer-events: none;
}

.boxBtn {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  border-radius: 28px;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.boxBtn:disabled {
  cursor: default;
}

.boxBtn:focus-visible {
  outline: 4px solid #fde68a;
  outline-offset: 6px;
}

.dim {
  position: absolute;
  inset: -40px;
  z-index: 2;
  background: rgba(3, 4, 18, 0.55);
  animation: dimIn 900ms ease-in forwards;
  pointer-events: none;
}

@keyframes dimIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.flash {
  position: absolute;
  inset: -40px;
  z-index: 40;
  background: #fff;
  pointer-events: none;
  animation: flashOnce 160ms ease-out forwards;
}

@keyframes flashOnce {
  from { opacity: 0.9; }
  to { opacity: 0; }
}

.beams {
  position: absolute;
  inset: -40%;
  background: repeating-conic-gradient(from 0deg, rgba(255, 230, 150, 0.35) 0deg 8deg, transparent 8deg 22deg);
  -webkit-mask: radial-gradient(circle, #000 18%, transparent 66%);
  mask: radial-gradient(circle, #000 18%, transparent 66%);
  opacity: 0;
  transform: scale(0.4);
  pointer-events: none;
}

.beamsOn {
  animation:
    beamsIn 600ms ease-out forwards,
    beamsSpin 16s linear infinite;
}

@keyframes beamsIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes beamsSpin {
  to {
    rotate: 360deg;
  }
}

.reveal {
  position: absolute;
  left: 50%;
  top: 2%;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 100cqi;
  translate: -50% 0;
  pointer-events: none;
}

.revealName {
  display: block;
  max-width: 96cqi;
  font-family: var(--font-anuphan), sans-serif;
  font-size: clamp(32px, min(11cqi, calc(150cqi / var(--len))), 128px);
  font-weight: 800;
  line-height: 1.25;
  white-space: nowrap;
  background: linear-gradient(180deg, #fffbe0 0%, #fde047 45%, #f59e0b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 4px 0 #7c2d12) drop-shadow(0 0 24px rgba(251, 191, 36, 0.65));
  animation: nameRise 700ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

@keyframes nameRise {
  0% {
    transform: translateY(70%) scale(0.3);
    opacity: 0;
  }
  60% {
    transform: translateY(-8%) scale(1.15);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.starBurst {
  position: absolute;
  inset: 0;
}

.starBurst span {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  margin: -9px;
  background: #fde68a;
  clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  rotate: var(--a);
  opacity: 0;
  animation: starOut 1000ms ease-out 120ms forwards;
}

@keyframes starOut {
  0% {
    transform: translateX(0) scale(0.3);
    opacity: 1;
  }
  100% {
    transform: translateX(min(34cqi, 220px)) scale(1);
    opacity: 0;
  }
}

.stageAfter {
  position: relative;
  z-index: 3;
  display: grid;
  justify-items: center;
  gap: 10px;
  min-height: 112px;
}

.pairLine {
  margin: 0;
  font-size: clamp(18px, 3.6cqi, 36px);
  font-weight: 700;
  animation: fadeUp 500ms ease-out 900ms both;
}

.nextBtn {
  animation: fadeUp 400ms ease-out 1300ms both;
}

.stageFooter {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
}

.counter {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-weight: 700;
}

/* ===== แถบโซ่ ===== */
.chainStrip {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin: 0;
  padding: 4px 2px 6px;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
}

.chainChip {
  flex: none;
  max-width: 12em;
  padding: 4px 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chainChipLast {
  background: #fbbf24;
  color: #3b1d00;
  font-weight: 700;
}

.chainArrow {
  flex: none;
  opacity: 0.5;
}

/* ===== แผงรายชื่อกลางเกม ===== */
.panelBackdrop {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(5, 6, 20, 0.6);
}

.panel {
  display: grid;
  gap: 12px;
  width: min(560px, 100%);
  max-height: 90%;
  padding: 18px;
  overflow: auto;
  border-radius: 18px;
  background: #fff;
  color: var(--color-ink);
  text-align: left;
}

.panel:focus {
  outline: none;
}

.panelHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.addRow {
  display: flex;
  gap: 8px;
}

.addInput {
  flex: 1;
  min-width: 0;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid #d3d8e1;
  border-radius: 12px;
  font-family: var(--font-sarabun), sans-serif;
  font-size: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .flash,
  .beams,
  .starBurst,
  .dim {
    display: none;
  }
  .revealName {
    animation: fadeUp 300ms ease-out both;
  }
  .pairLine,
  .nextBtn {
    animation-delay: 0ms;
  }
}
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit` แล้ว `npx eslint app/gift-exchange`
Expected: ไม่มี error

- [ ] **Step 6: Commit**

```bash
git add app/gift-exchange/GiftStage.tsx app/gift-exchange/ChainStrip.tsx app/gift-exchange/RosterPanel.tsx app/gift-exchange/GiftExchange.module.css
git commit -m "feat(gift-exchange): stage the gift box reveal with the chain strip and roster panel"
```

---

### Task 6: จอปิดวง

**Files:**
- Create: `app/gift-exchange/FinaleChain.tsx`
- Modify: `app/gift-exchange/GiftExchange.module.css` (ต่อท้ายไฟล์)

**Interfaces:**
- Consumes: —
- Produces: `<FinaleChain labels={string[]} onComplete={() => void} onRestart={() => void} />` — `labels` เรียงตามลำดับโซ่ (`chain[0]` ก่อน); `onComplete` ถูกเรียกครั้งเดียวเมื่อวาดเส้นครบ (App ใช้ยิงดอกไม้ไฟ + เสียง)

- [ ] **Step 1: เขียน `FinaleChain.tsx`**

```tsx
"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import styles from "./GiftExchange.module.css";

const C = 320;
const R = 230;
const RN = 268;
const MAX_NAME = 10;

function shorten(label: string): string {
  return label.length > MAX_NAME ? `${label.slice(0, MAX_NAME - 1)}…` : label;
}

function fontSizeFor(n: number): number {
  if (n <= 10) return 26;
  if (n <= 20) return 20;
  if (n <= 30) return 15;
  if (n <= 40) return 12;
  return 10;
}

type Props = { labels: string[]; onComplete: () => void; onRestart: () => void };

/** ชื่อทุกคนเรียงรอบวงตามลำดับโซ่ เส้นโค้งเชื่อมไล่ทีละคนจนครบวง */
export default function FinaleChain({ labels, onComplete, onRestart }: Props) {
  const n = labels.length;
  const step = Math.min(220, 3200 / n);
  const fontSize = fontSizeFor(n);
  const markerId = `arrow${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  });

  useEffect(() => {
    const t = window.setTimeout(() => completeRef.current(), n * step + 400);
    return () => window.clearTimeout(t);
  }, [n, step]);

  const pts = labels.map((_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return {
      a,
      x: C + R * Math.cos(a),
      y: C + R * Math.sin(a),
      nx: C + RN * Math.cos(a),
      ny: C + RN * Math.sin(a),
    };
  });

  const delay = (i: number) => ({ "--delay": `${Math.round(i * step)}ms` }) as CSSProperties;

  return (
    <div className={styles.finale}>
      <h2 className={styles.finaleTitle}>ครบวงแล้ว! 🎉</h2>
      <p className={styles.finaleSub}>ทั้งห้อง {n} คน ได้แลกของขวัญกันครบทุกคน</p>
      <svg
        className={styles.ring}
        viewBox="-80 -10 800 660"
        role="img"
        aria-label={`ลำดับการแลกของขวัญ: ${labels.join(" → ")} → ${labels[0]}`}
      >
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#fbbf24" />
          </marker>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
        {pts.map((p, i) => {
          const q = pts[(i + 1) % n];
          return (
            <path
              key={`l${i}`}
              className={styles.ringLink}
              d={`M ${p.x.toFixed(1)} ${p.y.toFixed(1)} A ${R} ${R} 0 0 1 ${q.x.toFixed(1)} ${q.y.toFixed(1)}`}
              pathLength={1}
              markerEnd={`url(#${markerId})`}
              style={delay(i)}
            />
          );
        })}
        {pts.map((p, i) => (
          <circle key={`d${i}`} className={styles.ringDot} cx={p.x} cy={p.y} r={7} style={delay(i)} />
        ))}
        {pts.map((p, i) => {
          const cos = Math.cos(p.a);
          const anchor = Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end";
          return (
            <text
              key={`t${i}`}
              className={styles.ringName}
              x={p.nx}
              y={p.ny}
              fontSize={fontSize}
              textAnchor={anchor}
              dominantBaseline="middle"
              style={delay(i)}
            >
              {shorten(labels[i])}
            </text>
          );
        })}
      </svg>
      <button type="button" className={styles.primaryBtn} onClick={onRestart}>
        เริ่มใหม่ (รายชื่อเดิม)
      </button>
    </div>
  );
}
```

- [ ] **Step 2: ต่อท้าย CSS**

```css
/* ===== จอปิดวง ===== */
.finale {
  flex: 1;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 10px;
  padding: 8px 0;
  text-align: center;
}

.finaleTitle {
  margin: 0;
  font-size: clamp(28px, 6cqi, 64px);
  color: #fde68a;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
}

.finaleSub {
  margin: 0;
  font-size: clamp(15px, 2.6cqi, 22px);
  opacity: 0.85;
}

.ring {
  width: min(96cqi, 680px);
  overflow: visible;
}

.shell:fullscreen .ring,
.shell.fsFallback .ring {
  width: min(70vh, 96cqi);
}

.ringLink {
  fill: none;
  stroke: #fbbf24;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  animation: ringDraw 450ms ease-out var(--delay) forwards;
}

@keyframes ringDraw {
  from {
    stroke-dashoffset: 1;
    opacity: 1;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.ringDot {
  fill: #fff;
  opacity: 0;
  animation: ringFade 300ms ease-out var(--delay) forwards;
}

.ringName {
  fill: #fff;
  font-family: var(--font-anuphan), sans-serif;
  font-weight: 700;
  opacity: 0;
  animation: ringFade 300ms ease-out var(--delay) forwards;
}

@keyframes ringFade {
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ringLink,
  .ringDot,
  .ringName {
    animation-duration: 1ms;
    animation-delay: 0ms;
  }
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit` แล้ว `npx eslint app/gift-exchange`
Expected: ไม่มี error

- [ ] **Step 4: Commit**

```bash
git add app/gift-exchange/FinaleChain.tsx app/gift-exchange/GiftExchange.module.css
git commit -m "feat(gift-exchange): draw the closing chain ring"
```

---

### Task 7: ประกอบแอป + หน้าเว็บ แล้วเล่นจริงในเบราว์เซอร์

**Files:**
- Create: `app/gift-exchange/GiftExchangeApp.tsx`
- Create: `app/gift-exchange/page.tsx`

**Interfaces:**
- Consumes: ทุกอย่างจาก Task 1–6; `useTrackToolUse` (`lib/trackToolEvent.ts`); `useToolFullscreen(ref, fallbackClass)` คืน `{ isFull, fullscreenClassName, toggle }` (`components/useToolFullscreen.ts`)
- Produces: route `/gift-exchange`

- [ ] **Step 1: เขียน `GiftExchangeApp.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import {
  EMPTY_STATE,
  activePlayers,
  addPlayer,
  beginStage,
  boxesOpened,
  browserStorage,
  canStart,
  canToggle,
  currentTurn,
  nextTurn,
  openBox,
  parseNames,
  pickStarter,
  playerLabels,
  pool,
  readSaved,
  resetGame,
  setActive,
  setNames,
  totalBoxes,
  writeSaved,
  type GameState,
} from "./chainModel";
import FinaleChain from "./FinaleChain";
import GiftStage from "./GiftStage";
import RosterPanel from "./RosterPanel";
import SetupPanel from "./SetupPanel";
import StarterSpin from "./StarterSpin";
import { clearFx, fireworks, sideCannons } from "./fx";
import { useGiftSound } from "./useGiftSound";
import styles from "./GiftExchange.module.css";

// ตำแหน่งหิมะคงที่ (ไม่สุ่มตอน render) กัน hydration mismatch
const FLAKES = Array.from({ length: 30 }, (_, i) => ({
  "--x": `${(i * 37) % 100}%`,
  "--s": `${3 + (i % 4) * 2}px`,
  "--d": `${9 + ((i * 7) % 9)}s`,
  "--delay": `${-((i * 1.3) % 12).toFixed(1)}s`,
  "--drift": `${((i % 5) - 2) * 24}px`,
})) as CSSProperties[];

export default function GiftExchangeApp() {
  useTrackToolUse("gift-exchange");

  const [game, setGame] = useState<GameState>(EMPTY_STATE);
  const [namesText, setNamesText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  /** โหลดเกมค้างมา รอครูเลือก "เล่นต่อ / เริ่มใหม่" */
  const [resumable, setResumable] = useState(false);
  /** หมุนสล็อตเฉพาะตอนครูกดเริ่มในรอบนี้ — กลับมาจากเกมค้างไม่ต้องหมุนซ้ำ */
  const [starterAnimate, setStarterAnimate] = useState(false);
  /** กล่องสุดท้ายเพิ่งเปิด — ยังอยู่บนเวทีจนกว่าจะกด "ดูวงทั้งห้อง" */
  const [finaleIntro, setFinaleIntro] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const fxRef = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(frameRef, styles.fsFallback);
  const { play, startMusic, stopMusic } = useGiftSound(game.soundOn);

  // โหลดหลัง mount เท่านั้น กัน hydration mismatch
  useEffect(() => {
    const t = window.setTimeout(() => {
      const saved = readSaved(browserStorage());
      if (saved) {
        setGame(saved);
        setNamesText(saved.players.map((p) => p.name).join("\n"));
        setResumable(saved.phase !== "setup");
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated) writeSaved(browserStorage(), game);
  }, [game, hydrated]);

  const labels = useMemo(() => playerLabels(game.players), [game.players]);
  const turn = currentTurn(game);

  const cannons = useCallback(() => sideCannons(fxRef.current), []);
  const bigFireworks = useCallback(() => fireworks(fxRef.current, 7), []);

  const handleNamesText = useCallback((text: string) => {
    setNamesText(text);
    setGame((g) => setNames(g, parseNames(text)));
  }, []);

  const handleRoster = useCallback((names: string[]) => {
    setNamesText(names.join("\n"));
    setGame((g) => setNames(g, names));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setGame((g) => {
      const p = g.players.find((x) => x.id === id);
      return p ? setActive(g, id, !p.active) : g;
    });
  }, []);

  const handleStart = () => {
    const next = pickStarter(game, Math.random);
    if (next === game) return;
    if (game.soundOn) startMusic();
    setStarterAnimate(true);
    setGame(next);
  };

  const handleResume = () => {
    setResumable(false);
    if (game.soundOn) startMusic();
  };

  const backToSetup = () => {
    clearFx(fxRef.current);
    stopMusic();
    setFinaleIntro(false);
    setRosterOpen(false);
    setResumable(false);
    setGame((g) => resetGame(g));
  };

  const handleEndGame = () => {
    if (window.confirm("จบเกมนี้แล้วกลับไปหน้าตั้งค่า? ลำดับที่เปิดไปแล้วจะหายไป")) backToSetup();
  };

  const handleOpen = () => {
    const r = openBox(game, Math.random);
    if (!r.receiverId) return;
    setGame(r.state);
    if (r.closesLoop) setFinaleIntro(true);
  };

  const handleRingComplete = useCallback(() => {
    bigFireworks();
    play("celebrate");
  }, [bigFireworks, play]);

  const toggleSound = () => {
    const soundOn = !game.soundOn;
    setGame((g) => ({ ...g, soundOn }));
    // ปิดเสียง: hook หยุดเพลงเองเมื่อ enabled เป็น false
    if (soundOn && game.phase !== "setup" && !resumable) startMusic();
  };

  const screen = resumable ? "setup" : game.phase === "finale" && finaleIntro ? "stage" : game.phase;
  const active = activePlayers(game);
  const remaining = pool(game).length;

  return (
    <div
      ref={frameRef}
      className={`${styles.shell} ${fullscreenClassName}`}
      data-screen={screen}
    >
      <div className={styles.snow} aria-hidden="true">
        {FLAKES.map((style, i) => (
          <span key={i} className={styles.flake} style={style} />
        ))}
      </div>

      <div className={styles.bar}>
        <span className={styles.barTitle}>🎄 จับฉลากแลกของขวัญ</span>
        <div className={styles.barActions}>
          {screen !== "setup" && (
            <button type="button" className={styles.iconBtn} onClick={handleEndGame} aria-label="จบเกม">
              ⏹ <span className={styles.iconBtnLabel}>จบเกม</span>
            </button>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={game.soundOn ? "ปิดเสียง" : "เปิดเสียง"}
            onClick={toggleSound}
          >
            {game.soundOn ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            onClick={toggle}
          >
            ⛶ <span className={styles.iconBtnLabel}>{isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}</span>
          </button>
        </div>
      </div>

      <div ref={fxRef} className={styles.fxLayer} />

      <div className={styles.body}>
        {screen === "setup" && (
          <SetupPanel
            namesText={namesText}
            players={game.players}
            labels={labels}
            activeCount={active.length}
            canStart={hydrated && canStart(game)}
            locked={resumable}
            resume={resumable ? { opened: boxesOpened(game), total: totalBoxes(game) } : null}
            onNamesText={handleNamesText}
            onRoster={handleRoster}
            onToggle={handleToggle}
            onStart={handleStart}
            onResume={handleResume}
            onDiscard={backToSetup}
          />
        )}

        {screen === "starter" && turn && (
          <StarterSpin
            names={active.map((p) => labels[p.id])}
            starterLabel={labels[turn.giverId]}
            animate={starterAnimate}
            play={play}
            onLanded={() => {
              play("fanfare");
              cannons();
            }}
            onContinue={() => setGame((g) => beginStage(g))}
          />
        )}

        {screen === "stage" && turn && (
          <GiftStage
            key={turn.giverId}
            giverLabel={labels[turn.giverId]}
            receiverLabel={turn.receiverId ? labels[turn.receiverId] : null}
            boxOpen={game.boxOpen}
            closesLoop={game.phase === "finale"}
            isLastBox={game.phase === "stage" && !game.boxOpen && remaining === 0}
            paletteIndex={game.chain.indexOf(turn.giverId)}
            remaining={remaining}
            chainLabels={game.chain.map((id) => labels[id])}
            play={play}
            onCannons={cannons}
            onFireworks={bigFireworks}
            onOpen={handleOpen}
            onNext={() => setGame((g) => nextTurn(g))}
            onShowFinale={() => setFinaleIntro(false)}
            rosterButton={
              game.phase === "stage" ? (
                <button type="button" className={styles.iconBtn} onClick={() => setRosterOpen(true)}>
                  👥 <span className={styles.iconBtnLabel}>รายชื่อ</span>
                </button>
              ) : null
            }
          />
        )}

        {screen === "finale" && (
          <FinaleChain
            labels={game.chain.map((id) => labels[id])}
            onComplete={handleRingComplete}
            onRestart={backToSetup}
          />
        )}
      </div>

      {rosterOpen && screen === "stage" && (
        <RosterPanel
          players={game.players}
          labels={labels}
          chainIds={game.chain}
          canToggle={(id) => canToggle(game, id)}
          onToggle={handleToggle}
          onAdd={(name) => setGame((g) => addPlayer(g, name))}
          onClose={() => setRosterOpen(false)}
        />
      )}
    </div>
  );
}
```

หมายเหตุ `paletteIndex` ใช้ตำแหน่งของผู้ให้ในโซ่ ไม่ใช่ `chain.length` เพราะ chain ยาวขึ้นทันทีที่กดกล่อง ซึ่งจะทำให้สีกล่องเปลี่ยนกลางฉาก ส่วนตำแหน่งผู้ให้คงที่ตลอดตาและไม่เปลี่ยนหลังรีเฟรช

- [ ] **Step 2: เขียน `page.tsx`**

โครงตาม `app/mystery-board/page.tsx` ทุกส่วน (breadcrumb, header, app, วิธีใช้, ใช้ทำอะไรได้บ้าง, FAQ, เครื่องมือที่ใช้คู่กัน):

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import GiftExchangeApp from "./GiftExchangeApp";

const TITLE = "จับฉลากแลกของขวัญออนไลน์ ไม่ได้ชื่อตัวเอง ใช้ฟรี | khuncool";
const DESCRIPTION =
  "เครื่องมือจับฉลากแลกของขวัญปีใหม่สำหรับห้องเรียน ฉายขึ้นจอให้นักเรียนออกมาเปิดกล่องของขวัญทีละคนต่อกันเป็นห่วงโซ่ ไม่มีใครได้ชื่อตัวเอง มีแอนิเมชันและเสียงประกอบ ใช้ฟรี ไม่ต้องติดตั้ง";
const URL = "https://www.khuncool.com/gift-exchange";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "จับฉลากแลกของขวัญ",
    "จับฉลากออนไลน์",
    "แลกของขวัญปีใหม่",
    "secret santa",
    "กิจกรรมปีใหม่ในห้องเรียน",
    "เครื่องมือครู",
  ],
  alternates: { canonical: URL },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: URL, locale: "th_TH" },
  twitter: { card: "summary_large_image" },
};

const HOWTO_STEPS = [
  {
    name: "ใส่รายชื่อนักเรียน",
    text: "วางรายชื่อบรรทัดละคน หรือกดปุ่มห้องเรียนเพื่อดึงรายชื่อที่บันทึกไว้ แล้วแตะชื่อคนที่ขาดเรียนออก",
  },
  {
    name: "สุ่มคนเริ่ม",
    text: "กดเริ่มจับฉลาก ชื่อจะวิ่งแบบสล็อตแล้วหยุดที่คนแรกที่ได้ออกมาเปิดกล่อง",
  },
  {
    name: "เปิดกล่องทีละคน",
    text: "ให้คนที่ถึงตาแตะกล่องของขวัญบนจอ กล่องจะระเบิดเผยชื่อเพื่อนที่ต้องมอบของให้ แล้วเพื่อนคนนั้นออกมาเปิดกล่องเป็นคนถัดไป",
  },
  {
    name: "ปิดวง",
    text: "กล่องใบสุดท้ายจะวนกลับมาที่คนแรก ทุกคนได้ให้และได้รับของครบ แล้วจอจะแสดงวงโซ่ของทั้งห้อง",
  },
];

const FAQS = [
  {
    q: "จะมีใครจับได้ชื่อตัวเองไหม",
    a: "ไม่มี ระบบสุ่มจากคนที่ยังไม่ได้รับของเท่านั้น และกล่องสุดท้ายจะวนกลับไปหาคนแรกเสมอ ทุกคนจึงได้ให้หนึ่งครั้งและได้รับหนึ่งครั้งพอดี",
  },
  {
    q: "ถ้าปิดหน้าเว็บกลางคันจะเป็นอย่างไร",
    a: "ระบบบันทึกความคืบหน้าไว้ในเบราว์เซอร์ทุกครั้งที่เปิดกล่อง เปิดหน้าใหม่จะมีปุ่มให้เล่นต่อจากเดิม และชื่อที่เปิดไปแล้วจะไม่ถูกสุ่มใหม่",
  },
  {
    q: "มีนักเรียนขาดหรือมาสายระหว่างเล่นทำอย่างไร",
    a: "กดปุ่มรายชื่อระหว่างเล่นเพื่อติ๊กคนขาดออกหรือเพิ่มชื่อคนมาสายได้ ตราบใดที่ยังไม่มีใครจับได้ชื่อคนนั้น",
  },
  {
    q: "ต้องมีนักเรียนอย่างน้อยกี่คน",
    a: "อย่างน้อย 3 คน และใช้ได้กับห้องใหญ่ถึง 50 คน",
  },
  {
    q: "ใช้ฟรีไหม ต้องสมัครหรือเปล่า",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครและไม่ต้องติดตั้ง เปิดผ่านเบราว์เซอร์แล้วฉายขึ้นจอหน้าห้องได้ทันที",
  },
];

const USE_CASES = [
  { icon: "🎄", head: "แลกของขวัญปีใหม่", body: "เปลี่ยนการจับฉลากกระดาษที่วุ่นวายให้เป็นการแสดงที่ทั้งห้องได้ลุ้นไปด้วยกัน" },
  { icon: "🎂", head: "งานเลี้ยงสิ้นปีของครู", body: "ใช้กับวงครูในโรงเรียนหรือกลุ่มเพื่อนได้เหมือนกัน แค่ใส่รายชื่อแล้วฉายขึ้นจอ" },
  { icon: "🔗", head: "ไม่ต้องคอยเรียกลำดับ", body: "คนที่ได้รับของคือคนถัดไปที่ออกมาเปิดกล่อง ห้องเดินต่อเองจนครบวง" },
  { icon: "📺", head: "ฉายขึ้นจอโปรเจกเตอร์", body: "ชื่อตัวใหญ่ อ่านได้จากหลังห้อง กดเต็มจอได้ทั้งบนคอมและแท็บเล็ต" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "จับฉลากแลกของขวัญ Khuncool",
      url: URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "เครื่องมือจับฉลากแลกของขวัญแบบห่วงโซ่สำหรับห้องเรียน ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "HowTo",
      name: "วิธีจับฉลากแลกของขวัญด้วย Khuncool",
      description: "ขั้นตอนการจับฉลากแลกของขวัญในห้องเรียน ตั้งแต่ใส่รายชื่อจนปิดวง",
      inLanguage: "th",
      step: HOWTO_STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
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

export default function GiftExchangePage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

ส่วน JSX ที่เหลือ (breadcrumb ถึง related) **คัดลอกจาก `app/mystery-board/page.tsx` บรรทัดที่เริ่มด้วย `{/* Breadcrumb */}` จนจบไฟล์** แล้วแก้เฉพาะจุดเหล่านี้:

| จุด | mystery-board | gift-exchange |
|---|---|---|
| breadcrumb หน้าปัจจุบัน | `กระดานป้ายปริศนา` | `จับฉลากแลกของขวัญ` |
| `<h1>` | `กระดานป้ายปริศนา` | `จับฉลากแลกของขวัญ` |
| คำโปรยมือถือ (`md:hidden`) | … | `เปิดกล่องของขวัญทีละคนต่อกันเป็นห่วงโซ่ ไม่มีใครได้ชื่อตัวเอง ใช้ฟรี` |
| คำโปรยเดสก์ท็อป (`hidden md:inline`) | … | `ฉายขึ้นจอให้นักเรียนออกมาเปิดกล่องของขวัญทีละคน ใครเปิดได้ชื่อใครก็มอบของให้คนนั้น แล้วคนนั้นออกมาเปิดต่อ จนวนกลับมาที่คนแรก ไม่มีใครได้ชื่อตัวเอง` |
| คอมเมนต์ + component | `{/* Mystery board app */}` `<MysteryBoardApp />` | `{/* Gift exchange app */}` `<GiftExchangeApp />` |
| ลิงก์ใน "เครื่องมือที่ใช้คู่กันได้" | scoreboard / wheel / question / tools | ลิงก์แรก (สีเน้น) `/classrooms` "🏫 ห้องเรียนของฉัน", แล้ว `/random-name-picker` "🎡 วงล้อสุ่มชื่อนักเรียน", `/duck-race` "🦆 เกมแข่งเป็ดสุ่มชื่อ", `/tools` "🧰 เครื่องมือทั้งหมด" |

ชื่อฟังก์ชัน export เป็น `GiftExchangePage` (มีอยู่แล้วในส่วนบน)

- [ ] **Step 3: Typecheck + lint + เทสต์**

Run: `npx tsc --noEmit` แล้ว `npx eslint app/gift-exchange` แล้ว `npm test`
Expected: ไม่มี error, เทสต์ผ่าน

- [ ] **Step 4: เล่นจริงในเบราว์เซอร์**

เปิด dev server ด้วย preview tool: `preview_start` name `khuncool-dev` แล้วไปที่ `/gift-exchange` ตรวจตามลำดับ:

1. ไม่มี error ใน console ตอนโหลด (`read_console_messages` onlyErrors)
2. วางชื่อ `ต้น\nฝน\nบี\nต้น\nแพร` → ชิปแสดง "ต้น (2)"; ปุ่มเริ่มกดได้; ติ๊ก 3 คนเป็นขาด → ปุ่มเริ่มปิดพร้อมข้อความ "ต้องมีคนมาอย่างน้อย 3 คน" แล้วติ๊กกลับ
3. กดเริ่ม → สล็อตหมุน ~3 วินาที หยุดพร้อมคอนเฟตตี → "ไปที่กล่องของขวัญ"
4. แตะกล่อง → กล่องสั่นแรงขึ้น จอมืด แสงรั่ว (~2s) → แฟลช ฝาพุ่ง คอนเฟตตีสองฝั่ง → ชื่อสีทองเด้งขึ้น ดาวกระจาย → "X 🎁 → Y" → ปุ่ม "ต่อไป"; ระหว่างลุ้นแถบโซ่ยังไม่เฉลยชื่อ; กดกล่องรัวๆ ระหว่างลุ้นแล้วเผยแค่คนเดียว
5. เล่นต่อจนกล่องสุดท้าย → หัวข้อขึ้น "🌟 กล่องสุดท้าย!" กล่องสีทอง ลุ้นนานขึ้น ดอกไม้ไฟ → "ดูวงทั้งห้อง" → วงโซ่วาดไล่ทีละเส้น ดอกไม้ไฟ → "เริ่มใหม่ (รายชื่อเดิม)" กลับจอตั้งค่าโดยรายชื่อยังอยู่
6. รีเฟรชกลางเกม (หลังเปิดกล่องที่ 2 ก่อนกด "ต่อไป") → แบนเนอร์ "มีเกมค้างอยู่ (เปิดไปแล้ว 2/5)" → "เล่นต่อ" → จอเวทีแสดงชื่อที่เผยแล้วเดิม ไม่เล่นแอนิเมชันซ้ำ
7. รีเฟรช **ระหว่างกล่องสั่น** (กดกล่องแล้วรีเฟรชภายใน 1 วินาที) → เล่นต่อ → ชื่อที่ได้ตรงกับใน localStorage (`JSON.parse(localStorage["khuncool.giftexchange"]).chain.at(-1)`)
8. ระหว่างเล่น เปิด 👥 → ติ๊กคนที่ยังไม่ถูกจับออก, เพิ่ม "มาสาย" → คนที่ 🔒 กดไม่ได้; Escape ปิดแผง
9. `resize_window` mobile (375×812) → ไม่มี scroll แนวนอน, กล่องและชื่อพอดีจอ; desktop 1920×1080 + กดเต็มจอ → กล่องใหญ่ขึ้น ไม่ล้นจอ
10. Reduced motion: preview tool emulate `prefers-reduced-motion` ไม่ได้ ให้ตรวจด้วยการอ่านโค้ดแทนว่าทุกบล็อกแอนิเมชันใน CSS มีกฎใน `@media (prefers-reduced-motion: reduce)` และ `GiftStage`/`StarterSpin`/`fx.ts` เช็ก `reducedMotion()` — รายงานว่าข้อนี้ตรวจจากโค้ด ไม่ได้ดูของจริง
11. ห้อง 40 คน (วางชื่อ `คน1`…`คน40`) เล่นจนจบได้ วงโซ่ตัวอักษรไม่ซ้อนจนอ่านไม่ออก (ถ้าซ้อน ลด `fontSizeFor` ช่วง 31–40 ลง)

แก้ปัญหาที่เจอแล้ววนตรวจซ้ำ ถ่าย screenshot ฉากเผยชื่อและวงโซ่ไว้แนบรายงาน

- [ ] **Step 5: Commit**

```bash
git add app/gift-exchange/GiftExchangeApp.tsx app/gift-exchange/page.tsx
git commit -m "feat(gift-exchange): add the gift exchange page"
```

---

### Task 8: ภาพปก + ลงทะเบียนในหน้า /tools

**Files:**
- Create: `scripts/make-gift-exchange-cover.mjs`
- Create: `public/assets/tool-covers/gift-exchange.webp`
- Modify: `app/tools/data.ts` (`TOOLS` ต่อจาก entry `/mystery-board`, `CASES` ต่อจาก entry `/mystery-board`)

**Interfaces:**
- Consumes: `sharp` (มีใน `node_modules` แล้วผ่าน Next.js)
- Produces: การ์ดบนหน้า `/tools` และ URL ใน sitemap (`app/sitemap.ts` สร้างจาก `TOOLS` เอง)

ภาพปกอื่นในโฟลเดอร์เป็นภาพ 960×540 สไตล์ 3D นุ่มๆ พื้นพาสเทล ภาพนี้วาดเป็น vector (SVG → webp) ให้โทนสีและองค์ประกอบใกล้เคียง (พื้นสว่าง ของชิ้นใหญ่ตรงกลาง ดาว/ประกายรอบๆ ไม่มีตัวหนังสือในภาพ) — แจ้งเจ้าของโปรเจกต์ว่าเปลี่ยนเป็นภาพ render ทีหลังได้โดยแทนไฟล์เดียว

- [ ] **Step 1: เขียนสคริปต์สร้างภาพ**

```js
// สร้างภาพปก /gift-exchange (960×540 webp) จาก SVG ด้วย sharp
// รัน: node scripts/make-gift-exchange-cover.mjs
import sharp from "sharp";

const W = 960;
const H = 540;

function gift({ x, y, s, box, dark, ribbon, ribbonDark, lidLift = 0, tilt = 0 }) {
  return `
  <g transform="translate(${x} ${y}) rotate(${tilt}) scale(${s})">
    <ellipse cx="0" cy="118" rx="88" ry="10" fill="#4c1d95" opacity=".14"/>
    <rect x="-80" y="0" width="160" height="112" rx="12" fill="url(#g_${box.slice(1)})"/>
    <rect x="-80" y="0" width="160" height="14" fill="#000" opacity=".14"/>
    <rect x="-12" y="0" width="24" height="112" fill="${ribbon}"/>
    <rect x="-12" y="0" width="7" height="112" fill="${ribbonDark}" opacity=".35"/>
    <rect x="-70" y="10" width="26" height="92" rx="10" fill="#fff" opacity=".18"/>
    <g transform="translate(0 ${-lidLift}) rotate(${lidLift ? -8 : 0})">
      <rect x="-90" y="-26" width="180" height="32" rx="9" fill="${box}"/>
      <rect x="-90" y="-26" width="180" height="9" rx="4" fill="#fff" opacity=".28"/>
      <rect x="-14" y="-26" width="28" height="32" fill="${ribbon}"/>
      <path d="M0 -28 C -22 -66, -62 -62, -50 -36 C -43 -20, -16 -24, 0 -28 Z" fill="${ribbon}" stroke="${ribbonDark}" stroke-width="3"/>
      <path d="M0 -28 C 22 -66, 62 -62, 50 -36 C 43 -20, 16 -24, 0 -28 Z" fill="${ribbon}" stroke="${ribbonDark}" stroke-width="3"/>
      <rect x="-11" y="-40" width="22" height="22" rx="7" fill="${ribbon}" stroke="${ribbonDark}" stroke-width="3"/>
    </g>
  </g>`;
}

function star(x, y, r, color, rot = 0) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${color}" stroke="#fff" stroke-width="3" stroke-linejoin="round" transform="rotate(${rot} ${x} ${y})"/>`;
}

const boxColors = [
  ["#ef4444", "#b91c1c"],
  ["#22c55e", "#15803d"],
  ["#3b82f6", "#1d4ed8"],
];

const confetti = Array.from({ length: 34 }, (_, i) => {
  const x = (i * 197) % W;
  const y = 30 + ((i * 113) % 470);
  const c = ["#fbbf24", "#f97316", "#22c55e", "#3b82f6", "#ec4899", "#a78bfa"][i % 6];
  return `<rect x="${x}" y="${y}" width="14" height="7" rx="2" fill="${c}" opacity=".85" transform="rotate(${(i * 47) % 180} ${x} ${y})"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff1e6"/><stop offset="1" stop-color="#fde2ef"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".55" r=".5">
      <stop offset="0" stop-color="#fff7d6"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/>
    </radialGradient>
    ${boxColors
      .map(
        ([c, d]) => `<linearGradient id="g_${c.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient>`,
      )
      .join("")}
    <linearGradient id="g_fbbf24" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#d97706"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity=".5">${Array.from({ length: 16 }, (_, i) => `<path d="M480 300 L${480 + 900 * Math.cos((i / 16) * Math.PI * 2)} ${300 + 900 * Math.sin((i / 16) * Math.PI * 2)} L${480 + 900 * Math.cos(((i + 0.45) / 16) * Math.PI * 2)} ${300 + 900 * Math.sin(((i + 0.45) / 16) * Math.PI * 2)} Z" fill="#fff"/>`).join("")}</g>
  <circle cx="480" cy="300" r="300" fill="url(#glow)"/>
  ${confetti}
  <path d="M 230 400 C 300 520, 660 520, 730 400" fill="none" stroke="#a78bfa" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>
  <path d="M 730 230 C 660 110, 300 110, 230 230" fill="none" stroke="#a78bfa" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>
  <polygon points="728,404 744,384 716,384" fill="#a78bfa"/>
  <polygon points="232,226 216,246 244,246" fill="#a78bfa"/>
  ${gift({ x: 205, y: 300, s: 0.78, box: "#22c55e", dark: "#15803d", ribbon: "#fecaca", ribbonDark: "#dc2626", tilt: -8 })}
  ${gift({ x: 755, y: 300, s: 0.78, box: "#3b82f6", dark: "#1d4ed8", ribbon: "#f1f5f9", ribbonDark: "#94a3b8", tilt: 8 })}
  ${gift({ x: 480, y: 250, s: 1.45, box: "#ef4444", dark: "#b91c1c", ribbon: "#fde68a", ribbonDark: "#d97706", lidLift: 30 })}
  <ellipse cx="480" cy="232" rx="110" ry="26" fill="#fff7c2" opacity=".9"/>
  ${star(480, 120, 34, "#fbbf24", 0)}
  ${star(370, 160, 18, "#f472b6", -15)}
  ${star(600, 150, 22, "#38bdf8", 12)}
  ${star(110, 120, 20, "#fbbf24", 10)}
  ${star(860, 110, 24, "#fbbf24", -8)}
  ${star(880, 440, 16, "#a78bfa", 20)}
  ${star(80, 450, 18, "#34d399", -12)}
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile("public/assets/tool-covers/gift-exchange.webp");
console.log("wrote public/assets/tool-covers/gift-exchange.webp");
```

- [ ] **Step 2: สร้างภาพแล้วดูผล**

Run: `node scripts/make-gift-exchange-cover.mjs`
Expected: `wrote public/assets/tool-covers/gift-exchange.webp`

แปลงเป็น PNG ในโฟลเดอร์ scratchpad แล้วเปิดดูด้วย Read tool:
`node -e "require('sharp')('public/assets/tool-covers/gift-exchange.webp').png().toFile(process.argv[1])" <scratchpad>/gift-cover.png`

ตรวจ: ขนาด 960×540, กล่องแดงตรงกลางเด่นที่สุด, ไม่มีอะไรหลุดขอบ, โทนเข้ากับปกอื่น (เปิด `mystery-board.webp` เทียบ) ถ้าไม่สวยปรับตำแหน่ง/ขนาดในสคริปต์แล้วรันซ้ำ

- [ ] **Step 3: ลงทะเบียนใน `TOOLS` และ `CASES`**

ใน `app/tools/data.ts` แทรกใน `TOOLS` ต่อจาก entry `/mystery-board`:

```ts
  {
    icon: "🎄",
    title: "จับฉลากแลกของขวัญ",
    href: "/gift-exchange",
    bg: "#FFE4E6",
    image: "/assets/tool-covers/gift-exchange.webp",
    short: "เปิดกล่องทีละคนต่อเป็นห่วงโซ่",
    desc: "ให้นักเรียนออกมาเปิดกล่องของขวัญบนจอทีละคน ใครได้ชื่อใครก็มอบของให้คนนั้นแล้วส่งตาต่อ ไม่มีใครได้ชื่อตัวเอง",
  },
```

และใน `CASES` ต่อจาก entry `/mystery-board`:

```ts
  {
    q: "จะจับฉลากแลกของขวัญปีใหม่ ไม่ให้ใครได้ชื่อตัวเอง",
    a: "จับฉลากแลกของขวัญ",
    href: "/gift-exchange",
  },
```

- [ ] **Step 4: ตรวจหน้า /tools และ sitemap**

ใน preview: ไปที่ `/tools` → การ์ด "จับฉลากแลกของขวัญ" แสดงภาพปก ไม่แตก คลิกแล้วไป `/gift-exchange`; ไปที่ `/sitemap.xml` → มี `https://www.khuncool.com/gift-exchange`

Run: `npx tsc --noEmit` แล้ว `npm run lint`
Expected: ไม่มี error ใหม่

- [ ] **Step 5: Commit**

```bash
git add scripts/make-gift-exchange-cover.mjs public/assets/tool-covers/gift-exchange.webp app/tools/data.ts
git commit -m "feat(tools): list the gift exchange draw on the tools hub"
```

---

### Task 9: ตรวจรอบสุดท้าย

**Files:** — (แก้เฉพาะที่เจอปัญหา)

- [ ] **Step 1: เทสต์ + lint + build**

Run: `npm test` → PASS
Run: `npm run lint` → ไม่มี error ใหม่ในไฟล์ที่แตะ
Run: `npm run build` → build ผ่าน, route `/gift-exchange` เป็น static (○)

- [ ] **Step 2: ไล่ spec ทีละข้อเทียบกับของจริง**

เปิด `docs/superpowers/specs/2026-10-13-gift-exchange-design.md` ไล่ข้อ 2 (flow ทุกจอ), ข้อ 3 (ลำดับเวลา ฉากพิเศษ เสียง การเข้าถึง), ข้อ 6 (กรณีขอบ) แล้วเช็กใน preview ทีละข้อ จดข้อที่ไม่ตรงและแก้

- [ ] **Step 3: Commit การแก้ (ถ้ามี)**

```bash
git add -A app/gift-exchange
git commit -m "fix(gift-exchange): <สิ่งที่แก้>"
```
