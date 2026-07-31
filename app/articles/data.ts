export type Category = "สื่อการสอน" | "รีวิวสินค้า" | "ข่าวการศึกษา" | "คอร์สเรียน";

export const CAT_MAP: Record<Category, { bg: string; color: string }> = {
  สื่อการสอน: { bg: "#DFF5EF", color: "#0A7A66" },
  รีวิวสินค้า: { bg: "#FFEAD5", color: "#C2500B" },
  ข่าวการศึกษา: { bg: "#E1E3FD", color: "#3D38B4" },
  คอร์สเรียน: { bg: "#FFF8EE", color: "#8A5A1A" },
};

export const CATS = (Object.keys(CAT_MAP) as Category[]).map((t) => ({
  t,
  bg: CAT_MAP[t].bg,
  color: CAT_MAP[t].color,
}));

export type Article = {
  title: string;
  cat: Category;
  date: string;
  /** ISO date (YYYY-MM-DD) backing `date` — used for JSON-LD and sitemap lastmod. */
  dateISO: string;
  readTime: string;
  img: string;
  alt: string;
  href: string;
  excerpt: string;
};

export const ALL_ARTICLES: Article[] = [
  {
    title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง",
    cat: "สื่อการสอน",
    date: "27 ก.ค. 2569",
    dateISO: "2026-07-27",
    readTime: "5 นาที",
    img: "/assets/wheel-cover.png",
    alt: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี",
    href: "/blog/wheel",
    excerpt:
      "รู้จักวงล้อสุ่มชื่อ สื่อการสอนออนไลน์ที่ช่วยให้ห้องเรียนสนุกและยุติธรรมขึ้น พร้อมวิธีใช้ 4 ขั้นตอน และ 8 ไอเดียใช้งานจริง",
  },
  {
    title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
    cat: "สื่อการสอน",
    date: "26 ก.ค. 2569",
    dateISO: "2026-07-26",
    readTime: "6 นาที",
    img: "/assets/random-name-cover.png",
    alt: "10 กิจกรรมสุ่มชื่อนักเรียน",
    href: "/blog/random-name-activities",
    excerpt:
      "รวม 10 กิจกรรมสุ่มชื่อนักเรียนที่ครูเอาไปใช้ได้ทันที ตั้งแต่วอร์มอัพต้นคาบไปจนถึงกิจกรรมท้ายชั่วโมง",
  },
  {
    title: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.",
    cat: "ข่าวการศึกษา",
    date: "25 ก.ค. 2569",
    dateISO: "2026-07-25",
    readTime: "4 นาที",
    img: "/assets/royal-award-cover.png",
    alt: "รางวัลพระราชทาน 2569",
    href: "/blog/royal-award-2569",
    excerpt:
      "สรุปช่วงเวลา ขั้นตอน และเอกสารที่โรงเรียนต้องเตรียม ก่อนยื่นคัดเลือกรางวัลพระราชทานปี 2569",
  },
  {
    title: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์สที่ครูควรรู้",
    cat: "คอร์สเรียน",
    date: "25 ก.ค. 2568",
    dateISO: "2025-07-25",
    readTime: "4 นาที",
    img: "/assets/psu-english-cover.webp",
    alt: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์",
    href: "/blog/psu-english",
    excerpt:
      "ครูท่านไหนอยากพัฒนาภาษาอังกฤษเพื่อสอบเลื่อนวิทยฐานะ คอร์สนี้เรียนฟรีและมีใบประกาศนียบัตร",
  },
  {
    title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง",
    cat: "รีวิวสินค้า",
    date: "26 ก.ค. 2568",
    dateISO: "2025-07-26",
    readTime: "4 นาที",
    img: "/assets/magnet-frame-cover.png",
    alt: "รีวิว กรอบป้ายติดผนังแม่เหล็ก",
    href: "/blog/magnetic-frame",
    excerpt:
      "จัดบอร์ดห้องเรียนให้เรียบร้อยโดยไม่ต้องเจาะผนัง รีวิวการใช้งานจริงพร้อมข้อดีข้อสังเกต",
  },
];

export const FEATURED: Article & { bg: string; color: string } = {
  ...ALL_ARTICLES[0],
  bg: CAT_MAP[ALL_ARTICLES[0].cat].bg,
  color: CAT_MAP[ALL_ARTICLES[0].cat].color,
};

export const ARTICLES: (Article & { bg: string; color: string })[] = ALL_ARTICLES.slice(
  1,
).map((a) => ({ ...a, bg: CAT_MAP[a.cat].bg, color: CAT_MAP[a.cat].color }));
