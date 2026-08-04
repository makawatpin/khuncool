export default function GameFaq({
  items,
  title,
  url,
  grade,
  teaches,
}: {
  items: Array<{ q: string; a: string }>;
  title: string;
  url: string;
  grade: string;
  teaches: string[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: title,
        url,
        inLanguage: ["th-TH", "en"],
        learningResourceType: "Educational game",
        educationalLevel: grade,
        teaches,
        isAccessibleForFree: true,
        dateModified: "2026-08-04",
        author: {
          "@type": "Organization",
          name: "Khuncool",
          url: "https://www.khuncool.com",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <section className="border-t border-border px-4 py-6 md:px-8 md:py-9" aria-labelledby="game-faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <h2 id="game-faq-title" className="m-0 mb-4 text-lg md:text-2xl">
        คำถามที่พบบ่อย
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.q} className="rounded-2xl border border-border bg-surface-card p-4 md:p-5">
            <h3 className="m-0 mb-2 text-[15px] leading-6 md:text-base">{item.q}</h3>
            <p className="m-0 text-[13.5px] leading-7 text-ink-secondary md:text-sm">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
