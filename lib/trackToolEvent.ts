"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/** Fire-and-forget usage log. Never throws, never blocks the caller — a
 *  failed insert (offline, RLS misconfig, etc.) must not affect the tool. */
export function trackToolEvent(tool: string) {
  supabase
    .from("tool_events")
    .insert({ tool })
    .then(({ error }) => {
      if (error) console.warn("trackToolEvent failed:", error.message);
    });
}

/** Logs one 'use' event the first time a tool page mounts client-side. */
export function useTrackToolUse(tool: string) {
  useEffect(() => {
    trackToolEvent(tool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
