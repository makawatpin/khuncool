import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const WORD_IDS = [
  "ka", "kha", "cha", "na", "pa", "fa", "ya", "maa",
  "khii", "chii", "dii", "tii", "pii", "phii", "mii", "sii",
  "khuu", "nguu", "chuu", "duu", "puu", "ruu", "huu", "tuu",
];

const CONSONANT_IDS = [
  "01-ko-kai", "02-kho-khai", "03-kho-khuat", "04-kho-khwai",
  "05-kho-khon", "06-kho-rakhang", "07-ngo-ngu", "08-cho-chan",
  "09-cho-ching", "10-cho-chang", "11-so-so", "12-cho-choe",
  "13-yo-ying", "14-do-chada", "15-to-patak", "16-tho-than",
  "17-tho-montho", "18-tho-phu-thao", "19-no-nen", "20-do-dek",
  "21-to-tao", "22-tho-thung", "23-tho-thahan", "24-tho-thong",
  "25-no-nu", "26-bo-baimai", "27-po-pla", "28-pho-phueng",
  "29-fo-fa", "30-pho-phan", "31-fo-fan", "32-pho-samphao",
  "33-mo-ma", "34-yo-yak", "35-ro-ruea", "36-lo-ling",
  "37-wo-waen", "38-so-sala", "39-so-ruesi", "40-so-suea",
  "41-ho-hip", "42-lo-chula", "43-o-ang", "44-ho-nokhuk",
];

const CONSONANT_CORRECTION_IDS = [
  "03-kho-khuat", "19-no-nen", "28-pho-phueng", "34-yo-yak",
];

const VOWEL_IDS = ["vowel-aa", "vowel-ii", "vowel-uu"];

const input = process.argv[2];
const outputDir = process.argv[3];
const preset = process.argv[4] ?? "words";
const clipIds = preset === "consonants"
  ? CONSONANT_IDS
  : preset === "consonant-corrections"
    ? CONSONANT_CORRECTION_IDS
    : preset === "vowels"
      ? VOWEL_IDS
    : WORD_IDS;
if (!input || !outputDir) {
  console.error("Usage: node scripts/split-thai-narration.mjs <audio-file> <output-dir> [words|consonants|consonant-corrections|vowels]");
  process.exit(1);
}
if (!["words", "consonants", "consonant-corrections", "vowels"].includes(preset)) {
  console.error(`Unknown preset: ${preset}`);
  process.exit(1);
}

const bytes = fs.readFileSync(input);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async ({ base64, expectedCount, bridgeSeconds }) => {
    const raw = atob(base64);
    const data = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) data[i] = raw.charCodeAt(i);

    const context = new AudioContext();
    const decoded = await context.decodeAudioData(data.buffer);
    const sampleRate = decoded.sampleRate;
    const source = decoded.getChannelData(0);
    const windowSeconds = 0.02;
    const windowSize = Math.max(1, Math.round(sampleRate * windowSeconds));
    const rms = [];
    let peakRms = 0;

    for (let start = 0; start < source.length; start += windowSize) {
      const end = Math.min(source.length, start + windowSize);
      let sum = 0;
      for (let i = start; i < end; i += 1) sum += source[i] * source[i];
      const value = Math.sqrt(sum / (end - start));
      rms.push(value);
      peakRms = Math.max(peakRms, value);
    }

    const threshold = peakRms * 10 ** (-40 / 20);
    const active = rms.map((value) => value >= threshold);
    const bridgeWindows = Math.round(bridgeSeconds / windowSeconds);
    const minWindows = Math.round(0.12 / windowSeconds);
    let lastActive = -Infinity;
    for (let i = 0; i < active.length; i += 1) {
      if (!active[i]) continue;
      if (i - lastActive <= bridgeWindows) {
        for (let j = lastActive + 1; j < i; j += 1) active[j] = true;
      }
      lastActive = i;
    }

    const regions = [];
    let regionStart = null;
    for (let i = 0; i <= active.length; i += 1) {
      if (i < active.length && active[i] && regionStart === null) regionStart = i;
      if ((i === active.length || !active[i]) && regionStart !== null) {
        if (i - regionStart >= minWindows) {
          regions.push({ start: regionStart * windowSeconds, end: Math.min(decoded.duration, i * windowSeconds) });
        }
        regionStart = null;
      }
    }

    if (regions.length !== expectedCount) {
      throw new Error(`Expected ${expectedCount} spoken regions, detected ${regions.length}`);
    }

    const makeWav = (samples) => {
      const buffer = new ArrayBuffer(44 + samples.length * 2);
      const view = new DataView(buffer);
      const writeText = (offset, text) => {
        for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
      };
      writeText(0, "RIFF");
      view.setUint32(4, 36 + samples.length * 2, true);
      writeText(8, "WAVEfmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeText(36, "data");
      view.setUint32(40, samples.length * 2, true);
      for (let i = 0; i < samples.length; i += 1) {
        const value = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(44 + i * 2, value < 0 ? value * 32768 : value * 32767, true);
      }
      const wavBytes = new Uint8Array(buffer);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < wavBytes.length; i += chunkSize) {
        binary += String.fromCharCode(...wavBytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    };

    const clips = regions.map((region) => {
      const paddedStart = Math.max(0, region.start - 0.1);
      const paddedEnd = Math.min(decoded.duration, region.end + 0.16);
      const startSample = Math.floor(paddedStart * sampleRate);
      const endSample = Math.ceil(paddedEnd * sampleRate);
      const samples = new Float32Array(endSample - startSample);
      samples.set(source.subarray(startSample, endSample));

      let peak = 0;
      for (const value of samples) peak = Math.max(peak, Math.abs(value));
      const gain = peak > 0 ? Math.min(4, 0.85 / peak) : 1;
      const fadeSamples = Math.min(Math.round(sampleRate * 0.008), Math.floor(samples.length / 2));
      for (let i = 0; i < samples.length; i += 1) {
        let fade = 1;
        if (i < fadeSamples) fade = i / fadeSamples;
        if (i >= samples.length - fadeSamples) fade = Math.min(fade, (samples.length - 1 - i) / fadeSamples);
        samples[i] *= gain * Math.max(0, fade);
      }

      return {
        start: paddedStart,
        end: paddedEnd,
        duration: paddedEnd - paddedStart,
        gain,
        wav: makeWav(samples),
      };
    });

    await context.close();
    return { sourceDuration: decoded.duration, sampleRate, clips };
  }, {
    base64: bytes.toString("base64"),
    expectedCount: clipIds.length,
    bridgeSeconds: preset === "vowels" ? 0.85 : 0.28,
  });

  fs.mkdirSync(outputDir, { recursive: true });
  const manifest = [];
  for (let i = 0; i < clipIds.length; i += 1) {
    const clip = result.clips[i];
    const filename = `${clipIds[i]}.wav`;
    fs.writeFileSync(path.join(outputDir, filename), Buffer.from(clip.wav, "base64"));
    manifest.push({
      id: clipIds[i],
      start: +clip.start.toFixed(3),
      end: +clip.end.toFixed(3),
      duration: +clip.duration.toFixed(3),
      gain: +clip.gain.toFixed(3),
    });
  }

  console.log(JSON.stringify({ sourceDuration: result.sourceDuration, sampleRate: result.sampleRate, clips: manifest }, null, 2));
} finally {
  await browser.close();
}
