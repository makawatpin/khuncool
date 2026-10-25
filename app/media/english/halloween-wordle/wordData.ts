// Halloween vocabulary for the Wordle-style guessing game. Grouped by word
// length because length is the difficulty dial: 4 letters for the youngest,
// 7 for the top of primary school.

export type WordLength = 4 | 5 | 6 | 7;

export type HalloweenWord = {
  en: string; // lower case, exactly `length` letters
  th: string;
  emoji: string;
  /** Sentence with the target replaced by ___ — the third hint. */
  sentence: string;
};

export const WORD_LENGTHS: WordLength[] = [4, 5, 6, 7];

export const LENGTH_INFO: Record<WordLength, { label: string; grade: string; sample: string }> = {
  4: { label: "ง่ายมาก", grade: "ป.1–ป.2", sample: "MOON" },
  5: { label: "ง่าย", grade: "ป.2–ป.4", sample: "GHOST" },
  6: { label: "ปานกลาง", grade: "ป.4–ป.5", sample: "SPIDER" },
  7: { label: "ท้าทาย", grade: "ป.5–ป.6", sample: "PUMPKIN" },
};

export const WORDS: Record<WordLength, HalloweenWord[]> = {
  4: [
    { en: "bone", th: "กระดูก", emoji: "🦴", sentence: "A dog loves a ___." },
    { en: "moon", th: "ดวงจันทร์", emoji: "🌙", sentence: "The ___ is bright tonight." },
    { en: "cape", th: "ผ้าคลุม", emoji: "🦇", sentence: "Dracula wears a black ___." },
    { en: "fang", th: "เขี้ยว", emoji: "🦷", sentence: "A vampire has a sharp ___." },
    { en: "howl", th: "หอน", emoji: "🐺", sentence: "Wolves ___ at the moon." },
    { en: "wand", th: "ไม้กายสิทธิ์", emoji: "🪄", sentence: "The witch waves her ___." },
    { en: "tomb", th: "หลุมศพ", emoji: "🪦", sentence: "A mummy sleeps in a ___." },
    { en: "mask", th: "หน้ากาก", emoji: "🎭", sentence: "I wear a ___ at the party." },
    { en: "dark", th: "มืด", emoji: "🌑", sentence: "It is very ___ at night." },
    { en: "fear", th: "ความกลัว", emoji: "😱", sentence: "I feel ___ in the haunted house." },
  ],
  5: [
    { en: "witch", th: "แม่มด", emoji: "🧙‍♀️", sentence: "A ___ rides a broom." },
    { en: "ghost", th: "ผี", emoji: "👻", sentence: "A ___ says Boo!" },
    { en: "mummy", th: "มัมมี่", emoji: "🤕", sentence: "The ___ is wrapped in bandages." },
    { en: "candy", th: "ลูกอม", emoji: "🍬", sentence: "I get ___ on Halloween." },
    { en: "treat", th: "ขนมที่ได้รับ", emoji: "🍭", sentence: "Trick or ___!" },
    { en: "trick", th: "เล่นตลก / แกล้ง", emoji: "🃏", sentence: "___ or treat!" },
    { en: "scary", th: "น่ากลัว", emoji: "😨", sentence: "The monster is ___." },
    { en: "broom", th: "ไม้กวาด", emoji: "🧹", sentence: "A witch flies on a ___." },
    { en: "magic", th: "เวทมนตร์", emoji: "✨", sentence: "The wizard does ___." },
    { en: "skull", th: "กะโหลกศีรษะ", emoji: "💀", sentence: "A skeleton has a ___." },
    { en: "spell", th: "คาถา", emoji: "📜", sentence: "The witch says a ___." },
    { en: "party", th: "งานปาร์ตี้", emoji: "🎉", sentence: "We have a Halloween ___." },
  ],
  6: [
    { en: "spider", th: "แมงมุม", emoji: "🕷️", sentence: "A ___ makes a web." },
    { en: "zombie", th: "ซอมบี้", emoji: "🧟", sentence: "The ___ walks slowly." },
    { en: "wizard", th: "พ่อมด", emoji: "🧙", sentence: "A ___ has a long beard." },
    { en: "coffin", th: "โลงศพ", emoji: "⚰️", sentence: "A vampire sleeps in a ___." },
    { en: "castle", th: "ปราสาท", emoji: "🏰", sentence: "Dracula lives in a ___." },
    { en: "candle", th: "เทียน", emoji: "🕯️", sentence: "A ___ gives soft light." },
    { en: "potion", th: "น้ำยาวิเศษ", emoji: "🧪", sentence: "The witch makes a ___." },
    { en: "spooky", th: "น่าขนลุก", emoji: "🎃", sentence: "The old house is ___." },
    { en: "goblin", th: "ก็อบลิน", emoji: "👺", sentence: "A green ___ hides in the cave." },
    { en: "shadow", th: "เงา", emoji: "👤", sentence: "I see a ___ on the wall." },
    { en: "cobweb", th: "ใยแมงมุม", emoji: "🕸️", sentence: "There is a ___ in the corner." },
    { en: "creepy", th: "น่าขนลุก / ประหลาด", emoji: "😰", sentence: "The old doll looks ___." },
  ],
  7: [
    { en: "pumpkin", th: "ฟักทอง", emoji: "🎃", sentence: "We carve a ___." },
    { en: "vampire", th: "แวมไพร์", emoji: "🧛", sentence: "A ___ sleeps in the day." },
    { en: "monster", th: "สัตว์ประหลาด", emoji: "👹", sentence: "The ___ has three eyes." },
    { en: "costume", th: "ชุดแต่งกาย", emoji: "🎭", sentence: "I wear a ___ on Halloween." },
    { en: "lantern", th: "โคมไฟ", emoji: "🏮", sentence: "Carry a ___ in the dark." },
    { en: "haunted", th: "มีผีสิง", emoji: "🏚️", sentence: "This is a ___ house." },
  ],
};

export const ROUND_SIZE = 5;
