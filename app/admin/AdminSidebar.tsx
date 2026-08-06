"use client";

import Link from "next/link";
import { TABS, type TabKey } from "./tabsConfig";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.5 4 3 9l4.5 5M3.5 9h11.5" />
    </svg>
  );
}

function SidebarContent({
  activeTab,
  onSelect,
}: {
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
}) {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="flex items-center gap-2 px-2 pb-5 pt-1">
        <div className="h-7 w-7 flex-none rounded-[9px] bg-brand" />
        <div className="leading-tight">
          <div className="font-anuphan text-[13px] font-extrabold tracking-tight text-white">
            khuncool
          </div>
          <div className="text-[10px] text-white/45">Admin</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {TABS.map((t) => {
          const active = t.key === activeTab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect(t.key)}
              className={`flex items-center gap-2.5 rounded-[9px] border-l-[3px] px-2.5 py-2 text-left text-[12.5px] font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary/15 text-white"
                  : "border-transparent text-white/55 hover:bg-white/5 hover:text-white/85"
              }`}
            >
              <t.Icon />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-3.5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] text-white/45 no-underline hover:text-white/75"
        >
          <BackIcon />
          กลับสู่เว็บไซต์
        </Link>
      </div>
    </div>
  );
}

export default function AdminSidebar({
  activeTab,
  onSelect,
  mobileOpen,
  onCloseMobile,
}: {
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <aside className="hidden w-[216px] flex-none bg-[#14161f] md:block">
        <SidebarContent activeTab={activeTab} onSelect={onSelect} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-[216px] bg-[#14161f] shadow-2xl">
            <SidebarContent
              activeTab={activeTab}
              onSelect={(key) => {
                onSelect(key);
                onCloseMobile();
              }}
            />
          </aside>
        </div>
      )}
    </>
  );
}
