import type { Metadata } from "next";
import Link from "next/link";
import SavingsApp from "./SavingsApp";

export const metadata: Metadata = {
  title: "บันทึกออมเงินนักเรียน ออนไลน์ ใช้ฟรี ส่งออก Excel | khuncool",
  description:
    "บันทึกเงินออมนักเรียนรายห้องรายคน พิมพ์ใบบันทึกออมเงินและส่งออกไฟล์ Excel ได้ทันที ใช้ฟรี ล็อกอินแล้วซิงก์ทุกเครื่อง",
  alternates: {
    canonical: "https://www.khuncool.com/tools/savings",
  },
  openGraph: {
    type: "website",
    title: "บันทึกออมเงินนักเรียน ออนไลน์ ใช้ฟรี ส่งออก Excel | khuncool",
    description:
      "บันทึกเงินออมนักเรียนรายห้องรายคน พิมพ์ใบบันทึกออมเงินและส่งออกไฟล์ Excel ได้ทันที ใช้ฟรี",
    url: "https://www.khuncool.com/tools/savings",
    images: ["https://www.khuncool.com/assets/savings-cover.png"],
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
      "@type": "WebApplication",
      name: "บันทึกออมเงินนักเรียน Khuncool",
      url: "https://www.khuncool.com/tools/savings",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "บันทึกเงินออมนักเรียนรายห้องรายคน ส่งออกไฟล์ Excel ใช้ฟรี",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "บันทึกออมเงินใช้ฟรีไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ใช้ฟรีทั้งหมด ล็อกอินแล้วซิงก์ข้อมูลได้ทุกเครื่อง",
          },
        },
        {
          "@type": "Question",
          name: "พิมพ์ใบบันทึกออมเงินได้ไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ได้ พิมพ์เป็นเอกสารรายห้องได้ทันที",
          },
        },
      ],
    },
  ],
};

export default function SavingsPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
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
        <Link href="/apps" className="text-ink-faint">
          แอปครู
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">ออมเงิน</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          ออมเงินนักเรียน
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            บันทึกเงินออมรายคนรายห้อง ฝาก/ถอน ดูประวัติ นำเข้า-ส่งออก Excel
            และพิมพ์สมุดบัญชีได้
          </span>
          <span className="hidden md:inline">
            บันทึกเงินออมนักเรียนรายห้องรายคน บันทึกอัตโนมัติในเครื่องนี้
            นำเข้า/ส่งออกไฟล์ Excel เพื่อใช้งานต่อบนเครื่องอื่น
            หรือพิมพ์สมุดบัญชีเป็น PDF ได้ทันที
          </span>
        </p>
      </div>

      {/* Savings app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <SavingsApp />
      </div>
    </main>
  );
}
