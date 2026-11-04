import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchAllToolEvents } from "@/lib/admin/fetchAllToolEvents";
import { fetchAllUsers, type UserLister } from "@/lib/admin/fetchAllUsers";
import { bangkokDay } from "@/lib/admin/bangkokDay";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceRoleClient();

  let users;
  try {
    users = await fetchAllUsers(supabase as unknown as UserLister);
  } catch (error) {
    const message = error instanceof Error ? error.message : "query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * DAY_MS;

  const totalUsers = users.length;

  // A rolling 168-hour window, so this one needs no calendar and no zone.
  const activeLast7Days = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() >= sevenDaysAgo,
  ).length;

  // "Today" and the per-day buckets below are Thai calendar days. They used
  // to be the server's: `setHours(0, 0, 0, 0)` on Vercel means midnight UTC,
  // and `created_at.slice(0, 10)` is the UTC date out of the timestamp. Both
  // put a signup made between 00:00 and 07:00 in Thailand on the day before,
  // so the figure an admin reads at breakfast omitted the whole early
  // morning and the chart's bars were each ~7 hours out of step.
  const today = bangkokDay();
  const signupsToday = users.filter((u) => bangkokDay(u.created_at) === today).length;

  let topToolRows: { tool: string; user_id: string | null }[];
  try {
    topToolRows = await fetchAllToolEvents(supabase, new Date(sevenDaysAgo).toISOString());
  } catch (error) {
    const message = error instanceof Error ? error.message : "query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  const counts = new Map<string, number>();
  for (const row of topToolRows) {
    counts.set(row.tool, (counts.get(row.tool) || 0) + 1);
  }
  const topTool = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const signupsByDay: Record<string, number> = {};
  const thirtyDaysAgo = now - 30 * DAY_MS;
  for (const u of users) {
    const t = new Date(u.created_at).getTime();
    if (t < thirtyDaysAgo) continue;
    const day = bangkokDay(u.created_at);
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  }

  return NextResponse.json({
    totalUsers,
    activeLast7Days,
    signupsToday,
    topTool,
    signupsByDay,
  });
}
