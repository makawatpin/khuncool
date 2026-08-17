import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;
const PREFIX = "blog/";

/** Paginates past the 1000-row PostgREST cap (see fetchAllToolEvents) while
 *  grouping blog 'view' events by slug server-side. */
export async function fetchBlogViewCounts(
  supabase: SupabaseClient
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("tool_events")
      .select("tool")
      .eq("event", "view")
      .like("tool", `${PREFIX}%`)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    for (const row of data) {
      const slug = row.tool.slice(PREFIX.length);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return counts;
}
