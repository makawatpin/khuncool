// Hand-drawn SVG art for Santa's Sleigh. Everything is vector so it stays crisp
// on a projector and on a phone, and every moving part is a class that
// SantaSleighApp.module.css animates — nothing here holds state.

import styles from "./SantaSleighApp.module.css";

/* ---------- reindeer (faces right, drawn in a 120 x 100 box) ---------- */
function Reindeer({ x, y, rudolph = false, phase = 0 }: { x: number; y: number; rudolph?: boolean; phase?: number }) {
  const delay = { animationDelay: `${-phase}s` };
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={styles.deerBob} style={delay}>
        {/* far legs first so the body overlaps them */}
        <g className={`${styles.leg} ${styles.legB}`} style={delay}>
          <rect x="82" y="58" width="7" height="32" rx="3.5" fill="#7a461d" />
          <rect x="81" y="86" width="9" height="6" rx="3" fill="#2a1a10" />
        </g>
        <g className={`${styles.leg} ${styles.legA}`} style={delay}>
          <rect x="38" y="58" width="7" height="32" rx="3.5" fill="#7a461d" />
          <rect x="37" y="86" width="9" height="6" rx="3" fill="#2a1a10" />
        </g>
        <path d="M30 40 Q22 36 26 28" stroke="#b97433" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="25" cy="27" r="5" fill="#fff7ed" />
        <ellipse cx="60" cy="52" rx="33" ry="18" fill="url(#deerBody)" />
        <ellipse cx="62" cy="63" rx="22" ry="7" fill="#f6dfc0" opacity=".9" />
        <path d="M80 44 Q92 30 94 22 L106 28 Q100 48 88 58 Z" fill="url(#deerBody)" />
        <path d="M85 38 Q93 52 85 59" stroke="#dc2626" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="87" cy="60" r="4.2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        <g className={`${styles.leg} ${styles.legA}`} style={delay}>
          <rect x="70" y="58" width="7" height="32" rx="3.5" fill="#9a5a28" />
          <rect x="69" y="86" width="9" height="6" rx="3" fill="#2a1a10" />
        </g>
        <g className={`${styles.leg} ${styles.legB}`} style={delay}>
          <rect x="48" y="58" width="7" height="32" rx="3.5" fill="#9a5a28" />
          <rect x="47" y="86" width="9" height="6" rx="3" fill="#2a1a10" />
        </g>
        <ellipse cx="100" cy="24" rx="14" ry="10.5" transform="rotate(-8 100 24)" fill="url(#deerBody)" />
        <ellipse cx="112" cy="29" rx="8" ry="6" fill="#d39a64" />
        <ellipse cx="94" cy="14" rx="3.2" ry="7" transform="rotate(-25 94 14)" fill="#9a5a28" />
        <circle cx="105" cy="21" r="2.2" fill="#1c1c1c" />
        <circle cx="105.7" cy="20.3" r=".8" fill="#fff" />
        <path
          d="M99 13 Q96 1 88 -1 M96 7 Q89 8 85 3 M103 12 Q108 2 116 2 M106 6 Q112 7 114 12"
          stroke="#e9c892"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {rudolph && <circle className={styles.noseGlow} cx="118" cy="28" r="9" fill="#ff4d4d" />}
        <circle cx="118" cy="28" r="4.2" fill={rudolph ? "#ef2b2b" : "#3b2416"} />
      </g>
    </g>
  );
}

/* ---------- sleigh with Santa and his sack (200 x 110 box) ---------- */
function Sleigh({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={styles.sleighRock}>
        {/* sack of gifts at the back */}
        <path d="M12 44 Q0 10 28 6 Q54 8 46 44 Z" fill="#b6824b" />
        <path d="M22 8 Q30 14 40 8" stroke="#7a5128" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="17" y="-4" width="12" height="12" rx="2" fill="#ef4444" />
        <rect x="16" y="-1" width="14" height="3" fill="#fde68a" />
        <rect x="31" y="-8" width="11" height="14" rx="2" fill="#22c55e" />
        <path d="M36.5 -8 V6" stroke="#fecaca" strokeWidth="3" />
        {/* Santa */}
        <ellipse cx="86" cy="54" rx="22" ry="26" fill="#dc2626" />
        <rect x="64" y="58" width="44" height="6" fill="#1f2937" />
        <rect x="80" y="57" width="12" height="8" rx="1.5" fill="#fbbf24" />
        <circle cx="88" cy="26" r="14" fill="#fcd5b0" />
        <path d="M73 27 Q75 50 88 52 Q101 50 103 27 Q88 38 73 27 Z" fill="#fff" />
        <ellipse cx="88" cy="31" rx="9" ry="4" fill="#fff" />
        <circle cx="93" cy="27" r="3.2" fill="#f4a58a" />
        <circle cx="83" cy="22" r="1.8" fill="#1f2937" />
        <circle cx="94" cy="22" r="1.8" fill="#1f2937" />
        <path d="M73 20 Q78 -4 100 -3 Q112 -2 112 20 Z" fill="#dc2626" />
        <rect x="71" y="16" width="43" height="9" rx="4.5" fill="#fff" />
        <circle cx="100" cy="-6" r="6.5" fill="#fff" />
        <path d="M100 46 Q116 48 126 60" stroke="#dc2626" strokeWidth="9" fill="none" strokeLinecap="round" />
        <circle cx="127" cy="61" r="5.5" fill="#1f2937" />
        {/* body of the sleigh */}
        <path d="M14 48 L22 84 Q24 96 40 96 L170 96 Q187 96 189 76 L194 44 Q150 60 100 60 Q56 60 14 48 Z" fill="url(#sleighRed)" />
        <path d="M14 48 Q56 60 100 60 Q150 60 194 44" stroke="url(#gold)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M34 80 Q100 90 176 78" stroke="url(#gold)" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".85" />
        <circle cx="195" cy="42" r="7" fill="url(#gold)" />
        <path d="M8 34 Q6 62 22 68 L42 68 L40 34 Q24 28 8 34 Z" fill="#b91c1c" />
        {/* runners */}
        <rect x="52" y="94" width="6" height="12" rx="2" fill="url(#gold)" />
        <rect x="132" y="94" width="6" height="12" rx="2" fill="url(#gold)" />
        <path d="M6 106 Q6 112 22 112 L172 112 Q204 112 204 84 Q204 72 192 76" stroke="url(#gold)" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function TrailStar({ x, y, i }: { x: number; y: number; i: number }) {
  // The wrapper carries the position; the path carries the animation, because a
  // CSS transform on one element would replace its SVG transform attribute.
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        className={styles.trailStar}
        style={{ animationDelay: `${-i * 0.26}s` }}
        d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"
        fill="#fde68a"
      />
    </g>
  );
}

/** Santa, his sleigh and three reindeer — Rudolph out front. */
export function SleighTeam() {
  return (
    <svg className={styles.team} viewBox="0 0 660 140" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="deerBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98240" />
          <stop offset="1" stopColor="#8f5321" />
        </linearGradient>
        <linearGradient id="sleighRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#a31414" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <TrailStar key={i} x={-14 - i * 24} y={86 + (i % 3) * 12 - 8} i={i} />
      ))}
      <g stroke="#7c2d12" strokeWidth="1.8" fill="none" opacity=".75">
        <path d="M148 90 Q200 84 298 92" />
        <path d="M148 90 Q260 70 396 82" />
        <path d="M148 90 Q330 60 498 78" />
      </g>
      <Sleigh x={14} y={24} />
      <Reindeer x={236} y={34} phase={0.1} />
      <Reindeer x={334} y={24} phase={0.35} />
      <Reindeer x={432} y={30} rudolph phase={0.6} />
    </svg>
  );
}

/* ---------- house (200 x 170 box) ---------- */
const BULB_COLORS = ["#ef4444", "#fde047", "#22c55e", "#60a5fa", "#f472b6"];

export function House({ wall, roof, lit }: { wall: string; roof: string; lit: boolean }) {
  const bulbs: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7;
    bulbs.push({ x: 8 + (100 - 8) * t, y: 88 + (24 - 88) * t });
    bulbs.push({ x: 192 + (100 - 192) * t, y: 88 + (24 - 88) * t });
  }
  return (
    <svg className={`${styles.houseSvg} ${lit ? styles.houseLit : ""}`} viewBox="0 0 200 170" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="164" rx="92" ry="9" fill="#dbe7ff" opacity=".9" />
      {/* chimney */}
      <rect x="132" y="16" width="30" height="58" rx="2" fill="#9a3b2b" />
      <path d="M132 34 H162 M132 50 H162 M147 16 V34 M139 34 V50 M155 34 V50 M147 50 V66" stroke="#6b2418" strokeWidth="1.6" />
      <path d="M128 18 Q132 8 147 10 Q162 8 166 18 Q150 24 128 18 Z" fill="#fff" />
      {/* walls */}
      <rect x="26" y="82" width="148" height="78" rx="4" fill={wall} />
      <rect x="26" y="150" width="148" height="10" fill="#000" opacity=".12" />
      {/* roof */}
      <polygon points="6,90 100,18 194,90" fill={roof} />
      <polygon points="6,90 100,18 194,90 184,90 100,28 16,90" fill="#000" opacity=".12" />
      <path
        d="M4 92 L100 14 L196 92 Q186 88 178 94 Q170 86 160 92 Q150 84 140 90 L100 30 L60 90 Q50 84 40 92 Q30 86 22 94 Q14 88 4 92 Z"
        fill="#fff"
      />
      {bulbs.map((b, i) => (
        <circle
          key={i}
          className={styles.bulb}
          style={{ animationDelay: `${-(i * 0.23).toFixed(2)}s` }}
          cx={b.x}
          cy={b.y}
          r="3.4"
          fill={BULB_COLORS[i % BULB_COLORS.length]}
        />
      ))}
      {/* door + wreath */}
      <rect x="86" y="112" width="28" height="48" rx="14" ry="14" fill="#7a3f1d" />
      <circle cx="100" cy="124" r="8" fill="none" stroke="#15803d" strokeWidth="4" />
      <circle cx="100" cy="132" r="2.4" fill="#ef4444" />
      <circle cx="106" cy="148" r="1.8" fill="#fbbf24" />
      {/* windows */}
      <g className={`${styles.win} ${lit ? styles.winOn : ""}`}>
        <rect x="40" y="98" width="34" height="32" rx="3" />
        <rect x="126" y="98" width="34" height="32" rx="3" />
      </g>
      <path d="M57 98 V130 M40 114 H74 M143 98 V130 M126 114 H160" stroke="#fff7ed" strokeWidth="2.6" opacity=".9" />
      <rect x="37" y="130" width="40" height="5" rx="2" fill="#fff" />
      <rect x="123" y="130" width="40" height="5" rx="2" fill="#fff" />
    </svg>
  );
}

/* ---------- decor ---------- */
export function Pine({ lights = false }: { lights?: boolean }) {
  return (
    <svg className={styles.pineSvg} viewBox="0 0 60 100" aria-hidden="true" focusable="false">
      <rect x="26" y="84" width="8" height="14" rx="2" fill="#6b4423" />
      <polygon points="30,34 6,92 54,92" fill="#1f6b45" />
      <polygon points="30,18 10,66 50,66" fill="#2a8a57" />
      <polygon points="30,2 14,40 46,40" fill="#35a066" />
      <path d="M30 2 L36 16 Q30 12 24 16 Z M30 18 L40 40 Q30 34 20 40 Z M30 34 L46 66 Q30 58 14 66 Z" fill="#fff" opacity=".95" />
      {lights && (
        <>
          <circle cx="24" cy="50" r="2.4" fill="#fde047" />
          <circle cx="38" cy="62" r="2.4" fill="#f472b6" />
          <circle cx="22" cy="78" r="2.4" fill="#60a5fa" />
          <circle cx="40" cy="82" r="2.4" fill="#fde047" />
        </>
      )}
    </svg>
  );
}

export function Snowman() {
  return (
    <svg className={styles.snowmanSvg} viewBox="0 0 60 80" aria-hidden="true" focusable="false">
      <circle cx="30" cy="58" r="20" fill="#fff" />
      <circle cx="30" cy="32" r="14" fill="#fff" />
      <rect x="19" y="14" width="22" height="4" rx="2" fill="#1f2937" />
      <rect x="23" y="2" width="14" height="14" rx="2" fill="#1f2937" />
      <circle cx="25" cy="30" r="1.8" fill="#1f2937" />
      <circle cx="35" cy="30" r="1.8" fill="#1f2937" />
      <path d="M30 34 L42 37 L30 38 Z" fill="#f97316" />
      <path d="M17 44 Q30 52 43 44 L44 50 Q30 58 16 50 Z" fill="#dc2626" />
      <circle cx="30" cy="62" r="2" fill="#1f2937" />
      <circle cx="30" cy="70" r="2" fill="#1f2937" />
    </svg>
  );
}

export function Hills({ tone }: { tone: "far" | "mid" }) {
  const far = tone === "far";
  return (
    <svg className={far ? styles.hillsFar : styles.hillsMid} viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`hill-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={far ? "#4a4fa8" : "#6f7bc9"} />
          <stop offset="1" stopColor={far ? "#2a2a72" : "#4a5aa8"} />
        </linearGradient>
      </defs>
      <path
        d={
          far
            ? "M0 200 V120 Q90 40 210 100 T420 90 T640 110 T860 70 T1060 100 T1200 80 V200 Z"
            : "M0 200 V130 Q120 70 260 120 T520 110 T780 126 T1000 96 T1200 118 V200 Z"
        }
        fill={`url(#hill-${tone})`}
      />
      <path
        d={
          far
            ? "M0 120 Q90 40 210 100 T420 90 T640 110 T860 70 T1060 100 T1200 80 V92 Q1130 90 1060 112 T860 82 T640 122 T420 102 T210 112 T0 132 Z"
            : "M0 130 Q120 70 260 120 T520 110 T780 126 T1000 96 T1200 118 V130 Q1100 128 1000 108 T780 138 T520 122 T260 132 T0 142 Z"
        }
        fill="#e8f0ff"
        opacity={far ? 0.7 : 0.85}
      />
    </svg>
  );
}

/* ---------- gift box (100 x 90) ---------- */
export function GiftBox({ color, ribbon }: { color: string; ribbon: string }) {
  return (
    <svg className={styles.giftSvg} viewBox="0 0 100 92" aria-hidden="true" focusable="false">
      <ellipse cx="50" cy="88" rx="38" ry="4" fill="#000" opacity=".22" />
      <rect x="8" y="34" width="84" height="52" rx="7" fill={color} />
      <rect x="8" y="34" width="84" height="12" fill="#000" opacity=".14" />
      <rect x="43" y="34" width="14" height="52" fill={ribbon} />
      <rect x="4" y="22" width="92" height="19" rx="6" fill={color} />
      <rect x="4" y="22" width="92" height="6" rx="3" fill="#fff" opacity=".3" />
      <rect x="43" y="22" width="14" height="19" fill={ribbon} />
      <path d="M50 22 C 30 -4, 8 6, 26 18 C 34 24, 46 22, 50 22 Z" fill={ribbon} stroke="#000" strokeOpacity=".15" strokeWidth="1.5" />
      <path d="M50 22 C 70 -4, 92 6, 74 18 C 66 24, 54 22, 50 22 Z" fill={ribbon} stroke="#000" strokeOpacity=".15" strokeWidth="1.5" />
      <circle cx="50" cy="21" r="6" fill={ribbon} stroke="#000" strokeOpacity=".15" strokeWidth="1.5" />
    </svg>
  );
}
