"use client";

import { useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

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
      <div className="flex gap-2 mb-4">
        {([7, 30, 90] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              days === d ? "bg-primary text-white" : "bg-surface-panel text-ink-muted"
            }`}
          >
            {d} วัน
          </button>
        ))}
      </div>
      {state.status === "loading" && <LoadingCard />}
      {state.status === "error" && <ErrorCard message={state.error} />}
      {state.status === "ok" && (
        <div className="rounded-xl border border-border bg-surface-card p-4 space-y-3">
          {state.data.tools.length === 0 && (
            <p className="text-sm text-ink-muted">ยังไม่มีข้อมูลการใช้งานในช่วงนี้</p>
          )}
          {state.data.tools.map((t) => {
            const max = Math.max(...state.data.tools.map((r) => r.total), 1);
            return (
              <div key={t.tool}>
                <div className="flex justify-between text-xs text-ink-muted mb-1">
                  <span>{t.tool}</span>
                  <span>
                    {t.total} (guest {t.guest} / signed-in {t.signedIn})
                  </span>
                </div>
                <div className="h-2 bg-surface-panel rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
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
