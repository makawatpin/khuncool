import type { Metadata } from "next";
import Link from "next/link";
import ThaiIdiomDetective from "./ThaiIdiomDetective";

const URL = "https://www.khuncool.com/media/thai/thai-idiom-detective";

export const metadata: Metadata = {
  title: "เกมสำนวนไทย 50 สำนวน นักสืบสำนวนไทย เล่นฟรี | khuncool",
  description: "เกมสำนวนไทยออนไลน์ 50 สำนวน ฝึกทายความหมาย อ่านสถานการณ์ ทายภาพปริศนา และเติมคำ พร้อมเฉลยทุกข้อ รองรับมือถือ แท็บเล็ต และจอห้องเรียน",
  keywords: ["เกมสำนวนไทย", "สำนวนไทย 50 สำนวน", "สุภาษิตไทย", "สื่อการสอนภาษาไทย", "เกมภาษาไทย ป.4", "ความหมายสำนวนไทย"],
  alternates: { canonical: URL },
  openGraph: { type: "website", title: "นักสืบสำนวนไทย เกมสำนวนไทย 50 สำนวน", description: "ไข 4 รูปแบบภารกิจจากคลังสำนวนไทย 50 สำนวน พร้อมเฉลยความหมาย", url: URL, siteName: "Khuncool", locale: "th_TH", images: [{ url: "https://www.khuncool.com/assets/game-covers/thai-idiom-detective.webp", width: 1200, height: 675, alt: "นักสืบสำนวนไทย เกมสำนวนไทย 50 สำนวน" }] },
  twitter: { card: "summary_large_image", title: "นักสืบสำนวนไทย", description: "เกมสำนวนไทย 50 สำนวน เล่นฟรีบนทุกหน้าจอ", images: ["https://www.khuncool.com/assets/game-covers/thai-idiom-detective.webp"] },
};

const schema = { "@context": "https://schema.org", "@graph": [
  { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
    { "@type": "ListItem", position: 2, name: "สื่อภาษาไทย", item: "https://www.khuncool.com/media/thai" },
    { "@type": "ListItem", position: 3, name: "นักสืบสำนวนไทย", item: URL },
  ] },
  { "@type": "WebApplication", name: "นักสืบสำนวนไทย", url: URL, applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: "th-TH", isAccessibleForFree: true, educationalLevel: "ประถมศึกษาปีที่ 4–6", learningResourceType: "Educational game", teaches: ["สำนวนไทย 50 สำนวน", "ความหมายของสำนวน", "การเลือกใช้สำนวนตามสถานการณ์", "การเติมคำในสำนวน"], dateModified: "2026-09-03", offers: { "@type": "Offer", price: "0", priceCurrency: "THB" } },
] };

export default function Page() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/thai">สื่อภาษาไทย</Link><span>›</span><span aria-current="page">นักสืบสำนวนไทย</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#FDE8F3] px-2.5 py-1 text-[10px] font-bold text-[#B4477C]">ภาษาไทย ป.4–ป.6</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">50 สำนวน</span></div><h1 className="mb-1.5 text-[24px] leading-[1.3] md:text-[30px]">นักสืบสำนวนไทย เกมสำนวนไทย 50 สำนวน 🔎</h1><p className="m-0 max-w-[84ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">สืบความหมายจากสถานการณ์และภาพคำใบ้ เติมคำให้เป็นสำนวน แล้วเปิดเฉลยเพื่อเข้าใจการนำไปใช้จริง เลือกเล่นได้ครั้งละ 10 หรือ 20 ข้อ</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10"><ThaiIdiomDetective/><p className="mx-auto mt-6 text-center text-xs leading-6 text-ink-faint md:mt-8 md:text-sm">ฉายบนจอแล้วชวนทั้งห้องปรึกษาก่อนเลือกคำตอบ หรือให้นักเรียนเล่นทบทวนด้วยตนเองบนแท็บเล็ตและมือถือ</p></section>
    <section className="grid gap-7 border-t border-border px-4 py-7 md:grid-cols-2 md:px-8 md:py-10"><div><h2 className="mb-2 text-xl md:text-2xl">เด็กจะได้ฝึกอะไร</h2><p className="text-sm leading-7 text-ink-secondary">เข้าใจความหมายของสำนวน เชื่อมสำนวนกับสถานการณ์ เลือกใช้ถ้อยคำได้เหมาะสม และจดจำโครงสร้างสำนวนผ่านเกมหลายรูปแบบ</p></div><div><h2 className="mb-2 text-xl md:text-2xl">ใช้ในห้องเรียนอย่างไร</h2><p className="text-sm leading-7 text-ink-secondary">แบ่งเป็นทีม ให้เวลาอภิปราย 20–30 วินาทีต่อคดี แล้วส่งตัวแทนเลือกคำตอบ หลังเฉลยให้แต่ละทีมแต่งประโยคใหม่จากสำนวนเดียวกัน</p></div></section>
    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">รูปแบบภารกิจในเกม</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">{[["💬","ถอดความหมาย"],["🕵️","ไขสถานการณ์"],["🖼️","ทายภาพปริศนา"],["✏️","เติมคำสำนวน"]].map(([icon,title])=><article key={title} className="rounded-xl border border-border p-4"><span className="text-2xl">{icon}</span><h3 className="mb-0 mt-2 text-sm">{title}</h3></article>)}</div></section>
  </main>;
}
