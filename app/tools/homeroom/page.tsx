import type { Metadata } from "next";
import Link from "next/link";
import HomeroomApp from "./HomeroomApp";

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
    images: ["https://www.khuncool.com/assets/homeroom-cover.png"],
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
      name: "บันทึกโฮมรูม Khuncool",
      url: "https://www.khuncool.com/tools/homeroom",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "บันทึกโฮมรูมรายห้องต่อเนื่อง พิมพ์เอกสารสิ้นเทอมได้ ใช้ฟรี",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "บันทึกโฮมรูมใช้ฟรีไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ใช้ฟรีทั้งหมด ล็อกอินแล้วซิงก์ข้อมูลได้ทุกเครื่อง",
          },
        },
        {
          "@type": "Question",
          name: "พิมพ์เอกสารสิ้นเทอมได้ไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ได้ พิมพ์เอกสารสิ้นเทอมจากข้อมูลที่บันทึกไว้ได้ทันที",
          },
        },
      ],
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
      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">
          หน้าแรก
        </Link>
        <span>›</span>
        <Link href="/apps" className="text-ink-faint">
          แอปครู
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">บันทึกโฮมรูม</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          บันทึกโฮมรูม
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            บันทึกโฮมรูมหน้าเสาธง ใช้จากมือถือได้ทันที บันทึกอัตโนมัติในเครื่องนี้
          </span>
          <span className="hidden md:inline">
            ตั้งหัวข้อโฮมรูมเอง วางแผนล่วงหน้ารายสัปดาห์
            พิมพ์/ส่งออกเป็นแบบฟอร์มราชการ หรือรวมกับสรุปการมาเรียนและเงินออม
            เป็นชุดเอกสารสิ้นเทอมได้ในคลิกเดียว
          </span>
        </p>
      </div>

      {/* Homeroom app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <HomeroomApp />
      </div>
    </main>
  );
}
