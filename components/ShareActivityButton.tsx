"use client";

import { useState } from "react";
import { useAccountSheet } from "@/components/AccountSheet";
import QrCode from "@/components/QrCode";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createUnlistedShare } from "@/lib/contentSets/share";
import type { ShareTemplate } from "@/lib/contentSets/types";

type Props = {
  title: string;
  items: readonly string[];
  template: ShareTemplate;
  templateConfig?: Record<string, unknown>;
  className?: string;
};

export default function ShareActivityButton({ title, items, template, templateConfig, className }: Props) {
  const { user, ready } = useAuth();
  const { openAccountSheet } = useAccountSheet();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const canShare = items.length > 0 || (template === "mystery-board" && templateConfig?.mode === "score");

  const create = async () => {
    if (!ready || busy) return;
    if (!user) {
      openAccountSheet();
      return;
    }
    setOpen(true);
    setBusy(true);
    setError("");
    setUrl("");
    try {
      setUrl(await createUnlistedShare({ ownerId: user.id, title, items, template, templateConfig }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างลิงก์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title, url });
    else await copy();
  };

  return (
    <>
      <button type="button" onClick={create} disabled={!ready || busy || !canShare} className={className} aria-label="แชร์กิจกรรมและสร้าง QR code">
        🔗 <span>แชร์ / QR</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="share-title" className="w-full max-w-md rounded-3xl bg-white p-5 text-ink shadow-2xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="share-title" className="m-0 text-xl">แชร์กิจกรรมนี้</h2>
                <p className="mb-0 mt-1 text-sm text-ink-secondary">ผู้ที่มีลิงก์เปิดเล่นได้ โดยไม่เห็นบัญชีหรือข้อมูลห้องเรียนของครู</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-border bg-white px-3 py-1.5 text-lg" aria-label="ปิด">×</button>
            </div>
            {busy && <p className="my-8 text-center text-sm text-ink-secondary">กำลังสร้างลิงก์…</p>}
            {error && <p className="my-5 rounded-xl bg-red-50 p-3 text-sm text-error-strong">{error}</p>}
            {url && (
              <div className="mt-5 flex flex-col items-center gap-4">
                <div className="overflow-hidden rounded-2xl border border-border bg-white p-2"><QrCode value={url} /></div>
                <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm" />
                <div className="grid w-full grid-cols-2 gap-2">
                  <button type="button" onClick={copy} className="rounded-xl border border-primary px-3 py-2.5 text-sm font-semibold text-primary">{copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}</button>
                  <button type="button" onClick={share} className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white">ส่งต่อ</button>
                </div>
              </div>
            )}
            <p className="mb-0 mt-4 text-xs leading-relaxed text-ink-faint">ระบบส่งขึ้นคลาวด์เฉพาะชื่อกิจกรรม คำถาม ธีม และการตั้งค่าที่เห็นในกิจกรรมนี้ กรุณาอย่าใส่ชื่อนักเรียนหรือข้อมูลส่วนบุคคลในคำถาม</p>
          </section>
        </div>
      )}
    </>
  );
}
