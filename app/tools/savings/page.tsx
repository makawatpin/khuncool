import type { Metadata } from "next";
import Link from "next/link";
import SavingsApp from "./SavingsApp";
import ToolLandingContent from "../_components/ToolLandingContent";

const PAGE_URL = "https://www.khuncool.com/tools/savings";

const HOWTO_STEPS = [
  { name: "สร้างห้องและเพิ่มรายชื่อ", text: "เพิ่มห้องเรียนแล้วพิมพ์หรือวางรายชื่อนักเรียนจาก Excel และ Google Sheets" },
  { name: "บันทึกรายการฝากหรือถอน", text: "เลือกนักเรียน วันที่ และจำนวนเงิน แล้วบันทึกรายการตามหลักฐานที่ได้รับ" },
  { name: "ตรวจยอดและประวัติ", text: "ตรวจยอดคงเหลือรายคนและย้อนดูประวัติรายการ เพื่อแก้ไขความคลาดเคลื่อนก่อนสรุป" },
  { name: "พิมพ์หรือส่งออกข้อมูล", text: "พิมพ์ใบบันทึกออมเงินเป็น PDF หรือส่งออก Excel สำหรับตรวจสอบและเก็บสำรอง" },
];

const USE_CASES = [
  { icon: "💰", title: "กิจกรรมออมเงินประจำห้อง", text: "บันทึกยอดฝากรายคนอย่างต่อเนื่องและดูยอดคงเหลือได้จากหน้าเดียว" },
  { icon: "🔎", title: "ตรวจสอบรายการย้อนหลัง", text: "ย้อนดูวันที่และจำนวนเงินของแต่ละรายการเพื่อช่วยตรวจยอดร่วมกับหลักฐาน" },
  { icon: "🧾", title: "พิมพ์เอกสารรายห้อง", text: "จัดทำใบบันทึกหรือสรุปยอดสำหรับตรวจสอบและสื่อสารกับผู้เกี่ยวข้อง" },
  { icon: "📊", title: "ส่งออกเพื่อสรุปผล", text: "นำข้อมูลออกเป็น Excel เพื่อสำรอง ตรวจทาน หรือจัดรูปแบบรายงานเพิ่มเติม" },
];

const FAQS = [
  { q: "ระบบบันทึกออมเงินนักเรียนใช้ฟรีไหม", a: "ใช้ฟรี สามารถบันทึกรายการ ตรวจยอด พิมพ์เอกสาร และส่งออกข้อมูลได้" },
  { q: "พิมพ์ใบบันทึกออมเงินได้ไหม", a: "ได้ สามารถพิมพ์ข้อมูลเป็น PDF หรือส่งออกเป็น Excel เพื่อจัดเก็บและตรวจสอบ" },
  { q: "รองรับรายการถอนเงินไหม", a: "รองรับทั้งรายการฝากและถอน พร้อมประวัติรายการรายคนเพื่อใช้ตรวจยอดย้อนหลัง" },
  { q: "ควรใช้ระบบนี้แทนหลักฐานทางการเงินทั้งหมดหรือไม่", a: "ไม่ควร ควรใช้ร่วมกับใบรับเงิน สมุดบัญชี หรือหลักฐานตามระเบียบของโรงเรียน และตรวจยอดกับผู้เกี่ยวข้องอย่างสม่ำเสมอ" },
];

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
    images: ["https://www.khuncool.com/assets/savings-cover.webp"],
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
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "แอปครู", item: "https://www.khuncool.com/apps" },
        { "@type": "ListItem", position: 3, name: "บันทึกออมเงินนักเรียน", item: PAGE_URL },
      ],
    },
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
      "@type": "HowTo",
      name: "วิธีใช้ระบบบันทึกออมเงินนักเรียนออนไลน์",
      inLanguage: "th",
      step: HOWTO_STEPS.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.name, text: step.text })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
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
            ออมเงิน
          </span>
        </div>
      </nav>

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
        <Link
          href="/blog/student-savings-activity"
          className="mt-3 inline-flex rounded-pill bg-[#ECEDFE] px-3 py-2 text-[12.5px] font-semibold text-primary no-underline hover:bg-[#E1E3FD]"
        >
          อ่านแนวทางจัดกิจกรรมออมเงินและตรวจยอดอย่างโปร่งใส ›
        </Link>
      </div>

      {/* Savings app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <SavingsApp />
      </div>

      <ToolLandingContent
        steps={HOWTO_STEPS}
        useCases={USE_CASES}
        faqs={FAQS}
        related={[
          { label: "แนวทางจัดกิจกรรมออมเงิน", href: "/blog/student-savings-activity" },
          { label: "เช็กชื่อนักเรียน", href: "/tools/attendance" },
          { label: "บันทึกโฮมรูม", href: "/tools/homeroom" },
          { label: "เครื่องมือครูทั้งหมด", href: "/tools" },
        ]}
      />
    </main>
  );
}
