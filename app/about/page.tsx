import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | khuncool",
  description:
    "รู้จักทีมคูล (khuncool) ผู้อยู่เบื้องหลังเว็บไซต์รวมเครื่องมือครูและสื่อการสอนออนไลน์ฟรี ก่อตั้งโดยคุณอาวล์ เพื่อช่วยลดภาระงานครูไทย",
  alternates: {
    canonical: "https://www.khuncool.com/about",
  },
  openGraph: {
    type: "website",
    title: "เกี่ยวกับเรา | khuncool",
    description:
      "รู้จักทีมคูล (khuncool) ผู้อยู่เบื้องหลังเว็บไซต์รวมเครื่องมือครูและสื่อการสอนออนไลน์ฟรี",
    url: "https://www.khuncool.com/about",
    locale: "th_TH",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      name: "เกี่ยวกับเรา",
      url: "https://www.khuncool.com/about",
      inLanguage: "th",
      mainEntity: {
        "@type": "Organization",
        name: "khuncool",
        url: "https://www.khuncool.com/",
        logo: "https://www.khuncool.com/assets/khuncool-logo.png",
        email: "khuncoolhub@gmail.com",
        founder: {
          "@type": "Person",
          name: "อาวล์",
        },
      },
    },
  ],
};

export default function AboutPage() {
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
        <span className="font-semibold text-ink-secondary">เกี่ยวกับเรา</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          เกี่ยวกับ khuncool
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          ทีมคูล (khuncool) ก่อตั้งขึ้นเพื่อช่วยลดภาระงานของคุณครูไทย
          ด้วยเครื่องมือและสื่อการสอนออนไลน์ที่ใช้ได้ฟรี
        </p>
      </div>

      {/* Founder story */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <div className="mb-4 flex items-center gap-2.5">
          <Image
            src="/assets/khuncool-logo.png"
            alt="khuncool"
            width={36}
            height={36}
            className="flex-none object-contain"
          />
          <div>
            <div className="text-sm font-bold md:text-base">
              ทีมคูล เริ่มต้นโดยคุณอาวล์
            </div>
            <div className="text-[11.5px] text-ink-faint md:text-xs">
              ผู้ก่อตั้ง khuncool.com
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:max-w-[62ch] md:gap-3.5">
          <p className="m-0 text-[13.5px] leading-[1.75] text-ink-secondary md:text-[14.5px] md:leading-[1.8]">
            khuncool เริ่มต้นจากคุณอาวล์คนเดียว ซึ่งไม่ได้เป็นคุณครูและไม่ได้จบการศึกษาสายครุศาสตร์โดยตรง
            แต่ได้เข้ามาข้องเกี่ยวกับธุรกิจโรงเรียนของคุณพ่อ
            จนได้เห็นปัญหาที่คุณครูในโรงเรียนต้องเจอในแต่ละวันอย่างใกล้ชิด
          </p>
          <p className="m-0 text-[13.5px] leading-[1.75] text-ink-secondary md:text-[14.5px] md:leading-[1.8]">
            จากปัญหาที่เห็น จึงตัดสินใจสร้างเว็บไซต์นี้ขึ้นมา
            โดยมีเป้าหมายเดียวคือช่วยลดงานที่ไม่จำเป็นของคุณครู
            ให้คุณครูมีเวลาเหลือสำหรับการดูแลนักเรียนมากขึ้น
          </p>
          <p className="m-0 text-[13.5px] leading-[1.75] text-ink-secondary md:text-[14.5px] md:leading-[1.8]">
            เครื่องมือทุกตัวบนเว็บนี้ถูกออกแบบมาจากปัญหาที่พบเจอจริงในโรงเรียน
            ใช้งานได้ฟรี ไม่ต้องติดตั้งโปรแกรม และจะพัฒนาต่อไปเรื่อย ๆ
            ตามฟีดแบ็กจากคุณครูที่ใช้งานจริง
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">ติดต่อเรา</h2>
        <div className="mt-3 max-w-[62ch] rounded-2xl border border-border bg-surface-card p-3.5 md:p-4">
          <p className="m-0 text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">
            มีข้อเสนอแนะ พบปัญหาการใช้งาน หรืออยากแนะนำเครื่องมือที่อยากให้ทำเพิ่ม
            ติดต่อได้ที่{" "}
            <a
              href="mailto:khuncoolhub@gmail.com"
              className="font-semibold text-primary underline"
            >
              khuncoolhub@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
