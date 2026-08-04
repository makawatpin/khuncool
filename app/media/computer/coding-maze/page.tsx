import type { Metadata } from "next";
import Link from "next/link";
import CodingMazeGame from "./CodingMazeGame";

const PAGE_URL = "https://www.khuncool.com/media/computer/coding-maze";

export const metadata: Metadata = {
  title: "เกมเขาวงกตโค้ดดิ้ง ฝึกเรียงลำดับคำสั่งสำหรับเด็ก | khuncool",
  description:
    "เกมเขาวงกตโค้ดดิ้งสำหรับนักเรียนประถม ฝึกคิดเป็นขั้นตอนด้วยคำสั่งเดินหน้า เลี้ยวซ้าย และเลี้ยวขวา เล่นฟรีบน khuncool",
  keywords: [
    "เกมเขาวงกตโค้ดดิ้ง",
    "เกม Coding สำหรับเด็ก",
    "สื่อวิทยาการคำนวณ",
    "เกมฝึกอัลกอริทึม",
    "เกมเรียงลำดับคำสั่ง",
    "สื่อการสอนคอมพิวเตอร์ ประถม",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    title: "เกมเขาวงกตโค้ดดิ้ง | khuncool",
    description: "วางลำดับคำสั่งเพื่อพาหุ่นยนต์ผ่านเขาวงกตไปหา CPU ฝึกคิดเป็นขั้นตอนและตรวจแก้คำสั่ง",
    url: PAGE_URL,
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
        { "@type": "ListItem", position: 2, name: "สื่อคอมพิวเตอร์", item: "https://www.khuncool.com/media/computer" },
        { "@type": "ListItem", position: 3, name: "เขาวงกตโค้ดดิ้ง", item: PAGE_URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "เกมเขาวงกตโค้ดดิ้ง",
      url: PAGE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th-TH",
      educationalLevel: "ประถมศึกษาปีที่ 2–6",
      description: "เกมฝึกออกแบบลำดับคำสั่งเพื่อพาหุ่นยนต์ผ่านเขาวงกตไปยังเป้าหมาย",
      learningResourceType: "Educational game",
      teaches: ["การคิดเชิงคำนวณ", "อัลกอริทึม", "การเรียงลำดับคำสั่ง", "การตรวจแก้ข้อผิดพลาด"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
  ],
};

/* Game UI lives in CodingMazeGame so it can manage commands and animation client-side. */
function GamePreview() {
  return <CodingMazeGame />;
}

export default function CodingMazePage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/computer">สื่อคอมพิวเตอร์</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">เขาวงกตโค้ดดิ้ง</span>
        </div>
      </nav>

      <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#EEEEFD] px-2.5 py-1 text-[10px] font-bold text-primary">CODING</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">เล่นได้แล้ว</span></div>
        <h1 className="m-0 mb-1.5 text-[24px] leading-[1.32] md:text-[30px]">เขาวงกตโค้ดดิ้ง: ภารกิจพิชิต CPU 🤖</h1>
        <p className="m-0 max-w-[76ch] text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px]">เรียงคำสั่งเดินหน้า เลี้ยวซ้าย และเลี้ยวขวา เพื่อพาหุ่นยนต์ผ่านเขาวงกตไปหา CPU ฝึกคิดเป็นขั้นตอน วางแผนก่อนลงมือ และเรียนรู้จากการตรวจแก้คำสั่ง เหมาะสำหรับนักเรียน ป.2–ป.6</p>
      </header>

      <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="ตัวอย่างหน้าจอเกมเขาวงกตโค้ดดิ้ง">
        <GamePreview />
        <p className="mx-auto mt-3 max-w-none text-center text-xs leading-6 text-ink-faint md:whitespace-nowrap md:text-sm">วางคำสั่งแล้วกด RUN เพื่อดูหุ่นยนต์เดินทีละขั้น หากชนกำแพงให้กดล้างและลอง Debug เส้นทางใหม่</p>
      </section>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div><h2 className="m-0 mb-2 text-lg md:text-2xl">เด็กจะได้เรียนรู้อะไร</h2><p className="m-0 text-sm leading-7 text-ink-secondary">เข้าใจว่าโปรแกรมทำงานตามคำสั่งทีละขั้น ฝึกแปลงเส้นทางเป็นอัลกอริทึม คาดการณ์ผลลัพธ์ และย้อนตรวจหาจุดที่ผิดเมื่อหุ่นยนต์ไปไม่ถึงเป้าหมาย ซึ่งเป็นพื้นฐานของการเขียนโปรแกรมและการแก้ปัญหาอย่างเป็นระบบ</p></div>
          <div><h2 className="m-0 mb-2 text-lg md:text-2xl">แนวทางใช้ในห้องเรียน</h2><p className="m-0 text-sm leading-7 text-ink-secondary">ครูฉายเกมบนจอแล้วให้นักเรียนช่วยกันออกแบบชุดคำสั่งก่อนกด Run หรือแบ่งเป็นทีมแข่งกันหาเส้นทางที่ใช้คำสั่งน้อยที่สุด จากนั้นชวนอธิบายว่าคำสั่งใดทำให้เส้นทางสำเร็จหรือผิดพลาด</p></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link href="/media/computer" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">💻 สื่อคอมพิวเตอร์ทั้งหมด</Link>
          <Link href="/media/computer/digital-sort" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🖥️ ภารกิจคัดแยกโลกดิจิทัล</Link>
          <Link href="/group-scoreboard" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">🏆 กระดานคะแนน</Link>
          <Link href="/group-maker" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline">👥 สุ่มแบ่งกลุ่ม</Link>
        </div>
      </section>
    </main>
  );
}
