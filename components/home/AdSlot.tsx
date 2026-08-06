import Image from "next/image";
import Link from "next/link";

/** House ad shown until this placement is connected to Google AdSense. */
export default function AdSlot() {
  return (
    <aside aria-label="แนะนำจาก KhunCool" className="mx-4 mt-5 md:mx-6 md:mt-7 lg:mx-8 lg:mt-9">
      <Link
        href="/media"
        className="group relative flex min-h-[164px] overflow-hidden rounded-card border border-sky-200 bg-[#eaf8ff] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:min-h-[190px] lg:min-h-[220px]"
      >
        <Image
          src="/assets/house-ads/classroom-games-banner.png"
          alt="เกมและเครื่องมือห้องเรียนจาก KhunCool"
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 90vw, 1100px"
          className="object-cover object-[67%_center] transition duration-500 group-hover:scale-[1.02] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/5 md:via-white/70 md:to-transparent" />

        <div className="relative z-10 flex max-w-[72%] flex-col items-start justify-center p-5 md:max-w-[54%] md:p-7 lg:max-w-[48%] lg:p-9">
          <span className="mb-2 rounded-full border border-sky-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-sky-700 shadow-sm md:text-[11px]">
            แนะนำจาก KhunCool
          </span>
          <h2 className="text-lg font-extrabold leading-tight text-ink md:text-2xl lg:text-[28px]">
            เปลี่ยนห้องเรียนให้สนุกขึ้น
          </h2>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted md:text-sm lg:text-[15px]">
            รวมเกมการศึกษา เล่นฟรี พร้อมใช้ในชั้นเรียน
          </p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition group-hover:gap-2 md:text-sm">
            เลือกเกมที่ชอบ <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </aside>
  );
}
