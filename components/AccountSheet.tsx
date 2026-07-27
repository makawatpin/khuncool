"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ---------------------------------------------------------------------- */
/* Context                                                                */
/* ---------------------------------------------------------------------- */

interface AccountSheetContextValue {
  isOpen: boolean;
  openAccountSheet: () => void;
  closeAccountSheet: () => void;
}

const AccountSheetContext = createContext<AccountSheetContextValue | null>(
  null
);

export function AccountSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAccountSheet = useCallback(() => setIsOpen(true), []);
  const closeAccountSheet = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openAccountSheet, closeAccountSheet }),
    [isOpen, openAccountSheet, closeAccountSheet]
  );

  return (
    <AccountSheetContext.Provider value={value}>
      {children}
    </AccountSheetContext.Provider>
  );
}

export function useAccountSheet() {
  const ctx = useContext(AccountSheetContext);
  if (!ctx) {
    throw new Error(
      "useAccountSheet must be used within an AccountSheetProvider"
    );
  }
  return ctx;
}

/* ---------------------------------------------------------------------- */
/* Shared form (tabs + fields + buttons) — reused full-page in /account   */
/* ---------------------------------------------------------------------- */

type AccountTab = "signin" | "signup" | "reset";

export function AccountForm({
  onSkip,
  className = "",
}: {
  onSkip?: () => void;
  className?: string;
}) {
  const [tab, setTab] = useState<AccountTab>("signup");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phase 1: no real auth wiring. Submitting is a no-op that just
  // closes the sheet (via onSkip) — nothing is sent over the network.
  const handleSubmit = () => {
    onSkip?.();
  };

  const heading =
    tab === "signup"
      ? "สมัครใช้ khuncool ฟรี"
      : tab === "reset"
        ? "ตั้งรหัสผ่านใหม่"
        : "เข้าสู่ระบบ khuncool";

  const lead =
    tab === "signup"
      ? "สมัครแล้วห้องเรียน รายชื่อนักเรียน การเช็กชื่อ และเงินออม จะตามคุณไปทุกเครื่อง — คอมที่โรงเรียน มือถือ แท็บเล็ต"
      : tab === "reset"
        ? "กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้"
        : "เข้าสู่ระบบเพื่อดึงข้อมูลห้องเรียนของคุณกลับมาบนเครื่องนี้";

  const submitLabel =
    tab === "signup"
      ? "สมัคร"
      : tab === "reset"
        ? "ส่งลิงก์ตั้งรหัสผ่านใหม่"
        : "เข้าสู่ระบบ";

  return (
    <div className={className}>
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-bg px-3 py-1 text-[11.5px] font-semibold text-success">
        ✓ ฟรีทุกฟีเจอร์ ไม่มีแพ็กเกจเสียเงิน
      </span>

      <h2 className="mt-3.5 mb-1.5 text-[22px] font-bold tracking-tight text-ink">
        {heading}
      </h2>
      <p className="mb-[18px] text-[13.5px] leading-relaxed text-ink-secondary">
        {lead}
      </p>

      {tab !== "reset" && (
        <div
          role="tablist"
          className="mb-4 flex gap-1 rounded-card-sm border border-border bg-surface-light p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signin"}
            onClick={() => setTab("signin")}
            className={`flex-1 rounded-[9px] py-2 text-[13px] font-semibold transition-colors ${
              tab === "signin"
                ? "bg-surface-card text-primary shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "signup"}
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-[9px] py-2 text-[13px] font-semibold transition-colors ${
              tab === "signup"
                ? "bg-surface-card text-primary shadow-sm"
                : "text-ink-secondary"
            }`}
          >
            สมัคร
          </button>
        </div>
      )}

      {tab === "signup" && (
        <>
          <div className="mb-3.5">
            <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
              ชื่อ-นามสกุล{" "}
              <span className="font-normal text-ink-faint">(ไม่ใส่ก็ได้)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ครูสมชาย ใจดี"
              className="w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
          <div className="mb-3.5">
            <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
              โรงเรียน{" "}
              <span className="font-normal text-ink-faint">(ไม่ใส่ก็ได้)</span>
            </label>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="เช่น โรงเรียนบ้านหนองคูล"
              className="w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
        </>
      )}

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
          อีเมล
        </label>
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teacher@example.com"
          className="w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
        />
      </div>

      {tab !== "reset" && (
        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
            รหัสผ่าน
            {tab === "signup" && (
              <span className="font-normal text-ink-faint">
                {" "}
                (อย่างน้อย 6 ตัว)
              </span>
            )}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-1 w-full rounded-btn bg-primary py-3.5 text-[14.5px] font-semibold text-white shadow-cta transition-colors hover:bg-primary-hover"
      >
        {submitLabel}
      </button>

      {tab !== "reset" ? (
        <>
          <div className="my-4 flex items-center gap-3 text-[11.5px] text-ink-faint">
            <span className="h-px flex-1 bg-border" />
            หรือ
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            // Phase 1: no real OAuth wiring yet — closing the sheet mirrors
            // the "skip" behavior until Google sign-in is implemented.
            onClick={onSkip}
            className="flex w-full items-center justify-center gap-2 rounded-btn border border-border-strong bg-surface-card py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-light"
          >
            <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.6-.15-3.2-.45-4.5H24v9h12.6c-.55 2.9-2.2 5.3-4.6 7l7.7 6c4.5-4.2 6.8-10.3 6.8-17.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.5 28.6a14.6 14.6 0 010-9.2l-7.9-6.2A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.5 0 11.9-2.1 15.7-5.8l-7.7-6c-2.1 1.5-4.9 2.4-8 2.4-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"
              />
            </svg>
            ดำเนินการต่อด้วย Google
          </button>
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setTab("reset")}
              className="text-[12.5px] font-semibold text-primary"
            >
              ลืมรหัสผ่าน?
            </button>
            <span className="text-[11.5px] text-ink-faint">
              ไม่มีบัตรเครดิต ไม่มีค่าบริการ
            </span>
          </div>
        </>
      ) : (
        <div className="mt-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className="text-[12.5px] font-semibold text-primary"
          >
            ← กลับไปเข้าสู่ระบบ
          </button>
        </div>
      )}

      {tab === "signup" && (
        <div className="mt-[18px] flex flex-col gap-2.5 border-t border-border pt-4">
          <div className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-secondary">
            <span>💾</span>
            <span>
              <b className="font-semibold text-ink">
                ข้อมูลตามตัวไปทุกเครื่อง
              </b>{" "}
              — เช็กชื่อจากมือถือ ดูสรุปบนคอมที่โรงเรียน
            </span>
          </div>
          <div className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-secondary">
            <span>🔒</span>
            <span>
              <b className="font-semibold text-ink">เห็นได้แค่คุณ</b> —
              ข้อมูลผูกกับบัญชีคุณคนเดียว ไม่แชร์ให้ครูคนอื่น
            </span>
          </div>
          <div className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-secondary">
            <span>🎁</span>
            <span>
              <b className="font-semibold text-ink">ฟรีถาวร</b> —
              ทุกเครื่องมือ ทุกแอป ไม่มีแพ็กเกจเสียเงิน
            </span>
          </div>
        </div>
      )}

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-1.5 w-full rounded-[11px] py-2.5 text-[13px] font-semibold text-ink-secondary transition-colors hover:bg-surface-light"
        >
          ยังไม่สมัคร ใช้แบบเก็บในเครื่องต่อ
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Overlay — full-screen scrim + sheet, rendered once in root layout      */
/* ---------------------------------------------------------------------- */

export function AccountSheetOverlay() {
  const { isOpen, closeAccountSheet } = useAccountSheet();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9600] flex items-start justify-end bg-ink/40 p-4 sm:items-center sm:justify-center"
      onClick={closeAccountSheet}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[min(78vh,620px)] w-full max-w-[380px] overflow-y-auto rounded-card-lg border border-border bg-surface-card p-[22px] shadow-device-frame"
      >
        <button
          type="button"
          onClick={closeAccountSheet}
          aria-label="ปิด"
          className="absolute right-3.5 top-3.5 flex h-[34px] w-[34px] items-center justify-center rounded-card-sm border border-border bg-surface-card text-sm text-ink-secondary"
        >
          ✕
        </button>
        <AccountForm onSkip={closeAccountSheet} />
      </div>
    </div>
  );
}
