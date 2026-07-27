# khuncool — Next.js Recreation, Phase 1 Design

## Context
`design_handoff_khuncool_platform/` (root of this repo) contains a design handoff for **khuncool**, a Thai-language teacher resource platform: 21 static HTML design references (`screens/*.dc.html`), reference Supabase auth/sync code (`reference/khuncool-cloud.js`, `reference/SUPABASE-SETUP.md`), sitemap/robots, and image assets. See `README.md` for full routing table, design tokens, and fidelity requirements.

This project is split into three phases. **This spec covers Phase 1 only.**

- **Phase 1** (this spec): Scaffold the Next.js app, recreate all 21 pages with Tailwind, wire up metadata/SEO, drop in sitemap/robots/assets. No real backend.
- **Phase 2** (later): Wire real Supabase auth (email/password + Google) and `kc_state` cloud sync, using the existing Supabase project **"khuncoolhub's Project"** (ref `segfdmnxbdctntvsdprq`, ap-southeast-1), per `reference/SUPABASE-SETUP.md`.
- **Phase 3** (later): Create GitHub repo, push code, connect Vercel project (production branch `main`), set environment variables in Vercel.

## Goals
- Recreate all 21 screens as Next.js (App Router, TypeScript) pages at the exact routes in the README routing table — slugs are final, do not change.
- Pixel-for-pixel fidelity to the `.dc.html` files: colors, type, spacing, copy, component states. No restyling or "improving."
- Convert inline styles in the source HTML to Tailwind utility classes driven by the design tokens documented in the README (colors, fonts, spacing/radius/shadow).
- Both breakpoints (390px mobile, 1024–1280px desktop) shown side-by-side in each `.dc.html` are the responsive variants of one page — implement as one responsive page, not two.
- Port SEO metadata (title, description, canonical, OG, Twitter, JSON-LD) from each screen's `<head>` into `generateMetadata()` verbatim (no copy rewrites). `/account` gets `robots: { index: false }`.
- Drop `reference/sitemap.xml` and `reference/robots.txt` into `public/` as-is.
- Copy all files from `assets/` into `public/assets/` (or equivalent), referenced correctly from components.

## Non-goals (deferred to later phases)
- Real Supabase auth/session handling or `kc_state` reads/writes.
- GitHub repo creation, git push, Vercel project linking, Vercel env var configuration.
- Any payment/subscription logic (platform is free-forever; not applicable at all).

## Architecture

### Route structure
One folder per route under `app/`, matching the README table exactly:

```
app/
  page.tsx                              /
  tools/page.tsx                        /tools
  random-name-picker/page.tsx           /random-name-picker      (Wheel.dc.html)
  group-maker/page.tsx                  /group-maker             (Groups.dc.html)
  timer/page.tsx                        /timer                   (Timer.dc.html)
  classroom-noise-meter/page.tsx        /classroom-noise-meter   (NoiseMeter.dc.html)
  group-scoreboard/page.tsx             /group-scoreboard        (Scoreboard.dc.html)
  random-question/page.tsx              /random-question         (Question.dc.html)
  duck-race/page.tsx                    /duck-race               (DuckRace.dc.html)
  apps/page.tsx                         /apps                    (Apps.dc.html)
  tools/attendance/page.tsx             /tools/attendance        (Attendance.dc.html)
  tools/savings/page.tsx                /tools/savings           (Savings.dc.html)
  tools/homeroom/page.tsx               /tools/homeroom          (Homeroom.dc.html)
  articles/page.tsx                     /articles                (Articles.dc.html)
  blog/wheel/page.tsx                   /blog/wheel
  blog/random-name-activities/page.tsx  /blog/random-name-activities
  blog/magnetic-frame/page.tsx          /blog/magnetic-frame
  blog/psu-english/page.tsx             /blog/psu-english
  blog/royal-award-2569/page.tsx        /blog/royal-award-2569
  shop/page.tsx                         /shop                    (Shop.dc.html)
  account/page.tsx                      /account                 (Account.dc.html, noindex)
  layout.tsx                            root layout: Header + AccountSheet shell + Footer
```

### Shared components (`components/`)
- `Header` — logo (`assets/khuncool-logo.png` + literal text "khuncool", never baked into the image) + nav + account button.
- `AccountSheet` — floating sign-in/sign-up overlay, rendered from root layout so it's available on every page without a route change. In Phase 1 this renders the guest/sign-in UI states from `khuncool-cloud.js` but auth actions are stubbed (no real Supabase calls yet).
- `Footer`, `ToolCard`, and other presentational pieces shared across hub pages (Tools, Apps, Articles, Shop) as they're identified while porting each screen.

### Styling
- Tailwind config (`tailwind.config.ts`) encodes the design tokens from the README as theme extensions: `colors` (primary `#5C5EE6`/hover `#4A46D6`, accent `#14B79A`, ink/text/background/border/semantic scales), `fontFamily` (Sarabun, Anuphan, Fredoka, IBM Plex Mono via Google Fonts, loaded in root layout), spacing on the existing 4/8px grid, border radius (12–20px cards, pill/999px or 10–13px buttons), and box-shadow presets for CTA/device-frame shadows.
- Each page's inline styles from the source `.dc.html` are translated to Tailwind utility classes using these tokens — no ad hoc hex values or magic numbers in component code.

### Data & state (Phase 1 scope)
- **Tool pages** (Wheel, Groups, Timer, NoiseMeter, Scoreboard, Question, DuckRace): fully client components (`"use client"`), state in React + `localStorage`, no auth, no server calls.
- **App pages** (Attendance, Savings, Homeroom): client components using `localStorage` for persistence. Each calls a shared `useCloudSync(key, state)` hook (`lib/useCloudSync.ts`) that in Phase 1 is a **no-op stub** — it returns `{ status: 'local-only' }` and does not attempt any network call. This hook's signature and call sites are designed so Phase 2 can implement the real Supabase debounced mirror without changing the pages that call it.
- Excel import/export (SheetJS) and printable term document generation (`window.print()` HTML string builders) are ported from the source `.dc.html` files' logic into these three app pages.
- `NoiseMeter` requests microphone permission via the Web Audio API, as in the source.

### Metadata
- Each page exports `generateMetadata()` (or static `metadata` where no dynamic data is needed) with `title`, `description`, `alternates.canonical` (all under `https://www.khuncool.com`, www-prefixed), `openGraph`, `twitter`, and a `<script type="application/ld+json">` for the JSON-LD block, copied verbatim from the matching `.dc.html`'s `<head>`.
- `/account` additionally sets `robots: { index: false, follow: false }`.

### Static files
- `reference/sitemap.xml` → `public/sitemap.xml`
- `reference/robots.txt` → `public/robots.txt`
- `assets/*` → `public/assets/*` (paths in components updated accordingly)

## Testing / verification
- `next build` succeeds with no type errors.
- Manually spot-check a sample of pages (Home, one tool page, one app page, one blog page, Account) in the browser at both mobile (390px) and desktop (1024–1280px) widths against the corresponding `screenshots/*.png` for visual fidelity.
- Verify `generateMetadata()` output (view source / dev tools) matches the source `.dc.html` `<head>` for at least Home, one tool page, and one blog page.
- Confirm `/account` renders `noindex` meta tag.
- Confirm `public/sitemap.xml` and `public/robots.txt` are served correctly by the dev server.

## Open questions / carried into later phases
- Exact Supabase env var names and client setup: deferred to Phase 2, driven by `reference/SUPABASE-SETUP.md` against Supabase project `segfdmnxbdctntvsdprq`.
- GitHub repo name/visibility and Vercel project settings: deferred to Phase 3, to be confirmed with the user at that time.
