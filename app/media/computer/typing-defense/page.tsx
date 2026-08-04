import type { Metadata } from "next";
import Link from "next/link";
import TypingDefenseGame from "./TypingDefenseGame";

const PAGE_URL = "https://www.khuncool.com/media/computer/typing-defense";

export const metadata: Metadata = {
  title: "พิมพ์ดีดปราบไวรัส เกมฝึกพิมพ์คำศัพท์คอมพิวเตอร์ | khuncool",
  description: "เกมพิมพ์ดีดปราบไวรัสสำหรับนักเรียนประถม ฝึกพิมพ์ภาษาอังกฤษผ่านคำศัพท์คอมพิวเตอร์ เช่น CPU, RAM, Router, Malware และ Firewall",
  keywords: ["เกมฝึกพิมพ์", "พิมพ์ดีดปราบไวรัส", "เกมพิมพ์ดีดสำหรับเด็ก", "คำศัพท์คอมพิวเตอร์ภาษาอังกฤษ", "สื่อการสอนคอมพิวเตอร์"],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    title: "พิมพ์ดีดปราบไวรัส: ศึกป้องกันฐานข้อมูล | khuncool",
    description: "เกมฝึกพิมพ์คำศัพท์คอมพิวเตอร์ภาษาอังกฤษสำหรับนักเรียน ป.3–ป.6 พร้อมคะแนน คอมโบ และภารกิจปกป้องฐานข้อมูล",
    url: PAGE_URL,
    locale: "th_TH",
  },
  twitter: { card: "summary_large_image" },
};

const faqs = [
  { q: "เกมพิมพ์ดีดปราบไวรัสเล่นอย่างไร", a: "พิมพ์คำศัพท์คอมพิวเตอร์ภาษาอังกฤษที่กำลังตกลงมา แล้วกด Enter เพื่อทำลายไวรัสก่อนถึงฐานข้อมูล เลือกได้ทั้งโหมดฝึกพิมพ์และโหมดตะลุยด่าน" },
  { q: "เกมนี้เหมาะกับนักเรียนชั้นไหน", a: "วางแผนสำหรับนักเรียน ป.3–ป.6 โดยจะเริ่มจากคำสั้นที่คุ้นเคย แล้วเพิ่มคำยาวและความเร็วอย่างค่อยเป็นค่อยไป" },
  { q: "เด็กจะได้ฝึกคำศัพท์อะไรบ้าง", a: "เน้นคำศัพท์คอมพิวเตอร์และความปลอดภัยดิจิทัล เช่น CPU, RAM, ROUTER, HARDWARE, FIREWALL และ MALWARE พร้อมความหมายภาษาไทย" },
  { q: "เกมพิมพ์ดีดปราบไวรัสใช้ฟรีไหม", a: "ใช้ฟรีผ่านเว็บเบราว์เซอร์โดยไม่ต้องติดตั้งโปรแกรม รองรับทั้งคอมพิวเตอร์ มือถือ และการเปิดเต็มจอ" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "สื่อคอมพิวเตอร์", item: "https://www.khuncool.com/media/computer" },
        { "@type": "ListItem", position: 3, name: "พิมพ์ดีดปราบไวรัส", item: PAGE_URL },
      ],
    },
    {
      "@type": "LearningResource",
      name: "พิมพ์ดีดปราบไวรัส: ศึกป้องกันฐานข้อมูล",
      url: PAGE_URL,
      inLanguage: "th-TH",
      isAccessibleForFree: true,
      educationalLevel: "ประถมศึกษาปีที่ 3–6",
      learningResourceType: "Educational game",
      teaches: ["การพิมพ์สัมผัส", "คำศัพท์คอมพิวเตอร์ภาษาอังกฤษ", "ความปลอดภัยดิจิทัล"],
      audience: { "@type": "EducationalAudience", educationalRole: ["student", "teacher"] },
      author: { "@type": "Person", name: "ครูคูล", url: "https://www.khuncool.com/about" },
      dateModified: "2026-08-04",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ],
};

export default function TypingDefensePage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/computer">สื่อคอมพิวเตอร์</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">พิมพ์ดีดปราบไวรัส</span></div></nav>

      <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#D0FBEF] px-2.5 py-1 text-[10px] font-bold text-[#087B6B]">TYPING</span><span className="rounded-full bg-[#E5E2FF] px-2.5 py-1 text-[10px] font-bold text-[#5541B9]">เล่นได้แล้ว</span></div>
        <h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">พิมพ์ดีดปราบไวรัส: ศึกป้องกันฐานข้อมูล ⌨️</h1>
        <p className="m-0 max-w-[76ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">เกมฝึกพิมพ์คำศัพท์คอมพิวเตอร์ภาษาอังกฤษสำหรับนักเรียน ป.3–ป.6 เตรียมฝึกความแม่นยำ ความเร็ว และความเข้าใจคำศัพท์ เช่น CPU, RAM, Router, Malware และ Firewall ผ่านภารกิจป้องกันฐานข้อมูล</p>
      </header>

      <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="เกมพิมพ์ดีดปราบไวรัส">
        <TypingDefenseGame />
        <p className="mx-auto mt-3 max-w-[72ch] text-center text-xs leading-6 text-ink-faint">พิมพ์คำศัพท์ที่กำลังตกลงมา แล้วกด Enter เพื่อปกป้องฐานข้อมูลให้ครบ 60 วินาที รองรับปุ่มเต็มจอทั้งคอมพิวเตอร์และมือถือ</p>
      </section>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div><h2 className="m-0 mb-2 text-lg md:text-2xl">เป้าหมายการเรียนรู้</h2><p className="m-0 text-sm leading-7 text-ink-secondary">ฝึกหาตำแหน่งตัวอักษรบนแป้นพิมพ์ พิมพ์คำภาษาอังกฤษอย่างถูกต้อง และเชื่อมโยงคำศัพท์กับความหมายด้านส่วนประกอบคอมพิวเตอร์ เครือข่าย และความปลอดภัยดิจิทัล</p></div>
          <div><h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="m-0 text-sm leading-7 text-ink-secondary">วางแผนให้เล่นรายคนบนคอมพิวเตอร์ หรือฉายจอแล้วแบ่งทีมช่วยกันสะกดคำ ครูสามารถหยุดระหว่างรอบเพื่ออธิบายความหมายและยกตัวอย่างการใช้งานของแต่ละคำ</p></div>
        </div>
        <div className="mt-6 rounded-2xl border border-[#DDE3F4] bg-[#F7F9FF] p-4 md:p-5">
          <div className="mb-1 text-xs font-bold tracking-[.08em] text-primary">ความโปร่งใสของเนื้อหา</div><h2 className="m-0 mb-2 text-base md:text-lg">ออกแบบโดยครู พร้อมใช้ในชั้นเรียน</h2><p className="m-0 text-[13px] leading-6 text-ink-secondary">เกมนี้จัดทำโดยครูคูลสำหรับใช้เป็นสื่อระดับประถม ใช้คำศัพท์คอมพิวเตอร์และความปลอดภัยดิจิทัล 12 คำ มีรอบละ 60 วินาที พร้อมคะแนน คอมโบ และพลังป้องกันฐานข้อมูล · ตรวจทานล่าสุด 4 ส.ค. 2569</p>
        </div>
      </section>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="typing-faq"><h2 id="typing-faq" className="m-0 mb-4 text-lg md:text-2xl">คำถามเกี่ยวกับเกม</h2><div className="grid gap-3 md:grid-cols-2">{faqs.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-white p-4"><summary className="cursor-pointer font-semibold text-ink">{item.q}</summary><p className="mb-0 mt-2 text-[13px] leading-6 text-ink-secondary">{item.a}</p></details>)}</div>
        <div className="mt-6 flex flex-wrap gap-2.5"><Link href="/media/computer" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">💻 สื่อคอมพิวเตอร์ทั้งหมด</Link><Link href="/media/computer/digital-sort" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🖥️ ภารกิจคัดแยกโลกดิจิทัล</Link><Link href="/media/computer/coding-maze" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🤖 เขาวงกตโค้ดดิ้ง</Link></div>
      </section>
    </main>
  );
}
