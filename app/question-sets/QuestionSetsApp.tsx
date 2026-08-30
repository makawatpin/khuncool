"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuestionSets } from "@/lib/questionSets/useQuestionSets";
import { questionsFromText } from "@/lib/questionSets/storage";
import SyncStatus from "@/components/SyncStatus";
import SaveScopeNote from "@/components/SaveScopeNote";

export default function QuestionSetsApp() {
  const {
    store,
    hydrated,
    cloudStatus,
    createSet,
    updateSet,
    removeSet,
    setActiveSet,
  } = useQuestionSets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftQuestions, setDraftQuestions] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selected = store.sets.find((set) => set.id === selectedId) ?? null;

  useEffect(() => {
    if (!hydrated || selectedId) return;
    const timer = window.setTimeout(
      () => setSelectedId(store.activeSetId ?? store.sets[0]?.id ?? null),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [hydrated, selectedId, store.activeSetId, store.sets]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selected) {
        setDraftName("");
        setDraftQuestions("");
        return;
      }
      setDraftName(selected.name);
      setDraftQuestions(selected.questions.join("\n"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selected]);

  const selectSet = (id: string) => {
    setSelectedId(id);
    setActiveSet(id);
    setMessage("");
  };

  const addSet = () => {
    const id = createSet();
    setSelectedId(id);
    setMessage("สร้างชุดใหม่แล้ว — ตั้งชื่อและวางคำถามได้เลย");
  };

  const save = () => {
    if (!selectedId) return;
    const questions = questionsFromText(draftQuestions);
    updateSet(selectedId, { name: draftName, questions });
    setDraftQuestions(questions.join("\n"));
    setMessage(`บันทึกแล้ว · ${questions.length} ข้อ`);
  };

  const remove = () => {
    if (!selected) return;
    if (!window.confirm(`ลบชุด “${selected.name}” ใช่ไหม`)) return;
    const next = store.sets.find((set) => set.id !== selected.id);
    removeSet(selected.id);
    setSelectedId(next?.id ?? null);
    setMessage("ลบชุดคำถามแล้ว");
  };

  const importExcel = async (file: File) => {
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        raw: false,
      });
      const questions = questionsFromText(
        rows
          .map((row) => (Array.isArray(row) ? row[0] : ""))
          .filter((value): value is string => typeof value === "string")
          .join("\n"),
      );
      if (!questions.length) {
        setMessage("ไม่พบคำถามในคอลัมน์ A");
        return;
      }
      setDraftQuestions(questions.join("\n"));
      setMessage(`อ่านจาก Excel แล้ว ${questions.length} ข้อ · กดบันทึกเพื่อยืนยัน`);
    } catch {
      setMessage("อ่านไฟล์ไม่สำเร็จ ลองใช้ไฟล์ .xlsx หรือวางคำถามแทน");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
      <nav className="mb-5 text-xs text-ink-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">หน้าแรก</Link>
        <span className="mx-2">›</span>
        ชุดคำถามของฉัน
      </nav>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="inline-flex rounded-pill bg-success-bg px-3 py-1 text-[11px] font-semibold text-success">
            📝 เขียนครั้งเดียว ใช้ได้หลายเกม
          </span>
          <h1 className="mt-3 text-[26px] font-bold tracking-tight text-ink md:text-[34px]">
            ชุดคำถามของฉัน
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            เก็บคำถามไว้เป็นชุด แล้วเรียกใช้กับสุ่มคำถามหน้าชั้นและกระดานป้ายปริศนาได้ทันที
          </p>
        </div>
        <button
          type="button"
          onClick={addSet}
          className="rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-cta hover:bg-primary-hover"
        >
          + สร้างชุดคำถาม
        </button>
      </div>

      <SyncStatus status={cloudStatus} />

      <SaveScopeNote variant="sidebar" />

      {!hydrated ? (
        <div className="rounded-card-lg border border-border bg-white p-8 text-center text-sm text-ink-muted">
          กำลังอ่านข้อมูลในเครื่อง…
        </div>
      ) : store.sets.length === 0 ? (
        <div className="rounded-card-lg border border-dashed border-border-strong bg-white p-9 text-center shadow-sm">
          <div className="text-5xl">📝</div>
          <h2 className="mt-4 text-xl font-bold text-ink">เริ่มจากชุดแรก</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            ตั้งชื่อชุด เช่น ทบทวนบทที่ 3 แล้ววางคำถามทีละบรรทัด หรือนำเข้าคอลัมน์ A จาก Excel
          </p>
          <button
            type="button"
            onClick={addSet}
            className="mt-5 rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            สร้างชุดคำถามแรก
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-card-lg border border-border bg-white p-3 shadow-sm">
            <div className="mb-2 px-2 py-1 text-xs font-semibold text-ink-muted">
              ชุดคำถาม · {store.sets.length}
            </div>
            <div className="space-y-1.5">
              {store.sets.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => selectSet(set.id)}
                  aria-pressed={selectedId === set.id}
                  className={`flex w-full items-center justify-between rounded-card px-3 py-3 text-left transition ${
                    selectedId === set.id
                      ? "bg-[#eeeeff] text-primary"
                      : "text-ink hover:bg-surface-light"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {set.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">
                      {set.questions.length} ข้อ
                    </span>
                  </span>
                  <span aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </aside>

          {selected && (
            <section className="rounded-card-lg border border-border bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">แก้ไขชุดคำถาม</h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    1 บรรทัด = 1 คำถาม · ระบบตัดคำถามซ้ำให้อัตโนมัติ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={remove}
                  className="rounded-[10px] px-3 py-2 text-xs font-semibold text-error-strong hover:bg-error-bg"
                >
                  ลบชุด
                </button>
              </div>

              <label className="block text-xs font-semibold text-ink-secondary">
                ชื่อชุด
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  maxLength={80}
                  placeholder="เช่น ทบทวนบทที่ 3"
                  className="mt-1.5 w-full rounded-[11px] border border-border-strong px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <label className="text-xs font-semibold text-ink-secondary">
                  คำถาม
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void importExcel(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-[10px] border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-light"
                  >
                    📥 นำเข้า Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftQuestions("")}
                    className="rounded-[10px] px-3 py-2 text-xs font-semibold text-error-strong hover:bg-error-bg"
                  >
                    ล้างคำถาม
                  </button>
                </div>
              </div>
              <textarea
                value={draftQuestions}
                onChange={(event) => setDraftQuestions(event.target.value)}
                rows={14}
                placeholder={"อธิบายสิ่งที่เรียนวันนี้ให้เพื่อนฟัง 1 ประโยค\nยกตัวอย่างจากชีวิตจริงที่เกี่ยวกับบทเรียนนี้\nอะไรคือสิ่งที่ยากที่สุดในบทนี้ เพราะอะไร"}
                className="mt-2 w-full resize-y rounded-[12px] border border-border-strong px-3.5 py-3 font-sans text-sm leading-relaxed text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
              />

              {message && (
                <div className="mt-3 rounded-[10px] bg-success-bg px-3 py-2 text-xs font-medium text-success" aria-live="polite">
                  {message}
                </div>
              )}

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-ink-muted">
                  {questionsFromText(draftQuestions).length} ข้อ
                </span>
                <button
                  type="button"
                  onClick={save}
                  className="rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-cta hover:bg-primary-hover"
                >
                  บันทึกชุดคำถาม
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      <section className="mt-7 rounded-card-lg border border-border bg-white p-5 md:p-6">
        <h2 className="text-base font-bold text-ink">นำชุดคำถามไปใช้</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["🎯 สุ่มคำถามหน้าชั้น", "/random-question"],
            ["🎁 กระดานป้ายปริศนา", "/mystery-board"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-card border border-border px-4 py-3 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
            >
              {label} →
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          เปิดเครื่องมือแล้วกดปุ่ม “📝 ชุดคำถาม” เพื่อเลือกชุดที่จะใช้
        </p>
      </section>
    </div>
  );
}
