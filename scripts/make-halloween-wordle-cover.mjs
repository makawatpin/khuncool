// สร้างภาพปก Halloween Wordle (1200×675 webp) จาก SVG ด้วย sharp
// รัน: node scripts/make-halloween-wordle-cover.mjs
import sharp from "sharp";

const W = 1200;
const H = 675;

const TILE = 118;
const GAP = 14;
const COLS = 5;
const ROWS = [
  { word: "SPELL", states: ["a", "p", "a", "a", "a"] },
  { word: "WITCH", states: ["a", "a", "a", "c", "a"] },
  { word: "GHOST", states: ["c", "c", "c", "c", "c"] },
];
const FILL = { c: "#ff7518", p: "#7c3aed", a: "#3a3150" };
const INK = { c: "#1a0b2e", p: "#ffffff", a: "#e5defa" };

const gridW = COLS * TILE + (COLS - 1) * GAP;
const x0 = (W - gridW) / 2;
const y0 = 250;

const tiles = ROWS.map((row, r) =>
  row.word
    .split("")
    .map((ch, c) => {
      const x = x0 + c * (TILE + GAP);
      const y = y0 + r * (TILE + GAP) - (r === 2 ? 0 : 0);
      const s = row.states[c];
      return `<rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="16" fill="${FILL[s]}"/>
      <text x="${x + TILE / 2}" y="${y + TILE / 2 + 28}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="84" fill="${INK[s]}">${ch}</text>`;
    })
    .join(""),
).join("");

const stars = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 263) % W;
  const y = (i * 149) % 330;
  const r = 1.4 + (i % 3) * 0.9;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${0.35 + (i % 4) * 0.15}"/>`;
}).join("");

const bat = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="#120626">
    <path d="M0 0 C -20 -26, -62 -30, -86 -4 C -70 -8, -58 -4, -50 8 C -42 -2, -28 0, -20 14 C -12 6, -6 6, 0 20 C 6 6, 12 6, 20 14 C 28 0, 42 -2, 50 8 C 58 -4, 70 -8, 86 -4 C 62 -30, 20 -26, 0 0 Z"/>
    <circle cx="-5" cy="-4" r="3.2" fill="#ffd56b"/><circle cx="5" cy="-4" r="3.2" fill="#ffd56b"/>
  </g>`;

const pumpkin = `
  <g transform="translate(1062 506)">
    <ellipse cx="0" cy="92" rx="104" ry="14" fill="#000" opacity=".22"/>
    <rect x="-9" y="-92" width="18" height="34" rx="6" fill="#4a7c2a"/>
    <ellipse cx="-58" cy="8" rx="48" ry="76" fill="#e8620a"/>
    <ellipse cx="58" cy="8" rx="48" ry="76" fill="#e8620a"/>
    <ellipse cx="-26" cy="8" rx="46" ry="82" fill="#ff7518"/>
    <ellipse cx="26" cy="8" rx="46" ry="82" fill="#ff7518"/>
    <ellipse cx="0" cy="8" rx="40" ry="84" fill="#ff8a33"/>
    <polygon points="-52,-14 -26,-14 -39,-44" fill="#2a0f3f"/>
    <polygon points="26,-14 52,-14 39,-44" fill="#2a0f3f"/>
    <path d="M-62 30 L-44 52 L-28 36 L-12 56 L0 38 L12 56 L28 36 L44 52 L62 30 L56 70 Q0 96 -56 70 Z" fill="#2a0f3f"/>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#4a1a8a"/><stop offset=".55" stop-color="#27104a"/><stop offset="1" stop-color="#14082b"/>
    </linearGradient>
    <radialGradient id="moon" cx=".38" cy=".36" r=".7">
      <stop offset="0" stop-color="#fff6d0"/><stop offset=".62" stop-color="#ffd56b"/><stop offset="1" stop-color="#ffb23e"/>
    </radialGradient>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#ffd56b" stop-opacity=".45"/><stop offset="1" stop-color="#ffd56b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${stars}
  <circle cx="1010" cy="130" r="210" fill="url(#halo)"/>
  <circle cx="1010" cy="130" r="82" fill="url(#moon)"/>
  <circle cx="985" cy="108" r="14" fill="#f0c25a" opacity=".55"/>
  <circle cx="1040" cy="152" r="10" fill="#f0c25a" opacity=".5"/>
  ${bat(180, 110, 0.9)}
  ${bat(310, 190, 0.55)}
  ${bat(840, 70, 0.6)}
  <text x="${W / 2}" y="132" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="76" fill="#fff7ed">Halloween</text>
  <text x="${W / 2}" y="206" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="70" fill="#ff7518">WORDLE</text>
  ${tiles}
  ${pumpkin}
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile("public/assets/game-covers/halloween-wordle.webp");
console.log("wrote public/assets/game-covers/halloween-wordle.webp");
