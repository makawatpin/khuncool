"use client";

import styles from "./MysteryBoard.module.css";
import {
  BOARD_SIZES,
  MODE_LABELS,
  THEME_LABELS,
  type BoardSize,
  type Mode,
  type Settings,
  type Theme,
} from "./boardModel";

type Props = {
  settings: Settings;
  questionText: string;
  questionCount: number;
  onChange: (patch: Partial<Settings>) => void;
  onQuestionTextChange: (text: string) => void;
  onStart: () => void;
};

export default function SetupPanel({
  settings,
  questionText,
  questionCount,
  onChange,
  onQuestionTextChange,
  onStart,
}: Props) {
  const canStart = settings.mode === "score" || questionCount > 0;
  const effectiveTiles =
    settings.mode === "question"
      ? Math.min(settings.size, questionCount)
      : settings.size;

  return (
    <div className={styles.setup}>
      <div className={styles.setupGroup}>
        <span className={styles.setupLabel}>เลือกโหมด</span>
        <div className={styles.chipRow}>
          {(Object.keys(MODE_LABELS) as Mode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={styles.chip}
              aria-pressed={settings.mode === mode}
              onClick={() => onChange({ mode })}
            >
              {mode === "score" ? "🎁" : "❓"} {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <p className={styles.setupHint}>
          {settings.mode === "score"
            ? "หลังป้ายเป็นคะแนนและการ์ดพิเศษ ระบบสุ่มให้เอง ไม่ต้องเตรียมอะไร"
            : "หลังป้ายเป็นคำถามที่คุณครูพิมพ์ไว้ 1 บรรทัด = 1 คำถาม"}
        </p>
      </div>

      <div className={styles.setupGroup}>
        <span className={styles.setupLabel}>จำนวนป้าย</span>
        <div className={styles.chipRow}>
          {BOARD_SIZES.map((size: BoardSize) => (
            <button
              key={size}
              type="button"
              className={styles.chip}
              aria-pressed={settings.size === size}
              onClick={() => onChange({ size })}
            >
              {size} ป้าย
            </button>
          ))}
        </div>
      </div>

      <div className={styles.setupGroup}>
        <span className={styles.setupLabel}>ธีม</span>
        <div className={styles.chipRow}>
          {(Object.keys(THEME_LABELS) as Theme[]).map((theme) => (
            <button
              key={theme}
              type="button"
              className={styles.chip}
              aria-pressed={settings.theme === theme}
              onClick={() => onChange({ theme })}
            >
              {THEME_LABELS[theme]}
            </button>
          ))}
        </div>
      </div>

      {settings.mode === "question" && (
        <div className={styles.setupGroup}>
          <label className={styles.setupLabel} htmlFor="mystery-questions">
            คำถามของคุณครู
          </label>
          <textarea
            id="mystery-questions"
            className={styles.textarea}
            rows={7}
            placeholder={"เมืองหลวงของไทยคือจังหวัดอะไร\n7 × 8 เท่ากับเท่าไร\nสัตว์เลี้ยงลูกด้วยนมคืออะไร"}
            value={questionText}
            onChange={(e) => onQuestionTextChange(e.target.value)}
          />
          <div className={styles.setupHint} aria-live="polite">
            {questionCount} คำถาม
            {questionCount > 0 && questionCount < settings.size && (
              <> — กระดานจะเหลือ {questionCount} ป้ายตามจำนวนคำถาม</>
            )}
            {questionCount > settings.size && (
              <> — จะสุ่มมาใช้ {settings.size} คำถาม</>
            )}
          </div>
          {questionText.length > 0 && (
            <button
              type="button"
              className={styles.chip}
              onClick={() => onQuestionTextChange("")}
            >
              ล้างคำถาม
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.primaryBtn}
        disabled={!canStart}
        onClick={onStart}
      >
        เริ่มเกม · {effectiveTiles} ป้าย
      </button>
    </div>
  );
}
