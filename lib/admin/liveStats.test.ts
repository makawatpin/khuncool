import { describe, expect, it } from "vitest";
import { bangkokHour, computeLiveStats, startOfBangkokYesterday } from "./liveStats";

// 2026-11-10 14:30 in Thailand.
const NOW = new Date("2026-11-10T07:30:00Z");

describe("bangkokHour", () => {
  it("shifts UTC by seven hours", () => {
    expect(bangkokHour("2026-11-10T00:15:00Z")).toBe(7);
    expect(bangkokHour("2026-11-09T17:05:00Z")).toBe(0);
  });
});

describe("startOfBangkokYesterday", () => {
  it("is Thai midnight of the day before", () => {
    expect(startOfBangkokYesterday(NOW)).toBe("2026-11-08T17:00:00.000Z");
  });
});

describe("computeLiveStats", () => {
  const users = [
    { id: "u1", email: "a@x.com", created_at: "2026-11-01T00:00:00Z", app_metadata: { provider: "google" } },
    { id: "u2", email: "b@x.com", created_at: "2026-11-10T01:00:00Z", app_metadata: { provider: "email" } },
  ];

  const events = [
    // Inside the 15-minute window.
    { tool: "duck-race", event: "use", user_id: "u1", created_at: "2026-11-10T07:25:00Z" },
    { tool: "duck-race", event: "use", user_id: "u1", created_at: "2026-11-10T07:20:00Z" },
    { tool: "timer", event: "use", user_id: null, created_at: "2026-11-10T07:28:00Z" },
    // Earlier today (Thai) — 00:30 Thai is still 2026-11-09 in UTC.
    { tool: "timer", event: "use", user_id: null, created_at: "2026-11-09T17:30:00Z" },
    // Yesterday (Thai), before and after 14:30.
    { tool: "timer", event: "use", user_id: "u2", created_at: "2026-11-09T03:00:00Z" },
    { tool: "timer", event: "use", user_id: null, created_at: "2026-11-09T10:00:00Z" },
  ];

  const stats = computeLiveStats(events, users, NOW);

  it("counts the rolling window", () => {
    expect(stats.eventsInWindow).toBe(3);
    expect(stats.signedInNow).toBe(1);
    expect(stats.guestEventsInWindow).toBe(1);
  });

  it("buckets today and yesterday on Thai days", () => {
    expect(stats.eventsToday).toBe(4);
    expect(stats.hourlyToday[0]).toBe(1);
    expect(stats.hourlyToday[14]).toBe(3);
    expect(stats.hourlyYesterday[10]).toBe(1);
    expect(stats.hourlyYesterday[17]).toBe(1);
  });

  it("compares with yesterday only up to the same clock time", () => {
    expect(stats.eventsYesterdaySoFar).toBe(1);
  });

  it("lists newest events first with the member's email", () => {
    expect(stats.recentEvents[0]).toMatchObject({ tool: "timer", who: null });
    expect(stats.recentEvents[1]).toMatchObject({ tool: "duck-race", who: "a@x.com" });
  });

  it("lists newest signups first", () => {
    expect(stats.recentSignups[0]).toEqual({
      email: "b@x.com",
      provider: "email",
      created_at: "2026-11-10T01:00:00Z",
    });
  });
});
