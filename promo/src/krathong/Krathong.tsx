import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Confetti, LetterPop, Marker, Shake, Shockwave, Sparkles, Tilt, useBeat } from "../components/fx";
import { Background, Card, Chip, Footage, Laptop, Line, Logo, Phone, usePop } from "../components/ui";
import { makeReel, type ReelConfig } from "../Reel";
import { Cuts, Flyer, Head } from "../scenes/scenes";
import { C, FONT, SAFE } from "../theme";

/** Video 3: the 3D krathong designer (khuncool.com/media/social-studies/krathong-designer). */

const sec = (s: number) => Math.round(s * 30);

// Chip / marker timings land on the spoken word. They were measured from the
// pauses in public/vo/krathong/*.wav (ffmpeg silencedetect) plus the Reel's
// 3-frame voice lead. Re-measure if a clip is regenerated.

// ── Shared bits ─────────────────────────────────────────────────────────
/** Krathongs and lanterns drifting along a "river" line, bobbing. */
const Drift: React.FC<{ y: number; at?: number; speed?: number; items?: string[] }> = ({ y, at = 0, speed = 6, items = ["🪷", "🏮", "🪷", "✨", "🪷", "🏮"] }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  return (
    <>
      {items.map((e, i) => (
        <div
          key={i}
          style={{
            position: "absolute", top: y + Math.sin((f + i * 11) / 9) * 12 + (i % 2) * 50, left: -160 - i * 210 + f * speed,
            fontSize: e === "🏮" ? 90 : 120, filter: "drop-shadow(0 14px 16px rgba(10,12,40,0.35))", transform: `rotate(${Math.sin((f + i * 7) / 12) * 6}deg)`,
          }}
        >
          {e}
        </div>
      ))}
    </>
  );
};

/** Search box that types its query out, grapheme by grapheme (Thai vowels stay attached). */
const SearchBox: React.FC<{ query: string; at: number; perChar?: number }> = ({ query, at, perChar = 2 }) => {
  const f = useCurrentFrame();
  const g = [...new Intl.Segmenter("th", { granularity: "grapheme" }).segment(query)].map((s) => s.segment);
  const shown = g.slice(0, Math.max(0, Math.floor((f - at) / perChar))).join("");
  const p = usePop(at - 6, 12, 180);
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 18, width: 860, padding: "22px 34px", borderRadius: 999, background: C.white,
        boxShadow: "0 20px 44px rgba(10,12,40,0.35)", fontFamily: FONT, fontWeight: 600, fontSize: 54, color: C.ink, transform: `scale(${p})`,
      }}
    >
      <span>🔍</span>
      <span>{shown}</span>
      <span style={{ width: 4, height: 60, background: C.primary, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />
    </div>
  );
};

// ── 1. Hook: a real krathong for every child = a river of trash ─────────
const SHOPPING = ["🍌 หยวกกล้วย 40 ชิ้น", "🍃 ใบตอง 10 มัด", "📌 เข็มหมุด 2 กล่อง", "🌼 ดอกไม้ ธูป เทียน"];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const rows = Math.min(SHOPPING.length + 1, Math.floor(f / 10) + 1);
  // hook.wav (regenerated at TEMPO 1.0, then slowed with atempo 0.82 — the
  // first take was too fast to follow): "แต่ไม่อยาก" ~1.3 s, "สร้างขยะ" ~1.95 s,
  // "ใช่ไหมคะ" 2.57 s.
  const trash = usePop(sec(2.3), 9, 220);
  return (
    <AbsoluteFill>
      <Background tint="linear-gradient(150deg, #8e93a6, #666c80)" />
      <Head top={290}>
        <Line size={84}>สอนลอยกระทง 🪷</Line>
        <Shake at={sec(2.1)} frames={12} amp={12}>
          <Line delay={sec(1.3)} size={78}>แต่ไม่อยาก<Marker delay={sec(2.0)} color={C.pink} textColor={C.white}>สร้างขยะ</Marker>?</Line>
        </Shake>
      </Head>
      <Tilt delay={4} style={{ position: "absolute", top: 690, left: 90 }} float={0.6}>
        <div style={{ width: 720, padding: "30px 36px", borderRadius: 30, background: "#f4f5f8", boxShadow: "0 30px 60px rgba(10,12,40,0.35)", fontFamily: FONT, color: C.inkSoft }}>
          <div style={{ fontWeight: 700, fontSize: 40, color: C.ink, marginBottom: 14 }}>📋 ทำกระทงจริงทั้งห้อง…</div>
          {SHOPPING.map((n, i) => (
            <div key={n} style={{ display: "flex", gap: 16, fontSize: 38, padding: "10px 14px", opacity: i < rows ? 1 : 0.15 }}>
              <span>{n}</span>
              {i < rows ? <span style={{ marginLeft: "auto", color: "#8a90a0" }}>✓</span> : null}
            </div>
          ))}
          <div
            style={{
              marginTop: 12, padding: "14px 18px", borderRadius: 18, background: C.pink, color: C.white, fontWeight: 700, fontSize: 40,
              transform: `scale(${trash}) rotate(${(1 - trash) * -8}deg)`, opacity: Math.min(1, trash * 2),
            }}
          >
            🗑️ กระทง 40 ใบ ลงแม่น้ำ…
          </div>
        </div>
      </Tilt>
      {/* the answer peeks in at the end */}
      <Flyer emoji="🪷" from={[1180, 1420]} to={[820, 1330]} at={durationInFrames - 22} frames={22} size={150} spin={20} />
    </AbsoluteFill>
  );
};

// ── 2. Reveal: ลอยกระทงออนไลน์ ───────────────────────────────────────────
const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const beat = useBeat();
  const title = usePop(0, 7, 220);
  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          position: "absolute", left: 540 - 600, top: 480 - 600, width: 1200, height: 1200, borderRadius: "50%",
          background: "repeating-conic-gradient(rgba(255,255,255,0.13) 0deg 10deg, transparent 10deg 20deg)",
          transform: `rotate(${f * 0.8}deg) scale(${title})`, maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      />
      <Shockwave at={1} x={540} y={420} />
      <div style={{ position: "absolute", top: SAFE.top + 20, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 150, color: C.white, lineHeight: 1.1, textShadow: "0 12px 40px rgba(20,20,70,0.45)", transform: `scale(${title * (1 + beat * 0.04)}) rotate(${(1 - title) * -12}deg)` }}>
          ลอยกระทง
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 110, color: C.sun, lineHeight: 1.1, textShadow: "0 12px 40px rgba(20,20,70,0.45)", transform: `scale(${usePop(5, 8, 220)})` }}>
          ออนไลน์ 🪷
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 16 }}>
          <Logo size={72} style={{ transform: `scale(${usePop(8)})` }} />
          <LetterPop text="khuncool.com" delay={8} size={70} stagger={1.3} />
        </div>
        <div style={{ marginTop: 26 }}>
          <Chip delay={sec(2.6)} size={52} bg={C.sun}>✨ ทำกระทง 3 มิติได้เอง!</Chip>
        </div>
      </div>
      <Tilt delay={6} from="bottom" style={{ position: "absolute", top: 1010, left: 70 }} float={1.2}>
        <Card w={940} h={520}>
          <Footage name="kd-float" start={10.4} zoom={[1.15, 1.3]} focus={[50, 40]} position="50% 30%" />
        </Card>
      </Tilt>
      <Confetti at={4} x={540} y={480} count={80} seed="kd-rev" power={42} />
    </AbsoluteFill>
  );
};

// ── 3. Base: four materials ─────────────────────────────────────────────
const Base: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={84}>เลือก<Marker delay={sec(0.3)}>ฐานกระทง</Marker> 🍌</Line>
      <Line delay={sec(0.5)} size={60} weight={600}>วัสดุย่อยสลายได้ ไม่เป็นขยะ</Line>
    </Head>
    <Tilt delay={2} from="right" style={{ position: "absolute", top: 520, left: 40 }}>
      <Card w={1000} h={820}>
        {/* kd-base flips banana → bread → coconut → lotus leaf → banana → lotus shape → heart */}
        <Footage name="kd-base" start={0.4} rate={1.35} zoom={[1.0, 1.06]} focus={[50, 40]} />
      </Card>
    </Tilt>
    <div style={{ position: "absolute", top: 1390, left: SAFE.left + 10, width: 860, display: "flex", flexWrap: "wrap", gap: 12 }}>
      {/* base.wav: หยวกกล้วย 1.17 s · ขนมปัง 1.87 · กะลา 2.68 · (หรือ)ใบบัว ~3.4 */}
      <Chip delay={sec(1.25)} size={42} bg={C.sun}>🍌 หยวกกล้วย</Chip>
      <Chip delay={sec(1.95)} size={42}>🍞 ขนมปัง</Chip>
      <Chip delay={sec(2.75)} size={42}>🥥 กะลา</Chip>
      <Chip delay={sec(3.5)} size={42}>🪷 ใบบัว</Chip>
    </div>
  </AbsoluteFill>
);

// ── 4. Decorate: petals, top, flowers ───────────────────────────────────
const Decorate: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <Head>
        <Line size={58} weight={600}>ใส่กลีบใบตอง ยอดดอกบัว</Line>
        <Line delay={sec(1.85)} size={88}>ประดับ<Marker delay={sec(2.3)}>ดอกไม้</Marker> 🌼</Line>
      </Head>
      <Tilt delay={2} from="left" style={{ position: "absolute", top: 610, left: 30 }}>
        <Laptop width={780}>
          <Cuts
            total={durationInFrames}
            shots={[
              { at: 0, el: <Footage name="kd-decor" start={0.6} rate={1.6} zoom={[1.15, 1.25]} focus={[50, 35]} /> },
              { at: 1.3, el: <Footage name="kd-decor" start={4.9} rate={1.6} zoom={[1.15, 1.25]} focus={[50, 35]} /> },
              { at: 2.6, el: <Footage name="kd-decor" start={10.6} rate={1.2} zoom={[1.15, 1.25]} focus={[50, 35]} /> },
            ]}
          />
        </Laptop>
      </Tilt>
      <Tilt delay={sec(0.8)} from="right" style={{ position: "absolute", top: 560, left: 560 }} float={1.4}>
        <Phone width={400}>
          <Footage name="m-kd-decor" start={0.3} rate={1.4} />
        </Phone>
      </Tilt>
      <div style={{ position: "absolute", top: 1420, left: SAFE.left + 10, display: "flex", gap: 12 }}>
        {/* decorate.wav: กลีบใบตอง 0.3 s · ยอดดอกบัว ~1.1 · (แล้วประดับ)ดอกไม้ ~2.3 */}
        <Chip delay={sec(0.35)} size={40}>🍃 กลีบใบตอง</Chip>
        <Chip delay={sec(1.15)} size={40}>🪷 ยอดบัว</Chip>
        <Chip delay={sec(2.35)} size={40} bg={C.sun}>🌹 ดอกไม้</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ── 5. Light the candle, make a wish ────────────────────────────────────
// kd-float: the candle is lit ~2.3 s into the shot; starting at 1.3 s puts it
// ~1.0 s into the scene.
const LIT = 1.0;
const Light: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <Head>
        <Line size={88}>ปัก<Marker delay={sec(0.3)}>ธูปเทียน</Marker> 🕯️</Line>
        <Line delay={sec(LIT)} size={68} weight={600}>จุดไฟ แล้วอธิษฐาน 🙏</Line>
      </Head>
      <Tilt from="bottom" style={{ position: "absolute", top: 540, left: 40 }}>
        <Card w={1000} h={820}>
          <Cuts
            total={durationInFrames}
            shots={[
              { at: 0, el: <Footage name="kd-float" start={1.3} focus={[50, 38]} zoom={[1.25, 1.35]} /> },
              // close on the flame
              { at: LIT + 0.9, el: <Footage name="kd-float" start={3.4} focus={[50, 36]} zoom={[1.7, 1.85]} /> },
            ]}
          />
        </Card>
      </Tilt>
      <Sparkles x={300} y={600} w={480} h={420} at={sec(LIT)} seed="lit" count={8} />
      <div style={{ position: "absolute", top: 1410, left: SAFE.left + 10, display: "flex", gap: 12 }}>
        <Chip delay={sec(LIT)} size={46}>🔥 จุดเทียน</Chip>
        <Chip delay={sec(LIT + 0.9)} size={46} bg={C.sun}>🙏 ขอให้เรียนเก่ง</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ── 6. Float on the river (the payoff) ──────────────────────────────────
// kd-float: the float button is pressed at ~8.6 s; the river is in full
// view by ~9.0 s and fireworks start right after.
const Float: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={84}>ลอยกระทงลงแม่น้ำ</Line>
      {/* float.wav: "ใต้พระจันทร์…" starts at 1.53 s */}
      <Line delay={sec(1.6)} size={84}>ใต้<Marker delay={sec(1.8)}>พระจันทร์</Marker> 🌕</Line>
    </Head>
    <Tilt from="bottom" style={{ position: "absolute", top: 520, left: 40 }}>
      <Card w={1000} h={900}>
        <Footage name="kd-float" start={8.5} zoom={[1.0, 1.18]} focus={[50, 45]} zoomFrames={150} />
      </Card>
    </Tilt>
    <Flyer emoji="🏮" from={[160, 1300]} to={[260, 520]} at={sec(1.2)} frames={sec(2.6)} size={90} spin={8} />
    <Flyer emoji="🏮" from={[880, 1350]} to={[780, 560]} at={sec(1.8)} frames={sec(2.6)} size={74} spin={-8} />
    <div style={{ position: "absolute", top: 1440, left: SAFE.left + 10 }}>
      <Chip delay={sec(2.5)} size={50} bg={C.sun}>🎆 พลุเต็มฟ้า คืนวันเพ็ญ!</Chip>
    </div>
    <Confetti at={sec(0.4)} x={540} y={900} count={70} seed="kd-float" power={42} />
    <Sparkles x={100} y={520} w={880} h={880} at={sec(0.5)} seed="kd-float" count={12} />
  </AbsoluteFill>
);

// ── 7. Save a poster or a 10-second video, on any screen ────────────────
const Save: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={78}>บันทึกเป็น<Marker delay={sec(0.4)}>รูป/วิดีโอ</Marker> 📸</Line>
      <Line delay={sec(1.6)} size={64} weight={600}>เก็บเป็นผลงานนักเรียนได้</Line>
    </Head>
    <Tilt delay={2} from="left" style={{ position: "absolute", top: 620, left: 30 }}>
      <Laptop width={830}>
        {/* the save dialog sits at the centre of the desktop frame */}
        <Footage name="kd-save" start={1.6} zoom={[1.7, 1.8]} focus={[50, 42]} />
      </Laptop>
    </Tilt>
    <Tilt delay={sec(1.0)} from="right" style={{ position: "absolute", top: 700, left: 600 }} float={1.6}>
      <Phone width={320}>
        <Footage name="m-kd-save" start={1.2} />
      </Phone>
    </Tilt>
    <div style={{ position: "absolute", top: 1420, left: SAFE.left + 10, display: "flex", gap: 12 }}>
      {/* save.wav: รูป ~0.5 s · วิดีโอ ~1.0 · ทั้งคอมและมือถือ 2.6 */}
      <Chip delay={sec(0.55)} size={40}>🖼️ โปสเตอร์</Chip>
      <Chip delay={sec(1.05)} size={40}>🎬 วิดีโอ 10 วิ</Chip>
      <Chip delay={sec(2.7)} size={40} bg={C.sun}>📱 ทุกจอ</Chip>
    </div>
  </AbsoluteFill>
);

// ── 8. Call to action ────────────────────────────────────────────────────
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const beat = useBeat();
  const logo = usePop(0, 7, 200);
  const btn = usePop(sec(3.6), 7, 220);
  const fade = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Background />
      <Shockwave at={1} x={540} y={330} />
      <div style={{ position: "absolute", top: SAFE.top + 30, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Logo size={140} style={{ transform: `scale(${logo * (1 + beat * 0.06)})` }} />
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 116, lineHeight: 1.05, color: C.white, textShadow: "0 10px 34px rgba(20,20,70,0.4)", transform: `scale(${logo})`, textAlign: "left" }}>
            ลอยกระทง<br /><span style={{ color: C.sun, fontSize: 96 }}>ออนไลน์</span>
          </div>
        </div>
        <Chip delay={sec(0.5)} size={50} bg={C.sun} style={{ marginTop: 30 }}>✨ ใช้ฟรี ไม่ต้องสมัคร</Chip>
        <div style={{ marginTop: 50 }}>
          {/* cta.wav: "ค้นหาคำว่า" 1.46 s, the query itself 2.39–3.30 s */}
          <SearchBox query="ลอยกระทงออนไลน์ คุณคูล" at={sec(1.7)} />
        </div>
        <div style={{ marginTop: 30 }}>
          <LetterPop text="khuncool.com" delay={sec(3.0)} size={72} stagger={1.2} />
        </div>
        <div
          style={{
            marginTop: 50, padding: "24px 64px", borderRadius: 999, background: C.pink, color: C.white, fontFamily: FONT, fontWeight: 700, fontSize: 60,
            boxShadow: `0 20px 40px rgba(10,12,40,0.4), 0 0 0 ${beat * 18}px rgba(255,107,154,${0.35 * beat})`,
            transform: `scale(${btn * (f > sec(4.0) ? 1 + beat * 0.08 : 1)})`, opacity: Math.min(1, btn * 2),
          }}
        >
          ➕ กดติดตาม
        </div>
      </div>
      <div style={{ opacity: fade }}>
        <Drift y={1420} at={sec(0.3)} speed={7} />
      </div>
      <Confetti at={sec(3.0)} x={540} y={860} count={70} seed="kd-cta" power={40} />
    </AbsoluteFill>
  );
};

export const KRATHONG: ReelConfig = {
  id: "krathong",
  scenes: [
    { id: "hook", component: Hook, minSeconds: 3.8, punch: 0, sfx: [{ at: 0.3, sfx: "pop", volume: 0.4 }, { at: 2.3, sfx: "pop", volume: 0.55 }] },
    { id: "reveal", component: Reveal, minSeconds: 4.4, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 2.6, sfx: "sparkle", volume: 0.5 }] },
    { id: "base", component: Base, minSeconds: 4.0, sfx: [1.25, 1.95, 2.75, 3.5].map((at) => ({ at, sfx: "pop" as const, volume: 0.4 })) },
    { id: "decorate", component: Decorate, minSeconds: 4.4, sfx: [{ at: 0.35, sfx: "pop", volume: 0.4 }, { at: 1.15, sfx: "pop", volume: 0.4 }, { at: 2.35, sfx: "pop", volume: 0.5 }] },
    { id: "light", component: Light, minSeconds: 4.0, sfx: [{ at: LIT, sfx: "sparkle", volume: 0.5 }, { at: LIT + 0.9, sfx: "pop", volume: 0.45 }] },
    { id: "float", component: Float, minSeconds: 5.0, sfx: [{ at: 0.4, sfx: "boom", volume: 0.7 }, { at: 0.5, sfx: "sparkle", volume: 0.6 }, { at: 2.5, sfx: "pop", volume: 0.45 }] },
    { id: "save", component: Save, minSeconds: 4.4, sfx: [{ at: 0.55, sfx: "pop", volume: 0.4 }, { at: 1.05, sfx: "pop", volume: 0.4 }, { at: 2.7, sfx: "pop", volume: 0.5 }] },
    { id: "cta", component: Cta, minSeconds: 5.8, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 3.0, sfx: "sparkle", volume: 0.5 }, { at: 3.6, sfx: "pop", volume: 0.6 }] },
  ],
  transitions: ["flash", "flash", "wipe", "circle", "wipe", "flash", "circle", "flash"],
};

export const Krathong = makeReel(KRATHONG);
