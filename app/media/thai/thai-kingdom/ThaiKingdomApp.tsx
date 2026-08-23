"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KcSfx, hoverSfxDelegate } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import LessonPlayer from "./components/LessonPlayer";
import QuestionCard from "./components/QuestionCard";
import QuizResult from "./components/QuizResult";
import TeacherSettings from "./components/TeacherSettings";
import TeamScoreboard from "./components/TeamScoreboard";
import TrainGameBoard from "./components/TrainGameBoard";
import { generateQuestions } from "./questionGenerator";
import styles from "./ThaiKingdomApp.module.css";
import type { GameMode, QuizSummary, Skill, TeacherConfig, ThaiQuestion } from "./types";

const SETTINGS_KEY = "kc-thai-kingdom-settings-v1";
const RESULT_KEY = "kc-thai-kingdom-latest-v1";
const DEFAULT_CONFIG: TeacherConfig = { consonantSet: "all", vowels: ["า", "ี", "ู"], questionCount: 10, difficulty: 2, sound: true, hints: true, timer: false, playMode: "whole", teamCount: 2, instantAnswer: true };
const MODES = [
  { mode: "lesson" as const, icon: "📖", title: "เรียนรู้", description: "พยัญชนะ สระ และโรงงานสร้างคำ", tone: "pink" },
  { mode: "practice" as const, icon: "🧩", title: "ฝึกทำ", description: "ฟัง ดูภาพ เติมคำ และเรียงคำ", tone: "mint" },
  { mode: "train" as const, icon: "🚂", title: "รถไฟเก็บคำ", description: "ผลัดกันตอบให้ครบ 10 สถานี", tone: "gold" },
  { mode: "quiz" as const, icon: "👑", title: "แบบทดสอบ", description: "เช็ก 5 ทักษะหลังเรียน", tone: "violet" },
];
type Screen = "home" | "settings" | "lesson" | "question" | "result";

const emptySkills = (): Record<Skill, { correct: number; total: number }> => ({ consonant: { correct: 0, total: 0 }, vowel: { correct: 0, total: 0 }, blending: { correct: 0, total: 0 }, listening: { correct: 0, total: 0 }, picture: { correct: 0, total: 0 } });

export default function ThaiKingdomApp() {
  useTrackToolUse("media-thai-thai-kingdom");
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<GameMode>("practice");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<ThaiQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "retry" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hadMiss, setHadMiss] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState<ThaiQuestion[]>([]);
  const [scores, setScores] = useState([0]);
  const [activeTeam, setActiveTeam] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [latest, setLatest] = useState("");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SETTINGS_KEY);
      const result = JSON.parse(window.localStorage.getItem(RESULT_KEY) || "null");
      queueMicrotask(() => { if (saved) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) }); if (result) setLatest(`ผลล่าสุด ${result.correct}/${result.total}`); });
    } catch {}
  }, []);
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);
  useEffect(() => {
    if (screen !== "question" || !config.timer || feedback === "correct") return;
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) { setShowHint(true); setFeedback("retry"); setHadMiss(true); return 15; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [config.timer, feedback, screen]);

  const play = (sound: Parameters<typeof KcSfx.play>[0]) => { if (config.sound) KcSfx.play(sound); };
  const home = () => { setScreen("home"); setFeedback(null); setShowHint(false); };
  const selectMode = (selected: GameMode) => { play("click"); setMode(selected); setScreen(selected === "lesson" ? "lesson" : "settings"); };
  const start = (retry?: ThaiQuestion[]) => {
    const count = mode === "train" || mode === "quiz" ? 10 : config.questionCount;
    const next = retry ?? generateQuestions({ count, config, kinds: mode === "practice" ? ["listen-consonant", "picture-word", "missing-consonant", "missing-vowel", "arrange"] : undefined });
    const teamCount = config.playMode === "teams" ? config.teamCount : 1;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
    KcSfx.setMuted(!config.sound);
    setQuestions(next); setScores(Array.from({ length: teamCount }, () => 0)); setActiveTeam(0); setIndex(0); setCorrect(0); setWrong([]); setHadMiss(false); setFeedback(null); setShowHint(false); setSeconds(30); setScreen("question"); play("whoosh");
  };
  const finish = (finalCorrect: number, finalWrong: ThaiQuestion[]) => {
    const bySkill = emptySkills();
    for (const question of questions) bySkill[question.skill].total += 1;
    for (const question of questions.filter((item) => !finalWrong.some((wrongItem) => wrongItem.id === item.id))) bySkill[question.skill].correct += 1;
    const nextSummary: QuizSummary = { mode, correct: finalCorrect, total: questions.length, bySkill, wrong: finalWrong };
    setSummary(nextSummary); setLatest(`ผลล่าสุด ${finalCorrect}/${questions.length}`); window.localStorage.setItem(RESULT_KEY, JSON.stringify({ ...nextSummary, savedAt: new Date().toISOString() })); setScreen("result"); play("win");
  };
  const answer = (value: string) => {
    if (feedback === "correct") return;
    const question = questions[index];
    if (value !== question.answer) { setFeedback("retry"); setHadMiss(true); setShowHint(config.hints); play("wrong"); return; }
    const earned = hadMiss ? 0 : 1;
    const nextCorrect = correct + earned;
    const nextWrong = hadMiss && !wrong.some((item) => item.id === question.id) ? [...wrong, question] : wrong;
    setCorrect(nextCorrect); setWrong(nextWrong); setFeedback("correct"); setScores((current) => current.map((score, team) => team === activeTeam ? score + 1 : score)); play("correct");
    advanceTimer.current = setTimeout(() => {
      if (index + 1 >= questions.length) finish(nextCorrect, nextWrong);
      else { setIndex((valueIndex) => valueIndex + 1); setActiveTeam((team) => (team + 1) % scores.length); setFeedback(null); setShowHint(false); setHadMiss(false); setSeconds(30); }
    }, 900);
  };

  const current = questions[index];
  const progress = questions.length ? ((index + (feedback === "correct" ? 1 : 0)) / questions.length) * 100 : 0;
  const settingTitle = mode === "practice" ? "ฝึกอ่านเขียน" : mode === "train" ? "รถไฟเก็บคำ" : "แบบทดสอบหลังเรียน";
  return <div {...stageProps} className="kc-stage"><div className={`kc-stage-body ${styles.body}`} onMouseOver={hoverSfxDelegate}>
    <div className={styles.decorations} aria-hidden="true"><span>ก</span><span>า</span><span>★</span><span>ู</span><span>ี</span></div>
    <header className={styles.toolbar}><button type="button" className={`kc-tap-chrome ${styles.brand}`} onClick={home} aria-label="กลับเมนูเกม"><img src="/assets/khuncool-logo.webp" alt="KhunCool" /><strong className="kc-title">อาณาจักรภาษาไทย</strong></button><div className={styles.toolbarActions}><Link href="/media/thai" className={`kc-tap-chrome ${styles.toolbarButton}`}>☰ <span>เมนู</span></Link><button type="button" className={`kc-tap-chrome ${styles.toolbarButton}`} aria-label={config.sound ? "ปิดเสียง" : "เปิดเสียง"} onClick={() => { const sound = !config.sound; setConfig((value) => ({ ...value, sound })); KcSfx.setMuted(!sound); }}>{config.sound ? "🔊" : "🔇"}</button><button type="button" className={`kc-tap-chrome ${styles.toolbarButton}`} onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>{isFull ? "↙" : "⛶"}</button></div></header>
    {screen === "home" && <main className={`${styles.screen} ${styles.home}`} data-stage="home"><div className={styles.heroCopy}><span className={styles.eyebrow}>ภาษาไทย ป.1 · อ่านออก เขียนได้</span><h1>อาณาจักรภาษาไทย</h1><h2>อ่านออก เขียนได้</h2><p>รู้จักพยัญชนะ ตามหาสระ แล้วสร้างคำให้รถไฟเดินทาง!</p>{latest && <span className={styles.latest}>{latest}</span>}</div><div className={styles.modeGrid}>{MODES.map((card) => <button key={card.mode} type="button" className={`kc-tap ${styles.modeCard} ${styles[card.tone]}`} onClick={() => selectMode(card.mode)}><span>{card.icon}</span><span><strong>{card.title}</strong><small>{card.description}</small></span><b>→</b></button>)}</div></main>}
    {screen === "settings" && <TeacherSettings config={config} title={settingTitle} onChange={setConfig} onStart={() => start()} onBack={home} />}
    {screen === "lesson" && <LessonPlayer sound={config.sound} onBack={home} onPractice={() => { setMode("practice"); setScreen("settings"); }} />}
    {screen === "question" && current && <main className={`${styles.screen} ${styles.playScreen}`} data-stage={mode}><div className={styles.playTop}><div className={styles.progressTrack}><span style={{ ["--progress" as string]: `${progress}%` }} /></div>{config.timer && <div className={styles.timer}>⏱ {seconds}</div>}</div>{mode === "train" && <><TeamScoreboard scores={scores} active={activeTeam} /><TrainGameBoard progress={progress} station={index + 1} /></>}{feedback === "correct" && <div className={styles.celebration} aria-hidden="true">★ ก ★</div>}<QuestionCard key={current.id} question={current} index={index} total={questions.length} feedback={feedback} showHint={showHint} sound={config.sound} hints={config.hints} instantAnswer={config.instantAnswer} onHint={() => setShowHint((value) => !value)} onAnswer={answer} /></main>}
    {screen === "result" && summary && <QuizResult summary={summary} onRetryWrong={() => start(summary.wrong)} onReplay={() => start()} onHome={home} />}
  </div></div>;
}
