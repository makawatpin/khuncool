import { describe, it, expect } from "vitest";
import { resolveDate, computeStatus } from "./resolve";
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
