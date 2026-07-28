import type { Metadata } from "next";
import Link from "next/link";
import DuckRaceApp from "./DuckRaceApp";

export const metadata: Metadata = {
  title: "เกมแข่งเป็ดสุ่มชื่อ ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "เกมแข่งเป็ดสุ่มชื่อนักเรียน สนุกกว่าวงล้อสุ่มแบบเดิม ใส่รายชื่อแล้วแข่งได้ทันทีบนเว็บ ใช้ฟรี ไม่ต้องติดตั้ง",
  alternates: {
    canonical: "https://www.khuncool.com/duck-race",
  },
};

export default function DuckRacePage() {
  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">
          หน้าแรก
        </Link>
        <span>›</span>
        <Link href="/tools" className="text-ink-faint">
          เครื่องมือครู
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">
          แข่งเป็ดสเก็ต
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          เกมแข่งเป็ดสเก็ตสุ่มชื่อนักเรียน 🦆
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          เกมแข่งเป็ดสุ่มชื่อนักเรียน สนุกกว่าวงล้อสุ่มแบบเดิม
          ใส่รายชื่อแล้วแข่งได้ทันทีบนเว็บ ใช้ฟรี ไม่ต้องติดตั้ง
        </p>
      </div>

      {/* Duck race app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <DuckRaceApp />
      </div>
    </main>
  );
}
