"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

/**
 * Fullscreen toggle shared by the classroom tools (attendance, savings,
 * homeroom, timer, scoreboard, noise meter, duck race).
 *
 * Safari on iPhone and iPad exposes no element-level Fullscreen API for
 * ordinary HTML, so `requestFullscreen` is simply absent on a `<div>` there.
 * Each tool used to guard on `el.requestFullscreen` and do nothing when it was
 * missing, which left the button dead on every iOS device. Fall back to a
 * fixed, viewport-sized CSS surface instead — the same approach the /media
 * games use — and lock the page behind it so the background cannot scroll
 * underneath the tool.
 *
 * `fallbackClass` names the CSS class that turns the element into that
 * surface. It must be paired with the tool's own `:fullscreen` rules, so the
 * two paths render identically.
 */
export function useToolFullscreen<T extends HTMLElement>(
  ref: RefObject<T | null>,
  fallbackClass = "tool-mobile-fullscreen",
) {
  const [isNativeFull, setIsNativeFull] = useState(false);
  const [isFallbackFull, setIsFallbackFull] = useState(false);

  useEffect(() => {
    const sync = () => setIsNativeFull(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [ref]);

  useEffect(() => {
    if (!isFallbackFull) return;

    const previousBody = {
      overflow: document.body.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior,
    };
    const previousHtml = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      Object.assign(document.body.style, previousBody);
      document.documentElement.style.overflow = previousHtml;
    };
  }, [isFallbackFull]);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;

    if (isFallbackFull) {
      setIsFallbackFull(false);
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    if (typeof el.requestFullscreen === "function") {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // Some in-app browsers expose the method but reject the request.
      }
    }

    setIsFallbackFull(true);
  }, [isFallbackFull, ref]);

  return {
    isFull: isNativeFull || isFallbackFull,
    fullscreenClassName: isFallbackFull ? fallbackClass : "",
    toggle,
  };
}
