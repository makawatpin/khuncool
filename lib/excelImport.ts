/**
 * True for the footer rows (ห้อง, วันที่, status totals, รวมทั้งห้อง) that the
 * classroom apps append under their exported student table. Those rows put a
 * label where the เลขที่ number goes, so when the sheet's first column is
 * เลขที่, a non-numeric value there marks a footer row, not a student.
 * Re-importing an exported file must not turn them into students.
 */
export function isExportFooterRow(
  header: string[] | null,
  row: unknown[],
): boolean {
  if (!header || !String(header[0] ?? "").includes("เลขที่")) return false;
  const first = String(row[0] ?? "").trim();
  return first !== "" && !/^\d+$/.test(first);
}
