import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที | Khuncool",
  description:
    "รวม 10 กิจกรรมสุ่มชื่อนักเรียนที่ครูเอาไปใช้ได้ทันที ตั้งแต่วอร์มอัพต้นคาบ สุ่มเวร จับกลุ่ม ไปจนถึงเกมท้ายคาบ พร้อมวิธีเล่นและเคล็ดลับคุมชั้นเรียน",
  alternates: {
    canonical: "https://www.khuncool.com/blog/random-name-activities",
  },
  openGraph: {
    type: "article",
    title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
    description: "10 กิจกรรมสุ่มชื่อที่ครูเอาไปใช้ได้ทันที พร้อมวิธีเล่นและเคล็ดลับ",
    images: ["https://www.khuncool.com/assets/random-name-cover.png"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const activities = [
  { n: "1", title: "สุ่มชื่อ–ต่อคำ", meta: "วอร์มอัพต้นคาบ · 5 นาที", body: "เกมเรียกความสนใจที่ใช้ทบทวนคำศัพท์หรือคำสำคัญของบทเรียนไปในตัว เหมาะกับวิชาภาษาไทย ภาษาอังกฤษ และวิทยาศาสตร์", how: "สุ่มชื่อคนแรก ให้พูดคำที่เกี่ยวกับบทเรียน จากนั้นสุ่มคนต่อไปให้พูดคำใหม่ที่ไม่ซ้ำเดิม ใครนึกไม่ออกใน 5 วินาที ให้ส่งต่อสิทธิ์ให้เพื่อน" },
  { n: "2", title: "ถามได้ตอบดี", meta: "ทบทวนเนื้อหา · 10 นาที", body: "พลิกบทบาทให้เด็กเป็นคนตั้งคำถาม ซึ่งช่วยให้ครูเห็นว่าเด็กเข้าใจเนื้อหาลึกแค่ไหน", how: "สุ่มชื่อคนที่ 1 ให้ตั้งคำถามจากบทเรียน แล้วสุ่มชื่อคนที่ 2 ให้ตอบ ถ้าตอบได้ทั้งคู่ได้คะแนนคนละ 1 แต้ม" },
  { n: "3", title: "เวรวันนี้ใครเอ่ย", meta: "จัดการชั้นเรียน · 2 นาที", body: "แก้ปัญหาเด็กบ่นว่าเวรไม่ยุติธรรม เพราะทุกคนเห็นการสุ่มพร้อมกันบนจอ", how: "สุ่มชื่อ 3-5 คนเป็นเวรประจำวัน แล้วลบชื่อออกจากรายการ จนครบทุกคนจึงเริ่มรอบใหม่" },
  { n: "4", title: "จับกลุ่มสายฟ้า", meta: "งานกลุ่ม · 5 นาที", body: "ลดปัญหาเด็กจับกลุ่มกับเพื่อนสนิทกลุ่มเดิมทุกครั้ง ทำให้ได้ฝึกทำงานกับคนหลากหลาย", how: "สุ่มหัวหน้ากลุ่มตามจำนวนกลุ่มที่ต้องการ จากนั้นสุ่มชื่อสมาชิกทีละคน แล้วให้เข้ากลุ่มเรียงตามลำดับที่สุ่มได้" },
  { n: "5", title: "ดาวเด่นประจำคาบ", meta: "เสริมแรงบวก · 3 นาที", body: "ใช้ปิดท้ายคาบเพื่อสร้างบรรยากาศบวก และทำให้เด็กเห็นข้อดีของกันและกัน", how: "สุ่มชื่อนักเรียน 1 คน แล้วให้เพื่อนในห้อง 2-3 คนช่วยกันบอกสิ่งที่คนนั้นทำได้ดีในคาบนี้" },
  { n: "6", title: "ผลัดกันเล่าเรื่อง", meta: "ฝึกพูด · 8 นาที", body: "ฝึกทักษะการเล่าเรื่องและการฟังไปพร้อมกัน เด็กจะตั้งใจฟังเพราะไม่รู้ว่าจะถูกสุ่มเมื่อไร", how: "ครูเริ่มเล่าเรื่อง 1 ประโยค แล้วสุ่มชื่อให้เล่าต่อคนละ 1-2 ประโยค จนได้เรื่องราวจบทั้งห้อง" },
  { n: "7", title: "สุ่มหัวข้อสุ่มคน", meta: "นำเสนอ · 10 นาที", body: "เหมาะกับคาบที่ต้องให้เด็กนำเสนอ ทำให้ทุกกลุ่มต้องเตรียมพร้อมจริง ไม่ใช่แค่คนเดิมพูด", how: "สุ่มหัวข้อจากวงล้อชุดหนึ่ง แล้วสุ่มชื่อผู้นำเสนอจากวงล้ออีกชุด ให้เวลาคิด 1 นาทีก่อนพูด 2 นาที" },
  { n: "8", title: "ใครจะช่วยตอบ", meta: "ช่วยเด็กที่ติดขัด · 3 นาที", body: "สร้างวัฒนธรรมช่วยเหลือกันแทนการปล่อยให้เด็กยืนตอบไม่ได้อยู่คนเดียวหน้าห้อง", how: "ถ้าคนที่ถูกสุ่มตอบไม่ได้ ให้เขาหมุนวงล้อเลือกเพื่อนมาช่วย 1 คน ถ้าตอบถูก ทั้งคู่ได้คะแนน" },
  { n: "9", title: "บิงโกรายชื่อ", meta: "กิจกรรมพิเศษ · 10 นาที", body: "เหมาะกับคาบแรกของเทอมหรือกิจกรรมโฮมรูม ช่วยให้เด็กรู้จักชื่อเพื่อนทั้งห้องเร็วขึ้น", how: "ให้เด็กเขียนชื่อเพื่อน 9 คนลงตาราง 3x3 จากนั้นครูสุ่มชื่อทีละคน ใครได้ครบแถวก่อนตะโกนบิงโก" },
  { n: "10", title: "สุ่มพักสมอง", meta: "เบรกกลางคาบ · 3 นาที", body: "ใช้ตอนเด็กเริ่มล้าในคาบบ่าย ช่วยรีเซ็ตสมาธิโดยไม่เสียเวลาสอนมาก", how: "ใส่กิจกรรมสั้น ๆ ลงวงล้อ เช่น ยืดเส้น 30 วินาที ร้องเพลง 1 ท่อน เล่าเรื่องตลก แล้วสุ่มทั้งกิจกรรมและคนที่จะนำทำ" },
];

const tips = [
  "ตั้งกติกา “ขอผ่านได้ 1 ครั้ง” ตั้งแต่ต้นเทอม เด็กขี้อายจะกล้ามีส่วนร่วมมากขึ้น",
  "ลบชื่อคนที่ถูกสุ่มไปแล้วออกจากรายการ เพื่อให้โอกาสกระจายครบทุกคน",
  "ให้เด็กเป็นคนกดหมุนแทนครูบ้าง จะเพิ่มความรู้สึกมีส่วนร่วมได้มาก",
  "อย่าใช้การสุ่มเป็นการลงโทษ ให้เป็นโอกาสเสมอ ไม่อย่างนั้นเด็กจะกลัวการถูกสุ่ม",
];

// NOTE: this array feeds BOTH the visible FAQ section and the FAQPage JSON-LD
// below — keep them in sync (mirrors the source helmet's @graph exactly).
const faqs = [
  { q: "กิจกรรมสุ่มชื่อเหมาะกับระดับชั้นไหน", a: "ใช้ได้ตั้งแต่อนุบาลถึงมัธยมปลาย เพียงปรับความยากของคำถามและกติกาให้เหมาะกับวัย เด็กเล็กเน้นกิจกรรมสั้นและมีการเคลื่อนไหว เด็กโตเน้นการคิดวิเคราะห์" },
  { q: "ถ้าเด็กไม่อยากถูกสุ่มควรทำอย่างไร", a: "ตั้งกติกาขอผ่านได้ 1 ครั้ง หรือให้เลือกเพื่อนช่วยตอบ เด็กจะรู้สึกปลอดภัยและกล้ามีส่วนร่วมมากขึ้น" },
  { q: "ใช้เวลากิจกรรมละกี่นาที", a: "ส่วนใหญ่ใช้เวลา 3-10 นาที เหมาะกับช่วงต้นคาบหรือท้ายคาบโดยไม่กระทบเนื้อหาหลัก" },
];

const tags = ["กิจกรรมสุ่มชื่อ", "สุ่มชื่อนักเรียน", "วงล้อสุ่ม", "กิจกรรมในห้องเรียน", "เทคนิคการสอน", "สื่อการสอน"];

const related = [
  { cat: "สื่อการสอน", title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง", date: "27 ก.ค. 2569", href: "/blog/wheel" },
  { cat: "รีวิวสินค้า", title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง", date: "26 ก.ค. 2569", href: "/blog/magnetic-frame" },
  { cat: "สื่อการสอน", title: "วัดเสียงในห้องเรียน ช่วยคุมระดับเสียงเด็กแบบไม่ต้องดุ", date: "15 ก.ค. 2569", href: "/classroom-noise-meter" },
  { cat: "เครื่องมือครู", title: "แข่งเป็ดสุ่มชื่อ กิจกรรมสุ่มชื่อนักเรียนแบบสนุก", date: "27 ก.ค. 2569", href: "/duck-race" },
];

// FAQPage @graph — must stay derived from `faqs` above (see NOTE).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
      inLanguage: "th",
      datePublished: "2026-07-27",
      author: { "@type": "Organization", name: "ทีมคุณคูล" },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/random-name-cover.png",
      mainEntityOfPage: "https://www.khuncool.com/blog/random-name-activities",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function BlogRandomNameActivitiesPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">หน้าแรก</Link>
        <span>›</span>
        <Link href="/articles" className="text-ink-faint">บทความ</Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">สื่อการสอน</span>
      </div>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/random-name-cover.png"
          alt="10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที"
          className="block w-full rounded-card-lg bg-[#F1F3F6] object-cover md:rounded-[20px]"
        />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#DFF5EF] px-2.5 py-1 text-[12px] font-bold text-[#0A7A66] md:px-[11px] md:py-[5px]">สื่อการสอน</span>
            <span className="rounded-pill bg-[#FFF3E0] px-2.5 py-1 text-[12px] font-semibold text-[#B45309] md:px-[11px] md:py-[5px]">ใช้ได้ทันที</span>
            <span className="text-[12px] text-ink-faint">27 ก.ค. 2569 · อ่าน 6 นาที · โดย ทีมคุณคูล</span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            การสุ่มชื่อไม่ได้มีไว้แค่ “เรียกคนตอบคำถาม” เท่านั้น ถ้าออกแบบกติกาให้ดี มันกลายเป็นกิจกรรมที่เด็กรอคอยได้เลย บทความนี้รวม{" "}
            <b>10 กิจกรรมสุ่มชื่อ</b> ที่ครูเอาไปใช้ในคาบต่อไปได้ทันที ทุกกิจกรรมใช้เวลาไม่เกิน 10 นาที และแทบไม่ต้องเตรียมอุปกรณ์
          </p>

          <div className="mb-2 rounded-2xl border border-[#FFD98A] bg-[#FFFBF3] p-4 md:p-[16px_20px]">
            <div className="text-sm leading-[1.75] text-[#2E3440] md:text-[15px]">
              ทุกกิจกรรมด้านล่างใช้คู่กับ <Link href="/random-name-picker">วงล้อสุ่มของขุนคูล</Link> ได้ทันที ใส่รายชื่อนักเรียนครั้งเดียว ใช้ได้ทั้งเทอม
            </div>
          </div>

          {activities.map((a) => (
            <div key={a.n} className="border-t border-border py-4 md:py-[22px]">
              <div className="mb-2 flex items-start gap-2.5 md:mb-2.5 md:gap-3.5">
                <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[9px] bg-[#2A1E4A] text-[12.5px] font-bold text-white md:h-[34px] md:w-[34px] md:rounded-xl md:text-[15px]">
                  {a.n}
                </span>
                <div className="flex-1">
                  <div className="mb-0.5 text-base font-bold leading-[1.35] md:text-xl">{a.title}</div>
                  <div className="text-[11.5px] text-ink-faint md:text-[12.5px]">{a.meta}</div>
                </div>
              </div>
              <div className="mb-2 text-[13.5px] leading-[1.75] text-[#2E3440] md:pl-12 md:text-[15.5px] md:leading-[1.85]">{a.body}</div>
              <div className="rounded-xl bg-surface-light p-2.5 md:ml-12 md:rounded-2xl md:p-4">
                <div className="mb-1 text-[11.5px] font-bold text-ink-faint md:text-xs">วิธีเล่น</div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">{a.how}</div>
              </div>
            </div>
          ))}

          <div className="mt-5 rounded-2xl border border-[#A9EBDA] bg-[#F6FFFC] p-4 md:mt-5 md:p-[20px_22px]">
            <div className="mb-2 text-xs font-bold text-[#0A7A66] md:mb-2.5 md:text-[13px]">✅ เคล็ดลับให้กิจกรรมสุ่มชื่อได้ผลจริง</div>
            <div className="flex flex-col gap-1.5 md:gap-2">
              {tips.map((t) => (
                <div key={t} className="text-[13px] leading-[1.7] text-[#2E3440] md:text-[15px] md:leading-[1.75]">• {t}</div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#C6C9FB] bg-[#F7F7FE] p-4 md:mt-6 md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">อยากเริ่มเลย ใช้วงล้อสุ่มของขุนคูล</div>
              <div className="text-[13.5px] text-ink-secondary">ใช้ฟรี · ไม่ต้องสมัคร · วางรายชื่อทั้งห้องได้ในคลิกเดียว</div>
            </div>
            <Link
              href="/random-name-picker"
              className="flex-none rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] no-underline hover:bg-[#4A46D6]"
            >
              🎡 เปิดวงล้อสุ่ม
            </Link>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">คำถามที่ครูถามบ่อย</h2>
          <div className="flex flex-col">
            {faqs.map((f) => (
              <div key={f.q} className="border-t border-border py-4">
                <div className="mb-1.5 text-sm font-bold md:text-base">{f.q}</div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">{f.a}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">สรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              กิจกรรมสุ่มชื่อไม่ใช่แค่เครื่องมือคุมชั้นเรียน แต่เป็นวิธีกระจายโอกาสให้เด็กทุกคนได้พูด ได้คิด และได้สนุกไปพร้อมกัน ลองเลือกสัก 2-3 กิจกรรมจากรายการนี้ไปใช้สลับกันในสัปดาห์หน้า แล้วสังเกตดูว่าห้องเรียนเปลี่ยนไปแค่ไหน
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              ติดตามไอเดียกิจกรรมและเครื่องมือช่วยครูฟรี ๆ ได้ที่ <Link href="/">Khuncool.com</Link> สำหรับครูไทยทุกคน
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-pill bg-surface-light px-2.5 py-1.5 text-[11.5px] font-medium text-ink-secondary">#{t}</span>
              ))}
            </div>
          </div>
        </article>

        <aside className="mt-8 flex flex-col gap-4 md:mt-0">
          <div className="rounded-2xl border border-[#E5E8EE] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-ink-faint">10 กิจกรรมในบทความนี้</div>
            <div className="flex flex-col gap-2">
              {activities.map((a) => (
                <div key={a.n} className="flex gap-2.5 text-[13px] leading-[1.5] text-ink-secondary">
                  <span className="flex-none font-bold text-ink-faint">{a.n}</span>
                  <span>{a.title}</span>
                </div>
              ))}
            </div>
            <Link
              href="/random-name-picker"
              className="mt-4 block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white no-underline hover:bg-[#4A46D6]"
            >
              🎡 เปิดวงล้อสุ่ม
            </Link>
          </div>

          <div className="rounded-2xl border border-[#E5E8EE] p-4">
            <div className="mb-1.5 text-sm font-bold">📌 บทความอื่น ๆ</div>
            <div className="flex flex-col">
              {related.map((r) => (
                <Link key={r.title} href={r.href} className="block border-t border-border py-2.5 text-inherit no-underline hover:opacity-65">
                  <div className="mb-0.5 text-[11px] font-semibold text-[#0A7A66]">{r.cat}</div>
                  <div className="text-[13.5px] font-semibold leading-[1.5]">{r.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-faint">{r.date}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
