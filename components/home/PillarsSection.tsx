import Link from "next/link";
import { PILLARS } from "./data";

export default function PillarsSection() {
  return (
    <section className="px-4 pb-1 pt-2 md:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-4 lg:gap-3.5">
        {PILLARS.map((p) => (
          <Link
            key={p.path}
            href={p.href}
            className="flex items-center gap-2.5 rounded-card-sm border border-border bg-surface-card p-2.5 no-underline hover:border-primary/40 md:gap-3 md:rounded-card md:p-3.5 lg:gap-[13px] lg:rounded-card lg:p-4"
          >
            <div
              className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-card-sm text-[17px] ${p.bg} md:h-10 md:w-10 md:text-xl lg:h-[42px] lg:w-[42px] lg:text-xl`}
            >
              {p.icon}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold leading-tight text-ink md:text-[15px] lg:text-[15.5px]">
                {p.title}
              </div>
              <div className="mt-0.5 hidden font-mono text-[11px] text-ink-faint md:block">
                {p.path}
              </div>
            </div>
            <span className="hidden text-[17px] text-border-strong md:inline">
              ›
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
