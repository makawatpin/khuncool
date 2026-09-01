import type { Metadata } from "next";
import Link from "next/link";
import FinalConsonantsApp from "../final-consonants/FinalConsonantsApp";
import { FAMILY_BY_ID } from "../final-consonants/familyData";

const family = FAMILY_BY_ID.kot;
const URL = "https://www.khuncool.com/media/thai/mae-kot";

export const metadata: Metadata = {
  title: family.seo.metaTitle,
  description: family.seo.metaDescription,
  keywords: ["แม่กด", "มาตราตัวสะกดแม่กด", "เกมแม่กด", "คำแม่กด", "แม่กด ป.1", "แม่กด ป.2", "ตัวสะกดไม่ตรงมาตรา"],
  alternates: { canonical: URL },
  openGraph: { type: "website", title: family.seo.metaTitle, description: family.seo.metaDescription, url: URL, locale: "th_TH", siteName: "khuncool" },
  twitter: { card: "summary_large_image", title: family.seo.metaTitle, description: family.seo.metaDescription },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
      { "@type": "ListItem", position: 2, name: "สื่อภาษาไทย", item: "https://www.khuncool.com/media/thai" },
      { "@type": "ListItem", position: 3, name: "มาตราตัวสะกด", item: "https://www.khuncool.com/media/thai/final-consonants" },
      { "@type": "ListItem", position: 4, name: "แม่กด", item: URL },
    ] },
    { "@type": "LearningResource", name: "แม่กด: บทเรียนและเกมแยกแม่กด แม่กก แม่กบ", url: URL, inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 1–3", learningResourceType: "Interactive lesson and educational game", teaches: ["เสียงท้ายแม่กด", "พยัญชนะตัวสะกดแม่กด", "การเปรียบเทียบแม่กด แม่กก และแม่กบ"], isAccessibleForFree: true },
    { "@type": "FAQPage", mainEntity: family.seo.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ],
};

export default function MaeKotPage() {
  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/thai">สื่อภาษาไทย</Link><span>›</span><Link href="/media/thai/final-consonants">มาตราตัวสะกด</Link><span>›</span><span aria-current="page">แม่กด</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4"><div className="mb-2 flex gap-2"><span className="rounded-full bg-[#FFE4E8] px-2.5 py-1 text-[10px] font-bold text-[#BE123C]">แม่กด · ป.1–ป.3</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">สอนและเล่นในหน้าเดียว</span></div><h1 className="mb-1.5 text-[24px] leading-[1.3] md:text-[30px]">แม่กด: ฟังเสียง ด แยกให้ออกจากแม่กกและแม่กบ</h1><p className="m-0 max-w-[92ch] text-[13.5px] leading-7 text-ink-secondary md:text-[14.5px]">{family.seo.uniqueIntroduction} บทเรียนนี้จึงให้เด็กออกเสียง เปรียบเทียบ และอธิบายก่อนเริ่มเกม ไม่ใช้การท่องรายชื่อเพียงอย่างเดียว</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label="สื่อการสอนแม่กด"><FinalConsonantsApp variant="kot" /></section>

    <section className="border-t border-border px-4 py-7 md:px-8 md:py-10"><div className="grid gap-7 md:grid-cols-2 md:gap-12"><div><h2 className="mb-2 text-xl">ทำไมตัวสะกดหลายตัวจึงเป็นแม่กด</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.soundExplanation} {family.seo.consonantExplanation}</p></div><div><h2 className="mb-2 text-xl">อย่าสอนแม่กดแยกจากแม่ที่สับสน</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.contrastExplanation} เกมในหน้านี้จึงผสมแม่กด 4 คำ แม่กก 3 คำ และแม่กบ 3 คำในรอบมาตรฐาน</p></div></div></section>

    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">พยัญชนะที่ใช้เป็นตัวสะกดแม่กด</h2><div className="mt-4 flex flex-wrap gap-2" aria-label="รายชื่อพยัญชนะตัวสะกดแม่กด">{family.consonants.map((letter) => <span key={letter} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#FECDD3] bg-[#FFF1F2] text-xl font-bold text-[#BE123C]">{letter}</span>)}</div><p className="mt-4 text-sm leading-7 text-ink-secondary">ให้เด็กเรียนผ่านคำจริงก่อน แล้วใช้รายการนี้เป็นแผนที่สรุป ตัวอย่างเช่น กิจ–จ, ราช–ช, ก๊าซ–ซ, กฎ–ฎ, รถ–ถ, บท–ท, โกรธ–ธ, อากาศ–ศ และกระดาษ–ษ</p></section>

    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">คำที่เด็กมักจัดแม่ผิด</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{family.seo.commonErrors.map((item) => <article key={item.word} className="rounded-xl border border-border p-4"><h3 className="m-0 text-base text-[#BE123C]">{item.word}</h3><p className="mb-1 mt-2 text-xs text-ink-faint">จุดที่มักพลาด: {item.mistake}</p><p className="m-0 text-sm leading-6 text-ink-secondary">{item.explanation}</p></article>)}</div></section>

    <section className="grid gap-6 border-t border-border px-4 py-7 md:grid-cols-2 md:px-8"><div><h2 className="text-xl">กิจกรรมก่อนเล่น 5 นาที</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.classroomActivity}</p></div><div><h2 className="text-xl">วิธีตรวจว่าเด็กเข้าใจจริง</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.teacherCheck}</p></div></section>

    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">คำถามเกี่ยวกับแม่กด</h2><div className="mt-3">{family.seo.faqs.map((faq) => <details key={faq.question} className="border-b border-border py-3"><summary className="cursor-pointer text-sm font-semibold">{faq.question}</summary><p className="text-sm leading-7 text-ink-secondary">{faq.answer}</p></details>)}</div></section>
  </main>;
}
