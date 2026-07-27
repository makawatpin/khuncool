import type { Metadata } from "next";
import Link from "next/link";
import NoiseMeterApp from "./NoiseMeterApp";

export const metadata: Metadata = {
  title: "เครื่องวัดความดังในห้องเรียน ออนไลน์ ใช้ฟรี | khuncool",
  description:
    "เครื่องวัดระดับเสียงในห้องเรียนแบบเรียลไทม์ ช่วยควบคุมความดังของนักเรียน ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
  alternates: {
    canonical: "https://www.khuncool.com/classroom-noise-meter",
  },
};

export default function NoiseMeterPage() {
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
          วัดเสียงในห้อง
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          เครื่องวัดเสียงในห้องเรียน
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            เสียงจะถูกวัดในเครื่องนี้เท่านั้น ไม่มีการอัดหรือส่งเสียงออกไปไหน
          </span>
          <span className="hidden md:inline">
            ระดับเสียงถูกประมวลผลในเครื่องนี้เท่านั้น ไม่มีการอัดเสียงหรือส่งข้อมูลออกไปไหน
            เหมาะกับกิจกรรมกลุ่ม เวลาทำงานเงียบ และช่วงสอบย่อย
          </span>
        </p>
      </div>

      {/* Noise meter app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <NoiseMeterApp />
      </div>
    </main>
  );
}
