"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KcSfx, hoverSfxDelegate } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import GameBoard from "./components/GameBoard";
import Lesson from "./components/Lesson";
import QuestionCard from "./components/QuestionCard";
import QuizResult from "./components/QuizResult";
import TeamScoreboard from "./components/TeamScoreboard";
import TeacherSettings from "./components/TeacherSettings";
import { MODE_CARDS } from "./gameData";
import { generateQuestions } from "./questionGenerator";
import type { GameMode, MathQuestion, QuizSummary, TeacherConfig } from "./types";
import styles from "./MathAdventureApp.module.css";

const SETTINGS_KEY = "kc-math-adventure-settings-v1";
const RESULT_KEY = "kc-math-adventure-latest-v1";
const DEFAULT_CONFIG: TeacherConfig = { limit: 20, operation: "mixed", questionCount: 10, timer: false, sound: true, hints: true, playMode: "whole", teamCount: 2 };
type Screen = "home" | "settings" | "lesson" | "question" | "result";

export default function MathAdventureApp() {
  useTrackToolUse("media-mathematics-math-adventure");
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<GameMode>("practice");
  const [config, setConfig] = useState<TeacherConfig>(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "retry" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hadMiss, setHadMiss] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState<MathQuestion[]>([]);
  const [scores, setScores] = useState([0, 0]);
  const [activeTeam, setActiveTeam] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [latestLabel, setLatestLabel] = useState("");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SETTINGS_KEY);
      const latest = JSON.parse(window.localStorage.getItem(RESULT_KEY) || "null");
      queueMicrotask(() => {
        if (saved) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
        if (latest) setLatestLabel(`ผลล่าสุด ${latest.correct}/${latest.total}`);
      });
    } catch {}
  }, []);

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  useEffect(() => {
    if (screen !== "question" || !config.timer || feedback === "correct") return;
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        setShowHint(true);
        setFeedback("retry");
        setHadMiss(true);
        return 15;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [screen, config.timer, feedback]);

  const play = (sound: Parameters<typeof KcSfx.play>[0]) => {
    if (config.sound) KcSfx.play(sound);
  };

  const selectMode = (selected: GameMode) => {
    play("click");
    setMode(selected);
    if (selected === "lesson") setScreen("lesson");
    else setScreen("settings");
  };

  const start = (retryQuestions?: MathQuestion[]) => {
    const count = mode === "train" || mode === "quiz" ? 10 : config.questionCount;
    const next = retryQuestions ?? generateQuestions({
      count,
      limit: config.limit,
      operation: config.operation,
      kinds: mode === "practice" ? ["picture-count", "number-line", "missing", "operator"] : mode === "quiz" ? ["picture-count", "missing", "operator", "word-problem", "number-line"] : undefined,
    });
    const teamCount = config.playMode === "teams" ? config.teamCount : 1;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
    KcSfx.setMuted(!config.sound);
    setQuestions(next);
    setScores(Array.from({ length: teamCount }, () => 0));
    setActiveTeam(0);
    setIndex(0);
    setCorrect(0);
    setWrong([]);
    setHadMiss(false);
    setFeedback(null);
    setShowHint(false);
    setSeconds(30);
    setScreen("question");
    play("whoosh");
  };

  const finish = (finalCorrect: number, finalWrong: MathQuestion[]) => {
    const answered = questions;
    const additionRows = answered.filter((q) => q.operation === "addition");
    const subtractionRows = answered.filter((q) => q.operation === "subtraction");
    const addWrong = finalWrong.filter((q) => q.operation === "addition").length;
    const subWrong = finalWrong.filter((q) => q.operation === "subtraction").length;
    const nextSummary: QuizSummary = {
      mode,
      correct: finalCorrect,
      total: answered.length,
      addition: { correct: additionRows.length - addWrong, total: additionRows.length },
      subtraction: { correct: subtractionRows.length - subWrong, total: subtractionRows.length },
      wrong: finalWrong,
    };
    setSummary(nextSummary);
    setLatestLabel(`ผลล่าสุด ${nextSummary.correct}/${nextSummary.total}`);
    window.localStorage.setItem(RESULT_KEY, JSON.stringify({ ...nextSummary, savedAt: new Date().toISOString() }));
    setScreen("result");
    play("win");
  };

  const answer = (value: string) => {
    if (feedback === "correct") return;
    const question = questions[index];
    if (value !== question.answer) {
      setFeedback("retry");
      setHadMiss(true);
      setShowHint(config.hints);
      play("wrong");
      return;
    }
    const earned = hadMiss ? 0 : 1;
    const nextCorrect = correct + earned;
    const nextWrong = hadMiss && !wrong.some((q) => q.id === question.id) ? [...wrong, question] : wrong;
    setCorrect(nextCorrect);
    setWrong(nextWrong);
    setFeedback("correct");
    setScores((current) => current.map((score, team) => team === activeTeam ? score + 1 : score));
    play("correct");
    advanceTimer.current = setTimeout(() => {
      if (index + 1 >= questions.length) finish(nextCorrect, nextWrong);
      else {
        setIndex((valueIndex) => valueIndex + 1);
        setActiveTeam((team) => (team + 1) % scores.length);
        setFeedback(null);
        setShowHint(false);
        setHadMiss(false);
        setSeconds(30);
      }
    }, 850);
  };

  const current = questions[index];
  const progress = questions.length ? ((index + (feedback === "correct" ? 1 : 0)) / questions.length) * 100 : 0;
  const settingTitle = mode === "practice" ? "ฝึกทำโจทย์" : mode === "train" ? "รถไฟเก็บดาว" : "แบบทดสอบหลังเรียน";
  const home = () => { setScreen("home"); setFeedback(null); setShowHint(false); };
  return <div {...stageProps} className="kc-stage">
    <div className={`kc-stage-body ${styles.body}`} onMouseOver={hoverSfxDelegate}>
      <div className={styles.decorations} aria-hidden="true"><span>✦</span><span>＋</span><span>★</span><span>−</span><span>●</span><span>✧</span></div>
      <header className={styles.toolbar}>
        <button type="button" className={`kc-tap-chrome ${styles.brandButton}`} onClick={home} aria-label="กลับเมนูเกม">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.brandLogo} src="/assets/khuncool-logo.webp" alt="KhunCool" />
          <strong className="kc-title">Math Adventure</strong>
        </button>
        <div className={styles.toolbarActions}>
          <Link href="/media/mathematics" className={`kc-tap-chrome ${styles.toolbarButton}`}>☰ <span>เมนู</span></Link>
          <button type="button" className={`kc-tap-chrome ${styles.toolbarButton}`} aria-pressed={!config.sound} aria-label={config.sound ? "ปิดเสียง" : "เปิดเสียง"} onClick={() => { const sound = !config.sound; setConfig((value) => ({ ...value, sound })); KcSfx.setMuted(!sound); }}>{config.sound ? "🔊" : "🔇"}</button>
          <button type="button" className={`kc-tap-chrome ${styles.toolbarButton}`} onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>{isFull ? "↙" : "⛶"}</button>
        </div>
      </header>

      {screen === "home" && <main className={`${styles.screen} ${styles.home}`} data-stage="home">
        <div className={styles.heroCopy}><span className={styles.eyebrow}>คณิตศาสตร์ ป.1 · จำนวนไม่เกิน 20</span><h1>Math Adventure<br/><span>ภารกิจบวกลบแสนสนุก</span></h1><p>เรียนด้วยภาพ ฝึกคิด แล้วพารถไฟไปเก็บดาวให้ครบ!</p>{latestLabel && <span className={styles.latest}>{latestLabel}</span>}</div>
        <div className={styles.modeGrid}>
          {MODE_CARDS.map((card) => <button key={card.mode} type="button" className={`kc-tap ${styles.modeCard} ${styles[card.tone]}`} onClick={() => selectMode(card.mode)}><span className={styles.modeIcon}>{card.icon}</span><span><strong>{card.title}</strong><small>{card.desc}</small></span><b>→</b></button>)}
        </div>
      </main>}
      {screen === "settings" && <TeacherSettings config={config} onChange={setConfig} onStart={() => start()} onBack={home} title={settingTitle} />}
      {screen === "lesson" && <Lesson onBack={home} onPractice={() => { setMode("practice"); setScreen("settings"); }} />}
      {screen === "question" && current && <main className={`${styles.screen} ${styles.playScreen}`} data-stage={mode}>
        {feedback === "correct" && <div className={styles.celebrationBurst} aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => <span key={i} style={{ ["--burst-index" as string]: i, ["--burst-angle" as string]: `${i * 25.7}deg` }}>★</span>)}
        </div>}
        <div className={styles.playTop}>
          <div className={styles.progressTrack} aria-label={`ทำไปแล้ว ${Math.round(progress)} เปอร์เซ็นต์`}><span style={{ ["--progress" as string]: `${progress}%` }} /></div>
          {config.timer && <div className={styles.timer} aria-label={`เหลือเวลา ${seconds} วินาที`}>⏱ {seconds}</div>}
        </div>
        {mode === "train" && <><TeamScoreboard scores={scores} active={activeTeam} /><GameBoard progress={progress} stars={scores.reduce((sum, value) => sum + value, 0)} team={activeTeam} /></>}
        <QuestionCard key={current.id} question={current} index={index} total={questions.length} feedback={feedback} showHint={showHint} onHint={() => setShowHint((value) => !value)} onAnswer={answer} />
      </main>}
      {screen === "result" && summary && <QuizResult summary={summary} onRetryWrong={() => start(summary.wrong)} onReplay={() => start()} onHome={home} />}
    </div>
  </div>;
}
