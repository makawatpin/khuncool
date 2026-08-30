"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClassrooms } from "@/lib/classrooms/useClassrooms";
import SyncStatus from "@/components/SyncStatus";
import SaveScopeNote from "@/components/SaveScopeNote";
import { normalizeStudentNames } from "@/lib/classrooms/storage";

export default function ClassroomsApp() {
  const {
    store,
    hydrated,
    cloudStatus,
    createClassroom,
    updateClassroom,
    removeClassroom,
    setActiveClassroom,
  } = useClassrooms();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftStudents, setDraftStudents] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selected =
    store.classrooms.find((classroom) => classroom.id === selectedId) ?? null;

  useEffect(() => {
    if (!hydrated || selectedId) return;
    const timer = window.setTimeout(
      () => setSelectedId(store.activeClassroomId ?? store.classrooms[0]?.id ?? null),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [hydrated, selectedId, store.activeClassroomId, store.classrooms]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selected) {
        setDraftName("");
        setDraftStudents("");
        return;
      }
      setDraftName(selected.name);
      setDraftStudents(selected.students.map((student) => student.name).join("\n"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selected]);

  const selectClassroom = (id: string) => {
    setSelectedId(id);
    setActiveClassroom(id);
    setMessage("");
  };

  const addClassroom = () => {
    const id = createClassroom();
    setSelectedId(id);
    setMessage("สร้างห้องใหม่แล้ว — ตั้งชื่อและวางรายชื่อได้เลย");
  };

  const save = () => {
    if (!selectedId) return;
    const names = normalizeStudentNames(draftStudents.split("\n"));
    updateClassroom(selectedId, { name: draftName, studentNames: names });
    setDraftStudents(names.join("\n"));
    setMessage(`บันทึกแล้ว · ${names.length} คน`);
  };

  const remove = () => {
    if (!selected) return;
    if (!window.confirm(`ลบห้อง “${selected.name}” ออกจากเครื่องนี้ใช่ไหม`)) {
      return;
    }
    const next = store.classrooms.find((classroom) => classroom.id !== selected.id);
    removeClassroom(selected.id);
    setSelectedId(next?.id ?? null);
    setMessage("ลบห้องเรียนแล้ว");
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
      const names = normalizeStudentNames(
        rows
          .map((row) => (Array.isArray(row) ? row[0] : ""))
          .filter((value): value is string => typeof value === "string"),
      );
      if (!names.length) {
        setMessage("ไม่พบรายชื่อในคอลัมน์ A");
        return;
      }
      setDraftStudents(names.join("\n"));
      setMessage(`อ่านจาก Excel แล้ว ${names.length} คน · กดบันทึกเพื่อยืนยัน`);
    } catch {
      setMessage("อ่านไฟล์ไม่สำเร็จ ลองใช้ไฟล์ .xlsx หรือวางรายชื่อแทน");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
      <nav className="mb-5 text-xs text-ink-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">หน้าแรก</Link>
        <span className="mx-2">›</span>
        ห้องเรียนของฉัน
      </nav>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="inline-flex rounded-pill bg-success-bg px-3 py-1 text-[11px] font-semibold text-success">
            🔒 ไม่ติดไปกับลิงก์แชร์
          </span>
          <h1 className="mt-3 text-[26px] font-bold tracking-tight text-ink md:text-[34px]">
            ห้องเรียนของฉัน
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            จัดรายชื่อครั้งเดียว แล้วเลือกใช้กับวงล้อ แบ่งกลุ่ม และเกมเป็ดได้ทันที
          </p>
        </div>
        <button
          type="button"
          onClick={addClassroom}
          className="rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-cta hover:bg-primary-hover"
        >
          + สร้างห้องเรียน
        </button>
      </div>

      <SyncStatus status={cloudStatus} />

      <SaveScopeNote variant="sidebar" />

      <div className="mb-6 rounded-card border border-[#f2d399] bg-[#fff9eb] px-4 py-3 text-xs leading-relaxed text-[#795518]">
        รายชื่อนักเรียนเป็นข้อมูลส่วนบุคคล จะไม่ติดไปกับลิงก์แชร์กิจกรรม
        และนักเรียนที่เปิดลิงก์จะไม่เห็นรายชื่อห้องของคุณ
      </div>

      {!hydrated ? (
        <div className="rounded-card-lg border border-border bg-white p-8 text-center text-sm text-ink-muted">
          กำลังอ่านข้อมูลในเครื่อง…
        </div>
      ) : store.classrooms.length === 0 ? (
        <div className="rounded-card-lg border border-dashed border-border-strong bg-white p-9 text-center shadow-sm">
          <div className="text-5xl">🏫</div>
          <h2 className="mt-4 text-xl font-bold text-ink">เริ่มจากห้องแรก</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            ตั้งชื่อห้อง เช่น ป.4/1 แล้ววางรายชื่อทีละบรรทัด หรือนำเข้าคอลัมน์ A จาก Excel
          </p>
          <button
            type="button"
            onClick={addClassroom}
            className="mt-5 rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            สร้างห้องเรียนแรก
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-card-lg border border-border bg-white p-3 shadow-sm">
            <div className="mb-2 px-2 py-1 text-xs font-semibold text-ink-muted">
              ห้องเรียน · {store.classrooms.length}
            </div>
            <div className="space-y-1.5">
              {store.classrooms.map((classroom) => (
                <button
                  key={classroom.id}
                  type="button"
                  onClick={() => selectClassroom(classroom.id)}
                  aria-pressed={selectedId === classroom.id}
                  className={`flex w-full items-center justify-between rounded-card px-3 py-3 text-left transition ${
                    selectedId === classroom.id
                      ? "bg-[#eeeeff] text-primary"
                      : "text-ink hover:bg-surface-light"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {classroom.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">
                      {classroom.students.length} คน
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
                  <h2 className="text-lg font-bold text-ink">แก้ไขห้องเรียน</h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    1 บรรทัด = นักเรียน 1 คน · ระบบตัดชื่อซ้ำให้อัตโนมัติ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={remove}
                  className="rounded-[10px] px-3 py-2 text-xs font-semibold text-error-strong hover:bg-error-bg"
                >
                  ลบห้อง
                </button>
              </div>

              <label className="block text-xs font-semibold text-ink-secondary">
                ชื่อห้อง
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  maxLength={80}
                  placeholder="เช่น ป.4/1"
                  className="mt-1.5 w-full rounded-[11px] border border-border-strong px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <label className="text-xs font-semibold text-ink-secondary">
                  รายชื่อนักเรียน
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
                    onClick={() => setDraftStudents("")}
                    className="rounded-[10px] px-3 py-2 text-xs font-semibold text-error-strong hover:bg-error-bg"
                  >
                    ล้างรายชื่อ
                  </button>
                </div>
              </div>
              <textarea
                value={draftStudents}
                onChange={(event) => setDraftStudents(event.target.value)}
                rows={14}
                placeholder={"เด็กชายกิตติ ใจดี\nเด็กหญิงชนากานต์ สุขใจ\nเด็กชายณัฐพงษ์ ทองมา"}
                className="mt-2 w-full resize-y rounded-[12px] border border-border-strong px-3.5 py-3 font-sans text-sm leading-relaxed text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
              />

              {message && (
                <div className="mt-3 rounded-[10px] bg-success-bg px-3 py-2 text-xs font-medium text-success" aria-live="polite">
                  {message}
                </div>
              )}

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-ink-muted">
                  {normalizeStudentNames(draftStudents.split("\n")).length} คน
                </span>
                <button
                  type="button"
                  onClick={save}
                  className="rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-cta hover:bg-primary-hover"
                >
                  บันทึกห้องเรียน
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      <section className="mt-7 rounded-card-lg border border-border bg-white p-5 md:p-6">
        <h2 className="text-base font-bold text-ink">นำรายชื่อไปใช้</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            ["🎡 วงล้อสุ่มชื่อ", "/random-name-picker"],
            ["🔀 สุ่มแบ่งกลุ่ม", "/group-maker"],
            ["🦆 เกมเป็ดสุ่มชื่อ", "/duck-race"],
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
      </section>
    </div>
  );
}
