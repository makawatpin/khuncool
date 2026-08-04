import type { Metadata } from "next";
import Link from "next/link";
import AttendanceApp from "./AttendanceApp";
import ToolLandingContent from "../_components/ToolLandingContent";

const PAGE_URL = "https://www.khuncool.com/tools/attendance";

const HOWTO_STEPS = [
  { name: "เพิ่มห้องและรายชื่อนักเรียน", text: "สร้างห้องเรียนแล้วพิมพ์รายชื่อ หรือวางรายชื่อทีละหลายบรรทัดจาก Excel และ Google Sheets" },
  { name: "เลือกวันที่และเช็กสถานะ", text: "เลือกวันเรียนแล้วบันทึกสถานะ มา สาย ลา หรือขาด ให้กับนักเรียนแต่ละคน" },
  { name: "ตรวจและแก้ไขข้อมูล", text: "ย้อนดูข้อมูลรายวัน แก้สถานะที่บันทึกผิด และตรวจจำนวนมาเรียนก่อนสรุป" },
  { name: "พิมพ์หรือส่งออก", text: "พิมพ์บัญชีเรียกชื่อเป็น PDF หรือส่งออกไฟล์ Excel เพื่อเก็บสำรองและใช้งานต่อ" },
];

const USE_CASES = [
  { icon: "✅", title: "เช็กชื่อประจำวัน", text: "บันทึกสถานะนักเรียนรายคนและย้อนดูข้อมูลของแต่ละวันได้จากหน้าเดียว" },
  { icon: "📊", title: "สรุปการมาเรียน", text: "ตรวจจำนวนมา สาย ลา และขาด เพื่อใช้ติดตามการเข้าเรียนอย่างต่อเนื่อง" },
  { icon: "📄", title: "เตรียมเอกสารประจำชั้น", text: "พิมพ์บัญชีเรียกชื่อหรือส่งออก Excel สำหรับจัดเก็บและตรวจสอบภายหลัง" },
  { icon: "🔄", title: "ใช้งานหลายอุปกรณ์", text: "ล็อกอินเพื่อซิงก์ข้อมูลและเปิดใช้งานต่อจากอุปกรณ์อื่นได้" },
];

const FAQS = [
  { q: "เช็กชื่อนักเรียนออนไลน์ใช้ฟรีไหม", a: "ใช้ฟรี สามารถสร้างห้อง เพิ่มรายชื่อ เช็กสถานะ และพิมพ์หรือส่งออกข้อมูลได้" },
  { q: "ส่งออกเป็นไฟล์ Excel ได้ไหม", a: "ได้ สามารถส่งออกข้อมูลเพื่อเก็บสำรอง ตรวจสอบ หรือใช้งานต่อใน Excel ได้" },
  { q: "รองรับสถานะอะไรบ้าง", a: "รองรับสถานะมา สาย ลา และขาด โดยเลือกและแก้ไขสถานะรายคนได้" },
  { q: "ข้อมูลจะหายเมื่อเปลี่ยนเครื่องไหม", a: "ข้อมูลที่บันทึกในเครื่องจะอยู่ในเบราว์เซอร์เดิม หากต้องการใช้หลายเครื่องให้ล็อกอินเพื่อซิงก์ข้อมูลหรือส่งออกไฟล์สำรอง" },
];

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
    images: ["https://www.khuncool.com/assets/attendance-cover.webp"],
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
        { "@type": "ListItem", position: 3, name: "เช็กชื่อนักเรียน", item: PAGE_URL },
      ],
    },
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
      "@type": "HowTo",
      name: "วิธีใช้ระบบเช็กชื่อนักเรียนออนไลน์",
      inLanguage: "th",
      step: HOWTO_STEPS.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.name, text: step.text })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
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

      <ToolLandingContent
        steps={HOWTO_STEPS}
        useCases={USE_CASES}
        faqs={FAQS}
        related={[
          { label: "รวม 10 เครื่องมือครูออนไลน์", href: "/blog/10-free-teaching-tools" },
          { label: "บันทึกโฮมรูม", href: "/tools/homeroom" },
          { label: "บันทึกออมเงินนักเรียน", href: "/tools/savings" },
          { label: "เครื่องมือครูทั้งหมด", href: "/tools" },
        ]}
      />
    </main>
  );
}
