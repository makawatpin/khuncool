import { describe, expect, it } from "vitest";
import { attendanceForPeriod, notInClassOn } from "./attendanceToday";

const at = (y: number, m: number, d: number, h = 9) => new Date(y, m - 1, d, h).getTime();

describe("notInClassOn", () => {
  const raw = JSON.stringify({
    students: ["ก", "ข", "ค", "ง"],
    room: "ป.5/2",
    days: {
      "2026-11-02": { ก: "absent" },
      "2026-11-03": { ก: "present", ข: "absent", ค: "leave", ง: "late" },
    },
  });

  it("returns the students marked absent or on leave that day", () => {
    expect(notInClassOn(raw, "2026-11-03")).toEqual(["ข", "ค"]);
    expect(notInClassOn(raw, "2026-11-02")).toEqual(["ก"]);
  });

  it("returns nobody for a day that was not checked", () => {
    expect(notInClassOn(raw, "2026-11-04")).toEqual([]);
  });

  it("reads the old single check-in on the day it was marked", () => {
    const old = JSON.stringify({
      students: ["ก", "ข"],
      statuses: ["absent", "present"],
      checkedAt: at(2026, 11, 3),
      savedAt: at(2026, 11, 3),
    });
    expect(notInClassOn(old, "2026-11-03")).toEqual(["ก"]);
    expect(notInClassOn(old, "2026-11-02")).toEqual([]);
  });

  it("ignores bad input", () => {
    expect(notInClassOn("nope", "2026-11-03")).toEqual([]);
    expect(notInClassOn(null, "2026-11-03")).toEqual([]);
  });
});

describe("attendanceForPeriod", () => {
  const raw = JSON.stringify({
    students: ["ก", "ข"],
    room: "ป.5/2",
    holidays: ["2026-11-04"],
    days: {
      "2026-10-30": { ก: "absent", ข: "absent" },
      "2026-11-02": { ก: "present", ข: "late" },
      "2026-11-03": { ก: "absent", ข: "present" },
      "2026-11-04": { ก: "absent", ข: "absent" },
    },
  });

  it("totals each student over the period, leaving out other dates and holidays", () => {
    expect(attendanceForPeriod(raw, "2026-11-01", "2027-04-30")).toEqual({
      room: "ป.5/2",
      from: "2026-11-01",
      to: "2027-04-30",
      checkedDays: 2,
      rows: [
        { name: "ก", present: 1, late: 0, leave: 0, absent: 1, percent: 50 },
        { name: "ข", present: 1, late: 1, leave: 0, absent: 0, percent: 100 },
      ],
    });
  });

  it("is null without attendance data", () => {
    expect(attendanceForPeriod(null, "2026-11-01", "2027-04-30")).toBeNull();
  });
});
