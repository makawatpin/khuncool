import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Confetti, LetterPop, Marker, Shake, Shockwave, Sparkles, Tilt, useBeat } from "../components/fx";
import { Background, Card, Chip, Footage, Laptop, Line, Logo, Phone, usePop } from "../components/ui";
import { makeReel, type ReelConfig } from "../Reel";
import { Cuts, Head } from "../scenes/scenes";
import { C, FONT, SAFE } from "../theme";

/** Video 4: the classroom noise meter (khuncool.com/classroom-noise-meter). */

const sec = (s: number) => Math.round(s * 30);

/**
 * Seconds of picture and music before the first word. The hook's headline and
 * the jumping bars are already on screen at frame 0; the voice comes in at
 * LEAD, so a viewer who has just opened the video catches "คุณครูคะ".
 * Keep in sync with "lead" in videos/noise-meter.json.
 */
export const LEAD = 0.8;

// The four faces of the meter, in the order the demo footage walks through them.
const FACES = ["😌", "🙂", "🤫", "🚨"];

/** The faces hopping one after another on the beat. */
const FaceRow: React.FC<{ y: number; at?: number; size?: number }> = ({ y, at = 0, size = 130 }) => {
  const f = useCurrentFrame() - at;
  const beat = useBeat();
  if (f < 0) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
      {FACES.map((e, i) => {
        const p = interpolate(f, [i * 4, i * 4 + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
        return (
          <div key={e} style={{ fontSize: size, lineHeight: 1, transform: `translateY(${(1 - p) * 120 - Math.abs(Math.sin((f + i * 9) / 6)) * 14}px) scale(${p * (1 + beat * 0.06)})`, opacity: p, filter: "drop-shadow(0 14px 14px rgba(10,12,40,0.3))" }}>
            {e}
          </div>
        );
      })}
    </div>
  );
};

// ── 1. Hook: a noisy room (already moving at frame 0, voice starts at LEAD) ──
const BARS = 17;
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const L = sec(LEAD);
  return (
    <AbsoluteFill>
      <Background tint="linear-gradient(150deg, #8e93a6, #666c80)" />
      <Head top={300}>
        <Line size={90}>ห้องเสียงดัง</Line>
        <Line delay={8} size={100}>จนสอน<Marker delay={14} color={C.pink} textColor={C.white}>ไม่ได้</Marker>? 😵</Line>
      </Head>
      {/* jumping sound bars: the room is loud from the very first frame */}
      <Tilt delay={2} style={{ position: "absolute", top: 720, left: 90 }} float={0.6}>
        <div style={{ width: 760, height: 560, padding: "34px 40px", borderRadius: 30, background: "#f4f5f8", boxShadow: "0 30px 60px rgba(10,12,40,0.35)", fontFamily: FONT }}>
          <div style={{ fontWeight: 700, fontSize: 42, color: C.ink }}>🔊 เสียงในห้อง</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 400, marginTop: 14 }}>
            {Array.from({ length: BARS }, (_, i) => {
              const h = 0.35 + 0.65 * Math.abs(Math.sin(f / 3.1 + i * 1.7) * Math.cos(f / 5.3 + i * 0.9));
              return <div key={i} style={{ width: 28, height: 400 * h, borderRadius: 14, background: h > 0.7 ? C.pink : "#b7bccb" }} />;
            })}
          </div>
        </div>
      </Tilt>
      {/* chatter bubbles drifting up */}
      {["💬", "🗣️", "💥"].map((e, i) => {
        const t = ((f + i * 16) % 48) / 48;
        return <div key={e} style={{ position: "absolute", left: 760 + i * 90, top: 860 - t * 260 + i * 70, fontSize: 90 + i * 12, opacity: Math.sin(t * Math.PI) }}>{e}</div>;
      })}
      <Shake at={L + 10} frames={12} amp={12}>
        <div />
      </Shake>
    </AbsoluteFill>
  );
};

// ── 2. Reveal ────────────────────────────────────────────────────────────
const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const beat = useBeat();
  const title = usePop(0, 7, 220);
  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          position: "absolute", left: 540 - 600, top: 560 - 600, width: 1200, height: 1200, borderRadius: "50%",
          background: "repeating-conic-gradient(rgba(255,255,255,0.13) 0deg 10deg, transparent 10deg 20deg)",
          transform: `rotate(${f * 0.8}deg) scale(${title})`, maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      />
      <Shockwave at={1} x={540} y={520} />
      <div style={{ position: "absolute", top: SAFE.top + 40, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 200, color: C.white, lineHeight: 1.1, textShadow: "0 12px 40px rgba(20,20,70,0.45)", transform: `scale(${title * (1 + beat * 0.04)}) rotate(${(1 - title) * -12}deg)` }}>
          วัดเสียง
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 96, color: C.sun, lineHeight: 1.1, textShadow: "0 8px 30px rgba(20,20,70,0.4)", transform: `scale(${usePop(4, 9, 200)})` }}>
          ในห้องเรียน
        </div>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <Logo size={78} style={{ transform: `scale(${usePop(8)})` }} />
          <LetterPop text="khuncool.com" delay={8} size={76} stagger={1.3} />
        </div>
        <div style={{ marginTop: 34 }}>
          <Chip delay={sec(1.3)} size={54} bg={C.sun}>🔔 เตือนแทนครู ไม่ต้องตะโกน!</Chip>
        </div>
      </div>
      <FaceRow y={1130} at={6} />
      <Confetti at={4} x={540} y={560} count={80} seed="nm-rev" power={42} />
    </AbsoluteFill>
  );
};

// ── 3. Mic: one tap, allow the microphone ───────────────────────────────
const Mic: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={80}>กดปุ่มเดียว 🎤</Line>
      <Line delay={sec(0.9)} size={80}>อนุญาตไมค์ <Marker delay={sec(1.1)}>วัดได้เลย</Marker></Line>
    </Head>
    <Tilt delay={2} from="left" style={{ position: "absolute", top: 640, left: 30 }}>
      <Laptop width={760}>
        <Footage name="nm-desktop" start={0.1} rate={1.3} />
      </Laptop>
    </Tilt>
    <Tilt from="right" style={{ position: "absolute", top: 540, left: 540 }} float={1.4}>
      <Phone width={410}>
        <Footage name="nm-phone" start={0.1} rate={1.3} />
      </Phone>
    </Tilt>
    <div style={{ position: "absolute", top: 1410, left: SAFE.left + 10 }}>
      <Chip delay={sec(2.6)} size={48} bg={C.sun}>⚡ ไม่ต้องติดตั้ง</Chip>
    </div>
  </AbsoluteFill>
);

// ── 4. Faces: green → yellow → orange ───────────────────────────────────
const Faces: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={88}>เงียบ = <Marker delay={sec(0.5)} color={C.accent} textColor={C.white}>เขียว</Marker> 😌</Line>
      <Line delay={sec(1.4)} size={88}>เริ่มดัง = <Marker delay={sec(1.6)}>ส้ม</Marker> 🤫</Line>
    </Head>
    <Tilt from="bottom" style={{ position: "absolute", top: 560, left: 40 }}>
      <Card w={1000} h={820}>
        <Footage name="nm-desktop" start={2.0} rate={1.35} position="8% 50%" zoom={[1.0, 1.1]} focus={[35, 50]} zoomFrames={120} />
      </Card>
    </Tilt>
    <div style={{ position: "absolute", top: 1430, left: SAFE.left + 10 }}>
      <Chip delay={sec(2.6)} size={46}>👀 เห็นชัดกันทั้งห้อง</Chip>
    </div>
  </AbsoluteFill>
);

// ── 5. Alarm: over the limit ─────────────────────────────────────────────
const Alarm: React.FC = () => {
  const f = useCurrentFrame();
  const flash = Math.floor(f / 6) % 2 ? 0 : 0.1;
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ background: C.pink, opacity: f > sec(1.3) ? flash : 0 }} />
      <Head>
        <Line size={72} weight={600}>ถ้าดังเกิน 🚨</Line>
        <Line delay={sec(0.7)} size={88}><Marker delay={sec(0.9)} color={C.pink} textColor={C.white}>ไซเรนแดง</Marker>ขึ้นทันที</Line>
      </Head>
      <Tilt from="bottom" style={{ position: "absolute", top: 560, left: 40 }}>
        <Card w={1000} h={820}>
          <Footage name="nm-desktop" start={6.8} rate={1.2} position="8% 50%" zoom={[1.0, 1.1]} focus={[35, 50]} zoomFrames={120} />
        </Card>
      </Tilt>
      <div style={{ position: "absolute", top: 1430, left: SAFE.left + 10, display: "flex", gap: 14 }}>
        <Chip delay={sec(1.8)} size={46} bg={C.sun}>🔢 นับจำนวนครั้ง</Chip>
        <Chip delay={sec(2.2)} size={46}>⏱️ รวมเวลา</Chip>
      </div>
      <Sparkles x={120} y={560} w={840} h={800} at={sec(1.3)} seed="nm-alarm" count={8} />
    </AbsoluteFill>
  );
};

// ── 6. Settings ──────────────────────────────────────────────────────────
const Settings: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={72} weight={600}>ปรับให้เข้ากับห้อง 🎚️</Line>
      <Line delay={sec(0.7)} size={84}><Marker delay={sec(0.9)}>เกณฑ์ความดัง</Marker></Line>
    </Head>
    <Tilt from="bottom" style={{ position: "absolute", top: 540, left: 340 }} float={1.2}>
      <Phone width={400}>
        <Footage name="nm-phone" start={3.0} rate={1} zoom={[1.0, 1.1]} focus={[50, 70]} zoomFrames={90} />
      </Phone>
    </Tilt>
    <div style={{ position: "absolute", top: 1420, left: SAFE.left + 10, display: "flex", gap: 14, flexWrap: "wrap", maxWidth: 860 }}>
      <Chip delay={sec(1.4)} size={44}>📏 เกณฑ์</Chip>
      <Chip delay={sec(1.9)} size={44}>🎤 ความไวไมค์</Chip>
      <Chip delay={sec(2.4)} size={44} bg={C.sun}>⏳ นับเมื่อเกิน 1–5 วิ</Chip>
    </div>
  </AbsoluteFill>
);

// ── 7. Screens + privacy ─────────────────────────────────────────────────
const Screens: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={84}>ฉาย<Marker delay={6}>เต็มจอ</Marker> 📽️</Line>
      <Line delay={sec(1.4)} size={84}><Marker delay={sec(1.6)}>ไม่อัดเสียง</Marker> 🔒</Line>
    </Head>
    <Tilt delay={2} from="left" style={{ position: "absolute", top: 640, left: 30 }}>
      <Laptop width={830}>
        <Footage name="nm-desktop" start={6.0} />
      </Laptop>
    </Tilt>
    <Tilt delay={sec(1.4)} from="right" style={{ position: "absolute", top: 760, left: 600 }} float={1.6}>
      <Phone width={310}>
        <Footage name="nm-phone" start={6.0} />
      </Phone>
    </Tilt>
    <div style={{ position: "absolute", top: 1430, left: SAFE.left + 10 }}>
      <Chip delay={sec(2.4)} size={46} bg={C.sun}>🏠 ประมวลผลในเครื่องเท่านั้น</Chip>
    </div>
  </AbsoluteFill>
);

// ── 8. Call to action ────────────────────────────────────────────────────
const SearchBox: React.FC<{ query: string; at: number }> = ({ query, at }) => {
  const f = useCurrentFrame();
  const g = [...new Intl.Segmenter("th", { granularity: "grapheme" }).segment(query)].map((s) => s.segment);
  const shown = g.slice(0, Math.max(0, Math.floor((f - at) / 2.2))).join("");
  const p = usePop(at - 6, 12, 180);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, width: 840, padding: "22px 34px", borderRadius: 999, background: C.white, boxShadow: "0 20px 44px rgba(10,12,40,0.35)", fontFamily: FONT, fontWeight: 600, fontSize: 54, color: C.ink, transform: `scale(${p})` }}>
      <span>🔍</span>
      <span>{shown}</span>
      <span style={{ width: 4, height: 60, background: C.primary, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />
    </div>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const beat = useBeat();
  const logo = usePop(0, 7, 200);
  const btn = usePop(sec(3.0), 7, 220);
  return (
    <AbsoluteFill>
      <Background />
      <Shockwave at={1} x={540} y={330} />
      <div style={{ position: "absolute", top: SAFE.top + 30, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Logo size={150} style={{ transform: `scale(${logo * (1 + beat * 0.06)})` }} />
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 120, color: C.white, textShadow: "0 10px 34px rgba(20,20,70,0.4)", transform: `scale(${logo})` }}>วัดเสียง</div>
        </div>
        <Chip delay={sec(0.5)} size={50} bg={C.sun} style={{ marginTop: 30 }}>✨ ใช้ฟรี ไม่ต้องสมัคร</Chip>
        <div style={{ marginTop: 60 }}>
          <SearchBox query="วัดเสียงในห้อง คุณคูล" at={sec(1.1)} />
        </div>
        <div style={{ marginTop: 34 }}>
          <LetterPop text="khuncool.com/classroom-noise-meter" delay={sec(2.2)} size={44} stagger={0.8} />
        </div>
        <div
          style={{
            marginTop: 60, padding: "24px 64px", borderRadius: 999, background: C.pink, color: C.white, fontFamily: FONT, fontWeight: 700, fontSize: 60,
            boxShadow: `0 20px 40px rgba(10,12,40,0.4), 0 0 0 ${beat * 18}px rgba(255,107,154,${0.35 * beat})`,
            transform: `scale(${btn * (f > sec(3.4) ? 1 + beat * 0.08 : 1)})`, opacity: Math.min(1, btn * 2),
          }}
        >
          ➕ กดติดตาม
        </div>
      </div>
      <FaceRow y={1340} at={sec(0.3)} size={120} />
      <Confetti at={sec(2.2)} x={540} y={860} count={70} seed="nm-cta" power={40} />
    </AbsoluteFill>
  );
};

export const NOISE_METER: ReelConfig = {
  id: "noise-meter",
  lead: LEAD,
  scenes: [
    { id: "hook", component: Hook, minSeconds: 3.6, punch: 0, sfx: [{ at: 0.15, sfx: "pop", volume: 0.4 }, { at: 0.55, sfx: "pop", volume: 0.4 }] },
    { id: "reveal", component: Reveal, minSeconds: 4.4, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 1.3, sfx: "sparkle", volume: 0.5 }] },
    { id: "mic", component: Mic, minSeconds: 4.4, sfx: [{ at: 2.6, sfx: "pop", volume: 0.5 }] },
    { id: "faces", component: Faces, minSeconds: 4.4, sfx: [{ at: 0.5, sfx: "pop", volume: 0.5 }, { at: 1.6, sfx: "pop", volume: 0.5 }, { at: 2.6, sfx: "pop", volume: 0.4 }] },
    { id: "alarm", component: Alarm, minSeconds: 4.6, sfx: [{ at: 0.9, sfx: "pop", volume: 0.5 }, { at: 1.3, sfx: "boom", volume: 0.6 }, { at: 1.8, sfx: "pop", volume: 0.4 }, { at: 2.2, sfx: "pop", volume: 0.4 }] },
    { id: "settings", component: Settings, minSeconds: 4.2, sfx: [{ at: 1.4, sfx: "pop", volume: 0.4 }, { at: 1.9, sfx: "pop", volume: 0.4 }, { at: 2.4, sfx: "pop", volume: 0.5 }] },
    { id: "screens", component: Screens, minSeconds: 4.0, sfx: [{ at: 1.6, sfx: "pop", volume: 0.5 }, { at: 2.4, sfx: "pop", volume: 0.4 }] },
    { id: "cta", component: Cta, minSeconds: 5.8, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 2.2, sfx: "sparkle", volume: 0.5 }, { at: 3.0, sfx: "pop", volume: 0.6 }] },
  ],
  transitions: ["flash", "flash", "wipe", "circle", "wipe", "circle", "wipe", "flash"],
};

export const NoiseMeter = makeReel(NOISE_METER);
