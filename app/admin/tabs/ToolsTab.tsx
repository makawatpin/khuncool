"use client";

import { useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, BarsSkeleton } from "./ErrorCard";

interface ToolRow {
  tool: string;
  total: number;
  guest: number;
  signedIn: number;
}

export default function ToolsTab() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const state = useAdminFetch<{ days: number; tools: ToolRow[] }>(
    `/api/admin/tools?days=${days}`
  );

  return (
    <div>
      <div className="mb-4 flex gap-1.5 rounded-full bg-surface-panel p-1 w-fit">
        {([7, 30, 90] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              days === d
                ? "bg-primary text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {d} วัน
          </button>
        ))}
      </div>
      {state.status === "loading" && <BarsSkeleton />}
      {state.status === "error" && <ErrorCard message={state.error} />}
      {state.status === "ok" && (
        <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 space-y-3">
          {state.data.tools.length === 0 && (
            <p className="text-sm text-ink-muted">ยังไม่มีข้อมูลการใช้งานในช่วงนี้</p>
          )}
          {state.data.tools.map((t) => {
            const max = Math.max(...state.data.tools.map((r) => r.total), 1);
            return (
              <div key={t.tool}>
                <div className="mb-1 flex justify-between text-xs text-ink-muted">
                  <span className="font-medium text-ink">{t.tool}</span>
                  <span>
                    {t.total} (guest {t.guest} / signed-in {t.signedIn})
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-panel">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${(t.total / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
