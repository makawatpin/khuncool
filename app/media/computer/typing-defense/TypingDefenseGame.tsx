"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hoverSfxDelegate, KcSfx } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useFullscreen } from "../../english/useFullscreen";
import styles from "./TypingDefenseGame.module.css";

type Stage = "home" | "select" | "levelIntro" | "countdown" | "play" | "result";
type GameMode = "training" | "adventure";
type Speed = "slow" | "normal" | "fast";
type Threat = { id: number; word: string; hint: string; x: number; y: number; speed: number };
type Blast = { id: number; x: number; y: number; word: string };
type DataDrop = { id: number; glyph: string; x: number; drift: number; duration: number; delay: number };

const TERMS = [
  ["RAM", "หน่วยความจำชั่วคราว"], ["CPU", "หน่วยประมวลผล"], ["MOUSE", "อุปกรณ์ชี้ตำแหน่ง"],
  ["ROUTER", "อุปกรณ์เชื่อมเครือข่าย"], ["FIREWALL", "กำแพงป้องกันเครือข่าย"], ["MALWARE", "โปรแกรมอันตราย"],
  ["KEYBOARD", "แป้นพิมพ์"], ["MONITOR", "จอภาพ"], ["BROWSER", "โปรแกรมท่องเว็บ"],
  ["PASSWORD", "รหัสผ่าน"], ["SOFTWARE", "โปรแกรมคอมพิวเตอร์"], ["HARDWARE", "อุปกรณ์ที่จับต้องได้"],
] as const;

const ROUND_SECONDS = 60;
const ADVENTURE_SECONDS = 45;
const MAX_ADVENTURE_LEVEL = 8;
const SPEED_LABEL: Record<Speed, string> = { slow: "ช้า", normal: "ปกติ", fast: "เร็ว" };
const ZONE_NAMES = ["Neon Gateway", "Solar Firewall", "Quantum Vault", "Cyber Ocean", "Malware Factory", "Cloud Fortress", "Dark Network", "Core Nexus"];

export default function TypingDefenseGame() {
  useTrackToolUse("computer-typing-defense");
  const { ref, isFull, fullscreenClassName, toggle } = useFullscreen<HTMLDivElement>();
  const [stage, setStage] = useState<Stage>("home");
  const [threats, setThreats] = useState<Threat[]>([]);
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [dataDrops, setDataDrops] = useState<DataDrop[]>([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [integrity, setIntegrity] = useState(3);
  const [remaining, setRemaining] = useState(ROUND_SECONDS);
  const [countdown, setCountdown] = useState(3);
  const [mode, setMode] = useState<GameMode>("training");
  const [speed, setSpeed] = useState<Speed>("slow");
  const [adventureLevel, setAdventureLevel] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    KcSfx.setBgmTheme("typing-defense");
    return () => KcSfx.setBgmTheme("default");
  }, []);
  const [message, setMessage] = useState("เตรียมระบบป้องกันให้พร้อม!");
  const idRef = useRef(0);
  const spawnRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropIdRef = useRef(0);

  const focusInput = useCallback(() => window.setTimeout(() => inputRef.current?.focus(), 80), []);
  const roundSeconds = mode === "adventure" ? ADVENTURE_SECONDS : ROUND_SECONDS;
  const speedMultiplier = mode === "adventure" ? 0.86 + Math.min(adventureLevel - 1, 4) * 0.12 : ({ slow: 0.72, normal: 0.9, fast: 1.1 }[speed]);
  const theme = mode === "adventure" ? `zone-${((adventureLevel - 1) % 4) + 1}` : "training";

  const newThreat = useCallback((difficulty: number): Threat => {
    const term = TERMS[Math.floor(Math.random() * TERMS.length)];
    idRef.current += 1;
    // Deliberately slow for primary-school typists: enough time to read, find keys, and type.
    return { id: idRef.current, word: term[0], hint: term[1], x: 4 + Math.random() * 78, y: -9, speed: (0.78 + difficulty * 0.1 + Math.random() * 0.25) * speedMultiplier };
  }, [speedMultiplier]);

  const start = useCallback(() => {
    KcSfx.unlock(); KcSfx.bgm(true); KcSfx.play("whoosh");
    idRef.current = 0; spawnRef.current = 0;
    setThreats([newThreat(1), newThreat(1)]); setBlasts([]); setDataDrops([]); setTyped(""); setScore(0); setCombo(0); setBestCombo(0); setCorrectAnswers(0); setAttempts(0);
    setIntegrity(3); setRemaining(roundSeconds); setCountdown(3); setMessage("เตรียมวางมือบนแป้นพิมพ์..."); setStage("countdown");
  }, [newThreat, roundSeconds]);

  useEffect(() => {
    if (stage !== "countdown") return;
    const timer = window.setTimeout(() => {
      if (countdown > 1) { setCountdown((value) => value - 1); KcSfx.play("click"); }
      else { setStage("play"); setMessage("พิมพ์คำที่กำลังตกลงมา แล้วกด Enter!"); KcSfx.play("whoosh"); focusInput(); }
    }, 850);
    return () => window.clearTimeout(timer);
  }, [countdown, focusInput, stage]);

  const finish = useCallback(() => {
    setStage("result"); setThreats([]); setTyped(""); KcSfx.play("win");
  }, []);

  useEffect(() => {
    if (stage !== "play") return;
    const interval = window.setInterval(() => {
      setRemaining((value) => { if (value <= 1) { window.setTimeout(finish, 0); return 0; } return value - 1; });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [finish, stage]);

  useEffect(() => {
    if (stage !== "play") return;
    const interval = window.setInterval(() => {
      const difficulty = (mode === "adventure" ? adventureLevel : 1) + Math.floor((roundSeconds - remaining) / 12);
      spawnRef.current += 1;
      setThreats((current) => {
        let next = current.map((threat) => ({ ...threat, y: threat.y + threat.speed }));
        const escaped = next.filter((threat) => threat.y > 101);
        if (escaped.length) {
          setIntegrity((value) => {
            const nextIntegrity = Math.max(0, value - escaped.length);
            if (nextIntegrity === 0) window.setTimeout(finish, 0);
            return nextIntegrity;
          });
          setCombo(0); setMessage("ไวรัสหลุดแนวป้องกัน! รีบพิมพ์ให้แม่นขึ้น"); KcSfx.play("wrong");
          next = next.filter((threat) => threat.y <= 101);
        }
        const spawnEvery = Math.max(24, (mode === "adventure" ? 47 : 54) - difficulty * 4);
        if (spawnRef.current % spawnEvery === 0 && next.length < 3) next = [...next, newThreat(difficulty)];
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [adventureLevel, finish, mode, newThreat, remaining, roundSeconds, stage]);

  const destroyThreat = useCallback((threat: Threat) => {
    const nextCombo = combo + 1;
    const points = 100 + Math.min(nextCombo - 1, 8) * 25;
    setThreats((current) => current.filter((item) => item.id !== threat.id));
    setScore((value) => value + points); setCombo(nextCombo); setBestCombo((value) => Math.max(value, nextCombo));
    setCorrectAnswers((value) => value + 1); setAttempts((value) => value + 1);
    setBlasts((current) => [...current, { id: threat.id, x: threat.x, y: threat.y, word: threat.word }]);
    setMessage(nextCombo >= 4 ? `COMBO x${nextCombo}! ระบบกำลังลุกเป็นไฟ` : `กำจัด ${threat.word} สำเร็จ +${points}`);
    KcSfx.play(nextCombo >= 4 ? "combo" : "correct");
    window.setTimeout(() => setBlasts((current) => current.filter((blast) => blast.id !== threat.id)), 720);
  }, [combo]);

  const submit = useCallback(() => {
    const value = typed.trim().toUpperCase();
    if (!value) return;
    const target = threats.find((threat) => threat.word === value);
    if (target) { destroyThreat(target); setTyped(""); }
    else { setAttempts((count) => count + 1); setMessage("ยังไม่พบไวรัสชื่อนี้ ลองดูคำที่กำลังตกอีกครั้ง"); setCombo(0); KcSfx.play("wrong"); }
    focusInput();
  }, [destroyThreat, focusInput, threats, typed]);

  const typeWithDataRain = useCallback((value: string) => {
    const nextValue = value.toUpperCase();
    if (nextValue.length > typed.length) {
      const glyph = nextValue.at(-1) || "01";
      const drops = Array.from({ length: 5 }, (_, index): DataDrop => {
        dropIdRef.current += 1;
        return {
          id: dropIdRef.current,
          glyph: index === 0 ? glyph : ["0", "1", "◆", "✦", "▣"][Math.floor(Math.random() * 5)],
          x: 18 + Math.random() * 64,
          drift: -34 + Math.random() * 68,
          duration: 1.05 + Math.random() * .65,
          delay: index * .035,
        };
      });
      setDataDrops((current) => [...current.slice(-25), ...drops]);
      window.setTimeout(() => {
        const ids = new Set(drops.map((drop) => drop.id));
        setDataDrops((current) => current.filter((drop) => !ids.has(drop.id)));
      }, 1900);
    }
    setTyped(nextValue);
  }, [typed.length]);

  const accuracy = useMemo(() => attempts ? Math.round((correctAnswers / attempts) * 100) : 0, [attempts, correctAnswers]);
  const wave = Math.min(5, Math.floor((roundSeconds - remaining) / 12) + 1);

  return <div ref={ref} className={`kc-game kc-computer-game ${styles.shell} ${fullscreenClassName}`} data-stage={stage} data-theme={theme} onMouseOver={hoverSfxDelegate} onClick={() => stage === "play" && focusInput()}>
    <div className={styles.gridGlow}/><div className={styles.aurora}/><div className={styles.scanline}/>
    <div className="matrixBackdrop" aria-hidden="true">{Array.from({ length: 32 }, (_, index) => <i key={index} style={{ "--matrix-x": `${1.5 + index * 3.12}%`, "--matrix-delay": `${-(index % 11) * 1.12}s`, "--matrix-speed": `${7 + (index % 7) * 1.15}s`, "--matrix-opacity": `${.15 + (index % 5) * .025}`, "--matrix-scale": `${.82 + (index % 4) * .1}` } as React.CSSProperties}>{index % 4 === 0 ? "01 CODE 10 DATA 01 CPU 101" : index % 4 === 1 ? "SYSTEM 0110 CORE 001 RAM" : index % 4 === 2 ? "101 VIRUS 001 FIREWALL 10" : "ROUTER 01 CYBER 1101 KEY"}</i>)}</div>
    <style jsx>{`
      .emoji3d{font-family:"Segoe UI Emoji","Apple Color Emoji",sans-serif;font-style:normal;filter:drop-shadow(0 4px 4px rgba(0,0,0,.42))}
      .featureEmoji{display:inline-block;margin-right:2px;font-size:15px;transform:translateY(1px)}
      .modeEmoji{display:grid!important;width:38px;height:38px;place-items:center;border:1px solid rgba(255,255,255,.22);border-radius:13px;background:linear-gradient(145deg,rgba(72,246,225,.22),rgba(93,49,196,.34));box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 7px 15px rgba(0,0,0,.3);font-size:23px!important;transition:transform .2s ease,box-shadow .2s ease}
      button:hover>.modeEmoji,button[aria-pressed="true"]>.modeEmoji{transform:translateY(-3px) rotate(-4deg) scale(1.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 10px 20px rgba(52,247,225,.25)}
      .virusEmoji{font-size:19px!important;line-height:1.1;animation:virusBob 1.4s ease-in-out infinite}
      .coreEmoji{font-size:27px!important;filter:drop-shadow(0 5px 6px rgba(0,0,0,.42)) drop-shadow(0 0 8px rgba(103,255,233,.5))}
      .keyboardEmoji{font-size:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 4px 10px rgba(0,0,0,.2)}
      .dataRain{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none}
      .dataDrop{position:absolute;top:-8%;left:var(--drop-x);color:#8effec;font-family:var(--font-fredoka),monospace;font-size:clamp(11px,1.3vw,17px);font-weight:800;text-shadow:0 0 8px #4effe5,0 0 18px rgba(62,234,255,.8);opacity:0;animation:dataFall var(--drop-duration) var(--drop-delay) cubic-bezier(.16,.64,.44,1) forwards}
      .matrixBackdrop{position:absolute;inset:64px 0 0;z-index:0;overflow:hidden;pointer-events:none;opacity:.92;mask-image:linear-gradient(to bottom,transparent 0,#000 10%,#000 82%,transparent 100%)}
      .matrixBackdrop:after{position:absolute;inset:0;content:"";background:radial-gradient(circle at 50% 45%,transparent 0 30%,rgba(5,11,29,.3) 72%,rgba(5,11,29,.62) 100%)}
      .matrixBackdrop i{position:absolute;top:-72%;left:var(--matrix-x);width:10px;color:#77ffe8;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:9px;font-style:normal;font-weight:700;line-height:1.5;letter-spacing:2px;overflow-wrap:anywhere;text-align:center;text-shadow:0 0 7px rgba(83,255,219,.9),0 0 16px rgba(48,210,255,.38);opacity:var(--matrix-opacity);transform:scale(var(--matrix-scale));animation:matrixFall var(--matrix-speed) var(--matrix-delay) linear infinite}
      @keyframes virusBob{50%{transform:translateY(-2px) rotate(7deg) scale(1.08)}}
      @keyframes dataFall{0%{opacity:0;transform:translate3d(0,-10px,0) scale(1.35) rotate(0)}15%{opacity:.95}70%{opacity:.72}100%{opacity:0;transform:translate3d(var(--drop-drift),72vh,0) scale(.45) rotate(220deg)}}
      @keyframes matrixFall{to{transform:translateY(570%) scale(var(--matrix-scale))}}
      @media(min-width:768px){
        .${styles.brand} b{font-size:19px}.${styles.brand} small{font-size:11px}
        .${styles.hubMenu}{height:42px;padding:0 14px}.${styles.hubMenu} b{font-size:14px}.${styles.iconButton}{width:42px;height:42px;font-size:20px}
        .${styles.features} span{padding:7px 13px!important;font-size:13px!important}.featureEmoji{font-size:18px}
        .${styles.startButton}{min-width:280px!important;min-height:50px;padding:12px 19px 12px 25px!important;font-size:19px!important}.${styles.startButton} b{width:30px;height:30px;font-size:20px}
        .${styles.modePicker} button{min-width:245px!important;min-height:78px;padding:13px 17px!important}.${styles.modePicker} button b{font-size:17px!important}.${styles.modePicker} button small{font-size:13px!important}.modeEmoji{width:46px;height:46px;font-size:27px!important}
        .${styles.speedPicker} button,.${styles.stagePill}{padding:8px 15px!important;font-size:14px!important}
        .${styles.hud}{grid-template-columns:130px 126px 1fr 165px;gap:10px}.${styles.hud}>div{min-height:57px;padding:8px 12px}.${styles.hud} small{font-size:10px}.${styles.hud} b{font-size:20px}
        .${styles.message}{top:12px;font-size:13px}.${styles.threat}{min-width:94px;padding:7px 10px;border-radius:12px}.${styles.threat} b{font-size:clamp(15px,1.65vw,21px)}.${styles.threat} small{font-size:10px}.virusEmoji{font-size:23px!important}
        .${styles.base}{width:150px;height:84px}.${styles.base} b{font-size:13px}.${styles.base} small{font-size:9px}.coreEmoji{font-size:32px!important}
        .${styles.commandBar}{padding:9px 11px}.${styles.commandBar}>span{width:39px;height:39px}.keyboardEmoji{font-size:22px}.${styles.commandBar} input{font-size:19px}.${styles.commandBar} input::placeholder{font-size:14px}.${styles.commandBar} button{min-width:90px;padding:11px 14px;font-size:14px}
        .${styles.resultStats} div{min-width:125px;padding:12px}.${styles.resultStats} span{font-size:11px}.${styles.resultStats} b{font-size:20px}
      }
      @media(max-width:767px){
        .modeEmoji{width:35px;height:35px;border-radius:11px;font-size:21px!important}.featureEmoji{font-size:14px}.virusEmoji{font-size:18px!important}.coreEmoji{font-size:25px!important}.matrixBackdrop{inset:54px 0 0;opacity:.7}.matrixBackdrop i:nth-child(3n){display:none}
        .${styles.brand} b{font-size:15px}.${styles.brand} small{font-size:9px}.${styles.iconButton}{font-size:19px}
        .${styles.features} span{padding:5px 7px!important;font-size:9px!important}
        .${styles.startButton}{min-width:225px;min-height:45px;padding:10px 15px 10px 19px;font-size:16px}.${styles.startButton} b{width:27px;height:27px;font-size:18px}
        .${styles.modePicker} button{min-width:118px;min-height:55px;padding:6px}.${styles.modePicker} button b{font-size:12px}.${styles.modePicker} button small{font-size:9px}
        .${styles.speedPicker} button,.${styles.stagePill}{padding:5px 9px;font-size:10px}
        .${styles.hud}>div{min-height:44px;padding:5px 8px}.${styles.hud} small{font-size:9px}.${styles.hud} b{font-size:15px}
        .${styles.message}{font-size:9px}.${styles.threat}{min-width:68px;padding:5px 6px}.${styles.threat} b{font-size:12px}.${styles.threat} small{font-size:7px}
        .${styles.base} b{font-size:11px}.${styles.base} small{font-size:8px}
        .${styles.commandBar}>span{width:32px;height:32px}.keyboardEmoji{font-size:19px}.${styles.commandBar} input{font-size:15px}.${styles.commandBar} input::placeholder{font-size:11px}.${styles.commandBar} button{min-width:58px;padding:9px;font-size:12px}
        .${styles.resultStats} div{min-width:88px;padding:8px 5px}.${styles.resultStats} span{font-size:8px}.${styles.resultStats} b{font-size:15px}
      }
      @media(prefers-reduced-motion:reduce){.virusEmoji{animation:none}.dataDrop{animation-duration:.01ms}.matrixBackdrop i{animation:none;transform:translateY(55%)}}
    `}</style>
    <header className={styles.topbar}>
      <div className={styles.brand}><Image src="/assets/khuncool-logo.webp" alt="khuncool" width={38} height={38}/><span><b className="kc-title">Virus Defense</b><small>พิมพ์ดีดปราบไวรัส</small></span></div>
      <div className={styles.controls}>
        <Link href="/media/computer" className={`${styles.hubMenu} kc-game-menu`} aria-label="กลับหน้าสื่อคอมพิวเตอร์"><span>☰</span><b>เมนู</b></Link>
        {!(["home", "select", "levelIntro"] as Stage[]).includes(stage) && <button type="button" className={`${styles.hubMenu} kc-game-menu`} onClick={start} aria-label="เริ่มเกมใหม่"><span>↻</span><b>เริ่มใหม่</b></button>}
        <button className={styles.iconButton} type="button" onClick={() => { const next = !muted; setMuted(next); KcSfx.setMuted(next); KcSfx.bgm(!next); if (!next) KcSfx.play("click"); }} aria-label={muted ? "เปิดเสียงและเพลง" : "ปิดเสียงและเพลง"}>{muted ? "🔇" : "🔊"}</button>
        <button className={`${styles.iconButton} ${isFull ? styles.activeButton : ""}`} type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
      </div>
    </header>

    {stage === "home" && <section className={styles.home}>
      <div className={styles.radar}><span className={styles.core} aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><rect x="15" y="18" width="34" height="28" rx="6" stroke="currentColor" strokeWidth="3"/><path d="M22 28h20M22 35h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="m39 33 4 3-4 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M26 12v6m12-6v6M26 46v6m12-6v6M9 26h6m-6 12h6m34-12h6m-6 12h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></span><i/><i/><i/>{["MALWARE", "CPU", "FIREWALL", "RAM"].map((word, index) => <b key={word} className={styles[`signal${index + 1}`]}>{word}</b>)}</div>
      <div className={styles.badge}>CYBER TYPING MISSION</div><h2>พิมพ์ให้แม่น<br/>ก่อน <em>ไวรัส</em> ถึงฐานข้อมูล!</h2>
      <p>พิมพ์คำศัพท์คอมพิวเตอร์ภาษาอังกฤษที่กำลังตกลงมา แล้วกด <b>Enter</b> เพื่อทำลายไวรัส สะสมคะแนนและคอมโบให้สูงที่สุด</p>
      <div className={styles.features}><span><i className="emoji3d featureEmoji" aria-hidden="true">⚡</i> 12 คำศัพท์</span><span><i className="emoji3d featureEmoji" aria-hidden="true">🛡️</i> 3 พลังป้องกัน</span><span><i className="emoji3d featureEmoji" aria-hidden="true">🔥</i> คอมโบคะแนน</span></div>
      <button className={styles.startButton} type="button" onClick={() => setStage("select")}><span>เริ่มฝึกพิมพ์</span><b aria-hidden="true">🚀</b></button><small className={styles.homeTip}>เลือกโหมดและความเร็วในขั้นตอนถัดไป</small>
    </section>}

    {stage === "select" && <section className={`${styles.home} ${styles.modeSelect}`}>
      <div className={styles.badge}>STEP 2 · เลือกภารกิจ</div><h2>วันนี้อยากเล่น<br/><em>แบบไหน?</em></h2><p>เริ่มฝึกแบบค่อยเป็นค่อยไป หรือออกเดินทางตะลุยด่านเพื่อเปลี่ยนธีมและความท้าทาย</p>
      <div className={styles.modePicker} aria-label="เลือกโหมดเกม"><button type="button" aria-pressed={mode === "training"} className={mode === "training" ? styles.selectedMode : ""} onClick={() => { setMode("training"); setAdventureLevel(1); }}><span className="emoji3d modeEmoji" aria-hidden="true">⌨️</span><b>โหมดฝึกพิมพ์</b><small>เลือกความเร็วเอง</small></button><button type="button" aria-pressed={mode === "adventure"} className={mode === "adventure" ? styles.selectedMode : ""} onClick={() => setMode("adventure")}><span className="emoji3d modeEmoji" aria-hidden="true">🚀</span><b>โหมดตะลุยด่าน</b><small>ธีมเปลี่ยนทุกด่าน</small></button></div>
      {mode === "training" ? <div className={styles.speedPicker}>{(["slow", "normal", "fast"] as Speed[]).map((item) => <button key={item} type="button" className={speed === item ? styles.selectedSpeed : ""} onClick={() => setSpeed(item)}>{item === "slow" ? "🐢" : item === "normal" ? "⚡" : "🚀"} {SPEED_LABEL[item]}</button>)}</div> : <div className={styles.stagePill}>ZONE {adventureLevel} · {ADVENTURE_SECONDS} วินาที · ความเร็วจะเพิ่มตามด่าน</div>}
      <button className={styles.startButton} type="button" onClick={start}><span>{mode === "training" ? `เริ่มฝึก · ${SPEED_LABEL[speed]}` : `เริ่มด่าน ${adventureLevel}`}</span><b aria-hidden="true">🚀</b></button><button type="button" className={styles.backButton} onClick={() => setStage("home")}>← กลับหน้าแรก</button>
    </section>}

    {stage === "levelIntro" && <section className={`${styles.home} ${styles.levelIntro}`}>
      <div className={styles.zoneOrb}><span>{adventureLevel}</span><i/><i/></div><div className={styles.badge}>NEXT MISSION · ZONE {adventureLevel}/{MAX_ADVENTURE_LEVEL}</div>
      <h2>เข้าสู่ <em>{ZONE_NAMES[adventureLevel - 1]}</em></h2><p>ระบบป้องกันกำลังย้ายไปยังพื้นที่ใหม่ เตรียมรับมือไวรัสที่เร็วขึ้นและปกป้อง DATA CORE ให้ครบ {ADVENTURE_SECONDS} วินาที</p>
      <div className={styles.zoneStats}><span>⚡ ระดับ {adventureLevel}</span><span>🎨 ธีมใหม่</span><span>🛡️ พลังป้องกัน 3</span></div>
      <button className={styles.startButton} type="button" onClick={start}><span>เริ่มด่าน {adventureLevel}</span><b aria-hidden="true">🚀</b></button><button type="button" className={styles.backButton} onClick={() => setStage("select")}>← กลับเลือกโหมด</button>
    </section>}

    {(stage === "countdown" || stage === "play") && <section className={styles.play}>
      <div className={styles.hud}>
        <div><small>SCORE</small><b>{score.toString().padStart(4, "0")}</b></div><div><small>COMBO</small><b className={combo >= 4 ? styles.hot : ""}>🔥 {combo}</b></div>
        <div className={styles.timer}><small>{mode === "adventure" ? `ZONE ${adventureLevel} · WAVE ${wave}` : `TRAINING · WAVE ${wave}`}</small><b>{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</b><i><span style={{ width: `${(remaining / roundSeconds) * 100}%` }}/></i></div>
        <div className={styles.integrity}><small>BASE INTEGRITY</small><b>{Array.from({ length: 3 }, (_, index) => <span key={index} className={index < integrity ? styles.shieldOn : styles.shieldOff}>⬡</span>)}</b></div>
      </div>
      <div className={styles.arena}>
        <div className={styles.message}>{message}</div>
        {stage === "countdown" && <div className={styles.countdown} aria-live="assertive"><small>เตรียมตัวให้พร้อม</small><b key={countdown}>{countdown}</b><span>วางมือบนแป้นพิมพ์</span></div>}
        {stage === "play" && threats.map((threat) => <div key={threat.id} className={`${styles.threat} ${typed.trim().toUpperCase() === threat.word ? styles.targeted : ""}`} style={{ left: `${threat.x}%`, top: `${threat.y}%` }}><span className="emoji3d virusEmoji" aria-hidden="true">🦠</span><b>{threat.word}</b><small>{threat.hint}</small></div>)}
        <div className="dataRain" aria-hidden="true">{dataDrops.map((drop) => <i key={drop.id} className="dataDrop" style={{ "--drop-x": `${drop.x}%`, "--drop-drift": `${drop.drift}px`, "--drop-duration": `${drop.duration}s`, "--drop-delay": `${drop.delay}s` } as React.CSSProperties}>{drop.glyph}</i>)}</div>
        {blasts.map((blast) => <div key={blast.id} className={styles.blast} style={{ left: `${blast.x}%`, top: `${blast.y}%` }}><b>{blast.word}</b>{Array.from({ length: 10 }, (_, index) => <i key={index} style={{ "--angle": `${index * 36}deg`, "--delay": `${index % 3 * 0.03}s` } as React.CSSProperties}/>)}</div>)}
        <div className={styles.base}><span className="emoji3d coreEmoji" aria-hidden="true">🔐</span><b>DATA CORE</b><small>PROTECTED</small></div>
      </div>
      <form className={styles.commandBar} onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <span className="emoji3d keyboardEmoji" aria-hidden="true">⌨️</span><input ref={inputRef} value={typed} onChange={(event) => typeWithDataRain(event.target.value)} autoCapitalize="characters" autoComplete="off" spellCheck={false} disabled={stage === "countdown"} placeholder={stage === "countdown" ? "กำลังเตรียมเริ่มภารกิจ..." : "พิมพ์คำศัพท์ที่เห็น..."} aria-label="พิมพ์คำศัพท์ไวรัส" /><button type="submit" disabled={stage === "countdown"}>กำจัด <b>↵</b></button>
      </form>
    </section>}

    {stage === "result" && <section className={styles.result}>
      <div className={styles.resultAura}/><div className={styles.trophy}>{integrity > 0 ? "🏆" : "🛡️"}</div><div className={styles.badge}>{integrity > 0 ? "MISSION COMPLETE" : "SYSTEM RECOVERY"}</div>
      <h2>{integrity > 0 ? (mode === "adventure" ? (adventureLevel === MAX_ADVENTURE_LEVEL ? "พิชิตทุก ZONE แล้ว!" : `ผ่าน ZONE ${adventureLevel}!`) : "ฐานข้อมูลปลอดภัย!") : "ลองภารกิจอีกครั้งนะ!"}</h2><p>คุณกำจัดไวรัสได้ <b>{score.toLocaleString()} คะแนน</b> ในเวลา {roundSeconds} วินาที</p>
      <div className={styles.resultStats}><div><span>คะแนนรวม</span><b>{score.toLocaleString()}</b></div><div><span>คอมโบสูงสุด</span><b>🔥 {bestCombo}</b></div><div><span>ความแม่นยำ</span><b>{accuracy}%</b></div></div>
      <button className={styles.startButton} type="button" onClick={() => { if (mode === "adventure" && integrity > 0 && adventureLevel < MAX_ADVENTURE_LEVEL) { setAdventureLevel((value) => value + 1); setStage("levelIntro"); } else if (mode === "adventure" && integrity > 0) { setAdventureLevel(1); setStage("select"); } else start(); }}><span>{mode === "adventure" && integrity > 0 ? (adventureLevel < MAX_ADVENTURE_LEVEL ? "ไปด่านต่อไป" : "เริ่มภารกิจใหม่") : "เล่นอีกครั้ง"}</span><b aria-hidden="true">{mode === "adventure" && integrity > 0 ? "🚀" : "↻"}</b></button>
    </section>}
  </div>;
}
