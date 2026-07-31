import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";

export type AdminAuthResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403; error: string };

function getAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Verifies the bearer token from an admin API request and checks the
 *  resolved email against ADMIN_EMAILS. This is the real security boundary —
 *  the /admin page's client-side gate is UX only. */
export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "missing bearer token" };

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) {
    return { ok: false, status: 401, error: "invalid session" };
  }

  const email = data.user.email.toLowerCase();
  if (!getAllowlist().includes(email)) {
    return { ok: false, status: 403, error: "not an admin" };
  }

  return { ok: true, email };
}
