"use client";

import { useCallback, useEffect, useRef } from "react";

export type SoundKind = "tick" | "flip" | "charge" | "jackpot" | "bomb" | "super";

/**
 * เสียงประกอบกระดาน สร้าง AudioContext ตอนผู้ใช้กดครั้งแรกเท่านั้น
 * (เบราว์เซอร์บล็อกการสร้างก่อนมี user gesture) และปิดตอน unmount
 */
export function useBoardSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  const context = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctxRef.current = new Ctor();
      } catch {
        ctxRef.current = null;
      }
    }
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (
      ctx: AudioContext,
      freq: number,
      start: number,
      dur: number,
      type: OscillatorType,
      vol: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    },
    [],
  );

  const play = useCallback(
    (kind: SoundKind, durationMs = 0) => {
      if (!enabledRef.current) return;
      const ctx = context();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const t = ctx.currentTime;

      switch (kind) {
        case "tick":
          tone(ctx, 880, t, 0.05, "square", 0.05);
          break;
        case "flip":
          tone(ctx, 320, t, 0.14, "triangle", 0.12);
          tone(ctx, 640, t + 0.06, 0.16, "triangle", 0.1);
          break;
        // เสียงชาร์จ: โน้ตไต่ระดับขึ้นเรื่อย ๆ ตลอดช่วงลุ้น ปิดท้ายด้วยเสียงตึง
        // ตอนเฉลย ความยาวมาจากผู้เรียกเพื่อให้ตรงกับวงแสงเสมอ
        case "charge": {
          const dur = Math.max(0.2, durationMs / 1000);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(900, t + dur);
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.05, t + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.11, t + dur);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.16);
          // ติ๊กถี่ขึ้นเรื่อย ๆ ให้รู้สึกว่าเวลากำลังจะหมด
          let at = 0;
          let step = 0.2;
          while (at < dur - 0.05) {
            tone(ctx, 1200, t + at, 0.03, "square", 0.035);
            step = Math.max(0.05, step * 0.82);
            at += step;
          }
          break;
        }
        case "jackpot":
          [523, 659, 784, 1047].forEach((f, i) =>
            tone(ctx, f, t + i * 0.09, 0.3, "triangle", 0.14),
          );
          break;
        case "bomb":
          tone(ctx, 180, t, 0.3, "sawtooth", 0.18);
          tone(ctx, 90, t + 0.05, 0.45, "sawtooth", 0.16);
          break;
        // ป้าย 67 — แฟนแฟร์ยาวกว่าแจ็กพอต ไล่สองรอบแล้วปิดด้วยคอร์ดค้าง
        case "super":
          [523, 659, 784, 1047, 1319].forEach((f, i) =>
            tone(ctx, f, t + i * 0.08, 0.26, "triangle", 0.13),
          );
          [784, 1047, 1319, 1568].forEach((f, i) =>
            tone(ctx, f, t + 0.44 + i * 0.07, 0.3, "square", 0.08),
          );
          [1047, 1319, 1568].forEach((f) =>
            tone(ctx, f, t + 0.78, 1.1, "triangle", 0.11),
          );
          break;
      }
    },
    [context, tone],
  );

  return play;
}
