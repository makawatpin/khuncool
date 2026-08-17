"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackToolEvent } from "@/lib/trackToolEvent";

/** Logs one 'view' event per blog post navigation. Lives in the /blog
 *  layout so every post is covered without touching each page.tsx —
 *  the layout persists across client-side nav, so this re-fires on
 *  pathname change rather than mount-once. */
export default function BlogViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const slug = pathname.replace(/^\/blog\/?/, "").replace(/\/$/, "");
    if (!slug) return;
    trackToolEvent(`blog/${slug}`, "view");
  }, [pathname]);

  return null;
}
