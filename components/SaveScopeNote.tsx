"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { useAccountSheet } from "./AccountSheet";

const SIZES = {
  mobile: {
    wrap: "rounded-[10px] mb-3.5 flex items-center gap-1.5 border px-[11px] py-2.5 md:hidden",
    icon: "flex-none text-[13px]",
    text: "flex-1 text-[11px] leading-[1.45]",
  },
  sidebar: {
    wrap: "mb-3.5 flex items-center gap-2 rounded-xl border px-[13px] py-[11px]",
    icon: "flex-none text-[15px]",
    text: "flex-1 text-[11.5px] leading-[1.5]",
  },
};

/**
 * Reports where this app's data is actually stored: local-only for guests
 * (with a prompt to sign up for cross-device sync), or confirmation that
 * it's synced for signed-in users. Used by Attendance/Savings/Homeroom,
 * which each persist to localStorage and — only once signed in — also to
 * the cloud via useCloudSync.
 */
export default function SaveScopeNote({
  variant = "mobile",
}: {
  variant?: "mobile" | "sidebar";
}) {
  const { user } = useAuth();
  const { openAccountSheet } = useAccountSheet();
  const s = SIZES[variant];

  if (user) {
    return (
      <div className={`${s.wrap} border-[#A7F0DF] bg-[#EAFBF6]`}>
        <span className={s.icon}>☁️</span>
        <span className={`${s.text} text-[#0A6B5C]`}>
          ล็อกอินแล้ว ข้อมูลซิงก์ขึ้นบัญชีอัตโนมัติ — ใช้ต่อได้ทุกเครื่องที่ล็อกอิน
        </span>
      </div>
    );
  }

  return (
    <div className={`${s.wrap} border-[#FCD9B6] bg-[#FFF6ED]`}>
      <span className={s.icon}>🔒</span>
      <span className={`${s.text} text-[#8A5A1A]`}>
        บันทึกเฉพาะเครื่องนี้ —{" "}
        <button
          type="button"
          onClick={openAccountSheet}
          className="font-semibold underline"
        >
          สมัครสมาชิกฟรี
        </button>{" "}
        เพื่อใช้ข้อมูลเดียวกันได้ทุกเครื่อง
      </span>
    </div>
  );
}
