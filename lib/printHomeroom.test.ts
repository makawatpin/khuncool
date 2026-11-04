import { describe, expect, it } from "vitest";
import { attendanceSnapshotFrom, buildTermPackHtml, withAttendanceFilled } from "./printHomeroom";

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

describe("buildTermPackHtml attendance section", () => {
  const meta = {
    school: "โรงเรียนทดสอบ",
    level: "ป.5/2",
    term: "2",
    year: "2569",
    teacher: "",
    topics: [],
    sessions: [],
    blankRows: 0,
    showSign: false,
    showPrincipal: false,
    principal: "",
    principalRole: "",
  };

  it("lists each student's totals for the term", () => {
    const html = buildTermPackHtml(
      meta,
      {
        room: "ป.5/2",
        from: "2026-11-01",
        to: "2027-04-30",
        checkedDays: 2,
        rows: [{ name: "ก <ไก่>", present: 1, late: 1, leave: 0, absent: 0, percent: 100 }],
      },
      null,
    );
    expect(html).toContain("สรุปการมาเรียนทั้งภาคเรียน");
    expect(html).toContain("เช็กชื่อ 2 วัน");
    expect(html).toContain("ก &lt;ไก่&gt;");
    expect(html).toContain('<td class="c">100</td>');
  });

  it("says when the term has no attendance yet", () => {
    expect(buildTermPackHtml(meta, null, null)).toContain("ยังไม่มีข้อมูลเช็กชื่อในภาคเรียนนี้");
  });
});

describe("withAttendanceFilled", () => {
  const att = {
    students: ["ก", "ข", "ค"],
    days: { "2026-11-03": { ก: "present", ข: "absent", ค: "leave" } },
  };
  const day = (date: string, present = "", absent = "") => ({ id: "h1", date, total: "3", present, absent });

  it("fills a blank day from that day's attendance check", () => {
    expect(withAttendanceFilled(day("2026-11-03"), att)).toEqual({
      id: "h1",
      date: "2026-11-03",
      total: "3",
      present: "1",
      absent: "ข\nค (ลา)",
    });
  });

  it("never uses another day's check", () => {
    expect(withAttendanceFilled(day("2026-11-04"), att)).toEqual(day("2026-11-04"));
  });

  it("keeps what the teacher already typed", () => {
    expect(withAttendanceFilled(day("2026-11-03", "3"), att)).toEqual(day("2026-11-03", "3"));
  });
});
