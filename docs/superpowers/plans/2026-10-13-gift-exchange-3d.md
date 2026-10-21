# ฉากเปิดกล่อง 3D (/gift-exchange) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนกล่อง SVG บนจอเวทีของ `/gift-exchange` เป็นฉาก Three.js ที่มีกล่องผิวมันวาว กล้องดอลลี่เข้าแล้วเชิดขึ้น ฝาพุ่งหลุด ดาวทองและคอนเฟตตี 3D พร้อมถอยกลับเป็น SVG อัตโนมัติบนเครื่องที่ไม่ไหว

**Architecture:** ท่ากล้อง/กล่อง/แสงทั้งหมดเป็น pure function ใน `choreography.ts` (Vitest), การเลือกโหมดใน `renderMode.ts` (Vitest), การจำลองอนุภาคใน `particles.ts` (Vitest) ส่วน `giftScene.ts` เป็น controller แบบ imperative ที่ถือ WebGL renderer ตัวเดียว (ไม่ใช่ React component) — `useGiftScene` ใน App สร้าง/ทำลาย controller ตามจอ และ `SceneHost` ใน `GiftStage` ย้าย canvas ตัวเดิมเข้ามาวางในแต่ละตา จึงมี WebGL context เดียวไม่ว่าจะกี่ตา

**Tech Stack:** Next.js 16, React 19, TypeScript, three@0.185.1 (มีใน `package.json` แล้ว), Vitest 4

**Spec:** `docs/superpowers/specs/2026-10-13-gift-exchange-3d-design.md` (ต่อยอด `docs/superpowers/specs/2026-10-13-gift-exchange-design.md`)

## Global Constraints

- ไม่เพิ่ม dependency — ใช้ `three` ที่มีอยู่ และ addon จาก `three/examples/jsm/...` (มี type ใน `@types/three` แล้ว)
- three.js ต้องอยู่ใน chunk ที่โหลดเฉพาะ `/gift-exchange` — import `three` ได้เฉพาะใน `three/giftScene.ts` และ `three/giftModel.ts` ที่ถูกโหลดผ่าน `import()` เท่านั้น ไฟล์อื่นใช้ `import type` อย่างเดียว
- สัญญาเวลาเดิมห้ามเปลี่ยน: ลุ้น 2000 / กล่องสุดท้าย 3000 / reduced motion 500 ms, ระเบิด → เผยชื่อ 200 ms (`GiftStage.tsx` ยังเป็นเจ้าของ timer และ state `anim`)
- ป้ายชื่อ ข้อความ ปุ่ม แถบโซ่ ยังเป็น HTML เดิม
- localStorage key โหมดภาพ: `khuncool.giftexchange.render` ค่า `"3d-high" | "3d-low" | "2d"` ต่อท้าย `":manual"` ได้ถ้าครูเลือกเอง
- ESLint เปิดกฎ React Compiler (`react-hooks/set-state-in-effect`, `react-hooks/refs`): ห้าม setState ตรงๆ ใน body ของ effect (ใน callback ของ promise/timer ได้) ห้ามเขียน `ref.current` ระหว่าง render
- ข้อความบนจอเป็นภาษาไทย
- `vitest.config.ts` include `app/gift-exchange/**/*.test.ts` อยู่แล้ว เทสต์ใน `app/gift-exchange/three/` รันได้ทันที

## Review Focus

1. **ห้อง 40 คน** — เล่นครบ 40 ตาแล้วหน่วยความจำ GPU ต้องไม่โตตามจำนวนตา และไม่มี WebGL context ใหม่ต่อตา (Task 6 Step 2 ตรวจ `renderer.info` และจำนวน canvas)
2. **สลับ 2D/3D กลางตา** — ครูกดปุ่ม "✨" ระหว่างกล่องกำลังสั่น: ต้องไม่ error ภาพเปลี่ยนเป็น SVG ที่ state เดียวกัน และเกมเดินต่อ (Task 5 Step 6)
3. **รีเฟรชตอนกล่องเปิดแล้ว** — กลับมาต้องเห็นกล่องเปิด ไม่มีฝา ไม่มีระเบิดซ้ำ (Task 1 เทสต์ `settled` ไม่มีฝา + Task 5 Step 6 ตรวจในเบราว์เซอร์)
4. **GPU รีเซ็ตกลางการลุ้น (context lost)** — ต้องสลับเป็น 2D ทันที เกมไม่หาย ไม่มี error ค้าง (Task 6 Step 3)
5. **โหมด `3d-low`** — เครื่องอ่อนต้องได้ภาพที่ไม่มีเงา/แสงฟุ้ง คอนเฟตตี 60 ชิ้น และไม่ error (Task 3 เทสต์จำนวน + Task 6 Step 4 บังคับ `3d-low`)

## ปรับจาก spec

- **canvas ย้ายเข้าแต่ละตา แทน layer แยกที่ App + `onAnimChange`** — controller (`giftScene.ts`) ถูกสร้างครั้งเดียวต่อช่วงที่อยู่บนเวทีโดย `useGiftScene` ใน App แล้ว `SceneHost` ใน `GiftStage` แต่ละตา `appendChild` canvas ตัวเดิมเข้า `.boxArea` ได้การันตี "context เดียว" เท่าเดิม แต่ canvas อยู่ตรงตำแหน่งกล่องพอดีโดยไม่ต้องวัดพิกัดข้าม component และ `GiftStage` สั่ง `setAnim` ตรงๆ ไม่ต้องยก state `anim` ขึ้น App
- **ไม่ใช้ `EffectComposer` + `UnrealBloomPass`** — canvas ต้องโปร่งใส (`alpha: true`) ให้พื้นหลัง CSS + หิมะเดิมเห็นทะลุ แต่ bloom pass ผสมผลกับพื้นที่โปร่งใสได้ไม่แน่นอน (แสงฟุ้งอาจหายหรือเป็นขอบดำ) จึงทำ "แสงฟุ้ง" ด้วย sprite/plane แบบ `AdditiveBlending` บน canvas `premultipliedAlpha` (ค่าเริ่มต้น) ซึ่งเบราว์เซอร์ผสมเป็นแสงบวกทับพื้นหลังได้ถูกต้อง และเบากว่าบนเครื่องโรงเรียน — ค่า `bloom` ใน `Pose` คุมความแรงของ halo แทน
- `initialMode` ไม่รับ `reducedMotion` (spec เองบอกว่าไม่มีผลต่อโหมด)
- `Pose.lid` มี `opacity` เพิ่ม (ใช้ตอน reduced motion ที่ฝาค่อยๆ จางหาย)
- reduced motion ท่า ⑥: เปลี่ยนสีกล่องทันทีที่ 300ms โดยไม่เลื่อน (แทน crossfade ซึ่งต้องมีกล่องสองใบ)
- `onFrameStats` ส่งเป็น array ของ ms ต่อเฟรม (ให้ `judgeFrames` คำนวณ median เอง)

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `app/gift-exchange/three/choreography.ts` | pure: `poseAt(phase, tMs, opts)` + ค่าคงที่ของฉาก |
| `app/gift-exchange/three/choreography.test.ts` | Vitest |
| `app/gift-exchange/three/renderMode.ts` | pure: ตัดสินโหมด + อ่าน/เขียน localStorage |
| `app/gift-exchange/three/renderMode.test.ts` | Vitest |
| `app/gift-exchange/three/particles.ts` | pure: สร้าง/จำลองดาวและคอนเฟตตี |
| `app/gift-exchange/three/particles.test.ts` | Vitest |
| `app/gift-exchange/three/giftModel.ts` | three: โมเดลกล่อง ฝา ริบบิ้น โบว์ แสงในกล่อง |
| `app/gift-exchange/three/giftScene.ts` | three: renderer, แสง, อนุภาค, ลูป rAF, controller API |
| `app/gift-exchange/three/useGiftScene.ts` | React hook: เลือกโหมด, โหลด/สร้าง/ทำลาย controller |
| `app/gift-exchange/three/SceneHost.tsx` | React: ย้าย canvas เข้า DOM + ResizeObserver |
| `app/gift-exchange/GiftStage.tsx` | แก้: รับ `scene`/`turnKey`, สั่ง controller, ซ่อน SVG ในโหมด 3D |
| `app/gift-exchange/GiftExchangeApp.tsx` | แก้: เรียก `useGiftScene`, ปุ่ม "✨ 3D/2D" |
| `app/gift-exchange/GiftExchange.module.css` | แก้: `.sceneHost` |

---

### Task 1: choreography — ท่ากล้อง กล่อง ฝา แสง

**Files:**
- Create: `app/gift-exchange/three/choreography.ts`
- Test: `app/gift-exchange/three/choreography.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  ```ts
  type ScenePhase = "idle" | "charging" | "burst" | "reveal" | "settled" | "swap";
  type Vec3 = [number, number, number];
  type LidPose = { pos: Vec3; rot: Vec3; visible: boolean; opacity: number };
  type Pose = { camPos: Vec3; camTarget: Vec3; fov: number; shake: number; boxScale: Vec3; boxTilt: number; boxY: number; lid: LidPose; seamGlow: number; innerLight: number; beam: number; bloom: number; dim: number };
  type PoseOptions = { chargeMs: number; isGold: boolean; reducedMotion: boolean; orbitMs: number };
  poseAt(phase: ScenePhase, tMs: number, opts: PoseOptions): Pose
  // "burst" และ "reveal": tMs = ms นับจากเริ่มระเบิด (0..1700+); ช่วงอื่น: ms นับจากเข้าช่วง
  const BURST_MS = 200, REVEAL_MS = 1500, AFTER_BURST_END_MS = 1700, SWAP_MS = 800, SWAP_SINK_MS = 300;
  const LID_REST_Y = 1.42; // ความสูงจุดกึ่งกลางฝาตอนปิด — giftModel ใช้ค่าเดียวกัน
  const MOUTH_Y = 1.3;     // ความสูงปากกล่อง — particles ใช้เป็นจุดเกิด
  ```

- [ ] **Step 1: เขียนเทสต์ที่ fail**

สร้าง `app/gift-exchange/three/choreography.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  AFTER_BURST_END_MS,
  BURST_MS,
  LID_REST_Y,
  SWAP_MS,
  poseAt,
  type Pose,
  type PoseOptions,
  type ScenePhase,
} from "./choreography";

const base: PoseOptions = { chargeMs: 2000, isGold: false, reducedMotion: false, orbitMs: 3000 };

function camera(p: Pose): number[] {
  return [...p.camPos, ...p.camTarget, p.fov];
}

function expectClose(a: number[], b: number[], eps = 1e-6) {
  expect(a).toHaveLength(b.length);
  a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(eps));
}

/** ระยะกล้องจากแกนกลางกล่องในแนวนอน */
function horizontalDist(p: Pose): number {
  return Math.hypot(p.camPos[0], p.camPos[2]);
}

describe("ความต่อเนื่องของกล้องที่รอยต่อทุกช่วง", () => {
  it("รอ → ลุ้น", () => {
    expectClose(camera(poseAt("idle", 5000, base)), camera(poseAt("charging", 0, base)));
  });

  it("ลุ้น → ระเบิด (ทั้งปกติและกล่องทอง)", () => {
    expectClose(camera(poseAt("charging", 2000, base)), camera(poseAt("burst", 0, base)));
    const gold = { ...base, isGold: true, chargeMs: 3000 };
    expectClose(camera(poseAt("charging", 3000, gold)), camera(poseAt("burst", 0, gold)));
  });

  it("ระเบิด → เผยชื่อ", () => {
    expectClose(camera(poseAt("burst", BURST_MS, base)), camera(poseAt("reveal", BURST_MS, base)));
  });

  it("เผยชื่อ → ค้างฉาก", () => {
    expectClose(camera(poseAt("reveal", AFTER_BURST_END_MS, base)), camera(poseAt("settled", 0, base)));
  });

  it("ค้างฉาก → เปลี่ยนตา → รอ", () => {
    expectClose(camera(poseAt("settled", 4000, base)), camera(poseAt("swap", 0, base)));
    expectClose(camera(poseAt("swap", SWAP_MS, base)), camera(poseAt("idle", 0, base)));
  });
});

describe("กล้องดอลลี่และกระตุก", () => {
  it("ปลายช่วงลุ้น ระยะกล้อง 4.3 (กล่องทอง 3.8)", () => {
    expect(horizontalDist(poseAt("charging", 2000, base))).toBeCloseTo(4.3, 6);
    const gold = { ...base, isGold: true, chargeMs: 3000 };
    expect(horizontalDist(poseAt("charging", 3000, gold))).toBeCloseTo(3.8, 6);
  });

  it("ระเบิดที่ 120ms กล้องถอยออกไปอีก 0.45", () => {
    expect(horizontalDist(poseAt("burst", 120, base))).toBeCloseTo(4.3 + 0.45, 6);
  });

  it("ช่วงเผยชื่อกล้องเชิดขึ้น: จุดมองสูงขึ้นจาก 0.9 ไป 2.4", () => {
    expect(poseAt("burst", 0, base).camTarget[1]).toBeCloseTo(0.9, 6);
    expect(poseAt("reveal", AFTER_BURST_END_MS, base).camTarget[1]).toBeCloseTo(2.4, 6);
  });

  it("สั่นแรงขึ้นตลอดช่วงลุ้น", () => {
    const s = [0, 500, 1000, 1500, 2000].map((t) => poseAt("charging", t, base).shake);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1]);
    expect(s[0]).toBe(0);
  });
});

describe("ฝา", () => {
  it("อยู่บนกล่องตลอดช่วงรอและลุ้น", () => {
    for (const [phase, t] of [["idle", 0], ["charging", 0], ["charging", 1000], ["charging", 2000]] as const) {
      const lid = poseAt(phase, t, base).lid;
      expect(lid.visible).toBe(true);
      expectClose(lid.pos, [0, LID_REST_Y, 0]);
    }
  });

  it("เริ่มพุ่งตั้งแต่ระเบิด และขึ้นสูงกว่าตำแหน่งปิด", () => {
    expectClose(poseAt("burst", 0, base).lid.pos, [0, LID_REST_Y, 0]);
    expect(poseAt("burst", 100, base).lid.pos[1]).toBeGreaterThan(LID_REST_Y);
    expect(poseAt("burst", 100, base).lid.pos[0]).toBeLessThan(0);
  });

  it("ค้างฉาก (รวมกรณีกลับจากเกมค้าง) ไม่มีฝา", () => {
    expect(poseAt("settled", 0, base).lid.visible).toBe(false);
    expect(poseAt("settled", 9000, base).lid.visible).toBe(false);
  });

  it("เปลี่ยนตา: ฝาหายตอนกล่องเก่าจม แล้วกลับมาที่เดิมตอนกล่องใหม่หล่น", () => {
    expect(poseAt("swap", 100, base).lid.visible).toBe(false);
    expect(poseAt("swap", 500, base).lid.visible).toBe(true);
    expect(poseAt("swap", SWAP_MS, base).boxY).toBeCloseTo(0, 6);
    expect(poseAt("swap", 200, base).boxY).toBeLessThan(0);
  });
});

describe("reduced motion", () => {
  const rm = { ...base, reducedMotion: true };
  const samples: [ScenePhase, number][] = [
    ["idle", 0], ["idle", 7000], ["charging", 0], ["charging", 250], ["charging", 500],
    ["burst", 0], ["burst", 120], ["reveal", 900], ["reveal", 1700], ["settled", 3000],
    ["swap", 0], ["swap", 400], ["swap", 800],
  ];

  it("กล้องนิ่งทุกช่วงทุกเวลา และไม่สั่น", () => {
    const first = camera(poseAt("idle", 0, rm));
    for (const [phase, t] of samples) {
      const p = poseAt(phase, t, { ...rm, orbitMs: t * 3 });
      expectClose(camera(p), first);
      expect(p.shake).toBe(0);
      expect(p.boxTilt).toBe(0);
    }
  });

  it("ฝาค่อยๆ จางหายแทนการพุ่ง", () => {
    const mid = poseAt("burst", 150, rm).lid;
    expectClose(mid.pos, [0, LID_REST_Y, 0]);
    expect(mid.opacity).toBeCloseTo(0.5, 6);
    expect(poseAt("reveal", 400, rm).lid.visible).toBe(false);
  });
});

describe("ไม่มีค่าเสีย", () => {
  it("ทุกช่วงที่ต้น กลาง ปลาย และเกินปลาย ไม่มี NaN/Infinity", () => {
    const times: Record<ScenePhase, number[]> = {
      idle: [0, 6000, 50000],
      charging: [0, 1000, 2000, 9000],
      burst: [0, 100, 200],
      reveal: [200, 900, 1700, 9000],
      settled: [0, 5000, 99999],
      swap: [0, 300, 800, 5000],
    };
    for (const gold of [false, true]) {
      for (const phase of Object.keys(times) as ScenePhase[]) {
        for (const t of times[phase]) {
          const p = poseAt(phase, t, { ...base, isGold: gold, chargeMs: gold ? 3000 : 2000 });
          const nums = [
            ...p.camPos, ...p.camTarget, p.fov, p.shake, ...p.boxScale, p.boxTilt, p.boxY,
            ...p.lid.pos, ...p.lid.rot, p.lid.opacity, p.seamGlow, p.innerLight, p.beam, p.bloom, p.dim,
          ];
          nums.forEach((n) => expect(Number.isFinite(n)).toBe(true));
        }
      }
    }
  });

  it("เวลาติดลบถูกนับเป็น 0", () => {
    expectClose(camera(poseAt("charging", -50, base)), camera(poseAt("charging", 0, base)));
  });
});
```

- [ ] **Step 2: รันให้เห็นว่า fail**

Run: `npx vitest run app/gift-exchange/three/choreography.test.ts`
Expected: FAIL — `Failed to resolve import "./choreography"`

- [ ] **Step 3: เขียน `choreography.ts`**

```ts
// ท่ากล้อง กล่อง ฝา และแสงของฉากเปิดกล่อง 3D — pure ทั้งหมด ไม่ import three
// ทุกค่าคำนวณจาก "เวลาในช่วง" + orbitMs ที่สะสมต่อเนื่องข้ามช่วง
// จึงทดสอบได้ว่ารอยต่อระหว่างช่วงไม่มีภาพกระโดด

export type ScenePhase = "idle" | "charging" | "burst" | "reveal" | "settled" | "swap";

export type Vec3 = [number, number, number];

export type LidPose = { pos: Vec3; rot: Vec3; visible: boolean; opacity: number };

export type Pose = {
  camPos: Vec3;
  camTarget: Vec3;
  fov: number;
  /** แอมพลิจูดสั่นกล้อง (หน่วยฉาก) — ตัวฉากบวก noise เอง */
  shake: number;
  boxScale: Vec3;
  boxTilt: number;
  boxY: number;
  lid: LidPose;
  seamGlow: number;
  innerLight: number;
  beam: number;
  /** ความแรงแสงฟุ้ง (halo) */
  bloom: number;
  dim: number;
};

export type PoseOptions = {
  chargeMs: number;
  isGold: boolean;
  reducedMotion: boolean;
  /** เวลาโคจรสะสม เดินต่อเนื่องข้ามทุกช่วง */
  orbitMs: number;
};

export const MOUTH_Y = 1.3;
export const LID_REST_Y = 1.42;

export const BURST_MS = 200;
export const REVEAL_MS = 1500;
export const AFTER_BURST_END_MS = BURST_MS + REVEAL_MS;
export const SWAP_MS = 800;
export const SWAP_SINK_MS = 300;

const IDLE_DIST = 6.2;
const IDLE_HEIGHT = 1.3;
const IDLE_TARGET_Y = 0.9;
const IDLE_FOV = 38;
const ORBIT_RAD = (25 * Math.PI) / 180;
const ORBIT_PERIOD_MS = 12000;

const CHARGE_DIST = 4.3;
const GOLD_CHARGE_DIST = 3.8;
const CHARGE_FOV = 33;
const CHARGE_SHAKE = 0.05;
const GOLD_SHAKE = 0.07;

const KICK = 0.45;
const KICK_UP_MS = 120;
const KICK_BACK_MS = 480;
const BURST_SHAKE = 0.08;

const REVEAL_DIST = 5.0;
const REVEAL_HEIGHT = 2.0;
const REVEAL_TARGET_Y = 2.4;
const REVEAL_FOV = 36;

const BOB = 0.05;
const BOB_PERIOD_MS = 2600;
const TILT_RAD = (2 * Math.PI) / 180;
const TILT_PERIOD_MS = 3900;

const INNER_MAX = 6;
const INNER_SETTLED = 3;
const BEAM_SETTLED = 0.6;
const BLOOM_SETTLED = 1.2;
const DIM_SETTLED = 0.2;

const LID_VELOCITY: Vec3 = [-1.6, 5.5, 0.8];
const LID_SPIN: Vec3 = [2.2, 0.4, 3.1];
const GRAVITY = 9.8;
const LID_FLIGHT_MS = 1600;
const LID_FADE_MS = 300;

const TAU = Math.PI * 2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const deg = (d: number) => (d * Math.PI) / 180;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function bounceOut(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) {
    const y = x - 1.5 / d1;
    return n1 * y * y + 0.75;
  }
  if (x < 2.5 / d1) {
    const y = x - 2.25 / d1;
    return n1 * y * y + 0.9375;
  }
  const y = x - 2.625 / d1;
  return n1 * y * y + 0.984375;
}

type Rig = { dist: number; height: number; targetY: number; fov: number; shake: number };

const IDLE_RIG: Rig = { dist: IDLE_DIST, height: IDLE_HEIGHT, targetY: IDLE_TARGET_Y, fov: IDLE_FOV, shake: 0 };

const chargeDist = (isGold: boolean) => (isGold ? GOLD_CHARGE_DIST : CHARGE_DIST);

function chargeRig(p: number, isGold: boolean): Rig {
  const e = easeInOut(p);
  return {
    dist: lerp(IDLE_DIST, chargeDist(isGold), e),
    height: IDLE_HEIGHT,
    targetY: IDLE_TARGET_Y,
    fov: lerp(IDLE_FOV, CHARGE_FOV, e),
    shake: (isGold ? GOLD_SHAKE : CHARGE_SHAKE) * p * p,
  };
}

function kickAt(ms: number): number {
  if (ms <= 0) return 0;
  if (ms < KICK_UP_MS) return KICK * easeOut(ms / KICK_UP_MS);
  return KICK * (1 - easeInOut(clamp01((ms - KICK_UP_MS) / KICK_BACK_MS)));
}

const revealProgress = (ms: number) => easeOut(clamp01((ms - BURST_MS) / REVEAL_MS));

function afterBurstRig(ms: number, isGold: boolean): Rig {
  const rp = revealProgress(ms);
  return {
    dist: lerp(chargeDist(isGold), REVEAL_DIST, rp) + kickAt(ms),
    height: lerp(IDLE_HEIGHT, REVEAL_HEIGHT, rp),
    targetY: lerp(IDLE_TARGET_Y, REVEAL_TARGET_Y, rp),
    fov: lerp(CHARGE_FOV, REVEAL_FOV, rp),
    shake: BURST_SHAKE * (1 - clamp01(ms / BURST_MS)),
  };
}

function lerpRig(a: Rig, b: Rig, t: number): Rig {
  return {
    dist: lerp(a.dist, b.dist, t),
    height: lerp(a.height, b.height, t),
    targetY: lerp(a.targetY, b.targetY, t),
    fov: lerp(a.fov, b.fov, t),
    shake: lerp(a.shake, b.shake, t),
  };
}

function rigFor(phase: ScenePhase, t: number, o: PoseOptions): Rig {
  if (o.reducedMotion) return IDLE_RIG;
  switch (phase) {
    case "idle":
      return IDLE_RIG;
    case "charging":
      return chargeRig(clamp01(t / o.chargeMs), o.isGold);
    case "burst":
    case "reveal":
      return afterBurstRig(t, o.isGold);
    case "settled":
      return afterBurstRig(AFTER_BURST_END_MS, o.isGold);
    case "swap":
      return lerpRig(afterBurstRig(AFTER_BURST_END_MS, o.isGold), IDLE_RIG, easeInOut(clamp01(t / SWAP_MS)));
  }
}

function orbitAngle(orbitMs: number, reduced: boolean): number {
  return reduced ? 0 : ORBIT_RAD * Math.sin((TAU * orbitMs) / ORBIT_PERIOD_MS);
}

type CameraPart = Pick<Pose, "camPos" | "camTarget" | "fov" | "shake">;

function placeCamera(rig: Rig, angle: number): CameraPart {
  return {
    camPos: [Math.sin(angle) * rig.dist, rig.height, Math.cos(angle) * rig.dist],
    camTarget: [0, rig.targetY, 0],
    fov: rig.fov,
    shake: rig.shake,
  };
}

const LID_REST: LidPose = { pos: [0, LID_REST_Y, 0], rot: [0, 0, 0], visible: true, opacity: 1 };
const LID_HIDDEN: LidPose = { pos: [0, LID_REST_Y, 0], rot: [0, 0, 0], visible: false, opacity: 0 };

function squash(sy: number): Vec3 {
  const s = 1 / Math.sqrt(sy);
  return [s, sy, s];
}

const bob = (orbitMs: number, reduced: boolean) =>
  reduced ? 0 : BOB * Math.sin((TAU * orbitMs) / BOB_PERIOD_MS);

const idleTilt = (orbitMs: number, reduced: boolean) =>
  reduced ? 0 : TILT_RAD * Math.sin((TAU * orbitMs) / TILT_PERIOD_MS);

function lidAfterBurst(ms: number, reduced: boolean): LidPose {
  if (reduced) {
    const opacity = 1 - clamp01(ms / LID_FADE_MS);
    return { pos: [0, LID_REST_Y, 0], rot: [0, 0, 0], visible: opacity > 0, opacity };
  }
  const s = ms / 1000;
  const pos: Vec3 = [
    LID_VELOCITY[0] * s,
    LID_REST_Y + LID_VELOCITY[1] * s - 0.5 * GRAVITY * s * s,
    LID_VELOCITY[2] * s,
  ];
  return {
    pos,
    rot: [LID_SPIN[0] * s, LID_SPIN[1] * s, LID_SPIN[2] * s],
    visible: ms < LID_FLIGHT_MS && pos[1] < 6,
    opacity: 1,
  };
}

/** กล่องเด้งตอนฝาระเบิด: ยุบ → ยืด → คืนตัว */
function burstBounce(ms: number): number {
  if (ms < 80) return lerp(1, 0.85, ms / 80);
  if (ms < 200) return lerp(0.85, 1.08, (ms - 80) / 120);
  if (ms < 400) return lerp(1.08, 1, (ms - 200) / 200);
  return 1;
}

function bloomAt(ms: number, reduced: boolean): number {
  if (reduced) return lerp(0.6, BLOOM_SETTLED, clamp01(ms / 600));
  if (ms < 60) return lerp(0.6, 2.2, ms / 60);
  return lerp(2.2, BLOOM_SETTLED, clamp01((ms - 60) / 540));
}

function afterBurstPose(cam: CameraPart, ms: number, reduced: boolean): Pose {
  const rp = revealProgress(ms);
  return {
    ...cam,
    boxScale: squash(reduced ? 1 : burstBounce(ms)),
    boxTilt: 0,
    boxY: 0,
    lid: lidAfterBurst(ms, reduced),
    seamGlow: 1 - clamp01(ms / 300),
    innerLight: ms < BURST_MS ? INNER_MAX : lerp(INNER_MAX, INNER_SETTLED, rp),
    beam: ms < BURST_MS ? ms / BURST_MS : lerp(1, BEAM_SETTLED, rp),
    bloom: bloomAt(ms, reduced),
    dim: ms < BURST_MS ? 0.5 : lerp(0.5, DIM_SETTLED, rp),
  };
}

export function poseAt(phase: ScenePhase, tMs: number, o: PoseOptions): Pose {
  const t = Math.max(0, tMs);
  const rm = o.reducedMotion;
  const cam = placeCamera(rigFor(phase, t, o), orbitAngle(o.orbitMs, rm));

  switch (phase) {
    case "idle":
      return {
        ...cam,
        boxScale: [1, 1, 1],
        boxTilt: idleTilt(o.orbitMs, rm),
        boxY: bob(o.orbitMs, rm),
        lid: LID_REST,
        seamGlow: 0,
        innerLight: 0,
        beam: 0,
        bloom: 0,
        dim: 0,
      };

    case "charging": {
      const p = clamp01(t / o.chargeMs);
      const wobble = rm ? 0 : deg(lerp(2, 9, p)) * p * Math.sin(((TAU * t) / 1000) * (3 + 5 * p));
      const sy = rm ? 1 : 1 + 0.07 * p * Math.sin(((TAU * t) / 1000) * (4 + 6 * p));
      return {
        ...cam,
        boxScale: squash(sy),
        boxTilt: idleTilt(o.orbitMs, rm) * (1 - p) + wobble,
        boxY: bob(o.orbitMs, rm) * (1 - p),
        lid: LID_REST,
        seamGlow: p,
        innerLight: INNER_MAX * p,
        beam: 0,
        bloom: 0.6 * p,
        dim: 0.5 * p,
      };
    }

    case "burst":
    case "reveal":
      return afterBurstPose(cam, t, rm);

    case "settled": {
      const end = afterBurstPose(cam, AFTER_BURST_END_MS, rm);
      return {
        ...end,
        lid: LID_HIDDEN,
        innerLight: INNER_SETTLED + (rm ? 0 : 0.4 * Math.sin((TAU * t) / 2400)),
      };
    }

    case "swap": {
      const k = clamp01(t / SWAP_SINK_MS);
      const sinking = t < SWAP_SINK_MS;
      const drop = clamp01((t - SWAP_SINK_MS) / (SWAP_MS - SWAP_SINK_MS));
      const boxY = rm ? 0 : sinking ? -2 * k * k * k : 3 * (1 - bounceOut(drop));
      return {
        ...cam,
        boxScale: [1, 1, 1],
        boxTilt: 0,
        boxY,
        lid: sinking ? LID_HIDDEN : LID_REST,
        seamGlow: 0,
        innerLight: lerp(INNER_SETTLED, 0, k),
        beam: lerp(BEAM_SETTLED, 0, k),
        bloom: lerp(BLOOM_SETTLED, 0, k),
        dim: lerp(DIM_SETTLED, 0, clamp01(t / SWAP_MS)),
      };
    }
  }
}
```

- [ ] **Step 4: รันให้ผ่าน**

Run: `npx vitest run app/gift-exchange/three/choreography.test.ts`
Expected: PASS ทั้งหมด

Run: `npm test`
Expected: PASS ทั้งหมด (เดิม 74 + ใหม่)

- [ ] **Step 5: Commit**

```bash
git add app/gift-exchange/three/choreography.ts app/gift-exchange/three/choreography.test.ts
git commit -m "feat(gift-exchange): choreograph the 3D gift camera and box"
```

---

### Task 2: renderMode — เลือกโหมดภาพ

**Files:**
- Create: `app/gift-exchange/three/renderMode.ts`
- Test: `app/gift-exchange/three/renderMode.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  ```ts
  type RenderMode = "3d-high" | "3d-low" | "2d";
  type SavedMode = { mode: RenderMode; manual: boolean };
  const RENDER_KEY = "khuncool.giftexchange.render";
  parseSavedMode(raw: string | null): SavedMode | null
  serializeSavedMode(s: SavedMode): string
  initialMode(opts: { webgl: boolean; saved: SavedMode | null }): RenderMode
  judgeFrames(mode: RenderMode, msPerFrame: number[], manual: boolean): RenderMode
  readSavedMode(storage?: Pick<Storage, "getItem">): SavedMode | null
  writeSavedMode(storage: Pick<Storage, "setItem"> | undefined, s: SavedMode): void
  ```

- [ ] **Step 1: เขียนเทสต์ที่ fail**

สร้าง `app/gift-exchange/three/renderMode.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  RENDER_KEY,
  initialMode,
  judgeFrames,
  parseSavedMode,
  readSavedMode,
  serializeSavedMode,
  writeSavedMode,
} from "./renderMode";

/** 10 เฟรมแรกช้ามาก (ช่วงคอมไพล์ shader) ตามด้วย n เฟรมที่ ms เท่ากัน */
function frames(ms: number, n = 90): number[] {
  return [...Array(10).fill(500), ...Array(n).fill(ms)];
}

describe("parseSavedMode / serializeSavedMode", () => {
  it.each([
    ["3d-high", { mode: "3d-high", manual: false }],
    ["3d-low", { mode: "3d-low", manual: false }],
    ["2d", { mode: "2d", manual: false }],
    ["3d-high:manual", { mode: "3d-high", manual: true }],
    ["2d:manual", { mode: "2d", manual: true }],
  ])("อ่าน %s", (raw, expected) => {
    expect(parseSavedMode(raw)).toEqual(expected);
    expect(serializeSavedMode(expected as never)).toBe(raw);
  });

  it.each([null, "", "4d", "3d-high:auto", "2d:manual:x", "3D-HIGH"])("ค่าเสีย %s → null", (raw) => {
    expect(parseSavedMode(raw as string | null)).toBeNull();
  });
});

describe("initialMode", () => {
  it("ไม่มี WebGL → 2d เสมอ แม้เคยบันทึก 3D", () => {
    expect(initialMode({ webgl: false, saved: null })).toBe("2d");
    expect(initialMode({ webgl: false, saved: { mode: "3d-high", manual: true } })).toBe("2d");
  });

  it("มี WebGL ไม่มีค่าที่จำ → 3d-high; มีค่าที่จำ → ใช้ค่านั้น", () => {
    expect(initialMode({ webgl: true, saved: null })).toBe("3d-high");
    expect(initialMode({ webgl: true, saved: { mode: "3d-low", manual: false } })).toBe("3d-low");
    expect(initialMode({ webgl: true, saved: { mode: "2d", manual: true } })).toBe("2d");
  });
});

describe("judgeFrames", () => {
  it("เครื่องเร็ว คงโหมดเดิม", () => {
    expect(judgeFrames("3d-high", frames(16), false)).toBe("3d-high");
    expect(judgeFrames("3d-low", frames(16), false)).toBe("3d-low");
  });

  it("3d-high ช้าเกิน 28ms → 3d-low; เกิน 40ms → 2d", () => {
    expect(judgeFrames("3d-high", frames(30), false)).toBe("3d-low");
    expect(judgeFrames("3d-high", frames(45), false)).toBe("2d");
  });

  it("3d-low ช้าเกิน 40ms → 2d; ไม่ถึง → คงเดิม", () => {
    expect(judgeFrames("3d-low", frames(45), false)).toBe("2d");
    expect(judgeFrames("3d-low", frames(30), false)).toBe("3d-low");
  });

  it("ครูเลือก 3D เอง: ลดได้แค่ถึง 3d-low", () => {
    expect(judgeFrames("3d-high", frames(45), true)).toBe("3d-low");
    expect(judgeFrames("3d-low", frames(45), true)).toBe("3d-low");
  });

  it("ใช้ median ตัด 10 เฟรมแรก: เฟรมกระตุกไม่กี่เฟรมไม่ทำให้ลดระดับ", () => {
    const spiky = frames(16);
    for (let i = 20; i < 40; i++) spiky[i] = 200;
    expect(judgeFrames("3d-high", spiky, false)).toBe("3d-high");
  });

  it("ตัวอย่างน้อยเกิน (<30 หลังตัด) → ไม่ตัดสิน", () => {
    expect(judgeFrames("3d-high", frames(45, 20), false)).toBe("3d-high");
  });

  it("2d คงเป็น 2d", () => {
    expect(judgeFrames("2d", frames(5), false)).toBe("2d");
  });
});

describe("readSavedMode / writeSavedMode", () => {
  it("อ่านเขียนผ่านคีย์ที่กำหนด", () => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
    };
    writeSavedMode(storage, { mode: "3d-low", manual: false });
    expect(mem.get(RENDER_KEY)).toBe("3d-low");
    expect(readSavedMode(storage)).toEqual({ mode: "3d-low", manual: false });
  });

  it("storage โยน error หรือไม่มี storage → ไม่พัง", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(readSavedMode(broken)).toBeNull();
    expect(readSavedMode(undefined)).toBeNull();
    expect(() => writeSavedMode(broken, { mode: "2d", manual: true })).not.toThrow();
  });
});
```

- [ ] **Step 2: รันให้เห็นว่า fail**

Run: `npx vitest run app/gift-exchange/three/renderMode.test.ts`
Expected: FAIL — `Failed to resolve import "./renderMode"`

- [ ] **Step 3: เขียน `renderMode.ts`**

```ts
// เลือกว่าจะวาดฉากเปิดกล่องแบบ 3D เต็ม, 3D แบบเบา หรือกล่อง SVG เดิม — pure ยกเว้นตัวอ่าน/เขียน storage

export type RenderMode = "3d-high" | "3d-low" | "2d";

/** manual = ครูกดเลือกเอง ระบบจะไม่ลดถึง 2D ให้เอง */
export type SavedMode = { mode: RenderMode; manual: boolean };

export const RENDER_KEY = "khuncool.giftexchange.render";

const MODES: readonly RenderMode[] = ["3d-high", "3d-low", "2d"];

/** เฟรมแรกๆ ช้าเพราะคอมไพล์ shader — ตัดทิ้งก่อนวัด */
const SKIP_FRAMES = 10;
const MIN_SAMPLES = 30;
/** ช้ากว่านี้ (≈ ต่ำกว่า 35 fps) → ลดเป็น 3D แบบเบา */
const LOW_MS = 28;
/** ช้ากว่านี้ (≈ ต่ำกว่า 25 fps) → กลับไปใช้ SVG */
const FAIL_MS = 40;

export function parseSavedMode(raw: string | null): SavedMode | null {
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length > 2) return null;
  const [mode, flag] = parts;
  if (!MODES.includes(mode as RenderMode)) return null;
  if (flag !== undefined && flag !== "manual") return null;
  return { mode: mode as RenderMode, manual: flag === "manual" };
}

export function serializeSavedMode(s: SavedMode): string {
  return s.manual ? `${s.mode}:manual` : s.mode;
}

export function initialMode(opts: { webgl: boolean; saved: SavedMode | null }): RenderMode {
  if (!opts.webgl) return "2d";
  return opts.saved?.mode ?? "3d-high";
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function judgeFrames(mode: RenderMode, msPerFrame: number[], manual: boolean): RenderMode {
  if (mode === "2d") return mode;
  const usable = msPerFrame.slice(SKIP_FRAMES);
  if (usable.length < MIN_SAMPLES) return mode;
  const m = median(usable);
  if (m > FAIL_MS) return manual ? "3d-low" : "2d";
  if (m > LOW_MS) return "3d-low";
  return mode;
}

export function readSavedMode(storage?: Pick<Storage, "getItem">): SavedMode | null {
  try {
    return parseSavedMode(storage?.getItem(RENDER_KEY) ?? null);
  } catch {
    return null;
  }
}

export function writeSavedMode(storage: Pick<Storage, "setItem"> | undefined, s: SavedMode): void {
  try {
    storage?.setItem(RENDER_KEY, serializeSavedMode(s));
  } catch {
    // โหมดส่วนตัว/พื้นที่เต็ม — แค่ไม่จำ
  }
}
```

- [ ] **Step 4: รันให้ผ่าน**

Run: `npx vitest run app/gift-exchange/three/renderMode.test.ts` แล้ว `npm test`
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add app/gift-exchange/three/renderMode.ts app/gift-exchange/three/renderMode.test.ts
git commit -m "feat(gift-exchange): pick the 3D or 2D gift scene by device speed"
```

---

### Task 3: particles — ดาวทองและคอนเฟตตี

**Files:**
- Create: `app/gift-exchange/three/particles.ts`
- Test: `app/gift-exchange/three/particles.test.ts`

**Interfaces:**
- Consumes: `Vec3`, `MOUTH_Y` จาก `./choreography` (Task 1)
- Produces:
  ```ts
  type ParticleKind = "star" | "confetti";
  type Particle = { pos: Vec3; vel: Vec3; rot: Vec3; spin: Vec3; color: number; alive: boolean };
  type Burst = { kind: ParticleKind; parts: Particle[]; age: number };
  const CONFETTI_COLORS: readonly string[]; // 6 สี
  const MAX_LIFE_S = 6;
  particleCount(kind: ParticleKind, opts: { isGold: boolean; quality: "high" | "low" }): number
  createBurst(kind: ParticleKind, count: number, rng: () => number, origin?: Vec3): Burst
  stepBurst(b: Burst, dtSec: number): void   // แก้ b ในที่ (ไม่มี global state)
  aliveCount(b: Burst): number
  ```

- [ ] **Step 1: เขียนเทสต์ที่ fail**

สร้าง `app/gift-exchange/three/particles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MAX_LIFE_S, aliveCount, createBurst, particleCount, stepBurst, type Burst } from "./particles";

/** rng ที่กำหนดผลได้ (mulberry32) */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function run(b: Burst, seconds: number, dt = 1 / 60) {
  for (let t = 0; t < seconds; t += dt) stepBurst(b, dt);
}

describe("particleCount", () => {
  it("ดาว 24 / กล่องทอง 48; คอนเฟตตี 150 / เครื่องอ่อน 60", () => {
    expect(particleCount("star", { isGold: false, quality: "high" })).toBe(24);
    expect(particleCount("star", { isGold: true, quality: "high" })).toBe(48);
    expect(particleCount("confetti", { isGold: false, quality: "high" })).toBe(150);
    expect(particleCount("confetti", { isGold: true, quality: "low" })).toBe(60);
  });
});

describe("createBurst", () => {
  it("seed เดิม → ผลเดิม", () => {
    const a = createBurst("star", 24, seeded(7));
    const b = createBurst("star", 24, seeded(7));
    run(a, 1.5);
    run(b, 1.5);
    expect(a).toEqual(b);
  });

  it("จำนวนชิ้นตามที่ขอ และพุ่งขึ้นทุกชิ้น", () => {
    for (const kind of ["star", "confetti"] as const) {
      const b = createBurst(kind, 40, seeded(3));
      expect(b.parts).toHaveLength(40);
      expect(aliveCount(b)).toBe(40);
      b.parts.forEach((p) => expect(p.vel[1]).toBeGreaterThan(0));
    }
  });

  it("ดาวพุ่งในกรวย ±35° จากแนวตั้ง", () => {
    const b = createBurst("star", 200, seeded(11));
    for (const p of b.parts) {
      const horizontal = Math.hypot(p.vel[0], p.vel[2]);
      const angle = Math.atan2(horizontal, p.vel[1]);
      expect(angle).toBeLessThanOrEqual((35 * Math.PI) / 180 + 1e-9);
    }
  });
});

describe("stepBurst", () => {
  it.each(["star", "confetti"] as const)("%s หายหมดภายใน 6 วินาที", (kind) => {
    const b = createBurst(kind, 300, seeded(5));
    run(b, MAX_LIFE_S);
    expect(aliveCount(b)).toBe(0);
  });

  it("ยังเห็นอยู่ช่วงแรก (ไม่หายเร็วเกิน)", () => {
    const b = createBurst("confetti", 150, seeded(9));
    run(b, 1);
    expect(aliveCount(b)).toBe(150);
  });

  it("ไม่มี NaN แม้ dt ใหญ่ผิดปกติ (แท็บกลับมาจากพื้นหลัง)", () => {
    const b = createBurst("star", 24, seeded(1));
    stepBurst(b, 0.1);
    stepBurst(b, 0.1);
    for (const p of b.parts) [...p.pos, ...p.vel, ...p.rot].forEach((n) => expect(Number.isFinite(n)).toBe(true));
  });
});
```

- [ ] **Step 2: รันให้เห็นว่า fail**

Run: `npx vitest run app/gift-exchange/three/particles.test.ts`
Expected: FAIL — `Failed to resolve import "./particles"`

- [ ] **Step 3: เขียน `particles.ts`**

```ts
// จำลองดาวทองและคอนเฟตตีที่พุ่งออกจากปากกล่อง — ไม่ import three
// ตัวฉากอ่าน pos/rot ไปใส่ InstancedMesh ทุกเฟรม

import { MOUTH_Y, type Vec3 } from "./choreography";

export type ParticleKind = "star" | "confetti";

export type Particle = { pos: Vec3; vel: Vec3; rot: Vec3; spin: Vec3; color: number; alive: boolean };

export type Burst = { kind: ParticleKind; parts: Particle[]; age: number };

export const CONFETTI_COLORS: readonly string[] = ["#fbbf24", "#f97316", "#ef4444", "#22c55e", "#38bdf8", "#a78bfa"];

export const MAX_LIFE_S = 6;
const FLOOR_Y = -0.5;

const SPEC: Record<ParticleKind, { gravity: number; drag: number; cone: number; speed: [number, number]; spin: number }> = {
  star: { gravity: 6, drag: 0.6, cone: (35 * Math.PI) / 180, speed: [4, 7.5], spin: 6 },
  confetti: { gravity: 3.5, drag: 1.8, cone: (60 * Math.PI) / 180, speed: [3, 6], spin: 10 },
};

export function particleCount(kind: ParticleKind, opts: { isGold: boolean; quality: "high" | "low" }): number {
  if (kind === "star") return opts.isGold ? 48 : 24;
  return opts.quality === "low" ? 60 : 150;
}

export function createBurst(kind: ParticleKind, count: number, rng: () => number, origin: Vec3 = [0, MOUTH_Y, 0]): Burst {
  const s = SPEC[kind];
  const parts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const polar = rng() * s.cone;
    const az = rng() * Math.PI * 2;
    const speed = s.speed[0] + (s.speed[1] - s.speed[0]) * rng();
    parts.push({
      pos: [origin[0] + (rng() - 0.5) * 0.4, origin[1], origin[2] + (rng() - 0.5) * 0.4],
      vel: [Math.sin(polar) * Math.cos(az) * speed, Math.cos(polar) * speed, Math.sin(polar) * Math.sin(az) * speed],
      rot: [rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2],
      spin: [(rng() - 0.5) * s.spin, (rng() - 0.5) * s.spin, (rng() - 0.5) * s.spin],
      color: Math.floor(rng() * CONFETTI_COLORS.length),
      alive: true,
    });
  }
  return { kind, parts, age: 0 };
}

export function stepBurst(b: Burst, dtSec: number): void {
  const s = SPEC[b.kind];
  const keep = Math.exp(-s.drag * dtSec);
  b.age += dtSec;
  const expired = b.age >= MAX_LIFE_S;
  for (const p of b.parts) {
    if (!p.alive) continue;
    if (expired) {
      p.alive = false;
      continue;
    }
    p.vel[0] *= keep;
    p.vel[1] = p.vel[1] * keep - s.gravity * dtSec;
    p.vel[2] *= keep;
    p.pos[0] += p.vel[0] * dtSec;
    p.pos[1] += p.vel[1] * dtSec;
    p.pos[2] += p.vel[2] * dtSec;
    p.rot[0] += p.spin[0] * dtSec;
    p.rot[1] += p.spin[1] * dtSec;
    p.rot[2] += p.spin[2] * dtSec;
    if (p.pos[1] < FLOOR_Y) p.alive = false;
  }
}

export function aliveCount(b: Burst): number {
  let n = 0;
  for (const p of b.parts) if (p.alive) n++;
  return n;
}
```

- [ ] **Step 4: รันให้ผ่าน**

Run: `npx vitest run app/gift-exchange/three/particles.test.ts` แล้ว `npm test`
Expected: PASS ทั้งหมด

ถ้าเทสต์ "ยังเห็นอยู่ช่วงแรก" fail เพราะคอนเฟตตีบางชิ้นตกถึงพื้นก่อน 1 วินาที — นั่นคือ spec ผิดกับฟิสิกส์ (ความเร็วขึ้นต่ำสุด 3·cos60° = 1.5 จากความสูง 1.3 ใช้เวลา > 1s แน่นอนตามการคำนวณ ดังนั้นถ้า fail ให้หาบั๊กใน `stepBurst` ไม่ใช่แก้เทสต์)

- [ ] **Step 5: Commit**

```bash
git add app/gift-exchange/three/particles.ts app/gift-exchange/three/particles.test.ts
git commit -m "feat(gift-exchange): simulate the gold stars and confetti burst"
```

---

### Task 4: โมเดลกล่องและ controller ฉาก 3D

**Files:**
- Create: `app/gift-exchange/three/giftModel.ts`
- Create: `app/gift-exchange/three/giftScene.ts`

**Interfaces:**
- Consumes: `poseAt`, `ScenePhase`, `BURST_MS`, `AFTER_BURST_END_MS`, `SWAP_MS`, `SWAP_SINK_MS`, `LID_REST_Y`, `MOUTH_Y` (Task 1); `createBurst`, `stepBurst`, `particleCount`, `CONFETTI_COLORS`, `Burst` (Task 3); `GiftPalette` จาก `../GiftBox`
- Produces:
  ```ts
  // giftScene.ts
  type SceneAnim = "idle" | "charging" | "burst" | "shown";
  type SceneQuality = "high" | "low";
  type SceneTurn = { turnKey: string; palette: GiftPalette; isGold: boolean; resumedOpen: boolean };
  type SceneOptions = { quality: SceneQuality; reducedMotion: boolean; onFrameStats: (msPerFrame: number[]) => void; onFailure: () => void };
  type GiftSceneController = {
    canvas: HTMLCanvasElement;
    renderer: { info: { memory: { geometries: number; textures: number }; programs: unknown[] | null } }; // ใช้ตรวจหน่วยความจำ
    setTurn(turn: SceneTurn): void;
    setAnim(anim: SceneAnim, chargeMs: number): void;
    setQuality(q: SceneQuality): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  };
  createGiftScene(opts: SceneOptions): GiftSceneController  // โยน error ถ้าสร้าง WebGL ไม่ได้
  ```

ไม่มี unit test (ต้องใช้ WebGL จริง) — ตรวจด้วย typecheck/lint ใน task นี้ และดูของจริงใน Task 5

- [ ] **Step 1: เขียน `giftModel.ts`**

```ts
// โมเดลกล่องของขวัญสร้างด้วยโค้ด: ตัวกล่องขอบมน, ฝาแยกชิ้น, ริบบิ้นนูน, โบว์ห่วงท่อ
// root อยู่ที่พื้น (y = 0) ทำให้การบีบ-ยืดยุบจากพื้นเหมือนของจริง

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { GiftPalette } from "../GiftBox";
import { LID_REST_Y, MOUTH_Y } from "./choreography";

const BODY_W = 1.6;
const BODY_H = MOUTH_Y;
const LID_W = 1.72;
const LID_H = 0.32;
const RIBBON_W = 0.24;
const RIBBON_OUT = 0.015;

export type GiftModel = {
  root: THREE.Group;
  lid: THREE.Group;
  innerLight: THREE.PointLight;
  setPalette(p: GiftPalette, gold: boolean): void;
  setLidOpacity(o: number): void;
  setSeamGlow(v: number): void;
  setMouthGlow(v: number): void;
  dispose(): void;
};

function loopCurve(sign: 1 | -1): THREE.CatmullRomCurve3 {
  const pts: [number, number, number][] = [
    [0, 0, 0],
    [0.18, 0.2, 0.08],
    [0.42, 0.3, 0],
    [0.5, 0.12, -0.04],
    [0.26, 0.02, 0],
  ];
  return new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(sign * x, y, z)), true);
}

function tailCurve(sign: 1 | -1): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0),
    new THREE.Vector3(sign * 0.12, 0, 0.2),
    new THREE.Vector3(sign * 0.22, -0.01, 0.42),
  ]);
}

export function createGiftModel(glow: THREE.Texture): GiftModel {
  const bodyMat = new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
  const ribbonMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.25,
    sheen: 1,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color(0xffffff),
  });
  // ฝาใช้วัสดุคนละชุด เพื่อจางเฉพาะฝาได้ตอน reduced motion
  const lidMat = bodyMat.clone();
  const lidRibbonMat = ribbonMat.clone();
  const seamMat = new THREE.MeshBasicMaterial({
    color: 0xffd98a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mouthMat = new THREE.MeshBasicMaterial({
    map: glow,
    color: 0xffd27a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const materials = [bodyMat, ribbonMat, lidMat, lidRibbonMat, seamMat, mouthMat];

  const root = new THREE.Group();

  const body = new THREE.Mesh(new RoundedBoxGeometry(BODY_W, BODY_H, BODY_W, 4, 0.06), bodyMat);
  body.position.y = BODY_H / 2;
  body.castShadow = true;
  root.add(body);

  // ริบบิ้นตัวกล่องต่ำกว่าขอบบนเล็กน้อย ให้ซ่อนอยู่ใต้ฝาและไม่ทับแสงในกล่องตอนเปิด
  const ribbonH = BODY_H - 0.02;
  const ribbonA = new THREE.Mesh(new THREE.BoxGeometry(RIBBON_W, ribbonH, BODY_W + 2 * RIBBON_OUT), ribbonMat);
  const ribbonB = new THREE.Mesh(new THREE.BoxGeometry(BODY_W + 2 * RIBBON_OUT, ribbonH, RIBBON_W), ribbonMat);
  ribbonA.position.y = ribbonH / 2;
  ribbonB.position.y = ribbonH / 2;
  root.add(ribbonA, ribbonB);

  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(BODY_W - 0.12, BODY_W - 0.12), mouthMat);
  mouth.rotation.x = -Math.PI / 2;
  mouth.position.y = BODY_H + 0.006;
  root.add(mouth);

  const seam = new THREE.Mesh(new THREE.BoxGeometry(BODY_W + 0.03, 0.035, BODY_W + 0.03), seamMat);
  seam.position.y = BODY_H;
  seam.visible = false;
  root.add(seam);

  const innerLight = new THREE.PointLight(0xffc35a, 0, 4, 2);
  innerLight.position.y = BODY_H - 0.15;
  root.add(innerLight);

  const lid = new THREE.Group();
  lid.position.y = LID_REST_Y;
  const lidMesh = new THREE.Mesh(new RoundedBoxGeometry(LID_W, LID_H, LID_W, 4, 0.06), lidMat);
  lidMesh.castShadow = true;
  const lidRibbonA = new THREE.Mesh(new THREE.BoxGeometry(RIBBON_W + 0.02, LID_H + 2 * RIBBON_OUT, LID_W + 2 * RIBBON_OUT), lidRibbonMat);
  const lidRibbonB = new THREE.Mesh(new THREE.BoxGeometry(LID_W + 2 * RIBBON_OUT, LID_H + 2 * RIBBON_OUT, RIBBON_W + 0.02), lidRibbonMat);
  lid.add(lidMesh, lidRibbonA, lidRibbonB);

  const bow = new THREE.Group();
  bow.position.y = LID_H / 2 + RIBBON_OUT;
  for (const sign of [1, -1] as const) {
    const loop = new THREE.Mesh(new THREE.TubeGeometry(loopCurve(sign), 64, 0.05, 12, true), lidRibbonMat);
    loop.scale.z = 2; // หน้าตัดกลมถูกยืดเป็นแถบริบบิ้นกว้าง
    loop.castShadow = true;
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve(sign), 24, 0.045, 8, false), lidRibbonMat);
    tail.scale.y = 0.45;
    bow.add(loop, tail);
  }
  const knot = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.17, 0.24, 3, 0.05), lidRibbonMat);
  knot.position.y = 0.06;
  bow.add(knot);
  lid.add(bow);
  root.add(lid);

  return {
    root,
    lid,
    innerLight,
    setPalette(p, gold) {
      for (const m of [bodyMat, lidMat]) {
        m.color.set(p.box);
        m.metalness = gold ? 0.9 : 0;
        m.roughness = gold ? 0.22 : 0.35;
      }
      for (const m of [ribbonMat, lidRibbonMat]) m.color.set(p.ribbon);
    },
    setLidOpacity(o) {
      for (const m of [lidMat, lidRibbonMat]) {
        const transparent = o < 1;
        if (m.transparent !== transparent) {
          m.transparent = transparent;
          m.needsUpdate = true;
        }
        m.opacity = o;
      }
    },
    setSeamGlow(v) {
      seam.visible = v > 0.01;
      seamMat.opacity = v;
    },
    setMouthGlow(v) {
      mouth.visible = v > 0.01;
      mouthMat.opacity = Math.min(1, v);
    },
    dispose() {
      root.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      materials.forEach((m) => m.dispose());
    },
  };
}
```

- [ ] **Step 2: เขียน `giftScene.ts`**

```ts
// controller ของฉากเปิดกล่อง 3D — ถือ WebGL renderer ตัวเดียวตลอดช่วงที่อยู่บนเวที
// ไม่ใช่ React component: GiftStage แต่ละตาเอา canvas ไปวาง (SceneHost) และสั่งผ่าน setTurn/setAnim
//
// แสงฟุ้งทำด้วย sprite/plane แบบ AdditiveBlending แทน bloom pass เพราะ canvas โปร่งใส
// (ให้พื้นหลัง CSS เห็นทะลุ) และ premultipliedAlpha ทำให้สีที่บวกเข้าไปกลายเป็นแสงทับพื้นหลังได้ถูกต้อง

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { GiftPalette } from "../GiftBox";
import {
  AFTER_BURST_END_MS,
  BURST_MS,
  MOUTH_Y,
  SWAP_MS,
  SWAP_SINK_MS,
  poseAt,
  type Pose,
  type ScenePhase,
} from "./choreography";
import { createGiftModel } from "./giftModel";
import { CONFETTI_COLORS, createBurst, particleCount, stepBurst, type Burst } from "./particles";

export type SceneAnim = "idle" | "charging" | "burst" | "shown";
export type SceneQuality = "high" | "low";
export type SceneTurn = { turnKey: string; palette: GiftPalette; isGold: boolean; resumedOpen: boolean };
export type SceneOptions = {
  quality: SceneQuality;
  reducedMotion: boolean;
  onFrameStats: (msPerFrame: number[]) => void;
  onFailure: () => void;
};
export type GiftSceneController = {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  setTurn(turn: SceneTurn): void;
  setAnim(anim: SceneAnim, chargeMs: number): void;
  setQuality(q: SceneQuality): void;
  setSize(width: number, height: number): void;
  dispose(): void;
};

const STATS_FRAMES = 100;
const STAR_CAP = 48;
const CONFETTI_CAP = 150;

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,248,220,1)");
  grd.addColorStop(0.35, "rgba(253,224,130,0.55)");
  grd.addColorStop(1, "rgba(251,191,36,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** ไล่ alpha ตามแนวตั้ง: ทึบที่โคนลำแสง (ปากกล่อง) จางหายที่ปลาย */
function beamTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, "rgba(255,220,140,0)");
  grd.addColorStop(1, "rgba(255,220,140,1)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function starShape(): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 ? 0.07 : 0.16;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export function createGiftScene(opts: SceneOptions): GiftSceneController {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envTex;
  room.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xc7d2fe, 0x1e1b4b, 0.6));
  const key = new THREE.DirectionalLight(0xfff1d6, 2.4);
  key.position.set(3, 5, 4);
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8b9cff, 1.8);
  rim.position.set(-4, 3, -4);
  scene.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const glowTex = glowTexture();
  const beamTex = beamTexture();

  const gift = createGiftModel(glowTex);
  scene.add(gift.root);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  halo.position.set(0, MOUTH_Y + 0.15, 0);
  halo.scale.set(3.2, 3.2, 1);
  scene.add(halo);

  const beamMat = new THREE.MeshBasicMaterial({
    map: beamTex,
    color: 0xffd98a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.25, 4.2, 40, 1, true), beamMat);
  beam.position.y = MOUTH_Y + 2.1;
  scene.add(beam);

  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePos = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 0.7;
    sparklePos.set([Math.cos(a) * r, 0.2 + Math.random() * 2, Math.sin(a) * r], i * 3);
  }
  sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
  const sparkles = new THREE.Points(
    sparkleGeo,
    new THREE.PointsMaterial({ map: glowTex, size: 0.12, color: 0xfde68a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  scene.add(sparkles);

  const starGeo = new THREE.ExtrudeGeometry(starShape(), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 });
  starGeo.center();
  const stars = new THREE.InstancedMesh(
    starGeo,
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 1, roughness: 0.25, emissive: 0x7a4a00, emissiveIntensity: 0.6 }),
    STAR_CAP,
  );
  stars.count = 0;
  stars.frustumCulled = false;
  scene.add(stars);

  const starHaloPos = new Float32Array(STAR_CAP * 3);
  const starHaloGeo = new THREE.BufferGeometry();
  starHaloGeo.setAttribute("position", new THREE.BufferAttribute(starHaloPos, 3));
  starHaloGeo.setDrawRange(0, 0);
  const starHalos = new THREE.Points(
    starHaloGeo,
    new THREE.PointsMaterial({ map: glowTex, size: 0.5, color: 0xffd27a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  starHalos.frustumCulled = false;
  scene.add(starHalos);

  const confetti = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.08, 0.14),
    new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, metalness: 0.1 }),
    CONFETTI_CAP,
  );
  confetti.count = 0;
  confetti.frustumCulled = false;
  scene.add(confetti);
  const confettiColors = CONFETTI_COLORS.map((c) => new THREE.Color(c));

  let quality = opts.quality;
  let phase: ScenePhase = "idle";
  let phaseStart = performance.now();
  let burstStart = 0;
  let orbitMs = 0;
  let chargeMs = 2000;
  let isGold = false;
  let turnKey: string | null = null;
  let pendingTurn: SceneTurn | null = null;
  let bursts: Burst[] = [];
  let disposed = false;
  let raf = 0;
  let last = performance.now();
  const stats: number[] = [];
  let statsSent = false;
  const dummy = new THREE.Object3D();

  function applyQuality() {
    const high = quality === "high";
    renderer.setPixelRatio(high ? Math.min(window.devicePixelRatio || 1, 1.5) : 1);
    key.castShadow = high;
    floor.visible = high;
    halo.visible = high;
    starHalos.visible = high;
  }

  function enter(p: ScenePhase) {
    phase = p;
    phaseStart = performance.now();
  }

  function finishSwap() {
    if (!pendingTurn) return;
    gift.setPalette(pendingTurn.palette, pendingTurn.isGold);
    isGold = pendingTurn.isGold;
    pendingTurn = null;
  }

  function spawn() {
    if (opts.reducedMotion) return;
    bursts = [
      createBurst("star", particleCount("star", { isGold, quality }), Math.random),
      createBurst("confetti", particleCount("confetti", { isGold, quality }), Math.random),
    ];
  }

  function apply(p: Pose, now: number) {
    const s = p.shake;
    camera.position.set(
      p.camPos[0] + s * (Math.sin(now * 0.031) + 0.5 * Math.sin(now * 0.077)),
      p.camPos[1] + s * (Math.sin(now * 0.027 + 1) + 0.5 * Math.sin(now * 0.083)),
      p.camPos[2] + s * 0.6 * Math.sin(now * 0.041 + 2),
    );
    camera.lookAt(p.camTarget[0], p.camTarget[1], p.camTarget[2]);
    if (camera.fov !== p.fov) {
      camera.fov = p.fov;
      camera.updateProjectionMatrix();
    }
    gift.root.position.y = p.boxY;
    gift.root.rotation.z = p.boxTilt;
    gift.root.scale.set(p.boxScale[0], p.boxScale[1], p.boxScale[2]);
    gift.lid.visible = p.lid.visible;
    gift.lid.position.set(p.lid.pos[0], p.lid.pos[1], p.lid.pos[2]);
    gift.lid.rotation.set(p.lid.rot[0], p.lid.rot[1], p.lid.rot[2]);
    gift.setLidOpacity(p.lid.opacity);
    gift.setSeamGlow(p.seamGlow);
    gift.innerLight.intensity = p.innerLight;
    gift.setMouthGlow(p.innerLight / 6);
    beam.visible = p.beam > 0.01;
    beamMat.opacity = p.beam * 0.55;
    halo.material.opacity = Math.min(1, p.bloom * 0.45);
    renderer.toneMappingExposure = 1 - 0.35 * p.dim;
    sparkles.rotation.y = orbitMs * 0.00012;
  }

  function syncParticles() {
    let ns = 0;
    let nc = 0;
    for (const b of bursts) {
      for (const p of b.parts) {
        if (!p.alive) continue;
        dummy.position.set(p.pos[0], p.pos[1], p.pos[2]);
        dummy.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
        dummy.updateMatrix();
        if (b.kind === "star" && ns < STAR_CAP) {
          stars.setMatrixAt(ns, dummy.matrix);
          starHaloPos.set(p.pos, ns * 3);
          ns++;
        } else if (b.kind === "confetti" && nc < CONFETTI_CAP) {
          confetti.setMatrixAt(nc, dummy.matrix);
          confetti.setColorAt(nc, confettiColors[p.color]);
          nc++;
        }
      }
    }
    stars.count = ns;
    stars.instanceMatrix.needsUpdate = true;
    starHaloGeo.setDrawRange(0, ns);
    (starHaloGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    confetti.count = nc;
    confetti.instanceMatrix.needsUpdate = true;
    if (confetti.instanceColor) confetti.instanceColor.needsUpdate = true;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(100, now - last);
    last = now;
    orbitMs += dt * (phase === "settled" ? 0.5 : 1);

    if (phase === "burst" || phase === "reveal") {
      const ms = now - burstStart;
      if (ms >= AFTER_BURST_END_MS) enter("settled");
      else if (phase === "burst" && ms >= BURST_MS) phase = "reveal";
    }
    if (phase === "swap") {
      const t = now - phaseStart;
      if (pendingTurn && t >= SWAP_SINK_MS) finishSwap();
      if (t >= SWAP_MS) enter("idle");
    }

    const tMs = phase === "burst" || phase === "reveal" ? now - burstStart : now - phaseStart;
    apply(poseAt(phase, tMs, { chargeMs, isGold, reducedMotion: opts.reducedMotion, orbitMs }), now);

    for (const b of bursts) stepBurst(b, dt / 1000);
    syncParticles();
    renderer.render(scene, camera);

    if (!statsSent && phase === "idle") {
      stats.push(dt);
      if (stats.length >= STATS_FRAMES) {
        statsSent = true;
        opts.onFrameStats(stats.slice());
      }
    }
  }

  function start() {
    if (raf || disposed) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const onVisibility = () => (document.hidden ? stop() : start());
  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
    opts.onFailure();
  };
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onLost);

  applyQuality();
  renderer.setSize(400, 400, false);
  camera.aspect = 1;
  camera.updateProjectionMatrix();
  start();

  return {
    canvas,
    renderer,
    setTurn(turn) {
      if (disposed) return;
      if (turnKey === null) {
        turnKey = turn.turnKey;
        isGold = turn.isGold;
        gift.setPalette(turn.palette, turn.isGold);
        enter(turn.resumedOpen ? "settled" : "idle");
        return;
      }
      if (turn.turnKey === turnKey) {
        if (turn.isGold !== isGold) {
          isGold = turn.isGold;
          gift.setPalette(turn.palette, isGold);
        }
        return;
      }
      turnKey = turn.turnKey;
      pendingTurn = turn;
      bursts = [];
      enter("swap");
    },
    setAnim(anim, ms) {
      if (disposed) return;
      chargeMs = ms;
      if (anim === "charging" && (phase === "idle" || phase === "swap")) {
        finishSwap();
        enter("charging");
      } else if (anim === "burst" && (phase === "idle" || phase === "swap" || phase === "charging")) {
        finishSwap();
        burstStart = performance.now();
        enter("burst");
        spawn();
      } else if (anim === "shown" && (phase === "idle" || phase === "swap" || phase === "charging")) {
        // ฉากโหลดเสร็จช้ากว่าการเปิดกล่อง หรือกลับมาจากเกมค้าง — ข้ามไปท่าค้างเลย
        finishSwap();
        enter("settled");
      }
    },
    setQuality(q) {
      if (disposed || q === quality) return;
      quality = q;
      applyQuality();
    },
    setSize(width, height) {
      if (disposed) return;
      const w = Math.max(1, Math.floor(width));
      const h = Math.max(1, Math.floor(height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      // ถอด listener ก่อน forceContextLoss ไม่งั้น onLost จะยิง onFailure
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      gift.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Sprite) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      glowTex.dispose();
      beamTex.dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
```

หมายเหตุ `stars.dispose()`/`confetti.dispose()`: `InstancedMesh` เป็น subclass ของ `Mesh` จึงถูก traverse ด้านบนแล้ว (geometry + material) — ไม่ต้องเรียกแยก

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit`
Expected: ไม่มี error (ถ้า `RoundedBoxGeometry`/`RoomEnvironment` import ไม่เจอ type ให้ตรวจว่าใช้ path `three/examples/jsm/...js` ตรงกับไฟล์ใน `node_modules/@types/three/examples/jsm/`)

Run: `npx eslint app/gift-exchange`
Expected: ไม่มี error

Run: `npm test`
Expected: PASS ทั้งหมด

- [ ] **Step 4: Commit**

```bash
git add app/gift-exchange/three/giftModel.ts app/gift-exchange/three/giftScene.ts
git commit -m "feat(gift-exchange): build the 3D gift model and scene controller"
```

---

### Task 5: ต่อฉาก 3D เข้าเวที + ดูของจริงในเบราว์เซอร์

**Files:**
- Create: `app/gift-exchange/three/useGiftScene.ts`
- Create: `app/gift-exchange/three/SceneHost.tsx`
- Modify: `app/gift-exchange/GiftStage.tsx`
- Modify: `app/gift-exchange/GiftExchangeApp.tsx`
- Modify: `app/gift-exchange/GiftExchange.module.css` (ต่อท้าย)

**Interfaces:**
- Consumes: `GiftSceneController`, `createGiftScene` (Task 4, ผ่าน `import()`); `RenderMode`, `initialMode`, `judgeFrames`, `readSavedMode`, `writeSavedMode` (Task 2); `browserStorage` จาก `../chainModel`; `reducedMotion` จาก `../fx`
- Produces:
  ```ts
  useGiftScene(active: boolean): { scene: GiftSceneController | null; mode: RenderMode; chooseMode(m: "3d-high" | "2d"): void }
  <SceneHost scene={GiftSceneController} />
  // GiftStage props ใหม่: turnKey: string; scene: GiftSceneController | null
  ```

- [ ] **Step 1: เขียน `useGiftScene.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { browserStorage } from "../chainModel";
import { reducedMotion } from "../fx";
import type { GiftSceneController } from "./giftScene";
import { initialMode, judgeFrames, readSavedMode, writeSavedMode, type RenderMode } from "./renderMode";

/** three.js ทั้งก้อนอยู่หลัง import() นี้ — โหลดเฉพาะหน้า /gift-exchange */
const loadScene = () => import("./giftScene");

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * ถือโหมดภาพและ controller ฉาก 3D — สร้าง controller ครั้งเดียวต่อช่วงที่ `active`
 * (อยู่บนเวที) และทำลายเมื่อออกจากเวที จึงมี WebGL context เดียวไม่ว่าจะกี่ตา
 */
export function useGiftScene(active: boolean) {
  const [mode, setMode] = useState<RenderMode>("2d");
  const [scene, setScene] = useState<GiftSceneController | null>(null);
  const modeRef = useRef(mode);
  const manualRef = useRef(false);
  const measuredRef = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  });

  // ตัดสินโหมดหลัง mount (ต้องใช้ DOM) แล้ว preload three.js ระหว่างครูอยู่จอตั้งค่า
  useEffect(() => {
    const t = window.setTimeout(() => {
      const saved = readSavedMode(browserStorage());
      manualRef.current = saved?.manual ?? false;
      const m = initialMode({ webgl: detectWebGL(), saved });
      setMode(m);
      if (m !== "2d") loadScene().catch(() => {});
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const want3d = active && mode !== "2d";

  useEffect(() => {
    if (!want3d) return;
    let cancelled = false;
    let created: GiftSceneController | null = null;
    // ล้มเหลวกลางทาง (โหลดไม่ได้ / GPU รีเซ็ต) → 2D เฉพาะรอบนี้ ไม่บันทึก
    const fail = () => {
      if (!cancelled) setMode("2d");
    };
    loadScene()
      .then((m) => {
        if (cancelled) return;
        try {
          created = m.createGiftScene({
            quality: modeRef.current === "3d-low" ? "low" : "high",
            reducedMotion: reducedMotion(),
            onFrameStats: (samples) => {
              if (measuredRef.current) return;
              measuredRef.current = true;
              const next = judgeFrames(modeRef.current, samples, manualRef.current);
              if (next === modeRef.current) return;
              setMode(next);
              writeSavedMode(browserStorage(), { mode: next, manual: manualRef.current });
            },
            onFailure: fail,
          });
          setScene(created);
        } catch {
          fail();
        }
      })
      .catch(fail);
    return () => {
      cancelled = true;
      created?.dispose();
      setScene(null);
    };
  }, [want3d]);

  useEffect(() => {
    scene?.setQuality(mode === "3d-low" ? "low" : "high");
  }, [scene, mode]);

  const chooseMode = useCallback((m: "3d-high" | "2d") => {
    manualRef.current = true;
    setMode(m);
    writeSavedMode(browserStorage(), { mode: m, manual: true });
  }, []);

  return { scene: want3d ? scene : null, mode, chooseMode };
}
```

ถ้า ESLint แจ้ง `react-hooks/set-state-in-effect` ที่ `setScene(null)` ใน cleanup: ลบบรรทัดนั้นทิ้ง (ค่าที่คืนออกไปถูกกรองด้วย `want3d ? scene : null` อยู่แล้ว และ controller ที่ถูก dispose แล้วไม่ทำอะไรเมื่อถูกเรียก) แล้วบันทึกเป็น ruling

- [ ] **Step 2: เขียน `SceneHost.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { GiftSceneController } from "./giftScene";
import styles from "../GiftExchange.module.css";

/** วาง canvas ของฉาก 3D (ตัวเดียวใช้ข้ามตา) ลงในตำแหน่งกล่องของตานี้ และส่งขนาดให้ renderer */
export default function SceneHost({ scene }: { scene: GiftSceneController }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.appendChild(scene.canvas);
    const ro = new ResizeObserver(([entry]) => {
      scene.setSize(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(host);
    return () => {
      ro.disconnect();
      if (scene.canvas.parentNode === host) host.removeChild(scene.canvas);
    };
  }, [scene]);

  return <div ref={ref} className={styles.sceneHost} aria-hidden="true" />;
}
```

- [ ] **Step 3: แก้ `GiftStage.tsx`**

3.1 import — แทรกต่อจาก `import type { GiftSound } from "./useGiftSound";`:

```tsx
import SceneHost from "./three/SceneHost";
import type { GiftSceneController } from "./three/giftScene";
```

3.2 Props — เพิ่มสองบรรทัดใน `type Props` และ destructure:

```tsx
  turnKey: string;
  scene: GiftSceneController | null;
```

(ใน destructure ของ function เพิ่ม `turnKey,` และ `scene,` ต่อท้าย `rosterButton,`)

3.3 แทนบรรทัด `const lastBox = isLastBox || closesLoop;` ด้วย:

```tsx
  const lastBox = isLastBox || closesLoop;
  const palette = lastBox ? GOLD : paletteFor(paletteIndex);
  const animRef = useRef(anim);

  useEffect(() => {
    animRef.current = anim;
  });

  // ฉาก 3D ตัวเดียวใช้ข้ามตา: turnKey เปลี่ยน = ท่าสลับกล่อง; mount ตอนกล่องเปิดแล้ว = กลับจากเกมค้าง
  useEffect(() => {
    scene?.setTurn({ turnKey, palette, isGold: lastBox, resumedOpen: animRef.current === "shown" });
  }, [scene, turnKey, palette, lastBox]);

  useEffect(() => {
    scene?.setAnim(anim, chargeMs);
  }, [scene, anim, chargeMs]);
```

3.4 ใน `open` — คอนเฟตตี DOM ปิดในโหมด 3D (มีคอนเฟตตี 3D แทน):

แทน `        onCannons();` ด้วย `        if (!scene) onCannons();`
แทน `        if (final) onFireworks();` ด้วย `        if (final && !scene) onFireworks();`
และเพิ่ม `scene` ใน dependency array ของ `useCallback`: `[anim, isLastBox, onCannons, onFireworks, onOpen, play, scene]`

3.5 render — แทนบรรทัด flash:

```tsx
      {anim === "burst" && !scene && <div className={styles.flash} />}
```

และแทนเนื้อหา `.boxArea` ตั้งแต่ `<div className={styles.spotlight} />` จนจบ `</button>` ด้วย:

```tsx
        {scene ? (
          <SceneHost scene={scene} />
        ) : (
          <>
            <div className={styles.spotlight} />
            <div className={`${styles.beams} ${anim === "burst" || anim === "shown" ? styles.beamsOn : ""}`} />
          </>
        )}
        <button
          type="button"
          className={styles.boxBtn}
          onClick={open}
          disabled={anim !== "idle"}
          aria-label={`เปิดกล่องของขวัญของ ${giverLabel}`}
        >
          {!scene && <GiftBox palette={palette} state={anim === "shown" ? "open" : anim} chargeMs={chargeMs} />}
        </button>
```

- [ ] **Step 4: แก้ `GiftExchangeApp.tsx`**

4.1 import — ต่อจาก `import { useGiftSound } from "./useGiftSound";`:

```tsx
import { useGiftScene } from "./three/useGiftScene";
```

4.2 ต่อจากบรรทัด `const screen = resumable ? ... ;`:

```tsx
  const { scene, mode: renderMode, chooseMode } = useGiftScene(screen === "stage");
```

4.3 ใน `.barActions` แทรกก่อนปุ่มเสียง:

```tsx
          {screen === "stage" && (
            <button
              type="button"
              className={styles.iconBtn}
              aria-label={renderMode === "2d" ? "เปลี่ยนเป็นภาพ 3D" : "เปลี่ยนเป็นภาพ 2D"}
              onClick={() => chooseMode(renderMode === "2d" ? "3d-high" : "2d")}
            >
              ✨ <span className={styles.iconBtnLabel}>{renderMode === "2d" ? "3D" : "2D"}</span>
            </button>
          )}
```

4.4 ใน `<GiftStage` เพิ่ม props:

```tsx
            turnKey={turn.giverId}
            scene={scene}
```

- [ ] **Step 5: ต่อท้าย CSS**

```css
/* ===== ฉาก 3D ===== */
/* canvas ใหญ่กว่า .boxArea ให้มีที่ให้กล้องเชิดขึ้นและดาวพุ่ง; .shell ซ่อนส่วนที่ล้น */
.sceneHost {
  position: absolute;
  inset: -35% -45%;
  z-index: 0;
  pointer-events: none;
}

.boxArea > .boxBtn {
  z-index: 1;
}
```

- [ ] **Step 6: Typecheck + lint + เทสต์ แล้วเล่นจริง**

Run: `npx tsc --noEmit` แล้ว `npx eslint app/gift-exchange` แล้ว `npm test`
Expected: ไม่มี error, เทสต์ผ่าน

เปิด preview (`preview_start` name `khuncool-dev`) → `/gift-exchange` → ล้าง localStorage → ใส่ชื่อ 5 คน → เริ่ม → ไปที่กล่อง แล้วตรวจ:

1. console ไม่มี error; มี `<canvas>` ใน `.boxArea` หนึ่งตัว; ไม่มีกล่อง SVG
2. screenshot ท่า ① (รอ): กล่อง 3D ผิวมันวาว มีโบว์ ริบบิ้น เงาบนพื้น พื้นหลัง CSS + หิมะเห็นทะลุ — screenshot อีกครั้งห่าง 3 วินาที เห็นมุมกล้องเปลี่ยน (โคจร)
3. แตะกล่อง → screenshot ที่ ~1.5s (ท่า ②: กล้องใกล้ขึ้น ร่องฝาเรืองแสง), ~2.1s (ท่า ③: ฝาพุ่งออกซ้าย ดาว+คอนเฟตตี), ~3.5s (ท่า ④: กล้องเชิดขึ้น ชื่อ HTML อยู่ในลำแสง)
4. กด "ต่อไป" → screenshot ระหว่าง 0–0.8s (ท่า ⑥ กล่องใหม่สีใหม่หล่นลงมา) และหลังจากนั้น (ท่า ①)
5. Review Focus #3: เปิดกล่องแล้ว รีเฟรช → "เล่นต่อ" → ฉากเริ่มที่กล่องเปิด ไม่มีฝา ไม่มีระเบิดซ้ำ
6. Review Focus #2: แตะกล่องแล้วกด "✨ 2D" ภายใน 1 วินาที → ไม่มี error, เห็นกล่อง SVG ในสถานะเดียวกัน, ชื่อเผยตามเวลาเดิม; กด "✨ 3D" กลับ → ฉาก 3D กลับมา ทำงานตาถัดไปได้
7. ถ้าแสงฟุ้ง (halo/ลำแสง/ดาว) เป็นกรอบดำหรือมองไม่เห็นบนพื้นหลัง ให้ใช้ systematic-debugging ตรวจ `premultipliedAlpha` ของ context (`renderer.getContext().getContextAttributes()`) ก่อนแก้อย่างอื่น

แก้สิ่งที่เจอ (ปรับตัวเลขใน choreography ได้ถ้าภาพไม่สวย แต่ต้องให้เทสต์ Task 1 ยังผ่าน — ถ้าเปลี่ยนค่าที่เทสต์อ้าง เช่นระยะ 4.3 ให้บันทึก ruling) แล้ว screenshot ฉากละภาพไว้แนบรายงาน

- [ ] **Step 7: Commit**

```bash
git add app/gift-exchange/three/useGiftScene.ts app/gift-exchange/three/SceneHost.tsx app/gift-exchange/GiftStage.tsx app/gift-exchange/GiftExchangeApp.tsx app/gift-exchange/GiftExchange.module.css
git commit -m "feat(gift-exchange): open the gift in a 3D scene with a dolly-in camera"
```

---

### Task 6: ตรวจความทนทานและ build

**Files:** — (แก้เฉพาะที่เจอปัญหา)

- [ ] **Step 1: build + chunk**

Run: `npm run build`
Expected: ผ่าน, `/gift-exchange` เป็น static

ตรวจว่า three.js ไม่หลุดไปหน้าอื่น:
Run: `grep -l "WebGLRenderer" .next/static/chunks/*.js | head` แล้วเปิด `/` และ `/tools` ใน preview ดู `read_network_requests` ว่าไม่โหลด chunk นั้น
Expected: chunk ที่มี `WebGLRenderer` ถูกโหลดเฉพาะบน `/gift-exchange`

- [ ] **Step 2: Review Focus #1 — ห้อง 40 คน**

ใน preview: ล้าง localStorage, ใส่ 40 ชื่อ, เริ่ม, แล้วใช้ `javascript_tool` วนกดกล่อง/ต่อไปจนจบ (แบ่งเป็นหลายรอบเรียก ≤ 40 วินาทีต่อรอบ) โดยก่อนเริ่มและทุก 10 ตาเก็บค่า:
```js
const c = document.querySelectorAll("canvas").length;
// renderer ไม่ได้ผูกกับ window — อ่านผ่าน React ไม่ได้ ให้ใช้ค่าจาก WEBGL debug ไม่ได้เช่นกัน
// จึงเพิ่ม hook ชั่วคราวเฉพาะ dev: ใน useGiftScene หลัง setScene(created) ใส่
// if (process.env.NODE_ENV !== "production") (window as unknown as { __giftScene?: unknown }).__giftScene = created;
```
แล้วอ่าน `window.__giftScene.renderer.info.memory` และ `window.__giftScene.renderer.info.programs.length`
Expected: จำนวน canvas = 1 ตลอด, `geometries`/`textures`/`programs` คงที่ (±0) ระหว่างตาที่ 10, 20, 30, 40

ถ้าเพิ่ม hook dev นั้น ให้คงไว้ได้ (มีผลเฉพาะ dev) และ commit พร้อมงานนี้

- [ ] **Step 3: Review Focus #4 — context lost**

ระหว่างกล่องกำลังสั่น:
```js
window.__giftScene.renderer.getContext().getExtension("WEBGL_lose_context").loseContext();
```
Expected: สลับเป็นกล่อง SVG ทันที, ชื่อเผยตามเวลา, กด "ต่อไป" เล่นต่อได้, console ไม่มี error ค้าง, ปุ่มแสดง "✨ 3D"

- [ ] **Step 4: Review Focus #5 + โหมดบังคับ**

- `localStorage["khuncool.giftexchange.render"] = "3d-low"` → รีโหลด → เล่น 1 ตา: ไม่มีเงา ไม่มี halo, คอนเฟตตีน้อยลง, ไม่ error
- `"2d:manual"` → รีโหลด → กล่อง SVG เดิมทำงานครบ, ไม่มี request โหลด chunk three.js (`read_network_requests`)
- ค่าเสีย `"xyz"` → รีโหลด → ได้ 3D ตามปกติ

- [ ] **Step 5: จอและเต็มจอ**

- `resize_window` mobile 375×812: ไม่มี scroll แนวนอน, กล่อง 3D อยู่ในกรอบ, ชื่อไม่ถูก canvas บัง
- กลับ desktop, กดเต็มจอ: canvas ปรับขนาดตาม (กล่องไม่ยืด/บี้), `.shell` ไม่ล้น (scrollHeight = clientHeight)
- `resize_window` preset desktop ก่อนจบ

- [ ] **Step 6: ชุดตรวจสุดท้าย**

Run: `npm test` → PASS
Run: `npm run lint` → ไม่มี error
Run: `npx tsc --noEmit` → ไม่มี error

- [ ] **Step 7: Commit การแก้ (ถ้ามี)**

```bash
git add -A app/gift-exchange
git commit -m "fix(gift-exchange): <สิ่งที่แก้>"
```
