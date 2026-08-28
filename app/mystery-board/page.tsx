import type { Metadata } from "next";
import Link from "next/link";
import MysteryBoardApp from "./MysteryBoardApp";

export const metadata: Metadata = {
  title: "กระดานป้ายปริศนา สุ่มเปิดป้ายตอบคำถาม ใช้ฟรี | khuncool",
  description:
    "กระดานป้ายปริศนาสำหรับห้องเรียน ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถาม มีแอนิเมชันและเสียงประกอบ ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
  keywords: [
    "กระดานป้ายปริศนา",
    "สุ่มเปิดป้าย",
    "เกมในห้องเรียน",
    "สุ่มคำถาม",
    "mystery box",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/mystery-board",
  },
  openGraph: {
    type: "website",
    title: "กระดานป้ายปริศนา สุ่มเปิดป้ายตอบคำถาม ใช้ฟรี | khuncool",
    description:
      "กระดานป้ายปริศนาสำหรับห้องเรียน ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถาม มีแอนิเมชันและเสียงประกอบ ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/mystery-board",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const HOWTO_STEPS = [
  {
    name: "เลือกโหมดและจำนวนป้าย",
    text: "เลือกโหมดคะแนนถ้าอยากให้ระบบสุ่มรางวัลให้เอง หรือโหมดคำถามถ้าจะใส่คำถามของตัวเอง แล้วเลือกจำนวนป้าย 12 20 หรือ 30 ป้าย",
  },
  {
    name: "พิมพ์คำถาม (เฉพาะโหมดคำถาม)",
    text: "พิมพ์คำถามบรรทัดละหนึ่งข้อ ระบบบันทึกไว้ในเบราว์เซอร์ให้ใช้ซ้ำในคาบถัดไปได้ทันที",
  },
  {
    name: "ให้นักเรียนเลือกป้าย",
    text: "ฉายกระดานขึ้นจอหน้าห้อง ให้นักเรียนเลือกป้ายที่อยากเปิด หรือกดปุ่มสุ่มป้ายให้ระบบเลือกแทน",
  },
  {
    name: "เปิดป้ายแล้วตอบคำถาม",
    text: "ป้ายจะพลิกเผยคะแนนหรือคำถามพร้อมเอฟเฟกต์ ให้นักเรียนตอบแล้วกดกลับกระดานเพื่อเล่นป้ายถัดไป",
  },
];

const FAQS = [
  {
    q: "กระดานป้ายปริศนานี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ต้องเตรียมคำถามก่อนใช้ไหม",
    a: "ไม่ต้อง ถ้าเลือกโหมดคะแนนระบบจะสุ่มรางวัลและกับดักหลังป้ายให้เอง ส่วนโหมดคำถามค่อยพิมพ์คำถามของตัวเองเมื่อพร้อม",
  },
  {
    q: "คำถามที่พิมพ์ไว้จะหายไหมถ้าปิดหน้าเว็บ",
    a: "ไม่หาย ระบบบันทึกโหมด ธีม และชุดคำถามไว้ในเบราว์เซอร์ของเครื่องให้อัตโนมัติ ส่วนป้ายที่เปิดไปแล้วจะรีเซ็ตใหม่ทุกครั้งที่เริ่มเกม",
  },
  {
    q: "ใช้กี่ป้ายได้บ้าง",
    a: "เลือกได้ 12 20 หรือ 30 ป้าย ถ้าใช้โหมดคำถามและมีคำถามน้อยกว่าที่เลือก ระบบจะลดจำนวนป้ายลงให้เท่าจำนวนคำถามโดยอัตโนมัติ",
  },
  {
    q: "ปิดเสียงและแอนิเมชันได้ไหม",
    a: "ปิดเสียงได้จากปุ่มลำโพงบนแถบด้านบน ส่วนแอนิเมชันจะลดลงอัตโนมัติถ้าตั้งค่าเครื่องให้ลดการเคลื่อนไหว",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "กระดานป้ายปริศนา Khuncool",
      url: "https://www.khuncool.com/mystery-board",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "กระดานป้ายปริศนาสำหรับห้องเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้กระดานป้ายปริศนา Khuncool",
      description:
        "ขั้นตอนการใช้กระดานป้ายปริศนาออนไลน์ ตั้งแต่เลือกโหมดจนถึงเปิดป้ายตอบคำถาม",
      inLanguage: "th",
      step: HOWTO_STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
  ],
};

const USE_CASES = [
  {
    icon: "📝",
    head: "ทบทวนบทเรียนท้ายคาบ",
    body: "ใส่คำถามทบทวนแล้วให้นักเรียนเลือกป้าย เปลี่ยนการทบทวนให้เป็นเกมที่ทุกคนอยากมีส่วนร่วม",
  },
  {
    icon: "🎁",
    head: "กิจกรรมแจกคะแนนพิเศษ",
    body: "ใช้โหมดคะแนนให้ระบบสุ่มรางวัลและกับดักเอง ครูไม่ต้องเตรียมอะไรก่อนเข้าคาบ",
  },
  {
    icon: "🏆",
    head: "แข่งขันเป็นทีม",
    body: "ใช้คู่กับกระดานคะแนนกลุ่มเพื่อบันทึกแต้มที่แต่ละทีมเปิดได้ตลอดกิจกรรม",
  },
  {
    icon: "📺",
    head: "ฉายขึ้นจอโปรเจกเตอร์",
    body: "ตัวเลขและคำถามใหญ่ อ่านได้จากหลังห้อง กดเต็มจอได้ทั้งบนคอมและแท็บเล็ต",
  },
];

export default function MysteryBoardPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">
            หน้าแรก
          </Link>
          <span>›</span>
          <Link href="/tools" className="text-ink-faint">
            เครื่องมือครู
          </Link>
          <span>›</span>
          <span
            className="font-semibold text-ink-secondary"
            aria-current="page"
          >
            กระดานป้ายปริศนา
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          กระดานป้ายปริศนา
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ให้นักเรียนเลือกป้าย เปิดเผยคะแนนหรือคำถาม ใช้ฟรี ไม่ต้องติดตั้ง
          </span>
          <span className="hidden md:inline">
            ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถามพร้อมเอฟเฟกต์
            ฉายขึ้นจอหน้าห้องได้ เหมาะกับการทบทวนบทเรียนและกิจกรรมแข่งขันในชั้นเรียน
          </span>
        </p>
      </div>

      {/* Mystery board app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <MysteryBoardApp />
      </div>

      {/* How to use */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">วิธีใช้งาน</h2>
        <div className="mt-3 flex flex-col gap-3 md:max-w-[62ch] md:gap-3.5">
          {HOWTO_STEPS.map((s, i) => (
            <div key={s.name} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[#ECEDFE] text-[12.5px] font-bold text-[#4A46D6] md:h-[30px] md:w-[30px] md:rounded-[10px] md:text-[15px]">
                {i + 1}
              </span>
              <div>
                <div className="mb-0.5 text-sm font-bold md:text-base">
                  {s.name}
                </div>
                <p className="m-0 text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          ใช้ทำอะไรได้บ้าง
        </h2>
        <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
          {USE_CASES.map((u) => (
            <div
              key={u.head}
              className="rounded-2xl border border-border bg-surface-card p-3.5 md:p-4"
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="text-lg md:text-[19px]">{u.icon}</span>
                <span className="text-sm font-bold md:text-[15.5px]">
                  {u.head}
                </span>
              </div>
              <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                {u.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          คำถามที่ครูถามบ่อย
        </h2>
        <div className="flex flex-col gap-2 md:max-w-[62ch] md:gap-[9px]">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-border bg-surface-card p-[13px] md:rounded-[15px] md:p-[15px_17px]"
            >
              <div className="mb-1 text-[13.5px] font-semibold leading-snug md:text-[15px]">
                {f.q}
              </div>
              <p className="m-0 text-[13px] leading-relaxed text-ink-secondary md:text-sm md:leading-[1.75]">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          เครื่องมือที่ใช้คู่กันได้
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/group-scoreboard"
            className="rounded-pill border border-[#C6C9FB] bg-[#F7F7FE] px-3.5 py-2 text-[13px] font-semibold text-primary no-underline hover:opacity-70"
          >
            🏆 กระดานคะแนนกลุ่ม
          </Link>
          <Link
            href="/random-name-picker"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🎡 วงล้อสุ่มชื่อนักเรียน
          </Link>
          <Link
            href="/random-question"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            ❓ สุ่มคำถามหน้าชั้น
          </Link>
          <Link
            href="/tools"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🧰 เครื่องมือทั้งหมด
          </Link>
        </div>
      </div>
    </main>
  );
}
