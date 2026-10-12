"use client";

import { useId, type CSSProperties } from "react";
import styles from "./GiftExchange.module.css";

export type GiftPalette = { box: string; boxDark: string; ribbon: string; ribbonDark: string };

export type GiftState = "idle" | "charging" | "burst" | "open";

const PALETTES: GiftPalette[] = [
  { box: "#ef4444", boxDark: "#991b1b", ribbon: "#fde68a", ribbonDark: "#d97706" },
  { box: "#22c55e", boxDark: "#166534", ribbon: "#fecaca", ribbonDark: "#dc2626" },
  { box: "#3b82f6", boxDark: "#1e3a8a", ribbon: "#f1f5f9", ribbonDark: "#94a3b8" },
  { box: "#a855f7", boxDark: "#581c87", ribbon: "#fbcfe8", ribbonDark: "#db2777" },
  { box: "#f97316", boxDark: "#9a3412", ribbon: "#fef3c7", ribbonDark: "#b45309" },
  { box: "#14b8a6", boxDark: "#115e59", ribbon: "#fde68a", ribbonDark: "#ca8a04" },
];

/** กล่องใบสุดท้าย */
export const GOLD: GiftPalette = { box: "#fbbf24", boxDark: "#b45309", ribbon: "#ef4444", ribbonDark: "#991b1b" };

export function paletteFor(index: number): GiftPalette {
  const n = PALETTES.length;
  return PALETTES[((index % n) + n) % n];
}

type Props = { palette: GiftPalette; state: GiftState; chargeMs: number };

/**
 * กล่องแยกชิ้นเพื่อให้ CSS ขยับแต่ละส่วนได้เอง: ชั้น float (ลอยตอนรอ),
 * shake (สั่นแรงขึ้นตอนลุ้น), jitter (สั่นถี่), ฝา+โบว์ (พุ่งออกตอนระเบิด),
 * ริบบิ้นตัวกล่อง (ขาดหลุด), แสงรั่วตามรอยต่อ และแสงข้างในกล่อง
 */
export default function GiftBox({ palette, state, chargeMs }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <svg
      viewBox="0 0 240 240"
      className={styles.gift}
      data-state={state}
      style={{ "--charge-ms": `${chargeMs}ms` } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.box} />
          <stop offset="1" stopColor={palette.boxDark} />
        </linearGradient>
        <linearGradient id={id("rib")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.ribbonDark} />
          <stop offset=".5" stopColor={palette.ribbon} />
          <stop offset="1" stopColor={palette.ribbonDark} />
        </linearGradient>
        <radialGradient id={id("glow")}>
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset=".5" stopColor="#fde68a" stopOpacity=".8" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <rect x="40" y="104" width="160" height="108" rx="10" />
        </clipPath>
        <filter id={id("blur")} x="-50%" y="-300%" width="200%" height="700%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="120" cy="224" rx="84" ry="9" fill="#000" opacity=".3" />

      <g className={styles.giftFloat}>
        <g className={styles.giftShake}>
          <g className={styles.giftJitter}>
            <ellipse className={styles.innerGlow} cx="120" cy="104" rx="86" ry="26" fill={url("glow")} />
            <rect x="40" y="104" width="160" height="108" rx="10" fill={url("body")} />
            <rect x="40" y="104" width="160" height="14" fill="#000" opacity=".16" />
            <g className={styles.bodyRibbon}>
              <rect x="108" y="104" width="24" height="108" fill={url("rib")} />
            </g>
            <g clipPath={url("clip")}>
              <rect className={styles.sheen} x="40" y="96" width="44" height="130" fill={url("sheen")} />
            </g>
            <rect className={styles.leak} x="34" y="98" width="172" height="12" rx="6" fill="#fde68a" filter={url("blur")} />

            <g className={styles.lid}>
              <rect x="30" y="80" width="180" height="30" rx="8" fill={url("body")} />
              <rect x="30" y="80" width="180" height="8" rx="4" fill="#fff" opacity=".22" />
              <rect x="106" y="80" width="28" height="30" fill={url("rib")} />
              <path d="M120 78 C 98 40, 58 44, 70 70 C 77 86, 104 82, 120 78 Z" fill={palette.ribbon} stroke={palette.ribbonDark} strokeWidth="3" />
              <path d="M120 78 C 142 40, 182 44, 170 70 C 163 86, 136 82, 120 78 Z" fill={palette.ribbon} stroke={palette.ribbonDark} strokeWidth="3" />
              <path d="M84 66 C 92 58, 104 62, 112 72" fill="none" stroke={palette.ribbonDark} strokeWidth="2.5" opacity=".6" />
              <path d="M156 66 C 148 58, 136 62, 128 72" fill="none" stroke={palette.ribbonDark} strokeWidth="2.5" opacity=".6" />
              <rect x="109" y="66" width="22" height="22" rx="7" fill={palette.ribbon} stroke={palette.ribbonDark} strokeWidth="3" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
