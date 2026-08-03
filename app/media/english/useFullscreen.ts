"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Fullscreen toggle for a game's root element, shared across all /media/english games. */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [isFallbackFull, setIsFallbackFull] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isFallbackFull) return;

    const previousOverflow = document.body.style.overflow;
    el.classList.add("kc-mobile-fullscreen");
    document.body.style.overflow = "hidden";

    return () => {
      el.classList.remove("kc-mobile-fullscreen");
      document.body.style.overflow = previousOverflow;
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

    // iOS Safari and some in-app mobile browsers expose no usable element
    // fullscreen API. If native fullscreen is unavailable or rejected, use a
    // fixed, viewport-sized game surface so the control still works.
    if (typeof el.requestFullscreen === "function") {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // Fall through to the mobile-safe CSS implementation.
      }
    }

    setIsFallbackFull(true);
  }, [isFallbackFull]);

  return { ref, isFull: isFull || isFallbackFull, toggle };
}
