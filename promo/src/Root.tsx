import "@fontsource/anuphan/400.css";
import "@fontsource/anuphan/600.css";
import "@fontsource/anuphan/700.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
// Emoji come from Windows' Segoe UI Emoji. (@fontsource/noto-color-emoji
// rendered every emoji blank in the headless renderer, so it is not used.)
import { Composition, staticFile } from "remotion";
import { Promo, type PromoProps } from "./Promo";
import { FPS, H, W } from "./theme";
import { buildTimeline, totalFrames, type Beats, type Timings } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Promo"
    component={Promo}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS * 40}
    defaultProps={{ slots: [], music: "bgm.mp3", beats: null, captions: true } satisfies PromoProps}
    calculateMetadata={async ({ props }) => {
      // Scene lengths follow the generated voiceover (public/vo/timings.json),
      // rounded up to whole beats of the music (public/music/beats.json) when there is music.
      const timings: Timings = await fetch(staticFile("vo/timings.json")).then((r) => r.json());
      const beats: Beats | null = props.music
        ? await fetch(staticFile("music/beats.json")).then((r) => (r.ok ? r.json() : null)).catch(() => null)
        : null;
      const slots = buildTimeline(timings, beats?.period);
      return { durationInFrames: totalFrames(slots), props: { ...props, slots, beats } };
    }}
  />
);
