import type { Metadata } from "next";
import Link from "next/link";
import VocabularyArcadeApp from "./VocabularyArcadeApp";

export const metadata: Metadata = {
  title: "Vocabulary Arcade เกมคำศัพท์ภาษาอังกฤษ 10 หมวด ใช้ฟรี | khuncool",
  description:
    "เกมคำศัพท์ภาษาอังกฤษ 10 หมวด (สัตว์ อาหาร โรงเรียน อวัยวะ สี อาชีพ อากาศ กีฬา ยานพาหนะ บ้าน) เล่นได้ 4 โหมด พร้อมเสียงอ่านทุกคำ เล่นฟรีทั้งบนคอมพิวเตอร์และมือถือ",
  keywords: [
    "vocabulary arcade",
    "เกมคำศัพท์ภาษาอังกฤษ",
    "คำศัพท์ภาษาอังกฤษ",
    "ฝึกคำศัพท์",
    "spelling game",
    "สื่อการสอนภาษาอังกฤษ",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/media/english/vocabulary-arcade",
  },
  openGraph: {
    type: "website",
    title: "Vocabulary Arcade เกมคำศัพท์ภาษาอังกฤษ 10 หมวด ใช้ฟรี | khuncool",
    description:
      "เกมคำศัพท์ภาษาอังกฤษ 10 หมวด เล่นได้ 4 โหมด (Picture Match, Word → Picture, Spelling Builder, Mixed Challenge) พร้อมเสียงอ่านทุกคำ ดาวสะสม และคอมโบ",
    url: "https://www.khuncool.com/media/english/vocabulary-arcade",
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
          name: "Vocabulary Arcade",
          item: "https://www.khuncool.com/media/english/vocabulary-arcade",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Vocabulary Arcade Khuncool",
      url: "https://www.khuncool.com/media/english/vocabulary-arcade",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "เกมคำศัพท์ภาษาอังกฤษ 10 หมวด เล่นได้ 4 โหมด พร้อมเสียงอ่านทุกคำ ดาวสะสม และคอมโบ",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
  ],
};

export default function VocabularyArcadePage() {
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
            Vocabulary Arcade
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          Vocabulary Arcade เกมคำศัพท์ภาษาอังกฤษ 🎮
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          คลังคำศัพท์ 10 หมวด หมวดละ 20 คำ เล่นได้ 4 โหมด (Picture Match, Word →
          Picture, Spelling Builder, Mixed Challenge) พร้อมเสียงอ่านทุกคำ
          ดาวสะสม และคอมโบ
        </p>
      </div>

      {/* Vocabulary arcade app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <VocabularyArcadeApp />
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
