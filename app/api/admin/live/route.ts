import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchToolEventsDetailed } from "@/lib/admin/fetchAllToolEvents";
import { fetchAllUsers, type UserLister } from "@/lib/admin/fetchAllUsers";
import { computeLiveStats, startOfBangkokYesterday } from "@/lib/admin/liveStats";

// Polled every few seconds by the overview tab; never cache it.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceRoleClient();
  const now = new Date();

  try {
    const [events, users] = await Promise.all([
      fetchToolEventsDetailed(supabase, startOfBangkokYesterday(now)),
      fetchAllUsers(supabase as unknown as UserLister),
    ]);
    return NextResponse.json(computeLiveStats(events, users, now), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
