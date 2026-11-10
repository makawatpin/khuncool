"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, StatGridSkeleton } from "./ErrorCard";
import type { LiveStats } from "@/lib/admin/liveStats";

interface OverviewData {
  totalUsers: number;
  activeLast7Days: number;
  signupsToday: number;
  topTool: string | null;
  signupsByDay: Record<string, number>;
}

const LIVE_REFRESH_MS = 15_000;
const OVERVIEW_REFRESH_MS = 60_000;

const CARD =
  "rounded-[--radius-card] border border-border bg-surface-card p-4 shadow-[0_4px_14px_-8px_rgba(26,29,38,0.15)]";

export default function OverviewTab() {
  const overview = useAdminFetch<OverviewData>("/api/admin/overview", {
    refreshMs: OVERVIEW_REFRESH_MS,
  });
  const live = useAdminFetch<LiveStats>("/api/admin/live", { refreshMs: LIVE_REFRESH_MS });
  const now = useNow(5_000);

  const refreshAll = () => {
    overview.refresh();
    live.refresh();
  };

  return (
    <div className="space-y-6">
      <LiveBar
        updatedAt={live.updatedAt}
        refreshing={live.refreshing || overview.refreshing}
        now={now}
        onRefresh={refreshAll}
      />

      {live.status === "error" && <ErrorCard message={live.error} />}
      {live.status === "loading" && <LiveSkeleton />}
      {live.status === "ok" && <LiveSection data={live.data} now={now} />}

      {overview.status === "error" && <ErrorCard message={overview.error} />}
      {overview.status === "loading" && <StatGridSkeleton />}
      {overview.status === "ok" && <OverviewSection data={overview.data} />}
    </div>
  );
}

/* ---------- live ---------- */

function LiveBar({
  updatedAt,
  refreshing,
  now,
  onRefresh,
}: {
  updatedAt: Date | null;
  refreshing: boolean;
  now: number;
  onRefresh: () => void;
}) {
  const stale = updatedAt ? now - updatedAt.getTime() > LIVE_REFRESH_MS * 3 : false;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <span className="relative flex h-2.5 w-2.5">
          {!stale && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              stale ? "bg-warning" : "bg-success"
            }`}
          />
        </span>
        <span className="font-semibold text-ink">{stale ? "ขาดการเชื่อมต่อ" : "เรียลไทม์"}</span>
        <span>
          · อัปเดตอัตโนมัติทุก {LIVE_REFRESH_MS / 1000} วินาที
          {updatedAt && <> · ล่าสุด {timeAgo(updatedAt.toISOString(), now)}</>}
        </span>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        <RefreshIcon spinning={refreshing} />
        รีเฟรช
      </button>
    </div>
  );
}

function LiveSection({ data, now }: { data: LiveStats; now: number }) {
  const diff = data.eventsToday - data.eventsYesterdaySoFar;
  const pct =
    data.eventsYesterdaySoFar > 0 ? Math.round((diff / data.eventsYesterdaySoFar) * 100) : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label={`ใช้งานใน ${data.windowMinutes} นาทีล่าสุด`}
          value={data.eventsInWindow}
          hint={`สมาชิก ${data.signedInNow} คน · guest ${data.guestEventsInWindow} ครั้ง`}
          accent
        />
        <StatCard
          label="การใช้งานวันนี้"
          value={data.eventsToday}
          hint={
            <span className={diff >= 0 ? "text-success" : "text-error"}>
              {diff >= 0 ? "▲" : "▼"} {Math.abs(diff)}
              {pct !== null && ` (${pct > 0 ? "+" : ""}${pct}%)`} เทียบเมื่อวานเวลาเดียวกัน
            </span>
          }
        />
        <StatCard label="เมื่อวานถึงเวลานี้" value={data.eventsYesterdaySoFar} />
        <StatCard label="เมื่อวานทั้งวัน" value={sum(data.hourlyYesterday)} />
      </div>

      <HourlyChart today={data.hourlyToday} yesterday={data.hourlyYesterday} now={now} />

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className={CARD}>
          <h3 className="font-anuphan mb-3 text-sm font-bold text-ink">กิจกรรมล่าสุด</h3>
          {data.recentEvents.length === 0 ? (
            <p className="text-sm text-ink-muted">ยังไม่มีการใช้งานตั้งแต่เมื่อวาน</p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {data.recentEvents.map((e, i) => (
                <li key={`${e.created_at}-${i}`} className="flex items-center gap-3 py-2 text-sm">
                  <span
                    className={`h-2 w-2 flex-none rounded-full ${
                      e.who ? "bg-primary" : "bg-ink-faint"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-ink">{e.tool}</span>
                    {e.event !== "use" && (
                      <span className="ml-1 text-xs text-ink-muted">({e.event})</span>
                    )}
                    <span className="block truncate text-xs text-ink-muted">
                      {e.who ?? "guest"}
                    </span>
                  </span>
                  <time
                    className="flex-none text-xs text-ink-muted"
                    dateTime={e.created_at}
                    title={formatThai(e.created_at)}
                  >
                    {timeAgo(e.created_at, now)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={CARD}>
          <h3 className="font-anuphan mb-3 text-sm font-bold text-ink">สมัครล่าสุด</h3>
          <ul className="divide-y divide-border">
            {data.recentSignups.map((u, i) => (
              <li key={`${u.created_at}-${i}`} className="flex items-center gap-3 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{u.email ?? "-"}</span>
                  <span className="text-xs text-ink-muted">{u.provider ?? "-"}</span>
                </span>
                <time
                  className="flex-none text-xs text-ink-muted"
                  dateTime={u.created_at}
                  title={formatThai(u.created_at)}
                >
                  {timeAgo(u.created_at, now)}
                </time>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function HourlyChart({
  today,
  yesterday,
  now,
}: {
  today: number[];
  yesterday: number[];
  now: number;
}) {
  const max = Math.max(1, ...today, ...yesterday);
  const currentHour = Number(
    new Date(now).toLocaleString("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      hour12: false,
    }),
  ) % 24;

  return (
    <div className={CARD}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-anuphan text-sm font-bold text-ink">การใช้งานรายชั่วโมง</h3>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-primary" /> วันนี้
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-ink-faint/40" /> เมื่อวาน
          </span>
        </div>
      </div>
      <div className="flex h-36 items-end gap-[3px]">
        {today.map((count, hour) => (
          <div
            key={hour}
            className="flex h-full flex-1 items-end gap-px"
            title={`${pad(hour)}:00 — วันนี้ ${count} · เมื่อวาน ${yesterday[hour]}`}
          >
            <div
              className="w-2/5 rounded-t bg-ink-faint/40"
              style={{ height: `${(yesterday[hour] / max) * 100}%` }}
            />
            <div
              className={`w-3/5 rounded-t ${
                hour === currentHour
                  ? "bg-gradient-to-t from-accent/70 to-accent"
                  : hour > currentHour
                    ? "bg-transparent"
                    : "bg-gradient-to-t from-primary/50 to-primary"
              }`}
              style={{ height: `${(count / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex text-[10px] text-ink-muted">
        {today.map((_, hour) => (
          <span key={hour} className="flex-1 text-center">
            {hour % 3 === 0 ? pad(hour) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- overview (slower-moving totals) ---------- */

function OverviewSection({ data }: { data: OverviewData }) {
  const { totalUsers, activeLast7Days, signupsToday, topTool, signupsByDay } = data;
  const days = Object.keys(signupsByDay).sort();
  const max = Math.max(1, ...Object.values(signupsByDay));
  const total30 = sum(Object.values(signupsByDay));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="สมาชิกทั้งหมด" value={totalUsers} />
        <StatCard
          label="Active 7 วัน"
          value={activeLast7Days}
          hint={totalUsers ? `${Math.round((activeLast7Days / totalUsers) * 100)}% ของสมาชิก` : undefined}
        />
        <StatCard label="สมัครวันนี้" value={`+${signupsToday}`} />
        <StatCard label="เครื่องมือยอดนิยม (7 วัน)" value={topTool ?? "-"} />
      </div>
      <div className={CARD}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-anuphan text-sm font-bold text-ink">สมัครใหม่ 30 วันล่าสุด</h3>
          <span className="text-xs text-ink-muted">รวม {total30} คน</span>
        </div>
        <div className="flex h-32 items-end gap-1">
          {days.map((day, i) => {
            const count = signupsByDay[day];
            const isToday = i === days.length - 1;
            return (
              <div
                key={day}
                title={`${formatDay(day)}: ${count} คน`}
                className="flex h-full flex-1 items-end"
              >
                <div
                  className={`w-full rounded-t ${
                    count === 0
                      ? "bg-surface-panel"
                      : isToday
                        ? "bg-gradient-to-t from-accent/60 to-accent"
                        : "bg-gradient-to-t from-primary/40 to-primary/80"
                  }`}
                  style={{ height: count === 0 ? "3px" : `${(count / max) * 100}%` }}
                />
              </div>
            );
          })}
        </div>
        {days.length > 0 && (
          <div className="mt-1 flex justify-between text-[10px] text-ink-muted">
            <span>{formatDay(days[0])}</span>
            <span>{formatDay(days[Math.floor(days.length / 2)])}</span>
            <span>วันนี้</span>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- bits ---------- */

function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: ReactNode;
  accent?: boolean;
}) {
  if (accent) {
    return (
      <div className="rounded-[--radius-card] bg-brand p-4 shadow-cta">
        <p className="mb-1 text-xs text-white/80">{label}</p>
        <p className="font-anuphan text-2xl font-extrabold text-white">{value}</p>
        {hint && <p className="mt-1 text-[11px] text-white/80">{hint}</p>}
      </div>
    );
  }
  return (
    <div className={CARD}>
      <p className="mb-1 text-xs text-ink-muted">{label}</p>
      <p className="font-anuphan truncate text-2xl font-extrabold text-ink">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function LiveSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={CARD}>
          <div className="mb-3 h-3 w-2/3 animate-pulse rounded-md bg-surface-panel" />
          <div className="h-6 w-1/2 animate-pulse rounded-md bg-surface-panel" />
        </div>
      ))}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={spinning ? "animate-spin" : undefined}
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M13.5 2.5v3h-3" />
    </svg>
  );
}

/** Re-renders every `ms` so relative times ("2 นาทีที่แล้ว") keep moving. */
function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function timeAgo(iso: string, now: number): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 10) return "เมื่อสักครู่";
  if (s < 60) return `${s} วินาทีที่แล้ว`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

function formatThai(iso: string): string {
  return new Date(iso).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDay(day: string): string {
  return new Date(`${day}T12:00:00+07:00`).toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
  });
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}
