import type { Metadata } from "next";
import Link from "next/link";
import DigitalSortGame from "./DigitalSortGame";

export const metadata: Metadata = {
  title: "เกมแยกฮาร์ดแวร์และซอฟต์แวร์ เล่นฟรี | khuncool",
  description: "ภารกิจคัดแยกโลกดิจิทัล เกมลากวางแยกฮาร์ดแวร์และซอฟต์แวร์สำหรับนักเรียนประถม ป.1–ป.4 เล่นฟรี รองรับมือถือและโหมดเต็มจอ",
  keywords: ["เกมฮาร์ดแวร์ซอฟต์แวร์", "ฮาร์ดแวร์และซอฟต์แวร์", "สื่อการสอนคอมพิวเตอร์", "เกมวิทยาการคำนวณ", "เกมลากวาง"],
  alternates: { canonical: "https://www.khuncool.com/media/computer/digital-sort" },
  openGraph: { type: "website", title: "ภารกิจคัดแยกโลกดิจิทัล | khuncool", description: "ลากอุปกรณ์และโปรแกรมไปยังฝั่งฮาร์ดแวร์หรือซอฟต์แวร์ให้ถูกต้อง", url: "https://www.khuncool.com/media/computer/digital-sort", locale: "th_TH" },
  twitter: { card: "summary_large_image" },
};

const jsonLd = { "@context": "https://schema.org", "@graph": [
  { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
    { "@type": "ListItem", position: 2, name: "สื่อคอมพิวเตอร์", item: "https://www.khuncool.com/media/computer" },
    { "@type": "ListItem", position: 3, name: "ภารกิจคัดแยกโลกดิจิทัล", item: "https://www.khuncool.com/media/computer/digital-sort" },
  ] },
  { "@type": "WebApplication", name: "ภารกิจคัดแยกโลกดิจิทัล", url: "https://www.khuncool.com/media/computer/digital-sort", applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: "th", educationalLevel: "ประถมศึกษาปีที่ 1–4", description: "เกมลากวางเพื่อจำแนกฮาร์ดแวร์และซอฟต์แวร์", offers: { "@type": "Offer", price: "0", priceCurrency: "THB" } },
] };

export default function DigitalSortPage() {
  return <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/computer">สื่อคอมพิวเตอร์</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">ภารกิจคัดแยกโลกดิจิทัล</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4"><h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:text-[28px]">ภารกิจคัดแยกโลกดิจิทัล 🖥️</h1><p className="m-0 max-w-[72ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px]">เกมลากวางแยกฮาร์ดแวร์และซอฟต์แวร์สำหรับนักเรียน ป.1–ป.4 ลากหรือแตะเลือกคำตอบให้ครบ 12 ชิ้น สะสมคะแนนและคอมโบ เล่นได้ทั้งรายคนและฉายจอหน้าชั้น</p></header>
    <div className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10"><DigitalSortGame /></div>
    <section className="border-t border-border px-4 py-6 md:px-8 md:py-9"><h2 className="m-0 mb-2 text-lg md:text-2xl">เด็กจะได้เรียนรู้อะไร</h2><p className="m-0 mb-4 max-w-[72ch] text-sm leading-7 text-ink-secondary">แยกอุปกรณ์ที่จับต้องได้ออกจากโปรแกรมและชุดคำสั่ง รู้จักตัวอย่างใกล้ตัว เช่น แป้นพิมพ์ จอภาพ เว็บเบราว์เซอร์ และระบบปฏิบัติการ พร้อมฝึกสังเกตและตัดสินใจอย่างมีเหตุผล</p><div className="flex flex-wrap gap-2.5"><Link href="/media/computer" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">💻 สื่อคอมพิวเตอร์ทั้งหมด</Link><Link href="/group-scoreboard" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🏆 กระดานคะแนน</Link><Link href="/group-maker" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">👥 สุ่มแบ่งกลุ่ม</Link></div></section>
  </main>;
}
