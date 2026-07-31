import type { Metadata } from "next";
import Link from "next/link";
import TimerApp from "./TimerApp";

export const metadata: Metadata = {
  title: "ตั้งเวลาถอยหลัง ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "นาฬิกาจับเวลาถอยหลังสำหรับห้องเรียน ใช้ฟรี ตั้งเวลาทำกิจกรรม สอบ หรือพักเบรกได้ทันทีบนเว็บ ไม่ต้องสมัครสมาชิก",
  alternates: {
    canonical: "https://www.khuncool.com/timer",
  },
};

export default function TimerPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto">
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
        <span className="font-semibold text-ink-secondary">จับเวลา</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          จับเวลา / นับถอยหลัง
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ตั้งเวลาถอยหลังสำหรับทำกิจกรรม สอบ หรือพักเบรกในห้องเรียนได้ทันที
          </span>
          <span className="hidden md:inline">
            ตั้งเวลาถอยหลังสำหรับทำกิจกรรม สอบ หรือพักเบรกในห้องเรียนได้ทันที
            เลือกเวลาที่ตั้งไว้ล่วงหน้าหรือกำหนดเองได้ ใช้ฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
      </div>

      {/* Timer app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <TimerApp />
      </div>
    </main>
  );
}
