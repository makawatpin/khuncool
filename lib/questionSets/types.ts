export type QuestionSet = {
  id: string;
  name: string;
  questions: string[];
  createdAt: number;
  updatedAt: number;
};

export type QuestionSetStore = {
  version: 1;
  activeSetId: string | null;
  sets: QuestionSet[];
};

/** Shape handed to a tool when the teacher picks a set. */
export type QuestionSetSummary = {
  id: string;
  name: string;
  questions: string[];
};
