import type { Metadata } from "next";
import SetsApp from "./SetsApp";

export const metadata: Metadata = {
  title: "ลิงก์ที่แชร์ | khuncool",
  description:
    "ดูลิงก์และ QR กิจกรรมที่คุณเคยแชร์ให้นักเรียน คัดลอกไปใช้ซ้ำหรือลบทิ้งได้",
  alternates: { canonical: "https://www.khuncool.com/sets" },
  robots: { index: false, follow: false },
};

export default function SetsPage() {
  return (
    <main className="flex-1 bg-page py-7 md:py-10">
      <SetsApp />
    </main>
  );
}
