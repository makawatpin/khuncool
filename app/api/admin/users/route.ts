import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchAllUsers, type UserLister } from "@/lib/admin/fetchAllUsers";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceRoleClient();
  let rows;
  try {
    rows = await fetchAllUsers(supabase as unknown as UserLister);
  } catch (error) {
    const message = error instanceof Error ? error.message : "query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const users = rows
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      fullName: (u.user_metadata?.full_name as string) || "",
      school: (u.user_metadata?.school as string) || "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ users });
}
