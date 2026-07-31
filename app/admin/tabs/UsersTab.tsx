"use client";

import { useMemo, useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  school: string;
  createdAt: string;
  lastSignInAt: string | null;
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

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาอีเมล ชื่อ หรือโรงเรียน"
        className="w-full max-w-sm mb-4 rounded-lg border border-border px-3 py-2 text-sm"
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted border-b border-border">
              <th className="p-3">อีเมล</th>
              <th className="p-3">ชื่อ</th>
              <th className="p-3">โรงเรียน</th>
              <th className="p-3">สมัครเมื่อ</th>
              <th className="p-3">ล็อกอินล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-3">{u.email}</td>
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
