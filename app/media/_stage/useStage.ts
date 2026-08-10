"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fullscreen control for a `.kc-stage` surface.
 *
 * This replaces the measure-and-scale approach in
 * `app/media/english/useFullscreen.ts`. That hook captured the canvas size
 * before entering fullscreen and scaled the whole element by a ratio, which
 * meant the base size was frozen at the moment of entry — rotating the device
 * left the game as a portrait box floating in a landscape screen — and every
 * game needed hand-tuned per-screen scale rules to compensate.
 *
 * Here fullscreen only resizes the stage. Everything inside is expressed in
 * container query units, so the layout re-resolves by itself, at any size, in
 * any orientation, with no measurement and nothing to keep in sync.
 *
 * Safari on iPhone and iPad exposes no element-level Fullscreen API for
 * ordinary HTML, so `requestFullscreen` is simply absent on a div there. The
 * CSS fallback renders identically because both paths set `data-fullscreen`.
 */
export function useStage<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isNativeFull, setIsNativeFull] = useState(false);
  const [isFallbackFull, setIsFallbackFull] = useState(false);
  const isFull = isNativeFull || isFallbackFull;

  useEffect(() => {
    const sync = () => setIsNativeFull(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Only the fallback needs the page locked. Native fullscreen already takes
  // the element out of the document flow.
  useEffect(() => {
    if (!isFallbackFull) return;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousBody = {
      overflow: document.body.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior,
    };
    const previousHtml = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
    };

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      Object.assign(document.body.style, previousBody);
      Object.assign(document.documentElement.style, previousHtml);
      window.scrollTo(scrollX, scrollY);
    };
  }, [isFallbackFull]);

  // Esc leaves native fullscreen on its own; give the fallback the same exit.
  useEffect(() => {
    if (!isFallbackFull) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFallbackFull(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

    // Mobile browsers can drop native element fullscreen when a game swaps its
    // internal stage, so touch-first devices stay on the CSS surface where
    // moving between game screens never exits fullscreen.
    const preferCssFullscreen =
      typeof navigator !== "undefined" &&
      (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        window.matchMedia("(hover: none) and (pointer: coarse)").matches);

    if (!preferCssFullscreen && typeof el.requestFullscreen === "function") {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // Some in-app browsers expose the method but reject the request.
      }
    }

    setIsFallbackFull(true);
  }, [isFallbackFull]);

  return {
    ref,
    isFull,
    /** Spread onto the `.kc-stage` element. */
    stageProps: { ref, "data-fullscreen": isFull ? "" : undefined },
    toggle,
  };
}
