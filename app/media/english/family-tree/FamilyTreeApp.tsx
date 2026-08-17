"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, speakEnglish, hoverSfxDelegate } from "@/lib/kcSfx";
import GameBackdrop from "../GameBackdrop";
import { useStage } from "../../_stage/useStage";
import styles from "./FamilyTreeApp.module.css";

const LEAF_COLORS = ["#9BE3CE", "#C6C9FB", "#FFD9A8", "#FFC3D4"];
const LEAVES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37.3) % 100,
  size: 8 + ((i * 5) % 10),
  color: LEAF_COLORS[i % LEAF_COLORS.length],
  delay: (i * 1.9) % 14,
  dur: 11 + ((i * 3) % 10),
}));

type WordId =
  | "grandpa"
  | "grandma"
  | "uncle"
  | "dad"
  | "mom"
  | "aunt"
  | "cousin"
  | "brother"
  | "sister";

type Chars = {
  skin: string;
  hair: string;
  shirt: string;
  longHair?: boolean;
  bun?: boolean;
  glasses?: boolean;
  mustache?: boolean;
  cap?: boolean;
  capColor?: string;
  bow?: boolean;
  bowColor?: string;
};

type WordDef = { id: WordId; en: string; th: string; c: Chars };

const WORDS: WordDef[] = [
  {
    id: "grandpa",
    en: "Grandpa",
    th: "คุณปู่ / คุณตา",
    c: { skin: "#F3CDA6", hair: "#D8DCE6", shirt: "#7BA7D9", glasses: true, mustache: true },
  },
  {
    id: "grandma",
    en: "Grandma",
    th: "คุณย่า / คุณยาย",
    c: { skin: "#F5D2B0", hair: "#DEE2EA", shirt: "#EE9CBB", glasses: true, bun: true, longHair: true },
  },
  {
    id: "uncle",
    en: "Uncle",
    th: "ลุง / อา / น้า",
    c: { skin: "#E3B183", hair: "#3A2A22", shirt: "#4FB98C", mustache: true },
  },
  {
    id: "dad",
    en: "Dad",
    th: "พ่อ",
    c: { skin: "#F0C49B", hair: "#4A3229", shirt: "#5C5EE6" },
  },
  {
    id: "mom",
    en: "Mom",
    th: "แม่",
    c: { skin: "#F5D2B0", hair: "#5B3A2E", shirt: "#FF9D5C", longHair: true },
  },
  {
    id: "aunt",
    en: "Aunt",
    th: "ป้า / น้า",
    c: { skin: "#E9BE93", hair: "#7A4A2B", shirt: "#B57BEA", longHair: true, bun: true },
  },
  {
    id: "cousin",
    en: "Cousin",
    th: "ลูกพี่ลูกน้อง",
    c: { skin: "#EFC49A", hair: "#6B4423", shirt: "#FFD166", cap: true, capColor: "#EF476F" },
  },
  {
    id: "brother",
    en: "Brother",
    th: "พี่ชาย / น้องชาย",
    c: { skin: "#F0C49B", hair: "#2F2320", shirt: "#35B0E0", cap: true, capColor: "#14B79A" },
  },
  {
    id: "sister",
    en: "Sister",
    th: "พี่สาว / น้องสาว",
    c: { skin: "#F5D2B0", hair: "#4A2C2A", shirt: "#FF7FA5", longHair: true, bow: true, bowColor: "#FFD166" },
  },
];

const WORD_MAP: Record<WordId, WordDef> = WORDS.reduce(
  (acc, w) => ({ ...acc, [w.id]: w }),
  {} as Record<WordId, WordDef>,
);

type LayoutCell = { id: WordId | "__me__"; cx: number; cy: number };

const LAYOUT: LayoutCell[] = [
  { id: "grandpa", cx: 330, cy: 6 },
  { id: "grandma", cx: 450, cy: 6 },
  { id: "uncle", cx: 100, cy: 156 },
  { id: "dad", cx: 330, cy: 156 },
  { id: "mom", cx: 450, cy: 156 },
  { id: "aunt", cx: 660, cy: 156 },
  { id: "cousin", cx: 100, cy: 306 },
  { id: "brother", cx: 300, cy: 306 },
  { id: "__me__", cx: 420, cy: 306 },
  { id: "sister", cx: 540, cy: 306 },
];

type StoryItem = { correct: WordId; options: WordId[]; sentence: string };

const STORY_POOL: StoryItem[] = [
  { correct: "mom", options: ["mom", "sister", "aunt"], sentence: "The woman who is married to my dad is my ___." },
  { correct: "mom", options: ["mom", "grandma", "cousin"], sentence: "My brother and I have the same mother. She is my ___." },
  { correct: "dad", options: ["dad", "brother", "uncle"], sentence: "The man who is married to my mom is my ___." },
  { correct: "dad", options: ["dad", "grandpa", "cousin"], sentence: "My sister and I have the same father. He is my ___." },
  { correct: "grandpa", options: ["grandpa", "dad", "uncle"], sentence: "My dad's father is my ___." },
  { correct: "grandpa", options: ["grandpa", "brother", "cousin"], sentence: "My mom's father is my ___." },
  { correct: "grandma", options: ["grandma", "mom", "aunt"], sentence: "My mom's mother is my ___." },
  { correct: "grandma", options: ["grandma", "sister", "cousin"], sentence: "My dad's mother is my ___." },
  { correct: "uncle", options: ["uncle", "dad", "brother"], sentence: "My dad's brother is my ___." },
  { correct: "uncle", options: ["uncle", "grandpa", "cousin"], sentence: "My mom's brother is my ___." },
  { correct: "aunt", options: ["aunt", "mom", "sister"], sentence: "My mom's sister is my ___." },
  { correct: "aunt", options: ["aunt", "grandma", "cousin"], sentence: "My dad's sister is my ___." },
  { correct: "sister", options: ["sister", "mom", "aunt"], sentence: "The girl who has the same parents as me is my ___." },
  { correct: "sister", options: ["sister", "grandma", "cousin"], sentence: "My parents' daughter, who is not me, is my ___." },
  { correct: "brother", options: ["brother", "dad", "uncle"], sentence: "The boy who has the same parents as me is my ___." },
  { correct: "brother", options: ["brother", "grandpa", "cousin"], sentence: "My parents' son, who is not me, is my ___." },
  { correct: "cousin", options: ["cousin", "sister", "aunt"], sentence: "My aunt's child is my ___." },
  { correct: "cousin", options: ["cousin", "brother", "uncle"], sentence: "My uncle's daughter is my ___." },
  { correct: "cousin", options: ["cousin", "dad", "grandpa"], sentence: "My dad's brother's son is my ___." },
  { correct: "cousin", options: ["cousin", "mom", "grandma"], sentence: "My mom's sister's daughter is my ___." },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function charOf(id: WordId): Chars {
  const c = WORD_MAP[id].c;
  return {
    skin: c.skin,
    hair: c.hair,
    shirt: c.shirt,
    longHair: !!c.longHair,
    bun: !!c.bun,
    glasses: !!c.glasses,
    mustache: !!c.mustache,
    cap: !!c.cap,
    capColor: c.capColor || "#EF476F",
    bow: !!c.bow,
    bowColor: c.bowColor || "#FF7FA5",
  };
}

// ---------- FamilyFace avatar ----------
// Ported 1:1 from the "KcFace" component in the Khuncool Design System
// (layered absolutely-positioned divs at a fixed 64x74 native size, scaled
// via transform for the different places it's used across the game).
function FamilyFace({
  skin,
  hair,
  shirt,
  longHair,
  bun,
  glasses,
  mustache,
  cap,
  capColor,
  bow,
  bowColor,
  size = 64,
}: Chars & { size?: number }) {
  const scale = size / 64;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: 74 * scale,
        flex: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 64,
          height: 74,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 64,
            height: 74,
            animation: "kcBreathe 3.2s ease-in-out infinite",
          }}
        >
        {/* shirt / body */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            width: 54,
            height: 30,
            borderRadius: "27px 27px 9px 9px",
            background: shirt,
            boxShadow: "inset 0 -5px 0 rgba(0,0,0,.09)",
          }}
        />
        {/* neck */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 22,
            transform: "translateX(-50%)",
            width: 15,
            height: 13,
            background: skin,
            borderRadius: 5,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            width: 20,
            height: 12,
            borderRadius: "0 0 12px 12px",
            background: "rgba(255,255,255,.28)",
          }}
        />
        {longHair && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 12,
              transform: "translateX(-50%)",
              width: 56,
              height: 50,
              borderRadius: "28px 28px 20px 20px",
              background: hair,
            }}
          />
        )}
        {bun && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              transform: "translateX(-50%)",
              width: 26,
              height: 22,
              borderRadius: "50%",
              background: hair,
            }}
          />
        )}
        {/* head */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 9,
            transform: "translateX(-50%)",
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: skin,
            boxShadow: "inset -3px -5px 0 rgba(0,0,0,.07)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -3,
              top: -7,
              width: 50,
              height: 24,
              borderRadius: "25px 25px 4px 4px",
              background: hair,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 11,
              top: 20,
              width: 6,
              height: 7,
              borderRadius: "50%",
              background: "#2A2331",
              animation: "kcBlink 4.6s infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 11,
              top: 20,
              width: 6,
              height: 7,
              borderRadius: "50%",
              background: "#2A2331",
              animation: "kcBlink 4.6s infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 5,
              top: 28,
              width: 9,
              height: 6,
              borderRadius: "50%",
              background: "#FF9DB0",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 5,
              top: 28,
              width: 9,
              height: 6,
              borderRadius: "50%",
              background: "#FF9DB0",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 29,
              transform: "translateX(-50%)",
              width: 14,
              height: 8,
              borderRadius: "0 0 14px 14px",
              background: "#B3405A",
            }}
          />
          {mustache && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 26,
                transform: "translateX(-50%)",
                width: 20,
                height: 6,
                borderRadius: 6,
                background: hair,
              }}
            />
          )}
          {glasses && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 6,
                  top: 16,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid #4A4F63",
                  background: "rgba(255,255,255,.35)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 6,
                  top: 16,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid #4A4F63",
                  background: "rgba(255,255,255,.35)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 22,
                  transform: "translateX(-50%)",
                  width: 8,
                  height: 2,
                  background: "#4A4F63",
                }}
              />
            </>
          )}
          {cap && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: -4,
                  top: -10,
                  width: 52,
                  height: 24,
                  borderRadius: "26px 26px 3px 3px",
                  background: capColor,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 26,
                  top: 10,
                  width: 32,
                  height: 8,
                  borderRadius: "0 8px 8px 0",
                  background: capColor,
                  filter: "brightness(.88)",
                }}
              />
            </>
          )}
          {bow && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: -8,
                  top: -4,
                  width: 14,
                  height: 14,
                  borderRadius: "50% 50% 50% 20%",
                  background: bowColor,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: "50% 20% 50% 50%",
                  background: bowColor,
                  filter: "brightness(.92)",
                }}
              />
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

// ---------- component ----------

type S1State = {
  bank: WordId[];
  targets: Record<WordId, { filled: boolean }>;
  selected: WordId | null;
  shakeId: WordId | null;
  hoverId: WordId | null;
  fxId: WordId | null;
};

type S2State = {
  left: WordId[];
  right: WordId[];
  selectedLeft: WordId | null;
  selectedRight: WordId | null;
  matched: WordId[];
  shakePair: { left: WordId; right: WordId } | null;
  combo: number;
  fxId: WordId | null;
};

type S3Question = { correctId: WordId; options: WordId[] };
type S3State = {
  qIndex: number;
  questions: S3Question[];
  answeredId: WordId | null;
  completed: boolean;
};

type S4State = {
  answers: (WordId | null)[];
  correct: boolean[];
};

type ConfettiPiece = { id: number; left: string; color: string; delay: string; dur: string };

const CONFETTI_COLORS = ["#5C5EE6", "#14B79A", "#FF9D5C", "#FFD166", "#EF476F"];

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: (Math.random() * 100).toFixed(1),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (Math.random() * 1.4).toFixed(2),
    dur: (2.2 + Math.random() * 1.6).toFixed(2),
  })) as unknown as ConfettiPiece[];
}

function buildS1(): S1State {
  const bank = shuffle(WORDS.map((w) => w.id));
  const targets = {} as Record<WordId, { filled: boolean }>;
  WORDS.forEach((w) => {
    targets[w.id] = { filled: false };
  });
  return { bank, targets, selected: null, shakeId: null, hoverId: null, fxId: null };
}

/** Pairs per column-pair on the matching board: two groups, 5 then 4. */
export const S2_GROUP_SIZES = [5, 4];

function buildS2(): S2State {
  // Group first, then shuffle inside each group. Shuffling all nine across both
  // sides would let a word sit in the first group on the left and the second on
  // the right, and its connector would be drawn across the gap between them.
  const ids = shuffle(WORDS.map((w) => w.id));
  const groups = S2_GROUP_SIZES.map((n, i) =>
    ids.slice(S2_GROUP_SIZES.slice(0, i).reduce((a, b) => a + b, 0)).slice(0, n),
  );
  return {
    left: groups.flatMap((g) => shuffle(g)),
    right: groups.flatMap((g) => shuffle(g)),
    selectedLeft: null,
    selectedRight: null,
    matched: [],
    shakePair: null,
    combo: 0,
    fxId: null,
  };
}

function buildS3(): S3State {
  const qIds = shuffle(WORDS.map((w) => w.id)).slice(0, 5);
  const questions: S3Question[] = qIds.map((id) => {
    const distractors = shuffle(WORDS.filter((w) => w.id !== id)).slice(0, 3);
    return { correctId: id, options: shuffle([id, ...distractors.map((w) => w.id)]) };
  });
  return { qIndex: 0, questions, answeredId: null, completed: false };
}

function buildS4(): S4State {
  return { answers: [null, null, null, null], correct: [false, false, false, false] };
}

function buildStoryBlanks(): StoryItem[] {
  return shuffle(STORY_POOL)
    .slice(0, 4)
    .map((b) => ({ ...b, options: shuffle(b.options) }));
}

export default function FamilyTreeApp() {
  useTrackToolUse("media-english-family-tree");
  const { ref: fullRef, isFull, stageProps, toggle: toggleFull } = useStage<HTMLDivElement>();
  const pointerDragRef = useRef<{
    id: WordId;
    pointerId: number;
    startX: number;
    startY: number;
    dragging: boolean;
  } | null>(null);
  const suppressBankClickRef = useRef(false);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const mouseDragRef = useRef<{
    id: WordId;
    startX: number;
    startY: number;
    dragging: boolean;
  } | null>(null);

  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5 | 10>(0);
  const [stars, setStars] = useState(0);
  const [confetti] = useState<ConfettiPiece[]>(() => makeConfetti());

  const [storyBlanks, setStoryBlanks] = useState<StoryItem[]>(() => buildStoryBlanks());
  const [s1, setS1] = useState<S1State>(() => buildS1());
  const [dragPreview, setDragPreview] = useState<{ id: WordId; x: number; y: number } | null>(null);
  const [s2, setS2] = useState<S2State>(() => buildS2());
  const [s3, setS3] = useState<S3State>(() => buildS3());
  const [s4, setS4] = useState<S4State>(() => buildS4());

  const [muted, setMuted] = useState(() => KcSfx.isMuted());
  const [bgm, setBgm] = useState(() => KcSfx.isBgm());

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  useEffect(() => () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();
  }, []);

  const resetAll = useCallback(() => {
    setStars(0);
    setStoryBlanks(buildStoryBlanks());
    setS1(buildS1());
    setS2(buildS2());
    setS3(buildS3());
    setS4(buildS4());
  }, []);

  const goStage = useCallback((n: 0 | 1 | 2 | 3 | 4 | 5 | 10) => {
    KcSfx.play("whoosh");
    setStage(n);
  }, []);

  const restart = useCallback(() => {
    resetAll();
    setStage(0);
  }, [resetAll]);

  const toggleMute = useCallback(() => {
    const m = KcSfx.toggleMuted();
    setMuted(m);
    if (!m) KcSfx.play("click");
  }, []);

  const toggleBgm = useCallback(() => {
    const on = !bgm;
    KcSfx.unlock();
    KcSfx.bgm(on);
    setBgm(on);
  }, [bgm]);

  // ---------- stage 1: drag & drop ----------
  const tryPlace = useCallback((targetId: WordId, wordId: WordId) => {
    if (targetId === wordId) {
      KcSfx.play("drop");
      later(() => KcSfx.play("correct"), 90);
      setS1((s) => ({
        ...s,
        targets: { ...s.targets, [targetId]: { filled: true } },
        bank: s.bank.filter((id) => id !== wordId),
        selected: null,
        fxId: targetId,
      }));
      setStars((n) => n + 1);
      later(() => setS1((s) => ({ ...s, fxId: null })), 900);
    } else {
      KcSfx.play("wrong");
      setS1((s) => ({ ...s, shakeId: targetId, selected: null }));
      later(() => setS1((s) => ({ ...s, shakeId: null })), 520);
    }
  }, [later]);

  const selectBank = useCallback(
    (id: WordId) => {
      if (!s1.bank.includes(id)) return;
      KcSfx.play("click");
      setS1((s) => ({ ...s, selected: s.selected === id ? null : id }));
    },
    [s1.bank],
  );

  const placeTarget = useCallback(
    (targetId: WordId) => {
      if (s1.targets[targetId].filled || !s1.selected) return;
      tryPlace(targetId, s1.selected);
    },
    [s1.targets, s1.selected, tryPlace],
  );

  const showDragPreview = useCallback((id: WordId, clientX: number, clientY: number) => {
    const root = fullRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    setDragPreview({
      id,
      x: ((clientX - rect.left) / rect.width) * root.offsetWidth,
      y: ((clientY - rect.top) / rect.height) * root.offsetHeight,
    });
  }, [fullRef]);

  const pointerDragStart = useCallback((e: React.PointerEvent<HTMLElement>, id: WordId) => {
    if (e.pointerType === "mouse") return;
    if (e.button !== 0) return;
    KcSfx.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerDragRef.current = {
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
    };
  }, []);

  const pointerDragMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (!drag.dragging && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return;
    drag.dragging = true;
    e.preventDefault();
    showDragPreview(drag.id, e.clientX, e.clientY);
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-family-target]");
    const targetId = (target?.dataset.familyTarget ?? null) as WordId | null;
    setS1((s) => ({
      ...s,
      selected: drag.id,
      hoverId: targetId && !s.targets[targetId]?.filled ? targetId : null,
    }));
  }, [showDragPreview]);

  const pointerDragFinish = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = pointerDragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      pointerDragRef.current = null;
      setDragPreview(null);
      if (!drag.dragging) return;
      e.preventDefault();
      suppressBankClickRef.current = true;
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-family-target]");
      const targetId = (target?.dataset.familyTarget ?? null) as WordId | null;
      setS1((s) => ({ ...s, hoverId: null }));
      if (targetId) tryPlace(targetId, drag.id);
      later(() => {
        suppressBankClickRef.current = false;
      }, 0);
    },
    [tryPlace, later],
  );

  const pointerDragCancel = useCallback(() => {
    pointerDragRef.current = null;
    setDragPreview(null);
    setS1((s) => ({ ...s, hoverId: null }));
  }, []);

  const mouseDragStart = useCallback((e: React.MouseEvent<HTMLElement>, id: WordId) => {
    if (e.button !== 0) return;
    e.preventDefault();
    KcSfx.unlock();
    mouseDragRef.current = { id, startX: e.clientX, startY: e.clientY, dragging: false };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = mouseDragRef.current;
      if (!drag) return;
      if (!drag.dragging && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return;
      drag.dragging = true;
      e.preventDefault();
      showDragPreview(drag.id, e.clientX, e.clientY);
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-family-target]");
      const targetId = (target?.dataset.familyTarget ?? null) as WordId | null;
      setS1((s) => ({
        ...s,
        selected: drag.id,
        hoverId: targetId && !s.targets[targetId]?.filled ? targetId : null,
      }));
    };
    const onUp = (e: MouseEvent) => {
      const drag = mouseDragRef.current;
      if (!drag) return;
      mouseDragRef.current = null;
      setDragPreview(null);
      if (!drag.dragging) return;
      suppressBankClickRef.current = true;
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-family-target]");
      const targetId = (target?.dataset.familyTarget ?? null) as WordId | null;
      setS1((s) => ({ ...s, hoverId: null }));
      if (targetId) tryPlace(targetId, drag.id);
      later(() => {
        suppressBankClickRef.current = false;
      }, 0);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [showDragPreview, tryPlace, later]);

  const s1Done = s1.bank.length === 0;

  // ---------- stage 2: matching ----------
  const maybeMatch = useCallback((left: WordId | null, right: WordId | null) => {
    if (!left || !right) return;
    if (left === right) {
      const id = left;
      setS2((s) => {
        KcSfx.play(s.combo >= 2 ? "combo" : "correct");
        return {
          ...s,
          matched: [...s.matched, id],
          selectedLeft: null,
          selectedRight: null,
          combo: s.combo + 1,
          fxId: id,
        };
      });
      setStars((n) => n + 1);
      later(() => setS2((s) => ({ ...s, fxId: null })), 850);
    } else {
      KcSfx.play("wrong");
      setS2((s) => ({ ...s, shakePair: { left, right }, combo: 0 }));
      later(
        () => setS2((s) => ({ ...s, shakePair: null, selectedLeft: null, selectedRight: null })),
        520,
      );
    }
  }, [later]);

  const clickLeft = useCallback(
    (id: WordId) => {
      if (s2.matched.includes(id)) return;
      KcSfx.play("click");
      setS2((s) => ({ ...s, selectedLeft: id }));
      maybeMatch(id, s2.selectedRight);
    },
    [s2.matched, s2.selectedRight, maybeMatch],
  );

  const clickRight = useCallback(
    (id: WordId) => {
      if (s2.matched.includes(id)) return;
      KcSfx.play("click");
      setS2((s) => ({ ...s, selectedRight: id }));
      maybeMatch(s2.selectedLeft, id);
    },
    [s2.matched, s2.selectedLeft, maybeMatch],
  );

  const s2Done = s2.matched.length === WORDS.length;

  // ---------- stage 3: listening quiz ----------
  const playCurrentQ = useCallback(() => {
    const q = s3.questions[s3.qIndex];
    if (!q) return;
    speakEnglish(WORD_MAP[q.correctId].en, true);
  }, [s3.questions, s3.qIndex]);

  const answerQ = useCallback(
    (optId: WordId) => {
      if (s3.answeredId) return;
      const correct = optId === s3.questions[s3.qIndex].correctId;
      KcSfx.play(correct ? "correct" : "wrong");
      setS3((s) => ({ ...s, answeredId: optId }));
      if (correct) setStars((n) => n + 1);
    },
    [s3.answeredId, s3.questions, s3.qIndex],
  );

  const nextQ = useCallback(() => {
    const isLast = s3.qIndex >= s3.questions.length - 1;
    setS3((s) => {
      if (s.qIndex < s.questions.length - 1) {
        return { ...s, qIndex: s.qIndex + 1, answeredId: null };
      }
      return { ...s, completed: true };
    });
    if (isLast) {
      KcSfx.play("whoosh");
      setStage(10);
    }
  }, [s3.qIndex, s3.questions.length]);

  useEffect(() => {
    if (stage === 3 && !s3.answeredId) {
      const t = setTimeout(() => playCurrentQ(), 260);
      return () => clearTimeout(t);
    }
  }, [stage, s3.qIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- stage 4: fill in the blank ----------
  const selectBlank = useCallback(
    (idx: number, optId: WordId) => {
      if (s4.correct[idx]) return;
      const isCorrect = optId === storyBlanks[idx].correct;
      KcSfx.play(isCorrect ? "correct" : "wrong");
      setS4((s) => {
        const answers = [...s.answers];
        answers[idx] = optId;
        const correct = [...s.correct];
        if (isCorrect) correct[idx] = true;
        return { ...s, answers, correct };
      });
      if (isCorrect) setStars((n) => n + 1);
    },
    [s4.correct, storyBlanks],
  );

  const s4AllCorrect = s4.correct.every(Boolean);
  const allDone = s1Done && s2Done && s3.completed && s4AllCorrect;

  // ---------- derived layout values ----------
  // 62, not 68: the row gap was 12px between 56px buttons. Six is enough to
  // read them apart and takes 30px off a five-row board, which is what lifts
  // the scale from 0.40 to 0.48 and the buttons from 22px to the far side of
  // the 24px floor. The SVG reads pitch too, so the connectors follow.
  const pitch = 62;
  const half = 28;
  // Two column-pairs side by side rather than one nine deep. Nine rows made the
  // board 612px tall, and no scale could fit that into a 238px stage while
  // keeping the 56px buttons above the 24px tap floor — 0.43 was needed to fit
  // and 0.43 puts them at 24px with the board still 24px too tall. Five rows
  // make it 340px, which fits at 0.70 and leaves the buttons at 39px. The width
  // it costs is width the shallow board had spare.
  const s2GroupWidth = 496;
  const s2GroupGap = 48;
  const s2Height = Math.max(...S2_GROUP_SIZES) * pitch;
  const s2Width = S2_GROUP_SIZES.length * s2GroupWidth + (S2_GROUP_SIZES.length - 1) * s2GroupGap;
  const s2Groups = S2_GROUP_SIZES.map((n, i) => {
    const start = S2_GROUP_SIZES.slice(0, i).reduce((a, b) => a + b, 0);
    return { start, ids: { left: s2.left.slice(start, start + n), right: s2.right.slice(start, start + n) }, x: i * (s2GroupWidth + s2GroupGap) };
  });

  const showTopRight = stage !== 0;
  const showBackToHub = stage >= 1 && (stage as number) <= 4;

  const introCast: WordId[] = ["grandpa", "grandma", "dad", "mom", "sister"];

  return (
    <div {...stageProps} className="kc-stage">
    <div
      className={`kc-stage-body ${styles.body} kc-game kc-family-game kc-stage-${stage} ${stage === 0 ? "kc-game-intro" : ""}`}
      onMouseOver={hoverSfxDelegate}
      style={{
        borderRadius: 24,
        background: "linear-gradient(170deg,#EAF1FF 0%,#EFF0FE 45%,#E6FBF6 100%)",
      }}
    >
      <GameBackdrop
        sun={{ top: 36, right: 70, size: 120, from: "#FFE59A", via: "#FFD166" }}
        blobs={[
          { top: -90, left: -110, size: 360, color: "#C6C9FB" },
          { top: 240, right: -130, size: 400, color: "#B6F3E4" },
          { bottom: -110, left: "28%", size: 320, color: "#FFE0C2" },
        ]}
        clouds={[
          { top: 80, dur: 46 },
          { top: 200, dur: 64, delay: 8, opacity: 0.75, width: 110, height: 38 },
        ]}
      />
      {LEAVES.map((lf, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${lf.left}%`,
            width: lf.size,
            height: lf.size,
            borderRadius: "0 100% 0 100%",
            background: lf.color,
            opacity: 0.7,
            pointerEvents: "none",
            animation: `swayLeaf ${lf.dur}s linear ${lf.delay}s infinite`,
          }}
        />
      ))}
      {dragPreview && (
        <div
          data-family-drag-preview={dragPreview.id}
          style={{
            position: "absolute",
            left: dragPreview.x,
            top: dragPreview.y,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 16px 7px 8px",
            borderRadius: 999,
            border: "2px solid #5C5EE6",
            background: "rgba(255,255,255,.96)",
            boxShadow: "0 18px 34px -12px rgba(70,66,190,.75)",
            color: "#30338F",
            fontWeight: 700,
            fontSize: 15,
            pointerEvents: "none",
            transform: "translate(-50%,-60%) rotate(-2deg) scale(1.08)",
          }}
        >
          <FamilyFace {...charOf(dragPreview.id)} size={30} />
          <span>{WORD_MAP[dragPreview.id].en}</span>
        </div>
      )}
      {/* top bar */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          padding: "14px 16px",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/khuncool-logo.webp"
            alt="KhunCool"
            style={{ width: 38, height: 38, flex: "none", objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(92,94,230,.5))" }}
          />
          <div className="kc-title" style={{ fontWeight: 600, fontSize: 18 }}>Family Tree Explorer</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
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
          {showTopRight && (
          <>
            {showBackToHub && (
              <button
                type="button"
                onClick={() => goStage(10)}
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#5C5EE6",
                  background: "#E1E3FD",
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                🎮 มินิเกม
              </button>
            )}
            <button
              type="button"
              onClick={toggleBgm}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                height: 36,
                padding: "0 14px",
                borderRadius: 999,
                border: "1px solid #E5E8EE",
                background: bgm ? "#E1E3FD" : "#fff",
                color: bgm ? "#4A46D6" : "#8A93A5",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 3,
                      height: 14,
                      borderRadius: 2,
                      background: bgm ? "#5C5EE6" : "#C9CFE0",
                      transformOrigin: "bottom",
                      animation: bgm ? `eqBar ${(0.5 + i * 0.16).toFixed(2)}s ease-in-out infinite` : "none",
                    }}
                  />
                ))}
              </span>
              <span>{bgm ? "เพลง" : "ปิดเพลง"}</span>
            </button>
            <button
              type="button"
              onClick={toggleMute}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid #E5E8EE",
                background: muted ? "#F1F3F7" : "#fff",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                border: "1px solid #E5E8EE",
                borderRadius: 999,
                padding: "7px 14px",
                fontWeight: 600,
                fontSize: 15,
                color: "#C2500B",
              }}
            >
              <span style={{ animation: "popStar 1.8s ease-in-out infinite" }}>⭐</span>
              <span>{stars}</span>
            </div>
          </>
        )}
          <button
            type="button"
            onClick={toggleFull}
            aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid #E5E8EE",
              background: isFull ? "#E1E3FD" : "#fff",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            ⛶
          </button>
        </div>
      </div>

      {/* STAGE 0: INTRO */}
      {stage === 0 && (
        <div className={`${styles.screen} kc-family-stage kc-family-intro`} style={{ position: "relative", maxWidth: 760, margin: "24px auto 0", padding: "0 24px clamp(20px,6cqb,90px)", textAlign: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end", gap: 6, marginBottom: 22 }}>
            {introCast.map((id, i) => (
              <div
                key={id}
                style={{
                  animation: `floatY ${(2.8 + i * 0.2).toFixed(1)}s ease-in-out infinite`,
                  animationDelay: `${(i * 0.15).toFixed(2)}s`,
                }}
              >
                <FamilyFace {...charOf(id)} size={i === 2 || i === 3 ? 70 : 64} />
              </div>
            ))}
          </div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(32px,5cqi,48px)", margin: "0 0 14px" }}>
            มาเรียนรู้คำศัพท์
            <span
              style={{
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              Family Tree{" "}
            </span>
            กันเถอะ!
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#5A6273", margin: "0 0 34px" }}>
            ลากคำศัพท์ปลูกต้นไม้ครอบครัว จับคู่คำกับรูปภาพ ฟังเสียงแล้วเดา และเติมคำในเรื่องราวของเรา — 4
            ด่านสนุก ครบจบในหน้าเดียว!
          </p>
          <button
            type="button"
            onClick={() => goStage(10)}
            style={{
              fontWeight: 600,
              fontSize: 19,
              color: "#fff",
              background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
              border: "none",
              borderRadius: 999,
              padding: "16px 42px",
              animation: "pulseGlow 2.4s ease-in-out infinite",
              cursor: "pointer",
              boxShadow: "0 12px 26px -8px rgba(92,94,230,.6)",
            }}
          >
            เริ่มเล่น 🚀
          </button>
        </div>
      )}

      {/* HUB (stage 10) */}
      {stage === 10 && (
        <div className={`${styles.screen} kc-family-stage kc-family-menu`} style={{ position: "relative", maxWidth: 780, margin: "0 auto", padding: "8px 24px clamp(20px,6cqb,100px)", textAlign: "center" }}>
          <h2 style={{ fontWeight: 600, fontSize: 26, margin: "0 0 8px" }}>เลือกมินิเกมที่อยากเล่น 🎮</h2>
          <p style={{ fontSize: 15, color: "#5A6273", margin: "0 0 28px" }}>เล่นข้อไหนก่อนก็ได้ เล่นซ้ำได้เรื่อยๆ</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(45%,200px),1fr))", gap: "clamp(10px,3cqi,18px)" }}>
            {[
              { n: 1 as const, emoji: "🌳", label: "ปลูกต้นไม้ครอบครัว", desc: "ลาก & วางคำศัพท์", done: s1Done, blob: "#D5FBEF" },
              { n: 2 as const, emoji: "🔗", label: "จับคู่คำศัพท์", desc: "Matching", done: s2Done, blob: "#E1E3FD" },
              { n: 3 as const, emoji: "🎧", label: "ฟังแล้วเดา", desc: "Listening Quiz", done: s3.completed, blob: "#FFE7CF" },
              { n: 4 as const, emoji: "📖", label: "เติมคำในเรื่อง", desc: "Fill in the Blank", done: s4AllCorrect, blob: "#FFD9E4" },
            ].map((g) => (
              <button
                key={g.n}
                type="button"
                onClick={() => goStage(g.n)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  background: g.done ? "#F5FFFC" : "#fff",
                  border: `2px solid ${g.done ? "#14B79A" : "#E9ECF3"}`,
                  borderRadius: "clamp(16px,4cqi,22px)",
                  padding: "clamp(14px,4cqi,26px) clamp(8px,3cqi,16px)",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 10px 22px -16px rgba(0,0,0,.5)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -30,
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    background: g.blob,
                    opacity: 0.5,
                  }}
                />
                {g.done && <span style={{ position: "absolute", top: 8, right: 10, fontSize: "clamp(14px,3.4cqi,18px)" }}>✅</span>}
                <div style={{ fontSize: "clamp(30px,7cqi,44px)", position: "relative", animation: "floatY 3.2s ease-in-out infinite" }}>{g.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: "clamp(13px,3.4cqi,16px)", position: "relative" }}>{g.label}</div>
                <div style={{ fontSize: "clamp(11px,2.6cqi,12px)", color: "#7C8494", position: "relative" }}>{g.desc}</div>
              </button>
            ))}
          </div>
          {allDone && (
            <button
              type="button"
              onClick={() => goStage(5)}
              style={{
                marginTop: 32,
                fontWeight: 600,
                fontSize: 18,
                color: "#fff",
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                border: "none",
                borderRadius: 999,
                padding: "14px 36px",
                animation: "bounceIn .5s ease",
                cursor: "pointer",
                boxShadow: "0 8px 20px -6px rgba(92,94,230,.5)",
              }}
            >
              ดูผลรวมทั้งหมด 🏆
            </button>
          )}
        </div>
      )}

      {/* STAGE 1: DRAG & DROP */}
      {stage === 1 && (
        <div className={`${styles.screen} kc-family-stage kc-family-tree`} style={{ position: "relative", maxWidth: 960, margin: "0 auto", padding: "8px 16px clamp(20px,6cqb,100px)", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 22,
              padding: "8px 16px",
              margin: "0 auto 10px",
              boxShadow: "0 12px 24px -16px rgba(0,0,0,.4)",
            }}
          >
            <div style={{ fontSize: "clamp(28px,7cqi,46px)", animation: "floatY 3s ease-in-out infinite" }}>🦉</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: ".14em", color: "#5C5EE6", fontWeight: 600, marginBottom: 4 }}>
                ด่านที่ 1 · DRAG &amp; DROP · {WORDS.length - s1.bank.length} / {WORDS.length}
              </div>
              <div style={{ fontWeight: 600, fontSize: "clamp(14px,3.6cqi,20px)" }}>ลากคำศัพท์ไปวางบนต้นไม้ครอบครัวให้ถูกตำแหน่ง 🌳</div>
            </div>
          </div>

          <div
            className={`kc-family-tree-viewport ${styles.canvasViewport}`}
            style={{ "--kc-canvas-w": "780px", "--kc-canvas-h": "430px", "--kc-canvas-ratio": "780 / 430" } as React.CSSProperties}
          >
            <div className={`kc-family-tree-canvas ${styles.canvasStage}`}>
              <svg viewBox="0 0 780 430" style={{ position: "absolute", inset: 0, width: 780, height: 430 }}>
                <g stroke="#8FDCC9" strokeWidth={4} strokeLinecap="round" fill="none">
                  <path d="M382 58 H398" stroke="#FFB4C6" strokeWidth={6} />
                  <path d="M390 58 V112" style={{ strokeDasharray: "10 8", animation: "dashFlow 1.1s linear infinite" }} />
                  <path d="M100 112 H660" style={{ strokeDasharray: "10 8", animation: "dashFlow 1.4s linear infinite" }} />
                  <path d="M100 112 V156" />
                  <path d="M330 112 V156" />
                  <path d="M660 112 V156" />
                  <path d="M382 208 H398" stroke="#FFB4C6" strokeWidth={6} />
                  <path d="M390 208 V262" style={{ strokeDasharray: "10 8", animation: "dashFlow 1.1s linear infinite .3s" }} />
                  <path d="M300 262 H540" style={{ strokeDasharray: "10 8", animation: "dashFlow 1.4s linear infinite .2s" }} />
                  <path d="M300 262 V306" />
                  <path d="M420 262 V306" />
                  <path d="M540 262 V306" />
                  <path d="M100 260 V306" style={{ strokeDasharray: "10 8", animation: "dashFlow 1.2s linear infinite" }} />
                </g>
                <circle cx={390} cy={58} r={6} fill="#FF8FA8" />
                <circle cx={390} cy={208} r={6} fill="#FF8FA8" />
              </svg>

              {LAYOUT.map((pos) => {
                const left = pos.cx - 52;
                const top = pos.cy;
                if (pos.id === "__me__") {
                  return (
                    <div key="me" style={{ position: "absolute", left, top, width: 104, height: 104 }}>
                      <div
                        style={{
                          width: 104,
                          height: 104,
                          borderRadius: 22,
                          background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          paddingBottom: 8,
                          color: "#fff",
                          boxShadow: "0 12px 22px -10px rgba(92,94,230,.7)",
                          animation: "floatY 3.6s ease-in-out infinite",
                        }}
                      >
                        <FamilyFace skin="#F0C49B" hair="#2F2320" shirt="#FFFFFF" size={56} />
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Me / ฉัน</div>
                      </div>
                    </div>
                  );
                }
                const id = pos.id as WordId;
                const w = WORD_MAP[id];
                const t = s1.targets[id];
                const shaking = s1.shakeId === id;
                const hovering = s1.hoverId === id && !t.filled;
                const hint = !t.filled && s1.selected === id;
                const fx = s1.fxId === id;
                return (
                  <div key={id} style={{ position: "absolute", left, top, width: 104, height: 104 }}>
                    <button
                      type="button"
                      data-family-target={id}
                      onClick={() => placeTarget(id)}
                      aria-label={
                        t.filled
                          ? `${w.th} — วางแล้ว: ${w.en}`
                          : `ช่องว่าง ${w.th} — แตะเพื่อวางคำที่เลือก`
                      }
                      style={{
                        position: "relative",
                        width: 104,
                        height: 104,
                        borderRadius: 22,
                        font: "inherit",
                        color: "inherit",
                        padding: 0,
                        textAlign: "center",
                        background: t.filled ? "#F0FFFB" : hovering ? "#EAF4FF" : "#fff",
                        border: `3px ${t.filled ? "solid" : "dashed"} ${
                          shaking ? "#EF476F" : t.filled ? "#14B79A" : hovering || hint ? "#5C5EE6" : "#C6C9FB"
                        }`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingBottom: 8,
                        cursor: "pointer",
                        transform: hovering ? "scale(1.08)" : "scale(1)",
                        boxShadow: t.filled
                          ? "0 12px 22px -12px rgba(20,183,154,.8)"
                          : hovering
                            ? "0 14px 26px -12px rgba(92,94,230,.7)"
                            : "0 6px 14px -12px rgba(0,0,0,.6)",
                        animation: shaking ? "shake .5s ease" : t.filled ? "popIn .45s ease" : "none",
                        transition: "transform .18s",
                      }}
                    >
                      {t.filled && (
                        <>
                          <FamilyFace {...charOf(id)} size={56} />
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#0A9380" }}>{w.en}</div>
                        </>
                      )}
                      {!t.filled && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "#EEF0FA",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 18,
                              color: "#AEB4C8",
                              fontWeight: 600,
                            }}
                          >
                            ?
                          </div>
                          <div style={{ fontSize: 11, color: "#AEB4C8", padding: "0 6px", lineHeight: 1.3 }}>{w.th}</div>
                        </div>
                      )}
                      {fx && (
                        <>
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              width: 90,
                              height: 90,
                              borderRadius: "50%",
                              border: "4px solid #14B79A",
                              animation: "ringBurst .7s ease-out forwards",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              width: 90,
                              height: 90,
                              borderRadius: "50%",
                              border: "3px solid #FFD166",
                              animation: "ringBurst .7s ease-out .12s forwards",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "20%",
                              fontWeight: 700,
                              fontSize: 16,
                              color: "#C2500B",
                              animation: "floatUp 1s ease-out forwards",
                            }}
                          >
                            +1 ⭐
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="kc-family-tree-help" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "4px 0 4px" }}>
            <div style={{ height: 2, width: 30, background: "#CFE9E1" }} />
            <div style={{ fontSize: 11, color: "#6B7285" }}>ลากการ์ดจากด้านล่าง หรือแตะเลือกแล้วแตะช่องว่าง</div>
            <div style={{ height: 2, width: 30, background: "#CFE9E1" }} />
          </div>

          <div className="kc-family-tree-bank" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", minHeight: 44 }}>
            {s1.bank.map((id) => {
              const w = WORD_MAP[id];
              const sel = s1.selected === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-family-word={id}
                  aria-pressed={sel}
                  aria-label={`${w.en} · ${w.th}`}
                  onMouseDown={(e) => mouseDragStart(e, id)}
                  onPointerDown={(e) => pointerDragStart(e, id)}
                  onPointerMove={pointerDragMove}
                  onPointerUp={pointerDragFinish}
                  onPointerCancel={pointerDragCancel}
                  onClick={() => {
                    if (!suppressBankClickRef.current) selectBank(id);
                  }}
                  className="kc-chip-hover"
                  style={{
                    font: "inherit",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#fff",
                    border: `2px solid ${sel ? "#5C5EE6" : "#E5E8EE"}`,
                    borderRadius: 999,
                    padding: "5px 14px 5px 6px",
                    cursor: "grab",
                    boxShadow: sel ? "0 14px 24px -12px rgba(92,94,230,.9)" : "0 6px 14px -10px rgba(0,0,0,.5)",
                    transform: sel ? "translateY(-6px) scale(1.05)" : "none",
                    fontWeight: 600,
                    fontSize: "clamp(13px,3.4cqi,15px)",
                    transition: "transform .18s",
                    fontFamily: "var(--font-fredoka), var(--font-anuphan), sans-serif",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                    touchAction: "none",
                  }}
                >
                  <FamilyFace {...charOf(id)} size={28} />
                  <span>{w.en}</span>
                </button>
              );
            })}
          </div>
          {s1Done && (
            <button
              type="button"
              onClick={() => goStage(10)}
              style={{
                marginTop: 32,
                fontWeight: 600,
                fontSize: 18,
                color: "#fff",
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                border: "none",
                borderRadius: 999,
                padding: "14px 36px",
                cursor: "pointer",
                boxShadow: "0 8px 20px -6px rgba(92,94,230,.5)",
              }}
            >
              เก่งมาก! ☰ กลับเมนู
            </button>
          )}
        </div>
      )}

      {/* STAGE 2: MATCHING */}
      {stage === 2 && (
        <div className={`${styles.screen} kc-family-stage kc-family-match`} style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "8px 24px clamp(20px,6cqb,100px)", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 22,
              padding: "14px 24px",
              margin: "0 auto 12px",
              boxShadow: "0 12px 24px -16px rgba(0,0,0,.4)",
            }}
          >
            <div style={{ fontSize: 46, animation: "floatY 3s ease-in-out infinite .2s" }}>🐼</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: ".14em", color: "#5C5EE6", fontWeight: 600, marginBottom: 4 }}>
                ด่านที่ 2 · MATCHING · {s2.matched.length} / {WORDS.length}
              </div>
              <div style={{ fontWeight: 600, fontSize: 20 }}>จับคู่คำศัพท์กับรูปภาพให้ตรงกัน 🔗</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "#6B7285" }}>คอมโบ</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#C2500B" }}>×{s2.combo}</span>
            <span style={{ fontSize: 16 }}>{s2.combo >= 5 ? "🔥" : s2.combo >= 3 ? "⚡" : "✨"}</span>
          </div>

          <div
            className={styles.canvasViewport}
            style={{ "--kc-canvas-w": `${s2Width}px`, "--kc-canvas-h": `${s2Height}px`, "--kc-canvas-ratio": `${s2Width} / ${s2Height}` } as React.CSSProperties}
          >
            <div className={styles.canvasStage}>
              <div className="kc-family-match-groups" style={{ display: "flex", gap: s2GroupGap, justifyContent: "center", position: "relative", zIndex: 3 }}>
                {s2Groups.map((group) => (
                <div key={group.start} style={{ display: "flex", gap: 56, width: s2GroupWidth, position: "relative" }}>
                <svg viewBox={`0 0 ${s2GroupWidth} ${s2Height}`} style={{ position: "absolute", left: 0, top: 0, width: s2GroupWidth, height: s2Height, pointerEvents: "none", zIndex: 2 }}>
                  {s2.matched.filter((id) => group.ids.left.includes(id)).map((id) => {
                    const y1 = group.ids.left.indexOf(id) * pitch + half;
                    const y2 = group.ids.right.indexOf(id) * pitch + half;
                    return (
                      <path
                        key={id}
                        d={`M220 ${y1} C 240 ${y1}, 256 ${y2}, 276 ${y2}`}
                        fill="none"
                        stroke="#14B79A"
                        strokeWidth={4}
                        strokeLinecap="round"
                        style={{ strokeDasharray: 900, animation: "drawIn .45s ease-out forwards" }}
                      />
                    );
                  })}
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: pitch - 56, width: 220 }}>
                  {group.ids.left.map((id) => {
                    const w = WORD_MAP[id];
                    const matched = s2.matched.includes(id);
                    const sel = s2.selectedLeft === id;
                    const shk = s2.shakePair?.left === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => clickLeft(id)}
                        style={{
                          height: 56,
                          fontWeight: 600,
                          fontSize: 16,
                          borderRadius: 16,
                          background: matched ? "#E4FFF7" : sel ? "#E1E3FD" : "#fff",
                          border: `2px solid ${matched ? "#14B79A" : sel ? "#5C5EE6" : "#E5E8EE"}`,
                          color: matched ? "#0A9380" : "#1A1D26",
                          transform: sel ? "scale(1.04)" : "scale(1)",
                          boxShadow: matched
                            ? "0 10px 20px -14px rgba(20,183,154,.9)"
                            : sel
                              ? "0 12px 22px -12px rgba(92,94,230,.8)"
                              : "0 6px 14px -12px rgba(0,0,0,.6)",
                          animation: shk ? "shake .5s ease" : matched ? "popIn .4s ease" : "none",
                          cursor: "pointer",
                        }}
                      >
                        {w.en}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: pitch - 56, width: 220 }}>
                  {group.ids.right.map((id) => {
                    const w = WORD_MAP[id];
                    const matched = s2.matched.includes(id);
                    const sel = s2.selectedRight === id;
                    const shk = s2.shakePair?.right === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => clickRight(id)}
                        style={{
                          height: 56,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontWeight: 600,
                          // 16 not 14: the board renders at 0.70 on a shallow
                          // stage, and 14px would land at 9.8px on screen.
                          fontSize: 16,
                          padding: "0 12px",
                          borderRadius: 16,
                          background: matched ? "#E4FFF7" : sel ? "#E1E3FD" : "#fff",
                          border: `2px solid ${matched ? "#14B79A" : sel ? "#5C5EE6" : "#E5E8EE"}`,
                          color: matched ? "#0A9380" : "#1A1D26",
                          transform: sel ? "scale(1.04)" : "scale(1)",
                          boxShadow: matched
                            ? "0 10px 20px -14px rgba(20,183,154,.9)"
                            : sel
                              ? "0 12px 22px -12px rgba(92,94,230,.8)"
                              : "0 6px 14px -12px rgba(0,0,0,.6)",
                          animation: shk ? "shake .5s ease" : matched ? "popIn .4s ease" : "none",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <FamilyFace {...charOf(id)} size={28} />
                        <span>{w.th}</span>
                      </button>
                    );
                  })}
                </div>
                </div>
                ))}
              </div>
              {s2.fxId && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: s2.left.indexOf(s2.fxId) * pitch + half,
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      border: "4px solid #FFD166",
                      animation: "ringBurst .7s ease-out forwards",
                      zIndex: 3,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: s2.left.indexOf(s2.fxId) * pitch + half,
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#0A9380",
                      animation: "sparkOut .8s ease-out forwards",
                      zIndex: 3,
                    }}
                  >
                    ✨ +1
                  </div>
                </>
              )}
            </div>
          </div>
          {s2Done && (
            <button
              type="button"
              onClick={() => goStage(10)}
              style={{
                marginTop: 32,
                fontWeight: 600,
                fontSize: 18,
                color: "#fff",
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                border: "none",
                borderRadius: 999,
                padding: "14px 36px",
                cursor: "pointer",
                boxShadow: "0 8px 20px -6px rgba(92,94,230,.5)",
              }}
            >
              เยี่ยม! ☰ กลับเมนู
            </button>
          )}
        </div>
      )}

      {/* STAGE 3: LISTENING QUIZ */}
      {stage === 3 && (
        <div className={`${styles.screen} kc-family-stage kc-family-listen`} style={{ position: "relative", maxWidth: 640, margin: "0 auto", padding: "8px 24px clamp(20px,6cqb,100px)", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 22,
              padding: "14px 24px",
              margin: "0 auto 26px",
              boxShadow: "0 12px 24px -16px rgba(0,0,0,.4)",
            }}
          >
            <div style={{ fontSize: 46, animation: "floatY 3s ease-in-out infinite .4s" }}>🦊</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: ".14em", color: "#5C5EE6", fontWeight: 600, marginBottom: 4 }}>
                ด่านที่ 3 · LISTENING QUIZ · {s3.qIndex + 1} / {s3.questions.length}
              </div>
              <div style={{ fontWeight: 600, fontSize: 20 }}>ฟังเสียงแล้วเลือกคำตอบที่ถูกต้อง 🎧</div>
            </div>
          </div>
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 28px" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                left: "50%",
                top: "50%",
                borderRadius: "50%",
                border: "3px solid #C6C9FB",
                animation: "ringBurst 2.2s ease-out infinite",
                pointerEvents: "none",
              }}
            />
            <button
              type="button"
              onClick={playCurrentQ}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                width: 96,
                height: 96,
                borderRadius: 999,
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                border: "none",
                color: "#fff",
                fontSize: 38,
                animation: "wiggleBtn 1.6s ease-in-out infinite",
                cursor: "pointer",
                boxShadow: "0 12px 26px -8px rgba(92,94,230,.6)",
              }}
            >
              🔊
            </button>
          </div>
          <div className="kc-family-options" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {s3.questions[s3.qIndex]?.options.map((id) => {
              const w = WORD_MAP[id];
              const q = s3.questions[s3.qIndex];
              let bg = "#fff",
                borderColor = "#E5E8EE",
                color = "#1A1D26",
                anim = "none",
                shadow = "0 8px 18px -14px rgba(0,0,0,.6)";
              if (s3.answeredId) {
                if (id === q.correctId) {
                  bg = "#E4FFF7";
                  borderColor = "#14B79A";
                  color = "#0A9380";
                  anim = "popIn .4s ease";
                  shadow = "0 12px 24px -12px rgba(20,183,154,.9)";
                } else if (id === s3.answeredId) {
                  bg = "#FFE3E3";
                  borderColor = "#EF476F";
                  color = "#C81E3A";
                  anim = "shake .5s ease";
                }
              }
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => answerQ(id)}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: 18,
                    borderRadius: 20,
                    background: bg,
                    border: `3px solid ${borderColor}`,
                    boxShadow: shadow,
                    animation: anim,
                    cursor: "pointer",
                  }}
                >
                  <FamilyFace {...charOf(id)} size={50} />
                  <span style={{ fontWeight: 600, fontSize: 16, color }}>{w.en}</span>
                </button>
              );
            })}
          </div>
          {s3.answeredId && (
            <button
              type="button"
              onClick={nextQ}
              style={{
                fontWeight: 600,
                fontSize: 17,
                color: "#fff",
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                border: "none",
                borderRadius: 999,
                padding: "13px 34px",
                cursor: "pointer",
                boxShadow: "0 8px 20px -6px rgba(92,94,230,.5)",
              }}
            >
              {s3.qIndex === s3.questions.length - 1 ? "ไปด่านต่อไป ➜" : "ข้อถัดไป ➜"}
            </button>
          )}
        </div>
      )}

      {/* STAGE 4: FILL IN THE BLANK */}
      {stage === 4 && (
        <div className={`${styles.screen} kc-family-stage kc-family-story`} style={{ position: "relative", maxWidth: 680, margin: "0 auto", padding: "8px 24px clamp(20px,6cqb,100px)", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 22,
              padding: "8px 16px",
              margin: "0 auto 10px",
              boxShadow: "0 12px 24px -16px rgba(0,0,0,.4)",
            }}
          >
            <div style={{ fontSize: "clamp(28px,7cqi,46px)", animation: "floatY 3s ease-in-out infinite .1s" }}>🐨</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: ".14em", color: "#5C5EE6", fontWeight: 600, marginBottom: 4 }}>
                ด่านที่ 4 · FILL IN THE BLANK
              </div>
              <div style={{ fontWeight: 600, fontSize: "clamp(14px,3.6cqi,20px)" }}>เลือกคำที่ใช่เติมในเรื่องราวครอบครัวของเรา 📖</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#5A6273", margin: "0 0 12px" }}>📔 My Family Story</p>
          <div className="kc-family-story-lines" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {storyBlanks.map((b, idx) => {
              const isCorrect = s4.correct[idx];
              const answered = s4.answers[idx];
              return (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    background: "#fff",
                    border: `2px solid ${isCorrect ? "#14B79A" : "#E5E8EE"}`,
                    borderRadius: 20,
                    padding: "12px 16px",
                    textAlign: "left",
                    overflow: "hidden",
                    boxShadow: "0 10px 22px -18px rgba(0,0,0,.6)",
                  }}
                >
                  <div style={{ fontSize: 15, marginBottom: 8, lineHeight: 1.4 }}>
                    {b.sentence} {isCorrect && <span style={{ fontSize: 18 }}>✅</span>}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {b.options.map((optId) => {
                      const w = WORD_MAP[optId];
                      let bg = "#fff",
                        borderColor = "#E5E8EE",
                        color = "#1A1D26",
                        anim = "none";
                      if (answered === optId) {
                        if (isCorrect) {
                          bg = "#E4FFF7";
                          borderColor = "#14B79A";
                          color = "#0A9380";
                          anim = "popIn .4s ease";
                        } else {
                          bg = "#FFE3E3";
                          borderColor = "#EF476F";
                          color = "#C81E3A";
                          anim = "shake .5s ease";
                        }
                      }
                      return (
                        <button
                          key={optId}
                          type="button"
                          onClick={() => selectBlank(idx, optId)}
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            padding: "9px 18px",
                            borderRadius: 999,
                            background: bg,
                            border: `2px solid ${borderColor}`,
                            color,
                            animation: anim,
                            cursor: "pointer",
                          }}
                        >
                          {w.en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {s4AllCorrect && (
            <button
              type="button"
              onClick={() => goStage(10)}
              style={{
                marginTop: 32,
                fontWeight: 600,
                fontSize: 18,
                color: "#fff",
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                border: "none",
                borderRadius: 999,
                padding: "14px 36px",
                cursor: "pointer",
                boxShadow: "0 8px 20px -6px rgba(92,94,230,.5)",
              }}
            >
              สุดยอด! ☰ กลับเมนู
            </button>
          )}
        </div>
      )}

      {/* STAGE 5: CELEBRATION */}
      {stage === 5 && (
        <div className={`${styles.screen} kc-family-stage kc-family-result`} style={{ position: "relative", minHeight: "72cqb", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {confetti.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute",
                top: -20,
                left: `${c.left}%`,
                width: 10,
                height: 14,
                background: c.color,
                borderRadius: 2,
                animation: `confettiFall ${c.dur}s linear ${c.delay}s infinite`,
              }}
            />
          ))}
          <div style={{ position: "relative", textAlign: "center", maxWidth: 560, padding: 24 }}>
            <div style={{ fontSize: 80, marginBottom: 8 }}>🏆</div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end", gap: 2, marginBottom: 18 }}>
              {introCast.map((id, i) => (
                <div
                  key={id}
                  style={{
                    animation: `floatY ${(2.8 + i * 0.2).toFixed(1)}s ease-in-out infinite`,
                    animationDelay: `${(i * 0.15).toFixed(2)}s`,
                  }}
                >
                  <FamilyFace {...charOf(id)} size={i === 2 || i === 3 ? 70 : 64} />
                </div>
              ))}
            </div>
            <h1 style={{ fontWeight: 700, fontSize: 38, margin: "0 0 12px" }}>เก่งมาก! Family Tree Master 🎉</h1>
            <p style={{ fontSize: 16, color: "#5A6273", margin: "0 0 24px" }}>น้องเรียนรู้คำศัพท์ครอบครัวครบทั้ง 4 ด่านแล้ว</p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                border: "1px solid #E5E8EE",
                borderRadius: 999,
                padding: "12px 26px",
                fontWeight: 700,
                fontSize: 24,
                color: "#C2500B",
                marginBottom: 28,
                boxShadow: "0 8px 20px -6px rgba(0,0,0,.1)",
                animation: "popStar 1.4s ease-in-out infinite",
              }}
            >
              ⭐ {stars} คะแนน
            </div>
            <div>
              <button
                type="button"
                onClick={restart}
                style={{
                  fontWeight: 600,
                  fontSize: 17,
                  color: "#fff",
                  background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                  border: "none",
                  borderRadius: 999,
                  padding: "14px 36px",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px -6px rgba(92,94,230,.5)",
                }}
              >
                เล่นอีกครั้ง 🔄
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
