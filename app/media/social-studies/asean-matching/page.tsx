import type { Metadata } from "next";
import Link from "next/link";
import AseanMatchingApp from "./AseanMatchingApp";

export const metadata: Metadata = {
  title: "เกมจับคู่ภาพอาเซียน 11 ประเทศ เล่นฟรี | khuncool",
  description: "เกมสังคมศึกษาจับคู่ภาพกับชื่อประเทศและธงชาติอาเซียน 11 ประเทศ เลือกเล่น 5 หมวด ดอกไม้ สัตว์ อาหาร สกุลเงิน และเครื่องแต่งกาย รองรับมือถือและจอห้องเรียน",
  keywords: ["เกมอาเซียน", "สื่อการสอนอาเซียน", "ธงชาติอาเซียน", "เกมสังคมศึกษา", "อาเซียน 11 ประเทศ"],
  alternates: { canonical: "https://www.khuncool.com/media/social-studies/asean-matching" },
  openGraph: { type: "website", title: "เกมจับคู่ภาพอาเซียน 11 ประเทศ | khuncool", description: "เรียนรู้อาเซียนผ่านเกมจับคู่ภาพ ชื่อประเทศ และธงชาติ 5 หมวด", url: "https://www.khuncool.com/media/social-studies/asean-matching", locale: "th_TH", images: [{ url: "https://www.khuncool.com/assets/asean/costumes/thailand.webp", alt: "เกมจับคู่ภาพและวัฒนธรรมอาเซียน" }] },
  twitter: { card: "summary_large_image" },
};

const jsonLd = { "@context": "https://schema.org", "@graph": [
  { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
    { "@type": "ListItem", position: 2, name: "สื่อสังคมศึกษา", item: "https://www.khuncool.com/media/social-studies" },
    { "@type": "ListItem", position: 3, name: "เกมจับคู่ภาพอาเซียน", item: "https://www.khuncool.com/media/social-studies/asean-matching" },
  ]},
  { "@type": "WebApplication", name: "เกมจับคู่ภาพอาเซียน", url: "https://www.khuncool.com/media/social-studies/asean-matching", applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 4–6", learningResourceType: "Educational game", teaches: ["ประเทศสมาชิกอาเซียน", "วัฒนธรรมอาเซียน", "ธงชาติและชื่อประเทศ"], dateModified: "2026-08-04", author: { "@type": "Person", name: "คุณคูล", url: "https://www.khuncool.com/about" }, description: "เกมจับคู่ภาพกับชื่อประเทศและธงชาติอาเซียน 11 ประเทศ จำนวน 5 หมวด", offers: { "@type": "Offer", price: "0", priceCurrency: "THB" } },
]};

export default function AseanMatchingPage() {
  return <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/social-studies">สื่อสังคมศึกษา</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">เกมจับคู่ภาพอาเซียน</span></div></nav>
    <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4"><h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:text-[28px]">เกมจับคู่ภาพอาเซียน 11 ประเทศ 🌏</h1><p className="m-0 max-w-[68ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px]">เลือกเล่น 5 หมวด ดูภาพและคำใบ้ แล้วจับคู่กับชื่อประเทศและธงชาติให้ถูกต้อง สะสมคะแนนและคอมโบ เล่นได้ทั้งจอหน้าชั้น แท็บเล็ต และมือถือ</p></div>
    <div className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10"><AseanMatchingApp /></div>
    <div className="border-t border-border px-4 py-6 md:px-8 md:py-9"><h2 className="m-0 mb-3 text-lg md:text-2xl">สื่อการสอนที่เกี่ยวข้อง</h2><div className="flex flex-wrap gap-2.5"><Link href="/media/social-studies" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🗺️ สื่อสังคมศึกษาทั้งหมด</Link><Link href="/group-scoreboard" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🏆 กระดานคะแนน</Link><Link href="/group-maker" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">👥 สุ่มแบ่งกลุ่ม</Link></div></div>
  </main>;
}
