// Covers are 960x540, except the two newest (thai-kingdom, weather-seasons) at 1200x675.
const COVER = (slug: string, alt: string, width = 960, height = 540) => ({
  url: `https://www.khuncool.com/assets/game-covers/${slug}.webp`,
  width,
  height,
  alt,
});

export const ENGLISH_OG_IMAGE = COVER(
  "vocabulary-arcade",
  "Khuncool สื่อการสอนภาษาอังกฤษออนไลน์ สำหรับครูประถม",
);

/** Per-game OG image so each game shares its own cover, not the section default. */
export const gameOgImage = (slug: string, title: string, width?: number, height?: number) =>
  COVER(slug, `${title} สื่อการสอนภาษาอังกฤษออนไลน์ khuncool`, width, height);

export const ENGLISH_AUTHOR = {
  "@type": "Organization",
  name: "Khuncool",
  url: "https://www.khuncool.com",
};

export const ENGLISH_DATE_MODIFIED = "2026-08-24";

export const gameFaqs = (title: string, grade: string) => [
  {
    q: `${title} เหมาะกับนักเรียนชั้นไหน`,
    a: `ออกแบบสำหรับนักเรียนระดับ ${grade} ครูสามารถเล่นพร้อมกันทั้งห้องหรือให้นักเรียนฝึกด้วยตนเองได้`,
  },
  {
    q: `${title} ใช้บนมือถือและจอหน้าชั้นได้ไหม`,
    a: "เล่นได้ทั้งคอมพิวเตอร์ แท็บเล็ต และโทรศัพท์มือถือ พร้อมปุ่มเต็มจอสำหรับฉายผ่านทีวีหรือโปรเจกเตอร์",
  },
  {
    q: "ต้องสมัครสมาชิกหรือติดตั้งโปรแกรมไหม",
    a: "ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดหน้าเกมในเว็บเบราว์เซอร์แล้วเริ่มเล่นได้ฟรี",
  },
];
