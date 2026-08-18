"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, speakEnglish, hoverSfxDelegate } from "@/lib/kcSfx";
import GameBackdrop from "../GameBackdrop";
import { useStage } from "../../_stage/useStage";
import styles from "./VocabularyArcadeApp.module.css";

const LS_KEY = "kc-vocab-v1";

type WordEntry = [string, string, string]; // [en, emoji, th]

type Cat = {
  key: string;
  en: string;
  th: string;
  emoji: string;
  bg: string;
  bd: string;
  blob: string;
  words: WordEntry[];
};

const CATS: Cat[] = [
  {
    key: "animals",
    en: "Animals",
    th: "สัตว์",
    emoji: "🐘",
    bg: "#FFF3E0",
    bd: "#FFD9A8",
    blob: "#FFE0B8",
    words: [
      ["cat", "🐱", "แมว"],
      ["dog", "🐶", "สุนัข"],
      ["elephant", "🐘", "ช้าง"],
      ["monkey", "🐵", "ลิง"],
      ["rabbit", "🐰", "กระต่าย"],
      ["fish", "🐟", "ปลา"],
      ["bird", "🐦", "นก"],
      ["tiger", "🐯", "เสือ"],
      ["cow", "🐮", "วัว"],
      ["frog", "🐸", "กบ"],
      ["horse", "🐴", "ม้า"],
      ["pig", "🐷", "หมู"],
      ["duck", "🦆", "เป็ด"],
      ["bear", "🐻", "หมี"],
      ["lion", "🦁", "สิงโต"],
      ["snake", "🐍", "งู"],
      ["turtle", "🐢", "เต่า"],
      ["bee", "🐝", "ผึ้ง"],
      ["chicken", "🐔", "ไก่"],
      ["sheep", "🐑", "แกะ"],
    ],
  },
  {
    key: "food",
    en: "Food & Drink",
    th: "อาหารและเครื่องดื่ม",
    emoji: "🍎",
    bg: "#FFECEF",
    bd: "#FFC9D2",
    blob: "#FFD4DC",
    words: [
      ["apple", "🍎", "แอปเปิ้ล"],
      ["banana", "🍌", "กล้วย"],
      ["bread", "🍞", "ขนมปัง"],
      ["rice", "🍚", "ข้าว"],
      ["egg", "🥚", "ไข่"],
      ["milk", "🥛", "นม"],
      ["cake", "🍰", "เค้ก"],
      ["pizza", "🍕", "พิซซ่า"],
      ["orange", "🍊", "ส้ม"],
      ["chicken", "🍗", "ไก่"],
      ["fish", "🐟", "ปลา"],
      ["soup", "🍲", "ซุป"],
      ["noodle", "🍜", "ก๋วยเตี๋ยว"],
      ["water", "💧", "น้ำ"],
      ["juice", "🧃", "น้ำผลไม้"],
      ["grape", "🍇", "องุ่น"],
      ["mango", "🥭", "มะม่วง"],
      ["cheese", "🧀", "ชีส"],
      ["candy", "🍬", "ลูกอม"],
      ["ice cream", "🍦", "ไอศกรีม"],
    ],
  },
  {
    key: "school",
    en: "School",
    th: "ของใช้ในโรงเรียน",
    emoji: "🎒",
    bg: "#EEEFFE",
    bd: "#C6C9FB",
    blob: "#D6D8FD",
    words: [
      ["book", "📕", "หนังสือ"],
      ["pencil", "✏️", "ดินสอ"],
      ["ruler", "📏", "ไม้บรรทัด"],
      ["scissors", "✂️", "กรรไกร"],
      ["bag", "🎒", "กระเป๋า"],
      ["eraser", "🧽", "ยางลบ"],
      ["crayon", "🖍️", "สีเทียน"],
      ["clock", "🕐", "นาฬิกา"],
      ["chair", "🪑", "เก้าอี้"],
      ["notebook", "📒", "สมุด"],
      ["pen", "🖊️", "ปากกา"],
      ["desk", "🪑", "โต๊ะ"],
      ["board", "📋", "กระดาน"],
      ["glue", "🧴", "กาว"],
      ["paper", "📄", "กระดาษ"],
      ["map", "🗺️", "แผนที่"],
      ["triangle ruler", "📐", "ไม้ฉาก"],
      ["bell", "🔔", "กระดิ่ง"],
      ["computer", "💻", "คอมพิวเตอร์"],
      ["library", "📚", "ห้องสมุด"],
    ],
  },
  {
    key: "body",
    en: "Body Parts",
    th: "อวัยวะร่างกาย",
    emoji: "👋",
    bg: "#FFF0F6",
    bd: "#FBC7E0",
    blob: "#FBD5E8",
    words: [
      ["eye", "👁️", "ตา"],
      ["ear", "👂", "หู"],
      ["nose", "👃", "จมูก"],
      ["mouth", "👄", "ปาก"],
      ["hand", "✋", "มือ"],
      ["foot", "🦶", "เท้า"],
      ["tooth", "🦷", "ฟัน"],
      ["brain", "🧠", "สมอง"],
      ["heart", "❤️", "หัวใจ"],
      ["leg", "🦵", "ขา"],
      ["head", "🧑", "ศีรษะ"],
      ["hair", "💇", "ผม"],
      ["arm", "💪", "แขน"],
      ["finger", "👆", "นิ้ว"],
      ["knee", "🦵", "เข่า"],
      ["face", "😊", "ใบหน้า"],
      ["tongue", "👅", "ลิ้น"],
      ["bone", "🦴", "กระดูก"],
      ["lungs", "🫁", "ปอด"],
      ["skin", "🤚", "ผิวหนัง"],
    ],
  },
  {
    key: "colors",
    en: "Colors & Shapes",
    th: "สีและรูปทรง",
    emoji: "🌈",
    bg: "#F1F8E9",
    bd: "#CFE9A8",
    blob: "#DDF0BE",
    words: [
      ["red", "🟥", "สีแดง"],
      ["blue", "🟦", "สีน้ำเงิน"],
      ["green", "🟩", "สีเขียว"],
      ["yellow", "🟨", "สีเหลือง"],
      ["orange", "🟧", "สีส้ม"],
      ["purple", "🟪", "สีม่วง"],
      ["black", "⬛", "สีดำ"],
      ["white", "⬜", "สีขาว"],
      ["circle", "⭕", "วงกลม"],
      ["star", "⭐", "ดาว"],
      ["pink", "🩷", "สีชมพู"],
      ["brown", "🟫", "สีน้ำตาล"],
      ["grey", "🩶", "สีเทา"],
      ["gold", "🥇", "สีทอง"],
      ["square", "🟦", "สี่เหลี่ยม"],
      ["triangle", "🔺", "สามเหลี่ยม"],
      ["heart", "💗", "หัวใจ"],
      ["diamond", "💎", "ข้าวหลามตัด"],
      ["oval", "🥚", "วงรี"],
      ["rectangle", "▭", "สี่เหลี่ยมผืนผ้า"],
    ],
  },
  {
    key: "jobs",
    en: "Jobs",
    th: "อาชีพ",
    emoji: "👩‍⚕️",
    bg: "#E8F5FF",
    bd: "#B3DEFF",
    blob: "#C9E7FF",
    words: [
      ["doctor", "👩‍⚕️", "หมอ"],
      ["teacher", "👩‍🏫", "ครู"],
      ["farmer", "👨‍🌾", "ชาวนา"],
      ["police", "👮", "ตำรวจ"],
      ["chef", "👨‍🍳", "พ่อครัว"],
      ["pilot", "👨‍✈️", "นักบิน"],
      ["singer", "🧑‍🎤", "นักร้อง"],
      ["artist", "👨‍🎨", "ศิลปิน"],
      ["firefighter", "👨‍🚒", "นักดับเพลิง"],
      ["scientist", "👨‍🔬", "นักวิทยาศาสตร์"],
      ["nurse", "👩‍⚕️", "พยาบาล"],
      ["driver", "🚗", "คนขับรถ"],
      ["dentist", "🦷", "ทันตแพทย์"],
      ["soldier", "🪖", "ทหาร"],
      ["engineer", "👷", "วิศวกร"],
      ["fisherman", "🎣", "ชาวประมง"],
      ["baker", "🥖", "คนทำขนมปัง"],
      ["barber", "💈", "ช่างตัดผม"],
      ["waiter", "🧑‍🍳", "พนักงานเสิร์ฟ"],
      ["vet", "🐕", "สัตวแพทย์"],
    ],
  },
  {
    key: "weather",
    en: "Weather",
    th: "สภาพอากาศ",
    emoji: "☀️",
    bg: "#FFFBE6",
    bd: "#FFE9A3",
    blob: "#FFF0BC",
    words: [
      ["sun", "☀️", "พระอาทิตย์"],
      ["rain", "🌧️", "ฝน"],
      ["cloud", "☁️", "เมฆ"],
      ["snow", "❄️", "หิมะ"],
      ["wind", "🌬️", "ลม"],
      ["storm", "⛈️", "พายุ"],
      ["rainbow", "🌈", "รุ้ง"],
      ["hot", "🔥", "ร้อน"],
      ["cold", "🧊", "หนาว"],
      ["fog", "🌫️", "หมอก"],
      ["warm", "🌤️", "อบอุ่น"],
      ["sunny", "😎", "แดดจัด"],
      ["cloudy", "🌥️", "มีเมฆมาก"],
      ["thunder", "⚡", "ฟ้าร้อง"],
      ["ice", "🧊", "น้ำแข็ง"],
      ["flood", "🌊", "น้ำท่วม"],
      ["moon", "🌙", "พระจันทร์"],
      ["sky", "🌌", "ท้องฟ้า"],
      ["umbrella", "☂️", "ร่ม"],
      ["season", "🍂", "ฤดูกาล"],
    ],
  },
  {
    key: "sports",
    en: "Sports",
    th: "กีฬา",
    emoji: "⚽",
    bg: "#E6FBF6",
    bd: "#9EE9D6",
    blob: "#BFF2E6",
    words: [
      ["football", "⚽", "ฟุตบอล"],
      ["basketball", "🏀", "บาสเกตบอล"],
      ["tennis", "🎾", "เทนนิส"],
      ["swimming", "🏊", "ว่ายน้ำ"],
      ["running", "🏃", "วิ่ง"],
      ["badminton", "🏸", "แบดมินตัน"],
      ["boxing", "🥊", "มวย"],
      ["cycling", "🚴", "ปั่นจักรยาน"],
      ["volleyball", "🏐", "วอลเลย์บอล"],
      ["golf", "⛳", "กอล์ฟ"],
      ["baseball", "⚽", "เบสบอล"],
      ["skating", "⛸️", "สเก็ต"],
      ["surfing", "🏄", "โต้คลื่น"],
      ["climbing", "🧗", "ปีนเขา"],
      ["yoga", "🧘", "โยคะ"],
      ["dancing", "💃", "เต้นรำ"],
      ["karate", "🥋", "คาราเต้"],
      ["ping pong", "🏓", "ปิงปอง"],
      ["skiing", "⛷️", "สกี"],
      ["medal", "🏅", "เหรียญรางวัล"],
    ],
  },
  {
    key: "transport",
    en: "Transport",
    th: "ยานพาหนะ",
    emoji: "🚌",
    bg: "#EAF1FF",
    bd: "#B9CFF8",
    blob: "#CFE0FC",
    words: [
      ["car", "🚗", "รถยนต์"],
      ["bus", "🚌", "รถบัส"],
      ["bicycle", "🚲", "จักรยาน"],
      ["train", "🚆", "รถไฟ"],
      ["airplane", "✈️", "เครื่องบิน"],
      ["boat", "⛵", "เรือ"],
      ["taxi", "🚕", "แท็กซี่"],
      ["truck", "🚚", "รถบรรทุก"],
      ["motorbike", "🏍️", "มอเตอร์ไซค์"],
      ["rocket", "🚀", "จรวด"],
      ["ship", "🚢", "เรือใหญ่"],
      ["helicopter", "🚁", "เฮลิคอปเตอร์"],
      ["tractor", "🚜", "รถไถ"],
      ["scooter", "🛴", "สกู๊ตเตอร์"],
      ["ambulance", "🚑", "รถพยาบาล"],
      ["fire truck", "🚒", "รถดับเพลิง"],
      ["subway", "🚇", "รถไฟใต้ดิน"],
      ["tram", "🚋", "รถราง"],
      ["van", "🚐", "รถตู้"],
      ["balloon", "🎈", "บอลลูน"],
    ],
  },
  {
    key: "house",
    en: "House & Home",
    th: "บ้านและของใช้",
    emoji: "🏠",
    bg: "#F5F0FF",
    bd: "#D8C8FA",
    blob: "#E4D8FC",
    words: [
      ["house", "🏠", "บ้าน"],
      ["door", "🚪", "ประตู"],
      ["window", "🪟", "หน้าต่าง"],
      ["bed", "🛏️", "เตียง"],
      ["sofa", "🛋️", "โซฟา"],
      ["lamp", "💡", "โคมไฟ"],
      ["key", "🔑", "กุญแจ"],
      ["cup", "☕", "ถ้วย"],
      ["spoon", "🥄", "ช้อน"],
      ["bath", "🛁", "อ่างอาบน้ำ"],
      ["table", "🪑", "โต๊ะ"],
      ["fork", "🍴", "ส้อม"],
      ["plate", "🍽️", "จาน"],
      ["mirror", "🪞", "กระจก"],
      ["clock", "🕰️", "นาฬิกา"],
      ["fan", "🌀", "พัดลม"],
      ["toilet", "🚽", "ห้องน้ำ"],
      ["kitchen", "🍳", "ครัว"],
      ["garden", "🌷", "สวน"],
      ["stairs", "🪜", "บันได"],
    ],
  },
];

type ModeKey = "pic" | "word" | "spell" | "mix";
type QMode = "pic" | "word" | "spell";

const MODES: {
  key: ModeKey;
  emoji: string;
  label: string;
  desc: string;
  bg: string;
  bd: string;
  blob: string;
}[] = [
  {
    key: "pic",
    emoji: "🖼️",
    label: "Picture Match",
    desc: "เห็นรูป แล้วเลือกคำศัพท์ที่ถูก",
    bg: "#EEEFFE",
    bd: "#C6C9FB",
    blob: "#D6D8FD",
  },
  {
    key: "word",
    emoji: "🔤",
    label: "Word → Picture",
    desc: "เห็นคำศัพท์ แล้วเลือกรูปที่ตรง",
    bg: "#E6FBF6",
    bd: "#9EE9D6",
    blob: "#BFF2E6",
  },
  {
    key: "spell",
    emoji: "🧩",
    label: "Spelling Builder",
    desc: "เรียงตัวอักษรให้เป็นคำที่ถูกต้อง",
    bg: "#FFF3E0",
    bd: "#FFD9A8",
    blob: "#FFE0B8",
  },
  {
    key: "mix",
    emoji: "🎲",
    label: "Mixed Challenge",
    desc: "สลับทั้ง 3 โหมด ท้าทายสุด",
    bg: "#FFECEF",
    bd: "#FFC9D2",
    blob: "#FFD4DC",
  },
];

const CONF = ["#5C5EE6", "#14B79A", "#FFD166", "#FF8A3D", "#FF5470", "#7BD3F7"];

type DiffKey = "easy" | "hard";

type Question = {
  w: WordEntry;
  opts: WordEntry[];
  m: QMode;
};

type Tile = { ch: string; used: boolean };

type ConfettiPiece = {
  id: number;
  left: number;
  w: number;
  h: number;
  color: string;
  r: string;
  dur: string;
  delay: string;
};

type ResultRow = { w: WordEntry; ok: boolean };

function shuffle<T>(arr: T[]): T[] {
  const b = arr.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function buildQuestions(catI: number, mode: ModeKey, diff: DiffKey): Question[] {
  const cat = CATS[catI];
  const pool = cat.words;
  const n = diff === "easy" ? 3 : 4;
  return shuffle(pool).map((w, i) => {
    const others = shuffle(pool.filter((x) => x[0] !== w[0])).slice(0, n - 1);
    const m: QMode = mode === "mix" ? (["pic", "word", "spell"] as QMode[])[i % 3] : (mode as QMode);
    return { w, opts: shuffle(others.concat([w])), m };
  });
}

function makeTiles(word: string, diff: DiffKey): Tile[] {
  const letters = word.split("");
  const extra = diff === "easy" ? 0 : 2;
  const abc = "abcdefghijklmnopqrstuvwxyz".split("");
  const pad: string[] = [];
  for (let i = 0; i < extra; i++) pad.push(abc[Math.floor(Math.random() * 26)]);
  return shuffle(letters.concat(pad)).map((ch) => ({ ch, used: false }));
}

function loadPersisted(): { stars: number; best: Record<string, number> } {
  if (typeof window === "undefined") return { stars: 0, best: {} };
  try {
    const s = window.localStorage.getItem(LS_KEY);
    if (s) {
      const d = JSON.parse(s);
      return { stars: d.stars || 0, best: d.best || {} };
    }
  } catch {
    /* ignore */
  }
  return { stars: 0, best: {} };
}

function persist(stars: number, best: Record<string, number>) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify({ stars, best }));
  } catch {
    /* ignore */
  }
}

export default function VocabularyArcadeApp() {
  useTrackToolUse("media-english-vocabulary-arcade");
  const { isFull, stageProps, toggle: toggleFull } = useStage<HTMLDivElement>();

  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [catI, setCatI] = useState(0);
  const [mode, setMode] = useState<ModeKey>("pic");
  const [diff, setDiff] = useState<DiffKey>("easy");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [combo, setCombo] = useState(0);
  const [stars, setStars] = useState(() => loadPersisted().stars);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [best, setBest] = useState<Record<string, number>>(() => loadPersisted().best);
  const [muted, setMuted] = useState(() => KcSfx.isMuted());
  const [bgm, setBgm] = useState(() => KcSfx.isBgm());
  const [hydrated] = useState(() => typeof window !== "undefined");

  const questionsRef = useRef<Question[]>([]);
  const qiRef = useRef(0);
  const lockedRef = useRef(false);
  const comboRef = useRef(0);
  const starsRef = useRef(0);
  const resultsRef = useRef<ResultRow[]>([]);
  const catIRef = useRef(0);
  const bestRef = useRef<Record<string, number>>({});
  const modeRef = useRef<ModeKey>("pic");
  const diffRef = useRef<DiffKey>("easy");
  const slotsRef = useRef<string[]>([]);
  const tilesRef = useRef<Tile[]>([]);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    qiRef.current = qi;
  }, [qi]);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  useEffect(() => {
    starsRef.current = stars;
  }, [stars]);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  useEffect(() => {
    catIRef.current = catI;
  }, [catI]);
  useEffect(() => {
    bestRef.current = best;
  }, [best]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    diffRef.current = diff;
  }, [diff]);
  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      if (!mountedRef.current) return;
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const timeouts = timeoutsRef.current;
    return () => {
      mountedRef.current = false;
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
    };
  }, []);

  const burst = useCallback(() => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 26; i++) {
      pieces.push({
        id: Math.random(),
        left: Math.round(Math.random() * 100),
        w: 6 + Math.round(Math.random() * 8),
        h: 9 + Math.round(Math.random() * 12),
        color: CONF[i % CONF.length],
        r: Math.random() > 0.5 ? "50%" : "3px",
        dur: (1.6 + Math.random() * 1.2).toFixed(2),
        delay: (Math.random() * 0.4).toFixed(2),
      });
    }
    setConfetti(pieces);
    trackedTimeout(() => setConfetti([]), 2600);
  }, [trackedTimeout]);

  const loadQ = useCallback(
    (qs: Question[], idx: number, d: DiffKey) => {
      const q = qs[idx];
      if (!q) return;
      if (q.m === "spell") {
        setSlots(q.w[0].split("").map(() => ""));
        setTiles(makeTiles(q.w[0], d));
      } else {
        setSlots([]);
        setTiles([]);
      }
      trackedTimeout(() => speakEnglish(q.w[0]), 260);
    },
    [trackedTimeout],
  );

  const startGame = useCallback(
    (m: ModeKey) => {
      const qs = buildQuestions(catIRef.current, m, diffRef.current);
      setMode(m);
      setQuestions(qs);
      setQi(0);
      setPicked(null);
      setLocked(false);
      setCombo(0);
      setResults([]);
      setConfetti([]);
      setStage(3);
      loadQ(qs, 0, diffRef.current);
    },
    [loadQ],
  );

  const next = useCallback(() => {
    const qs = questionsRef.current;
    const nextQi = qiRef.current + 1;
    if (nextQi >= qs.length) {
      const correct = resultsRef.current.filter((r) => r.ok).length;
      const key = CATS[catIRef.current].key;
      const b = { ...bestRef.current };
      if (!b[key] || correct > b[key]) b[key] = correct;
      persist(starsRef.current, b);
      setBest(b);
      setLocked(false);
      setPicked(null);
      setStage(4);
      const good = correct >= qs.length * 0.7;
      trackedTimeout(() => KcSfx.play(good ? "win" : "lose"), 260);
      if (good) trackedTimeout(() => burst(), 200);
      return;
    }
    setQi(nextQi);
    setPicked(null);
    setLocked(false);
    loadQ(qs, nextQi, diffRef.current);
  }, [loadQ, trackedTimeout, burst]);

  const answer = useCallback(
    (ok: boolean, pickedKey: string | null) => {
      if (lockedRef.current) return;
      const q = questionsRef.current[qiRef.current];
      if (!q) return;
      const nextCombo = ok ? comboRef.current + 1 : 0;
      const nextStars = starsRef.current + (ok ? (nextCombo >= 3 ? 2 : 1) : 0);
      persist(nextStars, bestRef.current);
      if (ok) {
        burst();
        KcSfx.play(nextCombo >= 3 ? "combo" : "correct");
      } else {
        KcSfx.play("wrong");
      }
      setLocked(true);
      setPicked(pickedKey);
      setCombo(nextCombo);
      setStars(nextStars);
      setResults((r) => [...r, { w: q.w, ok }]);
      trackedTimeout(() => next(), ok ? 1150 : 1500);
    },
    [burst, trackedTimeout, next],
  );

  const tapTile = useCallback(
    (i: number) => {
      if (lockedRef.current) return;
      const q = questionsRef.current[qiRef.current];
      if (!q) return;
      const word = q.w[0];
      const slotsArr = slotsRef.current.slice();
      const tilesArr = tilesRef.current.slice();
      const pos = slotsArr.indexOf("");
      if (pos < 0) return;
      slotsArr[pos] = tilesArr[i].ch;
      tilesArr[i] = { ...tilesArr[i], used: true };
      KcSfx.play("drop");
      setSlots(slotsArr);
      setTiles(tilesArr);
      if (slotsArr.indexOf("") < 0) {
        trackedTimeout(() => answer(slotsArr.join("") === word, null), 240);
      }
    },
    [trackedTimeout, answer],
  );

  const undo = useCallback(() => {
    if (lockedRef.current) return;
    const slotsArr = slotsRef.current.slice();
    const tilesArr = tilesRef.current.slice();
    let last = -1;
    for (let i = 0; i < slotsArr.length; i++) if (slotsArr[i]) last = i;
    if (last < 0) return;
    const ch = slotsArr[last];
    slotsArr[last] = "";
    for (let i = tilesArr.length - 1; i >= 0; i--) {
      if (tilesArr[i].used && tilesArr[i].ch === ch) {
        tilesArr[i] = { ...tilesArr[i], used: false };
        break;
      }
    }
    KcSfx.play("tick");
    setSlots(slotsArr);
    setTiles(tilesArr);
  }, []);

  const hint = useCallback(() => {
    if (lockedRef.current) return;
    const q = questionsRef.current[qiRef.current];
    if (!q) return;
    const word = q.w[0];
    const slotsArr = slotsRef.current.slice();
    const tilesArr = tilesRef.current.slice();
    const pos = slotsArr.indexOf("");
    if (pos < 0) return;
    const need = word[pos];
    const ti = tilesArr.findIndex((t) => !t.used && t.ch === need);
    if (ti < 0) return;
    slotsArr[pos] = need;
    tilesArr[ti] = { ...tilesArr[ti], used: true };
    KcSfx.play("star");
    setSlots(slotsArr);
    setTiles(tilesArr);
    if (slotsArr.indexOf("") < 0) {
      trackedTimeout(() => answer(slotsArr.join("") === word, null), 240);
    }
  }, [trackedTimeout, answer]);

  const goCats = useCallback(() => {
    KcSfx.play("whoosh");
    setStage(1);
  }, []);

  const goModes = useCallback(() => {
    KcSfx.play("whoosh");
    setStage(2);
  }, []);

  const toggleBgm = useCallback(() => {
    KcSfx.unlock();
    const on = !KcSfx.isBgm();
    KcSfx.bgm(on);
    setBgm(on);
  }, []);

  const toggleMute = useCallback(() => {
    KcSfx.unlock();
    const m = KcSfx.toggleMuted();
    setMuted(m);
    KcSfx.play("click");
  }, []);

  const replay = useCallback(() => {
    startGame(mode);
  }, [startGame, mode]);

  const busy = stage === 3;
  const cat = CATS[catI];
  const q = busy ? questions[qi] : undefined;
  const qMode: QMode | undefined = q ? q.m : undefined;
  const bgmLive = bgm && !muted;
  const total = questions.length;
  const progressPct = total ? Math.round((qi / total) * 100) : 0;
  const last = results[results.length - 1];

  const introEmojis = ["🐘", "🍎", "🎒", "🌈", "⚽", "☀️"];

  return (
    <div {...stageProps} className="kc-stage">
    <div
      className={`kc-stage-body ${styles.body} kc-game kc-vocab-game kc-stage-${stage}`}
      onMouseOver={hoverSfxDelegate}
      style={{
        // position, overflow and height belong to .kc-stage-body.
        borderRadius: 24,
        background: "linear-gradient(170deg,#EAF1FF 0%,#EFF0FE 45%,#E6FBF6 100%)",
      }}
    >
      <GameBackdrop
        sun={{ top: 30, right: "6%", size: 130, from: "#FFE59A", via: "#FFD166" }}
        blobs={[
          { top: -90, left: -110, size: 360, color: "#C6C9FB" },
          { top: 260, right: -140, size: 420, color: "#B6F3E4" },
          { bottom: -120, left: "24%", size: 340, color: "#FFE0C2" },
        ]}
        clouds={[{ top: 90, dur: 52 }]}
      />
      {/* confetti */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 60, overflow: "hidden" }}>
        {confetti.map((c) => (
          <div
            key={c.id}
            style={{
              position: "absolute",
              top: -30,
              left: `${c.left}%`,
              width: c.w,
              height: c.h,
              background: c.color,
              borderRadius: c.r,
              animation: `confettiFall ${c.dur}s linear ${c.delay}s forwards`,
            }}
          />
        ))}
      </div>

      {/* top bar */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          padding: "14px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/khuncool-logo.webp"
            alt="KhunCool"
            style={{ width: 38, height: 38, flex: "none", objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(92,94,230,.5))" }}
          />
          <div className="kc-title" style={{ fontWeight: 600, fontSize: 18 }}>Vocabulary Arcade</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
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
          {stage >= 2 && (
            <button
              type="button"
              onClick={goCats}
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
              ☰ เปลี่ยนหมวด
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
              background: bgmLive ? "#EEEFFE" : "#fff",
              color: bgmLive ? "#3F41C9" : "#8A93A3",
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
                    background: bgmLive ? "#5C5EE6" : "#C9CFDA",
                    transformOrigin: "bottom",
                    animation: bgmLive
                      ? `eqBar ${(0.5 + i * 0.16).toFixed(2)}s ease-in-out infinite ${(i * 0.12).toFixed(2)}s`
                      : "none",
                  }}
                />
              ))}
            </span>
            <span>{bgmLive ? "เพลง" : "ปิดเพลง"}</span>
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
              background: isFull ? "#EEEFFE" : "#fff",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            ⛶
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
        </div>
      </div>

      {/* stage 0: intro */}
      {stage === 0 && (
        <div className={`${styles.screen} kc-vocab-intro`} style={{ position: "relative", maxWidth: 760, margin: "10px auto 0", padding: "0 22px clamp(20px,6cqb,90px)", textAlign: "center" }}>
          <div className="kc-vocab-intro-emojis" style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {introEmojis.map((ch, i) => (
              <div
                key={ch + i}
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 22,
                  background: "#fff",
                  border: "2px solid #E5E8EE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 38,
                  animation: `floatY ${(2.6 + i * 0.25).toFixed(1)}s ease-in-out infinite ${(i * 0.18).toFixed(2)}s`,
                  boxShadow: "0 12px 22px -14px rgba(0,0,0,.5)",
                }}
              >
                {ch}
              </div>
            ))}
          </div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(30px,5.4cqi,48px)", margin: "0 0 14px" }}>
            คลังคำศัพท์
            <span
              style={{
                background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              Vocabulary Arcade
            </span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#5A6273", margin: "0 0 30px" }}>
            10 หมวดคำศัพท์ · 4 โหมดเล่น · ฟังเสียงอ่านได้ทุกคำ
            <br />
            เลือกหมวด แล้วเล่นพร้อมกันทั้งห้องได้เลย
          </p>
          <button
            type="button"
            onClick={goCats}
            style={{
              fontWeight: 600,
              fontSize: 19,
              color: "#fff",
              background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
              border: "none",
              borderRadius: 999,
              padding: "16px 44px",
              cursor: "pointer",
              animation: "pulseGlow 2.4s ease-in-out infinite",
            }}
          >
            เลือกหมวดคำศัพท์ 🚀
          </button>
        </div>
      )}

      {/* stage 1: category picker */}
      {stage === 1 && (
        <div className={`${styles.screen} kc-vocab-categories`} style={{ position: "relative", maxWidth: 1000, margin: "0 auto", padding: "6px 20px clamp(20px,6cqb,100px)", textAlign: "center" }}>
          <h2 style={{ fontWeight: 600, fontSize: "clamp(20px,3.4cqi,28px)", margin: "0 0 4px" }}>เลือกหมวดคำศัพท์ที่จะเล่น 📚</h2>
          <p style={{ fontSize: 13, color: "#5A6273", margin: "0 0 12px" }}>หมวดละ 20 คำ · แตะการ์ดเพื่อเริ่ม</p>
          <div className="kc-vocab-category-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(30%,150px),1fr))", gap: "clamp(8px,2cqi,14px)" }}>
            {hydrated &&
              CATS.map((c, i) => {
                const bestScore = best[c.key] || 0;
                const done = bestScore >= 10;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      KcSfx.play("pop");
                      setCatI(i);
                      setStage(2);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      background: c.bg,
                      border: `2px solid ${c.bd}`,
                      borderRadius: "clamp(14px,4cqi,24px)",
                      padding: "clamp(10px,3cqi,22px) clamp(6px,2cqi,12px)",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      animation: `slideUp .45s ease ${(i * 0.05).toFixed(2)}s both`,
                      boxShadow: "0 12px 24px -18px rgba(0,0,0,.6)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -44,
                        right: -32,
                        width: 118,
                        height: 118,
                        borderRadius: "50%",
                        background: c.blob,
                        opacity: 0.55,
                      }}
                    />
                    {done && <span style={{ position: "absolute", top: 6, right: 8, fontSize: "clamp(13px,3cqi,17px)" }}>✅</span>}
                    <div style={{ fontSize: "clamp(26px,7cqi,44px)", position: "relative", animation: `floatY 3.2s ease-in-out infinite ${(i * 0.05).toFixed(2)}s` }}>
                      {c.emoji}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "clamp(12px,3cqi,16px)", position: "relative" }}>{c.en}</div>
                    <div style={{ fontSize: "max(11px,2.4cqi)", color: "#6C7484", position: "relative" }}>{c.th}</div>
                    {bestScore > 0 && (
                      <div
                        style={{
                          fontSize: "max(11px,2.2cqi)",
                          fontWeight: 600,
                          color: "#0A9380",
                          background: "#D0FBEF",
                          borderRadius: 20,
                          padding: "2px 7px",
                          position: "relative",
                        }}
                      >
                        สถิติ {bestScore}/10
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* stage 2: mode + difficulty picker */}
      {stage === 2 && (
        <div className={`${styles.screen} kc-vocab-modes`} style={{ position: "relative", maxWidth: 880, margin: "0 auto", padding: "6px 20px clamp(20px,6cqb,100px)", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 22,
              padding: "12px 22px",
              marginBottom: 22,
              boxShadow: "0 12px 24px -18px rgba(0,0,0,.4)",
              animation: "bounceIn .4s ease",
            }}
          >
            <div style={{ fontSize: 40, animation: "floatY 3s ease-in-out infinite" }}>{cat.emoji}</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, letterSpacing: ".14em", color: "#5C5EE6", fontWeight: 600 }}>หมวดที่เลือก</div>
              <div style={{ fontWeight: 600, fontSize: 19 }}>
                {cat.en} · {cat.th}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            {(["easy", "hard"] as DiffKey[]).map((d) => {
              const active = diff === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    KcSfx.play("click");
                    setDiff(d);
                  }}
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    borderRadius: 999,
                    padding: "9px 20px",
                    border: `2px solid ${active ? "#1A1D26" : "#E5E8EE"}`,
                    background: active ? "#1A1D26" : "#fff",
                    color: active ? "#fff" : "#5A6273",
                    cursor: "pointer",
                  }}
                >
                  {d === "easy" ? "😊 ง่าย (3 ตัวเลือก)" : "🔥 ยาก (4 ตัวเลือก + ตัวลวง)"}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(45%,210px),1fr))", gap: "clamp(10px,3cqi,16px)" }}>
            {MODES.map((m, i) => (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  KcSfx.play("whoosh");
                  startGame(m.key);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 9,
                  background: m.bg,
                  border: `2px solid ${m.bd}`,
                  borderRadius: "clamp(16px,4cqi,24px)",
                  padding: "clamp(14px,4cqi,26px) clamp(8px,3cqi,16px)",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  animation: `slideUp .4s ease ${(i * 0.06).toFixed(2)}s both`,
                  boxShadow: "0 12px 24px -18px rgba(0,0,0,.6)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -28,
                    width: 112,
                    height: 112,
                    borderRadius: "50%",
                    background: m.blob,
                    opacity: 0.5,
                  }}
                />
                <div style={{ fontSize: "clamp(30px,7cqi,42px)", position: "relative", animation: `floatY 3s ease-in-out infinite ${(i * 0.06).toFixed(2)}s` }}>
                  {m.emoji}
                </div>
                <div style={{ fontWeight: 600, fontSize: "clamp(14px,3.6cqi,17px)", position: "relative" }}>{m.label}</div>
                <div style={{ fontSize: "clamp(11px,2.8cqi,12.5px)", color: "#6C7484", lineHeight: 1.4, position: "relative" }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* stage 3: play */}
      {stage === 3 && q && qMode && (
        <div className={`${styles.screen} kc-vocab-play`} style={{ position: "relative", maxWidth: 940, margin: "0 auto", padding: "4px 16px clamp(20px,6cqb,110px)" }}>
          <div className="kc-vocab-progress" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: 180,
                height: 14,
                borderRadius: 999,
                background: "#fff",
                border: "1px solid #E5E8EE",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#5C5EE6,#14B79A)",
                }}
              />
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#5A6273" }}>
              ข้อ {qi + 1} / {total}
            </div>
            {combo >= 2 && (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#fff",
                  background: "linear-gradient(135deg,#FF8A3D,#FF5470)",
                  borderRadius: 999,
                  padding: "6px 14px",
                }}
              >
                🔥 คอมโบ ×{combo}
              </div>
            )}
          </div>

          <div
            className="kc-vocab-card"
            style={{
              position: "relative",
              background: "#fff",
              border: "1px solid #E5E8EE",
              borderRadius: 30,
              padding: "clamp(18px,3cqi,34px) clamp(14px,3cqi,30px)",
              overflow: "hidden",
              animation:
                locked && last && !last.ok ? "shake .45s ease" : "bounceIn .35s ease",
              boxShadow: "0 26px 50px -34px rgba(26,29,38,.6)",
            }}
          >
            <div style={{ position: "relative", textAlign: "center" }}>
              <div className="kc-vocab-kicker" style={{ fontSize: 11, letterSpacing: ".16em", color: "#5C5EE6", fontWeight: 600, marginBottom: 12 }}>
                {(MODES.find((m) => m.key === qMode) || {}).label} · {cat.en}
              </div>

              {(qMode === "pic" || qMode === "spell") && (
                <div
                  className="kc-vocab-visual"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "clamp(120px,22cqi,168px)",
                    height: "clamp(120px,22cqi,168px)",
                    borderRadius: 40,
                    background: cat.bg,
                    border: `3px solid ${cat.bd}`,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(62px,12cqi,92px)",
                      lineHeight: 1,
                      animation: "floatY 3.4s ease-in-out infinite",
                    }}
                  >
                    {q.w[1]}
                  </span>
                </div>
              )}

              {qMode === "word" && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 14,
                    background: cat.bg,
                    border: `3px solid ${cat.bd}`,
                    borderRadius: 26,
                    padding: "16px 26px",
                    marginBottom: 18,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "clamp(34px,7cqi,54px)" }}>{q.w[0]}</span>
                  <button
                    type="button"
                    onClick={() => speakEnglish(q.w[0])}
                    style={{
                      width: 52,
                      height: 52,
                      flex: "none",
                      borderRadius: "50%",
                      border: "none",
                      background: "#fff",
                      fontSize: 22,
                      cursor: "pointer",
                    }}
                  >
                    🔊
                  </button>
                </div>
              )}

              {qMode === "pic" && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    className="kc-vocab-listen"
                    type="button"
                    onClick={() => speakEnglish(q.w[0])}
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#0A7F70",
                      background: "#D0FBEF",
                      border: "none",
                      borderRadius: 999,
                      padding: "9px 20px",
                      cursor: "pointer",
                    }}
                  >
                    🔊 ฟังเสียงอ่าน
                  </button>
                </div>
              )}

              {qMode === "spell" && (
                <>
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                    {slots.map((ch, i) => {
                      const word = q.w[0];
                      const bd = ch ? (locked ? (slots.join("") === word ? "#14B79A" : "#FF5470") : "#5C5EE6") : "#C9CFDA";
                      const bg = ch ? (locked ? (slots.join("") === word ? "#D0FBEF" : "#FFE4E9") : "#EEEFFE") : "#F8F9FB";
                      const fg = ch ? "#1A1D26" : "#C9CFDA";
                      return (
                        <div
                          key={i}
                          style={{
                            width: "clamp(38px,7cqi,54px)",
                            height: "clamp(48px,8.4cqi,64px)",
                            borderRadius: 14,
                            border: `2.5px dashed ${bd}`,
                            background: bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "clamp(22px,4cqi,30px)",
                            color: fg,
                          }}
                        >
                          {ch}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 9, maxWidth: 620, margin: "0 auto" }}>
                    {tiles.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (!t.used) tapTile(i);
                        }}
                        style={{
                          width: "clamp(46px,8cqi,58px)",
                          height: "clamp(46px,8cqi,58px)",
                          borderRadius: 16,
                          border: `2px solid ${t.used ? "#EDEFF3" : "#C6C9FB"}`,
                          background: t.used ? "#F1F3F7" : "#fff",
                          color: t.used ? "#C9CFDA" : "#3F41C9",
                          fontWeight: 700,
                          fontSize: "clamp(20px,3.6cqi,26px)",
                          cursor: t.used ? "default" : "pointer",
                          opacity: t.used ? 0.45 : 1,
                          animation: `tilePop .3s ease ${(i * 0.04).toFixed(2)}s both`,
                          boxShadow: "0 8px 16px -12px rgba(0,0,0,.7)",
                        }}
                      >
                        {t.ch}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={undo}
                      style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "#5A6273",
                        background: "#F1F3F7",
                        border: "none",
                        borderRadius: 999,
                        padding: "9px 18px",
                        cursor: "pointer",
                      }}
                    >
                      ↩︎ ลบตัวล่าสุด
                    </button>
                    <button
                      type="button"
                      onClick={hint}
                      style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "#C2500B",
                        background: "#FFEFD9",
                        border: "none",
                        borderRadius: 999,
                        padding: "9px 18px",
                        cursor: "pointer",
                      }}
                    >
                      💡 ใบ้ 1 ตัว
                    </button>
                  </div>
                </>
              )}

              {(qMode === "pic" || qMode === "word") && (
                <div
                  className="kc-vocab-options"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      qMode === "word" ? "repeat(auto-fit,minmax(130px,1fr))" : "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 12,
                    maxWidth: 700,
                    margin: "6px auto 0",
                  }}
                >
                  {q.opts.map((o) => {
                    const isRight = o[0] === q.w[0];
                    const isPicked = picked === o[0];
                    let bg = "#fff";
                    let bd = "#E5E8EE";
                    let fg = "#1A1D26";
                    let mark = "";
                    if (locked) {
                      if (isRight) {
                        bg = "#D0FBEF";
                        bd = "#14B79A";
                        fg = "#0A7F70";
                        mark = "✅";
                      } else if (isPicked) {
                        bg = "#FFE4E9";
                        bd = "#FF5470";
                        fg = "#C21A3E";
                        mark = "❌";
                      }
                    }
                    return (
                      <button
                        key={o[0]}
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          if (locked) return;
                          KcSfx.play("click");
                          speakEnglish(o[0]);
                          answer(isRight, o[0]);
                        }}
                        style={{
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          minHeight: qMode === "word" ? 128 : 82,
                          borderRadius: 22,
                          border: `3px solid ${bd}`,
                          background: bg,
                          color: fg,
                          cursor: locked ? "default" : "pointer",
                          padding: "14px 12px",
                          animation: "popIn .35s ease",
                          boxShadow: "0 12px 24px -20px rgba(0,0,0,.8)",
                        }}
                      >
                        {qMode === "word" && (
                          <span style={{ fontSize: "clamp(44px,8cqi,62px)", lineHeight: 1 }}>{o[1]}</span>
                        )}
                        <span style={{ fontWeight: 600, fontSize: "clamp(17px,2.6cqi,22px)" }}>
                          {qMode === "word" ? "" : o[0]}
                        </span>
                        <span style={{ fontSize: 12, color: "#7C8494" }}>{locked && isRight ? o[2] : ""}</span>
                        {mark && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 19 }}>{mark}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {locked && last && (
                <div
                  style={{
                    marginTop: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: last.ok ? "#D0FBEF" : "#FFEFD9",
                    border: `2px solid ${last.ok ? "#9EE9D6" : "#FFD9A8"}`,
                    borderRadius: 999,
                    padding: "10px 22px",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{last.ok ? (combo >= 3 ? "🔥" : "🎉") : "💪"}</span>
                  <span style={{ fontWeight: 600, fontSize: 16, color: last.ok ? "#0A7F70" : "#C2500B" }}>
                    {last.ok
                      ? combo >= 3
                        ? "คอมโบสุดยอด! +2 ⭐"
                        : `ถูกต้อง! ${q.w[0]} = ${q.w[2]}`
                      : `คำตอบคือ ${q.w[0]} (${q.w[2]})`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* stage 4: result */}
      {stage === 4 &&
        (() => {
          const rTotal = results.length || 10;
          const correct = results.filter((r) => r.ok).length;
          const pct = correct / rTotal;
          const earned = results.reduce((a, r) => a + (r.ok ? 1 : 0), 0);
          const resultEmoji = pct === 1 ? "🏆" : pct >= 0.7 ? "🎉" : pct >= 0.4 ? "💪" : "🌱";
          const resultTitle =
            pct === 1 ? "เพอร์เฟกต์! เก่งมาก" : pct >= 0.7 ? "เยี่ยมมาก!" : pct >= 0.4 ? "ทำได้ดี ลองอีกครั้ง" : "ไม่เป็นไร ลองใหม่นะ";
          const bigStars = [0, 1, 2].map((i) => ({
            op: (pct >= 0.4 && i === 0) || (pct >= 0.7 && i === 1) || (pct >= 0.95 && i === 2) ? 1 : 0.22,
          }));
          return (
            <div className={`${styles.screen} kc-vocab-result`} style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "6px 20px clamp(20px,6cqb,110px)", textAlign: "center" }}>
              <div style={{ fontSize: 74 }}>{resultEmoji}</div>
              <h2 style={{ fontWeight: 700, fontSize: "clamp(26px,4.6cqi,36px)", margin: "6px 0 6px" }}>{resultTitle}</h2>
              <p style={{ fontSize: 16, color: "#5A6273", margin: "0 0 18px" }}>
                ตอบถูก {correct} จาก {rTotal} ข้อ · ได้ ⭐ {earned} ดวง
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 26 }}>
                {bigStars.map((s, i) => (
                  <span key={i} style={{ fontSize: 40, opacity: s.op }}>
                    ⭐
                  </span>
                ))}
              </div>

              <div
                className="kc-vocab-result-list"
                style={{
                  background: "#fff",
                  border: "1px solid #E5E8EE",
                  borderRadius: 26,
                  padding: "8px 10px",
                  textAlign: "left",
                  marginBottom: 26,
                  boxShadow: "0 24px 46px -34px rgba(26,29,38,.6)",
                }}
              >
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 12px",
                      borderBottom: i === results.length - 1 ? "none" : "1px solid #F1F3F7",
                    }}
                  >
                    <span style={{ fontSize: 26, width: 34, textAlign: "center" }}>{r.w[1]}</span>
                    <span style={{ fontWeight: 600, fontSize: 16, flex: 1 }}>{r.w[0]}</span>
                    <span style={{ fontSize: 13, color: "#7C8494" }}>{r.w[2]}</span>
                    <button
                      type="button"
                      onClick={() => speakEnglish(r.w[0])}
                      style={{
                        width: 34,
                        height: 34,
                        flex: "none",
                        borderRadius: "50%",
                        border: "1px solid #E5E8EE",
                        background: "#fff",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      🔊
                    </button>
                    <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{r.ok ? "✅" : "❌"}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={replay}
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    color: "#fff",
                    background: "linear-gradient(135deg,#5C5EE6,#14B79A)",
                    border: "none",
                    borderRadius: 999,
                    padding: "14px 34px",
                    cursor: "pointer",
                  }}
                >
                  เล่นอีกครั้ง 🔁
                </button>
                <button
                  type="button"
                  onClick={goModes}
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    color: "#5C5EE6",
                    background: "#E1E3FD",
                    border: "none",
                    borderRadius: 999,
                    padding: "14px 30px",
                    cursor: "pointer",
                  }}
                >
                  เปลี่ยนโหมด 🎮
                </button>
                <button
                  type="button"
                  onClick={goCats}
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    color: "#0A7F70",
                    background: "#D0FBEF",
                    border: "none",
                    borderRadius: 999,
                    padding: "14px 30px",
                    cursor: "pointer",
                  }}
                >
                  หมวดอื่น 📚
                </button>
              </div>
            </div>
          );
        })()}
    </div>
    </div>
  );
}
