import { describe, expect, it } from "vitest";
import { DAILY_CHECKS } from "./config";
import { buildCheckMonthPrintHtml } from "./print";

const TB = DAILY_CHECKS.toothbrushing;

describe("buildCheckMonthPrintHtml", () => {
  const html = buildCheckMonthPrintHtml(TB, "ป.5/2", ["ก <ไก่>", "ข"], "2026-11", {
    "2026-11-02": { "ก <ไก่>": "done", ข: "skipped" },
  });

  it("prints landscape with one column per calendar day, weekends greyed", () => {
    expect(html).toContain("size:A4 landscape");
    expect(html.match(/<th class="d/g)).toHaveLength(30);
    expect(html.match(/<th class="d we">/g)).toHaveLength(9);
  });

  it("fills ticks, totals and signature lines", () => {
    expect(html).toContain('<td class="d">✓</td>');
    expect(html).toContain('<td class="d">✗</td>');
    expect(html).toContain('<td class="t">100</td>');
    expect(html).toContain("ครูประจำชั้น");
    expect(html).toContain("ผู้บริหารสถานศึกษา");
  });

  it("greys out a holiday like a weekend", () => {
    const h = buildCheckMonthPrintHtml(TB, "ป.5/2", ["ก"], "2026-11", {}, ["2026-11-04"]);
    expect(h.match(/<th class="d we">/g)).toHaveLength(10);
  });

  it("uses the activity's own wording", () => {
    const milk = buildCheckMonthPrintHtml(DAILY_CHECKS.milk, "ป.1/1", ["ก"], "2026-11", {});
    expect(milk).toContain("แบบบันทึกการดื่มนมโรงเรียน");
    expect(milk).toContain("✓ = ดื่มแล้ว · ✗ = ไม่ดื่ม");
    expect(milk).not.toContain("แปรง");
  });

  it("prints attendance with letter marks and a column per status", () => {
    const att = buildCheckMonthPrintHtml(DAILY_CHECKS.attendance, "ป.5/2", ["ก"], "2026-11", {
      "2026-11-02": { ก: "present" },
      "2026-11-03": { ก: "late" },
      "2026-11-04": { ก: "absent" },
    });
    expect(att).toContain("บัญชีเรียกชื่อนักเรียนประจำเดือน");
    expect(att).toContain('<td class="d">/</td>');
    expect(att).toContain('<td class="d">ส</td>');
    expect(att).toContain('<td class="d">ข</td>');
    expect(att).toContain("/ = มา · ส = สาย · ล = ลา · ข = ขาด");
    expect(att).toContain("<b>มา+สาย (คน)</b>");
    // 2 of 3 checked days were มา or สาย.
    expect(att).toContain('<td class="t">67</td>');
  });

  it("escapes student names", () => {
    expect(html).toContain("ก &lt;ไก่&gt;");
    expect(html).not.toContain("ก <ไก่>");
  });
});
