import type { Metadata } from "next";
import Link from "next/link";
import MathBombGame from "./MathBombGame";

const PAGE_URL = "https://www.khuncool.com/media/mathematics/math-bomb-defusal";

export const metadata: Metadata = {
  title: "Math Bomb Defusal เกมถอดรหัสบอมบ์ตัวเลข | khuncool",
  description: "เกมคณิตศาสตร์ถอดรหัสบอมบ์ตัวเลข ฝึกคิดเลขเร็ว สมการ เศษส่วน ร้อยละ และการประมาณค่า เลือกตัดสายคำตอบที่ถูกต้องก่อนหมดเวลา เล่นฟรีบนจอห้องเรียน",
  keywords: ["เกมคณิตศาสตร์", "เกมคิดเลขเร็ว", "Math Bomb Defusal", "เกมสมการ", "เกมเศษส่วน", "เกมร้อยละ", "สื่อการสอนคณิตศาสตร์"],
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "website", title: "Math Bomb Defusal ถอดรหัสบอมบ์ตัวเลข | khuncool", description: "ช่วยกันแก้โจทย์ ตัดสายคำตอบที่ถูกต้อง และหยุดระเบิดก่อนหมดเวลา", url: PAGE_URL, locale: "th_TH" },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
      { "@type": "ListItem", position: 2, name: "สื่อคณิตศาสตร์", item: "https://www.khuncool.com/media/mathematics" },
      { "@type": "ListItem", position: 3, name: "ถอดรหัสบอมบ์ตัวเลข", item: PAGE_URL },
    ]},
    { "@type": "WebApplication", name: "Math Bomb Defusal เกมถอดรหัสบอมบ์ตัวเลข", url: PAGE_URL, applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 3–6", learningResourceType: "Educational game", teaches: ["การคิดเลขเร็ว", "สมการ", "การประมาณค่า", "เศษส่วน", "ร้อยละ"], description: "เกมแก้โจทย์คณิตศาสตร์และเลือกตัดสายคำตอบที่ถูกต้องก่อนหมดเวลา", offers: { "@type": "Offer", price: "0", priceCurrency: "THB" } },
  ],
};

export default function MathBombPage() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/mathematics">สื่อคณิตศาสตร์</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">ถอดรหัสบอมบ์ตัวเลข</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#FFF0E4] px-2.5 py-1 text-[10px] font-bold text-[#C85C12]">คณิตศาสตร์</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">เล่นได้แล้ว</span></div><h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">ถอดรหัสบอมบ์ตัวเลข Math Bomb Defusal 💣</h1><p className="m-0 max-w-[82ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">แก้โจทย์คณิตศาสตร์บนสายทั้ง 4 แล้วตัดสายตามเงื่อนไขให้ถูกต้องก่อนหมดเวลา ฝึกคิดเลขเร็ว สมการ เศษส่วน ร้อยละ และการประมาณค่า เหมาะสำหรับนักเรียน ป.3–ป.6</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="เกมถอดรหัสบอมบ์ตัวเลข"><MathBombGame /><p className="mx-auto mt-3 text-center text-xs leading-6 text-ink-faint md:text-sm">อ่านภารกิจด้านบน แก้โจทย์ทั้ง 4 สาย แล้วเลือกตัดสายที่ตรงกับเงื่อนไข ระวังเวลาหมด!</p></section>
    <section className="border-t border-border px-4 py-6 md:px-8 md:py-9"><div className="grid gap-6 md:grid-cols-2 md:gap-10"><div><h2 className="m-0 mb-2 text-lg md:text-2xl">เด็กจะได้เรียนรู้อะไร</h2><p className="m-0 text-sm leading-7 text-ink-secondary">ฝึกคำนวณในใจ เปรียบเทียบคำตอบ แก้สมการ และเชื่อมเศษส่วนกับร้อยละภายใต้เวลาจำกัด พร้อมฝึกตรวจคำตอบและสื่อสารวิธีคิดกับเพื่อนในกลุ่ม</p></div><div><h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="m-0 text-sm leading-7 text-ink-secondary">ฉายเกมบนจอ แบ่งนักเรียนเป็นทีมและให้เวลาทดเลขก่อนส่งตัวแทนมาตัดสาย หรือให้ทั้งห้องโหวตคำตอบ ครูเลือกระดับโจทย์และเวลานับถอยหลังให้เหมาะกับชั้นเรียนได้</p></div></div><div className="mt-5 flex flex-wrap gap-2.5"><Link href="/media/mathematics" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🔢 เกมคณิตศาสตร์ทั้งหมด</Link><Link href="/timer" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">⏱ ตัวจับเวลา</Link><Link href="/group-maker" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">👥 สุ่มแบ่งกลุ่ม</Link></div></section>
  </main>;
}
