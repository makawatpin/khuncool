"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  title: string;
};

export default function ToolFullscreenFrame({ children, title }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const sync = () => setIsFull(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }
    try {
      await el.requestFullscreen();
    } catch {
      el.classList.toggle("tool-mobile-fullscreen");
      setIsFull(el.classList.contains("tool-mobile-fullscreen"));
    }
  }, []);

  return (
    <div ref={ref} className="tool-stage bg-white">
      <div className="tool-stage-bar">
        <span>{title}</span>
        <button type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>
          ⛶ <span>{isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}</span>
        </button>
      </div>
      <div className="tool-stage-content">{children}</div>
    </div>
  );
}
