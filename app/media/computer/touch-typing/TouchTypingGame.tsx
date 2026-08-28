"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStage } from "../../_stage/useStage";
import Keyboard2D from "./Keyboard2D";
import { FINGER_COLORS, FINGER_NAMES, LABELS, type Finger } from "./keyboardLayout";
import { LESSONS } from "./lessons";
import { useTypingSession, type LastPress, type PressState } from "./useTypingSession";
import styles from "./TouchTypingGame.module.css";

const Keyboard3D = dynamic(() => import("./Keyboard3D"), { ssr: false, loading: () => <div className={styles.rendererLoading}>กำลังเตรียมคีย์บอร์ด 3D…</div> });

type Scene = "home" | "lesson" | "play" | "result" | "showcase";
type RendererMode = "2d" | "3d";
type Progress = Record<string, { accuracy: number; wpm: number }>;

const PROGRESS_KEY = "khuncool.touchTyping.progress.v1";
const RENDERER_KEY = "khuncool.touchTyping.renderer.v1";
const SOUND_KEY = "khuncool.touchTyping.sound.v1";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function beep(state: PressState, enabled: boolean) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = state === "correct" ? "sine" : "square";
    oscillator.frequency.value = state === "correct" ? 620 : 180;
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.08);
    oscillator.addEventListener("ended", () => void context.close());
  } catch {
    // Audio is optional; browsers may reject it until after a gesture.
  }
}

export default function TouchTypingGame() {
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<Scene>("home");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [shape, setShape] = useState<"wide" | "portrait" | "short">("wide");
  const [webgl, setWebgl] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [rendererOverride, setRendererOverride] = useState<RendererMode | null>(null);
  const [sound, setSound] = useState(true);
  const [focused, setFocused] = useState(false);
  const [progress, setProgress] = useState<Progress>({});
  const [showcasePress, setShowcasePress] = useState<LastPress | null>(null);
  const [announcement, setAnnouncement] = useState("เลือกโหมดเพื่อเริ่มเรียนรู้");

  const lesson = LESSONS[lessonIndex];
  const target = lesson.drills[0];
  const finishLesson = useCallback(() => {
    setScene("result");
    setAnnouncement("จบบทเรียนแล้ว ดูผลการฝึกของคุณได้เลย");
  }, []);
  const session = useTypingSession(target, scene === "play", finishLesson, attempt);
  const startPlay = (nextLesson = lessonIndex) => {
    setLessonIndex(nextLesson);
    setAttempt((value) => value + 1);
    setScene("play");
  };

  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      setWebgl(supportsWebGL());
      try {
        const saved = localStorage.getItem(RENDERER_KEY);
        if (saved === "2d" || saved === "3d") setRendererOverride(saved);
        setProgress(JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}") as Progress);
        setSound(localStorage.getItem(SOUND_KEY) !== "off");
      } catch {
        // Private browsing may deny storage; the game remains usable.
      }
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const measure = () => {
      const rect = body.getBoundingClientRect();
      setShape(rect.width / Math.max(rect.height, 1) < 0.9 ? "portrait" : rect.height < 480 ? "short" : "wide");
      setReducedMotion(getComputedStyle(body).getPropertyValue("--kc-reduced").trim() === "1");
    };
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    measure();
    return () => observer.disconnect();
  }, []);

  const auto3d = webgl && !reducedMotion && shape === "wide";
  const rendererMode: RendererMode = rendererOverride === "3d" && !webgl ? "2d" : rendererOverride ?? (auto3d ? "3d" : "2d");

  const changeRenderer = () => {
    const next: RendererMode = rendererMode === "3d" ? "2d" : "3d";
    if (next === "3d" && !webgl) return;
    setRendererOverride(next);
    try { localStorage.setItem(RENDERER_KEY, next); } catch {}
    setAnnouncement(`เปลี่ยนเป็นคีย์บอร์ด ${next.toUpperCase()} แล้ว`);
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try { localStorage.setItem(SOUND_KEY, next ? "on" : "off"); } catch {}
  };

  useEffect(() => {
    if (!session.lastPress) return;
    beep(session.lastPress.state, sound);
  }, [session.lastPress, sound]);

  useEffect(() => {
    if (scene !== "result") return;
    const save = window.setTimeout(() => setProgress((old) => {
        const current = old[lesson.id];
        const accuracy = Math.max(current?.accuracy ?? 0, session.stats.accuracy);
        const wpm = Math.max(current?.wpm ?? 0, session.stats.wpm);
        if (current?.accuracy === accuracy && current?.wpm === wpm) return old;
        const next = { ...old, [lesson.id]: { accuracy, wpm } };
        try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch {}
        return next;
      }), 0);
    return () => window.clearTimeout(save);
  }, [lesson.id, scene, session.stats.accuracy, session.stats.wpm]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const onKey = (event: KeyboardEvent) => {
      if (scene === "play") {
        const handled = session.handleKeyDown(event);
        if (handled) setFocused(true);
        return;
      }
      if (scene === "showcase" && !event.repeat && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const known = LABELS[event.code] || ["Space", "ShiftLeft", "ShiftRight", "Enter", "Backspace", "Tab"].includes(event.code);
        if (!known) return;
        event.preventDefault();
        const next = { code: event.code, state: "correct" as const, nonce: performance.now() };
        setShowcasePress(next);
        setAnnouncement(`กดปุ่ม ${LABELS[event.code]?.base ?? event.code}`);
        beep("correct", sound);
      }
    };
    body.addEventListener("keydown", onKey);
    return () => body.removeEventListener("keydown", onKey);
  }, [scene, session, sound]);

  useEffect(() => {
    if (scene === "play" || scene === "showcase") {
      bodyRef.current?.focus();
    }
  }, [scene]);

  const renderKeyboard = (interactive = false) => rendererMode === "3d" ? (
    <Keyboard3D hintCode={scene === "play" ? session.hintCode : null} lastPress={scene === "play" ? session.lastPress : showcasePress} onContextLost={() => {
      setRendererOverride("2d");
      setAnnouncement("อุปกรณ์หยุดแสดงผล 3D จึงเปลี่ยนเป็น 2D อัตโนมัติ");
    }} />
  ) : (
    <Keyboard2D
      hintCode={scene === "play" ? session.hintCode : null}
      hintShift={scene === "play" ? session.hintShift : false}
      lastPress={scene === "play" ? session.lastPress : showcasePress}
      interactive={interactive}
      onPress={(code) => {
        const next = { code, state: "correct" as const, nonce: performance.now() };
        setShowcasePress(next);
        setAnnouncement(`แตะปุ่ม ${LABELS[code]?.base ?? code}`);
        beep("correct", sound);
      }}
    />
  );

  const toolbar = (back: () => void) => (
    <div className={styles.toolbar}>
      <button className="kc-tap-chrome" type="button" onClick={back} aria-label="ย้อนกลับ">←</button>
      <strong>{scene === "showcase" ? "โหมดสอนหน้าชั้น" : lesson.title}</strong>
      <span className={styles.toolbarSpacer} />
      <button className="kc-tap-chrome" type="button" onClick={changeRenderer} disabled={!webgl && rendererMode === "2d"} aria-label={`เปลี่ยนเป็น ${rendererMode === "3d" ? "2D" : "3D"}`}>{rendererMode.toUpperCase()}</button>
      <button className="kc-tap-chrome" type="button" onClick={toggleSound} aria-label={sound ? "ปิดเสียง" : "เปิดเสียง"}>{sound ? "🔊" : "🔇"}</button>
      <button className="kc-tap-chrome" type="button" onClick={() => void toggle()} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>{isFull ? "↙" : "⛶"}</button>
    </div>
  );

  return (
    <div {...stageProps} className="kc-stage">
      <div ref={bodyRef} className={`kc-stage-body ${styles.game}`} tabIndex={0} onFocus={() => setFocused(true)} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}>
        <div className={styles.decorOne} aria-hidden="true" />
        <div className={styles.decorTwo} aria-hidden="true" />
        <div className={styles.live} role="status" aria-live="polite">{session.lastPress ? (session.lastPress.state === "correct" ? "ถูกต้อง" : "ยังไม่ถูก ลองดูปุ่มที่มีกรอบสว่าง") : announcement}</div>

        {scene === "home" && (
          <section className={styles.home} data-stage="home">
            <div className={styles.homeCopy}>
              <span className={styles.eyebrow}>TOUCH TYPING · ภาษาไทย</span>
              <h2>วางนิ้วให้ถูก แล้วพิมพ์อย่างมั่นใจ</h2>
              <p>เรียนรู้ตำแหน่งแป้นไทยเกษมณีทีละกลุ่ม พร้อมสีประจำทั้ง 8 นิ้ว</p>
              <div className={styles.homeActions}>
                <button className={`${styles.primaryButton} kc-tap`} type="button" onClick={() => setScene("lesson")}>เริ่มฝึกวางนิ้ว</button>
                <button className={`${styles.secondaryButton} kc-tap`} type="button" onClick={() => setScene("showcase")}>สอนหน้าชั้น</button>
              </div>
            </div>
            <div className={styles.homeKeyboard}>{renderKeyboard(false)}</div>
            <button className={`${styles.fullscreenHome} kc-tap-chrome`} type="button" onClick={() => void toggle()} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
          </section>
        )}

        {scene === "lesson" && (
          <section className={styles.lessonScreen} data-stage="lesson">
            {toolbar(() => setScene("home"))}
            <div className={styles.lessonHeader}><div><span className={styles.eyebrow}>เลือกบทเรียน</span><h2>ค่อย ๆ เพิ่มปุ่มทีละกลุ่ม</h2></div><p>ผ่านเมื่อแม่นยำอย่างน้อย 90%</p></div>
            <div className={styles.lessonGrid}>
              {LESSONS.map((item, index) => {
                const saved = progress[item.id];
                return <button className={`${styles.lessonCard} ${index === lessonIndex ? styles.lessonSelected : ""} kc-tap`} type="button" key={item.id} onClick={() => setLessonIndex(index)}>
                  <span>{item.title}</span><small>{item.description}</small><em>{saved ? `ดีที่สุด ${saved.accuracy}% · ${saved.wpm} WPM` : "ยังไม่ได้ฝึก"}</em>
                </button>;
              })}
            </div>
            <div className={styles.lessonFooter}><div><strong>{lesson.title}</strong><span>{lesson.description}</span></div><button className={`${styles.primaryButton} kc-tap`} type="button" onClick={() => startPlay()}>เริ่มบทนี้ →</button></div>
          </section>
        )}

        {scene === "play" && (
          <section className={styles.playScreen} data-stage="play">
            {toolbar(() => setScene("lesson"))}
            <div className={styles.practiceTop}>
              <div className={styles.metrics}><span>ความแม่นยำ <b>{session.stats.accuracy}%</b></span><span>ความเร็ว <b>{session.stats.wpm} WPM</b></span><span>เวลา <b>{Math.round(session.stats.elapsed)} วิ</b></span></div>
              <div className={styles.targetText} aria-label={`ข้อความฝึก ${target}`}>
                {session.chars.map((character, index) => <span key={`${index}-${character}`} className={index < session.cursor ? styles.typed : index === session.cursor ? styles.current : ""}>{character === " " ? "\u00a0" : character}</span>)}
              </div>
              {session.hintShift && <p className={styles.shiftHint}>กด Shift ค้างด้วยนิ้วก้อยอีกข้าง</p>}
            </div>
            <div className={styles.playKeyboard}>{renderKeyboard(false)}</div>
            {!focused && <button type="button" className={styles.focusOverlay} onClick={() => bodyRef.current?.focus()}>คลิกเพื่อเริ่มพิมพ์</button>}
          </section>
        )}

        {scene === "result" && (
          <section className={styles.resultScreen} data-stage="result">
            <button className={`${styles.fullscreenHome} kc-tap-chrome`} type="button" onClick={() => void toggle()} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>{isFull ? "↙" : "⛶"}</button>
            <div className={styles.resultCard}>
              <span className={styles.resultIcon}>{session.stats.accuracy >= lesson.passAccuracy ? "🏅" : "🌱"}</span>
              <span className={styles.eyebrow}>ผลการฝึก</span>
              <h2>{session.stats.accuracy >= lesson.passAccuracy ? "ผ่านบทเรียนแล้ว!" : "เกือบแล้ว ลองอีกครั้งนะ"}</h2>
              <div className={styles.resultStats}><div><b>{session.stats.accuracy}%</b><span>ความแม่นยำ</span></div><div><b>{session.stats.wpm}</b><span>WPM</span></div><div><b>{Math.round(session.stats.elapsed)}</b><span>วินาที</span></div></div>
              <div className={styles.resultActions}><button className={`${styles.secondaryButton} kc-tap`} type="button" onClick={() => setScene("lesson")}>เลือกบท</button><button className={`${styles.primaryButton} kc-tap`} type="button" onClick={() => startPlay()}>ลองอีกครั้ง</button>{lessonIndex < LESSONS.length - 1 && <button className={`${styles.primaryButton} kc-tap`} type="button" onClick={() => startPlay(lessonIndex + 1)}>บทถัดไป →</button>}</div>
            </div>
          </section>
        )}

        {scene === "showcase" && (
          <section className={styles.showcaseScreen} data-stage="showcase">
            {toolbar(() => setScene("home"))}
            <div className={styles.showcaseTitle}><div><span className={styles.eyebrow}>โหมดดูและสาธิต</span><h2>แต่ละนิ้วดูแลปุ่มไหนบ้าง?</h2></div><p>กดคีย์บอร์ดจริง หรือแตะปุ่มเมื่อใช้มุมมอง 2D</p></div>
            <div className={styles.showcaseKeyboard}>{renderKeyboard(true)}</div>
            <div className={styles.legend}>{(Object.keys(FINGER_NAMES) as Finger[]).map((finger) => <span key={finger}><i style={{ background: FINGER_COLORS[finger] }} />{FINGER_NAMES[finger]}</span>)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
