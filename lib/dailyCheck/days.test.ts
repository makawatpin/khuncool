import { describe, expect, it } from "vitest";
import {
  dayStatuses,
  fillBlanks,
  latestSchoolDay,
  isWeekend,
  monthDays,
  monthSchoolDays,
  monthSummary,
  shiftMonth,
  parseCheckState,
  renameInDays,
  shiftSchoolDay,
  toIsoDate,
  withDayStatuses,
} from "./days";

describe("toIsoDate", () => {
  it("formats the local calendar date", () => {
    expect(toIsoDate(new Date(2026, 10, 3))).toBe("2026-11-03");
  });
});

describe("shiftSchoolDay", () => {
  it("moves one weekday at a time", () => {
    expect(shiftSchoolDay("2026-11-03", 1)).toBe("2026-11-04");
    expect(shiftSchoolDay("2026-11-03", -1)).toBe("2026-11-02");
  });

  it("skips the weekend in both directions", () => {
    // 2026-11-06 is a Friday, 2026-11-09 the Monday after.
    expect(shiftSchoolDay("2026-11-06", 1)).toBe("2026-11-09");
    expect(shiftSchoolDay("2026-11-09", -1)).toBe("2026-11-06");
  });
});

describe("latestSchoolDay", () => {
  it("keeps a weekday and moves a weekend back to Friday", () => {
    expect(latestSchoolDay("2026-11-04")).toBe("2026-11-04");
    expect(latestSchoolDay("2026-11-07")).toBe("2026-11-06");
    expect(latestSchoolDay("2026-11-08")).toBe("2026-11-06");
  });
});

const TB = new Set(["done", "skipped"]);
const ATT = new Set(["present", "late", "leave", "absent"]);
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 9).getTime();

describe("fillBlanks", () => {
  it("ticks only the students with no status", () => {
    expect(fillBlanks(["skipped", null, "done", null], ["ก", "ข", "ค", "ง"], "done")).toEqual([
      "skipped",
      "done",
      "done",
      "done",
    ]);
  });

  it("gives ✗ to students not in class", () => {
    expect(fillBlanks([null, null, "done"], ["ก", "ข", "ค"], "done", new Set(["ข", "ค"]), "skipped")).toEqual([
      "done",
      "skipped",
      "done",
    ]);
  });

  it("ignores absences when there is no status for them", () => {
    expect(fillBlanks([null, "late"], ["ก", "ข"], "present", new Set(["ก"]), null)).toEqual([
      "present",
      "late",
    ]);
  });
});

describe("day records", () => {
  const students = ["ก", "ข", "ค"];

  it("keeps each day separate", () => {
    let days = withDayStatuses({}, "2026-11-02", students, ["done", "skipped", null]);
    days = withDayStatuses(days, "2026-11-03", students, ["skipped", null, "done"]);
    expect(dayStatuses(days, "2026-11-02", students)).toEqual(["done", "skipped", null]);
    expect(dayStatuses(days, "2026-11-03", students)).toEqual(["skipped", null, "done"]);
  });

  it("returns blanks for a day with no record", () => {
    expect(dayStatuses({}, "2026-11-03", students)).toEqual([null, null, null]);
  });

  it("follows the student, not the row number, when the list changes", () => {
    const days = withDayStatuses({}, "2026-11-03", students, ["done", "skipped", null]);
    expect(dayStatuses(days, "2026-11-03", ["ข", "ง"])).toEqual(["skipped", null]);
  });

  it("drops a day that ends up empty", () => {
    let days = withDayStatuses({}, "2026-11-03", students, ["done", null, null]);
    days = withDayStatuses(days, "2026-11-03", students, [null, null, null]);
    expect(days).toEqual({});
  });
});

describe("parseCheckState", () => {
  it("reads the per-day format", () => {
    const raw = JSON.stringify({
      students: ["ก"],
      room: "ป.1/1",
      days: { "2026-11-03": { ก: "done" } },
    });
    expect(parseCheckState(raw, "2026-11-03", TB)).toEqual({
      students: ["ก"],
      room: "ป.1/1",
      days: { "2026-11-03": { ก: "done" } },
      holidays: [],
    });
  });

  it("keeps valid holidays only", () => {
    const raw = JSON.stringify({ students: ["ก"], days: {}, holidays: ["2026-12-05", 7, "soon"] });
    expect(parseCheckState(raw, "2026-11-03", TB)?.holidays).toEqual(["2026-12-05"]);
  });

  it("moves an old attendance check-in onto the day it was marked", () => {
    const raw = JSON.stringify({
      students: ["ก", "ข", "ค"],
      statuses: ["present", "absent", null],
      room: "ป.5/2",
      checkedAt: at(2026, 10, 30),
      savedAt: at(2026, 11, 3),
    });
    expect(parseCheckState(raw, "2026-11-03", ATT)).toEqual({
      students: ["ก", "ข", "ค"],
      room: "ป.5/2",
      days: { "2026-10-30": { ก: "present", ข: "absent" } },
      holidays: [],
    });
  });

  it("falls back to savedAt when an old check-in has no checkedAt", () => {
    const raw = JSON.stringify({ students: ["ก"], statuses: ["late"], savedAt: at(2026, 10, 29) });
    expect(parseCheckState(raw, "2026-11-03", ATT)?.days).toEqual({ "2026-10-29": { ก: "late" } });
  });

  it("moves the old single-day format onto today", () => {
    const raw = JSON.stringify({ students: ["ก", "ข"], statuses: ["skipped", null], room: "ป.2/1" });
    expect(parseCheckState(raw, "2026-11-03", TB)).toEqual({
      students: ["ก", "ข"],
      room: "ป.2/1",
      days: { "2026-11-03": { ก: "skipped" } },
      holidays: [],
    });
  });

  it("ignores unknown statuses and bad input", () => {
    const raw = JSON.stringify({ students: ["ก"], days: { "2026-11-03": { ก: "leave" } } });
    expect(parseCheckState(raw, "2026-11-03", TB)?.days).toEqual({});
    expect(parseCheckState("not json", "2026-11-03", TB)).toBeNull();
    expect(parseCheckState(JSON.stringify({ students: [] }), "2026-11-03", TB)).toBeNull();
  });
});

describe("monthSchoolDays", () => {
  it("lists the weekdays of a month in order", () => {
    // November 2026 starts on a Sunday and has 21 weekdays.
    const days = monthSchoolDays("2026-11");
    expect(days).toHaveLength(21);
    expect(days[0]).toBe("2026-11-02");
    expect(days.at(-1)).toBe("2026-11-30");
    expect(days).not.toContain("2026-11-07");
  });
});

describe("monthDays", () => {
  it("lists every calendar day, weekends included", () => {
    const days = monthDays("2026-11");
    expect(days).toHaveLength(30);
    expect(days.filter(isWeekend)).toHaveLength(9);
    expect(monthDays("2028-02")).toHaveLength(29);
  });
});

describe("shiftMonth", () => {
  it("crosses year boundaries", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
});

describe("monthSummary", () => {
  const students = ["ก", "ข"];
  const POS = new Set(["done"]);
  const days = {
    "2026-11-02": { ก: "done", ข: "skipped" },
    "2026-11-03": { ก: "done", ข: "done" },
    "2026-12-01": { ก: "skipped" },
  } as const;

  it("counts only the month's recorded days", () => {
    const s = monthSummary(days, "2026-11", students, [], POS);
    expect(s.recordedDays).toEqual(["2026-11-02", "2026-11-03"]);
    expect(s.perStudent).toEqual([
      { counts: { done: 2 }, percent: 100 },
      { counts: { done: 1, skipped: 1 }, percent: 50 },
    ]);
  });

  it("leaves holidays out even when they hold a record", () => {
    const s = monthSummary(days, "2026-11", students, ["2026-11-02"], POS);
    expect(s.recordedDays).toEqual(["2026-11-03"]);
    expect(s.perStudent[1]).toEqual({ counts: { done: 1 }, percent: 100 });
  });

  it("gives no percent to a student with nothing recorded", () => {
    const s = monthSummary(days, "2026-11", ["ค"], [], POS);
    expect(s.perStudent).toEqual([{ counts: {}, percent: null }]);
  });

  it("counts late as present for attendance", () => {
    const att = {
      "2026-11-02": { ก: "present" },
      "2026-11-03": { ก: "late" },
      "2026-11-04": { ก: "absent" },
      "2026-11-05": { ก: "leave" },
    };
    const s = monthSummary(att, "2026-11", ["ก"], [], new Set(["present", "late"]));
    expect(s.perStudent[0]).toEqual({ counts: { present: 1, late: 1, absent: 1, leave: 1 }, percent: 50 });
  });
});

describe("renameInDays", () => {
  it("moves a renamed student's records on every day", () => {
    const days = {
      "2026-11-02": { "ข ไข่": "absent", ก: "present" },
      "2026-11-03": { "ข ไข่": "late" },
    };
    expect(renameInDays(days, [{ from: "ข ไข่", to: "ข ไข่ ดีใจ" }])).toEqual({
      "2026-11-02": { "ข ไข่ ดีใจ": "absent", ก: "present" },
      "2026-11-03": { "ข ไข่ ดีใจ": "late" },
    });
  });
});
