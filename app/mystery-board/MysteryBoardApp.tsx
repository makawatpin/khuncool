"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import styles from "./MysteryBoard.module.css";
import BoardGrid from "./BoardGrid";
import RevealOverlay, {
  FLIP_DELAY_MS,
  FLIP_DURATION_MS,
} from "./RevealOverlay";
import SetupPanel from "./SetupPanel";
import {
  DEFAULT_SETTINGS,
  buildTiles,
  isJackpot,
  isSuper,
  loadSettings,
  parseQuestions,
  saveSettings,
  type Settings,
  type Tile,
} from "./boardModel";
import { useBoardSound } from "./useBoardSound";

type Phase = "setup" | "board";

// จำกัดจำนวนขั้นของไฟวิ่งไม่ให้บอร์ดใหญ่ (30 ป้าย) ใช้เวลานานเกินไป
const MAX_STEPS = 28;

const CONFETTI_COLORS = ["#fbbf24", "#f97316", "#5c5ee6", "#22b8a0", "#ef4444"];
/** ป้าย 67 ใช้ทองล้วน + ขาว ให้ต่างจากคอนเฟตตีหลากสีของแจ็กพอตธรรมดา */
const SUPER_CONFETTI_COLORS = ["#fde68a", "#fbbf24", "#f59e0b", "#fff7e0", "#ffffff"];

// เอฟเฟกต์ผลลัพธ์ (เสียง/คอนเฟตติ/สั่นจอ) ต้องรอให้การ์ดพลิกจนเห็นหน้าหลังก่อน
const OUTCOME_DELAY_MS = FLIP_DELAY_MS + FLIP_DURATION_MS;
/** แสงทองของป้าย 67 ค้างนานกว่าแฟลชระเบิด ให้ทันเห็นกันทั้งห้อง */
const GRAND_GLOW_MS = 2200;

export default function MysteryBoardApp() {
  useTrackToolUse("mystery-board");

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [questionText, setQuestionText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>("setup");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [revealId, setRevealId] = useState<number | null>(null);
  const [revealAnimate, setRevealAnimate] = useState(true);
  const [spotlightId, setSpotlightId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [danger, setDanger] = useState(false);
  const [grandGlow, setGrandGlow] = useState(false);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const confettiRef = useRef<HTMLElement[]>([]);
  const confettiLayerRef = useRef<HTMLDivElement | null>(null);
  // สะท้อนค่า revealId ให้ callback ที่ตั้งเวลาไว้ล่วงหน้าอ่านค่าล่าสุดได้
  // (เผื่อ overlay เปลี่ยนไปเปิดป้ายอื่นก่อนเอฟเฟกต์ที่ตั้งเวลาไว้จะทำงาน)
  const revealIdRef = useRef<number | null>(null);
  const play = useBoardSound(settings.soundOn);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(
    frameRef,
    styles.fsFallback,
  );

  // โหลดค่าที่บันทึกไว้หลัง mount เท่านั้น กัน hydration mismatch
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const restored = loadSettings();
      setSettings(restored);
      setQuestionText(restored.questions.join("\n"));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  useEffect(() => {
    revealIdRef.current = revealId;
  }, [revealId]);

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  const clearTimeouts = useCallback(() => {
    for (const id of timeoutsRef.current) clearTimeout(id);
    timeoutsRef.current.clear();
  }, []);

  // ไฟวิ่งใช้ timeout หลายสิบตัว ถ้าไม่เคลียร์จะยิงหลัง unmount
  useEffect(() => clearTimeouts, [clearTimeouts]);

  /** เก็บกวาดคอนเฟตติที่ค้างอยู่ในจอ (ถ้ามี) */
  const clearConfetti = useCallback(() => {
    for (const bit of confettiRef.current) bit.remove();
    confettiRef.current = [];
  }, []);

  /** ยกเลิกไฟวิ่งที่ค้างอยู่ (ถ้ามี) — เรียกก่อนออกจากกระดานทุกทาง */
  const cancelRun = useCallback(() => {
    clearTimeouts();
    setSpotlightId(null);
    setBusy(false);
    setDanger(false);
    setGrandGlow(false);
    clearConfetti();
  }, [clearTimeouts, clearConfetti]);

  // กันคอนเฟตติค้างจอถ้าคอมโพเนนต์ unmount กลางอากาศ
  useEffect(() => clearConfetti, [clearConfetti]);

  const burst = useCallback((grand = false) => {
    const host = confettiLayerRef.current;
    if (!host) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const height = host.clientHeight;
    const colors = grand ? SUPER_CONFETTI_COLORS : CONFETTI_COLORS;
    const pieces = grand ? 110 : 40;
    for (let i = 0; i < pieces; i++) {
      const bit = document.createElement("div");
      const size = (grand ? 8 : 6) + Math.random() * (grand ? 10 : 7);
      bit.style.cssText = `position:absolute;top:-16px;left:${(
        Math.random() * 100
      ).toFixed(1)}%;width:${size}px;height:${(size * 0.5).toFixed(
        1,
      )}px;background:${
        colors[i % colors.length]
      };border-radius:2px;z-index:60;pointer-events:none`;
      host.appendChild(bit);
      confettiRef.current.push(bit);
      const dur = (grand ? 2200 : 1700) + Math.random() * 1200;
      bit.animate(
        [
          { transform: "translateY(0) rotate(0)", opacity: 1 },
          {
            transform: `translateY(${height + 60}px) rotate(${
              Math.random() * 720
            }deg)`,
            opacity: 0.9,
          },
        ],
        { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" },
      );
      trackedTimeout(() => {
        bit.remove();
        confettiRef.current = confettiRef.current.filter((b) => b !== bit);
      }, dur + 80);
    }
  }, [trackedTimeout]);

  const handleQuestionText = useCallback((text: string) => {
    setQuestionText(text);
    setSettings((s) => ({ ...s, questions: parseQuestions(text) }));
  }, []);

  const startGame = useCallback(() => {
    cancelRun();
    setTiles(buildTiles(settings));
    setPhase("board");
    setRevealId(null);
  }, [settings, cancelRun]);

  const openTile = useCallback(
    (id: number) => {
      const tile = tiles.find((t) => t.id === id);
      if (!tile) return;
      setRevealAnimate(!tile.opened);
      setRevealId(id);
      if (!tile.opened) {
        setTiles((prev) =>
          prev.map((t) => (t.id === id ? { ...t, opened: true } : t)),
        );
        play("flip");
        if (tile.prize && isSuper(tile.prize)) {
          trackedTimeout(() => {
            if (revealIdRef.current !== id) return;
            play("super");
            burst(true);
            setGrandGlow(true);
            // เช่นเดียวกับ danger: ต้องดับเสมอ ไม่งั้นแสงจะค้างข้ามไปป้ายถัดไป
            trackedTimeout(() => setGrandGlow(false), GRAND_GLOW_MS);
          }, OUTCOME_DELAY_MS);
        } else if (tile.prize && isJackpot(tile.prize)) {
          trackedTimeout(() => {
            if (revealIdRef.current !== id) return;
            play("jackpot");
            burst();
          }, OUTCOME_DELAY_MS);
        } else if (tile.prize?.kind === "bomb") {
          trackedTimeout(() => {
            if (revealIdRef.current !== id) return;
            play("bomb");
            setDanger(true);
            // รีเซ็ตค่า danger เสมอไม่ว่าป้ายที่เปิดอยู่ตอนนี้จะเปลี่ยนไปแล้วหรือไม่
            // (ไม่งั้น danger จะค้าง true ข้ามไปสั่นป้ายถัดไปที่ไม่เกี่ยวกัน)
            trackedTimeout(() => setDanger(false), 620);
          }, OUTCOME_DELAY_MS);
        }
      }
    },
    [tiles, play, burst, trackedTimeout],
  );

  /** สุ่มเป้าหมายก่อน แล้วค่อยเล่นไฟวิ่งให้ไปจบที่ป้ายนั้น */
  const randomPick = useCallback(() => {
    if (busy) return;
    const closed = tiles.filter((t) => !t.opened);
    if (closed.length === 0) return;

    const target = closed[Math.floor(Math.random() * closed.length)];
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      openTile(target.id);
      return;
    }

    cancelRun();
    setBusy(true);

    // ไล่ไฟผ่านป้ายที่ยังไม่เปิด 2 รอบครึ่ง แล้วหน่วงลงเรื่อย ๆ
    const path: number[] = [];
    const loops = 2;
    for (let l = 0; l < loops; l++) for (const t of closed) path.push(t.id);
    const targetIndex = closed.findIndex((t) => t.id === target.id);
    for (let i = 0; i <= targetIndex; i++) path.push(closed[i].id);

    // ตัดให้เหลือขั้นตอนไม่เกิน MAX_STEPS เพื่อคุมเวลารวมของบอร์ดใหญ่
    // ตัดจากหัว (ไม่ใช่ท้าย) เพื่อให้ยังจบที่ป้ายเป้าหมายเดิมเสมอ
    if (path.length > MAX_STEPS) {
      path.splice(0, path.length - MAX_STEPS);
    }

    let elapsed = 0;
    path.forEach((id, i) => {
      const progress = i / Math.max(1, path.length - 1);
      // 45ms ตอนต้น ค่อย ๆ ยืดเป็น ~230ms ตอนใกล้หยุด
      elapsed += 45 + Math.pow(progress, 3) * 185;
      trackedTimeout(() => {
        setSpotlightId(id);
        play("tick");
      }, elapsed);
    });

    trackedTimeout(() => {
      setSpotlightId(null);
      setBusy(false);
      openTile(target.id);
      // ไม่ต้องย้ายโฟกัสเอง — RevealOverlay ที่กำลังจะเด้งขึ้นมาโฟกัสปุ่มปิดของ
      // ตัวเองอยู่แล้ว และคืนโฟกัสให้ถูกที่ตอนปิด
    }, elapsed + 420);
  }, [busy, tiles, openTile, cancelRun, trackedTimeout, play]);

  const openedCount = tiles.filter((t) => t.opened).length;
  const allOpened = tiles.length > 0 && openedCount === tiles.length;
  const revealTile = tiles.find((t) => t.id === revealId) ?? null;

  return (
    <div
      ref={frameRef}
      className={`${styles.shell} ${fullscreenClassName}`}
      data-theme={settings.theme}
    >
      <div className={styles.bar}>
        <span className={styles.barTitle}>🎁 กระดานป้ายปริศนา</span>
        <div className={styles.chipRow}>
          {phase === "setup" && tiles.length > 0 && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setPhase("board")}
            >
              ↩ กลับกระดาน
            </button>
          )}
          {phase === "board" && (
            <>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  cancelRun();
                  setPhase("setup");
                }}
              >
                ⚙️ ตั้งค่า
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={startGame}
              >
                🔄 เริ่มใหม่
              </button>
            </>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={settings.soundOn ? "ปิดเสียง" : "เปิดเสียง"}
            onClick={() => patchSettings({ soundOn: !settings.soundOn })}
          >
            {settings.soundOn ? "🔊" : "🔇"}
          </button>
          <button type="button" className={styles.iconBtn} onClick={toggle}>
            ⛶ {isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          </button>
        </div>
      </div>
      {danger && <div className={styles.dangerFlash} />}
      {grandGlow && <div className={styles.grandGlow} />}
      {/* เลเยอร์แยกสำหรับคอนเฟตติ กัน .shell:fullscreen ที่ overflow:auto
          ทำให้ชิ้นคอนเฟตติที่ตกลงมาทำให้บอร์ดเลื่อน/กระตุกตอนเต็มจอ */}
      <div ref={confettiLayerRef} className={styles.confettiLayer} />

      <div className={styles.body}>
        {phase === "setup" ? (
          <SetupPanel
            settings={settings}
            questionText={questionText}
            questionCount={parseQuestions(questionText).length}
            onChange={patchSettings}
            onQuestionTextChange={handleQuestionText}
            onStart={startGame}
          />
        ) : (
          <>
            <div className={styles.boardTop}>
              <span className={styles.counter} aria-live="polite">
                เปิดแล้ว {openedCount}/{tiles.length}
              </span>
            </div>
            <BoardGrid
              tiles={tiles}
              spotlightId={spotlightId}
              busy={busy}
              onPick={openTile}
            />
            <div className={styles.boardFooter}>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={busy || allOpened}
                onClick={randomPick}
              >
                🎲 สุ่มป้าย
              </button>
            </div>
            {allOpened && (
              <p className={styles.doneBanner} aria-live="polite">
                🎉 เปิดครบทุกป้ายแล้ว! กด &quot;เริ่มใหม่&quot; เพื่อเล่นอีกรอบ
              </p>
            )}
            {revealTile && (
              <RevealOverlay
                key={revealTile.id}
                tile={revealTile}
                animate={revealAnimate}
                shake={danger}
                onClose={() => setRevealId(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
