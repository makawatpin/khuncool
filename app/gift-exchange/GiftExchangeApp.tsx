"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useToolFullscreen } from "@/components/useToolFullscreen";
import {
  EMPTY_STATE,
  activePlayers,
  addPlayer,
  beginStage,
  boxesOpened,
  browserStorage,
  canStart,
  canToggle,
  currentTurn,
  nextTurn,
  openBox,
  parseNames,
  pickStarter,
  playerLabels,
  playersToText,
  pool,
  readSaved,
  resetGame,
  setActive,
  setNames,
  totalBoxes,
  writeSaved,
  type GameState,
} from "./chainModel";
import FinaleChain from "./FinaleChain";
import GiftStage from "./GiftStage";
import RosterPanel from "./RosterPanel";
import SetupPanel from "./SetupPanel";
import StarterSpin from "./StarterSpin";
import { clearFx, fireworks, sideCannons } from "./fx";
import { useGiftSound } from "./useGiftSound";
import { useGiftScene } from "./three/useGiftScene";
import styles from "./GiftExchange.module.css";

// ตำแหน่งหิมะคงที่ (ไม่สุ่มตอน render) กัน hydration mismatch
const FLAKES = Array.from({ length: 30 }, (_, i) => ({
  "--x": `${(i * 37) % 100}%`,
  "--s": `${3 + (i % 4) * 2}px`,
  "--d": `${9 + ((i * 7) % 9)}s`,
  "--delay": `${-((i * 1.3) % 12).toFixed(1)}s`,
  "--drift": `${((i % 5) - 2) * 24}px`,
})) as CSSProperties[];

export default function GiftExchangeApp() {
  useTrackToolUse("gift-exchange");

  const [game, setGame] = useState<GameState>(EMPTY_STATE);
  const [namesText, setNamesText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  /** โหลดเกมค้างมา รอครูเลือก "เล่นต่อ / เริ่มใหม่" */
  const [resumable, setResumable] = useState(false);
  /** หมุนสล็อตเฉพาะตอนครูกดเริ่มในรอบนี้ — กลับมาจากเกมค้างไม่ต้องหมุนซ้ำ */
  const [starterAnimate, setStarterAnimate] = useState(false);
  /** กล่องสุดท้ายเพิ่งเปิด — ยังอยู่บนเวทีจนกว่าจะกด "ดูวงทั้งห้อง" */
  const [finaleIntro, setFinaleIntro] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const fxRef = useRef<HTMLDivElement | null>(null);
  const { isFull, fullscreenClassName, toggle } = useToolFullscreen(frameRef, styles.fsFallback);
  const { play, startMusic, stopMusic } = useGiftSound(game.soundOn);

  // โหลดหลัง mount เท่านั้น กัน hydration mismatch
  useEffect(() => {
    const t = window.setTimeout(() => {
      const saved = readSaved(browserStorage());
      if (saved) {
        setGame(saved);
        setNamesText(saved.players.map((p) => p.name).join("\n"));
        setResumable(saved.phase !== "setup");
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated) writeSaved(browserStorage(), game);
  }, [game, hydrated]);

  const labels = useMemo(() => playerLabels(game.players), [game.players]);
  const turn = currentTurn(game);

  const cannons = useCallback(() => sideCannons(fxRef.current), []);
  const bigFireworks = useCallback(() => fireworks(fxRef.current, 7), []);

  const handleNamesText = useCallback((text: string) => {
    setNamesText(text);
    setGame((g) => setNames(g, parseNames(text)));
  }, []);

  const handleRoster = useCallback((names: string[]) => {
    setNamesText(names.join("\n"));
    setGame((g) => setNames(g, names));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setGame((g) => {
      const p = g.players.find((x) => x.id === id);
      return p ? setActive(g, id, !p.active) : g;
    });
  }, []);

  const handleStart = () => {
    const next = pickStarter(game, Math.random);
    if (next === game) return;
    if (game.soundOn) startMusic();
    setStarterAnimate(true);
    setGame(next);
  };

  const handleResume = () => {
    setResumable(false);
    if (game.soundOn) startMusic();
  };

  const backToSetup = () => {
    clearFx(fxRef.current);
    stopMusic();
    setFinaleIntro(false);
    setRosterOpen(false);
    setResumable(false);
    setNamesText(playersToText(game.players));
    setGame((g) => resetGame(g));
  };

  const handleEndGame = () => {
    if (window.confirm("จบเกมนี้แล้วกลับไปหน้าตั้งค่า? ลำดับที่เปิดไปแล้วจะหายไป")) backToSetup();
  };

  const handleOpen = () => {
    const r = openBox(game, Math.random);
    if (!r.receiverId) return;
    setGame(r.state);
    if (r.closesLoop) setFinaleIntro(true);
  };

  const handleRingComplete = useCallback(() => {
    bigFireworks();
    play("celebrate");
  }, [bigFireworks, play]);

  const toggleSound = () => {
    const soundOn = !game.soundOn;
    setGame((g) => ({ ...g, soundOn }));
    // ปิดเสียง: hook หยุดเพลงเองเมื่อ enabled เป็น false
    if (soundOn && game.phase !== "setup" && !resumable) startMusic();
  };

  const screen = resumable ? "setup" : game.phase === "finale" && finaleIntro ? "stage" : game.phase;
  const { scene, mode: renderMode, chooseMode } = useGiftScene(screen === "stage");
  const active = activePlayers(game);
  const remaining = pool(game).length;

  return (
    <div
      ref={frameRef}
      className={`${styles.shell} ${fullscreenClassName}`}
      data-screen={screen}
    >
      <div className={styles.snow} aria-hidden="true">
        {FLAKES.map((style, i) => (
          <span key={i} className={styles.flake} style={style} />
        ))}
      </div>

      <div className={styles.bar}>
        <span className={styles.barTitle}>🎄 จับฉลากแลกของขวัญ</span>
        <div className={styles.barActions}>
          {screen !== "setup" && (
            <button type="button" className={styles.iconBtn} onClick={handleEndGame} aria-label="จบเกม">
              ⏹ <span className={styles.iconBtnLabel}>จบเกม</span>
            </button>
          )}
          {screen === "stage" && (
            <button
              type="button"
              className={styles.iconBtn}
              aria-label={renderMode === "2d" ? "เปลี่ยนเป็นภาพ 3D" : "เปลี่ยนเป็นภาพ 2D"}
              onClick={() => chooseMode(renderMode === "2d" ? "3d-high" : "2d")}
            >
              ✨ <span className={styles.iconBtnLabel}>{renderMode === "2d" ? "3D" : "2D"}</span>
            </button>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={game.soundOn ? "ปิดเสียง" : "เปิดเสียง"}
            onClick={toggleSound}
          >
            {game.soundOn ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            onClick={toggle}
          >
            ⛶ <span className={styles.iconBtnLabel}>{isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}</span>
          </button>
        </div>
      </div>

      <div ref={fxRef} className={styles.fxLayer} />

      <div className={styles.body}>
        {screen === "setup" && (
          <SetupPanel
            namesText={namesText}
            players={game.players}
            labels={labels}
            activeCount={active.length}
            canStart={hydrated && canStart(game)}
            locked={resumable}
            resume={resumable ? { opened: boxesOpened(game), total: totalBoxes(game) } : null}
            onNamesText={handleNamesText}
            onRoster={handleRoster}
            onToggle={handleToggle}
            onStart={handleStart}
            onResume={handleResume}
            onDiscard={backToSetup}
          />
        )}

        {screen === "starter" && turn && (
          <StarterSpin
            names={active.map((p) => labels[p.id])}
            starterLabel={labels[turn.giverId]}
            animate={starterAnimate}
            play={play}
            onLanded={() => {
              play("fanfare");
              cannons();
            }}
            onContinue={() => setGame((g) => beginStage(g))}
          />
        )}

        {screen === "stage" && turn && (
          <GiftStage
            key={turn.giverId}
            turnKey={turn.giverId}
            scene={scene}
            giverLabel={labels[turn.giverId]}
            receiverLabel={turn.receiverId ? labels[turn.receiverId] : null}
            boxOpen={game.boxOpen}
            closesLoop={game.phase === "finale"}
            isLastBox={game.phase === "stage" && !game.boxOpen && remaining === 0}
            paletteIndex={game.chain.indexOf(turn.giverId)}
            remaining={remaining}
            chainLabels={game.chain.map((id) => labels[id])}
            play={play}
            onCannons={cannons}
            onFireworks={bigFireworks}
            onOpen={handleOpen}
            onNext={() => setGame((g) => nextTurn(g))}
            onShowFinale={() => setFinaleIntro(false)}
            rosterButton={
              game.phase === "stage" ? (
                <button type="button" className={styles.iconBtn} onClick={() => setRosterOpen(true)}>
                  👥 <span className={styles.iconBtnLabel}>รายชื่อ</span>
                </button>
              ) : null
            }
          />
        )}

        {screen === "finale" && (
          <FinaleChain
            labels={game.chain.map((id) => labels[id])}
            onComplete={handleRingComplete}
            onRestart={backToSetup}
          />
        )}
      </div>

      {rosterOpen && screen === "stage" && (
        <RosterPanel
          players={game.players}
          labels={labels}
          chainIds={game.chain}
          canToggle={(id) => canToggle(game, id)}
          onToggle={handleToggle}
          onAdd={(name) => {
            setNamesText(playersToText(addPlayer(game, name).players));
            setGame((g) => addPlayer(g, name));
          }}
          onClose={() => setRosterOpen(false)}
        />
      )}
    </div>
  );
}
