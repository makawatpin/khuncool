import type { Metadata } from "next";
import Link from "next/link";
import IsAreSortingApp from "./IsAreSortingApp";

export const metadata: Metadata = {
  title: "Is / Are Sorting เกมแยกประโยค is are ภาษาอังกฤษ ใช้ฟรี | khuncool",
  description:
    "เกม Is / Are Sorting ฝึกไวยากรณ์ is/are ภาษาอังกฤษ อ่านประโยคแล้วแตะตะกร้าที่ถูกต้อง พร้อมคำอธิบายไวยากรณ์ภาษาไทย เล่นฟรีทั้งบนคอมและมือถือ",
  keywords: [
    "is are sorting",
    "ฝึก is are",
    "ไวยากรณ์ is are",
    "เกมภาษาอังกฤษ",
    "grammar game",
    "สื่อการสอนภาษาอังกฤษ",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/media/english/is-are-sorting",
  },
  openGraph: {
    type: "website",
    title: "Is / Are Sorting เกมแยกประโยค is are ภาษาอังกฤษ ใช้ฟรี | khuncool",
    description:
      "อ่านประโยคแล้วแตะตะกร้า IS หรือ ARE ให้ถูกต้อง ฝึกไวยากรณ์เอกพจน์/พหูพจน์ พร้อมคำอธิบายภาษาไทยและคอมโบดาว ใช้ฟรี ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/media/english/is-are-sorting",
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
          name: "Is / Are Sorting",
          item: "https://www.khuncool.com/media/english/is-are-sorting",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Is / Are Sorting Khuncool",
      url: "https://www.khuncool.com/media/english/is-are-sorting",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "เกมฝึกไวยากรณ์ is/are ภาษาอังกฤษ อ่านประโยคแล้วแตะตะกร้าที่ถูกต้อง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
  ],
};

export default function IsAreSortingPage() {
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
            Is / Are Sorting
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          Is / Are Sorting แยกประโยค is are ภาษาอังกฤษ 🧑‍🏫
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          อ่านประโยค แล้วแตะตะกร้าที่ถูกต้อง — ฝึกไวยากรณ์ is/are
          พร้อมคำอธิบายภาษาไทย ตอบถูกติดกันได้คอมโบดาวพิเศษ ใช้ฟรี
          เล่นได้ทั้งบนคอมและมือถือ
        </p>
      </div>

      {/* Is / Are sorting app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <IsAreSortingApp />
      </div>
    </main>
  );
}
