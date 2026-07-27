"use client";

export type CloudSyncStatus = "local-only" | "syncing" | "synced" | "error";

export interface CloudSyncResult {
  status: CloudSyncStatus;
}

/**
 * Phase 1 stub: persistence is local-only, no network calls.
 * Phase 2 replaces the body with a real Supabase debounced mirror
 * to the `kc_state` table, keeping this same signature.
 */
export function useCloudSync<T>(_key: string, _state: T): CloudSyncResult {
  return { status: "local-only" };
}
