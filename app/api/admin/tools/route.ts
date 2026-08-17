import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchAllToolEvents } from "@/lib/admin/fetchAllToolEvents";

const VALID_RANGES = { "7": 7, "30": 30, "90": 90 } as const;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("days") ?? "30";
  const days = VALID_RANGES[rangeParam as keyof typeof VALID_RANGES] ?? 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createServiceRoleClient();
  let data: { tool: string; user_id: string | null }[];
  try {
    data = await fetchAllToolEvents(supabase, since);
  } catch (error) {
    const message = error instanceof Error ? error.message : "query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const byTool = new Map<string, { total: number; guest: number; signedIn: number }>();
  for (const row of data) {
    const entry = byTool.get(row.tool) ?? { total: 0, guest: 0, signedIn: 0 };
    entry.total += 1;
    if (row.user_id) entry.signedIn += 1;
    else entry.guest += 1;
    byTool.set(row.tool, entry);
  }

  const tools = [...byTool.entries()]
    .map(([tool, counts]) => ({ tool, ...counts }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ days, tools });
}
