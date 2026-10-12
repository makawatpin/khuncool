"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import styles from "./GiftExchange.module.css";

const C = 320;
const R = 230;
const RN = 268;
const MAX_NAME = 10;

function shorten(label: string): string {
  return label.length > MAX_NAME ? `${label.slice(0, MAX_NAME - 1)}…` : label;
}

function fontSizeFor(n: number): number {
  if (n <= 10) return 26;
  if (n <= 20) return 20;
  if (n <= 30) return 15;
  if (n <= 40) return 12;
  return 10;
}

type Props = { labels: string[]; onComplete: () => void; onRestart: () => void };

/** ชื่อทุกคนเรียงรอบวงตามลำดับโซ่ เส้นโค้งเชื่อมไล่ทีละคนจนครบวง */
export default function FinaleChain({ labels, onComplete, onRestart }: Props) {
  const n = labels.length;
  const step = Math.min(220, 3200 / n);
  const fontSize = fontSizeFor(n);
  const markerId = `arrow${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  });

  useEffect(() => {
    const t = window.setTimeout(() => completeRef.current(), n * step + 400);
    return () => window.clearTimeout(t);
  }, [n, step]);

  const pts = labels.map((_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return {
      a,
      x: C + R * Math.cos(a),
      y: C + R * Math.sin(a),
      nx: C + RN * Math.cos(a),
      ny: C + RN * Math.sin(a),
    };
  });

  const delay = (i: number) => ({ "--delay": `${Math.round(i * step)}ms` }) as CSSProperties;

  return (
    <div className={styles.finale}>
      <h2 className={styles.finaleTitle}>ครบวงแล้ว! 🎉</h2>
      <p className={styles.finaleSub}>ทั้งห้อง {n} คน ได้แลกของขวัญกันครบทุกคน</p>
      <svg
        className={styles.ring}
        viewBox="-80 -10 800 660"
        role="img"
        aria-label={`ลำดับการแลกของขวัญ: ${labels.join(" → ")} → ${labels[0]}`}
      >
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#fbbf24" />
          </marker>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
        {pts.map((p, i) => {
          const q = pts[(i + 1) % n];
          return (
            <path
              key={`l${i}`}
              className={styles.ringLink}
              d={`M ${p.x.toFixed(1)} ${p.y.toFixed(1)} A ${R} ${R} 0 0 1 ${q.x.toFixed(1)} ${q.y.toFixed(1)}`}
              pathLength={1}
              markerEnd={`url(#${markerId})`}
              style={delay(i)}
            />
          );
        })}
        {pts.map((p, i) => (
          <circle key={`d${i}`} className={styles.ringDot} cx={p.x} cy={p.y} r={7} style={delay(i)} />
        ))}
        {pts.map((p, i) => {
          const cos = Math.cos(p.a);
          const anchor = Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end";
          return (
            <text
              key={`t${i}`}
              className={styles.ringName}
              x={p.nx}
              y={p.ny}
              fontSize={fontSize}
              textAnchor={anchor}
              dominantBaseline="middle"
              style={delay(i)}
            >
              {shorten(labels[i])}
            </text>
          );
        })}
      </svg>
      <button type="button" className={styles.primaryBtn} onClick={onRestart}>
        เริ่มใหม่ (รายชื่อเดิม)
      </button>
    </div>
  );
}
