import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { isExportFooterRow } from "./excelImport";

/*
 * The five tool pages (attendance, savings, homeroom, toothbrushing, milk,
 * plus classrooms and question-sets) are the only places that touch SheetJS,
 * and they do it inside client components, so nothing here was covered: the
 * library could change under the app and every test would still pass.
 *
 * That mattered when xlsx moved from 0.18.5 (the last build on npm, which
 * carries a prototype-pollution advisory with no fix there) to 0.20.3 from
 * SheetJS's own CDN. This pins the exact API sequence and options those
 * pages use, so the next upgrade either keeps working or fails here.
 *
 * `write` rather than `writeFile`: the apps call writeFile because they run
 * in a browser and want a download, but it is the same encoder underneath,
 * and a buffer is what lets the file be read back in the same test.
 */

/** A sheet shaped like what the classroom apps export, footer rows included. */
const ROWS: (string | number)[][] = [
  ["เลขที่", "ชื่อ-สกุล", "สถานะ"],
  [1, "สมชาย ใจดี", "มา"],
  [2, "สมหญิง รักเรียน", "ลา"],
  [3, "ก้อง ป.6/2", "มา"],
  ["ห้อง", "ป.6/2", ""],
  ["รวมทั้งห้อง", 3, ""],
];

function exportThenRead() {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ROWS), "เช็กชื่อ");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const back = XLSX.read(buf, { type: "array" });
  return { buf, wb: back, sheet: back.Sheets[back.SheetNames[0]] };
}

describe("Excel export/import round trip", () => {
  it("writes a workbook with a Thai sheet name", () => {
    const { buf, wb } = exportThenRead();
    expect(buf.byteLength).toBeGreaterThan(0);
    expect(wb.SheetNames).toEqual(["เช็กชื่อ"]);
  });

  it("preserves Thai names through a round trip", () => {
    // `raw: false`, as question-sets and classrooms read it.
    const rows = XLSX.utils.sheet_to_json<string[]>(exportThenRead().sheet, {
      header: 1,
      raw: false,
    });
    expect(rows).toHaveLength(ROWS.length);
    expect(rows[1][1]).toBe("สมชาย ใจดี");
    expect(rows[2][1]).toBe("สมหญิง รักเรียน");
    // Thai mixed with digits and a slash — a real class label.
    expect(rows[3][1]).toBe("ก้อง ป.6/2");
  });

  it("stringifies cells under raw:false and keeps numbers otherwise", () => {
    const { sheet } = exportThenRead();
    const asText = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false });
    // `blankrows: false`, as homeroom, savings and the daily-check apps read it.
    const asAoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });

    expect(asText[1][0]).toBe("1");
    expect(asAoa[1][0]).toBe(1);
    expect(asAoa).toHaveLength(ROWS.length);
  });

  it("still tells exported footer rows from students on re-import", () => {
    // Re-importing a file the app itself exported must not turn its own
    // footer rows into students. This is the rule isExportFooterRow
    // encodes, exercised here against real sheet output rather than a
    // hand-written array.
    const rows = XLSX.utils.sheet_to_json<unknown[]>(exportThenRead().sheet, {
      header: 1,
      blankrows: false,
    });
    const header = rows[0].map(String);

    expect(isExportFooterRow(header, rows[1])).toBe(false);
    expect(isExportFooterRow(header, rows[3])).toBe(false);
    expect(isExportFooterRow(header, rows[4])).toBe(true);
    expect(isExportFooterRow(header, rows[5])).toBe(true);
  });
});
