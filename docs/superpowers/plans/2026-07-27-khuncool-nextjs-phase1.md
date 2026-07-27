# khuncool Next.js Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate all 21 khuncool screens as a Next.js (App Router, TypeScript, Tailwind) app with pixel-fidelity to `screens/*.dc.html`, correct routes, and ported SEO metadata — no real backend yet.

**Architecture:** Single Next.js app rooted at repo root. One route folder per page per the README table. Shared `Header`/`AccountSheet`/`Footer` in root `layout.tsx`. Tailwind theme encodes the design tokens once; every page consumes it via utility classes. Tool pages are pure client/localStorage; app pages (Attendance/Savings/Homeroom) call a stub `useCloudSync` hook so Phase 2 can fill in real Supabase without touching page code.

**Tech Stack:** Next.js (App Router, TS), Tailwind CSS, SheetJS (`xlsx`) for Excel import/export.

**Source format note:** Each `screens/*.dc.html` is a design-tool export, not real markup — it wraps **both** a MOBILE (390px) and DESKTOP (1024–1280px) frame in one file, using pseudo-directives (`x-dc`, `sc-if`, `sc-for`, `x-import`, `style-hover`, `{{ }}` bindings) that are NOT real HTML/JS. When porting a page: read past these directives to the real structure/copy/classes-worth-of-inline-styles, treat the two frames as **one responsive component** (mobile styles by default, desktop via `md:`/`lg:` breakpoints), and ignore the "MOBILE"/"DESKTOP" labels and frame borders — those are annotations for the design doc, not app UI. Cross-check the matching `screenshots/<Name>.png` for visual confirmation.

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `app/globals.css`, `.gitignore`

- [ ] **Step 1: Run create-next-app**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```
Answer prompts to install into the current (non-empty) directory if asked.

- [ ] **Step 2: Install SheetJS**

```bash
npm install xlsx
```

- [ ] **Step 3: Verify dev server boots**

Run: `npm run dev` then check `http://localhost:3000` loads the default Next.js page.
Expected: page renders with no console errors. Stop the server after confirming.

- [ ] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js app"
```

---

## Task 2: Tailwind design tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx` (Google Fonts links)

- [ ] **Step 1: Add color/font/radius/shadow tokens to `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#5C5EE6", hover: "#4A46D6" },
        accent: "#14B79A",
        ink: { DEFAULT: "#1A1D26", secondary: "#5A6273", muted: "#7C8494", faint: "#A9B0BE" },
        surface: { app: "#EAECF1", panel: "#F1F3F6", light: "#F8F9FB", card: "#ffffff" },
        border: { DEFAULT: "#E5E8EE", strong: "#D3D8E1" },
        success: { text: "#0A9380", bg: "#D0FBEF" },
        warning: { text: "#92600A", bg: "#FFFBEB", border: "#FDE68A" },
        error: { text: "#B91C1C", bg: "#FEF2F2", border: "#FCA5A5", strong: "#DC2626" },
      },
      fontFamily: {
        sarabun: ["var(--font-sarabun)", "system-ui", "sans-serif"],
        anuphan: ["var(--font-anuphan)", "system-ui", "sans-serif"],
        fredoka: ["var(--font-fredoka)", "var(--font-anuphan)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: { card: "16px", "card-lg": "20px", pill: "999px" },
      boxShadow: {
        cta: "0 8px 20px -6px rgba(92,94,230,.5)",
        frame: "0 30px 70px -20px rgba(26,29,38,.4)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5C5EE6, #14B79A)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Load fonts in root layout via `next/font/google`**

```tsx
// app/layout.tsx (font setup portion)
import { Sarabun, Anuphan, Fredoka, IBM_Plex_Mono } from "next/font/google";

const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-sarabun" });
const anuphan = Anuphan({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-anuphan" });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fredoka" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });
```
Apply all four `.variable` classes plus `font-sarabun` to `<html>` or `<body>` in the same file (full layout body built in Task 3).

- [ ] **Step 3: Base styles in `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-surface-app text-ink font-sarabun antialiased;
  line-height: 1.5;
}
h1, h2, h3 {
  @apply font-anuphan font-bold tracking-tight;
}
a {
  @apply text-primary-hover;
}
a:hover {
  color: #3D38B4;
}
::selection {
  background: #C6C9FB;
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: builds successfully, no Tailwind config errors.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat: add khuncool design tokens to Tailwind theme"
```

---

## Task 3: Static assets, sitemap, robots

**Files:**
- Create: `public/assets/*` (copied from `assets/`)
- Create: `public/sitemap.xml`
- Create: `public/robots.txt`

- [ ] **Step 1: Copy assets and reference files into `public/`**

```bash
mkdir -p public/assets
cp -r assets/* public/assets/
cp reference/sitemap.xml public/sitemap.xml
cp reference/robots.txt public/robots.txt
```

- [ ] **Step 2: Verify robots.txt disallows /account**

Read `public/robots.txt` and confirm it contains a `Disallow: /account` (or equivalent) rule. If the copied file doesn't, note it — the source file is treated as final per the handoff, so do not hand-edit; flag to the user instead if it's missing.

- [ ] **Step 3: Commit**

```bash
git add public
git commit -m "chore: add static assets, sitemap, robots"
```

---

## Task 4: Shared components — Header, AccountSheet (stub), Footer

**Files:**
- Create: `components/Header.tsx`
- Create: `components/AccountSheet.tsx`
- Create: `components/Footer.tsx`
- Create: `lib/useCloudSync.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Read the account UI reference**

Read `reference/khuncool-cloud.js` in full and `screens/Account.dc.html` to understand the states the account button/sheet must support: signed-out (sign-in/sign-up form, email+password and "Continue with Google" button), signed-in (profile summary + sign-out + sync status). Also check `screens/Home.dc.html` header markup (already read: logo + "khuncool" text + hamburger + account button, sticky, `backdrop-filter: blur`) as the pattern every page's header follows.

- [ ] **Step 2: Write `lib/useCloudSync.ts` stub**

```ts
"use client";

export type CloudSyncStatus = "local-only" | "syncing" | "synced" | "error";

export interface CloudSyncResult {
  status: CloudSyncStatus;
}

/**
 * Phase 1 stub: persistence is local-only, no network calls.
 * Phase 2 replaces the body with a real Supabase debounced mirror
 * to the `kc_state` table, keeping this same signature.
 */
export function useCloudSync<T>(_key: string, _state: T): CloudSyncResult {
  return { status: "local-only" };
}
```

- [ ] **Step 3: Write `components/AccountSheet.tsx`**

Build a client component with local `useState` for `open` (sheet visibility) and `mode` (`"signed-out" | "signed-in"`, hardcoded to `"signed-out"` in Phase 1 — no real session yet). Render the floating overlay (fixed position, backdrop, panel sliding in) matching `Account.dc.html`'s modal state, with:
- Signed-out: email input, password input, "เข้าสู่ระบบ / สมัครสมาชิก" submit button (disabled/no-op onClick in Phase 1 — just closes the sheet or shows a "coming soon" no-op; do not fabricate a fake logged-in state), "Continue with Google" button (same no-op treatment).
- A way to open/close: exported `useAccountSheet()` context hook (React Context + Provider) so `Header` (any page) can call `openAccountSheet()` and `/account/page.tsx` can render the same form content full-page instead of in a sheet.

Structure: `AccountSheetProvider` (context, wraps children in root layout), `AccountSheetOverlay` (the floating modal, rendered once in root layout), and export the shared form markup as `AccountForm` so `/account/page.tsx` can reuse it full-page.

- [ ] **Step 4: Write `components/Header.tsx`**

Client component. Props: none (reads `useAccountSheet()` from context for the account button `onClick`). Structure per `Home.dc.html`: sticky top bar, hamburger (opens a mobile nav drawer — local `useState`), logo image (`/assets/khuncool-logo.png`) + literal text "khuncool" (`font-fredoka font-bold`), nav links (desktop: `md:flex`, hidden on mobile behind drawer) for Tools/Apps/Articles/Shop, account button that calls `openAccountSheet()`.

- [ ] **Step 5: Write `components/Footer.tsx`**

Simple footer with khuncool branding, links to main sections, matching whatever footer markup is common across screen files (check `Home.dc.html` and `Tools.dc.html` bottom sections for the pattern — copy/links should match, not be invented).

- [ ] **Step 6: Wire into `app/layout.tsx`**

```tsx
import "./globals.css";
import { AccountSheetProvider, AccountSheetOverlay } from "@/components/AccountSheet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// ...font imports from Task 2...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} ${anuphan.variable} ${fredoka.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sarabun bg-surface-app text-ink">
        <AccountSheetProvider>
          <Header />
          {children}
          <Footer />
          <AccountSheetOverlay />
        </AccountSheetProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify**

Run: `npm run dev`, load `http://localhost:3000`.
Expected: default page renders with Header (logo+text+account button) and Footer; clicking account button opens the sheet; hamburger opens drawer. No console errors.

- [ ] **Step 8: Commit**

```bash
git add components lib app/layout.tsx
git commit -m "feat: add shared Header, AccountSheet (stub), Footer"
```

---

## Task 5: Home page (`/`)

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Port `screens/Home.dc.html`**

Read the full file (already partially read: announcement bar, sticky header — reuse `Header` component instead of re-implementing it inline, hero section, pillar list). Build `app/page.tsx` as a server component rendering the page body (excluding header/footer, which come from layout): announcement bar, hero, the 4-pillar cards, and any additional sections further down the file (tool highlights, article previews, shop teaser — read the rest of the file to confirm). Translate every inline `style="..."` into Tailwind classes using Task 2's tokens; treat the MOBILE frame as the default (unprefixed) styles and the DESKTOP frame as `md:`/`lg:` variants of the same elements, per the plan header's source-format note.

- [ ] **Step 2: Add `generateMetadata()`**

```ts
export const metadata = {
  title: "Khuncool | แหล่งรวมความรู้และเครื่องมือสำหรับครูไทย ใช้ฟรี",
  description: "ขุนคูล (Khuncool) ศูนย์รวมบทความครู สื่อการสอนออนไลน์ และแอปช่วยงานครู เช่น วงล้อสุ่มชื่อ เช็กชื่อ บันทึกโฮมรูม ใช้งานฟรีบนเว็บ ไม่ต้องติดตั้ง",
  alternates: { canonical: "https://www.khuncool.com/" },
  openGraph: {
    type: "website",
    title: "Khuncool | แหล่งรวมความรู้และเครื่องมือสำหรับครูไทย ใช้ฟรี",
    description: "ขุนคูล (Khuncool) ศูนย์รวมบทความครู สื่อการสอนออนไลน์ และแอปช่วยงานครู เช่น วงล้อสุ่มชื่อ เช็กชื่อ บันทึกโฮมรูม ใช้งานฟรีบนเว็บ ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/",
    images: ["https://www.khuncool.com/assets/wheel-cover.png"],
    locale: "th_TH",
  },
  twitter: { card: "summary_large_image" },
};

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: "khuncool", url: "https://www.khuncool.com/", logo: "https://www.khuncool.com/assets/khuncool-logo.png" },
    { "@type": "WebSite", name: "khuncool", url: "https://www.khuncool.com/", inLanguage: "th-TH", potentialAction: { "@type": "SearchAction", target: "https://www.khuncool.com/articles?q={search_term_string}", "query-input": "required name=search_term_string" } },
  ],
};
```
Render `jsonLd` via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />` inside the page component.

- [ ] **Step 3: Verify**

Run `npm run dev`, load `/`, compare against `screenshots/Home.png` at 390px and 1280px widths.
Expected: layout matches screenshot; view page source shows correct `<title>`, meta tags, and JSON-LD script.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add Home page"
```

---

## Task 6: Tools hub (`/tools`)

**Files:**
- Create: `app/tools/page.tsx`
- Create: `components/ToolCard.tsx` (if the grid of tool cards repeats a pattern also used on Home/Apps)

- [ ] **Step 1: Read `screens/Tools.dc.html`** in full, note its meta tags, JSON-LD (`CollectionPage`/`ItemList` per README), and the grid of 7 tool cards linking to each tool route.

- [ ] **Step 2: Build `ToolCard.tsx`** — props `{ href, title, description, icon/cover }`, styled per the card pattern in the file.

- [ ] **Step 3: Build `app/tools/page.tsx`** using `ToolCard` for all 7 tools, `generateMetadata()`/JSON-LD ported per Task 5's pattern.

- [ ] **Step 4: Verify** against `screenshots/Tools.png`, both breakpoints.

- [ ] **Step 5: Commit**

```bash
git add app/tools/page.tsx components/ToolCard.tsx
git commit -m "feat: add Tools hub page"
```

---

## Task 7: Random Name Picker (`/random-name-picker`)

**Files:**
- Create: `app/random-name-picker/page.tsx` (`"use client"`)

- [ ] **Step 1:** Read `screens/Wheel.dc.html` fully — wheel UI, name list input/editing, spin animation/logic, result modal, `localStorage` key used (check `khuncool-cloud.js` or the file itself for any existing key naming convention; if none specified, use `kc_wheel_names`).

- [ ] **Step 2:** Implement as a client component: name list state persisted to `localStorage` on change, spin logic (CSS transform rotation + `setTimeout`/`transitionend` to land on a weighted-random or uniform-random name matching the source's behavior), result display.

- [ ] **Step 3:** Add metadata (`WebApplication`+`FAQPage` JSON-LD per README) ported from the file's `<head>`.

- [ ] **Step 4: Verify** against `screenshots/Wheel.png`; manually spin the wheel in the browser and confirm a name is selected with no console errors.

- [ ] **Step 5: Commit**

```bash
git add app/random-name-picker/page.tsx
git commit -m "feat: add Random Name Picker page"
```

---

## Task 8: Group Maker (`/group-maker`)

**Files:**
- Create: `app/group-maker/page.tsx` (`"use client"`)

- [ ] **Step 1:** Read `screens/Groups.dc.html` — roster input, group-size/group-count control, shuffle-into-groups logic, results display, `localStorage` persistence.
- [ ] **Step 2:** Implement client component per source behavior.
- [ ] **Step 3:** Add metadata per file's `<head>`.
- [ ] **Step 4: Verify** against `screenshots/Groups.png`; run the group-maker flow end to end in the browser.
- [ ] **Step 5: Commit**

```bash
git add app/group-maker/page.tsx
git commit -m "feat: add Group Maker page"
```

---

## Task 9: Timer (`/timer`)

**Files:**
- Create: `app/timer/page.tsx` (`"use client"`)

- [ ] **Step 1:** Read `screens/Timer.dc.html` — countdown/stopwatch modes, presets, start/pause/reset controls, sound-on-finish behavior if present.
- [ ] **Step 2:** Implement using `useEffect` + `setInterval`, cleaned up on unmount.
- [ ] **Step 3:** Add metadata per file's `<head>`.
- [ ] **Step 4: Verify** against `screenshots/Timer.png`; run a short timer to completion in the browser.
- [ ] **Step 5: Commit**

```bash
git add app/timer/page.tsx
git commit -m "feat: add Timer page"
```

---

## Task 10: Classroom Noise Meter (`/classroom-noise-meter`)

**Files:**
- Create: `app/classroom-noise-meter/page.tsx` (`"use client"`)

- [ ] **Step 1:** Read `screens/NoiseMeter.dc.html` — mic permission request UI/flow, Web Audio API level metering, visual gauge, threshold states (quiet/ok/loud) with colors from the semantic token set.
- [ ] **Step 2:** Implement using `navigator.mediaDevices.getUserMedia({ audio: true })`, `AudioContext` + `AnalyserNode`, `requestAnimationFrame` loop for the meter, with a clear permission-denied fallback state matching the source.
- [ ] **Step 3:** Add metadata per file's `<head>`.
- [ ] **Step 4: Verify** against `screenshots/NoiseMeter.png`; grant mic permission in the browser and confirm the meter responds to sound, and confirm the denied-permission state renders correctly when blocked.
- [ ] **Step 5: Commit**

```bash
git add app/classroom-noise-meter/page.tsx
git commit -m "feat: add Classroom Noise Meter page"
```

---

## Task 11: Group Scoreboard (`/group-scoreboard`)

**Files:**
- Create: `app/group-scoreboard/page.tsx` (`"use client"`)

- [ ] **Step 1:** Read `screens/Scoreboard.dc.html` — team list, +/- point controls, reset, `localStorage` persistence.
- [ ] **Step 2:** Implement client component per source behavior.
- [ ] **Step 3:** Add metadata per file's `<head>`.
- [ ] **Step 4: Verify** against `screenshots/Scoreboard.png`; add/remove points for a team in the browser.
- [ ] **Step 5: Commit**

```bash
git add app/group-scoreboard/page.tsx
git commit -m "feat: add Group Scoreboard page"
```

---

## Task 12: Random Question (`/random-question`)

**Files:**
- Create: `app/random-question/page.tsx` (`"use client"`)

- [ ] **Step 1:** Read `screens/Question.dc.html` — question bank/categories, "draw" button behavior, editing custom questions, `localStorage` persistence.
- [ ] **Step 2:** Implement client component per source behavior.
- [ ] **Step 3:** Add metadata per file's `<head>`.
- [ ] **Step 4: Verify** against `screenshots/Question.png`; draw a question in the browser.
- [ ] **Step 5: Commit**

```bash
git add app/random-question/page.tsx
git commit -m "feat: add Random Question page"
```

---

## Task 13: Duck Race (`/duck-race`)

**Files:**
- Create: `app/duck-race/page.tsx` (`"use client"`)
- Reference sprites: `public/assets/duck-race/*`

- [ ] **Step 1:** Read `screens/DuckRace.dc.html` — participant/name-entry setup, race animation mechanics, winner display, sprite usage from `assets/duck-race/`.
- [ ] **Step 2:** Implement client component; animate via CSS transitions/`requestAnimationFrame` per source, using the duck sprites from `public/assets/duck-race/`.
- [ ] **Step 3:** Add metadata per file's `<head>`.
- [ ] **Step 4: Verify** against `screenshots/DuckRace.png`; run a race in the browser to a finish.
- [ ] **Step 5: Commit**

```bash
git add app/duck-race/page.tsx
git commit -m "feat: add Duck Race page"
```

---

## Task 14: Apps hub (`/apps`)

**Files:**
- Create: `app/apps/page.tsx`

- [ ] **Step 1:** Read `screens/Apps.dc.html` — this hub shows auth-gated data; in Phase 1 (no real auth), render its signed-out empty/CTA state (per the file's own signed-out variant if shown, or a sensible "sign in to see your data" state consistent with `AccountSheet`'s signed-out mode) plus the 3 app cards (Attendance/Savings/Homeroom) linking to their routes.
- [ ] **Step 2:** Build the page, `generateMetadata()`/JSON-LD (`CollectionPage`/`ItemList`) per the file's `<head>`.
- [ ] **Step 3: Verify** against `screenshots/Apps.png`.
- [ ] **Step 4: Commit**

```bash
git add app/apps/page.tsx
git commit -m "feat: add Apps hub page"
```

---

## Task 15: Attendance (`/tools/attendance`)

**Files:**
- Create: `app/tools/attendance/page.tsx` (`"use client"`)
- Create: `lib/printAttendance.ts`

- [ ] **Step 1:** Read `screens/Attendance.dc.html` in full — roster/class structure, daily check-in UI, the Excel import/export logic and the `window.print()` HTML string builder for the printable document.
- [ ] **Step 2:** Implement state with `localStorage` persistence, call `useCloudSync("attendance", state)` from Task 4's stub (no-op in Phase 1, but call site established for Phase 2).
- [ ] **Step 3:** Implement Excel import/export using `xlsx`:

```ts
import * as XLSX from "xlsx";

export function exportAttendanceToExcel(rows: Record<string, unknown>[], filename: string) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Attendance");
  XLSX.writeFile(book, filename);
}

export function importAttendanceFromExcel(file: File): Promise<Record<string, unknown>[]> {
  return file.arrayBuffer().then((buf) => {
    const book = XLSX.read(buf, { type: "array" });
    const sheet = book.Sheets[book.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  });
}
```
Adapt the row shape to match the actual columns used in `Attendance.dc.html`.

- [ ] **Step 4:** Port the print builder into `lib/printAttendance.ts`, extracting the exact HTML string logic from the source file's `window.print()` implementation.
- [ ] **Step 5:** Add metadata per file's `<head>`.
- [ ] **Step 6: Verify** against `screenshots/Attendance.png`; in the browser, mark attendance, export to Excel and confirm a file downloads, re-import it and confirm state matches, trigger print and confirm the print preview matches the source's printable layout.
- [ ] **Step 7: Commit**

```bash
git add app/tools/attendance lib/printAttendance.ts
git commit -m "feat: add Attendance app page"
```

---

## Task 16: Savings (`/tools/savings`)

**Files:**
- Create: `app/tools/savings/page.tsx` (`"use client"`)

- [ ] **Step 1:** Read `screens/Savings.dc.html` — student savings ledger, deposit entry UI, Excel import/export, any printable summary.
- [ ] **Step 2:** Implement state with `localStorage`, `useCloudSync("savings", state)` call site.
- [ ] **Step 3:** Reuse the `xlsx` import/export pattern from Task 15, adapted to the savings row shape.
- [ ] **Step 4:** Add metadata per file's `<head>`.
- [ ] **Step 5: Verify** against `screenshots/Savings.png`; record a deposit, export/re-import in the browser.
- [ ] **Step 6: Commit**

```bash
git add app/tools/savings/page.tsx
git commit -m "feat: add Savings app page"
```

---

## Task 17: Homeroom (`/tools/homeroom`)

**Files:**
- Create: `app/tools/homeroom/page.tsx` (`"use client"`)
- Create: `lib/printHomeroom.ts`

- [ ] **Step 1:** Read `screens/Homeroom.dc.html` — homeroom log entry UI, Excel export, and the printable term-document `window.print()` HTML string builder (README notes this is "Excel export + printable term document" — confirm whether import is supported or export-only).
- [ ] **Step 2:** Implement state with `localStorage`, `useCloudSync("homeroom", state)` call site.
- [ ] **Step 3:** Implement Excel export reusing the Task 15 `xlsx` pattern.
- [ ] **Step 4:** Port the term-document print builder into `lib/printHomeroom.ts`.
- [ ] **Step 5:** Add metadata per file's `<head>`.
- [ ] **Step 6: Verify** against `screenshots/Homeroom.png`; add a log entry, export to Excel, trigger the printable term document and confirm layout matches the source.
- [ ] **Step 7: Commit**

```bash
git add app/tools/homeroom lib/printHomeroom.ts
git commit -m "feat: add Homeroom app page"
```

---

## Task 18: Articles hub (`/articles`)

**Files:**
- Create: `app/articles/page.tsx`
- Create: `components/ArticleCard.tsx`

- [ ] **Step 1:** Read `screens/Articles.dc.html` — blog index listing the 5 posts, filtering/search UI if present.
- [ ] **Step 2:** Build `ArticleCard` and the index page linking to the 5 `/blog/*` routes, metadata/JSON-LD per file's `<head>`.
- [ ] **Step 3: Verify** against `screenshots/Articles.png`.
- [ ] **Step 4: Commit**

```bash
git add app/articles/page.tsx components/ArticleCard.tsx
git commit -m "feat: add Articles hub page"
```

---

## Task 19: Blog posts (5 pages)

**Files:**
- Create: `app/blog/wheel/page.tsx`
- Create: `app/blog/random-name-activities/page.tsx`
- Create: `app/blog/magnetic-frame/page.tsx`
- Create: `app/blog/psu-english/page.tsx`
- Create: `app/blog/royal-award-2569/page.tsx`

- [ ] **Step 1:** For each of the 5 source files (`BlogWheel.dc.html`, `BlogRandomNameActivities.dc.html`, `BlogMagneticFrame.dc.html`, `BlogPsuEnglish.dc.html`, `BlogRoyalAward2569.dc.html`), read the full file: article body copy, headings, images (from `assets/`), and its `<head>` (`BlogPosting` JSON-LD per README).
- [ ] **Step 2:** Build each page as a server component with the article content and ported metadata/JSON-LD, matching the corresponding `screenshots/Blog*.png`. Do not paraphrase or shorten the article copy — port it verbatim per the Fidelity section of the README.
- [ ] **Step 3: Verify** each route renders and matches its screenshot.
- [ ] **Step 4: Commit** (one commit per post, or one combined commit — engineer's choice)

```bash
git add app/blog
git commit -m "feat: add 5 blog post pages"
```

---

## Task 20: Shop (`/shop`)

**Files:**
- Create: `app/shop/page.tsx`
- Create: `components/ProductCard.tsx`

- [ ] **Step 1:** Read `screens/Shop.dc.html` — affiliate product grid, product data (names, images from `assets/*-product.*`, affiliate links, prices/labels if shown).
- [ ] **Step 2:** Build `ProductCard` and the grid page, metadata per file's `<head>`.
- [ ] **Step 3: Verify** against `screenshots/Shop.png`; confirm affiliate links have `target="_blank" rel="noopener noreferrer nofollow sponsored"` if the source marks them as sponsored (check the file for `rel` attributes used).
- [ ] **Step 4: Commit**

```bash
git add app/shop/page.tsx components/ProductCard.tsx
git commit -m "feat: add Shop page"
```

---

## Task 21: Account (`/account`)

**Files:**
- Create: `app/account/page.tsx`

- [ ] **Step 1:** Read `screens/Account.dc.html` fully — full-page guest landing state and signed-in profile management state.
- [ ] **Step 2:** Build the page reusing `AccountForm` from Task 4's `AccountSheet.tsx` for the guest state, plus the signed-in profile UI (hardcode to guest state in Phase 1 since there's no real session — do not fabricate a logged-in demo user).
- [ ] **Step 3:** Add metadata with `robots: { index: false, follow: false }` and any other tags from the file's `<head>`.
- [ ] **Step 4: Verify** against `screenshots/Account.png`; view page source and confirm the `noindex` meta tag is present.
- [ ] **Step 5: Commit**

```bash
git add app/account/page.tsx
git commit -m "feat: add Account page"
```

---

## Task 22: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: build succeeds with no type errors across all 21 routes.

- [ ] **Step 2: Route smoke test**

Run: `npm run start` (after build) and manually visit all 21 routes from the README table plus `/sitemap.xml` and `/robots.txt`.
Expected: every route returns 200 and renders; `/sitemap.xml` and `/robots.txt` serve the copied files.

- [ ] **Step 3: Metadata spot-check**

For Home, one tool page, one app page, one blog page, and `/account`: view page source and confirm `<title>`, meta description, canonical, OG/Twitter tags, and JSON-LD match the corresponding `.dc.html`'s `<head>` verbatim, and that `/account` carries `noindex`.

- [ ] **Step 4: Visual fidelity spot-check**

For the same 5 pages, compare rendered output at 390px and 1280px against `screenshots/*.png`.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: Phase 1 verification pass" --allow-empty
```

---

## Self-review notes

- **Spec coverage:** all 21 routes (Tasks 5–21), Tailwind tokens (Task 2), metadata porting (every page task), sitemap/robots/assets (Task 3), stubbed `useCloudSync` for Attendance/Savings/Homeroom (Tasks 15–17), AccountSheet overlay + `/account` full-page reuse (Tasks 4, 21) are all covered.
- **Deferred (Phase 2/3, intentionally out of scope here):** real Supabase auth/sync, GitHub repo + push, Vercel project + env vars — not tasked in this plan.
- **Type consistency:** `useCloudSync<T>(key: string, state: T): CloudSyncResult` signature defined in Task 4 is the single call pattern reused verbatim in Tasks 15–17.
