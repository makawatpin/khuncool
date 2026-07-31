# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an `/admin` dashboard (email-allowlisted) showing user growth, tool usage, content inventory, and system links.

**Architecture:** Auth in this codebase is fully client-side (Supabase session lives in `localStorage`, no server cookies/middleware exist — see `lib/auth/AuthProvider.tsx` and `lib/supabase/client.ts`). So privileged reads cannot be gated by Next.js middleware. Instead:
1. `/admin` renders as a normal client page. It shows a loading state, then either the dashboard or a redirect to `/`, based on the client's `useAuth()` user — this is a UX gate only, not a security boundary (the page itself has no secret data baked in).
2. All actual privileged data comes from four new API routes (`/api/admin/overview`, `/users`, `/tools`, `/content`). Each route independently re-verifies the caller: it takes the browser's Supabase access token from the `Authorization: Bearer <token>` header, resolves it to a user via a **service-role** Supabase client (`auth.getUser(token)`), and checks that email against `ADMIN_EMAILS`. This is the real security boundary — it doesn't trust the client-side gate at all.
3. A new `tool_events` table (insert-only from the client, read-only via service role) backs the "tools" tab. Each tool page fires one tracking call on mount.

**Tech Stack:** Next.js App Router route handlers, `@supabase/supabase-js` (service-role client, server-only), existing Tailwind design tokens (`app/globals.css`), no new dependencies, no new charting library — charts drawn as simple inline SVG (matches "no new deps" and avoids adding a chart library for ~2 line/bar charts).

---

### Task 0: Apply the `tool_events` migration

**Files:** none in the repo — this runs directly against the Supabase project via MCP.

- [ ] **Step 1: Apply the migration**

Use the Supabase MCP `apply_migration` tool (project ref from `reference/SUPABASE-SETUP.md`: `segfdmnxbdctntvsdprq`) with name `create_tool_events` and this SQL:

```sql
create table public.tool_events (
  id         bigint generated always as identity primary key,
  tool       text not null,
  event      text not null default 'use',
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tool_events enable row level security;

create policy "anyone can log tool events" on public.tool_events
  for insert with check (true);

create index tool_events_tool_created_at_idx on public.tool_events (tool, created_at);
```

- [ ] **Step 2: Verify**

Use the Supabase MCP `list_tables` tool and confirm `tool_events` appears with RLS enabled and one INSERT policy, no SELECT policy.

- [ ] **Step 3: Record the migration in the repo**

Create `reference/ADMIN-SETUP.md`:

```markdown
# Admin dashboard — one-time setup

## 1) Database
`tool_events` table already applied via Supabase MCP migration `create_tool_events`
(insert-only from clients; reads happen only through the service-role key in
`/api/admin/*` route handlers).

## 2) Environment variables
Add to `.env.local` (and to Vercel project env vars):

\`\`\`
SUPABASE_SERVICE_ROLE_KEY=<service role key, from Supabase project settings → API>
ADMIN_EMAILS=you@example.com,someoneelse@example.com
\`\`\`

`SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_` — it is
read only in server-side route handlers (`app/api/admin/**/route.ts`) and must
never reach the browser bundle.
```

- [ ] **Step 4: Commit**

```bash
git add reference/ADMIN-SETUP.md
git commit -m "docs: add admin dashboard setup notes"
```

---

### Task 1: Environment variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (not committed — gitignored; add your own real values)

- [ ] **Step 1: Add placeholders to `.env.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
```

- [ ] **Step 2: Add real values to your own `.env.local`**

Fetch the service role key via the Supabase MCP `get_project_url` / project settings (or the Supabase dashboard → Settings → API → `service_role` secret) and set `ADMIN_EMAILS` to your own email(s), comma-separated, no spaces.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAILS env vars"
```

---

### Task 2: Service-role Supabase client (server-only)

**Files:**
- Create: `lib/supabase/serviceClient.ts`

- [ ] **Step 1: Write the client factory**

```typescript
import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing Supabase server environment variables: NEXT_PUBLIC_SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY must be set (see reference/ADMIN-SETUP.md)."
  );
}

export function createServiceRoleClient() {
  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 2: Install the `server-only` guard package**

```bash
npm install server-only
```

This throws a build error if `serviceClient.ts` is ever imported from client code — the cheapest possible guardrail against leaking the service-role key into the browser bundle.

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: build succeeds (this file isn't imported anywhere yet, so it's inert).

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/serviceClient.ts package.json package-lock.json
git commit -m "feat: add server-only Supabase service-role client"
```

---

### Task 3: Admin authorization helper

**Files:**
- Create: `lib/admin/requireAdmin.ts`

- [ ] **Step 1: Write the helper**

```typescript
import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";

export type AdminAuthResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403; error: string };

function getAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Verifies the bearer token from an admin API request and checks the
 *  resolved email against ADMIN_EMAILS. This is the real security boundary —
 *  the /admin page's client-side gate is UX only. */
export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "missing bearer token" };

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) {
    return { ok: false, status: 401, error: "invalid session" };
  }

  const email = data.user.email.toLowerCase();
  if (!getAllowlist().includes(email)) {
    return { ok: false, status: 403, error: "not an admin" };
  }

  return { ok: true, email };
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: build succeeds (still unused).

- [ ] **Step 3: Commit**

```bash
git add lib/admin/requireAdmin.ts
git commit -m "feat: add admin allowlist authorization check"
```

---

### Task 4: API route — overview

**Files:**
- Create: `app/api/admin/overview/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceRoleClient();

  const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const totalUsers = usersPage.users.length;
  const activeLast7Days = usersPage.users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() >= sevenDaysAgo
  ).length;
  const signupsToday = usersPage.users.filter(
    (u) => new Date(u.created_at).getTime() >= startOfToday.getTime()
  ).length;

  const { data: topToolRows, error: topToolError } = await supabase
    .from("tool_events")
    .select("tool")
    .gte("created_at", new Date(sevenDaysAgo).toISOString());
  if (topToolError) {
    return NextResponse.json({ error: topToolError.message }, { status: 500 });
  }
  const counts = new Map<string, number>();
  for (const row of topToolRows) {
    counts.set(row.tool, (counts.get(row.tool) || 0) + 1);
  }
  const topTool = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const signupsByDay: Record<string, number> = {};
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  for (const u of usersPage.users) {
    const t = new Date(u.created_at).getTime();
    if (t < thirtyDaysAgo) continue;
    const day = u.created_at.slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  }

  return NextResponse.json({
    totalUsers,
    activeLast7Days,
    signupsToday,
    topTool,
    signupsByDay,
  });
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, then in the browser console on any page while signed in as an allowlisted admin:

```javascript
const { data } = await window.__supabaseDebugSession; // see note below
```

Simpler manual check — from a terminal, with a real access token copied from `localStorage.getItem('khuncool-auth')` in devtools (`.currentSession.access_token`):

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/overview
```

Expected: JSON with `totalUsers`, `activeLast7Days`, `signupsToday`, `topTool`, `signupsByDay`. Re-run with a bogus token — expect `401`. Re-run with a valid token for a non-allowlisted account — expect `403`.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/overview/route.ts
git commit -m "feat: add admin overview API route"
```

---

### Task 5: API route — users

**Files:**
- Create: `app/api/admin/users/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = data.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      fullName: (u.user_metadata?.full_name as string) || "",
      school: (u.user_metadata?.school as string) || "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ users });
}
```

- [ ] **Step 2: Manual verification**

Same `curl` pattern as Task 4, hitting `/api/admin/users`. Expected: `{ "users": [...] }` sorted newest-first, each with `email`, `fullName`, `school`, `createdAt`, `lastSignInAt`.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/users/route.ts
git commit -m "feat: add admin users API route"
```

---

### Task 6: API route — tools

**Files:**
- Create: `app/api/admin/tools/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";

const VALID_RANGES = { "7": 7, "30": 30, "90": 90 } as const;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("days") ?? "30";
  const days = VALID_RANGES[rangeParam as keyof typeof VALID_RANGES] ?? 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tool_events")
    .select("tool, user_id")
    .gte("created_at", since);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byTool = new Map<string, { total: number; guest: number; signedIn: number }>();
  for (const row of data) {
    const entry = byTool.get(row.tool) ?? { total: 0, guest: 0, signedIn: 0 };
    entry.total += 1;
    if (row.user_id) entry.signedIn += 1;
    else entry.guest += 1;
    byTool.set(row.tool, entry);
  }

  const tools = [...byTool.entries()]
    .map(([tool, counts]) => ({ tool, ...counts }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ days, tools });
}
```

- [ ] **Step 2: Manual verification**

`curl` `/api/admin/tools?days=7` — expect `{"days":7,"tools":[]}` before any tracking is wired up (Task 9 adds real data). Confirm `401`/`403` behave the same as Task 4.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/tools/route.ts
git commit -m "feat: add admin tool-usage API route"
```

---

### Task 7: API route — content

**Files:**
- Create: `app/api/admin/content/route.ts`

- [ ] **Step 1: Write the route**

```typescript
import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const blogDir = path.join(process.cwd(), "app", "blog");
  const entries = await readdir(blogDir, { withFileTypes: true });
  const posts = entries
    .filter((e) => e.isDirectory())
    .map((e) => ({ slug: e.name, href: `/blog/${e.name}` }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return NextResponse.json({ posts });
}
```

- [ ] **Step 2: Manual verification**

`curl` `/api/admin/content` — expect `{"posts":[{"slug":"duck-race","href":"/blog/duck-race"}, ...]}` matching the folders under `app/blog/`.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/content/route.ts
git commit -m "feat: add admin content-inventory API route"
```

---

### Task 8: Tool-usage tracking helper + wire into tool pages

**Files:**
- Create: `lib/trackToolEvent.ts`
- Modify: `app/random-name-picker/WheelApp.tsx`
- Modify: `app/group-maker/GroupsApp.tsx`
- Modify: `app/timer/TimerApp.tsx`
- Modify: `app/classroom-noise-meter/NoiseMeterApp.tsx`
- Modify: `app/group-scoreboard/ScoreboardApp.tsx`
- Modify: `app/random-question/QuestionApp.tsx`
- Modify: `app/duck-race/DuckRaceApp.tsx`
- Modify: `app/tools/attendance/AttendanceApp.tsx`
- Modify: `app/tools/savings/SavingsApp.tsx`
- Modify: `app/tools/homeroom/HomeroomApp.tsx`

- [ ] **Step 1: Write the tracking helper**

```typescript
"use client";

import { supabase } from "@/lib/supabase/client";

/** Fire-and-forget usage log. Never throws, never blocks the caller — a
 *  failed insert (offline, RLS misconfig, etc.) must not affect the tool. */
export function trackToolEvent(tool: string) {
  supabase
    .from("tool_events")
    .insert({ tool })
    .then(({ error }) => {
      if (error) console.warn("trackToolEvent failed:", error.message);
    });
}
```

- [ ] **Step 2: Write the mount-tracking hook**

Add to the same file (`lib/trackToolEvent.ts`):

```typescript
import { useEffect } from "react";

/** Logs one 'use' event the first time a tool page mounts client-side. */
export function useTrackToolUse(tool: string) {
  useEffect(() => {
    trackToolEvent(tool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
```

- [ ] **Step 3: Wire the hook into each tool page**

In each file listed above, add the import and call the hook once near the top of the component body (after existing `useState`/`useRef` declarations, before other `useEffect`s). Use this exact slug per file:

| File | Slug |
|---|---|
| `app/random-name-picker/WheelApp.tsx` | `"wheel"` |
| `app/group-maker/GroupsApp.tsx` | `"group-maker"` |
| `app/timer/TimerApp.tsx` | `"timer"` |
| `app/classroom-noise-meter/NoiseMeterApp.tsx` | `"noise-meter"` |
| `app/group-scoreboard/ScoreboardApp.tsx` | `"scoreboard"` |
| `app/random-question/QuestionApp.tsx` | `"question"` |
| `app/duck-race/DuckRaceApp.tsx` | `"duck-race"` |
| `app/tools/attendance/AttendanceApp.tsx` | `"attendance"` |
| `app/tools/savings/SavingsApp.tsx` | `"savings"` |
| `app/tools/homeroom/HomeroomApp.tsx` | `"homeroom"` |

Example diff for `app/random-name-picker/WheelApp.tsx`:

```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";

// ...inside the component function, after existing state declarations:
useTrackToolUse("wheel");
```

Apply the same pattern (import + one hook call with the matching slug) to the other 9 files.

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: build succeeds with no type errors across all 10 modified files.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `/random-name-picker` in the browser, then via Supabase MCP `execute_sql`:

```sql
select tool, count(*) from public.tool_events group by tool;
```

Expected: a row for `wheel` with count ≥ 1. Repeat for one more tool page to confirm the pattern works end-to-end.

- [ ] **Step 6: Commit**

```bash
git add lib/trackToolEvent.ts app/random-name-picker/WheelApp.tsx app/group-maker/GroupsApp.tsx app/timer/TimerApp.tsx app/classroom-noise-meter/NoiseMeterApp.tsx app/group-scoreboard/ScoreboardApp.tsx app/random-question/QuestionApp.tsx app/duck-race/DuckRaceApp.tsx app/tools/attendance/AttendanceApp.tsx app/tools/savings/SavingsApp.tsx app/tools/homeroom/HomeroomApp.tsx
git commit -m "feat: track tool usage events on mount for the admin dashboard"
```

---

### Task 9: Admin page shell + client-side gate

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/AdminDashboard.tsx`

- [ ] **Step 1: Write the metadata wrapper**

```typescript
import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | khuncool",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminDashboard />;
}
```

- [ ] **Step 2: Write the client dashboard shell**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import OverviewTab from "./tabs/OverviewTab";
import UsersTab from "./tabs/UsersTab";
import ToolsTab from "./tabs/ToolsTab";
import ContentTab from "./tabs/ContentTab";
import SystemTab from "./tabs/SystemTab";

const TABS = [
  { key: "overview", label: "ภาพรวม" },
  { key: "users", label: "ผู้ใช้" },
  { key: "tools", label: "เครื่องมือ" },
  { key: "content", label: "เนื้อหา" },
  { key: "system", label: "ระบบ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminDashboard() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    // Client-side UX gate only — the real check happens per-request in
    // /api/admin/* route handlers via requireAdmin().
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <main className="flex-1 w-full max-w-[1160px] mx-auto px-6 py-9" />;
  }

  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto px-6 py-9 pb-16">
      <h1 className="text-2xl font-bold text-ink mb-6">Admin Dashboard</h1>
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "tools" && <ToolsTab />}
      {tab === "content" && <ContentTab />}
      {tab === "system" && <SystemTab />}
    </main>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: fails only because `./tabs/*` don't exist yet — that's expected until Tasks 10–11. Move on.

- [ ] **Step 4: Commit**

Commit together with Task 10 and 11 once the tabs exist (see Task 11 Step 6) — don't commit a build-breaking intermediate state.

---

### Task 10: Shared fetch hook for admin API routes

**Files:**
- Create: `app/admin/useAdminFetch.ts`

- [ ] **Step 1: Write the hook**

```typescript
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type State<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ok"; data: T };

/** Fetches one /api/admin/* endpoint with the current session's access
 *  token attached. Each tab uses its own instance so one failing card
 *  never breaks the others. */
export function useAdminFetch<T>(path: string): State<T> {
  const [state, setState] = useState<State<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        if (!cancelled) setState({ status: "error", error: "ไม่มีเซสชัน" });
        return;
      }
      try {
        const res = await fetch(path, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (!cancelled) setState({ status: "error", error: `HTTP ${res.status}` });
          return;
        }
        const json = await res.json();
        if (!cancelled) setState({ status: "ok", data: json });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            error: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/useAdminFetch.ts
git commit -m "feat: add shared data-fetching hook for admin tabs"
```

---

### Task 11: Tab components

**Files:**
- Create: `app/admin/tabs/ErrorCard.tsx`
- Create: `app/admin/tabs/OverviewTab.tsx`
- Create: `app/admin/tabs/UsersTab.tsx`
- Create: `app/admin/tabs/ToolsTab.tsx`
- Create: `app/admin/tabs/ContentTab.tsx`
- Create: `app/admin/tabs/SystemTab.tsx`

- [ ] **Step 1: Shared error/loading card**

```typescript
export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-error-border bg-error-bg text-error text-sm p-4">
      โหลดไม่สำเร็จ: {message}
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 text-sm text-ink-muted">
      กำลังโหลด...
    </div>
  );
}
```

- [ ] **Step 2: Overview tab**

```typescript
"use client";

import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

interface OverviewData {
  totalUsers: number;
  activeLast7Days: number;
  signupsToday: number;
  topTool: string | null;
  signupsByDay: Record<string, number>;
}

export default function OverviewTab() {
  const state = useAdminFetch<OverviewData>("/api/admin/overview");

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  const { totalUsers, activeLast7Days, signupsToday, topTool, signupsByDay } = state.data;
  const days = Object.keys(signupsByDay).sort();
  const max = Math.max(1, ...Object.values(signupsByDay));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="สมาชิกทั้งหมด" value={totalUsers} />
        <StatCard label="Active 7 วัน" value={activeLast7Days} />
        <StatCard label="สมัครวันนี้" value={`+${signupsToday}`} />
        <StatCard label="เครื่องมือยอดนิยม (7 วัน)" value={topTool ?? "-"} />
      </div>
      <div className="rounded-xl border border-border bg-surface-card p-4">
        <h3 className="text-sm font-semibold text-ink mb-3">สมัครใหม่ 30 วันล่าสุด</h3>
        <div className="flex items-end gap-1 h-32">
          {days.map((day) => (
            <div
              key={day}
              title={`${day}: ${signupsByDay[day]}`}
              className="flex-1 bg-primary/70 rounded-t"
              style={{ height: `${(signupsByDay[day] / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <p className="text-xs text-ink-muted mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
```

- [ ] **Step 3: Users tab**

```typescript
"use client";

import { useMemo, useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  school: string;
  createdAt: string;
  lastSignInAt: string | null;
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

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาอีเมล ชื่อ หรือโรงเรียน"
        className="w-full max-w-sm mb-4 rounded-lg border border-border px-3 py-2 text-sm"
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted border-b border-border">
              <th className="p-3">อีเมล</th>
              <th className="p-3">ชื่อ</th>
              <th className="p-3">โรงเรียน</th>
              <th className="p-3">สมัครเมื่อ</th>
              <th className="p-3">ล็อกอินล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-3">{u.email}</td>
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

- [ ] **Step 4: Tools tab**

```typescript
"use client";

import { useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

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
      <div className="flex gap-2 mb-4">
        {([7, 30, 90] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              days === d ? "bg-primary text-white" : "bg-surface-panel text-ink-muted"
            }`}
          >
            {d} วัน
          </button>
        ))}
      </div>
      {state.status === "loading" && <LoadingCard />}
      {state.status === "error" && <ErrorCard message={state.error} />}
      {state.status === "ok" && (
        <div className="rounded-xl border border-border bg-surface-card p-4 space-y-3">
          {state.data.tools.length === 0 && (
            <p className="text-sm text-ink-muted">ยังไม่มีข้อมูลการใช้งานในช่วงนี้</p>
          )}
          {state.data.tools.map((t) => {
            const max = Math.max(...state.data.tools.map((r) => r.total), 1);
            return (
              <div key={t.tool}>
                <div className="flex justify-between text-xs text-ink-muted mb-1">
                  <span>{t.tool}</span>
                  <span>
                    {t.total} (guest {t.guest} / signed-in {t.signedIn})
                  </span>
                </div>
                <div className="h-2 bg-surface-panel rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
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

- [ ] **Step 5: Content tab and System tab**

```typescript
// app/admin/tabs/ContentTab.tsx
"use client";

import Link from "next/link";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

interface Post {
  slug: string;
  href: string;
}

export default function ContentTab() {
  const state = useAdminFetch<{ posts: Post[] }>("/api/admin/content");

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <p className="text-xs text-ink-muted mb-3">
        รายการโพสต์ (ไม่มีข้อมูลยอดวิว — ยังไม่มี analytics ผูกอยู่)
      </p>
      <ul className="space-y-2">
        {state.data.posts.map((p) => (
          <li key={p.slug}>
            <Link href={p.href} className="text-primary hover:underline text-sm">
              {p.href}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```typescript
// app/admin/tabs/SystemTab.tsx
export default function SystemTab() {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 space-y-3">
      <a
        href="https://supabase.com/dashboard/project/segfdmnxbdctntvsdprq"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-primary hover:underline text-sm"
      >
        Supabase project dashboard ↗
      </a>
      <a
        href="https://vercel.com/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-primary hover:underline text-sm"
      >
        Vercel deployments ↗
      </a>
    </div>
  );
}
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: build succeeds (this closes out Task 9's deferred commit too).

- [ ] **Step 7: Commit**

```bash
git add app/admin
git commit -m "feat: add /admin dashboard page with overview/users/tools/content/system tabs"
```

---

### Task 12: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Verify the allowlist gate**

Run: `npm run dev`. Sign in with an email in `ADMIN_EMAILS`, visit `/admin`. Expected: dashboard loads, all 5 tabs render without an `ErrorCard`.

- [ ] **Step 2: Verify a non-admin is rejected at the API layer**

Sign in with an email **not** in `ADMIN_EMAILS`, visit `/admin`. Expected: the client-side gate still lets the page mount (since it only checks "is anyone logged in"), but every tab shows `โหลดไม่สำเร็จ: HTTP 403` — confirming the real boundary is the API routes, not the page.

- [ ] **Step 3: Verify signed-out redirect**

Sign out, visit `/admin` directly. Expected: redirected to `/`.

- [ ] **Step 4: Verify tool tracking end-to-end**

Open 2–3 different tool pages as a guest (signed out) and one signed in. Return to `/admin` → Tools tab. Expected: counts appear split correctly between guest/signed-in.

- [ ] **Step 5: Verify isolated card failure**

Temporarily rename `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` to an invalid value, restart `npm run dev`, reload `/admin`. Expected: all tabs show `ErrorCard`, but the page shell (title, tabs) still renders — nothing crashes. Restore the correct key afterward.

- [ ] **Step 6: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in admin dashboard manual verification"
```
