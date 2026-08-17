import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchAllToolEvents } from "@/lib/admin/fetchAllToolEvents";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceRoleClient();

  const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const totalUsers = usersPage.users.length;
  const activeLast7Days = usersPage.users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() >= sevenDaysAgo
  ).length;
  const signupsToday = usersPage.users.filter(
    (u) => new Date(u.created_at).getTime() >= startOfToday.getTime()
  ).length;

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
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  for (const u of usersPage.users) {
    const t = new Date(u.created_at).getTime();
    if (t < thirtyDaysAgo) continue;
    const day = u.created_at.slice(0, 10);
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
