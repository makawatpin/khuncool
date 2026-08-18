"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * `@supabase/supabase-js` is ~230KB uncompressed and was previously created
 * eagerly at module scope, which put it in the first-load JS of every route
 * (including static blog posts that never touch auth). Dynamically import
 * it on first use instead, and memoize the resulting client/promise so every
 * caller across the app shares one instance and one in-flight import.
 */
let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
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
  }
  return clientPromise;
}
