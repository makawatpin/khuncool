import type { Metadata } from "next";
import QuestionSetsApp from "./QuestionSetsApp";

export const metadata: Metadata = {
  title: "ชุดคำถามของฉัน เก็บคำถามไว้ใช้ซ้ำ | khuncool",
  description:
    "เก็บคำถามไว้เป็นชุด แล้วเรียกใช้กับสุ่มคำถามหน้าชั้นและกระดานป้ายปริศนา ล็อกอินแล้วซิงก์ใช้ได้ทุกเครื่อง",
  alternates: { canonical: "https://www.khuncool.com/question-sets" },
  robots: { index: false, follow: false },
};

export default function QuestionSetsPage() {
  return (
    <main className="flex-1 bg-page py-7 md:py-10">
      <QuestionSetsApp />
    </main>
  );
}
