import Link from "next/link";
import GamePlaceholderGrid from "./GamePlaceholderGrid";
import { otherSubjects, type SubjectSlug } from "../catalog";

export type SubjectResource = {
  title: string;
  description: string;
  grades: string;
  type: string;
  href?: string;
  image?: string;
};

export type SubjectPageContent = {
  slug: SubjectSlug;
  name: string;
  icon: string;
  accent: string;
  soft: string;
  /** Human-readable grade range used in schema.org educationalLevel. */
  educationalLevel: string;
  /** ISO date of the last content change, used in schema.org dateModified. */
  updated: string;
  headline: string;
  intro: string;
  topics: string[];
  resources: SubjectResource[];
  outcomes: string[];
};

export default function SubjectResourcePage({ content }: { content: SubjectPageContent }) {
  const canonical = `https://www.khuncool.com/media/${content.slug}`;
  const hasPlayableGames = content.resources.some((resource) => Boolean(resource.href));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
          { "@type": "ListItem", position: 2, name: "สื่อการสอน", item: "https://www.khuncool.com/media" },
          { "@type": "ListItem", position: 3, name: content.name, item: canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        name: `สื่อการสอน${content.name} ระดับประถมศึกษา`,
        url: canonical,
        inLanguage: "th-TH",
        educationalLevel: content.educationalLevel,
        teaches: content.topics,
        description: content.intro,
        isAccessibleForFree: true,
        dateModified: content.updated,
        author: { "@type": "Organization", name: "Khuncool", url: "https://www.khuncool.com" },
        publisher: { "@type": "Organization", name: "Khuncool", url: "https://www.khuncool.com" },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: content.resources.length,
          itemListElement: content.resources.map((resource, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: resource.title || `เกม${resource.type} (เร็ว ๆ นี้)`,
            description: resource.description,
            ...(resource.image ? { image: `https://www.khuncool.com${resource.image}` } : {}),
            ...(resource.href ? { url: `https://www.khuncool.com${resource.href}` } : {}),
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `เกม${content.name}เปิดให้เล่นแล้วหรือยัง`,
            acceptedAnswer: {
              "@type": "Answer",
              text: hasPlayableGames ? `เกม${content.name}เปิดเล่นได้ฟรีผ่านเบราว์เซอร์ รองรับคอมพิวเตอร์ ทีวีหน้าชั้นเรียน และโทรศัพท์มือถือ` : `เกม${content.name}อยู่ระหว่างเตรียมเนื้อหาและจะเพิ่มลิงก์เล่นเมื่อพร้อม`,
            },
          },
          {
            "@type": "Question",
            name: `เกม${content.name}ใช้ฟรีหรือไม่`,
            acceptedAnswer: { "@type": "Answer", text: `สื่อและเกม${content.name}ของ Khuncool เปิดใช้งานฟรีผ่านเว็บเบราว์เซอร์ ไม่ต้องติดตั้ง` },
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb" className="flex items-center gap-1.5 px-4 pt-4 text-xs text-ink-faint md:px-8">
        <Link href="/">หน้าแรก</Link><span>›</span>
        <Link href="/media">สื่อการสอน</Link><span>›</span>
        <span aria-current="page" className="font-semibold text-ink-secondary">{content.name}</span>
      </nav>

      <section className="grid gap-6 px-4 pb-8 pt-5 md:grid-cols-[1.25fr_.75fr] md:px-8 md:pb-12 md:pt-8">
        <div>
          <h1 className="m-0 max-w-[20ch] text-[30px] leading-[1.28] md:text-[44px]">{content.headline}</h1>
          <p className="mb-0 mt-4 max-w-[64ch] text-sm leading-[1.8] text-ink-secondary md:text-base">{content.intro}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["ใช้ฟรี ไม่ต้องสมัคร", "เปิดบนจอหน้าชั้นได้", "ออกแบบสำหรับครูประถม"].map((chip) => <span key={chip} className="rounded-full bg-success-bg px-3 py-1.5 text-xs font-semibold text-success">{chip}</span>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {content.topics.map((topic) => <span key={topic} className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ color: content.accent, background: content.soft }}>{topic}</span>)}
          </div>
        </div>
        <aside className="rounded-[20px] border border-border bg-surface-light p-5 md:p-6" aria-label={hasPlayableGames ? "สื่อแนะนำ" : "แนวทางใช้สื่อ"}>
          {hasPlayableGames && content.resources[0]?.href ? <>
            <p className="m-0 text-xs font-bold uppercase tracking-wider" style={{ color: content.accent }}>สื่อแนะนำ</p>
            <h2 className="mb-2 mt-2 text-xl">{content.resources[0].title}</h2>
            <p className="m-0 text-sm leading-7 text-ink-secondary">{content.resources[0].description}</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3.5">
              <span className="text-2xl" aria-hidden="true">{content.icon}</span>
              <span className="min-w-0 flex-1 text-xs text-ink-secondary">{content.resources[0].grades}</span>
              <Link href={content.resources[0].href} className="flex-none text-sm font-semibold no-underline" style={{ color: content.accent }}>เปิดใช้ ›</Link>
            </div>
          </> : <>
            <p className="m-0 text-xs font-bold uppercase tracking-wider" style={{ color: content.accent }}>สำหรับครูประถม</p>
            <h2 className="mb-2 mt-2 text-xl">หยิบไปวางในแผนได้ง่าย</h2>
            <p className="m-0 text-sm leading-7 text-ink-secondary">กำลังพัฒนาสื่อให้ระบุระดับชั้น ทักษะ และเวลาใช้งานอย่างชัดเจน โดยจะเพิ่มลิงก์เปิดใช้งานเมื่อพร้อม</p>
            <Link href="#games" className="mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-white no-underline" style={{ background: content.accent }}>ดูสื่อการสอน</Link>
          </>}
        </aside>
      </section>

      <section id="games" className="border-y border-border bg-surface-light px-4 py-8 md:px-8 md:py-12" aria-labelledby="games-heading">
        <h2 id="games-heading" className="m-0 text-2xl md:text-3xl">{hasPlayableGames ? `สื่อการสอน${content.name}` : `สื่อการสอน${content.name}ที่กำลังเตรียม`}</h2>
        <p className="mb-5 mt-2 text-sm text-ink-secondary">{hasPlayableGames ? "เลือกสื่อแล้วเปิดใช้งานผ่านเบราว์เซอร์ได้ทันที ไม่ต้องติดตั้งและไม่ต้องสมัครสมาชิก" : "กำลังพัฒนาสื่อสำหรับใช้ในชั้นเรียน โดยจะเพิ่มลิงก์เปิดใช้งานเมื่อพร้อม"}</p>
        <GamePlaceholderGrid games={content.resources} accent={content.accent} soft={content.soft} />
      </section>

      <section className="px-4 py-8 md:px-8 md:py-10">
        <h2 className="m-0 text-2xl">เลือกเกมตามสิ่งที่กำลังจะสอน</h2>
        <p className="mb-5 mt-2 text-sm text-ink-secondary">เลือกจากหัวข้อของคาบ เมื่อเกมพร้อมแต่ละแถวจะพาไปยังเกมที่เหมาะที่สุด</p>
        <div className="grid gap-2 md:grid-cols-2">
            {content.topics.slice(0, 4).map((topic) => <div key={topic} className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 text-sm"><span>กำลังสอนเรื่อง {topic}</span><span className="text-xs font-semibold text-ink-faint">{hasPlayableGames ? "เล่นได้แล้ว" : "รอเพิ่มเกม"}</span></div>)}
        </div>
      </section>

      <section className="grid gap-8 px-4 py-8 md:grid-cols-2 md:px-8 md:py-12">
        <div>
          <h2 className="m-0 text-2xl">ผลลัพธ์การเรียนรู้ที่เน้น</h2>
          <ul className="mb-0 mt-4 grid list-none gap-3 p-0">
            {content.outcomes.map((outcome) => <li key={outcome} className="flex gap-3 text-sm leading-6 text-ink-secondary"><span className="font-bold" style={{ color: content.accent }}>✓</span>{outcome}</li>)}
          </ul>
        </div>
        <div className="rounded-[20px] border border-border p-5 md:p-6">
          <h2 className="m-0 text-xl">เลือกดูวิชาอื่น</h2>
          <div className="mt-4 grid gap-2">
            {otherSubjects(content.slug).map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-xl bg-surface-light px-4 py-3 text-sm font-semibold text-ink no-underline hover:text-primary"><span>สื่อการสอน{item.t}</span><span className="text-xs font-normal text-ink-faint">{item.st} ›</span></Link>
            ))}
            <Link href="/media" className="mt-1 text-sm font-semibold text-primary">ดูสื่อการสอนทุกวิชา ›</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-light px-4 py-8 md:grid md:grid-cols-[1fr_340px] md:gap-10 md:px-8 md:py-10">
        <div>
          <h2 className="m-0 text-2xl">ใช้คู่กับเครื่องมือครู</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[{ icon: "⏱", title: "จับเวลา", href: "/timer" }, { icon: "👥", title: "สุ่มแบ่งกลุ่ม", href: "/group-maker" }, { icon: "🏆", title: "กระดานคะแนน", href: "/group-scoreboard" }].map((tool) => <Link key={tool.href} href={tool.href} className="rounded-2xl border border-border bg-white p-4 text-inherit no-underline hover:border-primary"><span className="text-xl">{tool.icon}</span><h3 className="mb-0 mt-2 text-sm">{tool.title}</h3></Link>)}
          </div>
        </div>
        <div className="mt-8 md:mt-0">
          <h2 className="m-0 text-xl">คำถามที่ครูถามบ่อย</h2>
          <details className="mt-4 border-b border-border pb-3"><summary className="cursor-pointer text-sm font-semibold">เกมเปิดให้เล่นแล้วหรือยัง</summary><p className="text-xs leading-6 text-ink-secondary">{hasPlayableGames ? "เปิดเล่นได้แล้วผ่านเบราว์เซอร์ รองรับทั้งจอคอมพิวเตอร์ ทีวีหน้าชั้นเรียน และโทรศัพท์มือถือ" : "หน้านี้เป็นโครงเตรียมไว้ก่อน ขณะนี้ยังไม่มีเกมให้เปิดเล่น และจะเพิ่มชื่อกับลิงก์เมื่อเกมพร้อม"}</p></details>
          <details className="border-b border-border py-3"><summary className="cursor-pointer text-sm font-semibold">จะใช้ฟรีหรือไม่</summary><p className="text-xs leading-6 text-ink-secondary">{hasPlayableGames ? `สื่อและเกม${content.name}ของ Khuncool เปิดใช้งานฟรีผ่านเว็บเบราว์เซอร์ ไม่ต้องติดตั้ง` : "เกมของ Khuncool วางแผนให้เปิดผ่านเบราว์เซอร์และใช้ฟรีเหมือนสื่อวิชาอื่น"}</p></details>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border px-4 py-6 md:flex-row md:items-center md:px-8">
        <div className="flex-1"><h2 className="m-0 text-lg">{hasPlayableGames ? `พร้อมเล่นเกม${content.name}แล้วหรือยัง` : "มีชื่อเกมแล้ว ส่งมาเพิ่มได้เลย"}</h2><p className="mb-0 mt-1 text-sm text-ink-secondary">{hasPlayableGames ? "เปิดเกมบนจอ แบ่งนักเรียนเป็นทีม แล้วเริ่มภารกิจในชั้นเรียนได้ทันที" : "โครงข้อมูลพร้อมสำหรับชื่อเกม คำอธิบาย หมวด ระดับชั้น เวลาเล่น และลิงก์หน้าของเกม"}</p></div>
        {hasPlayableGames && content.resources[0]?.href ? <Link href={content.resources[0].href} className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white no-underline">เปิดเกมเลย</Link> : <a href={`mailto:khuncoolhub@gmail.com?subject=${encodeURIComponent(`ชื่อเกม${content.name}`)}`} className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white no-underline">ส่งชื่อเกม</a>}
      </section>
    </main>
  );
}
