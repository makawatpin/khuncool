"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuestionSets } from "@/lib/questionSets/useQuestionSets";
import { normalizeQuestions } from "@/lib/questionSets/storage";
import type { QuestionSetSummary } from "@/lib/questionSets/types";

type Props = {
  /** Called with the questions of the set the teacher picked. */
  onSelect: (set: QuestionSetSummary) => void;
  /** Questions currently in this tool, offered as "save as a new set". */
  currentQuestions: readonly string[];
  disabled?: boolean;
  buttonLabel?: string;
  className?: string;
};

export default function QuestionSetPicker({
  onSelect,
  currentQuestions,
  disabled = false,
  buttonLabel = "📝 ชุดคำถาม",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState("");
  const { summaries, hydrated, setActiveSet, createSet } = useQuestionSets();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Callers pass raw lines (Mystery Board hands us a split textarea), so an
  // empty box arrives as [""]. Count what would actually be stored.
  const savable = normalizeQuestions(currentQuestions);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const choose = (set: QuestionSetSummary) => {
    setActiveSet(set.id);
    onSelect(set);
    setOpen(false);
  };

  const saveCurrent = () => {
    const name = `ชุดคำถาม ${new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    })}`;
    createSet(name, savable);
    setSaved(`บันทึกแล้ว · ${savable.length} ข้อ`);
    window.setTimeout(() => setSaved(""), 2400);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSaved("");
          setOpen(true);
        }}
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
            aria-labelledby="question-set-picker-title"
            tabIndex={-1}
            className="w-full max-w-[460px] rounded-card-lg border border-border bg-white p-5 shadow-device-frame outline-none md:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="question-set-picker-title"
                  className="text-lg font-bold text-ink"
                >
                  ชุดคำถามของฉัน
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  ชุดที่เลือกจะแทนคำถามในเครื่องมือนี้
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
                กำลังอ่านชุดคำถามในเครื่อง…
              </div>
            ) : summaries.length ? (
              <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {summaries.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => choose(set)}
                    disabled={set.questions.length === 0}
                    className="flex w-full items-center justify-between gap-3 rounded-card border border-border bg-white px-4 py-3 text-left transition hover:border-primary hover:bg-[#f6f6ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {set.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        {set.questions.length} ข้อ
                      </span>
                    </span>
                    <span className="flex-none text-sm font-semibold text-primary">
                      ใช้ชุดนี้ →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-border-strong bg-surface-light p-5 text-center">
                <div className="text-3xl">📝</div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  ยังไม่มีชุดคำถามในเครื่องนี้
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  บันทึกคำถามที่พิมพ์ไว้ในหน้านี้เป็นชุดแรกได้เลย
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-border pt-4">
              <button
                type="button"
                onClick={saveCurrent}
                disabled={savable.length === 0}
                className="w-full rounded-btn border border-primary bg-white px-4 py-3 text-sm font-semibold text-primary hover:bg-[#f6f6ff] disabled:cursor-not-allowed disabled:border-border disabled:text-ink-muted"
              >
                {savable.length
                  ? `บันทึกคำถามในหน้านี้เป็นชุดใหม่ (${savable.length} ข้อ)`
                  : "ยังไม่มีคำถามในหน้านี้ให้บันทึก"}
              </button>
              {saved && (
                <p className="m-0 mt-2 text-center text-xs font-semibold text-success">
                  {saved}
                </p>
              )}

              <Link
                href="/question-sets"
                className="mt-2.5 flex w-full items-center justify-center rounded-btn bg-primary px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-primary-hover"
              >
                จัดการชุดคำถามทั้งหมด
              </Link>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-ink-faint">
                📝 ชุดคำถามใช้ได้ทั้งสุ่มคำถามหน้าชั้นและกระดานป้ายปริศนา
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
