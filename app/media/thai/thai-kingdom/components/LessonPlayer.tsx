"use client";

import { useEffect, useMemo, useState } from "react";
import { THAI_CONSONANTS } from "../consonantData";
import { thaiVowelLabel } from "../thaiText";
import { THAI_WORDS } from "../wordData";
import styles from "../ThaiKingdomApp.module.css";
import AudioButton from "./AudioButton";
import ConsonantCard from "./ConsonantCard";
import VowelPositionDemo from "./VowelPositionDemo";
import WordBuilder from "./WordBuilder";

type LessonTab = "consonant" | "vowel" | "builder";

export default function LessonPlayer({ sound, onBack, onPractice }: { sound: boolean; onBack: () => void; onPractice: () => void }) {
  const [tab, setTab] = useState<LessonTab>("consonant");
  const [wordIndex, setWordIndex] = useState(0);
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [hideWord, setHideWord] = useState(false);
  const [hideImage, setHideImage] = useState(false);
  const words = useMemo(() => tab === "vowel" ? [THAI_WORDS[0], THAI_WORDS[15], THAI_WORDS[20]] : THAI_WORDS, [tab]);
  const word = words[wordIndex % words.length];
  const consonant = THAI_CONSONANTS[wordIndex % THAI_CONSONANTS.length];
  const lessonLength = tab === "consonant" ? THAI_CONSONANTS.length : words.length;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (tab === "builder" && step < 3) setStep((value) => value + 1);
      else { setStep(1); setWordIndex((value) => (value + 1) % lessonLength); }
    }, 1100);
    return () => window.clearInterval(timer);
  }, [lessonLength, playing, step, tab]);

  const changeTab = (next: LessonTab) => { setTab(next); setWordIndex(0); setStep(1); setPlaying(false); setHideWord(false); setHideImage(false); };
  const move = (direction: number) => { setWordIndex((value) => (value + direction + lessonLength) % lessonLength); setStep(1); setPlaying(false); };
  const moveStep = (direction: number) => { setStep((value) => Math.min(3, Math.max(1, value + direction))); setPlaying(false); };
  const restart = () => { setWordIndex(0); setStep(1); setPlaying(true); };

  return <main className={`${styles.screen} ${styles.lesson}`} data-stage="lesson" aria-labelledby="lesson-title">
    <div className={styles.lessonTabs} role="tablist" aria-label="หัวข้อเรียนรู้">
      <button type="button" role="tab" aria-selected={tab === "consonant"} className={`kc-tap ${styles.lessonTab} ${tab === "consonant" ? styles.lessonTabActive : ""}`} onClick={() => changeTab("consonant")}>1. พยัญชนะ</button>
      <button type="button" role="tab" aria-selected={tab === "vowel"} className={`kc-tap ${styles.lessonTab} ${tab === "vowel" ? styles.lessonTabActive : ""}`} onClick={() => changeTab("vowel")}>2. ตำแหน่งสระ</button>
      <button type="button" role="tab" aria-selected={tab === "builder"} className={`kc-tap ${styles.lessonTab} ${tab === "builder" ? styles.lessonTabActive : ""}`} onClick={() => changeTab("builder")}>3. โรงงานสร้างคำ</button>
    </div>
    <section key={`${tab}-${tab === "consonant" ? consonant.id : word.id}-${step}`} className={styles.lessonCard} role="status" aria-live="polite">
      <div className={styles.lessonHeader}><span className={styles.eyebrow}>{tab === "consonant" ? "พยัญชนะไทย ก–ฮ" : tab === "vowel" ? "สระอยู่ตรงไหน" : "ประสมคำทีละขั้น"}</span><h2 id="lesson-title">{tab === "consonant" ? `${consonant.letter} ${hideWord ? "อะไรเอ่ย" : consonant.mnemonic}` : tab === "vowel" ? thaiVowelLabel(word.vowel) : `สร้างคำว่า “${hideWord ? "?" : word.word}”`}</h2><span className={styles.lessonCounter}>{wordIndex + 1}/{lessonLength}</span></div>
      <div className={styles.lessonMain}>
        {tab === "consonant" && <ConsonantCard consonant={consonant} hideWord={hideWord} hideImage={hideImage} sound={sound} />}
        {tab === "vowel" && <VowelPositionDemo consonant={word.consonant} vowel={word.vowel} position={word.composition.vowelPosition} word={word.word} />}
        {tab === "builder" && <><WordBuilder word={word} step={step} hideWord={hideWord} /><div className={styles.stepControls} aria-label="ควบคุมการประสมคำทีละขั้น"><button type="button" className={`kc-tap ${styles.stepButton}`} onClick={() => moveStep(-1)} disabled={step === 1} aria-label="ย้อนกลับไปขั้นก่อนหน้า">← ขั้นก่อนหน้า</button><span className={styles.stepStatus} role="status" aria-live="polite">ขั้น {step} จาก 3</span><button type="button" className={`kc-tap ${styles.stepButton} ${styles.stepButtonNext}`} onClick={() => moveStep(1)} disabled={step === 3} aria-label="แสดงขั้นถัดไป">ขั้นถัดไป →</button></div><AudioButton src={word.audio} text={word.word} disabled={!sound} label="ฟังคำ" /></>}
      </div>
      <div className={styles.lessonPager}><button type="button" className="kc-tap" onClick={() => move(-1)} aria-label="ตัวอย่างก่อนหน้า">←</button><button type="button" className="kc-tap" onClick={() => move(1)} aria-label="ตัวอย่างถัดไป">→</button></div>
    </section>
    <div className={styles.lessonControls}>
      <button type="button" className={`kc-tap ${styles.secondaryButton}`} onClick={() => setPlaying((value) => !value)}>{playing ? "⏸ หยุด" : "▶ เล่นอัตโนมัติ"}</button>
      <button type="button" className={`kc-tap ${styles.secondaryButton}`} onClick={restart}>↺ เริ่มใหม่</button>
      {tab !== "vowel" && <button type="button" className={`kc-tap ${styles.secondaryButton}`} aria-pressed={hideWord} onClick={() => setHideWord((value) => !value)}>🙈 {hideWord ? "แสดงคำ" : "ซ่อนคำ"}</button>}
      {tab === "consonant" && <button type="button" className={`kc-tap ${styles.secondaryButton}`} aria-pressed={hideImage} onClick={() => setHideImage((value) => !value)}>🖼️ {hideImage ? "แสดงภาพ" : "ซ่อนภาพ"}</button>}
    </div>
    <div className={styles.actions}><button type="button" className={`kc-tap ${styles.ghostButton}`} onClick={onBack}>← เมนู</button><button type="button" className={`kc-tap ${styles.primaryButton}`} onClick={onPractice}>ไปฝึกทำ →</button></div>
  </main>;
}
