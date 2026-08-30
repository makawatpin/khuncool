import { describe, it, expect } from "vitest";
import { resolveDate } from "./resolve";
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
