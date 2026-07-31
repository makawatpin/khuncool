// Static content for the home page sections, sourced from screens/Home.dc.html.

export const PILLARS = [
  {
    icon: "📰",
    title: "บทความ",
    path: "/articles",
    bg: "bg-[#E1E3FD]",
    href: "/blog/wheel",
  },
  {
    icon: "🎡",
    title: "สื่อการสอนออนไลน์",
    path: "/tools",
    bg: "bg-[#D0FBEF]",
    href: "/tools",
  },
  {
    icon: "🛒",
    title: "แนะนำสินค้า",
    path: "/shop",
    bg: "bg-[#FFEAD5]",
    href: "/shop",
  },
  {
    icon: "📱",
    title: "แอป",
    path: "/apps",
    bg: "bg-[#E1E3FD]",
    href: "/apps",
  },
];

export const TOOLS = [
  { icon: "🎡", title: "วงล้อสุ่มชื่อ", tag: "ยอดนิยม", bg: "bg-[#E1E3FD]", href: "/tools/wheel" },
  { icon: "🏆", title: "กระดานคะแนนกลุ่ม", tag: "ใหม่", bg: "bg-[#E1E3FD]", href: "/tools/scoreboard" },
  { icon: "🎤", title: "เครื่องวัดเสียงในห้อง", tag: "ใหม่", bg: "bg-[#D0FBEF]", href: "/tools/noise-meter" },
  { icon: "🦆", title: "เกมแข่งเป็ด", tag: "สนุก สุ่มชื่อ", bg: "bg-[#D0FBEF]", href: "/tools/duck-race" },
];

export const ARTICLES = [
  {
    rank: "1",
    cat: "คอร์สเรียน",
    catColor: "text-[#8A5A1A]",
    title: "มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ มีใบเซอร์",
    date: "31 ก.ค. 2569",
    read: "อ่าน 6 นาที",
    cover: "/assets/mahidol-pet-courses-cover.webp",
    linksTool: "",
    href: "/blog/mahidol-pet-courses",
  },
  {
    rank: "2",
    cat: "อบรมฟรี",
    catColor: "text-success",
    title:
      "เรียนภาษาอังกฤษฟรี มีใบเซอร์! คอร์ส Intermediate Conversational English จาก PSU MOOC",
    date: "25 ก.ค. 2568",
    read: "อ่าน 4 นาที",
    cover: "/assets/psu-english-cover.webp",
    linksTool: "",
    href: "/blog/psu-english",
  },
  {
    rank: "3",
    cat: "สื่อการสอน",
    catColor: "text-[#3D38B4]",
    title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ช่วยให้ห้องเรียนสนุกและยุติธรรมขึ้น",
    date: "27 ก.ค. 2569",
    read: "อ่าน 5 นาที",
    cover: "/assets/wheel-cover.png",
    linksTool: "วงล้อสุ่ม /tools/wheel",
    href: "/blog/wheel",
  },
  {
    rank: "4",
    cat: "รีวิวสินค้า",
    catColor: "text-[#C2500B]",
    title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง ตัวช่วยทำบอร์ดผลงานเด็ก",
    date: "26 ก.ค. 2568",
    read: "อ่าน 4 นาที",
    cover: "/assets/magnet-frame-detail.jpg",
    linksTool: "",
    href: "/blog/magnetic-frame",
  },
  {
    rank: "5",
    cat: "สื่อการสอน",
    catColor: "text-[#3D38B4]",
    title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
    date: "27 ก.ค. 2569",
    read: "อ่าน 6 นาที",
    cover: "/assets/random-name-cover.png",
    linksTool: "วงล้อสุ่ม /tools/wheel",
    href: "/blog/random-name-activities",
  },
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
    href: "/apps/homeroom",
  },
  {
    icon: "✅",
    title: "เช็กชื่อนักเรียน",
    sub: "บันทึกการมาเรียน สรุปสถิติ",
    bg: "bg-[#D0FBEF]",
    href: "/apps/attendance",
  },
  {
    icon: "💰",
    title: "ออมเงินนักเรียน",
    sub: "บันทึกเงินออมรายคน รายห้อง",
    bg: "bg-[#FFEAD5]",
    href: "/apps/savings",
  },
  {
    icon: "🔀",
    title: "สุ่มแบ่งกลุ่ม",
    sub: "แบ่งกลุ่มเท่า ๆ กันอัตโนมัติ",
    bg: "bg-[#E1E3FD]",
    href: "/apps/groups",
  },
];
