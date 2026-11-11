// Transcribes mp3 files with Gemini so generated voiceovers can be checked
// for extra or missing words without listening. Usage: node scripts/transcribe.mjs a.mp3 b.mp3
import fs from "node:fs";
import path from "node:path";

const key = process.env.GEMINI_API_KEY;
// Newest first; a model under load (503) or retired (404) falls through to the next.
const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"];

async function transcribe(file) {
  const body = JSON.stringify({
    contents: [{
      parts: [
        { inlineData: { mimeType: "audio/mp3", data: fs.readFileSync(file).toString("base64") } },
        { text: "Transcribe this audio verbatim, in whatever language is spoken. Mark long silences (over 0.7s) as [pause]. Output only the transcript." },
      ],
    }],
  });
  let last = "";
  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body,
        signal: AbortSignal.timeout(60_000),
      },
    ).catch((e) => ({ ok: false, status: 0, text: async () => e.message }));
    if (!res.ok) { last = `${model}: ${res.status} ${(await res.text()).slice(0, 120)}`; continue; }
    const json = await res.json();
    return `[${model}] ` + (json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "").trim();
  }
  return `FAILED ${last}`;
}

for (const file of process.argv.slice(2)) {
  console.log(`--- ${path.basename(file)}\n${await transcribe(file)}`);
}
