"use client";

import type { CloudSyncStatus } from "@/lib/useCloudSync";

function clock(ms: number): string {
  return new Date(ms).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Always-visible note that the tool saves by itself, so teachers used to a
 * "Save" button can see their work is kept: before any change it explains
 * auto-saving; after one it shows when, and whether it reached the account.
 */
export default function SaveIndicator({
  savedAt,
  status,
}: {
  savedAt: number | null;
  status: CloudSyncStatus;
}) {
  let text: string;
  let tone = "text-[#7C8494]";
  if (savedAt === null) {
    text = "บันทึกอัตโนมัติทุกครั้งที่แก้ไข ไม่ต้องกดเซฟ";
  } else if (status === "syncing") {
    text = `✓ บันทึกในเครื่องแล้ว ${clock(savedAt)} · กำลังซิงก์…`;
    tone = "text-[#0A7A66]";
  } else if (status === "synced") {
    text = `✓ บันทึกและซิงก์ขึ้นบัญชีแล้ว ${clock(savedAt)}`;
    tone = "text-[#0A7A66]";
  } else if (status === "error") {
    text = `✓ บันทึกในเครื่องแล้ว ${clock(savedAt)} · ซิงก์ไม่สำเร็จ จะลองใหม่เมื่อแก้ไขครั้งถัดไป`;
    tone = "text-[#B45309]";
  } else {
    text = `✓ บันทึกในเครื่องนี้แล้ว ${clock(savedAt)}`;
    tone = "text-[#0A7A66]";
  }
  return (
    <p role="status" aria-live="polite" className={`m-0 text-[11.5px] font-semibold md:text-[12.5px] ${tone}`}>
      {text}
    </p>
  );
}
