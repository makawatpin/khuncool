import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;

/** PostgREST caps unpaginated selects at 1000 rows. tool_events has grown
 *  past that, which silently truncated admin stats (see incident 2026-08-18:
 *  30-day and 90-day tool counts came back identical and smaller than the
 *  7-day count because all three requests hit the same cap on different,
 *  arbitrarily-ordered slices). Page through the full result set instead. */
export async function fetchAllToolEvents(
  supabase: SupabaseClient,
  sinceIso: string
): Promise<{ tool: string; user_id: string | null }[]> {
  const rows: { tool: string; user_id: string | null }[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("tool_events")
      .select("tool, user_id")
      .gte("created_at", sinceIso)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}
