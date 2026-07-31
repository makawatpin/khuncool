"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:py-24">
      <div className="mb-3 text-5xl">⚠️</div>
      <h1 className="m-0 mb-2 text-2xl font-bold md:text-3xl">
        เกิดข้อผิดพลาดบางอย่าง
      </h1>
      <p className="m-0 mb-6 max-w-[46ch] text-sm leading-[1.7] text-ink-secondary md:text-base">
        ขออภัยในความไม่สะดวก ลองโหลดหน้านี้ใหม่อีกครั้ง
        หรือกลับไปที่หน้าแรก
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover"
        >
          ลองอีกครั้ง
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-ink no-underline hover:bg-surface-light"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </main>
  );
}
