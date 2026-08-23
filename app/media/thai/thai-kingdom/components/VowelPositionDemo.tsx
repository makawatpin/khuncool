import styles from "../ThaiKingdomApp.module.css";
import { displayThaiVowel, thaiVowelAriaLabel, thaiVowelLabel } from "../thaiText";
import type { ThaiVowel, VowelPosition } from "../types";

const labels: Record<VowelPosition, string> = { right: "อยู่ด้านหลังพยัญชนะ", above: "อยู่ด้านบนพยัญชนะ", below: "อยู่ด้านล่างพยัญชนะ" };

export default function VowelPositionDemo({ consonant, vowel, position, word }: { consonant: string; vowel: ThaiVowel; position: VowelPosition; word: string }) {
  return <div className={styles.vowelDemo} aria-label={`${thaiVowelAriaLabel(vowel)} ${labels[position]} ประสมเป็นคำว่า ${word}`}>
    <span className={styles.vowelLabel}>{thaiVowelLabel(vowel)}</span>
    <div className={styles.positionStage}>
      <span className={`${styles.positionWord} ${styles[`positionWord_${position}`]}`} aria-label={word}>{word}</span>
    </div>
    <p>{labels[position]}</p>
    <strong>{consonant} + “{displayThaiVowel(vowel)}” → <b>{word}</b></strong>
  </div>;
}
