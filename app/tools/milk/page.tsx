import type { Metadata } from "next";
import Link from "next/link";
import DailyCheckApp from "../_daily-check/DailyCheckApp";
import ToolLandingContent from "../_components/ToolLandingContent";

const PAGE_URL = "https://www.khuncool.com/tools/milk";

const HOWTO_STEPS = [
  { name: "เพิ่มห้องและรายชื่อนักเรียน", text: "พิมพ์รายชื่อ วางรายชื่อจาก Excel หรือ Google Sheets หรือใช้รายชื่อจากห้องเรียนที่ตั้งไว้ในแอปเช็กชื่อและออมเงิน" },
  { name: "บันทึกตอนแจกนม", text: "กด “ดื่มครบทุกคน” ครั้งเดียว แล้วแตะ ✗ ให้คนที่ไม่ดื่ม ถ้าเช็กชื่อวันนี้แล้ว คนที่ขาดหรือลาจะได้ ✗ ให้อัตโนมัติ" },
  { name: "ย้อนดูหรือแก้รายวัน", text: "เลือกวันด้วยปุ่ม ‹ › แต่ละวันบันทึกแยกกัน ย้อนไปแก้วันก่อนได้ และตั้งวันหยุดนักขัตฤกษ์ได้" },
  { name: "พิมพ์ตารางรายเดือน", text: "เปิดแท็บตารางรายเดือน พิมพ์แบบฟอร์ม A4 แนวนอนครบ 1–31 วัน มียอดคนดื่มแต่ละวันและช่องลงชื่อ หรือส่งออกไฟล์ Excel" },
];

const USE_CASES = [
  { icon: "🥛", title: "นมโรงเรียนประจำวัน", text: "บันทึกทั้งห้องในไม่กี่วินาที กดดื่มครบทุกคนแล้วแตะเฉพาะคนที่ไม่ดื่ม" },
  { icon: "🗓", title: "ตารางรายเดือน", text: "ดู ✓ / ✗ ของทุกวันในเดือนเดียว พร้อม % รายคน และรายชื่อเด็กที่ไม่ดื่มบ่อยที่ควรติดตาม" },
  { icon: "📄", title: "ส่งรายงานอาหารเสริม (นม)", text: "พิมพ์แบบฟอร์ม A4 แนวนอน มียอดคนดื่มของแต่ละวัน พร้อมช่องลงชื่อครูประจำชั้นและผู้บริหาร" },
  { icon: "🔄", title: "ใช้งานหลายอุปกรณ์", text: "ล็อกอินเพื่อซิงก์ข้อมูลและเปิดใช้งานต่อจากอุปกรณ์อื่นได้" },
];

const FAQS = [
  { q: "บันทึกการดื่มนมโรงเรียนออนไลน์ใช้ฟรีไหม", a: "ใช้ฟรี สร้างรายชื่อ บันทึกรายวัน ดูตารางรายเดือน พิมพ์และส่งออก Excel ได้ทั้งหมด" },
  { q: "พิมพ์รายงานการดื่มนมรายเดือนได้ไหม", a: "ได้ แท็บตารางรายเดือนพิมพ์เป็นแบบฟอร์ม A4 แนวนอน มีครบทุกวันของเดือน เสาร์-อาทิตย์และวันหยุดเป็นช่องสีเทา มียอดคนดื่มแต่ละวัน % รายคน และช่องลงชื่อ" },
  { q: "นักเรียนที่ไม่มาเรียนบันทึกอย่างไร", a: "นับเป็นไม่ดื่ม (✗) ถ้าเช็กชื่อในแอปเช็กชื่อของวันนั้นแล้ว คนที่ขาดหรือลาจะได้ ✗ ให้อัตโนมัติเมื่อกดดื่มครบทุกคน" },
  { q: "วันหยุดนักขัตฤกษ์ทำอย่างไร", a: "เลือกวันนั้นแล้วกดตั้งเป็นวันหยุด วันนั้นจะไม่นับใน % และเป็นช่องสีเทาในตารางและใบพิมพ์" },
  { q: "ข้อมูลจะหายเมื่อเปลี่ยนเครื่องไหม", a: "ข้อมูลที่บันทึกในเครื่องจะอยู่ในเบราว์เซอร์เดิม หากต้องการใช้หลายเครื่องให้ล็อกอินเพื่อซิงก์ข้อมูลหรือส่งออกไฟล์สำรอง" },
];

export const metadata: Metadata = {
  title: "บันทึกการดื่มนมโรงเรียน รายวัน-รายเดือน พิมพ์แบบฟอร์มได้ ฟรี | khuncool",
  description:
    "บันทึกการดื่มนมโรงเรียนรายวัน ดูตารางรายเดือนพร้อมยอดคนดื่มและ % รายคน พิมพ์แบบฟอร์ม A4 พร้อมช่องลงชื่อ ส่งออก Excel ใช้ฟรี ล็อกอินแล้วซิงก์ทุกเครื่อง",
  alternates: {
    canonical: "https://www.khuncool.com/tools/milk",
  },
  openGraph: {
    type: "website",
    title: "บันทึกการดื่มนมโรงเรียน รายวัน-รายเดือน พิมพ์แบบฟอร์มได้ ฟรี | khuncool",
    description:
      "บันทึกการดื่มนมโรงเรียนรายวัน ดูตารางรายเดือน พิมพ์แบบฟอร์ม A4 และส่งออก Excel ใช้ฟรี",
    url: "https://www.khuncool.com/tools/milk",
    images: ["https://www.khuncool.com/assets/milk-cover.webp"],
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
        { "@type": "ListItem", position: 3, name: "บันทึกการดื่มนม", item: PAGE_URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "บันทึกการดื่มนม Khuncool",
      url: "https://www.khuncool.com/tools/milk",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "บันทึกการดื่มนมโรงเรียนรายวันและตารางรายเดือน พิมพ์แบบฟอร์มและส่งออกไฟล์ Excel ใช้ฟรี",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้ระบบบันทึกการดื่มนมโรงเรียนออนไลน์",
      inLanguage: "th",
      step: HOWTO_STEPS.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.name, text: step.text })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
    },
  ],
};

export default function MilkPage() {
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
            บันทึกการดื่มนม
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          บันทึกการดื่มนม
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            บันทึกดื่มนมรายวัน ✓/✗ ดูตารางรายเดือน
            และพิมพ์แบบฟอร์มได้
          </span>
          <span className="hidden md:inline">
            บันทึกการดื่มนมโรงเรียนรายวัน ดูตารางรายเดือนพร้อมยอดคนดื่มและ %
            รายคน พิมพ์แบบฟอร์ม A4 พร้อมช่องลงชื่อ หรือส่งออก Excel
            บันทึกอัตโนมัติในเครื่องนี้ ล็อกอินเพื่อซิงก์ทุกเครื่อง
          </span>
        </p>
      </div>

      {/* Milk record app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <DailyCheckApp kind="milk" />
      </div>

      <ToolLandingContent
        steps={HOWTO_STEPS}
        useCases={USE_CASES}
        faqs={FAQS}
        related={[
          { label: "รวม 10 เครื่องมือครูออนไลน์", href: "/blog/10-free-teaching-tools" },
          { label: "เช็กชื่อนักเรียน", href: "/tools/attendance" },
          { label: "บันทึกการแปรงฟัน", href: "/tools/toothbrushing" },
          { label: "บันทึกโฮมรูม", href: "/tools/homeroom" },
          { label: "บันทึกออมเงินนักเรียน", href: "/tools/savings" },
          { label: "เครื่องมือครูทั้งหมด", href: "/tools" },
        ]}
      />
    </main>
  );
}
