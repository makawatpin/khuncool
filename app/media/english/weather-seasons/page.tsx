import type { Metadata } from "next";
import Link from "next/link";
import WeatherSeasonsApp from "./WeatherSeasonsApp";
import GameFaq from "../GameFaq";
import { gameFaqs, gameOgImage } from "../seo";

const title = "Weather & Seasons Adventure เกมสภาพอากาศและฤดูกาล | khuncool";
const description = "สื่อการสอนภาษาอังกฤษเรื่องสภาพอากาศ ฤดูกาล และเครื่องแต่งกาย สำหรับ ป.1–ป.6 มีบทเรียนพร้อมเสียง เกมสลับอักษร Dress the Character แบบลากเสื้อผ้า และ Sentence Quiz ใช้ฟรีบนคอม แท็บเล็ต และมือถือ";
const url = "https://www.khuncool.com/media/english/weather-seasons";
const faqs = gameFaqs("Weather & Seasons Adventure", "ป.1–ป.6");
const OG_IMAGE = gameOgImage("weather-seasons", "Weather & Seasons Adventure", 1200, 675);

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "weather and seasons",
    "เกมสภาพอากาศภาษาอังกฤษ",
    "คำศัพท์สภาพอากาศ",
    "ฤดูกาลภาษาอังกฤษ",
    "How's the weather",
    "สื่อการสอนภาษาอังกฤษ",
    "เกมภาษาอังกฤษ ป.1 ป.6",
    "เครื่องมือครู",
  ],
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    title,
    description,
    url,
    locale: "th_TH",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "สื่อการสอน", item: "https://www.khuncool.com/media" },
        { "@type": "ListItem", position: 3, name: "สื่อการสอนภาษาอังกฤษ", item: "https://www.khuncool.com/media/english" },
        { "@type": "ListItem", position: 4, name: "Weather & Seasons Adventure", item: url },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Weather & Seasons Adventure Khuncool",
      url,
      image: OG_IMAGE.url,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: ["th-TH", "en"],
      description,
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
  ],
};

export default function WeatherSeasonsPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">หน้าแรก</Link><span>›</span>
          <Link href="/media" className="text-ink-faint">สื่อการสอน</Link><span>›</span>
          <Link href="/media/english" className="text-ink-faint">ภาษาอังกฤษ</Link><span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">Weather & Seasons Adventure</span>
        </div>
      </nav>
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">Weather & Seasons Adventure ภารกิจนักพยากรณ์อากาศ ☀️</h1>
        <p className="m-0 max-w-[72ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">เรียนคำศัพท์สภาพอากาศ ฤดูกาล และเครื่องแต่งกาย ผ่านบทเรียน เกมสลับอักษร Dress the Character และ Sentence Quiz ที่มีวิธีเล่นแตกต่างกัน</p>
      </div>
      <div className="px-4 pb-8 md:px-8 md:pb-10"><WeatherSeasonsApp /></div>
      <GameFaq items={faqs} title="Weather & Seasons Adventure" url={url} grade="ป.1–ป.6" teaches={["คำศัพท์สภาพอากาศและฤดูกาล", "การถามตอบ How's the weather?", "การเลือกเครื่องแต่งกายและสร้างประโยคภาษาอังกฤษ"]} />
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">สื่อการสอนที่เกี่ยวข้อง</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/media/english/vocabulary-arcade" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">🎮 Vocabulary Arcade</Link>
          <Link href="/media/english/talk-card" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">🗣️ Talk Card</Link>
          <Link href="/media/english" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">🧰 สื่อการสอนทั้งหมด</Link>
        </div>
      </div>
    </main>
  );
}
