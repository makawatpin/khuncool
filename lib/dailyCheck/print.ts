import { statusOption, type DailyCheckConfig } from "@/lib/dailyCheck/config";
import {
  EMPTY_REPORT_HEADER,
  REPORT_HEADER_CSS,
  reportHeaderHtml,
  type ReportHeaderSettings,
} from "@/lib/reportHeader";
import { isWeekend, monthDays, monthSummary, type CheckStatus } from "@/lib/dailyCheck/days";

/** Escapes text for safe interpolation into an HTML string. */
export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function positiveKeys(config: DailyCheckConfig): ReadonlySet<string> {
  return new Set(config.statuses.filter((s) => s.positive).map((s) => s.key));
}

/** What the status column of a day's Excel file and day print shows. */
export function statusCell(config: DailyCheckConfig, key: CheckStatus | null): string {
  return statusOption(config, key)?.cell ?? "";
}

/** "✓ = แปรงแล้ว · ✗ = ไม่แปรง"; empty when every symbol is already the word. */
function legend(config: DailyCheckConfig, field: "cell" | "mark"): string {
  return config.statuses
    .filter((s) => s[field] !== s.label)
    .map((s) => `${escapeHtml(s[field])} = ${escapeHtml(s.label)}`)
    .join(" · ");
}

const PRINT_RUNNER =
  "<" +
  "script>window.onload=function(){setTimeout(function(){window.print();},350);};" +
  "<" +
  "/script>";

/**
 * Opens a new window and triggers window.print() with the built document.
 * False when the browser blocked the window, so the caller can say so.
 */
function openPrint(html: string): boolean {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

export function buildCheckDayPrintHtml(
  config: DailyCheckConfig,
  room: string,
  students: string[],
  statuses: (CheckStatus | null)[],
  date: Date = new Date(),
  header: ReportHeaderSettings = EMPTY_REPORT_HEADER,
): string {
  const dateText = date.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const safeRoom = escapeHtml(room);
  const body = students
    .map(
      (n, i) =>
        `<tr><td class="c">${i + 1}</td><td>${escapeHtml(n)}</td><td class="c">${escapeHtml(
          statusCell(config, statuses[i]),
        )}</td></tr>`,
    )
    .join("");
  const key = legend(config, "cell");
  const sum = config.statuses
    .map((s) => `${escapeHtml(s.label)} ${statuses.filter((x) => x === s.key).length}`)
    .join(" · ");
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(config.title)} ${safeRoom}</title>` +
    `<style>@page{margin:18mm}*{font-family:'TH Sarabun New','Sarabun',sans-serif}` +
    REPORT_HEADER_CSS +
    `table{width:100%;border-collapse:collapse;font-size:15px}th,td{border:1px solid #999;padding:7px 10px;text-align:left}` +
    `th{background:#eee}.c{text-align:center;width:80px}.sum{margin-top:14px;font-size:15px}</style></head>` +
    `<body>` +
    reportHeaderHtml({ title: config.title, meta: [`ห้อง ${room || "-"}`, `วันที่ ${dateText}`] }, header) +
    `<table><thead><tr><th class="c">เลขที่</th><th>ชื่อ-สกุล</th><th class="c">สถานะ</th></tr></thead><tbody>${body}</tbody></table>` +
    `<div class="sum">${key ? `${key}<br>` : ""}สรุป: ${sum} · รวม ${students.length} คน</div>` +
    PRINT_RUNNER +
    `</body></html>`
  );
}

export function printCheckDay(
  config: DailyCheckConfig,
  room: string,
  students: string[],
  statuses: (CheckStatus | null)[],
  date: Date = new Date(),
  header: ReportHeaderSettings = EMPTY_REPORT_HEADER,
): boolean {
  return openPrint(buildCheckDayPrintHtml(config, room, students, statuses, date, header));
}

/**
 * A4-landscape monthly sheet in the shape of the paper form teachers hand in:
 * one row per student, one column per calendar day (weekends and holidays
 * greyed out and left out of the totals), totals and signature lines.
 */
export function buildCheckMonthPrintHtml(
  config: DailyCheckConfig,
  room: string,
  students: string[],
  month: string,
  days: Readonly<Record<string, Readonly<Record<string, CheckStatus>>>>,
  holidays: readonly string[] = [],
  header: ReportHeaderSettings = EMPTY_REPORT_HEADER,
): string {
  const allDays = monthDays(month);
  const off = (d: string) => isWeekend(d) || holidays.includes(d);
  const dayClass = (d: string) => (off(d) ? "d we" : "d");
  const positive = positiveKeys(config);
  const { perStudent } = monthSummary(days, month, students, holidays, positive);
  const [y, m] = month.split("-").map(Number);
  const monthText = new Date(y, m - 1, 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
  const safeRoom = escapeHtml(room);
  const mark = (key: CheckStatus | null) => escapeHtml(statusOption(config, key)?.mark ?? "");
  const head =
    `<th class="n">ที่</th><th class="name">ชื่อ-สกุล</th>` +
    allDays.map((d) => `<th class="${dayClass(d)}">${Number(d.slice(8))}</th>`).join("") +
    config.statuses.map((s) => `<th class="t">${escapeHtml(s.mark)}</th>`).join("") +
    `<th class="t">%</th>`;
  const body = students
    .map((name, i) => {
      const cells = allDays
        .map((d) =>
          off(d) ? `<td class="d we"></td>` : `<td class="d">${mark(days[d]?.[name] ?? null)}</td>`,
        )
        .join("");
      const t = perStudent[i];
      return (
        `<tr><td class="n">${i + 1}</td><td class="name">${escapeHtml(name)}</td>${cells}` +
        config.statuses.map((s) => `<td class="t">${t.counts[s.key] ?? 0}</td>`).join("") +
        `<td class="t">${t.percent === null ? "" : t.percent}</td></tr>`
      );
    })
    .join("");
  const positiveLabel = config.statuses
    .filter((s) => s.positive)
    .map((s) => s.label)
    .join("+");
  const foot =
    `<tr><td colspan="2" class="name"><b>${escapeHtml(positiveLabel)} (คน)</b></td>` +
    allDays
      .map((d) => {
        const day = off(d) ? undefined : days[d];
        return `<td class="${dayClass(d)}">${day ? students.filter((n) => positive.has(day[n])).length : ""}</td>`;
      })
      .join("") +
    `<td colspan="${config.statuses.length + 1}"></td></tr>`;
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(config.title)} ${safeRoom} ${monthText}</title>` +
    `<style>@page{size:A4 landscape;margin:10mm}*{font-family:'TH Sarabun New','Sarabun',sans-serif}` +
    REPORT_HEADER_CSS +
    // The landscape sheet is dense, so the letterhead sits a little tighter.
    `.rh{margin-bottom:8px}.rh-top{padding-bottom:6px}.rh-logo{width:48px;height:48px}.rh-title{font-size:20px}` +
    `table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #999;padding:3px 2px;text-align:center}` +
    `th{background:#eee}.n{width:24px}.name{text-align:left;padding-left:5px;white-space:nowrap}.d{width:16px}.we{background:#bbb;-webkit-print-color-adjust:exact;print-color-adjust:exact}.t{width:30px}` +
    `.sum{margin-top:8px;font-size:13px}.sign{display:flex;justify-content:space-around;margin-top:28px;font-size:14px}` +
    `.sign div{text-align:center}</style></head>` +
    `<body>` +
    reportHeaderHtml(
      {
        title: config.monthFormTitle,
        meta: [`ห้อง ${room || "-"}`, `ประจำเดือน ${monthText}`, `นักเรียน ${students.length} คน`],
      },
      header,
    ) +
    `<table><thead><tr>${head}</tr></thead><tbody>${body}${foot}</tbody></table>` +
    `<div class="sum">${legend(config, "mark")} · ช่องว่าง = ไม่ได้บันทึก · ช่องสีเทา = เสาร์-อาทิตย์และวันหยุด</div>` +
    `<div class="sign"><div>ลงชื่อ ...................................... ครูประจำชั้น<br>(......................................)</div>` +
    `<div>ลงชื่อ ...................................... ผู้บริหารสถานศึกษา<br>(......................................)</div></div>` +
    PRINT_RUNNER +
    `</body></html>`
  );
}

export function printCheckMonth(
  config: DailyCheckConfig,
  room: string,
  students: string[],
  month: string,
  days: Readonly<Record<string, Readonly<Record<string, CheckStatus>>>>,
  holidays: readonly string[] = [],
  header: ReportHeaderSettings = EMPTY_REPORT_HEADER,
): boolean {
  return openPrint(buildCheckMonthPrintHtml(config, room, students, month, days, holidays, header));
}
