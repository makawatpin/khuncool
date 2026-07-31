import type { Metadata } from "next";
import Link from "next/link";
import QuestionApp from "./QuestionApp";

export const metadata: Metadata = {
  title: "สุ่มคำถามในห้องเรียน ออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "สุ่มคำถามสำหรับกิจกรรมในห้องเรียน ใส่ชุดคำถามแล้วสุ่มได้ทันทีบนเว็บ ใช้ฟรี ไม่ต้องสมัครสมาชิก",
  alternates: {
    canonical: "https://www.khuncool.com/random-question",
  },
};

export default function RandomQuestionPage() {
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
        <span className="font-semibold text-ink-secondary">สุ่มคำถาม</span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          สุ่มคำถามหน้าชั้น
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            ใส่ชุดคำถามแล้วกดสุ่ม ใช้กระตุ้นให้นักเรียนตอบคำถามในห้องเรียน
          </span>
          <span className="hidden md:inline">
            ใส่ชุดคำถามที่ต้องการแล้วกดสุ่มเพื่อเลือกคำถามให้นักเรียนตอบ
            ใช้ฟรีไม่ต้องสมัครสมาชิก
          </span>
        </p>
      </div>

      {/* Question app */}
      <div className="px-4 pb-8 md:px-8 md:pb-10">
        <QuestionApp />
      </div>
    </main>
  );
}
