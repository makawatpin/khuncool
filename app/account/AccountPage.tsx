"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AccountForm } from "@/components/AccountSheet";
import { getKhuncoolLocalStorageKeys } from "@/lib/khuncoolLocalKeys";

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

const QUICK_LINK_APPS = [
  { icon: "📋", title: "บันทึกโฮมรูม", bg: "bg-[#E1E3FD]", href: "/tools/homeroom" },
  { icon: "✅", title: "เช็กชื่อนักเรียน", bg: "bg-[#D0FBEF]", href: "/tools/attendance" },
  { icon: "💰", title: "ออมเงินนักเรียน", bg: "bg-[#FFEAD5]", href: "/tools/savings" },
  { icon: "🔀", title: "สุ่มแบ่งกลุ่ม", bg: "bg-[#E1E3FD]", href: "/group-maker" },
  { icon: "🎡", title: "วงล้อสุ่มชื่อ", bg: "bg-[#E1E3FD]", href: "/random-name-picker" },
  { icon: "🎯", title: "สุ่มคำถามหน้าชั้น", bg: "bg-[#FFEAD5]", href: "/random-question" },
  { icon: "⏱️", title: "จับเวลา / นับถอยหลัง", bg: "bg-[#D0FBEF]", href: "/timer" },
  { icon: "🦆", title: "เกมแข่งเป็ด", bg: "bg-[#D0FBEF]", href: "/duck-race" },
];

export default function AccountPage() {
  const { ready, user } = useAuth();

  if (!ready) {
    return <main className="flex-1 w-full max-w-[1160px] mx-auto px-6 py-9 pb-16" />;
  }

  return user ? <MemberAccount /> : <GuestAccount />;
}

function GuestAccount() {
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
          {/* onSkip intentionally omitted: this page renders its own
              "ยังไม่สมัคร" skip link below, so passing onSkip here would
              render a second, duplicate skip affordance inside the form. */}
          <AccountForm />
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

function MemberAccount() {
  const { user, updateProfile, resetPassword, signOut } = useAuth();
  const meta = (user?.user_metadata || {}) as { full_name?: string; school?: string };
  const email = user?.email || "";
  // Lazy-initialized from `user_metadata`/localStorage on first render
  // instead of synced via a `useEffect`+`setState` — this component only
  // mounts once `user` is already populated (see `AccountPage` above),
  // so there's no later async arrival to react to. `saveProfile` below
  // keeps these in sync with the server after a save.
  const [name, setName] = useState(() => meta.full_name || "");
  const [school, setSchool] = useState(() => meta.school || "");
  const [profileSaved, setProfileSaved] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [note, setNote] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [keyCount] = useState(() => getKhuncoolLocalStorageKeys().length);

  const displayName = meta.full_name || "ครูของ khuncool";
  const initial = ((meta.full_name || email || "?").trim().charAt(0) || "?").toUpperCase();
  const schoolLine = meta.school || "ยังไม่ได้ระบุโรงเรียน";

  const saveProfile = async () => {
    setSavingProfile(true);
    const r = await updateProfile({ fullName: name, school });
    setSavingProfile(false);
    setProfileSaved(r.ok ? "บันทึกแล้ว ✓" : r.error || "บันทึกไม่สำเร็จ");
    setTimeout(() => setProfileSaved(""), 3000);
  };

  const sendReset = async () => {
    if (!email) return;
    const r = await resetPassword(email);
    setNote(
      r.ok
        ? `ส่งลิงก์เปลี่ยนรหัสผ่านไปที่ ${email} แล้ว`
        : r.error || "ส่งลิงก์ไม่สำเร็จ"
    );
  };

  const handleSignOut = async (keepLocal: boolean) => {
    setSigningOut(true);
    await signOut(keepLocal);
    // AuthProvider clears session/user via onAuthStateChange; no reload needed.
  };

  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto px-6 py-9 pb-16">
      <div className="mb-5 flex flex-wrap items-center gap-[18px] rounded-card-lg border border-border bg-surface-card p-6">
        <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-600 text-[26px] font-bold text-white">
          {initial}
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="text-[22px] font-bold tracking-tight text-ink">{displayName}</div>
          <div className="text-[13.5px] text-ink-secondary">{email}</div>
          <div className="mt-0.5 text-[12.5px] text-ink-faint">{schoolLine}</div>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap rounded-pill bg-success-bg px-[15px] py-[9px] text-[13px] font-semibold text-success">
          <span className="h-2 w-2 rounded-full bg-success" />
          ซิงก์ทุกเครื่องแล้ว
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
        <div className="flex flex-col gap-5">
          <div className="rounded-card-lg border border-border bg-surface-card p-6">
            <div className="mb-1.5 flex items-baseline justify-between">
              <h2 className="m-0 flex-none whitespace-nowrap text-[18px] font-bold text-ink">
                ข้อมูลของคุณบนคลาวด์
              </h2>
            </div>
            <p className="mb-4 text-[13.5px] leading-[1.6] text-ink-secondary">
              ทุกครั้งที่คุณแก้ข้อมูลในแอป ระบบจะบันทึกขึ้นบัญชีนี้ให้อัตโนมัติ
              เปิดเครื่องอื่นแล้วล็อกอินก็เจอข้อมูลเดิม
            </p>
            <div className="mb-4 flex items-center gap-2.5 rounded-card-sm border border-border bg-surface-light px-3 py-2.5 text-[13px] text-ink-secondary">
              <span className="text-base">💾</span>
              <span>
                มีข้อมูล {keyCount} รายการที่เก็บไว้ในเครื่องนี้ — เปิดจากเครื่องอื่นแล้วล็อกอินด้วยบัญชีนี้เพื่อดึงข้อมูลกลับมา
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="whitespace-nowrap rounded-[11px] bg-primary px-[18px] py-[11px] text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                🔄 ซิงก์เดี๋ยวนี้
              </button>
            </div>
            <p className="mt-2.5 text-[12px] text-ink-faint">
              แต่ละแอปจะซิงก์ข้อมูลให้อัตโนมัติเมื่อคุณแก้ไข — กด &quot;ซิงก์เดี๋ยวนี้&quot; เพื่อโหลดข้อมูลล่าสุดจากทุกเครื่องมาที่เครื่องนี้
            </p>
            {note && (
              <div className="mt-3.5 rounded-card-sm border border-[#A7F0DF] bg-[#D0FBEF] px-[13px] py-[11px] text-[12.5px] text-[#0A6B5C]">
                {note}
              </div>
            )}
          </div>

          <div className="rounded-card-lg border border-border bg-surface-card p-6">
            <h2 className="m-0 mb-1 text-[18px] font-bold text-ink">โปรไฟล์ครู</h2>
            <p className="mb-[18px] text-[13.5px] leading-[1.6] text-ink-secondary">
              ใช้แสดงในหัวรายงานเช็กชื่อและสรุปเงินออม — ไม่กรอกก็ใช้งานได้ปกติ
            </p>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
                  ชื่อ-นามสกุล
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ครูสมชาย ใจดี"
                  className="w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
                  โรงเรียน
                </label>
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="โรงเรียนบ้านหนองคูล"
                  className="w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3.5">
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className="whitespace-nowrap rounded-[11px] bg-ink px-[22px] py-3 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
              >
                {savingProfile ? "กำลังบันทึก…" : "บันทึกโปรไฟล์"}
              </button>
              {profileSaved && (
                <span className="text-[12.5px] text-success">{profileSaved}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-card-lg bg-gradient-to-br from-[#2A2775] to-[#0A9380] p-6 text-white">
            <span className="whitespace-nowrap rounded-pill bg-white/[.18] px-3 py-1.5 text-[11.5px] font-semibold">
              🎁 ฟรีถาวร
            </span>
            <div className="my-3.5 text-[19px] font-bold">ทุกฟีเจอร์ไม่มีค่าใช้จ่าย</div>
            <p className="m-0 text-[13.5px] leading-[1.65] text-[#C6C9FB]">
              khuncool ไม่มีแพ็กเกจเสียเงิน ไม่มีการจำกัดจำนวนห้องหรือนักเรียน —
              สมัครแล้วใช้ได้ครบทุกอย่างตลอดไป
            </p>
          </div>

          <div className="rounded-card-lg border border-border bg-surface-card p-6">
            <h3 className="m-0 mb-3.5 text-base font-bold text-ink">เปิดใช้งานต่อ</h3>
            <div className="flex flex-col gap-2">
              {QUICK_LINK_APPS.map((ap) => (
                <Link
                  key={ap.title}
                  href={ap.href}
                  className="flex items-center gap-2.5 rounded-card-sm border border-border p-2.5 text-ink transition-colors hover:border-[#C6C9FB] hover:bg-surface-light"
                >
                  <div
                    className={`flex h-8 w-8 flex-none items-center justify-center rounded-[10px] text-base ${ap.bg}`}
                  >
                    {ap.icon}
                  </div>
                  <div className="flex-1 text-[13.5px] font-semibold">{ap.title}</div>
                  <span className="text-ink-faint">›</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-card-lg border border-border bg-surface-card p-6">
            <h3 className="m-0 mb-2.5 text-base font-bold text-ink">บัญชีและความปลอดภัย</h3>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={sendReset}
                className="flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-[11px] text-left text-[13.5px] text-ink transition-colors hover:bg-surface-light"
              >
                🔑 ส่งลิงก์เปลี่ยนรหัสผ่านไปที่อีเมล
              </button>
              <button
                type="button"
                disabled={signingOut}
                onClick={() => handleSignOut(true)}
                className="flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-[11px] text-left text-[13.5px] text-ink transition-colors hover:bg-surface-light disabled:opacity-60"
              >
                ↩︎ ออกจากระบบ (เก็บข้อมูลไว้ในเครื่องนี้)
              </button>
              <button
                type="button"
                disabled={signingOut}
                onClick={() => handleSignOut(false)}
                className="flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-[11px] text-left text-[13.5px] text-danger transition-colors hover:bg-error-bg disabled:opacity-60"
              >
                🚪 ออกจากระบบและล้างข้อมูลในเครื่องนี้
              </button>
            </div>
            <p className="mt-3 text-[11.5px] leading-[1.6] text-ink-faint">
              ใช้เครื่องสาธารณะ (คอมห้องพักครู) ควรเลือกแบบล้างข้อมูล — ข้อมูลบนคลาวด์ยังอยู่ครบ
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
