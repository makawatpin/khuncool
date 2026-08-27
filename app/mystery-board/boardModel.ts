export type Mode = "score" | "question";
export type Theme = "space" | "treasure" | "neon";
export type PrizeKind = "points" | "double" | "steal" | "bomb" | "lucky";

export type Prize = {
  kind: PrizeKind;
  value: number;
  label: string;
  emoji: string;
};

export type Tile = {
  id: number;
  opened: boolean;
  prize?: Prize;
  question?: string;
};

export const BOARD_SIZES = [12, 20, 30] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export type Settings = {
  mode: Mode;
  size: BoardSize;
  theme: Theme;
  soundOn: boolean;
  questions: string[];
};

export const LS_KEY = "khuncool.mysteryboard";

export const DEFAULT_SETTINGS: Settings = {
  mode: "score",
  size: 20,
  theme: "space",
  soundOn: true,
  questions: [],
};

export const THEME_LABELS: Record<Theme, string> = {
  space: "อวกาศ",
  treasure: "สมบัติโจรสลัด",
  neon: "นีออน",
};

export const MODE_LABELS: Record<Mode, string> = {
  score: "โหมดคะแนน",
  question: "โหมดคำถาม",
};

/** 1 บรรทัด = 1 คำถาม ตัดช่องว่างหัวท้ายและบรรทัดว่างทิ้ง */
export function parseQuestions(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** อ่าน Settings จาก localStorage แบบไม่มีวันโยน error */
export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings> | null;
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    return {
      mode: parsed.mode === "question" ? "question" : "score",
      size: BOARD_SIZES.includes(parsed.size as BoardSize)
        ? (parsed.size as BoardSize)
        : DEFAULT_SETTINGS.size,
      theme:
        parsed.theme === "treasure" || parsed.theme === "neon"
          ? parsed.theme
          : "space",
      soundOn: parsed.soundOn !== false,
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.filter((q): q is string => typeof q === "string")
        : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(settings));
  } catch {
    /* โหมดส่วนตัวของ Safari เขียนไม่ได้ — ปล่อยผ่าน */
  }
}
