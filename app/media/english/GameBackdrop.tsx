"use client";

type Blob = {
  top?: number;
  bottom?: number;
  left?: number | string;
  right?: number | string;
  size: number;
  color: string;
};

type CloudSpec = {
  top: number;
  dur: number;
  delay?: number;
  opacity?: number;
  width?: number;
  height?: number;
};

/**
 * Decorative background layer shared by the /media/english games — the
 * floating sun (spinSlow), soft color blobs, and a drifting cloud shape,
 * ported 1:1 from the Claude Design mockups' absolutely-positioned divs.
 */
export default function GameBackdrop({
  sun,
  blobs,
  clouds,
}: {
  sun: { top: number; right: number | string; size: number; from: string; via: string };
  blobs: Blob[];
  clouds: CloudSpec[];
}) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: sun.top,
          right: sun.right,
          width: sun.size,
          height: sun.size,
          borderRadius: "50%",
          background: `radial-gradient(circle,${sun.from} 0%,${sun.via} 60%,rgba(255,209,102,0) 72%)`,
          animation: "spinSlow 40s linear infinite",
          pointerEvents: "none",
        }}
      />
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            width: b.size,
            height: b.size,
            borderRadius: 999,
            background: `radial-gradient(circle,${b.color} 0%,transparent 70%)`,
            filter: "blur(6px)",
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />
      ))}
      {clouds.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: c.top,
            left: 0,
            width: c.width ?? 150,
            height: c.height ?? 52,
            opacity: c.opacity,
            pointerEvents: "none",
            animation: `drift ${c.dur}s linear infinite${c.delay ? ` ${c.delay}s` : ""}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: "rgba(255,255,255,.85)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 26,
              top: -22,
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,.85)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 74,
              top: -8,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,.85)",
            }}
          />
        </div>
      ))}
    </>
  );
}
