"use client";

import { useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { adminRequest } from "../adminRequest";
import { ErrorCard, ListSkeleton } from "./ErrorCard";
import type { SupportMessageStatus } from "@/lib/support/moderation";

interface SupportMessage {
  id: number;
  name: string | null;
  message: string;
  status: SupportMessageStatus;
  created_at: string;
}

const FILTERS: { key: SupportMessageStatus; label: string }[] = [
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "hidden", label: "ซ่อนไว้" },
];

const BTN =
  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50";

export default function SupportTab() {
  const [status, setStatus] = useState<SupportMessageStatus>("pending");
  const state = useAdminFetch<{ messages: SupportMessage[] }>(
    `/api/admin/support?status=${status}`,
  );

  return (
    <div className="space-y-4">
      <div role="tablist" className="inline-flex gap-1 rounded-lg border border-border bg-surface-card p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={status === f.key}
            onClick={() => setStatus(f.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              status === f.key ? "bg-primary text-white" : "text-ink-secondary hover:bg-surface-panel"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {state.status === "loading" && <ListSkeleton />}
      {state.status === "error" && <ErrorCard message={state.error} />}
      {state.status === "ok" &&
        (state.data.messages.length === 0 ? (
          <p className="rounded-[--radius-card] border border-border bg-surface-card p-4 text-sm text-ink-muted">
            ยังไม่มีข้อความ
          </p>
        ) : (
          <ul className="space-y-3">
            {state.data.messages.map((m) => (
              <MessageCard key={m.id} message={m} onChanged={state.refresh} />
            ))}
          </ul>
        ))}
    </div>
  );
}

function MessageCard({
  message: m,
  onChanged,
}: {
  message: SupportMessage;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    try {
      await action();
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ไม่สำเร็จ");
      setBusy(false);
    }
  };

  const setStatus = (status: SupportMessageStatus) =>
    run(() => adminRequest("/api/admin/support", { method: "PATCH", body: { id: m.id, status } }));

  const remove = () => {
    if (!window.confirm("ลบข้อความนี้ถาวร กู้คืนไม่ได้")) return;
    run(() => adminRequest(`/api/admin/support?id=${m.id}`, { method: "DELETE" }));
  };

  return (
    <li className="rounded-[--radius-card] border border-border bg-surface-card p-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{m.name ?? "ไม่ประสงค์ออกนาม"}</span>
        <span className="text-xs text-ink-muted">
          {new Date(m.created_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>
      <p className="m-0 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-secondary">
        {m.message}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {m.status !== "approved" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setStatus("approved")}
            className={`${BTN} border-primary bg-primary text-white hover:bg-primary-hover`}
          >
            อนุมัติ
          </button>
        )}
        {m.status !== "hidden" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setStatus("hidden")}
            className={`${BTN} border-border text-ink hover:bg-surface-panel`}
          >
            ซ่อน
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className={`${BTN} border-error-border text-error hover:bg-error-bg`}
        >
          ลบถาวร
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-error">ไม่สำเร็จ: {err}</p>}
    </li>
  );
}
