import Image from "next/image";
import Link from "next/link";

export type ComparisonRow = {
  /** Feature being compared, e.g. "ราคา" */
  label: string;
  /** What the competitor offers. */
  rival: string;
  /** What Khuncool offers. */
  ours: string;
};

export type ComparisonScenario = {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
};

export type ComparisonArticleConfig = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  coverAlt: string;
  date: string;
  dateISO: string;
  readTime: string;
  /** Name of the tool being compared against, used in table headers. */
  rivalName: string;
  lead: string;
  /** The two-line answer shown before anything else. Kept short on purpose. */
  answerHeading: string;
  answer: string;
  tableHeading: string;
  rows: ComparisonRow[];
  /** Human-readable date the rival's terms were last checked, e.g. "30 ส.ค. 2569". */
  checkedOn: string;
  checkedNote: string;
  midCta: { label: string; href: string; note: string };
  scenarioHeading: string;
  scenarios: ComparisonScenario[];
  /** Where the rival genuinely wins. Non-optional: a comparison with no
   *  concessions reads as an advert and loses the reader. */
  fairnessHeading: string;
  fairness: string[];
  switchHeading: string;
  switchSteps: { title: string; body: string }[];
  conclusion: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  faqs: { q: string; a: string }[];
  tags: string[];
};

export function ComparisonArticle({ config }: { config: ComparisonArticleConfig }) {
  const canonical = `https://www.khuncool.com/blog/${config.slug}`;
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
        "@type": "Article",
        headline: config.title,
        description: config.description,
        image: `https://www.khuncool.com${config.cover}`,
        datePublished: config.dateISO,
        dateModified: config.dateISO,
        inLanguage: "th",
        mainEntityOfPage: canonical,
        author: { "@type": "Organization", name: "Khuncool", url: "https://www.khuncool.com/about" },
        publisher: { "@type": "Organization", name: "Khuncool", url: "https://www.khuncool.com/" },
      },
      {
        "@type": "FAQPage",
        mainEntity: config.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb" className="px-4 pt-4 text-xs text-ink-faint md:px-8">
        <Link href="/">หน้าแรก</Link> <span aria-hidden="true">›</span>{" "}
        <Link href="/articles">บทความ</Link> <span aria-hidden="true">›</span>{" "}
        <span aria-current="page">สื่อการสอน</span>
      </nav>

      <div className="px-4 pt-4 md:px-8">
        <Image src={config.cover} alt={config.coverAlt} width={1200} height={675} priority className="block aspect-video w-full rounded-2xl bg-[#F1F3F6] object-cover" />
      </div>

      <article className="mx-auto max-w-[800px] px-4 pb-12 pt-6 md:px-8 md:pt-9">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
          <span className="rounded-full bg-[#DFF5EF] px-2.5 py-1 font-bold text-[#0A7A66]">สื่อการสอน</span>
          <span>{config.date} · อ่าน {config.readTime} · โดยทีมคุณคูล</span>
        </div>
        <h1 className="m-0 text-[28px] leading-[1.3] md:text-[40px]">{config.title}</h1>

        {/* The answer sits above the fold on purpose: readers arriving from a
            "is there something free instead" search want the verdict, not a lead-in. */}
        <section className="mt-5 rounded-2xl border border-[#B9DDD2] bg-[#F2FBF8] p-4 md:p-5">
          <h2 className="m-0 text-[17px] leading-[1.5] text-[#0A7A66] md:text-lg">{config.answerHeading}</h2>
          <p className="mb-0 mt-2 text-[15px] leading-[1.85] text-[#2E3440]">{config.answer}</p>
        </section>

        <p className="mt-5 text-[16px] leading-[1.8] text-ink-secondary md:text-[17px]">{config.lead}</p>

        <h2 className="mt-9 text-xl md:text-2xl">{config.tableHeading}</h2>
        {/* One table in the DOM, two layouts. A 3-column table needs ~520px to
            stay readable in Thai, which on a phone pushes the Khuncool column
            off-screen behind a horizontal scroll — the column readers came for.
            So below md the table collapses into stacked blocks instead. */}
        <div className="mt-4 md:overflow-x-auto">
          <table className="block w-full border-collapse text-left text-[14px] md:table md:text-[15px]">
            <thead className="hidden md:table-header-group">
              <tr className="bg-surface-light">
                <th scope="col" className="rounded-tl-xl border border-border px-3 py-2.5 font-bold">หัวข้อ</th>
                <th scope="col" className="border border-border px-3 py-2.5 font-bold">{config.rivalName}</th>
                <th scope="col" className="rounded-tr-xl border border-border bg-[#F2FBF8] px-3 py-2.5 font-bold text-[#0A7A66]">Khuncool</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {config.rows.map((row) => (
                <tr key={row.label} className="mb-3 block overflow-hidden rounded-xl border border-border align-top md:mb-0 md:table-row md:rounded-none md:border-0">
                  <th scope="row" className="block bg-surface-light px-3 py-2.5 text-left font-bold md:table-cell md:border md:border-border">{row.label}</th>
                  <td className="block px-3 py-2.5 leading-[1.7] text-ink-secondary md:table-cell md:border md:border-border">
                    <span className="mr-1.5 font-bold text-ink-faint md:hidden">{config.rivalName}:</span>
                    {row.rival}
                  </td>
                  <td className="block bg-[#F8FDFB] px-3 py-2.5 leading-[1.7] text-[#2E3440] md:table-cell md:border md:border-border">
                    <span className="mr-1.5 font-bold text-[#0A7A66] md:hidden">Khuncool:</span>
                    {row.ours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-[1.7] text-ink-faint">
          ตรวจสอบข้อมูล {config.rivalName} เมื่อ {config.checkedOn} · {config.checkedNote}
        </p>

        {/* Mid-page CTA: the reader has just seen the table and is at peak intent. */}
        <div className="mt-8 rounded-2xl bg-[#F2FBF8] p-5 md:p-6">
          <p className="m-0 text-[15px] leading-[1.85] text-[#2E3440]">{config.midCta.note}</p>
          <Link href={config.midCta.href} className="mt-4 inline-block rounded-xl bg-[#0A7A66] px-4 py-2.5 text-sm font-bold text-white no-underline">{config.midCta.label}</Link>
        </div>

        <h2 className="mt-10 text-xl md:text-2xl">{config.scenarioHeading}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {config.scenarios.map((item) => (
            <section key={item.title} className="rounded-2xl border border-[#CDEEE3] p-4">
              <h3 className="m-0 text-base">{item.title}</h3>
              <p className="mb-0 mt-2 text-sm leading-[1.75] text-ink-secondary">{item.body}</p>
              {item.href && <Link href={item.href} className="mt-3 inline-block text-sm font-bold text-[#0A7A66]">{item.linkLabel ?? "เปิดใช้งาน"} ›</Link>}
            </section>
          ))}
        </div>

        <h2 className="mt-10 text-xl md:text-2xl">{config.fairnessHeading}</h2>
        {config.fairness.map((paragraph) => (
          <p key={paragraph} className="text-[15px] leading-[1.85] text-[#2E3440]">{paragraph}</p>
        ))}

        <h2 className="mt-10 text-xl md:text-2xl">{config.switchHeading}</h2>
        <ol className="mt-4 grid list-none gap-3 p-0">
          {config.switchSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-border bg-surface-light p-4 md:p-5">
              <h3 className="m-0 text-[17px] leading-[1.5] md:text-lg"><span className="mr-2 text-primary">{index + 1}.</span>{step.title}</h3>
              <p className="mb-0 mt-2 text-[14px] leading-[1.8] text-ink-secondary md:text-[15px]">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl bg-[#F2FBF8] p-5 md:p-6">
          <h2 className="m-0 text-xl">สรุป</h2>
          <p className="mb-4 mt-3 text-[15px] leading-[1.85] text-[#2E3440]">{config.conclusion}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={config.primaryCta.href} className="rounded-xl bg-[#0A7A66] px-4 py-2.5 text-sm font-bold text-white no-underline">{config.primaryCta.label}</Link>
            {config.secondaryCta && <Link href={config.secondaryCta.href} className="rounded-xl border border-[#B9DDD2] bg-white px-4 py-2.5 text-sm font-bold text-[#0A7A66] no-underline">{config.secondaryCta.label}</Link>}
          </div>
        </div>

        <h2 className="mt-10 text-xl md:text-2xl">คำถามที่พบบ่อย</h2>
        <div className="grid gap-2.5">
          {config.faqs.map((faq) => <section key={faq.q} className="rounded-2xl border border-border p-4"><h3 className="m-0 text-[15px]">{faq.q}</h3><p className="mb-0 mt-2 text-sm leading-[1.75] text-ink-secondary">{faq.a}</p></section>)}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">
          {config.tags.map((tag) => <span key={tag} className="rounded-full bg-surface-light px-2.5 py-1.5 text-xs text-ink-secondary">#{tag}</span>)}
        </div>
      </article>
    </main>
  );
}
