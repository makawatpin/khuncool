# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin `/admin` into a modern sidebar-shell dashboard (dark sidebar nav, Anuphan/Sarabun typography, gradient/shadow card treatment) while every tab keeps fetching and rendering the exact same data it does today.

**Architecture:** A new `AdminSidebar` component + shared `tabsConfig` replace the current horizontal tab strip in `AdminDashboard.tsx`. The global `Header`/`Footer` gain a pathname guard so they don't render on `/admin`. Each of the 5 tab components and the shared `ErrorCard`/`LoadingCard` module get restyled in place — same props, same `useAdminFetch` calls, only JSX/className changes.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (CSS-variable theme in `app/globals.css`), TypeScript. No component test framework exists in this repo (`package.json` only has `lint`/`build`/`dev`/`start`) — verification for every task is `npm run lint`, a TypeScript check, and a manual pass in the browser preview, per the project's existing convention for UI work.

---

## File Structure

- Create: `app/admin/tabsConfig.tsx` — shared tab metadata (key, label, description, icon) used by both the sidebar and the main content header.
- Create: `app/admin/AdminSidebar.tsx` — dark desktop sidebar + mobile drawer, driven by `tabsConfig`.
- Modify: `components/Header.tsx` — hide on `/admin`.
- Modify: `components/Footer.tsx` — hide on `/admin`.
- Modify: `app/admin/AdminDashboard.tsx` — swap the horizontal tab strip for the sidebar shell layout.
- Modify: `app/admin/tabs/ErrorCard.tsx` — restyle `ErrorCard`/`LoadingCard`, add `StatGridSkeleton`, `TableSkeleton`, `BarsSkeleton`, `ListSkeleton`.
- Modify: `app/admin/tabs/OverviewTab.tsx` — gradient/shadow stat cards + gradient bar chart, use `StatGridSkeleton`.
- Modify: `app/admin/tabs/UsersTab.tsx` — search icon, sticky table header, row hover + avatar, use `TableSkeleton`.
- Modify: `app/admin/tabs/ToolsTab.tsx` — pill day-range toggle, gradient progress bars, use `BarsSkeleton`.
- Modify: `app/admin/tabs/ContentTab.tsx` — icon rows instead of a bare list, use `ListSkeleton`.
- Modify: `app/admin/tabs/SystemTab.tsx` — link rows become elevated icon cards.

---

### Task 1: Shared tab config with icons

**Files:**
- Create: `app/admin/tabsConfig.tsx`

- [ ] **Step 1: Write the file**

```tsx
import type { ReactNode } from "react";

function OverviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="5.5" height="7" rx="1.2" />
      <rect x="10" y="2.5" width="5.5" height="4" rx="1.2" />
      <rect x="10" y="8.5" width="5.5" height="7" rx="1.2" />
      <rect x="2.5" y="11.5" width="5.5" height="4" rx="1.2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6.8" cy="6" r="2.5" />
      <path d="M2.5 15c0-2.5 1.9-4.2 4.3-4.2s4.3 1.7 4.3 4.2" />
      <circle cx="13" cy="5.5" r="2" />
      <path d="M11.7 10.9c1.9.3 3.3 1.8 3.3 4.1" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4.5a3 3 0 0 0-3.9 3.9l-5.1 5.1a1.4 1.4 0 0 0 2 2l5.1-5.1a3 3 0 0 0 3.9-3.9l-2 2-1.8-.4-.4-1.8 2-2Z" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="3" width="13" height="12" rx="1.5" />
      <line x1="5" y1="6.5" x2="13" y2="6.5" />
      <line x1="5" y1="9.5" x2="13" y2="9.5" />
      <line x1="5" y1="12.5" x2="10" y2="12.5" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="9" r="2.3" />
      <path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.6 4.6l1.4 1.4M12 12l1.4 1.4M4.6 13.4 6 12M12 6l1.4-1.4" />
    </svg>
  );
}

export const TABS = [
  {
    key: "overview",
    label: "ภาพรวม",
    description: "สรุปสถิติการใช้งานล่าสุด",
    Icon: OverviewIcon,
  },
  {
    key: "users",
    label: "ผู้ใช้",
    description: "รายชื่อสมาชิกทั้งหมด",
    Icon: UsersIcon,
  },
  {
    key: "tools",
    label: "เครื่องมือ",
    description: "สถิติการใช้งานเครื่องมือแต่ละตัว",
    Icon: ToolsIcon,
  },
  {
    key: "content",
    label: "เนื้อหา",
    description: "รายการบทความทั้งหมด",
    Icon: ContentIcon,
  },
  {
    key: "system",
    label: "ระบบ",
    description: "ลิงก์ไปยังระบบหลังบ้าน",
    Icon: SystemIcon,
  },
] as const satisfies readonly { key: string; label: string; description: string; Icon: () => ReactNode }[];

export type TabKey = (typeof TABS)[number]["key"];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `tabsConfig.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/admin/tabsConfig.tsx
git commit -m "feat: add shared admin tab config with icons"
```

---

### Task 2: AdminSidebar component

**Files:**
- Create: `app/admin/AdminSidebar.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import Link from "next/link";
import { TABS, type TabKey } from "./tabsConfig";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.5 4 3 9l4.5 5M3.5 9h11.5" />
    </svg>
  );
}

function SidebarContent({
  activeTab,
  onSelect,
}: {
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
}) {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex items-center gap-2 px-2 pb-5 pt-1">
        <div className="h-7 w-7 flex-none rounded-[9px] bg-brand" />
        <div className="leading-tight">
          <div className="font-anuphan text-[13px] font-extrabold tracking-tight text-white">
            khuncool
          </div>
          <div className="text-[10px] text-white/45">Admin</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {TABS.map((t) => {
          const active = t.key === activeTab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect(t.key)}
              className={`flex items-center gap-2.5 rounded-[9px] border-l-[3px] px-2.5 py-2 text-left text-[12.5px] font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary/15 text-white"
                  : "border-transparent text-white/55 hover:bg-white/5 hover:text-white/85"
              }`}
            >
              <t.Icon />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-3.5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] text-white/45 no-underline hover:text-white/75"
        >
          <BackIcon />
          กลับสู่เว็บไซต์
        </Link>
      </div>
    </div>
  );
}

export default function AdminSidebar({
  activeTab,
  onSelect,
  mobileOpen,
  onCloseMobile,
}: {
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <aside className="hidden w-[216px] flex-none bg-[#14161f] md:block">
        <SidebarContent activeTab={activeTab} onSelect={onSelect} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-[216px] bg-[#14161f] shadow-2xl">
            <SidebarContent
              activeTab={activeTab}
              onSelect={(key) => {
                onSelect(key);
                onCloseMobile();
              }}
            />
          </aside>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `AdminSidebar.tsx` (a "TABS is unused" or similar error in `AdminDashboard.tsx` is fine — Task 5 fixes that)

- [ ] **Step 3: Commit**

```bash
git add app/admin/AdminSidebar.tsx
git commit -m "feat: add AdminSidebar with desktop rail and mobile drawer"
```

---

### Task 3: Hide global Header on /admin

**Files:**
- Modify: `components/Header.tsx:1-4,131-141`

- [ ] **Step 1: Add the pathname import**

In `components/Header.tsx`, change the import block at the top:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
```

- [ ] **Step 2: Add the guard after the component's hooks**

Find this block (currently around line 131-141):

```tsx
export default function Header() {
  const { openAccountSheet } = useAccountSheet();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const closeSidebar = () => setSidebarOpen(false);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || "";
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();

  return (
```

Replace it with (adds `usePathname()` and the early return, keeps everything else identical):

```tsx
export default function Header() {
  const { openAccountSheet } = useAccountSheet();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const pathname = usePathname();

  const closeSidebar = () => setSidebarOpen(false);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || "";
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();

  if (pathname?.startsWith("/admin")) return null;

  return (
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `Header.tsx`

- [ ] **Step 4: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: hide site header on /admin routes"
```

---

### Task 4: Hide global Footer on /admin

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_LINKS = [
  { t: "เครื่องมือออนไลน์", href: "/tools" },
  { t: "แอปช่วยงานครู", href: "/apps" },
  { t: "บทความครู", href: "/articles" },
  { t: "ร้านค้าแนะนำ", href: "/shop" },
  { t: "เกี่ยวกับเรา", href: "/about" },
  { t: "ติดต่อเรา", href: "/about#contact" },
  { t: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-border bg-surface-light px-4 pb-[30px] pt-6">
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-3.5 flex items-center gap-2">
          <Image
            src="/assets/khuncool-logo.webp"
            alt=""
            width={26}
            height={26}
            className="flex-none object-contain"
          />
          <span className="font-anuphan text-[15px] font-bold">khuncool</span>
        </div>
        <div className="mb-3.5 flex flex-wrap gap-x-[18px] gap-y-2">
          {FOOTER_LINKS.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="text-[12.5px] text-ink-secondary no-underline hover:text-primary"
            >
              {f.t}
            </Link>
          ))}
        </div>
        <div className="text-[11px] text-ink-faint">
          © 2568 khuncool.com · เพื่อครูไทยทุกคน
        </div>
      </div>
    </footer>
  );
}
```

Note: `Footer.tsx` had no `"use client"` directive before this change (it was a server component). Adding `usePathname()` requires it to become a client component, hence the new first line.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `Footer.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: hide site footer on /admin routes"
```

---

### Task 5: Rewire AdminDashboard.tsx to the sidebar shell

**Files:**
- Modify: `app/admin/AdminDashboard.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import AdminSidebar from "./AdminSidebar";
import { TABS, type TabKey } from "./tabsConfig";
import OverviewTab from "./tabs/OverviewTab";
import UsersTab from "./tabs/UsersTab";
import ToolsTab from "./tabs/ToolsTab";
import ContentTab from "./tabs/ContentTab";
import SystemTab from "./tabs/SystemTab";

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="2.5" y1="4.5" x2="15.5" y2="4.5" />
      <line x1="2.5" y1="9" x2="15.5" y2="9" />
      <line x1="2.5" y1="13.5" x2="15.5" y2="13.5" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // Client-side UX gate only — the real check happens per-request in
    // /api/admin/* route handlers via requireAdmin().
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="min-h-screen w-full bg-surface-app" />;
  }

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className="flex min-h-screen w-full bg-surface-app">
      <AdminSidebar
        activeTab={tab}
        onSelect={setTab}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-border bg-surface-card px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="เปิดเมนู"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-border text-ink"
          >
            <MenuIcon />
          </button>
          <span className="font-anuphan text-sm font-bold text-ink">
            {activeTab.label}
          </span>
        </div>

        <main className="mx-auto w-full max-w-[1160px] px-6 py-8 pb-16">
          <div className="mb-6 hidden md:block">
            <h1 className="font-anuphan text-xl font-extrabold tracking-tight text-ink">
              {activeTab.label}
            </h1>
            <p className="text-sm text-ink-muted">{activeTab.description}</p>
          </div>

          {tab === "overview" && <OverviewTab />}
          {tab === "users" && <UsersTab />}
          {tab === "tools" && <ToolsTab />}
          {tab === "content" && <ContentTab />}
          {tab === "system" && <SystemTab />}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `AdminDashboard.tsx`

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open the Browser pane at `/admin` while logged in as an admin user.
Expected: dark sidebar on the left with 5 items, clicking each switches the tab content, mobile width (`resize_window` to `mobile` preset) shows a hamburger button that opens a drawer.

- [ ] **Step 4: Commit**

```bash
git add app/admin/AdminDashboard.tsx
git commit -m "feat: switch admin dashboard to sidebar shell layout"
```

---

### Task 6: Restyle ErrorCard/LoadingCard + add per-tab skeletons

**Files:**
- Modify: `app/admin/tabs/ErrorCard.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 2.5 16 15H2L9 2.5Z" />
      <line x1="9" y1="7" x2="9" y2="10.5" />
      <circle cx="9" cy="12.7" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[--radius-card] border border-error-border bg-error-bg p-4 text-sm text-error">
      <span className="mt-0.5 flex-none text-error-strong">
        <WarningIcon />
      </span>
      <span>โหลดไม่สำเร็จ: {message}</span>
    </div>
  );
}

/** Kept for tabs that don't have a shaped skeleton yet. */
export function LoadingCard() {
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 text-sm text-ink-muted">
      กำลังโหลด...
    </div>
  );
}

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-panel ${className}`}
    />
  );
}

export function StatGridSkeleton() {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[--radius-card] border border-border bg-surface-card p-4"
          >
            <Shimmer className="mb-3 h-3 w-2/3" />
            <Shimmer className="h-6 w-1/2" />
          </div>
        ))}
      </div>
      <div className="rounded-[--radius-card] border border-border bg-surface-card p-4">
        <Shimmer className="mb-3 h-3 w-1/3" />
        <Shimmer className="h-32 w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div>
      <Shimmer className="mb-4 h-9 w-full max-w-sm" />
      <div className="overflow-hidden rounded-[--radius-card] border border-border bg-surface-card p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="mb-2 h-6 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}

export function BarsSkeleton() {
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <Shimmer className="mb-1 h-3 w-1/4" />
          <Shimmer className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Shimmer key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `ErrorCard.tsx` (unused-export warnings are fine — Tasks 7-9 wire them in)

- [ ] **Step 3: Commit**

```bash
git add app/admin/tabs/ErrorCard.tsx
git commit -m "feat: restyle ErrorCard and add shaped loading skeletons"
```

---

### Task 7: Restyle OverviewTab

**Files:**
- Modify: `app/admin/tabs/OverviewTab.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, StatGridSkeleton } from "./ErrorCard";

interface OverviewData {
  totalUsers: number;
  activeLast7Days: number;
  signupsToday: number;
  topTool: string | null;
  signupsByDay: Record<string, number>;
}

export default function OverviewTab() {
  const state = useAdminFetch<OverviewData>("/api/admin/overview");

  if (state.status === "loading") return <StatGridSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  const { totalUsers, activeLast7Days, signupsToday, topTool, signupsByDay } = state.data;
  const days = Object.keys(signupsByDay).sort();
  const max = Math.max(1, ...Object.values(signupsByDay));
  const peakDay = days.reduce(
    (best, day) => (signupsByDay[day] > (signupsByDay[best] ?? -1) ? day : best),
    days[0]
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard label="สมาชิกทั้งหมด" value={totalUsers} />
        <StatCard label="Active 7 วัน" value={activeLast7Days} />
        <StatCard label="สมัครวันนี้" value={`+${signupsToday}`} accent />
        <StatCard label="เครื่องมือยอดนิยม (7 วัน)" value={topTool ?? "-"} />
      </div>
      <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 shadow-[0_4px_14px_-8px_rgba(26,29,38,0.15)]">
        <h3 className="font-anuphan mb-3 text-sm font-bold text-ink">
          สมัครใหม่ 30 วันล่าสุด
        </h3>
        <div className="flex h-32 items-end gap-1">
          {days.map((day) => (
            <div
              key={day}
              title={`${day}: ${signupsByDay[day]}`}
              className={`flex-1 rounded-t bg-gradient-to-t ${
                day === peakDay
                  ? "from-accent/60 to-accent"
                  : "from-primary/40 to-primary/80"
              }`}
              style={{ height: `${(signupsByDay[day] / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  if (accent) {
    return (
      <div className="rounded-[--radius-card] bg-brand p-4 shadow-cta">
        <p className="mb-1 text-xs text-white/80">{label}</p>
        <p className="font-anuphan text-2xl font-extrabold text-white">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 shadow-[0_4px_14px_-8px_rgba(26,29,38,0.15)]">
      <p className="mb-1 text-xs text-ink-muted">{label}</p>
      <p className="font-anuphan text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
```

Note: `bg-brand` and `shadow-cta` already exist as Tailwind utilities from `--background-image-brand`/`--shadow-cta` in `app/globals.css`'s `@theme inline` block (the same classes `Header.tsx`'s announcement bar and card CTAs already use).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `OverviewTab.tsx`

- [ ] **Step 3: Manual check**

With `npm run dev` running, open `/admin` (Overview tab active by default).
Expected: 4 stat cards with the 3rd one ("สมัครวันนี้") shown as a filled brand-gradient card, bar chart below with the tallest bar in teal, the rest in purple gradient.

- [ ] **Step 4: Commit**

```bash
git add app/admin/tabs/OverviewTab.tsx
git commit -m "feat: restyle OverviewTab with gradient accent card and chart"
```

---

### Task 8: Restyle UsersTab

**Files:**
- Modify: `app/admin/tabs/UsersTab.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, TableSkeleton } from "./ErrorCard";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  school: string;
  createdAt: string;
  lastSignInAt: string | null;
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="5" />
      <line x1="11.8" y1="11.8" x2="15.5" y2="15.5" />
    </svg>
  );
}

function initialOf(user: AdminUser) {
  const source = user.fullName || user.email || "?";
  return source.trim().charAt(0).toUpperCase();
}

export default function UsersTab() {
  const state = useAdminFetch<{ users: AdminUser[] }>("/api/admin/users");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (state.status !== "ok") return [];
    const q = query.trim().toLowerCase();
    if (!q) return state.data.users;
    return state.data.users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.school.toLowerCase().includes(q)
    );
  }, [state, query]);

  if (state.status === "loading") return <TableSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <SearchIcon />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาอีเมล ชื่อ หรือโรงเรียน"
          className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="max-h-[520px] overflow-auto rounded-[--radius-card] border border-border bg-surface-card">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="p-3">อีเมล</th>
              <th className="p-3">ชื่อ</th>
              <th className="p-3">โรงเรียน</th>
              <th className="p-3">สมัครเมื่อ</th>
              <th className="p-3">ล็อกอินล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border last:border-0 hover:bg-surface-panel"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                      {initialOf(u)}
                    </span>
                    {u.email}
                  </div>
                </td>
                <td className="p-3">{u.fullName || "-"}</td>
                <td className="p-3">{u.school || "-"}</td>
                <td className="p-3">{u.createdAt.slice(0, 10)}</td>
                <td className="p-3">{u.lastSignInAt?.slice(0, 10) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `UsersTab.tsx`

- [ ] **Step 3: Manual check**

Open `/admin`, click "ผู้ใช้". Type a query into the search box.
Expected: table still filters live as before; rows now show a circular initial avatar and highlight on hover; header stays visible while scrolling the table if there are enough rows.

- [ ] **Step 4: Commit**

```bash
git add app/admin/tabs/UsersTab.tsx
git commit -m "feat: restyle UsersTab with avatar rows and sticky header"
```

---

### Task 9: Restyle ToolsTab

**Files:**
- Modify: `app/admin/tabs/ToolsTab.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import { useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, BarsSkeleton } from "./ErrorCard";

interface ToolRow {
  tool: string;
  total: number;
  guest: number;
  signedIn: number;
}

export default function ToolsTab() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const state = useAdminFetch<{ days: number; tools: ToolRow[] }>(
    `/api/admin/tools?days=${days}`
  );

  return (
    <div>
      <div className="mb-4 flex gap-1.5 rounded-full bg-surface-panel p-1 w-fit">
        {([7, 30, 90] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              days === d
                ? "bg-primary text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {d} วัน
          </button>
        ))}
      </div>
      {state.status === "loading" && <BarsSkeleton />}
      {state.status === "error" && <ErrorCard message={state.error} />}
      {state.status === "ok" && (
        <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 space-y-3">
          {state.data.tools.length === 0 && (
            <p className="text-sm text-ink-muted">ยังไม่มีข้อมูลการใช้งานในช่วงนี้</p>
          )}
          {state.data.tools.map((t) => {
            const max = Math.max(...state.data.tools.map((r) => r.total), 1);
            return (
              <div key={t.tool}>
                <div className="mb-1 flex justify-between text-xs text-ink-muted">
                  <span className="font-medium text-ink">{t.tool}</span>
                  <span>
                    {t.total} (guest {t.guest} / signed-in {t.signedIn})
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-panel">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${(t.total / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `ToolsTab.tsx`

- [ ] **Step 3: Manual check**

Open `/admin`, click "เครื่องมือ". Click each of the 7/30/90 day pills.
Expected: pill toggle switches active state as before and re-fetches (bars re-render for the new range); bars are now a purple-to-teal gradient instead of flat purple.

- [ ] **Step 4: Commit**

```bash
git add app/admin/tabs/ToolsTab.tsx
git commit -m "feat: restyle ToolsTab with pill toggle and gradient bars"
```

---

### Task 10: Restyle ContentTab

**Files:**
- Modify: `app/admin/tabs/ContentTab.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
"use client";

import Link from "next/link";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, ListSkeleton } from "./ErrorCard";

interface Post {
  slug: string;
  href: string;
}

function DocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="2.5" width="11" height="13" rx="1.3" />
      <line x1="6" y1="6.5" x2="12" y2="6.5" />
      <line x1="6" y1="9.5" x2="12" y2="9.5" />
      <line x1="6" y1="12.5" x2="9.5" y2="12.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4.5h7.5V12M13.5 4.5 4.5 13.5" />
    </svg>
  );
}

export default function ContentTab() {
  const state = useAdminFetch<{ posts: Post[] }>("/api/admin/content");

  if (state.status === "loading") return <ListSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-2">
      <p className="px-2 pb-2 pt-1 text-xs text-ink-muted">
        รายการโพสต์ (ไม่มีข้อมูลยอดวิว — ยังไม่มี analytics ผูกอยู่)
      </p>
      <ul>
        {state.data.posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={p.href}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink no-underline hover:bg-surface-panel"
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
                <DocIcon />
              </span>
              <span className="min-w-0 flex-1 truncate">{p.href}</span>
              <span className="flex-none text-ink-faint">
                <ArrowIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `ContentTab.tsx`

- [ ] **Step 3: Manual check**

Open `/admin`, click "เนื้อหา".
Expected: same list of post links as before (now with a doc icon and an arrow, hover highlights the whole row); clicking a link still navigates to that post.

- [ ] **Step 4: Commit**

```bash
git add app/admin/tabs/ContentTab.tsx
git commit -m "feat: restyle ContentTab as icon rows"
```

---

### Task 11: Restyle SystemTab

**Files:**
- Modify: `app/admin/tabs/SystemTab.tsx`

- [ ] **Step 1: Rewrite the file**

```tsx
function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4.5h7.5V12M13.5 4.5 4.5 13.5" />
    </svg>
  );
}

const LINKS = [
  {
    href: "https://supabase.com/dashboard/project/segfdmnxbdctntvsdprq",
    title: "Supabase project dashboard",
    desc: "ฐานข้อมูล, auth, และ storage",
    color: "#0a9380",
  },
  {
    href: "https://vercel.com/dashboard",
    title: "Vercel deployments",
    desc: "การ deploy และ build logs",
    color: "#5c5ee6",
  },
];

export default function SystemTab() {
  return (
    <div className="space-y-2.5">
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-[--radius-card] border border-border bg-surface-card p-4 no-underline shadow-[0_2px_8px_-6px_rgba(26,29,38,0.15)] transition-shadow hover:shadow-[0_8px_20px_-10px_rgba(26,29,38,0.3)]"
        >
          <span
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-white"
            style={{ background: l.color }}
          >
            <ArrowIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-anuphan text-sm font-bold text-ink">
              {l.title}
            </span>
            <span className="block text-xs text-ink-muted">{l.desc}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `SystemTab.tsx`

- [ ] **Step 3: Manual check**

Open `/admin`, click "ระบบ".
Expected: two elevated card rows (Supabase, Vercel), each opens the correct external URL in a new tab on click; hovering increases the shadow.

- [ ] **Step 4: Commit**

```bash
git add app/admin/tabs/SystemTab.tsx
git commit -m "feat: restyle SystemTab as elevated link cards"
```

---

### Task 12: Full-flow verification

**Files:** none (verification only)

- [ ] **Step 1: Lint the whole project**

Run: `npm run lint`
Expected: no errors in any `app/admin/**` or `components/Header.tsx`/`components/Footer.tsx` file

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds with no type errors

- [ ] **Step 3: Manual browser walkthrough**

With `npm run dev` running and the Browser pane open, logged in as an admin user:
1. Navigate to `/admin` — confirm the site's normal `Header`/`Footer` do NOT render, and the dark sidebar does.
2. Click through all 5 tabs — confirm each renders its real data (or its loading skeleton briefly, or an error card if the API call fails).
3. In "ผู้ใช้", type into the search box — confirm the table still filters.
4. In "เครื่องมือ", click each of the 7/30/90 pills — confirm the bars update.
5. In "เนื้อหา", click a post link — confirm it navigates to the real post.
6. In "ระบบ", click each card — confirm it opens the correct external URL in a new tab.
7. `resize_window` to the `mobile` preset, reload `/admin` — confirm the hamburger button opens/closes the sidebar drawer and every tab is still reachable.
8. Navigate to `/` (or any non-admin route) — confirm the site `Header`/`Footer` are back.

Expected: every check above passes with no console errors (`read_console_messages`).

- [ ] **Step 4: Screenshot for the record**

Take a `computer` screenshot of `/admin` (desktop width) and one at `mobile` width with the drawer open, to confirm visually with the user.
