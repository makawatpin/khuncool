import type { Metadata } from "next";
import Link from "next/link";
import SupportPanel from "@/components/support/SupportPanel";
import SupportStrip from "@/components/support/SupportStrip";
import { fetchApprovedMessages } from "@/lib/support/store";

// The admin route revalidates this page on every approve, hide or delete;
// the ten-minute window is only a backstop.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "เลี้ยงกาแฟคุณคูล | khuncool",
  description:
    "เครื่องมือครูทุกตัวบน khuncool ใช้ฟรี ถ้าอยากช่วยค่าเซิร์ฟเวอร์ เลี้ยงกาแฟคุณคูลผ่านพร้อมเพย์ หรือฝากข้อความบอกว่าอยากได้เครื่องมืออะไรเพิ่ม",
  alternates: {
    canonical: "https://www.khuncool.com/support",
  },
};

export default async function SupportPage() {
  const messages = await fetchApprovedMessages(30);

  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">
            หน้าแรก
          </Link>
          <span>›</span>
          <span className="font-semibold text-ink-secondary" aria-current="page">
            เลี้ยงกาแฟคุณคูล
          </span>
        </div>
      </nav>

      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 text-[22px] leading-[1.32] md:text-[28px]">เลี้ยงกาแฟคุณคูล</h1>
      </div>

      <div className="px-4 md:px-8">
        <SupportStrip />
      </div>

      <div className="px-4 py-6 md:px-8 md:py-9">
        <div className="mx-auto max-w-[480px] rounded-card-lg border border-border bg-surface-card p-[22px]">
          <SupportPanel variant="page" />
        </div>
      </div>

      {messages.length > 0 && (
        <section
          aria-labelledby="thanks"
          className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9"
        >
          <h2 id="thanks" className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
            ขอบคุณครูทุกคนที่แวะมา
          </h2>
          <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className="min-w-0 rounded-[10px] border border-l-[3px] border-border border-l-accent bg-surface-card px-3 py-2.5"
              >
                <div className="font-anuphan text-[13px] font-semibold text-ink">
                  {m.name ?? "ไม่ประสงค์ออกนาม"}
                </div>
                <p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-ink-secondary">
                  {m.message}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
