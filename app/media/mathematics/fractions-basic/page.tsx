import type { Metadata } from "next";
import Link from "next/link";
import FractionsApp from "./FractionsApp";

const PAGE_URL = "https://www.khuncool.com/media/mathematics/fractions-basic";
const TITLE = "รู้จักเศษส่วน สื่อการสอนคณิตศาสตร์ ป.2-3 | khuncool";
const DESCRIPTION = "สื่อการสอนเศษส่วน ป.2-3 เริ่มจากการแบ่งเท่า ๆ กัน อ่านและเขียนเศษส่วนจากภาพ พร้อมเกมฝึก 12 ข้อและคำถามหน้าชั้น 8 ข้อ ใช้ฟรีบนจอห้องเรียน มือถือ และแท็บเล็ต";

// หน้าปก public/assets/game-covers/fractions-basic.webp ยังไม่มี — Task 10 จะเพิ่มให้
// จึงยังไม่ใส่ images/openGraph/twitter และ image ของ LearningResource ในตอนนี้

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["สื่อการสอนเศษส่วน", "เศษส่วน ป.2", "เศษส่วน ป.3", "เกมเศษส่วน", "ตัวเศษ ตัวส่วน", "สื่อคณิตศาสตร์ประถม"],
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: "khuncool", locale: "th_TH" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
      { "@type": "ListItem", position: 2, name: "สื่อคณิตศาสตร์", item: "https://www.khuncool.com/media/mathematics" },
      { "@type": "ListItem", position: 3, name: "รู้จักเศษส่วน", item: PAGE_URL },
    ] },
    { "@type": "LearningResource", name: "รู้จักเศษส่วน", url: PAGE_URL, inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 2–3", learningResourceType: "Interactive educational game", teaches: ["การแบ่งเท่า ๆ กัน", "การอ่านและเขียนเศษส่วนจากภาพ", "ความหมายของตัวเศษและตัวส่วน"], isAccessibleForFree: true },
  ],
};

export default function FractionsBasicPage() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/mathematics">สื่อคณิตศาสตร์</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">รู้จักเศษส่วน</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#FFF0E4] px-2.5 py-1 text-[10px] font-bold text-[#C85C12]">คณิตศาสตร์ ป.2–3</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">ใช้ฟรี ไม่ต้องสมัคร</span></div><h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">รู้จักเศษส่วน 🍕</h1><p className="m-0 max-w-[86ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">เริ่มจากคำถามว่าอะไรคือการแบ่งเท่า ๆ กัน แล้วค่อยอ่านและเขียนเศษส่วนจากภาพ ปิดท้ายด้วยเกมฝึกและคำถามหน้าชั้น ออกแบบให้ครูฉายขึ้นจอและคุมจังหวะเองได้ทั้งคาบ</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="สื่อรู้จักเศษส่วน"><FractionsApp /><p className="mx-auto mt-3 text-center text-xs leading-6 text-ink-faint md:text-sm">ไม่มีการจับเวลาและไม่เก็บคะแนนรายคน เด็กตอบผิดลองใหม่ได้ทันที</p></section>
    <section className="border-t border-border px-4 py-6 md:px-8 md:py-9"><div className="grid gap-6 md:grid-cols-2 md:gap-10"><div><h2 className="m-0 mb-2 text-lg md:text-2xl">เด็กจะได้เรียนรู้อะไร</h2><p className="m-0 text-sm leading-7 text-ink-secondary">แยกได้ว่าอะไรคือการแบ่งเท่า ๆ กันและอะไรไม่ใช่ อ่านและเขียนเศษส่วนอย่างง่ายจากภาพ และบอกได้ว่าตัวเศษกับตัวส่วนบอกอะไร</p></div><div><h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="m-0 text-sm leading-7 text-ink-secondary">เดินบทเรียน 5 สไลด์พร้อมชวนเด็กอธิบายภาพที่เห็น จากนั้นเล่นเกมฝึกทั้งห้องโดยให้เด็กออกมากดที่จอ ปิดคาบด้วยคำถามหน้าชั้น 8 ข้อ</p></div></div></section>
  </main>;
}
