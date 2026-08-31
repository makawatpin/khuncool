"use client";

import { useEffect, useRef, useState } from "react";
import FractionNumber from "./FractionNumber";
import FractionShape from "./FractionShape";
import Mascot from "./Mascot";
import { PAINT_QUESTIONS } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = {
  onFinish: () => void;
  onSound: (name: "correct" | "pop" | "click") => void;
};

export default function PaintGame({ onFinish, onSound }: Props) {
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState<number[]>([]);
  const [checked, setChecked] = useState<"right" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // เคลียร์ timer ตอน unmount — ถ้าครูกดปุ่มแบรนด์กลับหน้าแรกระหว่างรอ 1.2 วินาที
  // แล้ว timer ยังทำงานอยู่ setIndex/setFilled/setChecked จะสั่ง state ของ component ที่ถูกถอดไปแล้ว
  // และ onFinish() จะยิงพาไปหน้าเกมตอบคำถามทั้งที่ครูออกจากเกมนี้ไปแล้ว
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  const question = PAINT_QUESTIONS[index];
  // ระบายส่วนไหนก็ได้ ขอให้ครบจำนวน — เศษส่วนไม่สนใจว่าเป็นชิ้นไหน
  const isRight = filled.length === question.numerator;

  const toggle = (part: number) => {
    if (checked === "right") return;
    setChecked(null);
    onSound("click");
    setFilled((current) =>
      current.includes(part) ? current.filter((value) => value !== part) : [...current, part]);
  };

  const check = () => {
    if (!isRight) {
      setChecked("wrong");
      setAttempts((n) => n + 1);
      onSound("pop");
      return;
    }
    setChecked("right");
    onSound("correct");
    advanceTimer.current = setTimeout(() => {
      if (index + 1 >= PAINT_QUESTIONS.length) { onFinish(); return; }
      setIndex(index + 1);
      setFilled([]);
      setChecked(null);
      setAttempts(0);
    }, 1200);
  };

  return (
    <main className={`${styles.screen} ${styles.game}`} data-stage="game" data-game="paint">
      {checked === "right" && (
        <div className={styles.burst} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className={styles.burstStar}>★</span>)}
        </div>
      )}

      <div className={styles.progress} aria-label={`ข้อ ${index + 1} จาก ${PAINT_QUESTIONS.length}`}>
        {PAINT_QUESTIONS.map((row, i) => (
          <span key={row.id} className={i < index || (i === index && checked === "right") ? styles.starOn : styles.starOff} aria-hidden="true">★</span>
        ))}
      </div>

      <div className={styles.gameBoard}>
        <div className={styles.gamePrompt}>
          <p className={styles.gameLead}>แตะให้ระบายได้เท่านี้</p>
          <FractionNumber numerator={question.numerator} denominator={question.denominator} size="lg" />
        </div>

        <FractionShape
          key={question.id}
          shape={question.shape}
          parts={question.denominator}
          filled={filled}
          size="lg"
          onTapPart={toggle}
          label={`แตะเพื่อระบาย รูปแบ่ง ${question.denominator} ส่วน`}
        />

        <p className={styles.paintCount} role="status" aria-live="polite">
          ตอนนี้ระบายไว้ {filled.length} จาก {question.denominator} ส่วน
        </p>
      </div>

      <div className={styles.paintControls}>
        <button type="button" className={`kc-tap ${styles.ghost}`} onClick={() => { onSound("click"); setFilled([]); setChecked(null); }}>
          ล้างสี
        </button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={check} disabled={checked === "right"}>
          ตรวจคำตอบ
        </button>
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {checked === "right" && <><Mascot mood="cheer" size="sm" /><strong className={styles.feedbackGood}>ถูกต้อง! {question.explain}</strong></>}
        {checked === "wrong" && (
          <>
            <Mascot mood="think" size="sm" />
            <span key={attempts} className={styles.feedbackRetry}>
              ยังไม่ใช่ — ต้องระบาย {question.numerator} ส่วน ตอนนี้ระบายไว้ {filled.length} ส่วน
            </span>
          </>
        )}
      </div>
    </main>
  );
}
