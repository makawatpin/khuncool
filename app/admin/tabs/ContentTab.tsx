"use client";

import Link from "next/link";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, LoadingCard } from "./ErrorCard";

interface Post {
  slug: string;
  href: string;
}

export default function ContentTab() {
  const state = useAdminFetch<{ posts: Post[] }>("/api/admin/content");

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4">
      <p className="text-xs text-ink-muted mb-3">
        รายการโพสต์ (ไม่มีข้อมูลยอดวิว — ยังไม่มี analytics ผูกอยู่)
      </p>
      <ul className="space-y-2">
        {state.data.posts.map((p) => (
          <li key={p.slug}>
            <Link href={p.href} className="text-primary hover:underline text-sm">
              {p.href}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
