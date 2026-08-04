"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./LawDailyEmbed.module.css";

export default function LawDailyEmbed() {
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [fallbackFull, setFallbackFull] = useState(false);

  const publishState = useCallback((active: boolean) => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "KHUNCOOL_FULLSCREEN_STATE", active },
      window.location.origin,
    );
  }, []);

  const closeFallback = useCallback(() => {
    setFallbackFull(false);
    publishState(false);
  }, [publishState]);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    if (!shell) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      closeFallback();
      return;
    }

    if (fallbackFull) {
      closeFallback();
      return;
    }

    if (typeof shell.requestFullscreen === "function") {
      try {
        await shell.requestFullscreen();
        publishState(true);
        return;
      } catch {
        // iOS and some in-app browsers expose the API but reject the request.
      }
    }

    setFallbackFull(true);
    publishState(true);
  }, [closeFallback, fallbackFull, publishState]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.type !== "KHUNCOOL_TOGGLE_FULLSCREEN"
      ) return;
      void toggleFullscreen();
    };
    const onFullscreenChange = () => publishState(Boolean(document.fullscreenElement));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && fallbackFull) closeFallback();
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeFallback, fallbackFull, publishState, toggleFullscreen]);

  useEffect(() => {
    if (!fallbackFull) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [fallbackFull]);

  return (
    <div ref={shellRef} className={`${styles.shell} ${fallbackFull ? styles.fallbackFull : ""}`}>
      <iframe
        ref={frameRef}
        className={styles.frame}
        src="/games/law-daily/index.html"
        title="เกมคดีเด็ด เมืองสันติสุข — กฎหมายในชีวิตประจำวัน"
        loading="eager"
        allow="fullscreen; autoplay"
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
}
