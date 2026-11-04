import { DAILY_CHECKS } from "@/lib/dailyCheck/config";
import { fromIsoDate, isWeekend, parseCheckState, periodSummary, toIsoDate } from "@/lib/dailyCheck/days";

export const ATTENDANCE_LS_KEY = DAILY_CHECKS.attendance.lsKey;

const ATTENDANCE_KEYS = new Set(DAILY_CHECKS.attendance.statuses.map((s) => s.key));

/**
 * Names the attendance app marked absent (ขาด) or on leave (ลา) on `date`.
 * Empty when that day was not checked.
 */
export function notInClassOn(raw: string | null, date: string): string[] {
  if (!raw) return [];
  const state = parseCheckState(raw, date, ATTENDANCE_KEYS);
  const day = state?.days[date];
  if (!state || !day) return [];
  return state.students.filter((n) => day[n] === "absent" || day[n] === "leave");
}

export interface PeriodAttendance {
  room: string;
  from: string;
  to: string;
  /** School days in the period that were checked (holidays left out). */
  checkedDays: number;
  rows: { name: string; present: number; late: number; leave: number; absent: number; percent: number | null }[];
}

/**
 * Per-student attendance totals from `from` to `to` (inclusive), for a
 * term summary. Late counts as present for the percentage, as in the
 * attendance app's month view. Null when there is no attendance data.
 */
export function attendanceForPeriod(raw: string | null, from: string, to: string): PeriodAttendance | null {
  if (!raw) return null;
  const state = parseCheckState(raw, to, ATTENDANCE_KEYS);
  if (!state) return null;
  const schoolDays: string[] = [];
  for (const d = fromIsoDate(from); toIsoDate(d) <= to; d.setDate(d.getDate() + 1)) {
    const iso = toIsoDate(d);
    if (!isWeekend(iso)) schoolDays.push(iso);
  }
  const positive = new Set(DAILY_CHECKS.attendance.statuses.filter((s) => s.positive).map((s) => s.key));
  const { recordedDays, perStudent } = periodSummary(state.days, schoolDays, state.students, state.holidays, positive);
  return {
    room: state.room,
    from,
    to,
    checkedDays: recordedDays.length,
    rows: state.students.map((name, i) => {
      const c = perStudent[i].counts;
      return {
        name,
        present: c.present ?? 0,
        late: c.late ?? 0,
        leave: c.leave ?? 0,
        absent: c.absent ?? 0,
        percent: perStudent[i].percent,
      };
    }),
  };
}
