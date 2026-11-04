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
