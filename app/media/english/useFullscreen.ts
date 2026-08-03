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
    const isActive = isFull || isFallbackFull;
    if (!el || !isActive) return;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousBody = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      width: document.body.style.width,
      overscrollBehavior: document.body.style.overscrollBehavior,
    };
    const previousHtml = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
    };

    if (isFallbackFull) el.classList.add("kc-mobile-fullscreen");
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = "100%";
    document.body.style.overscrollBehavior = "none";

    return () => {
      el.classList.remove("kc-mobile-fullscreen");
      Object.assign(document.body.style, previousBody);
      Object.assign(document.documentElement.style, previousHtml);
      window.scrollTo(scrollX, scrollY);
    };
  }, [isFull, isFallbackFull]);

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

    // Mobile browsers can drop native element fullscreen when a game changes
    // its internal React stage. Keep phones and touch-first devices inside the
    // stable CSS fullscreen surface instead, so moving between game screens
    // never exits fullscreen.
    const useStableMobileFullscreen =
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 767px)").matches;
    if (useStableMobileFullscreen) {
      setIsFallbackFull(true);
      return;
    }

    // iOS Safari and some in-app browsers expose no usable element fullscreen
    // API. If native fullscreen is unavailable or rejected, use the same
    // fixed, viewport-sized surface as a fallback.
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
