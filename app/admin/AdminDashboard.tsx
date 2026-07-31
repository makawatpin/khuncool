"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import OverviewTab from "./tabs/OverviewTab";
import UsersTab from "./tabs/UsersTab";
import ToolsTab from "./tabs/ToolsTab";
import ContentTab from "./tabs/ContentTab";
import SystemTab from "./tabs/SystemTab";

const TABS = [
  { key: "overview", label: "ภาพรวม" },
  { key: "users", label: "ผู้ใช้" },
  { key: "tools", label: "เครื่องมือ" },
  { key: "content", label: "เนื้อหา" },
  { key: "system", label: "ระบบ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminDashboard() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    // Client-side UX gate only — the real check happens per-request in
    // /api/admin/* route handlers via requireAdmin().
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <main className="flex-1 w-full max-w-[1160px] mx-auto px-6 py-9" />;
  }

  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto px-6 py-9 pb-16">
      <h1 className="text-2xl font-bold text-ink mb-6">Admin Dashboard</h1>
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "tools" && <ToolsTab />}
      {tab === "content" && <ContentTab />}
      {tab === "system" && <SystemTab />}
    </main>
  );
}
