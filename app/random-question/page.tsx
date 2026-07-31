import type { Metadata } from "next";
import Link from "next/link";
import QuestionApp from "./QuestionApp";

export const metadata: Metadata = {
  title: "สุ่มคำถามในห้องเรียน ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "สุ่มคำถามสำหรับกิจกรรมในห้องเรียน ใส่ชุดคำถามแล้วสุ่มได้ทันทีบนเว็บ ใช้ฟรี ไม่ต้องสมัครสมาชิก",
  keywords: [
    "สุ่มคำถาม",
    "คำถามหน้าชั้น",
    "random question",
    "สุ่มคำถามห้องเรียน",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/random-question",
  },
  openGraph: {
    type: "website",
    title: "สุ่มคำถามในห้องเรียน ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
    description:
      "สุ่มคำถามสำหรับกิจกรรมในห้องเรียน ใส่ชุดคำถามแล้วสุ่มได้ทันทีบนเว็บ ใช้ฟรี ไม่ต้องสมัครสมาชิก",
    url: "https://www.khuncool.com/random-question",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const HOWTO_STEPS = [
  {
    name: "พิมพ์หรือวางชุดคำถาม",
    text: "พิมพ์คำถามทีละข้อแล้วกด Enter หรือวางชุดคำถามที่เตรียมไว้มาทีเดียว",
  },
  {
    name: "กดสุ่มคำถาม",
    text: "ระบบจะสุ่มเลือกคำถามหนึ่งข้อจากชุดคำถามที่ใส่ไว้ให้แสดงผลทันที",
  },
  {
    name: "ใช้ถามนักเรียนหน้าชั้น",
    text: "ใช้คำถามที่สุ่มได้ถามนักเรียนหรือให้จับคู่กับการสุ่มชื่อเพื่อเลือกคนตอบ",
  },
  {
    name: "สุ่มข้อถัดไปได้ทันที",
    text: "กดสุ่มซ้ำเพื่อเลือกคำถามข้อใหม่ได้เรื่อย ๆ โดยไม่ต้องพิมพ์ชุดคำถามซ้ำ",
  },
];

const FAQS = [
  {
    q: "เครื่องมือสุ่มคำถามนี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ใส่คำถามได้กี่ข้อ",
    a: "ใส่ได้ไม่จำกัดจำนวน สามารถวางชุดคำถามที่เตรียมไว้ล่วงหน้ามาทีเดียวได้",
  },
  {
    q: "คำถามที่พิมพ์ไว้จะหายไหมถ้าปิดหน้าเว็บ",
    a: "ไม่หาย ระบบบันทึกชุดคำถามไว้ในเบราว์เซอร์ของเครื่องให้อัตโนมัติ เปิดหน้านี้ใหม่ครั้งหน้าก็ยังเห็นชุดคำถามเดิม",
  },
  {
    q: "คำถามซ้ำกันได้ไหมเวลาสุ่ม",
    a: "การสุ่มแต่ละครั้งเป็นอิสระต่อกัน จึงมีโอกาสสุ่มเจอคำถามเดิมซ้ำได้ในการกดหลายครั้ง",
  },
  {
    q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม",
    a: "ได้ รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ เหมาะกับการฉายขึ้นจอโปรเจกเตอร์ในห้องเรียน",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "สุ่มคำถามหน้าชั้น Khuncool",
      url: "https://www.khuncool.com/random-question",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "เครื่องมือสุ่มคำถามในห้องเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้เครื่องมือสุ่มคำถามหน้าชั้น Khuncool",
      description: "ขั้นตอนการสุ่มคำถามในห้องเรียนออนไลน์ ตั้งแต่ใส่ชุดคำถามจนถึงสุ่มได้ผลลัพธ์",
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
    icon: "🙋",
    head: "กระตุ้นให้นักเรียนตอบคำถามหน้าชั้น",
    body: "สุ่มคำถามแทนการเรียกถามเดิม ๆ ทำให้นักเรียนต้องเตรียมพร้อมตลอดคาบ",
  },
  {
    icon: "🧠",
    head: "ทบทวนบทเรียนก่อนสอบ",
    body: "ใส่ชุดคำถามทบทวนแล้วสุ่มถามเป็นเกมเพื่อทบทวนเนื้อหาก่อนสอบ",
  },
  {
    icon: "🎲",
    head: "จับคู่กับการสุ่มชื่อ",
    body: "ใช้ร่วมกับเครื่องมือสุ่มชื่อเพื่อเลือกทั้งคนตอบและคำถามแบบสุ่มไปพร้อมกัน",
  },
  {
    icon: "💬",
    head: "ใช้เปิดวงสนทนาหรือกิจกรรมกลุ่ม",
    body: "ใส่คำถามชวนคุยเพื่อเปิดกิจกรรมละลายพฤติกรรมหรือวงสนทนาในห้องเรียน",
  },
];

export default function RandomQuestionPage() {
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
        <Link href="/tools" className="text-ink-faint">
          เครื่องมือครู
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">สุ่มคำถาม</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          สุ่มคำถามหน้าชั้น
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ใส่ชุดคำถามแล้วกดสุ่ม ใช้กระตุ้นให้นักเรียนตอบคำถามในห้องเรียน
          </span>
          <span className="hidden md:inline">
            ใส่ชุดคำถามที่ต้องการแล้วกดสุ่มเพื่อเลือกคำถามให้นักเรียนตอบ
            ใช้ฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
      </div>

      {/* Question app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <QuestionApp />
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
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">เครื่องมือและบทความที่เกี่ยวข้อง</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/random-name-picker" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">🎡 วงล้อสุ่มชื่อนักเรียน</Link>
          <Link href="/duck-race" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">🦆 แข่งเป็ดสุ่มชื่อ</Link>
          <Link href="/tools" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">🧰 เครื่องมือทั้งหมด</Link>
        </div>
      </div>
    </main>
  );
}
