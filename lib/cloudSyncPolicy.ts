/** Field inside `kc_state.data` holding when each app's slot was last pushed. */
export const UPDATED_AT_FIELD = "__updatedAt";

/**
 * When this app's slot in the cloud row was last written. The row's own
 * `updated_at` changes whenever *any* app pushes, so it is only the fallback
 * for rows written before per-app times existed.
 */
export function cloudUpdatedAt(
  data: Record<string, unknown> | null,
  key: string,
  rowUpdatedAt: string | null | undefined,
): number {
  const times = data?.[UPDATED_AT_FIELD];
  const own = times && typeof times === "object" ? (times as Record<string, unknown>)[key] : undefined;
  const iso = typeof own === "string" ? own : rowUpdatedAt;
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : 0;
}

export type PullDecision = "use-cloud" | "ask" | "push-local" | "nothing";

/**
 * What to do with one app's data on sign-in. `dirty` means this device has
 * changes the cloud has not received (made signed out, offline, or before a
 * push finished). Those are never replaced silently.
 */
export function decidePull(p: {
  hasCloud: boolean;
  cloudAt: number;
  localAt: number;
  dirty: boolean;
}): PullDecision {
  if (p.hasCloud && p.cloudAt > p.localAt) return p.dirty ? "ask" : "use-cloud";
  return p.dirty ? "push-local" : "nothing";
}

/**
 * Each `useCloudSync` key and the localStorage slot its app already reads
 * and writes. A cloud pull lands in that slot so the app's own hydration
 * picks it up.
 */
export const SYNCED_LOCAL_KEYS: Record<string, string> = {
  attendance: "khuncool_attendance_v1",
  savings: "khuncool_savings_v1",
  toothbrushing: "khuncool_toothbrushing_v1",
  milk: "khuncool_milk_v1",
  homeroom: "khuncool.homeroom",
  classrooms: "khuncool.classrooms.v1",
  questionSets: "khuncool.questionsets.v1",
  reportHeader: "khuncool.reportHeader",
};
