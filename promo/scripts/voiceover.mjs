// Generates one voiceover clip per scene of a video script with Gemini TTS,
// trims the silence around each clip, speeds it up slightly, and writes
//   public/vo/<video>/<scene>.wav   (48 kHz, used by the Remotion composition)
//   public/vo/<video>/timings.json  ({ id: seconds })
// VIDEO picks videos/<video>.json (default "promo").
// Clips that already exist are kept; FORCE=hook,cta regenerates those only,
// FORCE=all regenerates everything. TEMPO overrides the speed-up (default 1.12).
// DRY=1 writes estimated timings only (no audio, no quota), marked
// "placeholder", so scenes can be built before the real voice exists.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const VIDEO = process.env.VIDEO ?? "promo";
const script = JSON.parse(fs.readFileSync(`videos/${VIDEO}.json`, "utf8"));
const OUT = path.resolve("public/vo", VIDEO);
fs.mkdirSync(OUT, { recursive: true });

if (process.env.DRY) {
  // Measured on the promo's Zephyr takes after the 1.12x speed-up: ~13.5 characters a second.
  const est = Object.fromEntries(script.scenes.map((s) => [s.id, Number((s.speech.replace(/\s/g, "").length / 13.5).toFixed(2))]));
  fs.writeFileSync(path.join(OUT, "timings.json"), JSON.stringify({ ...est, placeholder: true }, null, 2));
  console.log("estimated timings (no audio):", est);
  process.exit(0);
}

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("GEMINI_API_KEY is not set");
const force = (process.env.FORCE ?? "").split(",");
const TEMPO = Number(process.env.TEMPO ?? 1.12);

const STYLE = "Say this Thai line quickly, in a bright, cheerful, energetic voice:\n";

// Gemini TTS sometimes keeps babbling after the line (a 4 s line came back as
// 16 s of audio). Fast Thai speech runs ~10-12 characters a second, so a clip
// longer than chars/7 + 1 s is treated as a bad take and regenerated.
const maxSeconds = (text) => text.replace(/\s/g, "").length / 7 + 1;
const TAKES = 2; // free tier is ~10 requests/day per model, so retries are rationed

async function tts(text) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: STYLE + text }] }],
    generationConfig: {
      temperature: 0.6,
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: script.voice.name } } },
    },
  });
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${script.voice.model}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body,
        signal: AbortSignal.timeout(90_000),
      },
    ).catch((e) => ({ ok: false, status: 0, text: async () => e.message }));
    if (res.ok) {
      const json = await res.json();
      const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (part) return Buffer.from(part.inlineData.data, "base64");
      console.log("  no audio in response, retrying");
    } else {
      const text = await res.text();
      // The free tier allows ~10 TTS requests per model per day; waiting won't help.
      if (res.status === 429 && text.includes("PerDay")) {
        throw new Error(`daily free-tier quota for ${script.voice.model} is used up`);
      }
      console.log(`  HTTP ${res.status} ${text.slice(0, 100)} — retry ${attempt}`);
    }
    await new Promise((r) => setTimeout(r, 15_000 * attempt));
  }
  throw new Error("Gemini TTS kept failing");
}

function seconds(file) {
  return Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString().trim(),
  );
}

// Trim silence at both ends (reverse trick), then speed up without pitch shift.
const TRIM = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05";
const FILTER = `${TRIM},areverse,${TRIM},areverse,atempo=${TEMPO}`;

const timings = {};
for (const scene of script.scenes) {
  const out = path.join(OUT, `${scene.id}.wav`);
  const redo = force.includes("all") || force.includes(scene.id);
  const limit = maxSeconds(scene.speech);
  if (fs.existsSync(out) && !redo && seconds(out) > limit) {
    console.log(`  ${scene.id}: existing clip ${seconds(out).toFixed(1)}s > ${limit.toFixed(1)}s limit, regenerating`);
  } else if (fs.existsSync(out) && !redo) {
    timings[scene.id] = Number(seconds(out).toFixed(3));
    console.log(`  ${scene.id}: ${timings[scene.id]}s (kept)`);
    continue;
  }
  let best = null;
  for (let take = 1; take <= TAKES; take++) {
    console.log(`generating ${scene.id} take ${take}`);
    const pcm = path.join(os.tmpdir(), `vo-${scene.id}.pcm`);
    const tmp = path.join(os.tmpdir(), `vo-${scene.id}-${take}.wav`);
    fs.writeFileSync(pcm, await tts(scene.speech));
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcm,
      "-af", FILTER, "-ar", "48000", tmp,
    ]);
    const len = seconds(tmp);
    console.log(`  take ${take}: ${len.toFixed(2)}s (limit ${limit.toFixed(1)}s)`);
    if (!best || len < best.len) best = { tmp, len };
    if (len <= limit) break;
  }
  if (best.len > limit) console.log(`  WARNING ${scene.id}: no take under the limit, kept the shortest`);
  fs.copyFileSync(best.tmp, out);
  timings[scene.id] = Number(seconds(out).toFixed(3));
  console.log(`  ${scene.id}: ${timings[scene.id]}s`);
}
fs.writeFileSync(path.join(OUT, "timings.json"), JSON.stringify(timings, null, 2));
const total = Object.values(timings).reduce((a, b) => a + b, 0);
console.log(`total speech: ${total.toFixed(1)}s`);
