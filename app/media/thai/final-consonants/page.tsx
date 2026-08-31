import type { Metadata } from "next";
import Link from "next/link";
import FinalConsonantsApp from "./FinalConsonantsApp";

const URL = "https://www.khuncool.com/media/thai/final-consonants";
const TITLE = "มาตราตัวสะกด 9 มาตรา สื่อการสอนและเกม ป.1–ป.3 | khuncool";
const DESCRIPTION = "สื่อสอนมาตราตัวสะกดครบ 9 มาตรา เรียนตัวสะกดตรงมาตราและไม่ตรงมาตรา แล้วเล่นเกมจำแนกคำจากเสียงท้าย ใช้ฟรีบนมือถือและจอห้องเรียน";

export const metadata: Metadata = {
  title: TITLE, description: DESCRIPTION,
  keywords: ["มาตราตัวสะกด", "มาตราตัวสะกด 9 มาตรา", "เกมมาตราตัวสะกด", "สื่อการสอนภาษาไทย ป.1", "ตัวสะกดตรงมาตรา", "ตัวสะกดไม่ตรงมาตรา"],
  alternates: { canonical: URL },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: URL, locale: "th_TH", siteName: "khuncool" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
      { "@type": "ListItem", position: 2, name: "สื่อภาษาไทย", item: "https://www.khuncool.com/media/thai" },
      { "@type": "ListItem", position: 3, name: "มาตราตัวสะกด", item: URL },
    ] },
    { "@type": "LearningResource", name: "หมู่บ้านมาตราตัวสะกด", url: URL, inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 1–3", learningResourceType: "Interactive lesson and educational game", teaches: ["ส่วนประกอบของคำ", "แม่ ก กา", "มาตราตัวสะกดตรงมาตรา", "มาตราตัวสะกดไม่ตรงมาตรา", "การจำแนกคำจากเสียงท้าย"], isAccessibleForFree: true },
  ],
};

export default function FinalConsonantsPage() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/thai">สื่อภาษาไทย</Link><span>›</span><span aria-current="page">มาตราตัวสะกด</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#FDE8F3] px-2.5 py-1 text-[10px] font-bold text-[#B4477C]">ภาษาไทย ป.1–ป.3</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">บทเรียน + เกม</span></div><h1 className="mb-1.5 text-[24px] leading-[1.3] md:text-[30px]">มาตราตัวสะกด 9 มาตรา: สอนก่อนเล่น 🏘️</h1><p className="m-0 max-w-[90ch] text-[13.5px] leading-7 text-ink-secondary md:text-[14.5px]">พาเด็กมองเห็นตัวสะกด ฟังเสียงท้าย และแยกคำเป็นแม่ต่าง ๆ ทีละขั้น จากนั้นจึงเล่นเกมส่งคำกลับบ้าน โดยแต่ละข้อมีตัวเลือกจากมาตราที่มักสับสนกัน</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="สื่อมาตราตัวสะกด"><FinalConsonantsApp variant="overview" /></section>
    <section className="grid gap-7 border-t border-border px-4 py-7 md:grid-cols-2 md:px-8 md:py-10"><div><h2 className="mb-2 text-xl">เด็กจะได้เรียนรู้อะไร</h2><p className="text-sm leading-7 text-ink-secondary">เข้าใจว่ามาตราตัวสะกดจัดตามเสียงท้าย แยกแม่ ก กา มาตราตรง และมาตราไม่ตรง พร้อมอธิบายเหตุผลจากเสียงที่ได้ยิน</p></div><div><h2 className="mb-2 text-xl">ใช้ในห้องเรียนอย่างไร</h2><p className="text-sm leading-7 text-ink-secondary">เปิดบทเรียน 4 ตอนบนจอ ชวนเด็กออกเสียงพร้อมกัน ทำคำถามเช็กความเข้าใจ แล้วแบ่งทีมเล่นเกม 5–15 คำได้ในคาบเดียว</p></div></section>
    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">เริ่มจากมาตราที่สับสนมาก</h2><article className="mt-4 rounded-2xl border border-[#F3C6DE] bg-[#FFF7FB] p-5"><h3 className="m-0 text-lg">แม่กด ปะทะ แม่กก ปะทะ แม่กบ</h3><p className="mb-4 mt-2 text-sm leading-7 text-ink-secondary">แม่กดมีรูปตัวสะกดหลายตัวและมักสับสนกับเสียงปิดของแม่กกและแม่กบ เรียนตัวอย่างเฉพาะและเล่นเกมเปรียบเทียบสามแม่โดยตรง</p><Link href="/media/thai/mae-kot" className="font-semibold text-primary">เปิดบทเรียนแม่กด →</Link></article></section>
  </main>;
}

