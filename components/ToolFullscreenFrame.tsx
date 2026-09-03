"use client";

import { type ReactNode, useRef } from "react";
import { useToolFullscreen } from "./useToolFullscreen";

type Props = {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function ToolFullscreenFrame({
  children,
  title,
  actions,
  className = "",
  contentClassName = "",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(ref);

  return (
    <div
      ref={ref}
      data-fullscreen={isFull}
      className={`tool-stage bg-white ${className} ${fullscreenClassName}`}
    >
      <div className="tool-stage-bar">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {actions}
          <button type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>
            ⛶ <span>{isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}</span>
          </button>
        </div>
      </div>
      <div className={`tool-stage-content ${contentClassName}`}>{children}</div>
    </div>
  );
}
