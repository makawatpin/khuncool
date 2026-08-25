// Static content for the /media/english hub page, sourced from
// "Khuncool English.dc.html" in the Khuncool Design System project.

export const TRUST_CHIPS = [
  "ใช้ฟรี ไม่ต้องสมัคร",
  "ฉายจอหน้าชั้นได้",
  "มีเสียงอ่านคำศัพท์",
];

export type MediaSkill = "Vocabulary" | "Phonics" | "Grammar" | "Speaking";

export type MediaItem = {
  skill: MediaSkill;
  title: string;
  icon: string;
  bg: string;
  image: string;
  short: string;
  long: string;
  grade: string;
  time: string;
  mode: string;
  href: string;
};

export const MEDIA: MediaItem[] = [
  {
    skill: "Vocabulary",
    title: "Weather & Seasons Adventure",
    icon: "☀️",
    bg: "#E8F5FF",
    image: "/assets/game-covers/weather-seasons.webp",
    short: "เรียนอากาศและฤดูกาล แล้วเล่นเกมนักพยากรณ์",
    long: "เรียนคำศัพท์สภาพอากาศ ฤดูกาล และเครื่องแต่งกายผ่าน 4 บทเรียน จากนั้นเล่นเกมสลับอักษร แต่งตัวตามอากาศ และ Sentence Quiz สรุปทักษะ",
    grade: "ป.1–ป.6",
    time: "10–20 นาที",
    mode: "ทั้งห้อง / เดี่ยว",
    href: "/media/english/weather-seasons",
  },
  {
    skill: "Vocabulary",
    title: "Family Tree Explorer",
    icon: "🌳",
    bg: "#DFF6EF",
    image: "/assets/game-covers/family-tree.webp",
    short: "ลากคำศัพท์ปลูกต้นไม้ครอบครัว 4 ด่าน",
    long: "เกมคำศัพท์ครอบครัวแบบลากวาง เริ่มจากจับคู่ภาพกับคำ ไปจนถึงเติมผังครอบครัวให้ครบ มีเสียงอ่านทุกคำ",
    grade: "ป.1–ป.4",
    time: "10–15 นาที",
    mode: "ทั้งห้อง / เดี่ยว",
    href: "/media/english/family-tree",
  },
  {
    skill: "Vocabulary",
    title: "Vocabulary Arcade",
    icon: "🎮",
    bg: "#EEEFFE",
    image: "/assets/game-covers/vocabulary-arcade.webp",
    short: "คำศัพท์ 10 หมวด 4 โหมดเล่น มีเสียงอ่าน",
    long: "เลือกหมวดคำศัพท์ที่กำลังสอน แล้วเล่นได้ 4 โหมด — เลือกคำจากรูป เลือกรูปจากคำ เรียงตัวอักษร และโหมดผสม มีดาวสะสม คอมโบ และตารางสรุปคำท้ายเกม",
    grade: "ป.1–ป.6",
    time: "5–15 นาที",
    mode: "ทั้งห้อง / เดี่ยว",
    href: "/media/english/vocabulary-arcade",
  },
  {
    skill: "Phonics",
    title: "Phonics Bingo",
    icon: "🔤",
    bg: "#EEEEFD",
    image: "/assets/game-covers/phonics-bingo.webp",
    short: "บิงโกเสียงต้นคำ เล่นพร้อมกันทั้งห้อง",
    long: "ครูกดสุ่มเสียง เด็กกาช่องบนกระดานของตัวเอง ฝึกแยกเสียงต้นคำและท้ายคำ พิมพ์กระดานแจกได้",
    grade: "ป.1–ป.3",
    time: "15 นาที",
    mode: "ทั้งห้อง",
    href: "/media/english/phonics-bingo",
  },
  {
    skill: "Vocabulary",
    title: "Classroom Objects Match",
    icon: "✏️",
    bg: "#FFF0E4",
    image: "/assets/game-covers/classroom-objects.webp",
    short: "จับคู่ภาพกับคำของใช้ในห้องเรียน",
    long: "จับคู่ภาพสิ่งของรอบตัวกับคำศัพท์ภายในเวลาที่กำหนด เหมาะเป็นกิจกรรมอุ่นเครื่องต้นคาบ",
    grade: "ป.1–ป.3",
    time: "5–10 นาที",
    mode: "ทั้งห้อง / เดี่ยว",
    href: "/media/english/classroom-objects",
  },
  {
    skill: "Grammar",
    title: "Is / Are Sorting",
    icon: "🧩",
    bg: "#E7F0FF",
    image: "/assets/game-covers/is-are-sorting.webp",
    short: "แยกประโยคเข้าช่อง is หรือ are",
    long: "ลากประโยคเข้าช่องให้ถูก พร้อมคำอธิบายภาษาไทยเมื่อตอบผิด ครูดูสรุปข้อที่ทั้งห้องพลาดบ่อยได้",
    grade: "ป.3–ป.6",
    time: "10 นาที",
    mode: "ทั้งห้อง",
    href: "/media/english/is-are-sorting",
  },
  {
    skill: "Speaking",
    title: "Talk Card สุ่มคำถามพูด",
    icon: "🎤",
    bg: "#FDE8F3",
    image: "/assets/game-covers/talk-card.webp",
    short: "สุ่มคำถามภาษาอังกฤษให้เด็กตอบหน้าชั้น",
    long: "สุ่มคำถามสนทนาพร้อมประโยคตัวอย่างและเสียงอ่าน ใช้คู่กับวงล้อสุ่มชื่อเพื่อเลือกคนตอบ",
    grade: "ป.4–ป.6",
    time: "5–15 นาที",
    mode: "ทั้งห้อง",
    href: "/media/english/talk-card",
  },
  {
    skill: "Phonics",
    title: "Sound Wheel วงล้อเสียง",
    icon: "🎡",
    bg: "#EAF7E4",
    image: "/assets/game-covers/sound-wheel.webp",
    short: "หมุนวงล้อ ออกเสียง แล้วบอกคำศัพท์",
    long: "หมุนวงล้อได้หนึ่งเสียง ให้เด็กออกเสียงและบอกคำศัพท์ที่ขึ้นต้นด้วยเสียงนั้น มี 3 ชุดเสียง (พยัญชนะ a–z, digraphs, สระสั้น CVC) พร้อมเสียงอ่าน ดาวสะสม และสตรีคถูกต่อเนื่อง",
    grade: "ป.1–ป.3",
    time: "5–10 นาที",
    mode: "ทั้งห้อง",
    href: "/media/english/sound-wheel",
  },
];

export const SKILLS: (MediaSkill | "ทั้งหมด")[] = [
  "ทั้งหมด",
  "Phonics",
  "Vocabulary",
  "Grammar",
  "Speaking",
];

export const CASES = [
  { q: "เด็กยังจำคำศัพท์ครอบครัวไม่ได้", a: "Family Tree", href: "/media/english/family-tree" },
  { q: "อยากให้เด็กท่องศัพท์หมวดที่กำลังสอน", a: "Vocabulary Arcade", href: "/media/english/vocabulary-arcade" },
  { q: "อยากอุ่นเครื่อง 5 นาทีต้นคาบ", a: "Vocabulary Arcade", href: "/media/english/vocabulary-arcade" },
  { q: "ฝึกแยกเสียงต้นคำก่อนสอนอ่าน", a: "Phonics Bingo", href: "/media/english/phonics-bingo" },
  { q: "อยากให้เด็กออกเสียงทีละคนแบบสนุก ๆ", a: "Sound Wheel", href: "/media/english/sound-wheel" },
  { q: "อยากให้เด็กกล้าพูดหน้าชั้น", a: "Talk Card", href: "/media/english/talk-card" },
];

export const RELATED_TOOLS = [
  { title: "จับเวลา", sub: "คุมเวลาแต่ละรอบ", icon: "⏱", bg: "#FFF0E4", href: "/timer" },
  { title: "สุ่มแบ่งกลุ่ม", sub: "แบ่งทีมแข่งกัน", icon: "👥", bg: "#E7F0FF", href: "/group-maker" },
  { title: "กระดานคะแนน", sub: "ให้คะแนนระหว่างเล่น", icon: "🏆", bg: "#EEEEFD", href: "/group-scoreboard" },
];

export const FAQS = [
  {
    q: "สื่อภาษาอังกฤษเหล่านี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทุกชิ้น ไม่จำกัดจำนวนครั้ง เปิดผ่านเบราว์เซอร์ได้ทันทีโดยไม่ต้องสมัครสมาชิก การล็อกอินมีไว้เพื่อเก็บรายชื่อนักเรียนและคะแนนให้ตามไปทุกเครื่องเท่านั้น",
  },
  {
    q: "เหมาะกับนักเรียนชั้นไหน",
    a: "ออกแบบสำหรับ ป.1–ป.6 เป็นหลัก แต่ละสื่อระบุระดับชั้นที่เหมาะสมไว้บนการ์ด และปรับความยากหรือชุดคำศัพท์เองได้ในเกม",
  },
  {
    q: "ใช้สอนทั้งห้องพร้อมกัน หรือให้เด็กเล่นเดี่ยว",
    a: "ได้ทั้งสองแบบ ฉายขึ้นจอหน้าชั้นแล้วเล่นพร้อมกันทั้งห้อง หรือแชร์ลิงก์ของเกมให้นักเรียนเล่นบนแท็บเล็ตของตัวเอง เพราะทุกเกมมี URL ของตัวเอง",
  },
  {
    q: "มีเสียงอ่านคำศัพท์ให้ไหม",
    a: "สื่อคำศัพท์ทุกชิ้นมีปุ่มฟังเสียงอ่าน ครูที่ไม่มั่นใจการออกเสียงให้เด็กฟังจากสื่อได้โดยตรง และกดฟังซ้ำได้ไม่จำกัด",
  },
];

export const RELATED_ARTICLES = [
  { t: "8 กิจกรรมสอนคำศัพท์สภาพอากาศและฤดูกาล", href: "/blog/weather-seasons-english" },
  { t: "15 เกมคำศัพท์ภาษาอังกฤษในห้องเรียน เด็กประถมเล่นได้", href: "/blog/english-vocabulary-games" },
  { t: "ตัวอย่างแผนสอนคำศัพท์ภาษาอังกฤษ 50 นาที", href: "/blog/english-vocabulary-lesson-plan" },
  { t: "7 กิจกรรม Warm-up ภาษาอังกฤษ 5 นาที", href: "/blog/english-warm-up-activities" },
  { t: "เทคนิคสอนภาษาอังกฤษจาก PSU", href: "/blog/psu-english" },
  { t: "อ่านบทความอื่น ๆ ทั้งหมด", href: "/articles" },
];
