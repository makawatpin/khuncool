// Word sets for Santa's Sleigh. Every word is something a child could ask Santa
// for, so the whole game can speak one sentence: "I want a ___."

export type SleighWord = {
  id: string;
  en: string;
  th: string;
  emoji: string;
  /** Article that goes before the word: "a", "some", or "" for plurals. */
  det: "a" | "some" | "";
};

export type SetId = "toys" | "christmas" | "winter";

export type SleighSet = {
  id: SetId;
  title: string;
  titleEn: string;
  icon: string;
  grade: string;
  words: SleighWord[];
};

const w = (id: string, en: string, th: string, emoji: string, det: SleighWord["det"] = "a"): SleighWord => ({
  id,
  en,
  th,
  emoji,
  det,
});

export const SETS: SleighSet[] = [
  {
    id: "toys",
    title: "ของเล่น",
    titleEn: "Toys",
    icon: "🧸",
    grade: "ป.1–ป.3",
    words: [
      w("teddy", "teddy bear", "ตุ๊กตาหมี", "🧸"),
      w("ball", "ball", "ลูกบอล", "⚽"),
      w("robot", "robot", "หุ่นยนต์", "🤖"),
      w("car", "car", "รถยนต์", "🚗"),
      w("train", "train", "รถไฟ", "🚂"),
      w("kite", "kite", "ว่าว", "🪁"),
      w("drum", "drum", "กลอง", "🥁"),
      w("guitar", "guitar", "กีตาร์", "🎸"),
      w("bike", "bike", "จักรยาน", "🚲"),
      w("puzzle", "puzzle", "จิ๊กซอว์", "🧩"),
      w("book", "book", "หนังสือ", "📚"),
    ],
  },
  {
    id: "christmas",
    title: "คริสต์มาส",
    titleEn: "Christmas",
    icon: "🎄",
    grade: "ป.2–ป.4",
    words: [
      w("tree", "Christmas tree", "ต้นคริสต์มาส", "🎄"),
      w("star", "star", "ดาว", "⭐"),
      w("bell", "bell", "กระดิ่ง", "🔔"),
      w("candle", "candle", "เทียน", "🕯️"),
      w("sock", "sock", "ถุงเท้า", "🧦"),
      w("reindeer", "reindeer", "กวางเรนเดียร์", "🦌"),
      w("snowman", "snowman", "มนุษย์หิมะ", "⛄"),
      w("gift", "present", "ของขวัญ", "🎁"),
      w("snowflake", "snowflake", "เกล็ดหิมะ", "❄️"),
      w("angel", "angel", "นางฟ้า", "👼"),
    ],
  },
  {
    id: "winter",
    title: "ฤดูหนาวและขนม",
    titleEn: "Winter & Treats",
    icon: "🧣",
    grade: "ป.3–ป.5",
    words: [
      w("scarf", "scarf", "ผ้าพันคอ", "🧣"),
      w("gloves", "gloves", "ถุงมือ", "🧤", ""),
      w("hat", "hat", "หมวก", "🧢"),
      w("boots", "boots", "รองเท้าบูต", "🥾", ""),
      w("coat", "coat", "เสื้อโค้ต", "🧥"),
      w("cake", "cake", "เค้ก", "🍰"),
      w("cookie", "cookie", "คุกกี้", "🍪"),
      w("milk", "milk", "นม", "🥛", "some"),
      w("cocoa", "hot chocolate", "ช็อกโกแลตร้อน", "☕", "some"),
      w("candy", "candy", "ลูกอม", "🍬", "some"),
    ],
  },
];

export const HOUSES_PER_ROUND = 6;
export const KIDS = ["👧", "👦", "🧒", "👶"];
