import { describe, expect, it } from "vitest";
import { attendanceSnapshotFrom } from "./printHomeroom";

describe("attendanceSnapshotFrom", () => {
  const perDay = {
    students: ["ก", "ข", "ค"],
    room: "ป.5/2",
    days: {
      "2026-11-02": { ก: "absent", ข: "present", ค: "present" },
      "2026-11-03": { ก: "present", ข: "leave", ค: "late" },
    },
  };

  it("uses the session's day when it was checked", () => {
    const a = attendanceSnapshotFrom(perDay, "2026-11-02");
    expect(a?.absent).toEqual(["ก"]);
    expect(a?.present).toBe(2);
    expect(a?.savedAt).toBe(new Date(2026, 10, 2).getTime());
  });

  it("falls back to the latest checked day", () => {
    const a = attendanceSnapshotFrom(perDay, "2026-11-05");
    expect(a?.leave).toEqual(["ข"]);
    expect(a?.late).toEqual(["ค"]);
    expect(a?.present).toBe(2);
  });

  it("still reads the old single check-in", () => {
    const a = attendanceSnapshotFrom({ students: ["ก", "ข"], statuses: ["absent", "present"], savedAt: 5 });
    expect(a?.absent).toEqual(["ก"]);
    expect(a?.savedAt).toBe(5);
  });

  it("returns null with no checked day", () => {
    expect(attendanceSnapshotFrom({ students: ["ก"], days: {} })).toBeNull();
  });
});
