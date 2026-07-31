import type { Metadata } from "next";
import Link from "next/link";
import WheelApp from "./WheelApp";

export const metadata: Metadata = {
  title: "วงล้อสุ่มชื่อ ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | Khuncool",
  description:
    "วงล้อสุ่มชื่อนักเรียนออนไลน์ ใช้ฟรี ไม่ต้องสมัครสมาชิก ใส่รายชื่อแล้วหมุนได้ทันที เหมาะกับการสุ่มชื่อตอบคำถาม สุ่มเวรประจำวัน และสุ่มรางวัลในห้องเรียน",
  keywords: [
    "วงล้อสุ่ม",
    "วงล้อสุ่มชื่อ",
    "สุ่มชื่อนักเรียน",
    "สุ่มชื่อออนไลน์",
    "วงล้อสุ่มรางวัล",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/random-name-picker",
  },
  openGraph: {
    type: "website",
    title: "วงล้อสุ่มชื่อ ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | Khuncool",
    description:
      "ใส่รายชื่อนักเรียนแล้วหมุนได้ทันที ฟรี ไม่ต้องสมัครสมาชิก ใช้ได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และมือถือ",
    url: "https://www.khuncool.com/random-name-picker",
    images: ["https://www.khuncool.com/assets/wheel-cover.png"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const FAQS = [
  {
    q: "วงล้อสุ่มชื่อใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ใส่รายชื่อนักเรียนได้กี่คน",
    a: "ใส่ได้ทั้งห้อง สามารถวางรายชื่อทีละหลายบรรทัดจาก Excel หรือ Google Sheets ได้",
  },
  {
    q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม",
    a: "ได้ รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ เหมาะกับการฉายขึ้นจอโปรเจกเตอร์ในห้องเรียน",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "วงล้อสุ่มชื่อ Khuncool",
      url: "https://www.khuncool.com/random-name-picker",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "วงล้อสุ่มชื่อนักเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
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

export default function RandomNamePickerPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">
          หน้าแรก
        </Link>
        <span>›</span>
        <Link href="/tools" className="text-ink-faint">
          เครื่องมือครู
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">
          วงล้อสุ่มชื่อ
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          วงล้อสุ่มชื่อนักเรียน
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ใส่รายชื่อแล้วกดหมุน ใช้สุ่มเลือกคนตอบ สุ่มเวร หรือสุ่มรางวัลในห้องเรียนได้ทันที
          </span>
          <span className="hidden md:inline">
            ใส่รายชื่อนักเรียนแล้วคลิกวงล้อหรือปุ่มหมุนเพื่อสุ่มเลือกคนตอบ
            แบ่งเวร หรือสุ่มรางวัลในห้องเรียน ใช้ฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
      </div>

      {/* Wheel app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <WheelApp />
      </div>

      {/* FAQ */}
      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
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
    </main>
  );
}
