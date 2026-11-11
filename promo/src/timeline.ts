import { FPS } from "./theme";

export const SCENE_IDS = ["hook", "reveal", "duck", "tools", "games", "screens", "classroom", "cta"] as const;
export type SceneId = (typeof SCENE_IDS)[number];
export type Timings = Record<SceneId, number>;

/** From public/music/beats.json (scripts/beats.mjs). */
export type Beats = { bpm: number; period: number; start: number; beats: number[] };

// Each scene lasts as long as its voiceover plus a breath, but never less than
// what its visuals need (the duck race and the game montage need time to read).
const MIN_SECONDS: Record<SceneId, number> = {
  hook: 2.6, reveal: 4.6, duck: 5.0, tools: 4.2, games: 5.4, screens: 4.0, classroom: 4.2, cta: 5.6,
};
const BREATH = 0.35;

export type SceneSlot = { id: SceneId; from: number; duration: number; voFrames: number };

/**
 * Scene lengths are rounded up to whole beats of the music, so every cut lands
 * on a beat. Boundaries are computed in seconds and rounded once, so the
 * rounding to frames never accumulates drift against the music.
 */
export function buildTimeline(t: Timings, period?: number): SceneSlot[] {
  let beats = 0;
  let secs = 0;
  return SCENE_IDS.map((id) => {
    const vo = t[id] ?? 3;
    const need = Math.max(vo + BREATH, MIN_SECONDS[id]);
    const startSec = period ? beats * period : secs;
    let endSec: number;
    if (period) {
      beats += Math.ceil(need / period);
      endSec = beats * period;
    } else {
      secs += need;
      endSec = secs;
    }
    const from = Math.round(startSec * FPS);
    return { id, from, duration: Math.round(endSec * FPS) - from, voFrames: Math.round(vo * FPS) };
  });
}

export const totalFrames = (slots: SceneSlot[]) => {
  const last = slots[slots.length - 1];
  return last.from + last.duration;
};
