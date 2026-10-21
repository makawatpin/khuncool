"use client";

import ClassroomRosterPicker from "@/components/ClassroomRosterPicker";
import { MIN_PLAYERS, type Player } from "./chainModel";
import styles from "./GiftExchange.module.css";

type Props = {
  namesText: string;
  players: Player[];
  labels: Record<string, string>;
  activeCount: number;
  canStart: boolean;
  /** มีเกมค้างรอครูเลือก "เล่นต่อ/เริ่มใหม่" — ห้ามแก้รายชื่อจนกว่าจะเลือก */
  locked: boolean;
  resume: { opened: number; total: number } | null;
  onNamesText: (text: string) => void;
  onRoster: (names: string[]) => void;
  onToggle: (id: string) => void;
  onStart: () => void;
  onResume: () => void;
  onDiscard: () => void;
};

export default function SetupPanel({
  namesText,
  players,
  labels,
  activeCount,
  canStart,
  locked,
  resume,
  onNamesText,
  onRoster,
  onToggle,
  onStart,
  onResume,
  onDiscard,
}: Props) {
  return (
    <div className={styles.setupWrap}>
      {resume && (
        <div className={styles.resumeBanner} role="status">
          <span>
            มีเกมค้างอยู่ (เปิดไปแล้ว {resume.opened}/{resume.total})
          </span>
          <span className={styles.resumeActions}>
            <button type="button" className={styles.primaryBtnSm} onClick={onResume}>
              เล่นต่อ
            </button>
            <button type="button" className={styles.ghostBtn} onClick={onDiscard}>
              เริ่มใหม่
            </button>
          </span>
        </div>
      )}

      <div className={styles.setupCard}>
        <div className={styles.setupHead}>
          <h2 className={styles.setupTitle}>🎄 รายชื่อคนจับฉลาก</h2>
          <ClassroomRosterPicker
            onSelect={(roster) => onRoster(roster.studentNames)}
            disabled={locked}
            className={styles.ghostBtn}
          />
        </div>

        <label className={styles.fieldLabel} htmlFor="gift-names">
          วางรายชื่อ บรรทัดละคน
        </label>
        <textarea
          id="gift-names"
          className={styles.textarea}
          value={namesText}
          readOnly={locked}
          onChange={(e) => onNamesText(e.target.value)}
          placeholder={"ต้น\nฝน\nบี\n..."}
          rows={6}
        />

        {players.length > 0 && (
          <>
            <p className={styles.hint}>แตะชื่อเพื่อสลับ มา / ขาด — คนที่ขาดจะไม่ถูกจับ</p>
            <ul className={styles.chips}>
              {players.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={styles.chip}
                    aria-pressed={p.active}
                    disabled={locked}
                    onClick={() => onToggle(p.id)}
                  >
                    {labels[p.id]}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className={styles.setupFoot}>
          <span className={styles.countPill}>มา {activeCount} คน</span>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!canStart || locked}
            onClick={onStart}
          >
            🎁 เริ่มจับฉลาก
          </button>
        </div>
        {!canStart && !locked && (
          <p className={styles.hint}>ต้องมีคนมาอย่างน้อย {MIN_PLAYERS} คนจึงจะเริ่มได้</p>
        )}
      </div>
    </div>
  );
}
