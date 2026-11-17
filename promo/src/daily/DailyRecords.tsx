import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Confetti, LetterPop, Marker, Shockwave, Sparkles, Tilt, useBeat } from "../components/fx";
import { Background, Card, Chip, Footage, Laptop, Line, Logo, Phone, usePop } from "../components/ui";
import { makeReel, type ReelConfig } from "../Reel";
import { Head } from "../scenes/scenes";
import { C, FONT, SAFE } from "../theme";

/** Video 5: daily records, toothbrushing / milk / savings (khuncool.com/tools). */

const sec = (s: number) => Math.round(s * 30);

/** Seconds of picture + music before the first word. Keep in sync with "lead" in videos/daily-records.json. */
export const LEAD = 0.8;

const ICONS = ["🪥", "🥛", "💰"];

/** The three tools' icons hopping in one after another on the beat. */
const IconRow: React.FC<{ y: number; at?: number; size?: number }> = ({ y, at = 0, size = 150 }) => {
  const f = useCurrentFrame() - at;
  const beat = useBeat();
  if (f < 0) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60 }}>
      {ICONS.map((e, i) => {
        const p = interpolate(f, [i * 5, i * 5 + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
        return (
          <div key={e} style={{ fontSize: size, lineHeight: 1, transform: `translateY(${(1 - p) * 120 - Math.abs(Math.sin((f + i * 9) / 6)) * 14}px) scale(${p * (1 + beat * 0.06)})`, opacity: p, filter: "drop-shadow(0 14px 14px rgba(10,12,40,0.3))" }}>
            {e}
          </div>
        );
      })}
    </div>
  );
};

// ── 1. Hook: the paper notebook (already ticking at frame 0; voice starts at LEAD) ──
const ROWS = ["กิตติ", "ชนากานต์", "ณัฐพงษ์", "ปาริชาต", "ภูริ", "มนัสนันท์", "วรเมธ", "อริสา"];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const tick = Math.floor(f / 6);
  return (
    <AbsoluteFill>
      <Background tint="linear-gradient(150deg, #8e93a6, #666c80)" />
      <Head top={290}>
        <Line size={76}>แปรงฟัน ดื่มนม ออมเงิน</Line>
        <Line delay={8} size={96}>ต้องจดมือ<Marker delay={14} color={C.pink} textColor={C.white}>ทุกวัน</Marker>? 😩</Line>
      </Head>
      <Tilt delay={2} style={{ position: "absolute", top: 690, left: 80 }} float={0.6}>
        <div style={{ width: 800, padding: "34px 44px", borderRadius: 26, background: "#f7f3e6", boxShadow: "0 30px 60px rgba(10,12,40,0.35)", fontFamily: FONT, color: "#555a6b" }}>
          <div style={{ display: "flex", fontWeight: 700, fontSize: 40, color: C.ink, marginBottom: 12 }}>
            <span style={{ flex: 1 }}>📒 สมุดจดประจำวัน</span>
            <span style={{ width: 90, textAlign: "center" }}>🪥</span>
            <span style={{ width: 90, textAlign: "center" }}>🥛</span>
            <span style={{ width: 90, textAlign: "center" }}>💰</span>
          </div>
          {ROWS.map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", fontSize: 44, padding: "15px 0", borderTop: "2px solid #d9d3bd" }}>
              <span style={{ width: 54, color: "#a9a48f" }}>{i + 1}</span>
              <span style={{ flex: 1 }}>{n}</span>
              {[0, 1, 2].map((c) => {
                const at = i * 3 + c;
                return <span key={c} style={{ width: 90, textAlign: "center", fontWeight: 700, color: "#4a4f63", opacity: tick >= at ? 1 : 0, transform: `rotate(${(i * 7 + c * 5) % 12 - 6}deg)` }}>✓</span>;
              })}
            </div>
          ))}
        </div>
      </Tilt>
      {/* a tired hand, wobbling over the notebook */}
      <div style={{ position: "absolute", left: 800 + Math.sin(f / 4) * 14, top: 640 + Math.cos(f / 5) * 10, fontSize: 120, transform: `rotate(${Math.sin(f / 6) * 10}deg)` }}>✍️</div>
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
      <div style={{ position: "absolute", top: SAFE.top + 50, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 132, color: C.white, lineHeight: 1.15, textShadow: "0 12px 40px rgba(20,20,70,0.45)", transform: `scale(${title * (1 + beat * 0.04)}) rotate(${(1 - title) * -12}deg)` }}>
          บันทึกประจำวัน
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16 }}>
          <Logo size={78} style={{ transform: `scale(${usePop(8)})` }} />
          <LetterPop text="khuncool.com" delay={8} size={76} stagger={1.3} />
        </div>
        <div style={{ marginTop: 34 }}>
          <Chip delay={sec(1.3)} size={54} bg={C.sun}>✨ ใช้ฟรีทั้งหมด</Chip>
        </div>
      </div>
      <IconRow y={1060} at={6} />
      <Confetti at={4} x={540} y={560} count={80} seed="dc-rev" power={42} />
    </AbsoluteFill>
  );
};

// ── 3-5. One tool on a phone, with a live counter on the right ──────────
type Story = {
  headTop: React.ReactNode;
  headMain: React.ReactNode;
  shot: string;
  /** clip second to start from */
  start: number;
  emoji: string;
  /** counter: scene second it starts, scene second it ends, final value, text before/after the number */
  count: { from: number; to: number; value: number; prefix?: string; suffix: string; label: string };
  /** a second event (scene second), e.g. one student marked ✗ */
  stamp?: { at: number; text: string };
  chip: { at: number; text: string };
};
const Daily: React.FC<Story> = ({ headTop, headMain, shot, start, emoji, count, stamp, chip }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [sec(count.from), sec(count.to)], [0, count.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pop = usePop(sec(count.to), 7, 240);
  const st = usePop(stamp ? sec(stamp.at) : 9999, 7, 260);
  return (
    <AbsoluteFill>
      <Background />
      <Head>
        <Line size={68} weight={600}>{headTop}</Line>
        <Line delay={sec(0.6)} size={90}>{headMain}</Line>
      </Head>
      <Tilt from="left" style={{ position: "absolute", top: 560, left: 50 }} float={1.2}>
        <Phone width={420}>
          <Footage name={shot} start={start} />
        </Phone>
      </Tilt>
      <div style={{ position: "absolute", top: 640, left: 540, width: 370, fontFamily: FONT, fontWeight: 700, color: C.white, textShadow: "0 8px 26px rgba(20,20,70,0.4)" }}>
        <div style={{ fontSize: 130, lineHeight: 1, transform: `scale(${1 + (1 - pop) * 0.3})`, transformOrigin: "left center" }}>{emoji}</div>
        <div style={{ fontSize: 120, lineHeight: 1.1, marginTop: 14 }}>{count.prefix}{n}</div>
        <div style={{ fontSize: 50, fontWeight: 600 }}>{count.suffix}</div>
        <div style={{ marginTop: 18, fontSize: 40, fontWeight: 600, opacity: 0.9 }}>{count.label}</div>
      </div>
      {stamp ? (
        <div style={{ position: "absolute", top: 1160, left: 540, transform: `scale(${st}) rotate(${-5 + (1 - st) * 30}deg)`, opacity: Math.min(1, st * 2) }}>
          <Chip size={44} bg={C.pink} color={C.white}>{stamp.text}</Chip>
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 1430, left: SAFE.left + 10 }}>
        <Chip delay={sec(chip.at)} size={46} bg={C.sun}>{chip.text}</Chip>
      </div>
      <Confetti at={sec(count.to)} x={720} y={900} count={46} seed={`dc-${shot}`} power={30} />
    </AbsoluteFill>
  );
};

const Tooth: React.FC = () => (
  <Daily
    headTop="แปรงฟัน 🪥" headMain={<>กด<Marker delay={sec(0.8)}>ครั้งเดียว</Marker>ครบห้อง</>}
    shot="m-dc-tooth" start={0.3} emoji="🪥"
    count={{ from: 0.93, to: 1.2, value: 8, suffix: "คน แปรงแล้ว ✓", label: "ทั้งห้องในคลิกเดียว" }}
    stamp={{ at: 2.47, text: "✗ เฉพาะคนไม่แปรง" }}
    chip={{ at: 2.9, text: "👆 แตะ ✗ ให้คนที่ไม่แปรง" }}
  />
);
const Milk: React.FC = () => (
  <Daily
    headTop="ดื่มนม 🐄" headMain={<>ง่ายเหมือนกัน กด<Marker delay={sec(0.8)}>ทีเดียว</Marker></>}
    shot="m-dc-milk" start={0.3} emoji="🥛"
    count={{ from: 0.93, to: 1.2, value: 8, suffix: "คน ดื่มแล้ว ✓", label: "ครบทุกคนในคลิกเดียว" }}
    stamp={{ at: 2.5, text: "✗ คนที่ไม่ดื่ม" }}
    chip={{ at: 2.9, text: "🐄 บันทึกดื่มนมรายวัน" }}
  />
);
const Save: React.FC = () => (
  <Daily
    headTop="ออมเงิน 💰" headMain={<>ฝาก<Marker delay={sec(0.8)}>ทั้งห้อง</Marker>ครั้งเดียว</>}
    shot="m-dc-save" start={0.3} emoji="💰"
    count={{ from: 1.77, to: 2.3, value: 160, prefix: "฿", suffix: "ยอดรวมทั้งห้อง", label: "ฝากคนละ ฿20" }}
    chip={{ at: 2.8, text: "📊 เห็นยอดรวมทันที" }}
  />
);

// ── 6. Monthly table ─────────────────────────────────────────────────────
const Month: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={72} weight={600}>สรุปเป็นตารางรายเดือน 🗓️</Line>
      <Line delay={sec(0.7)} size={88}>พิมพ์<Marker delay={sec(0.9)}>ฟอร์ม A4</Marker> ได้เลย</Line>
    </Head>
    <Tilt from="bottom" style={{ position: "absolute", top: 560, left: 40 }}>
      <Card w={1000} h={660}>
        <Footage name="d-dc-month" start={0.8} position="0% 0%" zoom={[1.75, 1.9]} focus={[0, 4]} zoomFrames={120} />
      </Card>
    </Tilt>
    <div style={{ position: "absolute", top: 1290, left: SAFE.left + 10, display: "flex", gap: 14, flexWrap: "wrap", maxWidth: 860 }}>
      <Chip delay={sec(1.4)} size={46}>📊 ส่งออก Excel</Chip>
      <Chip delay={sec(1.9)} size={46} bg={C.sun}>🖨️ พิมพ์ A4</Chip>
      <Chip delay={sec(2.4)} size={46}>% รายคน</Chip>
    </div>
    <Sparkles x={120} y={560} w={840} h={660} at={sec(1.2)} seed="dc-month" count={8} />
  </AbsoluteFill>
);

// ── 7. Screens + sync ────────────────────────────────────────────────────
const Screens: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Head>
      <Line size={84}>ใช้ได้ทั้ง<Marker delay={6}>คอม</Marker> 💻</Line>
      <Line delay={sec(1.4)} size={84}>และ<Marker delay={sec(1.6)}>มือถือ</Marker> 📱</Line>
    </Head>
    <Tilt delay={2} from="left" style={{ position: "absolute", top: 640, left: 30 }}>
      <Laptop width={830}>
        <Footage name="d-dc-tooth" start={0.3} />
      </Laptop>
    </Tilt>
    <Tilt delay={sec(1.4)} from="right" style={{ position: "absolute", top: 760, left: 600 }} float={1.6}>
      <Phone width={310}>
        <Footage name="m-dc-tooth" start={0.3} />
      </Phone>
    </Tilt>
    <div style={{ position: "absolute", top: 1430, left: SAFE.left + 10 }}>
      <Chip delay={sec(2.4)} size={46} bg={C.sun}>🔄 สมัครฟรี ซิงก์ทุกเครื่อง</Chip>
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
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 110, color: C.white, textShadow: "0 10px 34px rgba(20,20,70,0.4)", transform: `scale(${logo})` }}>เครื่องมือครู</div>
        </div>
        <Chip delay={sec(0.5)} size={50} bg={C.sun} style={{ marginTop: 30 }}>✨ ใช้ฟรี ไม่ต้องสมัคร</Chip>
        <div style={{ marginTop: 60 }}>
          <SearchBox query="เครื่องมือครู คุณคูล" at={sec(1.1)} />
        </div>
        <div style={{ marginTop: 34 }}>
          <LetterPop text="khuncool.com/tools" delay={sec(2.2)} size={62} stagger={1} />
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
      <IconRow y={1340} at={sec(0.3)} size={130} />
      <Confetti at={sec(2.2)} x={540} y={860} count={70} seed="dc-cta" power={40} />
    </AbsoluteFill>
  );
};

export const DAILY_RECORDS: ReelConfig = {
  id: "daily-records",
  lead: LEAD,
  scenes: [
    { id: "hook", component: Hook, minSeconds: 3.6, punch: 0, sfx: [{ at: 0.15, sfx: "pop", volume: 0.4 }, { at: 0.55, sfx: "pop", volume: 0.4 }] },
    { id: "reveal", component: Reveal, minSeconds: 4.4, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 1.3, sfx: "sparkle", volume: 0.5 }] },
    { id: "tooth", component: Tooth, minSeconds: 4.4, sfx: [{ at: 0.93, sfx: "pop", volume: 0.55 }, { at: 1.2, sfx: "sparkle", volume: 0.5 }, { at: 2.47, sfx: "pop", volume: 0.5 }, { at: 2.9, sfx: "pop", volume: 0.4 }] },
    { id: "milk", component: Milk, minSeconds: 4.2, sfx: [{ at: 0.93, sfx: "pop", volume: 0.55 }, { at: 1.2, sfx: "sparkle", volume: 0.5 }, { at: 2.5, sfx: "pop", volume: 0.5 }] },
    { id: "save", component: Save, minSeconds: 4.2, sfx: [{ at: 1.77, sfx: "pop", volume: 0.55 }, { at: 2.3, sfx: "sparkle", volume: 0.55 }, { at: 2.8, sfx: "pop", volume: 0.4 }] },
    { id: "month", component: Month, minSeconds: 4.4, sfx: [{ at: 0.25, sfx: "sparkle", volume: 0.5 }, { at: 1.4, sfx: "pop", volume: 0.4 }, { at: 1.9, sfx: "pop", volume: 0.4 }, { at: 2.4, sfx: "pop", volume: 0.4 }] },
    { id: "screens", component: Screens, minSeconds: 4.0, sfx: [{ at: 1.6, sfx: "pop", volume: 0.5 }, { at: 2.4, sfx: "pop", volume: 0.4 }] },
    { id: "cta", component: Cta, minSeconds: 5.8, sfx: [{ at: 0, sfx: "boom", volume: 0.8 }, { at: 2.2, sfx: "sparkle", volume: 0.5 }, { at: 3.0, sfx: "pop", volume: 0.6 }] },
  ],
  transitions: ["flash", "flash", "wipe", "circle", "wipe", "circle", "wipe", "flash"],
};

export const DailyRecords = makeReel(DAILY_RECORDS);
