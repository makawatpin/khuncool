import { describe, expect, it } from "vitest";
import { academicTermFor, termBounds, weekToAdd } from "./homeroomDates";

describe("weekToAdd", () => {
  it("starts with this week's Monday to Friday", () => {
    // Tuesday 3 Nov 2026, late evening.
    expect(weekToAdd([], new Date(2026, 10, 3, 23, 30))).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
    ]);
  });

  it("adds the Monday to Friday after the latest recorded day", () => {
    expect(weekToAdd(["2026-11-02", "2026-11-06"], new Date(2026, 10, 3))).toEqual([
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
    ]);
  });

  it("works from a Sunday 'today' too", () => {
    expect(weekToAdd([], new Date(2026, 10, 8, 6, 0))[0]).toBe("2026-11-02");
  });

  it("crosses a month end", () => {
    expect(weekToAdd(["2026-11-27"], new Date(2026, 10, 27))).toEqual([
      "2026-11-30",
      "2026-12-01",
      "2026-12-02",
      "2026-12-03",
      "2026-12-04",
    ]);
  });
});

describe("academicTermFor", () => {
  it("is term 1 from May to October", () => {
    expect(academicTermFor(new Date(2026, 4, 16))).toEqual({ term: "1", year: "2569" });
    expect(academicTermFor(new Date(2026, 9, 31))).toEqual({ term: "1", year: "2569" });
  });

  it("is term 2 from November, still the same academic year into the next calendar year", () => {
    expect(academicTermFor(new Date(2026, 10, 4))).toEqual({ term: "2", year: "2569" });
    expect(academicTermFor(new Date(2027, 1, 10))).toEqual({ term: "2", year: "2569" });
    expect(academicTermFor(new Date(2027, 3, 30))).toEqual({ term: "2", year: "2569" });
  });
});

describe("termBounds", () => {
  it("covers May to October for term 1", () => {
    expect(termBounds("1", "2569")).toEqual({ from: "2026-05-01", to: "2026-10-31" });
  });

  it("covers November to April for term 2", () => {
    expect(termBounds("2", "2569")).toEqual({ from: "2026-11-01", to: "2027-04-30" });
  });

  it("returns null for a year it cannot read", () => {
    expect(termBounds("1", "")).toBeNull();
    expect(termBounds("3", "2569")).toBeNull();
  });
});
