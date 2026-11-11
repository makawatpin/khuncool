import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SAFE } from "../theme";
import { Background, Card, Chip, Footage, Laptop, Line, Logo, Phone, usePop } from "../components/ui";
import { Confetti, LetterPop, Marker, Shake, Shockwave, Sparkles, Tilt, useBeat } from "../components/fx";
import type { Cue } from "../Reel";

const sec = (s: number) => Math.round(s * 30);

/** Sound-effect cues per scene, in seconds from the scene start (played by the Reel). */
export const SCENE_SFX: Record<string, Cue[]> = {
  hook: [{ at: 0.55, sfx: "pop", volume: 0.5 }, { at: 0.95, sfx: "boom", volume: 0.55 }],
  reveal: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 2.4, sfx: "sparkle", volume: 0.6 }],
  duck: [{ at: 2.1, sfx: "pop", volume: 0.55 }, { at: 2.15, sfx: "sparkle", volume: 0.35 }],
  tools: [{ at: 0, sfx: "pop", volume: 0.45 }, { at: 0.8, sfx: "pop", volume: 0.45 }, { at: 1.5, sfx: "pop", volume: 0.45 }, { at: 2.3, sfx: "sparkle", volume: 0.4 }],
  games: [1.4, 2.05, 2.6, 3.15, 3.8].map((at) => ({ at, sfx: "pop" as const, volume: 0.4 })),
  screens: [1.2, 1.6, 2.15, 2.6].map((at) => ({ at, sfx: "pop" as const, volume: 0.4 })),
  classroom: [0, 0.75, 1.55, 2.1].map((at) => ({ at, sfx: "pop" as const, volume: 0.4 })),
  cta: [{ at: 0, sfx: "boom", volume: 0.85 }, { at: 0.45, sfx: "sparkle", volume: 0.55 }, { at: 2.2, sfx: "pop", volume: 0.6 }],
};

/** Headline block in the top safe area, left-aligned to stay clear of the right rail. */
export const Head: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = SAFE.top + 10 }) => (
  <div style={{ position: "absolute", top, left: SAFE.left + 10, right: SAFE.left + 10 }}>{children}</div>
);

/** Cuts between shots at the given second marks; each cut lands with a small zoom punch. */
export const Cuts: React.FC<{ shots: { at: number; el: React.ReactNode }[]; total: number }> = ({ shots, total }) => (
  <>
    {shots.map((s, i) => {
      const from = sec(s.at);
      const to = i + 1 < shots.length ? sec(shots[i + 1].at) : total;
      return (
        <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)} layout="none">
          <CutPunch>{s.el}</CutPunch>
        </Sequence>
      );
    })}
  </>
);
const CutPunch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 6], [1.14, 1], { extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const flash = interpolate(f, [0, 4], [0.55, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `scale(${s})` }}>
      {children}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/** Emoji that flies along a path across the frame (for playful accents). */
export const Flyer: React.FC<{ emoji: string; from: [number, number]; to: [number, number]; at: number; frames: number; size?: number; spin?: number }> = ({
  emoji, from, to, at, frames, size = 90, spin = 0,
}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > frames) return null;
  const t = f / frames;
  const x = from[0] + (to[0] - from[0]) * t;
  const y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 120;
  return <div style={{ position: "absolute", left: x, top: y, fontSize: size, transform: `rotate(${spin * t}deg) scaleX(${to[0] < from[0] ? -1 : 1})` }}>{emoji}</div>;
};

// ── 1. Hook ──────────────────────────────────────────────────────────────
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const beat = useBeat();
  const wobble = Math.sin(f / 3) * 12;
  const zoom = interpolate(f, [0, 80], [1, 1.08]);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <Background />
      {/* Footage teasers drifting up behind the question */}
      {[
        { name: "d-duck", start: 6, x: -120, y: 1180, r: -9, d: 2 },
        { name: "d-santa", start: 0.5, x: 520, y: 1330, r: 8, d: 5 },
        { name: "d-bomb", start: 0.5, x: 180, y: 1560, r: -4, d: 8 },
      ].map((t) => (
        <Tilt key={t.name} delay={t.d} from={t.x < 200 ? "left" : "right"} style={{ position: "absolute", left: t.x, top: t.y - f * 1.6 }}>
          <div style={{ transform: `rotate(${t.r}deg)` }}>
            <Card w={640} h={360} radius={28}><Footage name={t.name} start={t.start} /></Card>
          </div>
        </Tilt>
      ))}
      <Head top={320}>
        <Line size={64} weight={600} color="rgba(255,255,255,0.92)">คุณครูคะ 👋</Line>
        <Line delay={5} size={108}>คาบหน้า</Line>
        <Line delay={9} size={108}>คิดกิจกรรม</Line>
        <Shake at={sec(0.95)} frames={14} amp={16}>
          <Line delay={sec(0.85)} size={108}>
            <Marker delay={sec(0.95)} color={C.pink} textColor={C.white}>ไม่ทัน</Marker>ใช่ไหม?{" "}
            <span style={{ display: "inline-block", transform: `rotate(${wobble}deg) scale(${1 + beat * 0.15})` }}>🤔</span>
          </Line>
        </Shake>
      </Head>
      {/* Big question marks popping around the text */}
      {[
        { x: 820, y: 250, d: 14, s: 150, r: 14 }, { x: 760, y: 700, d: 22, s: 110, r: -10 }, { x: 40, y: 220, d: 30, s: 90, r: -16 },
      ].map((q, i) => {
        const p = usePop(q.d, 7, 260);
        return (
          <div key={i} style={{ position: "absolute", left: q.x, top: q.y, fontFamily: FONT, fontWeight: 700, fontSize: q.s, color: C.sun, opacity: p, transform: `scale(${p}) rotate(${q.r + Math.sin((f + i * 9) / 6) * 8}deg)`, textShadow: "0 10px 30px rgba(10,12,40,0.35)" }}>
            ?
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── 2. Reveal ────────────────────────────────────────────────────────────
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const beat = useBeat();
  const logo = usePop(0, 7, 200);
  const stamp = usePop(sec(2.4), 6, 260);
  return (
    <AbsoluteFill>
      <Background />
      <Shockwave at={2} x={540} y={SAFE.top + 115} />
      <Shockwave at={7} x={540} y={SAFE.top + 115} color="rgba(255,200,61,0.9)" />
      {/* Rotating sunburst behind the logo */}
      <div
        style={{
          position: "absolute", left: 540 - 520, top: SAFE.top + 115 - 520, width: 1040, height: 1040, borderRadius: "50%",
          background: "repeating-conic-gradient(rgba(255,255,255,0.13) 0deg 10deg, transparent 10deg 20deg)",
          transform: `rotate(${f * 0.8}deg) scale(${logo})`, maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      />
      <div style={{ position: "absolute", top: SAFE.top + 20, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Logo size={190} style={{ transform: `scale(${logo * (1 + beat * 0.05)}) rotate(${(1 - logo) * -40}deg)` }} />
        <div style={{ marginTop: 26 }}>
          <LetterPop text="khuncool.com" delay={6} size={112} stagger={1.5} />
        </div>
        <Line delay={sec(0.9)} size={56} weight={600}>รวมเครื่องมือครู & สื่อการสอน</Line>
        <div
          style={{
            marginTop: 22, padding: "10px 46px", borderRadius: 999, background: C.sun, color: C.ink, fontFamily: FONT, fontWeight: 700, fontSize: 74,
            transform: `scale(${stamp * (1 + beat * 0.06)}) rotate(${-6 + (1 - stamp) * 40}deg)`, opacity: Math.min(1, stamp * 2), boxShadow: "0 16px 34px rgba(10,12,40,0.35)",
          }}
        >
          ใช้ฟรี!
        </div>
      </div>
      <Sparkles x={200} y={SAFE.top} w={680} h={520} at={sec(2.4)} seed="rv" />
      <Tilt delay={sec(0.5)} style={{ position: "absolute", top: 1010, left: (1080 - 470) / 2 }}>
        <Phone width={470}>
          <Footage name="m-home" start={1.0} />
        </Phone>
      </Tilt>
      <Confetti at={sec(2.4)} x={540} y={SAFE.top + 470} count={70} seed="free" />
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(f, [0, 6], [0.9, 0], { extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// ── 3. Duck race ─────────────────────────────────────────────────────────
export const Duck: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={70} weight={600}>จะสุ่มชื่อนักเรียน 🎲</Line>
      <Line delay={sec(0.9)} size={84}>ก็ให้<Marker delay={sec(1.1)}>เป็ดแข่งกันวิ่ง!</Marker></Line>
    </Head>
    {/* Ducks start at the left edge of the track, so the crop keeps the left side */}
    <Tilt delay={2} from="right" style={{ position: "absolute", top: 560, left: 40 }}>
      <Card w={1000} h={780}>
        <Footage name="d-duck" start={4.2} position="12% 60%" zoom={[1.05, 1.18]} focus={[15, 65]} zoomFrames={150} />
      </Card>
    </Tilt>
    <Flyer emoji="🦆" from={[-160, 1460]} to={[1100, 1380]} at={sec(0.4)} frames={sec(2.2)} size={110} />
    <Flyer emoji="🦆" from={[-200, 1520]} to={[1100, 1470]} at={sec(0.7)} frames={sec(2.0)} size={80} />
    <div style={{ position: "absolute", top: 1380, left: 90 }}>
      <Chip delay={sec(2.1)} size={56} bg={C.sun}>🦆 ลุ้นกันทั้งห้อง!</Chip>
    </div>
    <Confetti at={sec(2.1)} x={330} y={1420} count={45} seed="duck" power={30} />
  </AbsoluteFill>
);

// ── 4. Tools ─────────────────────────────────────────────────────────────
const TOOL_MARKS = [
  { at: 0, label: "👥 จับกลุ่ม", shot: "d-groups", start: 0.5 },
  { at: 0.8, label: "⏱️ จับเวลา", shot: "d-timer", start: 0.4 },
  { at: 1.5, label: "🎤 วัดเสียง", shot: "d-noise", start: 0.8 },
];
export const Tools: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const current = TOOL_MARKS.filter((m) => f >= sec(m.at)).length - 1;
  return (
    <AbsoluteFill>
      <Background />
      <Head>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", maxWidth: 860 }}>
          {TOOL_MARKS.map((m, i) => (
            <Chip key={m.label} delay={sec(m.at)} size={52} bg={i === current ? C.sun : C.white} active={i <= current}>{m.label}</Chip>
          ))}
        </div>
        <Line delay={sec(2.3)} size={88} style={{ marginTop: 30 }}>ครบใน<Marker delay={sec(2.45)}>ที่เดียว</Marker> ✨</Line>
      </Head>
      <Tilt from="left" style={{ position: "absolute", top: 700, left: 30 }}>
        <Laptop width={1020}>
          <Cuts
            total={durationInFrames}
            shots={TOOL_MARKS.map((m) => ({ at: m.at, el: <Footage name={m.shot} start={m.start} zoom={[1, 1.08]} zoomFrames={60} /> }))}
          />
        </Laptop>
      </Tilt>
      <Sparkles x={120} y={600} w={840} h={120} at={sec(2.3)} seed="tl" count={6} />
    </AbsoluteFill>
  );
};

// ── 5. Games ─────────────────────────────────────────────────────────────
const GAMES = [
  { at: 0, subject: "", shot: "d-media", start: 0.8 },
  { at: 1.4, subject: "ไทย", shot: "d-thai", start: 0.3 },
  { at: 2.05, subject: "คณิต", shot: "d-bomb", start: 0.4 },
  { at: 2.6, subject: "วิทย์", shot: "d-density", start: 0.4 },
  { at: 3.15, subject: "อังกฤษ", shot: "d-santa", start: 0.4 },
  { at: 3.8, subject: "คอมพิวเตอร์", shot: "d-typing", start: 0.4 },
  // Title screen only: the category picker wraps Thai labels one word per line at 1920x1080.
  { at: 4.6, subject: "อังกฤษ", shot: "d-vocab", start: 0.2 },
];
export const Games: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const now = GAMES.filter((g) => f >= sec(g.at)).at(-1)!;
  const subjects = ["ไทย", "คณิต", "วิทย์", "อังกฤษ", "คอมพิวเตอร์"];
  return (
    <AbsoluteFill>
      <Background />
      <Head>
        <Line size={84}>เกมและสื่อ<Marker delay={8}>อีกเพียบ!</Marker> 🎮</Line>
      </Head>
      <Tilt from="bottom" style={{ position: "absolute", top: 450, left: 40 }}>
        <Card w={1000} h={860}>
          <Cuts total={durationInFrames} shots={GAMES.map((g) => ({ at: g.at, el: <Footage name={g.shot} start={g.start} zoom={[1.02, 1.1]} zoomFrames={24} /> }))} />
          {/* Big subject label stamped on each game cut */}
          {now.subject ? <SubjectStamp key={now.at} text={now.subject} /> : null}
        </Card>
      </Tilt>
      <div style={{ position: "absolute", top: 1360, left: SAFE.left + 10, display: "flex", gap: 14, flexWrap: "wrap", maxWidth: 840 }}>
        {subjects.map((s) => {
          const g = GAMES.find((x) => x.subject === s)!;
          return <Chip key={s} delay={sec(g.at)} size={48} bg={now.subject === s ? C.sun : C.white} active={f >= sec(g.at)}>{s}</Chip>;
        })}
      </div>
    </AbsoluteFill>
  );
};
const SubjectStamp: React.FC<{ text: string }> = ({ text }) => {
  const p = usePop(0, 7, 280);
  return (
    <div
      style={{
        position: "absolute", left: 30, bottom: 30, padding: "8px 34px", borderRadius: 20, background: C.pink, color: C.white,
        fontFamily: FONT, fontWeight: 700, fontSize: 64, transform: `scale(${p}) rotate(${-8 + (1 - p) * -30}deg)`, transformOrigin: "left bottom",
        boxShadow: "0 14px 30px rgba(10,12,40,0.45)",
      }}
    >
      {text}
    </div>
  );
};

// ── 6. Any screen ────────────────────────────────────────────────────────
const SCREEN_CHIPS = [
  { at: 1.2, label: "💻 คอม" }, { at: 1.6, label: "📽️ โปรเจกเตอร์" }, { at: 2.15, label: "📱 แท็บเล็ต" }, { at: 2.6, label: "📲 มือถือ" },
];
export const Screens: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={88}>ใช้ได้<Marker delay={6}>ทุกหน้าจอ</Marker></Line>
    </Head>
    <Tilt delay={2} from="left" style={{ position: "absolute", top: 480, left: 30 }}>
      <Laptop width={830}>
        <Footage name="d-santa" start={1.6} />
      </Laptop>
    </Tilt>
    <Tilt delay={9} from="right" style={{ position: "absolute", top: 640, left: 590 }} float={1.6}>
      <Phone width={320}>
        <Footage name="m-santa" start={1.6} />
      </Phone>
    </Tilt>
    <div style={{ position: "absolute", top: 1370, left: SAFE.left + 10, display: "flex", gap: 14, flexWrap: "wrap", maxWidth: 860 }}>
      {SCREEN_CHIPS.map((c) => <Chip key={c.label} delay={sec(c.at)} size={46}>{c.label}</Chip>)}
    </div>
  </AbsoluteFill>
);

// ── 7. Classroom records ─────────────────────────────────────────────────
const CLASS_CHIPS = [
  { at: 0, label: "✅ เช็กชื่อ" }, { at: 0.75, label: "🪥 แปรงฟัน" }, { at: 1.55, label: "🐮 ดื่มนม" }, { at: 2.1, label: "🐷 ออมเงิน" },
];
export const Classroom: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", maxWidth: 860 }}>
        {CLASS_CHIPS.map((c) => <Chip key={c.label} delay={sec(c.at)} size={50}>{c.label}</Chip>)}
      </div>
      <Line delay={sec(2.6)} size={88} style={{ marginTop: 26 }}>ก็<Marker delay={sec(2.75)}>ทำได้</Marker> 👍</Line>
    </Head>
    {/* The phone layout is far more legible than the desktop table (names + ticks at a glance).
        Desktop table sits behind it for the "works on a projector too" feel. */}
    <Tilt delay={4} from="left" style={{ position: "absolute", top: 760, left: 30 }}>
      <Laptop width={760}>
        <Footage name="d-attendance" start={0.3} zoom={[1.1, 1.2]} focus={[10, 25]} zoomFrames={120} />
      </Laptop>
    </Tilt>
    <Tilt from="right" style={{ position: "absolute", top: 600, left: 520 }} float={1.6}>
      <Phone width={400}>
        <Footage name="m-attendance" start={0.4} />
      </Phone>
    </Tilt>
    <Sparkles x={80} y={560} w={600} h={160} at={sec(2.6)} seed="cl" count={6} />
  </AbsoluteFill>
);

// ── 8. Call to action ────────────────────────────────────────────────────
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const beat = useBeat();
  const logo = usePop(0, 7, 200);
  const btn = usePop(sec(2.2), 7, 220);
  const pulse = f > sec(2.6) ? 1 + beat * 0.08 : 1;
  const tap = f > sec(3.0) ? Math.abs(Math.sin((f - sec(3.0)) / 5)) * 18 : 0;
  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          position: "absolute", left: 540 - 600, top: 440 - 600, width: 1200, height: 1200, borderRadius: "50%",
          background: "repeating-conic-gradient(rgba(255,255,255,0.12) 0deg 9deg, transparent 9deg 18deg)",
          transform: `rotate(${-f * 0.7}deg) scale(${logo})`, maskImage: "radial-gradient(circle, black 25%, transparent 70%)",
        }}
      />
      <Shockwave at={1} x={540} y={440} />
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Logo size={220} style={{ transform: `scale(${logo * (1 + beat * 0.06)}) rotate(${(1 - logo) * 50}deg)` }} />
        <Line delay={4} size={66} weight={600} style={{ marginTop: 40, transformOrigin: "center bottom" }}>เข้าไปใช้ฟรีที่</Line>
        <LetterPop text="khuncool.com" delay={8} size={124} stagger={1.6} />
        <Chip delay={sec(1.0)} size={46} bg="rgba(255,255,255,0.18)" color={C.white} style={{ marginTop: 26, border: "3px solid rgba(255,255,255,0.7)" }}>
          ✨ เปิดใช้ได้ทันที ไม่ต้องสมัคร
        </Chip>
        <div style={{ position: "relative", marginTop: 90 }}>
          <div
            style={{
              padding: "26px 70px", borderRadius: 999, background: C.pink, color: C.white, fontFamily: FONT, fontWeight: 700, fontSize: 64,
              boxShadow: `0 20px 40px rgba(10,12,40,0.4), 0 0 0 ${beat * 18}px rgba(255,107,154,${0.35 * beat})`,
              transform: `scale(${btn * pulse})`, opacity: Math.min(1, btn * 2),
            }}
          >
            ➕ กดติดตาม
          </div>
          <div style={{ position: "absolute", right: -40, bottom: -70, fontSize: 96, transform: `translateY(${-tap}px)`, opacity: f > sec(2.6) ? 1 : 0 }}>👆</div>
        </div>
        <Line delay={sec(2.6)} size={46} weight={600} style={{ marginTop: 70, transformOrigin: "center bottom" }}>ไม่พลาดสื่อใหม่ทุกสัปดาห์</Line>
      </div>
      <Confetti at={sec(0.45)} x={540} y={700} count={90} seed="cta" power={44} />
      <Confetti at={sec(2.3)} x={540} y={1150} count={40} seed="cta2" power={30} />
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(f, [0, 5], [0.85, 0], { extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
