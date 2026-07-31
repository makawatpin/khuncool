import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { ARTICLES, CATS, FEATURED } from "./data";

export const metadata: Metadata = {
  title: "บทความครู สื่อการสอน รีวิวสินค้า ข่าวการศึกษา | khuncool",
  description:
    "รวมบทความสำหรับครูไทย สื่อการสอน รีวิวอุปกรณ์ห้องเรียน ข่าวการศึกษาและทุนเรียนฟรี อัปเดตใหม่ทุกสัปดาห์ อ่านฟรี ไม่ต้องสมัครสมาชิก",
  alternates: {
    canonical: "https://www.khuncool.com/articles",
  },
  openGraph: {
    type: "website",
    title: "บทความครู สื่อการสอน รีวิวสินค้า ข่าวการศึกษา",
    description:
      "รวมบทความสำหรับครูไทย สื่อการสอน รีวิวสินค้า และข่าวการศึกษา อัปเดตใหม่ทุกสัปดาห์",
    images: ["https://www.khuncool.com/assets/wheel-cover.png"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// NOTE: mirrors the source helmet's hardcoded JSON-LD (ISO dates, exact
// order, literal headlines) rather than deriving from ALL_ARTICLES in
// ./data.ts. If a 6th article is added, update BOTH this array and
// ./data.ts manually — they are not kept in sync automatically.
const BLOG_POSTS_JSON_LD = [
  {
    headline: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/blog/wheel",
    datePublished: "2026-07-27",
  },
  {
    headline: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
    url: "https://www.khuncool.com/blog/random-name-activities",
    datePublished: "2026-07-26",
  },
  {
    headline: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง",
    url: "https://www.khuncool.com/blog/magnetic-frame",
    datePublished: "2025-07-26",
  },
  {
    headline: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์",
    url: "https://www.khuncool.com/blog/psu-english",
    datePublished: "2025-07-25",
  },
  {
    headline: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.",
    url: "https://www.khuncool.com/blog/royal-award-2569",
    datePublished: "2026-07-25",
  },
];

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
          name: "บทความ",
          item: "https://www.khuncool.com/articles",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "บทความ",
      url: "https://www.khuncool.com/articles",
      inLanguage: "th-TH",
      description: "รวมบทความสำหรับครูไทย สื่อการสอน รีวิวสินค้า และข่าวการศึกษา",
    },
    {
      "@type": "Blog",
      name: "khuncool บทความ",
      url: "https://www.khuncool.com/articles",
      inLanguage: "th-TH",
      blogPost: BLOG_POSTS_JSON_LD.map((p) => ({
        "@type": "BlogPosting",
        headline: p.headline,
        url: p.url,
        datePublished: p.datePublished,
      })),
    },
  ],
};

export default function ArticlesPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">
          หน้าแรก
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">บทความ</span>
      </div>

      {/* Hero */}
      <div className="px-4 pb-[6px] pt-3 md:px-8 md:pb-6 md:pt-4">
        <h1 className="m-0 mb-2.5 max-w-[22ch] text-[26px] leading-[1.32] md:mb-3 md:text-[42px] md:leading-[1.25]">
          บทความสำหรับครูไทย
        </h1>
        <p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[70ch] md:text-base md:leading-[1.8]">
          <span className="md:hidden">
            สื่อการสอน รีวิวอุปกรณ์ห้องเรียน และข่าวการศึกษา อัปเดตใหม่ทุกสัปดาห์
            อ่านฟรีไม่ต้องสมัครสมาชิก
          </span>
          <span className="hidden md:inline">
            สื่อการสอน รีวิวอุปกรณ์ห้องเรียน และข่าวการศึกษาที่ครูควรรู้
            อัปเดตใหม่ทุกสัปดาห์โดยทีมขุนคูล อ่านฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
          {CATS.map((c) => (
            <span
              key={c.t}
              className="flex-none whitespace-nowrap rounded-pill px-[13px] py-[7px] text-[12.5px] font-semibold md:px-3.5 md:py-2 md:text-[13px]"
              style={{ background: c.bg, color: c.color }}
            >
              {c.t}
            </span>
          ))}
        </div>
      </div>

      {/* Featured article */}
      <div className="px-4 pb-1.5 pt-3 md:px-8 md:pb-[34px] md:pt-0">
        <ArticleCard article={FEATURED} variant="featured" />
      </div>

      {/* Article list */}
      <div className="px-4 pb-6 pt-4 md:px-8 md:pb-[34px] md:pt-0">
        <h2 className="m-0 mb-[18px] hidden text-2xl md:block">
          บทความทั้งหมด
        </h2>
        <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
          {ARTICLES.map((a) => (
            <ArticleCard key={a.href} article={a} />
          ))}
        </div>
      </div>

      {/* Desktop-only editorial + related links */}
      <div className="hidden px-8 pb-9 md:grid md:grid-cols-2 md:items-start md:gap-11">
        <div>
          <h2 className="m-0 mb-4 text-2xl">ทำไมต้องอ่านบทความจากขุนคูล</h2>
          <p className="m-0 mb-3.5 max-w-none text-[14.5px] leading-[1.85] text-ink-secondary">
            ทีมงานเขียนจากประสบการณ์จริงในห้องเรียนไทย ทั้งสื่อการสอนที่ใช้ได้ทันที
            รีวิวอุปกรณ์ที่ทดลองใช้เอง และข่าวการศึกษาที่ครูต้องรู้ทันเวลา
            ไม่มีการรับจ้างเขียนโปรโมตแบบไม่เปิดเผย
          </p>
          <p className="m-0 text-[14.5px] leading-[1.85] text-ink-secondary">
            ทุกบทความลิงก์ไปยังเครื่องมือหรือสินค้าที่เกี่ยวข้องโดยตรง
            เพื่อให้เอาไปใช้ต่อได้ทันทีโดยไม่ต้องค้นหาเพิ่ม
          </p>
        </div>
        <div className="rounded-card-lg border border-[#EEF0F4] bg-surface-light p-[20px_22px]">
          <h2 className="m-0 mb-3 text-[15px]">สำรวจหมวดอื่น ๆ</h2>
          <div className="flex flex-col gap-[9px]">
            <Link
              href="/tools"
              className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-card p-[11px_13px] text-inherit no-underline hover:border-[#C6C9FB]"
            >
              <span className="flex-1 text-[13.5px] text-ink-secondary">
                เครื่องมือครูใช้สดในคาบเรียน ใช้ฟรี
              </span>
              <span className="flex-none text-[12.5px] font-semibold text-primary">
                เปิดใช้ ›
              </span>
            </Link>
            <Link
              href="/apps"
              className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-card p-[11px_13px] text-inherit no-underline hover:border-[#C6C9FB]"
            >
              <span className="flex-1 text-[13.5px] text-ink-secondary">
                แอปช่วยงานครู เช็กชื่อ ออมเงิน โฮมรูม
              </span>
              <span className="flex-none text-[12.5px] font-semibold text-primary">
                เปิดใช้ ›
              </span>
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-card p-[11px_13px] text-inherit no-underline hover:border-[#C6C9FB]"
            >
              <span className="flex-1 text-[13.5px] text-ink-secondary">
                ร้านค้าครู อุปกรณ์ห้องเรียนแนะนำ
              </span>
              <span className="flex-none text-[12.5px] font-semibold text-primary">
                ดูสินค้า ›
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile-only footer link */}
      <div className="border-t border-border bg-surface-light px-4 pb-7 pt-[22px] md:hidden">
        <h2 className="m-0 mb-2 text-[15px]">อยากได้เครื่องมือใช้สดในคาบ</h2>
        <Link href="/tools" className="text-[13px] text-primary no-underline">
          ดูเครื่องมือครูทั้งหมด ›
        </Link>
      </div>
    </main>
  );
}
