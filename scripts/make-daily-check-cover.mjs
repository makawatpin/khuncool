// สร้างภาพปกแอปบันทึกรายวัน (1600×1125 webp) จากหน้าแอปจริงที่ใส่ข้อมูลตัวอย่าง
// รัน dev server ก่อน แล้ว: node scripts/make-daily-check-cover.mjs <toothbrushing|milk> [baseUrl]
import { chromium } from "playwright";
import sharp from "sharp";

const KIND = process.argv[2];
const LS_KEYS = { toothbrushing: "khuncool_toothbrushing_v1", milk: "khuncool_milk_v1" };
if (!LS_KEYS[KIND]) throw new Error("usage: node scripts/make-daily-check-cover.mjs <toothbrushing|milk> [baseUrl]");
const BASE = process.argv[3] || "http://localhost:3000";
const OUT = `public/assets/${KIND}-cover.webp`;

const students = [
  "เด็กชายกิตติ ใจดี",
  "เด็กหญิงชนากานต์ สุขใจ",
  "เด็กชายณัฐพงษ์ ทองมา",
  "เด็กหญิงปาริชาต แก้วใส",
  "เด็กชายภูริ เจริญสุข",
  "เด็กหญิงมนัสนันท์ ศรีทอง",
  "เด็กชายวรเมธ พูนผล",
  "เด็กหญิงอริสา บุญมี",
];

// Fills every weekday of the current month up to today with a believable mix.
function sampleDays() {
  const days = {};
  const now = new Date();
  const p = (n) => String(n).padStart(2, "0");
  for (let d = 1; d <= now.getDate(); d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const iso = `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(d)}`;
    days[iso] = Object.fromEntries(
      students.map((n, i) => [n, (i * 3 + d) % 7 === 0 ? "skipped" : "done"]),
    );
  }
  return days;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.25 });
await page.addInitScript(
  ([key, state]) => localStorage.setItem(key, state),
  [LS_KEYS[KIND], JSON.stringify({ students, room: "ป.5/2", days: sampleDays(), holidays: [] })],
);
await page.goto(`${BASE}/tools/${KIND}`, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: /รายวัน/ }).first().waitFor();
const stage = page.locator(".tool-stage").first();
await stage.scrollIntoViewIfNeeded();
const shot = await stage.screenshot();
await browser.close();

// Trim the empty space around the tool, give it an even white margin, then fit
// the 1600×1125 frame the other tool covers use.
const trimmed = await sharp(shot).trim({ background: "#ffffff", threshold: 4 }).toBuffer();
await sharp(trimmed)
  .extend({ top: 48, bottom: 48, left: 48, right: 48, background: "#ffffff" })
  .resize(1600, 1125, { fit: "contain", background: "#ffffff" })
  .webp({ quality: 82 })
  .toFile(OUT);
console.log("wrote", OUT);
