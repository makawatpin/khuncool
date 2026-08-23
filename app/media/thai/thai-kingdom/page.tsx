import type { Metadata } from "next";
import Link from "next/link";
import ThaiKingdomApp from "./ThaiKingdomApp";

const PAGE_URL = "https://www.khuncool.com/media/thai/thai-kingdom";
const TITLE = "อาณาจักรภาษาไทย อ่านออก เขียนได้ เกมภาษาไทย ป.1 | khuncool";
const DESCRIPTION = "สื่อการสอนภาษาไทย ป.1 เรียนพยัญชนะ สระ “า” สระ “◌ี” สระ “◌ู” และการประสมคำไม่มีตัวสะกด ผ่านภาพ เสียง เกมรถไฟ และแบบทดสอบ";

const OG_IMAGE = { url: "https://www.khuncool.com/assets/game-covers/thai-kingdom.webp", width: 1200, height: 675, alt: "เกมอาณาจักรภาษาไทย อ่านออก เขียนได้ สื่อการสอนภาษาไทย ป.1" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["เกมภาษาไทย ป.1", "สื่อการสอนภาษาไทย", "สระอา", "สระอี", "สระอู", "ประสมคำ", "ฝึกอ่าน ป.1"],
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: "khuncool", locale: "th_TH", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE.url] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
      { "@type": "ListItem", position: 2, name: "สื่อภาษาไทย", item: "https://www.khuncool.com/media/thai" },
      { "@type": "ListItem", position: 3, name: "อาณาจักรภาษาไทย", item: PAGE_URL },
    ] },
    { "@type": "LearningResource", name: "อาณาจักรภาษาไทย: อ่านออก เขียนได้", url: PAGE_URL, image: OG_IMAGE.url, inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 1", learningResourceType: "Interactive educational game", teaches: ["พยัญชนะไทย", "สระ “า” สระ “◌ี” สระ “◌ู”", "การประสมคำไม่มีตัวสะกด"], isAccessibleForFree: true },
  ],
};

export default function ThaiKingdomPage() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/thai">สื่อภาษาไทย</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">อาณาจักรภาษาไทย</span></div></nav><header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#FDE8F3] px-2.5 py-1 text-[10px] font-bold text-[#B4477C]">ภาษาไทย ป.1</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">ใช้ฟรี ไม่ต้องสมัคร</span></div><h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">อาณาจักรภาษาไทย: อ่านออก เขียนได้ 📖</h1><p className="m-0 max-w-[88ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">เรียนรู้พยัญชนะ สระ “า” สระ “◌ี” สระ “◌ู” และการประสมคำง่าย ๆ ผ่านภาพ เสียง โรงงานสร้างคำ รถไฟเก็บคำ และแบบทดสอบ ใช้ได้ทั้งมือถือ แท็บเล็ต และจอห้องเรียน</p></header><section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="เกมอาณาจักรภาษาไทย"><ThaiKingdomApp /><p className="mx-auto mt-3 text-center text-xs leading-6 text-ink-faint md:text-sm">คำศัพท์ทุกคำมาจากรายการที่ตรวจสอบแล้ว เด็กตอบผิดลองใหม่ได้โดยไม่หักดาว</p></section><section className="border-t border-border px-4 py-6 md:px-8 md:py-9"><div className="grid gap-6 md:grid-cols-2 md:gap-10"><div><h2 className="m-0 mb-2 text-lg md:text-2xl">เด็กจะได้เรียนรู้อะไร</h2><p className="m-0 text-sm leading-7 text-ink-secondary">รู้จักพยัญชนะและตำแหน่งสระ เชื่อมเสียงกับภาพ และนำส่วนประกอบมาประสมเป็นคำที่ไม่มีตัวสะกด</p></div><div><h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="m-0 text-sm leading-7 text-ink-secondary">เริ่มจากโหมดเรียนรู้ ชวนเด็กออกเสียงพร้อมกัน แล้วฝึกทั้งห้องหรือแบ่งทีมเล่นรถไฟ ก่อนทำแบบทดสอบ 10 ข้อ</p></div></div></section></main>;
}
