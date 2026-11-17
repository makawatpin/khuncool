import React from "react";
import {
  AbsoluteFill, Audio, Composition, Freeze, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { BeatContext, Confetti, Marker, Shake, Sparkles, Tilt, useBeat } from "../components/fx";
import { Line, usePop } from "../components/ui";
import { useFonts } from "../Reel";
import { C, FONT, FONT_LATIN, FPS, H, W } from "../theme";
import type { Beats } from "../timeline";

/**
 * English short: "at / on / in" with time. The teacher's own talking-head
 * clip (public/footage/en-time.mp4, from IMG_7440.MOV) plays full frame; the
 * graphics sit on the empty wall left of her face (x 40–460, y 450–1050), a
 * top bar above her head, and a sentence card over the shirt for the examples.
 *
 * Voice = the clip's own sound, cleaned and levelled to −16 LUFS in
 * public/footage/en-time-voice.wav (see README). No TTS, no Gemini.
 * No background music (the teacher asked for voice only); pass
 * --props='{"music":"bgm.mp3"}' to bring it back.
 */

const sec = (s: number) => Math.round(s * FPS);

/**
 * Word onsets in seconds, measured from the clip's loudness envelope
 * (ffmpeg astats, 50 ms windows). Re-measure if the clip is re-recorded.
 */
const T = {
  at0: 1.1, on0: 1.75, in0: 2.4, how: 3.05, // "at, on, in ใช้ยังไง"
  atSec: 4.35, atTime: 5.25, atClock: 6.35, at6: 8.25, atNight: 10.3, // "at ใช้กับช่วงเวลา หรือกี่โมง" · at 6:00 · at night
  onSec: 12.1, onDay: 13.0, onMon: 14.4, onBday: 16.45, // "on ใช้กับวัน" · on Monday · on my birthday
  inSec: 18.45, inMonth: 19.5, inYear: 20.5, inJuly: 21.65, in2026: 23.9, // "in ใช้กับเดือน หรือปี" · in July · in 2026
  exSec: 26.1, exHead: 26.35, // "ยกตัวอย่างประโยค"
  ex1: 28.75, ex1at: 29.8, ex2: 33.1, ex2on: 33.8, ex3: 35.8, ex3in: 36.6,
  end: 38.84, // clip ends; outro holds the last frame
};
const OUTRO = 2.7;
export const EN_TIME_FRAMES = sec(T.end) + sec(OUTRO);

/** Speech stretches (silencedetect −30 dB), used to duck the music under the voice. */
const SPEECH: [number, number][] = [
  [1.1, 3.76], [4.55, 7.21], [8.24, 9.22], [10.3, 10.98], [12.3, 13.72], [14.4, 15.24], [16.45, 17.58],
  [18.7, 20.9], [21.65, 22.56], [23.9, 25.29], [26.35, 27.3], [28.75, 30.79], [33.06, 34.35], [35.8, 37.98],
];

type Prep = "at" | "on" | "in";
const PREP: Record<Prep, { bg: string; fg: string; icon: string }> = {
  at: { bg: C.sun, fg: C.ink, icon: "⏰" },
  on: { bg: C.primary, fg: C.white, icon: "📅" },
  in: { bg: C.pink, fg: C.white, icon: "🗓️" },
};
const PREPS: Prep[] = ["at", "on", "in"];

/** Which words are lit in the top bar, from each second onward. */
const ACTIVE: [number, Prep[]][] = [
  [0, ["at", "on", "in"]],
  [T.atSec, ["at"]],
  [T.onSec, ["on"]],
  [T.inSec, ["in"]],
  [T.exSec, []],
  [T.ex1at, ["at"]],
  [T.ex2on, ["on"]],
  [T.ex3in, ["in"]],
  [T.end, ["at", "on", "in"]],
];

/** 0..1 how lit `p` is at frame f, easing over 6 frames at each switch. */
function lit(f: number, p: Prep) {
  let i = 0;
  while (i + 1 < ACTIVE.length && f >= sec(ACTIVE[i + 1][0])) i++;
  const now = ACTIVE[i][1].includes(p) ? 1 : 0;
  if (i === 0) return now;
  const before = ACTIVE[i - 1][1].includes(p) ? 1 : 0;
  return interpolate(f - sec(ACTIVE[i][0]), [0, 6], [before, now], { extrapolateRight: "clamp" });
}

// ── Pieces ────────────────────────────────────────────────────────────────

/** Solid pill with a preposition in its colour. */
const PrepPill: React.FC<{ p: Prep; size: number; delay?: number; glow?: number }> = ({ p, size, delay = 0, glow = 1 }) => {
  const pop = usePop(delay, 8, 240);
  const beat = useBeat(6);
  const { bg, fg } = PREP[p];
  return (
    <div
      style={{
        display: "inline-block", fontFamily: FONT_LATIN, fontWeight: 700, fontSize: size, lineHeight: 1, color: fg, background: bg,
        padding: `${size * 0.14}px ${size * 0.42}px ${size * 0.2}px`, borderRadius: size * 0.36,
        boxShadow: `0 ${10 + glow * 8}px ${20 + glow * 14}px rgba(10,12,40,${0.18 + glow * 0.17})`,
        opacity: Math.min(1, pop * 2) * (0.42 + glow * 0.58),
        transform: `scale(${pop * (0.86 + glow * 0.14) * (1 + glow * beat * 0.05)}) rotate(${(1 - pop) * -16}deg)`,
      }}
    >
      {p}
    </div>
  );
};

/** White pill: "<prep> rest emoji", the preposition in its colour. */
const Example: React.FC<{ p: Prep; rest: string; emoji: string; delay: number }> = ({ p, rest, emoji, delay }) => {
  const pop = usePop(delay, 8, 240);
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 30px 14px", borderRadius: 999, background: C.white,
        fontFamily: FONT_LATIN, fontWeight: 700, fontSize: 52, lineHeight: 1.1, color: C.ink, whiteSpace: "nowrap",
        boxShadow: "0 14px 30px rgba(10,12,40,0.3)", opacity: Math.min(1, pop * 2),
        transform: `translateX(${(1 - pop) * -120}px) scale(${pop}) rotate(${(1 - pop) * 10}deg)`, transformOrigin: "left center",
      }}
    >
      <span>
        <span style={{ color: p === "at" ? "#d99a00" : PREP[p].bg }}>{p}</span>
        {rest}
      </span>
      <span style={{ fontSize: 46 }}>{emoji}</span>
    </div>
  );
};

/** Slides its children off to the left over the last 9 frames of `dur`. */
const Leave: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [dur - 9, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  return <AbsoluteFill style={{ transform: `translateX(${-k * 700}px) rotate(${-k * 8}deg)`, opacity: 1 - k * 0.6 }}>{children}</AbsoluteFill>;
};

/** Top bar: "⏰ บอกเวลา" tag, then at · on · in, the one being taught lit up. */
const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const tag = usePop(-12, 10, 200);
  return (
    <div style={{ position: "absolute", left: 60, top: 212 }}>
      <div
        style={{
          display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.white, background: C.ink,
          padding: "8px 28px 10px", borderRadius: 999, boxShadow: "0 12px 26px rgba(10,12,40,0.3)",
          opacity: Math.min(1, tag * 2), transform: `scale(${tag})`, transformOrigin: "left center",
        }}
      >
        ⏰ บอก<span style={{ color: C.sun }}>เวลา</span>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 18, alignItems: "center" }}>
        {PREPS.map((p) => (
          <PrepPill key={p} p={p} size={84} delay={sec(T[`${p}0` as "at0"])} glow={lit(f, p)} />
        ))}
      </div>
    </div>
  );
};

/** The clip, full frame, with a small punch-in whenever a new part starts. Holds the last frame for the outro. */
const Clip: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const starts = [T.atSec, T.onSec, T.inSec, T.exSec, T.end].map(sec);
  const last = [...starts].reverse().find((s) => f >= s);
  const punch = last === undefined ? 0 : Math.max(0, 1 - spring({ frame: f - last, fps, config: { damping: 12, stiffness: 180 } })) * 0.035;
  const outroZoom = interpolate(f, [sec(T.end), EN_TIME_FRAMES], [1, 1.05], { extrapolateLeft: "clamp" });
  const video = <OffthreadVideo src={staticFile("footage/en-time.mp4")} muted style={{ width: W, height: H, objectFit: "cover" }} />;
  return (
    <AbsoluteFill style={{ transform: `scale(${(1 + punch) * outroZoom})`, transformOrigin: "60% 35%" }}>
      {f < sec(T.end) ? video : <Freeze frame={sec(T.end) - 2}>{video}</Freeze>}
    </AbsoluteFill>
  );
};

// ── Parts ─────────────────────────────────────────────────────────────────

/** 0 → atSec: big swinging clock from frame 0, then "ใช้ยังไง?" when she asks. */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const clock = usePop(-8, 10, 160);
  return (
    <Leave dur={sec(T.atSec)}>
      <div
        style={{
          position: "absolute", left: 70, top: 470, fontSize: 230, lineHeight: 1, filter: "drop-shadow(0 18px 20px rgba(10,12,40,0.35))",
          transform: `scale(${clock}) rotate(${Math.sin(f / 4) * 12}deg)`, transformOrigin: "50% 15%",
        }}
      >
        ⏰
      </div>
      <div style={{ position: "absolute", left: 40, top: 780 }}>
        <Shake at={sec(T.how) + 6} amp={12}>
          <Line delay={sec(T.how)} size={78} style={{ background: C.ink, padding: "10px 34px 16px", borderRadius: 30, textShadow: "none" }}>
            ใช้ยังไง? 🤔
          </Line>
        </Shake>
      </div>
    </Leave>
  );
};

type SectionProps = {
  p: Prep; from: number; to: number;
  rule: { text: string; at: number }[];
  examples: { rest: string; emoji: string; at: number }[];
};

/** One preposition: card with the word, its icon and the rule, then the examples popping in below. */
const Section: React.FC<SectionProps> = ({ p, from, to, rule, examples }) => {
  const f = useCurrentFrame();
  const rel = (s: number) => sec(s) - sec(from);
  const { bg, icon } = PREP[p];
  return (
    <Leave dur={sec(to) - sec(from)}>
      <div style={{ position: "absolute", left: 40, top: 450, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
        <Tilt from="left">
          <div
            style={{
              width: 400, padding: "26px 30px 30px", borderRadius: 36, background: "rgba(255,255,255,0.96)",
              boxShadow: "0 30px 60px rgba(10,12,40,0.35)", borderTop: `14px solid ${bg}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <PrepPill p={p} size={118} delay={4} />
              <div style={{ fontSize: 104, lineHeight: 1, transform: `rotate(${Math.sin(f / 7) * 8}deg) translateY(${Math.sin(f / 9) * 5}px)` }}>{icon}</div>
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38, color: C.inkSoft, marginTop: 20, opacity: f >= rel(rule[0].at) - 4 ? 1 : 0 }}>
              ใช้กับ
            </div>
            {rule.map((r) => (
              <Line key={r.text} delay={rel(r.at)} size={72} color={C.ink} style={{ textShadow: "none", lineHeight: 1.18 }}>
                {r.text}
              </Line>
            ))}
          </div>
        </Tilt>
        {examples.map((e) => (
          <Example key={e.rest} p={p} rest={e.rest} emoji={e.emoji} delay={rel(e.at)} />
        ))}
      </div>
    </Leave>
  );
};

const RECAP: { p: Prep; th: string }[] = [
  { p: "at", th: "กี่โมง" },
  { p: "on", th: "วัน" },
  { p: "in", th: "เดือน / ปี" },
];

const SENTENCES: { p: Prep; before: string; after: string; th: string; at: number; prepAt: number }[] = [
  { p: "at", before: "I wake up ", after: " 6:00.", th: "ฉันตื่นนอนตอน 6 โมง", at: T.ex1, prepAt: T.ex1at },
  { p: "on", before: "See you ", after: " Friday.", th: "เจอกันวันศุกร์นะ", at: T.ex2, prepAt: T.ex2on },
  { p: "in", before: "I was born ", after: " 1995.", th: "ฉันเกิดปี 1995", at: T.ex3, prepAt: T.ex3in },
];

/** exSec → end: "ยกตัวอย่างประโยค" + recap on the left, sentences on a card over the shirt. */
const Examples: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + sec(T.exSec); // composition frame
  const rel = (s: number) => sec(s) - sec(T.exSec);
  const leftDur = sec(T.end) - sec(T.exSec);
  return (
    <>
      <Sequence durationInFrames={leftDur} layout="none">
        <Leave dur={leftDur}>
          <div style={{ position: "absolute", left: 40, top: 450, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
            <Tilt from="left">
              <div style={{ width: 400, padding: "20px 30px 26px", borderRadius: 34, background: C.primary, boxShadow: "0 30px 60px rgba(10,12,40,0.35)" }}>
                <Line delay={rel(T.exHead)} size={64} style={{ textShadow: "none" }}>ยกตัวอย่าง</Line>
                <Line delay={rel(T.exHead) + 6} size={64} style={{ textShadow: "none" }}>ประโยค ✍️</Line>
              </div>
            </Tilt>
            {RECAP.map((r, i) => {
              const on = lit(g, r.p);
              return (
                <RecapRow key={r.p} p={r.p} th={r.th} delay={rel(T.exHead) + 16 + i * 5} glow={on} />
              );
            })}
          </div>
        </Leave>
      </Sequence>
      {/* sentence card: stays through the outro so the three examples can be screenshotted */}
      <Sequence from={rel(T.ex1) - 6} layout="none">
        <Tilt from="bottom" float={0.4} style={{ position: "absolute", left: 40, top: 1080 }}>
          <div style={{ width: 860, padding: "24px 36px 20px", borderRadius: 36, background: "rgba(255,255,255,0.96)", boxShadow: "0 30px 60px rgba(10,12,40,0.4)" }}>
            {SENTENCES.map((s) => (
              <SentenceRow key={s.p} s={s} delay={rel(s.at) - (rel(T.ex1) - 6)} markAt={rel(s.prepAt) - (rel(T.ex1) - 6)} />
            ))}
          </div>
        </Tilt>
      </Sequence>
    </>
  );
};

const RecapRow: React.FC<{ p: Prep; th: string; delay: number; glow: number }> = ({ p, th, delay, glow }) => {
  const pop = usePop(delay, 9, 220);
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "10px 26px 10px 12px", borderRadius: 999, background: C.white,
        boxShadow: `0 12px 26px rgba(10,12,40,${0.2 + glow * 0.15})`, fontFamily: FONT, fontWeight: 700, fontSize: 42, color: C.ink,
        opacity: Math.min(1, pop * 2) * (0.7 + glow * 0.3),
        transform: `translateX(${(1 - pop) * -160 + glow * 14}px) scale(${pop * (0.94 + glow * 0.1)})`, transformOrigin: "left center",
      }}
    >
      <PrepPill p={p} size={50} />
      <span style={{ fontSize: 40 }}>{PREP[p].icon}</span>
      {th}
    </div>
  );
};

const SentenceRow: React.FC<{ s: (typeof SENTENCES)[number]; delay: number; markAt: number }> = ({ s, delay, markAt }) => {
  const f = useCurrentFrame();
  if (f < delay - 2) return null; // the card grows one row at a time
  return (
    <div style={{ marginBottom: 14 }}>
      <Line delay={delay} size={60} latin color={C.ink} style={{ textShadow: "none", lineHeight: 1.25 }}>
        {s.before}
        <Marker delay={markAt} color={PREP[s.p].bg} textColor={PREP[s.p].fg}>{s.p}</Marker>
        {s.after}
      </Line>
      <Line delay={delay + 8} size={36} weight={600} color={C.inkSoft} style={{ textShadow: "none", lineHeight: 1.2 }}>
        {s.th}
      </Line>
    </div>
  );
};

/** After the clip: next episode teaser + follow button, confetti once. */
const Outro: React.FC = () => {
  const beat = useBeat(8);
  const btn = usePop(10, 9, 200);
  return (
    <>
      <div style={{ position: "absolute", left: 40, top: 450, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 22 }}>
        <Tilt from="left">
          <div style={{ minWidth: 400, whiteSpace: "nowrap", padding: "22px 30px 28px", borderRadius: 34, background: "rgba(255,255,255,0.96)", boxShadow: "0 30px 60px rgba(10,12,40,0.35)" }}>
            <Line size={42} weight={600} color={C.inkSoft} style={{ textShadow: "none" }}>ตอนหน้า 👉</Line>
            <Line delay={4} size={66} latin color={C.ink} style={{ textShadow: "none" }}>at · on · in</Line>
            <Line delay={8} size={58} color={C.ink} style={{ textShadow: "none" }}>กับ<Marker delay={14}>สถานที่</Marker> 📍</Line>
          </div>
        </Tilt>
        <div
          style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 58, color: C.white, background: C.pink, padding: "16px 44px 20px", borderRadius: 999,
            boxShadow: "0 18px 36px rgba(255,107,154,0.5)", opacity: Math.min(1, btn * 2),
            transform: `scale(${btn * (1 + beat * 0.08)}) rotate(${(1 - btn) * -12}deg)`, transformOrigin: "left center",
          }}
        >
          ➕ กดติดตาม
        </div>
      </div>
      <Confetti at={4} x={300} y={700} count={50} seed="en-outro" />
      <Sparkles x={40} y={430} w={440} h={330} at={6} count={8} seed="en-sp" />
    </>
  );
};

// ── Sound ─────────────────────────────────────────────────────────────────
type Sfx = "pop" | "boom" | "sparkle" | "whoosh";
const CUES: [number, Sfx, number][] = [
  [T.at0, "pop", 0.3], [T.on0, "pop", 0.3], [T.in0, "pop", 0.3],
  ...[T.atSec, T.onSec, T.inSec, T.exSec, T.ex1 - 0.2, T.end].map((t): [number, Sfx, number] => [t - 0.15, "whoosh", 0.4]),
  ...[T.at6, T.atNight, T.onMon, T.onBday, T.inJuly, T.in2026].map((t): [number, Sfx, number] => [t, "pop", 0.32]),
  ...[T.ex1at, T.ex2on, T.ex3in].map((t): [number, Sfx, number] => [t, "sparkle", 0.3]),
  [T.end + 0.15, "boom", 0.45], [T.end + 0.3, "sparkle", 0.4],
];

/** 0..1 how much she is talking at frame f (ramps in 6 frames before, out 8 after). */
function talking(f: number) {
  let w = 0;
  for (const [a, b] of SPEECH) {
    w = Math.max(w, interpolate(f, [sec(a) - 6, sec(a), sec(b), sec(b) + 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  return w;
}

// ── Composition ───────────────────────────────────────────────────────────
type Props = { music: string | null; beats: Beats | null };

const AtOnInTime: React.FC<Props> = ({ music, beats }) => {
  useFonts();
  const total = EN_TIME_FRAMES;
  const musicVolume = (f: number) => {
    const fade = Math.min(interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [total - 40, total], [1, 0], { extrapolateLeft: "clamp" }));
    return (0.2 - 0.12 * talking(f)) * fade;
  };
  const part = (from: number, to: number, el: React.ReactNode, name: string) => (
    <Sequence from={sec(from)} durationInFrames={sec(to) - sec(from)} name={name}>{el}</Sequence>
  );
  return (
    <BeatContext.Provider value={{ periodFrames: beats ? beats.period * FPS : 0, sceneFrom: 0 }}>
      <AbsoluteFill style={{ background: "#000" }}>
        <Clip />
        {part(0, T.atSec, <Hook />, "hook")}
        {part(T.atSec, T.onSec, (
          <Section p="at" from={T.atSec} to={T.onSec}
            rule={[{ text: "ช่วงเวลา", at: T.atTime }, { text: "หรือกี่โมง", at: T.atClock }]}
            examples={[{ rest: " 6:00", emoji: "🕕", at: T.at6 }, { rest: " night", emoji: "🌙", at: T.atNight }]} />
        ), "at")}
        {part(T.onSec, T.inSec, (
          <Section p="on" from={T.onSec} to={T.inSec}
            rule={[{ text: "วัน", at: T.onDay }]}
            examples={[{ rest: " Monday", emoji: "📚", at: T.onMon }, { rest: " my birthday", emoji: "🎂", at: T.onBday }]} />
        ), "on")}
        {part(T.inSec, T.exSec, (
          <Section p="in" from={T.inSec} to={T.exSec}
            rule={[{ text: "เดือน", at: T.inMonth }, { text: "หรือปี", at: T.inYear }]}
            examples={[{ rest: " July", emoji: "🌧️", at: T.inJuly }, { rest: " 2026", emoji: "🎉", at: T.in2026 }]} />
        ), "in")}
        <Sequence from={sec(T.exSec)} name="examples"><Examples /></Sequence>
        <Sequence from={sec(T.end)} name="outro"><Outro /></Sequence>
        <TopBar />
        <Audio src={staticFile("footage/en-time-voice.wav")} />
        {CUES.map(([t, sfx, v], i) => (
          <Sequence key={i} from={sec(t)} layout="none"><Audio src={staticFile(`sfx/${sfx}.wav`)} volume={v} /></Sequence>
        ))}
        {music ? <Audio src={staticFile(`music/${music}`)} trimBefore={Math.round((beats?.start ?? 0) * FPS)} volume={musicVolume} /> : null}
      </AbsoluteFill>
    </BeatContext.Provider>
  );
};

/** Registered in Root.tsx. */
export const EnAtOnInTime: React.FC = () => (
  <Composition
    id="EnAtOnInTime"
    component={AtOnInTime}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={EN_TIME_FRAMES}
    defaultProps={{ music: null, beats: null } satisfies Props as Props}
    calculateMetadata={async ({ props }) => {
      const beats: Beats | null = props.music
        ? await fetch(staticFile("music/beats.json")).then((r) => (r.ok ? r.json() : null)).catch(() => null)
        : null;
      return { props: { ...props, beats } };
    }}
  />
);
