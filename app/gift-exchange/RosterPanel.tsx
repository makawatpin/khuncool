"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "./chainModel";
import styles from "./GiftExchange.module.css";

type Props = {
  players: Player[];
  labels: Record<string, string>;
  chainIds: string[];
  canToggle: (id: string) => boolean;
  onToggle: (id: string) => void;
  onAdd: (name: string) => void;
  onClose: () => void;
};

export default function RosterPanel({ players, labels, chainIds, canToggle, onToggle, onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inChain = new Set(chainIds);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.panelBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-roster-title"
        tabIndex={-1}
      >
        <div className={styles.panelHead}>
          <h2 id="gift-roster-title" className={styles.setupTitle}>
            👥 รายชื่อ
          </h2>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            ปิด
          </button>
        </div>
        <p className={styles.hint}>
          ติ๊กคนขาดออกหรือเพิ่มคนมาสายได้ — คนที่มี 🔒 ถูกจับชื่อไปแล้ว จึงแก้ไม่ได้
        </p>
        <ul className={styles.chips}>
          {players.map((p) => {
            const locked = inChain.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className={styles.chip}
                  aria-pressed={p.active}
                  disabled={!canToggle(p.id)}
                  title={locked ? "ถูกจับชื่อแล้ว" : undefined}
                  onClick={() => onToggle(p.id)}
                >
                  {locked ? "🔒 " : ""}
                  {labels[p.id]}
                </button>
              </li>
            );
          })}
        </ul>
        <form
          className={styles.addRow}
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onAdd(name);
            setName("");
          }}
        >
          <input
            className={styles.addInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เพิ่มชื่อคนมาสาย"
            aria-label="เพิ่มชื่อคนมาสาย"
          />
          <button type="submit" className={styles.primaryBtnSm} disabled={!name.trim()}>
            เพิ่ม
          </button>
        </form>
      </div>
    </div>
  );
}
