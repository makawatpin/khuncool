import "@fontsource/anuphan/400.css";
import "@fontsource/anuphan/600.css";
import "@fontsource/anuphan/700.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
// Emoji come from Windows' Segoe UI Emoji. (@fontsource/noto-color-emoji
// rendered every emoji blank in the headless renderer, so it is not used.)
import React from "react";
import { Composition, staticFile } from "remotion";
import { DUCK_RACE, DuckRace } from "./duck/DuckRace";
import { PROMO, Promo } from "./Promo";
import type { ReelConfig, ReelProps } from "./Reel";
import { FPS, H, W } from "./theme";
import { buildTimeline, totalFrames, type Beats, type Timings } from "./timeline";

/** Registers one vertical video whose scene lengths follow its voiceover and the music's beat. */
const Reel: React.FC<{ name: string; config: ReelConfig; component: React.FC<ReelProps> }> = ({ name, config, component }) => (
  <Composition
    id={name}
    component={component}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS * 40}
    defaultProps={{ slots: [], music: "bgm.mp3", beats: null, placeholderVoice: false } satisfies ReelProps}
    calculateMetadata={async ({ props }) => {
      const timings: Timings = await fetch(staticFile(`vo/${config.id}/timings.json`)).then((r) => r.json());
      const beats: Beats | null = props.music
        ? await fetch(staticFile("music/beats.json")).then((r) => (r.ok ? r.json() : null)).catch(() => null)
        : null;
      const ids = config.scenes.map((s) => s.id);
      const mins = Object.fromEntries(config.scenes.map((s) => [s.id, s.minSeconds]));
      const slots = buildTimeline(ids, mins, timings, beats?.period);
      return { durationInFrames: totalFrames(slots), props: { ...props, slots, beats, placeholderVoice: !!timings.placeholder } };
    }}
  />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Reel name="Promo" config={PROMO} component={Promo} />
    <Reel name="DuckRace" config={DUCK_RACE} component={DuckRace} />
  </>
);
