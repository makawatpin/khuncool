/**
 * The calendar day an instant falls on in Thailand, as `YYYY-MM-DD`.
 *
 * Every "today" and every per-day bucket in the admin dashboard has to be
 * Thai-local: the teachers are, and so is whoever reads the numbers. The
 * server is not — Vercel runs in UTC, seven hours behind — so anything
 * derived from the server's own clock (`setHours(0,0,0,0)`) or from the UTC
 * half of a timestamp (`created_at.slice(0, 10)`) silently attributes the
 * first seven hours of a Thai day to the day before.
 *
 * `en-CA` is used because it formats as `YYYY-MM-DD` directly, so the result
 * is both the display form and a correctly sortable/comparable key.
 */
export function bangkokDay(instant: Date | string = new Date()): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}
