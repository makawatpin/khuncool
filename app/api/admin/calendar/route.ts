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
