"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFullscreen } from "../../english/useFullscreen";
import styles from "./DensityLab.module.css";

type MaterialKey = "wood" | "ice" | "glass" | "aluminum";
type LiquidKey = "oil" | "water" | "salt";
type Stage = "intro" | "setup" | "result" | "quiz";

const MATERIALS = {
  wood: { name: "ไม้", icon: "🪵", density: 0.7, color: "#C98245" },
  ice: { name: "น้ำแข็ง", icon: "🧊", density: 0.92, color: "#BDEFFF" },
  glass: { name: "แก้ว", icon: "🔷", density: 2.5, color: "#70D7E8" },
  aluminum: { name: "อะลูมิเนียม", icon: "🔩", density: 2.7, color: "#AEB9C8" },
} satisfies Record<MaterialKey, { name: string; icon: string; density: number; color: string }>;

const LIQUIDS = {
  oil: { name: "น้ำมัน", density: 0.8, color: "#FFD65C" },
  water: { name: "น้ำ", density: 1, color: "#5EC8F2" },
  salt: { name: "น้ำเกลือเข้มข้น", density: 1.2, color: "#67D7CB" },
} satisfies Record<LiquidKey, { name: string; density: number; color: string }>;

const QUIZ_LENGTH = 4;

function pickRandomIndices(poolSize: number, count: number): number[] {
  const indices = Array.from({ length: poolSize }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
}

export default function DensityLab() {
  const { ref, isFull, fullscreenClassName, toggle } = useFullscreen<HTMLDivElement>();
  const [stage, setStage] = useState<Stage>("intro");
  const [materialKey, setMaterialKey] = useState<MaterialKey>("wood");
  const [liquidKey, setLiquidKey] = useState<LiquidKey>("water");
  const [volume, setVolume] = useState(100);
  const [liquidAmount, setLiquidAmount] = useState(600);
  const [picked, setPicked] = useState<number | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOrder, setQuizOrder] = useState<number[]>([0, 1, 2, 3]);
  const [muted, setMuted] = useState(false);
  const material = MATERIALS[materialKey];
  const liquid = LIQUIDS[liquidKey];
  const mass = material.density * volume;
  const floats = material.density < liquid.density;
  const neutral = material.density === liquid.density;
  const result = neutral ? "ลอยนิ่งกลางของเหลว" : floats ? "ลอย" : "จม";
  const submerged = floats ? Math.round((material.density / liquid.density) * 100) : 100;
  const audioCtxRef = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audioCtxRef.current?.close(); }, []);
  const playReleaseSound = () => {
    if (muted || typeof window === "undefined") return;
    try {
      const context = audioCtxRef.current ?? (audioCtxRef.current = new window.AudioContext());
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = floats ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(floats ? 520 : 260, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(floats ? 760 : 90, context.currentTime + 0.45);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.48);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.48);
    } catch {
      // The visual experiment still runs when audio is unavailable.
    }
  };

  const questionPool = useMemo(() => {
    const answer = result;
    const choices = ["ลอย", "จม", "ลอยนิ่งกลางของเหลว"];
    const halfVolume = volume / 2;
    const materialsByDensity = (Object.keys(MATERIALS) as MaterialKey[]).map(key => MATERIALS[key]).sort((a, b) => b.density - a.density);
    const liquidsByDensity = (Object.keys(LIQUIDS) as LiquidKey[]).map(key => LIQUIDS[key]).sort((a, b) => a.density - b.density);
    const materialNames = (Object.keys(MATERIALS) as MaterialKey[]).map(key => MATERIALS[key].name);
    const liquidNames = (Object.keys(LIQUIDS) as LiquidKey[]).map(key => LIQUIDS[key].name);
    return [{
      q: `วัตถุ${material.name} ความหนาแน่น ${material.density} g/cm³ เมื่อนำไปใส่ใน${liquid.name} ความหนาแน่น ${liquid.density} g/cm³ จะเป็นอย่างไร?`, choices, answer: choices.indexOf(answer), explain: `${material.density} ${floats ? "น้อยกว่า" : neutral ? "เท่ากับ" : "มากกว่า"} ${liquid.density} g/cm³ วัตถุจึง${result}`,
    },{
      q: `วัตถุ${material.name}มีปริมาตร ${volume} cm³ และความหนาแน่น ${material.density} g/cm³ วัตถุมีมวลเท่าใด?`, choices: [`${mass.toFixed(0)} กรัม`, `${volume} กรัม`, `${(mass + 50).toFixed(0)} กรัม`, `${material.density} กรัม`], answer: 0, explain: `มวล = ความหนาแน่น × ปริมาตร = ${material.density} × ${volume} = ${mass.toFixed(0)} กรัม`,
    },{
      q: `ถ้าเพิ่ม${liquid.name}จาก ${liquidAmount} mL โดยยังใช้วัตถุเดิม ผลลอย–จมจะเปลี่ยนหรือไม่?`, choices: ["ไม่เปลี่ยน เพราะความหนาแน่นเท่าเดิม", "เปลี่ยนเป็นลอยเสมอ", "เปลี่ยนเป็นจมเสมอ", "มวลวัตถุจะเพิ่มขึ้น"], answer: 0, explain: `ปริมาณของเหลวทำให้ระดับน้ำเปลี่ยน แต่ความหนาแน่นของ${liquid.name}ยังเท่ากับ ${liquid.density} g/cm³ ผลลอย–จมจึงไม่เปลี่ยน`,
    },{
      q: `จากการทดลองนี้ ปัจจัยใดใช้ทำนายการลอย–จมได้โดยตรงที่สุด?`, choices: ["เปรียบเทียบความหนาแน่นของวัตถุกับของเหลว", "ดูสีของวัตถุ", "ดูปริมาณของเหลวเพียงอย่างเดียว", "ดูชื่อวัสดุเท่านั้น"], answer: 0, explain: "วัตถุลอยเมื่อมีความหนาแน่นน้อยกว่าของเหลว และจมเมื่อมีความหนาแน่นมากกว่า",
    },{
      q: `ถ้าลดขนาดวัตถุ${material.name}เหลือ ${halfVolume.toFixed(0)} cm³ แต่ยังเป็นวัสดุเดิม ผลลอย–จมจะเปลี่ยนหรือไม่?`, choices: ["ไม่เปลี่ยน เพราะความหนาแน่นไม่ขึ้นกับปริมาตร", "เปลี่ยนเป็นลอยเสมอ", "เปลี่ยนเป็นจมเสมอ", "ขึ้นอยู่กับสีของวัตถุ"], answer: 0, explain: "ความหนาแน่นเป็นสมบัติเฉพาะของเนื้อวัสดุ ไม่ขึ้นกับปริมาตร การเปลี่ยนขนาดวัตถุจึงไม่เปลี่ยนผลลอย–จม",
    },{
      q: "จากวัสดุทั้งหมดในชุดทดลอง วัสดุใดมีความหนาแน่นมากที่สุด?", choices: materialNames, answer: materialNames.indexOf(materialsByDensity[0].name), explain: `${materialsByDensity[0].name} มีความหนาแน่น ${materialsByDensity[0].density} g/cm³ ซึ่งมากที่สุดในชุดทดลองนี้`,
    },{
      q: "ของเหลวชนิดใดมีความหนาแน่นน้อยที่สุด?", choices: liquidNames, answer: liquidNames.indexOf(liquidsByDensity[0].name), explain: `${liquidsByDensity[0].name} มีความหนาแน่น ${liquidsByDensity[0].density} g/cm³ ซึ่งน้อยที่สุดในชุดทดลองนี้`,
    }];
  }, [floats, liquid, liquidAmount, mass, material, neutral, result, volume]);

  const quiz = useMemo(() => quizOrder.map(index => questionPool[index % questionPool.length]), [quizOrder, questionPool]);

  const startQuiz = () => { setQuizOrder(pickRandomIndices(questionPool.length, QUIZ_LENGTH)); setQuizIndex(0); setPicked(null); setStage("quiz"); };
  const changeSetting = () => { setStage("setup"); setPicked(null); setQuizIndex(0); };
  const randomize = () => {
    const materials = Object.keys(MATERIALS) as MaterialKey[];
    const liquids = Object.keys(LIQUIDS) as LiquidKey[];
    setMaterialKey(materials[Math.floor(Math.random() * materials.length)]);
    setLiquidKey(liquids[Math.floor(Math.random() * liquids.length)]);
    setVolume(50 + Math.floor(Math.random() * 7) * 25);
    setLiquidAmount(300 + Math.floor(Math.random() * 7) * 100);
  };

  return <div className={styles.shell}>
    <div ref={ref} className={`${styles.lab} ${fullscreenClassName}`}>
      <header className={styles.topbar}>
        <div className={styles.brand}><Image src="/assets/khuncool-logo.webp" alt="KhunCool" width={42} height={42}/><div><b>Density Lab</b><small>ความหนาแน่น · ม.1</small></div></div>
        <div className={styles.actions}>
          <Link href="/media/science" title="กลับหน้าสื่อวิทยาศาสตร์">☰ <span>เมนู</span></Link>
          {stage !== "intro" && <button type="button" onClick={changeSetting} title="ตั้งค่าการทดลอง">⚙ <span>ตั้งค่า</span></button>}
          <button type="button" onClick={() => setMuted(value => !value)} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"} title="เสียงเอฟเฟกต์">{muted ? "🔇" : "🔊"}</button>
          <button type="button" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} aria-pressed={isFull}>⛶</button>
        </div>
      </header>

      {stage === "intro" && <main className={styles.intro}>
        <div className={styles.introArt}><div className={styles.bubble}>🫧</div><div className={styles.beaker}>🧪</div><div className={styles.cube}>🧊</div></div>
        <div className={styles.introCopy}><small>INTERACTIVE MATTER LAB</small><h2>ทำไมบางอย่าง<br/><em>ลอย</em> แต่บางอย่าง <strong>จม?</strong></h2><p>ทดลองเปรียบเทียบมวล ปริมาตร และความหนาแน่นด้วยวัตถุและของเหลวหลายชนิด</p><div className={styles.chips}><span>⚖️ มวล</span><span>📦 ปริมาตร</span><span>💧 ความหนาแน่น</span></div><button onClick={() => setStage("setup")}>เริ่มการทดลอง →</button></div>
      </main>}

      {stage === "setup" && <main className={styles.workspace}>
        <aside className={styles.controls}><small>EXPERIMENT SETUP</small><h2>ตั้งค่าการทดลอง</h2>
          <label>1 · เลือกวัตถุ</label><div className={styles.optionGrid}>{(Object.keys(MATERIALS) as MaterialKey[]).map(key => <button key={key} type="button" aria-pressed={materialKey === key} className={materialKey === key ? styles.active : ""} onClick={() => setMaterialKey(key)}><span>{MATERIALS[key].icon}</span><b>{MATERIALS[key].name}</b><small>{MATERIALS[key].density} g/cm³</small></button>)}</div>
          <label>2 · เลือกของเหลว</label><div className={styles.liquidButtons}>{(Object.keys(LIQUIDS) as LiquidKey[]).map(key => <button key={key} type="button" aria-pressed={liquidKey === key} className={liquidKey === key ? styles.active : ""} onClick={() => setLiquidKey(key)}><i style={{background: LIQUIDS[key].color}}/><b>{LIQUIDS[key].name}</b><small>{LIQUIDS[key].density}</small></button>)}</div>
          <div className={styles.rangePair}><label className={styles.range}><span>3 · ขนาดวัตถุ <b>{volume} cm³</b></span><input type="range" min="50" max="200" step="25" value={volume} onChange={e => setVolume(Number(e.currentTarget.value))}/></label><label className={styles.range}><span>4 · ปริมาณของเหลว <b>{liquidAmount} mL</b></span><input type="range" min="300" max="900" step="100" value={liquidAmount} onChange={e => setLiquidAmount(Number(e.currentTarget.value))}/></label></div>
          <div className={styles.launchActions}><button type="button" onClick={randomize}>🎲 สุ่มค่า</button><button className={styles.testButton} onClick={() => { playReleaseSound(); setStage("result"); }}>ปล่อยวัตถุลงถัง ↓</button></div>
        </aside>
        <Tank material={material} liquid={liquid} state="ready" neutral={neutral} submerged={submerged} volume={volume} liquidAmount={liquidAmount}/>
      </main>}

      {stage === "result" && <main className={styles.workspace}>
        <aside className={styles.resultPanel}><small>OBSERVATION COMPLETE</small><h2>{material.icon} {material.name}<br/><span className={floats || neutral ? styles.floatText : styles.sinkText}>{result}!</span></h2><p>ความหนาแน่นของวัตถุ <b>{material.density}</b> g/cm³<br/>ความหนาแน่นของของเหลว <b>{liquid.density}</b> g/cm³</p><div className={styles.resultActions}><button onClick={changeSetting}>↺ เปลี่ยนค่า</button><button onClick={startQuiz}>ตอบโจทย์ →</button></div></aside>
        <section className={styles.resultArea}><Tank material={material} liquid={liquid} state={floats || neutral ? "float" : "sink"} neutral={neutral} submerged={submerged} volume={volume} liquidAmount={liquidAmount}/><div className={styles.metrics}><article><small>มวล</small><b>{mass.toFixed(0)} g</b></article><article><small>ขนาดวัตถุ</small><b>{volume} cm³</b></article><article><small>ของเหลว</small><b>{liquidAmount} mL</b></article><article><small>ส่วนที่จม</small><b>{submerged}%</b></article></div></section>
      </main>}

      {stage === "quiz" && <main className={styles.quiz}><div><small>QUESTION {quizIndex + 1} / {quiz.length} · FROM YOUR EXPERIMENT</small><h2>ใช้หลักฐานตอบคำถาม</h2></div><section><span>🧠</span><h3>{quiz[quizIndex].q}</h3><div>{quiz[quizIndex].choices.map((choice,index) => <button key={choice} onClick={() => setPicked(index)} className={picked === index ? (index === quiz[quizIndex].answer ? styles.correct : styles.wrong) : ""}><i>{String.fromCharCode(65 + index)}</i>{choice}</button>)}</div>{picked !== null && <p><b>{picked === quiz[quizIndex].answer ? "✓ ถูกต้อง" : "ลองใช้ข้อมูลจากการทดลองอีกครั้ง"}</b>{quiz[quizIndex].explain}</p>}</section><footer><button onClick={changeSetting}>← ปรับการทดลองใหม่</button>{quizIndex < quiz.length - 1 ? <button onClick={() => { setQuizIndex(value => value + 1); setPicked(null); }}>ข้อต่อไป →</button> : <button onClick={() => setStage("result")}>ดูผลการทดลอง</button>}</footer></main>}
    </div>
  </div>;
}

function Tank({ material, liquid, state, neutral, submerged, volume, liquidAmount }: { material: typeof MATERIALS[MaterialKey]; liquid: typeof LIQUIDS[LiquidKey]; state: "ready" | "float" | "sink"; neutral: boolean; submerged: number; volume: number; liquidAmount: number }) {
  const liquidTop = 50 - ((liquidAmount - 300) / 600) * 30;
  const objectTop = state === "ready" ? 2 : state === "sink" ? 73 : liquidTop - 7 + submerged * 0.14;
  const objectSize = 15 + ((volume - 50) / 150) * 10;
  const objectStyle = state === "ready"
    ? { "--object-color": material.color, top: `${objectTop}%`, width: `${objectSize}%` }
    : { "--object-color": material.color, "--target-top": `${objectTop}%`, width: `${objectSize}%` };
  return <section className={`${styles.tankArea} ${state !== "ready" ? styles.releasedTank : ""}`}>
    <div className={styles.readout}><span>LIQUID SCANNER</span><b>{liquid.name} · {liquidAmount} mL · {liquid.density} g/cm³</b></div>
    <div className={`${styles.tank} ${state === "sink" ? styles.sinkImpact : styles.floatImpact}`}>
      <div className={styles.liquid} style={{background: liquid.color, top: `${liquidTop}%`}}/>
      {state !== "ready" && <div className={styles.splash} style={{top: `calc(${liquidTop}% - 3%)`}}><i/><i/><i/><i/><b/></div>}
      {state !== "ready" && <div className={styles.bubbles}><i/><i/><i/><i/><i/></div>}
      <div className={`${styles.object} ${styles[state]}`} style={objectStyle as React.CSSProperties}><span>{material.icon}</span><b className={styles.speedLines}/></div>
      <div className={styles.ruler}>{[0,25,50,75,100].map(n => <i key={n}>{n}</i>)}</div><div className={styles.waves} style={{top: `calc(${liquidTop}% - 2px)`}}/>
      {state === "sink" && <div className={styles.impactDust}><i/><i/><i/></div>}
    </div>
    <p>{state === "ready" ? "คาดการณ์ก่อนว่า วัตถุจะลอยหรือจม" : state === "sink" ? `วัตถุ ${material.name} เคลื่อนลงสู่ก้นถัง` : neutral ? `วัตถุ ${material.name} ลอยนิ่งกลางของเหลว` : `วัตถุ ${material.name} จมในของเหลวประมาณ ${submerged}%`}</p>
  </section>;
}
