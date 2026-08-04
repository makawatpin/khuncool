"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, hoverSfxDelegate } from "@/lib/kcSfx";
import GameBackdrop from "../GameBackdrop";
import KcFace from "../KcFace";
import { useFullscreen } from "../useFullscreen";

const QUESTION_COUNT = 12;
const SHOW_WHY = true;

type Item = {
  a: "is" | "are";
  b: string;
  c: string;
  th: string;
  why: string;
};

const ITEMS: Item[] = [
  { a: "is", b: "My brother", c: "tall.", th: "พี่ชายของฉันตัวสูง", why: "brother = คนเดียว (เอกพจน์) → is" },
  { a: "are", b: "The children", c: "in the garden.", th: "เด็กๆ อยู่ในสวน", why: "children = หลายคน (พหูพจน์) → are" },
  { a: "is", b: "She", c: "my best friend.", th: "เธอเป็นเพื่อนที่ดีที่สุดของฉัน", why: "she → is" },
  { a: "are", b: "They", c: "very happy today.", th: "พวกเขามีความสุขมากวันนี้", why: "they → are" },
  { a: "is", b: "The cat", c: "sleeping.", th: "แมวกำลังนอนหลับ", why: "the cat = ตัวเดียว → is" },
  { a: "are", b: "You", c: "so kind!", th: "คุณใจดีมาก", why: "you → are เสมอ" },
  { a: "is", b: "It", c: "a big elephant.", th: "มันเป็นช้างตัวใหญ่", why: "it → is" },
  { a: "are", b: "My parents", c: "teachers.", th: "พ่อแม่ของฉันเป็นครู", why: "parents = 2 คน → are" },
  { a: "is", b: "This book", c: "interesting.", th: "หนังสือเล่มนี้น่าสนใจ", why: "this book = เล่มเดียว → is" },
  { a: "are", b: "These apples", c: "sweet.", th: "แอปเปิลเหล่านี้หวาน", why: "these apples = หลายลูก → are" },
  { a: "are", b: "Tom and Mary", c: "at school.", th: "ทอมกับแมรีอยู่ที่โรงเรียน", why: "Tom and Mary = 2 คน → are" },
  { a: "is", b: "The weather", c: "hot today.", th: "อากาศร้อนวันนี้", why: "the weather = สิ่งเดียว → is" },
  { a: "are", b: "Those shoes", c: "new.", th: "รองเท้าคู่นั้นใหม่", why: "those shoes = หลายชิ้น → are" },
  { a: "is", b: "My dog", c: "hungry.", th: "หมาของฉันหิว", why: "my dog = ตัวเดียว → is" },
  { a: "are", b: "We", c: "good friends.", th: "เราเป็นเพื่อนที่ดี", why: "we → are" },
  { a: "is", b: "Mr. Somchai", c: "our English teacher.", th: "คุณสมชายเป็นครูอังกฤษของเรา", why: "ชื่อคน 1 คน → is" },
  { a: "are", b: "My friends", c: "playing football.", th: "เพื่อนๆ ของฉันกำลังเล่นฟุตบอล", why: "friends = หลายคน → are" },
  { a: "is", b: "The classroom", c: "very clean.", th: "ห้องเรียนสะอาดมาก", why: "the classroom = ห้องเดียว → is" },
  { a: "are", b: "The birds", c: "singing.", th: "นกกำลังร้องเพลง", why: "birds = หลายตัว → are" },
  { a: "is", b: "My father", c: "a police officer.", th: "พ่อของฉันเป็นตำรวจ", why: "father = คนเดียว → is" },
  { a: "are", b: "Anna and I", c: "in the same class.", th: "แอนนากับฉันอยู่ห้องเดียวกัน", why: "Anna and I = 2 คน → are" },
  { a: "is", b: "That bag", c: "heavy.", th: "กระเป๋าใบนั้นหนัก", why: "that bag = ใบเดียว → is" },
  { a: "are", b: "The pencils", c: "on the desk.", th: "ดินสออยู่บนโต๊ะ", why: "pencils = หลายแท่ง → are" },
  { a: "is", b: "My sister", c: "six years old.", th: "น้องสาวของฉันอายุ 6 ขวบ", why: "sister = คนเดียว → is" },
  { a: "are", b: "We", c: "ready for the test.", th: "เราพร้อมสำหรับการสอบ", why: "we → are" },
  { a: "is", b: "The soup", c: "delicious.", th: "ซุปอร่อย", why: "the soup = สิ่งเดียว (นับไม่ได้) → is" },
  { a: "are", b: "These questions", c: "easy.", th: "คำถามพวกนี้ง่าย", why: "these questions = หลายข้อ → are" },
  { a: "is", b: "He", c: "my cousin.", th: "เขาเป็นลูกพี่ลูกน้องของฉัน", why: "he → is" },
  { a: "are", b: "The students", c: "in the library.", th: "นักเรียนอยู่ในห้องสมุด", why: "students = หลายคน → are" },
  { a: "is", b: "Bangkok", c: "a big city.", th: "กรุงเทพเป็นเมืองใหญ่", why: "ชื่อเมือง = สิ่งเดียว → is" },
  { a: "are", b: "My shoes", c: "dirty.", th: "รองเท้าของฉันเปื้อน", why: "shoes = คู่/หลายชิ้น → are" },
  { a: "is", b: "The door", c: "open.", th: "ประตูเปิดอยู่", why: "the door = บานเดียว → is" },
  { a: "are", b: "Dogs", c: "friendly animals.", th: "สุนัขเป็นสัตว์ที่เป็นมิตร", why: "dogs = พหูพจน์ทั่วไป → are" },
  { a: "is", b: "My grandmother", c: "in the kitchen.", th: "คุณย่าอยู่ในครัว", why: "grandmother = คนเดียว → is" },
  { a: "are", b: "The windows", c: "closed.", th: "หน้าต่างปิดอยู่", why: "windows = หลายบาน → are" },
  { a: "is", b: "This song", c: "my favorite.", th: "เพลงนี้เป็นเพลงที่ฉันชอบ", why: "this song = เพลงเดียว → is" },
  { a: "are", b: "You and your sister", c: "very tall.", th: "คุณกับน้องสาวตัวสูงมาก", why: "2 คน → are" },
  { a: "is", b: "The milk", c: "cold.", th: "นมเย็น", why: "milk = นับไม่ได้ → is" },
  { a: "are", b: "Our teachers", c: "kind.", th: "ครูของเราใจดี", why: "teachers = หลายคน → are" },
  { a: "is", b: "Somchai's bike", c: "red.", th: "จักรยานของสมชายสีแดง", why: "bike = คันเดียว → is" },
  { a: "are", b: "There", c: "two cats on the roof.", th: "มีแมวสองตัวบนหลังคา", why: "two cats = พหูพจน์ → there are" },
  { a: "is", b: "There", c: "a book on the table.", th: "มีหนังสือเล่มหนึ่งบนโต๊ะ", why: "a book = เอกพจน์ → there is" },
  { a: "are", b: "The flowers", c: "beautiful.", th: "ดอกไม้สวยงาม", why: "flowers = หลายดอก → are" },
];

const RULES = [
  { k: "IS", v: "he / she / it / เอกพจน์", color: "#3F41C9" },
  { k: "ARE", v: "we / you / they / พหูพจน์", color: "#0E8C77" },
  { k: "⭐", v: "ถูก 3 ข้อติด = โบนัส", color: "#C2500B" },
];

function shuffle<T>(arr: T[]): T[] {
  const x = arr.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

type Feedback = {
  ok: boolean;
  ans: "is" | "are";
  why: string;
  combo: boolean;
};

type ResultRow = { ok: boolean; item: Item };

type Confetto = {
  left: number;
  size: number;
  radius: string;
  color: string;
  dur: string;
  delay: string;
};

type Floater = { text: string; top: number; size: number; color: string };

const CONFETTI_COLORS = ["#5C5EE6", "#14B79A", "#FFD166", "#FF8A5C", "#C6C9FB", "#28D3B4"];

export default function IsAreSortingApp() {
  useTrackToolUse("media-english-is-are-sorting");
  const { ref: fullRef, isFull, fullscreenClassName, toggle: toggleFull } = useFullscreen<HTMLDivElement>();

  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [i, setI] = useState(0);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [isCount, setIsCount] = useState(0);
  const [areCount, setAreCount] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [anim, setAnim] = useState("");
  const [lock, setLock] = useState(false);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [hit, setHit] = useState<"is" | "are" | "">("");
  const [confetti, setConfetti] = useState<Confetto[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [bgmOn, setBgmOn] = useState(() =>
    typeof window === "undefined" ? true : KcSfx.isBgm(),
  );
  const [muted, setMuted] = useState(() =>
    typeof window === "undefined" ? false : KcSfx.isMuted(),
  );
  const [queue, setQueue] = useState<Item[]>([]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const spawnConfetti = useCallback((combo: boolean) => {
    const n = combo ? 44 : 26;
    const arr: Confetto[] = Array.from({ length: n }, (_, k) => ({
      left: Math.round(Math.random() * 100),
      size: 7 + Math.round(Math.random() * 9),
      radius: k % 3 === 0 ? "50%" : "3px",
      color: CONFETTI_COLORS[k % CONFETTI_COLORS.length],
      dur: (1.5 + Math.random() * 1.3).toFixed(2),
      delay: (Math.random() * 0.5).toFixed(2),
    }));
    setConfetti(arr);
    later(() => setConfetti([]), 3200);
  }, [later]);

  const spawnFloater = useCallback((combo: boolean) => {
    const f: Floater = {
      text: combo ? "COMBO +3 ⭐" : "+1 ⭐",
      top: 46,
      size: combo ? 34 : 28,
      color: combo ? "#C2500B" : "#0E8C77",
    };
    setFloaters([f]);
    later(() => setFloaters([]), 1200);
  }, [later]);

  const start = useCallback(() => {
    KcSfx.play("whoosh");
    setQueue(shuffle(ITEMS).slice(0, QUESTION_COUNT));
    setStage(1);
    setI(0);
    setStars(0);
    setStreak(0);
    setBest(0);
    setIsCount(0);
    setAreCount(0);
    setFb(null);
    setAnim("popIn .45s cubic-bezier(.3,1.5,.5,1) both");
    setLock(false);
    setResults([]);
    setHit("");
  }, []);

  const next = useCallback(() => {
    setI((prevI) => {
      const nextIdx = prevI + 1;
      if (nextIdx >= queue.length) {
        setResults((r) => {
          const c = r.filter((row) => row.ok).length;
          KcSfx.play(c >= queue.length * 0.6 ? "win" : "lose");
          return r;
        });
        setStage(2);
        setFb(null);
        setLock(false);
        return prevI;
      }
      KcSfx.play("pop");
      setFb(null);
      setLock(false);
      setHit("");
      setAnim("popIn .45s cubic-bezier(.3,1.5,.5,1) both");
      return nextIdx;
    });
  }, [queue]);

  const pick = useCallback(
    (ans: "is" | "are") => {
      if (lock) return;
      const q = queue[i];
      if (!q) return;
      const ok = q.a === ans;
      const newStreak = ok ? streak + 1 : 0;
      const bonus = ok && newStreak > 0 && newStreak % 3 === 0 ? 2 : 0;
      const combo = bonus > 0;

      KcSfx.play(ok ? (combo ? "combo" : "correct") : "wrong");
      if (ok) later(() => KcSfx.play("drop"), 260);

      setLock(true);
      setHit(ans);
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
      setStars((s) => s + (ok ? 1 + bonus : 0));
      if (ok && ans === "is") setIsCount((c) => c + 1);
      if (ok && ans === "are") setAreCount((c) => c + 1);
      setAnim(
        ok
          ? ans === "is"
            ? "flyL .55s cubic-bezier(.5,-0.2,.8,.6) forwards .18s"
            : "flyR .55s cubic-bezier(.5,-0.2,.8,.6) forwards .18s"
          : "shake .5s ease-in-out",
      );
      setFb({ ok, ans: q.a, why: q.why, combo });
      setResults((r) => r.concat([{ ok, item: q }]));

      if (ok) {
        spawnConfetti(combo);
        spawnFloater(combo);
      }

      later(() => next(), ok ? 1000 : 1900);
    },
    [lock, i, streak, queue, later, next, spawnConfetti, spawnFloater],
  );

  const toggleBgm = useCallback(() => {
    const next = !KcSfx.isBgm();
    KcSfx.bgm(next);
    setBgmOn(next);
  }, []);

  const toggleMute = useCallback(() => {
    KcSfx.toggleMuted();
    setMuted(KcSfx.isMuted());
    KcSfx.play("click");
  }, []);

  const q = stage === 1 ? queue[i] : null;
  const total = queue.length || QUESTION_COUNT;
  const correctCount = results.filter((r) => r.ok).length;
  const progressPct = Math.round((i / total) * 100);

  const hitIs = hit === "is" && fb?.ok;
  const hitAre = hit === "are" && fb?.ok;

  const resultEmoji =
    correctCount === total ? "🏆" : correctCount >= total * 0.6 ? "🎉" : "💪";
  const resultTitle =
    correctCount === total
      ? "เพอร์เฟกต์!"
      : correctCount >= total * 0.6
        ? "เยี่ยมมาก!"
        : "ลองอีกครั้งนะ";

  return (
    <div
      ref={fullRef}
      className={`kc-game kc-sorting-game kc-stage-${stage} ${fullscreenClassName} relative overflow-hidden rounded-2xl ${stage === 0 ? "kc-game-intro" : ""}`}
      onMouseOver={hoverSfxDelegate}
      style={{
        background: "linear-gradient(170deg,#EAF1FF 0%,#EFF0FE 45%,#E6FBF6 100%)",
      }}
    >
      <GameBackdrop
        sun={{ top: 30, right: 56, size: 120, from: "#FFE59A", via: "#FFD166" }}
        blobs={[
          { top: -90, left: -110, size: 340, color: "#C6C9FB" },
          { top: 260, right: -140, size: 400, color: "#B6F3E4" },
          { bottom: -120, left: "26%", size: 320, color: "#FFE0C2" },
        ]}
        clouds={[{ top: 90, dur: 48 }]}
      />
      {/* Top bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-2.5 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/khuncool-logo.webp"
            alt="KhunCool"
            style={{ width: 38, height: 38, flex: "none", objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(92,94,230,.5))" }}
          />
          <div className="kc-title font-semibold text-[15px] md:text-base">
            Is / Are Sorting
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/media/english"
            style={{
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              color: "#5C5EE6",
              background: "#E1E3FD",
              borderRadius: 999,
              padding: "9px 16px",
              textDecoration: "none",
            }}
          >
            ☰ เมนู
          </Link>
          <button
            type="button"
            onClick={toggleBgm}
            className="flex items-center gap-[7px] rounded-full border px-[13px] text-[13px] font-semibold"
            style={{
              height: 36,
              borderColor: "#E5E8EE",
              background: bgmOn ? "#EFFBF8" : "#fff",
              color: bgmOn ? "#0E8C77" : "#5A6273",
            }}
          >
            <span className="flex h-3.5 items-end gap-[2px]">
              {[0, 1, 2].map((k) => (
                <span
                  key={k}
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: bgmOn ? "#14B79A" : "#C9CEDA",
                    transformOrigin: "bottom",
                    animation: bgmOn
                      ? `eqBar ${(0.6 + k * 0.18).toFixed(2)}s ease-in-out infinite`
                      : "none",
                  }}
                />
              ))}
            </span>
            <span>{bgmOn ? "เพลง" : "ปิดเพลง"}</span>
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label="เปิด/ปิดเสียง"
            className="flex h-9 w-9 items-center justify-center rounded-full border text-base"
            style={{ borderColor: "#E5E8EE", background: muted ? "#F1F3F7" : "#fff" }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            onClick={toggleFull}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-base"
            style={{ borderColor: "#E5E8EE", background: isFull ? "#EFFBF8" : "#fff" }}
          >
            ⛶
          </button>
          <div
            className="flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-[7px] text-[15px] font-semibold"
            style={{ borderColor: "#E5E8EE", color: "#C2500B" }}
          >
            <span style={{ animation: "popStar 1.8s ease-in-out infinite" }}>⭐</span>
            <span>{stars}</span>
          </div>
        </div>
      </div>

      {/* Stage 0: intro */}
      {stage === 0 && (
        <div className="relative mx-auto max-w-[720px] px-5 pb-16 pt-1 text-center">
          <div className="mb-[18px] flex items-end justify-center gap-3.5">
            <div style={{ animation: "floatY 2.6s ease-in-out infinite" }}>
              <KcFace skin="#F3CDA6" hair="#D8DCE6" shirt="#7BA7D9" glasses mustache size={64} />
            </div>
            <div style={{ animation: "floatY 2.6s ease-in-out .3s infinite" }}>
              <KcFace skin="#F5D2B0" hair="#4A2C2A" shirt="#FF7FA5" longHair bow bowColor="#FFD166" size={64} />
            </div>
            <div style={{ animation: "floatY 2.6s ease-in-out .6s infinite" }}>
              <KcFace skin="#EFC49A" hair="#6B4423" shirt="#FFD166" cap capColor="#EF476F" size={64} />
            </div>
          </div>
          <h1 className="m-0 mb-3 font-bold leading-tight text-[clamp(30px,6vw,46px)]">
            แยกให้ถูก
            <span
              style={{
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              IS หรือ ARE{" "}
            </span>
            ?
          </h1>
          <p className="m-0 mb-[26px] text-[clamp(15px,3.6vw,17px)] leading-[1.75] text-[#5A6273]">
            อ่านประโยค แล้วโยนการ์ดลงตะกร้าที่ถูกต้อง — ตอบถูกติดกันได้คอมโบ ⭐
            พิเศษ! เล่นได้ทั้งบนคอมและมือถือ
          </p>
          <div className="mb-[30px] flex flex-wrap justify-center gap-2.5">
            {RULES.map((r) => (
              <div
                key={r.k}
                className="flex items-center gap-2 rounded-full border bg-white px-4 py-[9px] text-sm font-semibold"
                style={{ borderColor: "#E5E8EE", boxShadow: "0 14px 24px -18px rgba(26,29,38,.5)" }}
              >
                <span style={{ color: r.color }}>{r.k}</span>
                <span className="font-medium text-[#5A6273]">{r.v}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={start}
            className="rounded-full border-none px-11 py-4 font-semibold text-white"
            style={{
              fontSize: "clamp(17px,4.6vw,20px)",
              background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
              animation: "pulseGlow 2.4s ease-in-out infinite",
            }}
          >
            เริ่มเล่น 🚀
          </button>
        </div>
      )}

      {/* Stage 1: play */}
      {stage === 1 && (
        <div className="kc-sorting-stage relative mx-auto max-w-[900px] px-4 pb-[60px] pt-1">
          <div className="mb-3.5 flex items-center gap-3">
            <div
              className="h-3 flex-1 overflow-hidden rounded-full border bg-white"
              style={{ borderColor: "#E5E8EE" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,#5C5EE6,#14B79A)",
                }}
              />
            </div>
            <div className="text-sm font-semibold text-[#5A6273]">
              {Math.min(i + 1, total)}/{total}
            </div>
            <div
              className="flex items-center gap-[5px] rounded-full px-3 py-1.5 text-sm font-semibold"
              style={{
                background: streak >= 3 ? "#FFEDD3" : "#fff",
                color: streak >= 3 ? "#C2500B" : "#5A6273",
                animation: streak >= 3 ? "bucketPop .5s ease-out" : "none",
              }}
            >
              <span
                style={{
                  animation: streak >= 3 ? "flameGrow .8s ease-in-out infinite" : "none",
                }}
              >
                🔥
              </span>{" "}
              {streak}
            </div>
          </div>

          <div className="mb-[clamp(14px,4vw,26px)] grid grid-cols-2 gap-[clamp(10px,3vw,22px)]">
            <div
              className="relative rounded-[22px] p-[clamp(12px,3vw,18px)] text-center"
              style={{
                background: hitIs ? "#D6D8FE" : "#F3F4FF",
                border: `3px dashed ${hitIs ? "#5C5EE6" : "#C6C9FB"}`,
                animation: hitIs ? "bucketPop .5s ease-out" : "none",
              }}
            >
              <div
                className="font-bold leading-none"
                style={{ fontSize: "clamp(26px,7vw,40px)", color: "#3F41C9" }}
              >
                IS
              </div>
              <div className="mt-1 text-[clamp(11px,2.8vw,13px)] font-semibold text-[#5A6273]">
                he · she · it · เอกพจน์
              </div>
              <div
                className="mt-2 inline-block whitespace-nowrap rounded-full bg-white px-3 py-[3px] text-sm font-semibold"
                style={{ color: "#3F41C9" }}
              >
                {isCount} ใบ
              </div>
            </div>
            <div
              className="relative rounded-[22px] p-[clamp(12px,3vw,18px)] text-center"
              style={{
                background: hitAre ? "#C9F5EB" : "#EFFBF8",
                border: `3px dashed ${hitAre ? "#14B79A" : "#B6F3E4"}`,
                animation: hitAre ? "bucketPop .5s ease-out" : "none",
              }}
            >
              <div
                className="font-bold leading-none"
                style={{ fontSize: "clamp(26px,7vw,40px)", color: "#0E8C77" }}
              >
                ARE
              </div>
              <div className="mt-1 text-[clamp(11px,2.8vw,13px)] font-semibold text-[#5A6273]">
                we · you · they · พหูพจน์
              </div>
              <div
                className="mt-2 inline-block whitespace-nowrap rounded-full bg-white px-3 py-[3px] text-sm font-semibold"
                style={{ color: "#0E8C77" }}
              >
                {areCount} ใบ
              </div>
            </div>
          </div>

          <div className="relative mb-[clamp(14px,4vw,22px)] flex min-h-[clamp(180px,42vw,230px)] items-center justify-center">
            <div
              key={`q${i}`}
              className="relative w-full max-w-[560px] overflow-hidden rounded-[26px] border bg-white px-[clamp(16px,5vw,32px)] py-[clamp(20px,5vw,34px)] text-center"
              style={{
                borderColor: "#EEF0F5",
                animation: anim || "none",
                boxShadow: "0 24px 44px -26px rgba(26,29,38,.55)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: "linear-gradient(90deg,#5C5EE6,#14B79A)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "40%",
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",
                    animation: "sweep 2.6s ease-in-out infinite",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "42%",
                  transform: "translate(-50%,-50%)",
                  fontSize: "clamp(40px,10vw,64px)",
                  pointerEvents: "none",
                  zIndex: 6,
                  opacity: fb ? 1 : 0,
                  animation: fb ? "reactPop 1s cubic-bezier(.3,1.5,.5,1) forwards" : "none",
                }}
              >
                {fb ? (fb.ok ? (fb.combo ? "🤩" : "🎯") : "🙈") : ""}
              </div>
              <div className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-[#9AA3B2]">
                เติมคำในช่องว่าง
              </div>
              <div
                className="font-semibold leading-[1.5]"
                style={{ fontSize: "clamp(21px,5.4vw,34px)" }}
              >
                <span>{q ? q.b : ""}</span>
                <span
                  className="mx-1.5 inline-block min-w-[2.6em] border-b-4"
                  style={{
                    borderColor: fb ? (fb.ok ? "#0E8C77" : "#D64545") : "#C6C9FB",
                    color: fb ? (fb.ok ? "#0E8C77" : "#D64545") : "#C6C9FB",
                  }}
                >
                  {fb ? fb.ans : "?"}
                </span>
                <span>{q ? q.c : ""}</span>
              </div>
              <div className="mt-3.5 text-[clamp(13px,3.4vw,15px)] text-[#5A6273]">
                {q ? q.th : ""}
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-[560px] grid-cols-2 gap-[clamp(10px,3vw,20px)]">
            <button
              type="button"
              onClick={() => pick("is")}
              className="rounded-[20px] border-none font-bold text-white"
              style={{
                fontSize: "clamp(22px,6vw,30px)",
                background: "linear-gradient(135deg,#6E70F0,#3F41C9)",
                minHeight: 64,
                padding: "16px 8px",
                boxShadow: "0 18px 30px -14px rgba(63,65,201,.65)",
              }}
            >
              IS
            </button>
            <button
              type="button"
              onClick={() => pick("are")}
              className="rounded-[20px] border-none font-bold text-white"
              style={{
                fontSize: "clamp(22px,6vw,30px)",
                background: "linear-gradient(135deg,#28D3B4,#0E8C77)",
                minHeight: 64,
                padding: "16px 8px",
                boxShadow: "0 18px 30px -14px rgba(14,140,119,.65)",
              }}
            >
              ARE
            </button>
          </div>

          {fb && (
            <div
              className="mx-auto mt-[18px] flex max-w-[560px] items-start gap-3 rounded-[18px] border px-[18px] py-3.5"
              style={{
                background: fb.ok ? "#EFFBF8" : "#FFF1F1",
                borderColor: fb.ok ? "#B6F3E4" : "#FBD5D5",
              }}
            >
              <div className="text-[22px]">
                {fb.ok ? (fb.combo ? "🎉" : "✅") : "💡"}
              </div>
              <div>
                <div
                  className="font-semibold text-base"
                  style={{ color: fb.ok ? "#0E8C77" : "#B03434" }}
                >
                  {fb.ok
                    ? fb.combo
                      ? "คอมโบ! เก่งมาก"
                      : "ถูกต้อง!"
                    : `ยังไม่ถูก — คำตอบคือ ${fb.ans.toUpperCase()}`}
                </div>
                {SHOW_WHY && (
                  <div className="mt-0.5 text-sm text-[#5A6273]">{fb.why}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 2: result */}
      {stage === 2 && (
        <div className="kc-sorting-stage relative mx-auto max-w-[640px] px-[18px] pb-20 pt-2.5 text-center">
          <div
            className="text-[clamp(54px,14vw,80px)]"
            style={{ animation: "popIn .6s cubic-bezier(.3,1.5,.5,1) both" }}
          >
            {resultEmoji}
          </div>
          <h2 className="m-0 mb-2 font-bold" style={{ fontSize: "clamp(26px,6vw,36px)" }}>
            {resultTitle}
          </h2>
          <p className="m-0 mb-[22px] text-base text-[#5A6273]">
            ตอบถูก {correctCount} จาก {total} ข้อ · คอมโบสูงสุด {best} 🔥
          </p>
          <div className="mb-[26px] flex justify-center gap-2">
            {[0, 1, 2].map((k) => (
              <div
                key={k}
                className="text-[clamp(32px,9vw,44px)]"
                style={{
                  opacity: correctCount / Math.max(1, total) > k * 0.33 + 0.32 ? 1 : 0.22,
                }}
              >
                ⭐
              </div>
            ))}
          </div>
          <div
            className="kc-sorting-results mb-[26px] rounded-[22px] border bg-white p-3.5 text-left"
            style={{ borderColor: "#E5E8EE", boxShadow: "0 18px 34px -28px rgba(0,0,0,.6)" }}
          >
            {results.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-xl px-2 py-2.5"
                style={{ background: r.ok ? "transparent" : "#FFF6F6" }}
              >
                <span className="text-base">{r.ok ? "✅" : "❌"}</span>
                <span className="flex-1 text-sm leading-[1.5]">
                  {r.item.b} ___ {r.item.c}
                </span>
                <span
                  className="font-bold text-sm uppercase"
                  style={{ color: r.item.a === "is" ? "#3F41C9" : "#0E8C77" }}
                >
                  {r.item.a}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={start}
              className="rounded-full border-none px-9 py-[15px] font-semibold text-lg text-white"
              style={{
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                boxShadow: "0 18px 30px -14px rgba(92,94,230,.65)",
              }}
            >
              เล่นอีกครั้ง 🔁
            </button>
          </div>
        </div>
      )}

      {/* Confetti & floaters overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {confetti.map((c, idx) => (
          <div
            key={idx}
            className="absolute top-0"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              borderRadius: c.radius,
              background: c.color,
              animation: `confettiFall ${c.dur}s linear ${c.delay}s forwards`,
            }}
          />
        ))}
        {floaters.map((f, idx) => (
          <div
            key={idx}
            className="absolute left-1/2 font-bold"
            style={{
              top: `${f.top}%`,
              fontSize: f.size,
              color: f.color,
              animation: "floatUp 1.1s ease-out forwards",
            }}
          >
            {f.text}
          </div>
        ))}
      </div>
    </div>
  );
}
