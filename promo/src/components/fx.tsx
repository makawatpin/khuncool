import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_LATIN } from "../theme";

// ── Beat sync ─────────────────────────────────────────────────────────────
/** Beat period in frames and the composition frame where the scene starts. */
export const BeatContext = createContext<{ periodFrames: number; sceneFrom: number }>({ periodFrames: 0, sceneFrom: 0 });

/**
 * 1 on each beat, decaying to 0 over ~`decay` frames. Scenes start on a beat,
 * so the grid is measured from the composition start (scene frame + sceneFrom).
 */
export function useBeat(decay = 7) {
  const f = useCurrentFrame();
  const { periodFrames, sceneFrom } = useContext(BeatContext);
  if (!periodFrames) return 0;
  const g = f + sceneFrom;
  const since = g - Math.floor(g / periodFrames + 1e-6) * periodFrames;
  return Math.exp(-since / (decay / 2.3));
}

// ── Kinetic helpers ───────────────────────────────────────────────────────
/** Shakes its children for `frames` after `at`. */
export const Shake: React.FC<{ at: number; frames?: number; amp?: number; children: React.ReactNode }> = ({ at, frames = 12, amp = 14, children }) => {
  const f = useCurrentFrame();
  const k = f >= at && f < at + frames ? (1 - (f - at) / frames) * amp : 0;
  const x = k * Math.sin(f * 2.7), y = k * Math.cos(f * 3.3) * 0.6, r = k * 0.08 * Math.sin(f * 1.9);
  return <div style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg)` }}>{children}</div>;
};

/** Highlighter bar that sweeps in behind a word, ink text on brand yellow. */
export const Marker: React.FC<{ children: React.ReactNode; delay?: number; color?: string; textColor?: string }> = ({
  children, delay = 0, color = C.sun, textColor = C.ink,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 18, stiffness: 160 } });
  const beat = useBeat();
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 14px", margin: "0 4px", color: p > 0.5 ? textColor : undefined, transform: `scale(${1 + beat * 0.035})` }}>
      <span
        style={{
          position: "absolute", left: 0, right: 0, top: "8%", bottom: "4%", background: color, borderRadius: 14, zIndex: -1,
          transform: `scaleX(${p}) skewX(-8deg)`, transformOrigin: "left center", boxShadow: "0 10px 24px rgba(10,12,40,0.25)",
        }}
      />
      {children}
    </span>
  );
};

/** Latin text whose letters drop in one after another with a bounce. */
export const LetterPop: React.FC<{ text: string; delay?: number; size: number; stagger?: number; color?: string }> = ({
  text, delay = 0, size, stagger = 2, color = C.white,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", justifyContent: "center", fontFamily: FONT_LATIN, fontWeight: 700, fontSize: size, color, textShadow: "0 8px 26px rgba(20,20,70,0.4)" }}>
      {[...text].map((ch, i) => {
        const p = spring({ frame: f - delay - i * stagger, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * -90}px) scale(${0.4 + p * 0.6}) rotate(${(1 - p) * (i % 2 ? 18 : -18)}deg)` }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/**
 * 3D entrance (swings in from a tilt) plus a gentle continuous float, so
 * footage cards never sit dead still.
 */
export const Tilt: React.FC<{ children: React.ReactNode; delay?: number; from?: "left" | "right" | "bottom"; style?: React.CSSProperties; float?: number }> = ({
  children, delay = 0, from = "bottom", style, float = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  const beat = useBeat(9);
  const ry = from === "left" ? -38 : from === "right" ? 38 : 0;
  const rx = from === "bottom" ? 34 : 0;
  const tx = from === "left" ? -700 : from === "right" ? 700 : 0;
  const ty = from === "bottom" ? 900 : 0;
  const fy = Math.sin(f / 22) * 3 * float, fx = Math.cos(f / 27) * 3 * float;
  return (
    <div style={{ perspective: 1800, ...style }}>
      <div
        style={{
          transform: `translate(${(1 - p) * tx}px, ${(1 - p) * ty}px) rotateX(${(1 - p) * rx + fy}deg) rotateY(${(1 - p) * ry + fx}deg) scale(${(0.8 + p * 0.2) * (1 + beat * 0.012)})`,
          opacity: Math.min(1, p * 1.6), transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ── Particles ─────────────────────────────────────────────────────────────
const CONFETTI = [C.sun, C.pink, "#7cf0d0", "#ffffff", "#8f8cff", "#ff9f43"];

/** Confetti burst from (x, y) at frame `at`: random spread, gravity, spin. */
export const Confetti: React.FC<{ at: number; x: number; y: number; count?: number; seed?: string; spread?: number; power?: number }> = ({
  at, x, y, count = 60, seed = "c", spread = Math.PI * 0.9, power = 38,
}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 70) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const a = -Math.PI / 2 + (random(`${seed}a${i}`) - 0.5) * spread * 2;
        const v = power * (0.45 + random(`${seed}v${i}`) * 0.75);
        const px = x + Math.cos(a) * v * f * 0.9 * Math.exp(-f / 40) * 1.6;
        const py = y + Math.sin(a) * v * f * Math.exp(-f / 40) * 1.4 + 0.55 * f * f;
        const rot = f * (random(`${seed}r${i}`) - 0.5) * 40;
        const w = 12 + random(`${seed}w${i}`) * 16;
        const round = random(`${seed}s${i}`) > 0.65;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: px, top: py, width: w, height: round ? w : w * 0.45, borderRadius: round ? "50%" : 3,
              background: CONFETTI[i % CONFETTI.length], transform: `rotate(${rot}deg) rotateX(${rot * 1.3}deg)`,
              opacity: interpolate(f, [50, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Expanding ring shockwave behind a logo hit. */
export const Shockwave: React.FC<{ at: number; x: number; y: number; color?: string }> = ({ at, x, y, color = "rgba(255,255,255,0.9)" }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 24) return null;
  const r = interpolate(f, [0, 24], [60, 720], { easing: (t) => 1 - (1 - t) ** 3 });
  return (
    <div
      style={{
        position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%",
        border: `${interpolate(f, [0, 24], [26, 2])}px solid ${color}`, opacity: interpolate(f, [0, 24], [0.9, 0]),
      }}
    />
  );
};

/** Little sparkle stars twinkling around a point. */
export const Sparkles: React.FC<{ x: number; y: number; w: number; h: number; at?: number; count?: number; seed?: string }> = ({
  x, y, w, h, at = 0, count = 8, seed = "s",
}) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const phase = random(`${seed}${i}`) * 40;
        const t = ((f + phase) % 40) / 40;
        const s = Math.sin(t * Math.PI);
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x + random(`${seed}x${i}`) * w, top: y + random(`${seed}y${i}`) * h,
              fontSize: 26 + random(`${seed}z${i}`) * 26, transform: `scale(${s}) rotate(${t * 90}deg)`, opacity: s, color: "#fff",
              textShadow: "0 0 18px rgba(255,255,255,0.9)",
            }}
          >
            ✦
          </div>
        );
      })}
    </>
  );
};

// ── Scene transitions (drawn over the cut, global frame) ──────────────────
export type TransitionKind = "wipe" | "flash" | "circle";

/**
 * Overlay that covers the cut at `at` (composition frame): it builds over the
 * last frames of the outgoing scene and clears over the first frames of the next.
 */
export const Transition: React.FC<{ at: number; kind: TransitionKind; half?: number }> = ({ at, kind, half = 7 }) => {
  const f = useCurrentFrame();
  const t = (f - (at - half)) / (half * 2); // 0 → 1 across the cut
  if (t < 0 || t > 1) return null;
  if (kind === "flash") {
    const o = t < 0.5 ? interpolate(t, [0.2, 0.5], [0, 1], { extrapolateLeft: "clamp" }) : interpolate(t, [0.5, 1], [1, 0]);
    return <AbsoluteFill style={{ background: "#fff", opacity: o }} />;
  }
  if (kind === "circle") {
    // Yellow disc grows to cover, then a hole opens from the centre.
    const grow = interpolate(t, [0, 0.5], [0, 1500], { extrapolateRight: "clamp", easing: (x) => x * x });
    const hole = interpolate(t, [0.5, 1], [0, 1500], { extrapolateLeft: "clamp", easing: (x) => 1 - (1 - x) ** 2 });
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute", left: 540 - grow, top: 960 - grow, width: grow * 2, height: grow * 2, borderRadius: "50%",
            background: `radial-gradient(circle, transparent ${hole}px, ${C.sun} ${hole + 1}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }
  // Diagonal stripes in three brand colours sweep across, offset in time.
  const stripes = [C.sun, C.pink, C.primary];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {stripes.map((color, i) => {
        const local = interpolate(t, [i * 0.08, 0.76 + i * 0.08], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = interpolate(local, [0, 1], [-2600, 2600], { easing: (v) => (v < 0.5 ? 2 * v * v : 1 - (-2 * v + 2) ** 2 / 2) });
        return (
          <div key={color} style={{ position: "absolute", top: -600, left: x, width: 1500, height: 3200, background: color, transform: "rotate(18deg)" }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Scene wrapper: punch-in zoom on entry so every cut lands with energy. */
export const Punch: React.FC<{ children: React.ReactNode; strength?: number }> = ({ children, strength = 0.12 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f, fps, config: { damping: 12, stiffness: 180 } });
  return <AbsoluteFill style={{ transform: `scale(${1 + (1 - p) * strength})` }}>{children}</AbsoluteFill>;
};
