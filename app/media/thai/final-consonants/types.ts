export type FamilyId = "kaa" | "kong" | "kom" | "koei" | "koew" | "kok" | "kot" | "kon" | "kop";
export type ConfusionGroupId = "glides" | "nasals" | "stops";
export type FamilyGroup = "none" | "direct" | "indirect";

export type FamilySeoContent = {
  status: "draft" | "ready";
  uniqueIntroduction: string;
  soundExplanation: string;
  consonantExplanation: string;
  commonErrors: Array<{ word: string; mistake: string; explanation: string }>;
  contrastExplanation: string;
  classroomActivity: string;
  teacherCheck: string;
  faqs: Array<{ question: string; answer: string }>;
  metaTitle: string;
  metaDescription: string;
};

export type FinalConsonantFamily = {
  id: FamilyId;
  name: string;
  shortName: string;
  group: FamilyGroup;
  confusionGroupId: ConfusionGroupId;
  endingSound: string;
  consonants: string[];
  teachingTip: string;
  commonMistake: string;
  color: string;
  seo: FamilySeoContent;
};

export type FinalConsonantWord = {
  id: string;
  word: string;
  body: string;
  final: string;
  familyId: FamilyId;
  meaning: string;
  difficulty: 1 | 2 | 3;
  usage: Array<"lesson" | "check" | "game">;
};

export type GameQuestion = {
  id: string;
  word: FinalConsonantWord;
  answer: FamilyId;
  options: FamilyId[];
};

export type GameConfig = {
  focusFamily?: FamilyId;
  questionCount: 5 | 10 | 15;
  difficulty: 1 | 2 | 3;
};

