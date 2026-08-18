"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/*
 * `@supabase/supabase-js` is ~230KB uncompressed and was previously created
 * eagerly at module scope, which put it in the first-load JS of every route
 * (including static blog posts that never touch auth). Dynamically import
 * it on first use instead, and memoize the resulting client/promise so every
 * caller across the app shares one instance and one in-flight import.
 */
let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Resolves to the app's single shared Supabase client, importing the SDK on
 * first call. Concurrent callers share one in-flight import. Rejects if the
 * SDK chunk cannot be loaded or the environment variables are missing; a
 * rejection is not cached, so a later call retries.
 */
export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    const pending = import("@supabase/supabase-js").then(({ createClient }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and " +
            "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (see .env.example)."
        );
      }

      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "khuncool-auth",
        },
      });
    });
    // A failed import (offline, a chunk 404 after redeploy) must not poison
    // the memo — drop it so the next caller retries instead of replaying the
    // same rejection forever. Also marks `pending` as handled.
    pending.catch(() => {
      if (clientPromise === pending) clientPromise = null;
    });
    clientPromise = pending;
  }
  return clientPromise;
}
