"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useCloudSync } from "@/lib/useCloudSync";
import SyncStatus from "@/components/SyncStatus";
import SaveScopeNote from "@/components/SaveScopeNote";
import { printSavings } from "@/lib/printSavings";

const LS_KEY = "khuncool_savings_v1";
const ROSTER_KEY = "khuncool.roster";
const PRESET_VALS = [5, 10, 20, 50];

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
const DEFAULT_BALANCES = [320, 150, 80, 210, 45, 175, 60, 130];

const HELP_STEPS = [
  "ใส่จำนวนเงินในช่องของนักเรียนแต่ละคน แล้วกด “ฝาก” (สีเขียว) หรือ “ถอน”",
  "อยากให้ทุกคนฝากเท่ากัน กดปุ่มลัด +5 +10 +20 หรือพิมพ์เอง แล้วกด “ฝากทุกคน”",
  "ยอดคงเหลือรายคนและยอดรวมทั้งห้องอัปเดตให้อัตโนมัติ",
  "กด “ประวัติ” เพื่อดูรายการฝาก/ถอนย้อนหลัง และกด ↺ เพื่อเลิกทำรายการที่ผิด",
  "กด “🗑 ลบรายชื่อ” เพื่อเปิดโหมดลบ แล้วแตะ ✕ ท้ายชื่อที่ต้องการลบออก",
  "“นำเข้า” รายชื่อทั้งห้องจาก Excel หรือวางรายชื่อ · ยอดของชื่อเดิมจะถูกเก็บไว้ — รายชื่อนี้ใช้ร่วมกับแอปเช็กชื่อและบันทึกโฮมรูมด้วย",
  "“ส่งออก” เป็น Excel (มีประวัติครบ) หรือ PDF (สมุดบัญชีสำหรับพิมพ์แนบรายงาน)",
];

const DEVICE_NOTE =
  "ผู้ใช้ที่ไม่ได้ล็อกอิน ยอดเงินและประวัติจะถูกบันทึกในเครื่อง/เบราว์เซอร์นี้เท่านั้น หากต้องการใช้ต่อบนเครื่องอื่นโดยไม่สมัครสมาชิก ให้ “ส่งออก Excel” จากเครื่องเดิม แล้ว “นำเข้า Excel” ที่อีกเครื่อง — หรือสมัครสมาชิกฟรีเพื่อให้ข้อมูลซิงก์ขึ้นบัญชีอัตโนมัติและใช้ได้ทุกเครื่องที่ล็อกอิน";

type Txn = { name: string; amt: number; type: "deposit" | "withdraw"; ts: number };

type Persisted = {
  students: string[];
  balances: number[];
  txns: Txn[];
  room: string;
  lastTs: number;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function money(n: number) {
  const v = Math.round(n || 0);
  if (Math.abs(v) >= 1e6)
    return "฿" + (v / 1e6).toFixed(Math.abs(v) >= 1e7 ? 0 : 1) + " ล้าน";
  return "฿" + v.toLocaleString("en-US");
}

function isToday(ts: number) {
  const d = new Date(ts);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

function parseAmt(v: string) {
  const n = parseInt(String(v == null ? "" : v).replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function fileStamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export default function SavingsApp() {
  const [students, setStudents] = useState<string[]>(DEFAULT_STUDENTS);
  const [balances, setBalances] = useState<number[]>(DEFAULT_BALANCES);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [room, setRoom] = useState("ป.5/2");
  const [lastTs, setLastTs] = useState(0);
  const [entryDate, setEntryDate] = useState(() => todayISO());
  const [quickAmt, setQuickAmt] = useState("");
  const [rowAmts, setRowAmts] = useState<Record<number, string>>({});
  const [newName, setNewName] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
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
  const activeChipRef = useRef<HTMLButtonElement | null>(null);

  // Mirrors `balances` synchronously (updated the instant we compute a new
  // array, not on the next render) so apply() can read the true latest
  // balance even when two withdraw clicks fire back-to-back before React
  // has re-rendered. Prevents a stale-closure race that could let a rapid
  // double-click withdraw push a balance negative.
  const balancesRef = useRef<number[]>(balances);
  const setBalancesSynced = useCallback(
    (updater: number[] | ((prev: number[]) => number[])) => {
      const next =
        typeof updater === "function"
          ? (updater as (prev: number[]) => number[])(balancesRef.current)
          : updater;
      balancesRef.current = next;
      setBalances(next);
      return next;
    },
    [],
  );

  const state = { students, balances, txns, room, lastTs };
  const { pulled, status: cloudStatus } = useCloudSync("savings", state);

  // Load persisted state on mount, and re-run if a cloud pull (after
  // sign-in) writes newer data into LS_KEY.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const d: Persisted = JSON.parse(raw);
        if (Array.isArray(d.students) && d.students.length) {
          setStudents(d.students);
          setBalancesSynced(
            Array.isArray(d.balances) ? d.balances : d.students.map(() => 0),
          );
          setTxns(Array.isArray(d.txns) ? d.txns : []);
          if (d.room) setRoom(d.room);
          setLastTs(d.lastTs || 0);
          setHydrated(true);
          return;
        }
      }
      const r: unknown = JSON.parse(
        window.localStorage.getItem(ROSTER_KEY) || "null",
      );
      if (Array.isArray(r) && r.length) {
        setStudents(r as string[]);
        setBalancesSynced((r as string[]).map(() => 0));
        setTxns([]);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulled]);

  // Keep the selected date chip centered — including on first mount, so
  // today's chip starts in the middle of the strip instead of pinned to
  // one edge (a trailing spacer makes room to center it even though there
  // are no future-dated chips after it).
  const chipScrollDone = useRef(false);
  useEffect(() => {
    activeChipRef.current?.scrollIntoView({
      behavior: chipScrollDone.current ? "smooth" : "auto",
      inline: "center",
      block: "nearest",
    });
    chipScrollDone.current = true;
  }, [entryDate]);

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

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          students,
          balances,
          txns,
          room,
          lastTs,
          savedAt: Date.now(),
        }),
      );
      window.localStorage.setItem(ROSTER_KEY, JSON.stringify(students));
    } catch {
      /* ignore */
    }
  }, [students, balances, txns, room, lastTs, hydrated]);

  const entryTs = useCallback(() => {
    if (!entryDate || entryDate === todayISO()) return Date.now();
    const base = new Date(entryDate + "T12:00:00").getTime();
    return base + (txns.length + 1);
  }, [entryDate, txns.length]);

  const entryLongText = useMemo(() => {
    try {
      return new Date(entryDate + "T12:00:00").toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [entryDate]);

  const backdating = entryDate !== todayISO();

  const dateChips = useMemo(() => {
    const today = todayISO();
    const out: { iso: string; dow: string; day: number; isToday: boolean }[] = [];
    for (let k = 20; k >= 0; k--) {
      const dt = new Date();
      dt.setHours(12, 0, 0, 0);
      dt.setDate(dt.getDate() - k);
      const iso = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
      const isTodayChip = iso === today;
      out.push({
        iso,
        dow: isTodayChip ? "วันนี้" : dt.toLocaleDateString("th-TH", { weekday: "short" }),
        day: dt.getDate(),
        isToday: isTodayChip,
      });
    }
    return out;
  }, []);

  const apply = useCallback(
    (i: number, amt: number, type: "deposit" | "withdraw") => {
      if (amt <= 0) return;
      // Read the live balance from the ref (kept in sync synchronously by
      // setBalancesSynced), not from the `balances` state closure — this is
      // what makes back-to-back withdraw clicks compose correctly instead
      // of both computing against the same stale balance.
      const cur = balancesRef.current[i] || 0;
      let usedAmt = amt;
      if (type === "withdraw") {
        usedAmt = Math.min(amt, cur);
        if (usedAmt <= 0) return;
      }
      const nextBal = [...balancesRef.current];
      nextBal[i] =
        type === "withdraw" ? Math.max(0, cur - usedAmt) : cur + usedAmt;
      setBalancesSynced(nextBal);
      const ts = entryTs();
      setTxns((t) => [...t, { name: students[i], amt: usedAmt, type, ts }]);
      setLastTs(ts);
      setRowAmts((r) => {
        const next = { ...r };
        delete next[i];
        return next;
      });
      flashToast();
    },
    [setBalancesSynced, entryTs, students, flashToast],
  );

  const deposit = useCallback(
    (i: number) => {
      const amt = parseAmt(rowAmts[i] || "");
      if (!amt) return;
      apply(i, amt, "deposit");
    },
    [rowAmts, apply],
  );

  const withdraw = useCallback(
    (i: number) => {
      const amt = parseAmt(rowAmts[i] || "");
      if (!amt) return;
      apply(i, amt, "withdraw");
    },
    [rowAmts, apply],
  );

  const depositAll = useCallback(() => {
    const amt = parseAmt(quickAmt);
    if (!amt) return;
    const ts = entryTs();
    setBalancesSynced((current) => current.map((b) => (b || 0) + amt));
    setTxns((current) => [
      ...current,
      ...students.map((name, idx) => ({
        name,
        amt,
        type: "deposit" as const,
        ts: ts + idx,
      })),
    ]);
    setLastTs(ts);
    setQuickAmt("");
    flashToast();
  }, [quickAmt, entryTs, students, flashToast, setBalancesSynced]);

  const undoTxn = useCallback(
    (ts: number) => {
      const t = txns.find((x) => x.ts === ts);
      if (!t) return;
      const i = students.indexOf(t.name);
      if (i >= 0) {
        setBalancesSynced((bal) => {
          const next = [...bal];
          next[i] = (next[i] || 0) + (t.type === "deposit" ? -t.amt : t.amt);
          if (next[i] < 0) next[i] = 0;
          return next;
        });
      }
      setTxns((current) => current.filter((x) => x.ts !== ts));
      flashToast();
    },
    [txns, students, flashToast, setBalancesSynced],
  );

  const addName = useCallback(() => {
    const v = newName.trim();
    if (!v) return;
    setStudents((current) => [...current, v]);
    setBalancesSynced((current) => [...current, 0]);
    setNewName("");
    flashToast();
  }, [newName, flashToast, setBalancesSynced]);

  const removeStudent = useCallback(
    (i: number) => {
      setStudents((current) => current.filter((_, idx) => idx !== i));
      setBalancesSynced((current) => current.filter((_, idx) => idx !== i));
      setRowAmts((r) => {
        const next = { ...r };
        delete next[i];
        return next;
      });
      flashToast("ลบแล้ว ✓");
    },
    [flashToast, setBalancesSynced],
  );

  const onKeyName = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") addName();
    },
    [addName],
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
    const prev: Record<string, number> = {};
    students.forEach((n, i) => {
      prev[n] = balances[i] || 0;
    });
    setStudents(list);
    setBalancesSynced(list.map((n) => prev[n] || 0));
    setBulkMode(false);
    setRowAmts({});
    flashToast();
  }, [bulkText, students, balances, flashToast, setBalancesSynced]);

  const importPaste = useCallback(() => {
    const list = importText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!list.length) {
      setImportMsg("ยังไม่มีรายชื่อให้นำเข้า");
      return;
    }
    const prev: Record<string, number> = {};
    students.forEach((n, i) => {
      prev[n] = balances[i] || 0;
    });
    setStudents(list);
    setBalancesSynced(list.map((n) => prev[n] || 0));
    setShowImport(false);
    setImportText("");
    setRowAmts({});
    flashToast();
  }, [importText, students, balances, flashToast, setBalancesSynced]);

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
          let balCol = -1;
          if (header) {
            const ni = header.findIndex(
              (c) => c.includes("ชื่อ") || c.toLowerCase().includes("name"),
            );
            if (ni >= 0) nameCol = ni;
            const bi = header.findIndex(
              (c) =>
                c.includes("คงเหลือ") ||
                c.includes("ยอด") ||
                c.toLowerCase().includes("balance"),
            );
            if (bi >= 0) balCol = bi;
          } else {
            nameCol = (aoa[0] as unknown[]).length >= 2 ? 1 : 0;
          }
          const newStudents: string[] = [];
          const newBalances: number[] = [];
          for (let i = start; i < aoa.length; i++) {
            const row = (aoa[i] || []) as unknown[];
            let name = String(row[nameCol] == null ? "" : row[nameCol]).trim();
            if (!name && nameCol !== 0)
              name = String(row[0] == null ? "" : row[0]).trim();
            if (!name) continue;
            newStudents.push(name);
            newBalances.push(
              balCol >= 0
                ? parseAmt(String(row[balCol] == null ? "" : row[balCol]))
                : 0,
            );
          }
          if (!newStudents.length) {
            setImportMsg("ไม่พบรายชื่อในไฟล์ (ตรวจคอลัมน์ชื่อ)");
            return;
          }
          setStudents(newStudents);
          setBalancesSynced(newBalances);
          setShowImport(false);
          setImportMsg("");
          setRowAmts({});
          flashToast();
        } catch {
          setImportMsg("อ่านไฟล์ไม่สำเร็จ — ต้องเป็น .xlsx/.xls");
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [flashToast, setBalancesSynced],
  );

  const exportExcel = useCallback(() => {
    const rows: (string | number)[][] = [["เลขที่", "ชื่อ-สกุล", "ยอดคงเหลือ"]];
    students.forEach((n, i) =>
      rows.push([i + 1, n, Math.round(balances[i] || 0)]),
    );
    rows.push([]);
    rows.push([
      "รวมทั้งห้อง",
      "",
      Math.round(balances.reduce((a, b) => a + (b || 0), 0)),
    ]);
    rows.push(["ห้อง", room]);
    rows.push(["วันที่", new Date().toLocaleDateString("th-TH")]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ยอดออม");
    const trows: (string | number)[][] = [
      ["วันที่-เวลา", "ชื่อ-สกุล", "ประเภท", "จำนวน"],
    ];
    [...txns].reverse().forEach((t) =>
      trows.push([
        new Date(t.ts).toLocaleString("th-TH"),
        t.name,
        t.type === "deposit" ? "ฝาก" : "ถอน",
        Math.round(t.amt),
      ]),
    );
    const tws = XLSX.utils.aoa_to_sheet(trows);
    tws["!cols"] = [{ wch: 22 }, { wch: 30 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, tws, "รายการ");
    XLSX.writeFile(wb, `ออมเงิน_${room || "ห้อง"}_${fileStamp()}.xlsx`);
    setShowExport(false);
  }, [students, balances, room, txns]);

  const exportPDF = useCallback(() => {
    printSavings(room, students, balances);
    setShowExport(false);
  }, [room, students, balances]);

  const toggleFull = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const total = students.length;
  const totalBal = balances.reduce((a, b) => a + (b || 0), 0);
  const todayDep = txns
    .filter((t) => t.type === "deposit" && isToday(t.ts))
    .reduce((a, t) => a + t.amt, 0);
  const avg = total ? totalBal / total : 0;
  const showEmpty = total === 0;
  const lastText = lastTs
    ? new Date(lastTs).toLocaleDateString("th-TH", { day: "numeric", month: "short" })
    : "—";
  const exportSubtitle = `ห้อง ${room || "-"} · ${total} คน · ยอดรวม ${money(totalBal)}`;

  const txnRows = useMemo(
    () =>
      [...txns]
        .reverse()
        .slice(0, 80)
        .map((t) => {
          const dep = t.type === "deposit";
          return {
            ts: t.ts,
            name: t.name,
            typeText: dep ? "ฝากเงิน" : "ถอนเงิน",
            icon: dep ? "↑" : "↓",
            color: dep ? "#0A7A66" : "#DC2626",
            bg: dep ? "#DFF5EF" : "#FCE9E9",
            amtText: (dep ? "+" : "−") + money(t.amt).slice(1),
            timeText: new Date(t.ts).toLocaleString("th-TH", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }),
    [txns],
  );

  return (
    <div ref={frameRef} className="bg-white">
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
              <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-[#FCE9CC] text-[19px] md:h-11 md:w-11 md:rounded-[13px] md:text-[23px]">
                💡
              </div>
              <div className="flex-1 text-[17px] font-bold md:text-[21px]">
                วิธีใช้ออมเงินนักเรียน
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
                  <div className="flex h-6 w-6 flex-none items-center justify-center whitespace-nowrap rounded-full bg-[#C2500B] text-xs font-bold text-white md:h-7 md:w-7 md:text-[13px]">
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
              className="mt-4 w-full rounded-xl bg-[#C2500B] py-3.5 text-sm font-bold text-white hover:bg-[#A5430A] md:mt-[22px] md:rounded-[13px] md:py-[15px] md:text-[15px]"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* HISTORY modal */}
      {showHistory && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(26,29,38,.55)] backdrop-blur-[3px] md:items-center">
          <div className="flex h-[640px] w-full flex-col rounded-t-[22px] bg-white p-[20px_18px_0] shadow-[0_-20px_60px_-20px_rgba(0,0,0,.4)] md:h-[600px] md:w-[560px] md:rounded-3xl md:p-[28px_28px_0] md:shadow-[0_40px_80px_-24px_rgba(0,0,0,.45)]">
            <div className="mb-3.5 flex items-center gap-2.5 md:mb-[18px]">
              <div className="flex-1 text-[17px] font-bold md:text-xl">
                ประวัติการออม
              </div>
              <span
                onClick={() => setShowHistory(false)}
                className="cursor-pointer text-[22px] leading-none text-[#A9B0BE] hover:text-[#DC2626] md:text-[26px]"
              >
                ×
              </span>
            </div>
            {txnRows.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[#A9B0BE] md:gap-2.5">
                <span className="text-[34px] md:text-[42px]">🪙</span>
                <span className="text-[13px] md:text-sm">
                  ยังไม่มีรายการฝาก/ถอน
                </span>
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-[7px] overflow-y-auto pb-[18px] md:gap-2 md:pb-6">
                {txnRows.map((t) => (
                  <div
                    key={t.ts}
                    className="flex items-center gap-2.5 rounded-xl border border-[#E5E8EE] bg-white p-[9px_11px] md:gap-3 md:rounded-[13px] md:p-[11px_14px]"
                  >
                    <div
                      className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] text-sm font-bold md:h-[34px] md:w-[34px] md:rounded-[10px] md:text-[15px]"
                      style={{ background: t.bg, color: t.color }}
                    >
                      {t.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold md:text-sm">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-[#A9B0BE] md:text-xs">
                        <span className="hidden md:inline">
                          {t.typeText} ·{" "}
                        </span>
                        {t.timeText}
                      </div>
                    </div>
                    <span
                      className="flex-none font-mono text-sm font-semibold md:text-base"
                      style={{ color: t.color }}
                    >
                      {t.amtText}
                    </span>
                    <span
                      onClick={() => undoTxn(t.ts)}
                      title="เลิกทำ"
                      className="flex-none cursor-pointer p-[2px_4px] text-[15px] text-[#A9B0BE] hover:text-[#DC2626] md:hidden"
                    >
                      ↺
                    </span>
                    <button
                      type="button"
                      onClick={() => undoTxn(t.ts)}
                      className="hidden flex-none items-center gap-1 rounded-[9px] border border-[#E5E8EE] bg-white px-[11px] py-1.5 text-xs font-semibold text-[#7C8494] hover:border-[#DC2626] hover:text-[#DC2626] md:flex"
                    >
                      ↺ เลิกทำ
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              อัปโหลดไฟล์ Excel (.xlsx) หรือวางรายชื่อ · ถ้าไฟล์มีคอลัมน์
              “ยอดคงเหลือ” ระบบจะกู้ยอดเงินเดิมให้ (ใช้ย้ายข้อมูลข้ามเครื่องได้)
            </p>
            <label className="mb-3.5 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#F2C079] bg-[#FFF8EE] p-[22px] hover:border-[#C2500B] md:mb-4 md:gap-[9px] md:p-7">
              <span className="text-[26px] md:text-[30px]">📄</span>
              <span className="text-[13.5px] font-semibold text-[#A5430A] md:text-[15px]">
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
              className="h-[110px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#C2500B] md:h-[120px] md:text-[13.5px]"
            />
            <button
              type="button"
              onClick={importPaste}
              className="mt-3 w-full rounded-xl bg-[#C2500B] py-3.5 text-sm font-bold text-white hover:bg-[#A5430A] md:mt-3.5 md:rounded-[13px] md:py-[14px] md:text-[15px]"
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
                ส่งออกสมุดบัญชี
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
                  <span className="md:hidden">
                    ยอดคงเหลือ + รายการฝากถอน · ย้ายเครื่องได้
                  </span>
                  <span className="hidden md:inline">
                    ยอดคงเหลือ + ประวัติรายการ · นำเข้าเครื่องอื่นเพื่อใช้ต่อได้
                  </span>
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={exportPDF}
              className="flex w-full items-center gap-3 rounded-[13px] border border-[#E5E8EE] bg-white p-3.5 text-left hover:border-[#C2500B] hover:bg-[#FFF8EE] md:gap-3.5 md:rounded-2xl md:p-4"
            >
              <span className="text-[22px] md:text-[26px]">🖨️</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold md:text-[15px]">
                  พิมพ์ / บันทึก PDF
                </span>
                <span className="text-[11.5px] text-[#A9B0BE] md:text-[12.5px]">
                  สรุปยอดออมรายคน สำหรับแนบรายงาน
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile header: room + last updated */}
      <div className="mb-2.5 flex items-center gap-2.5 md:hidden">
        <div className="flex-1">
          <div className="text-[11px] text-[#A9B0BE]">ห้อง</div>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="ห้อง"
            className="mt-0.5 w-full rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-[11px] py-2 text-sm font-semibold outline-none focus:border-[#C2500B]"
          />
        </div>
        <div className="text-right">
          <div className="text-[11px] text-[#A9B0BE]">อัปเดตล่าสุด</div>
          <div className="text-[13px] font-semibold">{lastText}</div>
        </div>
      </div>

      {/* Date chips (mobile) */}
      <div className="mb-3 md:hidden">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#7C8494]">
            🗓️ วันที่บันทึก
          </span>
          {backdating && (
            <span className="whitespace-nowrap rounded-pill bg-[#C2500B] px-2 py-0.5 text-[10.5px] font-bold text-white">
              ย้อนหลัง
            </span>
          )}
        </div>
        <div
          className="flex gap-[7px] overflow-x-auto py-0.5 pb-1.5"
          style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
        >
          {dateChips.map((d) => (
            <button
              key={d.iso}
              type="button"
              ref={d.iso === entryDate ? activeChipRef : undefined}
              onClick={() => setEntryDate(d.iso)}
              className="flex h-[54px] w-[54px] flex-none flex-col items-center justify-center rounded-[13px] leading-[1.25]"
              style={
                d.iso === entryDate
                  ? { border: "1.5px solid #C2500B", background: "#C2500B", color: "#fff" }
                  : {
                      border: d.isToday ? "1.5px solid #F2C079" : "1px solid #E5E8EE",
                      background: "#fff",
                      color: "#434A58",
                    }
              }
            >
              <span className="text-[10px] font-medium">{d.dow}</span>
              <span className="text-[17px] font-bold">{d.day}</span>
            </button>
          ))}
          <div className="w-[45vw] flex-none" aria-hidden="true" />
        </div>
        {backdating && (
          <div className="mt-0.5 text-[11.5px] text-[#8A5A1A]">
            กำลังบันทึกของ <b>{entryLongText}</b>
          </div>
        )}
      </div>

      {/* Import/Export buttons (mobile) */}
      <div className="mb-2.5 flex gap-2 md:hidden">
        <button
          type="button"
          onClick={() => {
            setShowImport(true);
            setImportMsg("");
            setImportText("");
          }}
          className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#D3D8E1] bg-white px-2.5 py-2.5 text-[13px] font-semibold hover:border-[#F2C079] hover:bg-surface-light"
        >
          📥 นำเข้า
        </button>
        <button
          type="button"
          onClick={() => setShowExport(true)}
          className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#D3D8E1] bg-white px-2.5 py-2.5 text-[13px] font-semibold hover:border-[#F2C079] hover:bg-surface-light"
        >
          📤 ส่งออก
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

      <SaveScopeNote variant="mobile" />

      {/* Mobile summary card */}
      <div
        className="mb-3.5 rounded-2xl p-4 text-white md:hidden"
        style={{ background: "linear-gradient(135deg,#7A3D0B,#E0A400)" }}
      >
        <div className="text-[12.5px] text-[#FBE7C6]">ยอดออมรวมทั้งห้อง</div>
        <div className="my-0.5 mb-3 font-mono text-[30px] font-semibold">
          {money(totalBal)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: `${total} คน`, label: "นักเรียน" },
            { n: money(todayDep), label: "ฝากวันนี้" },
            { n: money(avg), label: "เฉลี่ย/คน" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[10px] bg-white/[.14] px-1.5 py-2.5 text-center"
            >
              <div className="font-mono text-[15px] font-semibold">{s.n}</div>
              <div className="mt-px text-[10.5px] text-[#FBE7C6]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick deposit all (mobile) */}
      <div className="mb-3.5 rounded-2xl border border-[#FCD9B6] bg-[#FFF8EE] p-[13px] md:hidden">
        <div className="mb-2.5 text-[12.5px] font-bold text-[#8A5A1A]">
          ฝากพร้อมกันทั้งห้อง
        </div>
        <div className="mb-2.5 flex gap-[7px]">
          {PRESET_VALS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setQuickAmt(String(v))}
              className="rounded-lg border border-[#E4C79A] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#8A5A1A]"
            >
              +{v}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={quickAmt}
            onChange={(e) => setQuickAmt(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="จำนวนบาท"
            className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#E4C79A] bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#C2500B]"
          />
          <button
            type="button"
            onClick={depositAll}
            className="flex-none rounded-[10px] bg-[#C2500B] px-[15px] py-2.5 text-[13.5px] font-bold text-white hover:bg-[#A5430A]"
          >
            ฝากทุกคน
          </button>
        </div>
      </div>

      <div className="md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-7">
        <div>
          {/* Desktop header row */}
          <div className="mb-3.5 hidden items-center gap-2.5 md:flex">
            <h1 className="m-0 flex-1 text-lg font-bold">รายชื่อ · ห้อง {room}</h1>
            {backdating && (
              <span className="flex-none whitespace-nowrap rounded-pill bg-[#C2500B] px-2.5 py-1 text-[11px] font-bold text-white">
                ● บันทึกย้อนหลัง
              </span>
            )}
            <div
              className="flex flex-none items-center gap-2 rounded-[10px] px-[11px] py-[7px]"
              style={{
                border: `1px solid ${backdating ? "#F2C079" : "#E5E8EE"}`,
                background: backdating ? "#FFF8EE" : "#F8F9FB",
              }}
            >
              <span className="text-[12.5px] font-semibold text-[#7C8494]">
                🗓️ วันที่บันทึก
              </span>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value || todayISO())}
                className="rounded-lg border border-[#D3D8E1] bg-white px-[9px] py-1.5 text-[13px] font-semibold text-ink outline-none focus:border-[#C2500B]"
              />
            </div>
            <button
              type="button"
              onClick={() => setDeleteMode((v) => !v)}
              className={`flex-none whitespace-nowrap rounded-[10px] border px-[15px] py-2.5 text-[13px] font-semibold ${
                deleteMode
                  ? "border-[#DC2626] bg-[#FEF4F4] text-[#DC2626]"
                  : "border-[#D3D8E1] bg-white hover:bg-surface-light"
              }`}
            >
              🗑 ลบรายชื่อ
            </button>
          </div>

          {/* Quick deposit all (desktop) */}
          <div className="mb-3.5 hidden items-center gap-2.5 rounded-[13px] border border-[#FCD9B6] bg-[#FFF8EE] px-3.5 py-3 md:flex">
            <span className="flex-none text-[13px] font-bold text-[#8A5A1A]">
              ฝากทั้งห้อง
            </span>
            <div className="flex flex-none gap-1.5">
              {PRESET_VALS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setQuickAmt(String(v))}
                  className="rounded-lg border border-[#E4C79A] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#8A5A1A]"
                >
                  +{v}
                </button>
              ))}
            </div>
            <input
              value={quickAmt}
              onChange={(e) => setQuickAmt(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="จำนวนบาท"
              className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#E4C79A] bg-white px-3 py-[9px] text-sm font-semibold outline-none focus:border-[#C2500B]"
            />
            <button
              type="button"
              onClick={depositAll}
              className="flex-none rounded-[10px] bg-[#C2500B] px-4 py-[9px] text-[13.5px] font-bold text-white hover:bg-[#A5430A]"
            >
              ฝากทุกคน
            </button>
          </div>

          {showEmpty ? (
            <div className="rounded-2xl border-[1.5px] border-dashed border-[#E4C79A] bg-[#FFF8EE] p-[30px_20px] text-center md:rounded-[18px] md:p-[56px_24px]">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBE7C6] text-2xl md:mb-3.5 md:h-[58px] md:w-[58px] md:text-[28px]">
                🐷
              </div>
              <div className="text-[14.5px] font-bold">ยังไม่มีรายชื่อนักเรียน</div>
              <div className="mt-1.5 text-xs leading-[1.65] text-[#8A5A1A] md:mt-[7px] md:text-[13.5px]">
                <span className="md:hidden">
                  เพิ่มชื่อ หรือวางรายชื่อทั้งห้องด้านล่าง
                  <br />
                  แล้วเริ่มบันทึกการออมได้เลย
                </span>
                <span className="hidden md:inline">
                  เพิ่มชื่อ หรือวางรายชื่อทั้งห้องที่กล่องทางขวา
                  <br />
                  แล้วเริ่มบันทึกการออมได้เลย
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {students.map((name, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#E5E8EE] bg-white p-[10px_11px] md:flex md:items-center md:gap-3 md:rounded-[13px] md:p-[11px_14px]"
                >
                  <div className="mb-2 flex items-center gap-[9px] md:mb-0 md:contents">
                    <span className="w-[22px] flex-none font-mono text-[11px] text-[#A9B0BE] md:w-[26px] md:text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium md:text-[14.5px]">
                      {name}
                    </span>
                    <span
                      className="flex-none whitespace-nowrap font-mono text-sm font-semibold text-[#0A7A66] md:min-w-[104px] md:text-right md:text-[15.5px]"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {money(balances[i])}
                    </span>
                  </div>
                  <div className="flex gap-1.5 md:flex-none md:gap-2">
                    <input
                      value={rowAmts[i] || ""}
                      onChange={(e) =>
                        setRowAmts((r) => ({
                          ...r,
                          [i]: e.target.value.replace(/[^0-9]/g, ""),
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") deposit(i);
                      }}
                      inputMode="numeric"
                      placeholder="บาท"
                      className="min-w-0 flex-1 rounded-[9px] border-[1.5px] border-[#E5E8EE] bg-surface-light px-2.5 py-2 text-[13px] outline-none focus:border-[#C2500B] focus:bg-white md:w-[78px] md:flex-none md:text-[13.5px]"
                    />
                    <button
                      type="button"
                      onClick={() => deposit(i)}
                      className="flex-none rounded-[9px] bg-[#0A9380] px-3 py-2 text-[12.5px] font-bold text-white hover:brightness-105 md:px-3.5 md:text-[13px]"
                    >
                      ฝาก
                    </button>
                    <button
                      type="button"
                      onClick={() => withdraw(i)}
                      className="flex-none rounded-[9px] border border-[#F1C0C0] bg-white px-2.5 py-2 text-[12.5px] font-semibold text-[#DC2626] hover:bg-[#FEF4F4] md:px-3 md:text-[13px]"
                    >
                      ถอน
                    </button>
                    {deleteMode && (
                      <button
                        type="button"
                        onClick={() => removeStudent(i)}
                        aria-label={`ลบ ${name}`}
                        className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#F1C0C0] bg-[#FEF4F4] text-sm font-bold text-[#DC2626] hover:bg-[#FCE9E9]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden md:block">
          <div
            className="mb-3.5 rounded-[18px] p-[22px] text-white"
            style={{ background: "linear-gradient(135deg,#7A3D0B,#E0A400)" }}
          >
            <div className="text-[12.5px] text-[#FBE7C6]">ยอดออมรวมทั้งห้อง</div>
            <div className="my-0.5 mb-4 font-mono text-[34px] font-semibold">
              {money(totalBal)}
            </div>
            <div className="flex flex-col gap-[9px]">
              {[
                { n: `${total} คน`, label: "นักเรียน" },
                { n: money(todayDep), label: "ฝากวันนี้" },
                { n: money(avg), label: "เฉลี่ย/คน" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-[11px] bg-white/[.14] px-[13px] py-[11px]"
                >
                  <span className="text-[13px] text-[#FBE7C6]">{s.label}</span>
                  <span className="font-mono text-lg font-semibold">{s.n}</span>
                </div>
              ))}
            </div>
          </div>

          <SaveScopeNote variant="sidebar" />

          <div className="rounded-[18px] border border-[#E5E8EE] bg-surface-light p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[15px] font-bold">รายชื่อ ({total})</span>
              <span
                onClick={toggleBulk}
                className="cursor-pointer text-[12.5px] text-[#C2500B]"
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
                  className="h-[180px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-[13px] py-2.5 text-[13.5px] outline-none focus:border-[#C2500B]"
                />
                <button
                  type="button"
                  onClick={applyBulk}
                  className="mt-2 w-full whitespace-nowrap rounded-[10px] bg-[#C2500B] py-2.5 text-sm font-semibold text-white hover:bg-[#A5430A]"
                >
                  ใช้รายชื่อนี้
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={onKeyName}
                  placeholder="เพิ่มชื่อ… กด Enter"
                  className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-[13px] py-2.5 text-sm outline-none focus:border-[#C2500B]"
                />
                <button
                  type="button"
                  onClick={addName}
                  className="flex-none whitespace-nowrap rounded-[10px] bg-[#C2500B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A5430A]"
                >
                  เพิ่ม
                </button>
              </div>
            )}
            <p className="mt-3 text-[11.5px] leading-[1.6] text-[#A9B0BE]">
              ใส่จำนวนเงินในช่องของแต่ละคนแล้วกด “ฝาก” · บันทึกอัตโนมัติในเครื่องนี้ ·
              ส่งออก Excel เพื่อใช้ต่อบนเครื่องอื่น
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
            className="cursor-pointer text-xs text-[#C2500B]"
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
              className="h-[130px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#C2500B]"
            />
            <button
              type="button"
              onClick={applyBulk}
              className="mt-2 w-full whitespace-nowrap rounded-[10px] bg-[#C2500B] py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#A5430A]"
            >
              ใช้รายชื่อนี้
            </button>
            <p className="mt-2.5 text-[11px] leading-[1.5] text-[#A9B0BE]">
              ยอดเงินของชื่อเดิมจะถูกเก็บไว้ ชื่อใหม่เริ่มที่ ฿0
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={onKeyName}
              placeholder="เพิ่มชื่อ… กด Enter"
              className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-[#C2500B]"
            />
            <button
              type="button"
              onClick={addName}
              className="flex-none whitespace-nowrap rounded-[10px] bg-[#C2500B] px-[15px] py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#A5430A]"
            >
              เพิ่ม
            </button>
          </div>
        )}
      </div>

      {/* Mobile: history, help + fullscreen row */}
      <div className="mt-3.5 flex justify-end gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          title="ประวัติ"
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-surface-light"
        >
          🕑 ประวัติ
        </button>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          title="วิธีใช้"
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 text-xs font-medium text-[#C2500B] hover:bg-surface-light"
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

      {/* Desktop: history + help + fullscreen row */}
      <div className="mt-3.5 hidden justify-end gap-2 md:flex">
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E8EE] bg-white px-[13px] py-2 text-[13px] font-semibold hover:border-[#F2C079] hover:bg-surface-light"
        >
          🕑 ประวัติ
        </button>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E8EE] bg-white px-[13px] py-2 text-[13px] font-semibold text-[#C2500B] hover:bg-surface-light"
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
    </div>
  );
}
