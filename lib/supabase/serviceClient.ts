import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for the admin APIs and account deletion. Bypasses RLS,
 * so it must never be reachable without `requireAdmin` (or, for account
 * deletion, a verified bearer token) in front of it.
 *
 * The environment is read inside the function, not at module scope: a
 * module-scope throw runs while Next collects page data, so a checkout
 * without these variables could not `next build` at all (it failed on
 * /api/account/delete). Deployments set them; local builds and previews that
 * never call an admin route should not need them. A missing variable now
 * fails that one request instead of the whole build.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server environment variables: NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY must be set (see reference/ADMIN-SETUP.md)."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
