// Single source of truth for "how many media does each subject have".
//
// Every subject already keeps its own media list; this module counts those
// lists instead of restating the totals. Add a game to a subject's data file
// and the hub card, the cross-subject panels, the site total and the
// structured data all follow on their own.

import { MEDIA as ENGLISH_MEDIA } from "./english/data";
import { MEDIA as COMPUTER_MEDIA } from "./computer/data";
import { MEDIA as SOCIAL_MEDIA } from "./social-studies/data";
import { SUBJECT_CONTENT } from "./subjectContent";
import { ENGLISH_DATE_MODIFIED } from "./english/seo";

export type SubjectSlug =
  | "english"
  | "mathematics"
  | "science"
  | "thai"
  | "social-studies"
  | "computer";

/** Only resources with a href are playable; placeholders must not be counted. */
const playable = <T extends { href?: string }>(items: readonly T[]) =>
  items.filter((item) => Boolean(item.href)).length;

export const MEDIA_COUNTS: Record<SubjectSlug, number> = {
  english: playable(ENGLISH_MEDIA),
  mathematics: playable(SUBJECT_CONTENT.mathematics.resources),
  science: playable(SUBJECT_CONTENT.science.resources),
  thai: playable(SUBJECT_CONTENT.thai.resources),
  "social-studies": playable(SOCIAL_MEDIA),
  computer: playable(COMPUTER_MEDIA),
};

export const TOTAL_MEDIA = Object.values(MEDIA_COUNTS).reduce((sum, n) => sum + n, 0);

/** "8 สื่อ" — the badge every subject card and cross-subject panel shows. */
export const mediaLabel = (slug: SubjectSlug) => `${MEDIA_COUNTS[slug]} สื่อ`;

export const SUBJECT_INFO: Record<SubjectSlug, { name: string; icon: string; href: string }> = {
  english: { name: "ภาษาอังกฤษ", icon: "🔤", href: "/media/english" },
  mathematics: { name: "คณิตศาสตร์", icon: "🔢", href: "/media/mathematics" },
  science: { name: "วิทยาศาสตร์", icon: "🔬", href: "/media/science" },
  thai: { name: "ภาษาไทย", icon: "📖", href: "/media/thai" },
  "social-studies": { name: "สังคมศึกษา", icon: "🗺️", href: "/media/social-studies" },
  computer: { name: "คอมพิวเตอร์", icon: "💻", href: "/media/computer" },
};

const ORDER: SubjectSlug[] = [
  "english",
  "mathematics",
  "science",
  "thai",
  "social-studies",
  "computer",
];

/** Cross-subject nav for a subject page, with the current subject left out. */
export const otherSubjects = (current: SubjectSlug) =>
  ORDER.filter((slug) => slug !== current).map((slug) => ({
    slug,
    t: SUBJECT_INFO[slug].name,
    icon: SUBJECT_INFO[slug].icon,
    href: SUBJECT_INFO[slug].href,
    st: mediaLabel(slug),
  }));

/** Playable hrefs per subject, in the same order the subject page lists them. */
const SUBJECT_MEDIA: Record<SubjectSlug, readonly { href?: string }[]> = {
  english: ENGLISH_MEDIA,
  mathematics: SUBJECT_CONTENT.mathematics.resources,
  science: SUBJECT_CONTENT.science.resources,
  thai: SUBJECT_CONTENT.thai.resources,
  "social-studies": SOCIAL_MEDIA,
  computer: COMPUTER_MEDIA,
};

/** Every /media URL: the hub, each subject page, and each playable resource.
 *  The sitemap reads this instead of restating routes, so a game added to a
 *  subject's data file is submitted to search engines without a second edit. */
export const MEDIA_ROUTES: string[] = [
  "/media",
  ...ORDER.flatMap((slug) => [
    SUBJECT_INFO[slug].href,
    ...SUBJECT_MEDIA[slug].map((item) => item.href).filter((href): href is string => Boolean(href)),
  ]),
];

const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

/** "2026-08-24" -> "24 ส.ค. 2569" */
export const formatThaiDate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${THAI_MONTHS[month - 1]} ${year + 543}`;
};

/** Newest content date across the subjects that track one. */
export const LAST_UPDATED = [
  ENGLISH_DATE_MODIFIED,
  ...Object.values(SUBJECT_CONTENT).map((content) => content.updated),
].sort().at(-1)!;
