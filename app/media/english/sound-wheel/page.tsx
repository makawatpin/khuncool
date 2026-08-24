import type { Metadata } from "next";
import Link from "next/link";
import SoundWheelApp from "./SoundWheelApp";
import GameFaq from "../GameFaq";
import { gameFaqs, gameOgImage } from "../seo";

const faqs = gameFaqs("Sound Wheel", "ป.1–ป.3");

const OG_IMAGE = gameOgImage("sound-wheel", "Sound Wheel");

export const metadata: Metadata = {
  title: "Sound Wheel วงล้อเสียงภาษาอังกฤษ ใช้ฟรีออนไลน์ | khuncool",
  description:
    "วงล้อเสียงภาษาอังกฤษ หมุนสุ่มเสียงพยัญชนะ สระ และ digraphs ให้นักเรียนออกเสียงและบอกคำศัพท์ เล่นฟรีทั้งบนคอมพิวเตอร์และมือถือ",
  keywords: [
    "sound wheel",
    "วงล้อเสียง",
    "phonics",
    "ฝึกออกเสียงภาษาอังกฤษ",
    "digraphs",
    "สื่อการสอนภาษาอังกฤษ",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/media/english/sound-wheel",
  },
  openGraph: {
    type: "website",
    title: "Sound Wheel วงล้อเสียงภาษาอังกฤษ ใช้ฟรีออนไลน์ | khuncool",
    description:
      "หมุนวงล้อสุ่มเสียงพยัญชนะ สระสั้น CVC และ digraphs ให้นักเรียนออกเสียงและบอกคำศัพท์ พร้อมเสียงอ่าน ดาวสะสม และสตรีคถูกต่อเนื่อง",
    url: "https://www.khuncool.com/media/english/sound-wheel",
    locale: "th_TH",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
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
          name: "Sound Wheel",
          item: "https://www.khuncool.com/media/english/sound-wheel",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Sound Wheel วงล้อเสียง Khuncool",
      url: "https://www.khuncool.com/media/english/sound-wheel",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "วงล้อเสียงภาษาอังกฤษ หมุนสุ่มเสียงพยัญชนะ สระ และ digraphs ให้นักเรียนออกเสียงและบอกคำศัพท์",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
  ],
};

export default function SoundWheelPage() {
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
            Sound Wheel
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          Sound Wheel วงล้อเสียงภาษาอังกฤษ 🎡
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          หมุนวงล้อได้หนึ่งเสียง ให้เด็กออกเสียงและบอกคำศัพท์ที่ขึ้นต้นด้วยเสียงนั้น
          มี 3 ชุดเสียง (พยัญชนะ a–z, digraphs, สระสั้น CVC) พร้อมเสียงอ่าน
          ดาวสะสม และสตรีคถูกต่อเนื่อง
        </p>
      </div>

      {/* Sound wheel app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <SoundWheelApp />
      </div>

      <GameFaq items={faqs} title="Sound Wheel" url="https://www.khuncool.com/media/english/sound-wheel" grade="ป.1–ป.3" teaches={["เสียงพยัญชนะ a–z", "Digraphs", "สระสั้น CVC และการออกเสียง"]} />

      {/* Related */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          สื่อการสอนที่เกี่ยวข้อง
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/media/english/talk-card"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🗣️ Talk Card
          </Link>
          <Link
            href="/media/english/phonics-bingo"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🔤 Phonics Bingo
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
