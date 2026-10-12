"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "./fx";
import type { GiftSound } from "./useGiftSound";
import styles from "./GiftExchange.module.css";

const STEPS = 20;
const FIRST_DELAY = 50;
const SLOWDOWN = 1.15;
const MAX_DELAY = 280;

type Props = {
  names: string[];
  starterLabel: string;
  /** false = กลับมาจากเกมค้าง แสดงผลเลยไม่ต้องหมุน */
  animate: boolean;
  play: (kind: GiftSound) => void;
  onLanded: () => void;
  onContinue: () => void;
};

/** ลำดับชื่อที่วิ่งผ่านช่องสล็อต จบที่คนเริ่มเสมอ */
function spinOrder(names: string[], starter: string): string[] {
  const offset = Math.floor(Math.random() * names.length);
  const order = Array.from({ length: STEPS }, (_, i) => names[(offset + i) % names.length]);
  order[order.length - 1] = starter;
  return order;
}

export default function StarterSpin({ names, starterLabel, animate, play, onLanded, onContinue }: Props) {
  const [skip] = useState(() => !animate || names.length < 2 || reducedMotion());
  const [shown, setShown] = useState(skip ? starterLabel : names[0]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(skip);
  const playRef = useRef(play);
  const landedRef = useRef(onLanded);

  useEffect(() => {
    playRef.current = play;
    landedRef.current = onLanded;
  });

  useEffect(() => {
    const timers: number[] = [];
    if (skip) {
      if (animate) timers.push(window.setTimeout(() => landedRef.current(), 0));
      return () => timers.forEach(clearTimeout);
    }
    const order = spinOrder(names, starterLabel);
    let at = 0;
    let delay = FIRST_DELAY;
    order.forEach((name, i) => {
      timers.push(
        window.setTimeout(() => {
          setShown(name);
          setStep(i);
          if (i === order.length - 1) {
            setDone(true);
            landedRef.current();
          } else {
            playRef.current("tick");
          }
        }, at),
      );
      at += delay;
      delay = Math.min(MAX_DELAY, delay * SLOWDOWN);
    });
    return () => timers.forEach(clearTimeout);
    // หมุนครั้งเดียวตอน mount — App เปลี่ยน key ถ้าต้องหมุนใหม่
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.starter}>
      <p className={styles.starterLead}>{done ? "ได้คนเริ่มแล้ว!" : "กำลังสุ่มคนเริ่ม..."}</p>
      <div className={`${styles.slotWindow} ${done ? styles.slotDone : ""}`}>
        <span key={step} className={styles.slotName}>
          {shown}
        </span>
      </div>
      <p className={styles.srOnly} aria-live="polite">
        {done ? `${starterLabel} เริ่มก่อน` : ""}
      </p>
      {done && (
        <>
          <p className={styles.starterResult}>🎉 {starterLabel} เริ่มก่อน!</p>
          <button type="button" className={`${styles.primaryBtn} ${styles.appear}`} onClick={onContinue}>
            ไปที่กล่องของขวัญ 🎁
          </button>
        </>
      )}
    </div>
  );
}
