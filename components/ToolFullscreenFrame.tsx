"use client";

import { type ReactNode, useRef } from "react";
import { useToolFullscreen } from "./useToolFullscreen";

type Props = {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
};

export default function ToolFullscreenFrame({ children, title, actions }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(ref);

  return (
    <div ref={ref} className={`tool-stage bg-white ${fullscreenClassName}`}>
      <div className="tool-stage-bar">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {actions}
          <button type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>
            ⛶ <span>{isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}</span>
          </button>
        </div>
      </div>
      <div className="tool-stage-content">{children}</div>
    </div>
  );
}
