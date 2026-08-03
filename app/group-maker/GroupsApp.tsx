"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import ToolFullscreenFrame from "@/components/ToolFullscreenFrame";

const ROSTER_KEY = "khuncool.roster";

const SAMPLE_NAMES = [
  "น้องปลา",
  "น้องบอล",
  "น้องมิ้นท์",
  "น้องเก่ง",
  "น้องแอน",
  "น้องต้น",
  "น้องพลอย",
  "น้องเจมส์",
  "น้องฟ้า",
  "น้องกานต์",
  "น้องอาร์ม",
  "น้องแพร",
];

const PALETTE = [
  "#5C5EE6",
  "#14B79A",
  "#F97316",
  "#3D38B4",
  "#0A9380",
  "#C2500B",
  "#8B7BF0",
  "#22B8A0",
];

type Group = {
  name: string;
  color: string;
  members: string[];
  countLabel: string;
};

function loadInitialNames(): string[] {
  if (typeof window === "undefined") return SAMPLE_NAMES;
  try {
    const saved = JSON.parse(window.localStorage.getItem(ROSTER_KEY) || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    /* ignore */
  }
  return [...SAMPLE_NAMES];
}

export default function GroupsApp() {
  useTrackToolUse("group-maker");
  const [names, setNames] = useState<string[]>(SAMPLE_NAMES);
  const [hydrated, setHydrated] = useState(false);
  const [newName, setNewName] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [mode, setMode] = useState<"byGroups" | "bySize">("byGroups");
  const [groupCount, setGroupCount] = useState(3);
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);

  const acRef = useRef<AudioContext | null>(null);

  // Load persisted roster on mount.
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      setNames(loadInitialNames());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  // Persist to the shared roster key on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(ROSTER_KEY, JSON.stringify(names));
    } catch {
      /* ignore */
    }
  }, [names, hydrated]);

  const ac = useCallback((): AudioContext | null => {
    if (!acRef.current) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        acRef.current = new Ctor();
      } catch {
        acRef.current = null;
      }
    }
    return acRef.current;
  }, []);

  const ping = useCallback(() => {
    const context = ac();
    if (!context) return;
    [523, 784].forEach((f, i) => {
      const o = context.createOscillator();
      const g = context.createGain();
      const t = context.currentTime + i * 0.1;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.13, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g);
      g.connect(context.destination);
      o.start(t);
      o.stop(t + 0.32);
    });
  }, [ac]);

  const divide = useCallback(() => {
    if (names.length < 2) return;
    const context = ac();
    if (context && context.state === "suspended") context.resume();

    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let k: number;
    if (mode === "byGroups") {
      k = Math.max(1, Math.min(groupCount, shuffled.length));
    } else {
      k = Math.max(1, Math.ceil(shuffled.length / Math.max(1, groupSize)));
    }

    const buckets: string[][] = Array.from({ length: k }, () => []);
    shuffled.forEach((nm, i) => buckets[i % k].push(nm));

    const newGroups: Group[] = buckets.map((members, i) => ({
      name: `กลุ่ม ${i + 1}`,
      color: PALETTE[i % PALETTE.length],
      members,
      countLabel: `${members.length} คน`,
    }));

    setGroups(newGroups);
    ping();
  }, [names, mode, groupCount, groupSize, ac, ping]);

  const setModeGroups = useCallback(() => setMode("byGroups"), []);
  const setModeSize = useCallback(() => setMode("bySize"), []);

  const inc = useCallback(() => {
    if (mode === "byGroups") setGroupCount((v) => Math.min(20, v + 1));
    else setGroupSize((v) => Math.min(20, v + 1));
  }, [mode]);

  const dec = useCallback(() => {
    if (mode === "byGroups") setGroupCount((v) => Math.max(1, v - 1));
    else setGroupSize((v) => Math.max(1, v - 1));
  }, [mode]);

  const addName = useCallback(() => {
    const v = newName.trim();
    if (!v) return;
    setNames((current) => [...current, v]);
    setNewName("");
  }, [newName]);

  const removeName = useCallback((i: number) => {
    setNames((current) => current.filter((_, idx) => idx !== i));
  }, []);

  const clearAll = useCallback(() => {
    setNames([]);
    setGroups([]);
  }, []);

  const toggleBulk = useCallback(() => {
    setBulkMode((m) => {
      if (!m) setBulkText(names.join("\n"));
      return !m;
    });
  }, [names]);

  const applyBulk = useCallback(() => {
    const list = bulkText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    setNames(list);
    setBulkMode(false);
  }, [bulkText]);

  const n = names.length;
  const stepperValue = mode === "byGroups" ? groupCount : groupSize;
  const previewText =
    mode === "byGroups"
      ? (() => {
          const k = Math.max(1, Math.min(groupCount, Math.max(1, n)));
          return `${n} คน → ${k} กลุ่ม (~${Math.ceil(n / k)} คน/กลุ่ม)`;
        })()
      : (() => {
          const k = Math.max(1, Math.ceil(n / Math.max(1, groupSize)));
          return `${n} คน → ราว ${k} กลุ่ม (${groupSize} คน/กลุ่ม)`;
        })();
  const divideDisabled = n < 2;

  return (
    <ToolFullscreenFrame title="สุ่มแบ่งกลุ่ม">
    <div className="md:grid md:grid-cols-[360px_1fr] md:items-start md:gap-9">
      {/* Left controls */}
      <div>
        <div className="mb-3.5 rounded-2xl border border-border bg-surface-light p-[15px] md:mb-4 md:rounded-[18px] md:p-5">
          <div className="mb-3.5 flex gap-2 md:mb-4 md:gap-[9px]">
            <button
              type="button"
              onClick={setModeGroups}
              className="flex-1 whitespace-nowrap rounded-[11px] border-[1.5px] px-2 py-[11px] font-sans text-[13px] font-semibold md:py-3 md:text-[13.5px]"
              style={{
                borderColor: mode === "byGroups" ? "#5C5EE6" : "#D3D8E1",
                background: mode === "byGroups" ? "#E1E3FD" : "#fff",
                color: mode === "byGroups" ? "#3D38B4" : "#7C8494",
              }}
            >
              <span className="md:hidden">กำหนดจำนวนกลุ่ม</span>
              <span className="hidden md:inline">จำนวนกลุ่ม</span>
            </button>
            <button
              type="button"
              onClick={setModeSize}
              className="flex-1 whitespace-nowrap rounded-[11px] border-[1.5px] px-2 py-[11px] font-sans text-[13px] font-semibold md:py-3 md:text-[13.5px]"
              style={{
                borderColor: mode === "bySize" ? "#5C5EE6" : "#D3D8E1",
                background: mode === "bySize" ? "#E1E3FD" : "#fff",
                color: mode === "bySize" ? "#3D38B4" : "#7C8494",
              }}
            >
              <span className="md:hidden">กำหนดคน/กลุ่ม</span>
              <span className="hidden md:inline">คน / กลุ่ม</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-semibold md:text-sm">
              {mode === "byGroups" ? "จำนวนกลุ่ม" : "จำนวนคนต่อกลุ่ม"}
            </span>
            <div className="flex items-center gap-3 md:gap-3.5">
              <button
                type="button"
                onClick={dec}
                aria-label="ลด"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#D3D8E1] bg-white text-xl text-ink hover:bg-[#F1F3F6] md:h-10 md:w-10 md:rounded-[11px] md:text-[22px]"
              >
                −
              </button>
              <span className="min-w-[32px] text-center font-mono text-[22px] font-semibold md:min-w-[38px] md:text-[26px]">
                {stepperValue}
              </span>
              <button
                type="button"
                onClick={inc}
                aria-label="เพิ่ม"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#D3D8E1] bg-white text-xl text-ink hover:bg-[#F1F3F6] md:h-10 md:w-10 md:rounded-[11px] md:text-[22px]"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-2.5 hidden text-xs text-ink-faint md:block">
            {previewText}
          </div>
        </div>

        <button
          type="button"
          onClick={divide}
          disabled={divideDisabled}
          className="mb-4 w-full rounded-[13px] border-none px-[15px] py-[15px] font-sans text-base font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed md:rounded-[14px] md:py-4 md:text-[17px]"
          style={{ background: divideDisabled ? "#B9BCC7" : "#5C5EE6" }}
        >
          🔀 สุ่มแบ่งกลุ่ม
        </button>

        {/* Mobile-only result (renders above names list on mobile per source layout) */}
        <div className="md:hidden">
          {groups.length > 0 ? (
            <div className="mb-4 flex flex-col gap-[11px]">
              {groups.map((g) => (
                <div
                  key={g.name}
                  className="animate-[pop_.3s_ease] overflow-hidden rounded-[14px] border border-border bg-white"
                >
                  <div
                    className="flex justify-between px-3.5 py-2.5 text-[13.5px] font-bold text-white"
                    style={{ background: g.color }}
                  >
                    <span>{g.name}</span>
                    <span className="font-medium opacity-85">
                      {g.countLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3.5 py-[11px]">
                    {g.members.map((m) => (
                      <span
                        key={m}
                        className="whitespace-nowrap rounded-pill bg-[#F1F3F6] px-2.5 py-[5px] text-[12.5px] font-medium text-[#434A58]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4 rounded-[14px] border-[1.5px] border-dashed border-[#D3D8E1] bg-surface-light p-[30px_20px] text-center">
              <div className="mb-2.5 text-[34px]">🧩</div>
              <div className="text-[14.5px] font-bold text-ink">
                ผลการแบ่งกลุ่มจะแสดงที่นี่
              </div>
              <div className="mt-1.5 text-xs leading-[1.65] text-ink-faint">
                ใส่รายชื่อด้านล่าง เลือกจำนวน
                <br />
                แล้วกดสุ่มแบ่งกลุ่ม
              </div>
            </div>
          )}
        </div>

        {/* Names */}
        <div className="rounded-2xl border border-border bg-surface-light p-[15px] md:rounded-[18px] md:p-5">
          <div className="mb-[11px] flex items-center justify-between md:mb-[13px]">
            <span className="text-sm font-bold md:text-[15px]">
              รายชื่อ ({n})
            </span>
            <div className="flex gap-2.5 md:gap-3">
              <button
                type="button"
                onClick={toggleBulk}
                className="cursor-pointer border-none bg-transparent p-0 text-xs text-primary md:text-[12.5px]"
              >
                {bulkMode ? "✎ ทีละชื่อ" : "✎ วางหลายชื่อ"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer border-none bg-transparent p-0 text-xs text-error-strong md:text-[12.5px]"
              >
                ล้าง
              </button>
            </div>
          </div>

          {bulkMode ? (
            <div>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="วางรายชื่อ ทีละบรรทัด…"
                className="h-[120px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 font-sans text-[13px] outline-none focus:border-primary md:h-[150px] md:text-[13.5px]"
              />
              <button
                type="button"
                onClick={applyBulk}
                className="mt-2 w-full whitespace-nowrap rounded-[10px] border-none bg-primary px-2 py-2.5 font-sans text-[13.5px] font-semibold text-white hover:bg-primary-hover md:mt-[9px] md:text-sm"
              >
                ใช้รายชื่อนี้
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex gap-2 md:mb-3.5">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addName();
                  }}
                  placeholder="เพิ่มชื่อ… กด Enter"
                  className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 font-sans text-[13.5px] outline-none focus:border-primary md:text-sm"
                />
                <button
                  type="button"
                  onClick={addName}
                  className="flex-none whitespace-nowrap rounded-[10px] border-none bg-primary px-[15px] py-2.5 font-sans text-[13.5px] font-semibold text-white hover:bg-primary-hover md:px-[18px] md:text-sm"
                >
                  เพิ่ม
                </button>
              </div>
              <div className="flex flex-wrap gap-[7px] md:max-h-[200px] md:gap-2 md:overflow-y-auto">
                {names.map((nm, i) => (
                  <span
                    key={`${nm}-${i}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-border bg-white py-1.5 pl-[11px] pr-2 text-xs font-medium md:py-[7px] md:pl-3 md:pr-[9px] md:text-[13px]"
                  >
                    {nm}
                    <button
                      type="button"
                      onClick={() => removeName(i)}
                      aria-label={`ลบ ${nm}`}
                      className="cursor-pointer border-none bg-transparent p-0 text-sm leading-none text-ink-faint hover:text-error-strong md:text-[15px]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right result (desktop only, mirrors mobile block above) */}
      <div className="hidden md:block">
        {groups.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {groups.map((g) => (
              <div
                key={g.name}
                className="animate-[pop_.3s_ease] overflow-hidden rounded-2xl border border-border bg-white"
              >
                <div
                  className="flex justify-between px-4 py-3 text-[15px] font-bold text-white"
                  style={{ background: g.color }}
                >
                  <span>{g.name}</span>
                  <span className="text-[13px] font-medium opacity-85">
                    {g.countLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-[7px] px-4 py-3.5">
                  {g.members.map((m) => (
                    <span
                      key={m}
                      className="whitespace-nowrap rounded-pill bg-[#F1F3F6] px-[11px] py-1.5 text-[13px] font-medium text-[#434A58]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[420px] flex-col items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-[#D3D8E1] bg-surface-light p-6 text-center text-ink-faint">
            <div className="mb-3 text-[44px]">🧩</div>
            <div className="text-[15px] font-semibold text-ink-secondary">
              ผลการแบ่งกลุ่มจะแสดงที่นี่
            </div>
            <div className="mt-1.5 text-[13px]">
              ใส่รายชื่อ เลือกจำนวน แล้วกดสุ่มแบ่งกลุ่ม
            </div>
          </div>
        )}
      </div>
    </div>
    </ToolFullscreenFrame>
  );
}
