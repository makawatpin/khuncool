import Image from "next/image";
import Link from "next/link";
import { ALL_ARTICLES, CAT_MAP } from "@/app/articles/data";

const ARTICLES = ALL_ARTICLES.slice(0, 3).map((a) => ({
  ...a,
  catColor: CAT_MAP[a.cat].color,
}));

/** The three newest articles; the full list lives on /articles. */
export default function ArticlesSection() {
  return (
    <section
      id="articles"
      className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11"
    >
      <div className="mb-3 flex items-baseline justify-between md:mb-4 lg:mb-[18px]">
        <h2 className="m-0 whitespace-nowrap text-[19px] font-bold md:text-[21px] lg:text-2xl">
          ไอเดียสำหรับครู
        </h2>
        <Link
          href="/articles"
          className="text-[12.5px] font-semibold text-primary md:text-[13.5px] lg:text-sm"
        >
          บทความทั้งหมด ›
        </Link>
      </div>

      <div className="flex flex-col gap-3.5 md:grid md:grid-cols-3 md:gap-4 lg:gap-[22px]">
        {ARTICLES.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-start gap-2.5 text-inherit no-underline md:block"
          >
            <div className="relative aspect-video w-[132px] flex-none overflow-hidden rounded-card-sm md:mb-2.5 md:w-full lg:rounded-card">
              <Image
                src={a.img}
                alt=""
                fill
                sizes="(max-width: 767px) 140px, (max-width: 1023px) 33vw, 360px"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
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
                {a.date} · อ่าน {a.readTime}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
