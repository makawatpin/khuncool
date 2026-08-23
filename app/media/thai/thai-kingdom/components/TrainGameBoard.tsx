import styles from "../ThaiKingdomApp.module.css";

export default function TrainGameBoard({ progress, station }: { progress: number; station: number }) {
  const position = Math.max(4, Math.min(94, progress));
  return <div className={styles.trainBoard} aria-label={`รถไฟถึงสถานี ${station} จาก 10`}>
    <div className={styles.trainSky} aria-hidden="true"><span>ก</span><span>า</span><span>ี</span><span>ู</span><span>★</span></div>
    <div className={styles.trainTrack}><div className={styles.train} style={{ ["--train-position" as string]: `${position}%` }}>🚂</div><span className={styles.stationFlag}>🏰</span></div>
  </div>;
}
