"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, speakEnglish, hoverSfxDelegate } from "@/lib/kcSfx";
import GameBackdrop from "../GameBackdrop";
import { useStage } from "../../_stage/useStage";
import styles from "./ClassroomObjectsApp.module.css";

type Word = { emoji: string; en: string; th: string };

const WORDS: Word[] = [
  { emoji: "✏️", en: "pencil", th: "ดินสอ" },
  { emoji: "📕", en: "book", th: "หนังสือ" },
  { emoji: "📏", en: "ruler", th: "ไม้บรรทัด" },
  { emoji: "🎒", en: "schoolbag", th: "กระเป๋านักเรียน" },
  { emoji: "✂️", en: "scissors", th: "กรรไกร" },
  { emoji: "🖍️", en: "crayon", th: "สีเทียน" },
  { emoji: "📐", en: "set square", th: "ไม้ฉาก" },
  { emoji: "🖊️", en: "pen", th: "ปากกา" },
  { emoji: "📒", en: "notebook", th: "สมุด" },
  { emoji: "🪑", en: "chair", th: "เก้าอี้" },
  { emoji: "🗒️", en: "desk", th: "โต๊ะเรียน" },
  { emoji: "🕐", en: "clock", th: "นาฬิกา" },
  { emoji: "🧮", en: "abacus", th: "ลูกคิด" },
  { emoji: "🌍", en: "globe", th: "ลูกโลก" },
  { emoji: "🖌️", en: "paintbrush", th: "พู่กัน" },
  { emoji: "📌", en: "pin", th: "เข็มหมุด" },
  { emoji: "📎", en: "paper clip", th: "คลิปหนีบกระดาษ" },
  { emoji: "🗑️", en: "bin", th: "ถังขยะ" },
  { emoji: "🪟", en: "window", th: "หน้าต่าง" },
  { emoji: "🚪", en: "door", th: "ประตู" },
  { emoji: "🧴", en: "glue", th: "กาว" },
  { emoji: "💡", en: "light", th: "หลอดไฟ" },
  { emoji: "🖥️", en: "computer", th: "คอมพิวเตอร์" },
  { emoji: "🗓️", en: "calendar", th: "ปฏิทิน" },
  { emoji: "🎨", en: "paint", th: "สีน้ำ" },
  { emoji: "📝", en: "worksheet", th: "ใบงาน" },
  { emoji: "📖", en: "dictionary", th: "พจนานุกรม" },
  { emoji: "📚", en: "bookshelf", th: "ชั้นหนังสือ" },
  { emoji: "🖇️", en: "stapler", th: "ที่เย็บกระดาษ" },
  { emoji: "📁", en: "folder", th: "แฟ้ม" },
  { emoji: "📄", en: "paper", th: "กระดาษ" },
  { emoji: "🔖", en: "bookmark", th: "ที่คั่นหนังสือ" },
  { emoji: "🧑‍🏫", en: "teacher", th: "คุณครู" },
  { emoji: "🎓", en: "student", th: "นักเรียน" },
  { emoji: "🏫", en: "school", th: "โรงเรียน" },
  { emoji: "🔔", en: "bell", th: "กระดิ่ง" },
  { emoji: "🚩", en: "flag", th: "ธง" },
  { emoji: "🗺️", en: "map", th: "แผนที่" },
  { emoji: "🧯", en: "fire extinguisher", th: "ถังดับเพลิง" },
  { emoji: "🥤", en: "water bottle", th: "ขวดน้ำ" },
  { emoji: "🍱", en: "lunch box", th: "กล่องข้าว" },
  { emoji: "🪣", en: "bucket", th: "ถังน้ำ" },
  { emoji: "🧹", en: "broom", th: "ไม้กวาด" },
  { emoji: "🔍", en: "magnifier", th: "แว่นขยาย" },
  { emoji: "🧲", en: "magnet", th: "แม่เหล็ก" },
  { emoji: "✒️", en: "marker", th: "ปากกาเมจิก" },
  { emoji: "🔬", en: "microscope", th: "กล้องจุลทรรศน์" },
];

// Claude-Design-canvas editable props — hardcoded to their defaults.
const PAIR_COUNT = 6;
const SHOW_THAI = true;

type Card = {
  id: string;
  pair: number;
  kind: "pic" | "word";
  w: Word;
  up: boolean;
  done: boolean;
};

type Feedback = { ok: boolean; combo?: boolean; w: Word | null };

type ConfettiPiece = {
  key: number;
  left: number;
  size: number;
  radius: string;
  color: string;
  dur: string;
  delay: string;
};

type Floater = { key: number; text: string; big: boolean };

function shuffle<T>(a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

const INTRO_CARDS = [
  { emoji: "✏️", rot: -8, dur: 3.2, delay: 0 },
  { emoji: "📕", rot: 4, dur: 3.8, delay: 0.3 },
  { emoji: "🎒", rot: -4, dur: 3.5, delay: 0.6 },
  { emoji: "✂️", rot: 9, dur: 4.1, delay: 0.9 },
];

const RULES = [
  { k: "🃏", v: "พลิกการ์ด 2 ใบ หาคู่รูป+คำ", color: "#3F41C9" },
  { k: "🔊", v: "จับคู่ถูก ฟังเสียงอ่านคำศัพท์", color: "#0E8C77" },
  { k: "⭐", v: "ถูก 3 คู่ติด = โบนัสคอมโบ", color: "#C2500B" },
];

export default function ClassroomObjectsApp() {
  useTrackToolUse("media-english-classroom-objects");
  const { isFull, stageProps, toggle: toggleFull } = useStage<HTMLDivElement>();

  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [pairs, setPairs] = useState<Word[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [misses, setMisses] = useState(0);
  const [found, setFound] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [reactTop, setReactTop] = useState(50);
  const [lock, setLock] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [shakeIds, setShakeIds] = useState<string[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [muted, setMuted] = useState(() =>
    typeof window === "undefined" ? false : KcSfx.isMuted(),
  );
  const [bgmOn, setBgmOn] = useState(() =>
    typeof window === "undefined" ? true : KcSfx.isBgm(),
  );

  const stageRef = useRef(stage);
  const openRef = useRef(open);
  const lockRef = useRef(lock);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    lockRef.current = lock;
  }, [lock]);

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
    return () => {
      mountedRef.current = false;
      if (clockRef.current) clearInterval(clockRef.current);
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  const makeConfetti = useCallback((count: number) => {
    const colors = ["#5C5EE6", "#14B79A", "#FFD166", "#FF8A5C", "#C6C9FB", "#28D3B4"];
    return Array.from({ length: count }, (_, k) => ({
      key: Date.now() + k,
      left: Math.round(Math.random() * 100),
      size: 7 + Math.round(Math.random() * 9),
      radius: k % 3 === 0 ? "50%" : "3px",
      color: colors[k % 6],
      dur: (1.5 + Math.random() * 1.3).toFixed(2),
      delay: (Math.random() * 0.5).toFixed(2),
    }));
  }, []);

  const start = useCallback(() => {
    KcSfx.unlock();
    sfx("whoosh");
    const picked = shuffle(WORDS).slice(0, PAIR_COUNT);
    setPairs(picked);
    let built: Card[] = [];
    picked.forEach((w, k) => {
      built.push({ id: "p" + k, pair: k, kind: "pic", w, up: false, done: false });
      built.push({ id: "w" + k, pair: k, kind: "word", w, up: false, done: false });
    });
    built = shuffle(built);
    if (clockRef.current) clearInterval(clockRef.current);
    clockRef.current = setInterval(() => {
      if (stageRef.current === 1) setSeconds((s) => s + 1);
    }, 1000);
    setStage(1);
    setCards(built);
    setOpen([]);
    setStars(0);
    setStreak(0);
    setBest(0);
    setMisses(0);
    setFound(0);
    setFb(null);
    setLock(false);
    setSeconds(0);
    setShakeIds([]);
    setConfetti([]);
    setFloaters([]);
  }, [sfx]);

  const flip = useCallback(
    (idx: number) => {
      if (lockRef.current) return;
      setCards((prevCards) => {
        const c = prevCards[idx];
        if (!c || c.done || c.up) return prevCards;
        KcSfx.unlock();
        sfx("pop");
        const nextCards = prevCards.map((x, i) =>
          i === idx ? { ...x, up: true } : x,
        );
        const nextOpen = openRef.current.concat([idx]);
        if (nextOpen.length < 2) {
          setOpen(nextOpen);
          setFb(null);
          return nextCards;
        }

        const a = nextCards[nextOpen[0]];
        const b = nextCards[nextOpen[1]];
        if (a.pair === b.pair) {
          setStreak((prevStreak) => {
            const streakVal = prevStreak + 1;
            const combo = streakVal > 0 && streakVal % 3 === 0;
            sfx(combo ? "combo" : "correct");
            later(() => speakEnglish(a.w.en, true), 260);
            setBest((prevBest) => Math.max(prevBest, streakVal));
            setStars((s) => s + 1 + (combo ? 2 : 0));
            setFb({ ok: true, combo, w: a.w });
            setFloaters([
              {
                key: Date.now(),
                text: combo ? "COMBO +3 ⭐" : "+1 ⭐",
                big: !!combo,
              },
            ]);
            setConfetti(makeConfetti(combo ? 44 : 24));
            later(() => {
              setConfetti([]);
              setFloaters([]);
            }, 1300);
            return streakVal;
          });
          setLock(true);
          setOpen([]);
          setReactTop(24 + Math.round(Math.random() * 40));
          setFound((prevFound) => {
            const nf = prevFound + 1;
            if (nf >= PAIR_COUNT) {
              later(() => {
                if (clockRef.current) clearInterval(clockRef.current);
                sfx("win");
                setStage(2);
                setConfetti(makeConfetti(60));
                setLock(false);
                setFb(null);
              }, 900);
            } else {
              later(() => setLock(false), 520);
            }
            return nf;
          });
          return nextCards.map((x) =>
            x.pair === a.pair ? { ...x, done: true, up: true } : x,
          );
        } else {
          sfx("wrong");
          setStreak(0);
          setMisses((m) => m + 1);
          setShakeIds([a.id, b.id]);
          setLock(true);
          setFb({ ok: false, w: null });
          setOpen(nextOpen);
          later(() => {
            setCards((cs) =>
              cs.map((x) =>
                (x.id === a.id || x.id === b.id) && !x.done
                  ? { ...x, up: false }
                  : x,
              ),
            );
            setOpen([]);
            setLock(false);
            setShakeIds([]);
            setFb(null);
          }, 1000);
          return nextCards;
        }
      });
    },
    [sfx, later, makeConfetti],
  );

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

  const speakReview = useCallback(
    (w: Word) => {
      sfx("click");
      speakEnglish(w.en, true);
    },
    [sfx],
  );

  const total = PAIR_COUNT;
  const n = cards.length || total * 2;
  const cols = n <= 8 ? 4 : n <= 12 ? 4 : n <= 16 ? 4 : n <= 20 ? 5 : 6;
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const timeLabel = mm + ":" + (ss < 10 ? "0" + ss : ss);
  const progressPct = Math.round((found / total) * 100);

  const resultEmoji = misses === 0 ? "🏆" : misses <= total ? "🎉" : "💪";
  const resultTitle =
    misses === 0
      ? "เพอร์เฟกต์! ความจำสุดยอด"
      : misses <= total
        ? "เยี่ยมมาก!"
        : "เก่งมาก ลองอีกรอบให้ไวขึ้น";
  const resultStars = [0, 1, 2].map((k) => ({
    o: misses <= [0, total, total * 2][k] ? 1 : 0.22,
  }));

  return (
    <div {...stageProps} className="kc-stage">
    <div
      className={`kc-stage-body ${styles.body} kc-game kc-classroom-game kc-stage-${stage}`}
      onMouseOver={hoverSfxDelegate}
      style={{
        // position and overflow belong to .kc-stage-body — setting them inline
        // here left the body in flow, free to grow past the stage it sits in.
        borderRadius: 24,
        background:
          "linear-gradient(170deg,#EAF1FF 0%,#EFF0FE 45%,#E6FBF6 100%)",
      }}
    >
      <GameBackdrop
        sun={{ top: 30, right: 56, size: 120, from: "#FFE59A", via: "#FFD166" }}
        blobs={[
          { top: -90, left: -110, size: 340, color: "#C6C9FB" },
          { top: 280, right: -140, size: 400, color: "#B6F3E4" },
          { bottom: -120, left: "24%", size: 320, color: "#FFE0C2" },
        ]}
        clouds={[{ top: 90, dur: 48 }]}
      />
      {/* top bar */}
      <div
        className={styles.topbar}
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
          <div className="kc-title" style={{ fontWeight: 600, fontSize: 18 }}>
            Classroom Objects Match
          </div>
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
            type="button"
            onClick={toggleFull}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid #E5E8EE",
              background: isFull ? "#FFF0E4" : "#fff",
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
          className={styles.intro}
          style={{
            position: "relative",
            zIndex: 5,
            maxWidth: 760,
            margin: "6px auto 0",
            padding: "0 20px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "clamp(8px,3cqi,18px)",
              marginBottom: 20,
            }}
          >
            {INTRO_CARDS.map((p, i) => (
              <div
                key={i}
                style={{
                  width: "clamp(56px,15cqi,86px)",
                  height: "clamp(72px,19cqi,110px)",
                  borderRadius: 18,
                  background: "#fff",
                  border: "1px solid #EEF0F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(28px,7cqi,42px)",
                  transform: `rotate(${p.rot}deg)`,
                  animation: `floatY ${p.dur}s ease-in-out infinite ${p.delay}s`,
                  boxShadow: "0 18px 30px -20px rgba(26,29,38,.6)",
                }}
              >
                {p.emoji}
              </div>
            ))}
          </div>
          <h1
            style={{
              fontWeight: 700,
              fontSize: "clamp(30px,6cqi,46px)",
              margin: "0 0 12px",
            }}
          >
            จับคู่
            <span
              style={{
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              ของใช้ในห้องเรียน{" "}
            </span>
            🎒
          </h1>
          <p
            style={{
              fontSize: "clamp(15px,3.6cqi,17px)",
              lineHeight: 1.75,
              color: "#5A6273",
              margin: "0 0 26px",
            }}
          >
            พลิกการ์ดหาคู่ รูปภาพ ↔ คำศัพท์ภาษาอังกฤษ จับคู่ถูกได้ ⭐
            ติดกันได้คอมโบ! เล่นได้ทั้งบนคอมพิวเตอร์และมือถือ
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
              marginBottom: 30,
            }}
          >
            {RULES.map((r) => (
              <div
                key={r.v}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  border: "1px solid #E5E8EE",
                  borderRadius: 999,
                  padding: "9px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: "0 8px 18px -14px rgba(0,0,0,.5)",
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
              fontSize: "clamp(17px,4.6cqi,20px)",
              color: "#fff",
              background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
              border: "none",
              borderRadius: 999,
              padding: "16px 44px",
              animation: "pulseGlow 2.4s ease-in-out infinite",
              cursor: "pointer",
            }}
          >
            เริ่มเล่น 🚀
          </button>
        </div>
      )}

      {stage === 1 && (
        <div
          className={styles.play}
          style={{
            position: "relative",
            zIndex: 5,
            width: "100%",
            maxWidth: 880,
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
            <div style={{ fontWeight: 600, fontSize: 14, color: "#5A6273" }}>
              คู่ {found}/{total}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "#fff",
                border: "1px solid #E5E8EE",
                borderRadius: 999,
                padding: "6px 12px",
                fontWeight: 600,
                fontSize: 14,
                color: "#5A6273",
              }}
            >
              ⏱ {timeLabel}
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
                animation: streak >= 3 ? "matchPop .5s ease-out" : "none",
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

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: `${reactTop}%`,
                transform: "translate(-50%,-50%)",
                fontSize: "clamp(40px,10cqi,64px)",
                pointerEvents: "none",
                zIndex: 6,
                opacity: fb ? 1 : 0,
                animation: fb ? "reactPop 1s cubic-bezier(.3,1.5,.5,1) forwards" : "none",
              }}
            >
              {fb ? (fb.ok ? (fb.combo ? "🤩" : "🎯") : "🙈") : ""}
            </div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 200,
                height: 200,
                borderRadius: "50%",
                border: "4px solid #14B79A",
                pointerEvents: "none",
                zIndex: 5,
                opacity: fb && fb.ok ? 1 : 0,
                animation: fb && fb.ok ? "ringBurst .7s ease-out forwards" : "none",
              }}
            />
            {/* The column count is a property of the board's shape, not of the
                card count, so CSS owns it. `cols` stays the sensible default
                for any deck size the module does not name. */}
            <div
              className={styles.grid}
              style={{ "--kc-cols": cols } as React.CSSProperties}
            >
              {cards.map((c, i) => {
                const shaking = shakeIds.indexOf(c.id) >= 0;
                const faceBg = c.done
                  ? "#EFFBF8"
                  : c.kind === "pic"
                    ? "#FFF8EC"
                    : "#F3F4FF";
                const faceBorder = c.done
                  ? "#14B79A"
                  : c.kind === "pic"
                    ? "#FFD9A8"
                    : "#C6C9FB";
                const anim = c.done
                  ? "matchPop .55s cubic-bezier(.3,1.5,.5,1)"
                  : shaking
                    ? "shake .5s ease-in-out"
                    : `dealIn .45s cubic-bezier(.3,1.5,.5,1) both ${(i * 0.045).toFixed(2)}s`;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => flip(i)}
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      padding: 0,
                      border: "none",
                      background: "none",
                      perspective: 800,
                      opacity: c.done ? 0.55 : 1,
                      animation: anim,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        transformStyle: "preserve-3d",
                        transition: "transform .5s cubic-bezier(.4,1.25,.5,1)",
                        transform:
                          c.up || c.done ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backfaceVisibility: "hidden",
                          borderRadius: "clamp(12px,3cqi,18px)",
                          background:
                            "linear-gradient(150deg,#6E70F0,#3F41C9 55%,#14B79A)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          boxShadow: "0 14px 26px -16px rgba(26,29,38,.8)",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "clamp(20px,5.5cqi,30px)",
                            color: "rgba(255,255,255,.92)",
                          }}
                        >
                          k
                        </span>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          borderRadius: "clamp(12px,3cqi,18px)",
                          background: faceBg,
                          border: `2.5px solid ${faceBorder}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          padding: 3,
                          overflow: "hidden",
                          boxShadow: "0 14px 26px -18px rgba(26,29,38,.7)",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              c.kind === "pic"
                                ? "clamp(64px,20cqi,124px)"
                                : "clamp(15px,4.4cqi,26px)",
                            lineHeight: 1.05,
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1A1D26",
                          }}
                        >
                          {c.kind === "pic" ? c.w.emoji : c.w.en}
                        </div>
                        <div
                          style={{
                            fontSize: "max(11px,2.4cqi)",
                            color: "#5A6273",
                            textAlign: "center",
                            lineHeight: 1.25,
                          }}
                        >
                          {c.kind === "pic" ? (SHOW_THAI ? c.w.th : "") : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {fb && (
            <div
              style={{
                maxWidth: 520,
                margin: "18px auto 0",
                background: fb.ok ? "#EFFBF8" : "#FFF1F1",
                border: `1px solid ${fb.ok ? "#B6F3E4" : "#FBD5D5"}`,
                borderRadius: 18,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 24 }}>
                {fb.ok ? (fb.combo ? "🎉" : "✅") : "💡"}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: fb.ok ? "#0E8C77" : "#B03434",
                  }}
                >
                  {fb.ok
                    ? fb.combo
                      ? "คอมโบ! " + fb.w!.en
                      : "เจอคู่แล้ว: " + fb.w!.en
                    : "ยังไม่ใช่คู่กัน"}
                </div>
                <div style={{ fontSize: 14, color: "#5A6273", marginTop: 2 }}>
                  {fb.ok
                    ? fb.w!.th + " — ฟังเสียงอ่านแล้วพูดตามนะ"
                    : "จำตำแหน่งการ์ดไว้ แล้วลองอีกครั้ง"}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: 20,
            }}
          >
            <button
              type="button"
              onClick={start}
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: "#5C5EE6",
                background: "#E1E3FD",
                border: "none",
                borderRadius: 999,
                padding: "11px 24px",
                cursor: "pointer",
              }}
            >
              สลับการ์ดใหม่ 🔁
            </button>
          </div>
        </div>
      )}

      {stage === 2 && (
        <div
          className={`${styles.play} ${styles.result}`}
          style={{
            position: "relative",
            zIndex: 5,
            width: "100%",
            maxWidth: 640,
            margin: "0 auto",
            padding: "10px 18px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "clamp(54px,14cqi,80px)",
              animation: "popIn .6s cubic-bezier(.3,1.5,.5,1) both",
            }}
          >
            {resultEmoji}
          </div>
          <h2
            style={{
              fontWeight: 700,
              fontSize: "clamp(26px,6cqi,36px)",
              margin: "6px 0 8px",
            }}
          >
            {resultTitle}
          </h2>
          <p style={{ fontSize: 16, color: "#5A6273", margin: "0 0 22px" }}>
            จับคู่ครบ {total} คู่ · เวลา {timeLabel} · พลิกผิด {misses} ครั้ง ·
            คอมโบสูงสุด {best} 🔥
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: 26,
            }}
          >
            {resultStars.map((s, i) => (
              <div
                key={i}
                style={{ fontSize: "clamp(32px,9cqi,44px)", opacity: s.o }}
              >
                ⭐
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 22,
              padding: 14,
              marginBottom: 26,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
              gap: 8,
              boxShadow: "0 18px 34px -28px rgba(0,0,0,.6)",
            }}
          >
            {pairs.map((w) => (
              <button
                key={w.en}
                type="button"
                onClick={() => speakReview(w)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  border: "1px solid #EEF0F5",
                  borderRadius: 14,
                  background: "#FAFBFF",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 24 }}>{w.emoji}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 15 }}>
                    {w.en}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: "#5A6273" }}>
                    {w.th}
                  </span>
                </span>
                <span style={{ fontSize: 14, color: "#5C5EE6" }}>🔊</span>
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={start}
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: "#fff",
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                border: "none",
                borderRadius: 999,
                padding: "15px 36px",
                cursor: "pointer",
                boxShadow: "0 12px 26px -10px rgba(92,94,230,.6)",
              }}
            >
              เล่นอีกครั้ง 🔁
            </button>
          </div>
        </div>
      )}

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
          <div
            key={c.key}
            style={{
              position: "absolute",
              top: 0,
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              borderRadius: c.radius,
              background: c.color,
              animation: `confettiFall ${c.dur}s linear ${c.delay}s forwards`,
            }}
          />
        ))}
        {floaters.map((f) => (
          <div
            key={f.key}
            style={{
              position: "absolute",
              left: "50%",
              top: "44%",
              fontWeight: 700,
              fontSize: f.big ? 34 : 28,
              color: f.big ? "#C2500B" : "#0E8C77",
              animation: "floatUp 1.2s ease-out forwards",
            }}
          >
            {f.text}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
