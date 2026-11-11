// Synthesises the promo's sound effects with ffmpeg (no downloads, no licences):
// whoosh (scene changes), pop (labels), boom (logo hits), sparkle ("ใช้ฟรี!").
// Output: public/sfx/*.wav
import { execFileSync } from "node:child_process";
import fs from "node:fs";

fs.mkdirSync("public/sfx", { recursive: true });
const gen = (name, args) => {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args, "-ar", "48000", "-ac", "2", `public/sfx/${name}.wav`]);
  console.log("wrote", name);
};

// Airy swell of pink noise, brightening then cut short.
gen("whoosh", [
  "-f", "lavfi", "-i", "anoisesrc=d=0.42:c=pink:a=0.9",
  "-af", "highpass=f=400,lowpass=f=7000,afade=t=in:d=0.3:curve=exp,afade=t=out:st=0.3:d=0.12,volume=0.55",
]);
// Bubble pop: fast downward pitch blip.
gen("pop", [
  "-f", "lavfi", "-i", "aevalsrc='0.7*sin(2*PI*(1100-4200*t)*t)*exp(-38*t)':d=0.13",
]);
// Low thump with a click on top for logo hits.
gen("boom", [
  "-f", "lavfi", "-i", "aevalsrc='0.95*sin(2*PI*(95-70*t)*t)*exp(-5.5*t)+0.25*sin(2*PI*1800*t)*exp(-90*t)':d=0.7",
]);
// Three rising chime notes (G6, C7, E7).
const chime = (f, d) => `0.28*sin(2*PI*${f}*max(0,t-${d}))*exp(-7*max(0,t-${d}))*gt(t,${d})`;
gen("sparkle", [
  "-f", "lavfi", "-i", `aevalsrc='${chime(1568, 0)}+${chime(2093, 0.07)}+${chime(2637, 0.14)}':d=0.9`,
]);
