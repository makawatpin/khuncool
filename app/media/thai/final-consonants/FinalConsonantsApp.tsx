"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { hoverSfxDelegate, KcSfx, speakThai } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import { CONFUSION_GROUPS, FAMILIES, FAMILY_BY_ID } from "./familyData";
import { generateQuestions } from "./questionGenerator";
import { WORDS } from "./wordData";
import type { FamilyId, GameQuestion } from "./types";
import styles from "./FinalConsonantsApp.module.css";

type Screen = "home" | "lesson" | "check" | "settings" | "game" | "result";
type Variant = "overview" | FamilyId;

const OVERVIEW_LESSONS = [
  { title: "ตัวสะกดอยู่ตรงไหน", eyebrow: "บทที่ 1 · รู้จักส่วนท้ายของคำ", body: "ตัวสะกดคือพยัญชนะท้ายพยางค์ ลองเปรียบเทียบ จา กับ จาน เมื่อเติม น เสียงท้ายของคำเปลี่ยนไป", kind: "parts" as const },
  { title: "แม่ ก กา และมาตราตรง", eyebrow: "บทที่ 2 · ดูรูปก็ตรงกับเสียง", body: "คำแม่ ก กาไม่มีตัวสะกด ส่วนแม่กง กม เกย และเกอว ใช้ตัวสะกดตรงกับชื่อแม่", kind: "direct" as const },
  { title: "มาตราไม่ตรงมาตรา", eyebrow: "บทที่ 3 · ฟังเสียงก่อนดูตัวอักษร", body: "แม่กก กด กน และกบมีพยัญชนะท้ายได้หลายรูป แต่จัดแม่ตามเสียงท้ายที่เราได้ยิน", kind: "indirect" as const },
  { title: "แผนที่ 9 มาตรา", eyebrow: "บทที่ 4 · สรุปพร้อมเล่น", body: "จำเป็นกลุ่ม: ไม่มีตัวสะกด 1 แม่ ตรงมาตรา 4 แม่ และไม่ตรงมาตรา 4 แม่", kind: "map" as const },
];

type Lesson = (typeof OVERVIEW_LESSONS)[number] | { title: string; eyebrow: string; body: string; kind: "sound" | "letters" | "contrast" | "mistakes" };

function familyLessons(familyId: FamilyId): Lesson[] {
  const family = FAMILY_BY_ID[familyId];
  const sample = WORDS.find((word) => word.familyId === familyId)!;
  const groupNames = CONFUSION_GROUPS[family.confusionGroupId].map((id) => FAMILY_BY_ID[id].shortName).join("–");
  const lettersTitle = family.consonants.length ? `ตัวสะกด${family.name} ${family.consonants.length} ตัว` : "คำที่ไม่มีตัวสะกด";
  return [
    { title: familyId === "kaa" ? "ฟังเสียงที่จบด้วยสระ" : `ฟังเสียง ${family.endingSound} ท้ายคำ`, eyebrow: `${family.name} · ตอนที่ 1`, body: `พูดคำว่า ${sample.word} ช้า ๆ ${family.seo.soundExplanation}`, kind: "sound" },
    { title: lettersTitle, eyebrow: `${family.name} · ตอนที่ 2`, body: family.seo.consonantExplanation, kind: "letters" },
    { title: `${groupNames} ต่างกันตรงไหน`, eyebrow: `${family.name} · ตอนที่ 3`, body: family.seo.contrastExplanation, kind: "contrast" },
    { title: "คำที่มักจัดแม่ผิด", eyebrow: `${family.name} · ตอนที่ 4`, body: family.commonMistake, kind: "mistakes" },
  ];
}

function checkWordIds(focusFamily?: FamilyId) {
  if (!focusFamily) return ["kong-ling", "kot-rot", "kon-bun"];
  const family = FAMILY_BY_ID[focusFamily];
  const ids = CONFUSION_GROUPS[family.confusionGroupId];
  const ordered = [focusFamily, ...ids.filter((id) => id !== focusFamily)];
  return ordered.map((id) => WORDS.find((word) => word.familyId === id && word.usage.includes("check"))?.id ?? WORDS.find((word) => word.familyId === id)!.id);
}

export default function FinalConsonantsApp({ variant }: { variant: Variant }) {
  const focusFamily = variant === "overview" ? undefined : variant;
  const family = focusFamily ? FAMILY_BY_ID[focusFamily] : undefined;
  useTrackToolUse(family ? `media-thai-mae-${family.id}` : "media-thai-final-consonants");
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const lessons = family ? familyLessons(family.id) : OVERVIEW_LESSONS;
  const checkWords = checkWordIds(focusFamily);
  const availableFamilies = family ? CONFUSION_GROUPS[family.confusionGroupId] : [];
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
  const [comparisonFamilies, setComparisonFamilies] = useState<FamilyId[]>(() => availableFamilies);
  const [showHints, setShowHints] = useState(true);

  const current = questions[questionIndex];
  const progress = questions.length ? ((questionIndex + (feedback === "correct" ? 1 : 0)) / questions.length) * 100 : 0;
  const checkWord = WORDS.find((word) => word.id === checkWords[checkIndex])!;
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
  const reviewFamily = useMemo(() => Object.entries(breakdown).reduce<{ id?: FamilyId; missed: number }>((worst, [id, row]) => row!.missed > worst.missed ? { id: id as FamilyId, missed: row!.missed } : worst, { missed: 0 }), [breakdown]);

  const goHome = () => { setScreen("home"); setFeedback(null); setCheckFeedback(null); };
  const startLesson = () => { setLessonIndex(0); setScreen("lesson"); KcSfx.play("whoosh"); };
  const startCheck = () => { setCheckIndex(0); setCheckFeedback(null); setScreen("check"); };
  const startGame = () => {
    const next = generateQuestions({ focusFamily, comparisonFamilies: family ? comparisonFamilies : undefined, questionCount, difficulty });
    setQuestions(next); setQuestionIndex(0); setFeedback(null); setHadMiss(false); setFirstTryCorrect(0); setWrongIds([]);
    setScores(Array.from({ length: teamCount }, () => 0)); setActiveTeam(0); setScreen("game"); KcSfx.play("whoosh");
  };
  const answerCheck = (familyId: FamilyId) => {
    if (checkFeedback === "correct") return;
    if (familyId !== checkWord.familyId) { setCheckFeedback("wrong"); KcSfx.play("wrong"); return; }
    setCheckFeedback("correct"); KcSfx.play("correct");
  };
  const nextCheck = () => {
    if (checkIndex + 1 >= checkWords.length) { setScreen("settings"); return; }
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
  const toggleComparison = (id: FamilyId) => {
    if (!family || id === family.id) return;
    setComparisonFamilies((selected) => selected.includes(id)
      ? selected.length > 2 ? selected.filter((item) => item !== id) : selected
      : availableFamilies.filter((item) => selected.includes(item) || item === id));
  };
  const retryMistakes = () => {
    const missed = questions.filter((question) => wrongIds.includes(question.id)).map((question, index) => ({ ...question, id: `retry-${index}-${question.word.id}` }));
    if (!missed.length) return;
    setQuestions(missed); setQuestionIndex(0); setFeedback(null); setHadMiss(false); setFirstTryCorrect(0); setWrongIds([]); setScores(Array.from({ length: teamCount }, () => 0)); setActiveTeam(0); setScreen("game"); KcSfx.play("whoosh");
  };

  const groupIds = family ? CONFUSION_GROUPS[family.confusionGroupId] : [];
  const groupLabel = groupIds.map((id) => FAMILY_BY_ID[id].shortName).join("–");

  return <div {...stageProps} className="kc-stage"><div className={`kc-stage-body ${styles.app}`} data-variant={variant} data-family={focusFamily} onMouseOver={hoverSfxDelegate}>
    <div className={styles.decor} aria-hidden="true"><span>ก</span><span>ด</span><span>บ</span><span>ง</span></div>
    <header className={styles.toolbar}>
      <button type="button" className={`kc-tap-chrome ${styles.brand}`} onClick={goHome} aria-label="กลับหน้าแรกของสื่อ"><span>🏘️</span><strong>{family ? `บ้าน${family.name}` : "หมู่บ้านตัวสะกด"}</strong></button>
      <div className={styles.toolbarActions}><Link className={`kc-tap-chrome ${styles.chromeButton}`} href="/media/thai">☰ <span>สื่อไทย</span></Link><button type="button" className={`kc-tap-chrome ${styles.chromeButton}`} onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>{isFull ? "↙" : "⛶"}</button></div>
    </header>

    {screen === "home" && <main className={`${styles.screen} ${styles.home}`} data-stage="home">
      <div className={styles.heroIcon} aria-hidden="true">{family ? "🔤" : "🏘️"}</div>
      <p className={styles.eyebrow}>ภาษาไทย ป.1–ป.3 · สอนก่อนเล่น</p>
      <h2>{family ? `${family.name} ฟังเสียงให้ชัด` : "หมู่บ้านมาตราตัวสะกด"}</h2>
      <p className={styles.intro}>{family ? `${family.teachingTip} ฝึกจากคำจริง แล้วแยก${family.name}ออกจากแม่ที่มักสับสน` : "เรียนรู้ตัวสะกดทั้ง 9 มาตราทีละขั้น แล้วส่งคำกลับบ้านให้ถูกหลัง"}</p>
      <div className={styles.homeActions}><button type="button" className={`kc-tap ${styles.primary}`} onClick={startLesson}>📖 เริ่มเรียนทีละตอน</button><button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("settings")}>🎮 เคยเรียนแล้ว ไปเล่นเกม</button></div>
      {family && <div className={styles.matchup}>{groupIds.map((id, index) => <span key={id}>{index > 0 ? "ปะทะ " : ""}{FAMILY_BY_ID[id].name}</span>)}</div>}
    </main>}

    {screen === "lesson" && <LessonScreen variant={variant} lesson={lessons[lessonIndex]} index={lessonIndex} total={lessons.length} onBack={() => lessonIndex ? setLessonIndex((value) => value - 1) : goHome()} onNext={() => lessonIndex + 1 < lessons.length ? setLessonIndex((value) => value + 1) : startCheck()} />}

    {screen === "check" && <main className={`${styles.screen} ${styles.check}`} data-stage="check" data-answer={checkWord.familyId}>
      <div className={styles.progressText}>เช็กความเข้าใจ {checkIndex + 1}/{checkWords.length}</div>
      <p className={styles.eyebrow}>ลองตอบ ไม่คิดคะแนน</p><h2>“{checkWord.word}” อยู่มาตราใด</h2>
      <div className={styles.wordTools}><div className={styles.wordVisual} aria-hidden="true">{checkWord.visual}</div><div className={styles.listenActions}><button type="button" className={`kc-tap ${styles.listenButton}`} onClick={() => speakThai(checkWord.word)}>🔊 ฟังคำ</button><button type="button" className={`kc-tap ${styles.listenButton}`} onClick={() => speakThai(checkWord.word, true)}>🐢 ฟังช้า ๆ</button></div></div>
      <div className={styles.wordParts}><span>{checkWord.body}</span><strong>{checkWord.final || "—"}</strong></div>
      <div className={styles.answerGrid}>{checkOptions.map((id) => <button key={id} type="button" data-family={id} className={`kc-tap ${styles.houseButton}`} onClick={() => answerCheck(id)} disabled={checkFeedback === "correct"}><span>🏠</span><strong>{FAMILY_BY_ID[id].name}</strong><small>เสียงท้าย {FAMILY_BY_ID[id].endingSound}</small></button>)}</div>
      <div className={styles.feedback} role="status" aria-live="polite">{checkFeedback === "wrong" ? `ลองใหม่: ${FAMILY_BY_ID[checkWord.familyId].teachingTip}` : checkFeedback === "correct" ? `✨ ถูกต้อง ${checkWord.word} อยู่${FAMILY_BY_ID[checkWord.familyId].name}` : "พูดคำช้า ๆ แล้วสังเกตเสียงท้าย"}</div>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("lesson")}>← กลับบทเรียน</button>{checkFeedback !== "correct" && <button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("settings")}>ข้ามไปตั้งค่าเกม</button>}{checkFeedback === "correct" && <button type="button" className={`kc-tap ${styles.primary}`} onClick={nextCheck}>{checkIndex + 1 === checkWords.length ? "ตั้งค่าเกม →" : "ข้อต่อไป →"}</button>}</div>
    </main>}

    {screen === "settings" && <main className={`${styles.screen} ${styles.settings}`} data-stage="settings">
      <p className={styles.eyebrow}>ตั้งค่าก่อนส่งคำกลับบ้าน</p><h2>{family ? `เกม ${groupLabel}` : "เกมทบทวน 9 มาตรา"}</h2>
      <div className={styles.settingGrid}>
        <Setting label="จำนวนคำ">{([5, 10, 15] as const).map((value) => <button key={value} type="button" className={`kc-tap ${questionCount === value ? styles.selected : ""}`} onClick={() => setQuestionCount(value)}>{value} คำ</button>)}</Setting>
        <Setting label="ระดับ">{([1, 2, 3] as const).map((value) => <button key={value} type="button" className={`kc-tap ${difficulty === value ? styles.selected : ""}`} onClick={() => setDifficulty(value)}>{value === 1 ? "เริ่มต้น" : value === 2 ? "ฝึกคล่อง" : "ท้าทาย"}</button>)}</Setting>
        <Setting label="รูปแบบเล่น">{([1, 2, 3, 4] as const).map((value) => <button key={value} type="button" className={`kc-tap ${teamCount === value ? styles.selected : ""}`} onClick={() => setTeamCount(value)}>{value === 1 ? "ทั้งห้อง" : `${value} ทีม`}</button>)}</Setting>
      </div>
      {family && <section className={styles.teacherPanel} aria-label="โหมดครู"><div><strong>👩‍🏫 โหมดครู: เลือกบ้านเปรียบเทียบ</strong><small>แม่หลักล็อกไว้ และเลือกอย่างน้อย 2 บ้าน</small></div><div className={styles.familyToggles}>{availableFamilies.map((id) => <button key={id} type="button" className={`kc-tap ${comparisonFamilies.includes(id) ? styles.selected : ""}`} aria-pressed={comparisonFamilies.includes(id)} disabled={id === family.id} onClick={() => toggleComparison(id)}>{FAMILY_BY_ID[id].name}</button>)}</div><button type="button" className={`kc-tap ${styles.hintToggle} ${showHints ? styles.selected : ""}`} aria-pressed={showHints} onClick={() => setShowHints((value) => !value)}>{showHints ? "✓ เปิดคำใบ้" : "ปิดคำใบ้"}</button></section>}
      <p className={styles.settingNote}>{family ? `ใน 10 คำจะมี${family.name} 4 คำ และอีกสองแม่อย่างละ 3 คำ จึงต้องฟังจริงก่อนตอบ` : "แต่ละคำจะมาพร้อมบ้านที่เสียงท้ายสับสนกัน 3 หลัง"}</p>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={goHome}>← หน้าแรก</button><button type="button" className={`kc-tap ${styles.primary}`} onClick={startGame}>เริ่มเกม →</button></div>
    </main>}

    {screen === "game" && current && <main className={`${styles.screen} ${styles.game}`} data-stage="game" data-answer={current.answer} data-index={questionIndex} data-total={questions.length}>
      <div className={styles.gameTop}><div className={styles.progressTrack}><span style={{ "--progress" : `${progress}%` } as React.CSSProperties} /></div><strong>{questionIndex + 1}/{questions.length}</strong>{scores.length > 1 && <span>ทีม {activeTeam + 1} · {scores[activeTeam]} คะแนน</span>}</div>
      <section className={styles.question} role="status" aria-live="polite"><p>พูดคำช้า ๆ แล้วเลือกบ้าน</p><h2>{current.word.word}</h2><div className={styles.wordTools}><div className={styles.wordVisual} aria-hidden="true">{current.word.visual}</div><div className={styles.listenActions}><button type="button" className={`kc-tap ${styles.listenButton}`} onClick={() => speakThai(current.word.word)}>🔊 ฟังคำ</button><button type="button" className={`kc-tap ${styles.listenButton}`} onClick={() => speakThai(current.word.word, true)}>🐢 ช้า ๆ</button></div></div><div className={styles.wordParts}><span>{difficulty === 1 || feedback ? current.word.body : current.word.word}</span>{(difficulty === 1 || feedback) && <strong>{current.word.final || "—"}</strong>}</div></section>
      <div className={styles.answerGrid}>{current.options.map((id) => <button key={id} type="button" data-family={id} className={`kc-tap ${styles.houseButton} ${feedback === "correct" && id === current.answer ? styles.correct : ""}`} onClick={() => answerGame(id)} disabled={feedback === "correct"}><span>🏠</span><strong>{FAMILY_BY_ID[id].name}</strong><small>เสียงท้าย {FAMILY_BY_ID[id].endingSound}</small></button>)}</div>
      <div className={`${styles.feedback} ${feedback ? styles.feedbackShown : ""}`} role="status" aria-live="polite">{feedback === "wrong" ? `ยังไม่ใช่${showHints ? ` — ${current.word.final ? `ตัว ${current.word.final} ท้ายคำออกเสียง ${FAMILY_BY_ID[current.answer].endingSound}` : "คำนี้จบที่เสียงสระ ไม่มีตัวสะกด"}` : " ลองฟังอีกครั้ง"}` : feedback === "correct" ? <><span className={styles.celebration} aria-hidden="true">✨ ⭐ ✨</span>{current.word.word} อยู่{FAMILY_BY_ID[current.answer].name} เพราะจบเสียง {FAMILY_BY_ID[current.answer].endingSound}</> : "เลือกคำตอบได้หนึ่งบ้าน"}</div>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={() => setScreen("settings")}>หยุดเกม</button>{feedback === "correct" && <button type="button" className={`kc-tap ${styles.primary}`} onClick={nextQuestion}>{questionIndex + 1 === questions.length ? "ดูผล →" : "คำถัดไป →"}</button>}</div>
    </main>}

    {screen === "result" && <main className={`${styles.screen} ${styles.result}`} data-stage="result">
      <div className={styles.trophy} aria-hidden="true">🏆</div><p className={styles.eyebrow}>จบภารกิจแล้ว</p><h2>ถูกครั้งแรก {firstTryCorrect}/{questions.length}</h2>
      <p className={styles.resultLead}>{wrongIds.length ? `แนะนำให้ทบทวน ${reviewFamily.id ? FAMILY_BY_ID[reviewFamily.id].name : "คำที่พลาด"} แล้วฝึกเฉพาะคำที่ตอบผิด` : "ยอดเยี่ยม ผ่านทุกคำโดยไม่ต้องลองใหม่"}</p>
      <div className={styles.breakdown}>{Object.entries(breakdown).map(([id, row]) => <div key={id}><strong>{FAMILY_BY_ID[id as FamilyId].name}</strong><span>{row!.missed ? `ควรทบทวน ${row!.missed} คำ` : `ผ่าน ${row!.total}/${row!.total}`}</span></div>)}</div>
      <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={startLesson}>ทบทวนบทเรียน</button>{wrongIds.length > 0 && <button type="button" className={`kc-tap ${styles.secondary}`} onClick={retryMistakes}>ฝึกเฉพาะคำที่ผิด</button>}<button type="button" className={`kc-tap ${styles.primary}`} onClick={startGame}>เล่นอีกครั้ง</button></div>
    </main>}
  </div></div>;
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return <fieldset className={styles.setting}><legend>{label}</legend><div>{children}</div></fieldset>;
}

function LessonScreen({ variant, lesson, index, total, onBack, onNext }: { variant: Variant; lesson: Lesson; index: number; total: number; onBack: () => void; onNext: () => void }) {
  const family = variant === "overview" ? undefined : FAMILY_BY_ID[variant];
  const sample = family ? WORDS.find((word) => word.familyId === family.id)! : undefined;
  const contrastWords = family ? CONFUSION_GROUPS[family.confusionGroupId].map((id) => [WORDS.find((word) => word.familyId === id)!.word, id] as const) : [];
  return <main className={`${styles.screen} ${styles.lesson}`} data-stage={`lesson-${lesson.kind}`}>
    <div className={styles.lessonTop}><span>{lesson.eyebrow}</span><strong>{index + 1}/{total}</strong></div><h2>{lesson.title}</h2><p className={styles.lessonBody}>{lesson.body}</p>
    <div className={styles.lessonVisual}>
      {lesson.kind === "parts" && <><div className={styles.bigParts}><span>จ</span><b>า</b><strong>น</strong><i>→</i><em>จาน</em></div><p>พยัญชนะต้น + สระ + <mark>ตัวสะกด</mark></p></>}
      {lesson.kind === "direct" && <FamilyCards ids={["kaa", "kong", "kom", "koei", "koew"]} />}
      {lesson.kind === "indirect" && <FamilyCards ids={["kok", "kot", "kon", "kop"]} />}
      {lesson.kind === "map" && <FamilyCards ids={FAMILIES.map((family) => family.id)} compact />}
      {lesson.kind === "sound" && sample && family && <><div className={styles.wordVisual} aria-hidden="true">{sample.visual}</div><div className={styles.soundCompare}><span>{sample.body}</span><strong>{sample.final || "—"}</strong></div><div className={styles.listenActions}><button type="button" className={`kc-tap ${styles.listenButton}`} onClick={() => speakThai(sample.word)}>🔊 ฟังคำ</button><button type="button" className={`kc-tap ${styles.listenButton}`} onClick={() => speakThai(sample.word, true)}>🐢 ฟังช้า ๆ</button></div><p>{sample.word} → เสียงท้าย <mark>{family.endingSound}</mark> → {family.name}</p></>}
      {lesson.kind === "letters" && family && (family.consonants.length ? <div className={styles.letterMap}>{family.consonants.map((letter) => <span key={letter}>{letter}</span>)}</div> : <FamilyCards ids={[family.id]} />)}
      {lesson.kind === "contrast" && <div className={styles.contrast}>{contrastWords.map(([word, id]) => <div key={word}><strong>{word}</strong><span>{FAMILY_BY_ID[id].name}</span><small>เสียง {FAMILY_BY_ID[id].endingSound}</small></div>)}</div>}
      {lesson.kind === "mistakes" && family && <div className={styles.mistakes}>{family.seo.commonErrors.map((item) => <div key={item.word}><strong>{item.word}</strong><span>{item.explanation}</span></div>)}</div>}
    </div>
    <div className={styles.bottomActions}><button type="button" className={`kc-tap ${styles.secondary}`} onClick={onBack}>← {index ? "ตอนก่อนหน้า" : "หน้าแรก"}</button><button type="button" className={`kc-tap ${styles.primary}`} onClick={onNext}>{index + 1 === total ? "เช็กความเข้าใจ →" : "ตอนถัดไป →"}</button></div>
    {family && index === 2 && <p className={styles.teacherTip}>{family.seo.classroomActivity}</p>}
  </main>;
}

function FamilyCards({ ids, compact = false }: { ids: FamilyId[]; compact?: boolean }) {
  return <div className={`${styles.familyCards} ${compact ? styles.compactCards : ""}`}>{ids.map((id) => { const family = FAMILY_BY_ID[id]; const sample = WORDS.find((word) => word.familyId === id)!; return <div key={id} style={{ "--family-color": family.color } as React.CSSProperties}><strong>{family.name}</strong><span>{family.endingSound}</span><small>{sample.word}</small></div>; })}</div>;
}
