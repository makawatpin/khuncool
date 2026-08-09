import type { Metadata } from "next";
import Link from "next/link";
import MotionLab from "./MotionLab";

const URL = "https://www.khuncool.com/media/science/motion-lab";

export const metadata: Metadata = {
  title: "Motion Lab สื่อการสอนการเคลื่อนที่และแรง ม.2 | khuncool",
  description: "สื่อการสอนวิทยาศาสตร์ ม.2 แบบโต้ตอบ ทดลองตำแหน่ง ระยะทาง การกระจัด เวลา และอัตราเร็ว ฉายขึ้นจอหรือใช้บนมือถือได้ฟรี",
  keywords: ["สื่อการสอนวิทยาศาสตร์ ม.2", "การเคลื่อนที่และแรง", "ระยะทางและการกระจัด", "อัตราเร็ว", "Motion Lab"],
  alternates: { canonical: URL },
  openGraph: { type: "website", title: "Motion Lab การเคลื่อนที่และแรง ม.2", description: "ทดลองการเคลื่อนที่บนเส้นจำนวนและวิเคราะห์ระยะทาง การกระจัด เวลา และอัตราเร็ว", url: URL, locale: "th_TH", siteName: "Khuncool" },
  twitter: { card: "summary_large_image" },
};

const schema = { "@context": "https://schema.org", "@graph": [
  { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
    { "@type": "ListItem", position: 2, name: "สื่อวิทยาศาสตร์", item: "https://www.khuncool.com/media/science" },
    { "@type": "ListItem", position: 3, name: "Motion Lab", item: URL },
  ]},
  { "@type": "LearningResource", name: "Motion Lab การเคลื่อนที่และแรง", url: URL, inLanguage: "th-TH", educationalLevel: "มัธยมศึกษาปีที่ 2", learningResourceType: "Interactive simulation", teaches: ["ตำแหน่ง", "ระยะทาง", "การกระจัด", "เวลา", "อัตราเร็ว"], isAccessibleForFree: true, author: { "@type": "Organization", name: "Khuncool" } },
]};

export default function Page() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/science">สื่อวิทยาศาสตร์</Link><span>›</span><span aria-current="page">Motion Lab</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#E7F0FF] px-2.5 py-1 text-[10px] font-bold text-[#2868D8]">วิทยาศาสตร์ ม.2</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">สื่อโต้ตอบ</span></div><h1 className="mb-1.5 text-[24px] leading-[1.3] md:text-[30px]">Motion Lab การเคลื่อนที่และแรง 🏎️</h1><p className="m-0 max-w-[86ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">ทดลองการเคลื่อนที่บนเส้นจำนวน เปรียบเทียบตำแหน่ง ระยะทาง การกระจัด เวลา และอัตราเร็ว เหมาะสำหรับฉายอธิบายหน้าชั้นเรียน ม.2</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10"><MotionLab/><p className="mx-auto mt-7 max-w-[72ch] text-center text-xs leading-6 text-ink-faint md:mt-9 md:text-sm">ให้ผู้เรียนทำนายผลก่อนปล่อยรถ แล้วอภิปรายว่าเหตุใดระยะทางกับขนาดการกระจัดจึงมีค่าไม่เท่ากัน</p></section>
    <section className="grid gap-7 border-t border-border px-4 py-7 md:grid-cols-2 md:px-8 md:py-10"><div><h2 className="mb-2 text-xl md:text-2xl">เนื้อหาที่ครอบคลุม</h2><p className="text-sm leading-7 text-ink-secondary">ตำแหน่ง ระยะทาง การกระจัด เวลา อัตราเร็วเฉลี่ย และการอ่านค่าจากเส้นจำนวน พร้อมสถานการณ์ที่มีการย้อนทิศ</p></div><div><h2 className="mb-2 text-xl md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="text-sm leading-7 text-ink-secondary">ฉายบนจอ ให้นักเรียนทำนายค่าก่อนทดลอง เปลี่ยนเส้นทางและอัตราเร็ว แล้วเปรียบเทียบผล ครูสามารถปิดท้ายด้วยคำถามเช็กความเข้าใจ 3 ข้อ</p></div></section>
  </main>;
}
