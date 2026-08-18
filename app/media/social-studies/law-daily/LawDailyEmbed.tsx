"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStage } from "../../_stage/useStage";
import styles from "./LawDailyEmbed.module.css";

/**
 * Law Daily runs as a separate document in an iframe, so the stage's container
 * tokens cannot reach inside it — and do not need to. Within an iframe the
 * viewport really is the frame, so the embedded game's own vw/vh sizing is
 * correct there. The stage's job here is the outer half of the contract: it
 * owns the box and fullscreen, and tells the frame when that changes.
 */
export default function LawDailyEmbed() {
  const { isFull, stageProps, toggle } = useStage<HTMLDivElement>();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const publishState = useCallback((active: boolean) => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "KHUNCOOL_FULLSCREEN_STATE", active },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    publishState(isFull);
  }, [isFull, publishState]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.type !== "KHUNCOOL_TOGGLE_FULLSCREEN"
      ) return;
      void toggle();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [toggle]);

  return (
    <div {...stageProps} className={`kc-stage ${styles.shell}`}>
      <div className={`kc-stage-body ${styles.body}`}>
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
    </div>
  );
}
