"use client";

import { getSupabase } from "@/lib/supabase/client";

/** The admin dashboard's first write path. `useAdminFetch` only reads, so
 *  this sends PATCH/DELETE to /api/admin/* with the same bearer token and
 *  throws on any non-2xx so the caller can show the failure. */
export async function adminRequest(
  path: string,
  init: { method: "PATCH" | "DELETE"; body?: unknown },
): Promise<void> {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("ไม่มีเซสชัน");

  const res = await fetch(path, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body !== undefined && { "Content-Type": "application/json" }),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
