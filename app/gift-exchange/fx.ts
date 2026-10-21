// เอฟเฟกต์อนุภาคแบบ DOM + Web Animations (แนวเดียวกับคอนเฟตตีใน mystery-board)
// host ต้องเป็นเลเยอร์ position:absolute; overflow:hidden; pointer-events:none

const COLORS = ["#fbbf24", "#f97316", "#ef4444", "#22c55e", "#38bdf8", "#a78bfa", "#ffffff"];

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function track(el: HTMLElement, anim: Animation) {
  anim.onfinish = () => el.remove();
  anim.oncancel = () => el.remove();
}

/** คอนเฟตตียิงจากมุมล่างซ้าย-ขวาพร้อมกัน พุ่งขึ้นแล้วร่วง */
export function sideCannons(host: HTMLElement | null, pieces = 70): void {
  if (!host || reducedMotion()) return;
  const w = host.clientWidth;
  const h = host.clientHeight;
  for (let i = 0; i < pieces; i++) {
    const fromLeft = i % 2 === 0;
    const bit = document.createElement("span");
    const size = 7 + Math.random() * 8;
    bit.style.cssText = `position:absolute;bottom:-12px;${fromLeft ? "left" : "right"}:-12px;width:${size.toFixed(1)}px;height:${(size * 0.55).toFixed(1)}px;background:${COLORS[i % COLORS.length]};border-radius:2px`;
    host.appendChild(bit);
    const dx = (0.25 + Math.random() * 0.5) * w * (fromLeft ? 1 : -1);
    const peak = -(0.55 + Math.random() * 0.4) * h;
    const anim = bit.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${(dx * 0.6).toFixed(0)}px,${peak.toFixed(0)}px) rotate(${(Math.random() * 360).toFixed(0)}deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${dx.toFixed(0)}px,${(peak * 0.15).toFixed(0)}px) rotate(${(Math.random() * 900).toFixed(0)}deg)`,
          opacity: 0,
        },
      ],
      { duration: 1700 + Math.random() * 1100, easing: "cubic-bezier(.15,.7,.4,1)" },
    );
    track(bit, anim);
  }
}

/** ดอกไม้ไฟหลายลูกทยอยแตกทั่วครึ่งบนของจอ */
export function fireworks(host: HTMLElement | null, bursts = 6): void {
  if (!host || reducedMotion()) return;
  const w = host.clientWidth;
  const h = host.clientHeight;
  for (let b = 0; b < bursts; b++) {
    const cx = w * (0.15 + Math.random() * 0.7);
    const cy = h * (0.12 + Math.random() * 0.45);
    const color = COLORS[b % COLORS.length];
    const delay = b * 380 + Math.random() * 200;
    const sparks = 28;
    for (let i = 0; i < sparks; i++) {
      const angle = (i / sparks) * Math.PI * 2;
      const dist = 70 + Math.random() * 90;
      const dot = document.createElement("span");
      dot.style.cssText = `position:absolute;left:${cx.toFixed(0)}px;top:${cy.toFixed(0)}px;width:6px;height:6px;margin:-3px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};opacity:0`;
      host.appendChild(dot);
      const anim = dot.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          {
            transform: `translate(${(Math.cos(angle) * dist).toFixed(0)}px,${(Math.sin(angle) * dist + 30).toFixed(0)}px) scale(.3)`,
            opacity: 0,
          },
        ],
        { duration: 1300, delay, easing: "cubic-bezier(.1,.8,.3,1)" },
      );
      track(dot, anim);
    }
  }
}

export function clearFx(host: HTMLElement | null): void {
  host?.replaceChildren();
}
