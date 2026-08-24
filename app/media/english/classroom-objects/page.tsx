import type { Metadata } from "next";
import Link from "next/link";
import ClassroomObjectsApp from "./ClassroomObjectsApp";
import GameFaq from "../GameFaq";
import { gameFaqs, gameOgImage } from "../seo";

const faqs = gameFaqs("Classroom Objects Match", "ป.1–ป.3");

const OG_IMAGE = gameOgImage("classroom-objects", "Classroom Objects Match");

export const metadata: Metadata = {
  title:
    "Classroom Objects Match จับคู่คำศัพท์ของใช้ในห้องเรียน ใช้ฟรี | khuncool",
  description:
    "เกมจับคู่การ์ดคำศัพท์ของใช้ในห้องเรียนภาษาอังกฤษ พลิกการ์ดหารูปภาพให้ตรงกับคำศัพท์ มีเสียงอ่านคำศัพท์และคำแปลไทย ใช้ฟรี ไม่ต้องติดตั้ง",
  keywords: [
    "classroom objects",
    "จับคู่คำศัพท์",
    "คำศัพท์ของใช้ในห้องเรียน",
    "เกมจับคู่",
    "เกมความจำ",
    "เกมภาษาอังกฤษ",
    "สื่อการสอนภาษาอังกฤษ",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/media/english/classroom-objects",
  },
  openGraph: {
    type: "website",
    title:
      "Classroom Objects Match จับคู่คำศัพท์ของใช้ในห้องเรียน ใช้ฟรี | khuncool",
    description:
      "พลิกการ์ดหาคู่รูปภาพกับคำศัพท์ภาษาอังกฤษของใช้ในห้องเรียน จับคู่ถูกได้ดาว ติดคอมโบได้โบนัส ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/media/english/classroom-objects",
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
          name: "Classroom Objects Match",
          item: "https://www.khuncool.com/media/english/classroom-objects",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Classroom Objects Match Khuncool",
      url: "https://www.khuncool.com/media/english/classroom-objects",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "เกมจับคู่การ์ดคำศัพท์ของใช้ในห้องเรียนภาษาอังกฤษ พลิกการ์ดหารูปภาพให้ตรงกับคำศัพท์ พร้อมเสียงอ่านและคำแปลไทย",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
  ],
};

export default function ClassroomObjectsPage() {
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
            Classroom Objects Match
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          Classroom Objects Match จับคู่คำศัพท์ของใช้ในห้องเรียน 🎒
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          พลิกการ์ดหาคู่ รูปภาพ ↔ คำศัพท์ภาษาอังกฤษของใช้ในห้องเรียน
          จับคู่ถูกได้ดาว ติดกันได้คอมโบ มีเสียงอ่านคำศัพท์และคำแปลไทย
          ใช้ฟรี ไม่ต้องติดตั้ง
        </p>
      </div>

      {/* Classroom Objects Match app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <ClassroomObjectsApp />
      </div>
      <GameFaq items={faqs} title="Classroom Objects Match" url="https://www.khuncool.com/media/english/classroom-objects" grade="ป.1–ป.3" teaches={["คำศัพท์สิ่งของในห้องเรียน", "การจับคู่ภาพกับคำ", "การฟังคำศัพท์ภาษาอังกฤษ"]} />
    </main>
  );
}
