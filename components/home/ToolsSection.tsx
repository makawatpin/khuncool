import Link from "next/link";
import { TOOLS } from "./data";

/** Featured wheel CTA card + online-tools grid. */
export default function ToolsSection() {
  return (
    <section
      id="tools"
      className="px-4 pb-1 pt-6 md:px-6 md:pt-7 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-stretch lg:gap-5 lg:px-8 lg:pt-11"
    >
      <div
        className="relative mx-0.5 overflow-hidden rounded-card-lg p-[22px] text-white md:mx-0 md:p-[30px] lg:flex lg:flex-col lg:justify-center lg:p-9"
        style={{
          background: "linear-gradient(150deg,#2A2775,#0A9380)",
        }}
      >
        <div className="pointer-events-none absolute -right-[30px] -top-[30px] h-[130px] w-[130px] rounded-full bg-white/[.08] md:-right-10 md:-top-10 md:h-[180px] md:w-[180px] lg:-right-[50px] lg:-top-[50px] lg:h-[220px] lg:w-[220px]" />
        <div className="relative md:max-w-[440px]">
          <span className="whitespace-nowrap rounded-pill bg-white/[.18] px-2.5 py-1 text-[10.5px] font-semibold md:px-3 md:py-1.5 md:text-[11.5px] lg:px-3 lg:py-1.5 lg:text-xs">
            ⭐ เครื่องมือแนะนำ
          </span>
          <h2 className="my-3 text-[21px] font-bold text-white md:my-3.5 md:text-[26px] lg:my-3.5 lg:text-[30px]">
            วงล้อสุ่มชื่อนักเรียน
          </h2>
          <p className="mb-4 text-[13px] leading-relaxed text-[#C6C9FB] md:mb-5 md:text-sm lg:mb-[22px] lg:max-w-[420px] lg:text-[15px]">
            สุ่มเลือกคน แบ่งกลุ่ม สุ่มคำถาม — ใส่รายชื่อแล้วหมุนได้เลยบนเว็บ
            ไม่ต้องติดตั้ง
          </p>
          <Link
            href="/tools/wheel"
            className="block whitespace-nowrap rounded-btn bg-white px-6 py-3 text-center text-sm font-semibold text-[#2A2775] hover:bg-[#EFF0FE] md:inline-block md:px-6 md:py-3 md:text-[14.5px] lg:px-[26px] lg:py-[13px] lg:text-[15px]"
          >
            เปิดวงล้อสุ่ม →
          </Link>
        </div>
      </div>

      <div className="mt-5 md:mt-7 lg:mt-0">
        <div className="mb-3 flex items-baseline justify-between md:mb-3.5 lg:mb-[14px]">
          <h2 className="m-0 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
            สื่อการสอนออนไลน์
          </h2>
          <Link
            href="/tools"
            className="text-[12.5px] text-primary md:text-[13.5px] lg:text-sm"
          >
            ทั้งหมด ›
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3.5 lg:grid-cols-2 lg:gap-3.5">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block rounded-card-sm border border-border bg-surface-card p-3.5 text-inherit no-underline hover:border-primary/40 hover:shadow-[0_8px_20px_-10px_rgba(26,29,38,.16)] md:rounded-card md:p-[15px] lg:p-4"
            >
              <div
                className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-card-sm text-xl ${t.bg} md:h-[42px] md:w-[42px] lg:h-11 lg:w-11`}
              >
                {t.icon}
              </div>
              <div className="mb-0.5 text-[13.5px] font-semibold leading-snug md:text-sm lg:text-[15px]">
                {t.title}
              </div>
              <div className="text-[11px] text-ink-faint md:text-[11.5px] lg:text-xs">
                {t.tag}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
