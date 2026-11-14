import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import {
  parseMessageId,
  parseStatusFilter,
  parseStatusUpdate,
} from "@/lib/support/moderation";
import { SUPPORT_TABLE, type SupportMessageRow } from "@/lib/support/store";

function failed(error: { message: string }) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

/** Messages in one status, newest first. */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const status = parseStatusFilter(new URL(request.url).searchParams.get("status"));
  const { data, error } = await createServiceRoleClient()
    .from(SUPPORT_TABLE)
    .select("id, name, message, status, created_at")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return failed(error);

  return NextResponse.json({ messages: (data ?? []) as SupportMessageRow[] });
}

/** Approve, hide, or send back to pending. */
export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const update = parseStatusUpdate(body);
  if (!update) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const { error } = await createServiceRoleClient()
    .from(SUPPORT_TABLE)
    .update({ status: update.status })
    .eq("id", update.id);
  if (error) return failed(error);

  return NextResponse.json({ ok: true });
}

/** Permanent delete, for a teacher who asks for their message to go. */
export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = parseMessageId(new URL(request.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const { error } = await createServiceRoleClient().from(SUPPORT_TABLE).delete().eq("id", id);
  if (error) return failed(error);

  return NextResponse.json({ ok: true });
}
