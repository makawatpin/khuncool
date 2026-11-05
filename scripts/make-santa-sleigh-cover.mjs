// สร้างภาพปก Santa's Sleigh (1200×675 webp) จาก SVG ด้วย sharp
// รัน: node scripts/make-santa-sleigh-cover.mjs
// รูปทรงเลื่อน กวาง และบ้านคัดลอกมาจาก app/media/english/santa-sleigh/SantaArt.tsx
import sharp from "sharp";

const W = 1200;
const H = 675;

const reindeer = (x, y, rudolph) => `
  <g transform="translate(${x} ${y})">
    <rect x="82" y="58" width="7" height="32" rx="3.5" fill="#7a461d" transform="rotate(-22 85 60)"/>
    <rect x="38" y="58" width="7" height="32" rx="3.5" fill="#7a461d" transform="rotate(24 41 60)"/>
    <circle cx="25" cy="27" r="5" fill="#fff7ed"/>
    <ellipse cx="60" cy="52" rx="33" ry="18" fill="url(#deer)"/>
    <ellipse cx="62" cy="63" rx="22" ry="7" fill="#f6dfc0" opacity=".9"/>
    <path d="M80 44 Q92 30 94 22 L106 28 Q100 48 88 58 Z" fill="url(#deer)"/>
    <path d="M85 38 Q93 52 85 59" stroke="#dc2626" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="87" cy="60" r="4.2" fill="#fbbf24" stroke="#b45309"/>
    <rect x="70" y="58" width="7" height="32" rx="3.5" fill="#9a5a28" transform="rotate(26 73 60)"/>
    <rect x="48" y="58" width="7" height="32" rx="3.5" fill="#9a5a28" transform="rotate(-24 51 60)"/>
    <ellipse cx="100" cy="24" rx="14" ry="10.5" transform="rotate(-8 100 24)" fill="url(#deer)"/>
    <ellipse cx="112" cy="29" rx="8" ry="6" fill="#d39a64"/>
    <circle cx="105" cy="21" r="2.2" fill="#1c1c1c"/>
    <path d="M99 13 Q96 1 88 -1 M96 7 Q89 8 85 3 M103 12 Q108 2 116 2 M106 6 Q112 7 114 12" stroke="#e9c892" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${rudolph ? '<circle cx="118" cy="28" r="12" fill="#ff4d4d" opacity=".5"/>' : ""}
    <circle cx="118" cy="28" r="4.2" fill="${rudolph ? "#ef2b2b" : "#3b2416"}"/>
  </g>`;

const sleigh = `
  <g transform="translate(14 24) rotate(-3 100 60)">
    <path d="M12 44 Q0 10 28 6 Q54 8 46 44 Z" fill="#b6824b"/>
    <rect x="17" y="-4" width="12" height="12" rx="2" fill="#ef4444"/><rect x="31" y="-8" width="11" height="14" rx="2" fill="#22c55e"/>
    <ellipse cx="86" cy="54" rx="22" ry="26" fill="#dc2626"/>
    <rect x="64" y="58" width="44" height="6" fill="#1f2937"/><rect x="80" y="57" width="12" height="8" rx="1.5" fill="#fbbf24"/>
    <circle cx="88" cy="26" r="14" fill="#fcd5b0"/>
    <path d="M73 27 Q75 50 88 52 Q101 50 103 27 Q88 38 73 27 Z" fill="#fff"/>
    <ellipse cx="88" cy="31" rx="9" ry="4" fill="#fff"/><circle cx="93" cy="27" r="3.2" fill="#f4a58a"/>
    <circle cx="83" cy="22" r="1.8" fill="#1f2937"/><circle cx="94" cy="22" r="1.8" fill="#1f2937"/>
    <path d="M73 20 Q78 -4 100 -3 Q112 -2 112 20 Z" fill="#dc2626"/><rect x="71" y="16" width="43" height="9" rx="4.5" fill="#fff"/>
    <circle cx="100" cy="-6" r="6.5" fill="#fff"/>
    <path d="M100 46 Q116 48 126 60" stroke="#dc2626" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="127" cy="61" r="5.5" fill="#1f2937"/>
    <path d="M14 48 L22 84 Q24 96 40 96 L170 96 Q187 96 189 76 L194 44 Q150 60 100 60 Q56 60 14 48 Z" fill="url(#sleighRed)"/>
    <path d="M14 48 Q56 60 100 60 Q150 60 194 44" stroke="url(#gold)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="195" cy="42" r="7" fill="url(#gold)"/>
    <path d="M8 34 Q6 62 22 68 L42 68 L40 34 Q24 28 8 34 Z" fill="#b91c1c"/>
    <rect x="52" y="94" width="6" height="12" rx="2" fill="url(#gold)"/><rect x="132" y="94" width="6" height="12" rx="2" fill="url(#gold)"/>
    <path d="M6 106 Q6 112 22 112 L172 112 Q204 112 204 84 Q204 72 192 76" stroke="url(#gold)" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>`;

const house = `
  <g transform="translate(700 330) scale(2.1)">
    <ellipse cx="100" cy="164" rx="92" ry="9" fill="#dbe7ff" opacity=".9"/>
    <rect x="132" y="16" width="30" height="58" rx="2" fill="#9a3b2b"/>
    <path d="M128 18 Q132 8 147 10 Q162 8 166 18 Q150 24 128 18 Z" fill="#fff"/>
    <rect x="26" y="82" width="148" height="78" rx="4" fill="#f4d9a8"/>
    <polygon points="6,90 100,18 194,90" fill="#c2413a"/>
    <path d="M4 92 L100 14 L196 92 Q186 88 178 94 Q170 86 160 92 Q150 84 140 90 L100 30 L60 90 Q50 84 40 92 Q30 86 22 94 Q14 88 4 92 Z" fill="#fff"/>
    ${Array.from({ length: 14 }, (_, i) => {
      const side = i % 2;
      const t = (Math.floor(i / 2) + 0.5) / 7;
      const x = side ? 192 + (100 - 192) * t : 8 + (100 - 8) * t;
      const y = 88 + (24 - 88) * t;
      return `<circle cx="${x}" cy="${y}" r="3.6" fill="${["#ef4444", "#fde047", "#22c55e", "#60a5fa", "#f472b6"][i % 5]}"/>`;
    }).join("")}
    <rect x="86" y="112" width="28" height="48" rx="14" fill="#7a3f1d"/>
    <circle cx="100" cy="124" r="8" fill="none" stroke="#15803d" stroke-width="4"/>
    <rect x="40" y="98" width="34" height="32" rx="3" fill="#ffe9a3"/><rect x="126" y="98" width="34" height="32" rx="3" fill="#ffe9a3"/>
    <path d="M57 98 V130 M40 114 H74 M143 98 V130 M126 114 H160" stroke="#fff7ed" stroke-width="2.6"/>
  </g>`;

const pine = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="26" y="84" width="8" height="14" rx="2" fill="#6b4423"/>
    <polygon points="30,34 6,92 54,92" fill="#1f6b45"/><polygon points="30,18 10,66 50,66" fill="#2a8a57"/><polygon points="30,2 14,40 46,40" fill="#35a066"/>
    <path d="M30 2 L36 16 Q30 12 24 16 Z M30 18 L40 40 Q30 34 20 40 Z M30 34 L46 66 Q30 58 14 66 Z" fill="#fff"/>
  </g>`;

const stars = Array.from({ length: 70 }, (_, i) => {
  const x = (i * 211) % W;
  const y = (i * 97) % 330;
  return `<circle cx="${x}" cy="${y}" r="${1.2 + (i % 3) * 0.9}" fill="#fff" opacity="${0.35 + (i % 4) * 0.17}"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080c33"/><stop offset=".5" stop-color="#2a2278"/><stop offset="1" stop-color="#6a4aa6"/></linearGradient>
    <linearGradient id="deer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98240"/><stop offset="1" stop-color="#8f5321"/></linearGradient>
    <linearGradient id="sleighRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef4444"/><stop offset="1" stop-color="#a31414"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#d97706"/></linearGradient>
    <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#b4c8f2"/></linearGradient>
    <radialGradient id="moon" cx=".38" cy=".36" r=".7"><stop offset="0" stop-color="#fffbe0"/><stop offset=".62" stop-color="#ffe08a"/><stop offset="1" stop-color="#ffc24d"/></radialGradient>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe08a" stop-opacity=".45"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>
    <radialGradient id="aur" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4ade80" stop-opacity=".5"/><stop offset="1" stop-color="#4ade80" stop-opacity="0"/></radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <ellipse cx="320" cy="90" rx="380" ry="120" fill="url(#aur)" filter="url(#blur)"/>
  ${stars}
  <circle cx="1030" cy="130" r="230" fill="url(#halo)"/>
  <circle cx="1030" cy="130" r="86" fill="url(#moon)"/>
  <circle cx="1004" cy="108" r="14" fill="#d6a03c" opacity=".35"/><circle cx="1058" cy="154" r="10" fill="#d6a03c" opacity=".3"/>
  <path d="M0 470 Q160 360 340 440 T700 420 T1040 440 T1200 400 V675 H0 Z" fill="#4a56a8"/>
  <path d="M0 470 Q160 360 340 440 T700 420 T1040 440 T1200 400 V420 Q1100 450 1040 460 T700 440 T340 460 T0 490 Z" fill="#e8f0ff" opacity=".85"/>
  <path d="M0 520 Q300 480 600 520 T1200 500 V675 H0 Z" fill="url(#snow)"/>
  ${pine(24, 330, 1.7)}${pine(1100, 400, 2)}${pine(600, 400, 1.4)}
  ${house}
  <g transform="translate(40 110) scale(1.28)">
    ${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${-8 - i * 22} ${96 + (i % 3) * 12})" d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#fde68a" opacity="${1 - i * 0.18}"/>`).join("")}
    <g stroke="#7c2d12" stroke-width="1.8" fill="none" opacity=".75"><path d="M148 90 Q200 84 298 92"/><path d="M148 90 Q260 70 396 82"/><path d="M148 90 Q330 60 498 78"/></g>
    ${sleigh}
    ${reindeer(236, 34, false)}${reindeer(334, 24, false)}${reindeer(432, 30, true)}
  </g>
  <text x="50" y="${H - 44}" text-anchor="start" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="76" fill="#ffffff" stroke="#a4161a" stroke-width="10" paint-order="stroke">Santa's Sleigh</text>
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile("public/assets/game-covers/santa-sleigh.webp");
console.log("wrote public/assets/game-covers/santa-sleigh.webp");
