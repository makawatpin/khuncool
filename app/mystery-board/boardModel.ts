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
      soundOn:
        typeof parsed.soundOn === "boolean"
          ? parsed.soundOn
          : DEFAULT_SETTINGS.soundOn,
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

/** Fisher–Yates — คืน array ใหม่เสมอ ไม่แก้ของเดิม */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const JACKPOT: Prize = {
  kind: "points",
  value: 50,
  label: "แจ็กพอต! ได้ 50 คะแนน",
  emoji: "💎",
};

const BOMB: Prize = {
  kind: "bomb",
  value: -15,
  label: "ระเบิด! เสีย 15 คะแนน",
  emoji: "💣",
};

/** น้ำหนักเป็นเปอร์เซ็นต์โดยประมาณ รวมกันได้ 100 */
const PRIZE_WEIGHTS: { weight: number; prize: Prize }[] = [
  { weight: 20, prize: { kind: "points", value: 5, label: "ได้ 5 คะแนน", emoji: "🎉" } },
  { weight: 22, prize: { kind: "points", value: 10, label: "ได้ 10 คะแนน", emoji: "🎉" } },
  { weight: 13, prize: { kind: "points", value: 20, label: "ได้ 20 คะแนน", emoji: "🎊" } },
  { weight: 8, prize: JACKPOT },
  { weight: 10, prize: { kind: "double", value: 2, label: "คะแนนรอบนี้ ×2", emoji: "✨" } },
  { weight: 10, prize: { kind: "steal", value: 10, label: "ขโมย 10 คะแนนจากทีมอื่น", emoji: "🦝" } },
  { weight: 12, prize: BOMB },
  { weight: 5, prize: { kind: "lucky", value: 1, label: "โชคดี! เลือกเปิดป้ายเพิ่มอีก 1 ใบ", emoji: "🍀" } },
];

export function isJackpot(prize: Prize): boolean {
  return prize.kind === "points" && prize.value >= 50;
}

/** แทนที่ป้ายแต้มธรรมดา 1 ใบด้วย target ถ้ากระดานยังไม่มีของแบบนั้นเลย */
function ensureOne(prizes: Prize[], target: Prize, has: (p: Prize) => boolean) {
  if (prizes.some(has)) return;
  const i = prizes.findIndex((p) => p.kind === "points" && p.value < 50);
  prizes[i >= 0 ? i : 0] = target;
}

/** คืนรางวัลจำนวน count ใบ สับแล้ว การันตีว่ามีแจ็กพอตและระเบิดอย่างละใบ */
export function buildPrizes(count: number): Prize[] {
  const deck: Prize[] = [];
  for (const { weight, prize } of PRIZE_WEIGHTS) {
    const n = Math.max(1, Math.round((weight / 100) * count));
    for (let i = 0; i < n; i++) deck.push(prize);
  }
  const picked = shuffle(deck).slice(0, count);
  while (picked.length < count) picked.push(PRIZE_WEIGHTS[1].prize);
  ensureOne(picked, JACKPOT, isJackpot);
  ensureOne(picked, BOMB, (p) => p.kind === "bomb");
  return picked;
}

/**
 * สร้างป้ายของกระดานหนึ่งรอบ
 *
 * โหมดคำถาม: ถ้าคำถามน้อยกว่าขนาดที่เลือก จำนวนป้ายจะลดลงเท่าจำนวนคำถาม
 * (ป้ายเปล่าไม่มีประโยชน์) ผู้เรียกต้องอ่านจำนวนป้ายจริงจาก tiles.length
 * ไม่ใช่ settings.size
 */
export function buildTiles(settings: Settings): Tile[] {
  if (settings.mode === "question") {
    return shuffle(settings.questions)
      .slice(0, settings.size)
      .map((question, i) => ({ id: i + 1, opened: false, question }));
  }
  return buildPrizes(settings.size).map((prize, i) => ({
    id: i + 1,
    opened: false,
    prize,
  }));
}

/** ข้อความย่อบนป้ายที่เปิดแล้ว */
export function tileSummary(tile: Tile): string {
  if (tile.prize) return `${tile.prize.emoji} ${tile.prize.value > 0 ? "+" : ""}${tile.prize.value}`;
  return "✓";
}
