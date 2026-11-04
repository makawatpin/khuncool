// Print-document HTML builder ported from screens/Savings.dc.html's
// exportPDF() method (window.open + document.write + window.print()).
import {
  EMPTY_REPORT_HEADER,
  REPORT_HEADER_CSS,
  reportHeaderHtml,
  type ReportHeaderSettings,
} from "@/lib/reportHeader";

/** Escapes text for safe interpolation into an HTML string. */
export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildSavingsPrintHtml(
  room: string,
  students: string[],
  balances: number[],
  header: ReportHeaderSettings = EMPTY_REPORT_HEADER,
): string {
  const dateText = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const safeRoom = escapeHtml(room);
  const body = students
    .map(
      (n, i) =>
        `<tr><td class="c">${i + 1}</td><td>${escapeHtml(n)}</td><td class="r">${Math.round(
          balances[i] || 0,
        ).toLocaleString("en-US")}</td></tr>`,
    )
    .join("");
  const total = Math.round(
    balances.reduce((a, b) => a + (b || 0), 0),
  ).toLocaleString("en-US");
  const closeTag = "<" + "/script>";
  const runner =
    "<" +
    "script>window.onload=function(){setTimeout(function(){window.print();},350);};" +
    closeTag;
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>ออมเงิน ${safeRoom}</title>` +
    `<style>@page{margin:18mm}*{font-family:'TH Sarabun New','Sarabun',sans-serif}` +
    REPORT_HEADER_CSS +
    `table{width:100%;border-collapse:collapse;font-size:15px}th,td{border:1px solid #999;padding:7px 10px;text-align:left}` +
    `th{background:#eee}.c{text-align:center;width:70px}.r{text-align:right;width:130px}.sum{margin-top:14px;font-size:16px;font-weight:bold;text-align:right}</style></head>` +
    `<body>` +
    reportHeaderHtml(
      {
        title: "สมุดบัญชีเงินออมนักเรียน",
        meta: [`ห้อง ${room || "-"}`, `ณ วันที่ ${dateText}`, `จำนวน ${students.length} คน`],
      },
      header,
    ) +
    `<table><thead><tr><th class="c">เลขที่</th><th>ชื่อ-สกุล</th><th class="r">ยอดคงเหลือ (บาท)</th></tr></thead><tbody>${body}</tbody></table>` +
    `<div class="sum">รวมเงินออมทั้งห้อง: ${total} บาท</div>` +
    runner +
    `</body></html>`
  );
}

/**
 * Opens a new window and triggers window.print() with the built document.
 * False when the browser blocked the window.
 */
export function printSavings(
  room: string,
  students: string[],
  balances: number[],
  header: ReportHeaderSettings = EMPTY_REPORT_HEADER,
): boolean {
  const html = buildSavingsPrintHtml(room, students, balances, header);
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
