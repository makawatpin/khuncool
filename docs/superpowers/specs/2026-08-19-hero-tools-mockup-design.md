# Hero Tools Mockup — Design

## Context

`HeroSection` (`components/home/HeroSection.tsx`) reserves its text column to `lg:max-w-[680px]` / `md:max-w-[560px]`, leaving the right side of the hero empty on wide viewports. Inspired by magicschool.ai's animated tool-window mockup, we'll fill that space with a small animated preview of khuncool's own tools, so visitors see real functionality (not just a headline) before clicking through.

## Scope

Desktop/large-viewport only (`lg:` breakpoint and up). Rationale:
- The empty space only exists at `lg:`, because the text column is only width-capped there; at `md:` and below the text already fills the row.
- Two floating windows would crowd a mobile viewport and could crowd the CTA buttons.
- Avoids running a continuous CSS animation on battery/CPU-constrained mobile devices.

## Component

New component: `components/home/HeroToolsMockup.tsx`, rendered inside `HeroSection`'s `<section>` alongside the existing text column, wrapped in `hidden lg:block` (same visibility pattern the section already uses for its mobile/desktop heading split).

### Visual structure

- An absolute/relative container sized to fill the hero's right-hand space.
- Two "window" cards layered with an offset (primary window top-left, secondary window bottom-right, overlapping slightly), each styled like a miniature browser/app window: a title bar with 3 dot indicators + a body containing a simplified recreation of that tool's real UI (not just an icon+label).
- Each window floats via a slow `translateY` CSS keyframe loop, the two windows offset in animation-delay so they bob out of phase.

### Tool pairs (cycle every ~6–8s)

The two windows advance through 4 pairs in lockstep, looping:

1. วงล้อสุ่มชื่อ (spinning wheel, real conic-gradient spin animation) + แบ่งกลุ่มนักเรียน (colored group chips with member counts)
2. เครื่องวัดเสียงในห้อง (level meter) + Family Tree (สื่อการสอนภาษาอังกฤษ)
3. เกมเป็ดสุ่มชื่อ + กระดานคะแนนกลุ่ม
4. จับเวลา + เช็กชื่อ

Content for each pair lives in a small local data array in the component (icon/label/mini-UI markup), not `components/home/data.ts` (that file backs other homepage sections with different shapes; this is presentation-only decorative content).

### Transition behavior

On each pair change, the outgoing window's content fades/slides out and the incoming pair's content fades/slides in at the same screen position — implemented as CSS keyframe animation cycling opacity + a small translateY, staggered per pair (same technique validated in the brainstorming mockup), not JS-driven state/interval. This keeps the whole feature static-CSS-only: no client JS, no re-renders, works the same in a server component.

### Accessibness & performance

- Wrap the floating/cycling keyframe animations in `@media (prefers-reduced-motion: no-preference)`; under reduced motion, the first pair renders statically (no bob, no cycling) via the media query gating which keyframes apply.
- Pure CSS transform/opacity animations — no JS animation loop, no layout thrashing (no width/height/top/left animation).
- Decorative only: mark the container `aria-hidden="true"` since it duplicates functionality already linked via the CTA buttons and doesn't convey unique information.

## Out of scope

- No interactivity (clicking the mockup does nothing / isn't a link).
- No mobile or tablet variant.
- No real data — all mockup content (names, group counts, sound levels) is static placeholder text matching the tools' real visual style.
