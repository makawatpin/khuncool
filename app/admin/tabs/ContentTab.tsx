"use client";

import Link from "next/link";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, ListSkeleton } from "./ErrorCard";

interface Post {
  slug: string;
  href: string;
  views: number;
}

function DocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="2.5" width="11" height="13" rx="1.3" />
      <line x1="6" y1="6.5" x2="12" y2="6.5" />
      <line x1="6" y1="9.5" x2="12" y2="9.5" />
      <line x1="6" y1="12.5" x2="9.5" y2="12.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4.5h7.5V12M13.5 4.5 4.5 13.5" />
    </svg>
  );
}

export default function ContentTab() {
  const state = useAdminFetch<{ posts: Post[] }>("/api/admin/content");

  if (state.status === "loading") return <ListSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-2">
      <p className="px-2 pb-2 pt-1 text-xs text-ink-muted">
        รายการโพสต์ เรียงตามยอดวิว
      </p>
      <ul>
        {state.data.posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={p.href}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-ink no-underline hover:bg-surface-panel"
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
                <DocIcon />
              </span>
              <span className="min-w-0 flex-1 truncate">{p.href}</span>
              <span className="flex-none whitespace-nowrap text-xs text-ink-muted">
                {p.views.toLocaleString("th-TH")} วิว
              </span>
              <span className="flex-none text-ink-faint">
                <ArrowIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
