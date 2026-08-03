import type { Metadata } from "next";
import Link from "next/link";
import LawDailyEmbed from "./LawDailyEmbed";

const pageUrl = "https://www.khuncool.com/media/social-studies/law-daily";

export const metadata: Metadata = {
  title: "เกมกฎหมายในชีวิตประจำวัน หน้าที่พลเมือง เล่นฟรี | khuncool",
  description: "เกมคดีเด็ด เมืองสันติสุข สื่อการสอนสังคมศึกษาเรื่องกฎหมายในชีวิตประจำวัน หมุนวงล้อ วิเคราะห์คดี ตอบคำถามเป็นทีม พร้อมระบบคะแนนและเฉลย เหมาะสำหรับ ป.4–ม.3",
  keywords: ["เกมกฎหมาย", "กฎหมายในชีวิตประจำวัน", "เกมหน้าที่พลเมือง", "สื่อการสอนสังคมศึกษา", "เกมตอบคำถามในห้องเรียน", "กฎหมายจราจรทางบก"],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    title: "คดีเด็ด... เมืองสันติสุข | เกมกฎหมายในชีวิตประจำวัน",
    description: "หมุนวงล้อ เปิดสำนวน วิเคราะห์เหตุการณ์ และเรียนรู้กฎหมายผ่านเกมโชว์ที่เล่นพร้อมกันได้ทั้งห้อง",
    url: pageUrl,
    locale: "th_TH",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "สื่อสังคมศึกษา", item: "https://www.khuncool.com/media/social-studies" },
        { "@type": "ListItem", position: 3, name: "คดีเด็ด เมืองสันติสุข", item: pageUrl },
      ],
    },
    {
      "@type": "EducationalApplication",
      name: "คดีเด็ด... เมืองสันติสุข",
      url: pageUrl,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th-TH",
      isAccessibleForFree: true,
      educationalLevel: "ป.4–ม.3",
      learningResourceType: "Interactive game",
      teaches: ["กฎหมายในชีวิตประจำวัน", "หน้าที่พลเมือง", "กฎหมายจราจรทางบก", "การตัดสินใจอย่างรับผิดชอบ"],
      description: "เกมสังคมศึกษาแบบ Interactive Presentation สำหรับเรียนรู้กฎหมายในชีวิตประจำวันผ่านการวิเคราะห์คดีและการแข่งขันเป็นทีม",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
  ],
};

export default function LawDailyPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/">หน้าแรก</Link><span>›</span>
          <Link href="/media/social-studies">สื่อสังคมศึกษา</Link><span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">คดีเด็ด เมืองสันติสุข</span>
        </div>
      </nav>

      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-pill bg-[#FFF3D6] px-2.5 py-1 text-[11px] font-semibold text-[#8A5A08]">หน้าที่พลเมือง</span>
          <span className="rounded-pill bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success">เล่นฟรี</span>
          <span className="text-[11.5px] text-ink-faint">ป.4–ม.3 · 30–40 นาที</span>
        </div>
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:text-[28px]">คดีเด็ด... เมืองสันติสุข ⚖️</h1>
        <p className="m-0 max-w-[76ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px]">
          เกมกฎหมายในชีวิตประจำวันสำหรับเล่นพร้อมกันทั้งห้อง หมุนวงล้อเปิดสำนวน วิเคราะห์หลักฐาน ตอบคำถามเป็นทีม และฟังคำพิพากษาที่อธิบายกฎหมายด้วยภาษาที่เข้าใจง่าย
        </p>
      </div>

      <div className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10"><LawDailyEmbed /></div>

      <section className="border-t border-border px-4 py-6 md:grid md:grid-cols-[1.25fr_.75fr] md:gap-10 md:px-8 md:py-9">
        <div>
          <h2 className="m-0 mb-2 text-lg md:text-2xl">เรียนรู้อะไรจากเกมนี้</h2>
          <p className="m-0 mb-4 text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px]">
            นักเรียนฝึกแยกการกระทำแต่ละอย่างในเหตุการณ์เดียวกัน เข้าใจเหตุผลของกฎหมาย และเลือกวิธีปฏิบัติที่รับผิดชอบต่อทั้งตนเองและผู้อื่น ครูควบคุมคะแนน 4 ทีมและใช้คำอธิบายหลังเฉลยเพื่อชวนอภิปรายต่อได้
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[['🔎','จับประเด็น','สังเกตหลักฐานและแยกฐานความผิด'],['⚖️','เข้าใจกฎหมาย','เชื่อมกติกากับเหตุผลด้านความปลอดภัย'],['🤝','ใช้ในชีวิตจริง','ตัดสินใจอย่างรับผิดชอบในฐานะพลเมือง']].map(([icon,title,text]) => <div key={title} className="rounded-2xl border border-border bg-surface-light p-3.5"><div className="mb-1 text-xl">{icon}</div><h3 className="m-0 mb-1 text-sm">{title}</h3><p className="m-0 text-xs leading-[1.55] text-ink-secondary">{text}</p></div>)}
          </div>
        </div>
        <aside className="mt-6 rounded-2xl border border-[#F1DFB6] bg-[#FFFAED] p-4 md:mt-0">
          <h2 className="m-0 mb-2 text-base">วิธีใช้หน้าชั้นเรียน</h2>
          <ol className="m-0 space-y-2 pl-5 text-[13px] leading-[1.6] text-ink-secondary">
            <li>แบ่งนักเรียนเป็น 4 ทีม</li><li>หมุนวงล้อและอ่านคดีพร้อมกัน</li><li>ให้แต่ละทีมชูคำตอบ A–D</li><li>ครูกดเฉลยและเพิ่มคะแนน</li>
          </ol>
        </aside>
      </section>

      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:text-2xl">สื่อการสอนที่เกี่ยวข้อง</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/media/social-studies" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🗺️ สื่อสังคมศึกษาทั้งหมด</Link>
          <Link href="/media/social-studies/asean-matching" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🌏 เกมจับคู่ภาพอาเซียน</Link>
          <Link href="/group-maker" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">👥 สุ่มแบ่งกลุ่ม</Link>
        </div>
      </div>
    </main>
  );
}
