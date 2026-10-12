"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { browserStorage } from "../chainModel";
import { reducedMotion } from "../fx";
import type { GiftSceneController } from "./giftScene";
import { initialMode, judgeFrames, readSavedMode, writeSavedMode, type RenderMode } from "./renderMode";

/** three.js ทั้งก้อนอยู่หลัง import() นี้ — โหลดเฉพาะหน้า /gift-exchange */
const loadScene = () => import("./giftScene");

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * ถือโหมดภาพและ controller ฉาก 3D — สร้าง controller ครั้งเดียวต่อช่วงที่ `active`
 * (อยู่บนเวที) และทำลายเมื่อออกจากเวที จึงมี WebGL context เดียวไม่ว่าจะกี่ตา
 */
export function useGiftScene(active: boolean) {
  const [mode, setMode] = useState<RenderMode>("2d");
  const [scene, setScene] = useState<GiftSceneController | null>(null);
  const modeRef = useRef(mode);
  const manualRef = useRef(false);
  const measuredRef = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  });

  // ตัดสินโหมดหลัง mount (ต้องใช้ DOM) แล้ว preload three.js ระหว่างครูอยู่จอตั้งค่า
  useEffect(() => {
    const t = window.setTimeout(() => {
      const saved = readSavedMode(browserStorage());
      manualRef.current = saved?.manual ?? false;
      const m = initialMode({ webgl: detectWebGL(), saved });
      setMode(m);
      if (m !== "2d") loadScene().catch(() => {});
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const want3d = active && mode !== "2d";

  useEffect(() => {
    if (!want3d) return;
    let cancelled = false;
    let created: GiftSceneController | null = null;
    // ล้มเหลวกลางทาง (โหลดไม่ได้ / GPU รีเซ็ต) → 2D เฉพาะรอบนี้ ไม่บันทึก
    const fail = () => {
      if (!cancelled) setMode("2d");
    };
    loadScene()
      .then((m) => {
        if (cancelled) return;
        try {
          created = m.createGiftScene({
            quality: modeRef.current === "3d-low" ? "low" : "high",
            reducedMotion: reducedMotion(),
            onFrameStats: (samples) => {
              if (measuredRef.current) return;
              measuredRef.current = true;
              const next = judgeFrames(modeRef.current, samples, manualRef.current);
              if (next === modeRef.current) return;
              setMode(next);
              writeSavedMode(browserStorage(), { mode: next, manual: manualRef.current });
            },
            onFailure: fail,
          });
          setScene(created);
        } catch {
          fail();
        }
      })
      .catch(fail);
    return () => {
      cancelled = true;
      created?.dispose();
      setScene(null);
    };
  }, [want3d]);

  useEffect(() => {
    scene?.setQuality(mode === "3d-low" ? "low" : "high");
  }, [scene, mode]);

  const chooseMode = useCallback((m: "3d-high" | "2d") => {
    manualRef.current = true;
    setMode(m);
    writeSavedMode(browserStorage(), { mode: m, manual: true });
  }, []);

  return { scene: want3d ? scene : null, mode, chooseMode };
}
