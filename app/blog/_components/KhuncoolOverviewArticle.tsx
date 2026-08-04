import Image from "next/image";
import Link from "next/link";

export type ToolItem = {
  icon: string;
  name: string;
  href: string;
  description: string;
  classroomUse: string;
};

export type OverviewArticleConfig = {
  slug: string;
  title: string;
  cover: string;
  coverAlt: string;
  coverWidth?: number;
  coverHeight?: number;
  date: string;
  dateISO: string;
  readTime: string;
  lead: string;
  introHeading: string;
  intro: string[];
  benefitsHeading: string;
  benefits: { icon: string; head: string; body: string }[];
  toolsHeading: string;
  toolsIntro: string;
  tools: ToolItem[];
  practiceHeading: string;
  practices: { n: string; head: string; body: string }[];
  evidenceHeading: string;
  evidence: string[];
  sourceNote?: string;
  externalSources?: { label: string; href: string }[];
  noteTitle: string;
  note: string;
  ctaTitle: string;
  ctaBody: string;
  faqs: { q: string; a: string }[];
  summary: string;
  tags: string[];
};

const related = [
  { cat: "สื่อการสอน", title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง", date: "27 ก.ค. 2569", href: "/blog/wheel" },
  { cat: "สื่อการสอน", title: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี สำหรับครูยุคดิจิทัล", date: "2 ส.ค. 2569", href: "/blog/group-maker" },
  { cat: "สื่อการสอน", title: "เครื่องวัดเสียงในห้องเรียน ช่วยคุมความดังได้จริง", date: "31 ก.ค. 2569", href: "/blog/noise-meter" },
  { cat: "สื่อการสอน", title: "เกมแข่งเป็ดสุ่มชื่อ สื่อการสอนสนุกที่ครูควรมี", date: "31 ก.ค. 2569", href: "/blog/duck-race" },
];

export function KhuncoolOverviewArticle({ config }: { config: OverviewArticleConfig }) {
  const canonical = `https://www.khuncool.com/blog/${config.slug}`;
  const toc = [config.introHeading, config.benefitsHeading, config.toolsHeading, config.practiceHeading, config.evidenceHeading, "คำถามที่พบบ่อย"];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: "https://www.khuncool.com/" },
          { "@type": "ListItem", position: 2, name: "บทความ", item: "https://www.khuncool.com/articles" },
          { "@type": "ListItem", position: 3, name: config.title, item: canonical },
        ],
      },
      {
        "@type": "BlogPosting",
        headline: config.title,
        description: config.lead,
        inLanguage: "th",
        datePublished: config.dateISO,
        dateModified: config.dateISO,
        author: { "@type": "Organization", name: "ทีมคุณคูล", url: "https://www.khuncool.com/about" },
        publisher: { "@type": "Organization", name: "Khuncool", url: "https://www.khuncool.com" },
        image: `https://www.khuncool.com${config.cover}`,
        mainEntityOfPage: canonical,
      },
      {
        "@type": "FAQPage",
        mainEntity: config.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">หน้าแรก</Link><span>›</span>
          <Link href="/articles" className="text-ink-faint">บทความ</Link><span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">สื่อการสอน</span>
        </div>
      </nav>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image src={config.cover} alt={config.coverAlt} width={config.coverWidth ?? 1672} height={config.coverHeight ?? 941} priority className="block h-auto w-full rounded-card-lg bg-[#F1F3F6] object-cover md:rounded-[20px]" />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#DFF5EF] px-2.5 py-1 text-[12px] font-bold text-[#0A7A66] md:px-[11px] md:py-[5px]">สื่อการสอน</span>
            <span className="rounded-pill bg-[#ECEDFE] px-2.5 py-1 text-[12px] font-semibold text-[#4A46D6] md:px-[11px] md:py-[5px]">ใช้ฟรี</span>
            <span className="text-[12px] text-ink-faint">{config.date} · อ่าน {config.readTime} · โดย ทีมคุณคูล</span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">{config.title}</h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">{config.lead}</p>

          <h2 className="text-xl md:text-2xl">{config.introHeading}</h2>
          {config.intro.map((p) => <p key={p} className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">{p}</p>)}

          <h2 className="mt-8 text-xl md:text-2xl">{config.benefitsHeading}</h2>
          <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
            {config.benefits.map((b) => (
              <div key={b.head} className="rounded-2xl border border-[#E5E8EE] p-3.5 md:p-4">
                <div className="mb-1.5 flex items-center gap-2.5"><span className="text-lg md:text-[19px]">{b.icon}</span><span className="text-sm font-bold md:text-[15.5px]">{b.head}</span></div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">{b.body}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">{config.toolsHeading}</h2>
          <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">{config.toolsIntro}</p>
          <div className="flex flex-col gap-3 md:gap-3.5">
            {config.tools.map((tool, index) => (
              <div key={tool.href} className="rounded-2xl border border-[#E5E8EE] p-4 md:p-[18px_20px]">
                <div className="mb-1.5 flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[#ECEDFE] text-base">{tool.icon}</span>
                  <div>
                    <h3 className="m-0 text-[15px] font-bold md:text-[17px]">{index + 1}. <Link href={tool.href}>{tool.name}</Link></h3>
                    <p className="m-0 mt-1 text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px]">{tool.description}</p>
                  </div>
                </div>
                <div className="mt-2 rounded-xl bg-surface-light px-3 py-2 text-[12.5px] leading-[1.65] text-[#434A58] md:text-[13.5px]"><b>ไอเดียใช้จริง:</b> {tool.classroomUse}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">{config.practiceHeading}</h2>
          <div className="mt-3 flex flex-col gap-3 md:gap-3.5">
            {config.practices.map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[#ECEDFE] text-[12.5px] font-bold text-[#4A46D6] md:h-[30px] md:w-[30px] md:rounded-[10px] md:text-[15px]">{s.n}</span>
                <div><div className="mb-0.5 text-sm font-bold md:text-base">{s.head}</div><div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">{s.body}</div></div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">{config.evidenceHeading}</h2>
          {config.evidence.map((p) => <p key={p} className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">{p}</p>)}
          {config.externalSources?.length ? (
            <div className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              <p className="m-0 mb-2">{config.sourceNote ?? "แหล่งข้อมูลสำหรับศึกษาเพิ่มเติม:"}</p>
              <ul className="m-0 space-y-1.5 pl-5">
                {config.externalSources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              อ่านหลักการเพิ่มเติมจาก <a href="https://www.unesco.org/en/digital-education" target="_blank" rel="noopener noreferrer" className="text-primary underline">UNESCO ด้านการเรียนรู้ดิจิทัล</a> และ <a href="https://www.unicef.org/digitaleducation/" target="_blank" rel="noopener noreferrer" className="text-primary underline">UNICEF Digital Education</a>
            </p>
          )}

          <div className="mt-5 rounded-2xl border border-[#A9EBDA] bg-[#F6FFFC] p-4 md:mt-6 md:p-[20px_22px]">
            <div className="mb-1.5 text-xs font-bold text-[#0A7A66] md:mb-2 md:text-[13px]">💡 {config.noteTitle}</div>
            <div className="text-[13.5px] leading-[1.75] text-[#2E3440] md:text-[15px] md:leading-[1.8]">{config.note}</div>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">{config.ctaTitle}</h2>
          <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:mb-[18px] md:text-[15.5px] md:leading-[1.85]">{config.ctaBody}</p>
          <div className="flex items-center gap-4 rounded-2xl border border-[#C6C9FB] bg-[#F7F7FE] p-4 md:p-[20px_22px]">
            <div className="flex-1"><div className="mb-1 text-base font-bold md:text-[16.5px]">เครื่องมือครูออนไลน์ KhunCool</div><div className="text-[13.5px] text-ink-secondary">ใช้ฟรี · ใช้งานผ่านเว็บ · รองรับคอมพิวเตอร์ แท็บเล็ต และมือถือ</div></div>
            <Link href="/tools" className="flex-none rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] no-underline hover:bg-[#4A46D6]">ดูเครื่องมือทั้งหมด</Link>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">คำถามที่พบบ่อย</h2>
          <div className="flex flex-col">
            {config.faqs.map((f) => <div key={f.q} className="border-t border-border py-4"><div className="mb-1.5 text-sm font-bold md:text-base">{f.q}</div><div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">{f.a}</div></div>)}
          </div>

          <div className="mt-6 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">สรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">{config.summary}</p>
            {config.slug === "10-free-teaching-tools" ? (
              <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
                หากต้องการเห็นตัวอย่างนำเครื่องมือไปเรียงเป็นกิจกรรมจริง อ่านต่อที่{" "}
                <Link href="/blog/digital-teaching-media">แผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล KhunCool</Link>
              </p>
            ) : null}
            {config.slug === "digital-teaching-media" ? (
              <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
                ดูความสามารถและตัวอย่างใช้รายเครื่องมือได้ในบทความหลัก{" "}
                <Link href="/blog/10-free-teaching-tools">10 สื่อการสอนออนไลน์ใช้ฟรีจาก KhunCool</Link>
              </p>
            ) : null}
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">ดูเนื้อหาเพิ่มเติมได้ที่ <Link href="/media">หน้ารวมสื่อการสอน</Link> หรืออ่าน <Link href="/articles">บทความสำหรับครู</Link> จากทีมคุณคูล</p>
            <div className="flex flex-wrap gap-2">{config.tags.map((t) => <span key={t} className="rounded-pill bg-surface-light px-2.5 py-1.5 text-[11.5px] font-medium text-ink-secondary">#{t}</span>)}</div>
          </div>
        </article>

        <aside className="mt-8 flex flex-col gap-4 md:mt-0">
          <div className="rounded-2xl border border-[#E5E8EE] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-ink-faint">สารบัญ</div>
            <div className="flex flex-col gap-2.5">{toc.map((c) => <div key={c} className="text-[13.5px] leading-[1.5] text-ink-secondary">{c}</div>)}</div>
            <Link href="/tools" className="mt-4 block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white no-underline hover:bg-[#4A46D6]">เปิดเครื่องมือครูฟรี</Link>
          </div>
          <div className="rounded-2xl border border-[#E5E8EE] p-4">
            <div className="mb-1.5 text-sm font-bold">📌 บทความอื่น ๆ</div>
            <div className="flex flex-col">{related.map((r) => <Link key={r.title} href={r.href} className="block border-t border-border py-2.5 text-inherit no-underline hover:opacity-65"><div className="mb-0.5 text-[11px] font-semibold text-[#0A7A66]">{r.cat}</div><div className="text-[13.5px] font-semibold leading-[1.5]">{r.title}</div><div className="mt-0.5 text-[11.5px] text-ink-faint">{r.date}</div></Link>)}</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
