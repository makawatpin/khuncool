// สร้างพื้นหลังของ /gift-exchange จากภาพต้นฉบับ scripts/gift-exchange-bg-source.webp
//  - bg-wide.webp : จอแนวนอน ใช้ภาพต้นฉบับ (1672×941)
//  - bg-tall.webp : จอแนวตั้ง 960×1600 — ภาพตรงกลางเป็นท้องฟ้า แล้ววางของตกแต่งทั้งสี่มุมของต้นฉบับทับ
//                   (การครอปตรงกลางของภาพแนวนอนจะตัดของตกแต่งทิ้งหมด)
// รัน: node scripts/make-gift-exchange-bg.mjs
import sharp from "sharp";

const SRC = "scripts/gift-exchange-bg-source.webp";
const OUT = "public/assets/gift-exchange";
const { width: W, height: H } = await sharp(SRC).metadata();

await sharp(SRC).webp({ quality: 82 }).toFile(`${OUT}/bg-wide.webp`);

const TW = 960;
const TH = 1600;

// ท้องฟ้าตรงกลาง: ครอปคอลัมน์กลางของต้นฉบับ แล้ว cover ให้เต็มภาพแนวตั้ง (สเกลสม่ำเสมอ ไม่บิดภาพ)
const centerW = Math.round(H * (TW / TH));
const base = await sharp(SRC)
  .extract({ left: Math.round((W - centerW) / 2), top: 0, width: centerW, height: H })
  .resize(TW, TH, { fit: "cover" })
  .toBuffer();

// ครอปมุม + ไล่ขอบให้กลืนกับท้องฟ้า
const CROP_W = 620;
const CROP_H = 600;
const SCALE = 0.62;
const cw = Math.round(CROP_W * SCALE);
const ch = Math.round(CROP_H * SCALE);

function fadeMask(corner) {
  // ทึบที่มุมของภาพ จางหายไปทางขอบที่ติดกับกลางภาพ
  const cx = corner.includes("r") ? cw : 0;
  const cy = corner.includes("b") ? ch : 0;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}">
       <defs><radialGradient id="g" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${Math.min(cw, ch) * 0.97}">
         <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.4" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
       </radialGradient></defs>
       <rect width="${cw}" height="${ch}" fill="url(#g)"/>
     </svg>`,
  );
}

const corners = [
  { id: "tl", left: 0, top: 0, dest: [0, 0] },
  { id: "tr", left: W - CROP_W, top: 0, dest: [TW - cw, 0] },
  { id: "bl", left: 0, top: H - CROP_H, dest: [0, TH - ch] },
  { id: "br", left: W - CROP_W, top: H - CROP_H, dest: [TW - cw, TH - ch] },
];

const layers = [];
for (const c of corners) {
  const piece = await sharp(SRC)
    .extract({ left: c.left, top: c.top, width: CROP_W, height: CROP_H })
    .resize(cw, ch)
    .ensureAlpha()
    .composite([{ input: fadeMask(c.id), blend: "dest-in" }])
    .png()
    .toBuffer();
  layers.push({ input: piece, left: c.dest[0], top: c.dest[1] });
}

await sharp(base).composite(layers).webp({ quality: 82 }).toFile(`${OUT}/bg-tall.webp`);
console.log("wrote bg-wide.webp and bg-tall.webp");
