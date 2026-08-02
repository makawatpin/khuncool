"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";

const LS_KEY = "khuncool.scoreboard";
const ROSTER_KEY = "khuncool.roster";
const COLORS = [
  "#5C5EE6",
  "#14B79A",
  "#F97316",
  "#3D38B4",
  "#0A9380",
  "#C2500B",
  "#8B7BF0",
  "#22B8A0",
];
const STEPS = [1, 2, 5];

type Team = { id: number; name: string; score: number };

type Persisted = { teams: Team[]; title: string; step: number };

const DEFAULT_TEAMS: Team[] = [
  { id: 1, name: "กลุ่มที่ 1", score: 0 },
  { id: 2, name: "กลุ่มที่ 2", score: 0 },
  { id: 3, name: "กลุ่มที่ 3", score: 0 },
  { id: 4, name: "กลุ่มที่ 4", score: 0 },
];

export default function ScoreboardApp() {
  useTrackToolUse("scoreboard");
  const [title, setTitle] = useState("แข่งตอบคำถามประจำสัปดาห์");
  const [step, setStep] = useState(1);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [offline, setOffline] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const nextIdRef = useRef(5);
  const frameRef = useRef<HTMLDivElement | null>(null);

  // Load persisted state on mount.
  useEffect(() => {
    try {
      const d: Persisted | null = JSON.parse(
        window.localStorage.getItem(LS_KEY) || "null",
      );
      if (d && Array.isArray(d.teams)) {
        nextIdRef.current =
          d.teams.reduce((m, t) => Math.max(m, t.id || 0), 0) + 1;
        setTeams(d.teams);
        if (d.title) setTitle(d.title);
        if (d.step) setStep(d.step);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);

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
        LS_KEY,
        JSON.stringify({ teams, title, step, savedAt: Date.now() }),
      );
    } catch {
      /* ignore */
    }
  }, [teams, title, step, hydrated]);

  const onTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const bump = useCallback((id: number, d: number) => {
    setTeams((current) =>
      current.map((t) => (t.id === id ? { ...t, score: t.score + d } : t)),
    );
  }, []);

  const rename = useCallback(
    (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setTeams((current) =>
        current.map((t) => (t.id === id ? { ...t, name: v } : t)),
      );
    },
    [],
  );

  const remove = useCallback((id: number) => {
    setTeams((current) => current.filter((t) => t.id !== id));
  }, []);

  const addTeam = useCallback(() => {
    setTeams((current) => {
      const n = current.length + 1;
      const team: Team = {
        id: nextIdRef.current++,
        name: `กลุ่มที่ ${n}`,
        score: 0,
      };
      return [...current, team];
    });
  }, []);

  const resetScores = useCallback(() => {
    setTeams((current) => current.map((t) => ({ ...t, score: 0 })));
  }, []);

  const importRoster = useCallback(() => {
    let r: unknown = null;
    try {
      r = JSON.parse(window.localStorage.getItem(ROSTER_KEY) || "null");
    } catch {
      /* ignore */
    }
    if (!Array.isArray(r) || !r.length) return;
    setTeams(
      (r as string[]).slice(0, 12).map((name) => ({
        id: nextIdRef.current++,
        name,
        score: 0,
      })),
    );
  }, []);

  const toggleFull = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const top = sorted.length ? sorted[0].score : 0;
  const tied = sorted.filter((t) => t.score === top);
  const rankOf = (t: Team) => sorted.findIndex((x) => x.id === t.id) + 1;

  const leaderIcon = top > 0 ? "🥇" : "⏳";
  const leaderName =
    top <= 0
      ? "ยังไม่มีใครได้แต้ม"
      : tied.length > 1
        ? `เสมอกัน ${tied.length} ทีม`
        : tied[0].name;
  const leaderSub =
    top <= 0
      ? "กด + เพื่อเริ่มให้คะแนน"
      : `${top} แต้ม · จาก ${teams.length} ทีม`;

  const showEmpty = teams.length === 0;

  return (
    <div ref={frameRef} className="bg-white">
      {offline && (
        <div className="fixed left-1/2 top-3.5 z-[99] -translate-x-1/2 rounded-pill border border-[#FDE68A] bg-[#FFFBEB] px-[18px] py-[9px] text-[13px] font-semibold text-[#92600A] shadow-[0_12px_30px_-12px_rgba(26,29,38,.35)]">
          📶 ออฟไลน์อยู่ · บันทึกไว้ในเครื่องก่อน จะซิงก์ให้เมื่อกลับมาออนไลน์
        </div>
      )}

      {/* Title + step selector + import */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-[18px] md:gap-3">
        <input
          value={title}
          onChange={onTitle}
          placeholder="ชื่อกิจกรรม เช่น แข่งตอบคำถามบทที่ 3"
          className="min-w-0 flex-1 rounded-[11px] border border-border bg-surface-light px-3 py-2.5 font-sans text-sm font-semibold outline-none focus:border-primary md:min-w-[260px] md:rounded-xl md:px-3.5 md:py-[11px] md:text-xl md:font-anuphan md:font-bold"
        />
        <div className="flex flex-none items-center gap-1.5 rounded-[11px] border border-border bg-white px-2.5 py-1.5 md:gap-2 md:rounded-xl md:px-3 md:py-[7px]">
          <span className="whitespace-nowrap text-[11.5px] text-ink-faint md:text-[12.5px]">
            <span className="md:hidden">แต้ม/ครั้ง</span>
            <span className="hidden md:inline">แต้มต่อครั้ง</span>
          </span>
          {STEPS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStep(n)}
              className="whitespace-nowrap rounded-lg border px-2 py-[5px] font-sans text-[12.5px] font-bold md:px-3.5 md:py-2 md:text-sm"
              style={{
                borderColor: step === n ? "#5C5EE6" : "#E5E8EE",
                background: step === n ? "#5C5EE6" : "#fff",
                color: step === n ? "#fff" : "#5A6273",
              }}
            >
              +{n}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={importRoster}
          className="hidden flex-none whitespace-nowrap rounded-[11px] border border-[#A7F0DF] bg-[#D0FBEF] px-4 py-2.5 font-sans text-[13.5px] font-semibold text-[#0A6B5C] hover:brightness-[.98] md:inline-block"
        >
          👥 ดึงรายชื่อจากห้องเรียน
        </button>
      </div>

      {showEmpty ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[#D3D8E1] bg-surface-light p-8 text-center md:rounded-[20px] md:p-[70px_24px]">
          <div className="mx-auto mb-3 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#E1E3FD] text-[26px] md:mb-3.5 md:h-16 md:w-16 md:rounded-[18px] md:text-[32px]">
            🏆
          </div>
          <div className="text-[15px] font-bold md:text-[19px]">
            <span className="md:hidden">ยังไม่มีทีม</span>
            <span className="hidden md:inline">ยังไม่มีทีมบนกระดาน</span>
          </div>
          <div className="mt-1.5 text-xs leading-[1.65] text-ink-faint md:mt-[7px] md:text-sm md:leading-[1.7]">
            <span className="md:hidden">
              เพิ่มทีมเอง หรือดึงกลุ่มที่สุ่มไว้
              <br />
              จากเครื่องมือสุ่มแบ่งกลุ่ม
            </span>
            <span className="hidden md:inline">
              เพิ่มทีมเอง หรือดึงรายชื่อห้องที่บันทึกไว้ในเครื่องมืออื่นของคุณคูล
              <br />
              สุ่มแบ่งกลุ่มก่อนแล้วค่อยมาให้คะแนนก็ได้
            </span>
          </div>
          <div className="mt-3.5 flex flex-col gap-2 md:mt-[18px] md:flex-row md:flex-wrap md:justify-center md:gap-2.5">
            <button
              type="button"
              onClick={addTeam}
              className="rounded-[11px] border-none bg-primary px-3 py-3 font-sans text-sm font-bold text-white hover:bg-primary-hover md:rounded-xl md:px-[26px] md:py-[13px] md:text-[14.5px]"
            >
              + เพิ่มทีม
            </button>
            <button
              type="button"
              onClick={importRoster}
              className="rounded-[11px] border border-border bg-white px-3 py-[11px] font-sans text-[13.5px] font-semibold hover:bg-surface-light md:hidden"
            >
              👥 ดึงรายชื่อจากห้องเรียน
            </button>
            <a
              href="/group-maker"
              className="hidden rounded-xl border border-border bg-white px-[26px] py-[13px] font-sans text-[14.5px] font-semibold text-ink md:inline-block"
            >
              🔀 ไปสุ่มแบ่งกลุ่มก่อน
            </a>
          </div>
        </div>
      ) : (
        <div>
          {/* Mobile team list */}
          <div className="flex flex-col gap-[9px] md:hidden">
            {teams.map((t, i) => {
              const rank = rankOf(t);
              const lead = t.score === top && top > 0;
              const color = COLORS[i % COLORS.length];
              return (
                <div
                  key={t.id}
                  className="animate-[pop_.25s_ease] rounded-2xl border-[1.5px] px-3 py-2.5"
                  style={{
                    borderColor: lead ? color : "#E5E8EE",
                    background: lead ? "#F5F6FF" : "#fff",
                  }}
                >
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <div
                      className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] font-anuphan text-[13px] font-bold text-white"
                      style={{ background: color }}
                    >
                      {rank === 1 && top > 0 ? "🥇" : rank}
                    </div>
                    <input
                      value={t.name}
                      onChange={(e) => rename(t.id, e)}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 font-sans text-sm font-bold outline-none"
                    />
                    <span
                      className="flex-none font-mono text-2xl font-semibold tabular-nums"
                      style={{ color }}
                    >
                      {t.score}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => bump(t.id, step)}
                      className="flex-1 rounded-[10px] border-none bg-[#0A9380] px-2 py-2.5 font-sans text-sm font-bold text-white hover:brightness-[1.06]"
                    >
                      +{step}
                    </button>
                    <button
                      type="button"
                      onClick={() => bump(t.id, -step)}
                      className="flex-none rounded-[10px] border border-[#F1C0C0] bg-white px-3.5 py-2.5 font-sans text-sm font-semibold text-[#DC2626] hover:bg-[#FEF4F4]"
                    >
                      −{step}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      title="ลบทีม"
                      className="flex-none rounded-[10px] border border-border bg-white px-[11px] py-2.5 font-sans text-[13px] text-ink-faint hover:bg-surface-light"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop team grid */}
          <div className="hidden md:grid md:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] md:gap-4">
            {teams.map((t, i) => {
              const rank = rankOf(t);
              const lead = t.score === top && top > 0;
              const color = COLORS[i % COLORS.length];
              return (
                <div
                  key={t.id}
                  className="animate-[pop_.25s_ease] rounded-[18px] border-2 p-[18px] text-center"
                  style={{
                    borderColor: lead ? color : "#E5E8EE",
                    background: lead ? "#F5F6FF" : "#fff",
                  }}
                >
                  <div className="mb-2.5 flex items-center gap-2">
                    <div
                      className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] font-anuphan text-[13px] font-bold text-white"
                      style={{ background: color }}
                    >
                      {rank === 1 && top > 0 ? "🥇" : rank}
                    </div>
                    <input
                      value={t.name}
                      onChange={(e) => rename(t.id, e)}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-left font-anuphan text-base font-bold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => remove(t.id)}
                      title="ลบทีม"
                      className="flex-none rounded-lg border border-border bg-white px-2 py-[5px] text-xs text-[#A9B0BE] hover:border-[#F1C0C0] hover:text-[#DC2626]"
                    >
                      ✕
                    </button>
                  </div>
                  <div
                    className="mb-3 font-mono text-[56px] font-semibold leading-[1.1] tabular-nums"
                    style={{ color }}
                  >
                    {t.score}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => bump(t.id, step)}
                      className="flex-1 rounded-[11px] border-none bg-[#0A9380] px-3 py-3 font-sans text-base font-bold text-white hover:brightness-[1.06]"
                    >
                      +{step}
                    </button>
                    <button
                      type="button"
                      onClick={() => bump(t.id, -step)}
                      className="flex-none rounded-[11px] border border-[#F1C0C0] bg-white px-4 py-3 font-sans text-base font-semibold text-[#DC2626] hover:bg-[#FEF4F4]"
                    >
                      −
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile action row */}
          <div className="mt-3.5 flex gap-2 md:hidden">
            <button
              type="button"
              onClick={addTeam}
              className="flex-1 whitespace-nowrap rounded-[11px] border border-[#C6C9FB] bg-[#F5F6FF] px-2 py-2.5 font-sans text-[13.5px] font-semibold text-[#3D38B4] hover:bg-[#E1E3FD]"
            >
              + เพิ่มทีม
            </button>
            <button
              type="button"
              onClick={resetScores}
              className="flex-1 whitespace-nowrap rounded-[11px] border border-border bg-white px-2 py-2.5 font-sans text-[13.5px] font-semibold hover:bg-surface-light"
            >
              ล้างคะแนน
            </button>
          </div>

          {/* Mobile leader card */}
          <div className="mt-3 rounded-2xl border border-border bg-surface-light p-[13px] md:hidden">
            <div className="mb-2.5 text-xs font-bold text-ink-secondary">
              ผู้นำตอนนี้
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{leaderIcon}</span>
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14.5px] font-bold">
                  {leaderName}
                </div>
                <div className="text-[11.5px] text-ink-faint">{leaderSub}</div>
              </div>
            </div>
          </div>

          {/* Desktop leader bar */}
          <div className="mt-5 hidden flex-wrap items-center gap-3.5 rounded-2xl border border-border bg-surface-light px-5 py-4 md:flex">
            <span className="flex-none text-[30px]">{leaderIcon}</span>
            <div className="min-w-[200px] flex-1">
              <div className="text-[12.5px] font-bold text-ink-faint">
                ผู้นำตอนนี้
              </div>
              <div className="text-lg font-bold">{leaderName}</div>
              <div className="text-[13px] text-ink-faint">{leaderSub}</div>
            </div>
            <button
              type="button"
              onClick={addTeam}
              className="flex-none whitespace-nowrap rounded-[11px] border border-[#C6C9FB] bg-[#F5F6FF] px-[18px] py-2.5 font-sans text-[13.5px] font-semibold text-[#3D38B4] hover:bg-[#E1E3FD]"
            >
              + เพิ่มทีม
            </button>
            <button
              type="button"
              onClick={resetScores}
              className="flex-none whitespace-nowrap rounded-[11px] border border-border bg-white px-[18px] py-2.5 font-sans text-[13.5px] font-semibold hover:bg-surface-light"
            >
              ล้างคะแนนทั้งหมด
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={toggleFull}
          title="เต็มจอ"
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 font-sans text-xs font-medium text-ink hover:bg-surface-light md:px-[13px] md:text-[13px]"
        >
          ⛶ <span className="hidden md:inline">ฉายเต็มจอ</span>
        </button>
      </div>
    </div>
  );
}
