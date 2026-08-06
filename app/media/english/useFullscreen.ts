"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Fullscreen toggle for a game's root element, shared across all /media/english games. */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const fullscreenTargetRef = useRef<HTMLElement | null>(null);
  const baseSizeRef = useRef({ width: 0, height: 0 });
  const [isFull, setIsFull] = useState(false);
  const [isFallbackFull, setIsFallbackFull] = useState(false);
  const [isDesktopFallbackFull, setIsDesktopFallbackFull] = useState(false);

  useEffect(() => {
    const onChange = () =>
      setIsFull(
        document.fullscreenElement === fullscreenTargetRef.current ||
          Boolean(fullscreenTargetRef.current?.matches(":fullscreen")),
      );
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || (!isFull && !isDesktopFallbackFull)) return;

    const syncScale = () => {
      const { width, height } = baseSizeRef.current;
      if (!width || !height) return;
      const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
      el.style.setProperty("--kc-fullscreen-scale", String(scale));
    };

    syncScale();
    window.addEventListener("resize", syncScale);
    return () => {
      window.removeEventListener("resize", syncScale);
      el.classList.remove("kc-compact-canvas");
      el.style.removeProperty("--kc-fullscreen-base-width");
      el.style.removeProperty("--kc-fullscreen-base-height");
      el.style.removeProperty("--kc-fullscreen-scale");
    };
  }, [isFull, isDesktopFallbackFull]);

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

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    // The fullscreen game is a fixed viewport surface. Offsetting the fixed
    // body by the previous page scroll also offsets that surface on some
    // mobile browsers, clipping its top or bottom by exactly scrollY pixels.
    // Keep the locked document at the viewport origin and restore the saved
    // page position when fullscreen closes instead.
    document.body.style.top = "0px";
    document.body.style.left = "0px";
    document.body.style.width = "100%";
    document.body.style.overscrollBehavior = "none";

    return () => {
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
      setIsDesktopFallbackFull(false);
      return;
    }

    if (document.fullscreenElement || fullscreenTargetRef.current?.matches(":fullscreen")) {
      await document.exitFullscreen?.();
      return;
    }

    // Mobile browsers can drop native element fullscreen when a game changes
    // its internal React stage. Keep phones and touch-first devices inside the
    // stable CSS fullscreen surface instead, so moving between game screens
    // never exits fullscreen.
    const useStableMobileFullscreen =
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 767px)").matches;
    if (useStableMobileFullscreen) {
      setIsDesktopFallbackFull(false);
      setIsFallbackFull(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    baseSizeRef.current = { width: rect.width, height: rect.height };
    el.style.setProperty("--kc-fullscreen-base-width", `${rect.width}px`);
    el.style.setProperty("--kc-fullscreen-base-height", `${rect.height}px`);
    el.style.setProperty(
      "--kc-fullscreen-scale",
      String(Math.min(window.innerWidth / rect.width, window.innerHeight / rect.height)),
    );
    el.classList.toggle("kc-compact-canvas", rect.width < 1000);

    // iOS Safari and some in-app browsers expose no usable element fullscreen
    // API. If native fullscreen is unavailable or rejected, use the same
    // fixed, viewport-sized surface as a fallback.
    const fullscreenTarget = el.parentElement ?? el;
    fullscreenTargetRef.current = fullscreenTarget;
    if (typeof fullscreenTarget.requestFullscreen === "function") {
      try {
        await fullscreenTarget.requestFullscreen();
        return;
      } catch {
        // Preserve the measured canvas for the desktop CSS fallback. Reflowing
        // it to 100vw here would resize responsive children and then scale the
        // whole game a second time.
      }
    }

    setIsDesktopFallbackFull(true);
    setIsFallbackFull(true);
  }, [isFallbackFull]);

  return {
    ref,
    isFull: isFull || isFallbackFull,
    fullscreenClassName: isDesktopFallbackFull
      ? "kc-desktop-fallback-fullscreen kc-scaled-fullscreen"
      : isFallbackFull
      ? "kc-mobile-fullscreen kc-scaled-fullscreen"
      : isFull
        ? "kc-scaled-fullscreen"
        : "",
    toggle,
  };
}
