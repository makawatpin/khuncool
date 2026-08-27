import Image from "next/image";
import Link from "next/link";

/** One photo from the classroom, paired with the part of the lesson it shows. */
export type ClassroomScene = {
  image: string;
  imageAlt: string;
  caption: string;
  heading: string;
  body: string[];
  /** Short takeaway rendered as a highlighted note under the scene. */
  note?: string;
};

export type ClassroomStoryItem = {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
};

export type ClassroomStoryArticleConfig = {
  slug: string;
  title: string;
  heading: string;
  description: string;
  cover: string;
  coverAlt: string;
  date: string;
  dateISO: string;
  readTime: string;
  lead: string;
  introHeading: string;
  intro: string[];
  scenesHeading: string;
  scenes: ClassroomScene[];
  whyHeading: string;
  whyIntro: string;
  why: ClassroomStoryItem[];
  guideHeading: string;
  guideIntro: string;
  guide: ClassroomStoryItem[];
  creditTitle: string;
  credit: string;
  conclusion: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  faqs: { q: string; a: string }[];
  tags: string[];
};

export function ClassroomStoryArticle({ config }: { config: ClassroomStoryArticleConfig }) {
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
        image: [`https://www.khuncool.com${config.cover}`, ...config.scenes.map((scene) => `https://www.khuncool.com${scene.image}`)],
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
        <h1 className="m-0 text-[28px] leading-[1.3] md:text-[40px]">{config.heading}</h1>
        <p className="mt-4 text-[16px] leading-[1.8] text-ink-secondary md:text-[17px]">{config.lead}</p>

        <h2 className="mt-9 text-xl md:text-2xl">{config.introHeading}</h2>
        {config.intro.map((paragraph) => <p key={paragraph} className="text-[15px] leading-[1.85] text-[#2E3440]">{paragraph}</p>)}

        <h2 className="mt-10 text-xl md:text-2xl">{config.scenesHeading}</h2>
        <div className="mt-4 grid gap-8">
          {config.scenes.map((scene, index) => (
            <section key={scene.heading}>
              <figure className="m-0">
                <Image src={scene.image} alt={scene.imageAlt} width={1400} height={1050} className="block w-full rounded-2xl bg-[#F1F3F6] object-cover" />
                <figcaption className="mt-2 text-xs leading-[1.7] text-ink-faint">{scene.caption}</figcaption>
              </figure>
              <h3 className="mb-0 mt-4 text-[17px] leading-[1.5] md:text-lg"><span className="mr-2 text-primary">{index + 1}.</span>{scene.heading}</h3>
              {scene.body.map((paragraph) => <p key={paragraph} className="text-[15px] leading-[1.85] text-[#2E3440]">{paragraph}</p>)}
              {scene.note && <p className="mb-0 mt-3 rounded-2xl bg-[#F2FBF8] px-4 py-3 text-sm leading-[1.75] text-[#2E3440]">{scene.note}</p>}
            </section>
          ))}
        </div>

        <h2 className="mt-10 text-xl md:text-2xl">{config.whyHeading}</h2>
        <p className="text-[15px] leading-[1.85] text-[#2E3440]">{config.whyIntro}</p>
        <div className="mt-4 grid gap-3">
          {config.why.map((item) => (
            <section key={item.title} className="rounded-2xl border border-border bg-surface-light p-4 md:p-5">
              <h3 className="m-0 text-[17px] leading-[1.5] md:text-lg">{item.title}</h3>
              <p className="mb-0 mt-2 text-[14px] leading-[1.8] text-ink-secondary md:text-[15px]">{item.body}</p>
              {item.href && <Link href={item.href} className="mt-3 inline-block text-sm font-bold text-primary">{item.linkLabel ?? "เปิดดูเครื่องมือ"} ›</Link>}
            </section>
          ))}
        </div>

        <h2 className="mt-10 text-xl md:text-2xl">{config.guideHeading}</h2>
        <p className="text-[15px] leading-[1.85] text-[#2E3440]">{config.guideIntro}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {config.guide.map((item) => (
            <section key={item.title} className="rounded-2xl border border-[#CDEEE3] p-4">
              <h3 className="m-0 text-base">{item.title}</h3>
              <p className="mb-0 mt-2 text-sm leading-[1.75] text-ink-secondary">{item.body}</p>
              {item.href && <Link href={item.href} className="mt-3 inline-block text-sm font-bold text-[#0A7A66]">{item.linkLabel ?? "เปิดดูสื่อการสอน"} ›</Link>}
            </section>
          ))}
        </div>

        <aside className="mt-10 rounded-2xl border border-[#F0D9A8] bg-[#FFF8EE] p-5 md:p-6">
          <h2 className="m-0 text-lg">{config.creditTitle}</h2>
          <p className="mb-0 mt-2 text-[15px] leading-[1.85] text-[#2E3440]">{config.credit}</p>
        </aside>

        <div className="mt-6 rounded-2xl bg-[#F2FBF8] p-5 md:p-6">
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
