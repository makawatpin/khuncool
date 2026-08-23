"use client";

import { useState } from "react";
import styles from "../ThaiKingdomApp.module.css";
import { displayThaiVowel, thaiVowelLabel } from "../thaiText";
import type { ThaiWord } from "../types";

export default function WordBuilder({ word, step = 3, interactive = false, hideWord = false, onComplete }: { word: ThaiWord; step?: number; interactive?: boolean; hideWord?: boolean; onComplete?: (answer: string) => void }) {
  const pieces = [word.consonant, word.vowel];
  const [placed, setPlaced] = useState<string[]>([]);
  const add = (piece: string) => {
    if (placed.includes(piece)) return;
    const next = [...placed, piece];
    setPlaced(next);
    if (next.length === pieces.length) onComplete?.(word.word);
  };
  const displayPiece = (piece: string) => piece === word.vowel ? thaiVowelLabel(word.vowel) : piece;
  if (interactive) return <div className={styles.interactiveBuilder}>
    <div className={styles.builderTray} aria-label="ส่วนประกอบของคำ">{pieces.map((piece) => <button draggable type="button" key={piece} className={`kc-tap ${styles.wordPiece}`} onDragStart={(event) => event.dataTransfer.setData("text/plain", piece)} onClick={() => add(piece)} disabled={placed.includes(piece)}>{displayPiece(piece)}</button>)}</div>
    <div className={styles.builderArrow}>➜</div>
    <div className={styles.builderDrop} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); add(event.dataTransfer.getData("text/plain")); }} aria-live="polite">{placed.length ? placed.map(displayPiece).join(" + ") : "แตะหรือลากมาวาง"}</div>
  </div>;
  return <div className={styles.wordFactory} aria-label="โรงงานสร้างคำ">
    <div className={`${styles.factoryPart} ${step >= 1 ? styles.factoryVisible : ""}`}><span>พยัญชนะ</span><strong>{word.consonant}</strong></div>
    <b>＋</b>
    <div className={`${styles.factoryPart} ${styles.vowelPart} ${step >= 2 ? styles.factoryVisible : ""}`}><span>{thaiVowelLabel(word.vowel)}</span><strong>“{displayThaiVowel(word.vowel)}”</strong></div>
    <b>➜</b>
    <div className={`${styles.factoryWord} ${step >= 3 ? styles.factoryVisible : ""}`}><span>คำใหม่</span><strong>{hideWord ? "?" : word.word}</strong></div>
  </div>;
}
