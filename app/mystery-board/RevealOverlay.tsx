"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MysteryBoard.module.css";
import { isJackpot, type Tile } from "./boardModel";

type Props = {
  tile: Tile;
  /** true เมื่อเป็นการเปิดครั้งแรก (เล่นแอนิเมชัน) — false เมื่อกดดูย้อนหลัง */
  animate: boolean;
  onClose: () => void;
};

export default function RevealOverlay({ tile, animate, onClose }: Props) {
  const [flipped, setFlipped] = useState(!animate);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      try {
        previouslyFocused?.focus();
      } catch {
        /* องค์ประกอบเดิมอาจหายไปแล้ว — ปล่อยผ่าน */
      }
    };
  }, []);

  useEffect(() => {
    if (!animate) return;
    const id = window.setTimeout(() => setFlipped(true), 260);
    return () => window.clearTimeout(id);
  }, [animate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const prize = tile.prize;
  const celebrate = prize ? isJackpot(prize) : false;
  const dangerous = prize?.kind === "bomb";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`ผลของป้ายหมายเลข ${tile.id}`}
      onClick={onClose}
    >
      <div
        className={`${styles.card} ${flipped ? styles.cardFlipped : ""} ${
          celebrate ? styles.cardJackpot : ""
        } ${dangerous ? styles.cardBomb : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.cardFace}>
          <span className={styles.cardNumber}>{tile.id}</span>
        </div>
        <div className={`${styles.cardFace} ${styles.cardBack}`}>
          {prize ? (
            <>
              <span className={styles.cardEmoji}>{prize.emoji}</span>
              <span className={styles.cardLabel}>{prize.label}</span>
            </>
          ) : (
            <p className={styles.cardQuestion}>{tile.question}</p>
          )}
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        className={styles.primaryBtn}
        onClick={onClose}
      >
        กลับกระดาน
      </button>
    </div>
  );
}
