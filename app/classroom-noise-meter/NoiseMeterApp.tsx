"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import styles from "./NoiseMeterApp.module.css";

const LS_KEY = "khuncool.noisemeter";

type Phase = "idle" | "asking" | "denied" | "live";
type DenyReason = "denied" | "blocked" | "nomic";

const HOLD_OPTS = [1, 2, 3, 5];

function zoneFor(level: number, limit: number, isOverEvent: boolean) {
  if (isOverEvent) {
    return {
      label: "ดังเกินเกณฑ์แล้ว!",
      icon: "🚨",
      color: "#B91C1C",
      bg: "#FEF2F2",
      border: "#FCA5A5",
    };
  }
  // "Quiet" zone is anything at or below 75% of the configured limit;
  // "ok" is between that and the limit itself; anything above is "loud".
  if (level <= limit * 0.75) {
    return {
      label: "เงียบมาก เยี่ยม!",
      icon: "😌",
      color: "#0A7A66",
      bg: "#ECFDF5",
      border: "#A7F0DF",
    };
  }
  if (level <= limit) {
    return {
      label: "กำลังพอดี",
      icon: "🙂",
      color: "#8A5A1A",
      bg: "#FFFBEB",
      border: "#FDE68A",
    };
  }
  return {
    label: "เบาเสียงลงหน่อย",
    icon: "🤫",
    color: "#C2500B",
    bg: "#FFF7ED",
    border: "#FDBA74",
  };
}

export default function NoiseMeterApp() {
  useTrackToolUse("noise-meter");
  const [phase, setPhase] = useState<Phase>("idle");
  const [reason, setReason] = useState<DenyReason>("denied");
  const [level, setLevel] = useState(0);
  const [limit, setLimit] = useState(40);
  const [holdSeconds, setHoldSeconds] = useState(3);
  const [over, setOver] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isOverEvent, setIsOverEvent] = useState(false);
  const [totalOverSeconds, setTotalOverSeconds] = useState(0);
  const [currentOverSeconds, setCurrentOverSeconds] = useState(0);
  const [lastOverSeconds, setLastOverSeconds] = useState(0);
  const [sensitivity, setSensitivity] = useState(100);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  // Kept only so the source node isn't garbage-collected mid-stream;
  // it's never read directly since ctx.close() in teardown() tears
  // down the whole audio graph (including this node) for us.
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overHoldRef = useRef(0);
  const quietHoldRef = useRef(0);
  const inOverEventRef = useRef(false);
  const currentOverRef = useRef(0);
  const samplesRef = useRef<{ at: number; value: number }[]>([]);
  const levelRef = useRef(0);
  const limitRef = useRef(40);
  const holdSecondsRef = useRef(3);
  const phaseRef = useRef<Phase>("idle");
  const sensitivityRef = useRef(100);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);
  useEffect(() => {
    holdSecondsRef.current = holdSeconds;
  }, [holdSeconds]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  // Restore saved threshold, microphone sensitivity, and hold duration.
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        const d = raw ? JSON.parse(raw) : null;
        if (d) {
          if (typeof d.limit === "number") setLimit(d.limit);
          if (typeof d.holdSeconds === "number") {
            const restoredHold = HOLD_OPTS.includes(d.holdSeconds)
              ? d.holdSeconds
              : 3;
            setHoldSeconds(restoredHold);
            holdSecondsRef.current = restoredHold;
          }
          if (typeof d.sensitivity === "number") {
            const restored = Math.min(500, Math.max(50, d.sensitivity));
            setSensitivity(restored);
            sensitivityRef.current = restored;
          }
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  const persist = useCallback(
    (next: {
      limit?: number;
      holdSeconds?: number;
      sensitivity?: number;
    }) => {
      try {
        const cur = {
          limit: limitRef.current,
          holdSeconds: holdSecondsRef.current,
          sensitivity: sensitivityRef.current,
          ...next,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(cur));
      } catch {
        // ignore
      }
    },
    [],
  );

  const teardown = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (ctxRef.current && ctxRef.current.close) ctxRef.current.close();
    rafRef.current = null;
    tickTimerRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
    analyserRef.current = null;
    samplesRef.current = [];
  }, []);

  // Holds the current rAF tick function in a ref so the loop can
  // self-schedule (`requestAnimationFrame(() => loopRef.current())`)
  // without closing over its own `useCallback` binding — avoids the
  // TDZ/ordering hazard the hooks linter flags when a callback
  // references itself by name inside its own body.
  const loopRef = useRef<() => void>(() => {});

  const loop = useCallback(() => {
    if (!runningRef.current || !analyserRef.current || !bufRef.current) return;
    analyserRef.current.getByteTimeDomainData(bufRef.current);
    let sum = 0;
    const buf = bufRef.current;
    for (let i = 0; i < buf.length; i++) {
      // Center each byte sample (0-255) around 0 to get a signed
      // amplitude in [-1, 1] for the RMS (root-mean-square) calc.
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buf.length);
    // Scale the 0-1 RMS value up to a 0-100 "loudness" reading. 260 is
    // an empirical multiplier tuned so normal classroom talking lands
    // roughly mid-scale (ported as-is from the source design doc).
    const raw = Math.min(
      100,
      Math.round(rms * 260 * (sensitivityRef.current / 100)),
    );
    // Decide from a time-based two-second rolling average. Short sounds still
    // move the meter, but do not make the classroom status flicker rapidly.
    const now = performance.now();
    const samples = samplesRef.current;
    samples.push({ at: now, value: raw });
    while (samples.length && samples[0].at < now - 2000) samples.shift();
    const smooth = Math.round(
      samples.reduce((sumValue, sample) => sumValue + sample.value, 0) /
        samples.length,
    );
    if (smooth !== levelRef.current) {
      levelRef.current = smooth;
      setLevel(smooth);
    }
    rafRef.current = requestAnimationFrame(() => loopRef.current());
  }, []);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const tick = useCallback(() => {
    if (phaseRef.current !== "live") return;
    const aboveLimit = levelRef.current > limitRef.current;

    if (inOverEventRef.current) {
      if (aboveLimit) {
        currentOverRef.current += 0.25;
        setCurrentOverSeconds(currentOverRef.current);
        setTotalOverSeconds((seconds) => seconds + 0.25);
      }

      // Require a clear drop below the threshold before allowing another
      // event. This prevents one long noisy period from being counted again
      // every few seconds.
      if (levelRef.current <= Math.max(0, limitRef.current - 5)) {
        quietHoldRef.current += 0.25;
        if (quietHoldRef.current >= 2) {
          setLastOverSeconds(currentOverRef.current);
          currentOverRef.current = 0;
          quietHoldRef.current = 0;
          inOverEventRef.current = false;
          setCurrentOverSeconds(0);
          setIsOverEvent(false);
        }
      } else {
        quietHoldRef.current = 0;
      }
      return;
    }

    overHoldRef.current = aboveLimit ? overHoldRef.current + 0.25 : 0;
    setHoldProgress(overHoldRef.current);
    if (overHoldRef.current >= holdSecondsRef.current) {
      inOverEventRef.current = true;
      currentOverRef.current = holdSecondsRef.current;
      overHoldRef.current = 0;
      setHoldProgress(0);
      setCurrentOverSeconds(currentOverRef.current);
      setTotalOverSeconds((seconds) => seconds + holdSecondsRef.current);
      setOver((count) => count + 1);
      setIsOverEvent(true);
    }
  }, []);

  const start = useCallback(async () => {
    if (phaseRef.current === "asking") return;
    setPhase("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false },
      });
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctor();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);

      ctxRef.current = ctx;
      srcRef.current = src;
      analyserRef.current = analyser;
      streamRef.current = stream;
      bufRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      runningRef.current = true;
      overHoldRef.current = 0;
      quietHoldRef.current = 0;
      inOverEventRef.current = false;
      currentOverRef.current = 0;
      samplesRef.current = [];
      levelRef.current = 0;

      setLevel(0);
      setOver(0);
      setHoldProgress(0);
      setIsOverEvent(false);
      setTotalOverSeconds(0);
      setCurrentOverSeconds(0);
      setLastOverSeconds(0);
      setPhase("live");

      rafRef.current = requestAnimationFrame(() => loopRef.current());
      tickTimerRef.current = setInterval(tick, 250);
    } catch (e) {
      let framed = true;
      try {
        framed = window.self !== window.top;
      } catch {
        framed = true;
      }
      const noApi = !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const err = e as { name?: string } | null;
      let r: DenyReason = "denied";
      if (
        noApi ||
        (framed && err && (err.name === "NotAllowedError" || err.name === "SecurityError"))
      ) {
        r = "blocked";
      } else if (err && err.name === "NotFoundError") {
        r = "nomic";
      }
      setReason(r);
      setPhase("denied");
    }
  }, [tick]);

  const openTab = useCallback(() => {
    try {
      window.open(location.href, "_blank", "noopener");
    } catch {
      // ignore
    }
  }, []);

  const stop = useCallback(() => {
    teardown();
    setPhase("idle");
    setLevel(0);
  }, [teardown]);

  const resetGame = useCallback(() => {
    setOver(0);
    setHoldProgress(0);
    setIsOverEvent(false);
    setTotalOverSeconds(0);
    setCurrentOverSeconds(0);
    setLastOverSeconds(0);
    overHoldRef.current = 0;
    quietHoldRef.current = 0;
    inOverEventRef.current = false;
    currentOverRef.current = 0;
  }, []);

  const onLimit = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10) || 40;
      setLimit(v);
      persist({ limit: v });
    },
    [persist],
  );

  const setHoldOpt = useCallback(
    (n: number) => {
      setHoldSeconds(n);
      holdSecondsRef.current = n;
      persist({ holdSeconds: n });
    },
    [persist],
  );

  const onSensitivity = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(500, Math.max(50, parseInt(e.target.value, 10) || 100));
      sensitivityRef.current = v;
      setSensitivity(v);
      persist({ sensitivity: v });
    },
    [persist],
  );

  const { isFull, fullscreenClassName, toggle: toggleFull } =
    useToolFullscreen(frameRef);

  useEffect(() => {
    return () => {
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBlocked = reason === "blocked";
  const denyTitle =
    reason === "blocked"
      ? "พรีวิวใช้ไมค์ไม่ได้ ต้องเปิดจากไฟล์ในเครื่อง"
      : reason === "nomic"
        ? "ไม่พบไมโครโฟนในเครื่องนี้"
        : "ยังไม่ได้อนุญาตให้ใช้ไมโครโฟน";
  const denyBody =
    reason === "blocked"
      ? "ตอนนี้กำลังดูผ่านหน้าต่างพรีวิว ซึ่งเบราว์เซอร์ปิดการใช้ไมค์ไว้ ให้ดาวน์โหลดไฟล์ “Khuncool Noise Meter (standalone).html” แล้วเปิดจากเครื่องตัวเอง จะใช้ไมค์ได้ปกติ"
      : reason === "nomic"
        ? "ต่อไมโครโฟนหรือหูฟังที่มีไมค์ แล้วลองใหม่อีกครั้ง"
        : "คลิกไอคอน 🔒 ข้างช่องที่อยู่เว็บ แล้วเปิดสิทธิ์ไมโครโฟนสำหรับเว็บนี้ จากนั้นลองใหม่อีกครั้ง";

  const zone = zoneFor(level, limit, isOverEvent);
  const levelPct = `${Math.min(100, level)}%`;
  const limitText = `${limit}%`;
  const overText = String(over);
  const sensitivityText = `${sensitivity}%`;
  const totalOverText = `${Math.round(totalOverSeconds)} วิ`;
  const statusDetail = isOverEvent
    ? `กำลังดังเกิน · ครั้งนี้ ${Math.max(1, Math.round(currentOverSeconds))} วิ`
    : level > limit
      ? `เกินต่อเนื่อง ${holdProgress.toFixed(1)} / ${holdSeconds} วิ`
      : lastOverSeconds > 0
        ? `ครั้งล่าสุดนาน ${Math.round(lastOverSeconds)} วิ`
        : "ใช้ค่าเฉลี่ยเสียงย้อนหลัง 2 วินาที";

  const holdBtnClass = (n: number) =>
    `whitespace-nowrap rounded-[9px] border font-sans font-bold cursor-pointer ${
      holdSeconds === n
        ? "border-primary bg-primary text-white"
        : "border-border bg-white text-ink-secondary hover:bg-surface-light"
    }`;

  return (
    <div
      ref={frameRef}
      data-fullscreen={isFull}
      className={`tool-stage bg-white ${styles.shell} ${fullscreenClassName}`}
    >
      {phase === "idle" && (
        <div
          className={`${styles.statePanel} rounded-[18px] border-[1.5px] border-dashed border-[#D3D8E1] bg-surface-light px-5 py-[34px] text-center md:rounded-[20px] md:px-6 md:py-[76px]`}
        >
          <div className="mx-auto mb-[13px] flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1E3FD] text-[28px] md:mb-4 md:h-[70px] md:w-[70px] md:rounded-[20px] md:text-[34px]">
            🎤
          </div>
          <div className="text-[15.5px] font-bold md:text-[21px]">
            เปิดไมค์เพื่อเริ่มวัดเสียง
          </div>
          <div className="mt-[7px] text-[12.5px] leading-[1.7] text-ink-faint md:mt-[9px] md:text-[14.5px] md:leading-[1.75]">
            <span className="md:hidden">
              เสียงจะถูกวัดในเครื่องนี้เท่านั้น
              <br />
              ไม่มีการอัดหรือส่งเสียงออกไปไหน
            </span>
            <span className="hidden md:inline">
              ระดับเสียงถูกประมวลผลในเครื่องนี้เท่านั้น ไม่มีการอัดเสียงหรือส่งข้อมูลออกไปไหน
              <br />
              เหมาะกับกิจกรรมกลุ่ม เวลาทำงานเงียบ และช่วงสอบย่อย
            </span>
          </div>
          <button
            type="button"
            onClick={start}
            className="mt-[15px] w-full rounded-xl border-none bg-primary py-[14px] font-sans text-[15px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:bg-primary-hover md:mt-5 md:w-auto md:rounded-[13px] md:px-[34px] md:py-[15px] md:text-base"
          >
            🎤 เริ่มวัดเสียง
          </button>
        </div>
      )}

      {phase === "asking" && (
        <div
          className={`${styles.statePanel} rounded-[18px] border border-[#C6C9FB] bg-[#F5F6FF] px-5 py-[34px] text-center md:rounded-[20px] md:px-6 md:py-[76px]`}
        >
          <div className="mb-[10px] text-[30px] md:mb-3 md:text-[38px]">⏳</div>
          <div className="text-[15px] font-bold text-[#3D38B4] md:text-[19px]">
            กำลังขออนุญาตใช้ไมโครโฟน
          </div>
          <div className="mt-[6px] text-[12.5px] leading-[1.65] text-ink-secondary md:mt-[7px] md:text-sm md:leading-normal">
            <span className="md:hidden">กด “อนุญาต” ในกล่องที่เบราว์เซอร์ขึ้นมา</span>
            <span className="hidden md:inline">
              กด “อนุญาต” ในกล่องที่เบราว์เซอร์ขึ้นมาด้านบน
            </span>
          </div>
        </div>
      )}

      {phase === "denied" && (
        <div
          className={`${styles.statePanel} rounded-[18px] border border-[#FCA5A5] bg-[#FEF2F2] px-5 py-7 text-center md:rounded-[20px] md:px-6 md:py-16`}
        >
          <div className="mb-[9px] text-[28px] md:mb-[10px] md:text-[36px]">🔇</div>
          <div className="text-[14.5px] font-bold text-[#B91C1C] md:text-[19px]">
            {denyTitle}
          </div>
          <div className="mx-auto mt-[6px] max-w-[560px] text-[12.5px] leading-[1.7] text-[#8A3A3A] md:mt-[7px] md:text-sm">
            {denyBody}
          </div>
          <div className="mt-[13px] flex flex-col gap-2 md:mt-[18px] md:flex-row md:flex-wrap md:justify-center md:gap-[10px]">
            {isBlocked && (
              <button
                type="button"
                onClick={openTab}
                className="w-full rounded-[11px] border-none bg-primary px-3 py-3 font-sans text-sm font-bold text-white hover:bg-primary-hover md:w-auto md:rounded-xl md:px-7 md:py-[13px] md:text-[15px] md:shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)]"
              >
                ↗ เปิดหน้าเต็มในแท็บใหม่
              </button>
            )}
            <button
              type="button"
              onClick={start}
              className="w-full rounded-[11px] border border-[#F1C0C0] bg-white px-3 py-[11px] font-sans text-[13.5px] font-semibold text-[#B91C1C] hover:bg-[#FEF4F4] md:w-auto md:rounded-xl md:px-[26px] md:py-[13px] md:text-sm"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      )}

      {phase === "live" && (
        <>
          {/* Mobile layout */}
          <div className={`${styles.mobileLayout} md:hidden`}>
            <div
              className={`${styles.meterPanel} mb-[14px] rounded-[20px] px-[18px] py-[22px] text-center`}
              style={{ background: zone.bg, border: `1.5px solid ${zone.border}` }}
            >
              <div className="mb-2 text-[46px] leading-none">{zone.icon}</div>
              <div
                className="text-[22px] font-bold"
                style={{ fontFamily: "'Anuphan'", color: zone.color }}
              >
                {zone.label}
              </div>
              <div
                className="text-[44px] font-semibold leading-[1.2]"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: zone.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {level}
              </div>
              <div className="mt-1 text-[12px] font-semibold" style={{ color: zone.color }}>
                {statusDetail}
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(26,29,38,.10)]">
                <div
                  className="h-full rounded-full"
                  style={{ background: zone.color, width: levelPct }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-ink-faint">
                <span>เงียบ</span>
                <span>เกณฑ์ {limitText}</span>
                <span>ดังมาก</span>
              </div>
            </div>

            <div className="mb-[14px] grid grid-cols-2 gap-[9px]">
              <div className="rounded-[14px] border border-border bg-white p-3 text-center">
                <div
                  className="text-[22px] font-semibold text-[#0A7A66]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {totalOverText}
                </div>
                <div className="text-[11.5px] text-ink-faint">เวลาดังเกินรวม</div>
              </div>
              <div className="rounded-[14px] border border-border bg-white p-3 text-center">
                <div
                  className="text-[22px] font-semibold text-[#B91C1C]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {overText}
                </div>
                <div className="text-[11.5px] text-ink-faint">ดังเกินทั้งหมด</div>
              </div>
            </div>

            <div className="mb-3 rounded-[14px] border border-border bg-surface-light p-[13px]">
              <div className="mb-[9px] flex items-center justify-between">
                <span className="text-[13px] font-bold">เกณฑ์ความดัง</span>
                <span
                  className="text-[13px] text-ink-secondary"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {limitText}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={limit}
                onChange={onLimit}
                className="w-full accent-primary"
              />
              <div className="mt-[11px] flex items-center justify-between">
                <label
                  htmlFor="mic-sensitivity-mobile"
                  className="text-[13px] font-bold"
                >
                  ความไวไมค์
                </label>
                <span
                  className="text-[13px] text-ink-secondary"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {sensitivityText}
                </span>
              </div>
              <input
                id="mic-sensitivity-mobile"
                type="range"
                min={50}
                max={500}
                step={25}
                value={sensitivity}
                onChange={onSensitivity}
                aria-describedby="mic-sensitivity-help-mobile"
                className="w-full accent-primary"
              />
              <div
                id="mic-sensitivity-help-mobile"
                className="mt-1 text-[11px] leading-[1.5] text-ink-faint"
              >
                เพิ่มเมื่อไมค์อยู่ไกล · สูงสุด 500%
              </div>
              <div className="mt-[11px] flex items-center justify-between">
                <span className="text-[13px] font-bold">นับเมื่อเกินต่อเนื่อง</span>
                <div className="flex gap-1.5">
                  {HOLD_OPTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setHoldOpt(n)}
                      className={`${holdBtnClass(n)} px-2.5 py-1.5 text-xs`}
                    >
                      {n} วิ
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={stop}
                className="flex-1 whitespace-nowrap rounded-[11px] border border-border bg-white py-3 font-sans text-sm font-bold hover:bg-surface-light"
              >
                ■ หยุดวัด
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="flex-1 whitespace-nowrap rounded-[11px] border border-border bg-white py-3 font-sans text-sm font-semibold hover:bg-surface-light"
              >
                ล้างสถิติ
              </button>
            </div>
          </div>

          {/* Desktop layout */}
          <div
            className={`${styles.desktopLayout} hidden md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-start md:gap-[22px]`}
          >
            <div
              className={`${styles.meterPanel} rounded-[24px] px-[34px] py-[34px] text-center`}
              style={{ background: zone.bg, border: `2px solid ${zone.border}` }}
            >
              <div className="mb-[10px] text-[86px] leading-none">{zone.icon}</div>
              <div
                className="text-[34px] font-bold"
                style={{ fontFamily: "'Anuphan'", color: zone.color }}
              >
                {zone.label}
              </div>
              <div
                className="text-[82px] font-semibold leading-[1.1]"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: zone.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {level}
              </div>
              <div className="mt-1 text-sm font-semibold" style={{ color: zone.color }}>
                {statusDetail}
              </div>
              <div className="mt-4 h-5 overflow-hidden rounded-full bg-[rgba(26,29,38,.10)]">
                <div
                  className="h-full rounded-full"
                  style={{ background: zone.color, width: levelPct }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[12.5px] text-ink-faint">
                <span>เงียบ</span>
                <span>เกณฑ์ {limitText}</span>
                <span>ดังมาก</span>
              </div>
            </div>

            <div className={`${styles.controls} flex flex-col gap-[14px]`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-white p-4 text-center">
                  <div
                    className="text-[30px] font-semibold text-[#0A7A66]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {totalOverText}
                  </div>
                  <div className="text-xs text-ink-faint">เวลาดังเกินรวม</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 text-center">
                  <div
                    className="text-[30px] font-semibold text-[#B91C1C]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {overText}
                  </div>
                  <div className="text-xs text-ink-faint">ดังเกินทั้งหมด</div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <label
                    htmlFor="mic-sensitivity-desktop"
                    className="text-[13.5px] font-bold"
                  >
                    ความไวไมโครโฟน
                  </label>
                  <span
                    className="text-[13.5px] text-ink-secondary"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {sensitivityText}
                  </span>
                </div>
                <input
                  id="mic-sensitivity-desktop"
                  type="range"
                  min={50}
                  max={500}
                  step={25}
                  value={sensitivity}
                  onChange={onSensitivity}
                  aria-describedby="mic-sensitivity-help-desktop"
                  className="w-full accent-primary"
                />
                <div
                  id="mic-sensitivity-help-desktop"
                  className="mt-2 text-xs leading-[1.6] text-ink-faint"
                >
                  เพิ่มเมื่อคอมอยู่ไกลเด็ก · 100% ปกติ · สูงสุด 500%
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-light p-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[13.5px] font-bold">เกณฑ์ความดัง</span>
                  <span
                    className="text-[13.5px] text-ink-secondary"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {limitText}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={limit}
                  onChange={onLimit}
                  className="w-full accent-primary"
                />
                <div className="mt-2 text-xs leading-[1.6] text-ink-faint">
                  เส้นที่ใช้ตัดสินว่าห้องดังเกินไปหรือไม่
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="mb-2.5 text-[13.5px] font-bold">
                  นับเมื่อดังเกินต่อเนื่อง
                </div>
                <div className="flex gap-2">
                  {HOLD_OPTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setHoldOpt(n)}
                      className={`${holdBtnClass(n)} px-3.5 py-2.5 text-[13.5px]`}
                    >
                      {n} วิ
                    </button>
                  ))}
                </div>
                <div className="mt-2.5 text-xs leading-[1.6] text-ink-faint">
                  เสียงสั้นกว่านี้จะยังไม่นับเป็นเหตุการณ์
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={stop}
                  className="flex-1 whitespace-nowrap rounded-[11px] border border-border bg-white py-3 font-sans text-sm font-bold hover:bg-surface-light"
                >
                  ■ หยุดวัด
                </button>
                <button
                  type="button"
                  onClick={resetGame}
                  className="flex-1 whitespace-nowrap rounded-[11px] border border-border bg-white py-3 font-sans text-sm font-semibold hover:bg-surface-light"
                >
                  ล้างสถิติ
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="tool-stage-actions flex justify-end">
        <button
          type="button"
          onClick={toggleFull}
          title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          className="flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-2 font-sans text-xs font-medium text-ink hover:bg-surface-light md:px-[13px] md:text-[13px]"
        >
          ⛶{" "}
          <span className="hidden md:inline">
            {isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          </span>
        </button>
      </div>
    </div>
  );
}
