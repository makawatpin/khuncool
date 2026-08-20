"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, hoverSfxDelegate } from "@/lib/kcSfx";
import KcFace from "../KcFace";
import { useStage } from "../../_stage/useStage";
import styles from "./PhonicsBingoApp.module.css";

const INTRO_CAST = [
  { skin: "#F6D3B3", hair: "#3B2A22", shirt: "#5C5EE6", glasses: true, capColor: "#FFD166", dur: 3.2, delay: 0 },
  { skin: "#E8B892", hair: "#1F1B18", shirt: "#14B79A", longHair: true, bun: true, capColor: "#FFD166", dur: 3.8, delay: 0.4 },
  { skin: "#FAE0C8", hair: "#6B4A2F", shirt: "#FF8A5C", cap: true, capColor: "#FFD166", dur: 3.5, delay: 0.8 },
];

const LETTERS: [string, string, string][] = [
  ["a", "apple", "🍎"],
  ["b", "ball", "⚽"],
  ["c", "cat", "🐱"],
  ["d", "dog", "🐶"],
  ["e", "egg", "🥚"],
  ["f", "fish", "🐟"],
  ["g", "goat", "🐐"],
  ["h", "hat", "👒"],
  ["i", "igloo", "🧊"],
  ["j", "jam", "🍯"],
  ["k", "key", "🔑"],
  ["l", "leaf", "🍃"],
  ["m", "moon", "🌙"],
  ["n", "nose", "👃"],
  ["o", "octopus", "🐙"],
  ["p", "pig", "🐷"],
  ["r", "rain", "🌧️"],
  ["s", "sun", "☀️"],
  ["t", "tree", "🌳"],
  ["u", "umbrella", "☂️"],
  ["v", "van", "🚐"],
  ["w", "water", "💧"],
  ["y", "yoyo", "🪀"],
  ["z", "zebra", "🦓"],
  ["q", "queen", "👑"],
  ["x", "box", "📦"],
];

const DIGRAPHS: [string, string, string][] = [
  ["sh", "ship", "🚢"],
  ["ch", "chair", "🪑"],
  ["th", "thumb", "👍"],
  ["wh", "whale", "🐳"],
  ["ph", "phone", "📞"],
  ["ck", "duck", "🦆"],
  ["ng", "ring", "💍"],
  ["qu", "queen", "👑"],
  ["ai", "rain", "🌧️"],
  ["ee", "bee", "🐝"],
  ["oa", "boat", "⛵"],
  ["oo", "moon", "🌙"],
  ["ow", "cow", "🐮"],
  ["ar", "star", "⭐"],
  ["or", "fork", "🍴"],
  ["er", "flower", "🌸"],
  ["ay", "day", "🌞"],
  ["igh", "light", "💡"],
  ["ea", "sea", "🌊"],
  ["ie", "pie", "🥧"],
  ["ir", "bird", "🐦"],
  ["ur", "nurse", "🩺"],
  ["oi", "coin", "🪙"],
  ["ou", "cloud", "☁️"],
  ["aw", "saw", "🪚"],
  ["ue", "glue", "🧴"],
];

// Claude-Design-canvas editable props — hardcoded to their defaults.
const GRID_SIZE_DEFAULT = 4;
const SOUND_SET_DEFAULT: SetKey = "digraphs";

type Item = { s: string; w: string; e: string };
type SetKey = "letters" | "digraphs" | "mixed";

type FloatMsg = { text: string; big: boolean } | null;

function shuffle<T>(a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

function pool(set: SetKey): Item[] {
  const map = (a: [string, string, string][]): Item[] =>
    a.map((v) => ({ s: v[0], w: v[1], e: v[2] }));
  if (set === "letters") return map(LETTERS);
  if (set === "digraphs") return map(DIGRAPHS);
  return map(LETTERS.concat(DIGRAPHS));
}

function linesOf(marks: boolean[], n: number): string[] {
  const out: string[] = [];
  for (let r = 0; r < n; r++)
    if (marks.slice(r * n, r * n + n).every(Boolean)) out.push("r" + r);
  for (let c = 0; c < n; c++) {
    let ok = true;
    for (let r = 0; r < n; r++) if (!marks[r * n + c]) ok = false;
    if (ok) out.push("c" + c);
  }
  let d1 = true,
    d2 = true;
  for (let i = 0; i < n; i++) {
    if (!marks[i * n + i]) d1 = false;
    if (!marks[i * n + (n - 1 - i)]) d2 = false;
  }
  if (d1) out.push("d1");
  if (d2) out.push("d2");
  return out;
}

// Picks the clearest available English voice (prefer natural/premium en-US,
// then en-GB) — ported 1:1 from the design source's bestVoice().
function bestVoice(): SpeechSynthesisVoice | null {
  const sy = window.speechSynthesis;
  if (!sy) return null;
  const vs = sy.getVoices().filter((v) => /^en[-_]/i.test(v.lang || ""));
  if (!vs.length) return null;
  const score = (v: SpeechSynthesisVoice) => {
    const n = (v.name || "").toLowerCase();
    let p = 0;
    if (/^en[-_]us/i.test(v.lang)) p += 40;
    else if (/^en[-_]gb/i.test(v.lang)) p += 30;
    else p += 5;
    if (/natural|neural|premium|enhanced|siri/.test(n)) p += 30;
    if (
      /samantha|ava|allison|aria|jenny|serena|daniel|google us english|google uk english female/.test(
        n,
      )
    )
      p += 25;
    if (/google/.test(n)) p += 12;
    if (v.localService) p += 6;
    if (/compact|espeak|novelty|whisper|zarvox|albert|bad news|bells/.test(n))
      p -= 60;
    return p;
  };
  return vs.sort((a, b) => score(b) - score(a))[0];
}

export default function PhonicsBingoApp() {
  useTrackToolUse("media-english-phonics-bingo");
  const { isFull, stageProps, toggle: toggleFull } = useStage<HTMLDivElement>();

  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [set, setSet] = useState<SetKey>(SOUND_SET_DEFAULT);
  const [n, setN] = useState(GRID_SIZE_DEFAULT);
  const [marks, setMarks] = useState<boolean[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [call, setCall] = useState(0);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taps, setTaps] = useState(0);
  const [hits, setHits] = useState(0);
  const [bingo, setBingo] = useState(0);
  const [wrongIdx, setWrongIdx] = useState(-1);
  const [hitIdx, setHitIdx] = useState(-1);
  const [float, setFloat] = useState<FloatMsg>(null);
  const [peek, setPeek] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [muted, setMuted] = useState(() =>
    typeof window === "undefined" ? false : KcSfx.isMuted(),
  );
  const [bgmOn, setBgmOn] = useState(() =>
    typeof window === "undefined" ? true : KcSfx.isBgm(),
  );
  const [cardView, setCardView] = useState<Item[]>([]);
  const [curItem, setCurItem] = useState<Item | null>(null);
  const [confetti, setConfetti] = useState<
    { key: number; left: number; size: number; radius: string; color: string; dur: string; delay: string }[]
  >([]);

  const cardRef = useRef<Item[]>([]);
  const queueRef = useRef<number[]>([]);
  const stageRef = useRef(stage);
  const marksRef = useRef(marks);
  const callRef = useRef(call);
  const nRef = useRef(n);
  const linesRef = useRef(lines);
  const streakRef = useRef(streak);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  useEffect(() => {
    marksRef.current = marks;
  }, [marks]);
  useEffect(() => {
    callRef.current = call;
  }, [call]);
  useEffect(() => {
    nRef.current = n;
  }, [n]);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  const mountedRef = useRef(true);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      if (!mountedRef.current) return;
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current.clear();
  }, []);

  const sfx = useCallback((name: Parameters<typeof KcSfx.play>[0]) => {
    KcSfx.play(name);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    try {
      if (window.speechSynthesis) window.speechSynthesis.getVoices();
    } catch {
      /* ignore */
    }
    return () => {
      mountedRef.current = false;
      clearAllTimeouts();
      try {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [clearAllTimeouts]);

  const voiceWaitRef = useRef(false);

  const say = useCallback(
    (text: string, rate: number, pitch: number, delay?: number) => {
      const sy = window.speechSynthesis;
      if (!sy) return;
      const u = new SpeechSynthesisUtterance(text);
      const v = bestVoice();
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      } else {
        u.lang = "en-US";
      }
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      if (delay) later(() => sy.speak(u), delay);
      else sy.speak(u);
    },
    [later],
  );

  const speak = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      try {
        const sy = window.speechSynthesis;
        if (!sy) return;
        if (!sy.getVoices().length && !voiceWaitRef.current) {
          voiceWaitRef.current = true;
          sy.addEventListener(
            "voiceschanged",
            () => {
              voiceWaitRef.current = false;
            },
            { once: true },
          );
        }
        sy.cancel();
        say(item.s, 0.55, 1.05, 0);
        say(item.s, 0.55, 1.05, 700);
        say(item.w, 0.8, 1.0, 1500);
      } catch {
        /* ignore */
      }
    },
    [say],
  );

  const makeConfetti = useCallback((count: number) => {
    const colors = ["#5C5EE6", "#14B79A", "#FFD166", "#FF8A5C", "#C6C9FB", "#28D3B4"];
    return Array.from({ length: count }, (_, k) => ({
      key: Date.now() + k,
      left: Math.round(Math.random() * 100),
      size: 7 + Math.round(Math.random() * 10),
      radius: k % 3 === 0 ? "50%" : "3px",
      color: colors[k % 6],
      dur: (1.5 + Math.random() * 1.4).toFixed(2),
      delay: (Math.random() * 0.5).toFixed(2),
    }));
  }, []);

  const start = useCallback(() => {
    KcSfx.unlock();
    sfx("whoosh");
    const total = n * n;
    const card = shuffle(pool(set)).slice(0, total);
    const queue = shuffle(card.map((_, i) => i));
    cardRef.current = card;
    queueRef.current = queue;
    setStage(1);
    setCardView(card);
    setCurItem(card[queue[0]]);
    setMarks(new Array(total).fill(false));
    setLines([]);
    setCall(0);
    setStars(0);
    setStreak(0);
    setTaps(0);
    setHits(0);
    setBingo(0);
    setWrongIdx(-1);
    setHitIdx(-1);
    setFloat(null);
    setReveal(false);
    setConfetti([]);
    later(() => speak(card[queue[0]]), 450);
  }, [n, set, sfx, later, speak]);

  const home = useCallback(() => {
    sfx("click");
    setStage(0);
  }, [sfx]);

  const speakAgain = useCallback(() => {
    sfx("click");
    speak(cardRef.current[queueRef.current[callRef.current]]);
  }, [sfx, speak]);

  const tap = useCallback(
    (i: number) => {
      if (stageRef.current !== 1 || marksRef.current[i]) return;
      const target = queueRef.current[callRef.current];
      const wanted = cardRef.current[target].s;
      if (cardRef.current[i].s !== wanted) {
        sfx("wrong");
        setWrongIdx(i);
        setStreak(0);
        setTaps((t) => t + 1);
        later(() => setWrongIdx(-1), 500);
        return;
      }
      const marks = marksRef.current.slice();
      marks[i] = true;
      const curN = nRef.current;
      const lines = linesOf(marks, curN);
      const newLines = lines.length - linesRef.current.length;
      const streak = streakRef.current + 1;
      const bonus = (newLines > 0 ? 3 * newLines : 0) + (streak % 3 === 0 ? 1 : 0);
      sfx(newLines > 0 ? "combo" : streak % 3 === 0 ? "star" : "correct");
      later(() => sfx("pop"), 200);

      setMarks(marks);
      setLines(lines);
      setHitIdx(i);
      setWrongIdx(-1);
      setStreak(streak);
      setReveal(true);
      setTaps((t) => t + 1);
      setHits((h) => h + 1);
      setStars((s) => s + 1 + bonus);
      setBingo((b) => (newLines > 0 ? b + 1 : b));
      if (newLines > 0) {
        setConfetti(makeConfetti(40));
        later(() => setConfetti([]), 2900);
      }
      setFloat({
        text:
          newLines > 0
            ? "BINGO +" + 3 * newLines + " ⭐"
            : "+" + (1 + bonus) + " ⭐",
        big: newLines > 0,
      });
      if (newLines > 0) later(() => sfx("win"), 380);
      later(() => setFloat(null), 1300);

      const done = marks.every(Boolean);
      if (done) {
        later(
          () => {
            sfx("win");
            setStage(2);
            setConfetti(makeConfetti(60));
          },
          newLines > 0 ? 1500 : 700,
        );
        return;
      }
      later(
        () => {
          let nextCall = callRef.current + 1;
          while (
            nextCall < queueRef.current.length &&
            marksRef.current[queueRef.current[nextCall]]
          )
            nextCall++;
          setCall(nextCall);
          setHitIdx(-1);
          setReveal(false);
          setCurItem(cardRef.current[queueRef.current[nextCall]]);
          speak(cardRef.current[queueRef.current[nextCall]]);
        },
        newLines > 0 ? 1500 : 700,
      );
    },
    [sfx, later, speak, makeConfetti],
  );

  const inLine = useCallback(
    (i: number) => {
      const r = Math.floor(i / n),
        c = i % n;
      return lines.some(
        (l) =>
          l === "r" + r ||
          l === "c" + c ||
          (l === "d1" && r === c) ||
          (l === "d2" && r + c === n - 1),
      );
    },
    [lines, n],
  );

  const togglePeek = useCallback(() => {
    sfx("click");
    setPeek((p) => !p);
  }, [sfx]);

  const toggleBgm = useCallback(() => {
    KcSfx.unlock();
    KcSfx.bgm(!KcSfx.isBgm());
    setBgmOn(KcSfx.isBgm());
  }, []);

  const toggleMute = useCallback(() => {
    KcSfx.unlock();
    KcSfx.toggleMuted();
    setMuted(KcSfx.isMuted());
    sfx("click");
  }, [sfx]);

  const card = cardView;
  const total = n * n;
  const marked = marks.filter(Boolean).length;
  const cur = curItem;
  const shown = !!cur && (peek || reveal);
  const acc = taps ? Math.round((hits / taps) * 100) : 100;
  const progressPct = total ? Math.round((marked / total) * 100) : 0;

  const setBtn = (key: SetKey, label: string) => ({
    key,
    label,
    pick: () => {
      sfx("click");
      setSet(key);
    },
    bg: set === key ? "#E1E3FD" : "#fff",
    border: set === key ? "#5C5EE6" : "#E5E8EE",
    fg: set === key ? "#3F41C9" : "#5A6273",
  });
  const sizeBtn = (k: number, label: string) => ({
    key: k,
    label,
    pick: () => {
      sfx("click");
      setN(k);
    },
    bg: n === k ? "#DDF8F1" : "#fff",
    border: n === k ? "#14B79A" : "#E5E8EE",
    fg: n === k ? "#0E8C77" : "#5A6273",
  });

  const setChoices = [
    setBtn("letters", "ตัวอักษร a–z"),
    setBtn("digraphs", "sh ch th · สระผสม"),
    setBtn("mixed", "ผสมทั้งหมด"),
  ];
  const sizeChoices = [
    sizeBtn(3, "3 × 3 ง่าย"),
    sizeBtn(4, "4 × 4 ปกติ"),
    sizeBtn(5, "5 × 5 ท้าทาย"),
  ];
  const rules = [
    { k: "🔊", v: "ฟังเสียงที่ครูเรียก", color: "#3F41C9" },
    { k: "✅", v: "แตะช่องที่ตรงกับเสียง", color: "#0E8C77" },
    { k: "🏅", v: "ครบแถว = BINGO โบนัส ⭐", color: "#C2500B" },
  ];

  const resultEmoji = lines.length >= 4 ? "🏆" : lines.length >= 2 ? "🎉" : "💪";
  const resultTitle =
    acc >= 90 ? "หูไวสุด ๆ!" : acc >= 70 ? "เยี่ยมมาก!" : "เก่งขึ้นเรื่อย ๆ";
  const resultStars = [0, 1, 2].map((k) => ({
    o: acc / 100 > k * 0.3 + 0.3 ? 1 : 0.22,
  }));

  return (
    <div {...stageProps} className="kc-stage">
    <div
      className={`kc-stage-body ${styles.body} kc-game kc-bingo-game kc-stage-${stage}`}
      onMouseOver={hoverSfxDelegate}
      style={{
        // position, overflow and height belong to .kc-stage-body; setting them
        // inline leaves the body in flow and free to outgrow the stage.
        borderRadius: 24,
        background:
          "linear-gradient(170deg,#EAF1FF 0%,#EFF0FE 45%,#E6FBF6 100%)",
      }}
    >
      {/* decorative background blobs */}
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 56,
          width: 120,
          height: 120,
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
          top: -90,
          left: -110,
          width: 340,
          height: 340,
          borderRadius: 999,
          background: "radial-gradient(circle,#C6C9FB 0%,transparent 70%)",
          filter: "blur(6px)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 280,
          right: -140,
          width: 400,
          height: 400,
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
          bottom: -120,
          left: "24%",
          width: 320,
          height: 320,
          borderRadius: 999,
          background: "radial-gradient(circle,#FFE0C2 0%,transparent 70%)",
          filter: "blur(6px)",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

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
            key={c.key}
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
        {float && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "34%",
              fontWeight: 700,
              fontSize: float.big ? 36 : 28,
              color: float.big ? "#C2500B" : "#0E8C77",
              textShadow: "0 3px 0 rgba(255,255,255,.9)",
              animation: "floatUp 1.3s ease-out forwards",
            }}
          >
            {float.text}
          </div>
        )}
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
            style={{ width: 38, height: 38, flex: "none", objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(92,94,230,.5))" }}
          />
          <div className="kc-title" style={{ fontWeight: 600, fontSize: 18 }}>Phonics Bingo</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/media/english"
            style={{
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
            className="kc-tap-chrome"
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
              background: bgmOn ? "#EFFBF8" : "#fff",
              color: bgmOn ? "#0E8C77" : "#5A6273",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
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
              {[0, 1, 2].map((k) => (
                <span
                  key={k}
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: bgmOn ? "#14B79A" : "#C9CEDA",
                    transformOrigin: "bottom",
                    animation: bgmOn
                      ? `eqBar ${(0.6 + k * 0.18).toFixed(2)}s ease-in-out infinite`
                      : "none",
                  }}
                />
              ))}
            </span>
            <span>{bgmOn ? "เพลง" : "ปิดเพลง"}</span>
          </button>
          <button
            className="kc-tap-chrome"
            type="button"
            onClick={toggleMute}
            title="เสียงเอฟเฟกต์"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid #E5E8EE",
              background: muted ? "#F1F3F7" : "#fff",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            className="kc-tap-chrome"
            type="button"
            onClick={toggleFull}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid #E5E8EE",
              background: isFull ? "#EEEEFD" : "#fff",
              fontSize: 16,
              cursor: "pointer",
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
              fontWeight: 600,
              fontSize: 15,
              color: "#C2500B",
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
            maxWidth: 760,
            margin: "4px auto 0",
            padding: "0 20px 20px",
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: 10,
              marginBottom: 6,
            }}
          >
            {INTRO_CAST.map((p, i) => (
              <div key={i} style={{ animation: `floatY ${p.dur}s ease-in-out infinite ${p.delay}s` }}>
                <KcFace {...p} size={44} />
              </div>
            ))}
          </div>
          <h1
            style={{
              fontWeight: 700,
              fontSize: "clamp(24px,6cqi,48px)",
              margin: "0 0 6px",
            }}
          >
            ฟังเสียง แล้วแตะ
            <span
              style={{
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              BINGO!
            </span>
          </h1>
          <p
            style={{
              fontSize: "clamp(13px,3.6cqi,17px)",
              lineHeight: 1.4,
              color: "#5A6273",
              margin: "0 0 10px",
            }}
          >
            ครูกดปุ่มออกเสียง นักเรียนหาช่องที่ตรงกับเสียงบนการ์ด
            — ครบแถวไหนก็ตะโกน BINGO ได้เลย!
          </p>

          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 24,
              padding: "10px 12px 12px",
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
              {setChoices.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={c.pick}
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: `2px solid ${c.border}`,
                    background: c.bg,
                    color: c.fg,
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              ))}
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
              ขนาดการ์ด
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {sizeChoices.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={c.pick}
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: `2px solid ${c.border}`,
                    background: c.bg,
                    color: c.fg,
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {rules.map((r) => (
              <div
                key={r.v}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff",
                  border: "1px solid #E5E8EE",
                  borderRadius: 999,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: r.color }}>{r.k}</span>
                <span style={{ color: "#5A6273", fontWeight: 500 }}>{r.v}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={start}
            style={{
              fontWeight: 600,
              fontSize: "clamp(16px,4.6cqi,20px)",
              color: "#fff",
              background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
              border: "none",
              borderRadius: 999,
              padding: "12px 32px",
              animation: "pulseGlow 2.4s ease-in-out infinite",
              cursor: "pointer",
              boxShadow: "0 12px 26px -8px rgba(92,94,230,.6)",
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
            maxWidth: 920,
            margin: "0 auto",
            padding: "4px 14px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 120,
                height: 12,
                borderRadius: 999,
                background: "#fff",
                border: "1px solid #E5E8EE",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#5C5EE6,#14B79A)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "#FFF6E2",
                color: "#C2500B",
                borderRadius: 999,
                padding: "6px 12px",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <span>🏅</span> {lines.length} แถว
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: streak >= 3 ? "#FFEDD3" : "#fff",
                color: streak >= 3 ? "#C2500B" : "#5A6273",
                borderRadius: 999,
                padding: "6px 12px",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <span
                style={{
                  animation:
                    streak >= 3 ? "flameGrow .8s ease-in-out infinite" : "none",
                }}
              >
                🔥
              </span>{" "}
              {streak}
            </div>
          </div>

          <div
            className={styles.board}
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
              gap: "clamp(12px,3cqi,22px)",
              alignItems: "start",
            }}
          >
            <div
              style={{
                position: "relative",
                background: "#fff",
                borderRadius: 26,
                padding: "clamp(10px,3cqi,24px)",
                textAlign: "center",
                border: "1px solid #EEF0F5",
                overflow: "hidden",
                boxShadow: "0 24px 44px -26px rgba(26,29,38,.55)",
                animation: "bobIn .4s ease-out both",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: "linear-gradient(90deg,#5C5EE6,#14B79A)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "40%",
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",
                    animation: "sweep 2.6s ease-in-out infinite",
                  }}
                />
              </div>
              <div
                className={styles.listenLabel}
                style={{
                  fontSize: 12,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#9AA3B2",
                  fontWeight: 700,
                  margin: "6px 0 10px",
                }}
              >
                เสียงที่เรียก
              </div>
              <div
                key={"c" + call}
                className={styles.callBlock}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  minHeight: "clamp(90px,24cqi,190px)",
                  animation: "popIn .45s cubic-bezier(.3,1.5,.5,1) both",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    border: "3px solid #C6D6FB",
                    pointerEvents: "none",
                    animation: "sonar 1.6s ease-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    border: "3px solid #B6F3E4",
                    pointerEvents: "none",
                    animation: "sonar 1.6s ease-out .8s infinite",
                  }}
                />
                <div
                  className={styles.callMain}
                  style={{
                    position: "relative",
                    fontWeight: 700,
                    fontSize: "clamp(32px,9cqi,72px)",
                    lineHeight: 1.05,
                    color: shown ? "#3F41C9" : "#5C5EE6",
                  }}
                >
                  {shown ? `/${cur!.s}/` : "🎧"}
                </div>
                <div
                  className={styles.callWord}
                  style={{
                    fontSize: "clamp(34px,9cqi,50px)",
                    lineHeight: 1,
                    opacity: shown ? 1 : 0.55,
                  }}
                >
                  {shown ? cur!.e : ""}
                </div>
                <div
                  className={styles.callLabel}
                  style={{
                    fontWeight: 600,
                    fontSize: "clamp(15px,4cqi,19px)",
                    color: "#0E8C77",
                    opacity: shown ? 1 : 0.55,
                  }}
                >
                  {shown ? cur!.w : "ฟังให้ดี…"}
                </div>
              </div>
              <button
                type="button"
                onClick={speakAgain}
                className={styles.listenBtn}
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#fff",
                  background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 22px",
                  minHeight: 40,
                  cursor: "pointer",
                  boxShadow: "0 12px 24px -10px rgba(92,94,230,.6)",
                }}
              >
                🔊 ฟังอีกครั้ง
              </button>
              <div
                className={styles.listenFoot}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={togglePeek}
                  title="สำหรับครู"
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: "1px solid #E5E8EE",
                    background: peek ? "#FFF6E2" : "#fff",
                    color: peek ? "#C2500B" : "#5A6273",
                    cursor: "pointer",
                  }}
                >
                  {peek ? "🙈 ซ่อนเฉลย" : "👀 ครูดูเฉลย"}
                </button>
                <div style={{ fontSize: 13, color: "#9AA3B2", fontWeight: 600 }}>
                  เหลืออีก {total - marked} ช่อง
                </div>
              </div>
            </div>

            <div className={styles.cardArea} style={{ position: "relative" }}>
              <div
                className={styles.card}
                style={{
                  gridTemplateColumns: `repeat(${n},1fr)`,
                  gap: "clamp(6px,1.6cqi,12px)",
                  background: "#fff",
                  border: "1px solid #E5E8EE",
                  borderRadius: 24,
                  padding: "clamp(8px,2cqi,14px)",
                  boxShadow: "0 24px 44px -30px rgba(26,29,38,.55)",
                }}
              >
                {card.map((it, i) => {
                  const on = marks[i];
                  const lit = on && inLine(i);
                  const stamp = lit ? "🏅" : "✅";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => tap(i)}
                      style={{
                        position: "relative",
                        aspectRatio: "1/1",
                        minHeight: 44,
                        borderRadius: 16,
                        border: `3px solid ${
                          on
                            ? lit
                              ? "#FFB020"
                              : "#B6F3E4"
                            : wrongIdx === i
                              ? "#FBD5D5"
                              : "#E1E3FD"
                        }`,
                        background: on
                          ? lit
                            ? "#FFF3D6"
                            : "#EFFBF8"
                          : wrongIdx === i
                            ? "#FFF1F1"
                            : "#F7F8FF",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        animation:
                          wrongIdx === i
                            ? "shake .5s ease-in-out"
                            : lit
                              ? "lineGlow 1.6s ease-in-out infinite"
                              : "none",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "clamp(17px,4.4cqi,30px)",
                          lineHeight: 1,
                          color: on ? "#0E8C77" : "#3F41C9",
                        }}
                      >
                        {it.s}
                      </span>
                      <span
                        style={{
                          fontSize: "clamp(12px,3cqi,20px)",
                          lineHeight: 1,
                          opacity: on ? 0.25 : 0.85,
                        }}
                      >
                        {it.e}
                      </span>
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "clamp(24px,6cqi,40px)",
                          opacity: on ? 1 : 0,
                          animation:
                            hitIdx === i
                              ? "stampIn .45s cubic-bezier(.3,1.6,.5,1) both"
                              : "none",
                        }}
                      >
                        {stamp}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 30,
            }}
          >
            <div
              key={bingo}
              style={{
                fontWeight: 700,
                fontSize: "clamp(52px,15cqi,120px)",
                color: "#FFB020",
                textShadow: "0 6px 0 #fff,0 12px 30px rgba(0,0,0,.25)",
                opacity: 0,
                animation: bingo
                  ? "bingoIn 1.5s cubic-bezier(.3,1.4,.5,1) forwards"
                  : "none",
              }}
            >
              BINGO!
            </div>
          </div>
        </div>
      )}

      {stage === 2 && (
        <div
          className={`${styles.screen} ${styles.result}`}
          style={{
            position: "relative",
            zIndex: 5,
            width: "100%",
            maxWidth: 620,
            margin: "0 auto",
            padding: "10px 18px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 30,
              padding: "clamp(24px,6cqi,40px) clamp(18px,5cqi,32px)",
              boxShadow: "0 30px 60px -34px rgba(26,29,38,.6)",
              animation: "popIn .5s cubic-bezier(.3,1.5,.5,1) both",
            }}
          >
            <div
              style={{
                fontSize: "clamp(52px,14cqi,76px)",
                lineHeight: 1,
                animation: "floatY 3s ease-in-out infinite",
              }}
            >
              {resultEmoji}
            </div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "clamp(26px,6cqi,36px)",
                margin: "10px 0 6px",
              }}
            >
              {resultTitle}
            </h2>
            <p style={{ color: "#5A6273", fontSize: 16, margin: "0 0 18px" }}>
              ทำได้ {lines.length} แถว · แตะถูก {hits} ครั้ง · แม่นยำ {acc}%
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginBottom: 22,
              }}
            >
              {resultStars.map((s, i) => (
                <span
                  key={i}
                  style={{ fontSize: "clamp(34px,9cqi,46px)", opacity: s.o }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={start}
                style={{
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#fff",
                  background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                  border: "none",
                  borderRadius: 999,
                  padding: "14px 34px",
                  minHeight: 48,
                  cursor: "pointer",
                  boxShadow: "0 12px 26px -10px rgba(92,94,230,.6)",
                }}
              >
                เล่นอีกครั้ง 🔁
              </button>
              <button
                type="button"
                onClick={home}
                style={{
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#5C5EE6",
                  background: "#E1E3FD",
                  border: "none",
                  borderRadius: 999,
                  padding: "14px 30px",
                  minHeight: 48,
                  cursor: "pointer",
                }}
              >
                ตั้งค่าใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
