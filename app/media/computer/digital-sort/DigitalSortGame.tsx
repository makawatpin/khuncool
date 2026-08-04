"use client";

import { useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { hoverSfxDelegate, KcSfx } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useFullscreen } from "../../english/useFullscreen";
import { SORT_ITEMS, type SortItem, type SortKind } from "./gameData";
import styles from "./DigitalSortGame.module.css";

type Stage = "home" | "play" | "result";
type Feedback = { good: boolean; text: string } | null;
const ROUND_SIZE = 12;

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const CONFETTI = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 37.7) % 100}%`,
  delay: `${(index % 9) * 0.06}s`,
  color: ["#705cf6", "#ff5f8f", "#13c7a3", "#ffc83d", "#54b9ff"][index % 5],
}));

export default function DigitalSortGame() {
  useTrackToolUse("computer-digital-sort");
  const { ref, isFull, fullscreenClassName, toggle } = useFullscreen<HTMLDivElement>();
  const [stage, setStage] = useState<Stage>("home");
  const [items, setItems] = useState<SortItem[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [locked, setLocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const current = items[round];
  const currentEnglish = current
    ? SORT_ITEMS.find((item) => item.id === current.id)?.english ?? current.english
    : "";

  const start = useCallback(() => {
    KcSfx.unlock(); KcSfx.play("whoosh");
    setItems(shuffle(SORT_ITEMS).slice(0, ROUND_SIZE)); setRound(0); setScore(0); setStreak(0);
    setBestStreak(0); setCorrect(0); setFeedback(null); setLocked(false); setStage("play");
  }, []);

  useEffect(() => { ref.current?.scrollTo({ top: 0, left: 0 }); }, [stage, ref]);

  const sort = useCallback((kind: SortKind) => {
    if (!current || locked) return;
    const good = current.kind === kind;
    const nextStreak = good ? streak + 1 : 0;
    const points = good ? 100 + Math.min(nextStreak - 1, 5) * 20 : 0;
    setLocked(true); setDragging(false); setStreak(nextStreak);
    if (good) {
      setScore((value) => value + points); setCorrect((value) => value + 1);
      setBestStreak((value) => Math.max(value, nextStreak));
      setFeedback({ good: true, text: nextStreak >= 3 ? `คอมโบ x${nextStreak}! +${points}` : `ถูกต้อง! +${points}` });
      KcSfx.play(nextStreak >= 3 ? "combo" : "correct");
    } else {
      setFeedback({ good: false, text: current.kind === "hardware" ? "ชิ้นนี้จับต้องได้ — เป็นฮาร์ดแวร์" : "ชิ้นนี้เป็นโปรแกรม — เป็นซอฟต์แวร์" });
      KcSfx.play("wrong");
    }
    window.setTimeout(() => {
      setFeedback(null); setLocked(false);
      if (round + 1 >= items.length) { setStage("result"); KcSfx.play("win"); }
      else setRound((value) => value + 1);
    }, good ? 800 : 1250);
  }, [current, items.length, locked, round, streak]);

  const drop = (event: DragEvent, kind: SortKind) => { event.preventDefault(); sort(kind); };
  const resultTitle = useMemo(() => correct === items.length ? "นักคัดแยกระดับตำนาน!" : correct >= 9 ? "ยอดเยี่ยมมาก!" : correct >= 6 ? "เก่งขึ้นแล้ว!" : "ลองอีกครั้งนะ!", [correct, items.length]);

  return <div ref={ref} className={`kc-game kc-computer-game ${styles.shell} ${fullscreenClassName}`} data-stage={stage} onMouseOver={hoverSfxDelegate}>
    <div className={styles.gridGlow}/><div className={styles.orbOne}/><div className={styles.orbTwo}/>
    <header className={styles.topbar}>
      <div className={styles.brand}><Image src="/assets/khuncool-logo.webp" alt="khuncool" width={38} height={38}/><span><b className="kc-title">Digital Sort</b><small>ภารกิจคัดแยกโลกดิจิทัล</small></span></div>
      <div className={styles.controls}>
        <Link href="/media/computer" className={`${styles.hubMenu} kc-game-menu`} aria-label="กลับหน้าสื่อคอมพิวเตอร์"><span>☰</span><b>เมนู</b></Link>
        {stage !== "home" && <button className={`${styles.hubMenu} kc-game-menu`} type="button" onClick={() => { setStage("home"); setFeedback(null); setLocked(false); KcSfx.play("click"); }} aria-label="กลับหน้าเริ่มเกม"><span>↻</span><b>เริ่มใหม่</b></button>}
        <button className={styles.roundBtn} type="button" onClick={() => { const next = !muted; setMuted(next); KcSfx.setMuted(next); if (!next) KcSfx.play("click"); }} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"} title={muted ? "เปิดเสียง" : "ปิดเสียง"}>{muted ? "🔇" : "🔊"}</button>
        <button className={`${styles.roundBtn} ${isFull ? styles.activeBtn : ""}`} type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
      </div>
    </header>

    {stage === "home" && <section className={styles.home}>
      <div className={styles.badge}>MISSION 01 · พร้อมออกเดินทาง</div>
      <div className={styles.heroIcons}><span>🖥️</span><i>VS</i><span>💿</span></div>
      <h2>จับต้องได้ หรือเป็นโปรแกรม?</h2>
      <p>ลากการ์ดไปยังฐานที่ถูกต้อง แยก <b>ฮาร์ดแวร์</b> และ <b>ซอฟต์แวร์</b> ให้ครบทั้ง 12 ชิ้น</p>
      <div className={styles.lesson}><span>👆 ลากหรือแตะเลือก</span><span>🔥 สะสมคอมโบ</span><span>⭐ ทำคะแนนสูงสุด</span></div>
      <button className={styles.startBtn} type="button" onClick={start}><span>เริ่มภารกิจ</span><b>▶</b></button>
    </section>}

    {stage === "play" && current && <section className={styles.play}>
      <div className={styles.hud}><div><span>ภารกิจ</span><b>{round + 1}<small> / {items.length}</small></b></div><div className={styles.progress}><i style={{ width: `${((round + 1) / items.length) * 100}%` }}/></div><div><span>คะแนน</span><b>{score.toLocaleString()}</b></div><div><span>คอมโบ</span><b className={streak >= 3 ? styles.hot : ""}>🔥 {streak}</b></div></div>
      <div className={styles.arena}>
        <button type="button" className={`${styles.bin} ${styles.hardware}`} onClick={() => sort("hardware")} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, "hardware")} disabled={locked}><span className={styles.binIcon}>🧰</span><b>ฮาร์ดแวร์</b><em>Hardware</em><small>สิ่งที่จับต้องได้</small><i>วางที่นี่</i></button>
        <div className={styles.cardZone}>
          <div className={`${styles.itemCard} ${dragging ? styles.dragging : ""} ${feedback ? (feedback.good ? styles.correct : styles.wrong) : ""}`} draggable={!locked} onDragStart={(e) => { e.dataTransfer.setData("text/plain", current.id); setDragging(true); }} onDragEnd={() => setDragging(false)}>
            <span className={styles.itemIcon}>{current.icon}</span><h3>{current.name}</h3><strong className={`${styles.englishName} kc-english-word`}>{currentEnglish}</strong><p>{current.hint}</p><div className={styles.dragHint}>⋮⋮ ลากการ์ดไปยังคำตอบ</div>
          </div>
          {feedback && <div className={`${styles.feedback} ${feedback.good ? styles.good : styles.bad}`}>{feedback.good ? "✓" : "!"} {feedback.text}</div>}
        </div>
        <button type="button" className={`${styles.bin} ${styles.software}`} onClick={() => sort("software")} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, "software")} disabled={locked}><span className={styles.binIcon}>💿</span><b>ซอฟต์แวร์</b><em>Software</em><small>โปรแกรมและชุดคำสั่ง</small><i>วางที่นี่</i></button>
      </div>
      <div className={styles.mobileTip}>แตะฐานคำตอบ หรือจะลากการ์ดไปวางก็ได้</div>
    </section>}

    {stage === "result" && <section className={styles.result}>
      {correct >= 9 && <div className={styles.confetti}>{CONFETTI.map((piece, i) => <i key={i} style={{ left: piece.left, animationDelay: piece.delay, background: piece.color }}/>)}</div>}
      <div className={styles.trophy}>{correct === items.length ? "🏆" : correct >= 9 ? "🌟" : "🚀"}</div><div className={styles.badge}>MISSION COMPLETE</div><h2>{resultTitle}</h2><p>คุณคัดแยกถูก <b>{correct} จาก {items.length}</b> ชิ้น</p>
      <div className={styles.resultStats}><div><span>คะแนนรวม</span><b>{score.toLocaleString()}</b></div><div><span>คอมโบสูงสุด</span><b>🔥 {bestStreak}</b></div><div><span>ความแม่นยำ</span><b>{Math.round((correct / items.length) * 100)}%</b></div></div>
      <button className={styles.startBtn} type="button" onClick={start}><span>เล่นอีกครั้ง</span><b>↻</b></button>
    </section>}
  </div>;
}
