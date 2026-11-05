// Shared letterhead for every printed report (savings, daily check, homeroom).
// The teacher sets the school name, an optional line under it and an optional
// logo once; each report supplies only its own title and meta lines.

export interface ReportHeaderSettings {
  school: string;
  subtitle: string;
  /** A small `data:image/...;base64,` URL, or "" when the teacher has no logo. */
  logo: string;
  /**
   * Never stored. The school from the teacher's profile, used only when neither
   * `school` nor the report's own school is set (see `useReportHeader().printHeader`).
   */
  profileSchool?: string;
}

export const EMPTY_REPORT_HEADER: ReportHeaderSettings = { school: "", subtitle: "", logo: "" };

/** Where the settings live in this browser; `useCloudSync` mirrors it to the account. */
export const REPORT_HEADER_LS = "khuncool.reportHeader";

/** The longest logo data URL kept, so the account row stays small. */
export const MAX_LOGO_CHARS = 150_000;

const LOGO_PATTERN = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

function esc(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Accepts whatever was stored or synced and returns only safe, known fields. */
export function normalizeReportHeader(raw: unknown): ReportHeaderSettings {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const logo =
    typeof r.logo === "string" && r.logo.length <= MAX_LOGO_CHARS && LOGO_PATTERN.test(r.logo)
      ? r.logo
      : "";
  return { school: clean(r.school, 120), subtitle: clean(r.subtitle, 160), logo };
}

/** Reads the device's copy (the cloud pull writes into the same slot). */
export function readReportHeader(): ReportHeaderSettings {
  try {
    const raw = window.localStorage.getItem(REPORT_HEADER_LS);
    return normalizeReportHeader(raw ? JSON.parse(raw) : null);
  } catch {
    return EMPTY_REPORT_HEADER;
  }
}

export const REPORT_HEADER_CSS =
  `.rh{margin-bottom:14px}.rh,.rh *{-webkit-print-color-adjust:exact;print-color-adjust:exact}` +
  `.rh-top{display:flex;align-items:center;gap:14px;padding-bottom:10px}` +
  `.rh-logo{width:60px;height:60px;object-fit:contain;flex:none}` +
  `.rh-id{flex:1;min-width:0}` +
  `.rh-school{font-size:14px;color:#5a6273;line-height:1.35}.rh-sub{font-size:12px;color:#7c8494;line-height:1.35}` +
  `.rh-title{margin:2px 0 0;font-size:22px;line-height:1.25;font-weight:700;color:#5c5ee6}` +
  `.rh-meta{flex:none;text-align:right;font-size:13px;color:#5a6273;line-height:1.5}` +
  `.rh-bar{height:4px;border-radius:2px;background:linear-gradient(90deg,#5c5ee6,#14b79a)}`;

export interface ReportHeaderInput {
  title: string;
  /** Short lines shown on the right, e.g. the room and the date. */
  meta?: string[];
  /** Used when the teacher has not set a school name of their own. */
  school?: string;
}

/** The letterhead: logo (if any), school, report title and meta, over a gradient rule. */
export function reportHeaderHtml(input: ReportHeaderInput, header: ReportHeaderSettings): string {
  const school = header.school || input.school || header.profileSchool || "";
  const logo = header.logo ? `<img class="rh-logo" src="${esc(header.logo)}" alt="">` : "";
  const meta = (input.meta ?? []).filter(Boolean);
  return (
    `<header class="rh"><div class="rh-top">${logo}<div class="rh-id">` +
    (school ? `<div class="rh-school">${esc(school)}</div>` : "") +
    (header.subtitle ? `<div class="rh-sub">${esc(header.subtitle)}</div>` : "") +
    `<h1 class="rh-title">${esc(input.title)}</h1></div>` +
    (meta.length ? `<div class="rh-meta">${meta.map(esc).join("<br>")}</div>` : "") +
    `</div><div class="rh-bar"></div></header>`
  );
}
