import type { Metadata } from "next";
import Link from "next/link";
import KrathongDesigner from "./KrathongDesigner";
import { CANDLES, CENTERS, FLOWERS, MATERIALS, PETALS, SHAPES, SLOT_COUNT, TRIMS, shapeLocked } from "./designOptions";

const URL = "https://www.khuncool.com/media/social-studies/krathong-designer";
const NAME = "ลอยกระทงออนไลน์ ทำกระทง 3 มิติ";
const title = "ลอยกระทงออนไลน์ 2569 ทำกระทงออนไลน์ 3 มิติ ออกแบบเองได้ ฟรี | khuncool";
const description = "ลอยกระทงออนไลน์ฟรี ไม่ต้องสมัคร ทำกระทงออนไลน์แบบ 3 มิติด้วยตัวเอง เลือกฐานหยวกกล้วย ขนมปัง กะลามะพร้าว หรือใบบัว ใส่กลีบใบตอง ยอดดอกบัว ดอกไม้ ธูปเทียน แล้วอธิษฐานลอยกระทงลงแม่น้ำคืนวันเพ็ญ ไม่สร้างขยะ เล่นได้ทั้งมือถือและจอห้องเรียน";
const OG_IMAGE = { url: "https://www.khuncool.com/assets/game-covers/krathong-designer.webp", width: 1200, height: 675, alt: "ลอยกระทงออนไลน์ กระทงใบตอง 3 มิติ ยอดดอกบัว ดาวเรือง และธูปเทียน" };

// How many krathongs the options can make, before counting the flower layout.
const BASES = MATERIALS.reduce((n, m) => n + (shapeLocked(m.id) ? 1 : SHAPES.length), 0);
const DESIGNS = BASES * PETALS.length * TRIMS.length * CENTERS.length * CANDLES.length * 2;
const designsText = DESIGNS.toLocaleString("th-TH");
const list = (items: { label: string }[]) => items.map((o) => o.label).join(" ");

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ลอยกระทงออนไลน์",
    "ลอยกระทงออนไลน์ 2569",
    "ทำกระทงออนไลน์",
    "กระทงออนไลน์",
    "ออกแบบกระทง",
    "เกมลอยกระทง",
    "เกมทำกระทง",
    "ลอยกระทงออนไลน์ ฟรี",
    "ลอยกระทงออนไลน์ ลดขยะ",
    "กระทงรักษ์โลก",
    "ส่วนประกอบของกระทง",
    "สื่อการสอนวันลอยกระทง",
    "กิจกรรมวันลอยกระทง",
  ],
  alternates: { canonical: URL },
  openGraph: { type: "website", title, description, url: URL, locale: "th_TH", siteName: "khuncool", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
};

const HOW = [
  { t: "เลือกฐานกระทง", d: `เลือกวัสดุ ${list(MATERIALS)} แล้วเลือกรูปทรง ${list(SHAPES)}` },
  { t: "ใส่กลีบรอบฐาน", d: `เลือกลาย ${list(PETALS.filter((p) => p.id !== "none"))} และลูกปัด${list(TRIMS.filter((t) => t.id !== "none"))}รอบฐาน` },
  { t: "เลือกยอดกระทง", d: `ตั้ง${list(CENTERS.filter((c) => c.id !== "none"))}ไว้ตรงกลาง` },
  { t: "ประดับดอกไม้", d: `เลือก${list(FLOWERS)} แล้วแตะช่องรอบขอบกระทงทีละช่อง (มี ${SLOT_COUNT} ช่อง) หรือกดใส่ทุกช่อง เว้นช่อง เพื่อสลับลาย` },
  { t: "ปักธูปเทียนแล้วจุดไฟ", d: `เลือก${list(CANDLES)} ปักธูป 3 ดอก แล้วกดจุดเทียน` },
  { t: "อธิษฐานแล้วลอยกระทง", d: "เลือกคำอธิษฐาน ใส่ชื่อเจ้าของกระทง แล้วกดลอยกระทงลงแม่น้ำคืนวันเพ็ญ กระทงของเพื่อนที่ลอยก่อนหน้าจะลอยอยู่ในแม่น้ำเดียวกัน" },
];

const PARTS = [
  { t: "ฐานกระทง", d: "นิยมใช้หยวกกล้วยเพราะลอยน้ำได้และย่อยสลายเองตามธรรมชาติ ปัจจุบันมีกระทงขนมปังที่ปลากินได้ และกระทงกะลามะพร้าวที่นำของเหลือมาใช้ใหม่" },
  { t: "กลีบใบตอง", d: "พับใบตองเป็นกลีบแหลมหรือกลีบกุหลาบ แล้วกลัดซ้อนรอบฐานเป็นชั้นๆ เป็นงานฝีมือที่สืบทอดกันมา" },
  { t: "ดอกบัวและดอกไม้", d: "ดอกบัวเป็นดอกไม้ที่ใช้บูชาพระ จึงนิยมทำเป็นยอดกระทง ส่วนดาวเรือง กุหลาบ และดอกไม้อื่นใช้ประดับให้สวยงาม" },
  { t: "ธูปเทียน", d: "จุดธูปเทียนเพื่อบูชาและขอขมาพระแม่คงคา ที่ได้อาศัยน้ำกินน้ำใช้ตลอดทั้งปี" },
];

const IDEAS = [
  { t: "ลอยกระทงทั้งห้อง", d: "ฉายบนจอหน้าชั้น สุ่มนักเรียนออกมาทำคนละใบแล้วใส่ชื่อ กระทงของทุกคนจะลอยรวมกันในแม่น้ำเดียว" },
  { t: "เรียนส่วนประกอบของกระทง", d: "ให้นักเรียนบอกชื่อแต่ละส่วนก่อนกดถัดไป ฐาน กลีบ ยอด ดอกไม้ ธูปเทียน แล้วอธิบายว่าใช้ทำอะไร" },
  { t: "คุยเรื่องกระทงรักษ์โลก", d: "เทียบฐานหยวกกล้วย ขนมปัง กะลามะพร้าว และใบบัว ว่าแบบไหนย่อยสลายได้ แบบไหนกลายเป็นอาหารปลา" },
  { t: "ออกแบบก่อนทำของจริง", d: "ให้นักเรียนออกแบบกระทงบนจอก่อน แล้วค่อยลงมือทำกระทงจริงตามแบบที่เลือกในคาบงานประดิษฐ์" },
];

const FAQS = [
  { q: "ลอยกระทงออนไลน์คืออะไร เล่นฟรีไหม", a: "เป็นการทำกระทงและลอยกระทงบนเว็บแบบ 3 มิติ เปิดบนเบราว์เซอร์ได้ทันที ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิก ไม่ต้องติดตั้งแอป" },
  { q: "ทำกระทงออนไลน์ได้กี่แบบ", a: `ฐาน ${MATERIALS.length} วัสดุ ${SHAPES.length} ทรง กลีบ ${PETALS.length} แบบ ยอด ${CENTERS.length} แบบ เทียน ${CANDLES.length} สี รวมกันได้กว่า ${designsText} แบบ ยังไม่นับการจัดวางดอกไม้ ${FLOWERS.length} ชนิดใน ${SLOT_COUNT} ช่องรอบขอบกระทง` },
  { q: "ลอยกระทงออนไลน์บนมือถือได้ไหม", a: "ได้ ใช้ได้ทั้งมือถือ แท็บเล็ต คอมพิวเตอร์ และจอโปรเจกเตอร์ในห้องเรียน กดปุ่มเต็มจอเพื่อให้กระทงใหญ่ขึ้น" },
  { q: "ลอยกระทงพร้อมเพื่อนได้ไหม", a: "ได้ เมื่อลอยกระทงแล้วกดทำกระทงใบใหม่ กระทงใบก่อนหน้าจะลอยอยู่ในแม่น้ำพร้อมป้ายชื่อ ทั้งห้องจึงผลัดกันทำบนเครื่องเดียวกันแล้วลอยรวมกันได้ (กระทงจะหายเมื่อปิดหรือรีโหลดหน้า)" },
  { q: "ลอยกระทงออนไลน์ช่วยลดขยะอย่างไร", a: "กระทงจริงจำนวนมากต้องถูกเก็บขึ้นจากแม่น้ำหลังวันลอยกระทง การลอยกระทงออนไลน์ไม่ทิ้งขยะลงน้ำ และยังใช้สอนเรื่องเลือกวัสดุที่ย่อยสลายได้ก่อนทำกระทงจริง" },
  { q: "เหมาะกับนักเรียนชั้นไหน", a: "ออกแบบสำหรับนักเรียนประถม ป.1–ป.6 ใช้เป็นกิจกรรมวันลอยกระทงในวิชาสังคมศึกษา ศิลปะ หรือการงานอาชีพ ใช้เวลาประมาณ 10–20 นาที" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
        { "@type": "ListItem", position: 2, name: "สื่อการสอน", item: "https://www.khuncool.com/media" },
        { "@type": "ListItem", position: 3, name: "สื่อสังคมศึกษา", item: "https://www.khuncool.com/media/social-studies" },
        { "@type": "ListItem", position: 4, name: "ลอยกระทงออนไลน์", item: URL },
      ],
    },
    {
      "@type": "WebApplication",
      name: NAME,
      alternateName: ["ทำกระทงออนไลน์", "ออกแบบกระทงของฉัน 3 มิติ", "เกมลอยกระทง"],
      url: URL,
      image: OG_IMAGE.url,
      description,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "th-TH",
      isAccessibleForFree: true,
      educationalLevel: "ประถมศึกษา",
      learningResourceType: "Interactive simulation",
      teaches: ["ประเพณีลอยกระทง", "ส่วนประกอบของกระทง", "วัสดุธรรมชาติที่ย่อยสลายได้"],
      dateModified: "2026-11-12",
      author: { "@type": "Person", name: "คุณคูล", url: "https://www.khuncool.com/about" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
    },
    {
      "@type": "HowTo",
      name: "วิธีลอยกระทงออนไลน์ ทำกระทง 3 มิติด้วยตัวเอง",
      description: "ทำกระทงออนไลน์ทีละขั้น ตั้งแต่เลือกฐานจนลอยกระทงลงแม่น้ำ",
      totalTime: "PT10M",
      image: OG_IMAGE.url,
      step: HOW.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.t, text: s.d, url: `${URL}#how-${i + 1}` })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

const section = "border-t border-border px-4 py-6 md:px-8 md:py-9";
const h2 = "m-0 mb-3 text-lg md:mb-4 md:text-2xl";
const card = "rounded-2xl border border-border bg-surface-card p-4 md:p-5";
const cardH = "m-0 mb-1.5 text-[15px] leading-6 md:text-base";
const cardP = "m-0 text-[13.5px] leading-7 text-ink-secondary md:text-sm";
const chip = "rounded-pill border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:opacity-70";

export default function KrathongDesignerPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">หน้าแรก</Link><span>›</span>
          <Link href="/media" className="text-ink-faint">สื่อการสอน</Link><span>›</span>
          <Link href="/media/social-studies" className="text-ink-faint">สังคมศึกษา</Link><span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">ลอยกระทงออนไลน์</span>
        </div>
      </nav>
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">ลอยกระทงออนไลน์ ทำกระทง 3 มิติด้วยตัวเอง 🪷</h1>
        <p className="m-0 max-w-[72ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          ทำกระทงออนไลน์ทีละชิ้นเหมือนต่อตัวต่อ เลือกฐาน ใส่กลีบใบตอง เลือกยอดดอกบัว ประดับดอกไม้ ปักธูปเทียน แล้วอธิษฐานและลอยกระทงลงแม่น้ำคืนวันเพ็ญเดือนสิบสอง ออกแบบได้กว่า {designsText} แบบ ใช้ฟรี ไม่ต้องสมัคร ไม่สร้างขยะลงแม่น้ำ เล่นได้ทั้งมือถือและจอหน้าชั้น
        </p>
      </div>
      <div className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10"><KrathongDesigner /></div>

      <section className={section} aria-labelledby="kd-how">
        <h2 id="kd-how" className={h2}>วิธีลอยกระทงออนไลน์ 6 ขั้นตอน</h2>
        <ol className="m-0 grid max-w-[80ch] gap-2 pl-5 text-[14px] leading-7 text-ink-secondary md:text-[15px]">
          {HOW.map((s, i) => <li key={s.t} id={`how-${i + 1}`}><strong className="text-ink">{s.t}</strong> — {s.d}</li>)}
        </ol>
      </section>

      <section className={section} aria-labelledby="kd-options">
        <h2 id="kd-options" className={h2}>ทำกระทงออนไลน์ได้แบบไหนบ้าง</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className={card}>
            <h3 className={cardH}>ฐานกระทง {MATERIALS.length} วัสดุ</h3>
            <ul className="m-0 grid list-none gap-1 p-0 text-[13.5px] leading-7 text-ink-secondary md:text-sm">
              {MATERIALS.map((m) => <li key={m.id}><strong className="text-ink">{m.label}</strong> — {m.note}</li>)}
            </ul>
          </article>
          <article className={card}>
            <h3 className={cardH}>กลีบและยอดกระทง</h3>
            <p className={cardP}>รูปทรง: {SHAPES.map((s) => s.label).join(" · ")}</p>
            <p className={cardP}>กลีบรอบฐาน: {PETALS.map((s) => s.label).join(" · ")}</p>
            <p className={cardP}>ยอดกระทง: {CENTERS.map((s) => s.label).join(" · ")}</p>
          </article>
          <article className={card}>
            <h3 className={cardH}>ดอกไม้และธูปเทียน</h3>
            <p className={cardP}>ดอกไม้: {FLOWERS.map((s) => s.label).join(" · ")} วางได้ {SLOT_COUNT} ช่องรอบขอบ</p>
            <p className={cardP}>ลูกปัด: {TRIMS.map((s) => s.label).join(" · ")}</p>
            <p className={cardP}>เทียน: {CANDLES.map((s) => s.label).join(" · ")} พร้อมธูป 3 ดอก</p>
          </article>
        </div>
      </section>

      <section className={section} aria-labelledby="kd-parts">
        <h2 id="kd-parts" className={h2}>ส่วนประกอบของกระทงและความหมาย</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {PARTS.map((p) => (
            <article key={p.t} className={card}>
              <h3 className={cardH}>{p.t}</h3>
              <p className={cardP}>{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={section} aria-labelledby="kd-ideas">
        <h2 id="kd-ideas" className={h2}>ไอเดียกิจกรรมวันลอยกระทงในห้องเรียน</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {IDEAS.map((idea) => (
            <article key={idea.t} className={card}>
              <h3 className={cardH}>{idea.t}</h3>
              <p className={cardP}>{idea.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={section} aria-labelledby="kd-faq">
        <h2 id="kd-faq" className={h2}>คำถามที่พบบ่อยเรื่องลอยกระทงออนไลน์</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {FAQS.map((f) => (
            <article key={f.q} className={card}>
              <h3 className={cardH}>{f.q}</h3>
              <p className={cardP}>{f.a}</p>
            </article>
          ))}
        </div>
      </section>

      <div className={section}>
        <h2 className={h2}>สื่อการสอนที่เกี่ยวข้อง</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/media/social-studies" className={chip}>🗺️ สื่อสังคมศึกษาทั้งหมด</Link>
          <Link href="/random-name-picker" className={chip}>🎲 สุ่มชื่อคนออกมาทำกระทง</Link>
          <Link href="/timer" className={chip}>⏱ จับเวลา</Link>
          <Link href="/media" className={chip}>🧰 สื่อการสอนทั้งหมด</Link>
        </div>
      </div>
    </main>
  );
}
