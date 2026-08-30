export type CategoryKey =
  | "holiday"
  | "paperwork"
  | "evaluation"
  | "exam"
  | "competition"
  | "career"
  | "term";

export type Occurrence =
  | { kind: "fixed"; month: number; day: number }
  | { kind: "nthWeekday"; month: number; weekday: number; nth: number }
  | { kind: "lookup"; key: string }
  | { kind: "range"; startMonth: number; startDay: number; endMonth: number; endDay: number };

export type Precision = "exact" | "approx";

export interface CalendarEvent {
  id: string;
  title: string;
  category: CategoryKey;
  occurrence: Occurrence;
  precision: Precision;
  leadDays: number;
  note?: string;
  searchTerms: string[];
  contentIdeas: string[];
}

/** ISO date string, e.g. "2026-06-26". Always represents a calendar date
 *  with no time component — comparisons are done as plain strings or by
 *  converting to UTC midnight, never with local-time Date math. */
export type IsoDate = string;

export interface ResolvedDate {
  eventDate: IsoDate;
  /** For "range" occurrences this is the end date; for all others it
   *  equals eventDate. Used so a multi-day event doesn't show as "passed"
   *  until its last day is over. */
  eventEndDate: IsoDate;
}

export type EventStatus = "overdue" | "act-now" | "upcoming" | "passed" | "unknown";

export interface AgendaItem extends CalendarEvent {
  year: number;
  resolvedDate: IsoDate | null;
  resolvedEndDate: IsoDate | null;
  publishByDate: IsoDate | null;
  status: EventStatus;
  daysUntilEvent: number | null;
  daysUntilPublishBy: number | null;
}
