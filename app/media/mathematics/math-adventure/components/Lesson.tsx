"use client";

import { useEffect, useState } from "react";
import { LESSONS, OBJECTS } from "../gameData";
import styles from "../MathAdventureApp.module.css";
import NumberLine from "./NumberLine";

export default function Lesson({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [slide, setSlide] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [hideAnswer, setHideAnswer] = useState(false);
  const lesson = LESSONS[slide];
  const example = lesson.examples[exampleIndex];
  const item = OBJECTS[example.object];
  const operation = "operation" in example && example.operation ? example.operation : lesson.operation;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep((value) => {
      if (value >= 3) {
        if (exampleIndex < lesson.examples.length - 1) {
          setExampleIndex(exampleIndex + 1);
          return 1;
        }
        setPlaying(false);
        return 3;
      }
      return value + 1;
    }), 900);
    return () => window.clearInterval(id);
  }, [exampleIndex, lesson.examples.length, playing]);

  const restart = () => { setExampleIndex(0); setStep(1); setPlaying(true); };
  const changeSlide = (next: number) => { setSlide(next); setExampleIndex(0); setStep(1); setPlaying(false); setHideAnswer(false); };
  const changeExample = (next: number) => { setExampleIndex(next); setStep(1); setPlaying(false); };
  const moveStep = (direction: -1 | 1) => {
    setPlaying(false);
    setStep((current) => Math.min(3, Math.max(1, current + direction)));
  };
  const answer = operation === "addition" ? example.a + example.b : example.a - example.b;
  const equation = `${example.a} ${operation === "addition" ? "+" : "−"} ${example.b} = ${answer}`;
  const description = lesson.id === "line"
    ? `เริ่มที่ ${example.a} แล้ว${operation === "addition" ? "เดินหน้า" : "เดินถอยหลัง"} ${example.b} ช่อง เราจะหยุดที่ ${answer}`
    : operation === "addition"
      ? `มี${item.label} ${example.a} ${item.unit} ได้มาอีก ${example.b} ${item.unit} ลองนับทั้งหมดพร้อมกัน`
      : `มี${item.label} ${example.a} ${item.unit} เอาออก ${example.b} ${item.unit} ลองนับจำนวนที่เหลือ`;

  return <section className={`${styles.screen} ${styles.lesson}`} data-stage="lesson" aria-labelledby="lesson-title">
    <div className={styles.lessonTabs} role="tablist" aria-label="หัวข้อบทเรียน">
      {LESSONS.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={slide === index} className={`kc-tap ${styles.lessonTab} ${slide === index ? styles.lessonTabActive : ""}`} onClick={() => changeSlide(index)}>{index + 1}. {item.eyebrow}</button>)}
    </div>
    <div key={`${slide}-${exampleIndex}`} className={styles.lessonCard} role="status" aria-live="polite">
      <div className={styles.lessonCopy}>
        {lesson.examples.length > 1 && <div className={styles.lessonExampleNav} aria-label={`ตัวอย่างที่ ${exampleIndex + 1} จาก ${lesson.examples.length}`}>
          <button type="button" className="kc-tap" disabled={exampleIndex === 0} onClick={() => changeExample(exampleIndex - 1)} aria-label="ตัวอย่างก่อนหน้า">←</button>
          <strong>ตัวอย่าง {exampleIndex + 1}/{lesson.examples.length}</strong>
          <button type="button" className="kc-tap" disabled={exampleIndex === lesson.examples.length - 1} onClick={() => changeExample(exampleIndex + 1)} aria-label="ตัวอย่างถัดไป">→</button>
        </div>}
        <span className={styles.eyebrow}>{lesson.eyebrow}</span><h2 id="lesson-title">{lesson.title}</h2><p>{description}</p><div className={styles.lessonEquation}>{hideAnswer ? equation.replace(String(answer), "?") : equation}</div>
      </div>
      <div className={styles.lessonVisualColumn}>
        <div className={styles.lessonVisual} aria-label="ภาพอธิบายทีละขั้น">
          {lesson.id === "line" ? <NumberLine start={example.a} steps={example.b} operation={operation} limit={20} hideAnswer={hideAnswer} revealStep={step} /> : <>
            <div className={`${styles.demoObjects} ${example.a > 7 ? styles.demoDense : ""}`}>{Array.from({ length: example.a }, (_, i) => <span key={`a${i}`} style={{ ["--item-index" as string]: i }}>{item.emoji}</span>)}</div>
            {step >= 2 && <><strong className={styles.demoSymbol}>{operation === "addition" ? "+" : "−"}</strong><div className={`${styles.demoObjects} ${example.b > 7 ? styles.demoDense : ""} ${operation === "subtraction" ? styles.demoRemoved : styles.demoIncoming}`}>{Array.from({ length: example.b }, (_, i) => <span key={`b${i}`} style={{ ["--item-index" as string]: i }}>{item.emoji}</span>)}</div></>}
            {step >= 3 && <div className={styles.demoAnswer}>= {hideAnswer ? "?" : answer}</div>}
          </>}
        </div>
        <div className={styles.lessonStepControls} aria-label="ควบคุมภาพทีละขั้น">
          <button type="button" className={`kc-tap ${styles.stepButton}`} disabled={step === 1} onClick={() => moveStep(-1)} aria-label="ย้อนกลับไปขั้นก่อนหน้า">← ขั้นก่อนหน้า</button>
          <strong className={styles.stepStatus} aria-live="polite">ขั้น {step} จาก 3</strong>
          <button type="button" className={`kc-tap ${styles.stepButton} ${styles.stepButtonNext}`} disabled={step === 3} onClick={() => moveStep(1)} aria-label="แสดงขั้นถัดไป">ขั้นถัดไป →</button>
        </div>
      </div>
    </div>
    <div className={styles.lessonControls}>
      <button type="button" className={`kc-tap ${styles.secondaryButton}`} onClick={() => setPlaying((value) => !value)}>{playing ? "⏸ หยุด" : "▶ เล่นอัตโนมัติ"}</button>
      <button type="button" className={`kc-tap ${styles.secondaryButton}`} onClick={restart}>↺ เริ่มใหม่</button>
      <button type="button" className={`kc-tap ${styles.secondaryButton}`} aria-pressed={hideAnswer} onClick={() => setHideAnswer((value) => !value)}>{hideAnswer ? "👁 แสดงคำตอบ" : "🙈 ซ่อนคำตอบ"}</button>
    </div>
    <div className={styles.actions}><button type="button" className={`kc-tap ${styles.ghostButton}`} onClick={onBack}>← เมนู</button><button type="button" className={`kc-tap ${styles.primaryButton}`} onClick={onPractice}>ไปฝึกทำ →</button></div>
  </section>;
}
