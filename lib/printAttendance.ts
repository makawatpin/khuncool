// Print-document HTML builder ported 1:1 from screens/Attendance.dc.html's
// exportPDF() method (window.open + document.write + window.print()).

export type AttendanceStatusKey = "present" | "late" | "leave" | "absent";

export interface AttendanceStatusDef {
  key: AttendanceStatusKey;
  label: string;
}

export const ATTENDANCE_STATUS_DEFS: AttendanceStatusDef[] = [
  { key: "present", label: "มา" },
  { key: "late", label: "สาย" },
  { key: "leave", label: "ลา" },
  { key: "absent", label: "ขาด" },
];

function statusLabel(key: AttendanceStatusKey | null): string {
  const found = ATTENDANCE_STATUS_DEFS.find((d) => d.key === key);
  return found ? found.label : "-";
}

export function buildAttendancePrintHtml(
  room: string,
  students: string[],
  statuses: (AttendanceStatusKey | null)[],
): string {
  const dateText = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const body = students
    .map(
      (n, i) =>
        `<tr><td class="c">${i + 1}</td><td>${n}</td><td class="c">${statusLabel(
          statuses[i],
        )}</td></tr>`,
    )
    .join("");
  const sum = ATTENDANCE_STATUS_DEFS.map(
    (d) => `${d.label} ${statuses.filter((x) => x === d.key).length}`,
  ).join(" · ");
  const closeTag = "<" + "/script>";
  const runner =
    "<" +
    "script>window.onload=function(){setTimeout(function(){window.print();},350);};" +
    closeTag;
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>เช็กชื่อ ${room}</title>` +
    `<style>@page{margin:18mm}*{font-family:'TH Sarabun New','Sarabun',sans-serif}` +
    `h1{font-size:22px;margin:0 0 4px}.meta{font-size:14px;color:#555;margin-bottom:14px}` +
    `table{width:100%;border-collapse:collapse;font-size:15px}th,td{border:1px solid #999;padding:7px 10px;text-align:left}` +
    `th{background:#eee}.c{text-align:center;width:70px}.sum{margin-top:14px;font-size:15px}</style></head>` +
    `<body><h1>บัญชีเรียกชื่อนักเรียน · ห้อง ${room || "-"}</h1>` +
    `<div class="meta">วันที่ ${dateText}</div>` +
    `<table><thead><tr><th class="c">เลขที่</th><th>ชื่อ-สกุล</th><th class="c">สถานะ</th></tr></thead><tbody>${body}</tbody></table>` +
    `<div class="sum">สรุป: ${sum} · รวม ${students.length} คน</div>` +
    runner +
    `</body></html>`
  );
}

/** Opens a new window and triggers window.print() with the built document. */
export function printAttendance(
  room: string,
  students: string[],
  statuses: (AttendanceStatusKey | null)[],
): void {
  const html = buildAttendancePrintHtml(room, students, statuses);
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
