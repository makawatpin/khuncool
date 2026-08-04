import type { Metadata } from "next";
import Link from "next/link";
import DuckRaceApp from "./DuckRaceApp";

export const metadata: Metadata = {
  title: "เกมเป็ดสุ่มชื่อ แข่งเป็ดเข้าเส้นชัย ออนไลน์ฟรี | Khuncool",
  description:
    "เกมเป็ดสุ่มชื่อและแข่งเป็ดเข้าเส้นชัยออนไลน์ ใส่รายชื่อนักเรียนแล้วเริ่มแข่งได้ทันที ใช้ฟรี ไม่ต้องสมัครสมาชิกหรือติดตั้งโปรแกรม",
  keywords: [
    "แข่งเป็ด",
    "สุ่มเป็ด",
    "เกมแข่งเป็ด",
    "เกมเป็ดสุ่ม",
    "เกมสุ่มเป็ด",
    "เป็ดเข้าเส้นชัย",
    "duck race",
    "สุ่มชื่อนักเรียน",
    "สุ่มชื่อออนไลน์",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/duck-race",
  },
  openGraph: {
    type: "website",
    title: "เกมเป็ดสุ่มชื่อ แข่งเป็ดเข้าเส้นชัย ออนไลน์ฟรี | Khuncool",
    description:
      "ใส่รายชื่อนักเรียนแล้วปล่อยเป็ดแข่งได้ทันที ฟรี ไม่ต้องสมัครสมาชิก ใช้ได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และมือถือ",
    url: "https://www.khuncool.com/duck-race",
    images: ["https://www.khuncool.com/assets/duck-race-cover.webp"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const HOWTO_STEPS = [
  {
    name: "พิมพ์หรือวางรายชื่อนักเรียน",
    text: "พิมพ์ชื่อทีละคนแล้วกด Enter หรือวางรายชื่อทั้งห้องจาก Excel หรือ Google Sheets มาทีเดียว ระบบจะสร้างเป็ดให้ตามจำนวนชื่อที่ใส่",
  },
  {
    name: "เลือกความยาวสนามแข่ง",
    text: "ปรับความยาวสนามได้ตั้งแต่สั้นมากถึงยาวมาก เพื่อกำหนดว่าการแข่งจะจบไวหรือลุ้นกันนาน ๆ",
  },
  {
    name: "กดเริ่มแข่ง",
    text: "กดปุ่มเริ่มแข่ง เป็ดทุกตัวจะว่ายแข่งกันไปที่เส้นชัยพร้อมนับถอยหลังก่อนออกตัว",
  },
  {
    name: "ดูผลลัพธ์บนโพเดียม",
    text: "เมื่อถึงเส้นชัยระบบจะขึ้นโพเดียมแสดงอันดับที่ 1-3 พร้อมเวลาเข้าเส้นชัย เลือกแข่งใหม่ได้ทันทีโดยไม่ต้องพิมพ์รายชื่อซ้ำ",
  },
];

const FAQS = [
  {
    q: "เกมแข่งเป็ดสุ่มชื่อใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ใส่รายชื่อนักเรียนได้กี่คน",
    a: "ใส่ได้ทั้งห้อง แต่ละชื่อจะกลายเป็นเป็ดหนึ่งตัวในสนามแข่ง สามารถวางรายชื่อทีละหลายบรรทัดจาก Excel หรือ Google Sheets ได้ในครั้งเดียว",
  },
  {
    q: "ต่างจากวงล้อสุ่มยังไง",
    a: "วงล้อสุ่มจะได้ผลลัพธ์ทันทีที่หมุนเสร็จ ส่วนเกมแข่งเป็ดจะมีช่วงลุ้นระหว่างที่เป็ดว่ายแข่งไปเส้นชัย เหมาะกับกิจกรรมที่อยากให้เด็กเชียร์และลุ้นนานขึ้น",
  },
  {
    q: "ปรับความยาวสนามแข่งได้ไหม",
    a: "ได้ เลือกความยาวสนามได้ 5 ระดับตั้งแต่สั้นมากถึงยาวมาก สนามสั้นเหมาะกับการสุ่มไว ๆ ส่วนสนามยาวเหมาะกับกิจกรรมที่อยากให้ลุ้นกันนาน",
  },
  {
    q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม",
    a: "ได้ รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ เหมาะกับการฉายขึ้นจอโปรเจกเตอร์หรือทีวีในห้องเรียน",
  },
  {
    q: "รายชื่อที่พิมพ์ไว้จะหายไหมถ้าปิดหน้าเว็บ",
    a: "ไม่หาย ระบบบันทึกรายชื่อไว้ในเบราว์เซอร์ของเครื่องให้อัตโนมัติ เปิดหน้านี้ใหม่ครั้งหน้าก็ยังเห็นรายชื่อเดิม",
  },
  {
    q: "ดูอันดับที่ 1-3 ได้ไหม ไม่ใช่แค่ผู้ชนะคนเดียว",
    a: "ได้ เมื่อแข่งจบระบบจะขึ้นโพเดียมแสดงอันดับที่ 1-3 พร้อมเวลาเข้าเส้นชัยของแต่ละตัว",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "เกมแข่งเป็ดสุ่มชื่อ Khuncool",
      url: "https://www.khuncool.com/duck-race",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "เกมแข่งเป็ดสุ่มชื่อนักเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้เกมแข่งเป็ดสุ่มชื่อ Khuncool",
      description:
        "ขั้นตอนการใช้เกมแข่งเป็ดสุ่มชื่อออนไลน์ ตั้งแต่ใส่รายชื่อจนถึงดูผลลัพธ์",
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
    body: "แทนการเรียกตามเลขที่หรือคนที่ยกมือ ให้ทุกคนต้องเตรียมพร้อมตอบได้ตลอดเวลา พร้อมความสนุกจากการเชียร์เป็ดแข่ง",
  },
  {
    icon: "🏆",
    head: "จัดกิจกรรมท้ายคาบให้สนุกขึ้น",
    body: "ใช้แข่งเป็ดแทนกิจกรรมเดิม ๆ สร้างบรรยากาศลุ้นระทึกในห้องเรียนก่อนเลิกคาบ",
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

export default function DuckRacePage() {
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
            เกมเป็ดสุ่มชื่อ
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          เกมเป็ดสุ่มชื่อ แข่งเป็ดเข้าเส้นชัยฟรี 🦆
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          ใส่รายชื่อนักเรียนแล้วเล่นเกมแข่งเป็ดเข้าเส้นชัยได้ทันที
          สุ่มชื่อแบบมีลุ้นบนเว็บ ใช้ฟรี ไม่ต้องสมัครสมาชิกหรือติดตั้ง
        </p>
      </div>

      {/* Duck race app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <DuckRaceApp />
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
            href="/blog/duck-race-classroom-activities"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            📖 10 กิจกรรมเกมเป็ดสุ่ม
          </Link>
          <Link
            href="/blog/wheel-vs-duck-race"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            📖 วงล้อสุ่ม vs เกมเป็ดสุ่ม
          </Link>
          <Link
            href="/blog/duck-race"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            📖 วิธีใช้เกมแข่งเป็ดในห้องเรียน
          </Link>
          <Link
            href="/random-name-picker"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🎡 วงล้อสุ่มชื่อนักเรียน
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
