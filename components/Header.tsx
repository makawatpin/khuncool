"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAccountSheet } from "./AccountSheet";
import { useAuth } from "@/lib/auth/AuthProvider";

const PILLARS = [
  {
    icon: "🛠️",
    title: "เครื่องมือออนไลน์",
    path: "/tools",
    desc: "เกมและเครื่องมือ interactive ที่ใช้ผ่านเว็บได้เลย ไม่ต้องติดตั้ง",
  },
  {
    icon: "📱",
    title: "แอปช่วยงานครู",
    path: "/apps",
    desc: "แอปช่วยงานครูใช้ผ่านเว็บ เช่น เช็กชื่อ ออมเงิน จัดกลุ่ม",
  },
  {
    icon: "📰",
    title: "บทความครู",
    path: "/articles",
    desc: "ข่าวครู รีวิวสินค้า ข่าวอบรมได้เกียรติบัตร และวิธีทำสื่อการสอน",
  },
  {
    icon: "🛍️",
    title: "ร้านค้าแนะนำ",
    path: "/shop",
    desc: "คัดของใช้ในห้องเรียนพร้อมลิงก์ซื้อ (Affiliate) จากครูจริง",
  },
];

const NAV_LINKS = [
  { title: "เครื่องมือ", href: "/tools" },
  { title: "แอป", href: "/apps" },
  { title: "บทความ", href: "/articles" },
  { title: "ร้านค้า", href: "/shop" },
];

export default function Header() {
  const { openAccountSheet } = useAccountSheet();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          <span className="flex-none rounded-md bg-white/20 px-1.5 py-0.5 text-[10.5px] font-semibold">
            อบรมฟรี
          </span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            อบรมออนไลน์ได้เกียรติบัตร 20 ชม. · สมัครวันนี้
          </span>
          <span className="flex-none opacity-70">›</span>
        </div>
      </div>

      {/* sticky header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/[.92] px-3.5 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="เมนู"
            aria-expanded={drawerOpen}
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-card-sm border border-border bg-surface-card text-base hover:bg-surface-light md:hidden"
          >
            ☰
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

      {/* mobile nav drawer */}
      {drawerOpen && (
        <div className="flex flex-col gap-1.5 border-b border-border bg-surface-light p-3.5 md:hidden">
          {PILLARS.map((p) => (
            <Link
              key={p.path}
              href={p.path}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2.5 rounded-card-sm border border-border bg-surface-card p-2.5 no-underline hover:border-primary/40"
            >
              <span className="text-lg">{p.icon}</span>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold text-ink">
                  {p.title}
                </div>
                <div className="text-[11px] text-ink-faint">{p.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
