import { fromIsoDate, toIsoDate } from "@/lib/dailyCheck/days";

/**
 * The five days "+ จ–ศ" adds: Monday to Friday of the week after the latest
 * recorded day, or of the current week when nothing is recorded yet. Dates
 * stay in local time throughout; going through toISOString() would shift a
 * local midnight to the day before in Thailand (UTC+7).
 */
export function weekToAdd(existingDates: string[], now: Date): string[] {
  const latest = existingDates.filter(Boolean).sort().pop();
  const base = latest ? fromIsoDate(latest) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Back to that week's Monday (getDay: 0 = Sunday).
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7) + (latest ? 7 : 0));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return toIsoDate(d);
  });
}

/**
 * The term and Buddhist-era academic year a date falls in. Thai schools run
 * term 1 from mid-May to October and term 2 from November to March; January
 * to April still belong to the academic year that started the May before.
 */
export function academicTermFor(now: Date): { term: string; year: string } {
  const m = now.getMonth(); // 0 = January
  const be = now.getFullYear() + 543;
  if (m >= 4 && m <= 9) return { term: "1", year: String(be) };
  return { term: "2", year: String(m >= 10 ? be : be - 1) };
}

/** First and last calendar day a term can hold, for summing up its records. */
export function termBounds(term: string, year: string): { from: string; to: string } | null {
  const ad = parseInt(year, 10) - 543;
  if (!Number.isFinite(ad) || ad < 1900) return null;
  if (term === "1") return { from: `${ad}-05-01`, to: `${ad}-10-31` };
  if (term === "2") return { from: `${ad}-11-01`, to: `${ad + 1}-04-30` };
  return null;
}
