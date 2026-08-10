"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStage } from "../../_stage/useStage";
import styles from "./MathBombGame.module.css";

type Difficulty = "easy" | "medium" | "hard";
type Mission = { prompt: string; wires: { equation: string; answer: number }[]; target: "max" | "min"; topic: string };

// แก้โจทย์หรือเพิ่มด่านได้ตรงนี้ โดย answer คือค่าจริงของ equation
const QUESTION_BANK: Record<Difficulty, Mission[]> = {
  easy: [
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "คิดเลขเร็ว", wires: [{ equation: "25 × 4", answer: 100 }, { equation: "120 ÷ 3", answer: 40 }, { equation: "48 + 37", answer: 85 }, { equation: "150 − 72", answer: 78 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "คิดเลขเร็ว", wires: [{ equation: "9 × 8", answer: 72 }, { equation: "96 ÷ 4", answer: 24 }, { equation: "35 + 19", answer: 54 }, { equation: "80 − 33", answer: 47 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "การบวก", wires: [{ equation: "46 + 29", answer: 75 }, { equation: "38 + 45", answer: 83 }, { equation: "57 + 18", answer: 75 }, { equation: "64 + 12", answer: 76 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "การลบ", wires: [{ equation: "92 − 37", answer: 55 }, { equation: "81 − 29", answer: 52 }, { equation: "70 − 16", answer: 54 }, { equation: "66 − 18", answer: 48 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "การคูณ", wires: [{ equation: "7 × 8", answer: 56 }, { equation: "6 × 9", answer: 54 }, { equation: "12 × 5", answer: 60 }, { equation: "8 × 7", answer: 56 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "การหาร", wires: [{ equation: "144 ÷ 12", answer: 12 }, { equation: "72 ÷ 8", answer: 9 }, { equation: "90 ÷ 9", answer: 10 }, { equation: "84 ÷ 7", answer: 12 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "คิดเลขเร็ว", wires: [{ equation: "34 + 58", answer: 92 }, { equation: "120 − 31", answer: 89 }, { equation: "11 × 8", answer: 88 }, { equation: "180 ÷ 2", answer: 90 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "คิดเลขเร็ว", wires: [{ equation: "63 ÷ 7", answer: 9 }, { equation: "15 − 4", answer: 11 }, { equation: "3 × 4", answer: 12 }, { equation: "8 + 2", answer: 10 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "จำนวนสองหลัก", wires: [{ equation: "13 × 6", answer: 78 }, { equation: "96 − 15", answer: 81 }, { equation: "39 + 40", answer: 79 }, { equation: "160 ÷ 2", answer: 80 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "จำนวนสองหลัก", wires: [{ equation: "24 + 19", answer: 43 }, { equation: "75 − 34", answer: 41 }, { equation: "7 × 6", answer: 42 }, { equation: "160 ÷ 4", answer: 40 }] },
  ],
  medium: [
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "เศษส่วนและร้อยละ", wires: [{ equation: "½ ของ 180", answer: 90 }, { equation: "25% ของ 320", answer: 80 }, { equation: "¾ ของ 100", answer: 75 }, { equation: "40% ของ 200", answer: 80 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "สมการ", wires: [{ equation: "x + 18 = 50", answer: 32 }, { equation: "3x = 81", answer: 27 }, { equation: "x − 14 = 22", answer: 36 }, { equation: "2x + 4 = 64", answer: 30 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "ร้อยละ", wires: [{ equation: "20% ของ 450", answer: 90 }, { equation: "35% ของ 200", answer: 70 }, { equation: "15% ของ 600", answer: 90 }, { equation: "40% ของ 250", answer: 100 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "เศษส่วน", wires: [{ equation: "⅓ ของ 180", answer: 60 }, { equation: "¼ ของ 200", answer: 50 }, { equation: "⅖ ของ 150", answer: 60 }, { equation: "⅛ ของ 320", answer: 40 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "สมการ", wires: [{ equation: "x + 25 = 70", answer: 45 }, { equation: "4x = 160", answer: 40 }, { equation: "x − 12 = 36", answer: 48 }, { equation: "3x + 6 = 132", answer: 42 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "สมการ", wires: [{ equation: "5x = 175", answer: 35 }, { equation: "x + 17 = 50", answer: 33 }, { equation: "2x − 4 = 60", answer: 32 }, { equation: "x ÷ 3 = 12", answer: 36 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "ทศนิยม", wires: [{ equation: "4.5 × 20", answer: 90 }, { equation: "12.5 × 8", answer: 100 }, { equation: "84.6 + 9.4", answer: 94 }, { equation: "150.5 − 55.5", answer: 95 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "ทศนิยม", wires: [{ equation: "7.5 × 6", answer: 45 }, { equation: "81.2 − 39.2", answer: 42 }, { equation: "96 ÷ 2", answer: 48 }, { equation: "20.5 + 23.5", answer: 44 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "หลายขั้นตอน", wires: [{ equation: "(15 + 9) × 3", answer: 72 }, { equation: "180 ÷ 3 + 8", answer: 68 }, { equation: "14 × 5 − 4", answer: 66 }, { equation: "100 − 6 × 5", answer: 70 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "หลายขั้นตอน", wires: [{ equation: "(42 − 18) × 2", answer: 48 }, { equation: "160 ÷ 4 + 5", answer: 45 }, { equation: "7 × 7 − 3", answer: 46 }, { equation: "80 − 4 × 8", answer: 48 }] },
  ],
  hard: [
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "หลายขั้นตอน", wires: [{ equation: "(18 + 7) × 4", answer: 100 }, { equation: "360 ÷ (9 − 3)", answer: 60 }, { equation: "15² − 120", answer: 105 }, { equation: "35% ของ 280", answer: 98 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "เศษส่วนและประมาณค่า", wires: [{ equation: "⅝ ของ 240", answer: 150 }, { equation: "≈ 49.8 × 3", answer: 149.4 }, { equation: "1.2 × 125", answer: 150 }, { equation: "¾ ของ 196", answer: 147 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "เลขยกกำลัง", wires: [{ equation: "12² − 30", answer: 114 }, { equation: "5³ − 10", answer: 115 }, { equation: "11² − 8", answer: 113 }, { equation: "2⁶ + 48", answer: 112 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "ลำดับการคำนวณ", wires: [{ equation: "18 × 6 − 25", answer: 83 }, { equation: "240 ÷ 3 + 4", answer: 84 }, { equation: "7² + 36", answer: 85 }, { equation: "(30 − 9) × 4", answer: 84 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "ร้อยละหลายขั้นตอน", wires: [{ equation: "125% ของ 96", answer: 120 }, { equation: "80% ของ 140", answer: 112 }, { equation: "45% ของ 260", answer: 117 }, { equation: "30% ของ 390", answer: 117 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "เศษส่วน", wires: [{ equation: "⅞ ของ 160", answer: 140 }, { equation: "⅔ ของ 210", answer: 140 }, { equation: "⁵⁄₆ ของ 168", answer: 140 }, { equation: "¾ ของ 180", answer: 135 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "สมการหลายขั้นตอน", wires: [{ equation: "3x + 12 = 150", answer: 46 }, { equation: "5x − 20 = 210", answer: 46 }, { equation: "2(x + 5) = 104", answer: 47 }, { equation: "4x + 8 = 192", answer: 46 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "สมการหลายขั้นตอน", wires: [{ equation: "6x − 18 = 240", answer: 43 }, { equation: "3(x + 4) = 138", answer: 42 }, { equation: "5x + 10 = 225", answer: 43 }, { equation: "2x − 6 = 80", answer: 43 }] },
    { prompt: "ตัดสายที่ได้คำตอบมากที่สุด", target: "max", topic: "ประมาณค่า", wires: [{ equation: "≈ 79.6 × 3", answer: 238.8 }, { equation: "≈ 120.4 × 2", answer: 240.8 }, { equation: "≈ 48.1 × 5", answer: 240.5 }, { equation: "≈ 360.2 ÷ 1.5", answer: 240.13 }] },
    { prompt: "ตัดสายที่ได้คำตอบน้อยที่สุด", target: "min", topic: "หลายขั้นตอน", wires: [{ equation: "(64 ÷ 8 + 7) × 9", answer: 135 }, { equation: "18² ÷ 2 − 25", answer: 137 }, { equation: "250 − 4 × 28", answer: 138 }, { equation: "35% ของ 400", answer: 140 }] },
  ],
};

const WIRE_COLORS = ["#ff4655", "#31d5ff", "#ffd84d", "#8cff66"];
const DEFAULT_WIRE_ORDER = [0, 1, 2, 3];

function shuffledWireOrder() {
  const order = [...DEFAULT_WIRE_ORDER];
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
  }
  return order;
}

function shuffledMissionOrder(length: number) {
  const order = Array.from({ length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
  }
  return order;
}

function playTone(kind: "tick" | "win" | "boom" | "cut", muted = false) {
  if (muted) return;
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  const ctx = new AudioContextCtor();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  const now = ctx.currentTime;
  const freq = kind === "tick" ? 650 : kind === "win" ? 520 : kind === "cut" ? 210 : 70;
  osc.frequency.setValueAtTime(freq, now);
  if (kind === "win") osc.frequency.exponentialRampToValueAtTime(1100, now + .35);
  if (kind === "boom") osc.frequency.exponentialRampToValueAtTime(28, now + .55);
  gain.gain.setValueAtTime(kind === "tick" ? .035 : .12, now);
  if (kind === "cut") {
    osc.type = "square";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + .12);
    gain.gain.setValueAtTime(.16, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + .18);
  } else {
    gain.gain.exponentialRampToValueAtTime(.001, now + (kind === "tick" ? .08 : .65));
  }
  osc.start(now); osc.stop(now + (kind === "tick" ? .09 : .7));
  osc.onended = () => ctx.close();
}

export default function MathBombGame() {
  const { isFull, stageProps, toggle } = useStage<HTMLDivElement>();
  const [screen, setScreen] = useState<"intro" | "setup" | "game">("intro");
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [duration, setDuration] = useState(60);
  const [round, setRound] = useState(0);
  const [wireOrder, setWireOrder] = useState(DEFAULT_WIRE_ORDER);
  const [timeLeft, setTimeLeft] = useState(60);
  const [status, setStatus] = useState<"ready" | "playing" | "verifying" | "won" | "lost" | "complete" | "gameover">("ready");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [missionPosition, setMissionPosition] = useState(0);
  const [missionOrder, setMissionOrder] = useState(() => Array.from({ length: 10 }, (_, index) => index));
  const [cutWire, setCutWire] = useState<number | null>(null);
  const lastTick = useRef(-1);
  const missions = QUESTION_BANK[difficulty];
  const baseMission = missions[round % missions.length];
  const mission = useMemo(() => ({ ...baseMission, wires: wireOrder.map((index) => baseMission.wires[index]) }), [baseMission, wireOrder]);
  const correctIndex = useMemo(() => mission.wires.reduce((best, wire, index, all) => mission.target === "max" ? (wire.answer > all[best].answer ? index : best) : (wire.answer < all[best].answer ? index : best), 0), [mission]);

  const prepareMission = useCallback((missionIndex: number) => {
    setRound(missionIndex); setWireOrder(shuffledWireOrder()); setTimeLeft(duration); setCutWire(null); setStatus("playing"); lastTick.current = -1;
  }, [duration]);
  const beginSession = useCallback(() => {
    const order = shuffledMissionOrder(missions.length);
    setMissionOrder(order); setMissionPosition(0); setLives(3); setCorrectCount(0); setScore(0); setStreak(0);
    prepareMission(order[0]);
  }, [missions.length, prepareMission]);
  const advanceMission = useCallback(() => {
    if (missionPosition >= missionOrder.length - 1) { setStatus("complete"); return; }
    const nextPosition = missionPosition + 1;
    setMissionPosition(nextPosition); prepareMission(missionOrder[nextPosition]);
  }, [missionOrder, missionPosition, prepareMission]);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setTimeLeft((value) => {
      if (value <= 1) { setStatus("lost"); setLives((current) => Math.max(0, current - 1)); setStreak(0); playTone("boom", muted); return 0; }
      if (value <= 10 && value !== lastTick.current) { lastTick.current = value; playTone("tick", muted); }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [status, muted]);

  const chooseWire = (index: number) => {
    if (status !== "playing") return;
    setCutWire(index); setStatus("verifying"); playTone("cut", muted);
    navigator.vibrate?.([35, 25, 65]);
    window.setTimeout(() => {
      playTone("tick", muted);
    }, 720);
    window.setTimeout(() => {
      playTone("tick", muted);
      navigator.vibrate?.(30);
    }, 1120);
    window.setTimeout(() => {
      if (index === correctIndex) { setStatus("won"); setCorrectCount((value) => value + 1); setScore((value) => value + 100 + timeLeft * 2); setStreak((value) => value + 1); playTone("win", muted); navigator.vibrate?.([45, 35, 90]); }
      else { setStatus("lost"); setLives((value) => Math.max(0, value - 1)); setStreak(0); playTone("boom", muted); }
    }, 1550);
  };

  const timeBonus = timeLeft * 2;
  const missionGrade = timeLeft >= duration * .7 ? "S" : timeLeft >= duration * .4 ? "A" : "B";

  return <div {...stageProps} className={`kc-stage ${styles.shell}`}>
    <div className={`kc-stage-body ${styles.game} ${status === "won" ? styles.won : status === "lost" ? styles.lost : ""}`}>
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
      <div className={styles.techGrid} />
      <div className={styles.alarmBeams}><i /><i /></div>
      <div className={styles.hudCorners}><i /><i /><i /><i /></div>
      <div className={styles.sparkField}>{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 8) * .22}s` }} />)}</div>
      <div className={styles.dustField}>{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ left: `${(i * 43) % 100}%`, top: `${(i * 29) % 88}%`, animationDelay: `${(i % 9) * -.37}s`, animationDuration: `${3.4 + (i % 5) * .8}s` }} />)}</div>
      {(status === "won" || status === "lost") && <div className={`${styles.outcomeFx} ${status === "won" ? styles.celebration : styles.destruction}`} aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ "--x": `${((i * 47) % 190) - 95}px`, "--y": `${-50 - (i % 7) * 22}px`, "--c": WIRE_COLORS[i % 4], animationDelay: `${i * -.025}s` } as CSSProperties} />)}</div>}
      <header className={styles.topbar}>
        <div className={styles.brand}><Image src="/assets/khuncool-logo.webp" width={38} height={38} alt="KhunCool" /><div><b>Math Bomb Defusal</b><small>ถอดรหัสบอมบ์ตัวเลข</small></div></div>
        <div className={styles.topActions}>
          <Link href="/media/mathematics" className={styles.menuButton}>☰ เมนู</Link>
          {screen === "game" && <button type="button" className={styles.changeButton} onClick={() => { setStatus("ready"); setScreen("setup"); }}>⚙ ตั้งค่าใหม่</button>}
          <button className={styles.iconButton} type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}>{muted ? "🔇" : "🔊"}</button>
          <button className={styles.iconButton} type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
          {screen === "game" && <div className={styles.sessionPill}><span>ภารกิจ <b>{Math.min(missionPosition + 1, 10)}/10</b></span><span className={styles.lives}>{Array.from({ length: 3 }, (_, index) => <i key={index} className={index < lives ? styles.lifeOn : ""}>♥</i>)}</span></div>}
          <div className={styles.scorePill}>⭐ <b>{score.toLocaleString()}</b>{streak > 0 && <small>×{streak}</small>}</div>
        </div>
      </header>

      {screen === "intro" && <section className={styles.introScreen}>
        <div className={styles.introVisual}><b className={styles.orbitOne} /><b className={styles.orbitTwo} /><em>!</em><span>💣</span><i /><i /><i /><i /></div>
        <p className={styles.eyebrow}>CLASSROOM MATH MISSION</p>
        <h2>ถอดรหัสบอมบ์ตัวเลข</h2>
        <p>แก้โจทย์ทั้ง 4 สาย เลือกคำตอบตามภารกิจ<br />แล้วปลดชนวนให้ทันก่อนหมดเวลา!</p>
        <div className={styles.featureRow}><span>⚡ คิดเลขเร็ว</span><span>🧠 สมการ</span><span>📊 เศษส่วนและร้อยละ</span></div>
        <button type="button" className={styles.primaryButton} onClick={() => setScreen("setup")}>ตั้งค่าภารกิจ 🚀</button>
      </section>}

      {screen === "setup" && <section className={styles.setupScreen}>
        <p className={styles.eyebrow}>MISSION SETUP</p><h2>ตั้งค่าก่อนเริ่มเกม ⚙️</h2><p>เลือกระดับโจทย์และเวลาที่เหมาะกับชั้นเรียน</p>
        <div className={styles.setupGrid}>
          <div><strong>1. ระดับโจทย์</strong><div className={styles.optionRow}>{(["easy", "medium", "hard"] as Difficulty[]).map((level) => <button key={level} type="button" className={difficulty === level ? styles.selected : ""} onClick={() => { setDifficulty(level); setRound(0); }}>{level === "easy" ? "😊 ง่าย" : level === "medium" ? "🔥 ปานกลาง" : "⚡ ท้าทาย"}</button>)}</div></div>
          <div><strong>2. เวลานับถอยหลัง</strong><div className={styles.optionRow}>{[30,60,90].map((seconds) => <button key={seconds} type="button" className={duration === seconds ? styles.selected : ""} onClick={() => { setDuration(seconds); setTimeLeft(seconds); }}>{seconds} วินาที</button>)}</div></div>
          <div className={styles.setupSummary}><span>หัวข้อเริ่มต้น</span><b>{mission.topic}</b><small>โจทย์ {mission.wires.length} สาย · เลือกคำตอบ{mission.target === "max" ? "มากที่สุด" : "น้อยที่สุด"}</small></div>
        </div>
        <div className={styles.setupActions}><button type="button" className={styles.secondaryButton} onClick={() => setScreen("intro")}>← ย้อนกลับ</button><button type="button" className={styles.primaryButton} onClick={() => { beginSession(); setScreen("game"); }}>เริ่ม 10 ภารกิจ 💣</button></div>
      </section>}

      {screen === "game" && <div className={styles.stage}>
        <section className={styles.bombZone}>
          <div className={styles.mission}><small>MISSION {String(missionPosition + 1).padStart(2, "0")} / 10</small><strong>{mission.prompt}</strong></div>
          <div className={`${styles.timer} ${timeLeft <= 10 ? styles.danger : ""}`}><span>{String(Math.floor(timeLeft / 60)).padStart(2, "0")}</span><i>:</i><span>{String(timeLeft % 60).padStart(2, "0")}</span></div>
          <div className={`${styles.bombRig} ${status === "verifying" ? styles.verifyingBomb : ""}`}><div className={styles.energyRing}><i /><i /><i /></div><div className={styles.bombBody}><div className={styles.bombLight} /><div className={styles.bombCore}>{status === "won" ? "SAFE" : status === "verifying" ? "•••" : "⚠"}</div><div className={styles.bombScrews}><i /><i /><i /><i /></div></div></div>
          <div className={styles.wireHarness} aria-hidden="true">
            <svg viewBox="0 0 1000 150" preserveAspectRatio="none">
              {[
                "M 440 0 C 440 52, 125 42, 125 150",
                "M 480 0 C 480 62, 375 48, 375 150",
                "M 520 0 C 520 62, 625 48, 625 150",
                "M 560 0 C 560 52, 875 42, 875 150",
              ].map((path, index) => <g key={path} className={cutWire === index ? styles.cableCut : ""} style={{ "--wire": WIRE_COLORS[index], "--delay": `${index * -.32}s` } as CSSProperties}>
                <path className={styles.cableShadow} d={path} />
                <path className={styles.cableBody} d={path} />
                <path className={styles.cableCurrent} d={path} />
                <circle className={styles.cablePort} cx={440 + index * 40} cy="5" r="9" />
                <circle className={styles.cablePlug} cx={125 + index * 250} cy="144" r="8" />
              </g>)}
            </svg>
          </div>
          <div className={styles.wires}>
            {mission.wires.map((wire, index) => <button key={`${round}-${index}`} type="button" disabled={status !== "playing" || cutWire !== null} onClick={() => chooseWire(index)} className={`${styles.wireCard} ${cutWire === index ? styles.cut : ""}`} style={{ "--wire": WIRE_COLORS[index] } as CSSProperties}>
              <span className={styles.cutFx} aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
              <span className={styles.cutter} aria-hidden="true"><i /><i /><b /></span>
              <span className={styles.wire} aria-hidden="true"><span className={styles.leftWire} /><span className={styles.rightWire} /><i /><i /></span>
              <b>{wire.equation}</b><small>สาย {index + 1}</small>
            </button>)}
          </div>
          {status === "verifying" && <div className={styles.verifySequence} aria-live="assertive"><span>SECURITY SCAN</span><strong>กำลังตรวจสอบสายชนวน</strong><div><i /><i /><i /></div></div>}
        </section>
      </div>}

      {screen === "game" && (["won", "lost", "complete", "gameover"] as const).includes(status as "won" | "lost" | "complete" | "gameover") && <div className={styles.overlay}>
        {status === "won" ? <div className={`${styles.resultCard} ${styles.successCard}`}><div className={styles.gradeBadge}><small>MISSION GRADE</small><b>{missionGrade}</b></div><span className={styles.victory}>✓</span><p className={styles.completeLabel}>BOMB DEFUSED!</p><h2>ปลดชนวนสำเร็จ!</h2><p>สายที่ถูกคือ <b>{mission.wires[correctIndex].equation} = {mission.wires[correctIndex].answer}</b></p><div className={styles.rewardRow}><span><small>คะแนนภารกิจ</small><b>+100</b></span><span><small>โบนัสเวลา</small><b>+{timeBonus}</b></span><span><small>สตรีก</small><b>×{streak}</b></span></div><button onClick={advanceMission}>{missionPosition === 9 ? "ดูผลภารกิจ 🏆" : "ภารกิจต่อไป 🚀"}</button></div> : status === "lost" ? <div className={`${styles.resultCard} ${styles.failure}`}><span className={styles.explosion}>💥</span><h2>ภารกิจล้มเหลว!</h2><p>คำตอบที่ต้องเลือกคือ <b>{mission.wires[correctIndex].equation} = {mission.wires[correctIndex].answer}</b></p><div className={styles.lifeReport}>เหลือชีวิต <b>{lives}/3</b> {"♥".repeat(lives)}</div><button onClick={() => lives === 0 ? setStatus("gameover") : advanceMission()}>{lives === 0 ? "ดูสรุปผล" : "ไปภารกิจต่อไป"}</button></div> : <div className={`${styles.resultCard} ${styles.finalCard}`}><span>{status === "complete" ? "🏆" : "🚨"}</span><p className={styles.completeLabel}>{status === "complete" ? "MISSION COMPLETE" : "MISSION FAILED"}</p><h2>{status === "complete" ? "จบภารกิจทั้ง 10 ด่าน!" : "พลังชีวิตหมด"}</h2><div className={styles.finalStats}><span><small>ตอบถูก</small><b>{correctCount}/10</b></span><span><small>คะแนนรวม</small><b>{score.toLocaleString()}</b></span><span><small>เกรดรวม</small><b>{correctCount >= 9 ? "S" : correctCount >= 7 ? "A" : correctCount >= 5 ? "B" : "C"}</b></span></div><div className={styles.finalActions}><button onClick={beginSession}>เล่นระดับเดิมอีกครั้ง</button><button className={styles.secondaryButton} onClick={() => { setStatus("ready"); setScreen("setup"); }}>เลือกระดับใหม่</button></div></div>}
      </div>}
    </div>
  </div>;
}
