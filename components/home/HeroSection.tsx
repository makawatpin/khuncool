import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="px-4 pb-5 pt-[22px] md:px-6 md:pb-7 md:pt-[34px] lg:px-8 lg:pb-9 lg:pt-12"
      style={{
        background: "radial-gradient(120% 90% at 100% 0%, #EFF0FE, #fff)",
      }}
    >
      <div className="lg:max-w-[680px] md:max-w-[560px]">
        <h1 className="m-0 mb-2.5 font-anuphan text-[25px] font-bold leading-[1.28] tracking-[-.01em] md:text-[34px] md:leading-[1.18] md:tracking-[-.02em] lg:text-[44px] lg:leading-[1.16]">
          <span className="md:hidden">
            เครื่องมือและสื่อการสอน
            <br />
            ออนไลน์ฟรี <span className="text-primary">สำหรับครูไทย</span>
          </span>
          <span className="hidden md:inline">
            เครื่องมือครูและสื่อการสอนออนไลน์ฟรี
            <br />
            <span className="bg-brand bg-clip-text text-transparent">
              สำหรับครูไทย
            </span>
          </span>
        </h1>
        <p className="m-0 mb-4 text-[14.5px] leading-relaxed text-ink-secondary md:mb-[22px] md:text-base lg:mb-[26px] lg:text-lg">
          วงล้อสุ่มชื่อ เกมเป็ดสุ่ม แบ่งกลุ่ม จับเวลา เช็กชื่อ และเกมภาษาอังกฤษ
          เปิดใช้บนเว็บได้ทันที ไม่ต้องติดตั้ง
        </p>
        <div className="flex gap-2.5 md:gap-[11px] lg:gap-3">
          <Link
            href="/tools"
            className="flex-1 whitespace-nowrap rounded-btn bg-primary px-3 py-3 text-center text-sm font-semibold text-white shadow-cta hover:bg-primary-hover md:flex-none md:px-[22px] md:py-[13px] md:text-[14.5px] lg:px-[26px] lg:py-3.5 lg:text-[15.5px]"
          >
            ลองเครื่องมือ<span className="hidden md:inline">ออนไลน์</span>
          </Link>
          <Link
            href="/articles"
            className="flex-1 whitespace-nowrap rounded-btn border border-border-strong bg-surface-card px-3 py-3 text-center text-sm font-semibold text-ink hover:bg-surface-light md:flex-none md:px-[22px] md:py-[13px] md:text-[14.5px] lg:px-[26px] lg:py-3.5 lg:text-[15.5px]"
          >
            อ่านบทความ<span className="hidden md:inline">ครู</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
