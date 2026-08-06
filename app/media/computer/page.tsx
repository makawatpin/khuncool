import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import MediaGrid from "./MediaGrid";
import { CASES, EEAT_CARDS, FAQS, MEDIA, RELATED_SUBJECTS, RELATED_TOOLS, SKILLS, TRUST_CHIPS } from "./data";

export const metadata: Metadata = {
  title: "สื่อการสอนคอมพิวเตอร์ วิทยาการคำนวณ ประถม ใช้ฟรี | khuncool",
  description: "รวมเกมและสื่อการสอนคอมพิวเตอร์ วิทยาการคำนวณ สำหรับครูประถม ฝึก Coding การพิมพ์ ความปลอดภัยดิจิทัล และฮาร์ดแวร์ ใช้ฟรีผ่านเบราว์เซอร์",
  alternates: { canonical: "https://www.khuncool.com/media/computer" },
  openGraph: { type: "website", title: "สื่อการสอนคอมพิวเตอร์และวิทยาการคำนวณ | khuncool", description: "เกม Coding และทักษะดิจิทัลสำหรับนักเรียนประถม ใช้ฟรี เล่นได้ทั้งห้อง", url: "https://www.khuncool.com/media/computer", locale: "th_TH" },
  twitter: { card: "summary_large_image" },
};

const jsonLd = { "@context": "https://schema.org", "@graph": [
  { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
    { "@type": "ListItem", position: 2, name: "สื่อการสอน", item: "https://www.khuncool.com/media" },
    { "@type": "ListItem", position: 3, name: "คอมพิวเตอร์", item: "https://www.khuncool.com/media/computer" },
  ] },
  { "@type": "CollectionPage", name: "สื่อการสอนคอมพิวเตอร์และวิทยาการคำนวณ", url: "https://www.khuncool.com/media/computer", inLanguage: "th-TH", description: "เกมและสื่อวิทยาการคำนวณสำหรับครูประถม" },
  { "@type": "ItemList", numberOfItems: MEDIA.length, itemListElement: MEDIA.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title })) },
  { "@type": "FAQPage", mainEntity: FAQS.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
] };

export default function ComputerMediaPage() {
  return <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]"><Link href="/" className="text-ink-faint">หน้าแรก</Link><span>›</span><Link href="/media" className="text-ink-faint">สื่อการสอน</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">คอมพิวเตอร์</span></div></nav>

    <section className="px-4 pb-[22px] pt-3 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-11 md:px-8 md:pb-[30px] md:pt-4">
      <div><h1 className="m-0 mb-2.5 text-[26px] leading-[1.32] md:mb-3.5 md:max-w-[18ch] md:text-[40px] md:leading-[1.24]">สื่อวิทยาการคำนวณ สนุกได้แม้ห้องไม่มีคอม</h1><p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[60ch] md:text-[15.5px] md:leading-[1.75]">เกมและสื่อคอมพิวเตอร์สำหรับครูประถม แยกตามทักษะ Coding การพิมพ์ ความปลอดภัยดิจิทัล และฮาร์ดแวร์ ฉายขึ้นจอให้นักเรียนช่วยกันคิดเป็นทีม หรือเปิดเล่นรายคนผ่านเบราว์เซอร์ได้</p><div className="flex flex-wrap gap-[7px] md:gap-2">{TRUST_CHIPS.map((chip) => <span key={chip} className="rounded-pill bg-success-bg px-2.5 py-[5px] text-[11.5px] font-semibold text-success md:px-3 md:py-1.5 md:text-[12.5px]">{chip}</span>)}</div><div className="mt-3 flex flex-wrap gap-2">{SKILLS.filter((skill) => skill !== "ทั้งหมด").map((skill) => <span key={skill} className="rounded-full bg-[#E9E7FF] px-3 py-1.5 text-xs font-semibold text-primary">{skill}</span>)}</div></div>
      <aside className="mt-6 rounded-[20px] border border-border bg-surface-light p-5 md:p-6" aria-label="สื่อแนะนำ"><p className="m-0 text-xs font-bold uppercase tracking-wider text-primary">สื่อแนะนำ</p><h2 className="mb-2 mt-2 text-xl">{MEDIA[0].title}</h2><p className="m-0 text-sm leading-7 text-ink-secondary">{MEDIA[0].short}</p><div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-white p-3.5"><span className="text-2xl">{MEDIA[0].icon}</span><span className="min-w-0 flex-1 text-xs text-ink-secondary">{MEDIA[0].grade} · {MEDIA[0].time}</span>{MEDIA[0].href ? <Link href={MEDIA[0].href} className="flex-none text-sm font-semibold text-primary no-underline">เปิดใช้ ›</Link> : null}</div></aside>
    </section>

    <section className="px-4 pb-6 md:px-8 md:pb-[34px]" aria-labelledby="media-title"><h2 id="media-title" className="m-0 mb-1.5 text-lg md:text-2xl">สื่อการสอนคอมพิวเตอร์</h2><p className="m-0 mb-3 max-w-[64ch] text-[13px] leading-[1.65] text-ink-secondary md:mb-[18px] md:text-[14.5px]">เลือกสื่อแล้วเปิดใช้งานผ่านเบราว์เซอร์ได้ทันที ไม่ต้องติดตั้งและไม่ต้องสมัครสมาชิก</p><MediaGrid /></section>

    <section className="border-y border-[#EEF0F4] bg-surface-light px-4 py-[22px] md:px-8 md:py-[26px]"><h2 className="m-0 mb-1.5 text-lg md:text-2xl">เลือกจากสิ่งที่อยากให้เด็กทำได้</h2><p className="m-0 mb-3 text-[13px] text-ink-secondary md:mb-[18px] md:text-[14.5px]">เริ่มจากเป้าหมายของคาบ แล้วเลือกเกมที่ตอบโจทย์ได้ตรงที่สุด</p><div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-[9px]">{CASES.map((item) => <div key={item.q} className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-white p-[12px_13px] md:p-[13px_15px]"><span className="flex-1 text-[13px] text-ink-secondary md:text-sm">{item.q}</span><span className="text-xs font-semibold text-primary md:text-[13px]">{item.a}</span></div>)}</div></section>

    <section className="px-4 py-[22px] md:grid md:grid-cols-[1fr_340px] md:gap-10 md:px-8 md:py-[28px]"><div><h2 className="m-0 mb-1.5 text-lg md:text-2xl">เนื้อหาที่ครูวางใจนำไปใช้ได้</h2><p className="m-0 mb-4 max-w-[66ch] text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px]">สื่อทุกชิ้นออกแบบโดยมองจากสถานการณ์จริงในห้องเรียน เน้นเป้าหมายการเรียนรู้ที่ตรวจสอบได้ และไม่เก็บข้อมูลส่วนตัวของนักเรียนเกินจำเป็น</p><div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">{EEAT_CARDS.map((item) => <div key={item.k} className="rounded-2xl border border-border bg-white p-4"><div className="mb-1.5 font-mono text-[10.5px] font-semibold tracking-[.08em] text-success">{item.k}</div><h3 className="m-0 mb-1 text-[15px]">{item.t}</h3><p className="m-0 text-[12.5px] leading-[1.65] text-ink-secondary">{item.d}</p></div>)}</div></div><aside className="mt-6 rounded-2xl border border-border bg-surface-light p-4 md:mt-0 md:p-5"><div className="mb-3 flex items-center gap-3"><Image src="/assets/khuncool-logo.webp" alt="" width={52} height={52} className="rounded-2xl border border-border bg-white p-1.5"/><div><div className="font-anuphan font-bold">ครูคูล</div><div className="text-xs text-ink-secondary">ผู้เขียนและตรวจสอบเนื้อหา</div></div></div><p className="m-0 mb-3 text-[12.5px] leading-[1.75] text-ink-secondary">พัฒนาสื่อเพื่อให้ครูประถมนำไปเปิดใช้ได้ทันที ทั้งในห้องคอมพิวเตอร์และห้องเรียนที่มีเพียงจอหน้าชั้น</p><div className="border-t border-border pt-3 text-[12.5px] text-ink-secondary"><div className="flex justify-between gap-3"><span>อัปเดตล่าสุด</span><strong>4 ส.ค. 2569</strong></div><div className="mt-2 flex justify-between gap-3"><span>ระดับชั้น</span><strong>ป.2–ป.6</strong></div></div></aside></section>

    <section className="px-4 pb-[26px] md:grid md:grid-cols-[1fr_340px] md:gap-10 md:px-8 md:pb-9"><div><h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">คำถามที่ครูถามบ่อย</h2><FaqAccordion /></div><aside className="mt-6 md:mt-0"><h2 className="m-0 mb-3 text-lg md:text-[19px]">ใช้คู่กับเครื่องมือครู</h2><div className="flex flex-col gap-2">{RELATED_TOOLS.map((tool) => <Link key={tool.href} href={tool.href} className="flex items-center gap-[11px] rounded-2xl border border-border bg-white p-3.5 text-inherit no-underline hover:border-[#C6C9FB]"><span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl text-lg" style={{ background: tool.bg }}>{tool.icon}</span><span><span className="block font-anuphan text-[14.5px] font-semibold">{tool.title}</span><span className="block text-xs text-ink-secondary">{tool.sub}</span></span></Link>)}</div><h2 className="m-0 mb-3 mt-6 text-lg md:text-[19px]">สื่อวิชาอื่น</h2><div className="flex flex-col gap-2">{RELATED_SUBJECTS.map((subject) => <Link key={subject.href} href={subject.href} className="flex items-center gap-3 rounded-2xl border border-border p-3.5 text-inherit no-underline hover:border-[#C6C9FB]"><span className="text-xl">{subject.icon}</span><span className="flex-1 font-semibold">{subject.title}</span><span className="text-xs text-ink-faint">{subject.meta} ›</span></Link>)}</div></aside></section>

    <section className="flex items-center gap-4 border-t border-border bg-surface-light px-4 py-5 md:px-8 md:py-[22px]"><div className="flex-1"><div className="mb-[3px] text-sm font-semibold">อยากได้สื่อคอมพิวเตอร์เรื่องไหนเพิ่ม</div><div className="text-[13px] text-ink-secondary">ส่งหัวข้อที่สอนแล้วหาสื่อยากมาได้ เราจัดลำดับพัฒนาจากคำขอของครูผู้ใช้จริง</div></div><a href="mailto:khuncoolhub@gmail.com?subject=ขอสื่อคอมพิวเตอร์เพิ่ม" className="flex-none rounded-btn bg-primary px-5 py-[11px] text-sm font-semibold text-white no-underline hover:bg-primary-hover hover:text-white">ส่งคำขอ</a></section>
  </main>;
}
