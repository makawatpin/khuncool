import type { Metadata } from "next";
import Link from "next/link";
import MathAdventureApp from "./MathAdventureApp";

const PAGE_URL = "https://www.khuncool.com/media/mathematics/math-adventure";
const TITLE = "Math Adventure ภารกิจบวกลบแสนสนุก ป.1 | khuncool";
const DESCRIPTION = "สื่อการสอนคณิตศาสตร์ ป.1 ฝึกบวกและลบจำนวนนับไม่เกิน 20 ผ่านภาพ เส้นจำนวน เกมรถไฟ และแบบทดสอบ เล่นฟรีบนมือถือ แท็บเล็ต และจอห้องเรียน";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["เกมคณิตศาสตร์ ป.1", "สื่อการสอนบวก ลบ", "การบวกไม่เกิน 20", "การลบไม่เกิน 20", "เส้นจำนวน", "เกมบวกลบ"],
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
      { "@type": "ListItem", position: 3, name: "Math Adventure", item: PAGE_URL },
    ] },
    { "@type": "LearningResource", name: "Math Adventure: ภารกิจบวกลบแสนสนุก", url: PAGE_URL, inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 1", learningResourceType: "Interactive educational game", teaches: ["การบวกจำนวนนับไม่เกิน 20", "การลบจำนวนนับไม่เกิน 20", "เส้นจำนวน 0–20"], isAccessibleForFree: true },
  ],
};

export default function MathAdventurePage() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/mathematics">สื่อคณิตศาสตร์</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">Math Adventure</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#FFF0E4] px-2.5 py-1 text-[10px] font-bold text-[#C85C12]">คณิตศาสตร์ ป.1</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">ใช้ฟรี ไม่ต้องสมัคร</span></div><h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">Math Adventure: ภารกิจบวกลบแสนสนุก 🚂</h1><p className="m-0 max-w-[86ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">เรียนรู้การบวกและการลบจำนวนนับไม่เกิน 20 ด้วยภาพ เส้นจำนวน แบบฝึก เกมรถไฟเก็บดาว และแบบทดสอบหลังเรียน ใช้สอนได้ทั้งห้องบนมือถือ แท็บเล็ต คอมพิวเตอร์ และโปรเจกเตอร์</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="เกม Math Adventure"><MathAdventureApp /><p className="mx-auto mt-3 text-center text-xs leading-6 text-ink-faint md:text-sm">ครูเลือกโหมดและระดับจำนวนได้จากหน้าตั้งค่า เด็กตอบผิดลองใหม่ได้โดยไม่ถูกหักคะแนน</p></section>
    <section className="border-t border-border px-4 py-6 md:px-8 md:py-9"><div className="grid gap-6 md:grid-cols-2 md:gap-10"><div><h2 className="m-0 mb-2 text-lg md:text-2xl">เด็กจะได้เรียนรู้อะไร</h2><p className="m-0 text-sm leading-7 text-ink-secondary">เข้าใจว่าการบวกคือการรวมและการลบคือการเอาออก เชื่อมภาพกับประโยคสัญลักษณ์ ใช้เส้นจำนวน 0–20 และแก้โจทย์ปัญหาสั้น ๆ ที่ใกล้ตัว</p></div><div><h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="m-0 text-sm leading-7 text-ink-secondary">เริ่มจากโหมดเรียนรู้แล้วชวนเด็กอธิบายสิ่งที่เห็น จากนั้นฝึกทั้งห้องหรือแบ่ง 2–4 ทีมเล่นรถไฟเก็บดาว ก่อนปิดบทเรียนด้วยแบบทดสอบ 10 ข้อ</p></div></div></section>
  </main>;
}
