// Print-document HTML builders ported 1:1 from screens/Homeroom.dc.html's
// printHtml()/tableHtml()/signHtml() (weekly form) and printTermPack()
// (term document combining homeroom + attendance + savings) methods.
// Both use window.open + document.write + window.print().

export interface HomeroomTopic {
  id: string;
  label: string;
}

export interface HomeroomSession {
  id: string;
  date: string;
  dayNote: string;
  checked: string[];
  other: string;
  total: string;
  present: string;
  absent: string;
  week?: number;
}

export interface HomeroomFormMeta {
  school: string;
  level: string;
  term: string;
  year: string;
  teacher: string;
  topics: HomeroomTopic[];
  sessions: HomeroomSession[];
  blankRows: number;
  showSign: boolean;
  showPrincipal: boolean;
  principal: string;
  principalRole: string;
}

export interface AttendanceSnapshot {
  room: string;
  students: string[];
  total: number;
  present: number;
  absent: string[];
  late: string[];
  leave: string[];
  savedAt: number;
}

export interface SavingsSnapshot {
  room: string;
  students: string[];
  balances: number[];
  txns: unknown[];
}

/** Escapes text for safe interpolation into an HTML string. */
export function escapeHtml(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const dots = (n: number) => `<span class="dots">${".".repeat(n)}</span>`;

export function th(v: unknown): string {
  return String(v == null ? "" : v);
}

export function thaiDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  const M = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function absentList(s: Pick<HomeroomSession, "absent">): string[] {
  return String(s.absent || "")
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function absentCount(s: Pick<HomeroomSession, "total" | "present" | "absent">): number {
  const t = parseInt(s.total, 10);
  const p = parseInt(s.present, 10);
  if (isFinite(t) && isFinite(p)) return Math.max(0, t - p);
  return absentList(s).length;
}

export function weekOf(iso: string, sessions: HomeroomSession[]): number {
  if (!iso) return 1;
  const dates = sessions.map((x) => x.date).filter(Boolean).sort();
  if (!dates.length) return 1;
  const first = new Date(dates[0] + "T00:00:00");
  const d = new Date(iso + "T00:00:00");
  const monday = new Date(first);
  monday.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Math.max(1, Math.floor((d.getTime() - monday.getTime()) / (7 * 864e5)) + 1);
}

function formTitle(m: Pick<HomeroomFormMeta, "school" | "level" | "term" | "year">) {
  return {
    line1:
      "แบบบันทึกการเข้าร่วมกิจกรรมโฮมรูม (Homeroom)  โรงเรียน" +
      (m.school || "......................"),
    line2:
      "ชั้น" +
      (m.level ? " " + m.level : "..........") +
      "   ภาคเรียนที่ " +
      th(m.term || "") +
      "   ปีการศึกษา " +
      th(m.year || ""),
  };
}

function signHtml(m: Pick<HomeroomFormMeta, "showSign" | "showPrincipal" | "teacher" | "principal" | "principalRole">): string {
  const box = (name: string, role: string) =>
    `<div>ลงชื่อ ...................................................<br><span>( ${
      name ? escapeHtml(name) : ".............................................."
    } )</span><br>${escapeHtml(role)}</div>`;
  const parts: string[] = [];
  if (m.showSign) parts.push(box(m.teacher, "ครูที่ปรึกษา"));
  if (m.showPrincipal) parts.push(box(m.principal, m.principalRole || "ผู้บริหารสถานศึกษา"));
  return parts.length ? `<div class="signs">${parts.join("")}</div>` : "";
}

function buildRows(sessions: HomeroomSession[]): HomeroomSession[] {
  return [...sessions].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function tableHtml(m: HomeroomFormMeta): string {
  const cb = (on: boolean, label: string) =>
    `<span class="ck"><i>${on ? "✓" : ""}</i>${escapeHtml(label)}</span>`;
  const rows = buildRows(m.sessions);
  const body = rows
    .map((r) => {
      const topics = m.topics.map((tp) => cb((r.checked || []).includes(tp.id), tp.label)).join("");
      const other = `<span class="ck"><i>${r.other ? "✓" : ""}</i>อื่นๆ ${
        r.other ? escapeHtml(r.other) : dots(30)
      }</span>`;
      const names = absentList(r);
      const nameLines = names.length
        ? names.map((n) => `<div class="nm">${escapeHtml(n)}</div>`).join("")
        : `<div class="nm">${dots(46)}</div><div class="nm">${dots(46)}</div>`;
      return (
        `<tr>` +
        `<td class="c wk">${th(r.week || "")}${r.dayNote ? `<div class="sm">${escapeHtml(r.dayNote)}</div>` : ""}</td>` +
        `<td class="c">${thaiDate(r.date)}</td>` +
        `<td class="tp">${topics}${other}</td>` +
        `<td class="rm">นักเรียนทั้งหมด ${r.total ? th(r.total) : dots(10)} คน<br>` +
        `มา ${r.present ? th(r.present) : dots(8)} คน&nbsp;&nbsp;ขาด ${th(absentCount(r))} คน<br>` +
        `รายชื่อนักเรียนที่ขาด${nameLines}</td></tr>`
      );
    })
    .join("");
  const blank = Array.from({ length: Math.max(0, m.blankRows || 0) })
    .map(() => {
      const topics =
        m.topics.map((tp) => cb(false, tp.label)).join("") +
        `<span class="ck"><i></i>อื่นๆ ${dots(30)}</span>`;
      return (
        `<tr><td class="c wk"></td><td class="c"></td><td class="tp">${topics}</td>` +
        `<td class="rm">นักเรียนทั้งหมด ${dots(10)} คน<br>มา ${dots(8)} คน&nbsp;&nbsp;ขาด ${dots(8)} คน<br>` +
        `รายชื่อนักเรียนที่ขาด<div class="nm">${dots(46)}</div><div class="nm">${dots(46)}</div></td></tr>`
      );
    })
    .join("");
  return (
    `<table><thead><tr><th>สัปดาห์ที่</th><th>วัน/เดือน/ปี</th><th>เรื่อง/รายการที่อบรม</th><th>หมายเหตุ</th></tr></thead>` +
    `<tbody>${body}${blank}</tbody></table>`
  );
}

/** Builds the weekly homeroom-log print form (doPrint). */
export function buildHomeroomFormHtml(m: HomeroomFormMeta): string {
  const t = formTitle(m);
  const closeTag = "<" + "/script>";
  const runner =
    "<" +
    "script>window.onload=function(){setTimeout(function(){window.print();},400);};" +
    closeTag;
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>บันทึกโฮมรูม</title>` +
    `<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">` +
    `<style>@page{size:A4 portrait;margin:14mm}` +
    `*{font-family:'Sarabun','TH Sarabun New',sans-serif;box-sizing:border-box}` +
    `body{margin:0;color:#000;font-size:13px}` +
    `.hd{border:2.5px solid #E0A80A;padding:10px 14px;margin-bottom:12px;text-align:center;box-shadow:inset 0 0 0 2px #fff}` +
    `.hd b{display:block;font-size:16px;font-weight:700;line-height:1.6}` +
    `.hd span{display:block;font-size:15px;line-height:1.6}` +
    `table{width:100%;border-collapse:collapse}` +
    `th{background:#FBEAC8;border:1px solid #000;padding:6px;font-size:13.5px;font-weight:700}` +
    `td{border:1px solid #000;padding:8px 9px;vertical-align:middle;font-size:12.5px}` +
    `td.c{text-align:center}td.wk{width:82px;font-size:14px}td.c+td.c,td.c:nth-child(2){width:118px;font-size:13.5px}` +
    `td.tp{width:auto}td.rm{width:230px;vertical-align:top;line-height:1.9}` +
    `.sm{font-size:11.5px;margin-top:3px}` +
    `.ck{display:block;line-height:2.05;white-space:nowrap}` +
    `.ck i{display:inline-block;width:12px;height:12px;border:1.3px solid #000;margin-right:7px;font-style:normal;font-size:10px;line-height:11px;text-align:center;vertical-align:-1px}` +
    `.nm{border-bottom:1px dotted #555;min-height:16px;margin-top:4px;font-size:12px}` +
    `.dots{letter-spacing:1px;color:#666}` +
    `.signs{margin-top:28px;display:flex;justify-content:space-around;gap:30px;text-align:center;line-height:2;font-size:13px}` +
    `tr{page-break-inside:avoid}` +
    `</style></head><body>` +
    `<div class="hd"><b>${escapeHtml(t.line1)}</b><span>${escapeHtml(t.line2)}</span></div>` +
    tableHtml(m) +
    signHtml(m) +
    runner +
    `</body></html>`
  );
}

/** Opens a new window and triggers window.print() with the weekly form. */
export function printHomeroomForm(m: HomeroomFormMeta): void {
  const html = buildHomeroomFormHtml(m);
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/**
 * Builds the term-level document: cover page + homeroom log + attendance
 * summary (from the attendance app's localStorage snapshot) + savings
 * summary (from the savings app's localStorage snapshot).
 */
export function buildTermPackHtml(
  m: HomeroomFormMeta,
  att: AttendanceSnapshot | null,
  sav: SavingsSnapshot | null,
): string {
  const closeTag = "<" + "/script>";
  const runner =
    "<" +
    "script>window.onload=function(){setTimeout(function(){window.print();},500);};" +
    closeTag;

  const cover =
    `<section class="pg cov">` +
    `<div class="ct">รายงานสรุปงานที่ปรึกษาประจำชั้น</div>` +
    `<div class="cs">${escapeHtml(m.school || "โรงเรียน......................")}</div>` +
    `<div class="cm">ชั้น ${escapeHtml(m.level || "..........")} &nbsp;·&nbsp; ภาคเรียนที่ ${escapeHtml(
      m.term,
    )} &nbsp;·&nbsp; ปีการศึกษา ${escapeHtml(m.year)}</div>` +
    `<ol class="toc"><li>แบบบันทึกการเข้าร่วมกิจกรรมโฮมรูม</li><li>สรุปการมาเรียน (ข้อมูลล่าสุดจากแอปเช็กชื่อ)</li><li>สรุปเงินออมนักเรียน</li></ol>` +
    (m.teacher ? `<div class="cby">ครูที่ปรึกษา: ${escapeHtml(m.teacher)}</div>` : "") +
    `</section>`;

  const homeroom =
    `<section class="pg"><h2>๑. แบบบันทึกการเข้าร่วมกิจกรรมโฮมรูม</h2>${tableHtml(m)}${signHtml(m)}</section>`;

  const totalAbsentAll = m.sessions.reduce((n, x) => n + absentCount(x), 0);
  const attSec =
    `<section class="pg"><h2>๒. สรุปการมาเรียน</h2>` +
    (att
      ? `<p class="note">ข้อมูลจากแอปเช็กชื่อ ห้อง ${escapeHtml(
          att.room || m.level || "-",
        )} · นักเรียน ${att.total} คน</p>` +
        `<table class="sum"><thead><tr><th>รายการ</th><th>จำนวน (คน)</th><th>รายชื่อ</th></tr></thead><tbody>` +
        `<tr><td>มาเรียน</td><td class="c">${att.present}</td><td>—</td></tr>` +
        `<tr><td>มาสาย</td><td class="c">${att.late.length}</td><td>${
          escapeHtml(att.late.join(", ")) || "—"
        }</td></tr>` +
        `<tr><td>ลา</td><td class="c">${att.leave.length}</td><td>${
          escapeHtml(att.leave.join(", ")) || "—"
        }</td></tr>` +
        `<tr><td>ขาดเรียน</td><td class="c">${att.absent.length}</td><td>${
          escapeHtml(att.absent.join(", ")) || "—"
        }</td></tr>` +
        `</tbody></table>` +
        `<p class="note">ยอดขาดรวมจากบันทึกโฮมรูมทั้งภาคเรียน: ${totalAbsentAll} คน-ครั้ง</p>`
      : `<p class="note">ยังไม่มีข้อมูลจากแอปเช็กชื่อ</p>`) +
    `</section>`;

  let savSec = `<section class="pg"><h2>๓. สรุปเงินออมนักเรียน</h2>`;
  if (sav && Array.isArray(sav.students) && sav.students.length) {
    const bal = Array.isArray(sav.balances) ? sav.balances : [];
    const total = bal.reduce((n, v) => n + (Number(v) || 0), 0);
    const rows = sav.students
      .map(
        (n, i) =>
          `<tr><td class="c">${i + 1}</td><td>${escapeHtml(n)}</td><td class="r">${(
            Number(bal[i]) || 0
          ).toLocaleString("th-TH")}</td></tr>`,
      )
      .join("");
    savSec +=
      `<p class="note">ห้อง ${escapeHtml(sav.room || m.level || "-")} · ยอดออมรวม ${total.toLocaleString(
        "th-TH",
      )} บาท · รายการทั้งหมด ${(sav.txns || []).length} รายการ</p>` +
      `<table class="sum"><thead><tr><th style="width:60px">ที่</th><th>ชื่อ-สกุล</th><th style="width:130px">ยอดออม (บาท)</th></tr></thead><tbody>${rows}` +
      `<tr class="tot"><td></td><td>รวม</td><td class="r">${total.toLocaleString("th-TH")}</td></tr></tbody></table>`;
  } else {
    savSec += `<p class="note">ยังไม่มีข้อมูลจากแอปออมเงิน</p>`;
  }
  savSec += signHtml(m) + `</section>`;

  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>เอกสารสิ้นเทอม ${escapeHtml(m.level || "")}</title>` +
    `<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">` +
    `<style>@page{size:A4 portrait;margin:14mm}` +
    `*{font-family:'Sarabun','TH Sarabun New',sans-serif;box-sizing:border-box}` +
    `body{margin:0;color:#000;font-size:13px}` +
    `.pg{page-break-after:always}.pg:last-child{page-break-after:auto}` +
    `h2{font-size:17px;margin:0 0 12px}` +
    `.cov{display:flex;flex-direction:column;justify-content:center;min-height:250mm;text-align:center}` +
    `.ct{font-size:26px;font-weight:700;margin-bottom:10px}.cs{font-size:20px;margin-bottom:6px}.cm{font-size:16px;color:#333}` +
    `.toc{text-align:left;max-width:340px;margin:34px auto 0;font-size:15px;line-height:2.1}` +
    `.cby{margin-top:40px;font-size:15px}` +
    `.note{font-size:13px;color:#333;margin:0 0 12px}` +
    `table{width:100%;border-collapse:collapse}` +
    `th{background:#FBEAC8;border:1px solid #000;padding:6px;font-size:13.5px;font-weight:700}` +
    `td{border:1px solid #000;padding:7px 9px;vertical-align:middle;font-size:12.5px}` +
    `td.c{text-align:center}td.r{text-align:right}td.wk{width:82px}` +
    `.tot td{font-weight:700;background:#F4F4F4}` +
    `.ck{display:block;line-height:2.05;white-space:nowrap}` +
    `.ck i{display:inline-block;width:12px;height:12px;border:1.3px solid #000;margin-right:7px;font-style:normal;font-size:10px;line-height:11px;text-align:center;vertical-align:-1px}` +
    `.nm{border-bottom:1px dotted #555;min-height:16px;margin-top:4px;font-size:12px}` +
    `.dots{letter-spacing:1px;color:#666}` +
    `.signs{margin-top:30px;display:flex;justify-content:space-around;gap:30px;text-align:center;font-size:13px;line-height:2}` +
    `tr{page-break-inside:avoid}` +
    `</style></head><body>${cover}${homeroom}${attSec}${savSec}${runner}</body></html>`
  );
}

/** Reads a khuncool app's persisted localStorage state, tolerating parse errors. */
export function readAppLS<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

interface RawAttendanceState {
  room?: string;
  students?: string[];
  statuses?: (string | null)[];
  savedAt?: number;
}

/** Builds an AttendanceSnapshot from the attendance app's raw localStorage shape. */
export function attendanceSnapshotFrom(d: RawAttendanceState | null): AttendanceSnapshot | null {
  if (!d || !Array.isArray(d.students) || !d.students.length) return null;
  const st = Array.isArray(d.statuses) ? d.statuses : [];
  const absent: string[] = [];
  const late: string[] = [];
  const leave: string[] = [];
  d.students.forEach((n, i) => {
    const k = st[i];
    if (k === "absent") absent.push(n);
    else if (k === "late") late.push(n);
    else if (k === "leave") leave.push(n);
  });
  const present = d.students.length - absent.length - leave.length;
  return {
    room: d.room || "",
    students: d.students,
    total: d.students.length,
    present,
    absent,
    late,
    leave,
    savedAt: d.savedAt || 0,
  };
}

/** Opens a new window and triggers window.print() with the term document. */
export function printHomeroomTermPack(
  m: HomeroomFormMeta,
  att: AttendanceSnapshot | null,
  sav: SavingsSnapshot | null,
): boolean {
  const html = buildTermPackHtml(m, att, sav);
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
