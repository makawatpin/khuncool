# Lazy-Load Supabase Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Recommended model for execution: Opus, effort high.** This touches
> `lib/auth/AuthProvider.tsx`, which every page on the site depends on for
> sign-in state, plus 3 other shared library files. A mistake here breaks
> auth, tool-usage tracking, or cloud sync **site-wide**, not on one page.
> The diagnosis and this plan were written on Sonnet 5 at default effort —
> that was enough for investigation. Implementation is higher blast-radius
> and warrants the stronger model before any file is touched.

**Goal:** Stop shipping the Supabase JS client in the first-load JS bundle of every page — it currently loads on 66/66 routes (including every static blog post) even though only sign-in, tool-usage tracking, and cloud sync actually need it.

**Architecture:** `lib/supabase/client.ts` currently calls `createClient()` at module load time and exports the resulting singleton. Because `AuthProvider` (wrapping every route via `app/layout.tsx`) imports that module, `@supabase/supabase-js` becomes part of every route's required first-load JS. Replace the eager singleton with a memoized async factory `getSupabase()` that dynamically `import()`s `@supabase/supabase-js` on first call. Every one of the 4 call sites becomes `const supabase = await getSupabase();` before use. No behavior changes — same client, same config, just fetched lazily instead of eagerly.

**Tech Stack:** Next.js 16 (Turbopack), React 19, `@supabase/supabase-js` v2. No test runner is configured in this repo (no jest/vitest/playwright in `package.json`) — verification is `npm run build` + `npm run lint` + manual check in the dev server.

**Baseline (measured before this plan), for comparison after Task 7:**
- Chunk `.next/static/chunks/2ntygx0pxejf1.js` (235,194 bytes uncompressed) contains the Supabase client (confirmed via `grep -q "GoTrueClient"`).
- It appears in `firstLoadChunkPaths` for **66 of 66** routes in `.next/diagnostics/route-bundle-stats.json`.
- Example `firstLoadUncompressedJsBytes`: `/` = 843,589 · `/duck-race` = 867,358 · `/blog/duck-race` = 840,234 · `/group-maker` = 852,628.

---

## File Structure

- Modify: `lib/supabase/client.ts` — the core change, eager singleton → lazy async factory
- Modify: `lib/auth/AuthProvider.tsx` — 8 call sites (session bootstrap, onAuthStateChange, signUp, signIn, signInGoogle, resetPassword, updateProfile, signOut)
- Modify: `lib/trackToolEvent.ts` — 1 call site, fired on mount by 22 tool/game pages via `useTrackToolUse`
- Modify: `lib/useCloudSync.ts` — 3 call sites (pull, push-read, push-upsert)
- Modify: `app/admin/useAdminFetch.ts` — 1 call site (admin dashboard only, lower traffic but must keep compiling)

No new files. No test files — this repo has no test runner; verification is build output + manual browser check (see Task 7 and Task 8).

---

### Task 1: Convert the Supabase client to a lazy async factory

**Files:**
- Modify: `lib/supabase/client.ts`

- [ ] **Step 1: Replace the eager singleton with a memoized async factory**

Current content of `lib/supabase/client.ts`:

```typescript
"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (see .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "khuncool-auth",
  },
});
```

Replace the whole file with:

```typescript
"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * `@supabase/supabase-js` is ~230KB uncompressed and was previously created
 * eagerly at module scope, which put it in the first-load JS of every route
 * (including static blog posts that never touch auth). Dynamically import
 * it on first use instead, and memoize the resulting client/promise so every
 * caller across the app shares one instance and one in-flight import.
 */
let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and " +
            "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (see .env.example)."
        );
      }

      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "khuncool-auth",
        },
      });
    });
  }
  return clientPromise;
}
```

- [ ] **Step 2: Confirm no other file still imports the old `supabase` named export**

Run: `grep -rn "import { supabase }" --include="*.ts" --include="*.tsx" .`
Expected: no matches (Tasks 2–5 below update all 4 consumers; this is a final sanity sweep after finishing them, so come back and re-run this after Task 5 too).

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/client.ts
git commit -m "perf: make the Supabase client a lazy async factory"
```

(This commit alone will not build — the 4 consumers still import the removed `supabase` export. That's expected; Tasks 2–5 fix them before the first real verification in Task 7.)

---

### Task 2: Update `AuthProvider` to fetch the client lazily

**Files:**
- Modify: `lib/auth/AuthProvider.tsx`

- [ ] **Step 1: Update the import**

Change:

```typescript
import { supabase } from "@/lib/supabase/client";
```

to:

```typescript
import { getSupabase } from "@/lib/supabase/client";
```

- [ ] **Step 2: Rewrite the session-bootstrap `useEffect`**

Replace this block (originally lines 100–122):

```typescript
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
        setReady(true);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);
```

with:

```typescript
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    getSupabase().then((supabase) => {
      if (!mounted) return;

      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setReady(true);
      });

      const { data: subscription } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          setSession(nextSession ?? null);
          setUser(nextSession?.user ?? null);
          setReady(true);
        }
      );
      unsubscribe = () => subscription.subscription.unsubscribe();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);
```

(The `mounted` guard now also covers the window between the async `getSupabase()` resolving and the effect having already been cleaned up — e.g. fast navigation away before the dynamic import lands — so `onAuthStateChange` never subscribes after unmount.)

- [ ] **Step 3: Update `signUp`**

Change:

```typescript
  const signUp = useCallback(
    async (email: string, password: string, meta?: ProfileMeta): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signUp({
```

to:

```typescript
  const signUp = useCallback(
    async (email: string, password: string, meta?: ProfileMeta): Promise<AuthResult> => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.auth.signUp({
```

(everything else in the function body is unchanged — `supabase` is now a local variable shadowing nothing, since the module no longer exports a value named `supabase`.)

- [ ] **Step 4: Update `signIn`**

Change:

```typescript
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
```

to:

```typescript
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
```

- [ ] **Step 5: Update `signInGoogle`**

Change:

```typescript
  const signInGoogle = useCallback(async (): Promise<AuthResult | void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
```

to:

```typescript
  const signInGoogle = useCallback(async (): Promise<AuthResult | void> => {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
```

- [ ] **Step 6: Update `resetPassword`**

Change:

```typescript
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
```

to:

```typescript
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
```

- [ ] **Step 7: Update `updateProfile`**

Change:

```typescript
  const updateProfile = useCallback(async (meta: ProfileMeta): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
```

to:

```typescript
  const updateProfile = useCallback(async (meta: ProfileMeta): Promise<AuthResult> => {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.auth.updateUser({
```

- [ ] **Step 8: Update `signOut`**

Change:

```typescript
  const signOut = useCallback(async (keepLocal = true) => {
    try {
      await supabase.auth.signOut();
    } catch {
```

to:

```typescript
  const signOut = useCallback(async (keepLocal = true) => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    } catch {
```

- [ ] **Step 9: Commit**

```bash
git add lib/auth/AuthProvider.tsx
git commit -m "perf: fetch the Supabase client lazily in AuthProvider"
```

---

### Task 3: Update `trackToolEvent` (fires on mount for 22 tool/game pages)

**Files:**
- Modify: `lib/trackToolEvent.ts`

- [ ] **Step 1: Replace the import and the insert call**

Current:

```typescript
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/** Fire-and-forget usage log. Never throws, never blocks the caller — a
 *  failed insert (offline, RLS misconfig, etc.) must not affect the tool. */
export function trackToolEvent(tool: string, event: string = "use") {
  supabase
    .from("tool_events")
    .insert({ tool, event })
    .then(({ error }) => {
      if (error) console.warn("trackToolEvent failed:", error.message);
    });
}
```

Replace with:

```typescript
"use client";

import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";

/** Fire-and-forget usage log. Never throws, never blocks the caller — a
 *  failed insert (offline, RLS misconfig, etc.) must not affect the tool. */
export function trackToolEvent(tool: string, event: string = "use") {
  getSupabase().then((supabase) =>
    supabase
      .from("tool_events")
      .insert({ tool, event })
      .then(({ error }) => {
        if (error) console.warn("trackToolEvent failed:", error.message);
      })
  );
}
```

(`useTrackToolUse` below it is unchanged — it still just calls `trackToolEvent(tool)` inside a `useEffect`.)

- [ ] **Step 2: Commit**

```bash
git add lib/trackToolEvent.ts
git commit -m "perf: fetch the Supabase client lazily in trackToolEvent"
```

---

### Task 4: Update `useCloudSync` (3 call sites)

**Files:**
- Modify: `lib/useCloudSync.ts`

- [ ] **Step 1: Update the import**

Change:

```typescript
import { supabase } from "@/lib/supabase/client";
```

to:

```typescript
import { getSupabase } from "@/lib/supabase/client";
```

- [ ] **Step 2: Update the pull effect (originally around line 78)**

Change:

```typescript
    (async () => {
      setStatus("syncing");
      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select("data,updated_at")
          .eq("user_id", user.id)
          .maybeSingle();
```

to:

```typescript
    (async () => {
      setStatus("syncing");
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from(TABLE)
          .select("data,updated_at")
          .eq("user_id", user.id)
          .maybeSingle();
```

- [ ] **Step 3: Update the debounced push effect (originally around lines 143 and 155)**

Change:

```typescript
        try {
          // Read-modify-write merge of this key into the shared row's JSONB
          // `data` column, done client-side rather than via a single SQL
          // merge (e.g. `data = data || jsonb_build_object(...)`).
          // Phase 2 tradeoff: two round trips instead of one atomic update,
          // so a push for a *different* key from another tab racing between
          // this read and this upsert could be overwritten. Acceptable for
          // now since the 3 tools are rarely edited simultaneously in two
          // tabs by the same signed-in user; a Postgres RPC doing the merge
          // atomically would remove the race if this becomes a problem.
          const { data: existing } = await supabase
            .from(TABLE)
            .select("data")
            .eq("user_id", user.id)
            .maybeSingle();
          const existingData =
            existing?.data && typeof existing.data === "object"
              ? (existing.data as Record<string, unknown>)
              : {};
          const merged = { ...existingData, [key]: JSON.parse(stateJson) };
          const nowIso = new Date().toISOString();

          const { error } = await supabase.from(TABLE).upsert(
            { user_id: user.id, data: merged, updated_at: nowIso },
            { onConflict: "user_id" },
          );
```

to:

```typescript
        try {
          const supabase = await getSupabase();
          // Read-modify-write merge of this key into the shared row's JSONB
          // `data` column, done client-side rather than via a single SQL
          // merge (e.g. `data = data || jsonb_build_object(...)`).
          // Phase 2 tradeoff: two round trips instead of one atomic update,
          // so a push for a *different* key from another tab racing between
          // this read and this upsert could be overwritten. Acceptable for
          // now since the 3 tools are rarely edited simultaneously in two
          // tabs by the same signed-in user; a Postgres RPC doing the merge
          // atomically would remove the race if this becomes a problem.
          const { data: existing } = await supabase
            .from(TABLE)
            .select("data")
            .eq("user_id", user.id)
            .maybeSingle();
          const existingData =
            existing?.data && typeof existing.data === "object"
              ? (existing.data as Record<string, unknown>)
              : {};
          const merged = { ...existingData, [key]: JSON.parse(stateJson) };
          const nowIso = new Date().toISOString();

          const { error } = await supabase.from(TABLE).upsert(
            { user_id: user.id, data: merged, updated_at: nowIso },
            { onConflict: "user_id" },
          );
```

- [ ] **Step 4: Commit**

```bash
git add lib/useCloudSync.ts
git commit -m "perf: fetch the Supabase client lazily in useCloudSync"
```

---

### Task 5: Update `useAdminFetch` (admin dashboard)

**Files:**
- Modify: `app/admin/useAdminFetch.ts`

- [ ] **Step 1: Update the import and the session read**

Change:

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
```

to:

```typescript
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
```

Change:

```typescript
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
```

to:

```typescript
    (async () => {
      const supabase = await getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/useAdminFetch.ts
git commit -m "perf: fetch the Supabase client lazily in useAdminFetch"
```

---

### Task 6: Typecheck, lint, and re-sweep for the old export

**Files:** none (verification only)

- [ ] **Step 1: Re-run the sweep from Task 1 Step 2**

Run: `grep -rn "import { supabase }" --include="*.ts" --include="*.tsx" .`
Expected: no matches.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors (pre-existing warnings unrelated to these 5 files are fine; anything flagged in the files this plan touched must be fixed before continuing).

- [ ] **Step 3: Typecheck via build**

Run: `npm run build`
Expected: `✓ Compiled successfully` and `Finished TypeScript` with no errors. If TypeScript complains that `supabase` is possibly `undefined` anywhere, it means a call site was missed — search that file for `supabase.` and confirm every use is inside a function that did `const supabase = await getSupabase();` first.

---

### Task 7: Confirm the Supabase chunk dropped out of first-load JS

**Files:** none (verification only)

- [ ] **Step 1: Re-measure the same routes measured in the baseline**

Run:

```bash
node -e "
const d = require('./.next/diagnostics/route-bundle-stats.json');
const arr = Array.isArray(d) ? d : Object.values(d);
const supabaseChunks = arr.filter(r => (r.firstLoadChunkPaths||[]).some(p => /supabase|GoTrue/i.test(p)));
console.log('routes still carrying a supabase-named chunk in first load:', supabaseChunks.length, '/', arr.length);
const pick = (route) => arr.find(r => r.route === route);
['/', '/duck-race', '/blog/duck-race', '/blog/duck-race-roll-number', '/group-maker'].forEach(r => {
  const f = pick(r);
  console.log(r, f ? f.firstLoadUncompressedJsBytes : 'NOT FOUND');
});
"
```

Note: chunk hashes change on every build, so this run must re-detect the Supabase chunk by content (grepping for `GoTrueClient` across `.next/static/chunks/*.js`) rather than reusing the old hash `2ntygx0pxejf1`. If the routes above no longer reference that chunk, confirm which chunk (if any) now carries `GoTrueClient` and check that it is *not* in `firstLoadChunkPaths` for a plain content route like `/blog/duck-race`:

```bash
for f in .next/static/chunks/*.js; do grep -q "GoTrueClient" "$f" 2>/dev/null && echo "$f"; done
```

Then repeat the routes-that-reference-it check from Task 1 Step 2 style, substituting the new hash.

**Expected result:** `/blog/duck-race`, `/blog/duck-race-roll-number`, and `/group-maker` no longer list the Supabase chunk in `firstLoadChunkPaths`, and their `firstLoadUncompressedJsBytes` drops by roughly the 235KB measured in the baseline. `/` may still show it depending on whether any above-the-fold component on the homepage calls `getSupabase()` synchronously during render (none should, per Tasks 2–5 — all calls are inside effects/callbacks) — if it still shows up there, check `components/Header.tsx` and `app/page.tsx` for anything invoking auth outside an effect.

---

### Task 8: Manual verification in the dev server

No automated tests exist for auth/sync in this repo, so this step is required, not optional.

**Files:** none (manual browser check only)

- [ ] **Step 1: Start the dev server and open a content page cold**

Use `preview_start` with the `khuncool-dev` launch config, navigate to `/blog/duck-race-roll-number`, and confirm via `read_network_requests` that a chunk containing the Supabase client loads *after* the page's initial script (i.e., as a separate lazy request), not blocking the initial page paint. `read_console_messages` should show no errors.

- [ ] **Step 2: Exercise sign-up / sign-in**

Click "สมัคร" in the header (opens `AccountSheetOverlay`), submit the sign-up form with a throwaway test email, confirm the expected "ส่งลิงก์ยืนยัน..." message appears (or sign in with an existing test account if one exists) and no console errors appear.

- [ ] **Step 3: Confirm tool-usage tracking still fires**

Navigate to `/duck-race`, check `read_network_requests` for a request to the Supabase REST endpoint (`.../rest/v1/tool_events`) shortly after page load — confirms `trackToolEvent` still logs correctly through the lazy path.

- [ ] **Step 4: Confirm cloud sync still works (if a signed-in test account is available)**

Sign in, open `/tools/savings` or `/tools/attendance`, make a small edit, wait ~1.5s (past `PUSH_DEBOUNCE_MS`), and check `read_network_requests` for a request to `.../rest/v1/kc_state` — confirms `useCloudSync`'s push path still works.

- [ ] **Step 5: Confirm the admin dashboard still authenticates**

Navigate to `/admin` while signed in as an admin test account (if available) and confirm the dashboard cards load instead of showing "ไม่มีเซสชัน".

---

## Not included in this plan

- **`components/Header.tsx`** eagerly imports the site's full `TOOLS`/`APPS`/`MEDIA_*` data catalogs (for the mega-menu) into every page's client bundle too. Investigated during planning and found much smaller (combined data files are a few hundred lines of plain objects, not a JS library) — lower priority than the 235KB Supabase chunk. Worth a follow-up plan only if Task 7's re-measurement shows first-load JS is still high after this fix lands.
- Any change to `FCP` beyond what removing this chunk buys — the GSC Core Web Vitals check also flagged FCP as "needs improvement" (2035ms) — should be re-measured after this ships and deploys, since CrUX data is a 28-day rolling real-user window and won't reflect this fix immediately.

---

## Self-Review

**Spec coverage:** All 5 files identified via `grep -rn "from ["']@/lib/supabase/client["']"` in the exploration phase (`AuthProvider.tsx`, `trackToolEvent.ts`, `useCloudSync.ts`, `useAdminFetch.ts`, plus `client.ts` itself) have a task. No other consumer exists (confirmed by the grep in Task 6 Step 1 being the closing check).

**Placeholder scan:** No TBD/TODO markers; every step shows the literal before/after code instead of describing it. Task 8 is manual-only because this repo genuinely has no test runner — documented explicitly rather than inventing a fake `npm test` command.

**Type consistency:** `getSupabase(): Promise<SupabaseClient>` is defined once in Task 1 and every consumer in Tasks 2–5 calls it the same way (`const supabase = await getSupabase();`) and then uses the resolved value exactly as the old top-level `supabase` constant was used — no renamed methods, no signature drift.
