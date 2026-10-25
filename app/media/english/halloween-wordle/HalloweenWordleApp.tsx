"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, hoverSfxDelegate, speakEnglish } from "@/lib/kcSfx";
import { useStage } from "../../_stage/useStage";
import {
  LENGTH_INFO,
  ROUND_SIZE,
  WORDS,
  WORD_LENGTHS,
  type HalloweenWord,
  type WordLength,
} from "./wordData";
import {
  MAX_GUESSES,
  MAX_HINTS,
  evaluateGuess,
  keyboardStates,
  pickRound,
  starsFor,
  type LetterState,
} from "./wordleLogic";
import styles from "./HalloweenWordleApp.module.css";

const LS_KEY = "kc-halloween-wordle-v1";
const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const STATE_TH: Record<LetterState, string> = {
  correct: "ถูกตำแหน่ง",
  present: "มีในคำแต่ผิดตำแหน่ง",
  absent: "ไม่มีในคำ",
};

type Screen = "menu" | "play" | "summary";
type Phase = "playing" | "won" | "lost";
type WordResult = { word: HalloweenWord; solved: boolean; guesses: number; hints: number; stars: number };
/** Keyed by length and mode ("5a" = 5 letters, assisted) so the two never mix. */
type BestScores = Record<string, number>;
const bestKey = (len: WordLength, assist: boolean) => `${len}${assist ? "a" : "c"}`;

const starText = (n: number) => "★".repeat(n) + "☆".repeat(3 - n);

export default function HalloweenWordleApp() {
  useTrackToolUse("media-english-halloween-wordle");
  const { stageProps, isFull, toggle: toggleFull } = useStage<HTMLDivElement>();

  const [screen, setScreen] = useState<Screen>("menu");
  const [length, setLength] = useState<WordLength>(5);
  const [round, setRound] = useState<HalloweenWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [hints, setHints] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [results, setResults] = useState<WordResult[]>([]);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState<BestScores>({});
  /* Assisted play is the default: picture, Thai meaning and sentence are all
     showing, the first letter is filled in, and the word is read aloud. Young
     players should meet the colour rules first, not a blank board. */
  const [assist, setAssist] = useState(true);

  const word = round[idx];
  const answer = word?.en ?? "";
  const totalStars = results.reduce((sum, r) => sum + r.stars, 0);
  const keyStates = word ? keyboardStates(guesses, answer) : {};

  /* localStorage is read after mount so the server render and the first client
     render agree; it can also throw (private mode), so every access is guarded. */
  useEffect(() => {
    const load = window.setTimeout(() => {
      setMuted(KcSfx.isMuted());
      try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (raw) setBest((JSON.parse(raw) as { best?: BestScores }).best ?? {});
      } catch {
        /* the game works without saved scores */
      }
    }, 0);
    return () => window.clearTimeout(load);
  }, []);

  const saveBest = useCallback((next: BestScores) => {
    setBest(next);
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify({ best: next }));
    } catch {
      /* ignore */
    }
  }, []);

  const startRound = useCallback(
    (len: WordLength) => {
      const picked = pickRound(WORDS[len], ROUND_SIZE);
      setLength(len);
      setRound(picked);
      setIdx(0);
      setGuesses([]);
      setCurrent(assist ? picked[0].en[0] : "");
      setHints(0);
      setPhase("playing");
      setResults([]);
      setMessage(
        assist
          ? "ดูรูป ฟังเสียง แล้วพิมพ์ตัวอักษรที่เหลือ ตัวแรกใส่ให้แล้ว"
          : `ทายคำที่มี ${len} ตัวอักษร ทายได้ ${MAX_GUESSES} ครั้ง`,
      );
      setScreen("play");
      KcSfx.play("whoosh");
    },
    [assist],
  );

  const finishWord = useCallback(
    (solved: boolean, guessCount: number, hintCount: number) => {
      if (!word) return;
      const stars = starsFor(solved, guessCount, hintCount);
      setResults((prev) => [...prev, { word, solved, guesses: guessCount, hints: hintCount, stars }]);
      setPhase(solved ? "won" : "lost");
      setMessage(
        solved
          ? `เก่งมาก! ${word.en.toUpperCase()} แปลว่า ${word.th} ได้ ${stars} ดาว`
          : `เสียดาย คำตอบคือ ${word.en.toUpperCase()} แปลว่า ${word.th}`,
      );
      KcSfx.play(solved ? "win" : "lose");
      if (!KcSfx.isMuted()) window.setTimeout(() => speakEnglish(word.en, true), 700);
    },
    [word],
  );

  const typeLetter = useCallback(
    (letter: string) => {
      if (screen !== "play" || phase !== "playing") return;
      if (current.length >= length) return;
      setCurrent((c) => c + letter.toLowerCase());
      KcSfx.play("tick");
    },
    [screen, phase, current.length, length],
  );

  const deleteLetter = useCallback(() => {
    if (screen !== "play" || phase !== "playing") return;
    // The assisted first letter is given, not guessed, so it cannot be deleted.
    setCurrent((c) => (c.length > (assist ? 1 : 0) ? c.slice(0, -1) : c));
  }, [screen, phase, assist]);

  const submit = useCallback(() => {
    if (screen !== "play" || phase !== "playing" || !word) return;
    if (current.length < length) {
      setMessage(`ใส่ให้ครบ ${length} ตัวอักษรก่อนนะ`);
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      KcSfx.play("wrong");
      return;
    }
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent(assist ? word.en[0] : "");
    // Hints only cost stars in the challenge mode; assisted play has none to spend.
    const hintCount = assist ? 0 : hints;
    if (current === word.en) {
      finishWord(true, next.length, hintCount);
    } else if (next.length >= MAX_GUESSES) {
      finishWord(false, next.length, hintCount);
    } else {
      const states = evaluateGuess(current, word.en);
      const right = states.filter((s) => s === "correct").length;
      const misplaced = states.filter((s) => s === "present").length;
      setMessage(
        `ครั้งที่ ${next.length}: ถูกที่ ${right} ตัว · มีแต่ผิดที่ ${misplaced} ตัว — ลองใหม่ได้เลย`,
      );
      KcSfx.play("pop");
    }
  }, [screen, phase, word, current, length, guesses, hints, assist, finishWord]);

  const revealHint = useCallback(() => {
    if (phase !== "playing" || hints >= MAX_HINTS) return;
    const next = hints + 1;
    setHints(next);
    setMessage(
      next === 1
        ? "ใบ้แรก: ดูรูป (ฟรี ไม่เสียดาว)"
        : `ใบ้ที่ ${next}: ใช้แล้วเสีย 1 ดาว`,
    );
    KcSfx.play("pop");
  }, [phase, hints]);

  const nextWord = useCallback(() => {
    if (phase === "playing") return;
    if (idx + 1 >= round.length) {
      const total = results.reduce((sum, r) => sum + r.stars, 0);
      const key = bestKey(length, assist);
      if (total > (best[key] ?? 0)) saveBest({ ...best, [key]: total });
      setScreen("summary");
      setMessage("");
      KcSfx.play("star");
      return;
    }
    setIdx(idx + 1);
    setGuesses([]);
    setCurrent(assist ? round[idx + 1].en[0] : "");
    setHints(0);
    setPhase("playing");
    setMessage(`คำที่ ${idx + 2} จาก ${round.length}`);
    KcSfx.play("whoosh");
  }, [phase, idx, round, results, best, length, assist, saveBest]);

  /* Assisted play reads each new word aloud — listen, then spell. */
  const spokenFor = word?.en;
  useEffect(() => {
    if (screen !== "play" || !assist || !spokenFor) return;
    const t = window.setTimeout(() => {
      if (!KcSfx.isMuted()) speakEnglish(spokenFor, true);
    }, 600);
    return () => window.clearTimeout(t);
  }, [screen, assist, spokenFor]);

  const toggleMute = useCallback(() => {
    const nowMuted = KcSfx.toggleMuted();
    setMuted(nowMuted);
    if (nowMuted) {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const backToMenu = useCallback(() => {
    setScreen("menu");
    setMessage("");
    KcSfx.play("click");
  }, []);

  /* The physical keyboard drives the same actions as the on-screen one. The
     handler lives in a ref so the listener is bound once and never reads a
     stale guess. */
  const actions = useRef({ typeLetter, deleteLetter, submit, nextWord, phase });
  useEffect(() => {
    actions.current = { typeLetter, deleteLetter, submit, nextWord, phase };
  });
  useEffect(() => {
    if (screen !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const a = actions.current;
      if (e.key === "Enter") {
        // On a focused button Enter already clicks it; handling it here too
        // would fire the action twice.
        if ((e.target as HTMLElement | null)?.closest("button")) return;
        e.preventDefault();
        if (a.phase === "playing") a.submit();
        else a.nextWord();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        a.deleteLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        a.typeLetter(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  const isLast = idx + 1 >= round.length;
  const hintReady = (n: number) => assist || phase !== "playing" || hints >= n;

  return (
    <div {...stageProps} className={`kc-stage ${styles.stage}`}>
      <div className={`kc-stage-body kc-game ${styles.body}`} onMouseOver={hoverSfxDelegate}>
        <div className={styles.deco} aria-hidden="true">
          <span className={styles.moon} />
          <span className={`${styles.bat} ${styles.bat1}`}>🦇</span>
          <span className={`${styles.bat} ${styles.bat2}`}>🦇</span>
          <span className={styles.web}>🕸️</span>
        </div>

        <header className={styles.header}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/khuncool-logo.webp" alt="KhunCool" />
            <div>
              <strong className="kc-title">Halloween Wordle</strong>
              <span>ทายศัพท์ฮาโลวีน</span>
            </div>
          </div>
          {screen === "play" && (
            <span className={styles.headCount} aria-hidden="true">
              คำที่ {idx + 1}/{round.length} · ⭐ {totalStars}
            </span>
          )}
          <div className={styles.toolbar} role="group" aria-label="เมนูและการตั้งค่าเกม">
            {screen !== "menu" && (
              <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label="กลับหน้าเลือกระดับ" title="กลับหน้าเลือกระดับ" onClick={backToMenu}>↩</button>
            )}
            <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"} aria-pressed={!muted} title={muted ? "เปิดเสียง" : "ปิดเสียง"} onClick={toggleMute}>{muted ? "🔇" : "🔊"}</button>
            <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} onClick={toggleFull}>⛶</button>
          </div>
        </header>

        {screen === "menu" && (
          <main className={`${styles.screen} ${styles.menu}`} data-stage="menu">
            <p className={styles.eyebrow}>🎃 HALLOWEEN WORDLE</p>
            <h2 className={styles.menuTitle}>ทายคำศัพท์ <em>Halloween</em></h2>
            <p className={styles.menuLead}>
              ดูรูป ฟังเสียง แล้วสะกดคำภาษาอังกฤษให้ถูก สีของตัวอักษรจะช่วยบอกว่าใกล้ถูกหรือยัง
            </p>
            <div className={styles.modeGroup} role="group" aria-label="เลือกแบบเล่น">
              <button type="button" className={`${styles.modeButton} kc-tap`} aria-pressed={assist} onClick={() => { setAssist(true); KcSfx.play("click"); }}>
                <b>👶 ช่วยเต็มที่</b><small>มีรูป คำแปล เสียงอ่าน และตัวแรกให้</small>
              </button>
              <button type="button" className={`${styles.modeButton} kc-tap`} aria-pressed={!assist} onClick={() => { setAssist(false); KcSfx.play("click"); }}>
                <b>🧠 ท้าทาย</b><small>ไม่มีใบ้ ต้องกดขอเอง</small>
              </button>
            </div>
            <div className={styles.lengthGrid} role="group" aria-label="เลือกระดับความยาวของคำ">
              {WORD_LENGTHS.map((len) => (
                <button
                  key={len}
                  type="button"
                  className={`${styles.lengthCard} kc-tap`}
                  aria-pressed={length === len}
                  onClick={() => { setLength(len); KcSfx.play("click"); }}
                >
                  <b>{len} ตัวอักษร</b>
                  <strong>{LENGTH_INFO[len].label}</strong>
                  <i>{LENGTH_INFO[len].sample}</i>
                  <small>{LENGTH_INFO[len].grade}{best[bestKey(len, assist)] ? ` · สูงสุด ${best[bestKey(len, assist)]}⭐` : ""}</small>
                </button>
              ))}
            </div>
            <ul className={styles.legend} aria-label="วิธีดูสี">
              <li><span className={`${styles.swatch} ${styles.swCorrect}`}>A</span>สีส้ม = ถูกที่แล้ว</li>
              <li><span className={`${styles.swatch} ${styles.swPresent}`}>B</span>สีม่วง = มีในคำ แต่ผิดที่</li>
              <li><span className={`${styles.swatch} ${styles.swAbsent}`}>C</span>สีเทา = ไม่มีในคำ</li>
            </ul>
            <button className={`${styles.primaryButton} kc-tap`} type="button" onClick={() => startRound(length)}>
              เริ่มเล่น {ROUND_SIZE} คำ <span aria-hidden="true">→</span>
            </button>
          </main>
        )}

        {screen === "play" && word && (
          <main
            className={`${styles.screen} ${styles.play}`}
            data-stage="play"
            style={{ "--cols": length } as CSSProperties}
          >
            <p className={styles.hud}>
              <span>คำที่ {idx + 1}/{round.length}</span>
              <span>⭐ {totalStars}</span>
            </p>

            <section className={styles.clue} aria-label="คำใบ้">
              <div className={`${styles.slot} ${hintReady(1) ? styles.slotOpen : ""}`}>
                <small>รูป</small>
                <span className={styles.slotEmoji} aria-hidden={!hintReady(1)}>{hintReady(1) ? word.emoji : "?"}</span>
              </div>
              <div className={`${styles.slot} ${hintReady(2) ? styles.slotOpen : ""}`}>
                <small>ความหมาย</small>
                <span>{hintReady(2) ? word.th : "?"}</span>
              </div>
              <div className={`${styles.slot} ${styles.slotWide} ${hintReady(3) ? styles.slotOpen : ""}`}>
                <small>ประโยค</small>
                <span>{hintReady(3) ? word.sentence : "?"}</span>
              </div>
            </section>

            <div
              key={idx}
              className={styles.board}
              role="grid"
              aria-label={`กระดานทายคำ ${length} ตัวอักษร`}
            >
              {Array.from({ length: MAX_GUESSES }, (_, row) => {
                const committed = row < guesses.length;
                const active = row === guesses.length && phase === "playing";
                const letters = committed ? guesses[row] : active ? current : "";
                const states = committed ? evaluateGuess(guesses[row], answer) : null;
                return (
                  <div
                    key={row}
                    role="row"
                    className={`${styles.row} ${active && shake ? styles.shake : ""}`}
                  >
                    {Array.from({ length }, (_, col) => {
                      const ch = letters[col] ?? "";
                      const st = states?.[col];
                      return (
                        <div
                          key={col}
                          role="gridcell"
                          className={`${styles.tile} ${ch && !st ? styles.tileFilled : ""} ${st ? styles.tileRevealed : ""} ${assist && active && col === 0 ? styles.tileGiven : ""}`}
                          data-state={st}
                          style={{ "--i": col } as CSSProperties}
                          aria-label={ch ? `${ch.toUpperCase()} ${st ? STATE_TH[st] : ""}`.trim() : "ช่องว่าง"}
                        >
                          {ch.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className={styles.actions}>
              <p className={styles.status} role="status" aria-live="polite">{message}</p>
              {phase === "playing" ? (
                assist ? (
                  <button className={`${styles.hintButton} kc-tap`} type="button" aria-label={`ฟังคำศัพท์อีกครั้ง`} onClick={() => speakEnglish(word.en, true)}>
                    🔊 ฟังอีกครั้ง
                  </button>
                ) : (
                  <button className={`${styles.hintButton} kc-tap`} type="button" disabled={hints >= MAX_HINTS} onClick={revealHint}>
                    💡 ขอคำใบ้ <span>({hints}/{MAX_HINTS})</span>
                  </button>
                )
              ) : (
                <>
                  <button className={`${styles.iconButton} kc-tap`} type="button" aria-label={`ฟังคำว่า ${word.en}`} title="ฟังเสียงอ่าน" onClick={() => speakEnglish(word.en, true)}>🔊</button>
                  <button className={`${styles.primaryButton} ${styles.nextButton} kc-tap`} type="button" onClick={nextWord}>
                    {isLast ? "ดูผลคะแนน 🏆" : "คำถัดไป →"}
                  </button>
                </>
              )}
            </div>

            <div className={styles.keyboard} role="group" aria-label="แป้นพิมพ์">
              {KEY_ROWS.map((letters, r) => (
                <div key={letters} className={styles.keyRow}>
                  {r === 2 && (
                    <button type="button" className={`${styles.key} ${styles.keyWide} ${styles.keySend} ${current.length === length && phase === "playing" ? styles.keyReady : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={submit} aria-label="ส่งคำตอบ">ส่ง ✓</button>
                  )}
                  {letters.split("").map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={styles.key}
                      data-state={keyStates[l]}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => typeLetter(l)}
                      aria-label={keyStates[l] ? `${l.toUpperCase()} ${STATE_TH[keyStates[l]]}` : l.toUpperCase()}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                  {r === 2 && (
                    <button type="button" className={`${styles.key} ${styles.keyWide}`} onMouseDown={(e) => e.preventDefault()} onClick={deleteLetter} aria-label="ลบตัวอักษร">⌫</button>
                  )}
                </div>
              ))}
            </div>
          </main>
        )}

        {screen === "summary" && (
          <main className={`${styles.screen} ${styles.summary}`} data-stage="summary">
            <p className={styles.eyebrow}>🏆 จบรอบแล้ว</p>
            <h2 className={styles.menuTitle}>ได้ <em>{totalStars}</em> / {ROUND_SIZE * 3} ดาว</h2>
            <ul className={styles.resultList} aria-label="สรุปคำศัพท์ในรอบนี้">
              {results.map((r) => (
                <li key={r.word.en}>
                  <button type="button" className={styles.resultItem} onClick={() => speakEnglish(r.word.en, true)} aria-label={`${r.word.en} แปลว่า ${r.word.th} ได้ ${r.stars} ดาว ฟังเสียงอ่าน`}>
                    <span className={styles.resultEmoji} aria-hidden="true">{r.word.emoji}</span>
                    <span className={styles.resultText}>
                      <b>{r.word.en.toUpperCase()}</b>
                      <small>{r.word.th}</small>
                    </span>
                    <span className={r.solved ? styles.resultStars : styles.resultMiss} aria-hidden="true">{starText(r.stars)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.summaryActions}>
              <button className={`${styles.primaryButton} kc-tap`} type="button" onClick={() => startRound(length)}>เล่นรอบใหม่ 🎃</button>
              <button className={`${styles.ghostButton} kc-tap`} type="button" onClick={backToMenu}>เปลี่ยนระดับ</button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
