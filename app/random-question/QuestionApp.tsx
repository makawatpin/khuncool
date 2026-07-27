"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE_QUESTIONS = [
  "อธิบายสิ่งที่เรียนวันนี้ให้เพื่อนฟัง 1 ประโยค",
  "ยกตัวอย่างจากชีวิตจริงที่เกี่ยวกับบทเรียนนี้",
  "อะไรคือสิ่งที่ยากที่สุดในบทนี้ เพราะอะไร",
  "ถ้าสอนเรื่องนี้ให้น้อง จะเริ่มอย่างไร",
  "บทเรียนนี้เชื่อมโยงกับวิชาอื่นได้อย่างไร",
  "ตั้งคำถาม 1 ข้อที่อยากรู้เพิ่มเกี่ยวกับเรื่องนี้",
];

export default function QuestionApp() {
  const [questions, setQuestions] = useState<string[]>(SAMPLE_QUESTIONS);
  const [used, setUsed] = useState<string[]>([]);
  const [current, setCurrent] = useState("กดปุ่มเพื่อสุ่มคำถาม");
  const [newQ, setNewQ] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [noRepeat, setNoRepeat] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [started, setStarted] = useState(false);

  const questionsRef = useRef(questions);
  const usedRef = useRef(used);
  const noRepeatRef = useRef(noRepeat);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    usedRef.current = used;
  }, [used]);
  useEffect(() => {
    noRepeatRef.current = noRepeat;
  }, [noRepeat]);

  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current);
    };
  }, []);

  const ac = useCallback((): AudioContext | null => {
    if (!acRef.current) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        acRef.current = new Ctor();
      } catch {
        acRef.current = null;
      }
    }
    return acRef.current;
  }, []);

  const blip = useCallback(() => {
    const context = ac();
    if (!context) return;
    const o = context.createOscillator();
    const g = context.createGain();
    o.type = "triangle";
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.12, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
    o.connect(g);
    g.connect(context.destination);
    o.start();
    o.stop(context.currentTime + 0.25);
  }, [ac]);

  const pick = useCallback(() => {
    const qs = questionsRef.current;
    if (qs.length === 0 || rolling) return;
    const context = ac();
    if (context && context.state === "suspended") context.resume();

    let pool = noRepeatRef.current
      ? qs.filter((q) => !usedRef.current.includes(q))
      : qs;
    if (pool.length === 0) {
      pool = qs;
      setUsed([]);
      usedRef.current = [];
    }

    setRolling(true);
    setStarted(true);

    let ticks = 0;
    const max = 12;
    const roll = () => {
      const q = qs[Math.floor(Math.random() * qs.length)];
      setCurrent(q);
      setAnimKey((k) => k + 1);
      ticks++;
      if (ticks < max) {
        rollTimerRef.current = setTimeout(roll, 60 + ticks * 14);
      } else {
        const final = pool[Math.floor(Math.random() * pool.length)];
        setCurrent(final);
        setAnimKey((k) => k + 1);
        setRolling(false);
        if (noRepeatRef.current) {
          setUsed((u) => [...u, final]);
        }
        blip();
      }
    };
    roll();
  }, [rolling, ac, blip]);

  const addQ = useCallback(() => {
    const v = newQ.trim();
    if (!v) return;
    setQuestions((qs) => [...qs, v]);
    setNewQ("");
  }, [newQ]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") addQ();
    },
    [addQ],
  );

  const removeQ = useCallback((i: number) => {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }, []);

  const clearAll = useCallback(() => {
    setQuestions([]);
    setUsed([]);
    setCurrent("ยังไม่มีคำถาม");
    setStarted(false);
  }, []);

  const toggleNoRepeat = useCallback((checked: boolean) => {
    setNoRepeat(checked);
    setUsed([]);
  }, []);

  const toggleBulk = useCallback(() => {
    setBulkMode((m) => {
      if (!m) setBulkText(questions.join("\n"));
      return !m;
    });
  }, [questions]);

  const applyBulk = useCallback(() => {
    const list = bulkText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    setQuestions(list);
    setBulkMode(false);
    setUsed([]);
  }, [bulkText]);

  const n = questions.length;
  const done = noRepeat && used.length >= n && n > 0;
  const badge = started
    ? done
      ? "ถามครบทุกข้อแล้ว · เริ่มรอบใหม่"
      : `เหลือ ${noRepeat ? n - used.length : n} ข้อ`
    : `มีคำถาม ${n} ข้อ`;
  const pickLabel = rolling ? "กำลังสุ่ม…" : "🎯 สุ่มคำถาม";
  const pickDisabled = n === 0 || rolling;

  const bank = (
    <div className="rounded-2xl border border-border bg-surface-light p-[15px] md:rounded-[18px] md:p-5">
      <div className="mb-[11px] flex items-center justify-between md:mb-[13px]">
        <span className="text-sm font-bold md:text-[15px]">
          คลังคำถาม ({n})
        </span>
        <div className="flex gap-2.5 md:gap-3">
          <button
            type="button"
            onClick={toggleBulk}
            className="cursor-pointer border-none bg-transparent p-0 text-xs font-normal text-primary md:text-[12.5px]"
          >
            {bulkMode ? "✎ กลับไปทีละข้อ" : "✎ วางหลายข้อ"}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer border-none bg-transparent p-0 text-xs font-normal text-error-strong md:text-[12.5px]"
          >
            ล้าง
          </button>
        </div>
      </div>

      {bulkMode ? (
        <div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="ใส่คำถาม ทีละบรรทัด…"
            className="h-[130px] w-full resize-y rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 font-sans text-[13px] outline-none focus:border-primary md:h-[160px] md:text-[13.5px]"
          />
          <button
            type="button"
            onClick={applyBulk}
            className="mt-2 w-full whitespace-nowrap rounded-[10px] border-none bg-primary px-2 py-2.5 font-sans text-[13.5px] font-semibold text-white hover:bg-primary-hover md:mt-[9px] md:text-sm"
          >
            ใช้คำถามชุดนี้
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex gap-2 md:mb-3.5">
            <input
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              onKeyDown={onKey}
              placeholder="เพิ่มคำถาม… กด Enter"
              className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-[#D3D8E1] bg-white px-3 py-2.5 font-sans text-[13.5px] outline-none focus:border-primary md:text-sm"
            />
            <button
              type="button"
              onClick={addQ}
              className="flex-none whitespace-nowrap rounded-[10px] border-none bg-primary px-[15px] py-2.5 font-sans text-[13.5px] font-semibold text-white hover:bg-primary-hover md:px-[18px] md:text-sm"
            >
              เพิ่ม
            </button>
          </div>
          <div className="flex max-h-[200px] flex-col gap-1.5 overflow-y-auto md:max-h-[280px] md:gap-[7px]">
            {questions.map((q, i) => (
              <div
                key={`${q}-${i}`}
                className="flex items-center gap-2 rounded-[10px] border border-border bg-white px-2.5 py-2 text-[12.5px] md:px-3 md:py-[9px] md:text-[13px]"
              >
                <span className="flex-1">{q}</span>
                <button
                  type="button"
                  onClick={() => removeQ(i)}
                  aria-label={`ลบ ${q}`}
                  className="flex-none cursor-pointer border-none bg-transparent p-0 text-[15px] leading-none text-ink-faint hover:text-error-strong md:text-base"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="mt-3.5 flex cursor-pointer items-center gap-[9px] border-t border-border pt-3 text-[12.5px] text-ink-secondary md:mt-4 md:gap-2.5 md:pt-3.5 md:text-[13.5px]">
        <input
          type="checkbox"
          checked={noRepeat}
          onChange={(e) => toggleNoRepeat(e.target.checked)}
          className="h-[17px] w-[17px] cursor-pointer accent-primary md:h-[18px] md:w-[18px]"
        />
        ไม่ถามซ้ำจนกว่าจะครบทุกข้อ
      </label>
    </div>
  );

  return (
    <div className="md:grid md:grid-cols-[1fr_380px] md:items-start md:gap-9">
      {/* Display + pick */}
      <div>
        <div
          className="relative mb-4 flex min-h-[210px] flex-col items-center justify-center overflow-hidden rounded-[20px] px-5 py-7 text-center text-white shadow-[0_18px_40px_-14px_rgba(42,39,117,.5)] md:mb-5 md:min-h-[340px] md:rounded-3xl md:px-10 md:py-14 md:shadow-[0_24px_50px_-16px_rgba(42,39,117,.5)]"
          style={{
            background: "linear-gradient(150deg,#2A2775,#0A9380)",
          }}
        >
          <div className="absolute -right-[30px] -top-[30px] h-[130px] w-[130px] rounded-full bg-white/[.07] md:-right-[50px] md:-top-[50px] md:h-[220px] md:w-[220px]" />
          <div className="relative w-full">
            <div className="mb-3 text-[11.5px] tracking-[.05em] text-[#C6C9FB] md:mb-[18px] md:text-[13px] md:tracking-[.06em]">
              {badge}
            </div>
            <div
              key={animKey}
              className="animate-[pop_.3s_ease] break-words text-[22px] font-bold leading-[1.4] md:text-[34px]"
            >
              {current}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={pick}
          disabled={pickDisabled}
          className="mb-4 w-full rounded-[13px] border-none px-[15px] py-[15px] font-sans text-base font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed md:mb-0 md:rounded-2xl md:px-6 md:py-[17px] md:text-lg md:shadow-[0_12px_28px_-8px_rgba(92,94,230,.5)]"
          style={{ background: pickDisabled ? "#B9BCC7" : "#5C5EE6" }}
        >
          {pickLabel}
        </button>
      </div>

      {/* Bank column (desktop) */}
      <div className="mt-4 md:mt-0">
        <div className="md:hidden">{bank}</div>
        <div className="hidden md:block">
          {bank}
          <p className="mx-0.5 mb-0 mt-3.5 text-xs leading-relaxed text-ink-faint">
            ใช้คู่กับวงล้อสุ่มชื่อ เพื่อสุ่มทั้งคนตอบและคำถามพร้อมกัน
          </p>
        </div>
      </div>
    </div>
  );
}
