import type { Metadata } from "next";
import Link from "next/link";
import NoiseMeterApp from "./NoiseMeterApp";

export const metadata: Metadata = {
  title: "เครื่องวัดความดังในห้องเรียน ออนไลน์ ใช้ฟรี | khuncool",
  description:
    "เครื่องวัดระดับเสียงในห้องเรียนแบบเรียลไทม์ ช่วยควบคุมความดังของนักเรียน ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
  keywords: [
    "วัดเสียงในห้องเรียน",
    "เครื่องวัดความดัง",
    "noise meter",
    "classroom noise meter",
    "ควบคุมความดังห้องเรียน",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/classroom-noise-meter",
  },
  openGraph: {
    type: "website",
    title: "เครื่องวัดความดังในห้องเรียน ออนไลน์ ใช้ฟรี | khuncool",
    description:
      "เครื่องวัดระดับเสียงในห้องเรียนแบบเรียลไทม์ ช่วยควบคุมความดังของนักเรียน ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/classroom-noise-meter",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const HOWTO_STEPS = [
  {
    name: "อนุญาตให้เว็บใช้ไมโครโฟน",
    text: "เมื่อเปิดหน้านี้ครั้งแรก เบราว์เซอร์จะขออนุญาตใช้ไมโครโฟน กดอนุญาตเพื่อเริ่มวัดเสียง",
  },
  {
    name: "ดูระดับเสียงแบบเรียลไทม์",
    text: "หน้าจอจะแสดงระดับความดังของเสียงในห้องเป็นแบบเรียลไทม์ พร้อมสีที่เปลี่ยนตามความดัง",
  },
  {
    name: "ฉายขึ้นจอให้นักเรียนเห็น",
    text: "ฉายหน้าจอขึ้นโปรเจกเตอร์หรือทีวี ให้นักเรียนเห็นระดับเสียงและช่วยกันควบคุมความดังด้วยตัวเอง",
  },
  {
    name: "ปรับระดับเตือนตามกิจกรรม",
    text: "ตั้งค่าระดับเสียงที่ยอมรับได้ให้เหมาะกับแต่ละกิจกรรม เช่น ทำงานกลุ่มหรือช่วงสอบย่อย",
  },
];

const FAQS = [
  {
    q: "เครื่องวัดเสียงนี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "มีการอัดเสียงหรือบันทึกข้อมูลไหม",
    a: "ไม่มี ระดับเสียงถูกประมวลผลในเครื่องของผู้ใช้เท่านั้น ไม่มีการอัดเสียงหรือส่งข้อมูลใด ๆ ออกไปนอกเครื่อง",
  },
  {
    q: "ทำไมเบราว์เซอร์ขอสิทธิ์ใช้ไมโครโฟน",
    a: "ต้องใช้ไมโครโฟนเพื่อวัดระดับเสียงในห้องแบบเรียลไทม์ ข้อมูลเสียงจะไม่ถูกบันทึกหรือส่งออกไปที่ใดทั้งสิ้น",
  },
  {
    q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม",
    a: "ได้ รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือที่มีไมโครโฟน",
  },
  {
    q: "เหมาะกับกิจกรรมแบบไหน",
    a: "เหมาะกับกิจกรรมกลุ่มที่ต้องการควบคุมความดัง ช่วงทำงานเงียบ หรือช่วงสอบย่อยที่ต้องการความเงียบในห้องเรียน",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "เครื่องวัดเสียงในห้องเรียน Khuncool",
      url: "https://www.khuncool.com/classroom-noise-meter",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "เครื่องวัดระดับเสียงในห้องเรียนแบบเรียลไทม์ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้เครื่องวัดเสียงในห้องเรียน Khuncool",
      description: "ขั้นตอนการใช้เครื่องวัดเสียงในห้องเรียนออนไลน์ ตั้งแต่อนุญาตไมโครโฟนจนถึงดูผลลัพธ์",
      inLanguage: "th",
      step: HOWTO_STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
  ],
};

const USE_CASES = [
  {
    icon: "🔇",
    head: "ควบคุมความดังระหว่างทำงานกลุ่ม",
    body: "ให้นักเรียนเห็นระดับเสียงของตัวเองและช่วยกันควบคุมความดังโดยไม่ต้องให้ครูคอยเตือน",
  },
  {
    icon: "📖",
    head: "ช่วงทำงานเงียบหรืออ่านหนังสือ",
    body: "ใช้เตือนเมื่อระดับเสียงในห้องดังเกินไป เหมาะกับกิจกรรมที่ต้องการสมาธิ",
  },
  {
    icon: "📝",
    head: "ช่วงสอบย่อยหรือทำแบบทดสอบ",
    body: "รักษาความเงียบในห้องระหว่างทำข้อสอบ ลดการรบกวนจากเสียงพูดคุย",
  },
  {
    icon: "🎮",
    head: "ใช้เป็นเกมแข่งความเงียบ",
    body: "จับเวลาแข่งกันว่ากลุ่มไหนควบคุมความเงียบได้นานที่สุด สร้างความสนุกในการฝึกวินัย",
  },
];

export default function NoiseMeterPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto">
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
        <Link href="/tools" className="text-ink-faint">
          เครื่องมือครู
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">
          วัดเสียงในห้อง
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          เครื่องวัดเสียงในห้องเรียน
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            เสียงจะถูกวัดในเครื่องนี้เท่านั้น ไม่มีการอัดหรือส่งเสียงออกไปไหน
          </span>
          <span className="hidden md:inline">
            ระดับเสียงถูกประมวลผลในเครื่องนี้เท่านั้น ไม่มีการอัดเสียงหรือส่งข้อมูลออกไปไหน
            เหมาะกับกิจกรรมกลุ่ม เวลาทำงานเงียบ และช่วงสอบย่อย
          </span>
        </p>
      </div>

      {/* Noise meter app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <NoiseMeterApp />
      </div>

      {/* How to use */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">วิธีใช้งาน</h2>
        <div className="mt-3 flex flex-col gap-3 md:max-w-[62ch] md:gap-3.5">
          {HOWTO_STEPS.map((s, i) => (
            <div key={s.name} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[#ECEDFE] text-[12.5px] font-bold text-[#4A46D6] md:h-[30px] md:w-[30px] md:rounded-[10px] md:text-[15px]">
                {i + 1}
              </span>
              <div>
                <div className="mb-0.5 text-sm font-bold md:text-base">
                  {s.name}
                </div>
                <p className="m-0 text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          ใช้ทำอะไรได้บ้าง
        </h2>
        <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
          {USE_CASES.map((u) => (
            <div
              key={u.head}
              className="rounded-2xl border border-border bg-surface-card p-3.5 md:p-4"
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="text-lg md:text-[19px]">{u.icon}</span>
                <span className="text-sm font-bold md:text-[15.5px]">
                  {u.head}
                </span>
              </div>
              <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                {u.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          คำถามที่ครูถามบ่อย
        </h2>
        <div className="flex flex-col gap-2 md:max-w-[62ch] md:gap-[9px]">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-border bg-surface-card p-[13px] md:rounded-[15px] md:p-[15px_17px]"
            >
              <div className="mb-1 text-[13.5px] font-semibold leading-snug md:text-[15px]">
                {f.q}
              </div>
              <p className="m-0 text-[13px] leading-relaxed text-ink-secondary md:text-sm md:leading-[1.75]">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
