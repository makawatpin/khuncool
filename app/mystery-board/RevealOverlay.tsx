"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MysteryBoard.module.css";
import { isJackpot, isSuper, tileScore, type Tile } from "./boardModel";

/** ต้องตรงกับ .card { transition: transform 0.6s ... } ใน MysteryBoard.module.css */
export const FLIP_DELAY_MS = 260;
export const FLIP_DURATION_MS = 600;

/** หน้าหลังโผล่กลางจังหวะพลิก ตอนการ์ดหันสันเข้าหาคนดู */
export const FACE_SWAP_MS = FLIP_DELAY_MS + FLIP_DURATION_MS / 2;

/**
 * ช่วงชาร์จพลังก่อนเฉลยคะแนน — การ์ดขึ้น ? แล้ววงแสงวิ่งรอบขอบจนเต็ม
 * ครูใช้จังหวะนี้ให้ทั้งห้องนับถอยหลังพร้อมกัน
 *
 * ต้องยาวเท่ากันทุกใบ ห้ามยืดให้ป้ายรางวัลใหญ่เด็ดขาด ไม่งั้นเด็กจับทางได้
 * ภายในไม่กี่ตาว่า "ชาร์จนาน = ของใหญ่" แล้วความลุ้นหายหมด
 */
export const CHARGE_MS = 1600;

/** เวลาที่คะแนนโผล่จริง นับจากตอนเปิดป้าย */
export const REVEAL_AT_MS = FACE_SWAP_MS + CHARGE_MS;

type Props = {
  tile: Tile;
  /** true เมื่อเป็นการเปิดครั้งแรก (เล่นแอนิเมชัน) — false เมื่อกดดูย้อนหลัง */
  animate: boolean;
  /** true ระหว่างช่วงสั่นจอเมื่อเจอระเบิด */
  shake?: boolean;
  onClose: () => void;
};

export default function RevealOverlay({
  tile,
  animate,
  shake,
  onClose,
}: Props) {
  const [flipped, setFlipped] = useState(!animate);
  /**
   * สลับหน้าการ์ดตรงกลางจังหวะพลิก ตอนที่การ์ดหันสันเข้าหาคนดูพอดี
   *
   * ใช้ state สั่งเองแทนที่จะพึ่ง backface-visibility เพราะ 3D context ถูก
   * flatten ได้ระหว่างที่ cardRise ยังอนิเมต opacity อยู่ แล้วหน้าแรกจะทะลุ
   * ขึ้นมาเป็นเลขกลับด้าน (และ transition ก็ถูกเบราว์เซอร์ freeze ตอนแท็บ
   * ไม่ได้แสดงผล) — setTimeout ยังทำงานทั้งสองกรณี
   */
  const [showBack, setShowBack] = useState(!animate);
  /** false = กำลังชาร์จ (โชว์ ?) / true = เฉลยคะแนนแล้ว */
  const [charged, setCharged] = useState(!animate);
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
    // ผู้ที่ขอลดการเคลื่อนไหวข้ามทั้งการพลิกและช่วงชาร์จ เห็นผลทันที
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const now = window.setTimeout(() => {
        setFlipped(true);
        setShowBack(true);
        setCharged(true);
      }, 0);
      return () => window.clearTimeout(now);
    }
    const flip = window.setTimeout(() => setFlipped(true), FLIP_DELAY_MS);
    const swap = window.setTimeout(() => setShowBack(true), FACE_SWAP_MS);
    const reveal = window.setTimeout(() => setCharged(true), REVEAL_AT_MS);
    return () => {
      window.clearTimeout(flip);
      window.clearTimeout(swap);
      window.clearTimeout(reveal);
    };
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
  const grand = prize ? isSuper(prize) : false;
  const celebrate = prize ? isJackpot(prize) : false;
  const dangerous = prize?.kind === "bomb";

  return (
    <div
      className={`${styles.overlay} ${shake ? styles.shakeNow : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`ผลของป้ายหมายเลข ${tile.id}`}
      onClick={onClose}
    >
      <div
        className={`${styles.card} ${flipped ? styles.cardFlipped : ""} ${
          showBack ? styles.cardShowBack : ""
        } ${charged ? styles.cardCharged : ""} ${
          /* สีประจำรางวัลต้องมาหลังชาร์จเสร็จเท่านั้น ถ้าโผล่ตั้งแต่ยังชาร์จ
             เด็กจะรู้ผลจากสีการ์ดก่อนเฉลย แล้วช่วงลุ้นก็ไม่มีความหมาย */
          charged && grand ? styles.cardSuper : ""
        } ${charged && celebrate ? styles.cardJackpot : ""} ${
          charged && dangerous ? styles.cardBomb : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          // กดที่การ์ดเพื่อข้ามช่วงชาร์จ เผื่อคาบไหนเวลาไม่พอ
          setCharged(true);
        }}
      >
        <div className={styles.cardFace}>
          <span className={styles.cardNumber}>{tile.id}</span>
        </div>
        <div className={`${styles.cardFace} ${styles.cardBack}`}>
          {charged && grand && (
            <span className={styles.cardRays} aria-hidden="true" />
          )}
          {/* โหมดคำถามไม่ต้องลุ้น — ขึ้นคำถามทันทีที่พลิก ไม่มีอะไรให้เฉลย */}
          {prize && !charged ? (
            <>
              <span className={styles.chargeMark}>?</span>
              <svg
                className={styles.chargeRing}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* pathLength=1 ทำให้ระยะเส้นประคิดเป็นสัดส่วน ไม่เพี้ยน
                    แม้ viewBox จะถูกยืดไม่เท่ากันสองแกน */}
                <rect
                  x="2"
                  y="2"
                  width="96"
                  height="96"
                  rx="9"
                  pathLength={1}
                />
              </svg>
            </>
          ) : prize ? (
            <>
              <span className={styles.cardEmoji}>{prize.emoji}</span>
              {/* คะแนนคือพระเอกของหน้านี้ ตัวหนังสือบรรยายเป็นตัวรอง */}
              <span className={styles.cardScore}>{tileScore(prize)}</span>
              <span className={styles.cardLabel}>
                {prize.kind === "points" ? "คะแนน" : prize.label}
              </span>
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
