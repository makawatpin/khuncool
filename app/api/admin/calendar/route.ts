import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { CALENDAR_EVENTS } from "@/lib/teacher-calendar/events";
import { buildAgenda, resolveDate, computeStatus } from "@/lib/teacher-calendar/resolve";
import type { AgendaItem } from "@/lib/teacher-calendar/types";

const MONTHS_AHEAD = 6;

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
  // event that could land on any day of it. Ranges anchored in December can
  // spill into January/February of the following year, so each event is
  // resolved against both `year - 1` and `year` and included if its
  // resolved [start, end] interval overlaps the requested month. Ranges are
  // anchored to a single marker on the grid (the later of the event's start
  // date or the first day of the month).
  const totalDays = daysInMonth(year, month);
  const dayItems: Record<string, AgendaItem[]> = {};
  for (let d = 1; d <= totalDays; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dayItems[iso] = [];
  }

  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const monthStart = `${monthPrefix}-01`;
  const monthEnd = `${monthPrefix}-${String(totalDays).padStart(2, "0")}`;
  const addedEventIds = new Set<string>();

  for (const event of CALENDAR_EVENTS) {
    if (addedEventIds.has(event.id)) continue;

    for (const candidateYear of [year - 1, year]) {
      const resolved = resolveDate(event.occurrence, candidateYear);
      if (!resolved) continue;

      const overlapsMonth = resolved.eventDate <= monthEnd && resolved.eventEndDate >= monthStart;
      if (!overlapsMonth) continue;

      const anchorDate = resolved.eventDate >= monthStart ? resolved.eventDate : monthStart;
      if (!dayItems[anchorDate]) continue;

      const status = computeStatus(event.leadDays, resolved, today);
      dayItems[anchorDate].push({
        ...event,
        year: candidateYear,
        resolvedDate: resolved.eventDate,
        resolvedEndDate: resolved.eventEndDate,
        publishByDate: null,
        status,
        daysUntilEvent: null,
        daysUntilPublishBy: null,
      });
      addedEventIds.add(event.id);
      break;
    }
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
