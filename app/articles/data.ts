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
  /** Optional related-tool callout shown on the homepage article list (desktop/tablet only). */
  linksTool?: { label: string; href: string };
};

export const ALL_ARTICLES: Article[] = [
  {
    title: "เครื่องวัดเสียงในห้องเรียน สื่อการสอนที่ช่วยคุมความดังได้จริง",
    cat: "สื่อการสอน",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "5 นาที",
    img: "/assets/noise-meter-blog-cover.webp",
    alt: "เครื่องวัดเสียงในห้องเรียน สื่อการสอนออนไลน์",
    href: "/blog/noise-meter",
    excerpt:
      "รู้จักเครื่องวัดเสียงในห้องเรียน สื่อการสอนออนไลน์ที่ช่วยให้นักเรียนเห็นและควบคุมความดังของตัวเองแบบเรียลไทม์ พร้อมวิธีใช้และไอเดียนำไปใช้จริง",
    linksTool: { label: "วัดเสียงในห้อง", href: "/classroom-noise-meter" },
  },
  {
    title: "เกมแข่งเป็ดสุ่มชื่อ สื่อการสอนสนุกที่ครูควรมี",
    cat: "สื่อการสอน",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "5 นาที",
    img: "/assets/duck-race-blog-cover.webp",
    alt: "เกมแข่งเป็ดสุ่มชื่อนักเรียน สื่อการสอนออนไลน์",
    href: "/blog/duck-race",
    excerpt:
      "รู้จักเกมแข่งเป็ดสุ่มชื่อนักเรียน สื่อการสอนออนไลน์ที่สนุกกว่าวงล้อสุ่มแบบเดิม พร้อมวิธีใช้ 4 ขั้นตอน และ 6 ไอเดียใช้งานจริง",
    linksTool: { label: "แข่งเป็ด", href: "/duck-race" },
  },
  {
    title: "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา",
    cat: "ข่าวการศึกษา",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "4 นาที",
    img: "/assets/prachinburi2-recruit-2569-cover.webp",
    alt: "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา",
    href: "/blog/prachinburi2-recruit-2569",
    excerpt:
      "สรุปตำแหน่ง จำนวนอัตรา และช่วงเวลารับสมัครพนักงานราชการทั่วไป สพป.ปราจีนบุรี เขต 2 สมัคร 3-7 สิงหาคม 2569",
  },
  {
    title: "มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ มีใบเซอร์",
    cat: "คอร์สเรียน",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "6 นาที",
    img: "/assets/mahidol-pet-courses-cover.webp",
    alt: "มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์",
    href: "/blog/mahidol-pet-courses",
    excerpt:
      "รวมคอร์สเรียนออนไลน์ฟรีจากมหาวิทยาลัยมหิดล ทั้งคอร์สเข้าใจพฤติกรรมสุนัขและคอร์สมือใหม่หัดเลี้ยงแมว เรียนจบมีใบเซอร์ สอนโดยอาจารย์สัตวแพทย์ตัวจริง",
  },
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
    linksTool: { label: "วงล้อสุ่ม", href: "/random-name-picker" },
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
    linksTool: { label: "วงล้อสุ่ม", href: "/random-name-picker" },
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
    img: "/assets/magnet-frame-cover-v2.webp",
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
