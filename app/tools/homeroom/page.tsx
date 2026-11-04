import type { Metadata } from "next";
import Link from "next/link";
import HomeroomApp from "./HomeroomApp";
import ToolLandingContent from "../_components/ToolLandingContent";

const PAGE_URL = "https://www.khuncool.com/tools/homeroom";

const HOWTO_STEPS = [
  { name: "ตั้งหัวแบบฟอร์มและรายชื่อ", text: "ใส่ชื่อโรงเรียน ชั้น ภาคเรียน ปีการศึกษา และครูที่ปรึกษา แล้วนำเข้ารายชื่อนักเรียนจาก Excel หรือใช้รายชื่อจาก “ห้องเรียนของฉัน”" },
  { name: "เพิ่มวันและติ๊กหัวข้อ", text: "กด “+ บันทึกวันนี้” หรือเพิ่มทั้งสัปดาห์ จันทร์–ศุกร์ แล้วติ๊กหัวข้อที่อบรม เช่น คุณลักษณะอันพึงประสงค์ 8 ข้อ หรือหัวข้อที่ตั้งเอง" },
  { name: "ดึงการมาเรียนและวางแผนล่วงหน้า", text: "กดดึงจากเช็กชื่อเพื่อใส่จำนวนคนมา/ขาดของวันนั้นให้อัตโนมัติ และตั้งแผนหัวข้อรายสัปดาห์ไว้ล่วงหน้าได้" },
  { name: "พิมพ์หรือส่งออกเอกสาร", text: "พิมพ์แบบบันทึกโฮมรูม ส่งออก Excel หรือพิมพ์ชุดเอกสารสิ้นเทอมที่รวมบันทึกโฮมรูม สรุปการมาเรียนทั้งภาคเรียน และเงินออมไว้ในไฟล์เดียว" },
];

const USE_CASES = [
  { icon: "🌤️", title: "บันทึกโฮมรูมประจำวัน", text: "ติ๊กหัวข้อที่อบรม จดหมายเหตุ และจำนวนคนมา/ขาดของแต่ละวันจากหน้าเดียว ใช้จากมือถือได้" },
  { icon: "🗓️", title: "วางแผนหัวข้อรายสัปดาห์", text: "ตั้งหัวข้อของแต่ละสัปดาห์ล่วงหน้า วันที่เพิ่มใหม่ในสัปดาห์นั้นจะติ๊กหัวข้อให้เอง" },
  { icon: "✅", title: "เชื่อมกับเช็กชื่อ", text: "ดึงจำนวนคนมา/ขาดและรายชื่อคนขาดของวันนั้นจากแอปเช็กชื่อ ไม่ต้องนับซ้ำ" },
  { icon: "📚", title: "ชุดเอกสารสิ้นเทอม", text: "รวมบันทึกโฮมรูม สรุปการมาเรียนรายคนทั้งภาคเรียน และสรุปเงินออม พร้อมพิมพ์ส่งในคลิกเดียว" },
];

const FAQS = [
  { q: "ระบบบันทึกโฮมรูมใช้ฟรีไหม", a: "ใช้ฟรี ตั้งหัวข้อ บันทึกรายวัน พิมพ์แบบฟอร์ม ส่งออก Excel และพิมพ์ชุดเอกสารสิ้นเทอมได้ทั้งหมด" },
  { q: "วางแผนหัวข้อล่วงหน้าได้ไหม", a: "ได้ ตั้งแผนหัวข้อเป็นรายสัปดาห์ วันที่เพิ่มในสัปดาห์นั้นจะติ๊กหัวข้อตามแผนให้อัตโนมัติ และแก้ทีหลังได้" },
  { q: "ชุดเอกสารสิ้นเทอมมีอะไรบ้าง", a: "มีบันทึกโฮมรูมทั้งภาคเรียน สรุปการมาเรียนรายคน (มา สาย ลา ขาด และ % มาเรียน) จากแอปเช็กชื่อ ตามภาคเรียนและปีการศึกษาที่ตั้งไว้ และสรุปเงินออมจากแอปออมเงิน" },
  { q: "ควรบันทึกข้อมูลนักเรียนแบบใด", a: "ควรจดข้อเท็จจริงที่จำเป็นต่อการติดตามและหลีกเลี่ยงการตีตรา การวินิจฉัย หรือรายละเอียดส่วนตัวที่ไม่จำเป็น" },
];

export const metadata: Metadata = {
  title: "บันทึกโฮมรูม พิมพ์ชุดเอกสารสิ้นเทอม พร้อมสรุปการมาเรียน ฟรี | khuncool",
  description:
    "บันทึกโฮมรูมรายวัน ติ๊กหัวข้อ วางแผนรายสัปดาห์ ดึงการมาเรียนจากเช็กชื่อ พิมพ์แบบฟอร์มและชุดเอกสารสิ้นเทอมพร้อมสรุปการมาเรียนทั้งภาคเรียน ใช้ฟรี ล็อกอินแล้วซิงก์ทุกเครื่อง",
  alternates: {
    canonical: "https://www.khuncool.com/tools/homeroom",
  },
  openGraph: {
    type: "website",
    title: "บันทึกโฮมรูม พิมพ์ชุดเอกสารสิ้นเทอม พร้อมสรุปการมาเรียน ฟรี | khuncool",
    description:
      "บันทึกโฮมรูมรายวัน วางแผนรายสัปดาห์ พิมพ์แบบฟอร์มและชุดเอกสารสิ้นเทอมพร้อมสรุปการมาเรียน ใช้ฟรี",
    url: "https://www.khuncool.com/tools/homeroom",
    images: ["https://www.khuncool.com/assets/homeroom-cover.webp"],
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
        { "@type": "ListItem", position: 3, name: "บันทึกโฮมรูม", item: PAGE_URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: "บันทึกโฮมรูม Khuncool",
      url: "https://www.khuncool.com/tools/homeroom",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "บันทึกโฮมรูมรายวัน วางแผนหัวข้อรายสัปดาห์ พิมพ์ชุดเอกสารสิ้นเทอมพร้อมสรุปการมาเรียนทั้งภาคเรียน ใช้ฟรี",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้ระบบบันทึกโฮมรูมออนไลน์",
      inLanguage: "th",
      step: HOWTO_STEPS.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.name, text: step.text })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
    },
  ],
};

export default function HomeroomPage() {
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
            บันทึกโฮมรูม
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          บันทึกโฮมรูม
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            บันทึกโฮมรูมหน้าเสาธง ใช้จากมือถือได้ทันที
            บันทึกอัตโนมัติในเครื่องนี้
          </span>
          <span className="hidden md:inline">
            ตั้งหัวข้อโฮมรูมเอง วางแผนล่วงหน้ารายสัปดาห์
            พิมพ์/ส่งออกเป็นแบบฟอร์มราชการ หรือรวมกับสรุปการมาเรียนและเงินออม
            เป็นชุดเอกสารสิ้นเทอมได้ในคลิกเดียว
          </span>
        </p>
        <Link
          href="/blog/homeroom-log-topics"
          className="mt-3 inline-flex rounded-pill bg-[#ECEDFE] px-3 py-2 text-[12.5px] font-semibold text-primary no-underline hover:bg-[#E1E3FD]"
        >
          อ่านตัวอย่างหัวข้อบันทึกโฮมรูมตลอดภาคเรียน ›
        </Link>
      </div>

      {/* Homeroom app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <HomeroomApp />
      </div>

      <ToolLandingContent
        steps={HOWTO_STEPS}
        useCases={USE_CASES}
        faqs={FAQS}
        related={[
          { label: "ตัวอย่างหัวข้อบันทึกโฮมรูม", href: "/blog/homeroom-log-topics" },
          { label: "เช็กชื่อนักเรียน", href: "/tools/attendance" },
          { label: "บันทึกออมเงินนักเรียน", href: "/tools/savings" },
          { label: "เครื่องมือครูทั้งหมด", href: "/tools" },
        ]}
      />
    </main>
  );
}
