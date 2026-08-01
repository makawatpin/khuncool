import type { Metadata } from "next";
import Link from "next/link";
import PhonicsBingoApp from "./PhonicsBingoApp";

export const metadata: Metadata = {
  title: "Phonics Bingo เกมบิงโกเสียงภาษาอังกฤษ ใช้ฟรี | khuncool",
  description:
    "เกม Phonics Bingo ให้นักเรียนฟังเสียงต้น/ท้ายคำภาษาอังกฤษแล้วแตะช่องบิงโกให้ตรงเสียง เล่นได้ทั้งตัวอักษร a-z และเสียงผสม sh ch th ใช้ฟรี ไม่ต้องติดตั้ง",
  keywords: [
    "phonics bingo",
    "โฟนิกส์",
    "เกมโฟนิกส์",
    "เกมภาษาอังกฤษ",
    "ฝึกออกเสียงภาษาอังกฤษ",
    "สื่อการสอนภาษาอังกฤษ",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/media/english/phonics-bingo",
  },
  openGraph: {
    type: "website",
    title: "Phonics Bingo เกมบิงโกเสียงภาษาอังกฤษ ใช้ฟรี | khuncool",
    description:
      "ฟังเสียงต้น/ท้ายคำแล้วแตะบิงโก เกมฝึกโฟนิกส์ภาษาอังกฤษสำหรับห้องเรียน ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/media/english/phonics-bingo",
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
          name: "Phonics Bingo",
          item: "https://www.khuncool.com/media/english/phonics-bingo",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Phonics Bingo Khuncool",
      url: "https://www.khuncool.com/media/english/phonics-bingo",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "เกมบิงโกฝึกฟังเสียงโฟนิกส์ภาษาอังกฤษ ฟังเสียงต้น/ท้ายคำแล้วแตะบิงโกให้ตรงเสียง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
  ],
};

export default function PhonicsBingoPage() {
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
            Phonics Bingo
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          Phonics Bingo เกมบิงโกฝึกฟังเสียงภาษาอังกฤษ 🎧
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          ครูกดปุ่มออกเสียง นักเรียนฟังเสียงต้น/ท้ายคำแล้วแตะช่องที่ตรงกับเสียงบนการ์ด
          ครบแถวไหนก็ตะโกน BINGO ได้เลย ใช้ฟรี ไม่ต้องติดตั้ง
        </p>
      </div>

      {/* Phonics Bingo app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <PhonicsBingoApp />
      </div>
    </main>
  );
}
