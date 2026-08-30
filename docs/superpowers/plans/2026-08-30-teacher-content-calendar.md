# Teacher Content Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only "ปฏิทิน" (Calendar) tab to `/admin` that shows Thai teacher-relevant annual events (holidays, paperwork deadlines, evaluations, national exams, competitions, career milestones, term boundaries) with a computed "publish by" status, so the admin knows what content to prepare and when.

**Architecture:** Three layers. `lib/teacher-calendar/` holds pure data + date/status logic with zero framework dependencies (fully unit-testable with Vitest). `app/api/admin/calendar/route.ts` calls that layer with the current Bangkok date, behind the existing `requireAdmin` auth check. `app/admin/tabs/CalendarTab.tsx` renders the result using the existing `useAdminFetch` / `ErrorCard` / skeleton patterns already used by the other four tabs.

**Tech Stack:** Next.js App Router (existing), TypeScript, Vitest (new devDependency, added in Task 1) for pure-function unit tests, Tailwind utility classes matching existing admin tab styling.

---

## Reference: full spec

The complete data catalog (all 7 categories' events), field semantics, and design rationale live in `docs/superpowers/specs/2026-08-30-teacher-content-calendar-design.md`. This plan implements that spec. Read it once before starting if anything below is unclear about *why* a field exists.

---

## File Structure

```
lib/teacher-calendar/
  types.ts          - CalendarEvent, Occurrence, AgendaItem, EventStatus types
  lunarDates.ts      - lookup table of lunar-calendar dates for 2026-2028
  events.ts          - the full CalendarEvent[] catalog (all 7 categories)
  resolve.ts         - resolveDate, computeStatus, buildAgenda pure functions
  resolve.test.ts    - Vitest unit tests for resolve.ts
  lunarDates.test.ts - Vitest unit tests for lunar lookup fallback behavior

app/api/admin/calendar/route.ts   - GET handler, auth + Bangkok-time resolution

app/admin/tabs/CalendarTab.tsx    - the tab UI (agenda list + month grid)
app/admin/tabsConfig.tsx          - add one entry + CalendarIcon (MODIFY)

vitest.config.ts     - new, minimal Vitest config
package.json         - add vitest devDependency + "test" script (MODIFY)
```

---

## Task 1: Install Vitest and wire up the test script

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest as a dev dependency**

Run:
```bash
npm install --save-dev vitest@4.1.11
```

- [ ] **Step 2: Add the test script to package.json**

In `package.json`, inside `"scripts"`, add a `test` entry alongside the existing ones:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
```

- [ ] **Step 3: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

This mirrors the `@/*` path alias already used throughout the codebase (see `tsconfig.json` paths / existing imports like `@/lib/admin/requireAdmin`).

- [ ] **Step 4: Verify vitest runs with zero test files**

Run: `npx vitest run`
Expected: exits with "No test files found" (or similar) — this confirms the config loads without error. This is expected to "fail" in the sense of finding nothing; we're just confirming vitest itself boots.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for pure-function unit tests"
```

---

## Task 2: Core types

**Files:**
- Create: `lib/teacher-calendar/types.ts`

- [ ] **Step 1: Write the types file**

```ts
export type CategoryKey =
  | "holiday"
  | "paperwork"
  | "evaluation"
  | "exam"
  | "competition"
  | "career"
  | "term";

export type Occurrence =
  | { kind: "fixed"; month: number; day: number }
  | { kind: "nthWeekday"; month: number; weekday: number; nth: number }
  | { kind: "lookup"; key: string }
  | { kind: "range"; startMonth: number; startDay: number; endMonth: number; endDay: number };

export type Precision = "exact" | "approx";

export interface CalendarEvent {
  id: string;
  title: string;
  category: CategoryKey;
  occurrence: Occurrence;
  precision: Precision;
  leadDays: number;
  note?: string;
  searchTerms: string[];
  contentIdeas: string[];
}

/** ISO date string, e.g. "2026-06-26". Always represents a calendar date
 *  with no time component — comparisons are done as plain strings or by
 *  converting to UTC midnight, never with local-time Date math. */
export type IsoDate = string;

export interface ResolvedDate {
  eventDate: IsoDate;
  /** For "range" occurrences this is the end date; for all others it
   *  equals eventDate. Used so a multi-day event doesn't show as "passed"
   *  until its last day is over. */
  eventEndDate: IsoDate;
}

export type EventStatus = "overdue" | "act-now" | "upcoming" | "passed" | "unknown";

export interface AgendaItem extends CalendarEvent {
  year: number;
  resolvedDate: IsoDate | null;
  resolvedEndDate: IsoDate | null;
  publishByDate: IsoDate | null;
  status: EventStatus;
  daysUntilEvent: number | null;
  daysUntilPublishBy: number | null;
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors (the file has no consumers yet, so this just checks the syntax is valid TypeScript).

- [ ] **Step 3: Commit**

```bash
git add lib/teacher-calendar/types.ts
git commit -m "feat(calendar): add core types for teacher content calendar"
```

---

## Task 3: Lunar date lookup table

**Files:**
- Create: `lib/teacher-calendar/lunarDates.ts`
- Create: `lib/teacher-calendar/lunarDates.test.ts`

Thai lunar-calendar dates (Makha Bucha, Visakha Bucha, Asalha Bucha, Khao Phansa, Ok Phansa, Loy Krathong) for 2026-2028, per the Thai royal calendar:

- [ ] **Step 1: Write the failing test**

Create `lib/teacher-calendar/lunarDates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getLunarDate } from "./lunarDates";

describe("getLunarDate", () => {
  it("returns the known date for a covered year", () => {
    expect(getLunarDate("loy-krathong", 2026)).toBe("2026-11-24");
  });

  it("returns null for an uncovered year", () => {
    expect(getLunarDate("loy-krathong", 2030)).toBeNull();
  });

  it("returns null for an unknown key", () => {
    expect(getLunarDate("not-a-real-key", 2026)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lunarDates.test.ts`
Expected: FAIL — `lunarDates.ts` doesn't exist yet, so the import fails.

- [ ] **Step 3: Write the lookup table and function**

Create `lib/teacher-calendar/lunarDates.ts`:

```ts
/** Thai lunar-calendar dates, sourced from the Thai royal calendar
 *  (ปฏิทินหลวง). Each key maps year -> "MM-DD". Only years actually
 *  looked up and confirmed appear here — never extrapolate a lunar
 *  date, since the lunar-to-solar mapping isn't a fixed formula. */
const LUNAR_DATES: Record<string, Record<number, string>> = {
  "makha-bucha": {
    2026: "03-03",
    2027: "02-21",
    2028: "03-11",
  },
  "visakha-bucha": {
    2026: "05-31",
    2027: "05-20",
    2028: "05-08",
  },
  "asalha-bucha": {
    2026: "07-29",
    2027: "07-19",
    2028: "07-06",
  },
  "khao-phansa": {
    2026: "07-30",
    2027: "07-20",
    2028: "07-07",
  },
  "ok-phansa": {
    2026: "10-26",
    2027: "10-16",
    2028: "10-03",
  },
  "loy-krathong": {
    2026: "11-24",
    2027: "11-13",
    2028: "11-01",
  },
};

/** Returns "YYYY-MM-DD" for a lunar event in a given year, or null if
 *  that key or year isn't in the table. Callers must treat null as
 *  "no data" and show that plainly — never fall back to a guess. */
export function getLunarDate(key: string, year: number): string | null {
  const yearMap = LUNAR_DATES[key];
  if (!yearMap) return null;
  const monthDay = yearMap[year];
  if (!monthDay) return null;
  return `${year}-${monthDay}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lunarDates.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/teacher-calendar/lunarDates.ts lib/teacher-calendar/lunarDates.test.ts
git commit -m "feat(calendar): add Thai lunar date lookup table for 2026-2028"
```

---

## Task 4: `resolveDate` — turn an Occurrence into an actual date

**Files:**
- Create: `lib/teacher-calendar/resolve.ts` (this task only adds `resolveDate`; later tasks extend the same file)
- Create: `lib/teacher-calendar/resolve.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/teacher-calendar/resolve.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveDate } from "./resolve";
import type { Occurrence } from "./types";

describe("resolveDate", () => {
  it("resolves a fixed date", () => {
    const occ: Occurrence = { kind: "fixed", month: 6, day: 26 };
    expect(resolveDate(occ, 2026)).toEqual({
      eventDate: "2026-06-26",
      eventEndDate: "2026-06-26",
    });
  });

  it("resolves nthWeekday when the 1st of the month is that weekday", () => {
    // January 2028 starts on a Saturday (weekday 6, ISO Mon=1..Sun=7).
    // The "2nd Saturday" should be Jan 8, not Jan 1.
    const occ: Occurrence = { kind: "nthWeekday", month: 1, weekday: 6, nth: 2 };
    expect(resolveDate(occ, 2028)).toEqual({
      eventDate: "2028-01-08",
      eventEndDate: "2028-01-08",
    });
  });

  it("resolves nthWeekday for a normal case (Children's Day 2026)", () => {
    // 2nd Saturday of January 2026 = Jan 10, 2026.
    const occ: Occurrence = { kind: "nthWeekday", month: 1, weekday: 6, nth: 2 };
    expect(resolveDate(occ, 2026)).toEqual({
      eventDate: "2026-01-10",
      eventEndDate: "2026-01-10",
    });
  });

  it("resolves a lookup date via the lunar table", () => {
    const occ: Occurrence = { kind: "lookup", key: "loy-krathong" };
    expect(resolveDate(occ, 2026)).toEqual({
      eventDate: "2026-11-24",
      eventEndDate: "2026-11-24",
    });
  });

  it("returns null for a lookup with no data for that year", () => {
    const occ: Occurrence = { kind: "lookup", key: "loy-krathong" };
    expect(resolveDate(occ, 2030)).toBeNull();
  });

  it("resolves a range within a single year", () => {
    const occ: Occurrence = {
      kind: "range",
      startMonth: 4,
      startDay: 13,
      endMonth: 4,
      endDay: 15,
    };
    expect(resolveDate(occ, 2026)).toEqual({
      eventDate: "2026-04-13",
      eventEndDate: "2026-04-15",
    });
  });

  it("resolves a range that crosses the new year", () => {
    // National Sillapa competition: Dec of `year` to Feb of `year + 1`.
    const occ: Occurrence = {
      kind: "range",
      startMonth: 12,
      startDay: 1,
      endMonth: 2,
      endDay: 15,
    };
    expect(resolveDate(occ, 2026)).toEqual({
      eventDate: "2026-12-01",
      eventEndDate: "2027-02-15",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run resolve.test.ts`
Expected: FAIL — `resolve.ts` doesn't exist yet.

- [ ] **Step 3: Write `resolveDate`**

Create `lib/teacher-calendar/resolve.ts`:

```ts
import type { Occurrence, ResolvedDate } from "./types";
import { getLunarDate } from "./lunarDates";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** ISO weekday of the 1st of (year, month): Monday=1 .. Sunday=7. */
function firstWeekdayOfMonth(year: number, month: number): number {
  // Date.UTC month is 0-indexed.
  const jsDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // Sun=0..Sat=6
  return jsDay === 0 ? 7 : jsDay;
}

/** Resolves an Occurrence to concrete date(s) for a given year.
 *  Returns null only when a "lookup" occurrence has no data for that
 *  year — every other kind always resolves. */
export function resolveDate(occurrence: Occurrence, year: number): ResolvedDate | null {
  switch (occurrence.kind) {
    case "fixed": {
      const date = isoDate(year, occurrence.month, occurrence.day);
      return { eventDate: date, eventEndDate: date };
    }

    case "nthWeekday": {
      const firstWeekday = firstWeekdayOfMonth(year, occurrence.month);
      // Days from the 1st to the first occurrence of the target weekday.
      const offsetToFirst = (occurrence.weekday - firstWeekday + 7) % 7;
      const day = 1 + offsetToFirst + (occurrence.nth - 1) * 7;
      const date = isoDate(year, occurrence.month, day);
      return { eventDate: date, eventEndDate: date };
    }

    case "lookup": {
      const date = getLunarDate(occurrence.key, year);
      if (!date) return null;
      return { eventDate: date, eventEndDate: date };
    }

    case "range": {
      const endYear = occurrence.endMonth < occurrence.startMonth ? year + 1 : year;
      return {
        eventDate: isoDate(year, occurrence.startMonth, occurrence.startDay),
        eventEndDate: isoDate(endYear, occurrence.endMonth, occurrence.endDay),
      };
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run resolve.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/teacher-calendar/resolve.ts lib/teacher-calendar/resolve.test.ts
git commit -m "feat(calendar): add resolveDate for all four occurrence kinds"
```

---

## Task 5: `computeStatus` — derive publish-by status

**Files:**
- Modify: `lib/teacher-calendar/resolve.ts`
- Modify: `lib/teacher-calendar/resolve.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `lib/teacher-calendar/resolve.test.ts`:

```ts
import { computeStatus } from "./resolve";

describe("computeStatus", () => {
  const resolved = { eventDate: "2026-06-26", eventEndDate: "2026-06-26" };
  const leadDays = 14; // publishBy = 2026-06-12

  it("is 'passed' when today is after the event date", () => {
    expect(computeStatus(leadDays, resolved, "2026-06-27")).toBe("passed");
  });

  it("is 'passed' when today equals the event's end date", () => {
    // End of the event day still counts as passed the next day, but the
    // event day itself should not yet be "passed" -- it's the last
    // meaningful day to have content live.
    expect(computeStatus(leadDays, resolved, "2026-06-26")).not.toBe("passed");
  });

  it("is 'overdue' when today is after publishBy but not past the event", () => {
    expect(computeStatus(leadDays, resolved, "2026-06-13")).toBe("overdue");
  });

  it("is 'overdue' when today equals publishBy exactly (deadline day itself)", () => {
    // publishBy is the last day content should go out; being ON that day
    // with nothing published yet is already too late to call it "act-now".
    expect(computeStatus(leadDays, resolved, "2026-06-12")).toBe("act-now");
  });

  it("is 'act-now' when within 14 days of publishBy", () => {
    expect(computeStatus(leadDays, resolved, "2026-05-29")).toBe("act-now");
  });

  it("is 'upcoming' when more than 14 days before publishBy", () => {
    expect(computeStatus(leadDays, resolved, "2026-05-28")).toBe("upcoming");
  });

  it("is 'unknown' when resolved is null", () => {
    expect(computeStatus(leadDays, null, "2026-06-01")).toBe("unknown");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run resolve.test.ts`
Expected: FAIL — `computeStatus` is not exported yet.

- [ ] **Step 3: Implement `computeStatus`**

Add to `lib/teacher-calendar/resolve.ts` (below `resolveDate`):

```ts
import type { EventStatus, ResolvedDate } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcMidnight(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

function addDays(iso: string, days: number): string {
  const t = toUtcMidnight(iso) + days * MS_PER_DAY;
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((toUtcMidnight(toIso) - toUtcMidnight(fromIso)) / MS_PER_DAY);
}

/** Computes the publish-by date and status for one resolved event.
 *  `today` is passed in explicitly (never read from the system clock
 *  here) so this function is fully deterministic and testable. */
export function computeStatus(
  leadDays: number,
  resolved: ResolvedDate | null,
  today: string
): EventStatus {
  if (!resolved) return "unknown";

  if (daysBetween(today, resolved.eventEndDate) < 0) return "passed";

  const publishByDate = addDays(resolved.eventDate, -leadDays);
  const daysUntilPublishBy = daysBetween(today, publishByDate);

  if (daysUntilPublishBy < 0) return "overdue";
  if (daysUntilPublishBy <= 14) return "act-now";
  return "upcoming";
}
```

Note: `addDays` and `daysBetween` are also needed by `buildAgenda` in Task 6 — they're defined here once and reused.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run resolve.test.ts`
Expected: PASS (all tests from Task 4 and Task 5)

- [ ] **Step 5: Commit**

```bash
git add lib/teacher-calendar/resolve.ts lib/teacher-calendar/resolve.test.ts
git commit -m "feat(calendar): add computeStatus for publish-by deadline tracking"
```

---

## Task 6: `buildAgenda` — assemble the full sorted list

**Files:**
- Modify: `lib/teacher-calendar/resolve.ts`
- Modify: `lib/teacher-calendar/resolve.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `lib/teacher-calendar/resolve.test.ts`:

```ts
import { buildAgenda } from "./resolve";
import type { CalendarEvent } from "./types";

describe("buildAgenda", () => {
  const sunthornPhu: CalendarEvent = {
    id: "sunthorn-phu-day",
    title: "วันสุนทรภู่",
    category: "holiday",
    occurrence: { kind: "fixed", month: 6, day: 26 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["สุนทรภู่"],
    contentIdeas: ["ใบงานบทกวี"],
  };

  const childrensDay: CalendarEvent = {
    id: "childrens-day",
    title: "วันเด็กแห่งชาติ",
    category: "holiday",
    occurrence: { kind: "nthWeekday", month: 1, weekday: 6, nth: 2 },
    precision: "exact",
    leadDays: 21,
    searchTerms: ["วันเด็ก"],
    contentIdeas: ["การ์ดวันเด็ก"],
  };

  const uncoveredLunar: CalendarEvent = {
    id: "loy-krathong-far-future",
    title: "วันลอยกระทง",
    category: "holiday",
    occurrence: { kind: "lookup", key: "loy-krathong" },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["ลอยกระทง"],
    contentIdeas: ["กระทงประดิษฐ์"],
  };

  it("sorts items by soonest publish-by first, using today's date", () => {
    // Today is 2026-06-01. Sunthorn Phu (Jun 26, lead 14) -> publishBy Jun 12.
    const agenda = buildAgenda([sunthornPhu], "2026-06-01", 1);
    expect(agenda).toHaveLength(1);
    expect(agenda[0].resolvedDate).toBe("2026-06-26");
    expect(agenda[0].publishByDate).toBe("2026-06-12");
    expect(agenda[0].status).toBe("upcoming");
  });

  it("excludes events already passed this year", () => {
    // Today is 2026-07-01, after Sunthorn Phu Jun 26 -> passed, excluded
    // unless next year's occurrence is within the lookahead window.
    const agenda = buildAgenda([sunthornPhu], "2026-07-01", 1);
    expect(agenda.find((a) => a.id === "sunthorn-phu-day" && a.year === 2026)).toBeUndefined();
  });

  it("rolls over to next year's occurrence when late in the year (Children's Day in November)", () => {
    const agenda = buildAgenda([childrensDay], "2026-11-01", 3);
    const item = agenda.find((a) => a.id === "childrens-day");
    expect(item).toBeDefined();
    expect(item?.year).toBe(2027);
    expect(item?.resolvedDate).toBe("2027-01-09"); // 2nd Sat of Jan 2027
  });

  it("marks unresolved lookup years as status 'unknown' instead of throwing", () => {
    expect(() => buildAgenda([uncoveredLunar], "2031-01-01", 1)).not.toThrow();
    const agenda = buildAgenda([uncoveredLunar], "2031-01-01", 1);
    const item = agenda.find((a) => a.id === "loy-krathong-far-future");
    expect(item?.status).toBe("unknown");
    expect(item?.resolvedDate).toBeNull();
  });

  it("sorts overdue and act-now items before upcoming ones", () => {
    const agenda = buildAgenda([sunthornPhu, childrensDay], "2026-06-01", 12);
    // childrensDay's *next* occurrence from 2026-06-01 is Jan 2027 (far away,
    // "upcoming"); sunthornPhu publishBy is 2026-06-12 (closer). Closer
    // publish-by date should sort first regardless of category.
    expect(agenda[0].id).toBe("sunthorn-phu-day");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run resolve.test.ts`
Expected: FAIL — `buildAgenda` is not exported yet.

- [ ] **Step 3: Implement `buildAgenda`**

Add to `lib/teacher-calendar/resolve.ts` (below `computeStatus`):

```ts
import type { AgendaItem, CalendarEvent } from "./types";

/** Builds the sorted agenda for the given events, as seen from `today`.
 *  For each event, resolves both the current year and next year's
 *  occurrence (so events early in the following year — e.g. Children's
 *  Day in January — surface while we're still in November/December),
 *  drops occurrences already fully passed, and sorts by how soon content
 *  needs to publish. `monthsAhead` bounds how far into the future to
 *  keep in the result. */
export function buildAgenda(
  events: CalendarEvent[],
  today: string,
  monthsAhead: number
): AgendaItem[] {
  const todayYear = Number(today.slice(0, 4));
  const horizon = addDays(today, monthsAhead * 31);

  const items: AgendaItem[] = [];

  for (const event of events) {
    for (const year of [todayYear, todayYear + 1]) {
      const resolved = resolveDate(event.occurrence, year);
      const status = computeStatus(event.leadDays, resolved, today);

      if (status === "passed") continue;

      if (resolved && daysBetween(today, resolved.eventDate) > monthsAhead * 31) {
        // Too far in the future to show yet, unless it's already
        // actionable (overdue/act-now can't happen this far out, so this
        // simple cutoff is safe).
        continue;
      }

      const publishByDate = resolved ? addDays(resolved.eventDate, -event.leadDays) : null;

      items.push({
        ...event,
        year,
        resolvedDate: resolved?.eventDate ?? null,
        resolvedEndDate: resolved?.eventEndDate ?? null,
        publishByDate,
        status,
        daysUntilEvent: resolved ? daysBetween(today, resolved.eventDate) : null,
        daysUntilPublishBy: publishByDate ? daysBetween(today, publishByDate) : null,
      });
    }
  }

  items.sort((a, b) => {
    const rank = (item: AgendaItem) => {
      if (item.status === "overdue") return 0;
      if (item.status === "act-now") return 1;
      if (item.status === "unknown") return 3;
      return 2; // upcoming
    };
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;

    const aKey = a.daysUntilPublishBy ?? Number.MAX_SAFE_INTEGER;
    const bKey = b.daysUntilPublishBy ?? Number.MAX_SAFE_INTEGER;
    return aKey - bKey;
  });

  return items;
}
```

Note: `horizon` is computed but not directly compared against — the per-item `daysBetween(...) > monthsAhead * 31` check does the filtering. Remove the unused `horizon` variable before running the type check in Step 4 if TypeScript flags it as unused (it will, under `strict` mode with `noUnusedLocals`-style linting) — replace the `horizon` line and the filter condition with:

```ts
    const resolved = resolveDate(event.occurrence, year);
```
(delete the `const horizon = ...` line entirely; the filter already inlines the comparison via `daysBetween`).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run resolve.test.ts`
Expected: PASS (all tests across Tasks 4, 5, 6)

Also run: `npx tsc --noEmit` to confirm no unused-variable or type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/teacher-calendar/resolve.ts lib/teacher-calendar/resolve.test.ts
git commit -m "feat(calendar): add buildAgenda to assemble the sorted event list"
```

---

## Task 7: Event catalog

**Files:**
- Create: `lib/teacher-calendar/events.ts`
- Modify: `lib/teacher-calendar/resolve.test.ts` (one integration-style smoke test)

This is data entry, not logic — transcribe the catalog from the spec (`docs/superpowers/specs/2026-08-30-teacher-content-calendar-design.md`, section "แคตตาล็อกวันสำคัญเริ่มต้น") into typed objects. `searchTerms` and `contentIdeas` are written out concretely below so there's nothing left to fill in.

- [ ] **Step 1: Write the failing smoke test**

Append to `lib/teacher-calendar/resolve.test.ts`:

```ts
import { CALENDAR_EVENTS } from "./events";

describe("CALENDAR_EVENTS catalog", () => {
  it("has at least one event in every category", () => {
    const categories = new Set(CALENDAR_EVENTS.map((e) => e.category));
    expect(categories).toEqual(
      new Set(["holiday", "paperwork", "evaluation", "exam", "competition", "career", "term"])
    );
  });

  it("has unique ids", () => {
    const ids = CALENDAR_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("builds a valid agenda from the real catalog without throwing", () => {
    expect(() => buildAgenda(CALENDAR_EVENTS, "2026-08-30", 6)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run resolve.test.ts`
Expected: FAIL — `./events` doesn't exist yet.

- [ ] **Step 3: Write the catalog**

Create `lib/teacher-calendar/events.ts`:

```ts
import type { CalendarEvent } from "./types";

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // ---- holiday ----
  {
    id: "wai-khru-day",
    title: "วันไหว้ครู",
    category: "holiday",
    occurrence: { kind: "nthWeekday", month: 6, weekday: 4, nth: 1 },
    precision: "approx",
    leadDays: 14,
    note: "แต่ละโรงเรียนกำหนดวันไหว้ครูเองในสัปดาห์แรกๆ ของเดือน มิ.ย. เช็ควันจริงกับปฏิทินโรงเรียน",
    searchTerms: ["พานไหว้ครู", "คำกลอนไหว้ครู", "ดอกไม้ไหว้ครู"],
    contentIdeas: ["ไอเดียพานไหว้ครู", "บทกลอนไหว้ครูพร้อมท่อง", "ป้ายนิเทศวันไหว้ครู"],
  },
  {
    id: "sunthorn-phu-day",
    title: "วันสุนทรภู่",
    category: "holiday",
    occurrence: { kind: "fixed", month: 6, day: 26 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันสุนทรภู่", "ประวัติสุนทรภู่", "พระอภัยมณี", "กลอนสุนทรภู่"],
    contentIdeas: ["ใบงานประวัติสุนทรภู่", "ใบงานระบายสีตัวละครวรรณคดี", "แบบทดสอบวันสุนทรภู่"],
  },
  {
    id: "anti-drugs-day",
    title: "วันต่อต้านยาเสพติดโลก",
    category: "holiday",
    occurrence: { kind: "fixed", month: 6, day: 26 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันต่อต้านยาเสพติด", "คำขวัญวันต่อต้านยาเสพติด"],
    contentIdeas: ["ป้ายนิเทศต่อต้านยาเสพติด", "ใบงานโทษของยาเสพติด"],
  },
  {
    id: "thai-language-day",
    title: "วันภาษาไทยแห่งชาติ",
    category: "holiday",
    occurrence: { kind: "fixed", month: 7, day: 29 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันภาษาไทยแห่งชาติ", "ใบงานภาษาไทย"],
    contentIdeas: ["ใบงานคำราชาศัพท์", "เกมทายคำภาษาไทย", "ป้ายนิเทศวันภาษาไทย"],
  },
  {
    id: "kings-birthday-r10",
    title: "วันเฉลิมพระชนมพรรษา ร.10",
    category: "holiday",
    occurrence: { kind: "fixed", month: 7, day: 28 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันเฉลิมพระชนมพรรษา"],
    contentIdeas: ["ป้ายนิเทศวันเฉลิมพระชนมพรรษา"],
  },
  {
    id: "mothers-day",
    title: "วันแม่แห่งชาติ",
    category: "holiday",
    occurrence: { kind: "fixed", month: 8, day: 12 },
    precision: "exact",
    leadDays: 21,
    searchTerms: ["การ์ดวันแม่", "กลอนวันแม่", "ของขวัญวันแม่ทำเอง"],
    contentIdeas: ["การ์ดวันแม่ให้ระบายสี", "กลอนวันแม่พร้อมท่อง", "ของทำมือให้คุณแม่"],
  },
  {
    id: "science-day",
    title: "วันวิทยาศาสตร์แห่งชาติ",
    category: "holiday",
    occurrence: { kind: "fixed", month: 8, day: 18 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันวิทยาศาสตร์แห่งชาติ", "การทดลองวิทยาศาสตร์ง่ายๆ"],
    contentIdeas: ["ใบงานทดลองวิทยาศาสตร์", "ป้ายนิเทศวันวิทยาศาสตร์"],
  },
  {
    id: "youth-day",
    title: "วันเยาวชนแห่งชาติ",
    category: "holiday",
    occurrence: { kind: "fixed", month: 9, day: 20 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันเยาวชนแห่งชาติ"],
    contentIdeas: ["ป้ายนิเทศวันเยาวชน"],
  },
  {
    id: "chulalongkorn-day",
    title: "วันปิยมหาราช",
    category: "holiday",
    occurrence: { kind: "fixed", month: 10, day: 23 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันปิยมหาราช", "ประวัติรัชกาลที่ 5"],
    contentIdeas: ["ใบงานประวัติรัชกาลที่ 5", "ป้ายนิเทศวันปิยมหาราช"],
  },
  {
    id: "loy-krathong",
    title: "วันลอยกระทง",
    category: "holiday",
    occurrence: { kind: "lookup", key: "loy-krathong" },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["ลอยกระทง", "กระทงประดิษฐ์", "ประวัติลอยกระทง"],
    contentIdeas: ["ใบงานประดิษฐ์กระทง", "ใบงานประวัติลอยกระทง"],
  },
  {
    id: "fathers-day",
    title: "วันพ่อแห่งชาติ",
    category: "holiday",
    occurrence: { kind: "fixed", month: 12, day: 5 },
    precision: "exact",
    leadDays: 21,
    searchTerms: ["การ์ดวันพ่อ", "กลอนวันพ่อ"],
    contentIdeas: ["การ์ดวันพ่อให้ระบายสี", "กลอนวันพ่อพร้อมท่อง"],
  },
  {
    id: "constitution-day",
    title: "วันรัฐธรรมนูญ",
    category: "holiday",
    occurrence: { kind: "fixed", month: 12, day: 10 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันรัฐธรรมนูญ"],
    contentIdeas: ["ป้ายนิเทศวันรัฐธรรมนูญ"],
  },
  {
    id: "new-years-day",
    title: "วันขึ้นปีใหม่",
    category: "holiday",
    occurrence: { kind: "fixed", month: 1, day: 1 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["การ์ดปีใหม่", "กิจกรรมวันปีใหม่"],
    contentIdeas: ["การ์ดอวยพรปีใหม่", "ป้ายนิเทศปีใหม่"],
  },
  {
    id: "childrens-day",
    title: "วันเด็กแห่งชาติ",
    category: "holiday",
    occurrence: { kind: "nthWeekday", month: 1, weekday: 6, nth: 2 },
    precision: "exact",
    leadDays: 21,
    searchTerms: ["คำขวัญวันเด็ก", "กิจกรรมวันเด็ก", "ของรางวัลวันเด็ก"],
    contentIdeas: ["ป้ายคำขวัญวันเด็กปีนี้", "ใบงานกิจกรรมวันเด็ก", "ไอเดียของรางวัลวันเด็ก"],
  },
  {
    id: "teachers-day",
    title: "วันครู",
    category: "holiday",
    occurrence: { kind: "fixed", month: 1, day: 16 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันครู", "คำขวัญวันครู", "คำกลอนวันครู"],
    contentIdeas: ["ป้ายคำขวัญวันครู", "การ์ดอวยพรวันครู"],
  },
  {
    id: "makha-bucha",
    title: "วันมาฆบูชา",
    category: "holiday",
    occurrence: { kind: "lookup", key: "makha-bucha" },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันมาฆบูชา", "ประวัติวันมาฆบูชา"],
    contentIdeas: ["ใบงานวันมาฆบูชา", "ป้ายนิเทศวันมาฆบูชา"],
  },
  {
    id: "valentines-day",
    title: "วันวาเลนไทน์",
    category: "holiday",
    occurrence: { kind: "fixed", month: 2, day: 14 },
    precision: "exact",
    leadDays: 10,
    searchTerms: ["การ์ดวาเลนไทน์", "กิจกรรมวันวาเลนไทน์"],
    contentIdeas: ["การ์ดวาเลนไทน์ให้ระบายสี"],
  },
  {
    id: "womens-day",
    title: "วันสตรีสากล",
    category: "holiday",
    occurrence: { kind: "fixed", month: 3, day: 8 },
    precision: "exact",
    leadDays: 10,
    searchTerms: ["วันสตรีสากล"],
    contentIdeas: ["ป้ายนิเทศวันสตรีสากล"],
  },
  {
    id: "chakri-day",
    title: "วันจักรี",
    category: "holiday",
    occurrence: { kind: "fixed", month: 4, day: 6 },
    precision: "exact",
    leadDays: 10,
    searchTerms: ["วันจักรี", "ประวัติราชวงศ์จักรี"],
    contentIdeas: ["ใบงานประวัติวันจักรี"],
  },
  {
    id: "songkran",
    title: "วันสงกรานต์",
    category: "holiday",
    occurrence: { kind: "range", startMonth: 4, startDay: 13, endMonth: 4, endDay: 15 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["สงกรานต์", "ใบงานสงกรานต์", "ประวัติสงกรานต์"],
    contentIdeas: ["ใบงานประเพณีสงกรานต์", "ป้ายนิเทศวันสงกรานต์"],
  },
  {
    id: "visakha-bucha",
    title: "วันวิสาขบูชา",
    category: "holiday",
    occurrence: { kind: "lookup", key: "visakha-bucha" },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันวิสาขบูชา"],
    contentIdeas: ["ใบงานวันวิสาขบูชา"],
  },
  {
    id: "khao-phansa",
    title: "วันเข้าพรรษา",
    category: "holiday",
    occurrence: { kind: "lookup", key: "khao-phansa" },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["วันเข้าพรรษา", "วันอาสาฬหบูชา"],
    contentIdeas: ["ใบงานวันเข้าพรรษา"],
  },

  // ---- paperwork ----
  {
    id: "dmc-round-1",
    title: "ยืนยันข้อมูลนักเรียน DMC รอบ 1",
    category: "paperwork",
    occurrence: { kind: "fixed", month: 6, day: 10 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["DMC", "ยืนยันข้อมูลนักเรียน", "10 มิถุนายน DMC"],
    contentIdeas: ["คู่มือกรอกข้อมูล DMC", "เช็คลิสต์เอกสารยืนยันตัวตนนักเรียน"],
  },
  {
    id: "dmc-round-2",
    title: "ยืนยันข้อมูลนักเรียน DMC รอบ 2",
    category: "paperwork",
    occurrence: { kind: "fixed", month: 11, day: 10 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["DMC รอบ 2", "10 พฤศจิกายน DMC"],
    contentIdeas: ["คู่มือกรอกข้อมูล DMC รอบ 2"],
  },
  {
    id: "lesson-plan-term-1",
    title: "จัดทำแผนการจัดการเรียนรู้ เทอม 1",
    category: "paperwork",
    occurrence: { kind: "range", startMonth: 5, startDay: 1, endMonth: 5, endDay: 15 },
    precision: "approx",
    leadDays: 14,
    note: "แต่ละโรงเรียนกำหนดกำหนดส่งแผนการสอนไม่ตรงกัน ให้เช็คปฏิทินวิชาการของโรงเรียน",
    searchTerms: ["แผนการจัดการเรียนรู้", "ตัวอย่างแผนการสอน"],
    contentIdeas: ["เทมเพลตแผนการจัดการเรียนรู้", "ตัวอย่างแผนการสอนรายวิชา"],
  },
  {
    id: "lesson-plan-term-2",
    title: "จัดทำแผนการจัดการเรียนรู้ เทอม 2",
    category: "paperwork",
    occurrence: { kind: "range", startMonth: 10, startDay: 15, endMonth: 10, endDay: 31 },
    precision: "approx",
    leadDays: 14,
    note: "แต่ละโรงเรียนกำหนดกำหนดส่งแผนการสอนไม่ตรงกัน ให้เช็คปฏิทินวิชาการของโรงเรียน",
    searchTerms: ["แผนการจัดการเรียนรู้ เทอม 2"],
    contentIdeas: ["เทมเพลตแผนการจัดการเรียนรู้เทอม 2"],
  },
  {
    id: "por-por-5-term-1",
    title: "กรอก ปพ.5 ปลายภาคเรียนที่ 1",
    category: "paperwork",
    occurrence: { kind: "range", startMonth: 9, startDay: 15, endMonth: 10, endDay: 15 },
    precision: "approx",
    leadDays: 14,
    note: "วันปิดภาคเรียนต่างกันในแต่ละโรงเรียน ช่วงนี้เป็นค่าประมาณ",
    searchTerms: ["ปพ.5", "วิธีกรอกปพ.5", "แบบบันทึกผลการเรียน"],
    contentIdeas: ["คู่มือกรอก ปพ.5 ทีละขั้นตอน", "ตัวอย่าง ปพ.5 กรอกแล้ว"],
  },
  {
    id: "por-por-5-term-2",
    title: "กรอก ปพ.5 ปลายภาคเรียนที่ 2",
    category: "paperwork",
    occurrence: { kind: "range", startMonth: 2, startDay: 15, endMonth: 3, endDay: 15 },
    precision: "approx",
    leadDays: 14,
    note: "วันปิดภาคเรียนต่างกันในแต่ละโรงเรียน ช่วงนี้เป็นค่าประมาณ",
    searchTerms: ["ปพ.5 ปลายปี"],
    contentIdeas: ["คู่มือกรอก ปพ.5 ปลายปีการศึกษา"],
  },
  {
    id: "sar-report",
    title: "จัดทำ SAR และประกันคุณภาพภายใน",
    category: "paperwork",
    occurrence: { kind: "range", startMonth: 4, startDay: 1, endMonth: 5, endDay: 15 },
    precision: "approx",
    leadDays: 21,
    note: "กำหนดส่ง SAR จริงขึ้นกับต้นสังกัด เช็คหนังสือแจ้งจาก สพฐ./เขตพื้นที่",
    searchTerms: ["SAR", "รายงานประเมินตนเอง", "ประกันคุณภาพภายในสถานศึกษา"],
    contentIdeas: ["เทมเพลต SAR", "ตัวอย่างรายงานประเมินตนเอง"],
  },

  // ---- evaluation ----
  {
    id: "wpa-agreement",
    title: "จัดทำข้อตกลงพัฒนางาน ว.PA",
    category: "evaluation",
    occurrence: { kind: "range", startMonth: 10, startDay: 1, endMonth: 10, endDay: 31 },
    precision: "approx",
    leadDays: 14,
    note: "ต้นปีงบประมาณ วันจริงขึ้นกับหนังสือแจ้งของ ก.ค.ศ. ในแต่ละปี",
    searchTerms: ["ว.PA", "ข้อตกลงพัฒนางาน", "ตัวอย่าง PA"],
    contentIdeas: ["เทมเพลตข้อตกลง ว.PA", "ตัวอย่างการเขียน ว.PA"],
  },
  {
    id: "wpa-results",
    title: "ส่งผลลัพธ์ ว.PA",
    category: "evaluation",
    occurrence: { kind: "range", startMonth: 9, startDay: 1, endMonth: 9, endDay: 30 },
    precision: "approx",
    leadDays: 14,
    note: "ปลายปีงบประมาณ วันจริงขึ้นกับหนังสือแจ้งของ ก.ค.ศ. ในแต่ละปี",
    searchTerms: ["ผลลัพธ์ ว.PA", "รายงานผล PA"],
    contentIdeas: ["ตัวอย่างรายงานผลลัพธ์ ว.PA"],
  },
  {
    id: "salary-raise-round-1",
    title: "เลื่อนขั้นเงินเดือนรอบ 1",
    category: "evaluation",
    occurrence: { kind: "fixed", month: 4, day: 1 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["เลื่อนขั้นเงินเดือนครู", "แบบประเมินเลื่อนขั้น"],
    contentIdeas: ["คู่มือเตรียมเอกสารเลื่อนขั้นเงินเดือน"],
  },
  {
    id: "salary-raise-round-2",
    title: "เลื่อนขั้นเงินเดือนรอบ 2",
    category: "evaluation",
    occurrence: { kind: "fixed", month: 10, day: 1 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["เลื่อนขั้นเงินเดือนครู รอบ 2"],
    contentIdeas: ["คู่มือเตรียมเอกสารเลื่อนขั้นเงินเดือน รอบ 2"],
  },
  {
    id: "probation-teacher-eval",
    title: "ประเมินครูผู้ช่วย",
    category: "evaluation",
    occurrence: { kind: "range", startMonth: 3, startDay: 1, endMonth: 3, endDay: 31 },
    precision: "approx",
    leadDays: 14,
    note: "ประเมินทุก 6 เดือน วันจริงขึ้นกับวันบรรจุของแต่ละคน ช่วงนี้เป็นตัวอย่างรอบหนึ่ง",
    searchTerms: ["ประเมินครูผู้ช่วย", "แบบประเมินครูผู้ช่วย"],
    contentIdeas: ["คู่มือเตรียมตัวประเมินครูผู้ช่วย"],
  },

  // ---- exam ----
  {
    id: "rt-p1",
    title: "สอบ RT ป.1",
    category: "exam",
    occurrence: { kind: "range", startMonth: 2, startDay: 1, endMonth: 2, endDay: 28 },
    precision: "approx",
    leadDays: 21,
    note: "วันสอบจริงประกาศโดย สทศ./สพฐ. เช็คประกาศทางการก่อนเผยแพร่กำหนดวันแน่นอน",
    searchTerms: ["ข้อสอบ RT ป.1", "แนวข้อสอบ RT"],
    contentIdeas: ["แนวข้อสอบ RT ป.1 พร้อมเฉลย", "เทคนิคเตรียมสอบ RT"],
  },
  {
    id: "nt-p3",
    title: "สอบ NT ป.3",
    category: "exam",
    occurrence: { kind: "range", startMonth: 3, startDay: 1, endMonth: 3, endDay: 31 },
    precision: "approx",
    leadDays: 21,
    note: "วันสอบจริงประกาศโดย สทศ./สพฐ. เช็คประกาศทางการก่อนเผยแพร่กำหนดวันแน่นอน",
    searchTerms: ["ข้อสอบ NT ป.3", "แนวข้อสอบ NT"],
    contentIdeas: ["แนวข้อสอบ NT ป.3 พร้อมเฉลย"],
  },
  {
    id: "onet-p6",
    title: "สอบ O-NET ป.6",
    category: "exam",
    occurrence: { kind: "range", startMonth: 2, startDay: 1, endMonth: 2, endDay: 28 },
    precision: "approx",
    leadDays: 21,
    note: "วันสอบจริงประกาศโดย สทศ. เช็คประกาศทางการก่อนเผยแพร่กำหนดวันแน่นอน",
    searchTerms: ["ข้อสอบ O-NET ป.6", "แนวข้อสอบ O-NET ป.6"],
    contentIdeas: ["แนวข้อสอบ O-NET ป.6 พร้อมเฉลย"],
  },
  {
    id: "onet-m3",
    title: "สอบ O-NET ม.3",
    category: "exam",
    occurrence: { kind: "range", startMonth: 2, startDay: 1, endMonth: 2, endDay: 28 },
    precision: "approx",
    leadDays: 21,
    note: "วันสอบจริงประกาศโดย สทศ. เช็คประกาศทางการก่อนเผยแพร่กำหนดวันแน่นอน",
    searchTerms: ["ข้อสอบ O-NET ม.3"],
    contentIdeas: ["แนวข้อสอบ O-NET ม.3 พร้อมเฉลย"],
  },
  {
    id: "onet-m6",
    title: "สอบ O-NET ม.6",
    category: "exam",
    occurrence: { kind: "range", startMonth: 3, startDay: 1, endMonth: 3, endDay: 15 },
    precision: "approx",
    leadDays: 21,
    note: "วันสอบจริงประกาศโดย สทศ. เช็คประกาศทางการก่อนเผยแพร่กำหนดวันแน่นอน",
    searchTerms: ["ข้อสอบ O-NET ม.6"],
    contentIdeas: ["แนวข้อสอบ O-NET ม.6 พร้อมเฉลย"],
  },
  {
    id: "midterm-term-1",
    title: "สอบกลางภาคเรียนที่ 1",
    category: "exam",
    occurrence: { kind: "range", startMonth: 7, startDay: 15, endMonth: 8, endDay: 15 },
    precision: "approx",
    leadDays: 14,
    note: "วันสอบขึ้นกับปฏิทินวิชาการของแต่ละโรงเรียน",
    searchTerms: ["ข้อสอบกลางภาค", "แนวข้อสอบกลางภาค"],
    contentIdeas: ["แบบทดสอบกลางภาคพร้อมเฉลย"],
  },
  {
    id: "final-term-1",
    title: "สอบปลายภาคเรียนที่ 1",
    category: "exam",
    occurrence: { kind: "range", startMonth: 9, startDay: 15, endMonth: 10, endDay: 10 },
    precision: "approx",
    leadDays: 14,
    note: "วันสอบขึ้นกับปฏิทินวิชาการของแต่ละโรงเรียน",
    searchTerms: ["ข้อสอบปลายภาค เทอม 1"],
    contentIdeas: ["แบบทดสอบปลายภาคเทอม 1 พร้อมเฉลย"],
  },
  {
    id: "midterm-term-2",
    title: "สอบกลางภาคเรียนที่ 2",
    category: "exam",
    occurrence: { kind: "range", startMonth: 12, startDay: 15, endMonth: 1, endDay: 15 },
    precision: "approx",
    leadDays: 14,
    note: "วันสอบขึ้นกับปฏิทินวิชาการของแต่ละโรงเรียน",
    searchTerms: ["ข้อสอบกลางภาค เทอม 2"],
    contentIdeas: ["แบบทดสอบกลางภาคเทอม 2 พร้อมเฉลย"],
  },
  {
    id: "final-term-2",
    title: "สอบปลายภาคเรียนที่ 2",
    category: "exam",
    occurrence: { kind: "range", startMonth: 2, startDay: 15, endMonth: 3, endDay: 10 },
    precision: "approx",
    leadDays: 14,
    note: "วันสอบขึ้นกับปฏิทินวิชาการของแต่ละโรงเรียน",
    searchTerms: ["ข้อสอบปลายภาค เทอม 2"],
    contentIdeas: ["แบบทดสอบปลายภาคเทอม 2 พร้อมเฉลย"],
  },

  // ---- competition ----
  {
    id: "sillapa-regional",
    title: "งานศิลปหัตถกรรมนักเรียน ระดับเขตพื้นที่",
    category: "competition",
    occurrence: { kind: "range", startMonth: 8, startDay: 15, endMonth: 9, endDay: 30 },
    precision: "approx",
    leadDays: 21,
    note: "วันแข่งขันจริงประกาศโดยเขตพื้นที่การศึกษาแต่ละเขต",
    searchTerms: ["ศิลปหัตถกรรมนักเรียน", "เกณฑ์การแข่งขันศิลปหัตถกรรม"],
    contentIdeas: ["สรุปเกณฑ์การแข่งขันศิลปหัตถกรรมปีนี้", "ไอเดียเตรียมทีมแข่งขัน"],
  },
  {
    id: "sillapa-national",
    title: "งานศิลปหัตถกรรมนักเรียน ระดับชาติ",
    category: "competition",
    occurrence: { kind: "range", startMonth: 12, startDay: 1, endMonth: 2, endDay: 15 },
    precision: "approx",
    leadDays: 21,
    note: "วันแข่งขันจริงประกาศโดย สพฐ. ช่วงนี้เป็นค่าประมาณจากปีก่อนหน้า",
    searchTerms: ["ศิลปหัตถกรรมนักเรียนระดับชาติ"],
    contentIdeas: ["สรุปผลศิลปหัตถกรรมระดับชาติ"],
  },

  // ---- career ----
  {
    id: "teacher-recruitment-exam",
    title: "สอบครูผู้ช่วย รอบทั่วไป",
    category: "career",
    occurrence: { kind: "range", startMonth: 5, startDay: 1, endMonth: 7, endDay: 31 },
    precision: "approx",
    leadDays: 30,
    note: "วันประกาศรับสมัครและสอบเปลี่ยนทุกปี เช็คประกาศจาก ก.ค.ศ. และเขตพื้นที่",
    searchTerms: ["สอบครูผู้ช่วย", "แนวข้อสอบครูผู้ช่วย", "ประกาศสอบครูผู้ช่วย"],
    contentIdeas: ["แนวข้อสอบครูผู้ช่วยวิชาเอก", "สรุปขั้นตอนสมัครสอบครูผู้ช่วย"],
  },
  {
    id: "civil-service-exam",
    title: "สอบ ก.พ. ภาค ก",
    category: "career",
    occurrence: { kind: "range", startMonth: 3, startDay: 1, endMonth: 5, endDay: 31 },
    precision: "approx",
    leadDays: 30,
    note: "วันสอบเปลี่ยนทุกปี เช็คประกาศจากสำนักงาน ก.พ.",
    searchTerms: ["สอบ ก.พ. ภาค ก", "แนวข้อสอบ ก.พ."],
    contentIdeas: ["แนวข้อสอบ ก.พ. ภาค ก พร้อมเฉลย"],
  },
  {
    id: "teaching-license-renewal",
    title: "ต่ออายุใบประกอบวิชาชีพครู",
    category: "career",
    occurrence: { kind: "range", startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 },
    precision: "approx",
    leadDays: 60,
    note: "วันหมดอายุขึ้นกับใบอนุญาตของแต่ละคน นี่คือคอนเทนต์ที่มีดีมานด์ตลอดปี ไม่ผูกกับเดือนใดเดือนหนึ่ง",
    searchTerms: ["ต่อใบประกอบวิชาชีพครู", "ขั้นตอนต่อใบอนุญาตประกอบวิชาชีพ"],
    contentIdeas: ["คู่มือต่อใบประกอบวิชาชีพครูทีละขั้นตอน"],
  },

  // ---- term ----
  {
    id: "term-1-open",
    title: "เปิดภาคเรียนที่ 1",
    category: "term",
    occurrence: { kind: "fixed", month: 5, day: 16 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["เปิดเทอม 1", "เตรียมตัวเปิดเทอม"],
    contentIdeas: ["เช็คลิสต์เตรียมตัวเปิดเทอม", "ไอเดียกิจกรรมปฐมนิเทศ"],
  },
  {
    id: "term-1-close",
    title: "ปิดภาคเรียนที่ 1",
    category: "term",
    occurrence: { kind: "range", startMonth: 10, startDay: 1, endMonth: 10, endDay: 31 },
    precision: "approx",
    leadDays: 14,
    note: "วันปิดเทอมต่างกันในแต่ละโรงเรียน",
    searchTerms: ["ปิดเทอม 1"],
    contentIdeas: ["กิจกรรมช่วงปิดเทอม"],
  },
  {
    id: "term-2-open",
    title: "เปิดภาคเรียนที่ 2",
    category: "term",
    occurrence: { kind: "range", startMonth: 11, startDay: 1, endMonth: 11, endDay: 15 },
    precision: "approx",
    leadDays: 14,
    note: "วันเปิดเทอมต่างกันในแต่ละโรงเรียน",
    searchTerms: ["เปิดเทอม 2"],
    contentIdeas: ["เช็คลิสต์เตรียมตัวเปิดเทอม 2"],
  },
  {
    id: "term-2-close",
    title: "ปิดภาคเรียนใหญ่",
    category: "term",
    occurrence: { kind: "range", startMonth: 4, startDay: 1, endMonth: 4, endDay: 30 },
    precision: "approx",
    leadDays: 14,
    note: "วันปิดเทอมต่างกันในแต่ละโรงเรียน",
    searchTerms: ["ปิดเทอมใหญ่", "กิจกรรมปิดเทอมภาคฤดูร้อน"],
    contentIdeas: ["ไอเดียกิจกรรมปิดเทอมภาคฤดูร้อน"],
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run resolve.test.ts`
Expected: PASS (all tests including the 3 new catalog smoke tests)

- [ ] **Step 5: Run the full test suite and type check**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all tests pass, no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/teacher-calendar/events.ts lib/teacher-calendar/resolve.test.ts
git commit -m "feat(calendar): add full event catalog covering all 7 categories"
```

---

## Task 8: API route

**Files:**
- Create: `app/api/admin/calendar/route.ts`

- [ ] **Step 1: Write the route handler**

```ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { CALENDAR_EVENTS } from "@/lib/teacher-calendar/events";
import { buildAgenda, resolveDate, computeStatus } from "@/lib/teacher-calendar/resolve";
import type { AgendaItem } from "@/lib/teacher-calendar/types";

const MONTHS_AHEAD = 6;
const DAYS_GRID_LOOKAHEAD_MONTHS = 1;

function bangkokToday(): string {
  // en-CA gives YYYY-MM-DD directly.
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}

function parseMonthParam(param: string | null, fallbackToday: string): { year: number; month: number } {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const [year, month] = fallbackToday.split("-").map(Number);
  return { year, month };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const today = bangkokToday();
  const { searchParams } = new URL(request.url);
  const { year, month } = parseMonthParam(searchParams.get("month"), today);

  const agenda = buildAgenda(CALENDAR_EVENTS, today, MONTHS_AHEAD).slice(0, 5);

  // Build the month grid: for the requested year/month, resolve every
  // event that could land on any day of it (checking both this year and
  // the occurrence's natural year is unnecessary here since we resolve
  // directly against `year`).
  const totalDays = daysInMonth(year, month);
  const dayItems: Record<string, AgendaItem[]> = {};
  for (let d = 1; d <= totalDays; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dayItems[iso] = [];
  }

  for (const event of CALENDAR_EVENTS) {
    const resolved = resolveDate(event.occurrence, year);
    if (!resolved) continue;

    // Only place it on the grid if its start date falls in the requested
    // month (multi-month ranges are anchored to their start date here;
    // DAYS_GRID_LOOKAHEAD_MONTHS is reserved for a future "spans into
    // next month" indicator and isn't used yet).
    void DAYS_GRID_LOOKAHEAD_MONTHS;
    if (!resolved.eventDate.startsWith(`${year}-${String(month).padStart(2, "0")}`)) continue;

    const status = computeStatus(event.leadDays, resolved, today);
    dayItems[resolved.eventDate].push({
      ...event,
      year,
      resolvedDate: resolved.eventDate,
      resolvedEndDate: resolved.eventEndDate,
      publishByDate: null,
      status,
      daysUntilEvent: null,
      daysUntilPublishBy: null,
    });
  }

  return NextResponse.json({
    today,
    agenda,
    month: {
      year,
      month,
      days: Object.entries(dayItems).map(([date, items]) => ({ date, items })),
    },
  });
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

Note: the `void DAYS_GRID_LOOKAHEAD_MONTHS;` line and the unused constant are a placeholder to avoid an unused-variable error while keeping the constant documented for a future enhancement. If `tsc --noEmit` still flags it as unused, simply delete the `DAYS_GRID_LOOKAHEAD_MONTHS` constant and the `void` line — it isn't load-bearing for this task.

- [ ] **Step 3: Manual smoke test against the dev server**

Run: `npm run dev`

In another terminal, this route requires a valid admin bearer token, so a plain `curl` will correctly get 401. Confirm that behavior:

```bash
curl -i http://localhost:3000/api/admin/calendar
```

Expected: `HTTP/1.1 401` with `{"error":"missing bearer token"}` — this confirms the route is wired up and the auth check runs. Full end-to-end verification (with a real token) happens in Task 10 via the browser once logged in as an admin.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/calendar/route.ts
git commit -m "feat(calendar): add /api/admin/calendar route"
```

---

## Task 9: Calendar icon + tab registration

**Files:**
- Modify: `app/admin/tabsConfig.tsx`

- [ ] **Step 1: Add the icon function**

In `app/admin/tabsConfig.tsx`, add this function alongside the other `*Icon` functions (after `SystemIcon`, before `export const TABS`):

```tsx
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="3.5" width="13" height="11.5" rx="1.5" />
      <line x1="2.5" y1="7" x2="15.5" y2="7" />
      <line x1="6" y1="2" x2="6" y2="5" />
      <line x1="12" y1="2" x2="12" y2="5" />
    </svg>
  );
}
```

- [ ] **Step 2: Add the tab entry**

In the `TABS` array, insert this object between the `content` entry and the `system` entry:

```tsx
  {
    key: "calendar",
    label: "ปฏิทิน",
    description: "วันสำคัญและกำหนดลงคอนเทนต์",
    Icon: CalendarIcon,
  },
```

- [ ] **Step 3: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/admin/tabsConfig.tsx
git commit -m "feat(calendar): register calendar tab in admin sidebar"
```

---

## Task 10: `CalendarTab` UI

**Files:**
- Create: `app/admin/tabs/CalendarTab.tsx`
- Modify: `app/admin/AdminDashboard.tsx` (to render the new tab — check its current switch/map before editing)

- [ ] **Step 1: Check how AdminDashboard dispatches tabs**

Run: `grep -n "ContentTab\|TabKey\|case \"" app/admin/AdminDashboard.tsx`

Read the surrounding lines in the file to see the exact pattern (likely a `switch (activeTab)` or a lookup object mapping `TabKey` to a component). Match whatever pattern is already there — do not introduce a new dispatch mechanism.

- [ ] **Step 2: Write the CalendarTab component**

Create `app/admin/tabs/CalendarTab.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, ListSkeleton } from "./ErrorCard";
import type { AgendaItem, CategoryKey } from "@/lib/teacher-calendar/types";

interface CalendarResponse {
  today: string;
  agenda: AgendaItem[];
  month: {
    year: number;
    month: number;
    days: { date: string; items: AgendaItem[] }[];
  };
}

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  holiday: "วันสำคัญ",
  paperwork: "เอกสาร",
  evaluation: "ประเมิน",
  exam: "สอบ",
  competition: "แข่งขัน",
  career: "อาชีพ",
  term: "ภาคเรียน",
};

const CATEGORY_DOT: Record<CategoryKey, string> = {
  holiday: "bg-primary",
  paperwork: "bg-amber-500",
  evaluation: "bg-violet-500",
  exam: "bg-rose-500",
  competition: "bg-emerald-500",
  career: "bg-sky-500",
  term: "bg-slate-500",
};

const STATUS_LABEL: Record<AgendaItem["status"], string> = {
  overdue: "เลยกำหนดลงแล้ว",
  "act-now": "ถึงเวลาเริ่มทำ",
  upcoming: "ยังไม่ถึงเวลา",
  passed: "ผ่านไปแล้ว",
  unknown: "ยังไม่มีข้อมูลวันที่",
};

const STATUS_CLASS: Record<AgendaItem["status"], string> = {
  overdue: "bg-error-bg text-error border-error-border",
  "act-now": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  upcoming: "bg-surface-panel text-ink-muted border-border",
  passed: "bg-surface-panel text-ink-faint border-border",
  unknown: "bg-surface-panel text-ink-faint border-border",
};

function formatThaiDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function AgendaRow({ item }: { item: AgendaItem }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <span className={`h-2 w-2 flex-none rounded-full ${CATEGORY_DOT[item.category]}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{item.title}</span>
          <span className="block text-xs text-ink-muted">
            {CATEGORY_LABEL[item.category]}
            {item.resolvedDate && (
              <>
                {" · "}
                {item.precision === "approx" ? "ราว " : ""}
                {formatThaiDate(item.resolvedDate)}
              </>
            )}
            {item.daysUntilPublishBy !== null && (
              <>{" · "}เหลืออีก {item.daysUntilPublishBy} วันถึงกำหนดลง</>
            )}
          </span>
        </span>
        <span
          className={`flex-none whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${STATUS_CLASS[item.status]}`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2.5 text-sm">
          {item.note && <p className="mb-2 text-xs text-ink-faint">{item.note}</p>}
          {item.searchTerms.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {item.searchTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-full bg-surface-panel px-2 py-0.5 text-xs text-ink-muted"
                >
                  {term}
                </span>
              ))}
            </div>
          )}
          {item.contentIdeas.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-xs text-ink-muted">
              {item.contentIdeas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

const CATEGORIES: CategoryKey[] = [
  "holiday",
  "paperwork",
  "evaluation",
  "exam",
  "competition",
  "career",
  "term",
];

const WEEKDAY_LABELS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

function MonthGrid({
  data,
  activeCategories,
  selectedDate,
  onSelectDate,
}: {
  data: CalendarResponse["month"];
  activeCategories: Set<CategoryKey>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const firstOfMonth = new Date(Date.UTC(data.year, data.month - 1, 1));
  const firstWeekday = firstOfMonth.getUTCDay() === 0 ? 7 : firstOfMonth.getUTCDay();
  const leadingBlanks = firstWeekday - 1;

  const todayIso = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEKDAY_LABELS.map((w) => (
        <div key={w} className="pb-1 text-center text-xs text-ink-faint">
          {w}
        </div>
      ))}
      {Array.from({ length: leadingBlanks }).map((_, i) => (
        <div key={`blank-${i}`} />
      ))}
      {data.days.map((day) => {
        const items = day.items.filter((it) => activeCategories.has(it.category));
        const isToday = day.date === todayIso;
        const isSelected = day.date === selectedDate;
        const dayNum = Number(day.date.slice(-2));
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={`flex min-h-[3.5rem] flex-col items-start rounded-md border p-1.5 text-left ${
              isSelected
                ? "border-primary bg-primary/5"
                : isToday
                  ? "border-primary/50"
                  : "border-border"
            }`}
          >
            <span className="text-xs text-ink-muted">{dayNum}</span>
            <span className="mt-1 flex flex-wrap gap-0.5">
              {items.slice(0, 3).map((it) => (
                <span key={it.id} className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[it.category]}`} />
              ))}
              {items.length > 3 && (
                <span className="text-[10px] text-ink-faint">+{items.length - 3}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CalendarTab() {
  const state = useAdminFetch<CalendarResponse>("/api/admin/calendar");
  const [activeCategories, setActiveCategories] = useState<Set<CategoryKey>>(
    new Set(CATEGORIES)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (state.status === "loading") return <ListSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  const { agenda, month } = state.data;

  function toggleCategory(cat: CategoryKey) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const selectedDay = selectedDate ? month.days.find((d) => d.date === selectedDate) : null;
  const filteredAgenda = agenda.filter((a) => activeCategories.has(a.category));

  return (
    <div className="space-y-6">
      <div className="rounded-[--radius-card] border border-border bg-surface-card p-3">
        <p className="mb-2 px-1 text-xs text-ink-muted">ต้องทำตอนนี้</p>
        {filteredAgenda.length === 0 ? (
          <p className="px-1 py-4 text-center text-sm text-ink-faint">
            ไม่มีรายการที่ต้องเตรียมในช่วงนี้
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filteredAgenda.map((item) => (
              <AgendaRow key={`${item.id}-${item.year}`} item={item} />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[--radius-card] border border-border bg-surface-card p-3">
        <div className="mb-3 flex flex-wrap gap-1.5 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                activeCategories.has(cat)
                  ? "border-border bg-surface-panel text-ink"
                  : "border-border text-ink-faint opacity-50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[cat]}`} />
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        <MonthGrid
          data={month}
          activeCategories={activeCategories}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d === selectedDate ? null : d)}
        />

        {selectedDay && (
          <div className="mt-3 border-t border-border pt-3">
            {selectedDay.items.filter((it) => activeCategories.has(it.category)).length === 0 ? (
              <p className="px-1 text-sm text-ink-faint">ไม่มีรายการในวันนี้</p>
            ) : (
              <ul className="space-y-1.5">
                {selectedDay.items
                  .filter((it) => activeCategories.has(it.category))
                  .map((item) => (
                    <AgendaRow key={item.id} item={item} />
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire the tab into AdminDashboard**

Based on the pattern found in Step 1, add the `calendar` case rendering `<CalendarTab />`, with the import `import CalendarTab from "./tabs/CalendarTab";` added alongside the other tab imports at the top of `app/admin/AdminDashboard.tsx`.

- [ ] **Step 4: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/admin/tabs/CalendarTab.tsx app/admin/AdminDashboard.tsx
git commit -m "feat(calendar): add CalendarTab UI with agenda list and month grid"
```

---

## Task 11: Browser verification

- [ ] **Step 1: Start the dev server and open /admin**

Use the project's preview tooling to start the dev server (check `.claude/launch.json` for the configured dev command/port) and navigate to `/admin`, logging in as an admin account if required.

- [ ] **Step 2: Open the ปฏิทิน tab and verify**

- The "ต้องทำตอนนี้" agenda list renders with real event titles, dates, and status badges (not stuck on the loading skeleton).
- Clicking an agenda row expands it and shows `searchTerms` chips and `contentIdeas`.
- The month grid renders the current month with colored dots on the correct days.
- Clicking a day with events shows that day's items below the grid.
- Toggling a category filter button hides/shows matching dots and agenda rows.
- Check the browser console for errors (`read_console_messages` equivalent) — expect none.

- [ ] **Step 3: Fix any issues found, re-verify**

If anything renders wrong, read the relevant source file, fix it, and repeat Step 2.

- [ ] **Step 4: Take a screenshot as proof and report to the user**

No commit needed for this task — it's verification only. If Step 3 required fixes, those get their own commit at that point (`git add <file> && git commit -m "fix(calendar): <what was wrong>"`).

---

## Final check

- [ ] Run `npx vitest run` — all tests pass
- [ ] Run `npx tsc --noEmit` — no type errors
- [ ] Run `npm run lint` — no new lint errors introduced
- [ ] Run `npm run build` — production build succeeds
