"use client";

import { useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import styles from "./MysteryBoard.module.css";
import {
  BOARD_SIZES,
  DEFAULT_SETTINGS,
  MODE_LABELS,
  THEME_LABELS,
  loadSettings,
  parseQuestions,
  saveSettings,
  type BoardSize,
  type Mode,
  type Settings,
  type Theme,
} from "./boardModel";

export default function MysteryBoardApp() {
  useTrackToolUse("mystery-board");

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [questionText, setQuestionText] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(
    frameRef,
    styles.fsFallback,
  );

  // โหลดค่าที่บันทึกไว้หลัง mount เท่านั้น กัน hydration mismatch
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const restored = loadSettings();
      setSettings(restored);
      setQuestionText(restored.questions.join("\n"));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  const questions = parseQuestions(questionText);
  const canStart = settings.mode === "score" || questions.length > 0;

  return (
    <div
      ref={frameRef}
      className={`${styles.shell} ${fullscreenClassName}`}
      data-theme={settings.theme}
    >
      <div className={styles.bar}>
        <span className={styles.barTitle}>🎁 กระดานป้ายปริศนา</span>
        <button type="button" className={styles.iconBtn} onClick={toggle}>
          ⛶ {isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
        </button>
      </div>

      <div className={styles.body}>
        <fieldset>
          <legend>โหมด</legend>
          {(Object.keys(MODE_LABELS) as Mode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={styles.iconBtn}
              aria-pressed={settings.mode === mode}
              onClick={() => setSettings((s) => ({ ...s, mode }))}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </fieldset>

        <fieldset>
          <legend>จำนวนป้าย</legend>
          {BOARD_SIZES.map((size: BoardSize) => (
            <button
              key={size}
              type="button"
              className={styles.iconBtn}
              aria-pressed={settings.size === size}
              onClick={() => setSettings((s) => ({ ...s, size }))}
            >
              {size} ป้าย
            </button>
          ))}
        </fieldset>

        <fieldset>
          <legend>ธีม</legend>
          {(Object.keys(THEME_LABELS) as Theme[]).map((theme) => (
            <button
              key={theme}
              type="button"
              className={styles.iconBtn}
              aria-pressed={settings.theme === theme}
              onClick={() => setSettings((s) => ({ ...s, theme }))}
            >
              {THEME_LABELS[theme]}
            </button>
          ))}
        </fieldset>

        {settings.mode === "question" && (
          <label>
            <span>คำถาม (1 บรรทัด = 1 คำถาม)</span>
            <textarea
              rows={6}
              value={questionText}
              onChange={(e) => {
                const next = e.target.value;
                setQuestionText(next);
                setSettings((s) => ({ ...s, questions: parseQuestions(next) }));
              }}
            />
            <span>{questions.length} คำถาม</span>
          </label>
        )}

        <button type="button" className={styles.iconBtn} disabled={!canStart}>
          เริ่มเกม
        </button>
      </div>
    </div>
  );
}
