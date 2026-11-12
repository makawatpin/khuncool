import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const URL = "https://www.khuncool.com/blog/loy-krathong-online";
const COVER = "https://www.khuncool.com/assets/loy-krathong-online-cover.webp";
const GAME = "/media/social-studies/krathong-designer";
const TITLE = "ลอยกระทงออนไลน์ 2569 ทำกระทง 3 มิติด้วยตัวเอง ฟรี พร้อมไอเดียกิจกรรมในห้องเรียน";
const DESCRIPTION =
  "วิธีลอยกระทงออนไลน์ 2569 แบบทำกระทง 3 มิติด้วยตัวเอง เลือกฐาน กลีบ ยอด ดอกไม้ ธูปเทียน แล้วลอยลงแม่น้ำพร้อมพลุ ดาวน์โหลดรูปและวิดีโอเก็บเป็นผลงานได้ ใช้ฟรี ไม่ต้องสมัคร พร้อมแผนกิจกรรมวันลอยกระทงสำหรับครู";

export const metadata: Metadata = {
  title: `${TITLE} | Khuncool`,
  description: DESCRIPTION,
  keywords: [
    "ลอยกระทงออนไลน์",
    "ลอยกระทงออนไลน์ 2569",
    "ทำกระทงออนไลน์",
    "กระทงออนไลน์",
    "วันลอยกระทง 2569",
    "กิจกรรมวันลอยกระทง",
    "กิจกรรมวันลอยกระทงในโรงเรียน",
    "ส่วนประกอบของกระทง",
    "กระทงรักษ์โลก",
    "สื่อการสอนวันลอยกระทง",
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [{ url: COVER, width: 1600, height: 900, alt: "เด็กนักเรียนชี้ไปที่จอคอมพิวเตอร์ที่กำลังทำกระทง 3 มิติ บนเว็บ khuncool" }],
    locale: "th_TH",
    publishedTime: "2026-11-12",
    authors: ["https://www.khuncool.com/about"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [COVER] },
};

const steps = [
  { k: "1. เลือกฐาน", v: "เลือกวัสดุ หยวกกล้วย ขนมปัง กะลามะพร้าว หรือใบบัว แล้วเลือกรูปทรง กลม กลีบบัว หัวใจ หรือดาว" },
  { k: "2. ใส่กลีบรอบฐาน", v: "เลือกใบตองพับแหลม ใบตองพับกุหลาบ หรือกลีบบัวชมพู แล้วเลือกลูกปัดทองหรือมุกขาวรอบฐาน" },
  { k: "3. เลือกยอดกระทง", v: "ตั้งบัวตูม บัวบาน พุ่มใบตอง หรือพุ่มดาวเรืองไว้ตรงกลาง" },
  { k: "4. ประดับดอกไม้", v: "เลือกดาวเรือง ลีลาวดี กุหลาบ บานไม่รู้โรย หรือดอกรัก แล้วแตะช่องรอบขอบกระทงทีละช่อง จัดลายสลับเองได้" },
  { k: "5. ปักธูปเทียน", v: "เลือกสีเทียน ปักธูป 3 ดอก แล้วกดจุดเทียน" },
  { k: "6. อธิษฐานแล้วลอย", v: "เลือกคำอธิษฐาน ใส่ชื่อ แล้วกดลอยกระทงลงแม่น้ำคืนวันเพ็ญ ที่มีพลุ โคมลอย และกระทงของเพื่อนลอยอยู่ด้วย" },
];

const materials = [
  { m: "หยวกกล้วย", good: "ย่อยสลายได้เองตามธรรมชาติ เป็นวัสดุดั้งเดิม", care: "ใช้ไม้กลัดแทนลวดเย็บกระดาษหรือหมุด" },
  { m: "ขนมปัง", good: "ปลากินได้ ย่อยสลายเร็ว", care: "ถ้าลอยจำนวนมากในที่ที่ไม่มีปลา ขนมปังที่เหลือจะเน่าในน้ำ" },
  { m: "กะลามะพร้าว", good: "นำของเหลือจากครัวมาใช้ใหม่ ลอยน้ำดี", care: "ย่อยสลายช้า ควรเก็บกลับขึ้นมาหลังลอย" },
  { m: "ใบบัว", good: "ผิวใบกันน้ำได้เอง ลอยได้ดี", care: "เหี่ยวเร็ว ควรทำในวันลอยกระทง" },
  { m: "โฟม", good: "ไม่มี", care: "ไม่ย่อยสลาย เป็นขยะในแม่น้ำ ควรเลี่ยง" },
];

const lesson = [
  { t: "นำเข้าสู่บทเรียน", min: "10 นาที", d: "ถามนักเรียนว่าเคยลอยกระทงที่ไหน กระทงทำจากอะไร แล้วดูตัวเลขขยะกระทงของ กทม. ด้วยกัน" },
  { t: "ออกแบบกระทง", min: "20 นาที", d: "ฉายเกมขึ้นจอ ให้นักเรียนผลัดกันออกมาเลือกทีละขั้น หรือแบ่งกลุ่มใช้แท็บเล็ตกลุ่มละเครื่อง" },
  { t: "ลอยและนำเสนอ", min: "15 นาที", d: "แต่ละคนหรือแต่ละกลุ่มลอยกระทงพร้อมใส่ชื่อ แล้วอธิบายว่าเลือกวัสดุและส่วนประกอบนี้เพราะอะไร" },
  { t: "สรุป", min: "5 นาที", d: "ช่วยกันสรุปว่าส่วนประกอบแต่ละส่วนของกระทงมีความหมายอย่างไร และวัสดุแบบไหนไม่สร้างขยะ" },
];

const faqs = [
  { q: "วันลอยกระทง 2569 ตรงกับวันไหน", a: "วันลอยกระทงปี 2569 ตรงกับวันอังคารที่ 24 พฤศจิกายน 2569 ซึ่งเป็นวันขึ้น 15 ค่ำ เดือน 12 และไม่ใช่วันหยุดราชการ" },
  { q: "ลอยกระทงออนไลน์ที่ khuncool เสียเงินไหม", a: "ไม่เสียเงิน ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิก ไม่ต้องติดตั้งแอป เปิดบนเบราว์เซอร์ได้ทันที" },
  { q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม", a: "ได้ ใช้ได้ทั้งมือถือ แท็บเล็ต คอมพิวเตอร์ และจอโปรเจกเตอร์ในห้องเรียน มีปุ่มเต็มจอให้กระทงใหญ่ขึ้น" },
  { q: "เก็บรูปกระทงที่ทำไว้ได้ไหม", a: "ได้ หลังลอยกระทงกดบันทึกผลงาน พิมพ์ข้อความที่อยากให้ขึ้นด้านบน เลือกฉากหลัง แล้วดาวน์โหลดเป็นรูปหรือวิดีโอ 10 วินาที บนมือถือกดแชร์เพื่อบันทึกลงอัลบั้มหรือโพสต์ได้" },
  { q: "ลอยกระทงพร้อมเพื่อนทั้งห้องได้ไหม", a: "ได้ เมื่อเปิดบนจอหน้าชั้นเครื่องเดียว กระทงที่ลอยไปแล้วจะยังลอยอยู่ในแม่น้ำพร้อมป้ายชื่อ ทั้งห้องจึงลอยรวมกันได้ แต่กระทงจะหายเมื่อปิดหรือรีโหลดหน้า และยังไม่เชื่อมกันข้ามเครื่อง" },
  { q: "ลอยกระทงออนไลน์ช่วยลดขยะได้จริงไหม", a: "ช่วยได้ในส่วนของกระทงที่ไม่ต้องลอยจริง ปี 2568 กทม. เก็บกระทงได้ 391,027 ใบ และมีผู้ลอยกระทงออนไลน์ผ่านระบบของ กทม. 23,347 ใบ ส่วนในห้องเรียน เกมนี้ใช้สอนเรื่องเลือกวัสดุที่ย่อยสลายได้ก่อนลงมือทำกระทงจริง" },
];

const sources = [
  { t: "สำนักสิ่งแวดล้อม กรุงเทพมหานคร: ผลการเก็บกระทงในพื้นที่กรุงเทพมหานคร ประจำปี 2568", href: "https://gcc.go.th/2025/11/06/%E0%B8%AA%E0%B8%B3%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%AA%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B9%81%E0%B8%A7%E0%B8%94%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%A1-%E0%B8%81%E0%B8%97%E0%B8%A1-%E0%B9%80%E0%B8%9B/" },
  { t: "Thai PBS: กทม.จัดเก็บกระทงปี 68 ยอด 391,027 ใบ ลดลงจากปีก่อน 24%", href: "https://www.thaipbs.or.th/news/content/358272" },
  { t: "ฐานเศรษฐกิจ: วันลอยกระทง 2569 ตรงกับวันอังคารที่ 24 พฤศจิกายน 2569", href: "https://www.thansettakij.com/lifestyle/672476" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "บทความ", item: "https://www.khuncool.com/articles" },
        { "@type": "ListItem", position: 3, name: "ลอยกระทงออนไลน์ 2569", item: URL },
      ],
    },
    {
      "@type": "Article",
      headline: TITLE,
      description: DESCRIPTION,
      inLanguage: "th",
      datePublished: "2026-11-12",
      dateModified: "2026-11-12",
      author: { "@type": "Person", name: "อาวล์", url: "https://www.khuncool.com/about" },
      publisher: { "@type": "Organization", name: "Khuncool", logo: { "@type": "ImageObject", url: "https://www.khuncool.com/assets/khuncool-logo.webp" } },
      image: COVER,
      mainEntityOfPage: URL,
      about: ["ลอยกระทงออนไลน์", "ประเพณีลอยกระทง", "กิจกรรมวันลอยกระทงในห้องเรียน"],
      citation: sources.map((s) => s.href),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

const summary = [
  "วันลอยกระทง 2569 ตรงกับวันอังคารที่ 24 พฤศจิกายน 2569",
  "ทำกระทง 3 มิติเองได้ 6 ขั้น เลือกส่วนประกอบได้กว่า 5,600 แบบ แล้วลอยลงแม่น้ำพร้อมพลุ",
  "ดาวน์โหลดเป็นรูปหรือวิดีโอ 10 วินาที เก็บเป็นผลงานได้",
  "ใช้ฟรี ไม่ต้องสมัคร เปิดได้ทั้งมือถือ แท็บเล็ต และจอหน้าชั้น",
];

const tags = ["ลอยกระทงออนไลน์", "ลอยกระทงออนไลน์2569", "ทำกระทงออนไลน์", "วันลอยกระทง2569", "กิจกรรมวันลอยกระทง", "กระทงรักษ์โลก", "สื่อการสอนสังคมศึกษา"];

const related = [
  { cat: "สื่อการสอน", title: "6 เกมและกิจกรรมสังคมศึกษา ป.3–ป.6", href: "/blog/social-studies-games" },
  { cat: "สื่อการสอน", title: "สุ่มเลขที่นักเรียนด้วยเป็ดวิ่งแข่ง ใช้ยังไง", href: "/blog/duck-race-roll-number" },
  { cat: "เครื่องมือครู", title: "สุ่มชื่อนักเรียนออกมาลอยกระทงทีละคน", href: "/random-name-picker" },
];

const h2 = "mt-8 text-xl md:text-2xl";
const p = "m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]";

export default function LoyKrathongOnlinePage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">หน้าแรก</Link>
          <span>›</span>
          <Link href="/articles" className="text-ink-faint">บทความ</Link>
          <span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">ลอยกระทงออนไลน์ 2569</span>
        </div>
      </nav>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/loy-krathong-online-cover.webp"
          alt="เด็กนักเรียนชี้ไปที่จอคอมพิวเตอร์ที่กำลังทำกระทง 3 มิติ บนเว็บ khuncool ลอยกระทงออนไลน์ ทำกระทง 3 มิติด้วยตัวเอง"
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
            <span className="text-[12px] text-ink-faint">12 พ.ย. 2569 · อ่าน 7 นาที · โดย <Link href="/about">อาวล์ ผู้ก่อตั้ง khuncool</Link></span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">{TITLE}</h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            ปีนี้วันลอยกระทงตรงกับ<b>วันอังคารที่ 24 พฤศจิกายน 2569</b> ซึ่งเป็นวันเรียนตามปกติ หลายโรงเรียนจึงจัดกิจกรรมในคาบเรียนแทนการพาเด็กไปลอยจริง
            บทความนี้พาไปรู้จัก<b>ลอยกระทงออนไลน์</b>แบบที่ให้เด็ก<b>ทำกระทง 3 มิติด้วยตัวเอง</b>ทีละชิ้น ตั้งแต่เลือกฐานจนลอยลงแม่น้ำ
            พร้อมแผนกิจกรรม 50 นาทีที่ครูนำไปใช้ได้ทันที
          </p>

          <div className="my-5 rounded-2xl border border-[#F3D7E1] bg-[#FFF6F9] p-4 md:p-5">
            <div className="mb-1 text-[15px] font-bold md:text-base">🪷 ลองทำกระทงออนไลน์ได้เลย</div>
            <p className="m-0 mb-3 text-[13.5px] leading-[1.7] text-ink-secondary md:text-sm">เปิดบนเบราว์เซอร์ได้ทันที ไม่ต้องสมัคร ใช้ได้ทั้งมือถือและจอหน้าชั้น</p>
            <Link href={GAME} className="inline-block rounded-xl bg-[#e2557f] px-4 py-2.5 text-[14px] font-bold text-white no-underline hover:opacity-90">เริ่มทำกระทง 3 มิติ</Link>
          </div>

          <h2 className={h2}>ลอยกระทงออนไลน์คืออะไร</h2>
          <p className={p}>
            ลอยกระทงออนไลน์คือการทำและลอยกระทงบนหน้าจอแทนการลอยในแม่น้ำจริง แต่เดิมมักเป็นการเลือกรูปกระทงสำเร็จแล้วกดลอย
            แบบที่ khuncool ทำต่างออกไปตรงที่ให้เด็ก<b>ต่อกระทงเองทีละส่วนเหมือนต่อตัวต่อ</b> กระทงเป็นโมเดล 3 มิติที่หมุนดูได้รอบตัว
            ทุกชิ้นที่เลือกจะไปติดบนกระทงทันที เด็กจึงได้เห็นว่ากระทงหนึ่งใบประกอบด้วยอะไรบ้าง ไม่ใช่แค่กดลอยอย่างเดียว
          </p>

          <h2 className={h2}>ทำไมโรงเรียนหันมาลอยกระทงออนไลน์</h2>
          <p className={p}>
            เหตุผลหลักคือเรื่องขยะในแม่น้ำ ปี 2568 สำนักสิ่งแวดล้อม กรุงเทพมหานครเก็บกระทงได้ <b>391,027 ใบ</b> ลดลงราว 24% จากปีก่อนหน้า
            ในจำนวนนี้เป็นวัสดุธรรมชาติ 82.76% กระทงขนมปัง 10.01% และ<b>กระทงโฟมยังมีถึง 28,298 ใบ</b> (7.23%)
            ขณะเดียวกันมีผู้ลอยกระทงออนไลน์ผ่านระบบของ กทม. 23,347 ใบ
          </p>
          <p className={`${p} mt-3`}>
            อีกเหตุผลคือความปลอดภัย การพาเด็กเล็กไปริมน้ำตอนกลางคืนต้องใช้ครูดูแลหลายคน การทำกิจกรรมในห้องเรียนทำได้ทั้งห้องในคาบเดียว
            และยังใช้เป็นจุดตั้งต้นสอนเรื่องเลือกวัสดุก่อนให้เด็กไปทำกระทงจริงกับครอบครัว
          </p>

          <h2 className={h2}>วิธีลอยกระทงออนไลน์ 6 ขั้นตอน</h2>
          <div className="overflow-hidden rounded-2xl border border-[#CDEEE3]">
            {steps.map((s) => (
              <div key={s.k} className="flex gap-2.5 border-t border-[#E3F5EF] p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]">
                <span className="w-28 flex-none text-[13px] font-bold text-[#0A7A66] md:w-[170px] md:text-[14.5px] md:text-[#1A1D26]">{s.k}</span>
                <span className="flex-1 text-[13px] leading-[1.6] md:text-base md:leading-[1.6]">{s.v}</span>
              </div>
            ))}
          </div>
          <p className={`${p} mt-3`}>
            รวมแล้วเลือกได้กว่า 5,600 แบบ ยังไม่นับการจัดดอกไม้ 5 ชนิดในช่องรอบขอบ 10 ช่อง
            การ์ดตัวเลือกแต่ละใบแสดงภาพ 3 มิติของกระทงใบปัจจุบันถ้าเลือกตัวนั้น เด็กจึงเห็นผลก่อนตัดสินใจ
          </p>

          <h2 className={h2}>ส่วนประกอบของกระทงและความหมาย</h2>
          <p className={p}>
            ฐานทำหน้าที่ให้กระทงลอยน้ำ กลีบใบตองที่พับแล้วกลัดซ้อนรอบฐานเป็นงานฝีมือที่สืบทอดกันมา ดอกบัวเป็นดอกไม้ที่ใช้บูชาพระจึงนิยมทำเป็นยอด
            ส่วนธูปเทียนจุดเพื่อบูชาและขอขมาพระแม่คงคาที่เราได้อาศัยน้ำกินน้ำใช้ตลอดปี ในเกมเด็กต้อง<b>กดจุดเทียนก่อน</b>จึงจะไปขั้นอธิษฐานได้
            ครูใช้จังหวะนี้ถามนักเรียนได้ว่าทำไมต้องจุดเทียน
          </p>

          <h2 className={h2}>เลือกวัสดุฐานแบบไหนดี</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full border-collapse text-left text-[13px] md:text-[14.5px]">
              <thead className="bg-surface-light text-[12px] md:text-[13px]">
                <tr><th className="p-3">วัสดุ</th><th className="p-3">ข้อดี</th><th className="p-3">ข้อควรระวัง</th></tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.m} className="border-t border-border align-top">
                    <td className="p-3 font-bold">{m.m}</td>
                    <td className="p-3 leading-[1.6]">{m.good}</td>
                    <td className="p-3 leading-[1.6] text-ink-secondary">{m.care}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${p} mt-3`}>ในเกมมีฐานให้เลือก 4 แบบแรก ไม่มีโฟม และใต้ตัวเลือกจะมีบรรทัดสั้นๆ อธิบายข้อดีของวัสดุนั้น เพื่อชวนเด็กคิดเรื่องขยะไปพร้อมกัน</p>

          <h2 className={h2}>แผนกิจกรรมวันลอยกระทง 50 นาที</h2>
          <p className={p}>เหมาะกับ ป.1–ป.6 ใช้ได้ในวิชาสังคมศึกษา ศิลปะ หรือการงานอาชีพ ฉายบนจอเครื่องเดียวก็พอ</p>
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
            ถ้าห้องใหญ่ ใช้ <Link href="/random-name-picker">สุ่มชื่อ</Link> เลือกคนออกมาทำทีละคน
            กระทงที่ลอยไปแล้วจะยังอยู่ในแม่น้ำพร้อมป้ายชื่อ พอจบคาบแม่น้ำจะเต็มไปด้วยกระทงของทั้งห้อง
          </p>

          <h2 className={h2}>เก็บกระทงไว้เป็นผลงาน</h2>
          <p className={p}>
            หลังลอยกระทงแล้วกด<b>บันทึกผลงาน</b> พิมพ์ข้อความที่อยากให้ขึ้นด้านบน เช่น ชื่อหรือคำอธิษฐาน เลือกฉากหลังเป็นคืนลอยกระทงหรือพื้นสีชมพู
            แล้วดาวน์โหลดเป็นรูปแนวตั้ง 4:5 หรือวิดีโอ 10 วินาทีที่กล้องหมุนรอบกระทงพร้อมพลุ ขนาดพอดีโพสต์ Facebook, Instagram และ LINE
            บนมือถือและแท็บเล็ตมีปุ่มแชร์ให้บันทึกลงอัลบั้มได้ทันที ครูใช้เป็นชิ้นงานเก็บในแฟ้มสะสมผลงานหรือส่งให้ผู้ปกครองได้
          </p>

          <h2 className={h2}>จากการทำและทดสอบสื่อนี้</h2>
          <p className={p}>
            เราออกแบบตัวเลือกจากกระทงที่เห็นจริงในงานลอยกระทง ทั้งลายใบตองพับแหลมและพับกุหลาบ บัวตูม บัวบาน พุ่มดาวเรือง
            แล้วทดสอบหน้าจอทุกขั้นบน 7 ขนาดจอ ตั้งแต่มือถือ 375 พิกเซลจนถึงโปรเจกเตอร์ 1920 พิกเซล ทั้งแบบในหน้าเว็บและเต็มจอ รวม 112 กรณี
            เพื่อให้ปุ่มทุกปุ่มกดได้และไม่มีตัวเลือกหลุดจอ
          </p>
          <p className={`${p} mt-3`}>
            สิ่งที่ควรรู้ก่อนใช้ ภาพเป็นโมเดล 3 มิติที่สร้างสดในเบราว์เซอร์ เครื่องรุ่นเก่ามากอาจเปิดไม่ได้
            การสร้างวิดีโอต้องเปิดหน้าค้างไว้ 10 วินาที และกระทงของเพื่อนจะลอยรวมกันเฉพาะบนเครื่องเดียวกัน ยังไม่เชื่อมข้ามเครื่อง
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
              ลอยกระทงออนไลน์ไม่ได้มาแทนประเพณีจริง แต่ช่วยให้เด็กทั้งห้องได้ร่วมวันลอยกระทงในคาบเรียน ได้รู้ว่ากระทงประกอบด้วยอะไร
              และได้คิดเรื่องวัสดุที่ไม่สร้างขยะ ก่อนไปลอยกระทงจริงกับครอบครัว ลองเปิด <Link href={GAME}>ลอยกระทงออนไลน์ ทำกระทง 3 มิติ</Link> ได้เลย
            </p>
            <div className="mb-5 rounded-2xl bg-surface-light p-4">
              <div className="mb-2 text-[13px] font-bold">แหล่งข้อมูล</div>
              <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5 text-[13px] leading-[1.6] text-ink-secondary">
                {sources.map((s) => (
                  <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.t}</a></li>
                ))}
              </ol>
            </div>
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border p-4">
              <Image src="/assets/khuncool-logo.webp" alt="" width={44} height={44} className="flex-none" />
              <div className="text-[13px] leading-[1.6] text-ink-secondary">
                <div className="font-bold text-ink">เขียนโดย อาวล์ ผู้ก่อตั้ง khuncool</div>
                ทำสื่อการสอนและเครื่องมือฟรีสำหรับครูไทยระดับประถม · <Link href="/about">เกี่ยวกับเรา</Link> · อัปเดตล่าสุด 12 พ.ย. 2569
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
              <Link href={GAME} className="block rounded-xl bg-[#0A7A66] px-4 py-2.5 text-center text-[13.5px] font-bold text-white no-underline hover:opacity-90">🪷 เริ่มลอยกระทงออนไลน์</Link>
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
