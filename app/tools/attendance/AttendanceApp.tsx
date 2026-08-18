"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import * as XLSX from "xlsx";
import { useCloudSync } from "@/lib/useCloudSync";
import SyncStatus from "@/components/SyncStatus";
import SaveScopeNote from "@/components/SaveScopeNote";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import {
  ATTENDANCE_STATUS_DEFS,
  printAttendance,
  type AttendanceStatusKey,
} from "@/lib/printAttendance";

const LS_KEY = "khuncool_attendance_v1";
const ROSTER_KEY = "khuncool.roster";

const STATUS_COLORS: Record<AttendanceStatusKey, string> = {
  present: "#0A9380",
  late: "#B4820A",
  leave: "#3D38B4",
  absent: "#DC2626",
};

const LABEL_TO_KEY: Record<string, AttendanceStatusKey> = {
  มา: "present",
  สาย: "late",
  ลา: "leave",
  ขาด: "absent",
};

const DEFAULT_STUDENTS = [
  "เด็กชายกิตติ ใจดี",
  "เด็กหญิงชนากานต์ สุขใจ",
  "เด็กชายณัฐพงษ์ ทองมา",
  "เด็กหญิงปาริชาต แก้วใส",
  "เด็กชายภูริ เจริญสุข",
  "เด็กหญิงมนัสนันท์ ศรีทอง",
  "เด็กชายวรเมธ พูนผล",
  "เด็กหญิงอริสา บุญมี",
];

const HELP_STEPS = [
  "นักเรียนทุกคนเริ่มต้นแบบยังไม่มีสถานะ",
  "แตะปุ่ม มา / สาย / ลา / ขาด ให้แต่ละคน · แตะซ้ำเพื่อยกเลิก",
  "ปุ่ม “ทั้งหมดมา” ตั้งทุกคนเป็นมา · “ล้างสถานะ” ล้างทั้งหมด",
  "กด “🗑 ลบรายชื่อ” เพื่อเปิดโหมดลบ แล้วแตะ ✕ ท้ายชื่อที่ต้องการลบออก",
  "“นำเข้า Excel” เพื่อดึงรายชื่อทั้งห้องจากไฟล์ หรือวางรายชื่อก็ได้ — รายชื่อนี้ใช้ร่วมกับแอปออมเงินและบันทึกโฮมรูมด้วย",
  "“ส่งออก” เป็น Excel (ทำสถิติต่อ) หรือ PDF (พิมพ์บัญชีเรียกชื่อ)",
  "ยอดสรุป มา/สาย/ลา/ขาด อัปเดตให้อัตโนมัติด้านบน",
];

const DEVICE_NOTE =
  "ผู้ใช้ที่ไม่ได้ล็อกอิน ข้อมูลจะถูกบันทึกในเครื่อง/เบราว์เซอร์นี้เท่านั้น ถ้าเช็กในมือถือก็ต้องดูต่อในมือถือ หากต้องการใช้งานต่อบนเครื่องอื่นโดยไม่สมัครสมาชิก ให้กด “ส่งออก Excel” จากเครื่องเดิม แล้ว “นำเข้า Excel” ที่อีกเครื่อง — หรือสมัครสมาชิกฟรีเพื่อให้ข้อมูลซิงก์ขึ้นบัญชีอัตโนมัติและใช้ได้ทุกเครื่องที่ล็อกอิน";

function defaultStatus(): AttendanceStatusKey | null {
  return null;
}

function statusLabel(key: AttendanceStatusKey | null) {
  const found = ATTENDANCE_STATUS_DEFS.find((d) => d.key === key);
  return found ? found.label : "-";
}

function fileStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

type Persisted = {
  students: string[];
  statuses: (AttendanceStatusKey | null)[];
  room: string;
};

export default function AttendanceApp() {
  useTrackToolUse("attendance");
  const [students, setStudents] = useState<string[]>(DEFAULT_STUDENTS);
  const [statuses, setStatuses] = useState<(AttendanceStatusKey | null)[]>(
    () => DEFAULT_STUDENTS.map(() => defaultStatus()),
  );
  const [room, setRoom] = useState("ป.5/2");
  const [newName, setNewName] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [toast, setToast] = useState("");
  const [offline, setOffline] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const state = { students, statuses, room };
  const { pulled, status: cloudStatus } = useCloudSync("attendance", state);

  // Load persisted state on mount, and re-run if a cloud pull (after
  // sign-in) writes newer data into LS_KEY.
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (raw) {
          const d: Persisted = JSON.parse(raw);
          if (Array.isArray(d.students) && d.students.length) {
            setStudents(d.students);
            setStatuses(
              Array.isArray(d.statuses)
                ? d.statuses
                : d.students.map(() => defaultStatus()),
            );
            if (d.room) setRoom(d.room);
            setHydrated(true);
            return;
          }
        }
        const r: unknown = JSON.parse(
          window.localStorage.getItem(ROSTER_KEY) || "null",
        );
        if (Array.isArray(r) && r.length) {
          setStudents(r as string[]);
          setStatuses((r as string[]).map(() => defaultStatus()));
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, [pulled]);

  // Online/offline banner + cleanup.
  useEffect(() => {
    const syncOnline = () =>
      setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    syncOnline();
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const flashToast = useCallback((msg = "บันทึกแล้ว ✓") => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 1600);
  }, []);

  // Persist + toast on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        LS_KEY,
        JSON.stringify({ students, statuses, room, savedAt: Date.now() }),
      );
      window.localStorage.setItem(ROSTER_KEY, JSON.stringify(students));
    } catch {
      /* ignore */
    }
  }, [students, statuses, room, hydrated]);

  const setStatus = useCallback(
    (i: number, key: AttendanceStatusKey) => {
      setStatuses((current) => {
        const next = [...current];
        next[i] = next[i] === key ? null : key;
        return next;
      });
      flashToast();
    },
    [flashToast],
  );

  const allPresent = useCallback(() => {
    setStatuses(students.map(() => "present"));
    flashToast();
  }, [students, flashToast]);

  const clearAll = useCallback(() => {
    setStatuses(students.map(() => null));
    flashToast();
  }, [students, flashToast]);

  const addName = useCallback(() => {
    const v = newName.trim();
    if (!v) return;
    setStudents((current) => [...current, v]);
    setStatuses((current) => [...current, defaultStatus()]);
    setNewName("");
    flashToast();
  }, [newName, flashToast]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") addName();
    },
    [addName],
  );

  const removeStudent = useCallback(
    (i: number) => {
      setStudents((current) => current.filter((_, idx) => idx !== i));
      setStatuses((current) => current.filter((_, idx) => idx !== i));
      flashToast("ลบแล้ว ✓");
    },
    [flashToast],
  );

  const toggleBulk = useCallback(() => {
    setBulkMode((v) => {
      if (!v) setBulkText(students.join("\n"));
      return !v;
    });
  }, [students]);

  const applyBulk = useCallback(() => {
    const list = bulkText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    setStudents(list);
    setStatuses(list.map(() => defaultStatus()));
    setBulkMode(false);
    flashToast();
  }, [bulkText, flashToast]);

  const importPaste = useCallback(() => {
    const list = importText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!list.length) {
      setImportMsg("ยังไม่มีรายชื่อให้นำเข้า");
      return;
    }
    setStudents(list);
    setStatuses(list.map(() => defaultStatus()));
    setShowImport(false);
    setImportText("");
    flashToast();
  }, [importText, flashToast]);

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = ev.target?.result;
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const aoa: unknown[][] = XLSX.utils.sheet_to_json(ws, {
            header: 1,
            blankrows: false,
          });
          if (!aoa.length) {
            setImportMsg("ไฟล์ว่างเปล่า");
            return;
          }
          let header: string[] | null = null;
          let start = 0;
          const first = (aoa[0] as unknown[]).map((c) =>
            String(c == null ? "" : c).trim(),
          );
          if (
            first.some(
              (c) => c.includes("ชื่อ") || c.toLowerCase().includes("name"),
            )
          ) {
            header = first;
            start = 1;
          }
          let nameCol = 1;
          let statusCol = -1;
          if (header) {
            const ni = header.findIndex(
              (c) => c.includes("ชื่อ") || c.toLowerCase().includes("name"),
            );
            if (ni >= 0) nameCol = ni;
            const si = header.findIndex(
              (c) =>
                c.includes("สถานะ") || c.toLowerCase().includes("status"),
            );
            if (si >= 0) statusCol = si;
          } else {
            nameCol = (aoa[0] as unknown[]).length >= 2 ? 1 : 0;
          }
          const newStudents: string[] = [];
          const newStatuses: (AttendanceStatusKey | null)[] = [];
          for (let i = start; i < aoa.length; i++) {
            const row = (aoa[i] || []) as unknown[];
            let name = String(row[nameCol] == null ? "" : row[nameCol]).trim();
            if (!name && nameCol !== 0)
              name = String(row[0] == null ? "" : row[0]).trim();
            if (!name) continue;
            newStudents.push(name);
            let key = defaultStatus();
            if (statusCol >= 0) {
              const lab = String(
                row[statusCol] == null ? "" : row[statusCol],
              ).trim();
              key =
                LABEL_TO_KEY[lab] !== undefined
                  ? LABEL_TO_KEY[lab]
                  : lab === ""
                    ? defaultStatus()
                    : "present";
            }
            newStatuses.push(key);
          }
          if (!newStudents.length) {
            setImportMsg("ไม่พบรายชื่อในไฟล์ (ตรวจคอลัมน์ชื่อ)");
            return;
          }
          setStudents(newStudents);
          setStatuses(newStatuses);
          setShowImport(false);
          setImportMsg("");
          flashToast();
        } catch {
          setImportMsg("อ่านไฟล์ไม่สำเร็จ — ต้องเป็น .xlsx/.xls");
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [flashToast],
  );

  const exportExcel = useCallback(() => {
    const rows: (string | number)[][] = [["เลขที่", "ชื่อ-สกุล", "สถานะ"]];
    students.forEach((n, i) => rows.push([i + 1, n, statusLabel(statuses[i])]));
    rows.push([]);
    rows.push(["ห้อง", room]);
    rows.push(["วันที่", new Date().toLocaleDateString("th-TH")]);
    ATTENDANCE_STATUS_DEFS.forEach((d) =>
      rows.push([d.label, statuses.filter((x) => x === d.key).length]),
    );
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "เช็กชื่อ");
    XLSX.writeFile(wb, `เช็กชื่อ_${room || "ห้อง"}_${fileStamp()}.xlsx`);
    setShowExport(false);
  }, [students, statuses, room]);

  const exportPDF = useCallback(() => {
    printAttendance(room, students, statuses);
    setShowExport(false);
  }, [room, students, statuses]);

  const { fullscreenClassName, toggle: toggleFull } = useToolFullscreen(frameRef);

  const total = students.length;
  const checked = statuses.filter((x) => x !== null).length;
  const dateTextShort = new Date().toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const exportSubtitle = `ห้อง ${room || "-"} · ${total} คน · เช็กแล้ว ${checked} คน`;
  const showEmpty = total === 0;

  const btnStyle = (active: boolean, color: string) =>
    active
      ? {
          borderColor: color,
          background: color,
          color: "#fff",
        }
      : {
          borderColor: "#E5E8EE",
          background: "#fff",
          color: "#8892A0",
        };

  return (
    <div ref={frameRef} className={`tool-stage bg-white ${fullscreenClassName}`}>
      <SyncStatus status={cloudStatus} />
      {offline && (
        <div className="fixed left-1/2 top-3.5 z-[99] -translate-x-1/2 rounded-pill border border-[#FDE68A] bg-[#FFFBEB] px-[18px] py-[9px] text-[13px] font-semibold text-[#92600A] shadow-[0_12px_30px_-12px_rgba(26,29,38,.35)]">
          📶 ออฟไลน์อยู่ · บันทึกไว้ในเครื่องก่อน จะซิงก์ให้เมื่อกลับมาออนไลน์
        </div>
      )}

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[99] -translate-x-1/2 rounded-pill bg-[#1A1D26] px-[22px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(26,29,38,.6)]">
          {toast}
        </div>
      )}

      {/* HELP modal */}
      {showHelp && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(26,29,38,.55)] p-[22px] backdrop-blur-[3px]">
          <div className="max-h-[640px] w-full max-w-[520px] overflow-y-auto rounded-[22px] bg-white p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,.45)] md:rounded-3xl md:p-[34px_32px]">
            <div className="mb-4 flex items-center gap-2.5 md:mb-[22px] md:gap-3">
              <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-[#E1E3FD] text-[19px] md:h-11 md:w-11 md:rounded-[13px] md:text-[23px]">
                💡
              </div>
              <div className="flex-1 text-[17px] font-bold md:text-[21px]">
                วิธีใช้เช็กชื่อนักเรียน
              </div>
              <span
                onClick={() => setShowHelp(false)}
                className="cursor-pointer text-[22px] leading-none text-[#A9B0BE] hover:text-[#DC2626] md:text-[26px]"
              >
                ×
              </span>
            </div>
            <div className="flex flex-col gap-3 md:gap-3.5">
              {HELP_STEPS.map((text, i) => (
                <div key={i} className="flex gap-[11px] md:gap-[13px]">
                  <div className="flex h-6 w-6 flex-none items-center justify-center whitespace-nowrap rounded-full bg-primary text-xs font-bold text-white md:h-7 md:w-7 md:text-[13px]">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-[13px] leading-[1.5] text-[#434A58] md:pt-0.5 md:text-[14.5px] md:leading-[1.55]">
                    {text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2.5 rounded-xl border border-[#FCD9B6] bg-[#FFF6ED] p-3 md:mt-5 md:rounded-[13px] md:p-[14px_16px]">
              <span className="flex-none text-base md:text-[19px]">🔒</span>
              <div className="text-xs leading-[1.55] text-[#8A5A1A] md:text-[13.5px]">
                {DEVICE_NOTE}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-hover md:mt-[22px] md:rounded-[13px] md:py-[15px] md:text-[15px]"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* IMPORT modal */}
      {showImport && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(26,29,38,.55)] p-[22px] backdrop-blur-[3px]">
          <div className="w-full max-w-[336px] rounded-[22px] bg-white p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,.45)] md:max-w-[480px] md:rounded-3xl md:p-[30px]">
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex-1 text-[17px] font-bold md:text-xl">
                นำเข้ารายชื่อ
              </div>
              <span
                onClick={() => setShowImport(false)}
                className="cursor-pointer text-[22px] leading-none text-[#A9B0BE] hover:text-[#DC2626] md:text-[26px]"
              >
                ×
              </span>
            </div>
            <p className="mb-4 text-xs leading-[1.55] text-[#7C8494] md:mb-[18px] md:text-[13.5px]">
              อัปโหลดไฟล์ Excel (.xlsx) หรือวางรายชื่อจาก Excel/Sheets ก็ได้ ·
              ถ้าไฟล์มีคอลัมน์ “สถานะ” ระบบจะกู้สถานะเดิมให้ด้วย
            </p>
            <label className="mb-3.5 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#C6C9FB] bg-[#F4F5FF] p-[22px] hover:border-primary md:mb-4 md:gap-[9px] md:p-7">
              <span className="text-[26px] md:text-[30px]">📄</span>
              <span className="text-[13.5px] font-semibold text-[#3D38B4] md:text-[15px]">
                เลือกไฟล์ Excel
              </span>
              <span className="text-[11px] text-[#A9B0BE] md:text-xs">
                .xlsx / .xls
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={onFile}
                className="hidden"
              />
            </label>
            <div className="mb-1.5 text-xs font-semibold text-[#7C8494] md:mb-2 md:text-[13px]">
              หรือวางรายชื่อ (ทีละบรรทัด)
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={"สมชาย ใจดี\nสมหญิง รักเรียน…"}
              className="h-[110px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-primary md:h-[120px] md:text-[13.5px]"
            />
            <button
              type="button"
              onClick={importPaste}
              className="mt-3 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-hover md:mt-3.5 md:rounded-[13px] md:py-[14px] md:text-[15px]"
            >
              นำเข้ารายชื่อที่วาง
            </button>
            {importMsg && (
              <div className="mt-2.5 text-center text-xs text-[#0A9380] md:mt-3 md:text-[13px]">
                {importMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPORT modal */}
      {showExport && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(26,29,38,.55)] p-[22px] backdrop-blur-[3px]">
          <div className="w-full max-w-[336px] rounded-[22px] bg-white p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,.45)] md:max-w-[460px] md:rounded-3xl md:p-[30px]">
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex-1 text-[17px] font-bold md:text-xl">
                ส่งออกรายงาน
              </div>
              <span
                onClick={() => setShowExport(false)}
                className="cursor-pointer text-[22px] leading-none text-[#A9B0BE] hover:text-[#DC2626] md:text-[26px]"
              >
                ×
              </span>
            </div>
            <p className="mb-4 text-xs leading-[1.55] text-[#7C8494] md:mb-[18px] md:text-[13.5px]">
              {exportSubtitle}
            </p>
            <button
              type="button"
              onClick={exportExcel}
              className="mb-2.5 flex w-full items-center gap-3 rounded-[13px] border border-[#E5E8EE] bg-white p-3.5 text-left hover:border-[#0A9380] hover:bg-[#F2FBF8] md:mb-3 md:gap-3.5 md:rounded-2xl md:p-4"
            >
              <span className="text-[22px] md:text-[26px]">📊</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold md:text-[15px]">
                  ไฟล์ Excel (.xlsx)
                </span>
                <span className="text-[11.5px] text-[#A9B0BE] md:text-[12.5px]">
                  ใช้ทำสถิติต่อ · นำเข้าเครื่องอื่นได้
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={exportPDF}
              className="flex w-full items-center gap-3 rounded-[13px] border border-[#E5E8EE] bg-white p-3.5 text-left hover:border-[#DC2626] hover:bg-[#FEF4F4] md:gap-3.5 md:rounded-2xl md:p-4"
            >
              <span className="text-[22px] md:text-[26px]">🖨️</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold md:text-[15px]">
                  พิมพ์ / บันทึก PDF
                </span>
                <span className="text-[11.5px] text-[#A9B0BE] md:text-[12.5px]">
                  บัญชีเรียกชื่อรายวัน สำหรับแนบรายงาน
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* date + room + toolbar */}
      <div className="mb-3 flex items-center gap-2.5 md:hidden">
        <div className="flex-1">
          <div className="text-[11px] text-[#A9B0BE]">วันที่เช็ก</div>
          <div className="text-sm font-semibold">{dateTextShort}</div>
        </div>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="ห้อง"
          className="w-[120px] rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-[11px] py-2.5 text-[13px] font-semibold outline-none focus:border-primary"
        />
      </div>

      <div className="mb-2.5 flex gap-2 md:hidden">
        <button
          type="button"
          onClick={() => {
            setShowImport(true);
            setImportMsg("");
            setImportText("");
          }}
          className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#D3D8E1] bg-white px-2.5 py-2.5 text-[13px] font-semibold hover:border-[#C6C9FB] hover:bg-surface-light"
        >
          📥 นำเข้า Excel
        </button>
        <button
          type="button"
          onClick={() => setShowExport(true)}
          className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#D3D8E1] bg-white px-2.5 py-2.5 text-[13px] font-semibold hover:border-[#C6C9FB] hover:bg-surface-light"
        >
          📤 ส่งออก
        </button>
      </div>

      {/* Desktop header row */}
      <div className="mb-3.5 hidden items-center gap-3 md:flex">
        <h1 className="m-0 flex-1 text-lg font-bold">
          รายชื่อ · {dateTextShort}
        </h1>
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="ห้อง"
          className="w-[110px] rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-[11px] py-2.5 text-[13px] font-semibold outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            setShowImport(true);
            setImportMsg("");
            setImportText("");
          }}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E8EE] bg-white px-[13px] py-2 text-[13px] font-semibold hover:border-[#C6C9FB] hover:bg-surface-light"
        >
          📥 นำเข้า
        </button>
        <button
          type="button"
          onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E8EE] bg-white px-[13px] py-2 text-[13px] font-semibold hover:border-[#C6C9FB] hover:bg-surface-light"
        >
          📤 ส่งออก
        </button>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E8EE] bg-white px-[13px] py-2 text-[13px] font-semibold text-primary hover:bg-surface-light"
        >
          💡 วิธีใช้
        </button>
        <button
          type="button"
          onClick={toggleFull}
          title="เต็มจอ"
          className="rounded-[10px] border border-[#E5E8EE] bg-white px-3 py-2 text-[13px] hover:bg-surface-light"
        >
          ⛶
        </button>
      </div>

      <SaveScopeNote variant="mobile" />

      {/* Mobile summary card */}
      <div
        className="mb-3.5 rounded-2xl p-[15px] text-white md:hidden"
        style={{ background: "linear-gradient(135deg,#2A2775,#0A9380)" }}
      >
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[13px] text-[#C6C9FB]">เช็กแล้ว</span>
          <span className="font-mono text-xl font-semibold">
            {checked}/{total}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ATTENDANCE_STATUS_DEFS.map((d) => (
            <div
              key={d.key}
              className="rounded-[10px] bg-white/10 px-1 py-2 text-center"
            >
              <div className="font-mono text-lg font-semibold">
                {statuses.filter((x) => x === d.key).length}
              </div>
              <div className="text-[11px] text-[#C6C9FB]">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile quick actions */}
      <div className="mb-3.5 flex gap-2 md:hidden">
        <button
          type="button"
          onClick={allPresent}
          className="flex-1 whitespace-nowrap rounded-[11px] bg-[#0A9380] px-2.5 py-2.5 text-[13px] font-semibold text-white hover:brightness-105"
        >
          ✓ ทั้งหมดมา
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="flex-1 whitespace-nowrap rounded-[11px] border border-[#D3D8E1] bg-white px-2.5 py-2.5 text-[13px] font-semibold hover:bg-surface-light"
        >
          ล้างสถานะ
        </button>
        <button
          type="button"
          onClick={() => setDeleteMode((v) => !v)}
          className={`flex-none whitespace-nowrap rounded-[11px] border px-2.5 py-2.5 text-[13px] font-semibold ${
            deleteMode
              ? "border-[#DC2626] bg-[#FEF4F4] text-[#DC2626]"
              : "border-[#D3D8E1] bg-white hover:bg-surface-light"
          }`}
        >
          🗑 ลบรายชื่อ
        </button>
      </div>

      <div className="md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-7">
        <div>
          {/* Desktop quick actions row */}
          <div className="mb-1.5 hidden items-center justify-end gap-2.5 md:flex">
            <button
              type="button"
              onClick={allPresent}
              className="whitespace-nowrap rounded-[10px] bg-[#0A9380] px-[15px] py-2.5 text-[13px] font-semibold text-white hover:brightness-105"
            >
              ✓ ทั้งหมดมา
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-[15px] py-2.5 text-[13px] font-semibold hover:bg-surface-light"
            >
              ล้างสถานะ
            </button>
            <button
              type="button"
              onClick={() => setDeleteMode((v) => !v)}
              className={`whitespace-nowrap rounded-[10px] border px-[15px] py-2.5 text-[13px] font-semibold ${
                deleteMode
                  ? "border-[#DC2626] bg-[#FEF4F4] text-[#DC2626]"
                  : "border-[#D3D8E1] bg-white hover:bg-surface-light"
              }`}
            >
              🗑 ลบรายชื่อ
            </button>
          </div>

          {showEmpty ? (
            <div className="rounded-2xl border-[1.5px] border-dashed border-[#D3D8E1] bg-surface-light p-[30px_20px] text-center md:rounded-[18px] md:p-[56px_24px]">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FE] text-2xl md:mb-3.5 md:h-[58px] md:w-[58px] md:rounded-2xl md:text-[28px]">
                🧑‍🏫
              </div>
              <div className="text-[14.5px] font-bold md:text-[16.5px]">
                ยังไม่มีรายชื่อนักเรียน
              </div>
              <div className="mt-1.5 text-xs leading-[1.65] text-[#7C8494] md:mt-[7px] md:text-[13.5px]">
                <span className="md:hidden">
                  เพิ่มชื่อทีละคน หรือวางรายชื่อทั้งห้องพร้อมกัน
                  <br />
                  ที่กล่อง “รายชื่อนักเรียน” ด้านล่าง
                </span>
                <span className="hidden md:inline">
                  เพิ่มชื่อทีละคน หรือวางรายชื่อทั้งห้องพร้อมกัน
                  <br />
                  ที่กล่อง “รายชื่อนักเรียน” ทางขวา
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {students.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl border border-[#E5E8EE] bg-white px-[11px] py-2.5 md:gap-3 md:rounded-[13px] md:px-3.5 md:py-[11px]"
                >
                  <span className="w-[22px] flex-none font-mono text-[11px] text-[#A9B0BE] md:w-[26px] md:text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* The name wraps instead of truncating below md: the status
                      buttons take the width they need for a 44px touch target,
                      and a clipped student name would defeat the point. */}
                  <span className="min-w-0 flex-1 break-words text-[13px] font-medium md:overflow-hidden md:text-ellipsis md:whitespace-nowrap md:text-[14.5px]">
                    {name}
                  </span>
                  <div className="flex flex-none gap-1 md:gap-1.5">
                    {ATTENDANCE_STATUS_DEFS.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setStatus(i, d.key)}
                        style={btnStyle(statuses[i] === d.key, STATUS_COLORS[d.key])}
                        className="min-h-[44px] min-w-[44px] rounded-[9px] border px-[7px] py-[7px] text-[11.5px] font-semibold md:min-h-0 md:min-w-0 md:px-2.5 md:py-2 md:text-[12.5px]"
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  {deleteMode && (
                    <button
                      type="button"
                      onClick={() => removeStudent(i)}
                      aria-label={`ลบ ${name}`}
                      className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[#F1C0C0] bg-[#FEF4F4] text-sm font-bold text-[#DC2626] hover:bg-[#FCE9E9] md:h-7 md:w-7"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden md:block">
          <div
            className="mb-3.5 rounded-[18px] p-[22px] text-white"
            style={{ background: "linear-gradient(135deg,#2A2775,#0A9380)" }}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex-1">
                <div className="text-xs text-[#C6C9FB]">เช็กแล้ว</div>
                <div className="font-mono text-[30px] font-semibold">
                  {checked}/{total}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ATTENDANCE_STATUS_DEFS.map((d) => (
                <div
                  key={d.key}
                  className="flex items-center justify-between rounded-[11px] bg-white/10 px-[13px] py-[11px]"
                >
                  <span className="text-[13px] text-[#EAEBFF]">
                    {d.label}
                  </span>
                  <span className="font-mono text-xl font-semibold">
                    {statuses.filter((x) => x === d.key).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <SaveScopeNote variant="sidebar" />

          <div className="rounded-[18px] border border-[#E5E8EE] bg-surface-light p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[15px] font-bold">
                รายชื่อ ({total})
              </span>
              <span
                onClick={toggleBulk}
                className="cursor-pointer text-[12.5px] text-primary"
              >
                {bulkMode ? "✎ ทีละชื่อ" : "✎ วางหลายชื่อ"}
              </span>
            </div>
            {bulkMode ? (
              <div>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="วางรายชื่อ ทีละบรรทัด…"
                  className="h-[180px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-[13px] py-2.5 text-[13.5px] outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={applyBulk}
                  className="mt-2 w-full whitespace-nowrap rounded-[10px] bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  ใช้รายชื่อนี้
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="เพิ่มชื่อ… กด Enter"
                  className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-[13px] py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={addName}
                  className="flex-none whitespace-nowrap rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  เพิ่ม
                </button>
              </div>
            )}
            <p className="mt-3 text-[11.5px] leading-[1.6] text-[#A9B0BE]">
              แตะสถานะซ้ำเพื่อยกเลิก · บันทึกอัตโนมัติในเครื่องนี้ ·
              ส่งออก Excel เพื่อใช้งานต่อบนเครื่องอื่น
            </p>
          </div>
        </div>
      </div>

      {/* Manage names (mobile) */}
      <div className="mt-3.5 rounded-2xl border border-[#E5E8EE] bg-surface-light p-[15px] md:hidden">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-sm font-bold">รายชื่อนักเรียน ({total})</span>
          <span
            onClick={toggleBulk}
            className="cursor-pointer text-xs text-primary"
          >
            {bulkMode ? "✎ ทีละชื่อ" : "✎ วางหลายชื่อ"}
          </span>
        </div>
        {bulkMode ? (
          <div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="วางรายชื่อ ทีละบรรทัด…"
              className="h-[130px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={applyBulk}
              className="mt-2 w-full whitespace-nowrap rounded-[10px] bg-primary py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-hover"
            >
              ใช้รายชื่อนี้
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={onKey}
              placeholder="เพิ่มชื่อ… กด Enter"
              className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={addName}
              className="flex-none whitespace-nowrap rounded-[10px] bg-primary px-[15px] py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-hover"
            >
              เพิ่ม
            </button>
          </div>
        )}
      </div>

      {/* Mobile help + fullscreen row */}
      <div className="tool-stage-actions flex justify-end gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          title="วิธีใช้"
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 text-xs font-medium text-primary hover:bg-surface-light"
        >
          💡 วิธีใช้
        </button>
        <button
          type="button"
          onClick={toggleFull}
          title="เต็มจอ"
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-surface-light"
        >
          ⛶ ฉายเต็มจอ
        </button>
      </div>
    </div>
  );
}
