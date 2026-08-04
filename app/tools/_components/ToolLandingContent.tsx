import Link from "next/link";

export type ToolStep = { name: string; text: string };
export type ToolUseCase = { icon: string; title: string; text: string };
export type ToolFaq = { q: string; a: string };
export type ToolRelatedLink = { label: string; href: string };

export default function ToolLandingContent({
  steps,
  useCases,
  faqs,
  related,
}: {
  steps: ToolStep[];
  useCases: ToolUseCase[];
  faqs: ToolFaq[];
  related: ToolRelatedLink[];
}) {
  return (
    <>
      <section className="border-t border-border px-4 py-7 md:px-8 md:py-10" aria-labelledby="tool-howto-heading">
        <h2 id="tool-howto-heading" className="m-0 text-xl md:text-2xl">วิธีใช้งาน</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <article key={step.name} className="flex gap-3 rounded-2xl border border-border bg-surface-card p-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-[#ECEDFE] text-sm font-bold text-primary">{index + 1}</span>
              <div>
                <h3 className="m-0 text-[15px]">{step.name}</h3>
                <p className="mb-0 mt-1.5 text-[13.5px] leading-[1.75] text-ink-secondary">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface-light px-4 py-7 md:px-8 md:py-10" aria-labelledby="tool-usecases-heading">
        <h2 id="tool-usecases-heading" className="m-0 text-xl md:text-2xl">เหมาะกับงานแบบไหน</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {useCases.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border bg-white p-4">
              <h3 className="m-0 flex items-center gap-2 text-[15px]"><span aria-hidden="true">{item.icon}</span>{item.title}</h3>
              <p className="mb-0 mt-2 text-[13.5px] leading-[1.75] text-ink-secondary">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-4 py-7 md:px-8 md:py-10" aria-labelledby="tool-faq-heading">
        <h2 id="tool-faq-heading" className="m-0 text-xl md:text-2xl">คำถามที่พบบ่อย</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-2xl border border-border p-4">
              <h3 className="m-0 text-[15px] leading-[1.55]">{faq.q}</h3>
              <p className="mb-0 mt-2 text-[13.5px] leading-[1.75] text-ink-secondary">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-4 py-7 md:px-8 md:py-9" aria-labelledby="tool-related-heading">
        <h2 id="tool-related-heading" className="m-0 text-lg md:text-xl">บทความและเครื่องมือที่เกี่ยวข้อง</h2>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {related.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full border border-border px-3.5 py-2 text-[13px] font-semibold text-ink no-underline hover:border-primary/40">
              {item.label} ›
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
