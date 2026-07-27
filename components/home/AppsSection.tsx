import Link from "next/link";
import { APPS } from "./data";

export default function AppsSection() {
  return (
    <section className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11">
      <div className="mb-3 flex items-baseline justify-between md:mb-4 lg:mb-[18px]">
        <h2 className="m-0 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
          แอปช่วยงานครู<span className="hidden lg:inline"> · ใช้ผ่านเว็บได้เลย</span>
        </h2>
        <Link
          href="/apps"
          className="text-[12.5px] text-primary md:text-[13.5px] lg:text-sm"
        >
          ทั้งหมด ›
        </Link>
      </div>
      <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5 lg:grid-cols-3 lg:gap-[18px]">
        {APPS.map((ap) => (
          <Link
            key={ap.href}
            href={ap.href}
            className="flex items-center gap-3 rounded-card-sm border border-border bg-surface-card p-3 text-inherit no-underline hover:border-primary/40 hover:shadow-[0_8px_20px_-10px_rgba(26,29,38,.14)] md:gap-3.5 md:rounded-card md:p-[15px] lg:gap-[14px] lg:p-[18px]"
          >
            <div
              className={`flex h-11 w-11 flex-none items-center justify-center rounded-card-sm text-xl ${ap.bg} md:h-12 md:w-12 md:rounded-card lg:h-[52px] lg:w-[52px] lg:text-2xl`}
            >
              {ap.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold md:text-[15px] lg:text-[15.5px]">
                {ap.title}
              </div>
              <div className="text-[11.5px] text-ink-faint md:text-xs lg:text-[12.5px]">
                {ap.sub}
              </div>
            </div>
            <span className="flex-none whitespace-nowrap rounded-pill bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success lg:px-[11px] lg:text-xs">
              เปิดใช้
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
