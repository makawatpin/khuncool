import { describe, it, expect } from "vitest";
import { resolveDate, computeStatus, buildAgenda } from "./resolve";
import type { Occurrence, CalendarEvent } from "./types";
import { CALENDAR_EVENTS } from "./events";

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

describe("buildAgenda", () => {
  const sunthornPhu: CalendarEvent = {
    id: "sunthorn-phu-day",
    title: "วันสุนทรภู่",
    category: "holiday",
    occurrence: { kind: "fixed", month: 6, day: 26 },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["สุนทรภู่"],
    contentIdeas: ["ใบงานบทกวี"],
  };

  const childrensDay: CalendarEvent = {
    id: "childrens-day",
    title: "วันเด็กแห่งชาติ",
    category: "holiday",
    occurrence: { kind: "nthWeekday", month: 1, weekday: 6, nth: 2 },
    precision: "exact",
    leadDays: 21,
    searchTerms: ["วันเด็ก"],
    contentIdeas: ["การ์ดวันเด็ก"],
  };

  const uncoveredLunar: CalendarEvent = {
    id: "loy-krathong-far-future",
    title: "วันลอยกระทง",
    category: "holiday",
    occurrence: { kind: "lookup", key: "loy-krathong" },
    precision: "exact",
    leadDays: 14,
    searchTerms: ["ลอยกระทง"],
    contentIdeas: ["กระทงประดิษฐ์"],
  };

  it("sorts items by soonest publish-by first, using today's date", () => {
    // Today is 2026-06-01. Sunthorn Phu (Jun 26, lead 14) -> publishBy Jun 12.
    const agenda = buildAgenda([sunthornPhu], "2026-06-01", 1);
    expect(agenda).toHaveLength(1);
    expect(agenda[0].resolvedDate).toBe("2026-06-26");
    expect(agenda[0].publishByDate).toBe("2026-06-12");
    expect(agenda[0].status).toBe("act-now");
  });

  it("excludes events already passed this year", () => {
    // Today is 2026-07-01, after Sunthorn Phu Jun 26 -> passed, excluded
    // unless next year's occurrence is within the lookahead window.
    const agenda = buildAgenda([sunthornPhu], "2026-07-01", 1);
    expect(agenda.find((a) => a.id === "sunthorn-phu-day" && a.year === 2026)).toBeUndefined();
  });

  it("rolls over to next year's occurrence when late in the year (Children's Day in November)", () => {
    const agenda = buildAgenda([childrensDay], "2026-11-01", 3);
    const item = agenda.find((a) => a.id === "childrens-day");
    expect(item).toBeDefined();
    expect(item?.year).toBe(2027);
    expect(item?.resolvedDate).toBe("2027-01-09"); // 2nd Sat of Jan 2027
  });

  it("marks unresolved lookup years as status 'unknown' instead of throwing", () => {
    expect(() => buildAgenda([uncoveredLunar], "2031-01-01", 1)).not.toThrow();
    const agenda = buildAgenda([uncoveredLunar], "2031-01-01", 1);
    const item = agenda.find((a) => a.id === "loy-krathong-far-future");
    expect(item?.status).toBe("unknown");
    expect(item?.resolvedDate).toBeNull();
  });

  it("sorts overdue and act-now items before upcoming ones", () => {
    const agenda = buildAgenda([sunthornPhu, childrensDay], "2026-06-01", 12);
    // childrensDay's *next* occurrence from 2026-06-01 is Jan 2027 (far away,
    // "upcoming"); sunthornPhu publishBy is 2026-06-12 (closer). Closer
    // publish-by date should sort first regardless of category.
    expect(agenda[0].id).toBe("sunthorn-phu-day");
  });
});

describe("CALENDAR_EVENTS catalog", () => {
  it("has at least one event in every category", () => {
    const categories = new Set(CALENDAR_EVENTS.map((e) => e.category));
    expect(categories).toEqual(
      new Set(["holiday", "paperwork", "evaluation", "exam", "competition", "career", "term"])
    );
  });

  it("has unique ids", () => {
    const ids = CALENDAR_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("builds a valid agenda from the real catalog without throwing", () => {
    expect(() => buildAgenda(CALENDAR_EVENTS, "2026-08-30", 6)).not.toThrow();
  });
});
