import type { Metadata } from "next";
import Link from "next/link";
import DailyCheckApp from "../_daily-check/DailyCheckApp";
import ToolLandingContent from "../_components/ToolLandingContent";

const PAGE_URL = "https://www.khuncool.com/tools/attendance";

const HOWTO_STEPS = [
  { name: "เพิ่มห้องและรายชื่อนักเรียน", text: "สร้างห้องเรียนแล้วพิมพ์รายชื่อ หรือวางรายชื่อทีละหลายบรรทัดจาก Excel และ Google Sheets" },
  { name: "เช็กชื่อประจำวัน", text: "กด “ทั้งหมดมา” ครั้งเดียว แล้วแตะ สาย ลา หรือขาด ให้คนที่ไม่ได้มาตรงเวลา" },
  { name: "ย้อนดูหรือแก้รายวัน", text: "เลือกวันด้วยปุ่ม ‹ › แต่ละวันบันทึกแยกกัน ย้อนไปแก้วันก่อนได้ และตั้งวันหยุดนักขัตฤกษ์ได้" },
  { name: "พิมพ์บัญชีเรียกชื่อรายเดือน", text: "เปิดแท็บตารางรายเดือน พิมพ์แบบฟอร์ม A4 แนวนอนครบ 1–31 วัน พร้อมยอด มา สาย ลา ขาด รายคนและช่องลงชื่อ หรือส่งออก Excel" },
];

const USE_CASES = [
  { icon: "✅", title: "เช็กชื่อประจำวัน", text: "บันทึก มา สาย ลา ขาด รายคน แต่ละวันเก็บแยกกัน ย้อนดูและแก้ไขวันก่อนได้" },
  { icon: "🗓", title: "บัญชีเรียกชื่อรายเดือน", text: "ดูทุกวันในเดือนเดียว พร้อม % มาเรียนรายคน และรายชื่อนักเรียนที่ขาดหรือลาบ่อยที่ควรติดตาม" },
  { icon: "🪥", title: "เชื่อมกับแปรงฟันและดื่มนม", text: "คนที่ขาดหรือลาในวันนั้นจะได้ ✗ ในบันทึกการแปรงฟันและการดื่มนมให้อัตโนมัติ" },
  { icon: "🔄", title: "ใช้งานหลายอุปกรณ์", text: "ล็อกอินเพื่อซิงก์ข้อมูลและเปิดใช้งานต่อจากอุปกรณ์อื่นได้" },
];

const FAQS = [
  { q: "เช็กชื่อนักเรียนออนไลน์ใช้ฟรีไหม", a: "ใช้ฟรี สร้างรายชื่อ เช็กชื่อรายวัน ดูตารางรายเดือน พิมพ์และส่งออก Excel ได้ทั้งหมด" },
  { q: "พิมพ์บัญชีเรียกชื่อรายเดือนได้ไหม", a: "ได้ แท็บตารางรายเดือนพิมพ์เป็นแบบฟอร์ม A4 แนวนอน มีครบทุกวันของเดือน ใช้สัญลักษณ์ / ส ล ข มียอด มา สาย ลา ขาด และ % มาเรียนรายคน พร้อมช่องลงชื่อ" },
  { q: "รองรับสถานะอะไรบ้าง", a: "รองรับสถานะมา สาย ลา และขาด โดยเลือกและแก้ไขสถานะรายคนได้ทุกวัน" },
  { q: "ข้อมูลเช็กชื่อเดิมจะหายไหม", a: "ไม่หาย ข้อมูลที่เช็กไว้ก่อนหน้านี้ถูกย้ายไปไว้ในวันที่บันทึกครั้งล่าสุดให้อัตโนมัติ" },
  { q: "ข้อมูลจะหายเมื่อเปลี่ยนเครื่องไหม", a: "ข้อมูลที่บันทึกในเครื่องจะอยู่ในเบราว์เซอร์เดิม หากต้องการใช้หลายเครื่องให้ล็อกอินเพื่อซิงก์ข้อมูลหรือส่งออกไฟล์สำรอง" },
];

export const metadata: Metadata = {
  title: "เช็กชื่อนักเรียนออนไลน์ รายวัน-รายเดือน พิมพ์บัญชีเรียกชื่อ ฟรี | khuncool",
  description:
    "เช็กชื่อนักเรียนออนไลน์ มา สาย ลา ขาด เก็บแยกรายวัน ดูตารางรายเดือนพร้อม % มาเรียนรายคน พิมพ์บัญชีเรียกชื่อ A4 และส่งออก Excel ใช้ฟรี ล็อกอินแล้วซิงก์ทุกเครื่อง",
  alternates: {
    canonical: "https://www.khuncool.com/tools/attendance",
  },
  openGraph: {
    type: "website",
    title: "เช็กชื่อนักเรียนออนไลน์ รายวัน-รายเดือน พิมพ์บัญชีเรียกชื่อ ฟรี | khuncool",
    description:
      "เช็กชื่อนักเรียนออนไลน์ เก็บแยกรายวัน ดูตารางรายเดือน พิมพ์บัญชีเรียกชื่อ A4 และส่งออก Excel ใช้ฟรี",
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
        "เช็กชื่อนักเรียนรายวันและบัญชีเรียกชื่อรายเดือน พิมพ์แบบฟอร์มและส่งออกไฟล์ Excel ใช้ฟรี",
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
            เช็กชื่อรายวัน มา/สาย/ลา/ขาด ดูตารางรายเดือน
            และพิมพ์บัญชีเรียกชื่อได้
          </span>
          <span className="hidden md:inline">
            เช็กชื่อนักเรียนรายวัน แต่ละวันเก็บแยกกัน ดูตารางรายเดือนพร้อม %
            มาเรียนรายคน พิมพ์บัญชีเรียกชื่อ A4 พร้อมช่องลงชื่อ หรือส่งออก Excel
            บันทึกอัตโนมัติในเครื่องนี้ ล็อกอินเพื่อซิงก์ทุกเครื่อง
          </span>
        </p>
      </div>

      {/* Attendance app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <DailyCheckApp kind="attendance" />
      </div>

      <ToolLandingContent
        steps={HOWTO_STEPS}
        useCases={USE_CASES}
        faqs={FAQS}
        related={[
          { label: "รวม 10 เครื่องมือครูออนไลน์", href: "/blog/10-free-teaching-tools" },
          { label: "บันทึกการแปรงฟัน", href: "/tools/toothbrushing" },
          { label: "บันทึกการดื่มนม", href: "/tools/milk" },
          { label: "บันทึกโฮมรูม", href: "/tools/homeroom" },
          { label: "บันทึกออมเงินนักเรียน", href: "/tools/savings" },
          { label: "เครื่องมือครูทั้งหมด", href: "/tools" },
        ]}
      />
    </main>
  );
}
