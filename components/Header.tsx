"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccountSheet } from "./AccountSheet";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ALL_ARTICLES } from "@/app/articles/data";
import { APPS, TOOLS } from "@/app/tools/data";

const LATEST_ARTICLES = [...ALL_ARTICLES]
  .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
  .slice(0, 6);

function ArticleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="3" width="13" height="12" rx="1.5" />
      <line x1="5" y1="6.5" x2="13" y2="6.5" />
      <line x1="5" y1="9.5" x2="13" y2="9.5" />
      <line x1="5" y1="12.5" x2="10" y2="12.5" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4.5a3 3 0 0 0-3.9 3.9l-5.1 5.1a1.4 1.4 0 0 0 2 2l5.1-5.1a3 3 0 0 0 3.9-3.9l-2 2-1.8-.4-.4-1.8 2-2Z" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h10l-.8 7.2a1.5 1.5 0 0 1-1.5 1.3H6.3a1.5 1.5 0 0 1-1.5-1.3L4 6Z" />
      <path d="M6.5 6V4.5a2.5 2.5 0 0 1 5 0V6" />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="2.5" width="9" height="13" rx="1.8" />
      <line x1="8" y1="12.7" x2="10" y2="12.7" />
    </svg>
  );
}

const PILLARS = [
  {
    Icon: ArticleIcon,
    title: "บทความ",
    path: "/articles",
    desc: "ข่าวครู รีวิวสินค้า ข่าวอบรมได้เกียรติบัตร และวิธีทำสื่อการสอน",
  },
  {
    Icon: ToolsIcon,
    title: "สื่อการสอนออนไลน์",
    path: "/tools",
    desc: "เกมและเครื่องมือ interactive ที่ใช้ผ่านเว็บได้เลย ไม่ต้องติดตั้ง",
  },
  {
    Icon: ShopIcon,
    title: "แนะนำสินค้า",
    path: "/shop",
    desc: "คัดของใช้ในห้องเรียนพร้อมลิงก์ซื้อ (Affiliate) จากครูจริง",
  },
  {
    Icon: AppsIcon,
    title: "แอป",
    path: "/apps",
    desc: "แอปช่วยงานครูใช้ผ่านเว็บ เช่น เช็กชื่อ ออมเงิน จัดกลุ่ม",
  },
];

const NAV_LINKS = PILLARS.map((p) => ({ title: p.title, href: p.path }));

const SUBMENUS: Record<string, { title: string; href: string }[]> = {
  "/tools": TOOLS.map((t) => ({ title: t.title, href: t.href })),
  "/apps": APPS.map((a) => ({ title: a.title, href: a.href })),
};

export default function Header() {
  const { openAccountSheet } = useAccountSheet();
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const closeSidebar = () => setSidebarOpen(false);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || "";
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();

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
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="เมนู"
            aria-expanded={sidebarOpen}
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-card-sm border border-border bg-surface-card hover:bg-surface-light md:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="2" y1="4.5" x2="16" y2="4.5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13.5" x2="16" y2="13.5" />
            </svg>
          </button>
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
            <Link
              href="/account"
              aria-label="บัญชีของฉัน"
              title={user.email ?? "บัญชีของฉัน"}
              className="hidden h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white no-underline hover:opacity-90 md:flex"
            >
              {initial}
            </Link>
          ) : (
            <button
              type="button"
              onClick={openAccountSheet}
              className="hidden rounded-pill bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-primary-hover md:block"
            >
              สมัคร
            </button>
          )}
        </div>
      </header>

      {/* mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={closeSidebar}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-[78%] max-w-[300px] flex-col bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
              <Image
                src="/assets/khuncool-logo.png"
                alt="khuncool"
                width={26}
                height={26}
                className="flex-none object-contain"
              />
              <span className="font-anuphan text-[15px] font-bold tracking-tight">
                khuncool
              </span>
              <button
                type="button"
                onClick={closeSidebar}
                aria-label="ปิดเมนู"
                className="ml-auto flex h-8 w-8 items-center justify-center text-ink-secondary"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="4" y1="4" x2="14" y2="14" />
                  <line x1="14" y1="4" x2="4" y2="14" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {PILLARS.map((p) => {
                const submenu = SUBMENUS[p.path];
                if (submenu) {
                  const expanded = expandedPath === p.path;
                  return (
                    <div key={p.path}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPath((cur) => (cur === p.path ? null : p.path))
                        }
                        aria-expanded={expanded}
                        className={`flex w-full items-center gap-2.5 px-4 py-3 text-left ${
                          expanded ? "bg-surface-light text-primary" : "text-ink"
                        }`}
                      >
                        <p.Icon />
                        <span className="text-sm font-semibold">{p.title}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`ml-auto flex-none transition-transform ${expanded ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        >
                          <polyline points="3.5,5 7,8.5 10.5,5" />
                        </svg>
                      </button>
                      {expanded && (
                        <div className="flex flex-col pb-1.5">
                          {submenu.map((s) => (
                            <Link
                              key={s.href}
                              href={s.href}
                              onClick={closeSidebar}
                              className="py-2 pl-11 pr-4 text-[13px] text-ink-secondary no-underline"
                            >
                              {s.title}
                            </Link>
                          ))}
                          <Link
                            href={p.path}
                            onClick={closeSidebar}
                            className="py-2 pl-11 pr-4 text-[13px] font-semibold text-primary no-underline"
                          >
                            ดูทั้งหมด ›
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={p.path}
                    href={p.path}
                    onClick={closeSidebar}
                    className="flex items-center gap-2.5 px-4 py-3 text-ink no-underline"
                  >
                    <p.Icon />
                    <span className="text-sm font-semibold">{p.title}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border p-3">
              {user ? (
                <Link
                  href="/account"
                  onClick={closeSidebar}
                  className="flex w-full items-center gap-2.5 rounded-card-sm p-2 text-left no-underline hover:bg-surface-light"
                >
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[13px] font-bold text-white">
                    {initial}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                    {displayName}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeSidebar();
                    openAccountSheet();
                  }}
                  className="w-full rounded-pill bg-primary py-2.5 text-[13px] font-semibold text-white hover:bg-primary-hover"
                >
                  เข้าสู่ระบบ / สมัครสมาชิก
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
