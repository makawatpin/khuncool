import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { THAI_CONSONANTS } from "../app/media/thai/thai-kingdom/consonantData.ts";
import { THAI_WORDS, WORD_BY_ID } from "../app/media/thai/thai-kingdom/wordData.ts";
import { hasValidThaiOrder, segmentThai } from "../app/media/thai/thai-kingdom/thaiText.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const seenIds = new Set();
const seenWords = new Set();

for (const word of THAI_WORDS) {
  if (seenIds.has(word.id)) errors.push(`duplicate id: ${word.id}`);
  if (seenWords.has(word.word)) errors.push(`duplicate word: ${word.word}`);
  seenIds.add(word.id);
  seenWords.add(word.word);
  if (!hasValidThaiOrder(word.word)) errors.push(`invalid Unicode order: ${word.word}`);
  if (!segmentThai(word.word).length) errors.push(`no grapheme clusters: ${word.word}`);
  if (new Set(word.distractors).size !== word.distractors.length) errors.push(`duplicate distractors: ${word.id}`);
  if (word.distractors.includes(word.id)) errors.push(`answer appears in distractors: ${word.id}`);
  for (const distractor of word.distractors) if (!WORD_BY_ID.has(distractor)) errors.push(`unknown distractor ${distractor} in ${word.id}`);
  for (const asset of [word.image, word.audio]) {
    const target = path.join(root, "public", asset.replace(/^\/assets\//, "assets/"));
    if (!fs.existsSync(target)) errors.push(`missing asset: ${asset}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${THAI_WORDS.length} Thai words: unique data, valid Unicode, distractors, images and audio.`);

if (THAI_CONSONANTS.length !== 44) errors.push(`expected 44 consonants, found ${THAI_CONSONANTS.length}`);
if (new Set(THAI_CONSONANTS.map((item) => item.letter)).size !== 44) errors.push("duplicate consonant letters");
if (new Set(THAI_CONSONANTS.map((item) => item.mnemonic)).size !== 44) errors.push("duplicate consonant mnemonics");
for (const item of THAI_CONSONANTS) {
  if (item.letter !== item.letter.normalize("NFC")) errors.push(`non-NFC consonant: ${item.letter}`);
  if (item.mnemonic !== item.mnemonic.normalize("NFC")) errors.push(`non-NFC mnemonic: ${item.mnemonic}`);
  for (const asset of [item.image]) {
    const target = path.join(root, "public", asset.replace(/^\/assets\//, "assets/"));
    if (!fs.existsSync(target)) errors.push(`missing consonant asset: ${asset}`);
    else if (fs.statSync(target).size < 5_000) errors.push(`consonant image may be blank: ${asset}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Validated 44 Thai consonants: standard mnemonics, unique data and images.");
