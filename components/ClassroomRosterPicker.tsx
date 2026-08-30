"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClassrooms } from "@/lib/classrooms/useClassrooms";
import type { ClassroomRoster } from "@/lib/classrooms/types";

type Props = {
  onSelect: (roster: ClassroomRoster) => void;
  disabled?: boolean;
  buttonLabel?: string;
  className?: string;
};

export default function ClassroomRosterPicker({
  onSelect,
  disabled = false,
  buttonLabel = "📚 ห้องเรียน",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const { rosters, hydrated, setActiveClassroom } = useClassrooms();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const choose = (roster: ClassroomRoster) => {
    setActiveClassroom(roster.id);
    onSelect(roster);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={className}
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9700] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="classroom-picker-title"
            tabIndex={-1}
            className="w-full max-w-[460px] rounded-card-lg border border-border bg-white p-5 shadow-device-frame outline-none md:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="classroom-picker-title"
                  className="text-lg font-bold text-ink"
                >
                  เลือกห้องเรียน
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  รายชื่อที่เลือกจะแทนรายชื่อชั่วคราวในเครื่องมือนี้
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-border text-ink-secondary hover:bg-surface-light"
              >
                ✕
              </button>
            </div>

            {!hydrated ? (
              <div className="rounded-card border border-border bg-surface-light p-4 text-sm text-ink-muted">
                กำลังอ่านรายชื่อในเครื่อง…
              </div>
            ) : rosters.length ? (
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {rosters.map((roster) => (
                  <button
                    key={roster.id}
                    type="button"
                    onClick={() => choose(roster)}
                    disabled={roster.studentNames.length === 0}
                    className="flex w-full items-center justify-between gap-3 rounded-card border border-border bg-white px-4 py-3 text-left transition hover:border-primary hover:bg-[#f6f6ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {roster.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {roster.studentNames.length} คน
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      ใช้รายชื่อ →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-border-strong bg-surface-light p-5 text-center">
                <div className="text-3xl">🏫</div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  ยังไม่มีห้องเรียนในเครื่องนี้
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  สร้างห้องและวางรายชื่อเพียงครั้งเดียว แล้วนำไปใช้กับทุกเครื่องมือ
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/classrooms"
                className="flex w-full items-center justify-center rounded-btn bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                {rosters.length ? "จัดการห้องเรียนและรายชื่อ" : "สร้างห้องเรียนแรก"}
              </Link>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-faint">
                🔒 รายชื่อเก็บอยู่ในเบราว์เซอร์นี้ ไม่ถูกแนบไปกับลิงก์แชร์
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
