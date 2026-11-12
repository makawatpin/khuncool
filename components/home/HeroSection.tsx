import Link from "next/link";
import HeroVideo from "@/components/home/HeroVideo";

const TRUST = ["ฟรีทุกเครื่องมือ", "ไม่ต้องสมัคร", "ฉายขึ้นจอหน้าห้องได้"];

export default function HeroSection() {
  return (
    <section
      className="px-4 pb-6 pt-[22px] md:px-6 md:pb-8 md:pt-[34px] lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-11 lg:pt-12"
      style={{
        background: "radial-gradient(120% 90% at 100% 0%, #E7E8FD, #fff 70%)",
      }}
    >
      <div>
        {/* One h1: the search phrase stays in it as the small first line, the
            large line is the promise. */}
        <h1 className="m-0 mb-2.5 font-anuphan font-bold md:mb-3">
          <span className="mb-1.5 block text-[13px] font-semibold leading-snug text-primary md:text-sm lg:mb-2.5 lg:text-[15px]">
            เครื่องมือครูและสื่อการสอนออนไลน์ฟรี สำหรับครูไทย
          </span>
          <span className="block text-[28px] leading-[1.22] tracking-[-.01em] md:text-[38px] md:leading-[1.16] md:tracking-[-.02em] lg:text-[46px] lg:leading-[1.14]">
            ทำให้ห้องเรียน
            <br />
            <span className="bg-brand bg-clip-text text-transparent">
              สนุกขึ้นใน 10 วินาที
            </span>
          </span>
        </h1>
        <p className="m-0 mb-4 text-[14.5px] leading-relaxed text-ink-secondary md:mb-5 md:max-w-[520px] md:text-base lg:mb-6 lg:text-lg">
          สุ่มชื่อ แบ่งกลุ่ม จับเวลา และเกมการเรียนรู้ เปิดบนเว็บแล้วใช้ได้เลย
          ไม่ต้องติดตั้ง
        </p>
        <div className="hidden gap-3 lg:flex">
          <Link
            href="/duck-race"
            className="whitespace-nowrap rounded-btn bg-primary px-[26px] py-3.5 text-center text-[15.5px] font-semibold text-white shadow-cta hover:bg-primary-hover"
          >
            🦆 เล่นเกมเป็ดเลย
          </Link>
          <Link
            href="/tools"
            className="whitespace-nowrap rounded-btn border border-border-strong bg-surface-card px-[26px] py-3.5 text-center text-[15.5px] font-semibold text-ink hover:bg-surface-light"
          >
            ดูเครื่องมือทั้งหมด
          </Link>
        </div>
        <ul className="m-0 hidden list-none flex-wrap gap-x-5 gap-y-1 p-0 text-sm text-ink-secondary lg:mt-5 lg:flex">
          {TRUST.map((t) => (
            <li key={t}>
              <span className="text-success">✓</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Link
          href="/duck-race"
          aria-label="เปิดเกมเป็ดสุ่มชื่อ"
          className="group relative block aspect-video overflow-hidden rounded-card-lg bg-[#8FD3F7] shadow-[0_18px_40px_-14px_rgba(92,94,230,.5)] ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <HeroVideo />
          <span className="absolute left-2.5 top-2.5 rounded-pill bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm md:left-3.5 md:top-3.5 md:px-3 md:text-xs">
            🔥 ครูใช้มากที่สุด · เกมเป็ดสุ่มชื่อ
          </span>
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/45 to-transparent px-3 pb-3 pt-10 md:pb-4">
            <span className="rounded-pill bg-white px-4 py-2 text-[13.5px] font-bold text-ink shadow-md transition group-hover:scale-105 md:px-5 md:py-2.5 md:text-[15px]">
              ▶ ปล่อยเป็ดแข่งเลย
            </span>
          </span>
        </Link>

        {/* Phones and tablets: buttons sit under the clip so the game is in
            the first screen. */}
        <div className="mt-3.5 flex gap-2.5 md:mt-4 md:gap-3 lg:hidden">
          <Link
            href="/duck-race"
            className="flex-1 whitespace-nowrap rounded-btn bg-primary px-3 py-3 text-center text-sm font-semibold text-white shadow-cta hover:bg-primary-hover md:py-[13px] md:text-[15px]"
          >
            🦆 เล่นเกมเป็ดเลย
          </Link>
          <Link
            href="/tools"
            className="flex-1 whitespace-nowrap rounded-btn border border-border-strong bg-surface-card px-3 py-3 text-center text-sm font-semibold text-ink hover:bg-surface-light md:py-[13px] md:text-[15px]"
          >
            เครื่องมือทั้งหมด
          </Link>
        </div>
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[12.5px] text-ink-secondary md:text-[13.5px] lg:hidden">
          {TRUST.map((t) => (
            <li key={t}>
              <span className="text-success">✓</span> {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
