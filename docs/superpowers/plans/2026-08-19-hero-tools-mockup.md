# Hero Tools Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the empty right-hand space of the homepage hero (visible at `lg:` and up) with a small animated preview showing khuncool's real tools cycling in pairs, matching [docs/superpowers/specs/2026-08-19-hero-tools-mockup-design.md](../specs/2026-08-19-hero-tools-mockup-design.md).

**Architecture:** One new presentational component (`HeroToolsMockup`) rendered inside the existing `HeroSection`, gated to `hidden lg:block`. All animation (floating bob + pair-cycling fade) is pure CSS keyframes scoped in a `<style>` tag inside the component — no client JS, no state, so the component stays a server component. Tool-pair content lives in a local data array inside the component file.

**Tech Stack:** Next.js (App Router), React server components, Tailwind CSS + inline `<style>` for keyframes not expressible in Tailwind's utility classes.

**Note on testing:** This repository has no test runner configured (`package.json` only has `dev`/`build`/`start`/`lint` scripts — no `test` script, no Jest/Vitest, no existing `*.test.*` files). This component is pure presentational CSS/markup with no logic to unit test. Verification steps below use `npm run lint`, `npm run build`, and a manual visual check in the browser preview instead of automated tests.

---

### Task 1: Tool-pair data

**Files:**
- Create: `components/home/heroToolsMockupData.ts`

- [ ] **Step 1: Write the data file**

```typescript
// Static content for the animated hero tools mockup (decorative preview only).

export type HeroMockupTool = {
  kind: "wheel" | "groups" | "meter" | "familyTree" | "duckRace" | "scoreboard" | "timer" | "attendance";
  label: string;
};

export type HeroMockupPair = {
  primary: HeroMockupTool;
  secondary: HeroMockupTool;
};

export const HERO_MOCKUP_PAIRS: HeroMockupPair[] = [
  {
    primary: { kind: "wheel", label: "วงล้อสุ่มชื่อ" },
    secondary: { kind: "groups", label: "แบ่งกลุ่มนักเรียน" },
  },
  {
    primary: { kind: "meter", label: "วัดเสียงในห้อง" },
    secondary: { kind: "familyTree", label: "Family Tree" },
  },
  {
    primary: { kind: "duckRace", label: "เกมเป็ดสุ่มชื่อ" },
    secondary: { kind: "scoreboard", label: "กระดานคะแนนกลุ่ม" },
  },
  {
    primary: { kind: "timer", label: "จับเวลา" },
    secondary: { kind: "attendance", label: "เช็กชื่อนักเรียน" },
  },
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `heroToolsMockupData.ts`

- [ ] **Step 3: Commit**

```bash
git add components/home/heroToolsMockupData.ts
git commit -m "feat: add hero tools mockup pair data"
```

---

### Task 2: `HeroToolsMockup` component

**Files:**
- Create: `components/home/HeroToolsMockup.tsx`
- Read for reference: `components/home/HeroSection.tsx`, `components/home/data.ts` (color tokens: `#E1E3FD`, `#D0FBEF`, `#FFEAD5`)

- [ ] **Step 1: Write the component**

```tsx
import { HERO_MOCKUP_PAIRS, type HeroMockupTool } from "@/components/home/heroToolsMockupData";

function ToolFace({ tool }: { tool: HeroMockupTool }) {
  switch (tool.kind) {
    case "wheel":
      return (
        <>
          <div className="mx-auto mb-2 h-[92px] w-[92px] animate-hero-spin rounded-full bg-[conic-gradient(#7C5CFC_0deg_60deg,#A7FFEB_60deg_130deg,#FFD08A_130deg_195deg,#C9CBFB_195deg_260deg,#FF9E9E_260deg_320deg,#9AE6B4_320deg_360deg)]">
            <div className="mx-auto mt-[24px] h-[44px] w-[44px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.12)]" />
          </div>
          <p className="text-center text-[10.5px] text-ink-secondary">
            🎉 <b className="text-ink">สมชาย ใจดี</b>
          </p>
        </>
      );
    case "groups":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">แบ่งกลุ่ม · 4 กลุ่ม</p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-[#E1E3FD] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 1 <span className="text-ink-secondary/70">7 คน</span>
            </div>
            <div className="rounded-lg bg-[#D0FBEF] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 2 <span className="text-ink-secondary/70">7 คน</span>
            </div>
            <div className="rounded-lg bg-[#FFEAD5] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 3 <span className="text-ink-secondary/70">6 คน</span>
            </div>
            <div className="rounded-lg bg-[#E1E3FD] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 4 <span className="text-ink-secondary/70">6 คน</span>
            </div>
          </div>
        </>
      );
    case "meter":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">ระดับเสียงในห้อง</p>
          <div className="flex h-[70px] items-end gap-1.5">
            {[30, 55, 80, 45, 65, 35].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded bg-[#D0FBEF]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-center text-[10.5px] text-ink-secondary">ระดับ: ปานกลาง</p>
        </>
      );
    case "familyTree":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">Family Tree</p>
          <div className="flex flex-col items-center gap-1.5 text-[9.5px] font-semibold text-ink-secondary">
            <div className="rounded-lg bg-[#FFEAD5] px-3 py-1">Grandpa · Grandma</div>
            <div className="h-2 w-px bg-border-strong" />
            <div className="rounded-lg bg-[#E1E3FD] px-3 py-1">Father · Mother</div>
            <div className="h-2 w-px bg-border-strong" />
            <div className="rounded-lg bg-[#D0FBEF] px-3 py-1">Me</div>
          </div>
        </>
      );
    case "duckRace":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">เกมเป็ดสุ่มชื่อ</p>
          <div className="flex items-center justify-between text-[20px]">
            <span>🦆</span>
            <span>🦆</span>
            <span>🦆</span>
          </div>
          <p className="mt-1.5 text-center text-[10.5px] text-ink-secondary">
            🏁 <b className="text-ink">น้องพลอย ถึงก่อน!</b>
          </p>
        </>
      );
    case "scoreboard":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">กระดานคะแนนกลุ่ม</p>
          <div className="flex flex-col gap-1 text-[9.5px] font-semibold text-ink-secondary">
            <div className="flex justify-between rounded-lg bg-[#E1E3FD] px-2 py-1">
              <span>กลุ่ม 1</span><span>120</span>
            </div>
            <div className="flex justify-between rounded-lg bg-[#D0FBEF] px-2 py-1">
              <span>กลุ่ม 2</span><span>95</span>
            </div>
          </div>
        </>
      );
    case "timer":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">จับเวลา</p>
          <p className="text-center font-anuphan text-[26px] font-bold text-ink">05:00</p>
        </>
      );
    case "attendance":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">เช็กชื่อนักเรียน</p>
          <div className="flex flex-col gap-1 text-[9.5px] font-semibold text-ink-secondary">
            <div className="flex justify-between">
              <span>สมชาย ใจดี</span><span>✅</span>
            </div>
            <div className="flex justify-between">
              <span>สมหญิง สายใจ</span><span>✅</span>
            </div>
          </div>
        </>
      );
  }
}

function Window({
  role,
  tool,
  pairIndex,
}: {
  role: "primary" | "secondary";
  tool: HeroMockupTool;
  pairIndex: number;
}) {
  return (
    <div
      key={pairIndex}
      className={
        role === "primary"
          ? "absolute left-[6%] top-[14%] z-[2] w-[190px] animate-hero-float-a rounded-2xl bg-white p-3 shadow-[0_14px_32px_rgba(30,20,90,.16)]"
          : "absolute left-[42%] top-[46%] z-[1] w-[190px] animate-hero-float-b rounded-2xl bg-white p-3 shadow-[0_14px_32px_rgba(30,20,90,.16)]"
      }
      style={{ animationDelay: role === "secondary" ? "0.3s" : undefined }}
    >
      <div className="mb-2 flex items-center gap-1.5 border-b border-border-strong/40 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF9E9E]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FFD08A]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#9AE6B4]" />
      </div>
      <ToolFace tool={tool} />
    </div>
  );
}

export default function HeroToolsMockup() {
  const pair = HERO_MOCKUP_PAIRS[0];

  return (
    <div
      aria-hidden="true"
      className="relative hidden h-[300px] w-full max-w-[420px] overflow-hidden rounded-[20px] lg:block"
    >
      <span className="pointer-events-none absolute left-3 top-3 z-[3] rounded-full border border-border-strong/60 bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm">
        สลับอัตโนมัติ
      </span>
      <Window role="primary" tool={pair.primary} pairIndex={0} />
      <Window role="secondary" tool={pair.secondary} pairIndex={0} />
      <style>{`
        @keyframes hero-float-a { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes hero-float-b { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes hero-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-hero-float-a { animation: hero-float-a 4s ease-in-out infinite; }
        .animate-hero-float-b { animation: hero-float-b 4.4s ease-in-out infinite; }
        .animate-hero-spin { animation: hero-spin 6s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-hero-float-a, .animate-hero-float-b, .animate-hero-spin {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
```

Note: this first version renders only the first pair statically (no auto-cycling yet) — Task 3 adds the CSS-only cycling across all pairs.

- [ ] **Step 2: Verify it compiles and lints**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroToolsMockup.tsx
git commit -m "feat: add static HeroToolsMockup component"
```

---

### Task 3: CSS-only pair cycling

**Files:**
- Modify: `components/home/HeroToolsMockup.tsx`

- [ ] **Step 1: Render every pair stacked in the same slot, driven by a per-pair CSS animation**

Replace the body of `HeroToolsMockup` (from `const pair = ...` through the `<Window .../>` calls) with a render of all pairs, each absolutely positioned in the same spot, visible only during its slice of the cycle:

```tsx
const CYCLE_SECONDS = 8;
const PAIR_COUNT = HERO_MOCKUP_PAIRS.length;

export default function HeroToolsMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden h-[300px] w-full max-w-[420px] overflow-hidden rounded-[20px] lg:block"
    >
      <span className="pointer-events-none absolute left-3 top-3 z-[3] rounded-full border border-border-strong/60 bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm">
        สลับอัตโนมัติ
      </span>
      {HERO_MOCKUP_PAIRS.map((pair, i) => (
        <div
          key={i}
          className="absolute inset-0 animate-hero-pair-cycle opacity-0"
          style={{ animationDelay: `${i * CYCLE_SECONDS}s` }}
        >
          <Window role="primary" tool={pair.primary} pairIndex={i} />
          <Window role="secondary" tool={pair.secondary} pairIndex={i} />
        </div>
      ))}
      <style>{`
        @keyframes hero-float-a { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes hero-float-b { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes hero-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hero-pair-cycle {
          0% { opacity: 0; }
          3% { opacity: 1; }
          ${100 / PAIR_COUNT - 3}% { opacity: 1; }
          ${100 / PAIR_COUNT}% { opacity: 0; }
          100% { opacity: 0; }
        }
        .animate-hero-float-a { animation: hero-float-a 4s ease-in-out infinite; }
        .animate-hero-float-b { animation: hero-float-b 4.4s ease-in-out infinite; }
        .animate-hero-spin { animation: hero-spin 6s linear infinite; }
        .animate-hero-pair-cycle {
          animation: hero-pair-cycle ${CYCLE_SECONDS * PAIR_COUNT}s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-hero-float-a, .animate-hero-float-b, .animate-hero-spin {
            animation: none;
          }
          .animate-hero-pair-cycle {
            animation: none;
            opacity: 0;
          }
          .animate-hero-pair-cycle:first-child {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
```

This keeps `CYCLE_SECONDS` and `PAIR_COUNT` from Task 2 in use: each pair's wrapper is invisible (`opacity: 0`) by default, and the shared `hero-pair-cycle` keyframe (one loop = `CYCLE_SECONDS * PAIR_COUNT` seconds) becomes visible only during its `animationDelay`-shifted slice, then fades out — so the four pairs appear one at a time. Under reduced motion, only the first pair's wrapper (`:first-child`) is forced visible and no animation runs.

- [ ] **Step 2: Verify it compiles and lints**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroToolsMockup.tsx
git commit -m "feat: cycle HeroToolsMockup through all tool pairs via CSS"
```

---

### Task 4: Wire into `HeroSection`

**Files:**
- Modify: `components/home/HeroSection.tsx`

- [ ] **Step 1: Import the component and add it to the layout**

Add the import at the top of `components/home/HeroSection.tsx`:

```tsx
import Link from "next/link";
import HeroToolsMockup from "@/components/home/HeroToolsMockup";
```

Change the `<section>` so the existing text `<div>` and the new mockup sit side by side. Replace:

```tsx
    <section
      className="px-4 pb-5 pt-[22px] md:px-6 md:pb-7 md:pt-[34px] lg:px-8 lg:pb-9 lg:pt-12"
      style={{
        background: "radial-gradient(120% 90% at 100% 0%, #EFF0FE, #fff)",
      }}
    >
      <div className="lg:max-w-[680px] md:max-w-[560px]">
```

with:

```tsx
    <section
      className="px-4 pb-5 pt-[22px] md:px-6 md:pb-7 md:pt-[34px] lg:flex lg:items-center lg:justify-between lg:gap-6 lg:px-8 lg:pb-9 lg:pt-12"
      style={{
        background: "radial-gradient(120% 90% at 100% 0%, #EFF0FE, #fff)",
      }}
    >
      <div className="lg:max-w-[680px] md:max-w-[560px]">
```

Then, right after the closing `</div>` of that text block (the one containing the CTA `<Link>`s, immediately before the `</section>` closing tag), add:

```tsx
      <HeroToolsMockup />
```

- [ ] **Step 2: Verify it compiles and lints**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: render HeroToolsMockup in the homepage hero"
```

---

### Task 5: Manual visual verification

No files change in this task — it's a verification-only pass using the dev server.

- [ ] **Step 1: Start the dev server preview**

Use the Browser pane's `preview_start` with `{ name: "dev" }` (add a `dev` entry to `.claude/launch.json` if missing: `runtimeExecutable: "npm"`, `runtimeArgs: ["run", "dev"]`, `port: 3000`), then navigate to `http://localhost:3000/`.

- [ ] **Step 2: Confirm desktop rendering**

Resize the preview to the `desktop` preset. Confirm: the hero's right side shows two overlapping floating windows; over ~32s (4 pairs × 8s) the content cycles through all four pairs (wheel+groups → meter+familyTree → duckRace+scoreboard → timer+attendance) and back to the first.

- [ ] **Step 3: Confirm mobile/tablet hides the mockup**

Resize to the `mobile` preset (375×812) and reload. Confirm the mockup is not rendered and the hero looks the same as before this change (text + CTA buttons only, no empty gap or overflow).

- [ ] **Step 4: Confirm reduced-motion fallback**

In `javascript_tool`, run a media-query override is not directly possible from the page; instead use the OS/browser's reduced-motion emulation if available in the Browser pane, or verify by reading the component's CSS (`prefers-reduced-motion: reduce` block) confirms `animation: none` is applied to all three animation classes and the first pair is forced to `opacity: 1`. If the Browser pane cannot emulate `prefers-reduced-motion`, do this check by code inspection instead of live rendering, and note that in the summary.

- [ ] **Step 5: Screenshot and share**

Take a screenshot (`computer` `screenshot` action) of the desktop hero showing the mockup, and share it in the response.
