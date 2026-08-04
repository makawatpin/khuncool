"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { hoverSfxDelegate, KcSfx } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useFullscreen } from "../../english/useFullscreen";
import { CATEGORIES, GAME_DATA, type AseanItem, type CategoryId } from "./gameData";
import AseanFlag from "./AseanFlag";
import styles from "./AseanMatchingApp.module.css";

type Stage = "home" | "play" | "result";
type Feedback = { type: "good" | "bad"; text: string } | null;

function shuffle<T>(values: T[]) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[random]] = [copy[random], copy[index]];
  }
  return copy;
}

function choicesFor(question: AseanItem, pool: AseanItem[]) {
  return shuffle([question, ...shuffle(pool.filter((item) => item.country !== question.country)).slice(0, 3)]);
}

const CONFETTI = Array.from({ length: 34 }, (_, index) => ({
  left: (index * 37.7) % 100,
  delay: (index % 8) * 0.05,
  color: ["#5c5ee6", "#ff648f", "#18b887", "#ffb23f", "#9a55e8"][index % 5],
}));

export default function AseanMatchingApp() {
  useTrackToolUse("asean-matching");
  const { ref, isFull, fullscreenClassName, toggle } = useFullscreen<HTMLDivElement>();
  const [stage, setStage] = useState<Stage>("home");
  const [category, setCategory] = useState<CategoryId>("flower");
  const [questions, setQuestions] = useState<AseanItem[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [locked, setLocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bgmLive, setBgmLive] = useState(true);
  const advanceTimer = useRef<number | null>(null);

  const categoryMeta = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];
  const question = questions[round];
  const choices = useMemo(() => question ? choicesFor(question, GAME_DATA[category]) : [], [question, category]);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, left: 0 });
  }, [stage, ref]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => { setMuted(KcSfx.isMuted()); setBgmLive(KcSfx.isBgm()); }, 0);
    return () => window.clearTimeout(syncTimer);
  }, []);

  useEffect(() => () => { if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current); }, []);

  const cancelAdvance = () => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  };

  const start = useCallback(() => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    KcSfx.unlock(); KcSfx.play("whoosh");
    setMuted(KcSfx.isMuted()); setBgmLive(KcSfx.isBgm());
    setQuestions(shuffle(GAME_DATA[category])); setRound(0); setScore(0); setStreak(0);
    setBestStreak(0); setCorrectCount(0); setSelected(null); setFeedback(null); setLocked(false); setStage("play");
  }, [category]);

  const choose = (choice: AseanItem) => {
    if (!question || locked) return;
    setSelected(choice.country); setLocked(true);
    const correct = choice.country === question.country;
    if (correct) {
      const nextStreak = streak + 1;
      const points = 100 + Math.min(nextStreak - 1, 5) * 20;
      setScore((value) => value + points); setStreak(nextStreak); setBestStreak((value) => Math.max(value, nextStreak)); setCorrectCount((value) => value + 1);
      setFeedback({ type: "good", text: nextStreak >= 3 ? `สุดยอด! คอมโบ x${nextStreak}` : "ถูกต้อง! +" + points });
      KcSfx.play(nextStreak >= 3 ? "combo" : "correct");
    } else {
      setStreak(0); setFeedback({ type: "bad", text: `คำตอบคือ ${question.country}` }); KcSfx.play("wrong");
    }
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      setFeedback(null); setSelected(null); setLocked(false);
      if (round + 1 >= questions.length) { setStage("result"); KcSfx.play("win"); }
      else setRound((value) => value + 1);
    }, correct ? 850 : 1250);
  };

  const toggleSound = () => { const next = !muted; setMuted(next); KcSfx.setMuted(next); if (!next) KcSfx.play("click"); };
  const toggleBgm = () => { const next = !bgmLive; setBgmLive(next); KcSfx.bgm(next); KcSfx.play("click"); };
  const percent = questions.length ? ((round + 1) / questions.length) * 100 : 0;

  return <div ref={ref} data-category={category} data-stage={stage} className={`${styles.shell} ${fullscreenClassName}`} onMouseOver={hoverSfxDelegate} style={{ "--cat": categoryMeta.color, "--catSoft": `${categoryMeta.color}30` } as React.CSSProperties}>
    <div className={styles.mesh}/><div className={`${styles.orb} ${styles.orb1}`}/><div className={`${styles.orb} ${styles.orb2}`}/><div className={`${styles.orb} ${styles.orb3}`}/>
    <header className={styles.topbar}><div className={styles.brand}><Image src="/assets/khuncool-logo.webp" alt="khuncool" width={38} height={38}/><span>เกมจับคู่ภาพอาเซียน</span></div>
      <div className={styles.controls}>
        <Link href="/media/social-studies" className={styles.hubMenu} aria-label="กลับหน้าสื่อสังคมศึกษา"><span>☰</span><b>เมนู</b></Link>
        {stage !== "home" && <button type="button" className={styles.categoryMenu} onClick={() => { cancelAdvance(); setStage("home"); setFeedback(null); setLocked(false); KcSfx.play("click"); }} aria-label="กลับไปเลือกหมวด"><span>☰</span><b>เปลี่ยนหมวด</b></button>}
        <button type="button" className={`${styles.audioBtn} ${bgmLive ? styles.audioActive : ""}`} onClick={toggleBgm}><span className={styles.equalizer}>{[0,1,2].map((bar) => <i key={bar} style={{ animationDelay: `${bar * .12}s` }}/>)}</span><span>{bgmLive ? "เพลง" : "ปิดเพลง"}</span></button>
        <button type="button" className={styles.roundBtn} onClick={toggleSound} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}>{muted ? "🔇" : "🔊"}</button>
        <button type="button" className={`${styles.roundBtn} ${isFull ? styles.audioActive : ""}`} onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
      </div>
    </header>

    <div className={styles.stage}>
      {stage === "home" && <section className={styles.home}><span className={styles.eyebrow}>✨ ผจญภัยทั่วอาเซียน 11 ประเทศ</span><h2 className={styles.title}>เกมจับคู่ภาพอาเซียน</h2><p className={styles.subtitle}>ดูภาพ อ่านคำใบ้ แล้วเลือกประเทศกับธงชาติให้ถูกต้อง เก็บคะแนนต่อเนื่องเพื่อสร้างคอมโบ!</p>
        <div className={styles.categoryGrid}>{CATEGORIES.map((item) => <button key={item.id} type="button" onClick={() => { setCategory(item.id); KcSfx.play("click"); }} className={`${styles.category} ${category === item.id ? styles.categoryActive : ""}`} style={{ "--cat": item.color } as React.CSSProperties}><span className={styles.categoryIcon}>{item.icon}</span><span className={styles.categoryTitle}>{item.title}</span><span className={styles.categoryDesc}>{item.description}</span></button>)}</div>
        <button type="button" className={styles.startBtn} onClick={start}>เริ่มภารกิจ {categoryMeta.icon} <span aria-hidden>▶</span></button>
      </section>}

      {stage === "play" && question && <section className={styles.game}><div className={styles.hud}><div className={styles.hudLeft}><span className={styles.round}>ข้อ {round + 1}/{questions.length}</span>{streak >= 2 && <span className={styles.pill}>🔥 x{streak}</span>}</div><div className={styles.progress}><div className={styles.progressFill} style={{ width: `${percent}%` }}/></div><div className={styles.score}>คะแนน <strong>{score}</strong></div></div>
        <div className={styles.board}><div className={styles.questionCard}><span className={styles.prompt}>สิ่งนี้อยู่คู่กับประเทศใด?</span>{question.image ? <div className={category === "costume" ? styles.costumeFrame : category === "food" ? styles.foodFrame : styles.currencyFrame}><Image src={question.image} alt={category === "costume" ? `เครื่องแต่งกาย ${question.answer}` : category === "food" ? `อาหารประจำชาติ ${question.answer}` : `ธนบัตร ${question.answer}`} fill sizes={category === "costume" ? "(max-width: 767px) 42vw, 280px" : "(max-width: 767px) 72vw, 300px"} priority={round === 0}/></div> : <div className={styles.bigVisual}>{question.visual}</div>}<div className={styles.answerName}>{question.answer}</div><p className={styles.hint}>💡 {question.hint}</p></div>
          <div className={styles.answers}>{choices.map((choice) => { const isSelected = selected === choice.country; const correct = locked && choice.country === question.country; const wrong = locked && isSelected && !correct; return <button type="button" disabled={locked} key={choice.country} onClick={() => choose(choice)} className={`${styles.answer} ${correct ? styles.correct : ""} ${wrong ? styles.wrong : ""} ${locked && !correct && !wrong ? styles.dim : ""}`}><span className={styles.answerFlag}><AseanFlag code={choice.code}/></span><span className={styles.answerText}>{choice.country}</span></button>; })}</div></div>
      </section>}

      {stage === "result" && <section className={styles.result}>{CONFETTI.map((piece, index) => <i key={index} className={styles.confetti} style={{ left: `${piece.left}%`, animationDelay: `${piece.delay}s`, background: piece.color }}/>) }<div className={styles.trophy}>{correctCount >= 9 ? "🏆" : correctCount >= 6 ? "🌟" : "🎯"}</div><h2>ภารกิจสำเร็จ!</h2><p>น้องรู้จักอาเซียนมากขึ้นอีกขั้นแล้ว</p><div className={styles.resultCard}><div className={styles.stat}><strong>{score}</strong><span>คะแนนรวม</span></div><div className={styles.stat}><strong>{correctCount}/11</strong><span>ตอบถูก</span></div><div className={styles.stat}><strong>x{bestStreak}</strong><span>คอมโบสูงสุด</span></div></div><div className={styles.resultActions}><button type="button" className={styles.startBtn} onClick={start}>เล่นหมวดนี้อีกครั้ง 🔄</button><button type="button" className={styles.secondaryBtn} onClick={() => { cancelAdvance(); setStage("home"); KcSfx.play("click"); }}>เลือกหมวดอื่น</button></div></section>}
      {feedback && <div className={`${styles.feedback} ${feedback.type === "good" ? styles.feedbackGood : styles.feedbackBad}`}>{feedback.text}</div>}
    </div>
  </div>;
}
