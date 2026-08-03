"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";

const NAMES_KEY = "khuncool.duckrace.names";
const TRACK_KEY = "khuncool.duckrace.trackLen";
const GRAPHICS_KEY = "khuncool.duckrace.graphics";
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
  "#F2B01E",
  "#F97316",
  "#E0567C",
  "#8B7BF0",
  "#5C5EE6",
  "#22A6D8",
  "#14B79A",
  "#2BA84A",
  "#C2500B",
  "#9B59B6",
  "#E0A400",
  "#0A9380",
];

const TRACK_LABELS = ["สั้นมาก", "สั้น", "กำลังดี", "ยาว", "ยาวมาก"];

function duckSrc(i: number) {
  return `/assets/duck-race/duck${(i % 6) + 1}.png`;
}

function escHtml(s: string) {
  return String(s).replace(
    /[&<>"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}

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

function loadInitialTrackLen(): number {
  if (typeof window === "undefined") return 3;
  const v = parseInt(window.localStorage.getItem(TRACK_KEY) || "3", 10);
  return v >= 1 && v <= 5 ? v : 3;
}

type Duck = {
  name: string;
  idx: number;
  spriteI: number;
  p: number;
  finished: boolean;
  finishTime: number | null;
  plannedFinish: number;
  wobbleSeed: number;
  wob: number;
  phase: number;
};

type Runner = {
  el: HTMLDivElement;
  badge: HTMLDivElement;
  img: HTMLImageElement;
  baseTop: number;
};

type Geo = {
  W: number;
  H: number;
  worldLen: number;
  startX: number;
  finishX: number;
  duckSize: number;
};

type Podium = {
  name: string;
  src: string;
  time: string;
  medal: string;
  bg: string;
};

export default function DuckRaceApp() {
  useTrackToolUse("duck-race");
  const [names, setNames] = useState<string[]>(SAMPLE_NAMES);
  const [hydrated, setHydrated] = useState(false);
  const [newName, setNewName] = useState("");
  const [trackLen, setTrackLen] = useState(3);
  const [racing, setRacing] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [winner, setWinner] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [podium, setPodium] = useState<Podium[]>([]);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [duckScale, setDuckScale] = useState(100);
  const [sceneTone, setSceneTone] = useState(100);
  const [showLabels, setShowLabels] = useState(true);
  const [effectsOn, setEffectsOn] = useState(true);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const vpRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const speedRef = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLDivElement | null>(null);
  const countNumRef = useRef<HTMLSpanElement | null>(null);

  const ducksRef = useRef<Duck[]>([]);
  const runnersRef = useRef<Runner[]>([]);
  const geoRef = useRef<Geo | null>(null);
  const finishOrderRef = useRef<Duck[]>([]);
  const raceStartRef = useRef(0);
  const baseDurRef = useRef(7200);
  const winnerIdxRef = useRef(-1);
  const resultShownRef = useRef(false);
  const qtRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const namesRef = useRef(names);
  const trackLenRef = useRef(trackLen);
  const racingRef = useRef(racing);
  const soundOnRef = useRef(soundOn);
  const effectsOnRef = useRef(effectsOn);
  useEffect(() => {
    namesRef.current = names;
  }, [names]);
  useEffect(() => {
    trackLenRef.current = trackLen;
  }, [trackLen]);
  useEffect(() => {
    racingRef.current = racing;
  }, [racing]);
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);
  useEffect(() => {
    effectsOnRef.current = effectsOn;
  }, [effectsOn]);

  const acRef = useRef<AudioContext | null>(null);
  const ambRef = useRef<{
    master: GainNode;
    src: AudioBufferSourceNode;
    swell: OscillatorNode;
  } | null>(null);
  const ambStepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const importTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks every setTimeout scheduled by the race flow (countdown ticks,
  // race-again / remove-and-race restart delays, the post-finish reveal
  // delay) so they can all be cancelled on unmount — otherwise a pending
  // tick can fire after cleanup and call startAmbience() with nothing left
  // to stop it (leaked looping AudioBufferSourceNode + setInterval).
  const mountedRef = useRef(true);
  const pendingTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(
    new Set(),
  );
  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current.delete(id);
      if (!mountedRef.current) return;
      fn();
    }, ms);
    pendingTimeoutsRef.current.add(id);
    return id;
  }, []);
  const clearAllTrackedTimeouts = useCallback(() => {
    pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
    pendingTimeoutsRef.current.clear();
  }, []);

  // ---- persistence ----
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      setNames(loadInitialNames());
      setTrackLen(loadInitialTrackLen());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(NAMES_KEY, JSON.stringify(names));
    } catch {
      /* ignore */
    }
  }, [names, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(TRACK_KEY, String(trackLen));
    } catch {
      /* ignore */
    }
  }, [trackLen, hydrated]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(GRAPHICS_KEY) || "null");
      if (saved) {
        setDuckScale(saved.duckScale ?? 100);
        setSceneTone(saved.sceneTone ?? 100);
        setShowLabels(saved.showLabels ?? true);
        setEffectsOn(saved.effectsOn ?? true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        GRAPHICS_KEY,
        JSON.stringify({ duckScale, sceneTone, showLabels, effectsOn }),
      );
    } catch {
      /* ignore */
    }
  }, [duckScale, sceneTone, showLabels, effectsOn]);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // ---- audio ----
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
    (freq: number, dur: number, type: OscillatorType, vol: number) => {
      if (!soundOnRef.current) return;
      const context = ac();
      if (!context) return;
      const o = context.createOscillator();
      const g = context.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, context.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + dur);
      o.connect(g);
      g.connect(context.destination);
      o.start();
      o.stop(context.currentTime + dur);
    },
    [ac],
  );

  const quack = useCallback(() => {
    if (!soundOnRef.current) return;
    const context = ac();
    if (!context) return;
    const o = context.createOscillator();
    const g = context.createGain();
    const t = context.currentTime;
    o.type = "sawtooth";
    o.frequency.setValueAtTime(680, t);
    o.frequency.exponentialRampToValueAtTime(360, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g);
    g.connect(context.destination);
    o.start(t);
    o.stop(t + 0.2);
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

  const noiseBuffer = useCallback((): AudioBuffer => {
    const context = ac() as AudioContext;
    const len = Math.floor(context.sampleRate * 2);
    const b = context.createBuffer(1, len, context.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }, [ac]);

  const stopAmbience = useCallback(() => {
    if (!ambRef.current) return;
    const context = ac();
    const { master, src, swell } = ambRef.current;
    ambRef.current = null;
    if (ambStepRef.current) {
      clearInterval(ambStepRef.current);
      ambStepRef.current = null;
    }
    try {
      if (context) {
        const now = context.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      }
      setTimeout(() => {
        try {
          src.stop();
        } catch {
          /* ignore */
        }
        try {
          swell.stop();
        } catch {
          /* ignore */
        }
        try {
          master.disconnect();
        } catch {
          /* ignore */
        }
      }, 420);
    } catch {
      /* ignore */
    }
  }, [ac]);

  const startAmbience = useCallback(() => {
    if (!soundOnRef.current) return;
    const context = ac();
    if (!context || ambRef.current) return;
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.85, context.currentTime + 0.5);
    master.connect(context.destination);
    const src = context.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const bp = context.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1300;
    bp.Q.value = 0.6;
    const ng = context.createGain();
    ng.gain.value = 0.028;
    src.connect(bp);
    bp.connect(ng);
    ng.connect(master);
    src.start();
    const swell = context.createOscillator();
    const swg = context.createGain();
    swell.frequency.value = 0.5;
    swg.gain.value = 0.014;
    swell.connect(swg);
    swg.connect(ng.gain);
    swell.start();
    const scale = [523, 587, 659, 784, 880, 784, 659, 587];
    const bassNotes = [131, 131, 196, 165];
    const bpm = 140;
    const stepDur = 60000 / bpm / 2;
    let step = 0;
    ambStepRef.current = setInterval(() => {
      const t = context.currentTime;
      const f = scale[step % scale.length];
      const o = context.createOscillator();
      const g = context.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.24);
      if (step % 2 === 0) {
        const bo = context.createOscillator();
        const bg = context.createGain();
        bo.type = "sawtooth";
        bo.frequency.value = bassNotes[(step / 2) % bassNotes.length];
        bg.gain.setValueAtTime(0.0001, t);
        bg.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
        bg.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        bo.connect(bg);
        bg.connect(master);
        bo.start(t);
        bo.stop(t + 0.32);
      }
      step++;
    }, stepDur);
    ambRef.current = { master, src, swell };
  }, [ac, noiseBuffer]);

  const cheer = useCallback(() => {
    if (!soundOnRef.current) return;
    const context = ac();
    if (!context) return;
    const t = context.currentTime;
    const src = context.createBufferSource();
    src.buffer = noiseBuffer();
    const bp = context.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.5;
    const g = context.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    src.connect(bp);
    bp.connect(g);
    g.connect(context.destination);
    src.start(t);
    src.stop(t + 1.2);
  }, [ac, noiseBuffer]);

  const toggleSound = useCallback(() => {
    setSoundOn((s) => {
      const next = !s;
      if (!next) stopAmbience();
      else if (racingRef.current) trackedTimeout(() => startAmbience(), 0);
      return next;
    });
  }, [stopAmbience, startAmbience, trackedTimeout]);

  // ---- confetti burst ----
  const burst = useCallback(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const hh = vp.clientHeight;
    for (let i = 0; i < 34; i++) {
      const c = document.createElement("div");
      const s = 5 + Math.random() * 6;
      c.style.cssText = `position:absolute;top:-14px;left:${(Math.random() * 100).toFixed(1)}%;width:${s}px;height:${(s * 0.5).toFixed(1)}px;background:${PALETTE[i % PALETTE.length]};border-radius:2px;z-index:20;pointer-events:none`;
      vp.appendChild(c);
      const dur = 1800 + Math.random() * 1300;
      c.animate(
        [
          { transform: "translateY(0) rotate(0)", opacity: 1 },
          {
            transform: `translateY(${hh + 50}px) rotate(${Math.random() * 720}deg)`,
            opacity: 0.9,
          },
        ],
        { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" },
      );
      setTimeout(() => c.remove(), dur + 60);
    }
  }, []);

  const worldMul = useCallback(() => {
    return 2.2 + (trackLenRef.current - 1) * 0.7;
  }, []);

  // ---- build the race track DOM ----
  const buildView = useCallback(() => {
    const vp = vpRef.current;
    const world = worldRef.current;
    if (!vp || !world) return;
    world.querySelectorAll(".rnode").forEach((e) => e.remove());
    const W = vp.clientWidth;
    const H = vp.clientHeight;
    if (!W || !H) return;
    const worldLen = Math.round(W * worldMul());
    const startX = Math.round(W * 0.16);
    const finishX = worldLen - Math.round(W * 0.16);
    world.style.width = worldLen + "px";
    world.style.transform = "translateX(0px)";
    const duckSize = Math.round(H * 0.32 * (duckScale / 100));
    const roadTop = H * 0.6;
    const roadBottom = H * 0.94;
    const bandH = roadBottom - roadTop;

    const startH = Math.round(bandH * 0.86);
    const finishH = Math.round(bandH * 0.96);
    const startW = Math.round((startH * 718) / 554);
    const finishW = Math.round((finishH * 679) / 455);
    const mk = (src: string, w: number, h: number, cx: number) => {
      const img = document.createElement("img");
      img.className = "rnode";
      img.src = src;
      img.alt = "";
      img.style.cssText = `position:absolute;z-index:2;width:${w}px;height:${h}px;top:${Math.round(roadBottom - h - bandH * 0.08)}px;left:${Math.round(cx - w / 2)}px;object-fit:contain;filter:drop-shadow(2px 6px 5px rgba(0,0,0,.3))`;
      world.appendChild(img);
    };
    mk("/assets/duck-race/start.png", startW, startH, startX);
    mk("/assets/duck-race/finish.png", finishW, finishH, finishX);

    const bandTop = roadTop - duckSize * 0.5;
    const bandBottom = roadTop + bandH * 0.5 - duckSize * 0.5;
    const bandRange = Math.max(10, bandBottom - bandTop);
    const ducks = ducksRef.current;
    const n = ducks.length;
    const slots: number[] = [];
    for (let i = 0; i < n; i++) slots.push(n <= 1 ? 0.5 : i / (n - 1));
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    runnersRef.current = [];
    geoRef.current = { W, H, worldLen, startX, finishX, duckSize };
    ducks.forEach((d, i) => {
      const baseTop = bandTop + slots[i] * bandRange + (Math.random() * 20 - 10);
      const runner = document.createElement("div");
      runner.className = "rnode";
      runner.style.cssText = `position:absolute;z-index:${4 + i};width:${duckSize}px;height:${duckSize}px;transform:translate(${startX - duckSize / 2}px,${baseTop}px);will-change:transform`;
      runner.innerHTML =
        `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:rgba(26,29,38,.8);color:#fff;font-size:11px;font-weight:600;font-family:'Anuphan','Sarabun';padding:2px 8px;border-radius:8px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;z-index:5;display:${showLabels ? "block" : "none"}">${escHtml(d.name)}</div>` +
        `<div class="rbadge" style="position:absolute;top:-12px;left:-4px;width:24px;height:24px;border-radius:50%;background:#F2B01E;color:#1A1D26;font-weight:700;font-size:13px;font-family:'Anuphan';display:none;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.3);z-index:6"></div>` +
        `<img alt="" src="${duckSrc(i)}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 8px rgba(0,0,0,.3));animation:dbob .5s ease-in-out ${(i * 0.09).toFixed(2)}s infinite alternate">`;
      world.appendChild(runner);
      runnersRef.current.push({
        el: runner,
        badge: runner.querySelector(".rbadge") as HTMLDivElement,
        img: runner.querySelector("img") as HTMLImageElement,
        baseTop,
      });
    });
  }, [worldMul, duckScale, showLabels]);

  const makeDucks = useCallback(() => {
    ducksRef.current = namesRef.current.map((name, i) => ({
      name,
      idx: i,
      spriteI: i,
      p: 0,
      finished: false,
      finishTime: null,
      plannedFinish: 0,
      wobbleSeed: Math.random() * 1000,
      wob: Math.random() * 0.1 + 0.04,
      phase: Math.random() * 6.28,
    }));
    finishOrderRef.current = [];
  }, []);

  const rebuild = useCallback(() => {
    makeDucks();
    buildView();
  }, [makeDucks, buildView]);

  // rebuild when names/trackLen change (not while racing)
  useEffect(() => {
    if (!hydrated) return;
    if (racingRef.current || countdown !== null) return;
    rebuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names, trackLen, hydrated, duckScale, showLabels]);

  // rebuild on viewport resize (mobile <-> desktop layout changes)
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => {
      if (!racingRef.current && countdown === null) rebuild();
    });
    ro.observe(vp);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCount = useCallback((val: string) => {
    const count = countRef.current;
    const countNum = countNumRef.current;
    if (count && countNum) {
      count.style.display = "flex";
      countNum.textContent = val;
      countNum.style.animation = "none";
      void countNum.offsetWidth;
      countNum.style.animation = "pop .7s ease-out";
    }
  }, []);

  const hideCount = useCallback(() => {
    if (countRef.current) countRef.current.style.display = "none";
  }, []);

  const showSpeed = useCallback((visible = true) => {
    if (speedRef.current)
      speedRef.current.style.opacity = visible && effectsOnRef.current ? ".28" : "0";
  }, []);

  const drawView = useCallback((elapsed: number) => {
    const g = geoRef.current;
    const world = worldRef.current;
    if (!g || !world) return;
    const dist = g.finishX - g.startX;
    let leaderX = g.startX;
    ducksRef.current.forEach((d, i) => {
      const r = runnersRef.current[i];
      if (!r) return;
      const x = g.startX + d.p * dist;
      const wob = d.finished ? 0 : Math.sin(elapsed / 200 + d.wobbleSeed) * 6;
      r.el.style.transform = `translate(${x - g.duckSize / 2}px, ${r.baseTop + wob}px)`;
      if (d.finished && r.img.style.animationPlayState !== "paused") {
        r.img.style.animationPlayState = "paused";
      }
      if (x > leaderX) leaderX = x;
    });
    const order = ducksRef.current
      .map((d, i) => ({ i, p: d.p }))
      .sort((a, b) => b.p - a.p);
    order.forEach((o, rank) => {
      const r = runnersRef.current[o.i];
      if (!r) return;
      r.badge.textContent = String(rank + 1);
      r.badge.style.display = "flex";
      r.badge.style.background = rank === 0 ? "#F2B01E" : "#fff";
      r.badge.style.color = rank === 0 ? "#1A1D26" : "#434A58";
      r.el.style.zIndex = String(100 - rank);
    });
    const camX = Math.max(0, Math.min(g.worldLen - g.W, leaderX - g.W * 0.32));
    world.style.transform = `translateX(${-camX}px)`;
  }, []);

  const finishRef = useRef<() => void>(() => {});
  const chimeRef = useRef(chime);
  const burstRef = useRef(burst);
  const beepRef = useRef(beep);
  const quackRef = useRef(quack);
  const drawViewRef = useRef(drawView);
  useEffect(() => {
    chimeRef.current = chime;
    burstRef.current = burst;
    beepRef.current = beep;
    quackRef.current = quack;
    drawViewRef.current = drawView;
  }, [chime, burst, beep, quack, drawView]);

  // Plain (non-memoized) function: it mutates plain-object refs every
  // frame, which the React Compiler's immutability lint rule flags when
  // wrapped in useCallback. It is only ever scheduled via requestAnimationFrame,
  // never called during render, so it doesn't need to be a hook value.
  function loop(now: number) {
    rafRef.current = requestAnimationFrame(loop);
    if (!racingRef.current) return;
    const elapsed = now - raceStartRef.current;
    for (const d of ducksRef.current) {
      if (d.finished) continue;
      const t = Math.min(1, elapsed / d.plannedFinish);
      const eased = 1 - Math.pow(1 - t, 1.5);
      const wob = d.wob * Math.sin(t * Math.PI * 3.0 + d.phase) * (t * (1 - t)) * 4;
      d.p = Math.max(0, Math.min(1, eased + wob));
      if (t >= 1) {
        d.finished = true;
        d.finishTime = elapsed;
        d.p = 1;
        finishOrderRef.current.push(d);
        if (finishOrderRef.current.length === 1) {
          chimeRef.current();
          if (effectsOnRef.current) burstRef.current();
        } else {
          beepRef.current(520, 0.12, "sine", 0.05);
        }
      }
    }
    qtRef.current += 0.016;
    if (qtRef.current > 0.7 + Math.random() * 0.7) {
      qtRef.current = 0;
      if (Math.random() < 0.5) quackRef.current();
    }
    drawViewRef.current(elapsed);
    if (
      !resultShownRef.current &&
      ducksRef.current.length &&
      ducksRef.current.every((d) => d.finished)
    ) {
      resultShownRef.current = true;
      finishRef.current();
    }
  }

  const finish = useCallback(() => {
    showSpeed(false);
    stopAmbience();
    cheer();
    const podiumList: Podium[] = finishOrderRef.current.slice(0, 3).map((d, i) => ({
      name: d.name,
      src: duckSrc(d.spriteI),
      time: ((d.finishTime ?? 0) / 1000).toFixed(2),
      medal: ["🥇", "🥈", "🥉"][i],
      bg: i === 0 ? "linear-gradient(90deg,#FFF4D6,#FFEAB0)" : "#F1F3F7",
    }));
    winnerIdxRef.current = finishOrderRef.current[0].idx;
    trackedTimeout(() => {
      setRacing(false);
      setShowResult(true);
      setWinner(finishOrderRef.current[0].name);
      setPodium(podiumList);
    }, 480);
  }, [showSpeed, stopAmbience, cheer, trackedTimeout]);

  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  const startRace = useCallback(() => {
    if (racingRef.current || countdown !== null || namesRef.current.length < 2) return;
    const context = ac();
    if (context && context.state === "suspended") context.resume();
    rebuild();
    baseDurRef.current = 4500 + (trackLenRef.current - 1) * 2000;
    ducksRef.current.forEach((d) => {
      d.plannedFinish = baseDurRef.current * (0.82 + Math.random() * 0.34);
    });
    resultShownRef.current = false;
    qtRef.current = 0;
    setShowResult(false);
    setWinner("");
    setPodium([]);
    setCountdown("3");
    showCount("3");
    beep(660, 0.18, "square", 0.08);
    const seq = ["2", "1", "ไป!"];
    let step = 0;
    const tick = () => {
      if (step < seq.length) {
        const val = seq[step++];
        setCountdown(val);
        showCount(val);
        beep(val === "ไป!" ? 990 : 660, 0.18, "square", 0.08);
        trackedTimeout(tick, 750);
      } else {
        hideCount();
        setCountdown(null);
        setRacing(true);
        raceStartRef.current = performance.now();
        showSpeed();
        quack();
        startAmbience();
      }
    };
    trackedTimeout(tick, 750);
  }, [
    countdown,
    ac,
    rebuild,
    beep,
    showCount,
    hideCount,
    showSpeed,
    quack,
    startAmbience,
    trackedTimeout,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    if (!ducksRef.current.length) makeDucks();
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAmbience();
      if (importTimerRef.current) clearTimeout(importTimerRef.current);
      clearAllTrackedTimeouts();
      // stopAmbience() schedules a ~420ms fade-out before it stops/disconnects
      // its audio nodes; close the context after that so the fade can finish
      // cleanly instead of tearing down mid-ramp.
      setTimeout(() => {
        if (acRef.current) {
          acRef.current.close().catch(() => {});
          acRef.current = null;
        }
      }, 450);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const raceAgain = useCallback(() => {
    setShowResult(false);
    trackedTimeout(startRace, 280);
  }, [startRace, trackedTimeout]);

  const removeAndRace = useCallback(() => {
    const idx = winnerIdxRef.current;
    setNames((cur) => cur.filter((_, i) => i !== idx));
    setShowResult(false);
    trackedTimeout(() => {
      rebuild();
      trackedTimeout(startRace, 340);
    }, 0);
  }, [rebuild, startRace, trackedTimeout]);

  const closeResult = useCallback(() => {
    if (removeWinner && winnerIdxRef.current >= 0) {
      const idx = winnerIdxRef.current;
      setNames((cur) => cur.filter((_, i) => i !== idx));
    }
    setShowResult(false);
  }, [removeWinner]);

  const addName = useCallback(() => {
    const v = newName.trim();
    if (!v) return;
    setNames((cur) => [...cur, v]);
    setNewName("");
  }, [newName]);

  const removeName = useCallback((i: number) => {
    setNames((cur) => cur.filter((_, idx) => idx !== i));
  }, []);

  const clearAll = useCallback(() => {
    setNames([]);
    setShowResult(false);
    setWinner("");
  }, []);

  const shuffle = useCallback(() => {
    setNames((cur) => {
      const a = [...cur];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
  }, []);

  const importFromRoster = useCallback(() => {
    let r: unknown = null;
    try {
      r = JSON.parse(window.localStorage.getItem(ROSTER_KEY) || "null");
    } catch {
      /* ignore */
    }
    if (Array.isArray(r) && r.length) {
      setNames(r as string[]);
      setShowResult(false);
      setImportMsg(`นำเข้า ${r.length} ชื่อจากทะเบียนแล้ว`);
      beep(660, 0.14, "sine", 0.06);
    } else {
      setImportMsg("ยังไม่มีทะเบียนรายชื่อ — เพิ่มที่หน้า “แบ่งกลุ่ม” หรือ “เช็กชื่อ” ก่อน");
    }
    if (importTimerRef.current) clearTimeout(importTimerRef.current);
    importTimerRef.current = setTimeout(() => setImportMsg(""), 2600);
  }, [beep]);

  const toggleBulk = useCallback(() => {
    setBulkMode((m) => {
      if (!m) setBulkText(namesRef.current.join("\n"));
      return !m;
    });
  }, []);

  const applyBulk = useCallback(() => {
    const list = bulkText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    setNames(list);
    setBulkMode(false);
  }, [bulkText]);

  const toggleFull = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const resetGraphics = useCallback(() => {
    setDuckScale(100);
    setSceneTone(100);
    setShowLabels(true);
    setEffectsOn(true);
  }, []);

  const busy = racing || countdown !== null;
  const disabled = busy || names.length < 2;
  const startLabel =
    countdown !== null ? countdown : racing ? "กำลังแข่ง…" : "🦆 ปล่อยเป็ดสเก็ต!";

  return (
    <div ref={frameRef} className="duck-race-shell">
      <div className="duck-race-toolbar">
        <div>
          <span className="duck-race-eyebrow">DUCK RACE STUDIO</span>
          <strong>สนามแข่ง 16:9</strong>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowSettings((v) => !v)} className="duck-race-toolbtn" aria-expanded={showSettings}>
            ⚙️ <span>{showSettings ? "ซ่อนตั้งค่า" : "ตั้งค่าภาพ"}</span>
          </button>
          <button type="button" onClick={toggleSound} className="duck-race-iconbtn" aria-label="เปิด/ปิดเสียง">{soundOn ? "🔊" : "🔇"}</button>
          <button type="button" onClick={toggleFull} className="duck-race-toolbtn" aria-label="เต็มจอ">⛶ <span>{isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}</span></button>
        </div>
      </div>
      {/* Race track */}
      <div
        className="duck-race-stage"
      >
        <div
          ref={vpRef}
          onClick={startRace}
          className="relative aspect-video w-full cursor-pointer overflow-hidden bg-[#8fd0e8]"
          style={{ filter: `saturate(${sceneTone}%) contrast(${90 + sceneTone / 10}%)` }}
        >
          <div
            ref={worldRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              backgroundImage: "url('/assets/duck-race/world.jpg')",
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              willChange: "transform",
            }}
          />
          <div
            ref={speedRef}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: effectsOn ? 0 : 0,
              background:
                "radial-gradient(ellipse at center,transparent 42%,rgba(10,35,58,.5) 100%)",
              transition: "opacity .3s",
              zIndex: 6,
            }}
          />
          <div
            ref={countRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(74,70,214,.4)",
              zIndex: 8,
            }}
          >
            <span
              ref={countNumRef}
              className="font-anuphan text-[110px] font-bold leading-none text-white [text-shadow:0_8px_30px_rgba(0,0,0,.35)] md:text-[150px] md:[text-shadow:0_8px_34px_rgba(0,0,0,.35)]"
            >
              3
            </span>
          </div>
        </div>
      </div>

      <div className="duck-race-controls">
        <div className="duck-race-primary">
          <button
            type="button"
            onClick={startRace}
            disabled={disabled}
            className="mb-4 w-full rounded-[13px] border-none px-[15px] py-[15px] font-sans text-base font-bold text-white shadow-[0_10px_24px_-8px_rgba(20,183,154,.5)] hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed md:mb-0 md:rounded-2xl md:py-[17px] md:text-lg md:shadow-[0_12px_28px_-8px_rgba(20,183,154,.5)]"
            style={{ background: disabled ? "#9DB3AE" : "#14B79A" }}
          >
            {startLabel}
          </button>
          <p className="mx-0.5 mb-0 mt-4 hidden text-xs leading-relaxed text-ink-faint md:block">
            เป็ดทุกตัวออกสเก็ตพร้อมกัน กล้องวิ่งตามตัวที่นำ
            สลับกันแซงได้ตลอดทาง ตัวที่แตะเส้นชัยก่อนคือผู้ชนะแบบสุ่มยุติธรรม
            เหมาะกับสุ่มเลือกคนตอบ ให้รางวัล หรือเรียกความสนใจก่อนเข้าบทเรียน ·
            ใช้ผ่านเว็บได้เลย ไม่ต้องติดตั้ง
          </p>
        </div>

        <div className={showSettings ? "block" : "hidden"}>
          <div className="rounded-2xl border border-border bg-surface-light p-[15px] md:rounded-[18px] md:p-5">
            <div className="mb-4 rounded-xl border border-[#dce2ff] bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold">ปรับแต่งกราฟิก</span>
                <button type="button" onClick={resetGraphics} className="text-xs text-primary">คืนค่าเดิม</button>
              </div>
              <label className="duck-race-slider"><span>ขนาดเป็ด</span><input type="range" min="75" max="135" value={duckScale} onChange={(e) => setDuckScale(Number(e.target.value))} /><b>{duckScale}%</b></label>
              <label className="duck-race-slider"><span>สีสันฉาก</span><input type="range" min="70" max="140" value={sceneTone} onChange={(e) => setSceneTone(Number(e.target.value))} /><b>{sceneTone}%</b></label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="duck-race-toggle"><input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> ป้ายชื่อ</label>
                <label className="duck-race-toggle"><input type="checkbox" checked={effectsOn} onChange={(e) => setEffectsOn(e.target.checked)} /> เอฟเฟกต์</label>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-[11px] border-b border-border pb-3 md:mb-[15px] md:gap-3 md:pb-[15px]">
              <span className="whitespace-nowrap text-[13px] font-semibold md:text-[13.5px]">
                ความยาวสนาม
              </span>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={trackLen}
                onChange={(e) => setTrackLen(parseInt(e.target.value, 10) || 3)}
                className="min-w-0 flex-1 cursor-pointer accent-primary"
              />
              <span className="min-w-[58px] whitespace-nowrap text-right text-xs font-semibold text-primary md:min-w-[62px] md:text-[12.5px]">
                {TRACK_LABELS[trackLen - 1]}
              </span>
            </div>

            <div className="mb-[11px] flex items-center justify-between md:mb-[13px]">
              <span className="text-sm font-bold md:text-[15px]">
                รายชื่อเป็ด ({names.length})
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
                  🔀 สลับเลน
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
              <div className="mb-[11px] rounded-lg bg-success-bg px-2.5 py-[7px] text-[11.5px] text-success md:mb-[13px] md:rounded-[9px] md:px-3 md:text-xs">
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
                <div className="flex max-h-[230px] flex-wrap gap-[7px] overflow-y-auto md:gap-2">
                  {names.map((nm, i) => (
                    <span
                      key={`${nm}-${i}`}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-border bg-white py-1 pl-1.5 pr-2 text-xs font-medium md:py-1 md:pl-2 md:pr-[9px] md:text-[13px]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={duckSrc(i)}
                        alt=""
                        className="h-[22px] w-[22px] flex-none object-contain md:h-6 md:w-6"
                      />
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
                เอาตัวชนะออกจากรอบหน้า
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
        </div>
      </div>

      {/* Winner modal */}
      {showResult && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(26,29,38,.55)] p-6 backdrop-blur-sm">
          <div className="w-full max-w-[460px] rounded-[22px] bg-white p-[24px_20px] text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,.4)] md:rounded-3xl md:p-[32px_30px] md:shadow-[0_40px_80px_-24px_rgba(0,0,0,.45)]">
            <div className="mb-1 text-[42px] leading-none md:text-[54px]">🏆</div>
            <div className="mb-1.5 text-[13px] font-semibold text-success md:mb-2 md:text-sm">
              เป็ดที่ชนะคือ…
            </div>
            <div className="mb-4 break-words text-[28px] font-bold leading-tight text-ink md:mb-[22px] md:text-[38px]">
              {winner}
            </div>
            <div className="mb-[18px] flex flex-col gap-1.5 md:mb-6 md:gap-2">
              {podium.map((r, i) => (
                <div
                  key={`${r.name}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl px-[11px] py-[7px] md:gap-3.5 md:rounded-2xl md:px-3.5 md:py-2.5"
                  style={{ background: r.bg }}
                >
                  <span className="w-6 text-center text-[17px] md:w-[30px] md:text-[22px]">
                    {r.medal}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.src}
                    alt=""
                    className="h-8 w-8 object-contain md:h-10 md:w-10"
                  />
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[13.5px] font-semibold md:text-[15px]">
                    {r.name}
                  </span>
                  <span className="font-mono text-xs text-ink-muted md:text-[13px]">
                    {r.time} วิ
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[9px] md:gap-2.5">
              <button
                type="button"
                onClick={raceAgain}
                className="rounded-xl border-none bg-accent py-[13px] font-sans text-[15px] font-bold text-white hover:brightness-105 md:py-3.5 md:rounded-[13px] md:text-base"
              >
                🦆 แข่งอีกครั้ง
              </button>
              <button
                type="button"
                onClick={removeAndRace}
                className="whitespace-nowrap rounded-xl border border-[#D3D8E1] bg-white py-3 font-sans text-sm font-semibold text-ink hover:bg-surface-light md:rounded-[13px] md:py-[13px] md:text-[15px]"
              >
                เอาตัวนี้ออก แล้วแข่งต่อ
              </button>
              <button
                type="button"
                onClick={closeResult}
                className="rounded-[10px] border-none bg-transparent py-2 font-sans text-[13.5px] font-medium text-ink-faint md:rounded-[11px] md:py-[9px] md:text-sm"
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
