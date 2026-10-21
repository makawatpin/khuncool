// เลือกว่าจะวาดฉากเปิดกล่องแบบ 3D เต็ม, 3D แบบเบา หรือกล่อง SVG เดิม — pure ยกเว้นตัวอ่าน/เขียน storage

export type RenderMode = "3d-high" | "3d-low" | "2d";

/** manual = ครูกดเลือกเอง ระบบจะไม่ลดถึง 2D ให้เอง */
export type SavedMode = { mode: RenderMode; manual: boolean };

export const RENDER_KEY = "khuncool.giftexchange.render";

const MODES: readonly RenderMode[] = ["3d-high", "3d-low", "2d"];

/** เฟรมแรกๆ ช้าเพราะคอมไพล์ shader — ตัดทิ้งก่อนวัด */
const SKIP_FRAMES = 10;
const MIN_SAMPLES = 30;
/** ช้ากว่านี้ (≈ ต่ำกว่า 35 fps) → ลดเป็น 3D แบบเบา */
const LOW_MS = 28;
/** ช้ากว่านี้ (≈ ต่ำกว่า 25 fps) → กลับไปใช้ SVG */
const FAIL_MS = 40;

/** three r185 สร้าง renderer ได้เฉพาะ WebGL2 — เครื่องที่มีแค่ WebGL1 ต้องใช้ 2D */
export function supportsWebGL2(createCanvas: () => { getContext(id: string): unknown }): boolean {
  try {
    return !!createCanvas().getContext("webgl2");
  } catch {
    return false;
  }
}

export function parseSavedMode(raw: string | null): SavedMode | null {
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length > 2) return null;
  const [mode, flag] = parts;
  if (!MODES.includes(mode as RenderMode)) return null;
  if (flag !== undefined && flag !== "manual") return null;
  return { mode: mode as RenderMode, manual: flag === "manual" };
}

export function serializeSavedMode(s: SavedMode): string {
  return s.manual ? `${s.mode}:manual` : s.mode;
}

export function initialMode(opts: { webgl: boolean; saved: SavedMode | null }): RenderMode {
  if (!opts.webgl) return "2d";
  return opts.saved?.mode ?? "3d-high";
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function judgeFrames(mode: RenderMode, msPerFrame: number[], manual: boolean): RenderMode {
  if (mode === "2d") return mode;
  const usable = msPerFrame.slice(SKIP_FRAMES);
  if (usable.length < MIN_SAMPLES) return mode;
  const m = median(usable);
  if (m > FAIL_MS) return manual ? "3d-low" : "2d";
  if (m > LOW_MS) return "3d-low";
  return mode;
}

export function readSavedMode(storage?: Pick<Storage, "getItem">): SavedMode | null {
  try {
    return parseSavedMode(storage?.getItem(RENDER_KEY) ?? null);
  } catch {
    return null;
  }
}

export function writeSavedMode(storage: Pick<Storage, "setItem"> | undefined, s: SavedMode): void {
  try {
    storage?.setItem(RENDER_KEY, serializeSavedMode(s));
  } catch {
    // โหมดส่วนตัว/พื้นที่เต็ม — แค่ไม่จำ
  }
}
