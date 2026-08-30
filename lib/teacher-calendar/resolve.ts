import type { AgendaItem, CalendarEvent, EventStatus, Occurrence, ResolvedDate } from "./types";
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
