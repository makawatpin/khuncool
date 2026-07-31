import Image from "next/image";
import Link from "next/link";
import { ALL_ARTICLES, CAT_MAP } from "@/app/articles/data";

const ARTICLES = ALL_ARTICLES.slice(0, 6).map((a, i) => ({
  ...a,
  rank: String(i + 1),
  catColor: CAT_MAP[a.cat].color,
  cover: a.img,
  read: `อ่าน ${a.readTime}`,
}));

export default function ArticlesSection() {
  return (
    <section
      id="articles"
      className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-8 lg:pt-11"
    >
      <div>
        <div className="mb-3 flex items-baseline justify-between md:mb-4 lg:mb-[18px]">
          <h2 className="m-0 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
            ข่าวสารครู
          </h2>
          <Link
            href="/articles"
            className="text-[12.5px] text-primary md:text-[13.5px] lg:text-sm"
          >
            ดูทั้งหมด ›
          </Link>
        </div>

        <div className="flex flex-col gap-3.5 md:grid md:grid-cols-2 md:gap-4 lg:gap-[18px]">
          {ARTICLES.map((a) => (
            <div key={a.href}>
              <Link href={a.href} className="block text-inherit no-underline">
                <div className="flex items-start gap-2.5 md:block">
                  <div className="relative aspect-video w-[132px] flex-none overflow-hidden rounded-card-sm md:mb-2.5 md:w-full lg:mb-[11px] lg:rounded-card">
                    <Image src={a.cover} alt={a.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="text-[10.5px] font-semibold md:text-[11px]"
                      style={{ color: a.catColor }}
                    >
                      {a.cat}
                    </span>
                    <div className="my-0.5 line-clamp-3 text-[13px] font-semibold leading-snug md:line-clamp-2 md:text-[15px] lg:text-base">
                      {a.title}
                    </div>
                    <div className="text-[10.5px] text-ink-faint md:text-[11.5px] lg:text-xs">
                      {a.date} · {a.read}
                    </div>
                  </div>
                </div>
              </Link>
              {a.linksTool && (
                <Link
                  href={a.linksTool.href}
                  className="mt-1 hidden text-[11.5px] text-primary no-underline md:block lg:mt-1.5"
                >
                  → เกี่ยวข้อง:{" "}
                  <span className="font-semibold">
                    {a.linksTool.label} {a.linksTool.href}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* sidebar: ad + popular (desktop/tablet only) */}
      <div className="mt-7 hidden md:mt-8 md:block lg:mt-0">
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <div className="flex h-[180px] flex-col items-center justify-center rounded-card border-[1.5px] border-dashed border-border-strong bg-surface-light lg:h-[280px]">
            <span className="font-mono text-[11px] tracking-wider text-ink-faint">
              <span className="lg:hidden">AD · 336×280</span>
              <span className="hidden lg:inline">AD · 300×250</span>
            </span>
            <span className="mt-1 text-[11.5px] text-ink-faint">
              <span className="lg:hidden">AdSense — in-content</span>
              <span className="hidden lg:inline">AdSense — sticky sidebar</span>
            </span>
          </div>
          <div className="rounded-card border border-border bg-surface-card p-4 pb-1.5 lg:p-[18px] lg:pb-2">
            <h3 className="m-0 mb-2.5 flex items-center gap-1.5 text-sm font-bold">
              🔥 อ่านมากสัปดาห์นี้
            </h3>
            {ARTICLES.map((a) => (
              <div
                key={a.rank}
                className="flex gap-2.5 border-t border-surface-panel py-2 hover:opacity-70 lg:gap-[11px] lg:py-2.5"
              >
                <span className="w-[18px] flex-none font-mono text-[15px] font-extrabold text-border-strong lg:w-5 lg:text-[17px]">
                  {a.rank}
                </span>
                <div>
                  <div
                    className="mb-0.5 hidden text-[11px] font-semibold lg:block"
                    style={{ color: a.catColor }}
                  >
                    {a.cat}
                  </div>
                  <div className="text-xs font-semibold leading-snug">
                    {a.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
