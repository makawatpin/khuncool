import Link from "next/link";
import { MOMENTS } from "./data";

/** Pick by what the teacher is about to do; every link opens a tool directly. */
export default function MomentsSection() {
  return (
    <section className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11">
      <h2 className="m-0 mb-3 text-[19px] font-bold md:mb-4 md:text-[21px] lg:mb-[18px] lg:text-2xl">
        ตอนนี้ครูกำลังจะทำอะไร
      </h2>
      <div className="grid grid-cols-2 gap-2.5 md:gap-3.5 lg:grid-cols-4 lg:gap-[18px]">
        {MOMENTS.map((m) => (
          <div
            key={m.title}
            className={`rounded-card p-3.5 md:p-[18px] ${m.bg}`}
          >
            <div className="text-[26px] leading-none md:text-[30px]" aria-hidden="true">
              {m.icon}
            </div>
            <h3 className="mb-2 mt-2.5 text-[15.5px] font-bold leading-tight text-ink md:text-[17px] lg:text-lg">
              {m.title}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {m.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center justify-between gap-1 rounded-[10px] bg-white/80 px-2.5 py-2 text-[12.5px] font-semibold text-ink no-underline hover:bg-white md:text-[13.5px] lg:text-sm"
                  >
                    <span className="min-w-0 truncate">{l.label}</span>
                    <span className="flex-none text-ink-faint" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
