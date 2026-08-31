"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAccountSheet } from "./AccountSheet";
import { createUnlistedShare } from "@/lib/contentSets/share";
import { SHARE_TEMPLATES, type ShareTemplate } from "@/lib/contentSets/types";

const TEMPLATE_LABELS: Record<ShareTemplate, string> = {
  "random-question": "🎯 สุ่มคำถามหน้าชั้น",
  "mystery-board": "🎁 กระดานป้ายปริศนา",
};

type Props = {
  title: string;
  questions: readonly string[];
  className?: string;
};

/**
 * Shares a saved question set as a student link. Same `createUnlistedShare`
 * the in-tool share button uses — the difference is that the teacher picks the
 * game here, so one set can go out as either activity without opening a tool.
 */
export default function ShareQuestionSetButton({
  title,
  questions,
  className = "",
}: Props) {
  const { user, ready } = useAuth();
  const { openAccountSheet } = useAccountSheet();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const start = () => {
    if (!ready) return;
    if (!user) {
      openAccountSheet();
      return;
    }
    setUrl("");
    setError("");
    setOpen(true);
  };

  const create = async (template: ShareTemplate) => {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      setUrl(
        await createUnlistedShare({
          ownerId: user.id,
          title,
          items: questions,
          template,
        }),
      );
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

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={!ready || questions.length === 0}
        className={className}
      >
        🔗 แชร์ชุดนี้
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9700] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="แชร์ชุดคำถาม"
            className="w-full max-w-[440px] rounded-card-lg border border-border bg-white p-5 shadow-device-frame md:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-ink">{title}</h2>
                <p className="mt-1 text-xs text-ink-muted">
                  {questions.length} ข้อ · นักเรียนเปิดได้โดยไม่ต้องล็อกอิน
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

            {url ? (
              <div>
                <code className="block truncate rounded-[10px] bg-surface-light px-3 py-2.5 text-xs text-ink-secondary">
                  {url}
                </code>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void copy()}
                    className="flex-1 rounded-btn bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    {copied ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-btn border border-border px-4 py-3 text-sm font-semibold text-ink no-underline hover:border-primary hover:text-primary"
                  >
                    เปิดดู ↗
                  </a>
                </div>
                <Link
                  href="/sets"
                  className="mt-3 block text-center text-xs font-semibold text-primary"
                >
                  ดูลิงก์ทั้งหมดที่เคยแชร์ →
                </Link>
              </div>
            ) : (
              <div>
                <p className="m-0 mb-2.5 text-xs font-semibold text-ink-secondary">
                  ให้นักเรียนเล่นแบบไหน
                </p>
                <div className="space-y-2">
                  {SHARE_TEMPLATES.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => void create(template)}
                      disabled={busy}
                      className="w-full rounded-card border border-border px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-primary hover:bg-[#f6f6ff] disabled:opacity-50"
                    >
                      {TEMPLATE_LABELS[template]}
                    </button>
                  ))}
                </div>
                {busy && (
                  <p className="m-0 mt-3 text-center text-xs text-ink-muted">
                    กำลังสร้างลิงก์…
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="m-0 mt-3 rounded-[10px] bg-[#FDECEC] px-3 py-2 text-xs text-[#9B1C1C]">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
