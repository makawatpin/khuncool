import type { Metadata } from "next";
import ClassroomsApp from "./ClassroomsApp";

export const metadata: Metadata = {
  title: "ห้องเรียนของฉัน จัดการรายชื่อนักเรียน | khuncool",
  description:
    "สร้างห้องเรียนและเก็บรายชื่อนักเรียนไว้ใช้กับวงล้อสุ่มชื่อ แบ่งกลุ่ม และเกมเป็ด โดยข้อมูลอยู่ในเบราว์เซอร์ของคุณ",
  alternates: { canonical: "https://www.khuncool.com/classrooms" },
  robots: { index: false, follow: false },
};

export default function ClassroomsPage() {
  return (
    <main className="flex-1 bg-page py-7 md:py-10">
      <ClassroomsApp />
    </main>
  );
}
