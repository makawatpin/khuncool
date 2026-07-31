"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccountSheet } from "./AccountSheet";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ALL_ARTICLES } from "@/app/articles/data";

const LATEST_ARTICLES = [...ALL_ARTICLES]
  .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
  .slice(0, 6);

const PILLARS = [
  {
    icon: "📰",
    title: "บทความ",
    path: "/articles",
    desc: "ข่าวครู รีวิวสินค้า ข่าวอบรมได้เกียรติบัตร และวิธีทำสื่อการสอน",
  },
  {
    icon: "🎡",
    title: "สื่อการสอนออนไลน์",
    path: "/tools",
    desc: "เกมและเครื่องมือ interactive ที่ใช้ผ่านเว็บได้เลย ไม่ต้องติดตั้ง",
  },
  {
    icon: "🛒",
    title: "แนะนำสินค้า",
    path: "/shop",
    desc: "คัดของใช้ในห้องเรียนพร้อมลิงก์ซื้อ (Affiliate) จากครูจริง",
  },
  {
    icon: "📱",
    title: "แอป",
    path: "/apps",
    desc: "แอปช่วยงานครูใช้ผ่านเว็บ เช่น เช็กชื่อ ออมเงิน จัดกลุ่ม",
  },
];

const NAV_LINKS = PILLARS.map((p) => ({ title: p.title, href: p.path }));

export default function Header() {
  const { openAccountSheet } = useAccountSheet();
  const { user } = useAuth();
  const pathname = usePathname();

  const initial = (
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "?"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* announcement bar */}
      <div className="flex items-center gap-2 bg-brand px-3.5 py-2 text-[12.5px] text-white">
        <div className="mx-auto flex w-full max-w-[1160px] items-center gap-2">
          <Link
            href="/articles"
            className="flex-none rounded-md bg-white/20 px-1.5 py-0.5 text-[10.5px] font-semibold text-white no-underline hover:opacity-90"
          >
            บทความใหม่
          </Link>
          <div className="flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
              {[...LATEST_ARTICLES, ...LATEST_ARTICLES].map((a, i) => (
                <Link
                  key={`${a.href}-${i}`}
                  href={a.href}
                  className="text-white no-underline hover:underline"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/articles"
            className="flex-none opacity-70 no-underline hover:opacity-100"
            aria-label="ดูบทความทั้งหมด"
          >
            ›
          </Link>
        </div>
      </div>

      {/* sticky header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/[.92] px-3.5 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center gap-2.5">
          <Link href="/" className="flex flex-1 items-center gap-1.5 md:flex-none">
            <Image
              src="/assets/khuncool-logo.png"
              alt="khuncool"
              width={30}
              height={30}
              className="flex-none object-contain"
            />
            <span className="font-anuphan text-base font-bold tracking-tight">
              khuncool
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2.5 py-2 text-sm text-ink-secondary no-underline hover:bg-surface-light hover:text-primary"
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {user ? (
            <button
              type="button"
              onClick={openAccountSheet}
              aria-label="บัญชีของฉัน"
              title={user.email ?? "บัญชีของฉัน"}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white hover:opacity-90"
            >
              {initial}
            </button>
          ) : (
            <button
              type="button"
              onClick={openAccountSheet}
              className="rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-hover"
            >
              สมัคร
            </button>
          )}
        </div>
      </header>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-white/[.97] backdrop-blur-md md:hidden">
        {PILLARS.map((p) => {
          const active = pathname === p.path || pathname.startsWith(`${p.path}/`);
          return (
            <Link
              key={p.path}
              href={p.path}
              className={`flex flex-col items-center gap-0.5 py-2 no-underline ${
                active ? "text-primary" : "text-ink-secondary"
              }`}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="text-[10.5px] font-medium">{p.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
