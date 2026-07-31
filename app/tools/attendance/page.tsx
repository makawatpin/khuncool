import type { Metadata } from "next";
import Link from "next/link";
import AttendanceApp from "./AttendanceApp";

export const metadata: Metadata = {
  title: "เช็กชื่อนักเรียนออนไลน์ ใช้ฟรี ส่งออกไฟล์ Excel | khuncool",
  description:
    "เช็กชื่อนักเรียนออนไลน์ บันทึกรายห้องต่อเนื่อง พิมพ์ใบเช็กชื่อและส่งออกไฟล์ Excel ได้ทันที ใช้ฟรี ล็อกอินแล้วซิงก์ทุกเครื่อง",
  alternates: {
    canonical: "https://www.khuncool.com/tools/attendance",
  },
  openGraph: {
    type: "website",
    title: "เช็กชื่อนักเรียนออนไลน์ ใช้ฟรี ส่งออกไฟล์ Excel | khuncool",
    description:
      "เช็กชื่อนักเรียนออนไลน์ บันทึกรายห้องต่อเนื่อง พิมพ์ใบเช็กชื่อและส่งออกไฟล์ Excel ได้ทันที ใช้ฟรี",
    url: "https://www.khuncool.com/tools/attendance",
    images: ["https://www.khuncool.com/assets/attendance-cover.png"],
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
      name: "เช็กชื่อนักเรียน Khuncool",
      url: "https://www.khuncool.com/tools/attendance",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "เช็กชื่อนักเรียนออนไลน์ บันทึกรายห้องต่อเนื่อง ส่งออกไฟล์ Excel ใช้ฟรี",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "เช็กชื่อนักเรียนใช้ฟรีไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ใช้ฟรีทั้งหมด ล็อกอินแล้วซิงก์ข้อมูลได้ทุกเครื่อง",
          },
        },
        {
          "@type": "Question",
          name: "ส่งออกเป็นไฟล์ Excel ได้ไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ได้ กดพิมพ์หรือส่งออกไฟล์ Excel ได้ทันที",
          },
        },
      ],
    },
  ],
};

export default function AttendancePage() {
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
          <Link href="/apps" className="text-ink-faint">
            แอปครู
          </Link>
          <span>›</span>
          <span
            className="font-semibold text-ink-secondary"
            aria-current="page"
          >
            เช็กชื่อ
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          เช็กชื่อนักเรียน
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            เช็กชื่อรายวัน มา/สาย/ลา/ขาด นำเข้า-ส่งออก Excel
            และพิมพ์ใบเช็กชื่อได้
          </span>
          <span className="hidden md:inline">
            เช็กชื่อนักเรียนรายวัน บันทึกอัตโนมัติในเครื่องนี้ นำเข้า/ส่งออกไฟล์
            Excel เพื่อใช้งานต่อบนเครื่องอื่น หรือพิมพ์บัญชีเรียกชื่อเป็น PDF
            ได้ทันที
          </span>
        </p>
      </div>

      {/* Attendance app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <AttendanceApp />
      </div>
    </main>
  );
}
