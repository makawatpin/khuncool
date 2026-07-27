# Handoff: khuncool — Thai Teacher Resource Platform

## Overview
khuncool is a Thai-language content + tools platform for teachers: articles/blog, free browser-based classroom tools (random name picker, group maker, timer, noise meter, scoreboard, question picker, duck race), teacher record-keeping apps that sync to the cloud (attendance, savings, homeroom log), a curated affiliate shop, and free-forever accounts (email/password + Google).

**Target stack for this handoff:**
- **Framework**: Next.js (App Router, TypeScript)
- **Hosting**: Vercel
- **Database/Auth**: Supabase (already designed for — see `reference/SUPABASE-SETUP.md`)
- **Source control**: GitHub

## About the Design Files
The files in `screens/` are **design references built as static HTML prototypes** — they show intended layout, copy, states, and interaction behavior, not production code to copy verbatim. The task is to **recreate these designs as Next.js pages/components** using Next.js conventions (App Router file-based routing, React components, Tailwind or CSS Modules for styling — recommend Tailwind since the design already uses a token-like inline-style system that maps cleanly to utility classes), wired to real Supabase auth/data per `reference/SUPABASE-SETUP.md` and `reference/khuncool-cloud.js` (reference implementation of the auth/sync logic — reimplement idiomatically in Next.js, e.g. Supabase client in a context/hook, not by including this file as-is).

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, and component states in the HTML files are final — recreate pixel-for-pixel using the codebase's own component/styling system. Do not restyle or "improve" — match what's there.

## Routing / Sitemap (slugs are final — use exactly these paths)

| Route | Source file | Notes |
|---|---|---|
| `/` | `screens/Home.dc.html` | Homepage |
| `/tools` | `screens/Tools.dc.html` | Tools hub |
| `/random-name-picker` | `screens/Wheel.dc.html` | |
| `/group-maker` | `screens/Groups.dc.html` | |
| `/timer` | `screens/Timer.dc.html` | |
| `/classroom-noise-meter` | `screens/NoiseMeter.dc.html` | needs mic permission |
| `/group-scoreboard` | `screens/Scoreboard.dc.html` | |
| `/random-question` | `screens/Question.dc.html` | |
| `/duck-race` | `screens/DuckRace.dc.html` | |
| `/apps` | `screens/Apps.dc.html` | Apps hub (auth-gated data) |
| `/tools/attendance` | `screens/Attendance.dc.html` | Excel import/export via SheetJS |
| `/tools/savings` | `screens/Savings.dc.html` | Excel import/export via SheetJS |
| `/tools/homeroom` | `screens/Homeroom.dc.html` | Excel export + printable term document |
| `/articles` | `screens/Articles.dc.html` | Blog index |
| `/blog/wheel` | `screens/BlogWheel.dc.html` | |
| `/blog/random-name-activities` | `screens/BlogRandomNameActivities.dc.html` | |
| `/blog/magnetic-frame` | `screens/BlogMagneticFrame.dc.html` | |
| `/blog/psu-english` | `screens/BlogPsuEnglish.dc.html` | |
| `/blog/royal-award-2569` | `screens/BlogRoyalAward2569.dc.html` | |
| `/shop` | `screens/Shop.dc.html` | Affiliate product grid |
| `/account` | `screens/Account.dc.html` | `noindex` — auth landing + profile management |

`reference/sitemap.xml` and `reference/robots.txt` are ready to drop into the Next.js `public/` folder (or regenerate via `next-sitemap` using this route list as the source of truth). `robots.txt` disallows `/account`.

## SEO (already implemented per-page — carry over exactly)
Every screen file's `<head>`/`<helmet>` already contains the final `<title>`, meta description, canonical URL (all on `https://www.khuncool.com`, www-prefixed consistently), Open Graph + Twitter Card tags, and JSON-LD (`WebApplication`+`FAQPage` for tools, `BlogPosting` for articles, `Organization`+`WebSite` for home, `CollectionPage`/`BreadcrumbList`/`ItemList` for hubs). Port these directly into each page's Next.js `generateMetadata()` / `metadata` export — don't rewrite the copy.

`/account` and the internal Design System reference carry `<meta name="robots" content="noindex, nofollow">` — keep these noindex in Next.js too (`robots: { index: false }` in metadata).

## Screens
See the routing table above for the full list and file mapping. Each `.dc.html` file contains, side by side, a **mobile (390px)** and **desktop (1024–1280px)** layout for that screen — build both breakpoints from the single file (they show the same screen's responsive variants, not two different screens).

Key interactive components across screens:
- **Header**: logo (`assets/khuncool-logo.png`, always paired with literal text "khuncool" — never bake the wordmark into an image) + nav + account button (opens a sign-in/sign-up sheet overlay, not a route change — see `khuncool-account` behavior in `reference/khuncool-cloud.js`)
- **Account sheet/modal**: floats over the current page on every screen; only `/account` is a dedicated full-page version of the same form (guest landing + signed-in profile management)
- **Tool pages** (Wheel, Groups, Timer, NoiseMeter, Scoreboard, Question, DuckRace): fully client-side, no auth required, no data persistence beyond `localStorage`
- **App pages** (Attendance, Savings, Homeroom): require the cloud-sync pattern — localStorage when signed out, mirrored to Supabase `kc_state` table when signed in (debounced ~1.2s), Excel import/export via SheetJS, printable document generation (see the `window.print()` HTML string builders in the source `.dc.html` files for exact print layout)

## Design Tokens

**Colors**
- Primary: `#5C5EE6` (indigo), hover `#4A46D6`
- Secondary/accent: `#14B79A` (teal), used in logo gradient and highlights
- Brand gradient: `linear-gradient(135deg, #5C5EE6, #14B79A)`
- Ink/text: `#1A1D26` (headings/body), `#5A6273` (secondary text), `#7C8494` / `#A9B0BE` (muted/meta)
- Backgrounds: `#EAECF1` (app pages), `#F1F3F6` / `#F8F9FB` (light panels), `#fff` (cards)
- Borders: `#E5E8EE` / `#D3D8E1`
- Semantic: success `#0A9380` on `#D0FBEF`, warning `#92600A` on `#FFFBEB`/`#FDE68A`, error `#B91C1C`/`#DC2626` on `#FEF2F2`/`#FCA5A5`

**Typography**
- Thai + Latin body: `Sarabun` (400/500/600/700)
- Headings/UI labels: `Anuphan` (400/500/600/700)
- Brand wordmark "khuncool" only: `Fredoka` (500/600/700), fallback `Anuphan`
- Monospace (labels, codes, meta): `IBM Plex Mono` (400/500)
- All loaded via Google Fonts `css2` endpoint — see any screen's `<helmet>` for the exact `<link>`

**Spacing / Radius / Shadow**: 4/8px grid; card radius 12–20px; pill/button radius 999px or 10–13px; soft shadows e.g. `0 8px 20px -6px rgba(92,94,230,.5)` on primary CTAs, `0 30px 70px -20px rgba(26,29,38,.4)` on device frames. Full token swatches are documented in `screens/` is not included — the retired `Khuncool Design System.dc.html` internal reference (not bundled here, ask if needed) has the complete scale.

## Assets
All images in `assets/`: brand logo (`khuncool-logo.png`), tool/article cover photos (used as `og:image` and in-page imagery), product photos for the shop, duck-race game sprites. Filenames are self-descriptive (e.g. `wheel-cover.png`, `magnet-frame-product.webp`, `duck-race/duck1.png`).

## Backend (Supabase)
Full setup steps, SQL schema (`kc_state` table with row-level security), and auth provider configuration are in `reference/SUPABASE-SETUP.md`. Summary: one JSONB row per user (`kc_state`), mirrored from local state on a debounce, last-write-wins with a manual override in the account menu. No payment/subscription data — every feature is free.

## Files in this bundle
```
screens/            21 .dc.html design reference files (see routing table)
screenshots/         1 PNG per screen (same names as screens/, for quick visual reference)
reference/
  khuncool-cloud.js  reference implementation of auth + cloud-sync + account UI
  SUPABASE-SETUP.md  DB schema + auth provider setup
  sitemap.xml        ready to drop in public/ or regenerate from the route table
  robots.txt         ready to drop in public/
assets/              all images referenced by the screens
```
