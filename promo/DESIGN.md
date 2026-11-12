# Promo video design guide

Every khuncool.com promo video (TikTok / Facebook Reels) must look and sound
like one family. This guide is the contract. Read it before making or editing
a video, and reuse the building blocks listed here instead of inventing new
styles. For commands and pipeline details see [README.md](README.md).

Reference videos (match these):

| Video | Script | Composition |
|---|---|---|
| khuncool.com overview | `videos/promo.json` | `Promo` — `src/Promo.tsx` + `src/scenes/scenes.tsx` |
| สุ่มเป็ด (duck race) | `videos/duck-race.json` | `DuckRace` — `src/duck/DuckRace.tsx` |

`src/duck/DuckRace.tsx` is the best template for a single-feature video.

---

## 1. Format

- 1080×1920, 30 fps, H.264 + AAC, **35–40 s**, 8 scenes.
- Final loudness **−14 LUFS** (loudnorm pass after render, see README).
- Every scene starts on a beat of the music: scene lengths are whole beats
  (`src/timeline.ts`); never hard-code scene lengths in frames.

## 2. Story structure (8 scenes)

| # | Scene | Job | Length | Notes |
|---|---|---|---|---|
| 1 | **hook** | Name the teacher's problem as a question | 2.6–4 s | No logo yet. Can use a dull grey background (`<Background tint=…>`) for "the old way". Big `?` / emoji. |
| 2 | **reveal** | The answer: product name + "ใช้ฟรี" | 4.4–4.6 s | Rotating sunburst, `Shockwave`, logo or big title, `LetterPop` for latin text, confetti once. |
| 3–6 | **features** | One idea per scene, shown in real footage | 4–5.5 s each | Headline = the voice line, shortened. One `Marker` word. Chips appear on the spoken word. |
| 7 | **screens** | "ใช้ได้ทุกจอ": laptop + phone side by side | 4 s | Laptop left, phone overlapping right. |
| 8 | **cta** | Where to go | 5.6–5.8 s | Logo, `ใช้ฟรี ไม่ต้องสมัคร` chip, URL (`LetterPop`) or a typing `SearchBox`, pink **➕ กดติดตาม** button pulsing on the beat, confetti. |

## 3. Brand

From `src/theme.ts` (copied from the site's `app/globals.css`):

| Token | Hex | Use |
|---|---|---|
| `C.primary` | `#5c5ee6` | gradient start, stripes |
| `C.accent` | `#14b79a` | gradient end |
| `C.sun` | `#ffc83d` | **the** highlight: `Marker`, active chip, stamps |
| `C.pink` | `#ff6b9a` | problems/negatives (`ไม่ทัน`, `เบื่อ`), follow button, subject stamps |
| `C.ink` | `#1a1d26` | text on light chips |
| white | `#ffffff` | headlines on the gradient |

- Background: always `<Background />` (brand gradient, drifting light blobs,
  dot grid, beat glow). Grey `tint` only for a "boring old way" hook.
- Fonts: **Anuphan** 600/700 for Thai, **Fredoka** 700 for latin
  (`khuncool.com`, URLs). Emoji come from Segoe UI Emoji.
- Logo: `public/brand/logo.webp` via `<Logo size={…} />`.
- Mascots: the site's duck sprites in `public/brand/ducks/duck1-6.png`
  (300 px tall, transparent). Don't scale above ~330 px tall.

## 4. Layout

- Safe area (`SAFE` in `theme.ts`): **no text** above y 200, below y 1520,
  or right of x 910 — TikTok's buttons and caption sit there. Footage may
  extend into those areas; text may not.
- Headline block: `<Head>` (top-left, y ≈ 210). Left-aligned, not centred
  (centred text collides with the right-hand buttons). Only reveal and CTA
  centre their content.
- Footage frame: starts y ≈ 450–700, about 1000 px wide.
  - Desktop footage → `<Laptop width={760–1020}>` or `<Card w={1000}>`.
  - Phone footage → `<Phone width={300–470}>`.
  - Laptop + phone together: laptop left (x ≈ 30), phone overlapping right (x ≈ 520–600).
- Chips row: y ≈ 1360–1430, left at `SAFE.left + 10`, `flexWrap`, max width 860.

Type sizes: headline 80–110 px (700), sub-line 56–72 px (600), chips 44–56 px,
reveal/CTA title 120–190 px.

## 5. Motion vocabulary

Use these. Most live in `src/components/ui.tsx` and `src/components/fx.tsx`;
`Head`, `Cuts` and `Flyer` are exported from `src/scenes/scenes.tsx`; `Parade`
(duck mascots skating), `SearchBox` (typing search query) and `Count`
(big countdown number) are local to `src/duck/DuckRace.tsx` — move them into
`fx.tsx` the first time another video needs them.

| Element | Component | Rule |
|---|---|---|
| Headline lines | `Line` | Pop with overshoot; stagger lines by 4–30 frames. |
| Keyword highlight | `Marker` | **One per scene**, on the key word. Yellow by default, pink for the problem. |
| Labels | `Chip` | Delay = the second the voice says that word (`sec(…)`). Active chip yellow, rest white. |
| Footage cards | `Tilt` | Every frame of footage enters with `Tilt` (from left/right/bottom) and floats. |
| Several shots in one frame | `Cuts` | Each cut gets the zoom punch + white flash automatically. |
| Scene entry | `Punch` | Automatic (Reel). `punch: 0` for the hook. |
| Between scenes | `Transition` | Set per video in `transitions`: **flash** into reveal and CTA, alternate **wipe** / **circle** elsewhere. |
| Payoff moments | `Confetti` | At most ~4 per video: reveal, the "wow" feature, podium/result, CTA. |
| Logo hit | `Shockwave` + `boom` sfx | Reveal and CTA. |
| Sparkle | `Sparkles` | Around a payoff line. |
| Emphasis | `Shake` | Once per video at most (the hook's problem word). |
| Beat | `useBeat()` | Background, chips and markers already pulse; use for anything that should breathe. |
| Fun accents | `Flyer`, duck `Parade` | Sparingly, 1–2 per video. |

Never: static text that just appears, plain fades as transitions, more than
one marker per scene, text that sits still for the whole scene with no motion.

## 6. Voice

- **Gemini TTS**, model `gemini-3.1-flash-tts-preview`, voice **Zephyr**
  (female, bright). Polite particles **คะ / ค่ะ**. Keep the model and voice the
  same across videos.
- Spell the site **คุณคูลดอทคอม** in `speech` (TTS mangles "khuncool");
  `caption` / on-screen text uses `khuncool.com`.
- One sentence per scene, ≤ ~55 Thai characters. Total voice 25–30 s.
- `TEMPO` 1.12 (default). Style prompt lives in `scripts/voiceover.mjs`.
- Free quota: ~10 requests per model per day, resets **15:00 Thai time**.
  Build scenes first with `DRY=1` (estimated timings, no quota), generate the
  real voice once at the end.
- Check takes with `scripts/transcribe.mjs`. The transcriber mishears
  "คุณคูล" (as "คุณครู" / "khunkroo"): ask the user to listen to that word.
- When a visual must land on a spoken word (e.g. a countdown), measure the
  word onsets in the `.wav` and store them as constants with a comment (see
  `RACE_WORDS` in `DuckRace.tsx`). Re-measure if that clip is regenerated.

## 7. Music and sound

- Music: `public/music/bgm.mp3` (Pixabay, lnplusmusic "background music",
  118 BPM) for every video unless the user supplies another; after changing it
  run `npm run beats`. The Reel ducks it under the voice and fades it out.
- SFX (`npm run sfx`, synthesised, no licence issues): `pop` when a chip or
  stamp appears (0.4–0.6), `boom` on logo hits (0.8), `sparkle` on payoffs
  (0.4–0.6). `whoosh` on every cut is automatic.

## 8. Footage

- Film the **live site** with `scripts/record.mjs` (headless Chrome, GPU on):
  desktop 1920×1080 CSS px at 1.5× (2880×1620), phone 390×844 at 2×.
- **Always press the page's own "เต็มจอ" button** before filming, unless
  fullscreen breaks that page (then film the normal page and note why in the
  shot's comment).
- Small UI (forms, lists, settings) → film on the phone, show in `<Phone>`;
  the desktop version is too small to read at 1080 px wide.
- Scroll with `smoothScroll`, never `mouse.wheel` (it jumps).
- Seed demo data through the UI (type/paste names), never touch real data.
- Before using a shot, look at a contact sheet of stills (ffmpeg `tile`) and
  find key moments with `select='gt(scene,0.25)'`.
- Name shots `d-…` (desktop) / `m-…` (phone), prefixed by video (`dr-` =
  duck race).

## 9. Known pitfalls

- `@fontsource/noto-color-emoji` renders blank — don't use it. Some Segoe
  emoji are invisible on white chips (🥛 white, 🔊 grey): pick colourful ones.
- A style prop that sets `opacity` on `Line`/`Chip` overrides the animation.
- Gemini TTS sometimes babbles after the line; `voiceover.mjs` rejects takes
  longer than `chars/7 + 1` s.
- Headless Chrome needs `--window-size` matching the viewport (handled in
  `record.mjs`) or fullscreen shrinks to 800×600.
- Site bug: duck-race fullscreen settings panel text is white on white
  (`app/globals.css`, `.duck-race-controls { color:white }`).
- Render failing with `ERR_NETWORK_CHANGED` is a local network blip: re-run
  with `--concurrency=4`.

## 10. Checklist before handing over a video

1. `npx tsc --noEmit` in `promo/` passes.
2. Half-scale draft (`--scale=0.5`) reviewed as a contact sheet: one still per
   scene plus a frame inside each transition. No text outside the safe area,
   no black edges, no overlapping numbers/labels, emoji visible.
3. Voice transcribed; ask the user to listen for "คุณคูล".
4. Full render + loudnorm; measure: −14 ± 1 LUFS overall, voice parts louder
   than music-only parts.
5. Offer captions for TikTok and Facebook Reels (hook line first, link in the
   first comment on Facebook, "ค้นหา …" or link-in-bio on TikTok, `#khuncool`).
