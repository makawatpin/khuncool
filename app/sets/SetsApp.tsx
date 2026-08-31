"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAccountSheet } from "@/components/AccountSheet";
import {
  MissingListFunctionError,
  deleteShare,
  listMyShares,
  type MyShare,
} from "@/lib/contentSets/list";

const TEMPLATE_LABELS: Record<string, string> = {
  "random-question": "🎯 สุ่มคำถามหน้าชั้น",
  "mystery-board": "🎁 กระดานป้ายปริศนา",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function SetsApp() {
  const { user, ready } = useAuth();
  const { openAccountSheet } = useAccountSheet();
  const [shares, setShares] = useState<MyShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setSchemaMissing(false);
    try {
      setShares(await listMyShares());
    } catch (err) {
      if (err instanceof MissingListFunctionError) setSchemaMissing(true);
      else setError(err instanceof Error ? err.message : "โหลดรายการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  // Deferred by a timeout so the effect never calls setState synchronously
  // during mount (react-hooks/set-state-in-effect), matching how the other
  // tools hydrate.
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ready, user, load]);

  const copy = async (share: MyShare) => {
    await navigator.clipboard.writeText(share.url);
    setCopied(share.slug);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const remove = async (share: MyShare) => {
    if (
      !window.confirm(
        `ลบลิงก์ “${share.title}” ใช่ไหม\nนักเรียนที่มีลิงก์นี้จะเปิดไม่ได้อีก`,
      )
    ) {
      return;
    }
    try {
      await deleteShare(share.slug);
      setShares((current) => current.filter((s) => s.slug !== share.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
      <nav className="mb-5 text-xs text-ink-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">หน้าแรก</Link>
        <span className="mx-2">›</span>
        ลิงก์ที่แชร์
      </nav>

      <div className="mb-6">
        <span className="inline-flex rounded-pill bg-success-bg px-3 py-1 text-[11px] font-semibold text-success">
          🔗 เปิดได้เฉพาะคนที่มีลิงก์
        </span>
        <h1 className="mt-3 text-[26px] font-bold tracking-tight text-ink md:text-[34px]">
          ลิงก์ที่แชร์
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          ลิงก์และ QR ที่คุณสร้างไว้จากสุ่มคำถามหน้าชั้นและกระดานป้ายปริศนา
          คัดลอกไปใช้ซ้ำได้ ไม่ต้องสร้างใหม่
        </p>
      </div>

      {!ready || loading ? (
        <div className="rounded-card-lg border border-border bg-white p-8 text-center text-sm text-ink-muted">
          กำลังโหลด…
        </div>
      ) : !user ? (
        <div className="rounded-card-lg border border-dashed border-border-strong bg-white p-9 text-center shadow-sm">
          <div className="text-5xl">🔒</div>
          <h2 className="mt-4 text-xl font-bold text-ink">ต้องล็อกอินก่อน</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            ลิงก์ที่แชร์ผูกกับบัญชีของคุณ ล็อกอินเพื่อดูลิงก์ที่เคยสร้างไว้
          </p>
          <button
            type="button"
            onClick={openAccountSheet}
            className="mt-5 rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            เข้าสู่ระบบ / สมัครฟรี
          </button>
        </div>
      ) : schemaMissing ? (
        <div className="rounded-card-lg border border-[#f2d399] bg-[#fff9eb] p-6 text-sm leading-relaxed text-[#795518]">
          <strong className="block text-base">ยังเปิดใช้หน้านี้ไม่ได้</strong>
          <p className="mt-2">
            ฐานข้อมูลยังไม่มีฟังก์ชัน <code>list_my_kc_content_sets</code> —
            ต้องรัน migration <code>20260831030000_list_own_content_sets.sql</code>{" "}
            ใน Supabase ก่อน ลิงก์ที่แชร์ไปแล้วยังใช้งานได้ตามปกติ
            เรื่องนี้กระทบเฉพาะหน้ารายการนี้เท่านั้น
          </p>
        </div>
      ) : error ? (
        <div className="rounded-card-lg border border-[#F8C9C9] bg-[#FDECEC] p-6 text-sm text-[#9B1C1C]">
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-3 font-semibold underline"
          >
            ลองใหม่
          </button>
        </div>
      ) : shares.length === 0 ? (
        <div className="rounded-card-lg border border-dashed border-border-strong bg-white p-9 text-center shadow-sm">
          <div className="text-5xl">🔗</div>
          <h2 className="mt-4 text-xl font-bold text-ink">ยังไม่มีลิงก์ที่แชร์</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            เปิดเครื่องมือคำถาม ใส่คำถาม แล้วกดปุ่ม “🔗 แชร์ / QR”
            ลิงก์ที่สร้างจะมาโผล่ที่นี่
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/question-sets"
              className="rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-primary-hover"
            >
              ไปที่ชุดคำถามของฉัน
            </Link>
            <Link
              href="/random-question"
              className="rounded-btn border border-border px-5 py-3 text-sm font-semibold text-ink no-underline hover:border-primary hover:text-primary"
            >
              สุ่มคำถามหน้าชั้น
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {shares.map((share) => (
            <div
              key={share.slug}
              className="rounded-card-lg border border-border bg-white p-4 shadow-sm md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 truncate text-[15px] font-bold text-ink md:text-base">
                    {share.title}
                  </h2>
                  <p className="m-0 mt-1 text-xs text-ink-muted">
                    {TEMPLATE_LABELS[share.template] ?? share.template} ·{" "}
                    {share.itemCount} ข้อ · สร้าง {formatDate(share.createdAt)}
                    {share.playCount > 0 && <> · เปิดแล้ว {share.playCount} ครั้ง</>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(share)}
                  className="flex-none rounded-[10px] px-3 py-2 text-xs font-semibold text-error-strong hover:bg-error-bg"
                >
                  ลบลิงก์
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-[10px] bg-surface-light px-3 py-2 text-xs text-ink-secondary">
                  {share.url}
                </code>
                <button
                  type="button"
                  onClick={() => void copy(share)}
                  className="rounded-[10px] border border-primary px-3.5 py-2 text-xs font-semibold text-primary hover:bg-[#f6f6ff]"
                >
                  {copied === share.slug ? "คัดลอกแล้ว ✓" : "คัดลอกลิงก์"}
                </button>
                <a
                  href={share.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[10px] border border-border px-3.5 py-2 text-xs font-semibold text-ink no-underline hover:border-primary hover:text-primary"
                >
                  เปิดดู ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-ink-muted">
        ลิงก์เป็นสำเนาของคำถาม ณ ตอนที่กดแชร์ — แก้ชุดคำถามต้นฉบับภายหลัง
        ลิงก์เดิมจะไม่เปลี่ยนตาม ถ้าต้องการเวอร์ชันใหม่ให้กดแชร์อีกครั้ง
      </p>
    </div>
  );
}
