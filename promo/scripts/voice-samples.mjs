// Generates the same Thai promo lines with Edge TTS and Gemini TTS so the
// voices can be compared side by side. Output: audio/samples/*.mp3
// (loudness-normalised so no voice wins just by being louder).
//
// Needs GEMINI_API_KEY in the environment and ffmpeg on PATH.

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const OUT = path.resolve("audio/samples");
fs.mkdirSync(OUT, { recursive: true });

const LINES = (polite) =>
  `คุณครู${polite} คาบหน้าคิดกิจกรรมไม่ทันใช่ไหม? ` +
  `ลองนี่เลย คุณคูลดอทคอม รวมเครื่องมือครูและสื่อการสอน ใช้ฟรี! ` +
  `จะสุ่มชื่อนักเรียน ก็ให้เป็ดแข่งกันวิ่ง ลุ้นกันทั้งห้อง`;
const FEMALE = LINES("คะ");
const MALE = LINES("ครับ");

const GEMINI_MODEL = "gemini-3.8-flash-tts";
const STYLE =
  "Read the following Thai script aloud as an upbeat, energetic, friendly " +
  "TikTok ad voiceover for Thai teachers, at a slightly brisk pace. " +
  "Speak only the script itself:\n\n";

function toMp3(input, name, inputArgs = []) {
  const out = path.join(OUT, `${name}.mp3`);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", ...inputArgs, "-i", input,
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "192k", out,
  ]);
  console.log("wrote", path.relative(process.cwd(), out));
}

async function edge(voice, text, name) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "edge-"));
  const { audioFilePath } = await tts.toFile(dir, text, { rate: "+8%" });
  tts.close();
  toMp3(audioFilePath, name);
}

async function gemini(voice, text, name) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const body = {
    contents: [{ parts: [{ text: STYLE + text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
      },
    );
    if (res.status === 429 && attempt < 5) {
      console.log(`rate limited on ${name}, waiting 20s…`);
      await new Promise((r) => setTimeout(r, 20_000));
      continue;
    }
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status} ${await res.text()}`);
    const json = await res.json();
    const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) throw new Error(`${name}: no audio in response ${JSON.stringify(json).slice(0, 300)}`);
    const pcm = path.join(os.tmpdir(), `${name}.pcm`);
    fs.writeFileSync(pcm, Buffer.from(part.inlineData.data, "base64"));
    // Gemini returns raw 16-bit little-endian PCM, 24 kHz mono.
    toMp3(pcm, name, ["-f", "s16le", "-ar", "24000", "-ac", "1"]);
    return;
  }
}

const jobs = [
  ["A-edge-premwadee-F", () => edge("th-TH-PremwadeeNeural", FEMALE, "A-edge-premwadee-F")],
  ["B-edge-niwat-M", () => edge("th-TH-NiwatNeural", MALE, "B-edge-niwat-M")],
  ["C-gemini-zephyr-F", () => gemini("Zephyr", FEMALE, "C-gemini-zephyr-F")],
  ["D-gemini-leda-F", () => gemini("Leda", FEMALE, "D-gemini-leda-F")],
  ["E-gemini-puck-M", () => gemini("Puck", MALE, "E-gemini-puck-M")],
  ["F-gemini-fenrir-M", () => gemini("Fenrir", MALE, "F-gemini-fenrir-M")],
];

// ONLY=A,C runs just those samples (by leading letter).
const only = process.env.ONLY?.split(",");
let failed = 0;
for (const [name, run] of jobs) {
  if (only && !only.includes(name[0])) continue;
  // Edge's websocket sometimes closes early; one retry usually clears it.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await run();
      break;
    } catch (err) {
      console.error(`attempt ${attempt} failed`, name, "-", err.message);
      if (attempt === 3) failed++;
    }
  }
}
process.exit(failed ? 1 : 0);
