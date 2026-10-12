// logic ของจับฉลากแลกของขวัญแบบห่วงโซ่ — pure ทั้งหมด ยกเว้นตัวอ่าน/เขียน
// storage ท้ายไฟล์ที่ห่อ try/catch ไว้
//
// ทำไมสุ่มทีละกล่องแทนการจับคู่ล่วงหน้า: ต่อท้ายโซ่ด้วยคนที่สุ่มแบบสม่ำเสมอ
// จาก pool ทีละครั้ง ได้ผลเป็นวงเดียว (single cycle) ที่สุ่มเท่ากันทุกแบบ
// ไม่มีใครได้ตัวเองและไม่มีวงย่อย (derangement ธรรมดาเกิดวงย่อยได้ ซึ่งทำให้
// โซ่ขาดกลางทาง) และยังเปิดให้ติ๊กขาด/เพิ่มคนระหว่างเกมได้

export type Player = { id: string; name: string; active: boolean };

export type Phase = "setup" | "starter" | "stage" | "finale";

export type GameState = {
  version: 1;
  players: Player[];
  /** id ตามลำดับที่ถูกเผย; chain[0] = คนเริ่ม */
  chain: string[];
  phase: Phase;
  /** กล่องของตาปัจจุบันเปิดแล้ว (เผยชื่อแล้ว) แต่ยังไม่กด "ต่อไป" */
  boxOpen: boolean;
  soundOn: boolean;
};

export type Rng = () => number;

export type OpenResult = {
  state: GameState;
  receiverId: string | null;
  closesLoop: boolean;
};

export type Turn = { giverId: string; receiverId: string | null };

export const STORAGE_KEY = "khuncool.giftexchange";
export const MIN_PLAYERS = 3;

export const EMPTY_STATE: GameState = {
  version: 1,
  players: [],
  chain: [],
  phase: "setup",
  boxOpen: false,
  soundOn: true,
};

const PHASES: readonly Phase[] = ["setup", "starter", "stage", "finale"];

let idSeq = 0;
function makeId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  idSeq += 1;
  return `p${Date.now().toString(36)}${idSeq}`;
}

function pickFrom<T>(items: T[], rng: Rng): T {
  const i = Math.min(items.length - 1, Math.floor(rng() * items.length));
  return items[i];
}

export function parseNames(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((n) => n.trim())
    .filter(Boolean);
}

/**
 * สร้างรายชื่อผู้เล่นจากรายชื่อใหม่ โดยจับคู่กับผู้เล่นเดิมที่ชื่อตรงกันตาม
 * ลำดับ (ต้นคนแรกจับกับต้นคนแรก) เพื่อคง id และสถานะ "ขาด" ไว้ตอนครูแก้ textarea
 */
export function syncPlayers(prev: Player[], names: string[]): Player[] {
  const unused = [...prev];
  return names.map((name) => {
    const i = unused.findIndex((p) => p.name === name);
    if (i >= 0) return unused.splice(i, 1)[0];
    return { id: makeId(), name, active: true };
  });
}

/** รายชื่อทั้งหมด (รวมคนที่เพิ่มกลางเกม) กลับเป็นข้อความใน textarea ให้ซิงก์กับชิป */
export function playersToText(players: Player[]): string {
  return players.map((p) => p.name).join("\n");
}

export function setNames(state: GameState, names: string[]): GameState {
  if (state.phase !== "setup") return state;
  return { ...state, players: syncPlayers(state.players, names) };
}

/** ป้ายชื่อที่แสดงบนจอ — ชื่อซ้ำติดเลขต่อท้ายตั้งแต่คนที่สอง เช่น "ต้น (2)" */
export function playerLabels(players: Player[]): Record<string, string> {
  const seen = new Map<string, number>();
  const labels: Record<string, string> = {};
  for (const p of players) {
    const n = (seen.get(p.name) ?? 0) + 1;
    seen.set(p.name, n);
    labels[p.id] = n === 1 ? p.name : `${p.name} (${n})`;
  }
  return labels;
}

export function activePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.active);
}

/** คนที่ยังรอรับของ: มาเรียน และยังไม่อยู่ในโซ่ */
export function pool(state: GameState): Player[] {
  const inChain = new Set(state.chain);
  return state.players.filter((p) => p.active && !inChain.has(p.id));
}

export function canStart(state: GameState): boolean {
  return activePlayers(state).length >= MIN_PLAYERS;
}

export function pickStarter(state: GameState, rng: Rng): GameState {
  if (state.phase !== "setup" || !canStart(state)) return state;
  const starter = pickFrom(activePlayers(state), rng);
  return { ...state, chain: [starter.id], phase: "starter", boxOpen: false };
}

export function beginStage(state: GameState): GameState {
  if (state.phase !== "starter") return state;
  return { ...state, phase: "stage" };
}

/**
 * เปิดกล่องของตาปัจจุบัน ผลถูกสุ่มและใส่ลง state ทันที (ผู้เรียกบันทึกลง
 * storage ก่อนเล่นแอนิเมชัน) จึงรีเฟรชกลางฉากแล้วไม่สุ่มใหม่
 */
export function openBox(state: GameState, rng: Rng): OpenResult {
  const noop: OpenResult = { state, receiverId: null, closesLoop: false };
  if (state.phase !== "stage" || state.boxOpen || state.chain.length === 0) return noop;
  const candidates = pool(state);
  if (candidates.length === 0) {
    // โซ่ยาว 1 แล้ว pool ว่าง = คนเริ่มจะได้ตัวเอง; canToggle กันไว้แล้ว แต่กันซ้ำอีกชั้น
    if (state.chain.length < 2) return noop;
    return {
      state: { ...state, phase: "finale", boxOpen: true },
      receiverId: state.chain[0],
      closesLoop: true,
    };
  }
  const receiver = pickFrom(candidates, rng);
  return {
    state: { ...state, chain: [...state.chain, receiver.id], boxOpen: true },
    receiverId: receiver.id,
    closesLoop: false,
  };
}

export function nextTurn(state: GameState): GameState {
  if (state.phase !== "stage" || !state.boxOpen) return state;
  return { ...state, boxOpen: false };
}

export function currentTurn(state: GameState): Turn | null {
  const { chain, phase, boxOpen } = state;
  if (chain.length === 0) return null;
  if (phase === "finale") return { giverId: chain[chain.length - 1], receiverId: chain[0] };
  if (phase === "stage" && boxOpen) {
    return { giverId: chain[chain.length - 2], receiverId: chain[chain.length - 1] };
  }
  return { giverId: chain[chain.length - 1], receiverId: null };
}

export function canToggle(state: GameState, id: string): boolean {
  if (state.phase === "finale") return false;
  if (state.chain.includes(id)) return false;
  const player = state.players.find((p) => p.id === id);
  if (!player) return false;
  if (player.active && state.chain.length === 1) {
    const rest = pool(state).filter((p) => p.id !== id);
    if (rest.length === 0) return false;
  }
  return true;
}

export function setActive(state: GameState, id: string, active: boolean): GameState {
  const player = state.players.find((p) => p.id === id);
  if (!player || player.active === active || !canToggle(state, id)) return state;
  return {
    ...state,
    players: state.players.map((p) => (p.id === id ? { ...p, active } : p)),
  };
}

export function addPlayer(state: GameState, name: string): GameState {
  const trimmed = name.trim();
  if (!trimmed || state.phase === "finale") return state;
  return {
    ...state,
    players: [...state.players, { id: makeId(), name: trimmed, active: true }],
  };
}

export function resetGame(state: GameState): GameState {
  return { ...state, chain: [], phase: "setup", boxOpen: false };
}

export function boxesOpened(state: GameState): number {
  if (state.chain.length === 0) return 0;
  return state.chain.length - 1 + (state.phase === "finale" ? 1 : 0);
}

export function totalBoxes(state: GameState): number {
  return activePlayers(state).length;
}

export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

/** คืน null ถ้าข้อมูลเสีย/เวอร์ชันไม่ตรง/โครงสร้างไม่สอดคล้อง — ผู้เรียกเริ่มใหม่ */
export function loadState(raw: string | null): GameState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.version !== 1) return null;
  if (!Array.isArray(d.players) || !Array.isArray(d.chain)) return null;
  if (!PHASES.includes(d.phase as Phase)) return null;
  if (typeof d.boxOpen !== "boolean" || typeof d.soundOn !== "boolean") return null;

  const players: Player[] = [];
  const ids = new Set<string>();
  for (const item of d.players) {
    if (!item || typeof item !== "object") return null;
    const { id, name, active } = item as Record<string, unknown>;
    if (typeof id !== "string" || typeof name !== "string" || typeof active !== "boolean") {
      return null;
    }
    if (ids.has(id)) return null;
    ids.add(id);
    players.push({ id, name, active });
  }

  const chain: string[] = [];
  const seen = new Set<string>();
  for (const id of d.chain) {
    if (typeof id !== "string" || !ids.has(id) || seen.has(id)) return null;
    seen.add(id);
    chain.push(id);
  }

  const phase = d.phase as Phase;
  if ((phase === "setup") !== (chain.length === 0)) return null;

  return { version: 1, players, chain, phase, boxOpen: d.boxOpen, soundOn: d.soundOn };
}

export function browserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function readSaved(storage?: Pick<Storage, "getItem">): GameState | null {
  try {
    return loadState(storage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return null;
  }
}

export function writeSaved(
  storage: Pick<Storage, "setItem"> | undefined,
  state: GameState,
): void {
  try {
    storage?.setItem(STORAGE_KEY, serializeState(state));
  } catch {
    // โหมดส่วนตัว/พื้นที่เต็ม — เล่นต่อได้ แค่รีเฟรชแล้วไม่จำ
  }
}
