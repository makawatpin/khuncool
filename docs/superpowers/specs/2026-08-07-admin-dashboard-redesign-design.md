# Admin Dashboard Redesign

## Goal

Reskin `/admin` into a modern dashboard-app look while keeping every existing behavior (data fetching, filtering, links) working exactly as it does today. This is a pure UI reskin — no changes to API routes, data shapes, or business logic.

## Current State

- [app/admin/AdminDashboard.tsx](../../../app/admin/AdminDashboard.tsx): client component, gates on `useAuth()`, renders a horizontal tab strip (`border-b`, underline-style active tab) and switches between 5 tab components.
- Tabs: `OverviewTab`, `UsersTab`, `ToolsTab`, `ContentTab`, `SystemTab` in `app/admin/tabs/`, each fetching its own data via `useAdminFetch` (`app/admin/useAdminFetch.ts`) and rendering plain white cards (`rounded-xl border border-border bg-surface-card`).
- `ErrorCard` / `LoadingCard` in `app/admin/tabs/ErrorCard.tsx` are shared across tabs, currently just text in a card.
- The whole app wraps every route (including `/admin`) in a global `Header` and `Footer` ([app/layout.tsx](../../../app/layout.tsx)).
- Design tokens already exist in [app/globals.css](../../../app/globals.css) (`:root` block): brand colors (`--color-primary` #5c5ee6, `--color-accent` #14b79a), ink/surface/border scales, radii, shadows, and a brand gradient. Typography: `h1`–`h6` use Anuphan (bold, tight tracking), body uses Sarabun, both loaded as CSS vars in the root layout.

## Design

### 1. App shell

- New `AdminShell` component (or expand `AdminDashboard.tsx`) renders a fixed-width (~216px) dark sidebar (`#14161f`) on desktop:
  - khuncool logo mark (brand gradient square) + "khuncool / Admin" wordmark, Anuphan font.
  - 5 nav items (ภาพรวม / ผู้ใช้ / เครื่องมือ / เนื้อหา / ระบบ), each with a small icon. Active item gets a left accent border in `--color-primary` plus a tinted background; inactive items are muted gray text.
  - Footer of the sidebar: "กลับสู่เว็บไซต์ ↗" link back to `/`.
- On viewports below `md`, the sidebar collapses behind a hamburger button in a slim top bar; clicking it opens a slide-in drawer (same content as desktop sidebar) with a scrim behind it.
- The global `Header` and `Footer` (from `app/layout.tsx`) are hidden while on `/admin`. Both are already client components; each adds a pathname check (`usePathname()` from `next/navigation`) and returns `null` when the path starts with `/admin`. No changes to `app/layout.tsx` itself — this keeps the shell logic colocated with the components that already own their own rendering.
- Main content area keeps a top bar with the current tab's Thai title + a one-line description, matching the mockup validated during brainstorming.

### 2. Shared visual language

- Cards: `bg-surface-card`, `border-border`, `rounded-[--radius-card]`, subtle shadow (`0 4px 14px -8px rgba(26,29,38,.1)`) instead of the flat border-only cards used today.
- Headings, stat numbers, and section titles use Anuphan (matches the site's existing `h1`–`h6` rule); body copy, table cells, and nav labels stay on Sarabun — no new fonts introduced, this only makes existing tokens consistently applied inside `/admin` (today `AdminDashboard.tsx` doesn't consistently apply the heading font to non-`h*` elements like stat numbers).
- One accent stat/card per tab where it makes sense (e.g., Overview's "signups today" card) uses `--gradient-brand` as a filled background instead of a white card, for visual hierarchy.
- Buttons/pills (day-range selector, tab nav) get rounded-full active states in `--color-primary` with white text; inactive state uses `--color-surface-panel`.

### 3. Per-tab changes (visual only — same props/data/handlers)

- **OverviewTab**: stat card grid gets the shadow/gradient treatment above; the signups bar chart bars switch from flat `bg-primary/70` to a gradient fill, with the peak day picked out in the accent teal color.
- **UsersTab**: search input gets a leading search icon and focus ring in `--color-primary`; table header becomes sticky within its scroll container; rows get a hover background and a small circular initial-avatar before the email.
- **ToolsTab**: the 7/30/90-day buttons become full-pill toggles (already close today — restyle to match the new pill visual language); each tool's usage bar becomes a gradient fill instead of solid `bg-primary`.
- **ContentTab**: each post link becomes a row with a small doc icon on the left and an external-link arrow on the right, instead of a bare `<Link>` in a `<ul>`.
- **SystemTab**: the two external links become clickable card rows with a service icon (Supabase/Vercel) and hover elevation, instead of plain text links stacked in one card.
- **ErrorCard / LoadingCard**: `ErrorCard` keeps the existing red-tinted card but adds a small warning icon; `LoadingCard` switches from a "กำลังโหลด..." text card to a skeleton/shimmer placeholder shaped like the tab's real content (stat-card skeletons on Overview, row skeletons on Users, etc.) so the loading state doesn't jump the layout.

### 4. Non-goals

- No changes to any `/api/admin/*` route, `useAdminFetch`, or data shapes.
- No new features (no new stats, no new admin actions) — this is presentation-layer only.
- No changes to the auth gate in `AdminDashboard.tsx` (`useAuth`/redirect logic stays as-is).

## Testing

Manual verification in the browser preview after implementation: log in as an admin user, visit `/admin`, click through all 5 tabs, confirm each still loads its real data (or shows the loading/error state correctly), confirm the search box and day-range filters still work, confirm the sidebar collapses correctly on a mobile viewport width, and confirm the global site Header/Footer no longer render on `/admin` but still render on every other route.
