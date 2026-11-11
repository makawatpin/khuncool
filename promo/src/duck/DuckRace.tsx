import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Confetti, LetterPop, Marker, Shake, Shockwave, Sparkles, Tilt, useBeat } from "../components/fx";
import { Background, Card, Chip, Footage, Laptop, Line, Logo, Phone, usePop } from "../components/ui";
import { makeReel, type ReelConfig } from "../Reel";
import { Cuts, Flyer, Head } from "../scenes/scenes";
import { C, FONT, SAFE } from "../theme";

/** Video 2: the duck race (khuncool.com/duck-race). */

const sec = (s: number) => Math.round(s * 30);

// ── Duck mascots (the site's own sprites, public/brand/ducks, 300 px tall) ──
const Duck: React.FC<{ n: number; h: number; style?: React.CSSProperties; bob?: number; flip?: boolean }> = ({ n, h, style, bob = 1, flip }) => {
  const f = useCurrentFrame();
  const y = Math.abs(Math.sin((f + n * 7) / 5)) * -10 * bob;
  const r = Math.sin((f + n * 5) / 9) * 3 * bob;
  return (
    <Img
      src={staticFile(`brand/ducks/duck${((n - 1) % 6) + 1}.png`)}
      style={{ height: h, transform: `translateY(${y}px) rotate(${r}deg) scaleX(${flip ? -1 : 1})`, filter: "drop-shadow(0 18px 18px rgba(10,12,40,0.35))", ...style }}
    />
  );
};

/** All six ducks skating across the frame, staggered. */
const Parade: React.FC<{ y: number; h?: number; at?: number; speed?: number }> = ({ y, h = 250, at = 0, speed = 14 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((n, i) => (
        <div key={n} style={{ position: "absolute", top: y + (i % 2) * 40, left: -260 - i * 230 + f * speed }}>
          <Duck n={n} h={h - (i % 2) * 30} />
        </div>
      ))}
    </>
  );
};

/** Big beat-synced countdown number. */
const Count: React.FC<{ text: string; at: number; frames: number }> = ({ text, at, frames }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= frames) return null;
  const p = interpolate(f, [0, 5], [1.8, 1], { extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const o = interpolate(f, [frames - 3, frames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 380, color: C.white, transform: `scale(${p})`, opacity: o, textShadow: "0 20px 60px rgba(10,12,40,0.5)" }}>{text}</div>
    </AbsoluteFill>
  );
};

/** Search box that types its query out, grapheme by grapheme (Thai vowels stay attached). */
const SearchBox: React.FC<{ query: string; at: number; perChar?: number }> = ({ query, at, perChar = 2.2 }) => {
  const f = useCurrentFrame();
  const g = [...new Intl.Segmenter("th", { granularity: "grapheme" }).segment(query)].map((s) => s.segment);
  const shown = g.slice(0, Math.max(0, Math.floor((f - at) / perChar))).join("");
  const p = usePop(at - 6, 12, 180);
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 18, width: 840, padding: "22px 34px", borderRadius: 999, background: C.white,
        boxShadow: "0 20px 44px rgba(10,12,40,0.35)", fontFamily: FONT, fontWeight: 600, fontSize: 56, color: C.ink, transform: `scale(${p})`,
      }}
    >
      <span>🔍</span>
      <span>{shown}</span>
      <span style={{ width: 4, height: 60, background: C.primary, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />
    </div>
  );
};

// ── 1. Hook: the old way is boring ──────────────────────────────────────
const NAMES = ["เด็กชายกิตติ ใจดี", "เด็กหญิงชนากานต์ สุขใจ", "เด็กชายณัฐพงษ์ ทองมา", "เด็กหญิงปาริชาต แก้วใส", "เด็กชายภูริ เจริญสุข", "เด็กหญิงมนัสนันท์ ศรีทอง", "เด็กชายวรเมธ พูนผล"];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const row = Math.min(NAMES.length - 1, Math.floor(f / 9));
  const peek = usePop(durationInFrames - 26, 9, 170);
  return (
    <AbsoluteFill>
      <Background tint="linear-gradient(150deg, #8e93a6, #666c80)" />
      <Head top={300}>
        <Line size={84}>สุ่มชื่อแบบเดิม ๆ</Line>
        <Line delay={8} size={100}>เด็กเริ่ม<Marker delay={14} color={C.pink} textColor={C.white}>เบื่อ</Marker>แล้ว? 😴</Line>
      </Head>
      <Tilt delay={4} style={{ position: "absolute", top: 700, left: 90 }} float={0.6}>
        <div style={{ width: 700, padding: "30px 36px", borderRadius: 30, background: "#f4f5f8", boxShadow: "0 30px 60px rgba(10,12,40,0.35)", fontFamily: FONT, color: C.inkSoft }}>
          <div style={{ fontWeight: 700, fontSize: 40, color: C.ink, marginBottom: 14 }}>📋 ใครจะตอบข้อนี้…</div>
          {NAMES.map((n, i) => (
            <div key={n} style={{ display: "flex", gap: 18, fontSize: 34, padding: "9px 14px", borderRadius: 14, background: i === row ? "#dfe2ea" : "transparent" }}>
              <span style={{ width: 44, color: "#a3a9b8" }}>{String(i + 1).padStart(2, "0")}</span>
              <span>{n}</span>
              {i === row ? <span style={{ marginLeft: "auto" }}>👈</span> : null}
            </div>
          ))}
        </div>
      </Tilt>
      {/* floating z's */}
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 14) % 42) / 42;
        return <div key={i} style={{ position: "absolute", left: 800 + i * 40, top: 760 - t * 160, fontFamily: FONT, fontWeight: 700, fontSize: 60 + i * 14, color: "rgba(255,255,255,0.75)", opacity: Math.sin(t * Math.PI) }}>z</div>;
      })}
      {/* a duck peeks in at the end: the answer is coming */}
      <div style={{ position: "absolute", top: 1170, left: 1080 - peek * 330, transform: `rotate(${(1 - peek) * 20 - 8}deg)` }}>
        <Duck n={2} h={330} flip />
      </div>
    </AbsoluteFill>
  );
};

// ── 2. Reveal: สุ่มเป็ด ───────────────────────────────────────────────────
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
      <div style={{ position: "absolute", top: SAFE.top + 60, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 190, color: C.white, lineHeight: 1.1, textShadow: "0 12px 40px rgba(20,20,70,0.45)", transform: `scale(${title * (1 + beat * 0.04)}) rotate(${(1 - title) * -12}deg)` }}>
          สุ่มเป็ด
        </div>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 16 }}>
          <Logo size={78} style={{ transform: `scale(${usePop(8)})` }} />
          <LetterPop text="khuncool.com" delay={8} size={76} stagger={1.3} />
        </div>
        <div style={{ marginTop: 34 }}>
          <Chip delay={sec(1.3)} size={54} bg={C.sun}>🏁 ให้เป็ดแข่งกันเข้าเส้นชัย!</Chip>
        </div>
      </div>
      <Parade y={1060} h={300} at={4} speed={15} />
      <Confetti at={4} x={540} y={560} count={80} seed="dr-rev" power={42} />
    </AbsoluteFill>
  );
};

// ── 3. Names: type or paste from Excel ──────────────────────────────────
const Names: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={80}>พิมพ์ชื่อนักเรียน ⌨️</Line>
      <Line delay={sec(1.0)} size={80}>หรือ<Marker delay={sec(1.2)}>วางจาก Excel</Marker></Line>
    </Head>
    <Tilt delay={2} from="left" style={{ position: "absolute", top: 640, left: 30 }}>
      <Laptop width={760}>
        <Footage name="dr-bulk" start={0.4} rate={1.25} zoom={[1.0, 1.08]} />
      </Laptop>
    </Tilt>
    <Tilt from="right" style={{ position: "absolute", top: 540, left: 540 }} float={1.4}>
      <Phone width={410}>
        <Footage name="m-dr-type" start={0.5} rate={1.9} />
      </Phone>
    </Tilt>
    <div style={{ position: "absolute", top: 1410, left: SAFE.left + 10 }}>
      <Chip delay={sec(2.4)} size={48} bg={C.sun}>📋 ทั้งห้องในครั้งเดียว</Chip>
    </div>
  </AbsoluteFill>
);

// ── 4. Roll numbers 1–40 ─────────────────────────────────────────────────
const ROLL_CLICK = 1.85; // scene second when the phone footage presses "ใช้เลขที่ 1-40"
const Roll: React.FC = () => {
  const f = useCurrentFrame();
  const count = Math.round(interpolate(f, [sec(ROLL_CLICK), sec(ROLL_CLICK + 0.9)], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const stamp = usePop(sec(ROLL_CLICK + 0.9), 7, 260);
  return (
    <AbsoluteFill>
      <Background />
      <Head>
        <Line size={64} weight={600}>ไม่อยากพิมพ์ชื่อ? 🤔</Line>
        <Line delay={sec(0.6)} size={88}>กด<Marker delay={sec(0.8)}>สุ่มเลขที่ 1–40</Marker></Line>
      </Head>
      <Tilt from="left" style={{ position: "absolute", top: 560, left: 50 }} float={1.2}>
        <Phone width={430}>
          <Footage name="m-dr-roll" start={0.4} rate={1.3} />
        </Phone>
      </Tilt>
      {/* 40 ducks filling a grid, in step with the phone */}
      <div style={{ position: "absolute", top: 640, left: 520, width: 380, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const on = i < count;
          return (
            <Img
              key={i}
              src={staticFile(`brand/ducks/duck${(i % 6) + 1}.png`)}
              style={{ height: 70, opacity: on ? 1 : 0.15, transform: `scale(${on ? 1 : 0.6})`, filter: on ? "drop-shadow(0 6px 6px rgba(10,12,40,0.3))" : "grayscale(1)" }}
            />
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1240, left: 540, fontFamily: FONT, fontWeight: 700, color: C.white, textShadow: "0 8px 26px rgba(20,20,70,0.4)" }}>
        <div style={{ fontSize: 120, lineHeight: 1 }}>{count} <span style={{ fontSize: 60 }}>ตัว</span></div>
      </div>
      <div style={{ position: "absolute", top: 1400, left: 520, transform: `scale(${stamp}) rotate(${-5 + (1 - stamp) * 30}deg)`, opacity: Math.min(1, stamp * 2) }}>
        <Chip size={44} bg={C.sun}>⚡ คลิกเดียวครบ!</Chip>
      </div>
      <Confetti at={sec(ROLL_CLICK + 0.9)} x={720} y={1000} count={50} seed="roll" power={32} />
    </AbsoluteFill>
  );
};

// ── 5. Race: 3-2-1 on the beat, then 40 ducks go ────────────────────────
const Race: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const beatF = 15; // ≈ one beat at 118 BPM (0.51 s)
  const go = beatF * 3;
  return (
    <AbsoluteFill>
      <Background />
      <Head>
        <Shake at={go} frames={12} amp={14}>
          <Line delay={go} size={110}>ปล่อยเป็ด! 🚀</Line>
        </Shake>
      </Head>
      <Tilt from="bottom" style={{ position: "absolute", top: 520, left: 40 }}>
        <Card w={1000} h={820}>
          <Cuts
            total={durationInFrames}
            shots={[
              { at: 0, el: <Footage name="dr-race40" start={1.15} position="25% 60%" /> },
              { at: go / 30, el: <Footage name="dr-race40" start={4.1} position="35% 60%" zoom={[1.05, 1.2]} zoomFrames={120} /> },
            ]}
          />
        </Card>
      </Tilt>
      <Count text="3" at={0} frames={beatF} />
      <Count text="2" at={beatF} frames={beatF} />
      <Count text="1" at={beatF * 2} frames={beatF} />
      <Flyer emoji="📣" from={[-120, 1400]} to={[1100, 1330]} at={go + 20} frames={sec(1.6)} size={100} />
      <div style={{ position: "absolute", top: 1410, left: SAFE.left + 10 }}>
        <Chip delay={go + 18} size={52} bg={C.sun}>🦆 ลุ้นกันทั้งห้อง!</Chip>
      </div>
      <Confetti at={go} x={540} y={760} count={60} seed="go" power={40} />
    </AbsoluteFill>
  );
};

// ── 6. Podium: places 1-3 ────────────────────────────────────────────────
const Podium: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={72} weight={600}>เข้าเส้นชัยแล้ว! 🏁</Line>
      <Line delay={sec(0.7)} size={88}>ดู<Marker delay={sec(0.9)}>อันดับ 1–3</Marker> ได้เลย</Line>
    </Head>
    <Tilt from="bottom" style={{ position: "absolute", top: 560, left: 40 }}>
      <Card w={1000} h={840}>
        {/* the site's winner card sits at the centre of the frame (x 38–62 %, y 22–78 %) */}
        <Footage name="dr-race" start={9.6} zoom={[1.5, 1.62]} focus={[50, 50]} zoomFrames={120} />
      </Card>
    </Tilt>
    <div style={{ position: "absolute", top: 1430, left: SAFE.left + 10, display: "flex", gap: 14 }}>
      <Chip delay={sec(1.2)} size={46}>🥇 อันดับ 1</Chip>
      <Chip delay={sec(1.45)} size={46}>🥈 2</Chip>
      <Chip delay={sec(1.7)} size={46}>🥉 3</Chip>
    </div>
    <Confetti at={8} x={540} y={900} count={80} seed="pod" power={44} />
    <Sparkles x={120} y={560} w={840} h={800} at={10} seed="pod" count={10} />
  </AbsoluteFill>
);

// ── 7. Any screen ────────────────────────────────────────────────────────
const Screens: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={84}>ฉาย<Marker delay={6}>เต็มจอ</Marker> 📽️</Line>
      <Line delay={sec(1.4)} size={84}>หรือเปิดบน<Marker delay={sec(1.6)}>มือถือ</Marker> 📱</Line>
    </Head>
    <Tilt delay={2} from="left" style={{ position: "absolute", top: 600, left: 30 }}>
      <Laptop width={830}>
        <Footage name="dr-race" start={4.6} />
      </Laptop>
    </Tilt>
    <Tilt delay={sec(1.4)} from="right" style={{ position: "absolute", top: 720, left: 600 }} float={1.6}>
      <Phone width={310}>
        <Footage name="m-dr-race" start={4.4} />
      </Phone>
    </Tilt>
  </AbsoluteFill>
);

// ── 8. Call to action ────────────────────────────────────────────────────
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
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 130, color: C.white, textShadow: "0 10px 34px rgba(20,20,70,0.4)", transform: `scale(${logo})` }}>สุ่มเป็ด</div>
        </div>
        <Chip delay={sec(0.5)} size={50} bg={C.sun} style={{ marginTop: 30 }}>✨ ใช้ฟรี ไม่ต้องสมัคร</Chip>
        <div style={{ marginTop: 60 }}>
          <SearchBox query="สุ่มเป็ด คุณคูล" at={sec(1.1)} />
        </div>
        <div style={{ marginTop: 34 }}>
          <LetterPop text="khuncool.com/duck-race" delay={sec(2.2)} size={62} stagger={1} />
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
      <Parade y={1340} h={230} at={sec(0.3)} speed={13} />
      <Confetti at={sec(2.2)} x={540} y={860} count={70} seed="dr-cta" power={40} />
    </AbsoluteFill>
  );
};

export const DUCK_RACE: ReelConfig = {
  id: "duck-race",
  scenes: [
    { id: "hook", component: Hook, minSeconds: 3.6, punch: 0, sfx: [{ at: 0.3, sfx: "pop", volume: 0.4 }] },
    { id: "reveal", component: Reveal, minSeconds: 4.4, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 1.3, sfx: "sparkle", volume: 0.5 }] },
    { id: "names", component: Names, minSeconds: 4.4, sfx: [{ at: 2.4, sfx: "pop", volume: 0.5 }] },
    { id: "roll", component: Roll, minSeconds: 5.2, sfx: [{ at: ROLL_CLICK, sfx: "pop", volume: 0.55 }, { at: ROLL_CLICK + 0.9, sfx: "sparkle", volume: 0.55 }] },
    {
      id: "race", component: Race, minSeconds: 5.4,
      sfx: [{ at: 0, sfx: "pop", volume: 0.6 }, { at: 0.5, sfx: "pop", volume: 0.6 }, { at: 1.0, sfx: "pop", volume: 0.6 }, { at: 1.5, sfx: "boom", volume: 0.8 }],
    },
    { id: "podium", component: Podium, minSeconds: 4.0, sfx: [{ at: 0.25, sfx: "sparkle", volume: 0.6 }, { at: 1.2, sfx: "pop", volume: 0.4 }, { at: 1.45, sfx: "pop", volume: 0.4 }, { at: 1.7, sfx: "pop", volume: 0.4 }] },
    { id: "screens", component: Screens, minSeconds: 4.0 },
    { id: "cta", component: Cta, minSeconds: 5.8, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 2.2, sfx: "sparkle", volume: 0.5 }, { at: 3.0, sfx: "pop", volume: 0.6 }] },
  ],
  transitions: ["flash", "flash", "wipe", "circle", "wipe", "flash", "circle", "flash"],
};

export const DuckRace = makeReel(DUCK_RACE);
