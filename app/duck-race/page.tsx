import type { Metadata } from "next";
import Link from "next/link";
import DuckRaceApp from "./DuckRaceApp";

/*
 * Wording here follows what Search Console says people actually type. Over
 * three months this page drew 218 queries, and the one with real volume —
 * "สุ่มเป็ด", 3,589 impressions — is also where it ranks worst (6.3) and
 * converts worst (1.6% CTR against the page's own 8.3% average). On this
 * page CTR falls off a cliff between position 4 and 6: the queries it holds
 * at 3.3–4.5 convert at 13–26%. So the head term leads the title, and the
 * three clusters it was leaving on the table get their own copy below:
 * เลขที่ (~691 impressions at position 6.8–8.4), วงล้อ+เป็ด (~1,174) and
 * แข่งเป็ดว่ายน้ำ (~709).
 *
 * No `keywords` array: Google has ignored that meta tag since 2009, and
 * having it there invited us to park phrases in markup instead of writing
 * them into copy a teacher actually reads.
 */
export const metadata: Metadata = {
  title: "สุ่มเป็ด เกมแข่งเป็ดเข้าเส้นชัย สุ่มชื่อ-เลขที่ ฟรี | Khuncool",
  description:
    "เว็บสุ่มเป็ดออนไลน์ ใส่รายชื่อหรือเลขที่นักเรียน 1-30 หรือ 1-40 แล้วปล่อยเป็ดว่ายน้ำแข่งเข้าเส้นชัย ดูอันดับ 1-3 ฉายเต็มจอได้ ใช้ฟรี ไม่ต้องติดตั้งโปรแกรม",
  alternates: {
    canonical: "https://www.khuncool.com/duck-race",
  },
  openGraph: {
    type: "website",
    title: "สุ่มเป็ด เกมแข่งเป็ดเข้าเส้นชัย สุ่มชื่อ-เลขที่ ฟรี | Khuncool",
    description:
      "เว็บสุ่มเป็ด ใส่รายชื่อหรือเลขที่นักเรียนแล้วปล่อยเป็ดว่ายน้ำแข่งได้ทันที ฟรี ไม่ต้องสมัครสมาชิก ใช้ได้ทั้งบนคอมพิวเตอร์ แท็บเล็ต และมือถือ",
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
    name: "ใส่รายชื่อหรือเลขที่นักเรียน",
    text: "พิมพ์ชื่อทีละคนแล้วกด Enter หรือใส่เลขที่ตั้งแต่ 1 ถึงจำนวนคนในห้อง เช่น 1-30 หรือ 1-40 จะวางรายชื่อทั้งห้องจาก Excel หรือ Google Sheets มาทีเดียวก็ได้ ระบบจะสร้างเป็ดให้ตามจำนวนที่ใส่",
  },
  {
    name: "เลือกความยาวสนามแข่ง",
    text: "ปรับความยาวสนามได้ตั้งแต่สั้นมากถึงยาวมาก เพื่อกำหนดว่าการแข่งจะจบไวหรือลุ้นกันนาน ๆ",
  },
  {
    name: "กดเริ่มแข่ง",
    text: "กดปุ่มเริ่มแข่ง เป็ดทุกตัวจะว่ายน้ำแข่งกันไปที่เส้นชัยพร้อมนับถอยหลังก่อนออกตัว กดปุ่มเต็มจอเพื่อฉายขึ้นโปรเจกเตอร์ให้ทั้งห้องเห็นได้",
  },
  {
    name: "ดูผลลัพธ์บนโพเดียม",
    text: "เมื่อถึงเส้นชัยระบบจะขึ้นโพเดียมแสดงอันดับที่ 1-3 พร้อมเวลาเข้าเส้นชัย เลือกแข่งใหม่ได้ทันทีโดยไม่ต้องพิมพ์รายชื่อซ้ำ",
  },
];

const FAQS = [
  {
    q: "สุ่มเป็ดใช้ฟรีไหม ต้องโหลดโปรแกรมหรือเปล่า",
    a: "ใช้ฟรีทั้งหมดและไม่ต้องโหลดโปรแกรมสุ่มเป็ดมาติดตั้ง เพราะทำงานบนเว็บโดยตรง เปิดผ่านเบราว์เซอร์แล้วใช้ได้ทันที ไม่ต้องสมัครสมาชิก",
  },
  {
    q: "สุ่มเลขที่นักเรียน 1-30 หรือ 1-40 ทำยังไง",
    a: "ใส่ตัวเลขแทนชื่อในช่องรายชื่อได้เลย พิมพ์ทีละบรรทัดหรือวางตัวเลขทั้งชุดจาก Excel หรือ Google Sheets มาทีเดียวก็ได้ แต่ละเลขที่จะกลายเป็นเป็ดหนึ่งตัว ถ้าวันนั้นมีคนขาดให้ลบเลขที่นั้นออกก่อนกดเริ่ม",
  },
  {
    q: "ใส่เป็ดได้กี่ตัว",
    a: "ขั้นต่ำ 2 ตัวและไม่จำกัดจำนวนสูงสุด ใส่ได้ทั้งห้องหรือทั้งระดับชั้น แต่ละชื่อหรือแต่ละเลขที่จะกลายเป็นเป็ดหนึ่งตัวในสนามแข่ง",
  },
  {
    q: "สุ่มเป็ดต่างจากวงล้อสุ่มยังไง",
    a: "วงล้อสุ่มจะได้ผลลัพธ์ทันทีที่หมุนเสร็จ ส่วนการสุ่มเป็ดจะมีช่วงลุ้นระหว่างที่เป็ดว่ายน้ำแข่งไปเส้นชัย เหมาะกับกิจกรรมที่อยากให้เด็กเชียร์และลุ้นนานขึ้น",
  },
  {
    q: "ปรับความยาวสนามแข่งได้ไหม",
    a: "ได้ เลือกความยาวสนามได้ 5 ระดับตั้งแต่สั้นมากถึงยาวมาก สนามสั้นเหมาะกับการสุ่มไว ๆ ส่วนสนามยาวเหมาะกับกิจกรรมที่อยากให้ลุ้นกันนาน",
  },
  {
    q: "ฉายขึ้นจอโปรเจกเตอร์หรือใช้บนมือถือได้ไหม",
    a: "ได้ทั้งคู่ มีปุ่มเต็มจอสำหรับฉายขึ้นโปรเจกเตอร์หรือทีวีหน้าห้อง และรองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ",
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
      name: "สุ่มเป็ด เกมแข่งเป็ดเข้าเส้นชัย Khuncool",
      url: "https://www.khuncool.com/duck-race",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th",
      description:
        "เว็บสุ่มเป็ดออนไลน์ สุ่มชื่อหรือเลขที่นักเรียนด้วยการให้เป็ดว่ายน้ำแข่งเข้าเส้นชัย ใช้ฟรี ไม่ต้องติดตั้ง",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
    },
    {
      "@type": "HowTo",
      name: "วิธีสุ่มเป็ดออนไลน์ Khuncool",
      description:
        "ขั้นตอนการสุ่มเป็ดออนไลน์ ตั้งแต่ใส่รายชื่อหรือเลขที่นักเรียนจนถึงดูอันดับผลลัพธ์",
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
    icon: "🔢",
    head: "สุ่มเลขที่นักเรียนแทนการเรียกชื่อ",
    body: "โรงเรียนส่วนใหญ่ผูกเลขที่ไว้กับสมุดเช็กชื่อและใบงานอยู่แล้ว ใส่เลขที่ 1-30 หรือ 1-40 ตามจำนวนคนในห้องแทนรายชื่อ แล้วนำเลขที่ที่ได้ไปกรอกต่อได้ทันที",
  },
  {
    icon: "📋",
    head: "สุ่มลำดับการนำเสนองาน",
    body: "สุ่มว่ากลุ่มไหนหรือคนไหนออกไปนำเสนอก่อนหลัง ลดปัญหาแย่งกันเป็นกลุ่มสุดท้าย",
  },
  {
    icon: "🎁",
    head: "จับฉลาก เสี่ยงดวง และแจกของรางวัล",
    body: "ใส่รายการรางวัลหรือชื่อผู้ร่วมสนุกแทนชื่อนักเรียน ใช้เป็นตัวจับฉลากและเสี่ยงดวงที่ทุกคนเห็นผลพร้อมกัน ไม่มีใครเถียงว่าใครจับก่อน",
  },
  {
    icon: "🤝",
    head: "ใช้ในกิจกรรมทีมงานหรือที่ประชุม",
    body: "นอกเหนือจากห้องเรียน ยังใช้สุ่มลำดับพูด สุ่มผู้เล่นเกม หรือสุ่มมอบหมายงานในทีมได้เช่นกัน",
  },
];

/*
 * "วงล้อเป็ด", "วงล้อสุ่มเป็ด", "สุ่มวงล้อเป็ด" and friends are ~1,174
 * impressions a quarter: teachers who know the name wheel and are looking
 * for the duck equivalent. The page answered that only inside one FAQ line,
 * so the section below says it plainly and then helps them choose.
 */
const WHEEL_VS_DUCK = [
  {
    icon: "🦆",
    head: "เลือกสุ่มเป็ด เมื่อ…",
    points: [
      "อยากได้ช่วงลุ้นให้ทั้งห้องเชียร์ก่อนรู้ผล",
      "ต้องการอันดับที่ 1-3 ไม่ใช่แค่ผู้ชนะคนเดียว",
      "คนเยอะจนวงล้อซอยช่องเล็กเกินกว่าจะอ่านชื่อออก",
    ],
  },
  {
    icon: "🎡",
    head: "เลือกวงล้อสุ่มชื่อ เมื่อ…",
    points: [
      "อยากได้ผลทันทีที่หมุนจบ และสุ่มหลายรอบติดกัน",
      "ต้องการให้เห็นรายชื่อทั้งหมดพร้อมกันในวงเดียว",
      "ต้องกันไม่ให้ชื่อเดิมถูกเรียกซ้ำในรอบถัดไป",
    ],
  },
];

const RELATED_TOOLS = [
  {
    icon: "🎡",
    title: "วงล้อสุ่มชื่อนักเรียน",
    href: "/random-name-picker",
    desc: "อยากได้ผลลัพธ์ไวกว่าเกมแข่งเป็ด ใช้วงล้อสุ่มชื่อหมุนเลือกคนตอบคำถาม กันชื่อซ้ำได้ บันทึกรายชื่อไว้ใช้คาบหน้า",
  },
  {
    icon: "🔀",
    title: "สุ่มแบ่งกลุ่มนักเรียน",
    href: "/group-maker",
    desc: "สุ่มแบ่งกลุ่มนักเรียนให้เท่า ๆ กันอัตโนมัติ กำหนดจำนวนกลุ่มหรือจำนวนคนต่อกลุ่มก็ได้ ใช้ต่อจากการสุ่มชื่อได้ทันที",
  },
  {
    icon: "🏆",
    title: "กระดานคะแนนกลุ่ม",
    href: "/group-scoreboard",
    desc: "ให้คะแนนกลุ่มที่เป็ดเข้าเส้นชัยก่อน เห็นอันดับสดระหว่างเรียน ใช้กระตุ้นการมีส่วนร่วมได้ทั้งคาบ",
  },
  {
    icon: "⏱️",
    title: "จับเวลาและนับถอยหลัง",
    href: "/timer",
    desc: "ตั้งเวลาทำกิจกรรมหลังสุ่มชื่อเสร็จ ตัวเลขใหญ่เห็นจากหลังห้อง มีเสียงเตือนเมื่อหมดเวลา",
  },
  {
    icon: "🎯",
    title: "สุ่มคำถามหน้าชั้น",
    href: "/random-question",
    desc: "สุ่มชื่อได้แล้วสุ่มคำถามต่อ ใส่ชุดคำถามของคุณเองแล้วสุ่มขึ้นจอ ใช้ทบทวนบทเรียนท้ายคาบ",
  },
  {
    icon: "🎤",
    title: "เครื่องวัดเสียงในห้องเรียน",
    href: "/classroom-noise-meter",
    desc: "เกมแข่งเป็ดทำให้เด็กเชียร์กันเสียงดัง ใช้เครื่องวัดเสียงคุมระดับเสียงห้องเรียนไม่ให้เกินที่ตั้งไว้",
  },
];

const RELATED_ARTICLES = [
  {
    title: "สุ่มเลขที่นักเรียน 1-40 ด้วยเป็ดวิ่งแข่ง",
    href: "/blog/duck-race-roll-number",
  },
  {
    title: "10 กิจกรรมเกมเป็ดสุ่มชื่อในห้องเรียน",
    href: "/blog/duck-race-classroom-activities",
  },
  {
    title: "วงล้อสุ่มชื่อ vs เป็ดวิ่งแข่ง เลือกใช้ตัวไหนดี",
    href: "/blog/wheel-vs-duck-race",
  },
  {
    title: "8 ไอเดียใช้วงล้อสุ่มในห้องเรียน",
    href: "/blog/wheel",
  },
  {
    title: "ไอเดียกิจกรรมสุ่มชื่อนักเรียน",
    href: "/blog/random-name-activities",
  },
  {
    title: "เกมสุ่มชื่อนักเรียนที่เล่นได้จริงในคาบเรียน",
    href: "/blog/random-student-picker-games",
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
            สุ่มเป็ด
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          สุ่มเป็ด แข่งเป็ดเข้าเส้นชัย สุ่มชื่อ-เลขที่ ฟรี 🦆
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          เว็บสุ่มเป็ดออนไลน์ ใส่รายชื่อหรือเลขที่นักเรียนแล้วปล่อยเป็ดแข่ง
          เข้าเส้นชัยได้ทันที สุ่มแบบมีลุ้นบนเว็บ ใช้ฟรี
          ไม่ต้องสมัครสมาชิกหรือติดตั้ง
        </p>
      </div>

      {/* Duck race app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <DuckRaceApp />
      </div>

      {/* How to use */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          วิธีสุ่มเป็ดออนไลน์ 4 ขั้นตอน
        </h2>
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

      {/* Wheel vs duck */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-1.5 text-lg md:mb-2 md:text-2xl">
          สุ่มเป็ดกับวงล้อสุ่มชื่อ เลือกใช้ตัวไหนดี
        </h2>
        <p className="m-0 mb-3 max-w-[62ch] text-[13px] leading-[1.7] text-ink-secondary md:mb-4 md:text-sm md:leading-[1.75]">
          ครูหลายคนค้นหาคำว่า “วงล้อเป็ด” หรือ “วงล้อสุ่มเป็ด”
          เพราะคุ้นกับวงล้อสุ่มชื่ออยู่แล้วและอยากได้แบบที่เป็นเป็ด
          หน้านี้คือตัวนั้น ต่างกันตรงที่ผลลัพธ์มาจากการให้เป็ดว่ายน้ำแข่ง
          เข้าเส้นชัย ไม่ใช่เข็มที่หยุดบนช่อง
          ถ้ายังไม่แน่ใจว่าคาบนี้ควรใช้แบบไหน เทียบจากสองข้อนี้ได้เลย
        </p>
        <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
          {WHEEL_VS_DUCK.map((c) => (
            <div
              key={c.head}
              className="rounded-2xl border border-border bg-surface-card p-3.5 md:p-4"
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="text-lg md:text-[19px]">{c.icon}</span>
                <span className="text-sm font-bold md:text-[15.5px]">
                  {c.head}
                </span>
              </div>
              <ul className="m-0 list-disc pl-5 text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2.5">
          <Link
            href="/random-name-picker"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🎡 เปิดวงล้อสุ่มชื่อนักเรียน
          </Link>
          <Link
            href="/blog/wheel-vs-duck-race"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            📖 อ่านเปรียบเทียบแบบละเอียด
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
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

      {/* Related tools */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-1.5 text-lg md:mb-2 md:text-2xl">
          เครื่องมือครูอื่นที่ใช้คู่กับการสุ่มเป็ดได้
        </h2>
        <p className="m-0 mb-3 max-w-[62ch] text-[13px] leading-[1.7] text-ink-secondary md:mb-4 md:text-sm md:leading-[1.75]">
          หลังสุ่มชื่อด้วยเกมแข่งเป็ดแล้ว
          ครูส่วนใหญ่ใช้เครื่องมือเหล่านี้ต่อในคาบเดียวกัน ทุกตัวใช้ฟรี
          ไม่ต้องติดตั้ง
        </p>
        <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
          {RELATED_TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-2xl border border-border bg-surface-card p-3.5 no-underline hover:opacity-70 md:p-4"
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="text-lg md:text-[19px]">{t.icon}</span>
                <span className="text-sm font-bold text-ink md:text-[15.5px]">
                  {t.title}
                </span>
              </div>
              <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                {t.desc}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-3.5">
          <Link
            href="/tools"
            className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
          >
            🧰 ดูเครื่องมือครูออนไลน์ทั้งหมด
          </Link>
        </div>
      </div>

      {/* Related articles */}
      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          บทความที่เกี่ยวข้อง
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {RELATED_ARTICLES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70"
            >
              📖 {a.title}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
