import React from "react";
import {
  AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { C, FONT, FONT_LATIN, GRADIENT } from "../theme";
import { useBeat } from "./fx";

/** 0→1 spring that starts at `delay` frames. */
export function usePop(delay = 0, damping = 13, stiffness = 170) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.7 } });
}

/** Brand gradient with slow-drifting soft light blobs and a faint dot grid. */
export const Background: React.FC<{ tint?: string }> = ({ tint }) => {
  const f = useCurrentFrame();
  const beat = useBeat(10);
  const blob = (x: number, y: number, r: number, color: string, speed: number, phase: number) => (
    <div
      style={{
        position: "absolute", width: r, height: r, borderRadius: "50%", background: color, filter: "blur(90px)", opacity: 0.55,
        left: x + Math.sin(f * speed + phase) * 70, top: y + Math.cos(f * speed * 0.8 + phase) * 90,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: tint ?? GRADIENT, overflow: "hidden" }}>
      {blob(-200, 150, 700, "#8f8cff", 0.018, 0)}
      {blob(560, 1150, 760, "#2fe0b9", 0.015, 2)}
      {blob(420, -200, 520, "#ffd36b", 0.02, 4)}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,${0.14 + beat * 0.14}) 2.2px, transparent 2.4px)`,
          backgroundSize: "44px 44px",
          transform: `translateY(${(f * 0.6) % 44}px)`,
        }}
      />
      {/* Soft light that breathes on every beat */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.22), transparent 60%)", opacity: beat * 0.6 }} />
    </AbsoluteFill>
  );
};

type FootageProps = {
  name: string;
  /** seconds into the clip to start from */
  start?: number;
  zoom?: [number, number];
  /** transform origin in % of the frame, the point the zoom moves toward */
  focus?: [number, number];
  /** frames the zoom takes */
  zoomFrames?: number;
  fit?: "cover" | "contain";
  /** CSS object-position: which part of the frame survives a cover crop */
  position?: string;
};

/** A recorded shot from public/footage, with an optional slow push-in. */
export const Footage: React.FC<FootageProps> = ({ name, start = 0, zoom = [1, 1], focus = [50, 50], zoomFrames = 150, fit = "cover", position = "50% 50%" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = interpolate(f, [0, zoomFrames], zoom, { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.ink }}>
      <OffthreadVideo
        src={staticFile(`footage/${name}.mp4`)}
        trimBefore={Math.round(start * fps)}
        muted
        style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: position, transform: `scale(${s})`, transformOrigin: `${focus[0]}% ${focus[1]}%` }}
      />
    </AbsoluteFill>
  );
};

/** Laptop: dark bezel around a 16:9 screen, with a thin base below. */
export const Laptop: React.FC<{ width: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width, children, style }) => {
  const bezel = Math.round(width * 0.022);
  const screenW = width - bezel * 2;
  const screenH = Math.round((screenW * 9) / 16);
  return (
    <div style={{ width, ...style }}>
      <div
        style={{
          background: "#14161d", borderRadius: bezel * 1.6, padding: bezel, paddingBottom: bezel * 1.4,
          boxShadow: "0 40px 80px rgba(10,12,40,0.45), inset 0 0 0 2px #2a2e3a",
        }}
      >
        <div style={{ position: "relative", width: screenW, height: screenH, borderRadius: bezel * 0.6, overflow: "hidden" }}>{children}</div>
      </div>
      <div
        style={{
          height: Math.round(width * 0.03), margin: "0 -4%", borderRadius: `0 0 ${width * 0.04}px ${width * 0.04}px`,
          background: "linear-gradient(#d9dce5, #a7acba)", boxShadow: "0 18px 30px rgba(10,12,40,0.35)",
        }}
      />
    </div>
  );
};

/** Phone: rounded frame around a 390x844 screen with a dynamic-island pill. */
export const Phone: React.FC<{ width: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width, children, style }) => {
  const bezel = Math.round(width * 0.04);
  const screenW = width - bezel * 2;
  const screenH = Math.round((screenW * 844) / 390);
  return (
    <div
      style={{
        width, padding: bezel, background: "#14161d", borderRadius: width * 0.16,
        boxShadow: "0 40px 80px rgba(10,12,40,0.5), inset 0 0 0 3px #2f3340", ...style,
      }}
    >
      <div style={{ position: "relative", width: screenW, height: screenH, borderRadius: width * 0.12, overflow: "hidden" }}>
        {children}
        <div
          style={{
            position: "absolute", top: screenW * 0.03, left: "50%", transform: "translateX(-50%)",
            width: screenW * 0.3, height: screenW * 0.085, borderRadius: 999, background: "#000",
          }}
        />
      </div>
    </div>
  );
};

/** Rounded card with a soft shadow; footage goes inside. */
export const Card: React.FC<{ w: number; h: number; children: React.ReactNode; style?: React.CSSProperties; radius?: number }> = ({ w, h, children, style, radius = 36 }) => (
  <div
    style={{
      position: "relative", width: w, height: h, borderRadius: radius, overflow: "hidden",
      boxShadow: "0 36px 70px rgba(10,12,40,0.42), 0 0 0 6px rgba(255,255,255,0.9)", ...style,
    }}
  >
    {children}
  </div>
);

/** One headline line that pops up from below. */
export const Line: React.FC<{
  children: React.ReactNode; delay?: number; size?: number; color?: string; weight?: number; latin?: boolean; style?: React.CSSProperties;
}> = ({ children, delay = 0, size = 76, color = C.white, weight = 700, latin, style }) => {
  // Lower damping = visible overshoot: the line slams in, tilts, and settles.
  const p = usePop(delay, 9, 210);
  return (
    <div
      style={{
        fontFamily: latin ? FONT_LATIN : FONT, fontWeight: weight, fontSize: size, lineHeight: 1.22, color,
        textShadow: "0 6px 24px rgba(20,20,70,0.35)", transformOrigin: "left bottom",
        opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 90}px) scale(${0.6 + p * 0.4}) rotate(${(1 - p) * -7}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Pill label (emoji + text) that springs in. `active` makes it glow. */
export const Chip: React.FC<{ children: React.ReactNode; delay?: number; size?: number; bg?: string; color?: string; active?: boolean; style?: React.CSSProperties }> = ({
  children, delay = 0, size = 44, bg = C.white, color = C.ink, active = true, style,
}) => {
  const p = usePop(delay, 8, 240);
  const beat = useBeat(6);
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 12, padding: `${size * 0.28}px ${size * 0.62}px`,
        borderRadius: 999, background: bg, color, fontFamily: FONT, fontWeight: 700, fontSize: size, whiteSpace: "nowrap",
        boxShadow: active ? "0 14px 30px rgba(10,12,40,0.3)" : "none",
        opacity: Math.min(1, p * 2) * (active ? 1 : 0.5),
        transform: `scale(${p * (1 + (active ? beat * 0.04 : 0))}) rotate(${(1 - p) * 14}deg)`, ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("brand/logo.webp")} style={{ width: size, height: size, borderRadius: size * 0.22, boxShadow: "0 24px 50px rgba(10,12,40,0.35)", ...style }} />
);

/** Highlighted word (marker style). */
export const Mark: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.sun }) => (
  <span style={{ color }}>{children}</span>
);
