import { FPS } from "./theme";

/** Voiceover length per scene in seconds (public/vo/<video>/timings.json). */
export type Timings = Record<string, number> & { placeholder?: boolean };

/** From public/music/beats.json (scripts/beats.mjs). */
export type Beats = { bpm: number; period: number; start: number; beats: number[] };

/** `lead` = frames of silence before this scene's voice starts (the video's lead-in; 0 on every scene but the first). */
export type SceneSlot = { id: string; from: number; duration: number; voFrames: number; lead: number };

const BREATH = 0.35;

/**
 * Lays scenes end to end. Each lasts as long as its voiceover plus a breath,
 * but never less than `minSeconds[id]` (what its visuals need). With a beat
 * period, lengths round up to whole beats so every cut lands on the beat;
 * boundaries are computed in seconds and rounded once, so frame rounding never
 * drifts against the music.
 */
export function buildTimeline(ids: readonly string[], minSeconds: Record<string, number>, t: Timings, period?: number, lead = 0): SceneSlot[] {
  let beats = 0;
  let secs = 0;
  return ids.map((id, i) => {
    const vo = t[id] ?? 3;
    // `lead` seconds of picture and music before the first word, so a viewer who
    // has just opened the video does not miss it.
    const l = i === 0 ? lead : 0;
    const need = Math.max(l + vo + BREATH, minSeconds[id] ?? 0);
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
    return { id, from, duration: Math.round(endSec * FPS) - from, voFrames: Math.round(vo * FPS), lead: Math.round(l * FPS) };
  });
}

export const totalFrames = (slots: SceneSlot[]) => {
  const last = slots[slots.length - 1];
  return last ? last.from + last.duration : 1;
};
