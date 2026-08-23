export type ThaiVowel = "า" | "ี" | "ู";
export type VowelPosition = "right" | "above" | "below";
export type Difficulty = 1 | 2 | 3;
export type Skill = "consonant" | "vowel" | "blending" | "listening" | "picture";
export type QuestionKind = "listen-consonant" | "picture-word" | "missing-consonant" | "missing-vowel" | "arrange";
export type GameMode = "lesson" | "practice" | "train" | "quiz";

export type ThaiWord = {
  id: string;
  word: string;
  consonant: string;
  vowel: ThaiVowel;
  image: string;
  audio: string;
  distractors: string[];
  difficulty: Difficulty;
  tags: string[];
  composition: {
    initial: string;
    vowelGlyph: ThaiVowel;
    vowelPosition: VowelPosition;
    toneMark?: "่" | "้";
  };
};

export type ThaiConsonant = {
  id: string;
  letter: string;
  mnemonic: string;
  image: string;
  audio?: string;
};

export type ThaiQuestion = {
  id: string;
  kind: QuestionKind;
  skill: Skill;
  prompt: string;
  answer: string;
  options: string[];
  word: ThaiWord;
};

export type TeacherConfig = {
  consonantSet: "starter" | "extended" | "all";
  vowels: ThaiVowel[];
  questionCount: 5 | 10 | 15;
  difficulty: Difficulty;
  sound: boolean;
  hints: boolean;
  timer: boolean;
  playMode: "whole" | "teams";
  teamCount: 2 | 3 | 4;
  instantAnswer: boolean;
};

export type QuizSummary = {
  mode: GameMode;
  correct: number;
  total: number;
  bySkill: Record<Skill, { correct: number; total: number }>;
  wrong: ThaiQuestion[];
};
