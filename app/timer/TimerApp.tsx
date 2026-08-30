"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";

type Preset = { label: string; sec: number };

const PRESETS: Preset[] = [
  { label: "1 นาที", sec: 60 },
  { label: "3 นาที", sec: 180 },
  { label: "5 นาที", sec: 300 },
  { label: "10 นาที", sec: 600 },
];

function drawTimer(canvas: HTMLCanvasElement, total: number, remaining: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const rim = size * 0.05;
  const r = size / 2 - rim - 4;
  ctx.clearRect(0, 0, size, size);

  const rg = ctx.createLinearGradient(0, 0, 0, size);
  rg.addColorStop(0, "#3A3768");
  rg.addColorStop(0.5, "#1A1D26");
  rg.addColorStop(1, "#0A0C12");
  ctx.beginPath();
  ctx.arc(cx, cy, r + rim, 0, 2 * Math.PI);
  ctx.fillStyle = rg;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = "#F4F5FA";
  ctx.fill();

  const frac = total > 0 ? remaining / total : 0;
  const track = size * 0.055;
  ctx.beginPath();
  ctx.arc(cx, cy, r - track, 0, 2 * Math.PI);
  ctx.lineWidth = track;
  ctx.strokeStyle = "#E1E4EC";
  ctx.stroke();

  const low = remaining <= 10 && remaining > 0;
  const grad = ctx.createLinearGradient(0, 0, size, size);
  if (low) {
    grad.addColorStop(0, "#F97316");
    grad.addColorStop(1, "#DC2626");
  } else {
    grad.addColorStop(0, "#5C5EE6");
    grad.addColorStop(1, "#14B79A");
  }
  const a0 = -Math.PI / 2;
  const a1 = a0 + 2 * Math.PI * frac;
  ctx.beginPath();
  ctx.arc(cx, cy, r - track, a0, a1);
  ctx.lineWidth = track;
  ctx.lineCap = "round";
  ctx.strokeStyle = grad;
  ctx.stroke();

  const sh = ctx.createRadialGradient(
    cx - r * 0.35,
    cy - r * 0.4,
    r * 0.1,
    cx,
    cy,
    r,
  );
  sh.addColorStop(0, "rgba(255,255,255,.5)");
  sh.addColorStop(0.5, "rgba(255,255,255,0)");
  sh.addColorStop(1, "rgba(0,0,0,.05)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = sh;
  ctx.fill();
}

function canvasSizeForViewport(): number {
  if (typeof window === "undefined") return 760;
  return window.matchMedia("(min-width: 768px)").matches ? 760 : 560;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export default function TimerApp() {
  useTrackToolUse("timer");
  const [mode, setMode] = useState<"down" | "up">("down");
  const [total, setTotal] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [flashing, setFlashing] = useState(false);
  const [mm, setMm] = useState("05");
  const [ss, setSs] = useState("00");

  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const endRef = useRef(0);
  const acRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const drawAll = useCallback(() => {
    if (mode === "up") {
      const cycle = 60;
      const rem = cycle - (elapsed % cycle);
      canvasRefs.current.forEach((c) => drawTimer(c, cycle, rem));
    } else {
      canvasRefs.current.forEach((c) => drawTimer(c, total, remaining));
    }
  }, [mode, total, remaining, elapsed]);

  useEffect(() => {
    if (!running) drawAll();
  }, [drawAll, running]);

  // Keep canvas backing-store resolution in sync with the md breakpoint (560 mobile / 760 desktop).
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const applySize = () => {
      const size = canvasSizeForViewport();
      canvasRefs.current.forEach((c) => {
        if (c.width !== size) {
          c.width = size;
          c.height = size;
        }
      });
      drawAll();
    };
    applySize();
    mql.addEventListener("change", applySize);
    return () => mql.removeEventListener("change", applySize);
  }, [drawAll]);

  const registerCanvas = useCallback(
    (el: HTMLCanvasElement | null) => {
      if (el && !canvasRefs.current.includes(el)) {
        const size = canvasSizeForViewport();
        el.width = size;
        el.height = size;
        canvasRefs.current.push(el);
        if (mode === "up") {
          const cycle = 60;
          drawTimer(el, cycle, cycle - (elapsed % cycle));
        } else {
          drawTimer(el, total, remaining);
        }
      }
    },
    [mode, total, remaining, elapsed],
  );

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

  const beep = useCallback(
    (context: AudioContext, f: number, t0: number, dur: number) => {
      const o = context.createOscillator();
      const g = context.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g);
      g.connect(context.destination);
      o.start(t0);
      o.stop(t0 + dur);
    },
    [],
  );

  const alarm = useCallback(() => {
    if (!soundOnRef.current) return;
    const context = ac();
    if (!context) return;
    const t = context.currentTime;
    for (let i = 0; i < 4; i++) {
      beep(context, 880, t + i * 0.35, 0.18);
      beep(context, 1320, t + i * 0.35 + 0.08, 0.14);
    }
  }, [ac, beep]);

  const finish = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setRemaining(0);
    setFlashing(true);
    alarm();
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlashing(false), 2400);
  }, [alarm]);

  const tickRef = useRef<() => void>(() => {});
  useEffect(() => {
    tickRef.current = () => {
      if (mode === "up") {
        const el = Math.max(0, (performance.now() - endRef.current) / 1000);
        const e = Math.floor(el);
        setElapsed((cur) => (e !== cur ? e : cur));
        const cycle = 60;
        canvasRefs.current.forEach((c) => drawTimer(c, cycle, cycle - (e % cycle)));
        rafRef.current = requestAnimationFrame(() => tickRef.current());
        return;
      }
      const rem = Math.max(0, (endRef.current - performance.now()) / 1000);
      const r = Math.ceil(rem);
      setRemaining((cur) => (r !== cur ? r : cur));
      canvasRefs.current.forEach((c) => drawTimer(c, total, r));
      if (rem <= 0) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    };
  }, [mode, total, finish]);

  const toggleRun = useCallback(() => {
    const context = ac();
    if (context && context.state === "suspended") context.resume();
    if (mode === "up") {
      if (running) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setRunning(false);
      } else {
        endRef.current = performance.now() - elapsed * 1000;
        setRunning(true);
        setFlashing(false);
        rafRef.current = requestAnimationFrame(() => tickRef.current());
      }
      return;
    }
    if (total <= 0) return;
    if (running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setRunning(false);
    } else {
      let rem = remaining;
      if (rem <= 0) rem = total;
      endRef.current = performance.now() + rem * 1000;
      setRemaining(Math.ceil(rem));
      setRunning(true);
      setFlashing(false);
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    }
  }, [mode, total, remaining, running, elapsed, ac]);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setFlashing(false);
    if (mode === "up") {
      setElapsed(0);
    } else {
      setRemaining(total);
    }
  }, [mode, total]);

  const switchMode = useCallback((m: "down" | "up") => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setFlashing(false);
    setElapsed(0);
    setMode(m);
  }, []);

  const addMinute = useCallback(() => {
    setTotal((t) => t + 60);
    setRemaining((r) => r + 60);
    if (running) endRef.current += 60000;
  }, [running]);

  const setPreset = useCallback((sec: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTotal(sec);
    setRemaining(sec);
    setRunning(false);
    setFlashing(false);
    setMm(pad2(Math.floor(sec / 60)));
    setSs(pad2(sec % 60));
  }, []);

  const applyCustom = useCallback(() => {
    const m = Math.max(0, Math.min(99, parseInt(mm || "0", 10) || 0));
    const s = Math.max(0, Math.min(59, parseInt(ss || "0", 10) || 0));
    const sec = m * 60 + s;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTotal(sec);
    setRemaining(sec);
    setRunning(false);
    setFlashing(false);
    setMm(pad2(m));
    setSs(pad2(s));
  }, [mm, ss]);

  const toggleSound = useCallback(() => setSoundOn((s) => !s), []);

  const { fullscreenClassName, toggle: toggleFull } = useToolFullscreen(frameRef);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const displaySec = mode === "up" ? elapsed : remaining;
  const clockMm = pad2(Math.floor(displaySec / 60));
  const clockSs = pad2(displaySec % 60);
  const low = mode === "down" && remaining <= 10;
  const done = mode === "down" && remaining === 0;
  const statusText =
    mode === "up"
      ? running
        ? "กำลังนับเวลา"
        : elapsed > 0
          ? "หยุดชั่วคราว"
          : "พร้อมเริ่ม"
      : running
        ? "กำลังนับถอยหลัง"
        : done
          ? "หมดเวลา!"
          : "พร้อมเริ่ม";
  const timeColor = done ? "#DC2626" : low && running ? "#F97316" : "#1A1D26";
  const runLabel =
    mode === "up"
      ? running
        ? "หยุดชั่วคราว"
        : elapsed > 0
          ? "เล่นต่อ"
          : "▶ เริ่มจับเวลา"
      : running
        ? "หยุดชั่วคราว"
        : remaining > 0 && remaining < total
          ? "เล่นต่อ"
          : "▶ เริ่มจับเวลา";
  const startDisabled = mode === "down" && total <= 0;
  const startBg = startDisabled ? "#B9BCC7" : running ? "#F97316" : "#5C5EE6";

  return (
    <div
      ref={frameRef}
      className={`tool-stage bg-white ${fullscreenClassName}`}
      style={flashing ? { animation: "flash .5s ease 4" } : undefined}
    >
      <div className="md:grid md:grid-cols-[1fr_360px] md:items-center md:gap-10">
        {/* Dial */}
        <div className="mb-5 flex justify-center md:mb-0">
          <div className="relative flex justify-center">
            <div className="absolute bottom-2 left-1/2 z-0 h-8 w-[210px] -translate-x-1/2 blur-[5px] md:h-11 md:w-[300px]">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "radial-gradient(closest-side,rgba(26,29,38,.3),rgba(26,29,38,0))",
                }}
              />
            </div>
            <canvas
              ref={registerCanvas}
              className="relative z-[1] block h-[280px] w-[280px] md:h-[380px] md:w-[380px]"
              style={{ filter: "drop-shadow(0 18px 26px rgba(26,29,38,.28))" }}
            />
            <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center">
              <div
                className="font-mono text-[52px] font-semibold leading-none tracking-[-0.02em] md:text-[76px]"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: timeColor }}
              >
                {clockMm}:{clockSs}
              </div>
              <div className="mt-0.5 text-xs text-ink-faint md:mt-1 md:text-sm">
                {statusText}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div>
          <div className="mb-3.5 grid grid-cols-2 gap-2 md:mb-[18px]">
            <button
              type="button"
              onClick={() => switchMode("down")}
              className={`whitespace-nowrap rounded-[11px] border px-3 py-[11px] font-sans text-[13px] font-semibold md:rounded-xl md:py-[13px] md:text-sm ${
                mode === "down"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-ink-secondary hover:bg-surface-light"
              }`}
            >
              นับถอยหลัง
            </button>
            <button
              type="button"
              onClick={() => switchMode("up")}
              className={`whitespace-nowrap rounded-[11px] border px-3 py-[11px] font-sans text-[13px] font-semibold md:rounded-xl md:py-[13px] md:text-sm ${
                mode === "up"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-ink-secondary hover:bg-surface-light"
              }`}
            >
              นับเวลาขึ้น
            </button>
          </div>

          <div
            className={`mb-3.5 grid grid-cols-4 gap-2 md:mb-[18px] md:gap-[9px] ${
              mode === "down" ? "" : "invisible"
            }`}
            aria-hidden={mode !== "down"}
          >
            {PRESETS.map((p) => (
              <button
                key={p.sec}
                type="button"
                tabIndex={mode === "down" ? 0 : -1}
                onClick={() => setPreset(p.sec)}
                className="whitespace-nowrap rounded-[11px] border border-border bg-white px-1 py-[11px] font-sans text-[13px] font-semibold text-ink-secondary hover:border-[#C6C9FB] hover:bg-surface-light md:rounded-xl md:px-1 md:py-[13px] md:text-sm"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mb-3.5 flex gap-[9px] md:mb-0 md:flex-col md:gap-3">
            <button
              type="button"
              onClick={toggleRun}
              disabled={startDisabled}
              className="flex-[2] rounded-[13px] border-none px-[15px] py-[15px] font-sans text-base font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed md:w-full md:rounded-[14px] md:py-[17px] md:text-lg"
              style={{
                background: startBg,
                cursor: startDisabled ? "not-allowed" : "pointer",
              }}
            >
              {runLabel}
            </button>
            <div className="hidden gap-2.5 md:flex">
              <button
                type="button"
                tabIndex={mode === "down" ? 0 : -1}
                onClick={addMinute}
                className={`flex-1 whitespace-nowrap rounded-[13px] border border-border bg-white px-3 py-[13px] font-sans text-[15px] font-semibold text-ink hover:bg-surface-light ${
                  mode === "down" ? "" : "invisible"
                }`}
              >
                +1:00
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex-1 whitespace-nowrap rounded-[13px] border border-border bg-white px-3 py-[13px] font-sans text-[15px] font-semibold text-ink hover:bg-surface-light"
              >
                รีเซ็ต
              </button>
            </div>
            <button
              type="button"
              tabIndex={mode === "down" ? 0 : -1}
              onClick={addMinute}
              className={`flex-1 whitespace-nowrap rounded-[13px] border border-border bg-white px-1.5 py-[15px] font-sans text-sm font-semibold text-ink hover:bg-surface-light md:hidden ${
                mode === "down" ? "" : "invisible"
              }`}
            >
              +1:00
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 whitespace-nowrap rounded-[13px] border border-border bg-white px-1.5 py-[15px] font-sans text-sm font-semibold text-ink hover:bg-surface-light md:hidden"
            >
              รีเซ็ต
            </button>
          </div>

          {mode === "down" && (
            <div className="mt-3.5 rounded-2xl border border-border bg-surface-light p-[15px] md:mt-5 md:rounded-2xl md:p-[18px]">
              <div className="mb-2.5 text-[13px] font-semibold md:mb-[11px] md:text-[13.5px]">
                <span className="md:hidden">ตั้งเวลาเอง</span>
                <span className="hidden md:inline">
                  ตั้งเวลาเอง (นาที : วินาที)
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-[9px]">
                <input
                  value={mm}
                  onChange={(e) => setMm(e.target.value)}
                  type="number"
                  min={0}
                  max={99}
                  className="w-[70px] rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white p-2.5 text-center font-mono text-base outline-none focus:border-primary md:w-[76px] md:p-[11px] md:text-[17px]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                />
                <span className="text-lg font-bold text-ink-faint md:text-xl">
                  :
                </span>
                <input
                  value={ss}
                  onChange={(e) => setSs(e.target.value)}
                  type="number"
                  min={0}
                  max={59}
                  className="w-[70px] rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white p-2.5 text-center font-mono text-base outline-none focus:border-primary md:w-[76px] md:p-[11px] md:text-[17px]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                />
                <button
                  type="button"
                  onClick={applyCustom}
                  className="flex-1 whitespace-nowrap rounded-[10px] border-none bg-primary px-3 py-[11px] font-sans text-[13.5px] font-semibold text-white hover:bg-primary-hover md:py-3 md:text-sm"
                >
                  ตั้งเวลา
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tool-stage-actions flex justify-end gap-2">
        <button
          type="button"
          onClick={toggleSound}
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 font-sans text-xs font-medium text-ink hover:bg-surface-light md:gap-[6px] md:px-[13px] md:py-2 md:text-[13px]"
        >
          {soundOn ? "🔊" : "🔇"}
          <span className="hidden md:inline">เสียง</span>
        </button>
        <button
          type="button"
          onClick={toggleFull}
          title="เต็มจอ"
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 font-sans text-xs font-medium text-ink hover:bg-surface-light md:px-[13px] md:text-[13px]"
        >
          ⛶ <span className="hidden md:inline">เต็มจอ</span>
        </button>
      </div>
    </div>
  );
}
