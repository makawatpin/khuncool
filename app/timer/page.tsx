import type { Metadata } from "next";
import Link from "next/link";
import TimerApp from "./TimerApp";

export const metadata: Metadata = {
  title: "ตั้งเวลาถอยหลัง ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "นาฬิกาจับเวลาถอยหลังสำหรับห้องเรียน ใช้ฟรี ตั้งเวลาทำกิจกรรม สอบ หรือพักเบรกได้ทันทีบนเว็บ ไม่ต้องสมัครสมาชิก",
  keywords: [
    "จับเวลา",
    "นับถอยหลัง",
    "ตัวจับเวลา",
    "timer",
    "countdown timer",
    "จับเวลาสอบ",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/timer",
  },
  openGraph: {
    type: "website",
    title: "ตั้งเวลาถอยหลัง ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
    description:
      "นาฬิกาจับเวลาถอยหลังสำหรับห้องเรียน ใช้ฟรี ตั้งเวลาทำกิจกรรม สอบ หรือพักเบรกได้ทันทีบนเว็บ ไม่ต้องสมัครสมาชิก",
    url: "https://www.khuncool.com/timer",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const HOWTO_STEPS = [
  {
    name: "เลือกเวลาที่ตั้งไว้ล่วงหน้าหรือกำหนดเอง",
    text: "เลือกจากปุ่มเวลาที่ตั้งไว้ล่วงหน้า เช่น 1 นาที 5 นาที 10 นาที หรือกำหนดชั่วโมง นาที วินาทีเองได้ตามต้องการ",
  },
  {
    name: "กดเริ่มจับเวลา",
    text: "กดปุ่มเริ่มเพื่อให้นาฬิกาเริ่มนับถอยหลัง ตัวเลขจะแสดงผลใหญ่ชัดเจน มองเห็นได้จากทั่วห้องเรียน",
  },
  {
    name: "หยุดพักหรือรีเซ็ตได้ทุกเมื่อ",
    text: "กดหยุดชั่วคราวระหว่างจับเวลาได้ หรือรีเซ็ตเพื่อเริ่มตั้งเวลาใหม่ทันที",
  },
  {
    name: "ฟังเสียงแจ้งเตือนเมื่อหมดเวลา",
    text: "เมื่อนับถอยหลังครบระบบจะแจ้งเตือนให้ทราบทันทีว่าหมดเวลาแล้ว",
  },
];

const FAQS = [
  {
    q: "ตัวจับเวลานี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ตั้งเวลาได้นานสุดกี่ชั่วโมง",
    a: "กำหนดชั่วโมง นาที และวินาทีได้เอง เหมาะทั้งกับกิจกรรมสั้น ๆ ไม่กี่นาที ไปจนถึงจับเวลาสอบเป็นชั่วโมง",
  },
  {
    q: "ใช้ฉายขึ้นจอโปรเจกเตอร์ได้ไหม",
    a: "ได้ ตัวเลขแสดงผลขนาดใหญ่ชัดเจน เหมาะกับการฉายขึ้นจอหรือทีวีในห้องเรียนให้นักเรียนเห็นเวลาที่เหลือได้ทั่วถึง",
  },
  {
    q: "มีเสียงแจ้งเตือนเมื่อหมดเวลาไหม",
    a: "มี เมื่อนับถอยหลังครบเวลาระบบจะส่งเสียงแจ้งเตือนให้ทราบทันที",
  },
  {
    q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม",
    a: "ได้ รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "ตัวจับเวลาถอยหลัง Khuncool",
      url: "https://www.khuncool.com/timer",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "นาฬิกาจับเวลาถอยหลังสำหรับห้องเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้ตัวจับเวลาถอยหลัง Khuncool",
      description:
        "ขั้นตอนการใช้ตัวจับเวลาถอยหลังออนไลน์ ตั้งแต่ตั้งเวลาจนถึงแจ้งเตือนหมดเวลา",
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
    head: "จับเวลาทำข้อสอบหรือแบบทดสอบ",
    body: "ตั้งเวลาให้ชัดเจนว่าเหลือเวลาทำข้อสอบเท่าไหร่ ลดปัญหาการถามเวลาซ้ำ ๆ ระหว่างสอบ",
  },
  {
    icon: "☕",
    head: "จับเวลาพักเบรกในห้องเรียน",
    body: "กำหนดเวลาพักที่ชัดเจน ให้นักเรียนกลับเข้าห้องตรงเวลาโดยไม่ต้องเตือนซ้ำ",
  },
  {
    icon: "🎯",
    head: "จับเวลาทำกิจกรรมกลุ่ม",
    body: "ให้แต่ละกลุ่มมีเวลาทำงานเท่ากัน สร้างความกระชับและกระตุ้นให้ทำงานทันเวลา",
  },
  {
    icon: "🗣️",
    head: "จับเวลานำเสนองาน",
    body: "จำกัดเวลาพูดของแต่ละกลุ่มให้เท่ากัน ฝึกให้นักเรียนวางแผนการนำเสนอให้อยู่ในเวลาที่กำหนด",
  },
];

export default function TimerPage() {
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
            จับเวลา
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          จับเวลา / นับถอยหลัง
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ตั้งเวลาถอยหลังสำหรับทำกิจกรรม สอบ หรือพักเบรกในห้องเรียนได้ทันที
          </span>
          <span className="hidden md:inline">
            ตั้งเวลาถอยหลังสำหรับทำกิจกรรม สอบ หรือพักเบรกในห้องเรียนได้ทันที
            เลือกเวลาที่ตั้งไว้ล่วงหน้าหรือกำหนดเองได้ ใช้ฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
      </div>

      {/* Timer app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <TimerApp />
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
          เครื่องมือและบทความที่เกี่ยวข้อง
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/classroom-noise-meter"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🔊 วัดเสียงในห้องเรียน
          </Link>
          <Link
            href="/blog/wheel"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            📖 8 ไอเดียใช้วงล้อสุ่มในห้องเรียน
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
