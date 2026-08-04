export const ENGLISH_OG_IMAGE = {
  url: "https://www.khuncool.com/khuncool-logo.png",
  width: 1200,
  height: 630,
  alt: "Khuncool สื่อการสอนภาษาอังกฤษออนไลน์",
};

export const ENGLISH_AUTHOR = {
  "@type": "Organization",
  name: "Khuncool",
  url: "https://www.khuncool.com",
};

export const ENGLISH_DATE_MODIFIED = "2026-08-04";

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
