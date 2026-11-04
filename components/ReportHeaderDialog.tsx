"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  MAX_LOGO_CHARS,
  REPORT_HEADER_CSS,
  normalizeReportHeader,
  reportHeaderHtml,
  type ReportHeaderSettings,
} from "@/lib/reportHeader";

/** Shrinks a picked image to a small data URL that fits in the account row. */
async function logoFromFile(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("load"));
      el.src = url;
    });
    for (const max of [256, 192, 128]) {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const out = canvas.toDataURL("image/webp", 0.9);
      if (out.length <= MAX_LOGO_CHARS) return out;
    }
    throw new Error("big");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Edit the school name, the line under it and the logo printed at the top of
 * every report. Mount it only while open so the form starts from `header`.
 */
export function ReportHeaderDialog({
  header,
  schoolHint,
  onSave,
  onClose,
}: {
  header: ReportHeaderSettings;
  /** Shown as the placeholder, e.g. the school typed in the homeroom form. */
  schoolHint?: string;
  onSave: (next: ReportHeaderSettings) => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [draft, setDraft] = useState(header);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    try {
      const logo = await logoFromFile(file);
      setDraft((d) => ({ ...d, logo }));
    } catch {
      setError("ใช้ไฟล์นี้ไม่ได้ ลองไฟล์รูปภาพอื่น (PNG หรือ JPG)");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const preview = reportHeaderHtml(
    { title: "ชื่อรายงาน", meta: ["ห้อง ป.5/2", "4 พ.ย. 2569"], school: schoolHint },
    normalizeReportHeader(draft),
  );

  const input =
    "w-full rounded-[10px] border border-[#D3D8E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#5C5EE6]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,29,38,.55)] p-[22px] backdrop-blur-[3px]">
      <div className="max-h-full w-full max-w-[480px] overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,.45)] md:p-[30px]">
        <div className="mb-1 flex items-center gap-2.5">
          <div className="flex-1 text-[17px] font-bold md:text-xl">ตั้งค่าหัวกระดาษรายงาน</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="text-[22px] leading-none text-[#A9B0BE] hover:text-[#DC2626]"
          >
            ×
          </button>
        </div>
        <p className="mb-4 text-xs leading-[1.55] text-[#7C8494]">
          ใช้กับรายงาน PDF ทุกฉบับ ไม่ใส่โลโก้ก็ได้ ระบบจะแสดงเฉพาะข้อความ ·{" "}
          {user ? "เก็บไว้ในบัญชี ใช้ได้ทุกเครื่องที่เข้าสู่ระบบ" : "ยังไม่ได้เข้าสู่ระบบ จะเก็บไว้ในเครื่องนี้เท่านั้น"}
        </p>

        <div className="mb-4 rounded-2xl border border-[#E5E8EE] p-3.5">
          <style>{REPORT_HEADER_CSS}</style>
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>

        <div className="mb-3 flex items-center gap-3">
          {draft.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.logo} alt="" className="h-14 w-14 rounded-lg border border-[#E5E8EE] object-contain" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-[#D3D8E1] text-[11px] text-[#A9B0BE]">
              โลโก้
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => void pick(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-[10px] border border-[#D3D8E1] bg-white px-3 py-2 text-[13px] font-semibold"
          >
            {draft.logo ? "เปลี่ยนโลโก้" : "อัปโหลดโลโก้"}
          </button>
          {draft.logo && (
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, logo: "" }))}
              className="text-[13px] text-[#DC2626]"
            >
              ลบโลโก้
            </button>
          )}
        </div>
        {error && <p className="mb-3 text-xs text-[#B91C1C]">{error}</p>}

        <label className="mb-1 block text-xs font-semibold text-[#5A6273]">ชื่อโรงเรียน</label>
        <input
          className={`${input} mb-3`}
          value={draft.school}
          maxLength={120}
          placeholder={schoolHint ? `โรงเรียน${schoolHint}` : "เช่น โรงเรียนบ้านสวนดอก"}
          onChange={(e) => setDraft((d) => ({ ...d, school: e.target.value }))}
        />
        <label className="mb-1 block text-xs font-semibold text-[#5A6273]">บรรทัดรอง (ไม่บังคับ)</label>
        <input
          className={`${input} mb-5`}
          value={draft.subtitle}
          maxLength={160}
          placeholder="เช่น สังกัด สพป.เชียงใหม่ เขต 1"
          onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
        />

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[#D3D8E1] bg-white px-4 py-2.5 text-sm font-semibold"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="rounded-[10px] bg-[#5C5EE6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4A46D6]"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
