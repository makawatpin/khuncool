"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useStage } from "../../_stage/useStage";
import { IDIOMS, IDIOM_COUNT, type Idiom } from "./idiomData";
import styles from "./ThaiIdiomDetective.module.css";

type Screen = "intro" | "play" | "result" | "library";
type Mode = "meaning" | "situation" | "emoji" | "fill";
type SessionMode = Mode | "mixed";
type Question = { idiom: Idiom; mode: Mode; prompt: string; detail: string; choices: string[]; answer: string };

const MODE_META: Record<Mode, { label: string; icon: string; instruction: string }> = {
  meaning: { label: "ถอดความหมาย", icon: "💬", instruction: "สำนวนใดตรงกับความหมายนี้" },
  situation: { label: "ไขคดีสถานการณ์", icon: "🕵️", instruction: "สถานการณ์นี้ตรงกับสำนวนใด" },
  emoji: { label: "ทายภาพปริศนา", icon: "🖼️", instruction: "ภาพคำใบ้นี้ซ่อนสำนวนใด" },
  fill: { label: "เติมคำสำนวน", icon: "✏️", instruction: "คิดคำที่หายไป แล้วค่อยเปิดเฉลย" },
};

const ILLUSTRATED_IDS = [
  "chicken-snake", "chili-river", "coriander-sprinkle", "elephant-grasshopper", "elephant-mahout",
  "eyes-see", "fish-cat", "frog-shell", "gold-behind-buddha", "grind-needle", "lost-cow",
  "mortar-mountain", "rabbit-moon", "rabbit-panic", "rising-water", "slow-knife", "small-bird",
  "teach-croc", "tiger-crocodile", "two-fish",
] as const;
const ILLUSTRATED_ID_SET = new Set<string>(ILLUSTRATED_IDS);
const clueImage = (id: string) => `/assets/thai-idiom-detective/clues/${id}.webp`;

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

function makeChoices(answer: string, candidates: string[], offset: number) {
  const distinct = [...new Set(candidates.filter((item) => item !== answer))];
  const rotated = distinct.map((_, index) => distinct[(index + offset) % distinct.length]);
  return shuffle([answer, ...rotated.slice(0, 3)]);
}

function buildQuestion(idiom: Idiom, mode: Mode, index: number): Question {
  if (mode === "fill") {
    const parts = idiom.phrase.split(" ");
    const answer = parts.at(-1) ?? idiom.phrase;
    const prompt = `${parts.slice(0, -1).join(" ")} ______`;
    const tails = IDIOMS.filter((item) => item.phrase.includes(" ")).map((item) => item.phrase.split(" ").at(-1) ?? item.phrase);
    return { idiom, mode, prompt, detail: idiom.meaning, answer, choices: makeChoices(answer, tails, index * 3 + 1) };
  }
  const detail = mode === "meaning" ? idiom.meaning : mode === "situation" ? idiom.situation : idiom.emoji;
  return { idiom, mode, prompt: detail, detail, answer: idiom.phrase, choices: makeChoices(idiom.phrase, IDIOMS.map((item) => item.phrase), index * 5 + 2) };
}

export default function ThaiIdiomDetective() {
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const [screen, setScreen] = useState<Screen>("intro");
  const [roundLength, setRoundLength] = useState(10);
  const [sessionMode, setSessionMode] = useState<SessionMode>("mixed");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [position, setPosition] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes] = useState<Idiom[]>([]);
  const [muted, setMuted] = useState(false);
  const [libraryPage, setLibraryPage] = useState(0);

  const question = questions[position];
  const answered = picked !== null;
  const correct = answered && picked === question?.answer;
  const isRevealMode = question?.mode === "fill" || question?.mode === "meaning";
  const libraryItems = IDIOMS.slice(libraryPage * 4, libraryPage * 4 + 4);
  const libraryPages = Math.ceil(IDIOM_COUNT / 4);

  const tone = useCallback((kind: "correct" | "wrong") => {
    if (muted) return;
    const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.type = kind === "correct" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(kind === "correct" ? 520 : 180, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "correct" ? 980 : 110, context.currentTime + 0.24);
    gain.gain.setValueAtTime(0.07, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.33);
    oscillator.onended = () => context.close();
  }, [muted]);

  const launch = useCallback(() => {
    const illustratedPool = shuffle(IDIOMS.filter((item) => ILLUSTRATED_ID_SET.has(item.id)));
    const pool = (sessionMode === "emoji" ? illustratedPool : shuffle(IDIOMS)).slice(0, roundLength);
    const fillPool = IDIOMS.filter((item) => item.phrase.includes(" "));
    const modes: Mode[] = sessionMode === "mixed" ? ["meaning", "situation", "emoji", "fill"] : [sessionMode];
    let illustratedIndex = 0;
    const next = pool.map((idiom, index) => {
      const mode = modes[index % modes.length];
      const imageSource = sessionMode === "emoji"
        ? idiom
        : illustratedPool[illustratedIndex % illustratedPool.length];
      if (mode === "emoji" && sessionMode !== "emoji") illustratedIndex += 1;
      const source = mode === "emoji" ? imageSource : mode === "fill" && !idiom.phrase.includes(" ") ? fillPool[index % fillPool.length] : idiom;
      return buildQuestion(source, mode, index);
    });
    setQuestions(next);
    setPosition(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMistakes([]);
    setScreen("play");
  }, [roundLength, sessionMode]);

  const choose = useCallback((choice: string) => {
    if (!question || answered) return;
    setPicked(choice);
    const isCorrect = choice === question.answer;
    tone(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setScore((value) => value + 100 + Math.min(streak, 5) * 20);
    } else {
      setStreak(0);
      setMistakes((items) => items.some((item) => item.id === question.idiom.id) ? items : [...items, question.idiom]);
    }
  }, [answered, question, streak, tone]);

  const advance = useCallback(() => {
    if (!answered) return;
    if (position >= questions.length - 1) {
      setScreen("result");
      return;
    }
    setPosition((value) => value + 1);
    setPicked(null);
  }, [answered, position, questions.length]);

  useEffect(() => {
    if (screen !== "play") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (answered) advance();
        else if (question && isRevealMode) choose(question.answer);
      }
      const number = Number(event.key);
      if (!answered && !isRevealMode && number >= 1 && number <= 4 && question?.choices[number - 1]) choose(question.choices[number - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, answered, choose, isRevealMode, question, screen]);

  const grade = useMemo(() => {
    const correctCount = questions.length - mistakes.length;
    const ratio = questions.length ? correctCount / questions.length : 0;
    if (ratio >= 0.9) return { icon: "🏆", title: "ยอดนักสืบสำนวน", text: "อ่านสถานการณ์และเลือกใช้สำนวนได้แม่นยำมาก" };
    if (ratio >= 0.7) return { icon: "🥇", title: "นักสืบฝีมือดี", text: "เก่งมาก ทบทวนอีกนิดก็พร้อมไขทุกคดี" };
    return { icon: "🔎", title: "นักสืบฝึกหัด", text: "ทุกคำตอบผิดคือเบาะแสใหม่ ลองทบทวนแล้วเล่นอีกครั้ง" };
  }, [mistakes.length, questions.length]);

  return (
    <div {...stageProps} className="kc-stage">
      <div className={`kc-stage-body ${styles.game}`} data-screen={screen}>
        <div className={styles.paperGrid} aria-hidden="true" />
        <div className={styles.blobOne} aria-hidden="true" />
        <div className={styles.blobTwo} aria-hidden="true" />
        <header className={styles.topbar}>
          <button className={`kc-tap-chrome ${styles.brand}`} onClick={() => setScreen("intro")} aria-label="กลับหน้าแรกของเกม"><span>🔎</span><b>นักสืบสำนวนไทย</b></button>
          <div className={styles.toolbar}>
            {screen === "play" && <div className={styles.miniScore}><span>⭐ {score}</span><span>🔥 {streak}</span></div>}
            <Link className="kc-tap-chrome" href="/media/thai" aria-label="สื่อภาษาไทยทั้งหมด">☰<span> สื่อไทย</span></Link>
            <button className="kc-tap-chrome" onClick={() => setMuted((value) => !value)} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}>{muted ? "🔇" : "🔊"}</button>
            <button className="kc-tap-chrome" onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
          </div>
        </header>

        {screen === "intro" && (
          <main className={styles.intro} data-stage="intro">
            <section className={styles.heroCopy}>
              <div className={styles.eyebrow}>แฟ้มลับภาษาไทย • {IDIOM_COUNT} สำนวน</div>
              <h2>นักสืบ<br/><span>สำนวนไทย</span></h2>
              <p>แกะรอยความหมาย อ่านสถานการณ์ ทายภาพปริศนา<br/>และเติมคำให้ครบ เพื่อสะสมตรานักสืบ</p>
              <p className={styles.modeLabel}>เลือกรูปแบบเกม</p>
              <div className={styles.modeStrip}>
                {(["mixed", "meaning", "situation", "emoji", "fill"] as SessionMode[]).map((mode) => {
                  const meta = mode === "mixed" ? { icon: "🎲", label: "ผสมทุกแบบ" } : MODE_META[mode];
                  return <button className={`kc-tap ${sessionMode === mode ? styles.modeSelected : ""}`} type="button" key={mode} onClick={() => setSessionMode(mode)} aria-pressed={sessionMode === mode} title={meta.label}><span>{meta.icon}</span><b>{meta.label}</b></button>;
                })}
              </div>
            </section>
            <section className={styles.caseArt} aria-hidden="true"><div className={styles.magnifier}><span>สุภาษิต<br/><b>?</b></span></div><Image className={styles.mascot} src="/assets/thai-idiom-detective/detective-mascot.webp" width={1200} height={1327} priority alt=""/><div className={styles.folder}><small>CASE FILE</small><b>๕๐</b><span>สำนวนไทย</span></div><i>✦</i><i>✦</i><i>✦</i></section>
            <section className={styles.startPanel}>
              <b>เลือกระยะภารกิจ</b>
              <div>{[10, 20].map((length) => <button className={`kc-tap ${roundLength === length ? styles.selected : ""}`} key={length} onClick={() => setRoundLength(length)}><strong>{length}</strong><span>ข้อ<br/>{length === 10 ? "ประมาณ 5 นาที" : "ประมาณ 10 นาที"}</span></button>)}</div>
              <button className={`kc-tap ${styles.primary}`} onClick={launch}>เริ่ม{sessionMode === "mixed" ? "เกมผสมทุกแบบ" : MODE_META[sessionMode].label} <span>→</span></button>
              <button className={`kc-tap ${styles.libraryLink}`} onClick={() => { setLibraryPage(0); setScreen("library"); }}>📚 เปิดคลัง {IDIOM_COUNT} สำนวน</button>
            </section>
          </main>
        )}

        {screen === "play" && question && (
          <main className={`${styles.play} ${isRevealMode ? styles.revealPlay : ""}`} data-stage="play" data-mode={question.mode}>
            <div className={styles.progressRow}><span>แฟ้มคดี {position + 1} / {questions.length}</span><div><i style={{ "--progress": `${((position + 1) / questions.length) * 100}%` } as CSSProperties} /></div><b>{MODE_META[question.mode].icon} {MODE_META[question.mode].label}</b></div>
            <section className={`${styles.clueCard} ${isRevealMode ? styles.revealClueCard : ""}`} key={question.idiom.id}>
              <div className={styles.pin} aria-hidden="true" />
              {isRevealMode ? (
                <div className={`${styles.revealPrompt} ${answered ? styles.revealPromptRevealed : ""}`} aria-live="polite">
                  <small>{answered ? "เฉลยสำนวน" : MODE_META[question.mode].instruction}</small>
                  <h2>{answered ? question.idiom.phrase : question.prompt}</h2>
                  {answered && <p>{question.idiom.meaning}</p>}
                </div>
              ) : (
                <>
                  <small>{MODE_META[question.mode].instruction}</small>
                  {question.mode === "emoji" ? <div className={styles.imageClue}><Image src={clueImage(question.idiom.id)} fill sizes="(max-width: 700px) 86vw, 44vw" alt={`ภาพคำใบ้ ${question.idiom.emoji}`} /></div> : <h2>{question.prompt}</h2>}
                </>
              )}
              <span className={styles.caseStamp}>CASE {String(position + 1).padStart(2, "0")}</span>
            </section>
            {!isRevealMode && <section className={styles.answers} aria-label="ตัวเลือกคำตอบ">
              {question.choices.map((choice, index) => {
                const state = answered ? choice === question.answer ? styles.answerCorrect : choice === picked ? styles.answerWrong : styles.answerMuted : "";
                return <button className={`kc-tap ${state}`} key={`${choice}-${index}`} onClick={() => choose(choice)} disabled={answered}><span>{index + 1}</span><span className={styles.choiceText}>{choice}</span><i>{answered && choice === question.answer ? "✓" : answered && choice === picked ? "×" : ""}</i></button>;
              })}
            </section>}
            {isRevealMode && (
              <section className={`${styles.revealActions} ${answered ? styles.revealActionsOpen : ""}`}>
                {!answered ? (
                  <><span>ให้เวลาทั้งห้องช่วยกันคิด แล้วกดเพื่อดูคำตอบ</span><button className={`kc-tap ${styles.revealButton}`} onClick={() => choose(question.answer)}>🔍 เปิดเฉลย</button></>
                ) : (
                  <><span>จำได้แล้ว ลองอ่านสำนวนพร้อมกันอีกหนึ่งรอบ</span><button className={`kc-tap ${styles.nextButton}`} onClick={advance}>{position === questions.length - 1 ? "ดูสรุปผล" : "โจทย์ต่อไป"} →</button></>
                )}
              </section>
            )}
            {!isRevealMode && <section className={`${styles.feedback} ${answered ? styles.feedbackOpen : ""} ${correct ? styles.feedbackGood : styles.feedbackBad}`} role="status" aria-live="polite">
              {answered && <><div>{correct ? <Image className={styles.feedbackMascot} src="/assets/thai-idiom-detective/detective-mascot.webp" width={1200} height={1327} alt=""/> : <span>🧩</span>}<p><b>{correct ? "ไขคดีสำเร็จ!" : `เฉลย: ${question.idiom.phrase}`}</b><small>{question.idiom.meaning}</small></p></div><button className="kc-tap" onClick={advance}>{position === questions.length - 1 ? "ดูสรุปผล" : "คดีต่อไป"} →</button></>}
            </section>}
            {correct && <div className={styles.celebration} aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</div>}
          </main>
        )}

        {screen === "result" && (
          <main className={styles.result} data-stage="result" role="status" aria-live="polite">
            <section className={styles.badge}><Image src="/assets/thai-idiom-detective/detective-mascot.webp" width={1200} height={1327} alt=""/><div>{grade.icon}</div><i/><i/><span>THAI IDIOM<br/>DETECTIVE</span></section>
            <section className={styles.resultCopy}><small>ปิดแฟ้มภารกิจแล้ว</small><h2>{grade.title}</h2><p>{grade.text}</p><div className={styles.stats}><span><b>{questions.length - mistakes.length}/{questions.length}</b>ตอบถูก</span><span><b>{score}</b>คะแนน</span><span><b>{bestStreak}</b>คอมโบสูงสุด</span></div>{mistakes.length > 0 && <div className={styles.review}><b>เบาะแสที่ควรทบทวน</b><p>{mistakes.slice(0, 3).map((item) => item.phrase).join(" • ")}</p></div>}<div className={styles.resultActions}><button className={`kc-tap ${styles.primary}`} onClick={launch}>เล่นอีกครั้ง</button><button className="kc-tap" onClick={() => { setLibraryPage(0); setScreen("library"); }}>เปิดคลังสำนวน</button></div></section>
          </main>
        )}

        {screen === "library" && (
          <main className={styles.library} data-stage="library">
            <div className={styles.libraryHead}><div><small>IDIOM ARCHIVE</small><h2>คลังสำนวนไทย {IDIOM_COUNT} สำนวน</h2></div><button className="kc-tap" onClick={() => setScreen("intro")}>✕ ปิดคลัง</button></div>
            <div className={styles.libraryGrid}>{libraryItems.map((item, index) => <article key={item.id}><span>{libraryPage * 4 + index + 1}</span><div><h3>{item.phrase}</h3><p>{item.meaning}</p></div><b aria-hidden="true">{item.emoji}</b></article>)}</div>
            <div className={styles.libraryNav}><button className="kc-tap" disabled={libraryPage === 0} onClick={() => setLibraryPage((value) => value - 1)}>← ก่อนหน้า</button><span>หน้า <b>{libraryPage + 1}</b> / {libraryPages}</span><button className="kc-tap" disabled={libraryPage === libraryPages - 1} onClick={() => setLibraryPage((value) => value + 1)}>ถัดไป →</button></div>
          </main>
        )}
      </div>
    </div>
  );
}
