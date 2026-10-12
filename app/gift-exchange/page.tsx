import type { Metadata } from "next";
import Link from "next/link";
import GiftExchangeApp from "./GiftExchangeApp";

const TITLE = "จับฉลากแลกของขวัญออนไลน์ ไม่ได้ชื่อตัวเอง ใช้ฟรี | khuncool";
const DESCRIPTION =
  "เครื่องมือจับฉลากแลกของขวัญปีใหม่สำหรับห้องเรียน ฉายขึ้นจอให้นักเรียนออกมาเปิดกล่องของขวัญทีละคนต่อกันเป็นห่วงโซ่ ไม่มีใครได้ชื่อตัวเอง มีแอนิเมชันและเสียงประกอบ ใช้ฟรี ไม่ต้องติดตั้ง";
const URL = "https://www.khuncool.com/gift-exchange";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "จับฉลากแลกของขวัญ",
    "จับฉลากออนไลน์",
    "แลกของขวัญปีใหม่",
    "secret santa",
    "กิจกรรมปีใหม่ในห้องเรียน",
    "เครื่องมือครู",
  ],
  alternates: { canonical: URL },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: URL, locale: "th_TH" },
  twitter: { card: "summary_large_image" },
};

const HOWTO_STEPS = [
  {
    name: "ใส่รายชื่อนักเรียน",
    text: "วางรายชื่อบรรทัดละคน หรือกดปุ่มห้องเรียนเพื่อดึงรายชื่อที่บันทึกไว้ แล้วแตะชื่อคนที่ขาดเรียนออก",
  },
  {
    name: "สุ่มคนเริ่ม",
    text: "กดเริ่มจับฉลาก ชื่อจะวิ่งแบบสล็อตแล้วหยุดที่คนแรกที่ได้ออกมาเปิดกล่อง",
  },
  {
    name: "เปิดกล่องทีละคน",
    text: "ให้คนที่ถึงตาแตะกล่องของขวัญบนจอ กล่องจะระเบิดเผยชื่อเพื่อนที่ต้องมอบของให้ แล้วเพื่อนคนนั้นออกมาเปิดกล่องเป็นคนถัดไป",
  },
  {
    name: "ปิดวง",
    text: "กล่องใบสุดท้ายจะวนกลับมาที่คนแรก ทุกคนได้ให้และได้รับของครบ แล้วจอจะแสดงวงโซ่ของทั้งห้อง",
  },
];

const FAQS = [
  {
    q: "จะมีใครจับได้ชื่อตัวเองไหม",
    a: "ไม่มี ระบบสุ่มจากคนที่ยังไม่ได้รับของเท่านั้น และกล่องสุดท้ายจะวนกลับไปหาคนแรกเสมอ ทุกคนจึงได้ให้หนึ่งครั้งและได้รับหนึ่งครั้งพอดี",
  },
  {
    q: "ถ้าปิดหน้าเว็บกลางคันจะเป็นอย่างไร",
    a: "ระบบบันทึกความคืบหน้าไว้ในเบราว์เซอร์ทุกครั้งที่เปิดกล่อง เปิดหน้าใหม่จะมีปุ่มให้เล่นต่อจากเดิม และชื่อที่เปิดไปแล้วจะไม่ถูกสุ่มใหม่",
  },
  {
    q: "มีนักเรียนขาดหรือมาสายระหว่างเล่นทำอย่างไร",
    a: "กดปุ่มรายชื่อระหว่างเล่นเพื่อติ๊กคนขาดออกหรือเพิ่มชื่อคนมาสายได้ ตราบใดที่ยังไม่มีใครจับได้ชื่อคนนั้น",
  },
  {
    q: "ต้องมีนักเรียนอย่างน้อยกี่คน",
    a: "อย่างน้อย 3 คน และใช้ได้กับห้องใหญ่ถึง 50 คน",
  },
  {
    q: "ใช้ฟรีไหม ต้องสมัครหรือเปล่า",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครและไม่ต้องติดตั้ง เปิดผ่านเบราว์เซอร์แล้วฉายขึ้นจอหน้าห้องได้ทันที",
  },
];

const USE_CASES = [
  { icon: "🎄", head: "แลกของขวัญปีใหม่", body: "เปลี่ยนการจับฉลากกระดาษที่วุ่นวายให้เป็นการแสดงที่ทั้งห้องได้ลุ้นไปด้วยกัน" },
  { icon: "🎂", head: "งานเลี้ยงสิ้นปีของครู", body: "ใช้กับวงครูในโรงเรียนหรือกลุ่มเพื่อนได้เหมือนกัน แค่ใส่รายชื่อแล้วฉายขึ้นจอ" },
  { icon: "🔗", head: "ไม่ต้องคอยเรียกลำดับ", body: "คนที่ได้รับของคือคนถัดไปที่ออกมาเปิดกล่อง ห้องเดินต่อเองจนครบวง" },
  { icon: "📺", head: "ฉายขึ้นจอโปรเจกเตอร์", body: "ชื่อตัวใหญ่ อ่านได้จากหลังห้อง กดเต็มจอได้ทั้งบนคอมและแท็บเล็ต" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "จับฉลากแลกของขวัญ Khuncool",
      url: URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "เครื่องมือจับฉลากแลกของขวัญแบบห่วงโซ่สำหรับห้องเรียน ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "HowTo",
      name: "วิธีจับฉลากแลกของขวัญด้วย Khuncool",
      description: "ขั้นตอนการจับฉลากแลกของขวัญในห้องเรียน ตั้งแต่ใส่รายชื่อจนปิดวง",
      inLanguage: "th",
      step: HOWTO_STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function GiftExchangePage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
            จับฉลากแลกของขวัญ
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          จับฉลากแลกของขวัญ
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            เปิดกล่องของขวัญทีละคนต่อกันเป็นห่วงโซ่ ไม่มีใครได้ชื่อตัวเอง ใช้ฟรี
          </span>
          <span className="hidden md:inline">
            ฉายขึ้นจอให้นักเรียนออกมาเปิดกล่องของขวัญทีละคน ใครเปิดได้ชื่อใครก็มอบของให้คนนั้น
            แล้วคนนั้นออกมาเปิดต่อ จนวนกลับมาที่คนแรก ไม่มีใครได้ชื่อตัวเอง
          </span>
        </p>
      </div>

      {/* Gift exchange app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <GiftExchangeApp />
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
          เครื่องมือที่ใช้คู่กันได้
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/classrooms"
            className="rounded-pill border border-[#C6C9FB] bg-[#F7F7FE] text-primary px-3.5 py-2 text-[13px] font-semibold no-underline hover:opacity-70"
          >
            🏫 ห้องเรียนของฉัน
          </Link>
          <Link
            href="/random-name-picker"
            className="rounded-pill border border-border text-ink px-3.5 py-2 text-[13px] font-semibold no-underline hover:opacity-70"
          >
            🎡 วงล้อสุ่มชื่อนักเรียน
          </Link>
          <Link
            href="/duck-race"
            className="rounded-pill border border-border text-ink px-3.5 py-2 text-[13px] font-semibold no-underline hover:opacity-70"
          >
            🦆 เกมแข่งเป็ดสุ่มชื่อ
          </Link>
          <Link
            href="/tools"
            className="rounded-pill border border-border text-ink px-3.5 py-2 text-[13px] font-semibold no-underline hover:opacity-70"
          >
            🧰 เครื่องมือทั้งหมด
          </Link>
        </div>
      </div>
    </main>
  );
}
