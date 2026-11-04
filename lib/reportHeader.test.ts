import { describe, expect, it } from "vitest";
import {
  EMPTY_REPORT_HEADER,
  MAX_LOGO_CHARS,
  normalizeReportHeader,
  reportHeaderHtml,
} from "./reportHeader";

const LOGO = "data:image/png;base64,iVBORw0KGgo=";

describe("normalizeReportHeader", () => {
  it("keeps a valid image data URL and trims the text", () => {
    expect(normalizeReportHeader({ school: "  โรงเรียนบ้านสวน ", subtitle: " สพป.ชม.1 ", logo: LOGO })).toEqual({
      school: "โรงเรียนบ้านสวน",
      subtitle: "สพป.ชม.1",
      logo: LOGO,
    });
  });

  it("drops a logo that is not a small base64 image", () => {
    expect(normalizeReportHeader({ logo: "https://example.com/a.png" }).logo).toBe("");
    expect(normalizeReportHeader({ logo: "data:image/svg+xml;base64,PHN2Zz4=" }).logo).toBe("");
    expect(normalizeReportHeader({ logo: 'data:image/png;base64,AA"onerror="x' }).logo).toBe("");
    expect(normalizeReportHeader({ logo: "data:image/png;base64," + "A".repeat(MAX_LOGO_CHARS) }).logo).toBe("");
  });

  it("returns empty settings for anything else", () => {
    expect(normalizeReportHeader(null)).toEqual(EMPTY_REPORT_HEADER);
    expect(normalizeReportHeader("x")).toEqual(EMPTY_REPORT_HEADER);
    expect(normalizeReportHeader({ school: 5 })).toEqual(EMPTY_REPORT_HEADER);
  });
});

describe("reportHeaderHtml", () => {
  it("shows the logo, school, subtitle, title and meta lines", () => {
    const html = reportHeaderHtml(
      { title: "ออมเงิน", meta: ["ห้อง ป.5/2", "4 พ.ย. 2569"] },
      { school: "โรงเรียนบ้านสวน", subtitle: "สพป.ชม.1", logo: LOGO },
    );
    expect(html).toContain(`<img class="rh-logo" src="${LOGO}"`);
    expect(html).toContain("โรงเรียนบ้านสวน");
    expect(html).toContain("สพป.ชม.1");
    expect(html).toContain("ออมเงิน");
    expect(html).toContain("ห้อง ป.5/2<br>4 พ.ย. 2569");
  });

  it("works with text only: no logo, no school, no subtitle", () => {
    const html = reportHeaderHtml({ title: "เช็คชื่อ" }, EMPTY_REPORT_HEADER);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("rh-school");
    expect(html).not.toContain("rh-sub");
    expect(html).not.toContain("rh-meta");
    expect(html).toContain("เช็คชื่อ");
  });

  it("falls back to the report's own school when none is set", () => {
    const html = reportHeaderHtml({ title: "t", school: "โรงเรียนจากฟอร์ม" }, EMPTY_REPORT_HEADER);
    expect(html).toContain("โรงเรียนจากฟอร์ม");
  });

  it("escapes text", () => {
    const html = reportHeaderHtml({ title: "<b>x</b>" }, { ...EMPTY_REPORT_HEADER, school: "A & B" });
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("A &amp; B");
  });
});
