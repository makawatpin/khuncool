import type { Metadata } from "next";
import Link from "next/link";
import SantaSleighApp from "./SantaSleighApp";
import GameFaq from "../GameFaq";
import { ENGLISH_AUTHOR, gameFaqs, gameOgImage } from "../seo";
import { HOUSES_PER_ROUND, SETS } from "./sleighData";

const NAME = "Santa's Sleigh";
const title = "Santa's Sleigh เกมคริสต์มาสภาษาอังกฤษ ส่งของขวัญให้ซานต้า เล่นฟรี | khuncool";
const wordCount = SETS.reduce((sum, s) => sum + s.words.length, 0);
const description = `เกมภาษาอังกฤษธีมคริสต์มาสสำหรับ ป.1–ป.5 ช่วยซานต้าขับเลื่อนส่งของขวัญ ฟังประโยค I want a teddy bear แล้วเลือกของขวัญใส่ปล่องไฟให้ถูกบ้าน ฝึกคำศัพท์ของเล่น คริสต์มาส และฤดูหนาว ${wordCount} คำ มีเสียงอ่าน เล่นฟรีบนคอม แท็บเล็ต มือถือ ไม่ต้องสมัคร`;
const url = "https://www.khuncool.com/media/english/santa-sleigh";
const OG_IMAGE = gameOgImage("santa-sleigh", NAME, 1200, 675);

const faqs = [
  ...gameFaqs(NAME, "ป.1–ป.5"),
  {
    q: "Santa's Sleigh เล่นอย่างไร",
    a: `เลือกชุดคำศัพท์และแบบเล่น แล้วกด “ออกเดินทาง” ซานต้าจะบินไปทีละบ้าน (รอบละ ${HOUSES_PER_ROUND} บ้าน) เด็กในบ้านจะบอกว่าอยากได้อะไร เช่น “I want a teddy bear” แตะของขวัญที่ถูกต้อง ซานต้าจะโยนลงปล่องไฟ ถ้าเลือกผิดก็ลองใหม่ได้ ไม่มีการตัดคะแนนรุนแรง`,
  },
  {
    q: "โหมด “ช่วยเต็มที่” กับ “ฟังอย่างเดียว” ต่างกันอย่างไร",
    a: "ช่วยเต็มที่จะมีรูป คำศัพท์ และคำแปลบนป้ายของขวัญ เหมาะกับเด็กเล็กที่เพิ่งเริ่มเรียนคำศัพท์ ส่วนฟังอย่างเดียวจะไม่มีป้าย เด็กต้องฟังเสียงแล้วเลือกรูปให้ถูก เป็นการฝึกทักษะการฟัง",
  },
  {
    q: `Santa's Sleigh มีคำศัพท์อะไรบ้าง`,
    a: `มี ${SETS.length} ชุด รวม ${wordCount} คำ ได้แก่ ของเล่น (teddy bear, robot, kite ฯลฯ) คริสต์มาส (Christmas tree, bell, reindeer ฯลฯ) และฤดูหนาวกับขนม (scarf, gloves, cookie ฯลฯ) ทุกคำมีเสียงอ่านและคำแปลไทย`,
  },
];

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Santa's Sleigh",
    "เกมคริสต์มาสภาษาอังกฤษ",
    "คำศัพท์คริสต์มาส",
    "คำศัพท์ภาษาอังกฤษวันคริสต์มาส พร้อมคำแปล",
    "เกมซานตาคลอส",
    "สื่อการสอนวันคริสต์มาส",
    "กิจกรรมวันคริสต์มาสในห้องเรียน",
    "Christmas vocabulary game",
    "I want a ... ภาษาอังกฤษ",
    "เกมภาษาอังกฤษ ป.1 ป.5",
    "เครื่องมือครู",
  ],
  alternates: { canonical: url },
  openGraph: { type: "website", title, description, url, locale: "th_TH", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "สื่อการสอน", item: "https://www.khuncool.com/media" },
        { "@type": "ListItem", position: 3, name: "สื่อการสอนภาษาอังกฤษ", item: "https://www.khuncool.com/media/english" },
        { "@type": "ListItem", position: 4, name: NAME, item: url },
      ],
    },
    {
      "@type": "WebApplication",
      name: `${NAME} Khuncool`,
      url,
      image: OG_IMAGE.url,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: ["th-TH", "en"],
      description,
      author: ENGLISH_AUTHOR,
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
  ],
};

const STEPS = [
  "เลือกชุดคำศัพท์ (ของเล่น · คริสต์มาส · ฤดูหนาวและขนม) และแบบเล่น “ช่วยเต็มที่” หรือ “ฟังอย่างเดียว”",
  "กด “ออกเดินทาง” ซานต้าจะขับเลื่อนไปบ้านหลังแรก เด็กในบ้านบอกว่าอยากได้อะไร พร้อมเสียงอ่านประโยค I want a …",
  "แตะของขวัญที่ตรงกับคำที่ได้ยิน หรือกดเลข 1–4 บนแป้นพิมพ์ ซานต้าจะโยนลงปล่องไฟ บ้านสว่างไฟ เด็กดีใจ",
  "เลือกผิดไม่เป็นไร ของขวัญจะเด้งกลับให้ลองใหม่ ถ้าลองผิดสองครั้ง ตัวเลือกที่ถูกจะเรืองแสงช่วยในโหมดช่วยเต็มที่",
  `ส่งครบ ${HOUSES_PER_ROUND} บ้านแล้วดูสรุปคำศัพท์ คลิกที่คำเพื่อฟังเสียงอ่านซ้ำ ส่งได้เร็วและแม่นยิ่งได้ดาวมาก`,
];

const IDEAS = [
  { t: "อุ่นเครื่องต้นคาบ", d: "ฉายขึ้นจอ ให้ทั้งห้องช่วยกันตอบว่าซานต้าควรหยิบของขวัญอะไร ใช้เวลา 5–8 นาที" },
  { t: "ฝึกประโยค I want a …", d: "ให้นักเรียนพูดตามประโยคที่ได้ยิน แล้วลองเปลี่ยนคำเองเป็นของที่ตัวเองอยากได้" },
  { t: "แข่งเป็นทีม", d: "แบ่งห้องเป็น 2–3 ทีม สลับกันเลือกของขวัญบ้านละทีม ทีมที่ส่งถูกตั้งแต่ครั้งแรกได้ 3 ดาว" },
  { t: "ฝึกการฟัง", d: "เลือกโหมดฟังอย่างเดียวสำหรับนักเรียนที่คุ้นคำศัพท์แล้ว ต้องฟังให้ออกโดยไม่มีตัวอักษรช่วย" },
];

const chip = "rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70";

export default function SantaSleighPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">หน้าแรก</Link><span>›</span>
          <Link href="/media" className="text-ink-faint">สื่อการสอน</Link><span>›</span>
          <Link href="/media/english" className="text-ink-faint">ภาษาอังกฤษ</Link><span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">{NAME}</span>
        </div>
      </nav>
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">Santa&apos;s Sleigh เกมคริสต์มาสภาษาอังกฤษ ส่งของขวัญให้ซานต้า 🎅</h1>
        <p className="m-0 max-w-[72ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          ช่วยซานต้าขับเลื่อนไปส่งของขวัญทีละบ้าน ฟังเด็กบอกว่า “I want a …” แล้วเลือกของขวัญใส่ปล่องไฟให้ถูก ฝึกคำศัพท์คริสต์มาส ของเล่น และฤดูหนาว พร้อมเสียงอ่านและแอนิเมชันสวย ๆ ใช้สอนหน้าชั้นหรือให้นักเรียนเล่นเองได้ฟรี
        </p>
      </div>
      <div className="px-4 pb-8 md:px-8 md:pb-10"><SantaSleighApp /></div>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="ss-how">
        <h2 id="ss-how" className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">วิธีเล่น Santa&apos;s Sleigh</h2>
        <ol className="m-0 grid max-w-[78ch] gap-2 pl-5 text-[14px] leading-7 text-ink-secondary md:text-[15px]">
          {STEPS.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="ss-words">
        <h2 id="ss-words" className="m-0 mb-1 text-lg md:text-2xl">คำศัพท์คริสต์มาสในเกม ({wordCount} คำ)</h2>
        <p className="m-0 mb-4 text-[13.5px] leading-7 text-ink-secondary md:text-sm">แบ่งเป็น {SETS.length} ชุด ครูใช้เป็นรายการคำศัพท์พร้อมคำแปลสำหรับเตรียมสอนได้เลย</p>
        <div className="grid gap-3 md:grid-cols-3">
          {SETS.map((set) => (
            <article key={set.id} className="rounded-2xl border border-border bg-surface-card p-4 md:p-5">
              <h3 className="m-0 mb-2 text-[15px] leading-6 md:text-base">{set.icon} {set.titleEn} · {set.title} ({set.grade})</h3>
              <ul className="m-0 grid list-none gap-y-1 p-0 text-[13.5px] leading-7 text-ink-secondary md:text-sm">
                {set.words.map((w) => (
                  <li key={w.id}>
                    <span aria-hidden="true">{w.emoji} </span>
                    <strong className="text-ink">{w.en}</strong> — {w.th}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="ss-ideas">
        <h2 id="ss-ideas" className="m-0 mb-4 text-lg md:text-2xl">ไอเดียใช้ในห้องเรียนช่วงวันคริสต์มาส</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {IDEAS.map((idea) => (
            <article key={idea.t} className="rounded-2xl border border-border bg-surface-card p-4 md:p-5">
              <h3 className="m-0 mb-1.5 text-[15px] leading-6 md:text-base">{idea.t}</h3>
              <p className="m-0 text-[13.5px] leading-7 text-ink-secondary md:text-sm">{idea.d}</p>
            </article>
          ))}
        </div>
      </section>

      <GameFaq items={faqs} title={NAME} url={url} grade="ป.1–ป.5" teaches={["คำศัพท์คริสต์มาส ของเล่น และฤดูหนาว", "ประโยค I want a …", "การฟังและเชื่อมเสียงกับภาพ"]} />

      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">สื่อการสอนที่เกี่ยวข้อง</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/gift-exchange" className={chip}>🎁 จับสลากแลกของขวัญ</Link>
          <Link href="/media/english/halloween-wordle" className={chip}>🎃 Halloween Wordle</Link>
          <Link href="/media/english/vocabulary-arcade" className={chip}>🎮 Vocabulary Arcade</Link>
          <Link href="/media/english" className={chip}>🧰 สื่อการสอนทั้งหมด</Link>
        </div>
      </div>
    </main>
  );
}
