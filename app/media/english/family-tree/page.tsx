import type { Metadata } from "next";
import Link from "next/link";
import FamilyTreeApp from "./FamilyTreeApp";

export const metadata: Metadata = {
  title: "Family Tree Explorer เกมคำศัพท์ครอบครัวภาษาอังกฤษ ใช้ฟรี | khuncool",
  description:
    "เกมคำศัพท์ครอบครัวภาษาอังกฤษ 4 มินิเกมในหน้าเดียว ลาก & วางปลูกต้นไม้ครอบครัว จับคู่คำศัพท์ ฟังแล้วเดา และเติมคำในเรื่องราว เล่นฟรีไม่ต้องติดตั้ง",
  keywords: [
    "family tree",
    "คำศัพท์ครอบครัวภาษาอังกฤษ",
    "เกมภาษาอังกฤษ",
    "family vocabulary",
    "สื่อการสอนภาษาอังกฤษ",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/media/english/family-tree",
  },
  openGraph: {
    type: "website",
    title: "Family Tree Explorer เกมคำศัพท์ครอบครัวภาษาอังกฤษ ใช้ฟรี | khuncool",
    description:
      "เรียนคำศัพท์ครอบครัวภาษาอังกฤษผ่าน 4 มินิเกม ลาก & วางปลูกต้นไม้ครอบครัว จับคู่คำศัพท์กับรูปภาพ ฟังเสียงแล้วเดา และเติมคำในเรื่องราว",
    url: "https://www.khuncool.com/media/english/family-tree",
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
          name: "Family Tree Explorer",
          item: "https://www.khuncool.com/media/english/family-tree",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Family Tree Explorer Khuncool",
      url: "https://www.khuncool.com/media/english/family-tree",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "เกมคำศัพท์ครอบครัวภาษาอังกฤษ 4 มินิเกมในหน้าเดียว ลาก & วางปลูกต้นไม้ครอบครัว จับคู่คำศัพท์ ฟังแล้วเดา และเติมคำในเรื่องราว",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
  ],
};

export default function FamilyTreePage() {
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
            Family Tree Explorer
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          Family Tree Explorer เกมคำศัพท์ครอบครัวภาษาอังกฤษ 🌳
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          เรียนคำศัพท์ครอบครัวภาษาอังกฤษผ่าน 4 มินิเกมในหน้าเดียว ลาก & วางปลูกต้นไม้ครอบครัว
          จับคู่คำศัพท์กับรูปภาพ ฟังเสียงแล้วเดา และเติมคำในเรื่องราวของครอบครัว เล่นฟรี ไม่ต้องติดตั้ง
        </p>
      </div>

      {/* Family tree app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <FamilyTreeApp />
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
            href="/media/english/talk-card"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🗣️ Talk Card
          </Link>
          <Link
            href="/media/english/vocabulary-arcade"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🎮 Vocabulary Arcade
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
