import type { QuestionSet, QuestionSetStore } from "./types";

export const QUESTION_SETS_STORAGE_KEY = "khuncool.questionsets.v1";
/** Mystery Board's own settings blob, read once to seed the first set. */
const MYSTERY_BOARD_KEY = "khuncool.mysteryboard";

export const MAX_SETS = 50;
export const MAX_QUESTIONS = 200;
export const MAX_QUESTION_LENGTH = 300;

export const EMPTY_QUESTION_SET_STORE: QuestionSetStore = {
  version: 1,
  activeSetId: null,
  sets: [],
};

export function createSetId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `qset_${crypto.randomUUID()}`;
  }
  return `qset_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/**
 * One question per line, trimmed, blanks and duplicates dropped. Mirrors
 * `parseQuestions` in boardModel.ts, plus the de-duplication and caps that a
 * stored set needs but an ad-hoc board does not.
 */
export function normalizeQuestions(raw: readonly string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const line of raw) {
    const question = line.trim().replace(/\s+/g, " ").slice(0, MAX_QUESTION_LENGTH);
    if (!question || seen.has(question)) continue;
    seen.add(question);
    normalized.push(question);
  }
  return normalized.slice(0, MAX_QUESTIONS);
}

export function questionsFromText(text: string): string[] {
  return normalizeQuestions(text.split("\n"));
}

function sanitizeSet(value: unknown): QuestionSet | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<QuestionSet>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    !Array.isArray(candidate.questions)
  ) {
    return null;
  }
  const now = Date.now();
  return {
    id: candidate.id,
    name: candidate.name.trim().slice(0, 80) || "ชุดคำถาม",
    questions: normalizeQuestions(
      candidate.questions.filter((q): q is string => typeof q === "string"),
    ),
    createdAt: typeof candidate.createdAt === "number" ? candidate.createdAt : now,
    updatedAt: typeof candidate.updatedAt === "number" ? candidate.updatedAt : now,
  };
}

export function sanitizeQuestionSetStore(value: unknown): QuestionSetStore | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<QuestionSetStore>;
  if (candidate.version !== 1 || !Array.isArray(candidate.sets)) return null;
  const sets = candidate.sets
    .map(sanitizeSet)
    .filter((set): set is QuestionSet => set !== null)
    .slice(0, MAX_SETS);
  const activeSetId = sets.some((set) => set.id === candidate.activeSetId)
    ? candidate.activeSetId!
    : sets[0]?.id ?? null;
  return { version: 1, activeSetId, sets };
}

/** Questions the teacher already typed into Mystery Board, if any. */
function questionsFromMysteryBoard(): string[] {
  try {
    const raw = window.localStorage.getItem(MYSTERY_BOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { questions?: unknown };
    if (!Array.isArray(parsed.questions)) return [];
    return normalizeQuestions(
      parsed.questions.filter((q): q is string => typeof q === "string"),
    );
  } catch {
    return [];
  }
}

/**
 * Loads the local question-set store. On first load it seeds one set from the
 * questions already sitting in Mystery Board, so a teacher who has been using
 * that tool does not start from an empty library. Nothing is removed from
 * Mystery Board — it keeps its own settings blob and works unchanged.
 */
export function loadQuestionSetStore(): QuestionSetStore {
  if (typeof window === "undefined") return EMPTY_QUESTION_SET_STORE;
  try {
    const raw = window.localStorage.getItem(QUESTION_SETS_STORAGE_KEY);
    if (raw) {
      const parsed = sanitizeQuestionSetStore(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // Fall through to the seed below.
  }

  const seeded = questionsFromMysteryBoard();
  if (!seeded.length) return EMPTY_QUESTION_SET_STORE;
  const now = Date.now();
  const set: QuestionSet = {
    id: createSetId(),
    name: "คำถามจากกระดานป้ายปริศนา",
    questions: seeded,
    createdAt: now,
    updatedAt: now,
  };
  const store: QuestionSetStore = {
    version: 1,
    activeSetId: set.id,
    sets: [set],
  };
  saveQuestionSetStore(store);
  return store;
}

/**
 * Questions of the set the teacher used last. The only supported way for a
 * tool to read the shared library — tools must not touch localStorage
 * directly, the same rule the classroom roster follows.
 */
export function loadActiveQuestions(): string[] {
  const store = loadQuestionSetStore();
  const active =
    store.sets.find((set) => set.id === store.activeSetId) ?? store.sets[0];
  return active ? active.questions : [];
}

export function saveQuestionSetStore(store: QuestionSetStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      QUESTION_SETS_STORAGE_KEY,
      JSON.stringify(store),
    );
  } catch {
    // Private browsing / quota: in-memory state still works for this session.
  }
}
