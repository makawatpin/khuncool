"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase/client";

export type CloudSyncStatus = "local-only" | "syncing" | "synced" | "error";

export interface CloudSyncResult {
  status: CloudSyncStatus;
  /**
   * Bumped (to `Date.now()`) once after a cloud pull has written newer data
   * into this key's own localStorage slot. Callers that hydrate their state
   * from localStorage on mount should add this value to that effect's
   * dependency array so a cloud pull that resolves *after* the initial,
   * synchronous localStorage read still gets picked up.
   */
  pulled: number;
}

const TABLE = "kc_state";
const PUSH_DEBOUNCE_MS = 1200;

/**
 * Maps each `useCloudSync` key to the localStorage key the corresponding
 * app already reads/writes on its own. A cloud pull is dropped into that
 * same localStorage slot so the app's existing hydration logic picks it up
 * naturally, instead of the hook reaching into each app's React state.
 */
const LOCAL_STORAGE_KEY: Record<string, string> = {
  attendance: "khuncool_attendance_v1",
  savings: "khuncool_savings_v1",
  homeroom: "khuncool.homeroom",
  classrooms: "khuncool.classrooms.v1",
  questionSets: "khuncool.questionsets.v1",
};

function stampKey(key: string) {
  return `khuncool.__syncedAt.${key}`;
}

/**
 * Phase 2: mirrors the caller's own state into a per-key slot of the
 * shared `kc_state.data` JSONB column (one row per signed-in user), and
 * pulls that slot back down on sign-in with last-write-wins semantics
 * (comparing the cloud row's `updated_at` against a local per-key stamp).
 *
 * Signed-out (guest) users get `local-only` and this hook makes zero
 * network calls — Phase 1 behavior is preserved for guests.
 */
export function useCloudSync<T>(key: string, state: T): CloudSyncResult {
  const { user } = useAuth();
  // Tracks only the signed-in sync lifecycle (syncing/synced/error). The
  // signed-out case is derived below instead of being set from an effect,
  // so mounting/unmounting sign-in state never calls setState synchronously
  // inside an effect body (react-hooks/set-state-in-effect).
  const [asyncStatus, setStatus] = useState<CloudSyncStatus>("local-only");
  const [pulled, setPulled] = useState(0);
  const status: CloudSyncStatus = user ? asyncStatus : "local-only";

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulledForUser = useRef<string | null>(null);
  // Skip the push that would otherwise fire immediately after mount (before
  // any real user edit) or right after a pull writes hydrated state back in.
  const skipNextPush = useRef(true);

  // Pull once per sign-in.
  useEffect(() => {
    if (!user) {
      pulledForUser.current = null;
      return;
    }
    if (pulledForUser.current === user.id) return;
    pulledForUser.current = user.id;
    let cancelled = false;

    (async () => {
      setStatus("syncing");
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from(TABLE)
          .select("data,updated_at")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;

        const cloudData =
          data?.data && typeof data.data === "object"
            ? (data.data as Record<string, unknown>)
            : null;
        const cloudValue = cloudData ? cloudData[key] : undefined;

        if (cloudValue !== undefined && typeof window !== "undefined") {
          const cloudAt = data?.updated_at ? Date.parse(data.updated_at) : 0;
          const localAt = parseInt(
            window.localStorage.getItem(stampKey(key)) || "0",
            10,
          );
          const lsKey = LOCAL_STORAGE_KEY[key];
          if (lsKey && cloudAt > localAt) {
            window.localStorage.setItem(lsKey, JSON.stringify(cloudValue));
            window.localStorage.setItem(
              stampKey(key),
              String(cloudAt || Date.now()),
            );
            skipNextPush.current = true;
            setPulled(Date.now());
          }
        }
        if (!cancelled) setStatus("synced");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, key]);

  // Debounced push of the caller's own state, signed-in only.
  const stateJson = JSON.stringify(state);
  useEffect(() => {
    if (!user) return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }

    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      (async () => {
        setStatus("syncing");
        try {
          const supabase = await getSupabase();
          // Read-modify-write merge of this key into the shared row's JSONB
          // `data` column, done client-side rather than via a single SQL
          // merge (e.g. `data = data || jsonb_build_object(...)`).
          // Phase 2 tradeoff: two round trips instead of one atomic update,
          // so a push for a *different* key from another tab racing between
          // this read and this upsert could be overwritten. Acceptable for
          // now since the 3 tools are rarely edited simultaneously in two
          // tabs by the same signed-in user; a Postgres RPC doing the merge
          // atomically would remove the race if this becomes a problem.
          const { data: existing } = await supabase
            .from(TABLE)
            .select("data")
            .eq("user_id", user.id)
            .maybeSingle();
          const existingData =
            existing?.data && typeof existing.data === "object"
              ? (existing.data as Record<string, unknown>)
              : {};
          const merged = { ...existingData, [key]: JSON.parse(stateJson) };
          const nowIso = new Date().toISOString();

          const { error } = await supabase.from(TABLE).upsert(
            { user_id: user.id, data: merged, updated_at: nowIso },
            { onConflict: "user_id" },
          );
          if (error) throw error;

          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              stampKey(key),
              String(Date.parse(nowIso)),
            );
          }
          setStatus("synced");
        } catch {
          setStatus("error");
        }
      })();
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [user, key, stateJson]);

  return { status, pulled };
}
