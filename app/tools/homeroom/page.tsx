import type { Metadata } from "next";
import Link from "next/link";
import HomeroomApp from "./HomeroomApp";
import ToolLandingContent from "../_components/ToolLandingContent";

const PAGE_URL = "https://www.khuncool.com/tools/homeroom";

const HOWTO_STEPS = [
  { name: "สร้างห้องและกำหนดช่วงเวลา", text: "เพิ่มชื่อห้อง ภาคเรียน และช่วงวันที่ที่ต้องการใช้บันทึกกิจกรรมโฮมรูม" },
  { name: "เพิ่มหัวข้อโฮมรูม", text: "เขียนหัวข้อ สาระสำคัญ และสิ่งที่สังเกตได้ในแต่ละวันหรือวางแผนล่วงหน้าเป็นรายสัปดาห์" },
  { name: "ทบทวนและแก้ไขบันทึก", text: "ย้อนดูรายการเดิม เติมรายละเอียด และตรวจความถูกต้องก่อนนำไปจัดทำเอกสาร" },
  { name: "พิมพ์หรือส่งออกเอกสาร", text: "พิมพ์สรุปเป็น PDF หรือส่งออก Excel เพื่อจัดเก็บเป็นหลักฐานประจำชั้นและเอกสารสิ้นเทอม" },
];

const USE_CASES = [
  { icon: "🌤️", title: "บันทึกกิจกรรมหน้าเสาธง", text: "จดประเด็นสำคัญและสิ่งที่พบหลังพูดคุยกับนักเรียนในแต่ละวัน" },
  { icon: "🗓️", title: "วางแผนหัวข้อตลอดภาคเรียน", text: "เตรียมหัวข้อด้านการปรับตัว ความปลอดภัย สุขภาวะ และการเรียนเป็นรายสัปดาห์" },
  { icon: "📝", title: "เก็บหลักฐานประจำชั้น", text: "รวบรวมข้อเท็จจริงและการติดตามผลอย่างเป็นระบบโดยหลีกเลี่ยงข้อมูลอ่อนไหวเกินจำเป็น" },
  { icon: "📚", title: "จัดชุดเอกสารสิ้นเทอม", text: "พิมพ์หรือส่งออกข้อมูลเพื่อรวมกับเอกสารเช็กชื่อและกิจกรรมประจำชั้น" },
];

const FAQS = [
  { q: "ระบบบันทึกโฮมรูมใช้ฟรีไหม", a: "ใช้ฟรี สามารถสร้างหัวข้อ บันทึกรายวัน และพิมพ์หรือส่งออกข้อมูลได้" },
  { q: "วางแผนหัวข้อล่วงหน้าได้ไหม", a: "ได้ สามารถเตรียมหัวข้อเป็นรายวันหรือรายสัปดาห์ แล้วกลับมาเติมบันทึกหลังทำกิจกรรม" },
  { q: "พิมพ์เอกสารสิ้นเทอมได้ไหม", a: "ได้ สามารถจัดข้อมูลที่บันทึกไว้เพื่อพิมพ์เป็น PDF หรือส่งออกเป็นไฟล์ Excel" },
  { q: "ควรบันทึกข้อมูลนักเรียนแบบใด", a: "ควรจดข้อเท็จจริงที่จำเป็นต่อการติดตามและหลีกเลี่ยงการตีตรา การวินิจฉัย หรือรายละเอียดส่วนตัวที่ไม่จำเป็น" },
];

export const metadata: Metadata = {
  title: "บันทึกโฮมรูม ออนไลน์ ใช้ฟรี พิมพ์เอกสารสิ้นเทอมได้ | khuncool",
  description:
    "บันทึกโฮมรูมรายห้องต่อเนื่อง พิมพ์เอกสารสิ้นเทอมและส่งออกไฟล์ Excel ได้ทันที ใช้ฟรี ล็อกอินแล้วซิงก์ทุกเครื่อง",
  alternates: {
    canonical: "https://www.khuncool.com/tools/homeroom",
  },
  openGraph: {
    type: "website",
    title: "บันทึกโฮมรูม ออนไลน์ ใช้ฟรี พิมพ์เอกสารสิ้นเทอมได้ | khuncool",
    description:
      "บันทึกโฮมรูมรายห้องต่อเนื่อง พิมพ์เอกสารสิ้นเทอมและส่งออกไฟล์ Excel ได้ทันที ใช้ฟรี",
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
      description: "บันทึกโฮมรูมรายห้องต่อเนื่อง พิมพ์เอกสารสิ้นเทอมได้ ใช้ฟรี",
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
