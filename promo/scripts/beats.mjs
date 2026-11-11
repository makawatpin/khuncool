// Finds the tempo and beat grid of public/music/bgm.mp3 so animations can hit
// the beat, and scores each start offset by loudness so the video uses the
// liveliest stretch of the track. Writes public/music/beats.json:
//   { bpm, period, firstBeat, start, beats: [seconds from `start`] }
// ffmpeg decodes a low-passed mono envelope; the rest is plain JS.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const FILE = "public/music/bgm.mp3";
const SR = 4000; // envelope sample rate after decoding
const HOP = 40; // 10 ms frames
const LENGTH = Number(process.env.LENGTH ?? 36); // seconds of music the video needs

const raw = execFileSync("ffmpeg", [
  "-loglevel", "error", "-i", FILE, "-ac", "1", "-ar", String(SR), "-af", "lowpass=f=180", "-f", "f32le", "-",
], { maxBuffer: 1 << 28 });
const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);

// Energy per 10 ms frame, then onset strength = positive change in log energy.
const n = Math.floor(pcm.length / HOP);
const energy = new Float32Array(n);
for (let i = 0; i < n; i++) {
  let s = 0;
  for (let j = 0; j < HOP; j++) s += pcm[i * HOP + j] ** 2;
  energy[i] = Math.log1p(1000 * s / HOP);
}
const onset = new Float32Array(n);
for (let i = 1; i < n; i++) onset[i] = Math.max(0, energy[i] - energy[i - 1]);

// Tempo: autocorrelation of the onset curve over 80-170 BPM.
let best = { lag: 0, score: -1 };
for (let lag = Math.round(6000 / 170); lag <= Math.round(6000 / 80); lag++) {
  let s = 0;
  for (let i = lag; i < n; i++) s += onset[i] * onset[i - lag];
  if (s > best.score) best = { lag, score: s };
}
// The lag is whole 10 ms frames; over a 36 s video that rounding drifts by up
// to ~0.3 s. Refine period and phase together on a 0.5 ms grid by scoring how
// much onset energy a beat grid collects across the whole track.
const at = (t) => { const i = Math.round(t * 100); return (onset[i] ?? 0) + 0.5 * ((onset[i - 1] ?? 0) + (onset[i + 1] ?? 0)); };
let fit = { period: best.lag / 100, phase: 0, score: -1 };
for (let p = best.lag / 100 - 0.008; p <= best.lag / 100 + 0.008; p += 0.0005) {
  for (let ph = 0; ph < p; ph += 0.005) {
    let s = 0;
    for (let t = ph; t < n / 100; t += p) s += at(t);
    if (s > fit.score) fit = { period: p, phase: ph, score: s };
  }
}
const period = fit.period; // seconds per beat
const bpm = 60 / period;
const firstBeat = Number(fit.phase.toFixed(3));

// Liveliest window: highest mean energy over LENGTH seconds, start snapped to a beat
// (and to a 4-beat bar so the first downbeat lands on frame 0).
const total = n / 100;
const bar = period * 4;
let window = { start: 0, score: -1 };
for (let start = firstBeat; start + LENGTH <= total; start += bar) {
  let s = 0;
  const a = Math.round(start * 100), b = Math.round((start + LENGTH) * 100);
  for (let i = a; i < b; i++) s += energy[i];
  if (s > window.score) window = { start, score: s };
}
// Prefer an early window if it is nearly as lively (keeps the song's build-up natural).
const beats = [];
for (let t = window.start; t < window.start + LENGTH; t += period) beats.push(Number((t - window.start).toFixed(3)));

const out = { bpm: Number(bpm.toFixed(1)), period: Number(period.toFixed(4)), firstBeat, start: Number(window.start.toFixed(3)), beats };
fs.writeFileSync("public/music/beats.json", JSON.stringify(out, null, 2));
console.log(`bpm ${out.bpm}  period ${out.period}s  first beat ${firstBeat}s  window starts ${out.start}s of ${total.toFixed(1)}s  (${beats.length} beats)`);

// Coarse loudness map, one value per 4 s, to sanity-check the window choice.
const per = [];
for (let t = 0; t < total; t += 4) {
  let s = 0, c = 0;
  for (let i = Math.round(t * 100); i < Math.min(n, Math.round((t + 4) * 100)); i++) { s += energy[i]; c++; }
  per.push((s / c).toFixed(1));
}
console.log("energy/4s:", per.join(" "));
