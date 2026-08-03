"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";

const NAMES_KEY = "khuncool.wheel.names";
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
];

const PALETTE = [
  "#5C5EE6",
  "#14B79A",
  "#F97316",
  "#3D38B4",
  "#0A9380",
  "#E0A400",
  "#8B7BF0",
  "#22B8A0",
  "#C2500B",
  "#6D68E0",
];

function loadInitialNames(): string[] {
  if (typeof window === "undefined") return SAMPLE_NAMES;
  try {
    const own = JSON.parse(window.localStorage.getItem(NAMES_KEY) || "null");
    if (Array.isArray(own) && own.length) return own;
  } catch {
    /* ignore */
  }
  try {
    const roster = JSON.parse(
      window.localStorage.getItem(ROSTER_KEY) || "null",
    );
    if (Array.isArray(roster) && roster.length) return roster;
  } catch {
    /* ignore */
  }
  return [...SAMPLE_NAMES];
}

function drawWheel(canvas: HTMLCanvasElement, names: string[], rot: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const rim = size * 0.055;
  const r = size / 2 - rim - 4;
  ctx.clearRect(0, 0, size, size);

  const rimGrad = ctx.createLinearGradient(0, 0, 0, size);
  rimGrad.addColorStop(0, "#3A3768");
  rimGrad.addColorStop(0.5, "#1A1D26");
  rimGrad.addColorStop(1, "#0A0C12");
  ctx.beginPath();
  ctx.arc(cx, cy, r + rim, 0, 2 * Math.PI);
  ctx.fillStyle = rimGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.stroke();

  const n = names.length;
  if (n === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#EEF1FE";
    ctx.fill();
    ctx.fillStyle = "#A9B0BE";
    ctx.font = `500 ${Math.round(size * 0.045)}px 'Sarabun'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("เพิ่มรายชื่อก่อน", cx, cy);
    drawBulbs(ctx, cx, cy, r + rim * 0.5, size, n, rot);
    return;
  }

  const seg = (2 * Math.PI) / n;
  const fs = Math.max(size * 0.026, Math.min(size * 0.05, (size * 0.9) / n));
  for (let i = 0; i < n; i++) {
    const start = i * seg + rot;
    const end = start + seg;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(start) * r, cy + Math.sin(start) * r);
    ctx.lineWidth = Math.max(1, size * 0.003);
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + seg / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,.28)";
    ctx.shadowBlur = size * 0.01;
    ctx.shadowOffsetY = 1;
    ctx.font = `600 ${fs}px 'Anuphan','Sarabun'`;
    const maxTextWidth = r - 14 - size * 0.11;
    let label = names[i];
    if (ctx.measureText(label).width > maxTextWidth) {
      while (
        label.length > 1 &&
        ctx.measureText(label + "…").width > maxTextWidth
      ) {
        label = label.slice(0, -1);
      }
      label += "…";
    }
    ctx.fillText(label, r - 14, 0);
    ctx.restore();
  }

  const sheen = ctx.createRadialGradient(
    cx - r * 0.35,
    cy - r * 0.4,
    r * 0.1,
    cx,
    cy,
    r,
  );
  sheen.addColorStop(0, "rgba(255,255,255,.28)");
  sheen.addColorStop(0.45, "rgba(255,255,255,.05)");
  sheen.addColorStop(0.7, "rgba(0,0,0,0)");
  sheen.addColorStop(1, "rgba(0,0,0,.16)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = sheen;
  ctx.fill();

  drawBulbs(ctx, cx, cy, r + rim * 0.5, size, n, rot);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.3)";
  ctx.shadowBlur = size * 0.03;
  ctx.shadowOffsetY = size * 0.006;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.095, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#E5E8EE";
  ctx.stroke();
  ctx.fillStyle = "#5C5EE6";
  ctx.font = `700 ${size * 0.06}px 'IBM Plex Sans'`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("k", cx, cy + size * 0.004);
}

function drawBulbs(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  size: number,
  n: number,
  rot: number,
) {
  const count = Math.min(24, Math.max(12, n * 2));
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 2 * Math.PI + rot * 0.5;
    const bx = cx + Math.cos(a) * radius;
    const by = cy + Math.sin(a) * radius;
    const on = i % 2 === 0;
    ctx.save();
    if (on) {
      ctx.shadowColor = "rgba(255,214,120,.9)";
      ctx.shadowBlur = size * 0.018;
    }
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.009, 0, 2 * Math.PI);
    ctx.fillStyle = on ? "#FFE08A" : "#8A7A3A";
    ctx.fill();
    ctx.restore();
  }
}

/** Backing-store resolution: source uses 620x620 on mobile, 840x840 on desktop (md, 768px+). */
function canvasSizeForViewport(): number {
  if (typeof window === "undefined") return 840;
  return window.matchMedia("(min-width: 768px)").matches ? 840 : 620;
}

export default function WheelApp() {
  useTrackToolUse("wheel");
  const [names, setNames] = useState<string[]>(SAMPLE_NAMES);
  const [hydrated, setHydrated] = useState(false);
  const [newName, setNewName] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState("");
  const [winnerIdx, setWinnerIdx] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [soundOn, setSoundOn] = useState(true);

  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const rotRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const importTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundOnRef = useRef(soundOn);
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);
  const acRef = useRef<AudioContext | null>(null);
  const lastTickSegRef = useRef(-1);
  const confettiRef = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      c: string;
      s: number;
      rot: number;
      vr: number;
      life: number;
    }[]
  >([]);
  const confRafRef = useRef<number | null>(null);

  // Load persisted names on mount.
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      setNames(loadInitialNames());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  // Persist on change (after hydration, so we don't overwrite storage on first render).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(NAMES_KEY, JSON.stringify(names));
    } catch {
      /* ignore */
    }
  }, [names, hydrated]);

  const drawAll = useCallback(() => {
    canvasRefs.current.forEach((c) => drawWheel(c, names, rotRef.current));
  }, [names]);

  useEffect(() => {
    if (!spinning) drawAll();
  }, [drawAll, spinning]);

  // Keep canvas backing-store resolution in sync with the md breakpoint (620 mobile / 840 desktop).
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
        drawWheel(el, names, rotRef.current);
      }
    },
    [names],
  );

  // ---- audio (ported from Wheel.dc.html's ac()/tick()/chime()) ----
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

  const tick = useCallback(() => {
    if (!soundOnRef.current) return;
    const context = ac();
    if (!context) return;
    const o = context.createOscillator();
    const g = context.createGain();
    o.type = "square";
    o.frequency.value = 1100;
    g.gain.setValueAtTime(0.06, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);
    o.connect(g);
    g.connect(context.destination);
    o.start();
    o.stop(context.currentTime + 0.05);
  }, [ac]);

  const chime = useCallback(() => {
    if (!soundOnRef.current) return;
    const context = ac();
    if (!context) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = context.createOscillator();
      const g = context.createGain();
      const t = context.currentTime + i * 0.09;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g);
      g.connect(context.destination);
      o.start(t);
      o.stop(t + 0.42);
    });
  }, [ac]);

  const toggleSound = useCallback(() => setSoundOn((s) => !s), []);

  // ---- confetti (ported from Wheel.dc.html's burstConfetti()/confCanvasFor()) ----
  const confCanvasFor = useCallback((wheelCanvas: HTMLCanvasElement) => {
    const parent = wheelCanvas.parentElement;
    if (!parent) return null;
    let oc = parent.querySelector<HTMLCanvasElement>("canvas[data-conf]");
    if (!oc) {
      oc = document.createElement("canvas");
      oc.setAttribute("data-conf", "1");
      oc.width = wheelCanvas.width * 1.6;
      oc.height = wheelCanvas.height * 1.6;
      oc.style.position = "absolute";
      oc.style.pointerEvents = "none";
      oc.style.zIndex = "5";
      oc.style.width = `${wheelCanvas.clientWidth * 1.6}px`;
      oc.style.height = `${wheelCanvas.clientHeight * 1.6}px`;
      oc.style.left = "50%";
      oc.style.top = "50%";
      oc.style.transform = "translate(-50%,-50%)";
      parent.appendChild(oc);
    }
    return oc;
  }, []);

  const burstConfetti = useCallback(() => {
    const cols = PALETTE;
    confettiRef.current = [];
    for (let i = 0; i < 90; i++) {
      confettiRef.current.push({
        x: 0.5,
        y: 0.35,
        vx: (Math.random() - 0.5) * 0.9,
        vy: -Math.random() * 0.9 - 0.3,
        c: cols[i % cols.length],
        s: 6 + Math.random() * 7,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.5,
        life: 1,
      });
    }
    if (confRafRef.current) cancelAnimationFrame(confRafRef.current);
    let last = performance.now();
    const overlays = canvasRefs.current
      .map((c) => confCanvasFor(c))
      .filter((c): c is HTMLCanvasElement => !!c);
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let alive = false;
      confettiRef.current.forEach((p) => {
        p.vy += 1.4 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr;
        p.life -= 0.45 * dt;
        if (p.life > 0) alive = true;
      });
      overlays.forEach((oc) => {
        const ctx = oc.getContext("2d");
        if (!ctx) return;
        const w = oc.width;
        const h = oc.height;
        ctx.clearRect(0, 0, w, h);
        confettiRef.current.forEach((p) => {
          if (p.life <= 0) return;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x * w, p.y * h);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
          ctx.restore();
        });
      });
      if (alive) {
        confRafRef.current = requestAnimationFrame(step);
      } else {
        overlays.forEach((oc) => oc.getContext("2d")?.clearRect(0, 0, oc.width, oc.height));
      }
    };
    confRafRef.current = requestAnimationFrame(step);
  }, [confCanvasFor]);

  const finish = useCallback(() => {
    setSpinning(false);
    setNames((current) => {
      const n = current.length;
      const seg = (2 * Math.PI) / n;
      const pointer = 1.5 * Math.PI;
      const rel =
        (((pointer - rotRef.current) % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI);
      const idx = Math.floor(rel / seg) % n;
      setWinner(current[idx]);
      setWinnerIdx(idx);
      setShowResult(true);
      return current;
    });
    chime();
    burstConfetti();
  }, [chime, burstConfetti]);

  const spin = useCallback(() => {
    if (spinning || names.length < 2) return;
    const context = ac();
    if (context && context.state === "suspended") context.resume();
    setSpinning(true);
    setShowResult(false);
    setWinner("");
    const startRot = rotRef.current;
    const delta = 2 * Math.PI * (5 + Math.random() * 2) + Math.random() * 2 * Math.PI;
    const dur = 4200;
    const t0 = performance.now();
    const n = names.length;
    const seg = (2 * Math.PI) / n;
    lastTickSegRef.current = -1;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      rotRef.current = startRot + delta * e;
      const curSeg = Math.floor((rotRef.current % (2 * Math.PI)) / seg);
      if (curSeg !== lastTickSegRef.current) {
        lastTickSegRef.current = curSeg;
        tick();
      }
      drawAll();
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        finish();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [spinning, names.length, drawAll, finish, ac, tick]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (confRafRef.current) cancelAnimationFrame(confRafRef.current);
      if (importTimerRef.current) clearTimeout(importTimerRef.current);
    };
  }, []);

  const spinAgain = useCallback(() => {
    setShowResult(false);
    setTimeout(spin, 250);
  }, [spin]);

  const removeAndSpin = useCallback(() => {
    setNames((current) => current.filter((_, i) => i !== winnerIdx));
    setShowResult(false);
    setWinnerIdx(-1);
    setTimeout(spin, 300);
  }, [winnerIdx, spin]);

  const closeResult = useCallback(() => {
    if (removeWinner && winnerIdx >= 0) {
      setNames((current) => current.filter((_, i) => i !== winnerIdx));
      setWinnerIdx(-1);
    }
    setShowResult(false);
  }, [removeWinner, winnerIdx]);

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
    setShowResult(false);
    setWinner("");
  }, []);

  const shuffle = useCallback(() => {
    setNames((current) => {
      const a = [...current];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
  }, []);

  const importFromRoster = useCallback(() => {
    let roster: unknown = null;
    try {
      roster = JSON.parse(window.localStorage.getItem(ROSTER_KEY) || "null");
    } catch {
      /* ignore */
    }
    if (Array.isArray(roster) && roster.length) {
      setNames(roster as string[]);
      setShowResult(false);
      setImportMsg(`นำเข้า ${roster.length} ชื่อจากทะเบียนแล้ว`);
    } else {
      setImportMsg("ยังไม่มีทะเบียนรายชื่อ — เพิ่มที่หน้า “แบ่งกลุ่ม” หรือ “เช็กชื่อ” ก่อน");
    }
    if (importTimerRef.current) clearTimeout(importTimerRef.current);
    importTimerRef.current = setTimeout(() => setImportMsg(""), 2600);
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

  const disabled = spinning || names.length < 2;

  return (
    <div className="md:grid md:grid-cols-[1fr_380px] md:items-start md:gap-9">
      {/* Wheel column */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4 flex justify-center md:mb-[22px]">
          <div
            className="absolute left-1/2 top-[-2px] z-[3] h-0 w-0 -translate-x-1/2 md:top-[-4px]"
            style={{
              borderLeft: "13px solid transparent",
              borderRight: "13px solid transparent",
              borderTop: "22px solid #1A1D26",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,.2))",
            }}
          />
          <div
            className="absolute bottom-1.5 left-1/2 z-0 h-[34px] w-[230px] -translate-x-1/2 blur-[4px] md:h-[46px] md:w-[320px]"
            style={{
              background:
                "radial-gradient(closest-side,rgba(26,29,38,.32),rgba(26,29,38,0))",
            }}
          />
          <canvas
            ref={registerCanvas}
            onClick={spin}
            className="relative z-[1] block h-[310px] w-[310px] cursor-pointer md:h-[420px] md:w-[420px]"
            style={{ filter: "drop-shadow(0 18px 26px rgba(26,29,38,.32))" }}
          />
        </div>

        <div className="flex w-full items-center gap-2.5 md:w-auto">
          <button
            type="button"
            onClick={spin}
            disabled={disabled}
            className="mb-4 w-full min-w-0 flex-1 rounded-[13px] border-none px-[15px] py-[15px] font-sans text-base font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed md:mb-0 md:min-w-[260px] md:flex-none md:w-auto md:rounded-2xl md:px-10 md:py-4 md:text-[17px]"
            style={{ background: disabled ? "#B9BCC7" : "#5C5EE6" }}
          >
            {spinning ? "กำลังหมุน…" : "🎡 หมุนวงล้อ"}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            title="เสียง"
            aria-label="เปิด/ปิดเสียง"
            className="mb-4 flex h-[52px] w-[52px] flex-none cursor-pointer items-center justify-center rounded-[13px] border border-border bg-surface-card text-lg hover:bg-surface-light md:mb-0 md:h-14 md:w-14 md:rounded-2xl"
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Controls column */}
      <div>
        <div className="rounded-2xl border border-border bg-surface-light p-[15px] md:rounded-[18px] md:p-5">
          <div className="mb-[11px] flex items-center justify-between md:mb-[13px]">
            <span className="text-sm font-bold md:text-[15px]">
              รายชื่อ ({names.length})
            </span>
            <div className="flex gap-2.5 md:gap-3">
              <button
                type="button"
                onClick={importFromRoster}
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-normal text-primary md:text-[12.5px]"
              >
                📥 ทะเบียน
              </button>
              <button
                type="button"
                onClick={shuffle}
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-normal text-primary md:text-[12.5px]"
              >
                🔀 สลับ
              </button>
              <button
                type="button"
                onClick={toggleBulk}
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-normal text-primary md:text-[12.5px]"
              >
                {bulkMode ? "✎ กลับไปทีละชื่อ" : "✎ วางหลายชื่อ"}
              </button>
            </div>
          </div>

          {importMsg && (
            <div className="mb-[11px] rounded-lg bg-success-bg px-2.5 py-[7px] text-[11.5px] text-success md:mb-[13px] md:px-3 md:text-xs">
              {importMsg}
            </div>
          )}

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
                className="mt-2 w-full rounded-[10px] border-none bg-primary px-2 py-2.5 font-sans text-[13.5px] font-semibold text-white hover:bg-primary-hover md:mt-[9px] md:text-sm"
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
                  placeholder="เพิ่มชื่อ… แล้วกด Enter"
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
              <div className="flex max-h-[220px] flex-wrap gap-[7px] overflow-y-auto md:gap-2">
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

          <div className="mt-[14px] flex items-center justify-between border-t border-border pt-3 md:mt-4">
            <label className="flex cursor-pointer items-center gap-[9px] text-xs text-ink-secondary md:gap-2.5 md:text-[13.5px]">
              <input
                type="checkbox"
                checked={removeWinner}
                onChange={(e) => setRemoveWinner(e.target.checked)}
                className="h-[17px] w-[17px] cursor-pointer accent-primary md:h-[18px] md:w-[18px]"
              />
              เอาชื่อที่สุ่มได้ออก
            </label>
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer border-none bg-transparent p-0 text-xs text-error-strong md:text-[12.5px]"
            >
              ล้างทั้งหมด
            </button>
          </div>
        </div>
        <p className="mx-0.5 mb-0 mt-3.5 hidden text-xs leading-relaxed text-ink-faint md:block">
          เหมาะกับสุ่มเลือกคนตอบ แบ่งกลุ่ม หรือสุ่มลำดับกิจกรรม ·
          ใช้ผ่านเว็บได้เลย ไม่ต้องติดตั้ง
        </p>
      </div>

      {/* Winner modal */}
      {showResult && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(26,29,38,.55)] p-6 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-[22px] bg-white p-[26px_22px] text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,.4)] md:p-[34px_30px]">
            <div className="mb-2 text-[13px] font-semibold text-primary md:mb-2.5 md:text-sm">
              🎉 ผลการสุ่ม
            </div>
            <div className="mb-5 break-words text-3xl font-bold leading-tight text-ink md:mb-[26px] md:text-[40px]">
              {winner}
            </div>
            <div className="flex flex-col gap-[9px] md:gap-2.5">
              <button
                type="button"
                onClick={spinAgain}
                className="rounded-xl border-none bg-primary py-[13px] font-sans text-[15px] font-bold text-white hover:bg-primary-hover md:py-3.5 md:text-base"
              >
                🎡 หมุนอีกครั้ง
              </button>
              <button
                type="button"
                onClick={removeAndSpin}
                className="whitespace-nowrap rounded-xl border border-[#D3D8E1] bg-white py-3 font-sans text-sm font-semibold text-ink hover:bg-surface-light md:py-[13px] md:text-[15px]"
              >
                เอาชื่อนี้ออก แล้วหมุนต่อ
              </button>
              <button
                type="button"
                onClick={closeResult}
                className="rounded-[10px] border-none bg-transparent py-2 font-sans text-[13.5px] font-medium text-ink-faint md:py-[9px] md:text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
