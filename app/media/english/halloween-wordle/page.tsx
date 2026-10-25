import type { Metadata } from "next";
import Link from "next/link";
import HalloweenWordleApp from "./HalloweenWordleApp";
import GameFaq from "../GameFaq";
import { ENGLISH_AUTHOR, gameFaqs, gameOgImage } from "../seo";
import { LENGTH_INFO, ROUND_SIZE, WORDS, WORD_LENGTHS } from "./wordData";
import { MAX_GUESSES } from "./wordleLogic";

const NAME = "Halloween Wordle";
const title = "Halloween Wordle เกมทายคำศัพท์ฮาโลวีนภาษาอังกฤษ เล่นฟรี | khuncool";
const description = `เกมทายคำศัพท์ฮาโลวีนภาษาอังกฤษแบบ Wordle สำหรับ ป.1–ป.6 ทายคำ 4–7 ตัวอักษรให้ได้ใน ${MAX_GUESSES} ครั้ง เช่น ghost, witch, pumpkin, vampire มีรูป คำแปลไทย ประโยคตัวอย่าง และเสียงอ่าน เล่นฟรีบนคอม แท็บเล็ต มือถือ ไม่ต้องสมัคร`;
const url = "https://www.khuncool.com/media/english/halloween-wordle";
const OG_IMAGE = gameOgImage("halloween-wordle", NAME, 1200, 675);

const wordCount = WORD_LENGTHS.reduce((sum, len) => sum + WORDS[len].length, 0);

const faqs = [
  ...gameFaqs(NAME, "ป.1–ป.6"),
  {
    q: "Halloween Wordle เล่นอย่างไร",
    a: `เลือกแบบเล่น (ช่วยเต็มที่หรือท้าทาย) และความยาวของคำ (4–7 ตัวอักษร) ดูรูปและฟังเสียง แล้วพิมพ์คำที่คิดว่าใช่ กดปุ่ม “ส่ง” หรือ Enter ช่องสีส้มคือตัวอักษรถูกตำแหน่ง สีม่วงคือมีในคำแต่ผิดตำแหน่ง สีเทาคือไม่มีในคำ ทายให้ได้ภายใน ${MAX_GUESSES} ครั้ง 1 รอบมี ${ROUND_SIZE} คำ`,
  },
  {
    q: "เกมนี้มีคำศัพท์ฮาโลวีนกี่คำ มีอะไรบ้าง",
    a: `มี ${wordCount} คำ เช่น ghost (ผี), witch (แม่มด), spider (แมงมุม), zombie (ซอมบี้), pumpkin (ฟักทอง), vampire (แวมไพร์) แต่ละคำมีรูป คำแปลภาษาไทย และประโยคตัวอย่างเป็นคำใบ้ และเมื่อจบข้อจะมีเสียงอ่านให้ฟัง`,
  },
  {
    q: "ครูใช้ Halloween Wordle สอนในห้องเรียนอย่างไร",
    a: "ฉายขึ้นจอหน้าชั้นแล้วให้นักเรียนช่วยกันเสนอตัวอักษรทีละคน หรือแบ่งทีมแข่งกันว่าทีมไหนทายคำได้ด้วยจำนวนครั้งน้อยกว่า ใช้เป็นกิจกรรมอุ่นเครื่อง 5–10 นาทีก่อนสอนคำศัพท์ฮาโลวีน หรือให้นักเรียนเล่นเดี่ยวบนแท็บเล็ตเป็นการทบทวน",
  },
];

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Halloween Wordle",
    "เกมฮาโลวีนภาษาอังกฤษ",
    "คำศัพท์ฮาโลวีน",
    "คำศัพท์ Halloween พร้อมคำแปล",
    "เกมทายคำศัพท์ภาษาอังกฤษ",
    "Wordle ภาษาอังกฤษ ป.4",
    "สื่อการสอนวันฮาโลวีน",
    "กิจกรรมวันฮาโลวีนในห้องเรียน",
    "Halloween vocabulary game",
    "เกมภาษาอังกฤษ ป.1 ป.6",
    "เครื่องมือครู",
  ],
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    title,
    description,
    url,
    locale: "th_TH",
    images: [OG_IMAGE],
  },
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
  "เลือกแบบเล่น: “ช่วยเต็มที่” มีรูป คำแปลไทย ประโยค เสียงอ่าน และตัวอักษรแรกให้ (เหมาะกับเด็กเล็ก) หรือ “ท้าทาย” ที่ต้องกดขอคำใบ้เอง",
  "เลือกความยาวของคำ ตั้งแต่ 4 ถึง 7 ตัวอักษร แล้วกด “เริ่มเล่น”",
  "ดูรูปและฟังเสียง แล้วพิมพ์ตัวอักษรที่เหลือจากแป้นพิมพ์จริงหรือแป้นบนหน้าจอ เมื่อครบช่องปุ่ม “ส่ง ✓” จะเรืองแสง กดเพื่อส่งคำตอบ",
  "ดูสีของแต่ละช่อง: ส้ม = ถูกตำแหน่ง · ม่วง = มีในคำแต่ผิดตำแหน่ง · เทา = ไม่มีในคำ",
  `ทายให้ได้ภายใน ${MAX_GUESSES} ครั้ง ยิ่งทายเร็วยิ่งได้ดาวมาก ครบ ${ROUND_SIZE} คำแล้วดูสรุปคำศัพท์พร้อมเสียงอ่าน`,
];

const IDEAS = [
  { t: "อุ่นเครื่องต้นคาบ", d: "ฉายขึ้นจอ ให้ทั้งห้องช่วยกันเสนอตัวอักษร 1 คำใช้เวลาไม่ถึง 3 นาที" },
  { t: "แข่งเป็นทีม", d: "แบ่งห้องเป็น 2–4 ทีม ทีมที่ทายได้ด้วยจำนวนครั้งน้อยที่สุดได้แต้ม" },
  { t: "ทบทวนหลังสอนคำศัพท์", d: "หลังสอน ghost, witch, pumpkin ให้นักเรียนเล่นเดี่ยวบนแท็บเล็ตเพื่อฝึกสะกดคำ" },
  { t: "ปรับระดับตามชั้นเรียน", d: "ป.1–2 เริ่มที่ 4 ตัวอักษร ป.5–6 ลองคำ 6–7 ตัวอักษรอย่าง spider หรือ pumpkin" },
];

const chip = "rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70";

export default function HalloweenWordlePage() {
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
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">Halloween Wordle เกมทายคำศัพท์ฮาโลวีนภาษาอังกฤษ 🎃</h1>
        <p className="m-0 max-w-[72ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          ทายคำศัพท์วันฮาโลวีนแบบ Wordle เช่น ghost, witch, spider, pumpkin ภายใน {MAX_GUESSES} ครั้ง ใบ้ด้วยสี รูป คำแปลไทย และประโยคตัวอย่าง พร้อมเสียงอ่านทุกคำ ใช้สอนหน้าชั้นเรียนหรือให้นักเรียนเล่นเองได้ฟรี
        </p>
      </div>
      <div className="px-4 pb-8 md:px-8 md:pb-10"><HalloweenWordleApp /></div>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="hw-how">
        <h2 id="hw-how" className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">วิธีเล่น Halloween Wordle</h2>
        <ol className="m-0 grid max-w-[78ch] gap-2 pl-5 text-[14px] leading-7 text-ink-secondary md:text-[15px]">
          {STEPS.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="hw-words">
        <h2 id="hw-words" className="m-0 mb-1 text-lg md:text-2xl">คำศัพท์ฮาโลวีนในเกม ({wordCount} คำ)</h2>
        <p className="m-0 mb-4 text-[13.5px] leading-7 text-ink-secondary md:text-sm">แบ่งตามความยาวของคำ ครูใช้เป็นรายการคำศัพท์ฮาโลวีนพร้อมคำแปลสำหรับเตรียมสอนได้เลย</p>
        <div className="grid gap-3 md:grid-cols-2">
          {WORD_LENGTHS.map((len) => (
            <article key={len} className="rounded-2xl border border-border bg-surface-card p-4 md:p-5">
              <h3 className="m-0 mb-2 text-[15px] leading-6 md:text-base">
                คำศัพท์ {len} ตัวอักษร · {LENGTH_INFO[len].label} ({LENGTH_INFO[len].grade})
              </h3>
              <ul className="m-0 grid list-none gap-x-4 gap-y-1 p-0 text-[13.5px] leading-7 text-ink-secondary sm:grid-cols-2 md:text-sm">
                {WORDS[len].map((w) => (
                  <li key={w.en}>
                    <span aria-hidden="true">{w.emoji} </span>
                    <strong className="text-ink">{w.en}</strong> — {w.th}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="hw-ideas">
        <h2 id="hw-ideas" className="m-0 mb-4 text-lg md:text-2xl">ไอเดียใช้ในห้องเรียนช่วงวันฮาโลวีน</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {IDEAS.map((idea) => (
            <article key={idea.t} className="rounded-2xl border border-border bg-surface-card p-4 md:p-5">
              <h3 className="m-0 mb-1.5 text-[15px] leading-6 md:text-base">{idea.t}</h3>
              <p className="m-0 text-[13.5px] leading-7 text-ink-secondary md:text-sm">{idea.d}</p>
            </article>
          ))}
        </div>
      </section>

      <GameFaq items={faqs} title={NAME} url={url} grade="ป.1–ป.6" teaches={["คำศัพท์ฮาโลวีนภาษาอังกฤษ", "การสะกดคำ 4–7 ตัวอักษร", "การอ่านบริบทจากประโยคตัวอย่าง"]} />

      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">สื่อการสอนที่เกี่ยวข้อง</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/media/english/vocabulary-arcade" className={chip}>🎮 Vocabulary Arcade</Link>
          <Link href="/media/english/weather-seasons" className={chip}>☀️ Weather &amp; Seasons</Link>
          <Link href="/random-name-picker" className={chip}>🎡 สุ่มชื่อนักเรียน</Link>
          <Link href="/media/english" className={chip}>🧰 สื่อการสอนทั้งหมด</Link>
        </div>
      </div>
    </main>
  );
}
