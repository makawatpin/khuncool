"use client";

import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, StatGridSkeleton } from "./ErrorCard";

interface OverviewData {
  totalUsers: number;
  activeLast7Days: number;
  signupsToday: number;
  topTool: string | null;
  signupsByDay: Record<string, number>;
}

export default function OverviewTab() {
  const state = useAdminFetch<OverviewData>("/api/admin/overview");

  if (state.status === "loading") return <StatGridSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  const { totalUsers, activeLast7Days, signupsToday, topTool, signupsByDay } = state.data;
  const days = Object.keys(signupsByDay).sort();
  const max = Math.max(1, ...Object.values(signupsByDay));
  const peakDay = days.reduce(
    (best, day) => (signupsByDay[day] > (signupsByDay[best] ?? -1) ? day : best),
    days[0]
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard label="สมาชิกทั้งหมด" value={totalUsers} />
        <StatCard label="Active 7 วัน" value={activeLast7Days} />
        <StatCard label="สมัครวันนี้" value={`+${signupsToday}`} accent />
        <StatCard label="เครื่องมือยอดนิยม (7 วัน)" value={topTool ?? "-"} />
      </div>
      <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 shadow-[0_4px_14px_-8px_rgba(26,29,38,0.15)]">
        <h3 className="font-anuphan mb-3 text-sm font-bold text-ink">
          สมัครใหม่ 30 วันล่าสุด
        </h3>
        <div className="flex h-32 items-end gap-1">
          {days.map((day) => (
            <div
              key={day}
              title={`${day}: ${signupsByDay[day]}`}
              className={`flex-1 rounded-t bg-gradient-to-t ${
                day === peakDay
                  ? "from-accent/60 to-accent"
                  : "from-primary/40 to-primary/80"
              }`}
              style={{ height: `${(signupsByDay[day] / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  if (accent) {
    return (
      <div className="rounded-[--radius-card] bg-brand p-4 shadow-cta">
        <p className="mb-1 text-xs text-white/80">{label}</p>
        <p className="font-anuphan text-2xl font-extrabold text-white">{value}</p>
      </div>
    );
  }
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 shadow-[0_4px_14px_-8px_rgba(26,29,38,0.15)]">
      <p className="mb-1 text-xs text-ink-muted">{label}</p>
      <p className="font-anuphan text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
