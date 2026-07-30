"use client";

import type { CloudSyncStatus } from "@/lib/useCloudSync";

/**
 * Minimal, non-silent surface for useCloudSync's status. Only renders
 * something when there is actually news to report — a failed push/pull
 * ("error") or an in-flight sync ("syncing") — so signed-out guests and
 * the common already-synced case stay visually unchanged.
 *
 * Placed as a small fixed pill matching the existing offline/toast banners
 * in Attendance/Savings/Homeroom (see AttendanceApp.tsx's offline banner).
 */
export default function SyncStatus({ status }: { status: CloudSyncStatus }) {
  if (status !== "error" && status !== "syncing") return null;

  if (status === "syncing") {
    return (
      <div className="fixed bottom-7 right-4 z-[99] rounded-pill border border-border bg-white px-[16px] py-[8px] text-[12.5px] font-semibold text-ink-secondary shadow-[0_12px_30px_-12px_rgba(26,29,38,.35)]">
        ☁️ กำลังซิงก์…
      </div>
    );
  }

  return (
    <div className="fixed bottom-7 right-4 z-[99] rounded-pill border border-[#F8C9C9] bg-[#FDECEC] px-[16px] py-[8px] text-[12.5px] font-semibold text-[#9B1C1C] shadow-[0_12px_30px_-12px_rgba(26,29,38,.35)]">
    ⚠️ ซิงก์ไม่สำเร็จ — ข้อมูลยังอยู่ในเครื่องนี้
    </div>
  );
}
