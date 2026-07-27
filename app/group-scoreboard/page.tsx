import type { Metadata } from "next";
import Link from "next/link";
import ScoreboardApp from "./ScoreboardApp";

export const metadata: Metadata = {
  title: "กระดานคะแนนกลุ่ม ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "กระดานคะแนนกลุ่มสำหรับห้องเรียน เพิ่ม-ลดคะแนนแต่ละกลุ่มแบบเรียลไทม์ ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง เหมาะกับกิจกรรมแข่งขันในชั้นเรียน",
  alternates: {
    canonical: "https://www.khuncool.com/group-scoreboard",
  },
};

export default function GroupScoreboardPage() {
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
          กระดานคะแนนกลุ่ม
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          กระดานคะแนนกลุ่ม
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            เพิ่ม-ลดคะแนนแต่ละทีมแบบเรียลไทม์ ใช้ฟรี ไม่ต้องติดตั้ง
          </span>
          <span className="hidden md:inline">
            ให้คะแนนกลุ่มระหว่างเรียน เห็นอันดับทันที ฉายขึ้นจอหน้าห้องได้
            เหมาะกับกิจกรรมแข่งขันในชั้นเรียน
          </span>
        </p>
      </div>

      {/* Scoreboard app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <ScoreboardApp />
      </div>
    </main>
  );
}
