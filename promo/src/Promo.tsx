import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { BeatContext, Punch, Transition, type TransitionKind } from "./components/fx";
import { Classroom, Cta, Duck, Games, Hook, Reveal, SCENE_SFX, Screens, Tools } from "./scenes/scenes";
import { FPS } from "./theme";
import type { Beats, SceneId, SceneSlot } from "./timeline";

export type PromoProps = {
  slots: SceneSlot[];
  /** file in public/music, e.g. "bgm.mp3"; null renders voice only */
  music: string | null;
  /** beat grid of the music (public/music/beats.json); null = no beat sync */
  beats: Beats | null;
  captions: boolean;
};

const SCENES: Record<SceneId, React.FC> = {
  hook: Hook, reveal: Reveal, duck: Duck, tools: Tools, games: Games, screens: Screens, classroom: Classroom, cta: Cta,
};

// Cut style into each scene (index = incoming scene). Reveal and CTA open on
// their own white flash, so they get the flash; the rest alternate.
const TRANSITIONS: TransitionKind[] = ["flash", "flash", "wipe", "circle", "wipe", "circle", "wipe", "flash"];

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

export const Promo: React.FC<PromoProps> = ({ slots, music, beats }) => {
  useFonts();
  const total = slots.length ? slots[slots.length - 1].from + slots[slots.length - 1].duration : 1;
  const periodFrames = beats ? beats.period * FPS : 0;
  // Music ducks under the voice: quieter while someone is talking.
  const speaking = (f: number) => slots.some((s) => f >= s.from + VO_LEAD - 4 && f < s.from + VO_LEAD + s.voFrames + 4);
  const musicVolume = (f: number) => {
    const fade = Math.min(interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" }), interpolate(f, [total - 40, total], [1, 0], { extrapolateLeft: "clamp" }));
    return (speaking(f) ? 0.1 : 0.24) * fade;
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {slots.map((s) => {
        const Scene = SCENES[s.id];
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.duration} name={s.id}>
            <BeatContext.Provider value={{ periodFrames, sceneFrom: s.from }}>
              <Punch strength={s.id === "hook" ? 0 : 0.1}>
                <Scene />
              </Punch>
            </BeatContext.Provider>
            <Sequence from={VO_LEAD} layout="none">
              <Audio src={staticFile(`vo/${s.id}.wav`)} />
            </Sequence>
            {SCENE_SFX[s.id].map((c, i) => (
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
          <Transition at={s.from} kind={TRANSITIONS[i + 1]} />
          <Sequence from={Math.max(0, s.from - 9)} layout="none">
            <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
          </Sequence>
        </React.Fragment>
      ))}
      {music ? (
        <Audio src={staticFile(`music/${music}`)} trimBefore={Math.round((beats?.start ?? 0) * FPS)} volume={musicVolume} />
      ) : null}
    </AbsoluteFill>
  );
};
