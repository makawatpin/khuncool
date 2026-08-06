"use client";

import { useMemo, useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, TableSkeleton } from "./ErrorCard";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  school: string;
  createdAt: string;
  lastSignInAt: string | null;
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="5" />
      <line x1="11.8" y1="11.8" x2="15.5" y2="15.5" />
    </svg>
  );
}

function initialOf(user: AdminUser) {
  const source = user.fullName || user.email || "?";
  return source.trim().charAt(0).toUpperCase();
}

export default function UsersTab() {
  const state = useAdminFetch<{ users: AdminUser[] }>("/api/admin/users");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (state.status !== "ok") return [];
    const q = query.trim().toLowerCase();
    if (!q) return state.data.users;
    return state.data.users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.school.toLowerCase().includes(q)
    );
  }, [state, query]);

  if (state.status === "loading") return <TableSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <SearchIcon />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาอีเมล ชื่อ หรือโรงเรียน"
          aria-label="ค้นหาอีเมล ชื่อ หรือโรงเรียน"
          className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="max-h-[520px] overflow-auto rounded-[--radius-card] border border-border bg-surface-card">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-card">
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="p-3">อีเมล</th>
              <th className="p-3">ชื่อ</th>
              <th className="p-3">โรงเรียน</th>
              <th className="p-3">สมัครเมื่อ</th>
              <th className="p-3">ล็อกอินล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-panel">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                      {initialOf(u)}
                    </span>
                    {u.email}
                  </div>
                </td>
                <td className="p-3">{u.fullName || "-"}</td>
                <td className="p-3">{u.school || "-"}</td>
                <td className="p-3">{u.createdAt.slice(0, 10)}</td>
                <td className="p-3">{u.lastSignInAt?.slice(0, 10) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
