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
import { useReportHeader } from "@/lib/useReportHeader";

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

const INPUT =
  "w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";

/**
 * The one place the teacher sets the letterhead (school, line under it, logo)
 * printed at the top of every report. Works signed in or out: signed in it is
 * kept in the account, otherwise on this device only.
 */
export default function ReportHeaderCard({ schoolHint }: { schoolHint?: string }) {
  const { header, setHeader } = useReportHeader();
  const [saved, setSaved] = useState(false);
  // Remount the form when the stored value changes (first load, cloud pull, save)
  // so the draft always starts from what is saved.
  const formKey = `${header.school}|${header.subtitle}|${header.logo.length}`;
  return (
    <HeaderForm
      key={formKey}
      header={header}
      schoolHint={schoolHint}
      saved={saved}
      onSave={(next) => {
        setHeader(next);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }}
    />
  );
}

function HeaderForm({
  header,
  schoolHint,
  saved,
  onSave,
}: {
  header: ReportHeaderSettings;
  schoolHint?: string;
  saved: boolean;
  onSave: (next: ReportHeaderSettings) => void;
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

  const clean = normalizeReportHeader(draft);
  const dirty =
    clean.school !== header.school || clean.subtitle !== header.subtitle || clean.logo !== header.logo;
  const preview = reportHeaderHtml(
    { title: "ชื่อรายงาน", meta: ["ห้อง ป.5/2", "4 พ.ย. 2569"], school: schoolHint },
    clean,
  );

  return (
    <section id="report-header" className="scroll-mt-24 rounded-card-lg border border-border bg-surface-card p-6">
      <h2 className="m-0 mb-1 text-[18px] font-bold text-ink">หัวกระดาษรายงาน</h2>
      <p className="mb-4 text-[13.5px] leading-[1.6] text-ink-secondary">
        ตั้งครั้งเดียว ใช้กับรายงาน PDF ทุกฉบับ (เช็กชื่อ เงินออม โฮมรูม) ไม่ใส่โลโก้ก็ได้ ·{" "}
        {user ? "เก็บไว้ในบัญชี ใช้ได้ทุกเครื่องที่เข้าสู่ระบบ" : "ยังไม่ได้เข้าสู่ระบบ จะเก็บไว้ในเครื่องนี้เท่านั้น"}
      </p>

      <div className="mb-4 rounded-2xl border border-border p-3.5">
        <style>{REPORT_HEADER_CSS}</style>
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        {draft.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.logo} alt="" className="h-14 w-14 rounded-lg border border-border object-contain" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-border-strong text-[11px] text-ink-faint">
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
          className="rounded-[10px] border border-border-strong bg-white px-3 py-2 text-[13px] font-semibold"
        >
          {draft.logo ? "เปลี่ยนโลโก้" : "อัปโหลดโลโก้"}
        </button>
        {draft.logo && (
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, logo: "" }))}
            className="text-[13px] text-danger"
          >
            ลบโลโก้
          </button>
        )}
      </div>
      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      <label htmlFor="rh-school" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
        ชื่อโรงเรียน
      </label>
      <input
        id="rh-school"
        className={`${INPUT} mb-3.5`}
        value={draft.school}
        maxLength={120}
        placeholder={schoolHint ? `ถ้าเว้นว่างจะใช้ "${schoolHint}"` : "เช่น โรงเรียนบ้านสวนดอก"}
        onChange={(e) => setDraft((d) => ({ ...d, school: e.target.value }))}
      />
      <label htmlFor="rh-sub" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
        บรรทัดรอง (ไม่บังคับ)
      </label>
      <input
        id="rh-sub"
        className={`${INPUT} mb-4`}
        value={draft.subtitle}
        maxLength={160}
        placeholder="เช่น สังกัด สพป.เชียงใหม่ เขต 1"
        onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
      />

      <div className="flex items-center gap-3.5">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => onSave(draft)}
          className="whitespace-nowrap rounded-[11px] bg-ink px-[22px] py-3 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
        >
          บันทึกหัวกระดาษ
        </button>
        {saved && !dirty && <span className="text-[12.5px] text-success">บันทึกแล้ว ✓</span>}
      </div>
    </section>
  );
}
