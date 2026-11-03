import { describe, expect, it } from "vitest";
import { notInClassOn } from "./attendanceToday";

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
