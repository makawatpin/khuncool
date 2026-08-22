import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import MediaGrid from "./MediaGrid";
import { CASES, FAQS, MEDIA, RELATED_ARTICLES, RELATED_TOOLS, SUBJECTS, TOPICS, TRUST_CHIPS } from "./data";

export const metadata: Metadata = {
  title: "สื่อการสอนสังคมศึกษา ประถม ใช้ฟรีออนไลน์ | khuncool",
  description: "รวมสื่อและเกมสังคมศึกษาออนไลน์สำหรับครูประถม เรียนรู้อาเซียน ภูมิศาสตร์ ประวัติศาสตร์ และหน้าที่พลเมือง เปิดใช้บนจอหน้าชั้นได้ทันที",
  keywords: ["สื่อการสอนสังคมศึกษา", "เกมสังคมศึกษา", "เกมอาเซียน", "สื่อการสอนอาเซียน", "หน้าที่พลเมือง", "กฎหมายในชีวิตประจำวัน", "สื่อการสอนสังคม ประถม"], alternates: { canonical: "https://www.khuncool.com/media/social-studies" },
  openGraph: { type: "website", title: "สื่อการสอนสังคมศึกษา ประถม ใช้ฟรีออนไลน์ | khuncool", description: "รวมสื่อสังคมศึกษาออนไลน์สำหรับครูประถม แยกตามสาระและเปิดใช้บนจอหน้าชั้นได้", url: "https://www.khuncool.com/media/social-studies", locale: "th_TH", images: [{ url: "https://www.khuncool.com/assets/khuncool-logo.webp", alt: "khuncool สื่อการสอนสังคมศึกษา" }] },
  twitter: { card: "summary_large_image" },
};

const jsonLd = { "@context": "https://schema.org", "@graph": [
  { "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
    { "@type": "ListItem", position: 2, name: "สื่อการสอน", item: "https://www.khuncool.com/media" },
    { "@type": "ListItem", position: 3, name: "สังคมศึกษา", item: "https://www.khuncool.com/media/social-studies" },
  ]},
  { "@type": "CollectionPage", name: "สื่อการสอนสังคมศึกษา", url: "https://www.khuncool.com/media/social-studies", inLanguage: "th-TH", dateModified: "2026-08-04", author: { "@type": "Person", name: "ครูคูล", url: "https://www.khuncool.com/about" }, description: "รวมเกมและสื่อสังคมศึกษาออนไลน์สำหรับครูประถมและมัธยมศึกษาตอนต้น" },
  { "@type": "ItemList", numberOfItems: MEDIA.length, itemListElement: MEDIA.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title })) },
  { "@type": "FAQPage", mainEntity: FAQS.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
]};

export default function SocialStudiesPage() {
  return <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
      <Link href="/" className="text-ink-faint">หน้าแรก</Link><span>›</span><Link href="/media" className="text-ink-faint">สื่อการสอน</Link><span>›</span><span className="font-semibold text-ink-secondary" aria-current="page">สังคมศึกษา</span>
    </div></nav>

    <div className="px-4 pb-[22px] pt-3 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-11 md:px-8 md:pb-[30px] md:pt-4">
      <div><h1 className="m-0 mb-2.5 text-[26px] leading-[1.32] md:mb-3.5 md:max-w-[16ch] md:text-[40px] md:leading-[1.24]">สื่อการสอนสังคมศึกษา เล่นได้ทั้งห้อง ใช้ฟรี</h1>
        <p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[58ch] md:text-[15.5px] md:leading-[1.75]">รวมเกมและสื่อสังคมศึกษาสำหรับครูประถมไว้ที่เดียว แยกตามสาระที่กำลังสอน เปิดจากเบราว์เซอร์และฉายขึ้นจอหน้าชั้นได้ เริ่มต้นด้วยเรื่องอาเซียน 11 ประเทศ</p>
        <div className="flex flex-wrap gap-[7px] md:gap-2">{TRUST_CHIPS.map((chip) => <span key={chip} className="rounded-pill bg-success-bg px-2.5 py-[5px] text-[11.5px] font-semibold text-success md:px-3 md:py-1.5 md:text-[12.5px]">{chip}</span>)}</div>
        <div className="mt-3 flex flex-wrap gap-2">{TOPICS.filter((topic) => topic !== "ทั้งหมด").map((topic) => <span key={topic} className="rounded-full bg-[#E7F0FF] px-3 py-1.5 text-xs font-semibold text-primary">{topic}</span>)}</div>
      </div>
      <aside className="mt-6 rounded-[20px] border border-border bg-surface-light p-5 md:p-6" aria-label="สื่อแนะนำ"><p className="m-0 text-xs font-bold uppercase tracking-wider text-primary">สื่อแนะนำ</p><h2 className="mb-2 mt-2 text-xl">{MEDIA[0].title}</h2><p className="m-0 text-sm leading-7 text-ink-secondary">{MEDIA[0].short}</p><div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-white p-3.5"><span className="text-2xl">{MEDIA[0].icon}</span><span className="min-w-0 flex-1 text-xs text-ink-secondary">{MEDIA[0].grade} · {MEDIA[0].time}</span><Link href={MEDIA[0].href} className="flex-none text-sm font-semibold text-primary no-underline">เปิดใช้ ›</Link></div></aside>
    </div>

    <div id="media" className="px-4 pb-6 md:px-8 md:pb-[34px]"><h2 className="m-0 mb-1.5 text-lg md:text-2xl">สื่อการสอนสังคมศึกษา</h2><p className="m-0 mb-3 max-w-[64ch] text-[13px] leading-[1.65] text-ink-secondary md:mb-[18px] md:text-[14.5px]">เลือกสื่อแล้วเปิดใช้งานผ่านเบราว์เซอร์ได้ทันที ไม่ต้องติดตั้งและไม่ต้องสมัครสมาชิก</p><MediaGrid /></div>

    <div className="border-y border-[#EEF0F4] bg-surface-light px-4 py-[22px] md:px-8 md:py-[26px]"><h2 className="m-0 mb-1.5 text-lg md:text-2xl">เลือกสื่อตามสิ่งที่กำลังจะสอน</h2><p className="m-0 mb-3 max-w-[62ch] text-[13px] leading-[1.65] text-ink-secondary md:mb-[18px] md:text-[14.5px]">เริ่มจากเป้าหมายของคาบ แล้วเลือกสื่อที่ตรงกับกิจกรรม</p><div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-[9px]">{CASES.map((item) => <div key={item.q} className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-white p-[12px_13px] md:p-[13px_15px]"><span className="flex-1 text-[13px] text-ink-secondary md:text-sm">{item.q}</span><span className="flex-none text-xs font-semibold text-primary md:text-[13px]">{item.a}</span></div>)}</div></div>

    <div className="px-4 py-[22px] md:flex md:gap-10 md:px-8 md:py-[28px]"><div className="mb-6 md:mb-0 md:flex-1"><h2 className="m-0 mb-1.5 text-lg md:text-2xl">ใช้คู่กับเครื่องมือครู</h2><p className="m-0 mb-3 text-[13px] leading-[1.65] text-ink-secondary md:mb-4 md:text-[14.5px]">จับเวลา แบ่งกลุ่ม และให้คะแนนระหว่างทำกิจกรรมหน้าชั้น</p><div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">{RELATED_TOOLS.map((tool) => <Link key={tool.href} href={tool.href} className="flex items-center gap-[11px] rounded-2xl border border-border bg-white p-3.5 text-inherit no-underline hover:border-[#C6C9FB]"><div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-[19px]" style={{ background: tool.bg }}>{tool.icon}</div><div><h3 className="m-0 mb-0.5 text-[15px]">{tool.title}</h3><p className="m-0 text-xs text-ink-secondary">{tool.sub}</p></div></Link>)}</div></div>
      <div className="md:w-[340px] md:flex-none"><h2 className="m-0 mb-1.5 text-lg md:text-2xl">วิชาอื่น</h2><p className="m-0 mb-3 text-[13px] text-ink-secondary">เลือกดูสื่อการสอนในรายวิชาอื่น</p><div className="grid grid-cols-2 gap-2 md:flex md:flex-col">{SUBJECTS.map((subject) => { const content = <><span className="text-lg">{subject.icon}</span><div><div className="text-[13px] font-semibold md:text-[14.5px]">{subject.t}</div><div className="text-[11px] text-ink-faint md:text-xs">{subject.st}</div></div></>; return subject.href ? <Link key={subject.t} href={subject.href} className="flex items-center gap-[9px] rounded-2xl border border-border p-[11px_12px] text-inherit no-underline hover:border-[#C6C9FB]">{content}</Link> : <div key={subject.t} className="flex items-center gap-[9px] rounded-2xl border border-dashed border-[#D8DCE5] p-[11px_12px]">{content}</div>; })}</div></div>
    </div>

    <div className="px-4 pb-[26px] md:grid md:grid-cols-[1fr_340px] md:gap-10 md:px-8 md:pb-9"><div><h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">คำถามที่ครูถามบ่อย</h2><FaqAccordion /></div><div className="mt-6 md:mt-0"><h2 className="m-0 mb-3 text-lg md:text-[19px]">อ่านเพิ่มเติม</h2><div className="flex flex-col gap-2">{RELATED_ARTICLES.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-light p-[13px_15px] text-inherit no-underline hover:bg-[#F1F2FC]"><span className="flex-1 text-sm text-ink-secondary">{item.t}</span><span className="text-[13px] text-primary">อ่าน ›</span></Link>)}</div></div></div>

    <div className="flex items-center gap-4 border-t border-border bg-surface-light px-4 py-5 md:px-8 md:py-[22px]"><div className="flex-1"><div className="mb-[3px] text-sm font-semibold">อยากได้สื่อสังคมศึกษาเรื่องไหนเพิ่ม</div><div className="text-[13px] text-ink-secondary">บอกหัวข้อที่สอนแล้วหาสื่อยาก เราสร้างจากคำขอของครูจริง</div></div><a href="mailto:khuncoolhub@gmail.com?subject=%E0%B8%82%E0%B8%AD%E0%B8%AA%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%AA%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%A1%E0%B8%A8%E0%B8%B6%E0%B8%81%E0%B8%A9%E0%B8%B2%E0%B9%80%E0%B8%9E%E0%B8%B4%E0%B9%88%E0%B8%A1" className="flex-none rounded-btn bg-primary px-5 py-[11px] text-sm font-semibold text-white no-underline hover:bg-primary-hover hover:text-white">ส่งคำขอ</a></div>
  </main>;
}
