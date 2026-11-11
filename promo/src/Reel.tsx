import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { BeatContext, Punch, Transition, type TransitionKind } from "./components/fx";
import { FPS } from "./theme";
import type { Beats, SceneSlot } from "./timeline";

/** Sound-effect cue, in seconds from the scene start. */
export type Cue = { at: number; sfx: "pop" | "boom" | "sparkle" | "whoosh"; volume?: number };

/** Everything that makes one video: its scenes in order and how they cut together. */
export type ReelConfig = {
  /** folder under public/vo and the videos/<id>.json script */
  id: string;
  scenes: { id: string; component: React.FC; minSeconds: number; sfx?: Cue[]; punch?: number }[];
  /** transition into scene i (index 0 unused) */
  transitions: TransitionKind[];
};

export type ReelProps = {
  slots: SceneSlot[];
  /** file in public/music, e.g. "bgm.mp3"; null renders without music */
  music: string | null;
  beats: Beats | null;
  /** true while the timings are estimates and no voice files exist yet */
  placeholderVoice: boolean;
};

// Voice starts a few frames into each scene so the cut lands before the word.
const VO_LEAD = 3;

/** Hold the first frame until the Thai/Latin fonts are ready, so no frame renders in a fallback font. */
function useFonts() {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      [
        ["600 40px Anuphan", "กขค"], ["700 40px Anuphan", "กขค"], ["600 40px Fredoka", "abc"], ["700 40px Fredoka", "abc"],
      ].map(([font, text]) => document.fonts.load(font, text)),
    ).then(() => continueRender(handle));
  }, [handle]);
}

export const makeReel = (config: ReelConfig): React.FC<ReelProps> => {
  const byId = Object.fromEntries(config.scenes.map((s) => [s.id, s]));
  const Reel: React.FC<ReelProps> = ({ slots, music, beats, placeholderVoice }) => {
    useFonts();
    const total = slots.length ? slots[slots.length - 1].from + slots[slots.length - 1].duration : 1;
    const periodFrames = beats ? beats.period * FPS : 0;
    // Music ducks under the voice: quieter while someone is talking.
    const speaking = (f: number) => !placeholderVoice && slots.some((s) => f >= s.from + VO_LEAD - 4 && f < s.from + VO_LEAD + s.voFrames + 4);
    const musicVolume = (f: number) => {
      const fade = Math.min(interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [total - 40, total], [1, 0], { extrapolateLeft: "clamp" }));
      return (speaking(f) ? 0.1 : 0.24) * fade;
    };
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        {slots.map((s) => {
          const scene = byId[s.id];
          const Scene = scene.component;
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.duration} name={s.id}>
              <BeatContext.Provider value={{ periodFrames, sceneFrom: s.from }}>
                <Punch strength={scene.punch ?? 0.1}>
                  <Scene />
                </Punch>
              </BeatContext.Provider>
              {placeholderVoice ? null : (
                <Sequence from={VO_LEAD} layout="none">
                  <Audio src={staticFile(`vo/${config.id}/${s.id}.wav`)} />
                </Sequence>
              )}
              {(scene.sfx ?? []).map((c, i) => (
                <Sequence key={i} from={Math.round(c.at * FPS)} layout="none">
                  <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume ?? 0.5} />
                </Sequence>
              ))}
            </Sequence>
          );
        })}
        {/* Transitions straddle each cut; a whoosh leads into it. */}
        {slots.slice(1).map((s, i) => (
          <React.Fragment key={s.id}>
            <Transition at={s.from} kind={config.transitions[i + 1] ?? "wipe"} />
            <Sequence from={Math.max(0, s.from - 9)} layout="none">
              <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
            </Sequence>
          </React.Fragment>
        ))}
        {music ? <Audio src={staticFile(`music/${music}`)} trimBefore={Math.round((beats?.start ?? 0) * FPS)} volume={musicVolume} /> : null}
      </AbsoluteFill>
    );
  };
  return Reel;
};
