"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useCloudSync } from "@/lib/useCloudSync";
import SyncStatus from "@/components/SyncStatus";
import {
  type HomeroomSession,
  type HomeroomTopic,
  absentCount,
  absentList,
  attendanceSnapshotFrom,
  printHomeroomForm,
  printHomeroomTermPack,
  readAppLS,
  thaiDate,
  weekOf,
} from "@/lib/printHomeroom";

const LS = "khuncool.homeroom";
const ATTENDANCE_LS = "khuncool_attendance_v1";
const SAVINGS_LS = "khuncool_savings_v1";
const ROSTER_KEY = "khuncool.roster";

const DEFAULT_TOPICS = [
  "รักชาติ ศาสน์ กษัตริย์",
  "ซื่อสัตย์สุจริต",
  "มีวินัย",
  "ใฝ่เรียนรู้",
  "อยู่อย่างพอเพียง",
  "มุ่งมั่นในการทำงาน",
  "รักความเป็นไทย",
  "มีจิตสาธารณะ",
];

function defaultTopics(): HomeroomTopic[] {
  return DEFAULT_TOPICS.map((label, i) => ({ id: "t" + i, label }));
}

interface RawSavingsState {
  room?: string;
  students?: string[];
  balances?: number[];
  txns?: unknown[];
}

interface RawAttendanceState {
  room?: string;
  students?: string[];
  statuses?: (string | null)[];
  savedAt?: number;
}

interface Persisted {
  school: string;
  level: string;
  term: string;
  year: string;
  teacher: string;
  topics: HomeroomTopic[];
  sessions: HomeroomSession[];
  blankRows: number;
  plan: Record<number, string[]>;
  showSign: boolean;
  showPrincipal: boolean;
  principal: string;
  principalRole: string;
  students?: string[];
}

export default function HomeroomApp() {
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState("");
  const [term, setTerm] = useState("1");
  const [year, setYear] = useState(() => String(new Date().getFullYear() + 543));
  const [teacher, setTeacher] = useState("");
  const [topics, setTopics] = useState<HomeroomTopic[]>(defaultTopics);
  const [sessions, setSessions] = useState<HomeroomSession[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [students, setStudents] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [blankRows, setBlankRows] = useState(4);
  const [plan, setPlan] = useState<Record<number, string[]>>({});
  const [planWeek, setPlanWeek] = useState(1);
  const [showSign, setShowSign] = useState(true);
  const [showPrincipal, setShowPrincipal] = useState(false);
  const [principal, setPrincipal] = useState("");
  const [principalRole, setPrincipalRole] = useState("ผู้อำนวยการโรงเรียน");
  const [packStatus, setPackStatus] = useState("");
  const [offline, setOffline] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "settings">("list");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Ref mirror of sessions, kept in sync synchronously so patch() calls that
  // fire back-to-back (e.g. rapid edits) always read the latest array
  // instead of a stale closure — same pattern as SavingsApp's balancesRef.
  const sessionsRef = useRef<HomeroomSession[]>(sessions);
  const setSessionsSynced = useCallback(
    (updater: HomeroomSession[] | ((prev: HomeroomSession[]) => HomeroomSession[])) => {
      const next =
        typeof updater === "function"
          ? (updater as (prev: HomeroomSession[]) => HomeroomSession[])(sessionsRef.current)
          : updater;
      sessionsRef.current = next;
      setSessions(next);
      return next;
    },
    [],
  );

  const state = {
    school,
    level,
    term,
    year,
    teacher,
    topics,
    sessions,
    blankRows,
    plan,
    showSign,
    showPrincipal,
    principal,
    principalRole,
    students,
  };
  const { pulled, status: cloudStatus } = useCloudSync("homeroom", state);

  // Load persisted state on mount, and re-run if a cloud pull (after
  // sign-in) writes newer data into LS.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS);
      if (raw) {
        const d: Partial<Persisted> = JSON.parse(raw);
        if (Array.isArray(d.topics) && d.topics.length) {
          setSchool(d.school || "");
          setLevel(d.level || "");
          setTerm(d.term || "1");
          if (d.year) setYear(d.year);
          setTeacher(d.teacher || "");
          setTopics(d.topics);
          const loadedSessions = Array.isArray(d.sessions) ? d.sessions : [];
          setSessionsSynced(loadedSessions);
          setCurrentId(loadedSessions.length ? loadedSessions[loadedSessions.length - 1].id : null);
          setBlankRows(typeof d.blankRows === "number" ? d.blankRows : 4);
          setPlan(d.plan || {});
          setShowSign(d.showSign !== false);
          setShowPrincipal(!!d.showPrincipal);
          setPrincipal(d.principal || "");
          setPrincipalRole(d.principalRole || "ผู้อำนวยการโรงเรียน");
          if (Array.isArray(d.students) && d.students.length) {
            setStudents(d.students);
          } else {
            const r: unknown = JSON.parse(
              window.localStorage.getItem(ROSTER_KEY) || "null",
            );
            if (Array.isArray(r) && r.length) setStudents(r as string[]);
          }
          setHydrated(true);
          return;
        }
      }
      const r: unknown = JSON.parse(
        window.localStorage.getItem(ROSTER_KEY) || "null",
      );
      if (Array.isArray(r) && r.length) setStudents(r as string[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    };
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        LS,
        JSON.stringify({
          school,
          level,
          term,
          year,
          teacher,
          topics,
          sessions,
          blankRows,
          plan,
          showSign,
          showPrincipal,
          principal,
          principalRole,
          students,
          savedAt: Date.now(),
        }),
      );
      window.localStorage.setItem(ROSTER_KEY, JSON.stringify(students));
    } catch {
      /* ignore */
    }
  }, [
    school,
    level,
    term,
    year,
    teacher,
    topics,
    sessions,
    blankRows,
    plan,
    showSign,
    showPrincipal,
    principal,
    principalRole,
    students,
    hydrated,
  ]);

  const patch = useCallback(
    (id: string, p: Partial<HomeroomSession>) => {
      setSessionsSynced((cur) => cur.map((x) => (x.id === id ? { ...x, ...p } : x)));
    },
    [setSessionsSynced],
  );

  const addName = useCallback(() => {
    const v = newName.trim();
    if (!v) return;
    setStudents((current) => [...current, v]);
    setNewName("");
  }, [newName]);

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
    setStudents(list);
    setBulkMode(false);
  }, [bulkText]);

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
    setShowImport(false);
    setImportText("");
  }, [importText]);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
          first.some((c) => c.includes("ชื่อ") || c.toLowerCase().includes("name"))
        ) {
          header = first;
          start = 1;
        }
        let nameCol = 1;
        if (header) {
          const ni = header.findIndex(
            (c) => c.includes("ชื่อ") || c.toLowerCase().includes("name"),
          );
          if (ni >= 0) nameCol = ni;
        } else {
          nameCol = (aoa[0] as unknown[]).length >= 2 ? 1 : 0;
        }
        const newStudents: string[] = [];
        for (let i = start; i < aoa.length; i++) {
          const row = (aoa[i] || []) as unknown[];
          let name = String(row[nameCol] == null ? "" : row[nameCol]).trim();
          if (!name && nameCol !== 0)
            name = String(row[0] == null ? "" : row[0]).trim();
          if (!name) continue;
          newStudents.push(name);
        }
        if (!newStudents.length) {
          setImportMsg("ไม่พบรายชื่อในไฟล์ (ตรวจคอลัมน์ชื่อ)");
          return;
        }
        setStudents(newStudents);
        setShowImport(false);
        setImportMsg("");
      } catch {
        setImportMsg("อ่านไฟล์ไม่สำเร็จ — ต้องเป็น .xlsx/.xls");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const attendanceSnapshot = useCallback(() => {
    const raw = readAppLS<RawAttendanceState>(ATTENDANCE_LS);
    return attendanceSnapshotFrom(raw);
  }, []);

  const applyAttendance = useCallback(
    (id: string) => {
      const a = attendanceSnapshot();
      if (!a) {
        setPackStatus("ยังไม่มีข้อมูลจากแอปเช็กชื่อ — เปิดแอปเช็กชื่อและบันทึกก่อน");
        return;
      }
      const names = [...a.absent, ...a.leave.map((n) => n + " (ลา)")];
      patch(id, { total: String(a.total), present: String(a.present), absent: names.join("\n") });
      setPackStatus(
        "ดึงจากเช็กชื่อแล้ว: มา " +
          a.present +
          " ขาด " +
          a.absent.length +
          (a.leave.length ? " ลา " + a.leave.length : "") +
          " คน",
      );
    },
    [attendanceSnapshot, patch],
  );

  const pullAttendance = useCallback(() => {
    const cur =
      sessionsRef.current.find((x) => x.id === currentId) ||
      sessionsRef.current[sessionsRef.current.length - 1];
    if (cur) applyAttendance(cur.id);
  }, [currentId, applyAttendance]);

  const addSession = useCallback(() => {
    const iso = new Date().toISOString().slice(0, 10);
    const id = "h" + Date.now();
    const last = sessionsRef.current[sessionsRef.current.length - 1];
    const next: HomeroomSession = {
      id,
      date: iso,
      dayNote: "",
      checked: [],
      other: "",
      total: students.length ? String(students.length) : (last && last.total) || "",
      present: "",
      absent: "",
    };
    const nextSessions = [...sessionsRef.current, next];
    next.week = weekOf(iso, nextSessions);
    const planTopics = plan[next.week];
    if (Array.isArray(planTopics)) next.checked = [...planTopics];
    setSessionsSynced(nextSessions);
    setCurrentId(id);
  }, [plan, setSessionsSynced, students]);

  const addWeek = useCallback(() => {
    const cur = sessionsRef.current;
    let base: Date;
    if (cur.length) {
      const last = [...cur].map((x) => x.date).filter(Boolean).sort().pop()!;
      base = new Date(last + "T00:00:00");
      base.setDate(base.getDate() - ((base.getDay() + 6) % 7) + 7);
    } else {
      base = new Date();
      base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    }
    const exist = new Set(cur.map((x) => x.date));
    const adds: HomeroomSession[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      if (exist.has(iso)) continue;
      adds.push({
        id: "h" + Date.now() + "_" + i,
        date: iso,
        dayNote: "",
        checked: [],
        other: "",
        total:
          students.length
            ? String(students.length)
            : (cur[cur.length - 1] || ({} as HomeroomSession)).total || "",
        present: "",
        absent: "",
      });
    }
    if (!adds.length) {
      setPackStatus("สัปดาห์นั้นมีครบแล้ว");
      return;
    }
    const nextSessions = [...cur, ...adds];
    nextSessions.forEach((x) => {
      x.week = weekOf(x.date, nextSessions);
    });
    adds.forEach((x) => {
      const planTopics = plan[x.week!];
      if (Array.isArray(planTopics)) x.checked = [...planTopics];
    });
    setSessionsSynced(nextSessions);
    setCurrentId(adds[adds.length - 1].id);
    setPackStatus("เพิ่ม " + adds.length + " วันในสัปดาห์แล้ว");
  }, [plan, setSessionsSynced, students]);

  const removeSession = useCallback(
    (id: string) => {
      setSessionsSynced((cur) => {
        const nextSessions = cur.filter((x) => x.id !== id);
        setCurrentId((curId) =>
          curId === id ? (nextSessions.length ? nextSessions[nextSessions.length - 1].id : null) : curId,
        );
        return nextSessions;
      });
    },
    [setSessionsSynced],
  );

  const addTopic = useCallback(() => {
    const label = newTopic.trim();
    if (!label) return;
    setTopics((cur) => [...cur, { id: "t" + Date.now(), label }]);
    setNewTopic("");
  }, [newTopic]);

  const renameTopic = useCallback((id: string, label: string) => {
    setTopics((cur) => cur.map((x) => (x.id === id ? { ...x, label } : x)));
  }, []);

  const removeTopic = useCallback((id: string) => {
    setTopics((cur) => cur.filter((x) => x.id !== id));
  }, []);

  const resetTopics = useCallback(() => setTopics(defaultTopics()), []);

  const toggleTopicOnSession = useCallback(
    (sessId: string, topicId: string, checked: string[]) => {
      const on = checked.includes(topicId);
      patch(sessId, { checked: on ? checked.filter((x) => x !== topicId) : [...checked, topicId] });
    },
    [patch],
  );

  const togglePlanTopic = useCallback(
    (topicId: string) => {
      setPlan((cur) => {
        const list = cur[planWeek] || [];
        const on = list.includes(topicId);
        return { ...cur, [planWeek]: on ? list.filter((x) => x !== topicId) : [...list, topicId] };
      });
    },
    [planWeek],
  );

  const applyPlanToWeek = useCallback(() => {
    const planTopics = plan[planWeek] || [];
    let count = 0;
    setSessionsSynced((cur) =>
      cur.map((x) => {
        if ((x.week || 1) === planWeek) {
          count++;
          return { ...x, checked: [...planTopics] };
        }
        return x;
      }),
    );
    setPackStatus("ใช้แผนสัปดาห์ " + planWeek + " กับ " + count + " วันแล้ว");
  }, [plan, planWeek, setSessionsSynced]);

  const formMeta = useMemo(
    () => ({
      school,
      level,
      term,
      year,
      teacher,
      topics,
      sessions,
      blankRows,
      showSign,
      showPrincipal,
      principal,
      principalRole,
    }),
    [school, level, term, year, teacher, topics, sessions, blankRows, showSign, showPrincipal, principal, principalRole],
  );

  const doPrint = useCallback(() => {
    printHomeroomForm(formMeta);
  }, [formMeta]);

  const doExcel = useCallback(() => {
    const head = [
      "สัปดาห์ที่",
      "วัน/เดือน/ปี",
      "หมายเหตุวัน",
      ...topics.map((t) => t.label),
      "อื่นๆ",
      "นักเรียนทั้งหมด",
      "มา",
      "ขาด",
      "รายชื่อที่ขาด",
    ];
    const rows = [...sessions]
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((r) => [
        r.week || "",
        thaiDate(r.date),
        r.dayNote || "",
        ...topics.map((t) => ((r.checked || []).includes(t.id) ? "✓" : "")),
        r.other || "",
        r.total || "",
        r.present || "",
        absentCount(r),
        absentList(r).join(", "),
      ]);
    const line1 =
      "แบบบันทึกการเข้าร่วมกิจกรรมโฮมรูม (Homeroom)  โรงเรียน" + (school || "......................");
    const line2 =
      "ชั้น" + (level ? " " + level : "..........") + "   ภาคเรียนที่ " + (term || "") + "   ปีการศึกษา " + (year || "");
    const ws = XLSX.utils.aoa_to_sheet([[line1], [line2], [], head, ...rows]);
    ws["!cols"] = head.map((_, i) => ({ wch: i < 3 ? 16 : i === head.length - 1 ? 34 : 12 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "โฮมรูม");
    XLSX.writeFile(wb, "homeroom-" + (level || "class") + ".xlsx");
  }, [topics, sessions, school, level, term, year]);

  const printTermPack = useCallback(() => {
    const att = attendanceSnapshot();
    const sav = readAppLS<RawSavingsState>(SAVINGS_LS);
    const savSnap =
      sav && Array.isArray(sav.students) && sav.students.length
        ? {
            room: sav.room || "",
            students: sav.students,
            balances: Array.isArray(sav.balances) ? sav.balances : [],
            txns: Array.isArray(sav.txns) ? sav.txns : [],
          }
        : null;
    const ok = printHomeroomTermPack(formMeta, att, savSnap);
    setPackStatus(ok ? "เปิดหน้าพิมพ์ชุดเอกสารแล้ว" : "เบราว์เซอร์บล็อกหน้าต่างใหม่ — อนุญาต pop-up แล้วลองอีกครั้ง");
  }, [attendanceSnapshot, formMeta]);

  const cur = sessions.find((x) => x.id === currentId) || null;
  const doneCount = sessions.length;
  const weeksCount = new Set(sessions.map((x) => x.week || 1)).size;
  const usedTopics = useMemo(() => {
    const s = new Set<string>();
    sessions.forEach((x) => (x.checked || []).forEach((id) => s.add(id)));
    return s;
  }, [sessions]);
  const absentTotal = sessions.reduce((n, x) => n + absentCount(x), 0);
  const isEmpty = sessions.length === 0;
  const headerSub = [
    school || "ยังไม่ระบุโรงเรียน",
    level && "ชั้น " + level,
    "ภาคเรียนที่ " + term,
    "ปีการศึกษา " + year,
  ]
    .filter(Boolean)
    .join(" · ");

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => String(a.date).localeCompare(String(b.date))),
    [sessions],
  );

  const planWeekOptions = useMemo(
    () => Array.from({ length: Math.max(10, weeksCount + 2) }, (_, i) => i + 1),
    [weeksCount],
  );

  const topicTally = useMemo(
    () =>
      topics.map((t) => ({
        ...t,
        count: sessions.filter((x) => (x.checked || []).includes(t.id)).length,
      })),
    [topics, sessions],
  );

  const settingsCards = (
    <>
      <div className="rounded-2xl border border-[#E5E8EE] p-[18px]">
        <div className="mb-1 flex items-baseline justify-between gap-2.5">
          <h3 className="m-0 whitespace-nowrap text-[15px]">รายชื่อนักเรียนทั้งห้อง</h3>
          <span className="whitespace-nowrap text-[11.5px] text-[#A9B0BE]">{students.length} คน</span>
        </div>
        <p className="m-0 mb-3 text-xs leading-[1.5] text-[#7C8494]">
          ใช้นับจำนวนนักเรียนทั้งหมดอัตโนมัติ · รายชื่อนี้ใช้ร่วมกับแอปเช็กชื่อและออมเงิน
        </p>
        <div className="mb-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setShowImport(true);
              setImportMsg("");
              setImportText("");
            }}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-[13px] py-2 text-[12.5px] font-semibold hover:border-[#C6C9FB] hover:bg-surface-light"
          >
            📥 นำเข้า Excel
          </button>
          <span onClick={toggleBulk} className="cursor-pointer text-[12.5px] text-primary">
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
              onKeyDown={onKeyName}
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

      <div className="rounded-2xl border border-[#E5E8EE] p-[18px]">
        <h3 className="m-0 mb-1 text-[15px]">หัวแบบฟอร์ม</h3>
        <p className="m-0 mb-3.5 text-xs leading-[1.5] text-[#7C8494]">ข้อมูลนี้จะขึ้นหัวกระดาษเวลาพิมพ์</p>
        <div className="flex flex-col gap-[11px]">
          <div>
            <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">โรงเรียน</label>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="โรงเรียนบ้านหนองคูล"
              className="w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">ชั้น</label>
              <input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="ป.4/1"
                className="w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">ภาคเรียน</label>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="1"
                className="w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">ปีการศึกษา</label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2569"
                className="w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">ครูที่ปรึกษา</label>
              <input
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="ครูสมชาย"
                className="w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E8EE] p-[18px]">
        <div className="mb-1 flex items-baseline justify-between gap-2.5">
          <h3 className="m-0 whitespace-nowrap text-[15px]">หัวข้อโฮมรูมของคุณ</h3>
          <span className="whitespace-nowrap text-[11.5px] text-[#A9B0BE]">{topics.length} หัวข้อ</span>
        </div>
        <p className="m-0 mb-[13px] text-xs leading-[1.5] text-[#7C8494]">
          แก้ชื่อได้เลย · ลบที่ไม่ใช้ · เพิ่มหัวข้อของโรงเรียนเอง
        </p>
        <div className="mb-3 flex flex-col gap-[7px]">
          {topics.map((t, i) => (
            <div key={t.id} className="flex items-center gap-[7px]">
              <span className="w-4 flex-none text-right font-mono text-[11px] text-[#A9B0BE]">{i + 1}</span>
              <input
                value={t.label}
                onChange={(e) => renameTopic(t.id, e.target.value)}
                className="min-w-0 flex-1 rounded-[9px] border border-[#E5E8EE] p-[9px_11px] text-[13.5px] outline-none"
              />
              <button
                type="button"
                onClick={() => removeTopic(t.id)}
                title="ลบหัวข้อ"
                className="h-8 w-8 flex-none rounded-[9px] border border-[#E5E8EE] bg-white text-[13px] text-[#A9B0BE] hover:border-[#F8C9C9] hover:text-[#D93B3B]"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTopic();
            }}
            placeholder="เพิ่มหัวข้อใหม่…"
            className="min-w-0 flex-1 rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-[13.5px] outline-none"
          />
          <button
            type="button"
            onClick={addTopic}
            className="whitespace-nowrap rounded-[10px] bg-[#1A1D26] px-3.5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#2A2E3A]"
          >
            เพิ่ม
          </button>
        </div>
        <button
          type="button"
          onClick={resetTopics}
          className="mt-2.5 w-full rounded-[10px] border border-dashed border-[#D3D8E1] bg-white p-[9px] text-[12.5px] font-semibold text-[#5A6273] hover:bg-surface-light"
        >
          คืนค่าชุดหัวข้อคุณลักษณะอันพึงประสงค์ 8 ข้อ
        </button>
      </div>

      <div className="rounded-2xl border border-[#E5E8EE] p-[18px]">
        <div className="mb-1 flex items-baseline justify-between gap-2.5">
          <h3 className="m-0 whitespace-nowrap text-[15px]">แผนหัวข้อรายสัปดาห์</h3>
          <span className="whitespace-nowrap text-[11.5px] text-[#A9B0BE]">วางล่วงหน้าได้</span>
        </div>
        <p className="m-0 mb-3 text-xs leading-[1.5] text-[#7C8494]">
          ล็อกหัวข้อของสัปดาห์ไว้ วันที่เพิ่มใหม่ในสัปดาห์นั้นจะติ๊กให้เอง
        </p>
        <div className="mb-3 flex flex-wrap gap-[7px]">
          {planWeekOptions.map((w) => {
            const active = w === planWeek;
            const hasPlan = (plan[w] || []).length > 0;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setPlanWeek(w)}
                style={{
                  background: active ? "#5C5EE6" : hasPlan ? "#E1E3FD" : "#fff",
                  color: active ? "#fff" : hasPlan ? "#3D38B4" : "#5A6273",
                  borderColor: active ? "#5C5EE6" : "#E5E8EE",
                }}
                className="min-w-[34px] whitespace-nowrap rounded-[9px] border p-[6px_9px] text-[12.5px] font-semibold"
              >
                {w}
              </button>
            );
          })}
        </div>
        <div className="mb-2.5 flex flex-col gap-0.5">
          {topics.map((t) => {
            const on = (plan[planWeek] || []).includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => togglePlanTopic(t.id)}
                style={{ background: on ? "#E1E3FD" : "transparent" }}
                className="flex min-w-0 w-full items-center gap-2.5 rounded-lg p-[7px_8px] text-left text-[12.5px]"
              >
                <span
                  style={{
                    border: `1.5px solid ${on ? "#5C5EE6" : "#C6CAD3"}`,
                    background: on ? "#5C5EE6" : "#fff",
                  }}
                  className="flex h-[17px] w-[17px] flex-none items-center justify-center rounded-[5px] text-[11px] text-white"
                >
                  {on ? "✓" : ""}
                </span>
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={applyPlanToWeek}
          className="w-full whitespace-nowrap rounded-[10px] border border-[#C6C9FB] bg-[#EFF0FE] p-[9px] text-[12.5px] font-semibold text-[#3D38B4] hover:bg-[#E1E3FD]"
        >
          ใช้แผนนี้กับวันที่บันทึกไว้แล้ว
        </button>
      </div>

      <div className="rounded-2xl border border-[#E5E8EE] p-[18px]">
        <h3 className="m-0 mb-3 text-[15px]">ตัวเลือกการพิมพ์</h3>
        <div className="flex flex-col gap-[9px]">
          <button
            type="button"
            onClick={() => setShowSign((v) => !v)}
            style={{ background: showSign ? "#E1E3FD" : "#fff" }}
            className="flex min-w-0 w-full items-center gap-2.5 rounded-[11px] border border-[#E5E8EE] p-2.5 text-left text-[13.5px]"
          >
            <span
              style={{
                border: `1.5px solid ${showSign ? "#5C5EE6" : "#C6CAD3"}`,
                background: showSign ? "#5C5EE6" : "#fff",
              }}
              className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-xs text-white"
            >
              {showSign ? "✓" : ""}
            </span>
            <span className="min-w-0">ใส่ช่องลงชื่อครูที่ปรึกษา</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrincipal((v) => !v)}
            style={{ background: showPrincipal ? "#E1E3FD" : "#fff" }}
            className="flex min-w-0 w-full items-center gap-2.5 rounded-[11px] border border-[#E5E8EE] p-2.5 text-left text-[13.5px]"
          >
            <span
              style={{
                border: `1.5px solid ${showPrincipal ? "#5C5EE6" : "#C6CAD3"}`,
                background: showPrincipal ? "#5C5EE6" : "#fff",
              }}
              className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-xs text-white"
            >
              {showPrincipal ? "✓" : ""}
            </span>
            <span className="min-w-0">ใส่ช่องลงชื่อผู้บริหาร</span>
          </button>
          {showPrincipal && (
            <div>
              <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">
                ชื่อผู้บริหาร / ตำแหน่ง
              </label>
              <input
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="นายสมศักดิ์ ดีเลิศ"
                className="mb-2 w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
              />
              <input
                value={principalRole}
                onChange={(e) => setPrincipalRole(e.target.value)}
                placeholder="ผู้อำนวยการโรงเรียน"
                className="w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
              />
            </div>
          )}
          <div>
            <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">
              แถวเปล่าท้ายตาราง (ไว้เขียนมือ)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={blankRows}
              onChange={(e) => setBlankRows(Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))}
              className="w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
            />
          </div>
        </div>
        <p className="mt-3 text-[11.5px] leading-[1.55] text-[#A9B0BE]">
          แบบฟอร์มพิมพ์เป็น A4 ตั้ง 1 สัปดาห์ต่อกลุ่มแถว เหมือนแบบบันทึกที่ส่งฝ่ายวิชาการ
        </p>
      </div>

      <div
        className="rounded-2xl border border-[#C6C9FB] p-[18px]"
        style={{ background: "linear-gradient(160deg,#EFF0FE,#fff)" }}
      >
        <h3 className="m-0 mb-1.5 text-[15px]">ส่งออกเอกสารสิ้นเทอม</h3>
        <p className="m-0 mb-[13px] text-xs leading-[1.55] text-[#5A6273]">
          รวมบันทึกโฮมรูม + สรุปการมาเรียน + สรุปเงินออม เป็นชุดเดียว พิมพ์ทีเดียวจบ
        </p>
        <button
          type="button"
          onClick={printTermPack}
          className="w-full whitespace-nowrap rounded-[11px] bg-[#5C5EE6] p-3 text-[13.5px] font-semibold text-white hover:bg-[#4A46D6]"
        >
          🗂 พิมพ์ชุดเอกสารสิ้นเทอม
        </button>
        <div className="mt-2.5 text-[11.5px] leading-[1.55] text-[#7C8494]">
          {packStatus || "ต้องมีข้อมูลในแอปเช็กชื่อ/ออมเงินก่อน ระบบจะดึงมาเองตอนพิมพ์"}
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white">
      <SyncStatus status={cloudStatus} />
      {offline && (
        <div className="fixed left-1/2 top-3.5 z-[99] -translate-x-1/2 rounded-pill border border-[#FDE68A] bg-[#FFFBEB] px-[18px] py-[9px] text-[13px] font-semibold text-[#92600A] shadow-[0_12px_30px_-12px_rgba(26,29,38,.35)]">
          📶 ออฟไลน์อยู่ · บันทึกไว้ในเครื่องก่อน จะซิงก์ให้เมื่อกลับมาออนไลน์
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
              อัปโหลดไฟล์ Excel (.xlsx) หรือวางรายชื่อจาก Excel/Sheets ก็ได้
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

      {/* ============ MOBILE ============ */}
      <div className="md:hidden">
        {mobileView === "settings" ? (
          <>
            <div className="mb-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-[#D3D8E1] bg-white text-[15px]"
              >
                ←
              </button>
              <div className="flex-1 text-[15px] font-bold">ตั้งค่า</div>
              <button
                type="button"
                onClick={doPrint}
                className="whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-3 py-2 text-[12.5px] font-semibold"
              >
                🖨 พิมพ์
              </button>
              <button
                type="button"
                onClick={doExcel}
                className="whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-3 py-2 text-[12.5px] font-semibold"
              >
                ⬇ Excel
              </button>
            </div>
            <div className="flex flex-col gap-[18px]">{settingsCards}</div>
          </>
        ) : (
          <>
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <div className="text-[15px] font-bold">โฮมรูม</div>
          <button
            type="button"
            onClick={() => setMobileView("settings")}
            className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-3 py-2 text-[12.5px] font-semibold hover:bg-surface-light"
          >
            ⚙️ ตั้งค่า
          </button>
        </div>
        <div className="mb-3.5 grid grid-cols-3 gap-2">
          {[
            { value: doneCount, label: "ครั้งที่บันทึก", bg: "#E1E3FD" },
            { value: weeksCount, label: "สัปดาห์", bg: "#D0FBEF" },
            { value: `${usedTopics.size}/${topics.length}`, label: "หัวข้อที่อบรม", bg: "#FFEAD5" },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg }} className="rounded-[13px] p-[11px_12px]">
              <div className="text-xl font-bold leading-[1.1]">{s.value}</div>
              <div className="whitespace-nowrap text-[11px] text-[#5A6273]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-3.5 flex gap-2">
          <button
            type="button"
            onClick={addSession}
            className="flex-1 whitespace-nowrap rounded-[11px] bg-[#5C5EE6] p-3 text-[13.5px] font-semibold text-white hover:bg-[#4A46D6]"
          >
            + บันทึกวันนี้
          </button>
          <button
            type="button"
            onClick={addWeek}
            className="whitespace-nowrap rounded-[11px] border border-[#D3D8E1] bg-white p-[12px_13px] text-[13.5px] font-semibold hover:bg-surface-light"
          >
            + จ–ศ
          </button>
          <button
            type="button"
            onClick={doPrint}
            className="whitespace-nowrap rounded-[11px] border border-[#D3D8E1] bg-white p-[12px_13px] text-[13.5px] font-semibold hover:bg-surface-light"
          >
            🖨
          </button>
        </div>

        {cur && (
          <div className="mb-4 rounded-2xl border border-[#C6C9FB] bg-surface-light p-3.5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-[13.5px] font-bold">
                สัปดาห์ที่ {cur.week || 1} · {thaiDate(cur.date)}
              </div>
              <button
                type="button"
                onClick={() => removeSession(cur.id)}
                className="whitespace-nowrap rounded-lg border border-[#F8C9C9] bg-white px-2.5 py-[5px] text-[11.5px] font-semibold text-[#D93B3B]"
              >
                ลบ
              </button>
            </div>
            <label className="mb-[5px] block text-[11.5px] font-semibold text-[#5A6273]">วันที่</label>
            <input
              type="date"
              value={cur.date}
              onChange={(e) => patch(cur.id, { date: e.target.value, week: weekOf(e.target.value, sessions) })}
              className="mb-[11px] w-full rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-sm outline-none"
            />
            <label className="mb-1.5 block text-[11.5px] font-semibold text-[#5A6273]">เรื่อง/รายการที่อบรม</label>
            <div className="mb-[11px] flex flex-col gap-0.5">
              {topics.map((t) => {
                const on = (cur.checked || []).includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopicOnSession(cur.id, t.id, cur.checked || [])}
                    style={{ background: on ? "#E1E3FD" : "transparent" }}
                    className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-[13px]"
                  >
                    <span
                      style={{
                        border: `1.5px solid ${on ? "#5C5EE6" : "#C6CAD3"}`,
                        background: on ? "#5C5EE6" : "#fff",
                      }}
                      className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-xs text-white"
                    >
                      {on ? "✓" : ""}
                    </span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mb-[11px] grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#5A6273]">ทั้งหมด</label>
                <input
                  type="number"
                  value={cur.total}
                  onChange={(e) => patch(cur.id, { total: e.target.value })}
                  className="w-full rounded-[10px] border border-[#D3D8E1] p-[9px_10px] text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#5A6273]">มา</label>
                <input
                  type="number"
                  value={cur.present}
                  onChange={(e) => patch(cur.id, { present: e.target.value })}
                  className="w-full rounded-[10px] border border-[#D3D8E1] p-[9px_10px] text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#5A6273]">ขาด</label>
                <div className="rounded-[10px] border border-[#E5E8EE] bg-[#F1F3F6] p-[9px_10px] text-center text-sm font-bold">
                  {absentCount(cur)}
                </div>
              </div>
            </div>
            <div className="mb-[5px] flex items-center justify-between gap-2">
              <label className="text-[11.5px] font-semibold text-[#5A6273]">รายชื่อนักเรียนที่ขาด</label>
              <button
                type="button"
                onClick={() => applyAttendance(cur.id)}
                className="whitespace-nowrap rounded-lg border border-[#A7F0DF] bg-[#D0FBEF] px-2.5 py-[5px] text-[11px] font-semibold text-[#0A6B5C]"
              >
                ✅ ดึงจากเช็กชื่อ
              </button>
            </div>
            <textarea
              value={cur.absent}
              onChange={(e) => patch(cur.id, { absent: e.target.value })}
              rows={2}
              placeholder="คนละบรรทัด หรือคั่นด้วยจุลภาค"
              className="w-full resize-y rounded-[10px] border border-[#D3D8E1] p-[10px_12px] text-[13.5px] outline-none"
            />
          </div>
        )}

        <div className="mb-2.5 text-[13.5px] font-bold">รายการที่บันทึกไว้</div>
        {isEmpty ? (
          <div className="rounded-[13px] border-[1.5px] border-dashed border-[#D3D8E1] bg-surface-light p-[26px_18px] text-center">
            <div className="mb-2.5 text-3xl">📋</div>
            <div className="text-[13.5px] font-bold">ยังไม่มีบันทึกโฮมรูม</div>
            <div className="mt-[5px] text-xs leading-[1.6] text-[#7C8494]">
              กด &quot;+ เพิ่มรายการ&quot; เพื่อเริ่มบันทึก
              <br />
              ครั้งแรกของสัปดาห์นี้
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedSessions.map((s) => {
              const n = (s.checked || []).length;
              const active = s.id === currentId;
              const summary = n
                ? topics.filter((t) => (s.checked || []).includes(t.id)).map((t) => t.label).join(", ")
                : s.other || "ยังไม่เลือกหัวข้อ";
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentId(s.id)}
                  style={{ background: active ? "#F8F9FF" : "#fff", borderColor: active ? "#C6C9FB" : "#E5E8EE" }}
                  className="flex w-full items-center gap-2.5 rounded-[13px] border p-[11px] text-left"
                >
                  <div className="flex h-[34px] w-[34px] flex-none flex-col items-center justify-center rounded-lg bg-[#E1E3FD] text-[13px] font-bold leading-none">
                    {s.week || 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="whitespace-nowrap text-[13.5px] font-semibold">
                      {thaiDate(s.date) || "ยังไม่เลือกวัน"}
                    </div>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-[#7C8494]">
                      {summary}
                    </div>
                  </div>
                  <span
                    style={{ color: n ? "#0A6B5C" : "#A9B0BE", background: n ? "#D0FBEF" : "#F1F3F6" }}
                    className="flex-none whitespace-nowrap rounded-pill px-2 py-1 text-[11px] font-semibold"
                  >
                    {n} หัวข้อ
                  </span>
                </button>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>

      {/* ============ DESKTOP ============ */}
      <div className="mb-3.5 hidden items-center justify-between gap-2 md:flex">
        <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-[#A9B0BE]">
          {headerSub}
        </div>
        <div className="flex flex-none gap-2">
          <button
            type="button"
            onClick={doPrint}
            className="whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-4 py-2.5 text-[13.5px] font-semibold hover:bg-surface-light"
          >
            🖨 พิมพ์ / บันทึก PDF
          </button>
          <button
            type="button"
            onClick={doExcel}
            className="whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-4 py-2.5 text-[13.5px] font-semibold hover:bg-surface-light"
          >
            ⬇ Excel
          </button>
        </div>
      </div>
      <div className="hidden md:grid md:grid-cols-[296px_minmax(0,1fr)] md:items-start md:gap-5">
        <div className="flex flex-col gap-[18px]">
          {settingsCards}
        </div>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: doneCount, label: "ครั้งที่บันทึก", bg: "#E1E3FD" },
              { value: weeksCount, label: "สัปดาห์", bg: "#D0FBEF" },
              { value: `${usedTopics.size}/${topics.length}`, label: "หัวข้อที่อบรมแล้ว", bg: "#FFEAD5" },
              { value: absentTotal, label: "ยอดขาดรวม (คน-ครั้ง)", bg: "#F1F3F6" },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg }} className="rounded-[14px] p-[14px_16px]">
                <div className="text-[26px] font-bold leading-[1.1]">{s.value}</div>
                <div className="whitespace-nowrap text-xs text-[#5A6273]">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E8EE]">
            <div className="flex items-center gap-3 border-b border-[#E5E8EE] bg-surface-light p-[14px_18px]">
              <h3 className="m-0 flex-1 whitespace-nowrap text-[15px]">รายการบันทึกโฮมรูม</h3>
              <button
                type="button"
                onClick={pullAttendance}
                className="whitespace-nowrap rounded-lg border border-[#A7F0DF] bg-[#D0FBEF] px-[13px] py-2 text-[12.5px] font-semibold text-[#0A6B5C] hover:bg-[#BEF7E8]"
              >
                ✅ ดึงคนขาดจากเช็กชื่อ
              </button>
              <button
                type="button"
                onClick={addWeek}
                className="whitespace-nowrap rounded-lg border border-[#D3D8E1] bg-white px-[13px] py-2 text-[12.5px] font-semibold hover:bg-surface-light"
              >
                + เพิ่มทั้งสัปดาห์ (จ–ศ)
              </button>
              <button
                type="button"
                onClick={addSession}
                className="whitespace-nowrap rounded-lg bg-[#5C5EE6] px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-[#4A46D6]"
              >
                + เพิ่มวัน
              </button>
            </div>

            <div className="grid grid-cols-[62px_128px_minmax(0,1fr)_186px] border-b border-[#E5E8EE] bg-[#FDF6E8] text-xs font-semibold text-[#5A6273]">
              <div className="whitespace-nowrap border-r border-[#E5E8EE] p-[10px_8px]">สัปดาห์</div>
              <div className="whitespace-nowrap border-r border-[#E5E8EE] p-[10px_12px]">วัน/เดือน/ปี</div>
              <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap border-r border-[#E5E8EE] p-[10px_12px]">
                เรื่อง/รายการที่อบรม
              </div>
              <div className="whitespace-nowrap p-[10px_12px]">หมายเหตุ</div>
            </div>

            {sortedSessions.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[62px_128px_minmax(0,1fr)_186px] border-b border-[#F1F3F6]"
              >
                <div className="flex min-w-0 flex-col items-center gap-1.5 border-r border-[#F1F3F6] p-[12px_7px]">
                  <input
                    type="number"
                    min={1}
                    value={s.week || 1}
                    onChange={(e) => patch(s.id, { week: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-lg border border-[#E5E8EE] p-[7px_4px] text-center text-[13.5px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSession(s.id)}
                    className="whitespace-nowrap rounded-lg border border-[#F1F3F6] bg-white px-2 py-1 text-[11px] font-semibold text-[#A9B0BE] hover:border-[#F8C9C9] hover:text-[#D93B3B]"
                  >
                    ลบ
                  </button>
                </div>
                <div className="min-w-0 border-r border-[#F1F3F6] p-[12px_9px]">
                  <input
                    type="date"
                    value={s.date}
                    onChange={(e) => patch(s.id, { date: e.target.value, week: weekOf(e.target.value, sessions) })}
                    className="mb-[7px] w-full rounded-lg border border-[#E5E8EE] p-[8px_9px] text-[13px] outline-none"
                  />
                  <input
                    value={s.dayNote}
                    onChange={(e) => patch(s.id, { dayNote: e.target.value })}
                    placeholder="(วันพืชมงคล)"
                    className="w-full rounded-lg border border-[#E5E8EE] p-[7px_9px] text-[12.5px] outline-none"
                  />
                  <div className="mt-1.5 text-center text-[11.5px] text-[#A9B0BE]">
                    {thaiDate(s.date)}
                  </div>
                </div>
                <div className="min-w-0 border-r border-[#F1F3F6] p-[12px_10px]">
                  <div className="grid min-w-0 grid-cols-2 gap-0.5">
                    {topics.map((t) => {
                      const on = (s.checked || []).includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTopicOnSession(s.id, t.id, s.checked || [])}
                          style={{ background: on ? "#E1E3FD" : "transparent" }}
                          className="flex min-w-0 w-full items-center gap-2 overflow-hidden rounded-lg p-[6px_7px] text-left text-[12.5px]"
                        >
                          <span
                            style={{
                              border: `1.5px solid ${on ? "#5C5EE6" : "#C6CAD3"}`,
                              background: on ? "#5C5EE6" : "#fff",
                            }}
                            className="flex h-4 w-4 flex-none items-center justify-center rounded-[4px] text-[11px] text-white"
                          >
                            {on ? "✓" : ""}
                          </span>
                          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={s.other}
                    onChange={(e) => patch(s.id, { other: e.target.value })}
                    placeholder="อื่นๆ …"
                    className="mt-[7px] w-full rounded-lg border border-dashed border-[#D3D8E1] p-[7px_9px] text-[12.5px] outline-none"
                  />
                </div>
                <div className="min-w-0 p-[12px_10px]">
                  <div className="mb-[7px] grid grid-cols-2 gap-[7px]">
                    <div>
                      <label className="mb-[3px] block text-[10.5px] font-semibold text-[#A9B0BE]">ทั้งหมด</label>
                      <input
                        type="number"
                        value={s.total}
                        onChange={(e) => patch(s.id, { total: e.target.value })}
                        className="w-full rounded-lg border border-[#E5E8EE] p-[7px_8px] text-[13px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-[3px] block text-[10.5px] font-semibold text-[#A9B0BE]">มา</label>
                      <input
                        type="number"
                        value={s.present}
                        onChange={(e) => patch(s.id, { present: e.target.value })}
                        className="w-full rounded-lg border border-[#E5E8EE] p-[7px_8px] text-[13px] outline-none"
                      />
                    </div>
                  </div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span
                      style={{ color: absentCount(s) ? "#C2500B" : "#A9B0BE" }}
                      className="whitespace-nowrap text-xs font-semibold"
                    >
                      ขาด {absentCount(s)} คน
                    </span>
                    <button
                      type="button"
                      onClick={() => applyAttendance(s.id)}
                      title="ดึงรายชื่อคนขาดจากแอปเช็กชื่อ"
                      className="whitespace-nowrap rounded-lg border border-[#A7F0DF] bg-[#D0FBEF] px-2 py-1 text-[11px] font-semibold text-[#0A6B5C]"
                    >
                      ✅ ดึงคนขาด
                    </button>
                  </div>
                  <textarea
                    value={s.absent}
                    onChange={(e) => patch(s.id, { absent: e.target.value })}
                    rows={2}
                    placeholder="รายชื่อนักเรียนที่ขาด"
                    className="w-full resize-y rounded-lg border border-[#E5E8EE] p-[8px_9px] text-[12.5px] outline-none"
                  />
                </div>
              </div>
            ))}

            {isEmpty && (
              <div className="p-[44px_24px] text-center">
                <div className="mb-2.5 text-[34px]">📋</div>
                <div className="mb-[5px] text-[15px] font-semibold">ยังไม่มีบันทึกโฮมรูม</div>
                <p className="m-0 mb-4 text-[13px] leading-[1.6] text-[#7C8494]">
                  กด &quot;เพิ่มวันบันทึก&quot; เพื่อเริ่มวันแรก ระบบจะนับสัปดาห์ให้อัตโนมัติ
                  <br />
                  หรือพิมพ์แบบฟอร์มเปล่าไปเขียนมือก่อนก็ได้
                </p>
                <button
                  type="button"
                  onClick={addSession}
                  className="whitespace-nowrap rounded-[11px] bg-[#5C5EE6] px-[22px] py-3 text-[13.5px] font-semibold text-white hover:bg-[#4A46D6]"
                >
                  + เพิ่มวันบันทึก
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5E8EE] bg-surface-light p-[18px]">
            <h3 className="m-0 mb-2.5 text-[15px]">สรุปหัวข้อที่อบรมไปแล้ว</h3>
            <div className="flex flex-wrap gap-2">
              {topicTally.map((t) => (
                <span
                  key={t.id}
                  style={{
                    background: t.count ? "#D0FBEF" : "#fff",
                    color: t.count ? "#0A6B5C" : "#A9B0BE",
                    borderColor: t.count ? "#A7F0DF" : "#E5E8EE",
                  }}
                  className="whitespace-nowrap rounded-pill border p-[7px_12px] text-[12.5px] font-medium"
                >
                  {t.label} · {t.count}
                </span>
              ))}
            </div>
            <p className="m-0 mt-3 text-[11.5px] leading-[1.55] text-[#A9B0BE]">
              ใช้เช็กว่าคุณลักษณะอันพึงประสงค์ครบทุกข้อในภาคเรียนนี้หรือยัง
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
