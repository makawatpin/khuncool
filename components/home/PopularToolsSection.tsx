import Image from "next/image";
import Link from "next/link";
import { POPULAR_TOOLS } from "./data";

/** The four tools teachers open most, as cover cards that go straight in. */
export default function PopularToolsSection() {
  return (
    <section
      id="tools"
      className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11"
    >
      <div className="mb-3 flex items-baseline justify-between md:mb-4 lg:mb-[18px]">
        <h2 className="m-0 whitespace-nowrap text-[19px] font-bold md:text-[21px] lg:text-2xl">
          ครูใช้บ่อยที่สุด
        </h2>
        <Link
          href="/tools"
          className="text-[12.5px] font-semibold text-primary md:text-[13.5px] lg:text-sm"
        >
          เครื่องมือทั้งหมด ›
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5 lg:gap-[18px]">
        {POPULAR_TOOLS.map((t, i) => (
          <Link
            key={t.href}
            href={t.href}
            className="group relative block overflow-hidden rounded-card border border-border bg-surface-card text-inherit no-underline transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_26px_-14px_rgba(26,29,38,.28)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-panel">
              <Image
                src={t.cover}
                alt=""
                fill
                sizes="(max-width: 767px) 50vw, (max-width: 1023px) 25vw, 270px"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute left-2 top-2 rounded-pill bg-white/95 px-2 py-0.5 text-[10.5px] font-bold text-primary shadow-sm md:text-[11.5px]">
                อันดับ {i + 1}
              </span>
            </div>
            <div className="px-3 pb-3 pt-2.5 lg:px-3.5 lg:pb-3.5">
              <div className="text-[14px] font-semibold leading-snug md:text-[15px] lg:text-base">
                {t.title}
              </div>
              <div className="mt-0.5 text-[11.5px] text-ink-muted md:text-xs lg:text-[13px]">
                {t.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
