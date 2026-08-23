import styles from "../MathAdventureApp.module.css";

export default function GameBoard({ progress, stars, team = 0 }: { progress: number; stars: number; team?: number }) {
  const position = Math.max(3, Math.min(94, progress));
  return <div className={styles.trainBoard} aria-label={`รถไฟเดินทางแล้ว ${Math.round(progress)} เปอร์เซ็นต์ เก็บดาว ${stars} ดวง`}>
    <div className={styles.skyBits} aria-hidden="true"><span>☁️</span><span>⭐</span><span>☁️</span><span>⭐</span></div>
    <div className={styles.scenery} aria-hidden="true"><span>🌳</span><span>🌼</span><span>🌲</span><span>🌼</span></div>
    <div className={styles.trainTrack}>
      <div className={styles.train} style={{ ["--train-progress" as string]: `${position}%` }}><i aria-hidden="true">💨</i>🚂<span>{team + 1}</span></div>
      <div className={styles.finishFlag}>🏁</div>
    </div>
  </div>;
}
