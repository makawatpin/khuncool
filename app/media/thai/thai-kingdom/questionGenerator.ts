import { CONSONANT_SETS, THAI_WORDS, WORD_BY_ID } from "./wordData.ts";
import type { QuestionKind, TeacherConfig, ThaiQuestion, ThaiWord } from "./types";

export type RandomSource = () => number;
const pick = <T,>(items: readonly T[], rng: RandomSource) => items[Math.floor(rng() * items.length)];
const shuffle = <T,>(items: readonly T[], rng: RandomSource) => [...items].sort(() => rng() - .5);

export function eligibleWords(config: Pick<TeacherConfig, "consonantSet" | "vowels" | "difficulty">): ThaiWord[] {
  const consonants: readonly string[] = CONSONANT_SETS[config.consonantSet];
  const filtered = THAI_WORDS.filter((word) => consonants.includes(word.consonant) && config.vowels.includes(word.vowel) && word.difficulty <= config.difficulty);
  return filtered.length >= 4 ? filtered : THAI_WORDS.filter((word) => config.vowels.includes(word.vowel));
}

function uniqueOptions(answer: string, alternatives: readonly string[], rng: RandomSource): string[] {
  const unique = Array.from(new Set(alternatives.filter((value) => value !== answer)));
  return shuffle([answer, ...shuffle(unique, rng).slice(0, 2)], rng);
}

function makeQuestion(word: ThaiWord, kind: QuestionKind, index: number, pool: ThaiWord[], rng: RandomSource): ThaiQuestion {
  const distractorWords = word.distractors.map((id) => WORD_BY_ID.get(id)).filter((item): item is ThaiWord => Boolean(item));
  if (kind === "listen-consonant") return { id: `listen-${index}-${word.id}`, kind, skill: "listening", prompt: "ฟังเสียง แล้วเลือกพยัญชนะต้น", answer: word.consonant, options: uniqueOptions(word.consonant, pool.map((item) => item.consonant), rng), word };
  if (kind === "picture-word") return { id: `picture-${index}-${word.id}`, kind, skill: "picture", prompt: "ดูภาพ แล้วเลือกคำ", answer: word.word, options: uniqueOptions(word.word, [...distractorWords, ...pool].map((item) => item.word), rng), word };
  if (kind === "missing-consonant") return { id: `initial-${index}-${word.id}`, kind, skill: "consonant", prompt: "เติมพยัญชนะที่หายไป", answer: word.consonant, options: uniqueOptions(word.consonant, pool.map((item) => item.consonant), rng), word };
  if (kind === "missing-vowel") return { id: `vowel-${index}-${word.id}`, kind, skill: "vowel", prompt: "เติมสระที่หายไป", answer: word.vowel, options: uniqueOptions(word.vowel, ["า", "ี", "ู"], rng), word };
  return { id: `arrange-${index}-${word.id}`, kind, skill: "blending", prompt: "เรียงส่วนประกอบให้เป็นคำ", answer: word.word, options: [word.consonant, word.vowel], word };
}

export function generateQuestions({ count, config, kinds, rng = Math.random }: { count: number; config: TeacherConfig; kinds?: QuestionKind[]; rng?: RandomSource }): ThaiQuestion[] {
  const pool = eligibleWords(config);
  const allowedKinds = kinds ?? ["listen-consonant", "picture-word", "missing-consonant", "missing-vowel", "arrange"];
  return Array.from({ length: count }, (_, index) => {
    const kind = allowedKinds[index % allowedKinds.length];
    const suitable = kind === "arrange" ? pool.filter((word) => !word.composition.toneMark) : pool;
    return makeQuestion(pick(suitable.length ? suitable : pool, rng), kind, index, pool, rng);
  });
}
