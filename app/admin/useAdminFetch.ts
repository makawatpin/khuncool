"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

type State<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ok"; data: T };

export type AdminFetchResult<T> = State<T> & {
  /** When the last successful response arrived. */
  updatedAt: Date | null;
  /** True while a background refresh is in flight (data stays on screen). */
  refreshing: boolean;
  refresh: () => void;
};

/** Fetches one /api/admin/* endpoint with the current session's access
 *  token attached. Each tab uses its own instance so one failing card
 *  never breaks the others.
 *
 *  With `refreshMs`, it re-fetches on that interval while the browser tab
 *  is visible, and immediately when the tab comes back into view. A failed
 *  background refresh keeps the last good data instead of blanking the
 *  card — a dropped request should not wipe a dashboard someone is reading. */
export function useAdminFetch<T>(
  path: string,
  options: { refreshMs?: number } = {},
): AdminFetchResult<T> {
  const { refreshMs } = options;

  // The result remembers which path it answers, so switching path (e.g. the
  // tools tab's 7/30/90-day toggle) shows "loading" at once rather than the
  // previous range's numbers.
  const [result, setResult] = useState<{ path: string; state: State<T> } | null>(null);
  const state: State<T> =
    result && result.path === path ? result.state : { status: "loading" };

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  /** The path whose data is currently on screen, if any. */
  const shownPath = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const showing = () => shownPath.current === path;
    const fail = (error: string) => {
      // Keep the last good data on a failed background refresh.
      if (!cancelled && !showing()) setResult({ path, state: { status: "error", error } });
    };

    (async () => {
      if (showing()) setRefreshing(true);
      try {
        const supabase = await getSupabase();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          if (!cancelled) setResult({ path, state: { status: "error", error: "ไม่มีเซสชัน" } });
          return;
        }
        const res = await fetch(path, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return fail(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        if (!cancelled) {
          shownPath.current = path;
          setResult({ path, state: { status: "ok", data: json } });
          setUpdatedAt(new Date());
        }
      } catch (err) {
        fail(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  useEffect(() => {
    if (!refreshMs) return;
    const bump = () => {
      if (document.visibilityState === "visible") setTick((t) => t + 1);
    };
    const id = window.setInterval(bump, refreshMs);
    document.addEventListener("visibilitychange", bump);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", bump);
    };
  }, [refreshMs]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, updatedAt, refreshing, refresh };
}
