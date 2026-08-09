"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFullscreen } from "../../english/useFullscreen";
import styles from "./MotionLab.module.css";

type Stage = "intro" | "lab" | "quiz";
type RouteKey = "direct" | "return" | "cross";

const ROUTES = {
  direct: { name: "ทางตรง", icon: "➡️", points: [-6, 6], note: "เคลื่อนจาก A ไป B โดยไม่ย้อนกลับ" },
  return: { name: "ไปแล้วกลับ", icon: "↩️", points: [-6, 5, -2], note: "ผ่าน B แล้วกลับมาหยุดก่อนถึงจุดเริ่ม" },
  cross: { name: "ข้ามจุดเริ่ม", icon: "🔁", points: [3, -6, 5], note: "เริ่มด้านขวา ย้อนผ่านศูนย์ แล้วไปจบอีกด้าน" },
} satisfies Record<RouteKey, { name: string; icon: string; points: number[]; note: string }>;

type QuizQuestion = { q: string; choices: string[]; answer: number; explain: string };

function rotateAnswer(question: QuizQuestion, offset: number): QuizQuestion {
  const choices = question.choices.map((_, index) => question.choices[(index + offset) % question.choices.length]);
  return { ...question, choices, answer: (question.answer - offset + question.choices.length) % question.choices.length };
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function uniqueNumbers(values: number[]): number[] {
  const seen = new Set<number>();
  return values.map(value => {
    let candidate = value;
    while (seen.has(candidate)) candidate += 0.5;
    seen.add(candidate);
    return candidate;
  });
}

function positionAlongRoute(points: number[], progressFraction: number): number {
  const segs = points.slice(1).map((point, i) => Math.abs(point - points[i]));
  const totalUnits = segs.reduce((sum, value) => sum + value, 0);
  let remaining = progressFraction * totalUnits;
  for (let i = 0; i < segs.length; i++) {
    if (remaining <= segs[i]) {
      const ratio = segs[i] === 0 ? 0 : remaining / segs[i];
      return points[i] + (points[i + 1] - points[i]) * ratio;
    }
    remaining -= segs[i];
  }
  return points.at(-1)!;
}

const QUIZ_LENGTH = 4;

function pickRandomIndices(poolSize: number, count: number): number[] {
  const indices = Array.from({ length: poolSize }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
}

export default function MotionLab() {
  const { ref, isFull, fullscreenClassName, toggle } = useFullscreen<HTMLDivElement>();
  const [stage, setStage] = useState<Stage>("intro");
  const [routeKey, setRouteKey] = useState<RouteKey>("return");
  const [speed, setSpeed] = useState(20);
  const speedRef = useRef(20);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOrder, setQuizOrder] = useState<number[]>([0, 1, 2, 3]);
  const [picked, setPicked] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const route = ROUTES[routeKey];

  const segments = useMemo(() => route.points.slice(1).map((point, i) => Math.abs(point - route.points[i]) * 10), [route]);
  const distance = segments.reduce((sum, value) => sum + value, 0);
  const displacement = (route.points.at(-1)! - route.points[0]) * 10;
  const duration = distance / speed;
  const tone = useCallback((frequency: number, length = 0.12) => {
    if (muted || typeof window === "undefined") return;
    try {
      const context = audioCtxRef.current ?? (audioCtxRef.current = new window.AudioContext());
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.06, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + length);
    } catch {
      // Sound support must never block the motion experiment.
    }
  }, [muted]);
  const questionPool = useMemo<QuizQuestion[]>(() => {
    const direction = displacement >= 0 ? "ทางขวา" : "ทางซ้าย";
    const oppositeDirection = displacement >= 0 ? "ทางซ้าย" : "ทางขวา";
    const displacementSize = Math.abs(displacement);
    const averageVelocity = displacement / duration;
    const seed = (speed / 5 + route.points.length) % 4;
    const halfwayPosition = positionAlongRoute(route.points, 0.5) * 10;
    const sameMagnitude = displacementSize === distance;
    const doubledSpeed = speed * 2;
    const halvedDuration = duration / 2;

    return [
      rotateAnswer({
        q: `จากการทดลอง “${route.name}” รถเคลื่อนที่เป็นระยะทางทั้งหมดเท่าใด?`,
        choices: [`${distance} เมตร`, `${distance - 20} เมตร`, `${distance + 20} เมตร`, `${distance + 40} เมตร`],
        answer: 0,
        explain: `รวมระยะทางทุกช่วงของเส้นทาง ได้ ${distance} เมตร`,
      }, seed),
      rotateAnswer({
        q: `รถเริ่มที่ ${route.points[0] * 10} เมตร และหยุดที่ ${route.points.at(-1)! * 10} เมตร การกระจัดเป็นเท่าใด?`,
        choices: [`${displacementSize} เมตร ${direction}`, `${displacementSize} เมตร ${oppositeDirection}`, `${Math.max(10, displacementSize / 2)} เมตร ${direction}`, "0 เมตร"],
        answer: 0,
        explain: `ตำแหน่งสุดท้ายลบตำแหน่งเริ่มต้นเท่ากับ ${displacement} เมตร จึงมีการกระจัด ${displacementSize} เมตร ${direction}`,
      }, (seed + 1) % 4),
      rotateAnswer({
        q: `ถ้ารถวิ่งด้วยอัตราเร็ว ${speed} m/s ตลอดระยะทาง ${distance} เมตร จะใช้เวลากี่วินาที?`,
        choices: uniqueNumbers([duration, duration + 1, duration * 2, duration / 2]).map(value => `${formatNumber(value)} วินาที`),
        answer: 0,
        explain: `เวลา = ระยะทาง ÷ อัตราเร็ว = ${distance} ÷ ${speed} = ${formatNumber(duration)} วินาที`,
      }, (seed + 2) % 4),
      rotateAnswer({
        q: `จากผลการทดลอง ความเร็วเฉลี่ยของรถมีค่าเท่าใด?`,
        choices: [`${formatNumber(Math.abs(averageVelocity))} m/s ${direction}`, `${speed} m/s ${oppositeDirection}`, `${formatNumber(duration)} m/s ${direction}`, `${distance} m/s ${oppositeDirection}`],
        answer: 0,
        explain: `ความเร็วเฉลี่ย = การกระจัด ÷ เวลา = ${displacement} ÷ ${formatNumber(duration)} จึงได้ ${formatNumber(Math.abs(averageVelocity))} m/s ${direction}`,
      }, (seed + 3) % 4),
      rotateAnswer({
        q: `เมื่อเวลาผ่านไปครึ่งหนึ่งของเวลาทั้งหมด รถน่าจะอยู่ที่ตำแหน่งใด (โดยประมาณ)?`,
        choices: uniqueNumbers([halfwayPosition, halfwayPosition + 20, halfwayPosition - 20, route.points[0] * 10]).map(value => `${formatNumber(value)} เมตร`),
        answer: 0,
        explain: `เมื่อเวลาผ่านไปครึ่งหนึ่ง รถเคลื่อนที่ไปแล้วครึ่งหนึ่งของระยะทางรวม จึงอยู่ที่ตำแหน่งประมาณ ${formatNumber(halfwayPosition)} เมตร`,
      }, seed),
      {
        q: "ข้อใดอธิบายความสัมพันธ์ระหว่างระยะทางกับการกระจัดจากการทดลองนี้ได้ถูกต้อง?",
        choices: sameMagnitude
          ? ["ระยะทางเท่ากับขนาดการกระจัด เพราะรถเคลื่อนที่ไปทิศทางเดียวตลอด", "ระยะทางมากกว่าขนาดการกระจัด เพราะรถเคลื่อนที่ย้อนทิศบางช่วง", "ระยะทางน้อยกว่าขนาดการกระจัดเสมอ", "ระยะทางกับการกระจัดไม่เกี่ยวข้องกัน"]
          : ["ระยะทางมากกว่าขนาดการกระจัด เพราะรถเคลื่อนที่ย้อนทิศบางช่วง", "ระยะทางเท่ากับขนาดการกระจัด เพราะรถเคลื่อนที่ไปทิศทางเดียวตลอด", "ระยะทางน้อยกว่าขนาดการกระจัดเสมอ", "ระยะทางกับการกระจัดไม่เกี่ยวข้องกัน"],
        answer: 0,
        explain: sameMagnitude
          ? "เส้นทางนี้ไม่มีการย้อนทิศ ระยะทางจึงเท่ากับขนาดของการกระจัดพอดี"
          : "เส้นทางนี้มีการย้อนทิศ ระยะทางรวมทุกช่วงจึงมากกว่าขนาดการกระจัดที่วัดตรงจากจุดเริ่มถึงจุดสุดท้าย",
      },
      rotateAnswer({
        q: `ถ้าเพิ่มอัตราเร็วเป็น ${doubledSpeed} m/s (2 เท่าของเดิม) โดยระยะทางเท่าเดิม เวลาที่ใช้จะเป็นเท่าใด?`,
        choices: uniqueNumbers([halvedDuration, duration, duration * 2, halvedDuration + 2]).map(value => `${formatNumber(value)} วินาที`),
        answer: 0,
        explain: `เวลาแปรผกผันกับอัตราเร็ว เมื่อเพิ่มอัตราเร็วเป็น 2 เท่า เวลาที่ใช้จึงลดลงครึ่งหนึ่งเหลือ ${formatNumber(halvedDuration)} วินาที`,
      }, (seed + 1) % 4),
    ];
  }, [displacement, distance, duration, route, speed]);

  const quiz = useMemo(() => quizOrder.map(index => questionPool[index % questionPool.length]), [quizOrder, questionPool]);

  const startQuiz = useCallback(() => {
    setQuizOrder(pickRandomIndices(questionPool.length, QUIZ_LENGTH));
    setQuizIndex(0);
    setPicked(null);
    setStage("quiz");
  }, [questionPool]);

  const position = useMemo(() => {
    let remaining = progress * distance;
    for (let i = 0; i < segments.length; i++) {
      if (remaining <= segments[i]) {
        const ratio = segments[i] === 0 ? 0 : remaining / segments[i];
        return route.points[i] + (route.points[i + 1] - route.points[i]) * ratio;
      }
      remaining -= segments[i];
    }
    return route.points.at(-1)!;
  }, [distance, progress, route, segments]);

  const movingRight = useMemo(() => {
    let remaining = progress * distance;
    for (let i = 0; i < segments.length; i++) {
      if (remaining <= segments[i]) return route.points[i + 1] > route.points[i];
      remaining -= segments[i];
    }
    const lastIndex = route.points.length - 1;
    return route.points[lastIndex] > route.points[lastIndex - 1];
  }, [distance, progress, route, segments]);

  useEffect(() => () => {
    if (animationRef.current !== null) window.clearInterval(animationRef.current);
    void audioCtxRef.current?.close();
  }, []);

  const reset = useCallback(() => {
    if (animationRef.current !== null) {
      window.clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setRunning(false);
    setProgress(0);
  }, []);

  const run = useCallback(() => {
    if (animationRef.current !== null) window.clearInterval(animationRef.current);
    const runDuration = distance / speedRef.current;
    setProgress(0);
    setRunning(true);
    startTimeRef.current = performance.now();
    const tick = () => {
      const now = performance.now();
      const next = Math.min(1, (now - startTimeRef.current) / (runDuration * 1000));
      setProgress(next);
      if (next >= 1) {
        if (animationRef.current !== null) window.clearInterval(animationRef.current);
        animationRef.current = null;
        setRunning(false);
        tone(820, 0.24);
      }
    };
    animationRef.current = window.setInterval(tick, 16);
    tick();
    tone(420, 0.1);
  }, [distance, tone]);

  const changeRoute = (key: RouteKey) => { reset(); setRouteKey(key); };

  return <div className={styles.shell}>
    <div ref={ref} className={`${styles.lab} ${fullscreenClassName}`}>
      <header className={styles.topbar}>
        <div className={styles.brand}><Image src="/assets/khuncool-logo.webp" alt="KhunCool" width={42} height={42}/><div><b>Motion Lab</b><small>การเคลื่อนที่และแรง · ม.2</small></div></div>
        <div className={styles.actions}><Link href="/media/science" title="กลับหน้าสื่อวิทยาศาสตร์">☰ <span>เมนู</span></Link>{stage === "quiz" && <button type="button" onClick={() => { reset(); setStage("lab"); }} title="ตั้งค่าการทดลอง">⚙ <span>ตั้งค่า</span></button>}<button type="button" onClick={() => setMuted(value => !value)} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"} title="เสียงเอฟเฟกต์">{muted ? "🔇" : "🔊"}</button><button type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} aria-pressed={isFull}>⛶</button></div>
      </header>

      {stage === "intro" && <main className={styles.intro}>
        <div className={styles.heroVisual}><div className={styles.planet}>⚙️</div><div className={styles.heroCar}>🏎️</div><i/><i/><i/></div>
        <div className={styles.introCopy}><p className={styles.eyebrow}>INTERACTIVE PHYSICS LESSON</p><h2>มองเห็นการเคลื่อนที่<br/><span>เข้าใจผ่านการทดลอง</span></h2><p>ปล่อยรถบนเส้นจำนวน เปรียบเทียบระยะทาง การกระจัด เวลา และอัตราเร็วจากข้อมูลจริงบนจอ</p><div className={styles.topicChips}><span>📍 ตำแหน่ง</span><span>📏 ระยะทาง</span><span>🧭 การกระจัด</span><span>⏱️ อัตราเร็ว</span></div><button className={styles.primary} onClick={() => setStage("lab")}>เข้าสู่ห้องทดลอง →</button></div>
      </main>}

      {stage === "lab" && <main className={styles.workspace}>
        <aside className={styles.controls}>
          <div><small>01 · เลือกเส้นทาง</small><h2>ตั้งค่าการทดลอง</h2></div>
          <div className={styles.routeButtons}>{(Object.keys(ROUTES) as RouteKey[]).map(key => <button key={key} type="button" aria-pressed={routeKey === key} className={routeKey === key ? styles.active : ""} onClick={() => changeRoute(key)}><span>{ROUTES[key].icon}</span><b>{ROUTES[key].name}</b></button>)}</div>
          <label><span><b>อัตราเร็วคงที่</b><strong>{speed} m/s</strong></span><input type="range" min="10" max="40" step="5" value={speed} disabled={running} onChange={event => {
            const nextSpeed = Number(event.currentTarget.value);
            speedRef.current = nextSpeed;
            setSpeed(nextSpeed);
            setProgress(0);
          }}/></label>
          <p className={styles.routeNote}>{route.note}</p>
          <div className={styles.controlActions}><button onClick={reset}>↺ รีเซ็ต</button><button className={styles.runButton} onClick={run} disabled={running}>{running ? "กำลังเคลื่อนที่…" : "▶ ปล่อยรถ"}</button></div>
          <button className={styles.quizLink} onClick={startQuiz}>โจทย์จากการทดลอง {QUIZ_LENGTH} ข้อ →</button>
        </aside>

        <section className={styles.simulator}>
          <div className={styles.simHeader}><div><small>LIVE MOTION TRACKER</small><h2>{route.name}</h2></div><div className={styles.live}><i/> {running ? "กำลังบันทึก" : progress === 1 ? "เสร็จสิ้น" : "พร้อมทดลอง"}</div></div>
          <div className={styles.trackPanel}>
            <div className={styles.sky}><span>☁️</span><span>☁️</span><span>☀️</span></div>
            <div className={`${styles.car} ${movingRight ? styles.carRight : styles.carLeft}`} style={{ left: `${((position + 7) / 14) * 100}%` }}><span>🏎️</span><i/></div>
            <div className={styles.track}/>
            <div className={styles.scale}>{Array.from({length:15},(_,i)=>i-7).map(n => <span key={n} className={n === 0 ? styles.zero : ""} style={{ left: `${((n + 7) / 14) * 100}%` }}><i/>{n * 10}</span>)}</div>
            <div className={styles.marker} style={{ left: `${((route.points[0] + 7) / 14) * 100}%` }}><b>A</b><span>เริ่ม</span></div>
            <div className={styles.marker} style={{ left: `${((route.points.at(-1)! + 7) / 14) * 100}%` }}><b>B</b><span>สิ้นสุด</span></div>
          </div>
          <div className={styles.metrics}>
            <article><small>ตำแหน่งปัจจุบัน</small><b>{Math.round(position * 10)} <i>m</i></b></article>
            <article><small>ระยะทางทั้งหมด</small><b>{distance} <i>m</i></b></article>
            <article className={styles.highlight}><small>การกระจัด</small><b>{displacement > 0 ? "+" : ""}{displacement} <i>m</i></b></article>
            <article><small>เวลาที่ใช้</small><b>{duration.toFixed(1)} <i>s</i></b></article>
          </div>
          <div className={styles.insight}><span>💡</span><p><b>สังเกต:</b> ระยะทางรวมทุกช่วงที่รถเคลื่อนที่ แต่การกระจัดวัดเส้นตรงจากจุดเริ่มต้น A ไปยังจุดสุดท้าย B พร้อมทิศทาง</p></div>
        </section>
      </main>}

      {stage === "quiz" && <main className={styles.quiz}>
        <div className={styles.quizTop}><div><small>การทดลอง: {route.name} · {speed} m/s · CHECKPOINT {quizIndex + 1} / {quiz.length}</small><h2>โจทย์จากผลการทดลอง</h2></div><button onClick={() => setStage("lab")}>← กลับไปปรับค่า</button></div>
        <section className={styles.questionCard}><span className={styles.questionIcon}>🧠</span><h3>{quiz[quizIndex].q}</h3><div className={styles.choices}>{quiz[quizIndex].choices.map((choice, index) => <button key={choice} onClick={() => setPicked(index)} className={picked === index ? (index === quiz[quizIndex].answer ? styles.correct : styles.wrong) : ""}><i>{String.fromCharCode(65 + index)}</i><span>{choice}</span></button>)}</div>{picked !== null && <div className={styles.explain}><b>{picked === quiz[quizIndex].answer ? "✓ ถูกต้อง" : "ลองพิจารณาอีกครั้ง"}</b><span>{quiz[quizIndex].explain}</span></div>}</section>
        <div className={styles.quizNav}><button disabled={quizIndex === 0} onClick={() => { setQuizIndex(v => v - 1); setPicked(null); }}>← ข้อก่อนหน้า</button>{quizIndex < quiz.length - 1 ? <button onClick={() => { setQuizIndex(v => v + 1); setPicked(null); }}>ข้อต่อไป →</button> : <button onClick={() => setStage("lab")}>ปรับการทดลองใหม่ ↺</button>}</div>
      </main>}
    </div>
  </div>;
}
