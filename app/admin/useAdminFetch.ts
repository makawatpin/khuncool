"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

type State<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ok"; data: T };

/** Fetches one /api/admin/* endpoint with the current session's access
 *  token attached. Each tab uses its own instance so one failing card
 *  never breaks the others. */
export function useAdminFetch<T>(path: string): State<T> {
  const [state, setState] = useState<State<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          if (!cancelled) setState({ status: "error", error: "ไม่มีเซสชัน" });
          return;
        }
        const res = await fetch(path, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (!cancelled) setState({ status: "error", error: `HTTP ${res.status}` });
          return;
        }
        const json = await res.json();
        if (!cancelled) setState({ status: "ok", data: json });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            error: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
