import styles from "../MathAdventureApp.module.css";
import type { QuizSummary } from "../types";

export default function QuizResult({ summary, onRetryWrong, onReplay, onHome }: { summary: QuizSummary; onRetryWrong: () => void; onReplay: () => void; onHome: () => void }) {
  const percent = Math.round(summary.correct / Math.max(1, summary.total) * 100);
  const review = summary.addition.total && summary.addition.correct < summary.addition.total ? "การบวก" : summary.subtraction.total && summary.subtraction.correct < summary.subtraction.total ? "การลบ" : "พร้อมลุยโจทย์ชุดใหม่";
  return <section className={`${styles.screen} ${styles.resultScreen}`} data-stage="result" aria-labelledby="result-title">
    <div className={styles.resultConfetti} aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ ["--confetti-index" as string]: i, ["--confetti-left" as string]: `${(i + .5) / 18 * 100}%` }}>{i % 3 === 0 ? "★" : i % 3 === 1 ? "●" : "◆"}</span>)}</div>
    <div className={styles.resultBadge} aria-hidden="true">{percent >= 80 ? "🏆" : "🌟"}</div>
    <div className={styles.screenHeading}><span className={styles.eyebrow}>สรุปภารกิจ</span><h2 id="result-title">ทำได้ {summary.correct}/{summary.total} ข้อ</h2><p>{percent >= 80 ? "ยอดเยี่ยมมาก!" : "เก่งขึ้นทุกครั้งที่ลอง"}</p></div>
    <div className={styles.resultGrid}>
      <div><span>คะแนนรวม</span><strong>{percent}%</strong></div>
      <div><span>การบวก</span><strong>{summary.addition.correct}/{summary.addition.total}</strong></div>
      <div><span>การลบ</span><strong>{summary.subtraction.correct}/{summary.subtraction.total}</strong></div>
    </div>
    <div className={styles.reviewNote}><span>📚 ควรทบทวน</span><strong>{review}</strong></div>
    <div className={styles.actions}>
      {summary.wrong.length > 0 && <button type="button" className={`kc-tap ${styles.secondaryButton}`} onClick={onRetryWrong}>เล่นข้อที่ผิด ({summary.wrong.length})</button>}
      <button type="button" className={`kc-tap ${styles.primaryButton}`} onClick={onReplay}>เล่นอีกครั้ง 🔁</button>
      <button type="button" className={`kc-tap ${styles.ghostButton}`} onClick={onHome}>เมนูหลัก</button>
    </div>
  </section>;
}
