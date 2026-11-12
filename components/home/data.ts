// Static content for the home page sections.

// Order follows Google Search Console clicks for the 28 days to 10 Nov 2026
// (duck race 363, group maker 17, homeroom 17, noise meter 7). Re-check the
// report before reordering.
export const POPULAR_TOOLS = [
  {
    title: "เกมเป็ดสุ่มชื่อ",
    sub: "สุ่มแบบมีลุ้นทั้งห้อง",
    cover: "/assets/tool-covers/duck-race.webp",
    href: "/duck-race",
  },
  {
    title: "สุ่มแบ่งกลุ่ม",
    sub: "แบ่งเท่ากันในคลิกเดียว",
    cover: "/assets/tool-covers/group-maker.webp",
    href: "/group-maker",
  },
  {
    title: "บันทึกโฮมรูม",
    sub: "ตั้งหัวข้อเอง พิมพ์แบบฟอร์มได้",
    cover: "/assets/homeroom-cover.webp",
    href: "/tools/homeroom",
  },
  {
    title: "เครื่องวัดเสียงในห้อง",
    sub: "คุมเสียงแบบไม่ต้องดุ",
    cover: "/assets/tool-covers/noise-meter.webp",
    href: "/classroom-noise-meter",
  },
];

/** "What are you about to do?" tiles: each goes straight to three tools. */
export const MOMENTS = [
  {
    icon: "🎲",
    title: "สุ่มและเล่นเกม",
    bg: "bg-[#E1E3FD]",
    links: [
      { label: "วงล้อสุ่มชื่อ", href: "/random-name-picker" },
      { label: "เกมเป็ดสุ่มชื่อ", href: "/duck-race" },
      { label: "สุ่มคำถาม", href: "/random-question" },
    ],
  },
  {
    icon: "🏫",
    title: "คุมห้องเรียน",
    bg: "bg-[#D0FBEF]",
    links: [
      { label: "ตัวจับเวลา", href: "/timer" },
      { label: "กระดานคะแนนกลุ่ม", href: "/group-scoreboard" },
      { label: "เครื่องวัดเสียง", href: "/classroom-noise-meter" },
    ],
  },
  {
    icon: "📚",
    title: "หาสื่อการสอน",
    bg: "bg-[#FFEAD5]",
    links: [
      { label: "ภาษาอังกฤษ", href: "/media/english" },
      { label: "คณิตศาสตร์", href: "/media/mathematics" },
      { label: "สื่อทุกวิชา", href: "/media" },
    ],
  },
  {
    icon: "📋",
    title: "งานเอกสารครู",
    bg: "bg-[#FFF4D6]",
    links: [
      { label: "เช็กชื่อนักเรียน", href: "/tools/attendance" },
      { label: "บันทึกโฮมรูม", href: "/tools/homeroom" },
      { label: "ออมเงินนักเรียน", href: "/tools/savings" },
    ],
  },
];

export const GAMES = [
  { title: "Vocabulary Arcade", meta: "ภาษาอังกฤษ", cover: "/assets/game-covers/vocabulary-arcade.webp", href: "/media/english/vocabulary-arcade" },
  { title: "Math Adventure", meta: "คณิตศาสตร์", cover: "/assets/game-covers/math-adventure.webp", href: "/media/mathematics/math-adventure" },
  { title: "Phonics Bingo", meta: "ภาษาอังกฤษ", cover: "/assets/game-covers/phonics-bingo.webp", href: "/media/english/phonics-bingo" },
  { title: "เขาวงกตโค้ดดิ้ง", meta: "วิทยาการคำนวณ", cover: "/assets/game-covers/coding-maze.webp", href: "/media/computer/coding-maze" },
  { title: "Science Lab Crisis", meta: "วิทยาศาสตร์", cover: "/assets/game-covers/science-lab-crisis.webp", href: "/media/science/science-lab-crisis" },
  { title: "Thai Kingdom", meta: "ภาษาไทย", cover: "/assets/game-covers/thai-kingdom.webp", href: "/media/thai/thai-kingdom" },
];

export const PRODUCTS = [
  {
    name: "กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง มีกาวในตัว",
    rating: "4.9 (320)",
    price: "฿16",
    cover: "/assets/magnet-frame-product.webp",
    href: "https://s.shopee.co.th/7KvhYc7TtI",
  },
  {
    name: "เครื่องเคลือบบัตร A4 พร้อมฟิล์ม 50 แผ่น",
    rating: "4.8 (156)",
    price: "฿469",
    cover: "/assets/laminator-product.jpg",
    href: "https://s.shopee.co.th/9ANLl4nOwr",
  },
  {
    name: "แท่นวางแล็ปท็อป iPad ปรับสูงต่ำ หมุนได้ 360°",
    rating: "5.0 (892)",
    price: "฿399",
    cover: "/assets/laptop-stand-product.webp",
    href: "https://s.shopee.co.th/3Viz1JMJ8g",
  },
  {
    name: "ไมค์ช่วยสอน K500 ลำโพงพกพา สำหรับครู",
    rating: "4.7 (241)",
    price: "฿436",
    cover: "/assets/mic-speaker-product.webp",
    href: "https://s.shopee.co.th/50XmnMcQXy",
  },
  {
    name: "แก้วเก็บความเย็น Bottle Bottle เซรามิก มีหลอด",
    rating: "4.8 (410)",
    price: "฿599",
    cover: "/assets/tumbler-1.webp",
    href: "https://s.shopee.co.th/1gHKqEUGWH",
  },
  {
    name: "แก้วเก็บความเย็น CIVAGO เซรามิก เย็น 24 ชม.",
    rating: "4.9 (275)",
    price: "฿324",
    cover: "/assets/tumbler-2.webp",
    href: "https://s.shopee.co.th/20uBElffiQ",
  },
];

export const APPS = [
  {
    icon: "📋",
    title: "บันทึกโฮมรูม",
    sub: "ตั้งหัวข้อเอง พิมพ์แบบฟอร์มได้",
    bg: "bg-[#E1E3FD]",
    href: "/tools/homeroom",
  },
  {
    icon: "✅",
    title: "เช็กชื่อนักเรียน",
    sub: "บันทึกการมาเรียน สรุปสถิติ",
    bg: "bg-[#D0FBEF]",
    href: "/tools/attendance",
  },
  {
    icon: "💰",
    title: "ออมเงินนักเรียน",
    sub: "บันทึกเงินออมรายคน รายห้อง",
    bg: "bg-[#FFEAD5]",
    href: "/tools/savings",
  },
  {
    icon: "🪥",
    title: "บันทึกการแปรงฟัน",
    sub: "บันทึกรายวัน พิมพ์ตารางรายเดือน",
    bg: "bg-[#E0F7FA]",
    href: "/tools/toothbrushing",
  },
  {
    icon: "🥛",
    title: "บันทึกการดื่มนม",
    sub: "บันทึกรายวัน พิมพ์ตารางรายเดือน",
    bg: "bg-[#FFF4D6]",
    href: "/tools/milk",
  },
  {
    icon: "🔀",
    title: "สุ่มแบ่งกลุ่ม",
    sub: "แบ่งกลุ่มเท่า ๆ กันอัตโนมัติ",
    bg: "bg-[#E1E3FD]",
    href: "/group-maker",
  },
];
