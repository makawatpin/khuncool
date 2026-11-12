import Image from "next/image";
import Link from "next/link";
import { GAMES } from "./data";

/** Learning games: a swipeable row on phones, a grid from tablet up. */
export default function GamesSection() {
  return (
    <section className="pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11">
      <div className="mb-3 flex items-baseline justify-between px-4 md:mb-4 md:px-0 lg:mb-[18px]">
        <h2 className="m-0 text-[19px] font-bold md:text-[21px] lg:text-2xl">
          เกมการเรียนรู้ เปิดเล่นได้เลย
        </h2>
        <Link
          href="/media"
          className="flex-none text-[12.5px] font-semibold text-primary md:text-[13.5px] lg:text-sm"
        >
          ทั้งหมด ›
        </Link>
      </div>
      <div className="flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-3.5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-6 lg:gap-3.5 [&::-webkit-scrollbar]:hidden">
        {GAMES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="group block w-[150px] flex-none snap-start overflow-hidden rounded-card-sm border border-border bg-surface-card text-inherit no-underline transition hover:-translate-y-0.5 hover:border-primary/40 md:w-auto md:rounded-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-panel">
              <Image
                src={g.cover}
                alt=""
                fill
                sizes="(max-width: 767px) 150px, (max-width: 1023px) 33vw, 180px"
                className="object-cover transition duration-500 group-hover:scale-[1.05]"
              />
            </div>
            <div className="px-2.5 pb-2.5 pt-2">
              <div className="truncate text-[13px] font-semibold md:text-sm">
                {g.title}
              </div>
              <div className="text-[11px] text-ink-muted md:text-xs">{g.meta}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
