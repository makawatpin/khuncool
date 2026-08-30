"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import AdminSidebar from "./AdminSidebar";
import { TABS, type TabKey } from "./tabsConfig";
import OverviewTab from "./tabs/OverviewTab";
import UsersTab from "./tabs/UsersTab";
import ToolsTab from "./tabs/ToolsTab";
import ContentTab from "./tabs/ContentTab";
import CalendarTab from "./tabs/CalendarTab";
import SystemTab from "./tabs/SystemTab";

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="2.5" y1="4.5" x2="15.5" y2="4.5" />
      <line x1="2.5" y1="9" x2="15.5" y2="9" />
      <line x1="2.5" y1="13.5" x2="15.5" y2="13.5" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    // Client-side UX gate only — the real check happens per-request in
    // /api/admin/* route handlers via requireAdmin().
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="min-h-screen w-full bg-surface-app" />;
  }

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className="flex min-h-screen w-full bg-surface-app">
      <AdminSidebar
        activeTab={tab}
        onSelect={setTab}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-border bg-surface-card px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="เปิดเมนู"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-border text-ink"
          >
            <MenuIcon />
          </button>
          <span className="font-anuphan text-sm font-bold text-ink">
            {activeTab.label}
          </span>
        </div>

        <main className="mx-auto w-full max-w-[1160px] px-6 py-8 pb-16">
          <div className="mb-6 hidden md:block">
            <h1 className="font-anuphan text-xl font-extrabold tracking-tight text-ink">
              {activeTab.label}
            </h1>
            <p className="text-sm text-ink-muted">{activeTab.description}</p>
          </div>

          {tab === "overview" && <OverviewTab />}
          {tab === "users" && <UsersTab />}
          {tab === "tools" && <ToolsTab />}
          {tab === "content" && <ContentTab />}
          {tab === "calendar" && <CalendarTab />}
          {tab === "system" && <SystemTab />}
        </main>
      </div>
    </div>
  );
}
