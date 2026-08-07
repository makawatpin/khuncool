# Thai Language Quest — เกมสื่อการสอนภาษาไทย (ป.1–ป.6)

## Overview

A single hub quiz game for the `/media/thai` section, matching the pattern already established by `/media/english` games (Vocabulary Arcade, Sound Wheel, etc.). One game, three content modes, built for teacher-led play on a classroom TV/projector with no student devices, and also playable solo on a phone.

**Working title:** "ตะลุยด่านภาษาไทย" (Thai Language Quest)
**Route:** `/media/thai/thai-language-quest`
**Files:** `app/media/thai/thai-language-quest/{page.tsx, ThaiLanguageQuestApp.tsx}` (mirrors `app/media/english/vocabulary-arcade/`)

## Goals

- One game covering three Thai-language skill areas, so teachers don't have to juggle three separate tools for one lesson.
- Playable on a single classroom TV with no student devices — teacher operates it, students answer out loud.
- Content pulled from a pre-built, curated question bank organized by grade (ป.1–ป.6) and unit, not free-typed by the teacher.
- Desktop view large enough to read from the back of a classroom on a projected TV; mobile view fits on one screen without scrolling.
- Fullscreen toggle that shows the **exact same UI**, just scaled up — no layout changes between windowed and fullscreen.
- Energetic visual design (animation, confetti, combo effects) consistent with the existing English games' tone.
- Full SEO treatment matching the existing `/media/english` game pages.

## Non-goals

- No student-facing devices/QR join flow (explicitly rejected in favor of single-TV, teacher-clicks-through play).
- No custom/teacher-authored question editor in this iteration — question bank is fixed content shipped in the repo.
- Not building a generic "quiz engine" for other subjects; this is scoped to this one Thai game (reusing existing shared game infrastructure, not inventing new shared abstractions).

## Content: 3 Modes

One game, one entry flow: teacher picks **grade → unit → mode** before play starts.

1. **🔤 สะกดคำ (Spelling)** — Show a word or picture prompt; students spell it or pick the correctly-spelled option among distractors (common misspellings).
2. **📖 ความหมาย (Meaning)** — Show a vocabulary word; students choose its meaning, or its synonym/antonym, from options.
3. **✏️ หลักภาษา (Grammar)** — Show a sentence; students identify the part of speech of a highlighted word, or spot/correct an error in the sentence.

Each mode is self-contained (own question type, own UI treatment) but shares the same play loop, scoring, and results screen — same pattern as Vocabulary Arcade's `pic`/`word`/`spell` question types sharing one `Question` flow.

### Question bank

- Stored as static TypeScript data (`app/media/thai/thai-language-quest/data.ts`), same approach as `VocabularyArcadeApp.tsx`'s `CATS` array — no CMS/database needed for v1.
- Structured by **grade (ป.1–ป.6) → unit → mode → question list**. Ship 2–3 units per grade level at launch (enough to prove the format); expanding units later is just adding data, no code changes.
- Each question carries: prompt, correct answer, 2–3 distractors, and (for meaning mode) a short explanation shown on reveal — mirroring how Vocabulary Arcade shows the Thai translation on reveal.

## Play Flow (single TV, teacher-operated)

Matches the "ครูคลิกเดียว เรียกชื่อนักเรียนตอบ" decision — no student input device.

1. **Intro screen** — game title, start button (same beat as Vocabulary Arcade's stage 0).
2. **Grade picker** — ป.1 through ป.6.
3. **Unit + mode picker** — units available for the chosen grade; pick one of the 3 modes (or a "สุ่มรวม" mixed mode across all 3, matching Vocabulary Arcade's "Mixed Challenge").
4. **Play loop** — one question per screen:
   - Teacher reads/shows the question, calls on a student or team to answer verbally.
   - Teacher clicks the answer the student gave (or a right/wrong reveal control) — a single click, no separate "submit" step.
   - Correct/incorrect state is revealed immediately with animation (mirrors Vocabulary Arcade's `answer()` flow — lock, reveal, auto-advance after ~1.1–1.5s).
   - Points can optionally route into the existing **Scoreboard** tool for team play (stretch — see Open Questions).
5. **Results screen** — score summary, per-question review list, replay / change mode / change grade actions (same 3-button pattern as Vocabulary Arcade's stage 4).

## Technical Architecture (reuse, not reinvent)

The `/media/english` games already solve fullscreen + responsive canvas + SEO. This game reuses that infrastructure directly:

- **`useFullscreen<T>()`** (`app/media/english/useFullscreen.ts`) — reused as-is (or a shared copy under `app/media/thai/` if the hook is promoted to a common location — implementation detail, decide during planning). Handles native Fullscreen API on desktop and the fixed-viewport CSS fallback on mobile/iOS Safari.
- **`.kc-game` canvas system** (`app/globals.css` ~L466–542, ~L1000–1020) — desktop is locked to a 16:9 box; entering fullscreen **scales that exact box up** via `transform: scale()`, it does not reflow to a new layout. This directly satisfies "เมื่อกดเต็มจอ หน้าจอเกม UI ต่างๆ ต้องเหมือนกับตอนยังไม่กดเต็มจอ."
- **Mobile fullscreen fallback** (`.kc-mobile-fullscreen`, `@media (max-width:767px)`) — already constrains to `100dvh`, single screen, no scroll.
- **`GameBackdrop`** — shared decorative background (sun/blobs/clouds), reused for visual consistency with the English games' "energetic" look.
- **SEO pattern** — `page.tsx` exports `metadata` (title/description/OG/canonical) + inline JSON-LD (`BreadcrumbList` + `WebApplication`), plus the shared `GameFaq` component for a `LearningResource` + `FAQPage` JSON-LD block. Same as `app/media/english/vocabulary-arcade/page.tsx` + `seo.ts`. A parallel `app/media/thai/seo.ts` (or shared `gameFaqs` helper reused if subject-agnostic) provides the FAQ boilerplate.
- **Fonts** — `--font-fredoka` for display/numerals, `--font-anuphan`/`--font-sarabun` for Thai body text — already loaded globally, reused.

### New work required (not covered by existing games)

**Two explicit typography tiers**, tuned per-surface rather than relying on `clamp()` alone as the English games do:

| Element | Desktop (TV, back-of-room readable) | Mobile (handheld) |
|---|---|---|
| Main question text | ~64–88px, bold | ~26–32px, bold |
| Answer option text | ~28–36px | ~16–18px |
| Body/instruction text | ~18–20px | ~13–14px |
| UI chrome (buttons, badges) | ~16–18px | ~13px |

Desktop sizes are deliberately larger than what Vocabulary Arcade uses today (which tops out around 54–62px for its biggest text) because this game's explicit use case is a TV at the front of a classroom viewed from the back row — legibility at distance is the priority over screen-density efficiency. Mobile sizes stay close to existing game conventions (readable one-handed, no zoom needed). Implementation: two `clamp()` ranges gated by the same `768px`/`900px` breakpoints the `.kc-game` canvas already uses, not literally two separate font-family sets — the "two shirts, not two typefaces" distinction should be confirmed with the user in review if ambiguous.

**New visual identity for this game** (not reused from English games):
- Distinct color palette per mode (spelling / meaning / grammar), following the existing per-category-color convention (`bg`/`bd`/`blob` triplets) but Thai-education-appropriate tones.
- Confetti, combo streaks, card bounce/shake-on-wrong — same animation vocabulary as Vocabulary Arcade (`confettiFall`, `bounceIn`, `shake`, `popIn`), applied to new question layouts (sentence-with-blank for grammar mode, spelling-tile builder for spelling mode is a near-direct reuse of Vocabulary Arcade's tile spelling UI).

## Scoreboard integration

Deferred to an open question below — noted as a "nice to have," not a launch blocker, since the core ask (teacher clicks through, calls on students) doesn't strictly require persisted team scores.

## SEO

- `generateMetadata`/`metadata` export: Thai-language title, description, canonical `https://www.khuncool.com/media/thai/thai-language-quest`, OG + Twitter card — same shape as `vocabulary-arcade`'s.
- JSON-LD: `BreadcrumbList` (หน้าแรก → สื่อการสอน (ภาษาไทย) → เกมนี้) + `WebApplication` (`applicationCategory: EducationalApplication`, free offer).
- `GameFaq` with 3 standard Q&As (grade level fit, works on TV + mobile, no signup needed) reusing the existing `gameFaqs()` helper shape.
- Page listed as a resource under `/media/thai` (replacing/extending the current placeholder entry in `SUBJECT_CONTENT.thai.resources` in `app/media/subjectContent.ts`), and linked from the Thai hub page once shipped.

## Open Questions (to resolve before/during implementation planning)

1. **Scoreboard hookup**: does clicking "correct" in-game need to push points to the existing Scoreboard tool (cross-tool integration), or is an in-game-only point tally sufficient for v1?
2. **Content volume for launch**: confirm "2–3 units per grade × 6 grades × 3 modes" is the right initial scope, or if a smaller first slice (e.g., ป.1–ป.3 only) should ship first.
3. **Typography**: confirm the two-tier sizing table above matches what "ใหญ่มากสำหรับจอทีวี" means in practice — first implementation pass should be checked against an actual TV/projector, not just a laptop screen.

## Out of scope for this spec

- Authoring tools for teachers to add their own questions (future iteration).
- Multi-classroom / multi-device sync.
- Any backend/database change — all content is static, bundled data.
