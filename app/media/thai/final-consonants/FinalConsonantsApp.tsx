"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KcSfx } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import { CONFUSION_GROUPS, FAMILIES, FAMILY_BY_ID } from "./familyData";
import { generateQuestions } from "./questionGenerator";
import { WORDS } from "./wordData";
import type { FamilyId, GameQuestion } from "./types";
import styles from "./FinalConsonantsApp.module.css";

type Screen = "home" | "lesson" | "check" | "settings" | "game" | "result";
type Variant = "overview" | "kot";

const OVERVIEW_LESSONS = [
  { title: "ตัวสะกดอยู่ตรงไหน", eyebrow: "บทที่ 1 · รู้จักส่วนท้ายของคำ", body: "ตัวสะกดคือพยัญชนะท้ายพยางค์ ลองเปรียบเทียบ จา กับ จาน เมื่อเติม น เสียงท้ายของคำเปลี่ยนไป", kind: "parts" as const },
  { title: "แม่ ก กา และมาตราตรง", eyebrow: "บทที่ 2 · ดูรูปก็ตรงกับเสียง", body: "คำแม่ ก กาไม่มีตัวสะกด ส่วนแม่กง กม เกย และเกอว ใช้ตัวสะกดตรงกับชื่อแม่", kind: "direct" as const },
  { title: "มาตราไม่ตรงมาตรา", eyebrow: "บทที่ 3 · ฟังเสียงก่อนดูตัวอักษร", body: "แม่กก กด กน และกบมีพยัญชนะท้ายได้หลายรูป แต่จัดแม่ตามเสียงท้ายที่เราได้ยิน", kind: "indirect" as const },
  { title: "แผนที่ 9 มาตรา", eyebrow: "บทที่ 4 · สรุปพร้อมเล่น", body: "จำเป็นกลุ่ม: ไม่มีตัวสะกด 1 แม่ ตรงมาตรา 4 แม่ และไม่ตรงมาตรา 4 แม่", kind: "map" as const },
];

const KOT_LESSONS = [
  { title: "ฟังเสียง ด ท้ายคำ", eyebrow: "แม่กด · ตอนที่ 1", body: "พูดคำว่า มด ช้า ๆ เสียงท้ายหยุดสั้นที่ ด แม้คำอื่นจะเขียนตัวสะกดต่างรูป ก็อาจออกเสียงท้ายแบบเดียวกัน", kind: "sound" as const },
  { title: "ตัวสะกดแม่กด 16 ตัว", eyebrow: "แม่กด · ตอนที่ 2", body: "อย่าเพิ่งท่องรวดเดียว ให้เรียนผ่านคำจริงแล้วใช้แผนที่ตัวอักษรนี้ช่วยสรุป", kind: "letters" as const },
  { title: "กด–กก–กบ ต่างกันตรงไหน", eyebrow: "แม่กด · ตอนที่ 3", body: "มดจบเสียง ด นกจบเสียง ก และกบจบเสียง บ ทั้งสามเสียงสั้นเหมือนกัน แต่ตำแหน่งปลายคำต่างกัน", kind: "contrast" as const },
  { title: "คำที่มักจัดแม่ผิด", eyebrow: "แม่กด · ตอนที่ 4", body: "รถ บท กฎ อากาศ และกระดาษ ล้วนอยู่แม่กด เพราะให้อ่านเสียงท้าย ด ไม่ได้จัดตามชื่อตัวอักษร", kind: "mistakes" as const },
];

const CHECK_WORDS: Record<Variant, string[]> = {
  overview: ["kong-ling", "kot-rot", "kon-bun"],
  kot: ["kot-rot", "kok-mek", "kop-phaap"],
};

export default function FinalConsonantsApp({ variant }: { variant: Variant }) {
  useTrackToolUse(variant === "kot" ? "media-thai-mae-kot" : "media-thai-final-consonants");
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const lessons = variant === "kot" ? KOT_LESSONS : OVERVIEW_LESSONS;
  const [screen, setScreen] = useState<Screen>("home");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [checkIndex, setCheckIndex] = useState(0);
  const [checkFeedback, setCheckFeedback] = useState<"wrong" | "correct" | null>(null);
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(10);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [teamCount, setTeamCount] = useState<1 | 2 | 3 | 4>(1);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<"wrong" | "correct" | null>(null);
  const [hadMiss, setHadMiss] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [scores, setScores] = useState([0]);
  const [activeTeam, setActiveTeam] = useState(0);

  const focusFamily = variant === "kot" ? "kot" as const : undefined;
  const current = questions[questionIndex];
  const progress = questions.length ? ((questionIndex + (feedback === "correct" ? 1 : 0)) / questions.length) * 100 : 0;
  const checkWord = WORDS.find((word) => word.id === CHECK_WORDS[variant][checkIndex])!;
  const checkOptions = CONFUSION_GROUPS[FAMILY_BY_ID[checkWord.familyId].confusionGroupId];

  const breakdown = useMemo(() => {
    const result: Partial<Record<FamilyId, { total: number; missed: number }>> = {};
    for (const question of questions) {
      const row = result[question.answer] ?? { total: 0, missed: 0 };
      row.total += 1;
      if (wrongIds.includes(question.id)) row.missed += 1;
      result[question.answer] = row;
    }
    return result;
  }, [questions, wrongIds]);

  const goHome = () => { setScreen("home"); setFeedback(null); setCheckFeedback(null); };
  const startLesson = () => { setLessonIndex(0); setScreen("lesson"); KcSfx.play("whoosh"); };
  const startCheck = () => { setCheckIndex(0); setCheckFeedback(null); setScreen("check"); };
  const startGame = () => {
    const next = generateQuestions({ focusFamily, questionCount, difficulty });
    setQuestions(next); setQuestionIndex(0); setFeedback(null); setHadMiss(false); setFirstTryCorrect(0); setWrongIds([]);
    setScores(Array.from({ length: teamCount }, () => 0)); setActiveTeam(0); setScreen("game"); KcSfx.play("whoosh");
  };
  const answerCheck = (familyId: FamilyId) => {
    if (checkFeedback === "correct") return;
    if (familyId !== checkWord.familyId) { setCheckFeedback("wrong"); KcSfx.play("wrong"); return; }
    setCheckFeedback("correct"); KcSfx.play("correct");
  };
  const nextCheck = () => {
    if (checkIndex + 1 >= CHECK_WORDS[variant].length) { setScreen("settings"); return; }
    setCheckIndex((value) => value + 1); setCheckFeedback(null);
  };
  const answerGame = (familyId: FamilyId) => {
    if (!current || feedback === "correct") return;
    if (familyId !== current.answer) {
      setFeedback("wrong"); setHadMiss(true); setWrongIds((ids) => ids.includes(current.id) ? ids : [...ids, current.id]); KcSfx.play("wrong"); return;
    }
    if (!hadMiss) setFirstTryCorrect((value) => value + 1);
    setScores((values) => values.map((score, index) => index === activeTeam ? score + (hadMiss ? 0 : 1) : score));
    setFeedback("correct"); KcSfx.play("correct");
  };
  const nextQuestion = () => {
    if (questionIndex + 1 >= questions.length) { setScreen("result"); KcSfx.play("win"); return; }
    setQuestionIndex((value) => value + 1); setActiveTeam((value) => (value + 1) % scores.length); setFeedback(null); setHadMiss(false);
  };

  return <div {...stageProps} className="kc-stage"><div className={`kc-stage-body ${styles.app}`}>
    <div className={styles.decor} aria-hidden="true"><span>ก</span><span>ด</span><span>บ</span><span>ง</span></div>
    <header className={styles.toolbar}>
      <button type="button" className={`kc-tap-chrome ${styles.brand}`} onClick={goHome} aria-label="กลับหน้าแรกของสื่อ"><span>🏘️</span><strong>{variant === "kot" ? "บ้านแม่กด" : "หมู่บ้านตัวสะกด"}</strong></button>
      <div className={styles.toolbarActions}><Link className={`kc-tap-chrome ${styles.chromeButton}`} href="/media/thai">☰ <span>สื่อไทย</span></Link><button type="button" className={`kc-tap-chrome ${styles.chromeButton}`} onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>{isFull ? "↙" : "⛶"}</button></div>
    </header>

    {screen === "home" && <main className={`${styles.screen} ${styles.home}`} data-stage="home">
      <div className={styles.heroIcon} aria-hidden="true">{variant === "kot" ? "🛑" : "🏘️"}</div>
      <p className={styles.eyebrow}>ภาษาไทย ป.1–ป.3 · สอนก่อนเล่น</p>
      <h2>{variant === "kot" ? "แม่กด ฟังเสียงให้ชัด" : "หมู่บ้านมาตราตัวสะกด"}</h2>
      <p className={styles.intro}>{variant === "kot" ? "เรียนรู้เสียงท้าย ด และพยัญชนะ 16 ตัว แล้วฝึกแยกแม่กดออกจากแม่กกและแม่กบ" : "เรียนรู้ตัวสะกดทั้ง 9 มาตราทีละขั้น แล้วส่งคำกลับบ้านให้ถูกหลัง"}</p>
      <div className={styles.homeActions}><button type="button" className={`kc-tap ${styles.primary}`} onClick={startLesson}>📖 เริ่มเรียนทีละตอน</button><button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("settings")}>🎮 เคยเรียนแล้ว ไปเล่นเกม</button></div>
      {variant === "kot" && <div className={styles.matchup}><span>แม่กด</span><b>ปะทะ</b><span>แม่กก</span><b>ปะทะ</b><span>แม่กบ</span></div>}
    </main>}

    {screen === "lesson" && <LessonScreen variant={variant} lesson={lessons[lessonIndex]} index={lessonIndex} total={lessons.length} onBack={() => lessonIndex ? setLessonIndex((value) => value - 1) : goHome()} onNext={() => lessonIndex + 1 < lessons.length ? setLessonIndex((value) => value + 1) : startCheck()} />}

    {screen === "check" && <main className={`${styles.screen} ${styles.check}`} data-stage="check" data-answer={checkWord.familyId}>
      <div className={styles.progressText}>เช็กความเข้าใจ {checkIndex + 1}/{CHECK_WORDS[variant].length}</div>
      <p className={styles.eyebrow}>ลองตอบ ไม่คิดคะแนน</p><h2>“{checkWord.word}” อยู่มาตราใด</h2>
      <div className={styles.wordParts}><span>{checkWord.body}</span><strong>{checkWord.final || "—"}</strong></div>
      <div className={styles.answerGrid}>{checkOptions.map((id) => <button key={id} type="button" data-family={id} className={`kc-tap ${styles.houseButton}`} onClick={() => answerCheck(id)} disabled={checkFeedback === "correct"}><span>🏠</span><strong>{FAMILY_BY_ID[id].name}</strong><small>เสียงท้าย {FAMILY_BY_ID[id].endingSound}</small></button>)}</div>
      <div className={styles.feedback} role="status" aria-live="polite">{checkFeedback === "wrong" ? "ลองฟังเสียงท้ายอีกครั้ง แล้วเลือกใหม่" : checkFeedback === "correct" ? `ถูกต้อง ${checkWord.word} อยู่${FAMILY_BY_ID[checkWord.familyId].name}` : "พูดคำช้า ๆ แล้วสังเกตเสียงท้าย"}</div>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("lesson")}>← กลับบทเรียน</button>{checkFeedback !== "correct" && <button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("settings")}>ข้ามไปตั้งค่าเกม</button>}{checkFeedback === "correct" && <button type="button" className={`kc-tap ${styles.primary}`} onClick={nextCheck}>{checkIndex + 1 === CHECK_WORDS[variant].length ? "ตั้งค่าเกม →" : "ข้อต่อไป →"}</button>}</div>
    </main>}

    {screen === "settings" && <main className={`${styles.screen} ${styles.settings}`} data-stage="settings">
      <p className={styles.eyebrow}>ตั้งค่าก่อนส่งคำกลับบ้าน</p><h2>{variant === "kot" ? "เกม กด–กก–กบ" : "เกมทบทวน 9 มาตรา"}</h2>
      <div className={styles.settingGrid}>
        <Setting label="จำนวนคำ">{([5, 10, 15] as const).map((value) => <button key={value} type="button" className={`kc-tap ${questionCount === value ? styles.selected : ""}`} onClick={() => setQuestionCount(value)}>{value} คำ</button>)}</Setting>
        <Setting label="ระดับ">{([1, 2, 3] as const).map((value) => <button key={value} type="button" className={`kc-tap ${difficulty === value ? styles.selected : ""}`} onClick={() => setDifficulty(value)}>{value === 1 ? "เริ่มต้น" : value === 2 ? "ฝึกคล่อง" : "ท้าทาย"}</button>)}</Setting>
        <Setting label="รูปแบบเล่น">{([1, 2, 3, 4] as const).map((value) => <button key={value} type="button" className={`kc-tap ${teamCount === value ? styles.selected : ""}`} onClick={() => setTeamCount(value)}>{value === 1 ? "ทั้งห้อง" : `${value} ทีม`}</button>)}</Setting>
      </div>
      <p className={styles.settingNote}>{variant === "kot" ? "ใน 10 คำจะมีแม่กด 4 คำ แม่กก 3 คำ และแม่กบ 3 คำ จึงต้องฟังจริงก่อนตอบ" : "แต่ละคำจะมาพร้อมบ้านที่เสียงท้ายสับสนกัน 3 หลัง"}</p>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={goHome}>← หน้าแรก</button><button type="button" className={`kc-tap ${styles.primary}`} onClick={startGame}>เริ่มเกม →</button></div>
    </main>}

    {screen === "game" && current && <main className={`${styles.screen} ${styles.game}`} data-stage="game" data-answer={current.answer} data-index={questionIndex} data-total={questions.length}>
      <div className={styles.gameTop}><div className={styles.progressTrack}><span style={{ "--progress" : `${progress}%` } as React.CSSProperties} /></div><strong>{questionIndex + 1}/{questions.length}</strong>{scores.length > 1 && <span>ทีม {activeTeam + 1} · {scores[activeTeam]} คะแนน</span>}</div>
      <section className={styles.question} role="status" aria-live="polite"><p>พูดคำช้า ๆ แล้วเลือกบ้าน</p><h2>{current.word.word}</h2><div className={styles.wordParts}><span>{difficulty === 1 || feedback ? current.word.body : current.word.word}</span>{(difficulty === 1 || feedback) && <strong>{current.word.final || "—"}</strong>}</div></section>
      <div className={styles.answerGrid}>{current.options.map((id) => <button key={id} type="button" data-family={id} className={`kc-tap ${styles.houseButton} ${feedback === "correct" && id === current.answer ? styles.correct : ""}`} onClick={() => answerGame(id)} disabled={feedback === "correct"}><span>🏠</span><strong>{FAMILY_BY_ID[id].name}</strong><small>เสียงท้าย {FAMILY_BY_ID[id].endingSound}</small></button>)}</div>
      <div className={`${styles.feedback} ${feedback ? styles.feedbackShown : ""}`} role="status" aria-live="polite">{feedback === "wrong" ? `ยังไม่ใช่ ลองออกเสียง “${current.word.word}” ช้า ๆ อีกครั้ง` : feedback === "correct" ? `${current.word.word} อยู่${FAMILY_BY_ID[current.answer].name} เพราะจบเสียง ${FAMILY_BY_ID[current.answer].endingSound}` : "เลือกคำตอบได้หนึ่งบ้าน"}</div>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("settings")}>หยุดเกม</button>{feedback === "correct" && <button type="button" className={`kc-tap ${styles.primary}`} onClick={nextQuestion}>{questionIndex + 1 === questions.length ? "ดูผล →" : "คำถัดไป →"}</button>}</div>
    </main>}

    {screen === "result" && <main className={`${styles.screen} ${styles.result}`} data-stage="result">
      <div className={styles.trophy} aria-hidden="true">🏆</div><p className={styles.eyebrow}>จบภารกิจแล้ว</p><h2>ถูกครั้งแรก {firstTryCorrect}/{questions.length}</h2>
      <p className={styles.resultLead}>ข้อที่ลองใหม่จนถูกนับแยกไว้ เพื่อให้ครูเห็นมาตราที่ควรทบทวนจริง</p>
      <div className={styles.breakdown}>{Object.entries(breakdown).map(([id, row]) => <div key={id}><strong>{FAMILY_BY_ID[id as FamilyId].name}</strong><span>{row!.missed ? `ควรทบทวน ${row!.missed} คำ` : `ผ่าน ${row!.total}/${row!.total}`}</span></div>)}</div>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={startLesson}>ทบทวนบทเรียน</button><button type="button" className={`kc-tap ${styles.primary}`} onClick={startGame}>เล่นอีกครั้ง</button></div>
    </main>}
  </div></div>;
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return <fieldset className={styles.setting}><legend>{label}</legend><div>{children}</div></fieldset>;
}

function LessonScreen({ variant, lesson, index, total, onBack, onNext }: { variant: Variant; lesson: (typeof OVERVIEW_LESSONS)[number] | (typeof KOT_LESSONS)[number]; index: number; total: number; onBack: () => void; onNext: () => void }) {
  return <main className={`${styles.screen} ${styles.lesson}`} data-stage={`lesson-${lesson.kind}`}>
    <div className={styles.lessonTop}><span>{lesson.eyebrow}</span><strong>{index + 1}/{total}</strong></div><h2>{lesson.title}</h2><p className={styles.lessonBody}>{lesson.body}</p>
    <div className={styles.lessonVisual}>
      {lesson.kind === "parts" && <><div className={styles.bigParts}><span>จ</span><b>า</b><strong>น</strong><i>→</i><em>จาน</em></div><p>พยัญชนะต้น + สระ + <mark>ตัวสะกด</mark></p></>}
      {lesson.kind === "direct" && <FamilyCards ids={["kaa", "kong", "kom", "koei", "koew"]} />}
      {lesson.kind === "indirect" && <FamilyCards ids={["kok", "kot", "kon", "kop"]} />}
      {lesson.kind === "map" && <FamilyCards ids={FAMILIES.map((family) => family.id)} compact />}
      {lesson.kind === "sound" && <><div className={styles.soundCompare}><span>ม</span><strong>ด</strong></div><p>มด → เสียงท้าย <mark>ด</mark> → แม่กด</p></>}
      {lesson.kind === "letters" && <div className={styles.letterMap}>{FAMILY_BY_ID.kot.consonants.map((letter) => <span key={letter}>{letter}</span>)}</div>}
      {lesson.kind === "contrast" && <div className={styles.contrast}>{[["มด", "kot"], ["นก", "kok"], ["กบ", "kop"]].map(([word, id]) => <div key={word}><strong>{word}</strong><span>{FAMILY_BY_ID[id as FamilyId].name}</span><small>เสียง {FAMILY_BY_ID[id as FamilyId].endingSound}</small></div>)}</div>}
      {lesson.kind === "mistakes" && <div className={styles.mistakes}>{FAMILY_BY_ID.kot.seo.commonErrors.map((item) => <div key={item.word}><strong>{item.word}</strong><span>{item.explanation}</span></div>)}</div>}
    </div>
    <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={onBack}>← {index ? "ตอนก่อนหน้า" : "หน้าแรก"}</button><button type="button" className={`kc-tap ${styles.primary}`} onClick={onNext}>{index + 1 === total ? "เช็กความเข้าใจ →" : "ตอนถัดไป →"}</button></div>
    {variant === "kot" && index === 2 && <p className={styles.teacherTip}>ครูชวนเด็กออกเสียง มด–นก–กบ โดยไม่บอกชื่อแม่ก่อน แล้วถามว่าปากหยุดต่างกันตรงไหน</p>}
  </main>;
}

function FamilyCards({ ids, compact = false }: { ids: FamilyId[]; compact?: boolean }) {
  return <div className={`${styles.familyCards} ${compact ? styles.compactCards : ""}`}>{ids.map((id) => { const family = FAMILY_BY_ID[id]; const sample = WORDS.find((word) => word.familyId === id)!; return <div key={id} style={{ "--family-color": family.color } as React.CSSProperties}><strong>{family.name}</strong><span>{family.endingSound}</span><small>{sample.word}</small></div>; })}</div>;
}
