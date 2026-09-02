import type { Metadata } from "next";
import Link from "next/link";
import FinalConsonantsApp from "./FinalConsonantsApp";
import { CONFUSION_GROUPS, FAMILY_BY_ID } from "./familyData";
import { WORDS } from "./wordData";
import type { FamilyId } from "./types";

const SITE_URL = "https://www.khuncool.com";

export function getFamilyMetadata(familyId: FamilyId): Metadata {
  const family = FAMILY_BY_ID[familyId];
  const url = `${SITE_URL}/media/thai/mae-${family.id}`;
  return {
    title: family.seo.metaTitle,
    description: family.seo.metaDescription,
    keywords: [family.name, `มาตราตัวสะกด${family.name}`, `เกม${family.name}`, `คำ${family.name}`, `${family.name} ป.1`, "มาตราตัวสะกด"],
    alternates: { canonical: url },
    openGraph: { type: "website", title: family.seo.metaTitle, description: family.seo.metaDescription, url, locale: "th_TH", siteName: "khuncool" },
    twitter: { card: "summary_large_image", title: family.seo.metaTitle, description: family.seo.metaDescription },
  };
}

export default function FinalConsonantFamilyPage({ familyId }: { familyId: FamilyId }) {
  const family = FAMILY_BY_ID[familyId];
  const url = `${SITE_URL}/media/thai/mae-${family.id}`;
  const group = CONFUSION_GROUPS[family.confusionGroupId].map((id) => FAMILY_BY_ID[id]);
  const samples = WORDS.filter((word) => word.familyId === familyId).slice(0, 6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "สื่อภาษาไทย", item: `${SITE_URL}/media/thai` },
        { "@type": "ListItem", position: 3, name: "มาตราตัวสะกด", item: `${SITE_URL}/media/thai/final-consonants` },
        { "@type": "ListItem", position: 4, name: family.name, item: url },
      ] },
      { "@type": "LearningResource", name: `${family.name}: บทเรียนและเกมจำแนกมาตราตัวสะกด`, url, inLanguage: "th-TH", educationalLevel: "ประถมศึกษาปีที่ 1–3", learningResourceType: "Interactive lesson and educational game", teaches: [`เสียงท้าย${family.name}`, `พยัญชนะตัวสะกด${family.name}`, `การเปรียบเทียบ ${group.map((item) => item.name).join(" ")}`], isAccessibleForFree: true },
      { "@type": "FAQPage", mainEntity: family.seo.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    ],
  };

  return <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <nav aria-label="breadcrumb"><div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:px-8 md:pt-[18px]"><Link href="/">หน้าแรก</Link><span>›</span><Link href="/media/thai">สื่อภาษาไทย</Link><span>›</span><Link href="/media/thai/final-consonants">มาตราตัวสะกด</Link><span>›</span><span aria-current="page">{family.name}</span></div></nav>
    <header className="px-4 pb-3 pt-3 md:px-8 md:pb-4"><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `${family.color}18`, color: family.color }}>{family.name} · ป.1–ป.3</span><span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-bold text-success">สอนและเล่นในหน้าเดียว</span></div><h1 className="mb-1.5 text-[24px] leading-[1.3] md:text-[30px]">{family.name}: {family.id === "kaa" ? "ฝึกฟังคำที่ไม่มีตัวสะกด" : `ฝึกฟังเสียงท้าย ${family.endingSound}`} และแยกจากแม่ที่คล้ายกัน</h1><p className="m-0 max-w-[92ch] text-[13.5px] leading-7 text-ink-secondary md:text-[14.5px]">{family.seo.uniqueIntroduction} บทเรียนจะพาเด็กออกเสียง เปรียบเทียบ และอธิบายก่อนเริ่มเกม</p></header>
    <section className="px-2 pb-8 sm:px-4 md:px-8 md:pb-10" aria-label={`สื่อการสอน${family.name}`}><FinalConsonantsApp variant={family.id} /></section>
    <section className="border-t border-border px-4 py-7 md:px-8 md:py-10"><div className="grid gap-7 md:grid-cols-2 md:gap-12"><div><h2 className="mb-2 text-xl">หลักสังเกต{family.name}</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.soundExplanation} {family.seo.consonantExplanation}</p></div><div><h2 className="mb-2 text-xl">แยกจากแม่ที่มักสับสน</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.contrastExplanation} เกมในหน้านี้จึงผสมคำจาก {group.map((item) => item.name).join(" ")} ในทุกรอบ</p></div></div></section>
    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">{family.consonants.length ? `พยัญชนะที่ใช้เป็นตัวสะกด${family.name}` : `${family.name}ไม่มีตัวสะกด`}</h2>{family.consonants.length ? <div className="mt-4 flex flex-wrap gap-2" aria-label={`รายชื่อพยัญชนะตัวสะกด${family.name}`}>{family.consonants.map((letter) => <span key={letter} className="grid h-11 w-11 place-items-center rounded-xl border-2 text-xl font-bold" style={{ borderColor: `${family.color}55`, backgroundColor: `${family.color}10`, color: family.color }}>{letter}</span>)}</div> : <p className="mt-3 text-sm leading-7 text-ink-secondary">คำในแม่ ก กาออกเสียงจบที่สระ จึงไม่มีพยัญชนะทำหน้าที่เป็นตัวสะกด</p>}<p className="mt-4 text-sm leading-7 text-ink-secondary">ตัวอย่างคำ: {samples.map((word) => word.word).join(" · ")} ให้เด็กออกเสียงคำจริงก่อน แล้วค่อยใช้รูปตัวอักษรช่วยสรุป</p></section>
    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">คำที่เด็กมักจัดแม่ผิด</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{family.seo.commonErrors.map((item) => <article key={item.word} className="rounded-xl border border-border p-4"><h3 className="m-0 text-base" style={{ color: family.color }}>{item.word}</h3><p className="mb-1 mt-2 text-xs text-ink-faint">จุดที่มักพลาด: {item.mistake}</p><p className="m-0 text-sm leading-6 text-ink-secondary">{item.explanation}</p></article>)}</div></section>
    <section className="grid gap-6 border-t border-border px-4 py-7 md:grid-cols-2 md:px-8"><div><h2 className="text-xl">กิจกรรมก่อนเล่น 5 นาที</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.classroomActivity}</p></div><div><h2 className="text-xl">วิธีตรวจว่าเด็กเข้าใจจริง</h2><p className="text-sm leading-7 text-ink-secondary">{family.seo.teacherCheck}</p></div></section>
    <section className="border-t border-border px-4 py-7 md:px-8"><h2 className="text-xl">คำถามเกี่ยวกับ{family.name}</h2><div className="mt-3">{family.seo.faqs.map((faq) => <details key={faq.question} className="border-b border-border py-3"><summary className="cursor-pointer text-sm font-semibold">{faq.question}</summary><p className="text-sm leading-7 text-ink-secondary">{faq.answer}</p></details>)}</div></section>
  </main>;
}
