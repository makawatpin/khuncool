import type { Metadata } from "next";
import CookieConsent from "@/components/CookieConsent";
import OfflineIndicator from "@/components/OfflineIndicator";
import HeroSection from "@/components/home/HeroSection";
import ArticlesSection from "@/components/home/ArticlesSection";
import PillarsSection from "@/components/home/PillarsSection";
import ToolsSection from "@/components/home/ToolsSection";
import AdSlot from "@/components/home/AdSlot";
import AffiliateProductsSection from "@/components/home/AffiliateProductsSection";
import AppsSection from "@/components/home/AppsSection";
import SeoHubSection from "@/components/home/SeoHubSection";

export const metadata: Metadata = {
  title: "เครื่องมือครูและสื่อการสอนออนไลน์ฟรี | Khuncool",
  description:
    "รวมเครื่องมือครูและสื่อการสอนออนไลน์ฟรี วงล้อสุ่มชื่อ เกมเป็ดสุ่ม แบ่งกลุ่ม จับเวลา เช็กชื่อ และเกมภาษาอังกฤษ เปิดใช้บนเว็บได้ทันที",
  alternates: {
    canonical: "https://www.khuncool.com/",
  },
  openGraph: {
    type: "website",
    title: "เครื่องมือครูและสื่อการสอนออนไลน์ฟรี | Khuncool",
    description:
      "รวมเครื่องมือครู สื่อการสอน และเกมการเรียนรู้ เปิดใช้บนเว็บได้ทันที ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/",
    images: ["https://www.khuncool.com/assets/random-student-picker-games-cover.webp"],
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
      "@type": "Organization",
      name: "khuncool",
      url: "https://www.khuncool.com/",
      logo: "https://www.khuncool.com/assets/khuncool-logo.webp",
      email: "khuncoolhub@gmail.com",
      founder: {
        "@type": "Person",
        name: "อาวล์",
      },
    },
    {
      "@type": "WebSite",
      name: "khuncool",
      url: "https://www.khuncool.com/",
      inLanguage: "th-TH",
    },
    {
      "@type": "CollectionPage",
      name: "เครื่องมือครูและสื่อการสอนออนไลน์ฟรี",
      url: "https://www.khuncool.com/",
      inLanguage: "th-TH",
      description: "ศูนย์รวมเครื่องมือครู สื่อการสอนออนไลน์ และเกมการเรียนรู้สำหรับนักเรียน",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "วงล้อสุ่มชื่อนักเรียน", url: "https://www.khuncool.com/random-name-picker" },
          { "@type": "ListItem", position: 2, name: "เกมเป็ดสุ่มชื่อ", url: "https://www.khuncool.com/duck-race" },
          { "@type": "ListItem", position: 3, name: "สุ่มแบ่งกลุ่มนักเรียน", url: "https://www.khuncool.com/group-maker" },
          { "@type": "ListItem", position: 4, name: "เกมและสื่อภาษาอังกฤษ", url: "https://www.khuncool.com/media/english" },
        ],
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSection />
      <ArticlesSection />
      <PillarsSection />
      <SeoHubSection />
      <ToolsSection />
      <AdSlot />
      <AffiliateProductsSection />
      <AppsSection />

      <CookieConsent />
      <OfflineIndicator />
    </main>
  );
}
