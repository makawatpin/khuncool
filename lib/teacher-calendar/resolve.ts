import type { EventStatus, Occurrence, ResolvedDate } from "./types";
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
