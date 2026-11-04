import { describe, expect, it } from "vitest";
import { isExportFooterRow } from "./excelImport";

const HEADER = ["เลขที่", "ชื่อ-สกุล", "สถานะ"];

describe("isExportFooterRow", () => {
  it("keeps numbered student rows", () => {
    expect(isExportFooterRow(HEADER, [1, "เด็กชายกิตติ ใจดี", "✓"])).toBe(false);
    expect(isExportFooterRow(HEADER, ["12", "เด็กหญิงอริสา บุญมี", ""])).toBe(false);
  });

  it("drops the summary rows our own exports append", () => {
    expect(isExportFooterRow(HEADER, ["ห้อง", "ป.5/2"])).toBe(true);
    expect(isExportFooterRow(HEADER, ["วันที่", "3/11/2569"])).toBe(true);
    expect(isExportFooterRow(HEADER, ["✓ แปรงแล้ว", 26])).toBe(true);
    expect(isExportFooterRow(HEADER, ["มา", 28])).toBe(true);
    expect(isExportFooterRow(["เลขที่", "ชื่อ-สกุล", "ยอดคงเหลือ"], ["รวมทั้งห้อง", "", 5400])).toBe(true);
  });

  it("keeps rows whose number cell is blank", () => {
    expect(isExportFooterRow(HEADER, ["", "เด็กชายภูริ เจริญสุข", ""])).toBe(false);
  });

  it("never drops rows when the file has no เลขที่ column first", () => {
    expect(isExportFooterRow(["ชื่อ-สกุล", "สถานะ"], ["ห้อง", "ป.5/2"])).toBe(false);
    expect(isExportFooterRow(null, ["ห้อง", "ป.5/2"])).toBe(false);
  });
});
