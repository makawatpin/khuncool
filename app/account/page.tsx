import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm } from "@/components/AccountSheet";

export const metadata: Metadata = {
  title: "บัญชีของฉัน | khuncool",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://www.khuncool.com/account",
  },
};

const GUEST_PERKS = [
  { mark: "✓", color: "text-success", text: "ใช้ได้ครบทุกเครื่องมือ ไม่จำกัด" },
  { mark: "✓", color: "text-success", text: "ไม่ต้องกรอกอะไรเลย เปิดใช้ทันที" },
  { mark: "✗", color: "text-danger", text: "เปลี่ยนเครื่องแล้วข้อมูลไม่ตามไป" },
  { mark: "✗", color: "text-danger", text: "ล้างเบราว์เซอร์ = ข้อมูลหาย" },
];

const MEMBER_PERKS = [
  "ใช้ได้ครบเหมือนกัน ไม่มีอะไรถูกล็อก",
  "ข้อมูลตามตัวไปทุกเครื่อง ทุกเบราว์เซอร์",
  "ล้างเครื่อง/เปลี่ยนมือถือก็กู้คืนได้",
  "ใช้ได้ทั้งอีเมล+รหัสผ่าน หรือ Google",
];

const SYNC_ITEMS = [
  { icon: "🏫", title: "ห้องเรียน + รายชื่อ", sub: "ทะเบียนนักเรียนกลาง", bg: "bg-[#E1E3FD]" },
  { icon: "✅", title: "การเช็กชื่อ", sub: "สถานะรายวัน", bg: "bg-[#D0FBEF]" },
  { icon: "💰", title: "เงินออม/คะแนน", sub: "ยอดและรายการ", bg: "bg-[#FFEAD5]" },
  { icon: "🔀", title: "การแบ่งกลุ่ม", sub: "ค่าที่ตั้งไว้", bg: "bg-[#E1E3FD]" },
  { icon: "🎯", title: "คลังคำถาม", sub: "คำถามที่สร้างเอง", bg: "bg-[#FFEAD5]" },
  { icon: "⏱️", title: "ตั้งค่าเครื่องมือ", sub: "จับเวลา วงล้อ แข่งเป็ด", bg: "bg-[#D0FBEF]" },
];

export default function AccountPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto px-6 py-9 pb-16">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-bg px-3.5 py-1.5 text-[12.5px] font-semibold text-success whitespace-nowrap">
            ✓ ฟรีถาวร ไม่มีแพ็กเกจเสียเงิน
          </span>
          <h1 className="mt-[18px] mb-3 text-[40px] font-bold leading-[1.16] tracking-tight text-ink text-pretty">
            ใช้ได้เลยไม่ต้องล็อกอิน
            <br />
            <span className="bg-gradient-to-br from-primary to-teal-600 bg-clip-text text-transparent">
              สมัครเมื่ออยากใช้ข้ามเครื่อง
            </span>
          </h1>
          <p className="mb-[26px] max-w-[520px] text-[16.5px] leading-[1.65] text-ink-secondary text-pretty">
            ทุกเครื่องมือของ khuncool เปิดใช้ได้ทันที ข้อมูลเก็บไว้ในเครื่องนี้ —
            ถ้าสมัครบัญชี (ฟรี) ห้องเรียน รายชื่อนักเรียน การเช็กชื่อ และเงินออม
            จะถูกเก็บในบัญชีคุณ เปิดจากเครื่องไหนก็เจอข้อมูลเดิม
          </p>

          <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-surface-card p-[18px]">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-[17px]">◔</span>
                <span className="text-[14.5px] font-bold text-ink">ไม่ล็อกอิน</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {GUEST_PERKS.map((g) => (
                  <div
                    key={g.text}
                    className="flex gap-2 text-[13px] leading-[1.5] text-ink-secondary"
                  >
                    <span className={`flex-none ${g.color}`}>{g.mark}</span>
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-card border border-[#C6C9FB] bg-gradient-to-br from-[#EFF0FE] to-white p-[18px]">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-[17px]">☁️</span>
                <span className="text-[14.5px] font-bold text-ink">สมัครฟรี</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {MEMBER_PERKS.map((m) => (
                  <div
                    key={m}
                    className="flex gap-2 text-[13px] leading-[1.5] text-ink-secondary"
                  >
                    <span className="flex-none text-success">✓</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface-card p-5">
            <div className="mb-3 text-[14.5px] font-bold text-ink">
              ข้อมูลที่จะซิงก์ให้คุณ
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SYNC_ITEMS.map((s) => (
                <div
                  key={s.title}
                  className="flex items-center gap-2.5 rounded-card-sm border border-border px-3 py-2.5"
                >
                  <div
                    className={`flex h-8 w-8 flex-none items-center justify-center rounded-[9px] text-base ${s.bg}`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{s.title}</div>
                    <div className="text-[11px] text-ink-faint">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky top-[92px] rounded-card-lg border border-border bg-surface-card p-7 shadow-cta">
          <AccountForm
            onSkip={undefined}
          />
          <div className="mt-5 border-t border-border pt-4 text-[11.5px] leading-[1.6] text-ink-faint">
            การสมัครถือว่ายอมรับ <a href="#" className="text-primary hover:text-primary-hover">เงื่อนไขการใช้งาน</a>{" "}
            และ{" "}
            <a href="#" className="text-primary hover:text-primary-hover">
              นโยบายความเป็นส่วนตัว (PDPA)
            </a>{" "}
            · ข้อมูลของคุณเห็นได้เฉพาะบัญชีคุณเท่านั้น
          </div>
          <div className="mt-3 text-center">
            <Link href="/" className="text-[13px] font-semibold text-ink-secondary hover:text-ink">
              ยังไม่สมัคร — ใช้แบบเก็บในเครื่องต่อ →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
