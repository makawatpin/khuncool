import type { Metadata } from "next";
import Link from "next/link";
import ScoreboardApp from "./ScoreboardApp";

export const metadata: Metadata = {
  title: "กระดานคะแนนกลุ่ม ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "กระดานคะแนนกลุ่มสำหรับห้องเรียน เพิ่ม-ลดคะแนนแต่ละกลุ่มแบบเรียลไทม์ ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง เหมาะกับกิจกรรมแข่งขันในชั้นเรียน",
  keywords: [
    "กระดานคะแนน",
    "คะแนนกลุ่ม",
    "scoreboard",
    "กระดานคะแนนห้องเรียน",
    "คะแนนทีม",
    "สื่อการสอน",
    "เครื่องมือครู",
  ],
  alternates: {
    canonical: "https://www.khuncool.com/group-scoreboard",
  },
  openGraph: {
    type: "website",
    title: "กระดานคะแนนกลุ่ม ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
    description:
      "กระดานคะแนนกลุ่มสำหรับห้องเรียน เพิ่ม-ลดคะแนนแต่ละกลุ่มแบบเรียลไทม์ ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง เหมาะกับกิจกรรมแข่งขันในชั้นเรียน",
    url: "https://www.khuncool.com/group-scoreboard",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const HOWTO_STEPS = [
  {
    name: "ใส่ชื่อกลุ่มหรือทีม",
    text: "พิมพ์ชื่อกลุ่มหรือทีมที่ต้องการให้คะแนน ระบบจะสร้างช่องคะแนนให้แต่ละกลุ่มทันที",
  },
  {
    name: "กดเพิ่มหรือลดคะแนน",
    text: "กดปุ่มบวกหรือลบเพื่อปรับคะแนนของแต่ละกลุ่มระหว่างทำกิจกรรม คะแนนจะอัปเดตทันที",
  },
  {
    name: "ฉายขึ้นจอหน้าห้อง",
    text: "ฉายหน้าจอขึ้นโปรเจกเตอร์หรือทีวี ให้นักเรียนเห็นอันดับคะแนนของแต่ละกลุ่มแบบเรียลไทม์",
  },
  {
    name: "รีเซ็ตคะแนนสำหรับกิจกรรมใหม่",
    text: "กดรีเซ็ตเพื่อเริ่มนับคะแนนใหม่สำหรับกิจกรรมครั้งถัดไปโดยไม่ต้องพิมพ์ชื่อกลุ่มซ้ำ",
  },
];

const FAQS = [
  {
    q: "กระดานคะแนนกลุ่มนี้ใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิกและไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "เพิ่มได้กี่กลุ่ม",
    a: "เพิ่มได้ไม่จำกัดจำนวนกลุ่ม เหมาะกับห้องเรียนที่แบ่งได้หลายทีม",
  },
  {
    q: "คะแนนที่บันทึกไว้จะหายไหมถ้าปิดหน้าเว็บ",
    a: "ไม่หาย ระบบบันทึกชื่อกลุ่มและคะแนนไว้ในเบราว์เซอร์ของเครื่องให้อัตโนมัติ เปิดหน้านี้ใหม่ครั้งหน้าก็ยังเห็นข้อมูลเดิม",
  },
  {
    q: "ลดคะแนนติดลบได้ไหม",
    a: "ได้ คะแนนสามารถติดลบได้หากกดลดคะแนนมากกว่าคะแนนที่มีอยู่",
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
      name: "กระดานคะแนนกลุ่ม Khuncool",
      url: "https://www.khuncool.com/group-scoreboard",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description: "กระดานคะแนนกลุ่มสำหรับห้องเรียนออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีใช้กระดานคะแนนกลุ่ม Khuncool",
      description: "ขั้นตอนการใช้กระดานคะแนนกลุ่มออนไลน์ ตั้งแต่ใส่ชื่อกลุ่มจนถึงให้คะแนน",
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
    icon: "🏆",
    head: "กิจกรรมแข่งขันในชั้นเรียน",
    body: "ให้คะแนนแต่ละกลุ่มระหว่างทำกิจกรรมแข่งขัน เห็นอันดับได้ทันทีแบบเรียลไทม์",
  },
  {
    icon: "🎯",
    head: "เกมตอบคำถามเป็นทีม",
    body: "ใช้บันทึกคะแนนทีมในเกมตอบคำถามหรือควิซ กระตุ้นให้นักเรียนแข่งขันกันตอบ",
  },
  {
    icon: "⭐",
    head: "ให้คะแนนความประพฤติหรือความร่วมมือ",
    body: "ใช้เพิ่มคะแนนให้กลุ่มที่ตั้งใจเรียนหรือช่วยเหลือเพื่อนดี สร้างแรงจูงใจในห้องเรียน",
  },
  {
    icon: "📺",
    head: "ฉายขึ้นจอตลอดคาบเรียน",
    body: "ฉายกระดานคะแนนขึ้นจอหน้าห้องให้ทุกกลุ่มเห็นอันดับของตัวเองตลอดกิจกรรม",
  },
];

export default function GroupScoreboardPage() {
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
        <span className="font-semibold text-ink-secondary">
          กระดานคะแนนกลุ่ม
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          กระดานคะแนนกลุ่ม
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            เพิ่ม-ลดคะแนนแต่ละทีมแบบเรียลไทม์ ใช้ฟรี ไม่ต้องติดตั้ง
          </span>
          <span className="hidden md:inline">
            ให้คะแนนกลุ่มระหว่างเรียน เห็นอันดับทันที ฉายขึ้นจอหน้าห้องได้
            เหมาะกับกิจกรรมแข่งขันในชั้นเรียน
          </span>
        </p>
      </div>

      {/* Scoreboard app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <ScoreboardApp />
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
          <Link href="/group-maker" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">👥 จัดกลุ่มนักเรียน</Link>
          <Link href="/timer" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">⏱️ จับเวลาถอยหลัง</Link>
          <Link href="/tools" className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70">🧰 เครื่องมือทั้งหมด</Link>
        </div>
      </div>
    </main>
  );
}
