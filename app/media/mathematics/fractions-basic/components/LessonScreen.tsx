"use client";

import { useEffect, useState } from "react";
import FractionNumber from "./FractionNumber";
import FractionShape from "./FractionShape";
import { LESSON_SLIDES } from "../fractionsData";
import styles from "../FractionsApp.module.css";

type Props = { onFinish: () => void; onSound: (name: "click" | "pop") => void };

export default function LessonScreen({ onFinish, onSound }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const slide = LESSON_SLIDES[slideIndex];
  const current = slide.steps[step];
  const isLastStep = step === slide.steps.length - 1;
  const isLastSlide = slideIndex === LESSON_SLIDES.length - 1;

  // เล่นอัตโนมัติ 900ms/สเต็ป แล้วหยุดเองเมื่อจบสไลด์ ครูกดหยุดได้ตลอด
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setStep((value) => {
        if (value >= slide.steps.length - 1) { setPlaying(false); return value; }
        return value + 1;
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [playing, slide.steps.length]);

  const goSlide = (next: number) => {
    onSound("click");
    setSlideIndex(next);
    setStep(0);
    setPlaying(false);
  };

  const nextStep = () => {
    onSound("pop");
    setPlaying(false);
    if (!isLastStep) { setStep(step + 1); return; }
    if (!isLastSlide) { goSlide(slideIndex + 1); return; }
    onFinish();
  };

  const prevStep = () => {
    onSound("pop");
    setPlaying(false);
    if (step > 0) { setStep(step - 1); return; }
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
      setStep(LESSON_SLIDES[slideIndex - 1].steps.length - 1);
    }
  };

  return (
    <main className={`${styles.screen} ${styles.lesson}`} data-stage="lesson">
      <div className={styles.lessonTabs} role="tablist" aria-label="หัวข้อบทเรียน">
        {LESSON_SLIDES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={slideIndex === index}
            className={`kc-tap ${styles.lessonTab} ${slideIndex === index ? styles.lessonTabOn : ""}`}
            onClick={() => goSlide(index)}
          >{index + 1}</button>
        ))}
      </div>

      <div className={styles.lessonStage} role="status" aria-live="polite">
        <h2 className={styles.lessonTitle}>{slide.title}</h2>
        <div className={styles.lessonShapes}>
          {current.shapes.map((shape, index) => (
            <FractionShape
              key={`${slide.id}-${step}-${index}`}
              shape={shape.shape}
              parts={shape.parts}
              filled={shape.filled}
              unequal={shape.unequal}
              highlight={current.highlight}
              size={current.shapes.length > 1 ? "md" : "lg"}
              label={shape.unequal
                ? `รูปที่แบ่ง ${shape.parts} ส่วนไม่เท่ากัน`
                : `รูปแบ่ง ${shape.parts} ส่วนเท่ากัน ระบาย ${shape.filled.length} ส่วน`}
            />
          ))}
          {slide.fraction && current.reveal !== "none" && (
            <FractionNumber
              numerator={slide.fraction.numerator}
              denominator={slide.fraction.denominator}
              reveal={current.reveal}
              size="lg"
            />
          )}
        </div>
        <p className={styles.lessonCaption}>{current.caption}</p>
      </div>

      <div className={styles.lessonControls}>
        <button
          type="button"
          className={`kc-tap ${styles.ghost}`}
          onClick={prevStep}
          disabled={slideIndex === 0 && step === 0}
        >← ก่อนหน้า</button>
        <button
          type="button"
          className={`kc-tap ${styles.ghost}`}
          onClick={() => { onSound("click"); setStep(0); setPlaying(!playing); }}
          aria-pressed={playing}
        >{playing ? "⏸ หยุด" : "▶ เล่นเอง"}</button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={nextStep}>
          {isLastSlide && isLastStep ? "ไปเล่นเกม →" : "ถัดไป →"}
        </button>
      </div>
    </main>
  );
}
