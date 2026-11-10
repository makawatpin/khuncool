import { bangkokDay } from "./bangkokDay";

export interface LiveEvent {
  tool: string;
  event: string;
  user_id: string | null;
  created_at: string;
}

export interface LiveUser {
  id: string;
  email?: string | null;
  created_at: string;
  app_metadata?: Record<string, unknown> | null;
}

export interface LiveStats {
  generatedAt: string;
  /** Rolling window used for the "right now" figures, in minutes. */
  windowMinutes: number;
  eventsInWindow: number;
  signedInNow: number;
  guestEventsInWindow: number;
  eventsToday: number;
  /** Events yesterday up to the same Thai clock time as now. */
  eventsYesterdaySoFar: number;
  hourlyToday: number[];
  hourlyYesterday: number[];
  recentEvents: {
    tool: string;
    event: string;
    who: string | null;
    created_at: string;
  }[];
  recentSignups: { email: string | null; provider: string | null; created_at: string }[];
}

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/** Hour of day (0–23) an instant falls on in Thailand. */
export function bangkokHour(instant: Date | string): number {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  const hour = Number(
    date.toLocaleString("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", hour12: false }),
  );
  return hour % 24;
}

/** Milliseconds since Thai midnight for an instant (Thailand has no DST). */
function msIntoBangkokDay(instant: Date): number {
  const shifted = instant.getTime() + 7 * 60 * MINUTE_MS;
  return ((shifted % DAY_MS) + DAY_MS) % DAY_MS;
}

/** Pure aggregation behind /api/admin/live, kept apart from the route so
 *  the Thai-day bucketing can be tested without a database. `events` must
 *  cover at least the start of yesterday (Thai) up to `now`. */
export function computeLiveStats(
  events: LiveEvent[],
  users: LiveUser[],
  now: Date = new Date(),
  windowMinutes = 15,
): LiveStats {
  const nowMs = now.getTime();
  const windowStart = nowMs - windowMinutes * MINUTE_MS;
  const today = bangkokDay(now);
  const yesterday = bangkokDay(new Date(nowMs - DAY_MS));
  const nowIntoDay = msIntoBangkokDay(now);

  const emailById = new Map(users.map((u) => [u.id, u.email ?? null]));

  let eventsInWindow = 0;
  let guestEventsInWindow = 0;
  const signedInIds = new Set<string>();
  let eventsToday = 0;
  let eventsYesterdaySoFar = 0;
  const hourlyToday = Array<number>(24).fill(0);
  const hourlyYesterday = Array<number>(24).fill(0);

  for (const e of events) {
    const at = new Date(e.created_at);
    const t = at.getTime();
    if (t > nowMs) continue;

    if (t >= windowStart) {
      eventsInWindow += 1;
      if (e.user_id) signedInIds.add(e.user_id);
      else guestEventsInWindow += 1;
    }

    const day = bangkokDay(at);
    if (day === today) {
      eventsToday += 1;
      hourlyToday[bangkokHour(at)] += 1;
    } else if (day === yesterday) {
      hourlyYesterday[bangkokHour(at)] += 1;
      if (msIntoBangkokDay(at) <= nowIntoDay) eventsYesterdaySoFar += 1;
    }
  }

  const recentEvents = [...events]
    .filter((e) => new Date(e.created_at).getTime() <= nowMs)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
    .map((e) => ({
      tool: e.tool,
      event: e.event,
      who: e.user_id ? (emailById.get(e.user_id) ?? "สมาชิก") : null,
      created_at: e.created_at,
    }));

  const recentSignups = [...users]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6)
    .map((u) => ({
      email: u.email ?? null,
      provider: typeof u.app_metadata?.provider === "string" ? u.app_metadata.provider : null,
      created_at: u.created_at,
    }));

  return {
    generatedAt: now.toISOString(),
    windowMinutes,
    eventsInWindow,
    signedInNow: signedInIds.size,
    guestEventsInWindow,
    eventsToday,
    eventsYesterdaySoFar,
    hourlyToday,
    hourlyYesterday,
    recentEvents,
    recentSignups,
  };
}

/** Start of yesterday in Thailand, as an ISO instant — the earliest event
 *  computeLiveStats needs. */
export function startOfBangkokYesterday(now: Date = new Date()): string {
  const startOfToday = now.getTime() - msIntoBangkokDay(now);
  return new Date(startOfToday - DAY_MS).toISOString();
}
