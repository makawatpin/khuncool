import { FPS } from "./theme";

/** Voiceover length per scene in seconds (public/vo/<video>/timings.json). */
export type Timings = Record<string, number> & { placeholder?: boolean };

/** From public/music/beats.json (scripts/beats.mjs). */
export type Beats = { bpm: number; period: number; start: number; beats: number[] };

export type SceneSlot = { id: string; from: number; duration: number; voFrames: number };

const BREATH = 0.35;

/**
 * Lays scenes end to end. Each lasts as long as its voiceover plus a breath,
 * but never less than `minSeconds[id]` (what its visuals need). With a beat
 * period, lengths round up to whole beats so every cut lands on the beat;
 * boundaries are computed in seconds and rounded once, so frame rounding never
 * drifts against the music.
 */
export function buildTimeline(ids: readonly string[], minSeconds: Record<string, number>, t: Timings, period?: number): SceneSlot[] {
  let beats = 0;
  let secs = 0;
  return ids.map((id) => {
    const vo = t[id] ?? 3;
    const need = Math.max(vo + BREATH, minSeconds[id] ?? 0);
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
  return last ? last.from + last.duration : 1;
};
