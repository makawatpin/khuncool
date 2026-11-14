"use client";

import { useId, type CSSProperties } from "react";
import styles from "./SupportStrip.module.css";

/** White cup on a saucer, with smoke that draws itself into a heart. Drawn
 *  for the indigo strip only (spec §9: one colourway, no colour prop).
 *  Gradient ids are prefixed per instance so two cups never share them. */
export default function CoffeeCup({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId().replace(/:/g, "");

  return (
    <svg className={className} style={style} viewBox="0 0 120 120" aria-hidden="true" focusable="false" overflow="visible">
      <defs>
        <linearGradient id={`${id}cup`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#f3f5fa" />
          <stop offset="1" stopColor="#dfe3ee" />
        </linearGradient>
        <linearGradient id={`${id}saucer`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d8dde9" />
        </linearGradient>
        <radialGradient id={`${id}coffee`} cx=".38" cy=".32" r=".82">
          <stop offset="0" stopColor="#70462f" />
          <stop offset="1" stopColor="#3a2116" />
        </radialGradient>
        <radialGradient id={`${id}shadow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#1b1c54" stopOpacity=".5" />
          <stop offset="1" stopColor="#1b1c54" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="105" rx="42" ry="9" fill={`url(#${id}shadow)`} />
      <g className={styles.cupBody}>
        <ellipse cx="60" cy="97" rx="41" ry="11" fill={`url(#${id}saucer)`} />
        <ellipse cx="60" cy="95" rx="35" ry="8.6" fill="#fff" />
        <path
          d="M92 67c10 0 13.5 14 1 17.5"
          stroke="#e9ecf3"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M28 62c0 21 13 32 32 32s32-11 32-32z"
          fill={`url(#${id}cup)`}
          stroke="#c3c8d6"
          strokeWidth="1.5"
        />
        <ellipse cx="60" cy="62" rx="32" ry="9" fill="#fff" stroke="#c3c8d6" strokeWidth="1.3" />
        <ellipse className={styles.brew} cx="60" cy="62.6" rx="26.5" ry="7" fill={`url(#${id}coffee)`} />
        <ellipse cx="44" cy="76" rx="5.2" ry="10.5" fill="#fff" opacity=".5" transform="rotate(-14 44 76)" />
      </g>
      <g className={styles.smokeHeart}>
        <path className={styles.shStem} d="M60 59c-2.6-4 2.6-7.4 0-12.4" />
        <path className={styles.shL} d="M60 46C60 46 38 32 38 20 38 12 46 8 52 12 56 14.5 58.5 18 60 21" />
        <path className={styles.shR} d="M60 46C60 46 82 32 82 20 82 12 74 8 68 12 64 14.5 61.5 18 60 21" />
      </g>
    </svg>
  );
}
