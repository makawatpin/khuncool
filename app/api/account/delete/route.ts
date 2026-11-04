import { NextResponse } from "next/server";
import { deleteAccountForToken, type AccountAdmin } from "@/lib/account/deleteAccount";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";

/**
 * A signed-in teacher deletes their own account and all data synced to it.
 * The bearer token decides whose account; nothing in the body is trusted.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const result = await deleteAccountForToken(
    token,
    createServiceRoleClient() as unknown as AccountAdmin,
  );
  return NextResponse.json(
    result.error ? { error: result.error } : { ok: true },
    { status: result.status },
  );
}
