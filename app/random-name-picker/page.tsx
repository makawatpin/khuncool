import type { Metadata } from "next";
import Link from "next/link";
import WheelApp from "./WheelApp";

export const metadata: Metadata = {
  title: "วงล้อสุ่มชื่อ ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | Khuncool",
  description:
    "วงล้อสุ่มชื่อนักเรียนออนไลน์ ใช้ฟรี ไม่ต้องสมัครสมาชิก ใส่รายชื่อแล้วหมุนได้ทันที เหมาะกับการสุ่มชื่อตอบคำถาม สุ่มเวรประจำวัน และสุ่มรางวัลในห้องเรียน",
  keywords: [
    "วงล้อสุ่ม",
    "วงล้อสุ่มชื่อ",
    "สุ่มชื่อนักเรียน",
    "สุ่มชื่อออนไลน์",
    "วงล้อสุ่มรางวัล",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/random-name-picker",
  },
  openGraph: {
    type: "website",
    title: "วงล้อสุ่มชื่อ ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | Khuncool",
    description:
      "ใส่รายชื่อนักเรียนแล้วหมุนได้ทันที ฟรี ไม่ต้องสมัครสมาชิก ใช้ได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และมือถือ",
    url: "https://www.khuncool.com/random-name-picker",
    images: ["https://www.khuncool.com/assets/wheel-cover.webp"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const FAQS = [
  {
    q: "วงล้อสุ่มชื่อใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ใส่รายชื่อนักเรียนได้กี่คน",
    a: "ใส่ได้ทั้งห้อง สามารถวางรายชื่อทีละหลายบรรทัดจาก Excel หรือ Google Sheets ได้ในครั้งเดียว โดยสลับไปที่โหมด “วางหลายชื่อ” แล้ววางรายชื่อทั้งหมดพร้อมกันได้เลย",
  },
  {
    q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม",
    a: "ได้ รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ เหมาะกับการฉายขึ้นจอโปรเจกเตอร์หรือทีวีในห้องเรียน",
  },
  {
    q: "ลบชื่อที่ถูกสุ่มไปแล้วได้ไหม",
    a: "ได้ ติ๊กเลือก “เอาชื่อที่สุ่มได้ออก” ก่อนหมุน ระบบจะตัดชื่อที่เพิ่งสุ่มได้ออกจากวงล้ออัตโนมัติ หรือจะกดปุ่ม “เอาชื่อนี้ออก แล้วหมุนต่อ” หลังเห็นผลก็ได้เช่นกัน",
  },
  {
    q: "รายชื่อที่พิมพ์ไว้จะหายไหมถ้าปิดหน้าเว็บ",
    a: "ไม่หาย ระบบบันทึกรายชื่อไว้ในเบราว์เซอร์ของเครื่องให้อัตโนมัติ เปิดหน้านี้ใหม่ครั้งหน้าก็ยังเห็นรายชื่อเดิม",
  },
  {
    q: "มีเสียงตอนหมุนวงล้อไหม",
    a: "มีเสียงติ๊ก ๆ ตอนวงล้อหมุนและเสียงเชียร์ตอนได้ผลลัพธ์ กดไอคอนลำโพงข้างปุ่มหมุนเพื่อเปิดหรือปิดเสียงได้ตลอดเวลา",
  },
  {
    q: "สุ่มได้ไหมถ้ามีชื่อซ้ำกันในห้อง",
    a: "ได้ ระบบไม่ตรวจสอบชื่อซ้ำ ใส่ชื่อซ้ำได้ตามจริง แต่แนะนำให้เติมเลขที่หรือชื่อเล่นต่อท้ายเพื่อแยกให้ชัดเจนเวลาดูผลลัพธ์",
  },
  {
    q: "ต่างจากวงล้อสุ่มเว็บอื่นอย่าง wheelofnames ยังไง",
    a: "วงล้อของคุณคูลเป็นภาษาไทยทั้งหมด ใช้งานฟรีโดยไม่ต้องสมัครสมาชิกหรือเข้าสู่ระบบ และเป็นส่วนหนึ่งของชุดเครื่องมือครูอื่น ๆ บนเว็บเดียวกัน เช่น จับเวลา แบ่งกลุ่ม และเช็กชื่อ ทำให้ครูใช้ต่อเนื่องกันได้โดยไม่ต้องสลับเว็บไซต์",
  },
];

const HOWTO_STEPS = [
  {
    name: "พิมพ์หรือวางรายชื่อนักเรียน",
    text: "พิมพ์ชื่อทีละคนแล้วกด Enter หรือสลับไปโหมด “วางหลายชื่อ” เพื่อคัดลอกรายชื่อทั้งห้องจาก Excel หรือ Google Sheets มาวางทีเดียว",
  },
  {
    name: "ปรับตั้งค่าตามที่ต้องการ",
    text: "ติ๊ก “เอาชื่อที่สุ่มได้ออก” ถ้าต้องการให้คนที่ถูกสุ่มแล้วไม่ถูกสุ่มซ้ำ และเปิดหรือปิดเสียงได้จากไอคอนลำโพง",
  },
  {
    name: "กดหมุนวงล้อ",
    text: "คลิกที่ตัววงล้อหรือกดปุ่ม “หมุนวงล้อ” วงล้อจะหมุนแล้วค่อย ๆ ช้าลงก่อนหยุดที่ชื่อผู้ถูกสุ่ม",
  },
  {
    name: "ดูผลลัพธ์และใช้งานต่อ",
    text: "ชื่อที่สุ่มได้จะขึ้นเป็นป๊อปอัปพร้อมเสียงเชียร์ เลือกหมุนอีกครั้ง เอาชื่อนี้ออกแล้วหมุนต่อ หรือปิดหน้าต่างเพื่อกลับไปแก้รายชื่อ",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "หน้าแรก",
          item: "https://www.khuncool.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "เครื่องมือครู",
          item: "https://www.khuncool.com/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "วงล้อสุ่มชื่อ",
          item: "https://www.khuncool.com/random-name-picker",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: "วงล้อสุ่มชื่อ Khuncool",
      url: "https://www.khuncool.com/random-name-picker",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "วงล้อสุ่มชื่อนักเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้วงล้อสุ่มชื่อ Khuncool",
      description:
        "ขั้นตอนการใช้วงล้อสุ่มชื่อออนไลน์ ตั้งแต่ใส่รายชื่อจนถึงดูผลลัพธ์",
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
    icon: "❓",
    head: "สุ่มชื่อตอบคำถามในห้องเรียน",
    body: "แทนการเรียกตามเลขที่หรือคนที่ยกมือ ให้ทุกคนต้องเตรียมพร้อมตอบได้ตลอดเวลา",
  },
  {
    icon: "🧹",
    head: "สุ่มเวรทำความสะอาด",
    body: "จัดเวรประจำวันหรือประจำสัปดาห์แบบไม่มีใครบ่นว่าไม่ยุติธรรม เพราะเห็นผลสุ่มพร้อมกันทั้งห้อง",
  },
  {
    icon: "📋",
    head: "สุ่มลำดับการนำเสนองาน",
    body: "สุ่มว่ากลุ่มไหนหรือคนไหนออกไปนำเสนอก่อนหลัง ลดปัญหาแย่งกันเป็นกลุ่มสุดท้าย",
  },
  {
    icon: "🎁",
    head: "สุ่มรางวัลหรือของขวัญ",
    body: "ใส่รายการรางวัลแทนชื่อคน ใช้แจกของรางวัลท้ายคาบหรือกิจกรรมพิเศษในห้องเรียน",
  },
  {
    icon: "🤝",
    head: "ใช้ในกิจกรรมทีมงานหรือที่ประชุม",
    body: "นอกเหนือจากห้องเรียน ยังใช้สุ่มลำดับพูด สุ่มผู้เล่นเกม หรือสุ่มมอบหมายงานในทีมได้เช่นกัน",
  },
];

export default function RandomNamePickerPage() {
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
          <Link href="/tools" className="text-ink-faint">
            เครื่องมือครู
          </Link>
          <span>›</span>
          <span
            className="font-semibold text-ink-secondary"
            aria-current="page"
          >
            วงล้อสุ่มชื่อ
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          วงล้อสุ่มชื่อนักเรียน
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ใส่รายชื่อแล้วกดหมุน ใช้สุ่มเลือกคนตอบ สุ่มเวร
            หรือสุ่มรางวัลในห้องเรียนได้ทันที
          </span>
          <span className="hidden md:inline">
            ใส่รายชื่อนักเรียนแล้วคลิกวงล้อหรือปุ่มหมุนเพื่อสุ่มเลือกคนตอบ
            แบ่งเวร หรือสุ่มรางวัลในห้องเรียน ใช้ฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
      </div>

      {/* Wheel app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <WheelApp />
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

      {/* Related */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          เครื่องมือและบทความที่เกี่ยวข้อง
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/duck-race"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🦆 แข่งเป็ดสุ่มชื่อ
          </Link>
          <Link
            href="/blog/wheel"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            📖 8 ไอเดียใช้วงล้อสุ่มในห้องเรียน
          </Link>
          <Link
            href="/blog/random-name-activities"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            📖 ไอเดียกิจกรรมสุ่มชื่อนักเรียน
          </Link>
          <Link
            href="/tools"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🧰 เครื่องมือทั้งหมด
          </Link>
        </div>
      </div>
    </main>
  );
}
