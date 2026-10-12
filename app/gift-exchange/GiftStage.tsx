"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ChainStrip from "./ChainStrip";
import GiftBox, { GOLD, paletteFor } from "./GiftBox";
import { reducedMotion } from "./fx";
import type { GiftSound } from "./useGiftSound";
import styles from "./GiftExchange.module.css";

const CHARGE_MS = 2000;
const FINAL_CHARGE_MS = 3000;
const REDUCED_CHARGE_MS = 500;
const BURST_MS = 200;

const STARS = Array.from({ length: 12 }, (_, i) => i * 30);

type Anim = "idle" | "charging" | "burst" | "shown";

type Props = {
  giverLabel: string;
  receiverLabel: string | null;
  boxOpen: boolean;
  closesLoop: boolean;
  isLastBox: boolean;
  paletteIndex: number;
  remaining: number;
  chainLabels: string[];
  play: (kind: GiftSound, durationMs?: number) => void;
  onCannons: () => void;
  onFireworks: () => void;
  onOpen: () => void;
  onNext: () => void;
  onShowFinale: () => void;
  rosterButton: ReactNode;
};

export default function GiftStage({
  giverLabel,
  receiverLabel,
  boxOpen,
  closesLoop,
  isLastBox,
  paletteIndex,
  remaining,
  chainLabels,
  play,
  onCannons,
  onFireworks,
  onOpen,
  onNext,
  onShowFinale,
  rosterButton,
}: Props) {
  // กลับมาจากเกมค้างที่เปิดกล่องไปแล้ว → แสดงผลเลยไม่เล่นแอนิเมชันซ้ำ
  const [anim, setAnim] = useState<Anim>(boxOpen ? "shown" : "idle");
  const [chargeMs, setChargeMs] = useState(CHARGE_MS);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const lastBox = isLastBox || closesLoop;

  const open = useCallback(() => {
    if (anim !== "idle") return;
    const final = isLastBox;
    const charge = reducedMotion() ? REDUCED_CHARGE_MS : final ? FINAL_CHARGE_MS : CHARGE_MS;
    // ผลถูกสุ่มและบันทึกตอนนี้เลย (ใน App) ก่อนเริ่มแอนิเมชัน
    onOpen();
    setChargeMs(charge);
    setAnim("charging");
    play("drumroll", charge);
    timers.current.push(
      window.setTimeout(() => {
        setAnim("burst");
        play("pop");
        onCannons();
      }, charge),
      window.setTimeout(() => {
        setAnim("shown");
        play(final ? "finale" : "celebrate");
        if (final) onFireworks();
      }, charge + BURST_MS),
    );
  }, [anim, isLastBox, onCannons, onFireworks, onOpen, play]);

  const revealed = anim === "shown" && receiverLabel !== null;
  // ระหว่างลุ้น ห้ามแถบโซ่/ตัวนับเฉลยก่อนกล่องเปิด
  const hiding = boxOpen && !closesLoop && (anim === "charging" || anim === "burst");
  const visibleChain = hiding ? chainLabels.slice(0, -1) : chainLabels;
  const visibleRemaining = hiding ? remaining + 1 : remaining;

  return (
    <div className={styles.stage} data-anim={anim}>
      {anim === "charging" && <div className={styles.dim} />}
      {anim === "burst" && <div className={styles.flash} />}

      <p className={styles.turnTitle}>
        {lastBox && <span className={styles.lastTag}>🌟 กล่องสุดท้าย! </span>}
        ตาของ <strong>{giverLabel}</strong>
        {anim === "idle" && <span className={styles.turnHint}> — แตะกล่องเลย!</span>}
      </p>

      <div className={styles.boxArea}>
        <div className={styles.spotlight} />
        <div className={`${styles.beams} ${anim === "burst" || anim === "shown" ? styles.beamsOn : ""}`} />
        <button
          type="button"
          className={styles.boxBtn}
          onClick={open}
          disabled={anim !== "idle"}
          aria-label={`เปิดกล่องของขวัญของ ${giverLabel}`}
        >
          <GiftBox
            palette={lastBox ? GOLD : paletteFor(paletteIndex)}
            state={anim === "shown" ? "open" : anim}
            chargeMs={chargeMs}
          />
        </button>
        {revealed && (
          <div className={styles.reveal}>
            <div className={styles.starBurst} aria-hidden="true">
              {STARS.map((a) => (
                <span key={a} style={{ "--a": `${a}deg` } as CSSProperties} />
              ))}
            </div>
            <span
              className={styles.revealName}
              style={{ "--len": Math.max(3, receiverLabel.length) } as CSSProperties}
            >
              {receiverLabel}
            </span>
          </div>
        )}
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {revealed ? `${giverLabel} มอบของขวัญให้ ${receiverLabel}` : ""}
      </p>

      <div className={styles.stageAfter}>
        {revealed && (
          <>
            <p className={styles.pairLine}>
              {giverLabel} 🎁 → {receiverLabel}
              {closesLoop ? " — ครบวงแล้ว! 🎉" : ""}
            </p>
            {closesLoop ? (
              <button type="button" className={`${styles.primaryBtn} ${styles.nextBtn}`} onClick={onShowFinale}>
                ดูวงทั้งห้อง 🎉
              </button>
            ) : (
              <button type="button" className={`${styles.primaryBtn} ${styles.nextBtn}`} onClick={onNext}>
                ต่อไป: ตาของ {receiverLabel}
              </button>
            )}
          </>
        )}
      </div>

      <div className={styles.stageFooter}>
        <span className={styles.counter}>เหลือ {visibleRemaining} คน</span>
        {rosterButton}
      </div>
      <ChainStrip labels={visibleChain} />
    </div>
  );
}
