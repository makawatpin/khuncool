"use client";

import { useEffect, useRef, useState } from "react";
import FractionNumber from "./FractionNumber";
import FractionShape from "./FractionShape";
import Mascot from "./Mascot";
import { CHOICE_QUESTIONS } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = {
  onFinish: () => void;
  onSound: (name: "correct" | "pop" | "click") => void;
};

export default function ChoiceGame({ onFinish, onSound }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // เคลียร์ timer ตอน unmount — ถ้าครูกดปุ่มแบรนด์กลับหน้าแรกระหว่างรอ 1.2 วินาที
  // แล้ว timer ยังทำงานอยู่ setIndex/setPicked จะสั่ง state ของ component ที่ถูกถอดไปแล้ว
  // และ onFinish() จะยิงพาไปหน้าเกมระบายสีทั้งที่ครูออกจากเกมนี้ไปแล้ว
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  const question = CHOICE_QUESTIONS[index];
  const isCorrect = picked !== null && picked === question.answerIndex;

  const pick = (option: number) => {
    if (isCorrect) return;
    setPicked(option);
    if (option !== question.answerIndex) { onSound("pop"); return; }
    onSound("correct");
    advanceTimer.current = setTimeout(() => {
      if (index + 1 >= CHOICE_QUESTIONS.length) { onFinish(); return; }
      setIndex(index + 1);
      setPicked(null);
    }, 1200);
  };

  return (
    <main className={`${styles.screen} ${styles.game}`} data-stage="game" data-game="choice">
      {isCorrect && (
        <div className={styles.burst} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className={styles.burstStar}>★</span>)}
        </div>
      )}

      <div className={styles.progress} aria-label={`ข้อ ${index + 1} จาก ${CHOICE_QUESTIONS.length}`}>
        {CHOICE_QUESTIONS.map((row, i) => (
          <span key={row.id} className={i < index || (i === index && isCorrect) ? styles.starOn : styles.starOff} aria-hidden="true">★</span>
        ))}
      </div>

      <div className={styles.gameBoard}>
        <div className={styles.gamePrompt}>
          <p className={styles.gameLead}>เลือกภาพที่ตรงกับเลขนี้</p>
          <FractionNumber numerator={question.numerator} denominator={question.denominator} size="lg" />
        </div>

        <div className={styles.optionRow}>
          {question.options.map((option, i) => (
            <button
              key={`${question.id}-${i}`}
              type="button"
              className={`kc-tap ${styles.option} ${picked === i ? (isCorrect ? styles.optionRight : styles.optionWrong) : ""}`}
              onClick={() => pick(i)}
            >
              <FractionShape
                shape={option.shape}
                parts={option.parts}
                filled={option.filled}
                unequal={option.unequal}
                size="sm"
                label={option.unequal
                  ? `ตัวเลือกที่ ${i + 1} แบ่ง ${option.parts} ส่วนไม่เท่ากัน ระบาย ${option.filled.length} ส่วน`
                  : `ตัวเลือกที่ ${i + 1} แบ่ง ${option.parts} ส่วนเท่ากัน ระบาย ${option.filled.length} ส่วน`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {isCorrect && <><Mascot mood="cheer" size="sm" /><strong className={styles.feedbackGood}>ถูกต้อง! {question.explain}</strong></>}
        {picked !== null && !isCorrect && (
          <>
            <Mascot mood="think" size="sm" />
            <span className={styles.feedbackRetry}>ยังไม่ใช่ ลองอีกที — {question.explain}</span>
          </>
        )}
      </div>
    </main>
  );
}
