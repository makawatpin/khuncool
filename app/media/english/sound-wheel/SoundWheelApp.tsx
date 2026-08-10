"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, speakEnglish, hoverSfxDelegate } from "@/lib/kcSfx";
import { useStage } from "../../_stage/useStage";
import styles from "./SoundWheelApp.module.css";

type WordEntry = [string, string, string];

const PAL: [string, string][] = [
  ["#F0532B", "#FFE3DA"],
  ["#5C5EE6", "#E1E3FD"],
  ["#14B79A", "#D6F6F0"],
  ["#F79E1B", "#FFEFD3"],
  ["#D6336C", "#FFE0EB"],
  ["#2F80ED", "#DCEBFF"],
  ["#7B4DE0", "#EBE1FE"],
  ["#0EA5A5", "#D6F4F4"],
  ["#E8590C", "#FFE8D6"],
  ["#3B8C3B", "#DEF2DE"],
  ["#B5179E", "#FBE0F7"],
  ["#0B7285", "#D8EEF2"],
];

type SetKey = "letters" | "digraphs" | "cvc";

const SETS: Record<SetKey, { label: string; items: WordEntry[] }> = {
  letters: {
    label: "พยัญชนะต้น a–z",
    items: [
      ["a", "apple", "🍎"],
      ["a", "ant", "🐜"],
      ["b", "ball", "⚽"],
      ["b", "bear", "🐻"],
      ["c", "cat", "🐱"],
      ["c", "cake", "🎂"],
      ["d", "dog", "🐶"],
      ["d", "duck", "🦆"],
      ["e", "egg", "🥚"],
      ["e", "elephant", "🐘"],
      ["f", "fish", "🐟"],
      ["f", "frog", "🐸"],
      ["g", "goat", "🐐"],
      ["g", "grapes", "🍇"],
      ["h", "hat", "🎩"],
      ["h", "horse", "🐴"],
      ["i", "igloo", "🏠"],
      ["i", "ink", "🖋️"],
      ["j", "jam", "🍓"],
      ["j", "juice", "🧃"],
      ["k", "kite", "🪁"],
      ["k", "key", "🔑"],
      ["l", "lion", "🦁"],
      ["l", "leaf", "🍃"],
      ["m", "moon", "🌙"],
      ["m", "milk", "🥛"],
      ["n", "nest", "🪺"],
      ["n", "nose", "👃"],
      ["o", "octopus", "🐙"],
      ["o", "orange", "🍊"],
      ["p", "pig", "🐷"],
      ["p", "pencil", "✏️"],
      ["r", "rain", "🌧️"],
      ["r", "rabbit", "🐰"],
      ["s", "sun", "☀️"],
      ["s", "star", "⭐"],
      ["t", "tiger", "🐯"],
      ["t", "train", "🚆"],
      ["v", "van", "🚐"],
      ["v", "violin", "🎻"],
      ["w", "web", "🕸️"],
      ["w", "water", "💧"],
      ["y", "yoyo", "🪀"],
      ["y", "yogurt", "🍦"],
      ["z", "zip", "🤐"],
      ["z", "zebra", "🦓"],
    ],
  },
  digraphs: {
    label: "Digraphs",
    items: [
      ["sh", "ship", "🚢"],
      ["sh", "shell", "🐚"],
      ["ch", "chair", "🪑"],
      ["ch", "cheese", "🧀"],
      ["th", "thumb", "👍"],
      ["th", "three", "3️⃣"],
      ["wh", "whale", "🐳"],
      ["wh", "wheel", "🛞"],
      ["ph", "phone", "📱"],
      ["ph", "photo", "📷"],
      ["ng", "king", "👑"],
      ["ng", "ring", "💍"],
      ["ck", "duck", "🦆"],
      ["ck", "sock", "🧦"],
      ["qu", "queen", "👸"],
      ["qu", "quilt", "🛏️"],
      ["oo", "moon", "🌙"],
      ["oo", "book", "📖"],
      ["ee", "tree", "🌳"],
      ["ee", "sheep", "🐑"],
      ["ai", "rain", "🌧️"],
      ["ai", "train", "🚆"],
      ["ow", "cow", "🐄"],
      ["ow", "flower", "🌸"],
    ],
  },
  cvc: {
    label: "สระสั้น CVC",
    items: [
      ["cat", "cat", "🐱"],
      ["bag", "bag", "🎒"],
      ["pen", "pen", "🖊️"],
      ["ten", "ten", "🔟"],
      ["pig", "pig", "🐷"],
      ["six", "six", "6️⃣"],
      ["dog", "dog", "🐶"],
      ["pot", "pot", "🍲"],
      ["sun", "sun", "☀️"],
      ["bus", "bus", "🚌"],
      ["bed", "bed", "🛏️"],
      ["web", "web", "🕸️"],
      ["hat", "hat", "🎩"],
      ["map", "map", "🗺️"],
      ["box", "box", "📦"],
      ["log", "log", "🪵"],
      ["cup", "cup", "🥤"],
      ["nut", "nut", "🥜"],
      ["fan", "fan", "🌀"],
      ["jam", "jam", "🍓"],
      ["net", "net", "🥅"],
      ["leg", "leg", "🦵"],
      ["mop", "mop", "🧹"],
      ["fox", "fox", "🦊"],
    ],
  },
};

type WheelItem = {
  sound: string;
  word: string;
  emoji: string;
  color: string;
  soft: string;
};

type ConfettiPiece = {
  id: number;
  left: number;
  size: number;
  color: string;
  radius: string;
  dur: number;
  delay: number;
};

type Floater = {
  id: number;
  text: string;
  color: string;
};

function makeWheel(setKey: SetKey, size: number): WheelItem[] {
  const pool = [...SETS[setKey].items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const seen = new Set<string>();
  const uniq: WordEntry[] = [];
  pool.forEach((it) => {
    if (!seen.has(it[0])) {
      seen.add(it[0]);
      uniq.push(it);
    }
  });
  return uniq.slice(0, size).map((it, i) => ({
    sound: it[0],
    word: it[1],
    emoji: it[2],
    color: PAL[i % PAL.length][0],
    soft: PAL[i % PAL.length][1],
  }));
}

export default function SoundWheelApp() {
  useTrackToolUse("media-english-sound-wheel");
  const { isFull, stageProps, toggle: toggleFull } = useStage<HTMLDivElement>();

  const [stage, setStage] = useState<0 | 1>(0);
  const [setKey, setSetKey] = useState<SetKey>("letters");
  const [size, setSize] = useState(8);
  const [wheel, setWheel] = useState<WheelItem[]>(() => makeWheel("letters", 8));
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [spins, setSpins] = useState(0);
  const [history, setHistory] = useState<WheelItem[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [cardAnim, setCardAnim] = useState("popIn .45s ease-out");
  const [muted, setMuted] = useState(() => KcSfx.isMuted());
  const [bgm, setBgm] = useState(() => KcSfx.isBgm());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef(-Math.PI / 2);
  const wheelRef = useRef<WheelItem[]>([]);
  const tRef = useRef(0);
  const spinningRef = useRef(false);
  const rafIdleRef = useRef<number | null>(null);
  const rafSpinRef = useRef<number | null>(null);
  const streakRef = useRef(0);
  const resultRef = useRef<WheelItem | null>(null);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    wheelRef.current = wheel;
  }, [wheel]);
  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const draw = useCallback((angle: number) => {
    const cv = canvasRef.current;
    const w = wheelRef.current;
    if (!cv || !w.length) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const C = 340;
    const R = 300;
    const n = w.length;
    const seg = (Math.PI * 2) / n;
    ctx.clearRect(0, 0, 680, 680);

    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const on = (i + Math.floor(tRef.current / 12)) % 3 === 0;
      ctx.beginPath();
      ctx.arc(
        C + Math.cos(a) * (R + 22),
        C + Math.sin(a) * (R + 22),
        on ? 8 : 5.5,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = on ? "#FFD166" : "#FFF3D6";
      ctx.shadowColor = on ? "rgba(255,180,40,.9)" : "transparent";
      ctx.shadowBlur = on ? 14 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.arc(C, C, R + 11, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    for (let i = 0; i < n; i++) {
      const a0 = angle + i * seg;
      const a1 = a0 + seg;
      ctx.beginPath();
      ctx.moveTo(C, C);
      ctx.arc(C, C, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = w[i].color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.save();
      ctx.translate(C, C);
      ctx.rotate(a0 + seg / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      const txt = w[i].sound;
      const fs = txt.length > 2 ? 46 : n > 10 ? 52 : 64;
      ctx.font = `700 ${fs}px Fredoka, Anuphan, system-ui, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,.22)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.rotate(Math.PI / 2);
      ctx.fillText(txt, 0, -R * 0.58);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.font = "400 34px system-ui";
      ctx.fillText(w[i].emoji, 0, -R * 0.28);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(C, C, 58, 0, Math.PI * 2);
    const g = ctx.createLinearGradient(C - 50, C - 50, C + 50, C + 50);
    g.addColorStop(0, "#5C5EE6");
    g.addColorStop(1, "#14B79A");
    ctx.fillStyle = g;
    ctx.shadowColor = "rgba(0,0,0,.3)";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(C, C, 46, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "400 40px system-ui";
    ctx.fillText("🔊", C, C + 2);
  }, []);

  // idle animation loop (lights chase)
  useEffect(() => {
    const timers = timeoutsRef.current;
    const loop = () => {
      tRef.current += 1;
      if (!spinningRef.current) draw(angleRef.current);
      rafIdleRef.current = requestAnimationFrame(loop);
    };
    rafIdleRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdleRef.current) cancelAnimationFrame(rafIdleRef.current);
      if (rafSpinRef.current) cancelAnimationFrame(rafSpinRef.current);
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [draw]);

  useEffect(() => {
    requestAnimationFrame(() => draw(angleRef.current));
  }, [wheel, draw]);

  const burstRing = useCallback(() => {
    const cols = ["#F0532B", "#5C5EE6", "#14B79A", "#F79E1B", "#D6336C"];
    const pieces: ConfettiPiece[] = Array.from({ length: 14 }, (_, i) => ({
      id: Math.random(),
      left: 20 + Math.random() * 60,
      size: 7 + Math.random() * 8,
      color: cols[i % cols.length],
      radius: Math.random() > 0.5 ? "50%" : "3px",
      dur: 1.6 + Math.random(),
      delay: Math.random() * 0.2,
    }));
    setConfetti(pieces);
    later(() => setConfetti([]), 2800);
  }, [later]);

  const float = useCallback((text: string, color: string) => {
    const f: Floater = { id: Math.random(), text, color };
    setFloaters([f]);
    later(() => setFloaters([]), 1500);
  }, [later]);

  const spin = useCallback(() => {
    if (spinningRef.current || stage !== 1) return;
    KcSfx.unlock();
    KcSfx.play("whoosh");
    const w = wheelRef.current;
    const n = w.length;
    if (!n) return;
    const seg = (Math.PI * 2) / n;
    const start = angleRef.current;
    const total = Math.PI * 2 * (5 + Math.random() * 3) + Math.random() * Math.PI * 2;
    const dur = 4200 + Math.random() * 900;
    const t0 = performance.now();
    let lastSeg = -1;
    setSpinning(true);
    spinningRef.current = true;
    setResult(null);

    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      const a = start + total * e;
      angleRef.current = a;
      draw(a);
      const s = Math.floor((((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / seg);
      if (s !== lastSeg) {
        lastSeg = s;
        if (p < 0.97) KcSfx.play("tick");
      }
      if (p < 1) {
        rafSpinRef.current = requestAnimationFrame(step);
      } else {
        const norm = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let idx = Math.floor((((-Math.PI / 2 - norm) + Math.PI * 4) % (Math.PI * 2)) / seg);
        idx = ((idx % n) + n) % n;
        const item = w[idx];
        setSpinning(false);
        spinningRef.current = false;
        setResult(item);
        setSpins((s2) => s2 + 1);
        setCardAnim("popIn .45s ease-out");
        setHistory((h) => [item, ...h].slice(0, 12));
        KcSfx.play("pop");
        burstRing();
        later(() => speakEnglish(item.word, true), 260);
      }
    };
    rafSpinRef.current = requestAnimationFrame(step);
  }, [stage, draw, burstRing, later]);

  const markRight = useCallback(() => {
    const st = streakRef.current + 1;
    KcSfx.play(st >= 3 ? "combo" : "correct");
    setStars((s) => s + 1);
    setStreak(st);
    float(st >= 3 ? `เก่งมาก! x${st}` : "ถูกต้อง! +1⭐", "#0E9C84");
    burstRing();
  }, [float, burstRing]);

  const markWrong = useCallback(() => {
    KcSfx.play("wrong");
    setStreak(0);
    setCardAnim("shake .5s ease-in-out");
    float("ลองอีกครั้ง", "#B4331A");
    later(() => {
      if (resultRef.current) speakEnglish(resultRef.current.word, true);
    }, 200);
  }, [float, later]);

  const speakAgain = useCallback(() => {
    KcSfx.play("click");
    if (resultRef.current) speakEnglish(resultRef.current.word, true);
  }, []);

  const start = useCallback(() => {
    KcSfx.unlock();
    KcSfx.play("click");
    const w = makeWheel(setKey, size);
    wheelRef.current = w;
    angleRef.current = -Math.PI / 2;
    setWheel(w);
    setResult(null);
    setHistory([]);
    setStage(1);
  }, [setKey, size]);

  const newRound = useCallback(() => {
    KcSfx.play("pop");
    const w = makeWheel(setKey, size);
    wheelRef.current = w;
    setWheel(w);
    setResult(null);
  }, [setKey, size]);

  const backHome = useCallback(() => {
    KcSfx.play("click");
    setStage(0);
    setResult(null);
  }, []);

  const toggleMute = useCallback(() => {
    const m = KcSfx.toggleMuted();
    setMuted(m);
    if (!m) KcSfx.play("click");
  }, []);

  const toggleBgm = useCallback(() => {
    const on = !bgm;
    KcSfx.unlock();
    KcSfx.bgm(on);
    setBgm(on);
  }, [bgm]);

  const pickSet = useCallback((k: SetKey) => {
    KcSfx.play("click");
    setSetKey(k);
    const w = makeWheel(k, size);
    wheelRef.current = w;
    setWheel(w);
  }, [size]);

  const pickSize = useCallback((n: number) => {
    KcSfx.play("click");
    setSize(n);
    const w = makeWheel(setKey, n);
    wheelRef.current = w;
    setWheel(w);
  }, [setKey]);

  const spinLabel = spinning ? "กำลังหมุน…" : result ? "หมุนอีกครั้ง 🎡" : "หมุนวงล้อ! 🎡";
  const spinBg = spinning ? "#A9B0BE" : "linear-gradient(135deg,#F0532B,#F79E1B)";
  const fire = streak >= 3 ? "🔥" : "";

  return (
    <div {...stageProps} className="kc-stage">
    <div
      className={`kc-stage-body ${styles.body} kc-game kc-sound-game kc-stage-${stage}`}
      onMouseOver={hoverSfxDelegate}
      style={{
        // position and overflow belong to .kc-stage-body.
        borderRadius: 24,
        background:
          "linear-gradient(170deg,#FFF3E2 0%,#EFF0FE 48%,#E6FBF6 100%)",
      }}
    >
      {/* decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: 26,
          right: "6%",
          width: 130,
          height: 130,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,#FFE59A 0%,#FFD166 60%,rgba(255,209,102,0) 72%)",
          animation: "spinSlow 40s linear infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -120,
          width: 360,
          height: 360,
          borderRadius: 999,
          background: "radial-gradient(circle,#C6C9FB 0%,transparent 70%)",
          filter: "blur(6px)",
          opacity: 0.75,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 300,
          right: -150,
          width: 420,
          height: 420,
          borderRadius: 999,
          background: "radial-gradient(circle,#B6F3E4 0%,transparent 70%)",
          filter: "blur(6px)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -130,
          left: "22%",
          width: 340,
          height: 340,
          borderRadius: 999,
          background: "radial-gradient(circle,#FFD3D3 0%,transparent 70%)",
          filter: "blur(6px)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          width: 150,
          height: 52,
          pointerEvents: "none",
          animation: "drift 56s linear infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            background: "rgba(255,255,255,.85)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 26,
            top: -22,
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(255,255,255,.85)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 74,
            top: -8,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,.85)",
          }}
        />
      </div>

      {/* confetti + floaters */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 40,
          overflow: "hidden",
        }}
      >
        {confetti.map((c) => (
          <span
            key={c.id}
            style={{
              position: "absolute",
              top: -30,
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              background: c.color,
              borderRadius: c.radius,
              animation: `confettiFall ${c.dur}s linear ${c.delay}s forwards`,
            }}
          />
        ))}
        {floaters.map((f) => (
          <div
            key={f.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "40%",
              fontFamily: "var(--font-fredoka)",
              fontWeight: 700,
              fontSize: 42,
              color: f.color,
              textShadow: "0 3px 0 rgba(255,255,255,.9)",
              animation: "floatUp 1.4s ease-out forwards",
            }}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* top bar */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          padding: "14px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/khuncool-logo.webp"
            alt="KhunCool"
            style={{
              width: 38,
              height: 38,
              flex: "none",
              objectFit: "contain",
              filter: "drop-shadow(0 6px 14px rgba(92,94,230,.5))",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: "-.01em",
            }}
          >
            Sound Wheel
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/media/english"
            style={{
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              color: "#5C5EE6",
              background: "#E1E3FD",
              borderRadius: 999,
              padding: "9px 16px",
              textDecoration: "none",
            }}
          >
            ☰ เมนู
          </Link>
          <button
            type="button"
            onClick={toggleBgm}
            title="เพลงประกอบ"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              height: 36,
              padding: "0 13px",
              borderRadius: 999,
              border: "1px solid #E5E8EE",
              background: bgm ? "#E1E3FD" : "#fff",
              color: bgm ? "#4A46D6" : "#8A93A5",
              cursor: "pointer",
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: 13,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              transition: "transform .18s",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                height: 14,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: bgm ? "#5C5EE6" : "#C9CFE0",
                    transformOrigin: "bottom",
                    animation: bgm
                      ? `eqBar ${(0.5 + i * 0.16).toFixed(2)}s ease-in-out infinite`
                      : "none",
                  }}
                />
              ))}
            </span>
            <span>{bgm ? "เพลง" : "ปิดเพลง"}</span>
          </button>
          <button
            type="button"
            onClick={toggleMute}
            title="เสียงเอฟเฟกต์"
            style={{
              width: 36,
              height: 36,
              flex: "none",
              borderRadius: "50%",
              border: "1px solid #E5E8EE",
              background: muted ? "#F1F3F7" : "#fff",
              fontSize: 16,
              cursor: "pointer",
              transition: "transform .18s",
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            onClick={toggleFull}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            style={{
              width: 36,
              height: 36,
              flex: "none",
              borderRadius: "50%",
              border: "1px solid #E5E8EE",
              background: isFull ? "#EAF7E4" : "#fff",
              fontSize: 16,
              cursor: "pointer",
              transition: "transform .18s",
            }}
          >
            ⛶
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 999,
              padding: "7px 14px",
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: 15,
              color: "#C2500B",
              boxShadow: "0 6px 16px -8px rgba(0,0,0,.25)",
              animation: "floatY 3s ease-in-out infinite",
            }}
          >
            <span style={{ animation: "popStar 1.8s ease-in-out infinite" }}>
              ⭐
            </span>
            <span>{stars}</span>
          </div>
        </div>
      </div>

      {stage === 0 && (
        <div
          className={`${styles.screen} ${styles.intro}`}
          style={{
            position: "relative",
            zIndex: 5,
            width: "100%",
            maxWidth: 720,
            margin: "4px auto 0",
            padding: "0 20px clamp(10px,3cqb,40px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "clamp(30px,7cqi,56px)",
              lineHeight: 1,
              marginBottom: 4,
              animation: "wiggle 2.6s ease-in-out infinite",
            }}
          >
            🎡
          </div>
          <h1
            style={{
              fontFamily: "var(--font-fredoka)",
              fontWeight: 700,
              fontSize: "clamp(20px,6.4cqi,50px)",
              margin: "0 0 4px",
              letterSpacing: "-.02em",
            }}
          >
            หมุนวงล้อ แล้ว
            <span
              style={{
                background: "linear-gradient(135deg,#F0532B,#F79E1B)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ออกเสียง!
            </span>
          </h1>
          <p
            style={{
              fontSize: "clamp(12px,3.6cqi,17px)",
              lineHeight: 1.4,
              color: "#5A6273",
              margin: "0 0 10px",
            }}
          >
            วงล้อหยุดที่เสียงไหน
            นักเรียนออกเสียงนั้นและบอกคำศัพท์ที่ขึ้นต้นด้วยเสียงเดียวกัน —
            กดฟังเสียงตัวอย่างได้ทุกช่อง
          </p>

          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 24,
              padding: "10px 12px 12px",
              boxShadow: "0 20px 40px -30px rgba(26,29,38,.6)",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#9AA3B2",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              เลือกชุดเสียง
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              {(Object.keys(SETS) as SetKey[]).map((k) => {
                const active = setKey === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => pickSet(k)}
                    style={{
                      fontFamily: "var(--font-fredoka)",
                      fontWeight: 600,
                      fontSize: 13,
                      padding: "7px 14px",
                      borderRadius: 999,
                      cursor: "pointer",
                      border: `2px solid ${active ? "#5C5EE6" : "#E5E8EE"}`,
                      background: active ? "#5C5EE6" : "#fff",
                      color: active ? "#fff" : "#434A58",
                      transition: "transform .18s",
                    }}
                  >
                    {SETS[k].label}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#9AA3B2",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              จำนวนช่องบนวงล้อ
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {[6, 8, 10, 12].map((n) => {
                const active = size === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => pickSize(n)}
                    style={{
                      fontFamily: "var(--font-fredoka)",
                      fontWeight: 600,
                      fontSize: 13,
                      padding: "7px 14px",
                      borderRadius: 999,
                      cursor: "pointer",
                      border: `2px solid ${active ? "#14B79A" : "#E5E8EE"}`,
                      background: active ? "#14B79A" : "#fff",
                      color: active ? "#fff" : "#434A58",
                      transition: "transform .18s",
                    }}
                  >
                    {n} ช่อง
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {[
              { k: "1", v: "หมุนวงล้อ", color: "#F0532B" },
              { k: "2", v: "ออกเสียงที่ได้", color: "#5C5EE6" },
              { k: "3", v: "บอกคำศัพท์ 1 คำ", color: "#14B79A" },
            ].map((r) => (
              <div
                key={r.k}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff",
                  border: "1px solid #E5E8EE",
                  borderRadius: 999,
                  padding: "6px 12px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  boxShadow: "0 8px 18px -14px rgba(0,0,0,.5)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    color: r.color,
                  }}
                >
                  {r.k}
                </span>
                <span style={{ color: "#5A6273", fontWeight: 500 }}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={start}
            style={{
              fontFamily: "var(--font-fredoka)",
              fontWeight: 600,
              fontSize: "clamp(15px,4.6cqi,20px)",
              color: "#fff",
              background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
              border: "none",
              borderRadius: 999,
              padding: "12px 32px",
              cursor: "pointer",
              boxShadow: "0 12px 26px -8px rgba(92,94,230,.6)",
              animation: "pulseGlow 2.4s ease-in-out infinite",
              transition: "transform .2s",
            }}
          >
            เริ่มเล่น 🎧
          </button>
        </div>
      )}

      {stage === 1 && (
        <div
          className={`${styles.screen} ${styles.play}`}
          style={{
            position: "relative",
            zIndex: 5,
            width: "100%",
            margin: "0 auto",
            padding: "6px 16px clamp(8px,2cqb,36px)",
            gap: 8,
          }}
        >
          <div
            style={{
              flex: "1 1 340px",
              minWidth: 300,
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 4,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 3,
                  width: 0,
                  height: 0,
                  borderLeft: "16px solid transparent",
                  borderRight: "16px solid transparent",
                  borderTop: "28px solid #F0532B",
                  filter: "drop-shadow(0 3px 4px rgba(0,0,0,.28))",
                }}
              />
              <canvas
                ref={canvasRef}
                width={680}
                height={680}
                onClick={spin}
                className={styles.wheel}
                style={{
                  display: "block",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 1,
                  touchAction: "manipulation",
                  filter: "drop-shadow(0 22px 32px rgba(26,29,38,.3))",
                }}
              />
            </div>
            <button
              type="button"
              onClick={spin}
              disabled={spinning}
              style={{
                marginTop: 6,
                width: "min(46cqi,430px)",
                fontFamily: "var(--font-fredoka)",
                fontWeight: 600,
                fontSize: 19,
                color: "#fff",
                background: spinBg,
                border: "none",
                borderRadius: 999,
                padding: 16,
                cursor: spinning ? "default" : "pointer",
                boxShadow: "0 14px 28px -10px rgba(240,83,43,.6)",
                transition: "transform .18s",
              }}
            >
              {spinLabel}
            </button>
          </div>

          <div
            style={{
              flex: "1 1 320px",
              minWidth: 290,
              maxWidth: 440,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "1px solid #E5E8EE",
                  borderRadius: 18,
                  padding: "8px 10px",
                  textAlign: "center",
                  boxShadow: "0 12px 26px -22px rgba(0,0,0,.7)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#9AA3B2",
                    fontWeight: 700,
                  }}
                >
                  หมุนแล้ว
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 700,
                    fontSize: 26,
                    color: "#5C5EE6",
                  }}
                >
                  {spins}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "1px solid #E5E8EE",
                  borderRadius: 18,
                  padding: "8px 10px",
                  textAlign: "center",
                  boxShadow: "0 12px 26px -22px rgba(0,0,0,.7)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#9AA3B2",
                    fontWeight: 700,
                  }}
                >
                  ถูกต่อเนื่อง
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 700,
                    fontSize: 26,
                    color: "#14B79A",
                  }}
                >
                  {streak} {fire}
                </div>
              </div>
            </div>

            {result ? (
              <div
                style={{
                  position: "relative",
                  background: "#fff",
                  border: `2px solid ${result.color}`,
                  borderRadius: 26,
                  padding: "clamp(12px,3cqb,22px) 18px",
                  textAlign: "center",
                  boxShadow: "0 24px 46px -30px rgba(26,29,38,.7)",
                  animation: cardAnim,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 16,
                    fontSize: 11,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#9AA3B2",
                    fontWeight: 700,
                  }}
                >
                  {SETS[setKey].label}
                </div>
                <div
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 118,
                    height: 118,
                    borderRadius: "50%",
                    background: result.soft,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: `3px solid ${result.color}`,
                      animation: "soundPulse 1.8s ease-out infinite",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-fredoka)",
                      fontWeight: 700,
                      fontSize: 54,
                      color: result.color,
                      lineHeight: 1,
                    }}
                  >
                    {result.sound}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#5A6273",
                    marginBottom: 4,
                  }}
                >
                  ตัวอย่างคำ
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 700,
                    fontSize: 30,
                    letterSpacing: "-.01em",
                    marginBottom: 14,
                  }}
                >
                  {result.emoji} {result.word}
                </div>
                <button
                  type="button"
                  onClick={speakAgain}
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#fff",
                    background: result.color,
                    border: "none",
                    borderRadius: 999,
                    padding: "12px 26px",
                    cursor: "pointer",
                    boxShadow: "0 12px 24px -12px rgba(0,0,0,.5)",
                    transition: "transform .18s",
                  }}
                >
                  🔊 ฟังเสียงอีกครั้ง
                </button>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={markWrong}
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-fredoka)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#B4331A",
                      background: "#FFE7E0",
                      border: "2px solid #FFC9BB",
                      borderRadius: 16,
                      padding: 13,
                      cursor: "pointer",
                      transition: "transform .18s",
                    }}
                  >
                    ลองอีกครั้ง
                  </button>
                  <button
                    type="button"
                    onClick={markRight}
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-fredoka)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#fff",
                      background: "linear-gradient(135deg,#14B79A,#0E9C84)",
                      border: "none",
                      borderRadius: 16,
                      padding: 13,
                      cursor: "pointer",
                      boxShadow: "0 12px 24px -12px rgba(20,183,154,.8)",
                      transition: "transform .18s",
                    }}
                  >
                    ออกเสียงถูก ⭐
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(255,255,255,.72)",
                  border: "2px dashed #C9CFE0",
                  borderRadius: 26,
                  padding: "clamp(14px,3cqb,30px) 20px",
                  textAlign: "center",
                  animation: "bobIn .4s ease-out",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(24px,5cqb,40px)",
                    marginBottom: 4,
                    animation: "floatY 3s ease-in-out infinite",
                  }}
                >
                  👆
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 600,
                    fontSize: 18,
                    marginBottom: 4,
                  }}
                >
                  กดวงล้อเพื่อหมุน
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#5A6273",
                    lineHeight: 1.4,
                  }}
                >
                  ให้นักเรียนผลัดกันหมุน แล้วออกเสียงพร้อมกันทั้งห้อง
                </div>
              </div>
            )}

            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E8EE",
                borderRadius: 22,
                padding: "14px 16px",
                boxShadow: "0 12px 26px -24px rgba(0,0,0,.7)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#9AA3B2",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                เสียงที่ออกแล้ว
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  minHeight: 34,
                }}
              >
                {history.map((h, i) => (
                  <span
                    key={`${h.sound}-${i}`}
                    style={{
                      fontFamily: "var(--font-fredoka)",
                      fontWeight: 600,
                      fontSize: 14,
                      padding: "7px 13px",
                      borderRadius: 999,
                      background: h.soft,
                      color: h.color,
                      animation: "popIn .3s ease-out",
                    }}
                  >
                    {h.sound}
                  </span>
                ))}
                {history.length === 0 && (
                  <span style={{ fontSize: 13.5, color: "#A9B0BE" }}>
                    ยังไม่มี — หมุนเลย!
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid #E5E8EE",
                }}
              >
                <span
                  onClick={newRound}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#5C5EE6",
                    cursor: "pointer",
                  }}
                >
                  🔀 สลับช่องใหม่
                </span>
                <span
                  onClick={backHome}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#5A6273",
                    cursor: "pointer",
                  }}
                >
                  ⚙️ เปลี่ยนชุดเสียง
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
