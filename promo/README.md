# khuncool.com promo videos

Vertical (1080×1920, 30 fps) ads for TikTok and Facebook Reels, built with
[Remotion](https://www.remotion.dev/). It is a separate project from the site:
own `package.json`, excluded from the site's `tsconfig.json`, ESLint and git
(generated audio/video are ignored).

| Video | Script | Composition | Render |
|---|---|---|---|
| khuncool.com overview | `videos/promo.json` | `Promo` (`src/Promo.tsx`, scenes in `src/scenes/`) | `npm run render` |
| สุ่มเป็ด (duck race) | `videos/duck-race.json` | `DuckRace` (`src/duck/DuckRace.tsx`) | `npm run render:duck` |

Both share one engine (`src/Reel.tsx`): scene order, beat-snapped timing,
transitions, voice, sound effects and music. A new video is a script in
`videos/` plus a `ReelConfig` registered in `src/Root.tsx`.

## Pipeline

| Step | Command | Output |
|---|---|---|
| 1. Voiceover (Gemini TTS, voice **Zephyr**) | `VIDEO=duck-race npm run voice` | `public/vo/<video>/<scene>.wav`, `timings.json` |
| 2. Footage of the live site, fullscreen | `npm run record` | `public/footage/<shot>.mp4` |
| 3. Music beat grid | `npm run beats` | `public/music/beats.json` (from `public/music/bgm.mp3`) |
| 4. Sound effects (synthesised) | `npm run sfx` | `public/sfx/{whoosh,pop,boom,sparkle}.wav` |
| 5. Preview / edit | `npm run studio` | Remotion Studio in the browser |
| 6. Render | `npm run render` | `out/khuncool-promo.mp4` |

- **Scripts** live in `videos/<video>.json` (`speech` is what the voice says —
  the site name is spelled `คุณคูลดอทคอม` so TTS reads it right; `caption` is
  what appears on screen).
- **Voiceover** needs `GEMINI_API_KEY` (Windows user environment variable).
  The free tier allows about 10 TTS requests per model per day, resetting at
  midnight Pacific (15:00 Thai time). `DRY=1` writes estimated timings without
  audio or quota, so scenes can be built before the voice exists; the video
  then renders without voice until the real clips are generated.
  `FORCE=reveal,cta npm run voice` regenerates only those scenes;
  `TEMPO=1.05` changes the speed-up (default 1.12). Takes that run far longer
  than the line (Gemini sometimes babbles on after it) are rejected and retried.
- **Footage** is filmed in headless Chrome with the GPU on, after pressing
  each page's own "เต็มจอ" button: desktop at 1920×1080 CSS px ×1.5
  (2880×1620 frames, ~35–45 fps) and phone at 390×844 ×2. `SHOTS=d-duck,m-duck
  npm run record` refilms only those shots. Shot list and click scripts are in
  `scripts/record.mjs`.
- **Scenes** are in `src/scenes/scenes.tsx`; scene lengths follow the
  voiceover (`src/timeline.ts`). Text stays inside the TikTok/Reels safe area
  (`SAFE` in `src/theme.ts`).
- **Music** is `public/music/bgm.mp3` (a licensed track; currently lnplusmusic
  "background music" from Pixabay). After swapping it, run `npm run beats`:
  it finds the tempo and the liveliest stretch, scene lengths are rounded up to
  whole beats so every cut lands on the beat, and text/backgrounds pulse on
  each beat. The music ducks under the voice and fades out at the end.
  `--props='{"music":null}'` renders voice only.
- **Animation helpers** (transitions, beat pulse, marker sweeps, confetti,
  3D tilt, letter pops) are in `src/components/fx.tsx`; per-scene sound
  cues are `SCENE_SFX` in `src/scenes/scenes.tsx`.
- After rendering, loudness is normalised to −14 LUFS:
  `ffmpeg -i out/khuncool-promo-raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/khuncool-promo.mp4`

Remotion is free for individuals and companies of up to 3 people; larger teams
need a company licence.
