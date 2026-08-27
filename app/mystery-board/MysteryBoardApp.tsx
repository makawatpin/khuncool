"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import styles from "./MysteryBoard.module.css";
import BoardGrid from "./BoardGrid";
import RevealOverlay from "./RevealOverlay";
import SetupPanel from "./SetupPanel";
import {
  DEFAULT_SETTINGS,
  buildTiles,
  loadSettings,
  parseQuestions,
  saveSettings,
  type Settings,
  type Tile,
} from "./boardModel";

type Phase = "setup" | "board";

// จำกัดจำนวนขั้นของไฟวิ่งไม่ให้บอร์ดใหญ่ (30 ป้าย) ใช้เวลานานเกินไป
const MAX_STEPS = 28;

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
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const randomBtnRef = useRef<HTMLButtonElement | null>(null);

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

  /** ยกเลิกไฟวิ่งที่ค้างอยู่ (ถ้ามี) — เรียกก่อนออกจากกระดานทุกทาง */
  const cancelRun = useCallback(() => {
    clearTimeouts();
    setSpotlightId(null);
    setBusy(false);
  }, [clearTimeouts]);

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
      }
    },
    [tiles],
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

    setBusy(true);
    clearTimeouts();

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
      trackedTimeout(() => setSpotlightId(id), elapsed);
    });

    trackedTimeout(() => {
      setSpotlightId(null);
      setBusy(false);
      openTile(target.id);
      // ย้ายโฟกัสมาที่ปุ่มสุ่ม เพราะ overlay เผยผลกำลังจะเด้งขึ้นมาแทนอยู่แล้ว
      randomBtnRef.current?.focus();
    }, elapsed + 420);
  }, [busy, tiles, openTile, clearTimeouts, trackedTimeout]);

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
          <button type="button" className={styles.iconBtn} onClick={toggle}>
            ⛶ {isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          </button>
        </div>
      </div>

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
                ref={randomBtnRef}
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
                onClose={() => setRevealId(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
