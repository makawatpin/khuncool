import type { Metadata } from "next";
import Link from "next/link";
import TalkCardApp from "./TalkCardApp";

export const metadata: Metadata = {
  title: "Talk Card สุ่มคำถามภาษาอังกฤษให้เด็กพูดหน้าชั้น ใช้ฟรี | khuncool",
  description:
    "สุ่มการ์ดคำถามให้นักเรียนพูดภาษาอังกฤษหน้าชั้น มีคำแปลไทย ประโยคตัวอย่าง เสียงอ่าน และตัวจับเวลา เล่นได้ทั้งคอมและมือถือ",
  keywords: [
    "talk card",
    "การ์ดคำถามภาษาอังกฤษ",
    "ฝึกพูดภาษาอังกฤษ",
    "speaking practice",
    "สื่อการสอนภาษาอังกฤษ",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/media/english/talk-card",
  },
  openGraph: {
    type: "website",
    title: "Talk Card สุ่มคำถามภาษาอังกฤษให้เด็กพูดหน้าชั้น ใช้ฟรี | khuncool",
    description:
      "สุ่มการ์ดคำถามให้นักเรียนพูดภาษาอังกฤษหน้าชั้น มีคำแปลไทย ประโยคตัวอย่าง เสียงอ่าน และตัวจับเวลา เล่นได้ทั้งคอมและมือถือ",
    url: "https://www.khuncool.com/media/english/talk-card",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "หน้าแรก",
          item: "https://www.khuncool.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "สื่อการสอน",
          item: "https://www.khuncool.com/media/english",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Talk Card",
          item: "https://www.khuncool.com/media/english/talk-card",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Talk Card Khuncool",
      url: "https://www.khuncool.com/media/english/talk-card",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "สุ่มการ์ดคำถามให้นักเรียนพูดภาษาอังกฤษหน้าชั้น มีคำแปลไทย ประโยคตัวอย่าง เสียงอ่าน และตัวจับเวลา",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
  ],
};

export default function TalkCardPage() {
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
          <Link href="/media/english" className="text-ink-faint">
            สื่อการสอน
          </Link>
          <span>›</span>
          <span
            className="font-semibold text-ink-secondary"
            aria-current="page"
          >
            Talk Card
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          Talk Card สุ่มคำถามพูดภาษาอังกฤษ 🗣️
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          สุ่มการ์ดคำถามให้นักเรียนพูดภาษาอังกฤษหน้าชั้น มีคำแปลไทย
          ประโยคตัวอย่าง เสียงอ่าน และตัวจับเวลา เล่นได้ทั้งคอมและมือถือ
        </p>
      </div>

      {/* Talk card app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <TalkCardApp />
      </div>

      {/* Related */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          สื่อการสอนที่เกี่ยวข้อง
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/media/english/sound-wheel"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🎡 Sound Wheel
          </Link>
          <Link
            href="/media/english"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🧰 สื่อการสอนทั้งหมด
          </Link>
        </div>
      </div>
    </main>
  );
}
