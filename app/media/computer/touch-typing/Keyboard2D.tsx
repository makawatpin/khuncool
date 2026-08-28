"use client";

import type { CSSProperties } from "react";
import { FINGER_COLORS, LABELS, ROWS } from "./keyboardLayout";
import type { LastPress } from "./useTypingSession";
import styles from "./TouchTypingGame.module.css";

type Props = {
  hintCode: string | null;
  hintShift?: boolean;
  lastPress: LastPress | null;
  interactive?: boolean;
  onPress?: (code: string) => void;
};

export default function Keyboard2D({ hintCode, hintShift, lastPress, interactive = false, onPress }: Props) {
  return (
    <div className={`${styles.keyboard2d} ${interactive ? styles.interactiveKeyboard : ""}`} aria-label="แป้นพิมพ์ไทยเกษมณี">
      {ROWS.map((row, rowIndex) => (
        <div className={styles.keyRow} key={rowIndex}>
          {row.map((key) => {
            const labels = LABELS[key.code];
            const isHint = key.code === hintCode || (hintShift && key.code.startsWith("Shift"));
            const press = lastPress?.code === key.code ? lastPress.state : null;
            const className = [styles.keycap, isHint ? styles.keyHint : "", press === "correct" ? styles.keyCorrect : "", press === "error" ? styles.keyError : ""].filter(Boolean).join(" ");
            const content = key.label ?? labels?.base ?? key.code;
            const style = {
              "--key-w": key.w ?? 1,
              "--key-color": key.finger ? FINGER_COLORS[key.finger] : "#E9EDF4",
            } as CSSProperties;

            if (interactive) {
              return (
                <button key={key.code} type="button" className={className} style={style} onClick={() => onPress?.(key.code)} aria-label={`ปุ่ม ${content}`}>
                  {labels?.shift && <span className={styles.shiftLabel}>{labels.shift}</span>}
                  <span>{content === " " ? "เว้นวรรค" : content}</span>
                </button>
              );
            }

            return (
              <div key={key.code} className={className} style={style} aria-hidden="true">
                {labels?.shift && <span className={styles.shiftLabel}>{labels.shift}</span>}
                <span>{content === " " ? "เว้นวรรค" : content}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
