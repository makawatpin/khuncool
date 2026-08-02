# Sidebar "สื่อการสอน" submenu — group by subject

## Problem
The mobile sidebar's "สื่อการสอน" submenu (`components/Header.tsx`) currently flattens straight to the 7 English game links, skipping the subject level that already exists on the site (`/media` hub → subject cards → `/media/english` → games). As more subjects are added later, this flat list won't scale or reflect the real site hierarchy.

## Scope
Mobile sidebar only. Desktop nav has no dropdown today and stays that way — out of scope. `/media` and `/media/english` hub pages are unchanged.

## Change

### Data
Add a subject-grouped submenu structure alongside the existing flat `SUBMENUS` map in `Header.tsx`:

```ts
type MediaSubjectGroup = {
  subject: string;
  subjectHref: string;
  games: { title: string; href: string }[];
};

const MEDIA_SUBMENU: MediaSubjectGroup[] = [
  {
    subject: "ภาษาอังกฤษ",
    subjectHref: "/media/english",
    games: MEDIA_ENGLISH.map((m) => ({ title: m.title, href: m.href })),
  },
];
```

Only English is included since it's the only subject with published content. Subjects with no games yet (คณิตศาสตร์, วิทยาศาสตร์, ภาษาไทย) are omitted entirely — not shown, not disabled.

When a new subject ships, add one more entry to `MEDIA_SUBMENU`. No rendering changes needed.

### Rendering
Replace the `/media` entry's use of the flat `SUBMENUS["/media"]` list with `MEDIA_SUBMENU`. Inside the existing expand/collapse panel for the "สื่อการสอน" pillar:

- For each group, render a subject header row (bold, links to `subjectHref`)
- Under it, render the group's games, indented one level deeper than the header
- Keep the existing "ดูทั้งหมด ›" link at the bottom, pointing to `/media`

The subject header is a plain link, not its own expand/collapse toggle — with only one subject there's no need for nested toggling. Visually this renders as: subject header + 7 games, one level more indented than the games are today.

`/tools` and `/apps` entries in `SUBMENUS` are untouched.

## Out of scope
- Desktop dropdown
- Showing unpublished subjects (grayed out / "coming soon")
- Nested per-subject expand/collapse (revisit when a 2nd subject ships)
