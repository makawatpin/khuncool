import Image from "next/image";
import Link from "next/link";
import { pickSpotlight } from "./seasonal";

/** One banner that follows the calendar; see seasonal.ts for the schedule. */
export default function SeasonalSpotlight() {
  const s = pickSpotlight(new Date());
  return (
    <section className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11">
      <Link
        href={s.href}
        className="group flex flex-col overflow-hidden rounded-card-lg text-white no-underline md:flex-row md:items-stretch"
        style={{
          background: "linear-gradient(120deg,#1B1F4A,#3B2A7A 55%,#0F7C6C)",
        }}
      >
        <div className="relative aspect-video overflow-hidden md:aspect-auto md:min-h-[230px] md:w-[46%] md:flex-none lg:min-h-[270px]">
          <Image
            src={s.image}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 520px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="px-4 pb-[18px] pt-3.5 md:self-center md:px-7 md:py-6 lg:px-9">
          <span className="inline-block rounded-pill bg-white/[.16] px-2.5 py-1 text-[11.5px] font-semibold lg:text-xs">
            {s.kicker}
          </span>
          <h2 className="mb-1 mt-2 text-[20px] font-bold leading-snug text-white md:text-[24px] lg:mt-3 lg:text-[28px]">
            {s.title}
          </h2>
          <p className="m-0 mb-3.5 text-[13.5px] leading-relaxed text-white/85 md:text-[15px] lg:mb-5 lg:text-base">
            {s.text}
          </p>
          <span className="inline-block rounded-btn bg-white px-4 py-2.5 text-sm font-semibold text-ink transition group-hover:bg-[#EFF0FE] lg:px-5 lg:text-[15px]">
            {s.cta} →
          </span>
        </div>
      </Link>
    </section>
  );
}
