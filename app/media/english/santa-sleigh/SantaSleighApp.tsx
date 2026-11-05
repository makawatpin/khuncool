"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, hoverSfxDelegate, speakEnglish } from "@/lib/kcSfx";
import { useStage } from "../../_stage/useStage";
import { GiftBox, Hills, House, Pine, SleighTeam, Snowman } from "./SantaArt";
import { HOUSES_PER_ROUND, KIDS, SETS, type SetId, type SleighWord } from "./sleighData";
import { buildChoices, houseStars, shuffle, wantSentence } from "./sleighLogic";
import styles from "./SantaSleighApp.module.css";

const LS_KEY = "kc-santa-sleigh-v1";

type Screen = "menu" | "play" | "summary";
/** ask: waiting for a gift · throw: gift in the air · celebrate: house lights up
 *  · travel: the camera pulls the sleigh to the next house. */
type Phase = "ask" | "throw" | "celebrate" | "travel";

type HousePlan = { word: SleighWord; choices: SleighWord[]; kid: string; wall: string; roof: string };
type Delivery = { word: SleighWord; wrong: number; stars: number };

const HOUSE_LOOKS = [
  { wall: "#f4d9a8", roof: "#c2413a" },
  { wall: "#cfe6ff", roof: "#2f6fb0" },
  { wall: "#ffd6e0", roof: "#7c3aed" },
  { wall: "#d6f0d0", roof: "#b8452f" },
  { wall: "#fde9b8", roof: "#2e7d5b" },
  { wall: "#e4d8ff", roof: "#c2573a" },
];
const GIFT_LOOKS = [
  { color: "#ef4444", ribbon: "#fde68a" },
  { color: "#22c55e", ribbon: "#fecaca" },
  { color: "#3b82f6", ribbon: "#f1f5f9" },
  { color: "#f59e0b", ribbon: "#7c3aed" },
];
const SPARKS = ["#fde047", "#f472b6", "#60a5fa", "#4ade80", "#fb923c", "#fff"];

/* Fixed, deterministic scatter so the server and client render the same sky. */
const pseudo = (i: number, k: number) => {
  // Integer hash, so every engine agrees to the last bit and hydration matches.
  let h = Math.imul(i + 1, 374761393) + Math.imul(k + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
const STAR_FIELD = Array.from({ length: 46 }, (_, i) => ({
  left: `${(pseudo(i, 1) * 100).toFixed(1)}%`,
  top: `${(pseudo(i, 2) * 62).toFixed(1)}%`,
  size: 2 + Math.round(pseudo(i, 3) * 3),
  delay: -pseudo(i, 4) * 5,
}));
const SNOW = Array.from({ length: 46 }, (_, i) => ({
  left: `${(pseudo(i, 5) * 100).toFixed(1)}%`,
  size: 3 + Math.round(pseudo(i, 6) * 5),
  dur: 7 + pseudo(i, 7) * 8,
  delay: -pseudo(i, 8) * 14,
  drift: (pseudo(i, 9) - 0.5) * 8,
}));
const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: `${(pseudo(i, 10) * 100).toFixed(1)}%`,
  color: SPARKS[i % SPARKS.length],
  dur: 3 + pseudo(i, 11) * 3,
  delay: -pseudo(i, 12) * 6,
  rot: Math.round(pseudo(i, 13) * 360),
}));

const MENU_HOUSE: HousePlan = { word: SETS[0].words[0], choices: [], kid: "👧", ...HOUSE_LOOKS[0] };

const bestKey = (set: SetId, assist: boolean) => `${set}${assist ? "a" : "c"}`;

export default function SantaSleighApp() {
  useTrackToolUse("media-english-santa-sleigh");
  const { stageProps, isFull, toggle: toggleFull } = useStage<HTMLDivElement>();

  const [screen, setScreen] = useState<Screen>("menu");
  const [setId, setSetId] = useState<SetId>("toys");
  const [assist, setAssist] = useState(true);
  const [plan, setPlan] = useState<HousePlan[]>([]);
  const [houseIdx, setHouseIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [litCount, setLitCount] = useState(0);
  const [fly, setFly] = useState<{ emoji: string; k: number } | null>(null);
  const [sad, setSad] = useState(false);
  const [message, setMessage] = useState("");
  const [santaSay, setSantaSay] = useState("");
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});

  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const current = plan[houseIdx];
  const totalStars = deliveries.reduce((sum, d) => sum + d.stars, 0);
  const traveling = phase === "travel";

  /* Saved scores are read after mount so server and client agree on first render. */
  useEffect(() => {
    const load = window.setTimeout(() => {
      setMuted(KcSfx.isMuted());
      try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (raw) setBest((JSON.parse(raw) as { best?: Record<string, number> }).best ?? {});
      } catch {
        /* the game works without saved scores */
      }
    }, 0);
    return () => window.clearTimeout(load);
  }, []);

  const speak = useCallback((text: string) => {
    if (!KcSfx.isMuted()) speakEnglish(text, true);
  }, []);

  const askMessage = useCallback(
    (p: HousePlan, n: number) =>
      assist
        ? `บ้านที่ ${n}: เด็กอยากได้ ${p.word.en} (${p.word.th}) — เลือกของขวัญให้ถูกนะ`
        : `บ้านที่ ${n}: ฟังเสียง แล้วเลือกของขวัญที่เด็กอยากได้`,
    [assist],
  );

  const startRound = useCallback(() => {
    clearTimers();
    const set = SETS.find((s) => s.id === setId) ?? SETS[0];
    const picked = shuffle(set.words).slice(0, HOUSES_PER_ROUND);
    const built = picked.map((word, i): HousePlan => ({
      word,
      choices: buildChoices(word, set.words, assist ? 3 : 4),
      kid: KIDS[i % KIDS.length],
      ...HOUSE_LOOKS[i % HOUSE_LOOKS.length],
    }));
    setPlan(built);
    setHouseIdx(0);
    setPhase("ask");
    setWrongIds([]);
    setDeliveries([]);
    setLitCount(0);
    setFly(null);
    setSad(false);
    setSantaSay("");
    setMessage(askMessage(built[0], 1));
    setScreen("play");
    KcSfx.play("whoosh");
    later(() => speak(wantSentence(built[0].word)), 900);
  }, [assist, setId, askMessage, clearTimers, later, speak]);

  const chooseGift = useCallback(
    (gift: SleighWord) => {
      if (screen !== "play" || phase !== "ask" || !current) return;
      if (wrongIds.includes(gift.id)) return;

      if (gift.id !== current.word.id) {
        setWrongIds((ids) => [...ids, gift.id]);
        setSad(true);
        later(() => setSad(false), 900);
        const tries = wrongIds.length + 1;
        setMessage(
          assist && tries >= 2
            ? "ใกล้แล้ว! ลองอันที่เรืองแสงดูนะ"
            : "ยังไม่ใช่ของที่เด็กอยากได้ ลองอันอื่นดูนะ",
        );
        KcSfx.play("wrong");
        if (tries === 2) later(() => speak(wantSentence(current.word)), 500);
        return;
      }

      const wrong = wrongIds.length;
      const stars = houseStars(wrong);
      const isLast = houseIdx + 1 >= plan.length;
      const done: Delivery = { word: current.word, wrong, stars };
      setPhase("throw");
      setFly({ emoji: gift.emoji, k: houseIdx });
      setMessage("ซานต้าโยนของขวัญลงปล่องไฟ…");
      KcSfx.play("whoosh");

      later(() => {
        setPhase("celebrate");
        setLitCount(houseIdx + 1);
        setDeliveries((d) => [...d, done]);
        setSantaSay("Ho ho ho!");
        setMessage(`ส่งถึงแล้ว! ${current.word.en} = ${current.word.th} ได้ ${stars} ดาว`);
        KcSfx.play(isLast ? "win" : "correct");
        speak("Thank you, Santa!");
      }, 950);

      if (isLast) {
        later(() => {
          const finalTotal = totalStars + stars;
          const key = bestKey(setId, assist);
          setBest((prev) => {
            if (finalTotal <= (prev[key] ?? 0)) return prev;
            const next = { ...prev, [key]: finalTotal };
            try {
              window.localStorage.setItem(LS_KEY, JSON.stringify({ best: next }));
            } catch {
              /* ignore */
            }
            return next;
          });
          setScreen("summary");
          setSantaSay("");
          KcSfx.play("star");
        }, 950 + 2300);
        return;
      }

      later(() => {
        setSantaSay("");
        setFly(null);
        setPhase("travel");
        setHouseIdx(houseIdx + 1);
        setWrongIds([]);
        setMessage("ซานต้ากำลังบินไปบ้านหลังต่อไป…");
        KcSfx.play("whoosh");
      }, 950 + 1700);

      later(() => {
        setPhase("ask");
        setMessage(askMessage(plan[houseIdx + 1], houseIdx + 2));
        speak(wantSentence(plan[houseIdx + 1].word));
      }, 950 + 1700 + 2100);
    },
    [screen, phase, current, wrongIds, assist, houseIdx, plan, totalStars, setId, askMessage, later, speak],
  );

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
    clearTimers();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setScreen("menu");
    setHouseIdx(0);
    setPhase("ask");
    setLitCount(0);
    setFly(null);
    setSantaSay("");
    setMessage("");
    KcSfx.play("click");
  }, [clearTimers]);

  /* Number keys pick a gift, so the game also works from a keyboard. */
  const choicesRef = useRef<{ list: SleighWord[]; pick: (g: SleighWord) => void }>({ list: [], pick: () => {} });
  useEffect(() => {
    choicesRef.current = { list: current?.choices ?? [], pick: chooseGift };
  });
  useEffect(() => {
    if (screen !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      const gift = Number.isInteger(n) && n >= 1 ? choicesRef.current.list[n - 1] : undefined;
      if (gift) choicesRef.current.pick(gift);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  // The menu shows one quiet house so the scene never looks empty behind the panel.
  const houses = screen === "menu" ? [MENU_HOUSE] : plan;
  const askMode = phase === "ask" || phase === "throw";
  const bubbleMode = screen === "play" && (askMode || phase === "celebrate");

  return (
    <div {...stageProps} className={`kc-stage ${styles.stage}`}>
      <div className={`kc-stage-body kc-game ${styles.body}`} onMouseOver={hoverSfxDelegate}>
        <header className={styles.header}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/khuncool-logo.webp" alt="KhunCool" />
            <div>
              <strong className="kc-title">Santa&apos;s Sleigh</strong>
              <span>ส่งของขวัญให้ซานต้า</span>
            </div>
          </div>
          {screen === "play" && (
            <span className={styles.headCount} aria-hidden="true">
              บ้านที่ {Math.min(houseIdx + 1, plan.length)}/{plan.length} · ⭐ {totalStars}
            </span>
          )}
          <div className={styles.toolbar} role="group" aria-label="เมนูและการตั้งค่าเกม">
            {screen !== "menu" && (
              <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label="กลับหน้าเมนู" title="กลับหน้าเมนู" onClick={backToMenu}>↩</button>
            )}
            <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"} aria-pressed={!muted} title={muted ? "เปิดเสียง" : "ปิดเสียง"} onClick={toggleMute}>{muted ? "🔇" : "🔊"}</button>
            <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} onClick={toggleFull}>⛶</button>
          </div>
        </header>

        <div
          className={`${styles.scene} ${traveling ? styles.traveling : ""}`}
          style={{ "--cam": houseIdx, "--houses": Math.max(plan.length, HOUSES_PER_ROUND) } as CSSProperties}
        >
          {/* All scenery is decorative: the request, choices and result live in text below. */}
          <div className={styles.art} aria-hidden="true">
            <div className={styles.sky} />
            <div className={styles.aurora} />
            <div className={`${styles.aurora} ${styles.aurora2}`} />
            {STAR_FIELD.map((s, i) => (
              <span key={i} className={styles.star} style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
            ))}
            <div className={styles.moon}><i /><i /><i /></div>
            <Hills tone="far" />
            <Hills tone="mid" />

            <div className={styles.world}>
              {Array.from({ length: HOUSES_PER_ROUND + 2 }, (_, i) => (
                <span key={`p${i}`}>
                  <span className={styles.decor} style={{ "--x": i + 0.5, "--h": "calc(var(--hh) * .85)" } as CSSProperties}><Pine lights={i % 2 === 0} /></span>
                  <span className={styles.decor} style={{ "--x": i + 0.74, "--h": "calc(var(--hh) * .55)" } as CSSProperties}><Pine /></span>
                  {i % 2 === 1 && <span className={styles.decor} style={{ "--x": i + 0.27, "--h": "calc(var(--hh) * .55)" } as CSSProperties}><Snowman /></span>}
                </span>
              ))}
              <span className={styles.decor} style={{ "--x": -0.42, "--h": "calc(var(--hh) * .9)" } as CSSProperties}><Pine lights /></span>

              {houses.map((h, i) => {
                const lit = i < litCount;
                const showBubble = bubbleMode && i === houseIdx;
                return (
                  <div key={i} className={styles.house} style={{ "--x": i } as CSSProperties}>
                    <House wall={h.wall} roof={h.roof} lit={lit} />
                    <span className={styles.smoke}><i /><i /><i /></span>
                    <span className={`${styles.kid} ${sad && i === houseIdx ? styles.kidSad : ""} ${lit ? styles.kidJoy : ""}`}>
                      {lit ? "🥳" : sad && i === houseIdx ? "😢" : h.kid}
                    </span>
                    {lit && i === litCount - 1 && phase === "celebrate" && (
                      <span className={styles.burst} key={`b${i}`}>
                        {Array.from({ length: 12 }, (_, k) => (
                          <i key={k} style={{ "--a": `${k * 30}deg`, background: SPARKS[k % SPARKS.length] } as CSSProperties} />
                        ))}
                      </span>
                    )}
                    {showBubble && (
                      <div className={`${styles.bubble} ${phase === "celebrate" ? styles.bubbleThanks : ""}`}>
                        {phase === "celebrate" ? (
                          <b className={styles.thanks}>Thank you, Santa! 🎄</b>
                        ) : assist ? (
                          <>
                            <small>I want {h.word.det ? `${h.word.det} ` : ""}</small>
                            <span className={styles.bubbleEmoji}>{h.word.emoji}</span>
                            <b>{h.word.en}</b>
                            <em>{h.word.th}</em>
                          </>
                        ) : (
                          <>
                            <small>I want a …</small>
                            <span className={styles.bubbleEmoji}>🎧</span>
                            <em>ฟังแล้วเลือกของขวัญ</em>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.ground} />
            <div className={styles.speed}>{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>

            <div className={styles.sleigh}>
              <SleighTeam />
              {santaSay && <span className={styles.santaSay} key={santaSay + houseIdx}>{santaSay}</span>}
            </div>

            {fly && (
              <span key={fly.k} className={styles.flyX}>
                <span className={styles.flyY}><span className={styles.flyGift}>{fly.emoji}</span></span>
              </span>
            )}

            <div className={styles.snow}>
              {SNOW.map((f, i) => (
                <i key={i} style={{ left: f.left, width: f.size, height: f.size, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, "--drift": `${f.drift}cqi` } as CSSProperties} />
              ))}
            </div>
          </div>

          {screen === "menu" && (
            <main className={styles.panel} data-stage="menu">
              <p className={styles.eyebrow}>🎅 CHRISTMAS GAME</p>
              <h2 className={styles.title}>Santa&apos;s <em>Sleigh</em></h2>
              <p className={styles.lead}>ช่วยซานต้าส่งของขวัญ ฟังว่าเด็กอยากได้อะไร แล้วเลือกของขวัญใส่ปล่องไฟให้ถูกบ้าน</p>
              <div className={styles.setGrid} role="group" aria-label="เลือกชุดคำศัพท์">
                {SETS.map((s) => (
                  <button key={s.id} type="button" className={`${styles.setCard} kc-tap`} aria-pressed={setId === s.id} onClick={() => { setSetId(s.id); KcSfx.play("click"); }}>
                    <span aria-hidden="true">{s.icon}</span>
                    <strong>{s.title}</strong>
                    <small>{s.titleEn} · {s.grade}{best[bestKey(s.id, assist)] ? ` · สูงสุด ${best[bestKey(s.id, assist)]}⭐` : ""}</small>
                  </button>
                ))}
              </div>
              <div className={styles.modeGroup} role="group" aria-label="เลือกแบบเล่น">
                <button type="button" className={`${styles.modeButton} kc-tap`} aria-pressed={assist} onClick={() => { setAssist(true); KcSfx.play("click"); }}>
                  <b>👶 ช่วยเต็มที่</b><small>มีรูป คำศัพท์ และคำแปลบนป้าย</small>
                </button>
                <button type="button" className={`${styles.modeButton} kc-tap`} aria-pressed={!assist} onClick={() => { setAssist(false); KcSfx.play("click"); }}>
                  <b>🎧 ฟังอย่างเดียว</b><small>ไม่มีป้าย ต้องฟังให้ออก</small>
                </button>
              </div>
              <button className={`${styles.primaryButton} kc-tap`} type="button" onClick={startRound}>
                ออกเดินทาง {HOUSES_PER_ROUND} บ้าน <span aria-hidden="true">🛷</span>
              </button>
            </main>
          )}

          {screen === "play" && current && (
            <>
              <div className={styles.topline}>
                <p className={styles.status} role="status" aria-live="polite">{message}</p>
                <button className={`${styles.hearButton} kc-tap`} type="button" disabled={phase !== "ask"} onClick={() => speak(wantSentence(current.word))}>
                  🔊 <span>ฟังอีกครั้ง</span>
                </button>
              </div>
              <div className={styles.tray} role="group" aria-label="เลือกของขวัญ" data-stage="play">
                {current.choices.map((c, i) => {
                  const look = GIFT_LOOKS[i % GIFT_LOOKS.length];
                  const isWrong = wrongIds.includes(c.id);
                  const hint = assist && wrongIds.length >= 2 && c.id === current.word.id && phase === "ask";
                  return (
                    <button
                      key={`${houseIdx}-${c.id}`}
                      type="button"
                      className={`${styles.gift} ${isWrong ? styles.giftWrong : ""} ${hint ? styles.giftHint : ""}`}
                      disabled={phase !== "ask" || isWrong}
                      onClick={() => chooseGift(c)}
                      aria-label={assist || isWrong ? `ของขวัญ ${i + 1}: ${c.en}` : `ของขวัญ ${i + 1}`}
                      style={{ "--i": i } as CSSProperties}
                    >
                      <GiftBox color={look.color} ribbon={look.ribbon} />
                      <span className={styles.giftEmoji} aria-hidden="true">{c.emoji}</span>
                      {assist && <span className={styles.giftLabel}>{c.en}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {screen === "summary" && (
            <>
            <div className={styles.confetti} aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <i key={i} style={{ left: c.left, background: c.color, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s`, rotate: `${c.rot}deg` }} />
              ))}
            </div>
            <main className={`${styles.panel} ${styles.summary}`} data-stage="summary">
              <p className={styles.eyebrow}>🎄 MERRY CHRISTMAS</p>
              <h2 className={styles.title}>ส่งครบ <em>{deliveries.length}</em> บ้าน ได้ <em>{totalStars}</em> / {HOUSES_PER_ROUND * 3} ดาว</h2>
              <ul className={styles.resultList} aria-label="สรุปคำศัพท์ในรอบนี้">
                {deliveries.map((d) => (
                  <li key={d.word.id}>
                    <button type="button" className={styles.resultItem} onClick={() => speak(wantSentence(d.word))} aria-label={`${d.word.en} แปลว่า ${d.word.th} ได้ ${d.stars} ดาว ฟังเสียงอ่าน`}>
                      <span className={styles.resultEmoji} aria-hidden="true">{d.word.emoji}</span>
                      <span className={styles.resultText}><b>{d.word.en}</b><small>{d.word.th}</small></span>
                      <span className={styles.resultStars} aria-hidden="true">{"★".repeat(d.stars)}{"☆".repeat(3 - d.stars)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.summaryActions}>
                <button className={`${styles.primaryButton} kc-tap`} type="button" onClick={startRound}>เล่นอีกรอบ 🎁</button>
                <button className={`${styles.ghostButton} kc-tap`} type="button" onClick={backToMenu}>เปลี่ยนชุดคำศัพท์</button>
              </div>
            </main>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
