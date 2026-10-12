// สร้างภาพปก /gift-exchange (960×540 webp) จาก SVG ด้วย sharp
// รัน: node scripts/make-gift-exchange-cover.mjs
import sharp from "sharp";

const W = 960;
const H = 540;

function gift({ x, y, s, box, dark, ribbon, ribbonDark, lidLift = 0, tilt = 0 }) {
  return `
  <g transform="translate(${x} ${y}) rotate(${tilt}) scale(${s})">
    <ellipse cx="0" cy="118" rx="88" ry="10" fill="#4c1d95" opacity=".14"/>
    <rect x="-80" y="0" width="160" height="112" rx="12" fill="url(#g_${box.slice(1)})"/>
    <rect x="-80" y="0" width="160" height="14" fill="#000" opacity=".14"/>
    <rect x="-12" y="0" width="24" height="112" fill="${ribbon}"/>
    <rect x="-12" y="0" width="7" height="112" fill="${ribbonDark}" opacity=".35"/>
    <rect x="-70" y="10" width="26" height="92" rx="10" fill="#fff" opacity=".18"/>
    <g transform="translate(0 ${-lidLift}) rotate(${lidLift ? -8 : 0})">
      <rect x="-90" y="-26" width="180" height="32" rx="9" fill="${box}"/>
      <rect x="-90" y="-26" width="180" height="9" rx="4" fill="#fff" opacity=".28"/>
      <rect x="-14" y="-26" width="28" height="32" fill="${ribbon}"/>
      <path d="M0 -28 C -22 -66, -62 -62, -50 -36 C -43 -20, -16 -24, 0 -28 Z" fill="${ribbon}" stroke="${ribbonDark}" stroke-width="3"/>
      <path d="M0 -28 C 22 -66, 62 -62, 50 -36 C 43 -20, 16 -24, 0 -28 Z" fill="${ribbon}" stroke="${ribbonDark}" stroke-width="3"/>
      <rect x="-11" y="-40" width="22" height="22" rx="7" fill="${ribbon}" stroke="${ribbonDark}" stroke-width="3"/>
    </g>
  </g>`;
}

function star(x, y, r, color, rot = 0) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${color}" stroke="#fff" stroke-width="3" stroke-linejoin="round" transform="rotate(${rot} ${x} ${y})"/>`;
}

const boxColors = [
  ["#ef4444", "#b91c1c"],
  ["#22c55e", "#15803d"],
  ["#3b82f6", "#1d4ed8"],
];

const confetti = Array.from({ length: 34 }, (_, i) => {
  const x = (i * 197) % W;
  const y = 30 + ((i * 113) % 470);
  const c = ["#fbbf24", "#f97316", "#22c55e", "#3b82f6", "#ec4899", "#a78bfa"][i % 6];
  return `<rect x="${x}" y="${y}" width="14" height="7" rx="2" fill="${c}" opacity=".85" transform="rotate(${(i * 47) % 180} ${x} ${y})"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff1e6"/><stop offset="1" stop-color="#fde2ef"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".55" r=".5">
      <stop offset="0" stop-color="#fff7d6"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/>
    </radialGradient>
    ${boxColors
      .map(
        ([c, d]) => `<linearGradient id="g_${c.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient>`,
      )
      .join("")}
    <linearGradient id="g_fbbf24" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#d97706"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity=".5">${Array.from({ length: 16 }, (_, i) => `<path d="M480 300 L${480 + 900 * Math.cos((i / 16) * Math.PI * 2)} ${300 + 900 * Math.sin((i / 16) * Math.PI * 2)} L${480 + 900 * Math.cos(((i + 0.45) / 16) * Math.PI * 2)} ${300 + 900 * Math.sin(((i + 0.45) / 16) * Math.PI * 2)} Z" fill="#fff"/>`).join("")}</g>
  <circle cx="480" cy="300" r="300" fill="url(#glow)"/>
  ${confetti}
  <path d="M 230 400 C 300 520, 660 520, 730 400" fill="none" stroke="#a78bfa" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>
  <path d="M 730 230 C 660 110, 300 110, 230 230" fill="none" stroke="#a78bfa" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>
  <polygon points="728,404 744,384 716,384" fill="#a78bfa"/>
  <polygon points="232,226 216,246 244,246" fill="#a78bfa"/>
  ${gift({ x: 205, y: 300, s: 0.78, box: "#22c55e", dark: "#15803d", ribbon: "#fecaca", ribbonDark: "#dc2626", tilt: -8 })}
  ${gift({ x: 755, y: 300, s: 0.78, box: "#3b82f6", dark: "#1d4ed8", ribbon: "#f1f5f9", ribbonDark: "#94a3b8", tilt: 8 })}
  ${gift({ x: 480, y: 250, s: 1.45, box: "#ef4444", dark: "#b91c1c", ribbon: "#fde68a", ribbonDark: "#d97706", lidLift: 30 })}
  <ellipse cx="480" cy="236" rx="96" ry="16" fill="#fffbe0" opacity=".7"/>
  ${star(480, 120, 34, "#fbbf24", 0)}
  ${star(370, 160, 18, "#f472b6", -15)}
  ${star(600, 150, 22, "#38bdf8", 12)}
  ${star(110, 120, 20, "#fbbf24", 10)}
  ${star(860, 110, 24, "#fbbf24", -8)}
  ${star(880, 440, 16, "#a78bfa", 20)}
  ${star(80, 450, 18, "#34d399", -12)}
</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile("public/assets/tool-covers/gift-exchange.webp");
console.log("wrote public/assets/tool-covers/gift-exchange.webp");
