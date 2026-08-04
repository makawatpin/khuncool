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

export const metadata: Metadata = {
  title: "Khuncool | แหล่งรวมความรู้และเครื่องมือสำหรับครูไทย ใช้ฟรี",
  description:
    "คุณคูล (Khuncool) ศูนย์รวมบทความครู สื่อการสอนออนไลน์ และแอปช่วยงานครู เช่น วงล้อสุ่มชื่อ เช็กชื่อ บันทึกโฮมรูม ใช้งานฟรีบนเว็บ ไม่ต้องติดตั้ง",
  alternates: {
    canonical: "https://www.khuncool.com/",
  },
  openGraph: {
    type: "website",
    title: "Khuncool | แหล่งรวมความรู้และเครื่องมือสำหรับครูไทย ใช้ฟรี",
    description:
      "คุณคูล (Khuncool) ศูนย์รวมบทความครู สื่อการสอนออนไลน์ และแอปช่วยงานครู เช่น วงล้อสุ่มชื่อ เช็กชื่อ บันทึกโฮมรูม ใช้งานฟรีบนเว็บ ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/",
    images: ["https://www.khuncool.com/assets/wheel-cover.webp"],
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
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.khuncool.com/articles?q={search_term_string}",
        "query-input": "required name=search_term_string",
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
      <ToolsSection />
      <AdSlot />
      <AffiliateProductsSection />
      <AppsSection />

      <CookieConsent />
      <OfflineIndicator />
    </main>
  );
}
