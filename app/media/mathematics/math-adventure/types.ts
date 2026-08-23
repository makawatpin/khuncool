export type Operation = "addition" | "subtraction";
export type OperationSetting = Operation | "mixed";
export type QuestionKind = "picture-count" | "number-line" | "missing" | "operator" | "word-problem";
export type VisualObject = "apple" | "ball" | "pencil" | "cat";

export type MathQuestion = {
  id: string;
  kind: QuestionKind;
  operation: Operation;
  a: number;
  b: number;
  answer: string;
  options: string[];
  prompt: string;
  hint: string;
  object: VisualObject;
};
export type GameMode = "lesson" | "practice" | "train" | "quiz";

export type TeacherConfig = {
  limit: 10 | 20;
  operation: OperationSetting;
  questionCount: 5 | 10 | 15;
  timer: boolean;
  sound: boolean;
  hints: boolean;
  playMode: "whole" | "teams";
  teamCount: 2 | 3 | 4;
};

export type QuizSummary = {
  mode: GameMode;
  correct: number;
  total: number;
  addition: { correct: number; total: number };
  subtraction: { correct: number; total: number };
  wrong: MathQuestion[];
};
