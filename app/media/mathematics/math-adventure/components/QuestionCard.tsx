"use client";

import { useState } from "react";
import { OBJECTS } from "../gameData";
import styles from "../MathAdventureApp.module.css";
import type { MathQuestion } from "../types";
import NumberLine from "./NumberLine";

function Objects({ question }: { question: MathQuestion }) {
  const item = OBJECTS[question.object];
  const first = Array.from({ length: question.a }, (_, i) => <span key={`a${i}`} style={{ ["--item-index" as string]: i }}>{item.emoji}</span>);
  const second = Array.from({ length: question.b }, (_, i) => <span key={`b${i}`} style={{ ["--item-index" as string]: question.a + i }} className={question.operation === "subtraction" ? styles.removedObject : ""}>{item.emoji}</span>);
  return <div className={styles.objectEquation} aria-label={`${item.label} ${question.a} ${question.operation === "addition" ? "รวมกับ" : "เอาออก"} ${question.b}`}>
    <div className={styles.objectGroup}>{first}</div><strong>{question.operation === "addition" ? "+" : "−"}</strong><div className={styles.objectGroup}>{second}</div>
  </div>;
}

function DragActivity({ question }: { question: MathQuestion }) {
  const [moved, setMoved] = useState(0);
  const item = OBJECTS[question.object];
  const moveOne = () => setMoved((value) => Math.min(question.b, value + 1));
  const basketCount = question.operation === "addition" ? question.a + moved : question.a - moved;
  const available = Math.max(0, question.b - moved);
  return <div className={styles.dragActivity}>
    <div className={styles.dragSource} aria-label="วัตถุที่ยังย้ายได้">
      {available > 0 && <><button type="button" draggable className={`kc-tap ${styles.dragObject}`} onDragStart={(event) => event.dataTransfer.setData("text/plain", "math-object")} onClick={moveOne} aria-label={`${question.operation === "addition" ? "ย้าย" : "เอาออก"}${item.label}หนึ่งชิ้น`}>{item.emoji}</button><small>อีก {available} ครั้ง</small></>}
      {available === 0 && <span>พร้อมแล้ว ✓</span>}
    </div>
    <div className={styles.dragArrow} aria-hidden="true">{question.operation === "addition" ? "➜" : "↘"}</div>
    <div className={styles.dropZone} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (event.dataTransfer.getData("text/plain")) moveOne(); }}>
      <span>{question.operation === "addition" ? "รวมตรงนี้" : "ที่เหลือ"}</span>
      <strong key={basketCount}>{item.emoji} × {Math.max(0, basketCount)}</strong>
      <small>{basketCount} ชิ้น</small>
    </div>
  </div>;
}

export default function QuestionCard({ question, index, total, feedback, showHint, onHint, onAnswer }: {
  question: MathQuestion;
  index: number;
  total: number;
  feedback: "correct" | "retry" | null;
  showHint: boolean;
  onHint: () => void;
  onAnswer: (answer: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const choose = (option: string) => {
    setSelected(option);
    onAnswer(option);
  };
  return <section className={`${styles.questionCard} ${feedback === "retry" ? styles.questionRetry : ""} ${feedback === "correct" ? styles.questionCorrect : ""}`} data-stage="question" data-question-kind={question.kind} aria-labelledby="question-title">
    <div className={styles.questionMeta}><span>ข้อ {index + 1}/{total}</span><span>{question.operation === "addition" ? "➕ บวก" : "➖ ลบ"}</span></div>
    <div role="status" aria-live="polite" className={styles.liveQuestion}>
      <h2 id="question-title">{question.prompt}</h2>
      {question.kind === "picture-count" && <><Objects question={question} /><DragActivity question={question} /></>}
      {question.kind === "number-line" && <NumberLine start={question.a} steps={question.b} operation={question.operation} limit={20} hideAnswer />}
      {!(["picture-count", "number-line", "word-problem"].includes(question.kind)) && <div className={styles.bigEquation}>
        {question.a} {question.kind === "operator" ? "□" : question.operation === "addition" ? "+" : "−"} {question.kind === "missing" ? "□" : question.b} = {question.operation === "addition" ? question.a + question.b : question.a - question.b}
      </div>}
    </div>
    <div className={styles.answerGrid} aria-label="ตัวเลือกคำตอบ">
      {question.options.map((option) => <button key={option} type="button" className={`kc-tap ${styles.answerButton} ${selected === option && feedback === "retry" ? styles.answerRetry : ""} ${selected === option && feedback === "correct" ? styles.answerCorrect : ""}`} onClick={() => choose(option)}>{option}</button>)}
    </div>
    <div className={styles.feedbackRow} role="status" aria-live="polite">
      {feedback === "correct" && <span className={styles.correctMessage}>✓ ถูกต้อง เก่งมาก!</span>}
      {feedback === "retry" && <span className={styles.retryMessage}>💛 ลองอีกครั้งนะ</span>}
      {!feedback && <button type="button" className={`kc-tap ${styles.hintButton}`} onClick={onHint}>💡 ดูคำใบ้</button>}
    </div>
    {showHint && <div className={styles.hintPanel} role="status">{question.hint}<NumberLine start={question.a} steps={question.b} operation={question.operation} limit={20} /></div>}
  </section>;
}
