"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Fullscreen toggle for a game's root element, shared across all /media/english games. */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  return { ref, isFull, toggle };
}
