"use client";

import { useAccountSheet } from "@/components/AccountSheet";

/**
 * Phase 1 has no real auth — AccountSheet is signed-out-only (see Task 4).
 * The source screen (screens/Apps.dc.html) assumes a signed-in state where
 * this banner reads as an upsell to create an account so records sync
 * across devices. Adapted here to open the same signed-out AccountSheet
 * used across the app, rather than linking to a nonexistent /account route.
 */
export default function SignInCta() {
  const { openAccountSheet } = useAccountSheet();

  return (
    <button
      type="button"
      onClick={openAccountSheet}
      className="flex-none rounded-btn bg-primary px-5 py-[11px] text-sm font-semibold text-white no-underline hover:bg-primary-hover hover:text-white"
    >
      สร้างบัญชีฟรี
    </button>
  );
}
