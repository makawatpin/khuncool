"use client";

import { useEffect, useRef } from "react";
import type { GiftSceneController } from "./giftScene";
import styles from "../GiftExchange.module.css";

/** วาง canvas ของฉาก 3D (ตัวเดียวใช้ข้ามตา) ลงในตำแหน่งกล่องของตานี้ และส่งขนาดให้ renderer */
export default function SceneHost({ scene }: { scene: GiftSceneController }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.appendChild(scene.canvas);
    const ro = new ResizeObserver(([entry]) => {
      scene.setSize(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(host);
    return () => {
      ro.disconnect();
      if (scene.canvas.parentNode === host) host.removeChild(scene.canvas);
    };
  }, [scene]);

  return <div ref={ref} className={styles.sceneHost} aria-hidden="true" />;
}
