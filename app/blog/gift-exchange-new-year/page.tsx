import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const URL = "https://www.khuncool.com/blog/gift-exchange-new-year";
const COVER = "https://www.khuncool.com/assets/gift-exchange-new-year-og.jpg";
const TOOL = "/gift-exchange";
const TITLE = "จับฉลากแลกของขวัญปีใหม่ 2570 ในห้องเรียน ไม่มีใครได้ชื่อตัวเอง พร้อมไอเดียของขวัญตามงบ";
const DESCRIPTION =
  "วิธีจับฉลากแลกของขวัญปีใหม่ 2570 ในห้องเรียนให้ไม่มีใครจับได้ชื่อตัวเอง ไม่ต้องจับใหม่ทั้งห้อง ฉายขึ้นจอให้นักเรียนเปิดกล่องของขวัญทีละคนต่อกันเป็นห่วงโซ่ ใช้ฟรี ไม่ต้องสมัคร พร้อมไอเดียของขวัญตามงบ เช็กลิสต์ก่อนวันงาน และแผนกิจกรรม 40 นาที";

export const metadata: Metadata = {
  title: `${TITLE} | Khuncool`,
  description: DESCRIPTION,
  keywords: [
    "จับฉลากแลกของขวัญ",
    "จับสลากแลกของขวัญ",
    "จับฉลากออนไลน์",
    "จับฉลากของขวัญปีใหม่",
    "แลกของขวัญปีใหม่ 2570",
    "กิจกรรมปีใหม่ในห้องเรียน",
    "ของขวัญปีใหม่ ราคาไม่เกิน 100 บาท",
    "ของขวัญจับฉลาก",
    "secret santa",
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [{ url: COVER, width: 1200, height: 630, alt: "ครูและนักเรียนประถมลุ้นเปิดกล่องของขวัญ ข้างจอที่ฉายเครื่องมือจับฉลากแลกของขวัญปีใหม่ 2570" }],
    locale: "th_TH",
    publishedTime: "2026-11-19",
    authors: ["https://www.khuncool.com/about"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [COVER] },
};

const problems = [
  { k: "จับได้ชื่อตัวเอง", v: "ต้องใส่คืนแล้วจับใหม่ ถ้าเป็นคนสุดท้ายที่เหลือแค่ชื่อตัวเอง ทั้งห้องต้องเริ่มจับใหม่หมด" },
  { k: "มีคนขาดเรียน", v: "ชื่อคนที่ไม่มาถูกจับไปแล้ว ของชิ้นนั้นไม่มีคนรับ และคนที่จับได้ชื่อนั้นก็ไม่มีคนให้" },
  { k: "ใช้เวลานาน", v: "ต้องเขียนชื่อ พับ ม้วน คอยตรวจว่าใครยังไม่ได้จับ และคอยเรียกลำดับว่าใครให้ใคร" },
  { k: "แอบดูกันก่อน", v: "เด็กเปิดฉลากดูก่อนแล้วบอกต่อ ความลุ้นตอนมอบของก็หายไป" },
];

const steps = [
  { k: "1. ใส่รายชื่อ", v: "วางรายชื่อนักเรียนบรรทัดละคน หรือกดปุ่มห้องเรียนเพื่อดึงรายชื่อที่บันทึกไว้ แล้วแตะชื่อคนที่ขาดเรียนออก" },
  { k: "2. สุ่มคนเริ่ม", v: "กดเริ่มจับฉลาก ชื่อจะวิ่งแบบสล็อตแล้วหยุดที่คนแรกที่ได้ออกมาเปิดกล่อง ทั้งห้องได้ลุ้นตั้งแต่วินาทีแรก" },
  { k: "3. เปิดกล่องทีละคน", v: "คนที่ถึงตาแตะกล่องของขวัญบนจอ กล่องจะเปิดเผยชื่อเพื่อนที่ต้องมอบของให้ แล้วเพื่อนคนนั้นออกมาเปิดกล่องเป็นคนถัดไป" },
  { k: "4. ปิดวง", v: "กล่องใบสุดท้ายวนกลับไปหาคนแรก ทุกคนได้ให้และได้รับคนละหนึ่งชิ้นพอดี แล้วจอจะแสดงวงโซ่ของทั้งห้อง" },
];

const gifts = [
  { budget: "ไม่เกิน 50 บาท", items: "ปากกาเจลชุดสี สมุดโน้ตเล่มเล็ก ยางลบรูปการ์ตูน ขนมห่อรวม สติกเกอร์ พวงกุญแจ", fit: "ป.1–ป.3 หรือห้องที่ผู้ปกครองหลากหลายรายได้" },
  { budget: "50–100 บาท", items: "สีไม้ 12 สี หนังสือนิทาน ลูกบอลยาง เกมการ์ด กล่องดินสอ ตุ๊กตาตัวเล็ก", fit: "งบที่โรงเรียนส่วนใหญ่เลือก เหมาะกับทุกชั้น" },
  { budget: "100–150 บาท", items: "กระบอกน้ำ ชุดเครื่องเขียน จิ๊กซอว์ ผ้าห่มผืนเล็ก โคมไฟอ่านหนังสือแบบหนีบ", fit: "ป.4–ม.3 หรืองานเลี้ยงครูในโรงเรียน" },
];

const checklist = [
  "ตกลงงบของขวัญให้เท่ากันทั้งห้อง แล้วแจ้งผู้ปกครองในกลุ่ม LINE ล่วงหน้าอย่างน้อย 1 สัปดาห์",
  "บอกเด็กว่ายังไม่รู้ว่าจะได้ให้ใคร ของจึงควรเป็นของที่ใครได้ก็ใช้ได้ ไม่เลือกเพศหรืออายุ",
  "ให้ห่อของมาเรียบร้อยและติดชื่อผู้ให้ไว้ใต้ห่อ ครูจะได้รู้ว่าของใครมาแล้วบ้าง",
  "เตรียมของสำรอง 2–3 ชิ้นไว้ให้เด็กที่ลืมนำของมา จะได้ไม่มีใครเสียใจกลางวง",
  "ทดลองเปิดหน้าเครื่องมือบนจอห้องเรียนก่อนวันงาน เช็กเสียงลำโพงและปุ่มเต็มจอ",
];

const lesson = [
  { t: "อุ่นเครื่อง", min: "10 นาที", d: "เล่นเกมคำศัพท์ปีใหม่หรือคริสต์มาสสั้นๆ ทั้งห้อง ให้บรรยากาศเริ่มสนุกก่อนแลกของ" },
  { t: "ทบทวนกติกา", min: "5 นาที", d: "อธิบายว่าคนที่เปิดกล่องต้องเดินไปมอบของให้เพื่อนที่จอบอก แล้วเพื่อนคนนั้นออกมาเปิดต่อ ให้กล่าวขอบคุณทุกครั้ง" },
  { t: "จับฉลากและมอบของ", min: "20 นาที", d: "ฉายเครื่องมือเต็มจอ ห้อง 30 คนใช้เวลาประมาณ 20 นาที ถ้าห้องใหญ่ให้เปิดกล่องเร็วขึ้นและมอบของหลังจบทั้งวง" },
  { t: "ปิดท้าย", min: "5 นาที", d: "ดูวงโซ่ของทั้งห้องบนจอด้วยกัน ถ่ายรูปหมู่กับของขวัญ แล้วให้เด็กเขียนคำอวยพรปีใหม่ถึงเพื่อนที่ได้รับของ" },
];

const faqs = [
  { q: "จับฉลากแลกของขวัญออนไลน์ที่ khuncool มีใครได้ชื่อตัวเองไหม", a: "ไม่มี ระบบสุ่มจากคนที่ยังไม่ได้รับของเท่านั้น และกล่องใบสุดท้ายจะวนกลับไปหาคนแรกเสมอ ทุกคนจึงได้ให้หนึ่งครั้งและได้รับหนึ่งครั้งพอดี ไม่ต้องจับใหม่" },
  { q: "จับฉลากกับจับสลาก เขียนแบบไหนถูก", a: "ตามพจนานุกรมฉบับราชบัณฑิตยสถาน คำที่ถูกคือ จับสลาก ส่วน ฉลาก หมายถึงป้ายหรือแผ่นข้อมูลที่ติดบนสินค้า แต่คนทั่วไปนิยมเขียน จับฉลาก จึงเห็นทั้งสองแบบ" },
  { q: "ใช้ได้กับนักเรียนกี่คน", a: "ตั้งแต่ 3 คนจนถึงห้องใหญ่ 50 คน ถ้ามีนักเรียนขาดหรือมาสาย กดปุ่มรายชื่อระหว่างเล่นเพื่อติ๊กออกหรือเพิ่มชื่อได้ ตราบใดที่ยังไม่มีใครจับได้ชื่อคนนั้น" },
  { q: "ถ้าปิดหน้าเว็บกลางคันต้องเริ่มใหม่ไหม", a: "ไม่ต้อง ระบบบันทึกความคืบหน้าไว้ในเบราว์เซอร์ทุกครั้งที่เปิดกล่อง เปิดหน้าใหม่จะมีปุ่มให้เล่นต่อจากเดิม" },
  { q: "ใช้กับงานเลี้ยงครูหรืองานเลี้ยงบริษัทได้ไหม", a: "ได้ ใส่รายชื่อผู้ร่วมงานแทนรายชื่อนักเรียน แล้วฉายขึ้นจอหรือเปิดบนมือถือ ใช้ได้ทั้งงานเลี้ยงสิ้นปีของครูและกลุ่มเพื่อน" },
  { q: "ต้องเสียเงินหรือสมัครสมาชิกไหม", a: "ไม่ต้อง ใช้ฟรีทั้งหมด ไม่ต้องสมัคร ไม่ต้องติดตั้งแอป เปิดบนเบราว์เซอร์ได้ทั้งคอมพิวเตอร์ แท็บเล็ต มือถือ และจอโปรเจกเตอร์" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "บทความ", item: "https://www.khuncool.com/articles" },
        { "@type": "ListItem", position: 3, name: "จับฉลากแลกของขวัญปีใหม่ 2570", item: URL },
      ],
    },
    {
      "@type": "Article",
      headline: TITLE,
      description: DESCRIPTION,
      inLanguage: "th",
      datePublished: "2026-11-19",
      dateModified: "2026-11-19",
      author: { "@type": "Person", name: "อาวล์", url: "https://www.khuncool.com/about" },
      publisher: { "@type": "Organization", name: "Khuncool", logo: { "@type": "ImageObject", url: "https://www.khuncool.com/assets/khuncool-logo.webp" } },
      image: COVER,
      mainEntityOfPage: URL,
      about: ["จับฉลากแลกของขวัญ", "กิจกรรมปีใหม่ในห้องเรียน", "ของขวัญปีใหม่"],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

const summary = [
  "จับฉลากบนจอแบบห่วงโซ่ ไม่มีใครได้ชื่อตัวเอง ไม่ต้องจับใหม่ทั้งห้อง",
  "แตะคนขาดเรียนออกได้ทั้งก่อนและระหว่างเล่น",
  "งบที่นิยมคือ 50–100 บาท และของควรเป็นของที่ใครได้ก็ใช้ได้",
  "ห้อง 30 คนใช้เวลาประมาณ 20 นาที ใช้ฟรี ไม่ต้องสมัคร",
];

const tags = ["จับฉลากแลกของขวัญ", "จับสลากแลกของขวัญ", "แลกของขวัญปีใหม่2570", "กิจกรรมปีใหม่", "ของขวัญปีใหม่", "เครื่องมือครู"];

const related = [
  { cat: "สื่อการสอน", title: "Santa Sleigh เกมคำศัพท์คริสต์มาสสำหรับอุ่นเครื่อง", href: "/media/english/santa-sleigh" },
  { cat: "สื่อการสอน", title: "สุ่มเลขที่นักเรียนด้วยเป็ดวิ่งแข่ง ใช้ยังไง", href: "/blog/duck-race-roll-number" },
  { cat: "เครื่องมือครู", title: "วงล้อสุ่มชื่อนักเรียน สุ่มคนจับรางวัลปีใหม่", href: "/random-name-picker" },
];

const h2 = "mt-8 text-xl md:text-2xl";
const p = "m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]";

export default function GiftExchangeNewYearPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">หน้าแรก</Link>
          <span>›</span>
          <Link href="/articles" className="text-ink-faint">บทความ</Link>
          <span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">จับฉลากแลกของขวัญปีใหม่ 2570</span>
        </div>
      </nav>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/gift-exchange-new-year-cover.webp"
          alt="ครูและนักเรียนประถมหัวเราะลุ้นเปิดกล่องของขวัญในห้องเรียน ข้างจอที่ฉายเครื่องมือจับฉลากแลกของขวัญปีใหม่ 2570 ไม่มีใครได้ชื่อตัวเอง"
          width={1600}
          height={900}
          priority
          className="block w-full rounded-card-lg bg-[#F1F3F6] object-cover md:rounded-[20px]"
        />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#DFF5EF] px-2.5 py-1 text-[12px] font-bold text-[#0A7A66] md:px-[11px] md:py-[5px]">สื่อการสอน</span>
            <span className="text-[12px] text-ink-faint">19 พ.ย. 2569 · อ่าน 6 นาที · โดย <Link href="/about">อาวล์ ผู้ก่อตั้ง khuncool</Link></span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">{TITLE}</h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            ใกล้ปีใหม่ 2570 แล้ว หลายห้องเรียนเตรียม<b>จับฉลากแลกของขวัญ</b>ในคาบสุดท้ายก่อนหยุดยาว
            ปัญหาที่ครูเจอทุกปีคือมีเด็กจับได้ชื่อตัวเอง ต้องจับใหม่จนเสียเวลาไปทั้งคาบ
            บทความนี้รวมวิธีจับฉลากบนจอที่<b>ไม่มีใครได้ชื่อตัวเอง</b> เช็กลิสต์ก่อนวันงาน ไอเดียของขวัญตามงบ และแผนกิจกรรม 40 นาที
          </p>

          <div className="my-5 rounded-2xl border border-[#F6CFD2] bg-[#FFF5F5] p-4 md:p-5">
            <div className="mb-1 text-[15px] font-bold md:text-base">🎁 ลองจับฉลากแลกของขวัญออนไลน์ได้เลย</div>
            <p className="m-0 mb-3 text-[13.5px] leading-[1.7] text-ink-secondary md:text-sm">ใส่รายชื่อแล้วฉายขึ้นจอได้ทันที ไม่ต้องสมัคร ใช้ได้ทั้งมือถือและจอหน้าชั้น</p>
            <Link href={TOOL} className="inline-block rounded-xl bg-[#D9434C] px-4 py-2.5 text-[14px] font-bold text-white no-underline hover:opacity-90">เริ่มจับฉลากแลกของขวัญ</Link>
          </div>

          <h2 className={h2}>ทำไมจับฉลากด้วยกระดาษถึงวุ่นทุกปี</h2>
          <div className="overflow-hidden rounded-2xl border border-[#CDEEE3]">
            {problems.map((s) => (
              <div key={s.k} className="flex gap-2.5 border-t border-[#E3F5EF] p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]">
                <span className="w-28 flex-none text-[13px] font-bold text-[#0A7A66] md:w-[150px] md:text-[14.5px] md:text-[#1A1D26]">{s.k}</span>
                <span className="flex-1 text-[13px] leading-[1.6] md:text-base md:leading-[1.6]">{s.v}</span>
              </div>
            ))}
          </div>
          <p className={`${p} mt-3`}>
            ปัญหาจับได้ชื่อตัวเองเกิดจากการที่ทุกคนจับพร้อมกันจากกล่องเดียว ถ้าเปลี่ยนเป็น<b>จับต่อกันเป็นห่วงโซ่</b>
            คือคนที่ได้รับของเป็นคนจับคนถัดไป และสุ่มเฉพาะจากคนที่ยังไม่ได้รับ ปัญหานี้จะหายไปเอง
          </p>

          <h2 className={h2}>จับฉลากแลกของขวัญออนไลน์แบบห่วงโซ่ 4 ขั้นตอน</h2>
          <div className="overflow-hidden rounded-2xl border border-[#CDEEE3]">
            {steps.map((s) => (
              <div key={s.k} className="flex gap-2.5 border-t border-[#E3F5EF] p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]">
                <span className="w-28 flex-none text-[13px] font-bold text-[#0A7A66] md:w-[150px] md:text-[14.5px] md:text-[#1A1D26]">{s.k}</span>
                <span className="flex-1 text-[13px] leading-[1.6] md:text-base md:leading-[1.6]">{s.v}</span>
              </div>
            ))}
          </div>
          <p className={`${p} mt-3`}>
            ข้อดีที่ครูชอบคือ<b>ไม่ต้องคอยเรียกลำดับ</b> คนที่เพิ่งได้รับของจะเป็นคนออกมาเปิดกล่องถัดไปเอง ห้องจึงเดินต่อจนครบวงโดยไม่ต้องมีใครถือรายชื่อ
            ชื่อบนจอตัวใหญ่อ่านได้จากหลังห้อง มีเสียงประกอบตอนกล่องเปิด และถ้าปิดหน้าเว็บกลางคันก็กลับมาเล่นต่อจากเดิมได้
          </p>

          <h2 className={h2}>เช็กลิสต์ก่อนวันแลกของขวัญ</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {checklist.map((c) => (
              <li key={c} className="flex gap-2.5 text-[14px] leading-[1.7] text-[#2E3440] md:text-[15px]">
                <span className="flex-none text-[#0A7A66]">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>

          <h2 className={h2}>ไอเดียของขวัญปีใหม่ตามงบ</h2>
          <p className={p}>เพราะเด็กไม่รู้ล่วงหน้าว่าจะได้ให้ใคร ของที่ดีที่สุดคือของที่ใช้ได้ทุกคน ราคาเป็นช่วงโดยประมาณ ครูปรับตามที่ตกลงกับผู้ปกครองได้</p>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full border-collapse text-left text-[13px] md:text-[14.5px]">
              <thead className="bg-surface-light text-[12px] md:text-[13px]">
                <tr><th className="p-3">งบ</th><th className="p-3">ตัวอย่างของขวัญ</th><th className="p-3">เหมาะกับ</th></tr>
              </thead>
              <tbody>
                {gifts.map((g) => (
                  <tr key={g.budget} className="border-t border-border align-top">
                    <td className="whitespace-nowrap p-3 font-bold">{g.budget}</td>
                    <td className="p-3 leading-[1.6]">{g.items}</td>
                    <td className="p-3 leading-[1.6] text-ink-secondary">{g.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${p} mt-3`}>ควรเลี่ยงของกินที่เด็กบางคนแพ้ ของมีคม และของที่ต้องใช้ถ่านหรือชาร์จไฟ ถ้าโรงเรียนอยากลดขยะ ให้ห่อด้วยกระดาษหนังสือพิมพ์หรือผ้าแทนกระดาษห่อของขวัญ</p>

          <h2 className={h2}>แผนกิจกรรมแลกของขวัญปีใหม่ 40 นาที</h2>
          <p className={p}>ใช้ได้ตั้งแต่ ป.1 ถึง ม.3 ฉายบนจอเครื่องเดียวก็พอ</p>
          <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3.5">
            {lesson.map((l) => (
              <div key={l.t} className="rounded-2xl border border-border bg-surface-light p-3.5 md:p-4">
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold md:text-[15.5px]">{l.t}</span>
                  <span className="text-[12px] font-semibold text-[#0A7A66]">{l.min}</span>
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">{l.d}</div>
              </div>
            ))}
          </div>
          <p className={`${p} mt-3`}>
            ช่วงอุ่นเครื่องใช้ <Link href="/media/english/santa-sleigh">Santa Sleigh เกมคำศัพท์คริสต์มาส</Link> ได้ทั้งห้องจากจอเดียว
            ถ้ามีของรางวัลพิเศษจากครู ใช้ <Link href="/duck-race">เกมแข่งเป็ดสุ่มชื่อ</Link> จับรางวัลปิดท้ายให้ทั้งห้องลุ้นอีกรอบ
          </p>

          <h2 className={h2}>คำถามที่พบบ่อย</h2>
          <div className="flex flex-col gap-2.5">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-2xl border border-border p-3.5 md:p-4">
                <summary className="cursor-pointer text-[14.5px] font-bold md:text-[15.5px]">{f.q}</summary>
                <p className="m-0 mt-2 text-[13.5px] leading-[1.75] text-ink-secondary md:text-[14.5px]">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">บทสรุป</h2>
            <p className={`${p} mb-4`}>
              การจับฉลากแลกของขวัญปีใหม่ไม่จำเป็นต้องวุ่นวาย ถ้าเปลี่ยนจากกล่องกระดาษเป็นการเปิดกล่องบนจอต่อกันเป็นห่วงโซ่
              ไม่มีใครได้ชื่อตัวเอง ไม่ต้องจับใหม่ และทั้งห้องได้ลุ้นไปพร้อมกันทุกคน ลองเปิด <Link href={TOOL}>จับฉลากแลกของขวัญออนไลน์</Link> ได้เลย
            </p>
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border p-4">
              <Image src="/assets/khuncool-logo.webp" alt="" width={44} height={44} className="flex-none" />
              <div className="text-[13px] leading-[1.6] text-ink-secondary">
                <div className="font-bold text-ink">เขียนโดย อาวล์ ผู้ก่อตั้ง khuncool</div>
                ทำสื่อการสอนและเครื่องมือฟรีสำหรับครูไทยระดับประถม · <Link href="/about">เกี่ยวกับเรา</Link> · อัปเดตล่าสุด 19 พ.ย. 2569
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-pill bg-surface-light px-2.5 py-1.5 text-[11.5px] font-medium text-ink-secondary">#{t}</span>
              ))}
            </div>
          </div>
        </article>

        <aside className="mt-8 flex flex-col gap-4 md:mt-0">
          <div className="rounded-2xl border border-[#CDEEE3] bg-[#F2FBF8] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-[#0A7A66]">สรุปสั้น</div>
            <div className="flex flex-col gap-2">
              {summary.map((s) => <div key={s} className="text-[13.5px] leading-[1.7] text-[#2E3440]">• {s}</div>)}
            </div>
            <div className="mt-4 border-t border-[#DDF2EB] pt-3.5">
              <Link href={TOOL} className="block rounded-xl bg-[#0A7A66] px-4 py-2.5 text-center text-[13.5px] font-bold text-white no-underline hover:opacity-90">🎁 เริ่มจับฉลากแลกของขวัญ</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E5E8EE] p-4">
            <div className="mb-1.5 text-sm font-bold">📌 อ่านต่อ</div>
            <div className="flex flex-col">
              {related.map((r) => (
                <Link key={r.title} href={r.href} className="block border-t border-border py-2.5 text-inherit no-underline hover:opacity-65">
                  <div className="mb-0.5 text-[11px] font-semibold text-[#0A7A66]">{r.cat}</div>
                  <div className="text-[13.5px] font-semibold leading-[1.5]">{r.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
