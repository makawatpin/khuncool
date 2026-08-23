import styles from "../MathAdventureApp.module.css";
import type { Operation } from "../types";

export default function NumberLine({ start, steps, operation, limit, hideAnswer = false, revealStep = 3 }: {
  start: number;
  steps: number;
  operation: Operation;
  limit: 10 | 20;
  hideAnswer?: boolean;
  revealStep?: 1 | 2 | 3 | number;
}) {
  const end = operation === "addition" ? start + steps : start - steps;
  const low = Math.min(start, end);
  const high = Math.max(start, end);
  const pointCount = limit + 1;
  const edgeOffset = 50 / pointCount;
  const activeLeft = ((low + .5) / pointCount) * 100;
  const activeWidth = ((high - low) / pointCount) * 100;
  return <div className={styles.numberLineWrap} aria-label={`เส้นจำนวน เริ่มที่ ${start} ${operation === "addition" ? "เดินหน้า" : "ถอยหลัง"} ${steps} ช่อง`}>
    <div className={styles.numberLine}>
      <span className={styles.lineBase} style={{ left: `${edgeOffset}%`, right: `${edgeOffset}%` }} aria-hidden="true" />
      {revealStep >= 2 && <span className={styles.lineActive} style={{ left: `${activeLeft}%`, width: `${activeWidth}%` }} aria-hidden="true" />}
      {Array.from({ length: limit + 1 }, (_, value) => {
        const active = value >= low && value <= high;
        const isEnd = value === end;
        return <div key={value} style={{ ["--tick-index" as string]: Math.abs(value - start) }} className={`${styles.tick} ${active ? styles.tickActive : ""} ${isEnd ? styles.tickEnd : ""}`}>
          <span className={styles.tickDot}>{value === start && revealStep === 1 ? "●" : isEnd && revealStep >= 3 && !hideAnswer ? "★" : ""}</span>
          <span className={styles.tickLabel}>{isEnd && hideAnswer ? "?" : value}</span>
        </div>;
      })}
    </div>
    <div className={styles.lineCaption}>{revealStep === 1 ? `เริ่มที่ ${start}` : revealStep === 2 ? `${operation === "addition" ? "เดินหน้า" : "ถอยหลัง"} ${steps} ช่อง` : `หยุดที่ ${hideAnswer ? "?" : end}`}</div>
  </div>;
}
