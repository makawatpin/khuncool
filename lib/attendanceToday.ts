import { DAILY_CHECKS } from "@/lib/dailyCheck/config";
import { parseCheckState } from "@/lib/dailyCheck/days";

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
