"use client";

import Mascot from "./Mascot";
import styles from "../FractionsApp.module.css";

type Props = { onHome: () => void; onReplay: () => void };

const LEARNED = [
  "เศษส่วนต้องแบ่งเท่า ๆ กันเท่านั้น",
  "ตัวส่วนบอกว่าแบ่งทั้งหมดกี่ส่วน ตัวเศษบอกว่าเอามากี่ส่วน",
  "รูปทรงต่างกันเขียนเป็นเศษส่วนเดียวกันได้",
];

export default function ResultScreen({ onHome, onReplay }: Props) {
  return (
    <main className={`${styles.screen} ${styles.result}`} data-stage="result">
      <div className={styles.burst} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <span key={i} className={styles.burstStar}>★</span>)}
      </div>
      <Mascot mood="cheer" />
      <h2 className={styles.resultTitle}>เก่งมาก! วันนี้เราเรียนเรื่อง</h2>
      <ul className={styles.resultList}>
        {LEARNED.map((line) => <li key={line}>{line}</li>)}
      </ul>
      <div className={styles.resultControls}>
        <button type="button" className={`kc-tap ${styles.ghost}`} onClick={onReplay}>เล่นเกมอีกครั้ง</button>
        <button type="button" className={`kc-tap ${styles.primary}`} onClick={onHome}>กลับหน้าแรก</button>
      </div>
    </main>
  );
}
