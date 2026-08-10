"use client";

import { type ReactNode, useRef } from "react";
import { useToolFullscreen } from "./useToolFullscreen";

type Props = {
  children: ReactNode;
  title: string;
};

export default function ToolFullscreenFrame({ children, title }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(ref);

  return (
    <div ref={ref} className={`tool-stage bg-white ${fullscreenClassName}`}>
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
