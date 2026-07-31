import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto flex flex-col items-center justify-center px-4 py-16 text-center md:py-24">
      <div className="mb-3 text-5xl">🧭</div>
      <h1 className="m-0 mb-2 text-2xl font-bold md:text-3xl">
        ไม่พบหน้าที่คุณกำลังหา
      </h1>
      <p className="m-0 mb-6 max-w-[46ch] text-sm leading-[1.7] text-ink-secondary md:text-base">
        หน้านี้อาจถูกย้าย ลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
        ลองกลับไปที่หน้าแรกหรือเลือกจากเมนูด้านล่าง
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white no-underline hover:bg-primary-hover"
        >
          กลับหน้าแรก
        </Link>
        <Link
          href="/tools"
          className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-ink no-underline hover:bg-surface-light"
        >
          เครื่องมือครู
        </Link>
        <Link
          href="/articles"
          className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-ink no-underline hover:bg-surface-light"
        >
          บทความ
        </Link>
      </div>
    </main>
  );
}
