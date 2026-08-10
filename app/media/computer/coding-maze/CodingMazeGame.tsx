"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hoverSfxDelegate, KcSfx } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import styles from "./CodingMazeGame.module.css";

type Direction = 0 | 1 | 2 | 3;
type Command = "forward" | "left" | "right";
type Pos = { row: number; col: number };
type Stage = "intro" | "play" | "won" | "lost";

type Level = { name: string; grid: string[]; start: Pos; target: Pos; dir: Direction; hint: string; maxCommands: number };
type Segment = { dir: Direction; steps: number };

const COMMANDS: { id: Command; icon: string; th: string; en: string }[] = [
  { id: "forward", icon: "↑", th: "เดินหน้า", en: "Forward" },
  { id: "left", icon: "↶", th: "เลี้ยวซ้าย", en: "Turn Left" },
  { id: "right", icon: "↷", th: "เลี้ยวขวา", en: "Turn Right" },
];

const STEPS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const CONFETTI = Array.from({ length: 48 }, (_, i) => ({ left: `${(i * 29.6) % 100}%`, delay: `${(i % 10) * 0.05}s`, color: ["#6f63ff", "#51e7c4", "#ffd257", "#ff6792", "#64c8ff"][i % 5] }));
const MAZE_THEMES = [
  { name: "Neon Academy", icon: "🔵", accent: "#55e7ff", second: "#7367ff", deep: "#111a4b", path: "#17386b" },
  { name: "Emerald Matrix", icon: "🟢", accent: "#55ffb0", second: "#18b987", deep: "#082f32", path: "#105744" },
  { name: "Solar Circuit", icon: "🟠", accent: "#ffd45f", second: "#ff7d45", deep: "#4a2514", path: "#69401c" },
  { name: "Candy Cyber", icon: "🩷", accent: "#ff83d2", second: "#a86cff", deep: "#42183f", path: "#59305f" },
  { name: "Arctic Server", icon: "❄️", accent: "#a9f2ff", second: "#4d9dff", deep: "#103354", path: "#174c72" },
  { name: "Lava Firewall", icon: "🔥", accent: "#ff9c55", second: "#ff405d", deep: "#4a171e", path: "#6b2824" },
  { name: "Quantum Violet", icon: "🟣", accent: "#d29aff", second: "#795dff", deep: "#29174e", path: "#40296d" },
  { name: "Ocean Network", icon: "🌊", accent: "#56ffe0", second: "#1688d4", deep: "#07334b", path: "#0d5068" },
  { name: "Golden Mainframe", icon: "⭐", accent: "#ffe178", second: "#c58b2e", deep: "#423414", path: "#65501e" },
  { name: "Core Nexus", icon: "🌈", accent: "#78fff0", second: "#ff5fc8", deep: "#321b52", path: "#383a78" },
] as const;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function buildLevel(name: string, size: number, segments: Segment[], hint: string): Level {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => "#"));
  const start = { row: 0, col: 0 };
  let position = { ...start };
  let direction: Direction = 1;
  let commandCount = 0;
  grid[position.row][position.col] = "S";
  for (const segment of segments) {
    const turn = (segment.dir - direction + 4) % 4;
    commandCount += turn === 2 ? 2 : turn ? 1 : 0;
    direction = segment.dir;
    for (let step = 0; step < segment.steps; step++) {
      const [dy, dx] = STEPS[direction];
      position = { row: position.row + dy, col: position.col + dx };
      if (position.row < 0 || position.row >= size || position.col < 0 || position.col >= size) throw new Error(`Invalid maze path: ${name}`);
      grid[position.row][position.col] = ".";
      commandCount += 1;
    }
  }
  grid[position.row][position.col] = "C";
  return { name, grid: grid.map((row) => row.join("")), start, target: position, dir: 1, hint, maxCommands: commandCount + 2 };
}

const LEVELS: Level[] = [
  buildLevel("ด่าน 1", 5, [{ dir: 1, steps: 1 }, { dir: 2, steps: 2 }, { dir: 1, steps: 2 }, { dir: 2, steps: 2 }], "ฝึกใช้คำสั่งเดินหน้าและเลี้ยวครั้งแรกให้หุ่นยนต์ไปถึง CPU"),
  buildLevel("ด่าน 2", 6, [{ dir: 1, steps: 1 }, { dir: 2, steps: 2 }, { dir: 1, steps: 3 }, { dir: 2, steps: 2 }, { dir: 3, steps: 1 }, { dir: 2, steps: 1 }], "เริ่มมีทางคดเคี้ยว ลองสังเกตว่าหุ่นยนต์หันหน้าไปทางไหน"),
  buildLevel("ด่าน 3", 7, [{ dir: 1, steps: 2 }, { dir: 2, steps: 2 }, { dir: 1, steps: 2 }, { dir: 2, steps: 2 }, { dir: 3, steps: 2 }, { dir: 2, steps: 2 }], "เพิ่มจุดเลี้ยวและระยะทาง ฝึกมองเส้นทางให้ครบก่อนเริ่ม"),
  buildLevel("ด่าน 4", 8, [{ dir: 1, steps: 2 }, { dir: 2, steps: 3 }, { dir: 1, steps: 3 }, { dir: 2, steps: 2 }, { dir: 3, steps: 2 }, { dir: 2, steps: 2 }, { dir: 1, steps: 2 }], "เขาวงกตเริ่มยาวขึ้น วางอัลกอริทึมเป็นช่วง ๆ จะช่วยไม่สับสน"),
  buildLevel("ด่าน 5", 9, [{ dir: 1, steps: 3 }, { dir: 2, steps: 2 }, { dir: 1, steps: 2 }, { dir: 2, steps: 3 }, { dir: 3, steps: 3 }, { dir: 2, steps: 2 }, { dir: 1, steps: 2 }], "ครึ่งทางแล้ว! ใช้แนวคิดแบ่งเส้นทางเป็นส่วนเล็ก ๆ"),
  buildLevel("ด่าน 6", 10, [{ dir: 1, steps: 2 }, { dir: 2, steps: 3 }, { dir: 1, steps: 4 }, { dir: 2, steps: 2 }, { dir: 3, steps: 3 }, { dir: 2, steps: 3 }, { dir: 1, steps: 2 }], "ด่านนี้มีทางตรงยาวและจุดกลับตัว ระวังคำสั่งเลี้ยวให้แม่น"),
  buildLevel("ด่าน 7", 10, [{ dir: 1, steps: 3 }, { dir: 2, steps: 2 }, { dir: 1, steps: 3 }, { dir: 2, steps: 2 }, { dir: 3, steps: 2 }, { dir: 2, steps: 2 }, { dir: 1, steps: 4 }, { dir: 2, steps: 3 }, { dir: 3, steps: 3 }], "เส้นทางแบบซิกแซกกำลังทดสอบความละเอียดในการเรียงคำสั่งของคุณ"),
  buildLevel("ด่าน 8", 11, [{ dir: 1, steps: 2 }, { dir: 2, steps: 3 }, { dir: 1, steps: 4 }, { dir: 2, steps: 2 }, { dir: 3, steps: 2 }, { dir: 2, steps: 3 }, { dir: 1, steps: 3 }, { dir: 2, steps: 2 }, { dir: 3, steps: 4 }], "ใช้การ Debug อย่างเป็นระบบ: เช็กทิศ หาคำสั่งที่ผิด แล้วแก้ทีละจุด"),
  buildLevel("ด่าน 9", 12, [{ dir: 1, steps: 3 }, { dir: 2, steps: 2 }, { dir: 1, steps: 3 }, { dir: 2, steps: 3 }, { dir: 3, steps: 2 }, { dir: 2, steps: 2 }, { dir: 1, steps: 4 }, { dir: 2, steps: 3 }, { dir: 3, steps: 3 }, { dir: 2, steps: 1 }], "เกือบถึงด่านสุดท้ายแล้ว วางชุดคำสั่งให้เป็นลำดับต่อเนื่องโดยไม่ข้ามจุดเลี้ยว"),
  buildLevel("ด่าน 10", 14, [{ dir: 1, steps: 2 }, { dir: 2, steps: 3 }, { dir: 1, steps: 5 }, { dir: 2, steps: 2 }, { dir: 3, steps: 3 }, { dir: 2, steps: 3 }, { dir: 1, steps: 4 }, { dir: 2, steps: 2 }, { dir: 3, steps: 2 }, { dir: 2, steps: 3 }, { dir: 1, steps: 2 }], "ด่านสุดท้าย! วางแผนเหมือนนักเขียนโปรแกรมตัวจริง แล้วพิชิต CPU ให้ได้"),
];

export default function CodingMazeGame() {
  useTrackToolUse("computer-coding-maze");
  const { isFull, stageProps, toggle } = useStage<HTMLDivElement>();
  const [levelIndex, setLevelIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("intro");
  const [queue, setQueue] = useState<Command[]>([]);
  const [position, setPosition] = useState<Pos>(LEVELS[0].start);
  const [direction, setDirection] = useState<Direction>(LEVELS[0].dir);
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [crashCell, setCrashCell] = useState<Pos | null>(null);
  const [bumping, setBumping] = useState(false);
  const [message, setMessage] = useState("วางคำสั่ง แล้วกด RUN!");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    KcSfx.setBgmTheme("coding-maze");
    return () => KcSfx.setBgmTheme("default");
  }, []);
  const runId = useRef(0);
  const level = LEVELS[levelIndex];
  const mazeTheme = MAZE_THEMES[levelIndex];
  const maxCommands = level.maxCommands;
  const rows = level.grid.length;
  const cols = level.grid[0].length;

  const resetBoard = useCallback((nextStage: Stage = "play") => {
    runId.current += 1; setRunning(false); setQueue([]); setPosition(level.start); setDirection(level.dir); setActiveStep(-1); setCrashCell(null); setBumping(false); setMessage("วางคำสั่ง แล้วกด RUN!"); setStage(nextStage);
  }, [level]);

  const addCommand = (command: Command) => {
    if (running || queue.length >= maxCommands) return;
    KcSfx.unlock(); KcSfx.play("pop"); setQueue((items) => [...items, command]); setMessage("พร้อมแล้ว! ลองกด RUN");
  };

  const run = async () => {
    if (running || !queue.length) { if (!queue.length) { KcSfx.play("wrong"); setMessage("เลือกคำสั่งอย่างน้อย 1 คำสั่งก่อน"); } return; }
    KcSfx.unlock(); KcSfx.play("whoosh"); setRunning(true); setStage("play"); setMessage("กำลังรันคำสั่ง...");
    const id = ++runId.current;
    let nextPosition = { ...level.start };
    let nextDirection = level.dir;
    setPosition(nextPosition); setDirection(nextDirection);
    await wait(260);
    for (let index = 0; index < queue.length; index++) {
      if (id !== runId.current) return;
      const command = queue[index]; setActiveStep(index);
      if (command === "left") { nextDirection = ((nextDirection + 3) % 4) as Direction; setDirection(nextDirection); KcSfx.play("tick"); await wait(300); }
      if (command === "right") { nextDirection = ((nextDirection + 1) % 4) as Direction; setDirection(nextDirection); KcSfx.play("tick"); await wait(300); }
      if (command === "forward") {
        const [dy, dx] = STEPS[nextDirection]; const candidate = { row: nextPosition.row + dy, col: nextPosition.col + dx };
        const blocked = candidate.row < 0 || candidate.row >= rows || candidate.col < 0 || candidate.col >= cols || level.grid[candidate.row][candidate.col] === "#";
        if (blocked) { KcSfx.play("wrong"); setCrashCell(candidate); setBumping(true); setMessage("โอ๊ะ! หุ่นยนต์ชนสิ่งกีดขวาง ลองแก้คำสั่งดูนะ"); await wait(430); setBumping(false); setStage("lost"); setRunning(false); return; }
        nextPosition = candidate; setPosition(nextPosition); KcSfx.play("drop");
        await wait(560);
      }
      if (nextPosition.row === level.target.row && nextPosition.col === level.target.col) { KcSfx.play("win"); setMessage("ภารกิจสำเร็จ! CPU ปลอดภัยแล้ว"); setStage("won"); setRunning(false); setActiveStep(-1); return; }
    }
    setRunning(false); setActiveStep(-1); setMessage("ยังไปไม่ถึง CPU ลองเพิ่มหรือปรับคำสั่งอีกครั้ง");
  };

  const queueLabels = useMemo(() => queue.map((command) => COMMANDS.find((item) => item.id === command)!), [queue]);
  const robotPoint = useMemo(() => {
    const gap = 5; const pad = 10;
    const xFraction = (position.col + .5) / cols; const yFraction = (position.row + .5) / rows;
    return {
      left: `calc(${xFraction * 100}% + ${pad - xFraction * (pad * 2 + (cols - 1) * gap) + position.col * gap}px)`,
      top: `calc(${yFraction * 100}% + ${pad - yFraction * (pad * 2 + (rows - 1) * gap) + position.row * gap}px)`,
    };
  }, [cols, position.col, position.row, rows]);
  const goNext = () => {
    if (levelIndex + 1 >= LEVELS.length) { resetBoard("play"); return; }
    const nextIndex = levelIndex + 1;
    const nextLevel = LEVELS[nextIndex];
    runId.current += 1;
    setLevelIndex(nextIndex); setRunning(false); setQueue([]); setPosition(nextLevel.start); setDirection(nextLevel.dir);
    setActiveStep(-1); setCrashCell(null); setBumping(false); setMessage("วางคำสั่ง แล้วกด RUN!"); setStage("intro");
  };

  return <div {...stageProps} className="kc-stage"><div className={`kc-stage-body kc-game kc-computer-game ${styles.shell}`} data-stage={stage} data-maze-theme={levelIndex + 1} style={{ "--maze-accent": mazeTheme.accent, "--maze-second": mazeTheme.second, "--maze-deep": mazeTheme.deep, "--maze-path": mazeTheme.path } as React.CSSProperties} onMouseOver={hoverSfxDelegate}>
    <div className={styles.gridGlow}/><div className={styles.orbOne}/><div className={styles.orbTwo}/>
    <style jsx>{`
      .${styles.shell}{background:radial-gradient(circle at 50% 8%,var(--maze-second) 0,var(--maze-deep) 44%,#080a20 100%);transition:background .7s ease}
      .${styles.gridGlow}{background-image:linear-gradient(color-mix(in srgb,var(--maze-accent) 42%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--maze-accent) 42%,transparent) 1px,transparent 1px)}
      .${styles.orbOne}{background:var(--maze-accent)}.${styles.orbTwo}{background:var(--maze-second)}
      .${styles.mazePanel},.${styles.commandPanel}{border-color:color-mix(in srgb,var(--maze-accent) 38%,transparent);box-shadow:inset 0 1px rgba(255,255,255,.08),0 0 26px color-mix(in srgb,var(--maze-accent) 10%,transparent)}
      .${styles.maze}{position:relative;border-color:color-mix(in srgb,var(--maze-accent) 35%,transparent);background:color-mix(in srgb,var(--maze-deep) 72%,#020718);box-shadow:inset 0 0 38px color-mix(in srgb,var(--maze-second) 38%,transparent),0 15px 32px rgba(0,0,0,.25)}
      .${styles.path}{border-color:color-mix(in srgb,var(--maze-accent) 30%,#14285a);background:linear-gradient(145deg,color-mix(in srgb,var(--maze-path) 88%,#fff 5%),var(--maze-path))}
      .${styles.commandButtons} button{border-color:color-mix(in srgb,var(--maze-accent) 50%,#33477e);background:linear-gradient(145deg,color-mix(in srgb,var(--maze-path) 80%,#fff 7%),color-mix(in srgb,var(--maze-deep) 82%,#101a3e))}
      .${styles.commandButtons} b,.${styles.commandHeader} small{color:var(--maze-accent)}.${styles.runBtn}{background:linear-gradient(105deg,var(--maze-second),var(--maze-accent))!important}
      .${styles.levelBadge}{border-color:color-mix(in srgb,var(--maze-accent) 45%,transparent);color:var(--maze-accent);background:color-mix(in srgb,var(--maze-accent) 12%,transparent)}
      .${styles.target}{border-color:var(--maze-accent)!important;box-shadow:0 0 25px color-mix(in srgb,var(--maze-accent) 48%,transparent)}.${styles.cpu}{filter:drop-shadow(0 0 14px var(--maze-accent))}
      .robotMover{position:absolute;z-index:8;left:${robotPoint.left};top:${robotPoint.top};transform:translate(-50%,-50%);transition:left .54s cubic-bezier(.22,.72,.24,1),top .54s cubic-bezier(.22,.72,.24,1);pointer-events:none}
      .robotMover:after{position:absolute;top:50%;left:50%;z-index:-1;width:70%;height:70%;content:"";border-radius:50%;background:var(--maze-accent);opacity:${running ? ".3" : ".12"};filter:blur(10px);transform:translate(-50%,-50%);transition:opacity .2s}
      .robotSprite{display:block;font-size:max(20px,3.3cqi);line-height:1;filter:drop-shadow(0 0 11px var(--maze-accent));transform:rotate(${direction * 90}deg);transition:transform .28s cubic-bezier(.34,1.56,.64,1);will-change:transform}
      .robotBump{animation:robotBump .42s ease-in-out}
      @keyframes robotBump{35%{transform:translateX(13px) scale(1.12)}70%{transform:translateX(-5px) scale(.94)}}
      @container kcstage (aspect-ratio >= 0.9){
        .${styles.brand} b{font-size:19px}.${styles.brand} small{font-size:12px}.${styles.hubMenu},.${styles.roundBtn}{height:42px}.${styles.hubMenu}{padding:0 14px}.${styles.hubMenu} b{font-size:14px}.${styles.roundBtn}{width:42px;font-size:20px}
        .${styles.levelBadge}{padding:7px 14px;font-size:12px}.${styles.introStats} span{padding:8px 13px;font-size:13px}.${styles.startBtn}{min-width:250px;min-height:50px;justify-content:center;padding:12px 24px}.${styles.startBtn} span{font-size:19px}.${styles.startBtn} b{width:30px;height:30px;font-size:18px}
        .${styles.hud} span{font-size:12px}.${styles.hud} b{font-size:20px}.${styles.hud} small{font-size:12px}.${styles.hudMessage}{padding:8px 14px;font-size:13px}
        .${styles.mission}{padding:7px 11px;font-size:13px}.${styles.legend}{font-size:11px}.${styles.robotDot},.${styles.cpuDot}{width:9px;height:9px}
        .${styles.commandPanel}{padding:16px}.${styles.commandHeader} small{font-size:11px}.${styles.commandHeader} h2{font-size:23px}.${styles.commandHeader}>span{padding:7px 10px;font-size:12px}
        .${styles.commandButtons}{gap:9px}.${styles.commandButtons} button{min-height:76px}.${styles.commandButtons} b{font-size:31px}.${styles.commandButtons} span{font-size:14px}.${styles.commandButtons} small{font-size:11px}
        .${styles.queue}{gap:8px;padding:10px}.${styles.queue} p{font-size:13px}.${styles.queue}>span{height:34px;padding:0 9px;font-size:20px}.${styles.queue}>span b{font-size:11px}
        .${styles.actions} button{height:46px;font-size:18px}.${styles.actions} button span{font-size:12px}.${styles.runBtn} b{font-size:16px}.${styles.runBtn} span{font-size:18px!important}
        .${styles.resultCard}{width:min(470px,92%);padding:27px}.${styles.resultCard} h2{font-size:31px}.${styles.resultCard} p{font-size:15px}.${styles.outlineBtn}{padding:12px 17px;font-size:15px}
        .${styles.intro}{padding:24px 28px 30px}.${styles.intro} .${styles.levelBadge}{padding:8px 17px;font-size:14px}.${styles.introVisual}{gap:28px;margin:18px 0 8px}.${styles.introVisual} span{width:116px;height:116px;border-radius:31px;font-size:63px}.${styles.introVisual} i{font-size:22px}
        .${styles.intro} h2{margin:12px 0 8px;font-size:max(42px,4.5cqi);line-height:1.1}.${styles.intro} p{max-width:760px;font-size:18px;line-height:1.7}.${styles.introStats}{gap:12px;margin:18px 0}.${styles.introStats} span{padding:10px 16px;font-size:15px}.${styles.intro} .${styles.startBtn}{min-width:320px;min-height:58px;padding:14px 27px}.${styles.intro} .${styles.startBtn} span{font-size:22px}.${styles.intro} .${styles.startBtn} b{width:34px;height:34px;font-size:21px}
        .${styles.mazePanel}{padding:18px 16px 18px 112px}.${styles.maze}{width:min(100%,440px)}
        .${styles.mission}{top:22%;left:12px;z-index:5;width:88px;max-width:88px;transform:none;padding:9px 7px;border:1px solid rgba(125,229,255,.3);border-radius:11px;background:rgba(3,10,31,.92);font-size:11px;line-height:1.45;white-space:normal;overflow-wrap:anywhere;text-align:center}
        .${styles.legend}{top:49%;bottom:auto;left:12px;z-index:5;display:flex;width:88px;transform:none;flex-direction:column;gap:7px;padding:8px 7px;border:1px solid rgba(255,255,255,.12);border-radius:11px;background:rgba(3,10,31,.92);font-size:11px;white-space:normal}
        .${styles.legend} span{width:100%;justify-content:flex-start;padding:3px 0;line-height:1.3}.${styles.robotDot},.${styles.cpuDot}{flex:0 0 auto;width:9px;height:9px}
      }
      @container kcstage (aspect-ratio < 0.9){
        .${styles.brand} b{font-size:14px}.${styles.brand} small{font-size:11px}.${styles.introStats} span{padding:5px 8px;font-size:11px}.${styles.startBtn}{min-width:210px;min-height:44px;justify-content:center;padding:10px 18px}.${styles.startBtn} span{font-size:16px}.${styles.startBtn} b{width:27px;height:27px;font-size:16px}
        .${styles.hud} span{font-size:11px}.${styles.hud} b{font-size:16px}.${styles.hud} small{font-size:11px}.${styles.hudMessage}{font-size:11px}.${styles.mission}{font-size:11px}.${styles.legend}{font-size:11px}
        .${styles.commandHeader} small{font-size:11px}.${styles.commandHeader} h2{font-size:17px}.${styles.commandHeader}>span{font-size:11px}.${styles.commandButtons} button{min-height:53px}.${styles.commandButtons} b{font-size:24px}.${styles.commandButtons} span{font-size:11px}
        .${styles.queue} p{font-size:9.5px}.${styles.queue}>span{height:26px;font-size:15px}.${styles.queue}>span b{font-size:11px}.${styles.actions} button{height:37px;font-size:16px}.${styles.runBtn} b{font-size:13px}.${styles.runBtn} span{font-size:16px!important}
        .${styles.resultCard} h2{font-size:24px}.${styles.resultCard} p{font-size:13px}.${styles.outlineBtn}{font-size:13px}
      }
    `}</style>
    <header className={styles.topbar}>
      <div className={styles.brand}><Image src="/assets/khuncool-logo.webp" alt="KhunCool" width={38} height={38}/><span><b className="kc-title">CPU Quest</b><small>เขาวงกตโค้ดดิ้ง</small></span></div>
      <div className={styles.controls}>
        <Link href="/media/computer" className={`${styles.hubMenu} kc-game-menu`} aria-label="กลับหน้าสื่อคอมพิวเตอร์"><span>☰</span><b>เมนู</b></Link>
        {stage !== "intro" && <button type="button" className={`${styles.hubMenu} kc-game-menu`} onClick={() => resetBoard("intro")} aria-label="เริ่มด่านใหม่"><span>↻</span><b>เริ่มใหม่</b></button>}
        <button type="button" className={styles.roundBtn} onClick={() => { const next = !muted; setMuted(next); KcSfx.setMuted(next); KcSfx.bgm(!next); if (!next) KcSfx.play("click"); }} aria-label={muted ? "เปิดเสียงและเพลง" : "ปิดเสียงและเพลง"}>{muted ? "🔇" : "🔊"}</button>
        <button type="button" className={`${styles.roundBtn} ${isFull ? styles.activeBtn : ""}`} onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
      </div>
    </header>

    {stage === "intro" ? <section className={styles.intro}>
      <div className={styles.levelBadge}>{mazeTheme.icon} {level.name.toUpperCase()} · {mazeTheme.name}</div><div className={styles.introVisual}><span>🤖</span><i>→</i><span>🧠</span></div>
      <h2>วางแผนให้ดี<br/>แล้วพาหุ่นยนต์พิชิต CPU!</h2><p>{level.hint}</p>
      <div className={styles.introStats}><span>🧩 {rows} × {cols} ช่อง</span><span>⌘ สูงสุด {maxCommands} คำสั่ง</span><span>🏆 {LEVELS.length} ด่าน</span></div>
      <button type="button" className={styles.startBtn} onClick={() => { KcSfx.unlock(); KcSfx.bgm(true); KcSfx.play("whoosh"); setStage("play"); }}><span>เริ่มภารกิจ</span><b>▶</b></button>
    </section> : <section className={styles.play}>
      <div className={styles.hud}><div><span>ด่าน</span><b>{levelIndex + 1}<small> / {LEVELS.length}</small></b></div><div className={styles.hudMessage}>{message}</div><div><span>คำสั่ง</span><b>{queue.length}<small> / {maxCommands}</small></b></div></div>
      <div className={styles.gameGrid}>
        <div className={styles.mazePanel}><div className={styles.mission}>🎯 ภารกิจ: ไปหา CPU</div><div className={styles.maze} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {level.grid.flatMap((line, row) => [...line].map((cell, col) => { const target = level.target.row === row && level.target.col === col; const obstacle = (row * cols + col) % 3; const crashed = crashCell?.row === row && crashCell?.col === col; return <div key={`${row}-${col}`} className={`${styles.cell} ${cell === "#" ? `${styles.wall} ${styles[`obstacle${obstacle}`]}` : styles.path} ${target ? styles.target : ""} ${crashed ? styles.crashed : ""}`}>{cell === "#" && <span className={styles.obstacleMark} aria-hidden="true">{obstacle === 0 ? "▦" : obstacle === 1 ? "⚡" : "╳"}</span>}{target && <span className={styles.cpu}>🧠</span>}</div>; }))}
          <span className="robotMover" aria-label="หุ่นยนต์"><span className={`robotSprite ${bumping ? "robotBump" : ""}`}>🤖</span></span>
        </div><div className={styles.legend}><span><i className={styles.robotDot}/>หุ่นยนต์</span><span><i className={styles.cpuDot}/>CPU เป้าหมาย</span></div></div>
        <div className={styles.commandPanel}><div className={styles.commandHeader}><div><small>COMMAND CENTER</small><h2>วางแผนคำสั่ง</h2></div><span>{queue.length} / {maxCommands}</span></div>
          <div className={styles.commandButtons}>{COMMANDS.map((command) => <button key={command.id} type="button" disabled={running || queue.length >= maxCommands} onClick={() => addCommand(command.id)}><b>{command.icon}</b><span>{command.th}<small>{command.en}</small></span></button>)}</div>
          <div className={styles.queue} aria-label="ลำดับคำสั่งที่เลือก">{queueLabels.length ? queueLabels.map((command, index) => <span key={`${command.id}-${index}`} className={activeStep === index ? styles.activeCommand : ""}><b>{index + 1}</b>{command.icon}</span>) : <p>เลือกคำสั่งจากด้านบน<br/>เพื่อสร้างเส้นทางของคุณ</p>}</div>
          <div className={styles.actions}><button type="button" disabled={running || !queue.length} onClick={() => { KcSfx.play("click"); setQueue((items) => items.slice(0, -1)); }} aria-label="ย้อนกลับหนึ่งคำสั่ง">↶<span>ย้อนกลับ</span></button><button type="button" disabled={running} onClick={() => resetBoard("play")} aria-label="ล้างคำสั่ง">↻<span>ล้าง</span></button><button type="button" disabled={running} onClick={run} className={styles.runBtn}><b>{running ? "กำลังรัน" : "RUN"}</b><span>▶</span></button></div>
        </div>
      </div>
      {(stage === "won" || stage === "lost") && <div className={styles.overlay}>{stage === "won" && <div className={styles.confetti}>{CONFETTI.map((piece, index) => <i key={index} style={{ left: piece.left, animationDelay: piece.delay, background: piece.color }}/>)}</div>}<div className={`${styles.resultCard} ${stage === "won" ? styles.winCard : styles.loseCard}`}><div className={styles.resultIcon}>{stage === "won" ? "🏆" : "💥"}</div><div className={styles.levelBadge}>{stage === "won" ? "MISSION COMPLETE" : "DEBUG MODE"}</div><h2>{stage === "won" ? "พิชิต CPU สำเร็จ!" : "เกือบแล้ว! ลอง Debug ดู"}</h2><p>{stage === "won" ? "คุณออกแบบอัลกอริทึมได้ยอดเยี่ยมมาก" : "หุ่นยนต์ชนกำแพง ลองสังเกตทิศทางและเรียงคำสั่งใหม่"}</p><div className={styles.resultActions}>{stage === "won" && <button type="button" className={styles.startBtn} onClick={goNext}><span>{levelIndex + 1 < LEVELS.length ? "ไปด่านถัดไป" : "เล่นอีกครั้ง"}</span><b>▶</b></button>}<button type="button" className={styles.outlineBtn} onClick={() => resetBoard("play")}>{stage === "won" ? "เล่นด่านเดิม" : "ลองใหม่"}</button></div></div></div>}
    </section>}
  </div></div>;
}
