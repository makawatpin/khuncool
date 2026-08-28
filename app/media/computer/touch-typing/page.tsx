import type { Metadata } from "next";
import Link from "next/link";
import TouchTypingGame from "./TouchTypingGame";

const PAGE_URL = "https://www.khuncool.com/media/computer/touch-typing";

export const metadata: Metadata = {
  title: "เกมฝึกพิมพ์สัมผัสภาษาไทย ฝึกวางนิ้วบนแป้นเกษมณี | khuncool",
  description: "เกมฝึกตำแหน่งนิ้วบนแป้นพิมพ์ไทยเกษมณีสำหรับนักเรียนประถม มีบทเรียนทีละกลุ่มปุ่ม คีย์บอร์ด 2D/3D และโหมดสอนหน้าชั้น",
  keywords: ["เกมฝึกพิมพ์ภาษาไทย", "พิมพ์สัมผัส", "แป้นพิมพ์เกษมณี", "ฝึกวางนิ้ว", "สื่อการสอนคอมพิวเตอร์"],
  alternates: { canonical: PAGE_URL },
  openGraph: { type: "website", title: "วางนิ้วมหัศจรรย์: เกมฝึกพิมพ์สัมผัสภาษาไทย", description: "ฝึกตำแหน่งนิ้วบนแป้นไทยเกษมณีทีละบท พร้อมคีย์บอร์ด 2D และ 3D", url: PAGE_URL, locale: "th_TH" },
  twitter: { card: "summary_large_image" },
};

const faqs = [
  { q: "เกมนี้ฝึกอะไร", a: "ฝึกจำตำแหน่งปุ่มทางกายภาพและใช้นิ้วที่รับผิดชอบแต่ละปุ่มบนแป้นไทยเกษมณี ต่างจากเกมพิมพ์คำที่เน้นความเร็วหรือคำศัพท์" },
  { q: "ต้องตั้งภาษาคีย์บอร์ดเป็นไทยก่อนหรือไม่", a: "ไม่ต้อง เกมอ่านตำแหน่งปุ่มจากคีย์บอร์ดจริงและวาดตัวอักษรไทยบนจอเอง จึงฝึกต่อได้แม้ระบบปฏิบัติการยังอยู่ภาษาอังกฤษ" },
  { q: "ใช้บนมือถือได้ไหม", a: "มือถือใช้โหมดดูและสาธิตสีประจำนิ้วได้ แต่การฝึกพิมพ์จริงควรต่อคีย์บอร์ดภายนอกหรือใช้คอมพิวเตอร์" },
  { q: "คีย์บอร์ด 3D ใช้ได้กับทุกเครื่องไหม", a: "เกมเลือก 2D ให้อัตโนมัติเมื่อเวทีเป็นแนวตั้ง แนวนอนที่เตี้ย ลดการเคลื่อนไหว หรือเครื่องไม่รองรับ WebGL และครูสลับมุมมองเองได้" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
      { "@type": "ListItem", position: 2, name: "สื่อคอมพิวเตอร์", item: "https://www.khuncool.com/media/computer" },
      { "@type": "ListItem", position: 3, name: "วางนิ้วมหัศจรรย์", item: PAGE_URL },
    ] },
    { "@type": "LearningResource", name: "วางนิ้วมหัศจรรย์: เกมฝึกพิมพ์สัมผัสภาษาไทย", url: PAGE_URL, inLanguage: "th-TH", isAccessibleForFree: true, educationalLevel: "ประถมศึกษาปีที่ 3–6", learningResourceType: "Educational game", teaches: ["การพิมพ์สัมผัสภาษาไทย", "ตำแหน่งนิ้วบนแป้นเกษมณี", "ความแม่นยำในการพิมพ์"], audience: { "@type": "EducationalAudience", educationalRole: ["student", "teacher"] }, author: { "@type": "Person", name: "คุณคูล", url: "https://www.khuncool.com/about" }, dateModified: "2026-08-28" },
    { "@type": "FAQPage", mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ],
};

export default function TouchTypingPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/computer">สื่อคอมพิวเตอร์</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">วางนิ้วมหัศจรรย์</span></div></nav>
      <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#D0FBEF] px-2.5 py-1 text-[10px] font-bold text-[#087B6B]">TOUCH TYPING</span><span className="rounded-full bg-[#FFF0E4] px-2.5 py-1 text-[10px] font-bold text-[#9A5312]">ภาษาไทยเกษมณี</span></div>
        <h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">วางนิ้วมหัศจรรย์: เกมฝึกพิมพ์สัมผัสภาษาไทย ⌨️</h1>
        <p className="m-0 max-w-[80ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">ฝึกจำตำแหน่งแป้นไทยเกษมณีและใช้นิ้วให้ถูกทีละกลุ่มปุ่ม มีทั้งโหมดฝึกรายคนและโหมดสอนหน้าชั้น พร้อมคีย์บอร์ด 2D/3D ที่ใช้สีประจำทั้ง 8 นิ้ว</p>
      </header>
      <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="เกมฝึกพิมพ์สัมผัสภาษาไทย">
        <TouchTypingGame />
        <p className="mx-auto mt-3 max-w-[78ch] text-center text-xs leading-6 text-ink-faint">เกมนี้ฝึกตำแหน่งนิ้วจากปุ่มทางกายภาพ จึงไม่ต้องสลับภาษาของระบบก่อนเล่น การพิมพ์ภาษาไทยในโปรแกรมอื่นยังต้องตั้งค่าและเลือกภาษาไทยตามปกติ</p>
      </section>
      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10"><div><h2 className="m-0 mb-2 text-lg md:text-2xl">เป้าหมายการเรียนรู้</h2><p className="m-0 text-sm leading-7 text-ink-secondary">วางนิ้วที่แถวเหย้า จำโซนรับผิดชอบของแต่ละนิ้ว และเพิ่มปุ่มจากแถวเหย้าไปแถวบน แถวล่าง ตัวเลข และ Shift โดยให้ความแม่นยำมาก่อนความเร็ว</p></div><div><h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="m-0 text-sm leading-7 text-ink-secondary">ครูฉายโหมดสอนหน้าชั้นเพื่อแนะนำสีประจำนิ้ว แล้วให้นักเรียนฝึกรายคนบทละ 5–10 นาที บทแรกตั้งใจใช้ลำดับปุ่มสั้นแทนคำจริง เพื่อสร้างท่าวางนิ้วที่ถูกก่อน</p></div></div>
        <div className="mt-6 rounded-2xl border border-[#DDE3F4] bg-[#F7F9FF] p-4 md:p-5"><div className="mb-1 text-xs font-bold tracking-[.08em] text-primary">ออกแบบเพื่อการเรียนรู้</div><h2 className="m-0 mb-2 text-base md:text-lg">แยกการฝึกตำแหน่งนิ้วออกจากการฝึกความเร็ว</h2><p className="m-0 text-[13px] leading-6 text-ink-secondary">เกณฑ์ผ่านเน้นความแม่นยำ 90% และแสดง WPM เป็นข้อมูลประกอบ เด็กจึงค่อย ๆ สร้างความจำของกล้ามเนื้อโดยไม่ถูกเร่งจนท้อ · ตรวจทานล่าสุด 28 ส.ค. 2569</p></div>
      </section>
      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="touch-typing-faq"><h2 id="touch-typing-faq" className="m-0 mb-4 text-lg md:text-2xl">คำถามเกี่ยวกับเกม</h2><div className="grid gap-3 md:grid-cols-2">{faqs.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-white p-4"><summary className="cursor-pointer font-semibold text-ink">{item.q}</summary><p className="mb-0 mt-2 text-[13px] leading-6 text-ink-secondary">{item.a}</p></details>)}</div><div className="mt-6 flex flex-wrap gap-2.5"><Link href="/media/computer" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">💻 สื่อคอมพิวเตอร์ทั้งหมด</Link><Link href="/media/computer/typing-defense" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">⌨️ พิมพ์ดีดปราบไวรัส</Link></div></section>
    </main>
  );
}

