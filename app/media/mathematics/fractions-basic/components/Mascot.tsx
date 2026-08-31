"use client";

import styles from "./Mascot.module.css";

type Props = {
  /** idle ตอนสอน cheer ตอนตอบถูก think ตอนตอบผิด */
  mood?: "idle" | "cheer" | "think";
  size?: "sm" | "md";
};

/** ปากยิ้มกับปากคิดเป็นคนละพาธ สลับใน JSX ไม่ใช่ด้วย property `d` ใน CSS
 *  เพราะ `d` เพิ่งรองรับครบไม่นาน และการสลับใน markup อ่านง่ายกว่าอยู่แล้ว */
const MOUTH = {
  idle: "M26 35 Q32 40 38 35",
  cheer: "M25 34 Q32 42 39 34",
  think: "M26 38 Q32 34 38 38",
};

/**
 * มาสคอตของสื่อเศษส่วน เขียนใหม่แทนการใช้ KcFace ของ /media/english
 *
 * KcFace วาง geometry ไว้ใน inline style ทั้งหมด (width, height, position, top)
 * ซึ่ง container query เอื้อมไม่ถึงและ inline ชนะทุกกฎ — เป็นข้อผิดพลาดชุดเดียวกับ
 * ที่ media-stage-contract.md ข้อ 3 บันทึกไว้ และมี 7 เกมใช้ KcFace อยู่
 * การแก้ที่ต้นทางจะกระทบทั้งหมด จึงเขียนตัวใหม่ที่คุมขนาดจาก CSS ตั้งแต่แรก
 *
 * ตัวมาสคอตเป็นของประกอบล้วน ความหมายอยู่ที่ข้อความข้าง ๆ เสมอ จึงตั้ง aria-hidden
 * ไว้ ไม่งั้นมันจะถูกอ่านซ้ำทุกข้อ เพราะข้อความฟีดแบ็กที่มันอยู่ด้วยเป็น live region
 */
export default function Mascot({ mood = "idle", size = "md" }: Props) {
  // "think" ไม่มี animation ของตัวเอง (เปลี่ยนแค่ปากใน MOUTH) จึงไม่มีคลาสให้ styles[mood]
  // คืนมา — กรองด้วย Boolean() ทิ้งไปแทนที่จะเติมกฎ CSS เปล่า ๆ มาถ่วงดุล
  const moodClass = styles[mood];
  return (
    <svg
      viewBox="0 0 64 74"
      className={[styles.mascot, size === "sm" ? styles.sm : styles.md, moodClass].filter(Boolean).join(" ")}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className={styles.shadow} cx="32" cy="71" rx="18" ry="3" />
      <rect className={styles.body} x="14" y="44" width="36" height="26" rx="12" />
      <circle className={styles.head} cx="32" cy="28" r="20" />
      <circle className={styles.eye} cx="25" cy="27" r="3" />
      <circle className={styles.eye} cx="39" cy="27" r="3" />
      <path className={styles.mouth} d={MOUTH[mood]} fill="none" />
      <circle className={styles.cheek} cx="19" cy="33" r="3.2" />
      <circle className={styles.cheek} cx="45" cy="33" r="3.2" />
    </svg>
  );
}
