import type { Metadata } from "next";
import MysteryBoardApp from "./MysteryBoardApp";

export const metadata: Metadata = {
  title: "กระดานป้ายปริศนา สุ่มเปิดป้ายตอบคำถาม ใช้ฟรี | khuncool",
  description:
    "กระดานป้ายปริศนาสำหรับห้องเรียน ให้นักเรียนเลือกป้ายแล้วเปิดเผยคะแนนหรือคำถาม ใช้ฟรีบนเว็บ ไม่ต้องติดตั้ง",
};

export default function MysteryBoardPage() {
  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white">
      <div className="px-4 pb-8 pt-4 md:px-8">
        <h1 className="m-0 mb-2 text-[22px] md:text-[28px]">
          กระดานป้ายปริศนา
        </h1>
        <MysteryBoardApp />
      </div>
    </main>
  );
}
