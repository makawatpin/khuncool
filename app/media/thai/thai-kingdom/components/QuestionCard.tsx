"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import styles from "../ThaiKingdomApp.module.css";
import { thaiVowelLabel } from "../thaiText";
import type { ThaiQuestion } from "../types";
import AudioButton from "./AudioButton";
import WordBuilder from "./WordBuilder";

export default function QuestionCard({ question, index, total, feedback, showHint, sound, hints, instantAnswer, onHint, onAnswer }: { question: ThaiQuestion; index: number; total: number; feedback: "correct" | "retry" | null; showHint: boolean; sound: boolean; hints: boolean; instantAnswer: boolean; onHint: () => void; onAnswer: (answer: string) => void }) {
  const [pending, setPending] = useState<string | null>(null);
  const choose = (answer: string) => { setPending(answer); if (instantAnswer) onAnswer(answer); };
  const masked = question.kind === "missing-consonant" ? `□${question.word.vowel}` : question.kind === "missing-vowel" ? `${question.word.consonant}□` : "";
  const canReplayWord = question.kind !== "picture-word";
  return <section className={`${styles.questionCard} ${feedback === "retry" ? styles.questionRetry : ""} ${feedback === "correct" ? styles.questionCorrect : ""}`} data-stage="question" data-question-kind={question.kind} aria-labelledby="question-title">
    <div className={styles.questionMeta}><span>ข้อ {index + 1}/{total}</span><span>{question.skill === "listening" ? "👂 ฟัง" : question.skill === "picture" ? "🖼️ ภาพ" : question.skill === "vowel" ? "🔤 สระ" : "🧩 ประสมคำ"}</span></div>
    <div className={styles.questionContent} role="status" aria-live="polite">
      <h2 id="question-title">{question.prompt}</h2>
      {canReplayWord && <AudioButton src={question.word.audio} text={question.word.word} disabled={!sound} label="ฟังอีกครั้ง" />}
      {question.kind === "picture-word" && <img className={styles.questionImage} src={question.word.image} alt={`ภาพคำว่า ${question.word.word}`} />}
      {(question.kind === "missing-consonant" || question.kind === "missing-vowel") && <div className={styles.missingWord}>{masked}<span>อ่านว่า “{question.word.word}”</span></div>}
      {question.kind === "arrange" && <WordBuilder word={question.word} interactive onComplete={choose} />}
    </div>
    {question.kind !== "arrange" && <div className={styles.answerGrid} aria-label="ตัวเลือกคำตอบ">{question.options.map((option) => <button key={option} type="button" className={`kc-tap ${styles.answerButton} ${pending === option ? styles.answerSelected : ""}`} onClick={() => choose(option)}>{question.kind === "missing-vowel" ? thaiVowelLabel(option as ThaiQuestion["word"]["vowel"]) : option}</button>)}</div>}
    {!instantAnswer && pending && !feedback && <button type="button" className={`kc-tap ${styles.revealButton}`} onClick={() => onAnswer(pending)}>ครูเปิดคำตอบ ✓</button>}
    <div className={styles.feedbackRow} role="status" aria-live="polite">{feedback === "correct" ? <span className={styles.correctMessage}>✓ ถูกต้อง เก่งมาก!</span> : feedback === "retry" ? <span className={styles.retryMessage}>💛 ใกล้แล้ว ลองอีกครั้งนะ</span> : hints ? <button type="button" className={`kc-tap ${styles.hintButton}`} onClick={onHint}>💡 {showHint ? "ซ่อนคำใบ้" : "ดูคำใบ้"}</button> : null}</div>
    {showHint && <div className={styles.hintPanel} role="status"><img src={question.word.image} alt="ภาพคำใบ้" /><span>ขึ้นต้นด้วย <b>{question.word.consonant}</b> ใช้ <b>{thaiVowelLabel(question.word.vowel)}</b></span><AudioButton src={question.word.audio} text={question.word.word} compact disabled={!sound} /></div>}
  </section>;
}
