"use client";

import { readFraction } from "../fractionGeometry";
import styles from "./FractionNumber.module.css";

type Props = {
  numerator: number;
  denominator: number;
  /** ตัวส่วนขึ้นก่อน ตัวเศษขึ้นทีหลัง — ผูกตัวเลขกับภาพทีละครึ่ง */
  reveal?: "denominator" | "full";
  size?: "md" | "lg";
};

export default function FractionNumber({ numerator, denominator, reveal = "full", size = "md" }: Props) {
  const showNumerator = reveal === "full";
  return (
    <span
      className={`${styles.fraction} ${size === "lg" ? styles.lg : styles.md}`}
      aria-label={showNumerator ? readFraction(numerator, denominator) : `แบ่ง ${denominator} ส่วน`}
      role="img"
    >
      {/* ตัวเศษถูกเรนเดอร์เสมอ ซ่อนด้วย visibility ไม่ใช่ไม่เรนเดอร์
          กล่องจึงกว้างเท่าเดิมตั้งแต่แรก และเส้นคั่นไม่ขยับตอนตัวเลขโผล่ */}
      <b className={showNumerator ? styles.numeratorIn : styles.numeratorHidden} aria-hidden="true">
        {numerator}
      </b>
      <i className={styles.rule} aria-hidden="true" />
      {/* ตัวส่วนไม่มี class ของตัวเอง เพราะไม่มีอะไรต้องแต่งต่างจากตัวเศษ —
          รับ font-size สี และน้ำหนักมาจาก .fraction ทั้งหมด */}
      <b aria-hidden="true">{denominator}</b>
    </span>
  );
}
