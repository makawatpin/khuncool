/** A status key from the activity's config ("present", "done", …). */
export type CheckStatus = string;

/**
 * Daily records (attendance, toothbrushing, school milk…), one entry per school day. Each day maps a student's
 * name to their status, so a day's record still lines up after names are
 * added, removed or reordered. A student with no entry has no status yet.
 */
export type CheckDays = Record<string, Record<string, CheckStatus>>;

export interface CheckState {
  students: string[];
  room: string;
  days: CheckDays;
  /** Weekdays the teacher marked as no school (public holidays and the like). */
  holidays: string[];
}

/** YYYY-MM-DD in the device's local time zone. */
export function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** `iso` itself on a weekday; the Friday before it on a weekend. */
export function latestSchoolDay(iso: string): string {
  const day = fromIsoDate(iso).getDay();
  return day === 0 || day === 6 ? shiftSchoolDay(iso, -1) : iso;
}

/**
 * Gives every student who has no status yet `fill`, keeping the ones already
 * set. Students in `notInClass` get `notInClassKey` instead: not at school
 * counts as not done.
 */
export function fillBlanks(
  statuses: (CheckStatus | null)[],
  students: string[],
  fill: CheckStatus,
  notInClass: ReadonlySet<string> = new Set(),
  notInClassKey: CheckStatus | null = null,
): CheckStatus[] {
  return statuses.map(
    (s, i) => s ?? (notInClassKey && notInClass.has(students[i]) ? notInClassKey : fill),
  );
}

/** Steps `delta` days from `iso`, skipping Saturdays and Sundays. */
export function shiftSchoolDay(iso: string, delta: -1 | 1): string {
  const d = fromIsoDate(iso);
  do {
    d.setDate(d.getDate() + delta);
  } while (d.getDay() === 0 || d.getDay() === 6);
  return toIsoDate(d);
}

export function dayStatuses(
  days: CheckDays,
  date: string,
  students: string[],
): (CheckStatus | null)[] {
  const day = days[date] ?? {};
  return students.map((name) => day[name] ?? null);
}

/** Returns `days` with `date` rewritten from a list aligned to `students`. */
export function withDayStatuses(
  days: CheckDays,
  date: string,
  students: string[],
  statuses: (CheckStatus | null)[],
): CheckDays {
  const day: Record<string, CheckStatus> = {};
  students.forEach((name, i) => {
    const s = statuses[i];
    if (s) day[name] = s;
  });
  const next = { ...days };
  if (Object.keys(day).length) next[date] = day;
  else delete next[date];
  return next;
}

/**
 * Reads the saved JSON, keeping only statuses in `valid`. The first format
 * kept a single day as a `statuses` list (the attendance app shipped that
 * way); it is moved onto the day it was last marked (`checkedAt`, else
 * `savedAt`, else `today`) so nothing already recorded is lost.
 */
export function parseCheckState(
  raw: string,
  today: string,
  valid: ReadonlySet<string>,
): CheckState | null {
  try {
    const d = JSON.parse(raw);
    if (!Array.isArray(d.students) || !d.students.length) return null;
    const students = d.students.map(String);
    const room = typeof d.room === "string" ? d.room : "";
    const holidays: string[] = Array.isArray(d.holidays)
      ? d.holidays.filter((h: unknown) => typeof h === "string" && /^\d{4}-\d{2}-\d{2}$/.test(h))
      : [];
    if (d.days && typeof d.days === "object") {
      const days: CheckDays = {};
      for (const [date, entry] of Object.entries(d.days as Record<string, unknown>)) {
        if (!entry || typeof entry !== "object") continue;
        const day: Record<string, CheckStatus> = {};
        for (const [name, s] of Object.entries(entry as Record<string, unknown>)) {
          if (typeof s === "string" && valid.has(s)) day[name] = s;
        }
        if (Object.keys(day).length) days[date] = day;
      }
      return { students, room, days, holidays };
    }
    const statuses = Array.isArray(d.statuses)
      ? d.statuses.map((s: unknown) => (typeof s === "string" && valid.has(s) ? s : null))
      : [];
    const stamp = typeof d.checkedAt === "number" ? d.checkedAt : d.savedAt;
    const legacyDate = typeof stamp === "number" ? toIsoDate(new Date(stamp)) : today;
    return { students, room, days: withDayStatuses({}, legacyDate, students, statuses), holidays };
  } catch {
    return null;
  }
}

/** "YYYY-MM" of an ISO date. */
export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

export function shiftMonth(month: string, delta: -1 | 1): string {
  const [y, m] = month.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1 + delta, 1)).slice(0, 7);
}

/** Every day of `month` ("YYYY-MM"), 1 to 28–31, as ISO dates. */
export function monthDays(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const out: string[] = [];
  for (const d = new Date(y, m - 1, 1); d.getMonth() === m - 1; d.setDate(d.getDate() + 1)) {
    out.push(toIsoDate(d));
  }
  return out;
}

export function isWeekend(iso: string): boolean {
  const day = fromIsoDate(iso).getDay();
  return day === 0 || day === 6;
}

/** Every Monday–Friday of `month` ("YYYY-MM"), as ISO dates. */
export function monthSchoolDays(month: string): string[] {
  return monthDays(month).filter((d) => !isWeekend(d));
}

export interface StudentMonthTotals {
  /** Days per status key. */
  counts: Record<CheckStatus, number>;
  /** Share of positive statuses among the days this student has one; null when none. */
  percent: number | null;
}

/**
 * Per-student totals for `month`. Only days with a record count, so a day
 * the teacher never filled in does not drag anyone's percentage down, and
 * holidays never count.
 */
export function monthSummary(
  days: Readonly<Record<string, Readonly<Record<string, CheckStatus>>>>,
  month: string,
  students: string[],
  holidays: readonly string[],
  positive: ReadonlySet<CheckStatus>,
): { recordedDays: string[]; perStudent: StudentMonthTotals[] } {
  return periodSummary(days, monthSchoolDays(month), students, holidays, positive);
}

/**
 * Per-student totals over the given school days (a month, a term…). Same
 * rules as monthSummary: only recorded days count, holidays never do.
 */
export function periodSummary(
  days: Readonly<Record<string, Readonly<Record<string, CheckStatus>>>>,
  schoolDays: readonly string[],
  students: string[],
  holidays: readonly string[],
  positive: ReadonlySet<CheckStatus>,
): { recordedDays: string[]; perStudent: StudentMonthTotals[] } {
  const recordedDays = schoolDays.filter((d) => days[d] && !holidays.includes(d));
  const perStudent = students.map((name) => {
    const counts: Record<CheckStatus, number> = {};
    let n = 0;
    let good = 0;
    for (const d of recordedDays) {
      const s = days[d][name];
      if (!s) continue;
      counts[s] = (counts[s] ?? 0) + 1;
      n++;
      if (positive.has(s)) good++;
    }
    return { counts, percent: n ? Math.round((good / n) * 100) : null };
  });
  return { recordedDays, perStudent };
}
