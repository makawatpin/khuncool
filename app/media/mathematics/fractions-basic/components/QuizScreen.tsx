"use client";

import { useEffect, useState } from "react";
import { loadActiveRosterNames } from "@/lib/classrooms/storage";
import FractionShape from "./FractionShape";
import { QUIZ_QUESTIONS } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = { onFinish: () => void; onSound: (name: "click" | "pop") => void };

export default function QuizScreen({ onFinish, onSound }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [roster, setRoster] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);

  // อ่านรายชื่อห้องที่ครูบันทึกไว้ใน /classrooms ถ้าไม่มีก็ซ่อนปุ่มสุ่มไปเลย
  // ไม่ขึ้นข้อความชวนไปสร้าง — ครูกำลังสอนอยู่ ไม่ใช่เวลาชวนตั้งค่า
  // อ่านใน effect เพราะ localStorage ไม่มีบน server แล้ว hydration จะไม่ตรง
  useEffect(() => {
    queueMicrotask(() => {
      try { setRoster(loadActiveRosterNames()); } catch { setRoster([]); }
    });
  }, []);

  const question = QUIZ_QUESTIONS[index];
  const isLast = index === QUIZ_QUESTIONS.length - 1;

  const pickStudent = () => {
    if (roster.length === 0) return;
    onSound("pop");
    setPicked(roster[Math.floor(Math.random() * roster.length)]);
  };

  const next = () => {
    onSound("click");
    setPicked(null);
    if (isLast) { onFinish(); return; }
    setIndex(index + 1);
    setRevealed(false);
  };

  return (
    <main className={`${styles.screen} ${styles.quiz}`} data-stage="quiz">
      <div className={styles.quizTop}>
        <span className={styles.quizCount}>ข้อ {index + 1} จาก {QUIZ_QUESTIONS.length}</span>
        {roster.length > 0 && (
          <button type="button" className={`kc-tap-chrome ${styles.toolbarButton}`} onClick={pickStudent}>
            🎲 สุ่มคนตอบ
          </button>
        )}
        {picked && <span className={styles.picked} role="status" aria-live="polite">🙋 {picked}</span>}
      </div>

      <div className={styles.quizBoard}>
        <h2 className={styles.quizQuestion} role="status" aria-live="polite">{question.question}</h2>
        <div className={styles.quizShapes}>
          {question.shapes.map((shape, i) => (
            <FractionShape
              key={`${question.id}-${i}`}
              shape={shape.shape}
              parts={shape.parts}
              filled={shape.filled}
              unequal={shape.unequal}
              size={question.shapes.length > 1 ? "md" : "lg"}
              label={shape.unequal
                ? `รูปที่ ${i + 1} แบ่ง ${shape.parts} ส่วนไม่เท่ากัน ระบาย ${shape.filled.length} ส่วน`
                : `รูปที่ ${i + 1} แบ่ง ${shape.parts} ส่วนเท่ากัน ระบาย ${shape.filled.length} ส่วน`}
            />
          ))}
        </div>
        {revealed && (
          <div className={styles.quizAnswer} role="status" aria-live="polite">
            <strong>{question.answer}</strong>
            <span>{question.note}</span>
          </div>
        )}
      </div>

      <div className={styles.quizControls}>
        <button
          type="button"
          className={`kc-tap ${styles.ghost}`}
          onClick={() => { onSound("pop"); setRevealed(true); }}
          disabled={revealed}
        >เฉลย</button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={next}>
          {isLast ? "จบบทเรียน →" : "ข้อถัดไป →"}
        </button>
      </div>
    </main>
  );
}
