"use client";

import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

interface OverviewData {
  totalUsers: number;
  activeLast7Days: number;
  signupsToday: number;
  topTool: string | null;
  signupsByDay: Record<string, number>;
}

export default function OverviewTab() {
  const state = useAdminFetch<OverviewData>("/api/admin/overview");

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  const { totalUsers, activeLast7Days, signupsToday, topTool, signupsByDay } = state.data;
  const days = Object.keys(signupsByDay).sort();
  const max = Math.max(1, ...Object.values(signupsByDay));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="สมาชิกทั้งหมด" value={totalUsers} />
        <StatCard label="Active 7 วัน" value={activeLast7Days} />
        <StatCard label="สมัครวันนี้" value={`+${signupsToday}`} />
        <StatCard label="เครื่องมือยอดนิยม (7 วัน)" value={topTool ?? "-"} />
      </div>
      <div className="rounded-xl border border-border bg-surface-card p-4">
        <h3 className="text-sm font-semibold text-ink mb-3">สมัครใหม่ 30 วันล่าสุด</h3>
        <div className="flex items-end gap-1 h-32">
          {days.map((day) => (
            <div
              key={day}
              title={`${day}: ${signupsByDay[day]}`}
              className="flex-1 bg-primary/70 rounded-t"
              style={{ height: `${(signupsByDay[day] / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <p className="text-xs text-ink-muted mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
