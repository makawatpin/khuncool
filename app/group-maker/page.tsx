import type { Metadata } from "next";
import Link from "next/link";
import GroupsApp from "./GroupsApp";

export const metadata: Metadata = {
  title: "สุ่มแบ่งกลุ่มนักเรียน ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "สุ่มแบ่งกลุ่มนักเรียนตามจำนวนที่ต้องการ ใส่รายชื่อแล้วแบ่งกลุ่มได้ทันทีบนเว็บ ใช้ฟรี ไม่ต้องสมัครสมาชิก",
  keywords: [
    "สุ่มแบ่งกลุ่ม",
    "แบ่งกลุ่มนักเรียน",
    "จับกลุ่มออนไลน์",
    "group maker",
    "สุ่มกลุ่ม",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/group-maker",
  },
  openGraph: {
    type: "website",
    title: "สุ่มแบ่งกลุ่มนักเรียน ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
    description:
      "สุ่มแบ่งกลุ่มนักเรียนตามจำนวนที่ต้องการ ใส่รายชื่อแล้วแบ่งกลุ่มได้ทันทีบนเว็บ ใช้ฟรี ไม่ต้องสมัครสมาชิก",
    url: "https://www.khuncool.com/group-maker",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const HOWTO_STEPS = [
  {
    name: "พิมพ์หรือวางรายชื่อนักเรียน",
    text: "พิมพ์ชื่อทีละคนแล้วกด Enter หรือวางรายชื่อทั้งห้องจาก Excel หรือ Google Sheets มาทีเดียว",
  },
  {
    name: "เลือกวิธีแบ่งกลุ่ม",
    text: "กำหนดได้ว่าจะแบ่งตามจำนวนกลุ่มที่ต้องการ หรือกำหนดจำนวนคนต่อกลุ่มแทน",
  },
  {
    name: "กดสุ่มแบ่งกลุ่ม",
    text: "ระบบจะสุ่มจัดรายชื่อทั้งหมดลงในแต่ละกลุ่มให้ทันทีอย่างเป็นธรรม",
  },
  {
    name: "สุ่มใหม่ได้ไม่จำกัด",
    text: "ไม่พอใจผลลัพธ์ก็กดสุ่มใหม่ได้ทันทีโดยไม่ต้องพิมพ์รายชื่อซ้ำ",
  },
];

const FAQS = [
  {
    q: "เครื่องมือสุ่มแบ่งกลุ่มนี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "แบ่งกลุ่มตามจำนวนกลุ่มหรือจำนวนคนต่อกลุ่มได้ไหม",
    a: "ได้ทั้งสองแบบ เลือกได้ว่าจะกำหนดจำนวนกลุ่มทั้งหมด หรือกำหนดจำนวนคนในแต่ละกลุ่มแทน",
  },
  {
    q: "ถ้าจำนวนคนหารกลุ่มไม่ลงตัวจะเป็นยังไง",
    a: "ระบบจะกระจายคนที่เหลือให้แต่ละกลุ่มใกล้เคียงกันมากที่สุด ไม่มีกลุ่มไหนได้คนเยอะหรือน้อยเกินไป",
  },
  {
    q: "ใส่รายชื่อนักเรียนได้กี่คน",
    a: "ใส่ได้ทั้งห้อง สามารถวางรายชื่อทีละหลายบรรทัดจาก Excel หรือ Google Sheets ได้ในครั้งเดียว",
  },
  {
    q: "รายชื่อที่พิมพ์ไว้จะหายไหมถ้าปิดหน้าเว็บ",
    a: "ไม่หาย ระบบบันทึกรายชื่อไว้ในเบราว์เซอร์ของเครื่องให้อัตโนมัติ เปิดหน้านี้ใหม่ครั้งหน้าก็ยังเห็นรายชื่อเดิม",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "สุ่มแบ่งกลุ่มนักเรียน Khuncool",
      url: "https://www.khuncool.com/group-maker",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้เครื่องมือสุ่มแบ่งกลุ่มนักเรียน Khuncool",
      description: "ขั้นตอนการสุ่มแบ่งกลุ่มนักเรียนออนไลน์ ตั้งแต่ใส่รายชื่อจนถึงได้ผลลัพธ์",
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
    icon: "🧩",
    head: "แบ่งกลุ่มทำกิจกรรมในห้องเรียน",
    body: "สุ่มแบ่งกลุ่มให้เป็นธรรม ลดปัญหาการรวมกลุ่มกับเพื่อนสนิทเดิม ๆ",
  },
  {
    icon: "🔬",
    head: "แบ่งกลุ่มทำแล็บหรือโปรเจกต์",
    body: "กำหนดจำนวนคนต่อกลุ่มให้เหมาะกับอุปกรณ์หรือขนาดงานที่มี",
  },
  {
    icon: "🏅",
    head: "แบ่งทีมสำหรับกิจกรรมแข่งขัน",
    body: "สุ่มแบ่งทีมอย่างรวดเร็วสำหรับเกมหรือกิจกรรมกีฬาสีในห้องเรียน",
  },
  {
    icon: "🤝",
    head: "ใช้ในกิจกรรมทีมงานหรือเวิร์กชอป",
    body: "นอกเหนือจากห้องเรียน ยังใช้แบ่งกลุ่มระดมสมองหรือแบ่งทีมในที่ทำงานได้เช่นกัน",
  },
];

export default function GroupMakerPage() {
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
          สุ่มแบ่งกลุ่ม
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          สุ่มแบ่งกลุ่มนักเรียน
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ใส่รายชื่อ เลือกจำนวนกลุ่มหรือจำนวนคนต่อกลุ่ม แล้วกดสุ่มแบ่งกลุ่มได้ทันที
          </span>
          <span className="hidden md:inline">
            ใส่รายชื่อนักเรียนแล้วเลือกได้ว่าจะกำหนดจำนวนกลุ่มหรือจำนวนคนต่อกลุ่ม
            ระบบจะสุ่มแบ่งให้ทันที ใช้ฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
      </div>

      {/* Groups app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <GroupsApp />
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
