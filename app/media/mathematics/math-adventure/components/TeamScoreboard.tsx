import styles from "../MathAdventureApp.module.css";

export default function TeamScoreboard({ scores, active }: { scores: number[]; active: number }) {
  return <div className={styles.scoreboard} aria-label="คะแนนทีม">
    {scores.map((score, index) => <div key={index} className={`${styles.teamScore} ${active === index ? styles.teamActive : ""}`} aria-current={active === index ? "true" : undefined}>
      <span>ทีม {index + 1}</span><strong key={`${index}-${score}`}>⭐ {score}</strong>
    </div>)}
  </div>;
}
