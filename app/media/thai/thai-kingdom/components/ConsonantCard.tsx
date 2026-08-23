/* eslint-disable @next/next/no-img-element */
import styles from "../ThaiKingdomApp.module.css";
import type { ThaiConsonant } from "../types";
import AudioButton from "./AudioButton";

export default function ConsonantCard({ consonant, hideWord, hideImage, sound }: { consonant: ThaiConsonant; hideWord: boolean; hideImage: boolean; sound: boolean }) {
  const phrase = `${consonant.letter} ${consonant.mnemonic}`;
  return <div className={styles.consonantCard}>
    <div className={styles.letterTile} aria-label={`พยัญชนะ ${consonant.letter}`}>{consonant.letter}</div>
    <div className={styles.consonantInfo}>
      <span>ชื่อพยัญชนะ</span>
      <strong className={styles.consonantMnemonic}><b>{consonant.letter}</b> <span>{hideWord ? "?" : consonant.mnemonic}</span></strong>
      <p>อ่านว่า “{hideWord ? `${consonant.letter} อะไรเอ่ย` : phrase}”</p>
      <AudioButton src={consonant.audio} text={phrase} disabled={!sound} label={`ฟัง ${phrase}`} />
    </div>
    <div className={`${styles.wordPicture} ${hideImage ? styles.hiddenPicture : ""}`}><img src={consonant.image} width={512} height={512} decoding="async" alt={hideImage ? "ซ่อนภาพ" : `ภาพ${consonant.mnemonic} สำหรับ ${phrase}`} /></div>
  </div>;
}
