/** Thai lunar-calendar dates, sourced from the Thai royal calendar
 *  (ปฏิทินหลวง). Each key maps year -> "MM-DD". Only years actually
 *  looked up and confirmed appear here — never extrapolate a lunar
 *  date, since the lunar-to-solar mapping isn't a fixed formula. */
const LUNAR_DATES: Record<string, Record<number, string>> = {
  "makha-bucha": {
    2026: "03-03",
    2027: "02-21",
    2028: "03-11",
  },
  "visakha-bucha": {
    2026: "05-31",
    2027: "05-20",
    2028: "05-08",
  },
  "asalha-bucha": {
    2026: "07-29",
    2027: "07-19",
    2028: "07-06",
  },
  "khao-phansa": {
    2026: "07-30",
    2027: "07-20",
    2028: "07-07",
  },
  "ok-phansa": {
    2026: "10-26",
    2027: "10-16",
    2028: "10-03",
  },
  "loy-krathong": {
    2026: "11-24",
    2027: "11-13",
    2028: "11-01",
  },
};

/** Returns "YYYY-MM-DD" for a lunar event in a given year, or null if
 *  that key or year isn't in the table. Callers must treat null as
 *  "no data" and show that plainly — never fall back to a guess. */
export function getLunarDate(key: string, year: number): string | null {
  const yearMap = LUNAR_DATES[key];
  if (!yearMap) return null;
  const monthDay = yearMap[year];
  if (!monthDay) return null;
  return `${year}-${monthDay}`;
}
