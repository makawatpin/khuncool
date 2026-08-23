import styles from "../ThaiKingdomApp.module.css";
import type { QuizSummary, Skill } from "../types";

const labels: Record<Skill, string> = { consonant: "พยัญชนะ", vowel: "สระ", blending: "ประสมคำ", listening: "การฟัง", picture: "คำกับภาพ" };

export default function QuizResult({ summary, onRetryWrong, onReplay, onHome }: { summary: QuizSummary; onRetryWrong: () => void; onReplay: () => void; onHome: () => void }) {
  const rows = Object.entries(summary.bySkill) as [Skill, { correct: number; total: number }][];
  const tested = rows.filter(([, score]) => score.total > 0);
  const review = tested.sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)[0]?.[0];
  const percent = Math.round(summary.correct / Math.max(1, summary.total) * 100);
  return <main className={`${styles.screen} ${styles.resultScreen}`} data-stage="result" aria-labelledby="result-title">
    <div className={styles.resultConfetti} aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <span key={index} style={{ ["--confetti-left" as string]: `${(index + .5) / 16 * 100}%`, ["--confetti-delay" as string]: `${index * 80}ms` }}>{index % 2 ? "ก" : "★"}</span>)}</div>
    <div className={styles.resultBadge} aria-hidden="true">{percent >= 80 ? "👑" : "🌟"}</div>
    <div className={styles.screenHeading}><span className={styles.eyebrow}>สรุปภารกิจ</span><h2 id="result-title">ทำได้ {summary.correct}/{summary.total} ข้อ</h2><p>{percent >= 80 ? "ยอดเยี่ยม นักอ่านตัวน้อย!" : "เก่งขึ้นทุกครั้งที่ลอง"}</p></div>
    <div className={styles.skillGrid}>{tested.map(([skill, score]) => <div key={skill}><span>{labels[skill]}</span><strong>{score.correct}/{score.total}</strong></div>)}</div>
    <div className={styles.reviewNote}><span>📚 ควรทบทวน</span><strong>{review ? labels[review] : "พร้อมลุยชุดใหม่"}</strong></div>
    <div className={styles.actions}>{summary.wrong.length > 0 && <button type="button" className={`kc-tap ${styles.secondaryButton}`} onClick={onRetryWrong}>ฝึกข้อที่ผิด ({summary.wrong.length})</button>}<button type="button" className={`kc-tap ${styles.primaryButton}`} onClick={onReplay}>เล่นอีกครั้ง 🔁</button><button type="button" className={`kc-tap ${styles.ghostButton}`} onClick={onHome}>เมนูหลัก</button></div>
  </main>;
}
