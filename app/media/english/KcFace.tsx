"use client";

export type KcFaceProps = {
  skin: string;
  hair: string;
  shirt: string;
  longHair?: boolean;
  bun?: boolean;
  glasses?: boolean;
  mustache?: boolean;
  cap?: boolean;
  capColor?: string;
  bow?: boolean;
  bowColor?: string;
  size?: number;
};

/**
 * Ported 1:1 from the "KcFace" component in the Khuncool Design System —
 * layered absolutely-positioned divs at a fixed 64x74 native size, scaled
 * via transform for wherever it's reused across the /media/english games.
 * Requires the `kcBlink` / `kcBreathe` keyframes in app/globals.css.
 */
export default function KcFace({
  skin,
  hair,
  shirt,
  longHair,
  bun,
  glasses,
  mustache,
  cap,
  capColor = "#EF476F",
  bow,
  bowColor = "#FF7FA5",
  size = 64,
}: KcFaceProps) {
  const scale = size / 64;
  return (
    <div style={{ position: "relative", width: size, height: 74 * scale, flex: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 64,
          height: 74,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div style={{ position: "relative", width: 64, height: 74, animation: "kcBreathe 3.2s ease-in-out infinite" }}>
          {/* shirt / body */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              transform: "translateX(-50%)",
              width: 54,
              height: 30,
              borderRadius: "27px 27px 9px 9px",
              background: shirt,
              boxShadow: "inset 0 -5px 0 rgba(0,0,0,.09)",
            }}
          />
          {/* neck */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 22,
              transform: "translateX(-50%)",
              width: 15,
              height: 13,
              background: skin,
              borderRadius: 5,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 24,
              transform: "translateX(-50%)",
              width: 20,
              height: 12,
              borderRadius: "0 0 12px 12px",
              background: "rgba(255,255,255,.28)",
            }}
          />
          {longHair && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 12,
                transform: "translateX(-50%)",
                width: 56,
                height: 50,
                borderRadius: "28px 28px 20px 20px",
                background: hair,
              }}
            />
          )}
          {bun && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                transform: "translateX(-50%)",
                width: 26,
                height: 22,
                borderRadius: "50%",
                background: hair,
              }}
            />
          )}
          {/* head */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 9,
              transform: "translateX(-50%)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: skin,
              boxShadow: "inset -3px -5px 0 rgba(0,0,0,.07)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -3,
                top: -7,
                width: 50,
                height: 24,
                borderRadius: "25px 25px 4px 4px",
                background: hair,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 11,
                top: 20,
                width: 6,
                height: 7,
                borderRadius: "50%",
                background: "#2A2331",
                animation: "kcBlink 4.6s infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 11,
                top: 20,
                width: 6,
                height: 7,
                borderRadius: "50%",
                background: "#2A2331",
                animation: "kcBlink 4.6s infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 5,
                top: 28,
                width: 9,
                height: 6,
                borderRadius: "50%",
                background: "#FF9DB0",
                opacity: 0.55,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 5,
                top: 28,
                width: 9,
                height: 6,
                borderRadius: "50%",
                background: "#FF9DB0",
                opacity: 0.55,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 29,
                transform: "translateX(-50%)",
                width: 14,
                height: 8,
                borderRadius: "0 0 14px 14px",
                background: "#B3405A",
              }}
            />
            {mustache && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 26,
                  transform: "translateX(-50%)",
                  width: 20,
                  height: 6,
                  borderRadius: 6,
                  background: hair,
                }}
              />
            )}
            {glasses && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    top: 16,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #4A4F63",
                    background: "rgba(255,255,255,.35)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 6,
                    top: 16,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #4A4F63",
                    background: "rgba(255,255,255,.35)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 22,
                    transform: "translateX(-50%)",
                    width: 8,
                    height: 2,
                    background: "#4A4F63",
                  }}
                />
              </>
            )}
            {cap && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: -4,
                    top: -10,
                    width: 52,
                    height: 24,
                    borderRadius: "26px 26px 3px 3px",
                    background: capColor,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 26,
                    top: 10,
                    width: 32,
                    height: 8,
                    borderRadius: "0 8px 8px 0",
                    background: capColor,
                    filter: "brightness(.88)",
                  }}
                />
              </>
            )}
            {bow && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: -8,
                    top: -4,
                    width: 14,
                    height: 14,
                    borderRadius: "50% 50% 50% 20%",
                    background: bowColor,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: -10,
                    top: 6,
                    width: 12,
                    height: 12,
                    borderRadius: "50% 20% 50% 50%",
                    background: bowColor,
                    filter: "brightness(.92)",
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
