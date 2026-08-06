function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4.5h7.5V12M13.5 4.5 4.5 13.5" />
    </svg>
  );
}

const LINKS = [
  {
    href: "https://supabase.com/dashboard/project/segfdmnxbdctntvsdprq",
    title: "Supabase project dashboard",
    desc: "ฐานข้อมูล, auth, และ storage",
    color: "#0a9380",
  },
  {
    href: "https://vercel.com/dashboard",
    title: "Vercel deployments",
    desc: "การ deploy และ build logs",
    color: "#5c5ee6",
  },
];

export default function SystemTab() {
  return (
    <div className="space-y-2.5">
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-[--radius-card] border border-border bg-surface-card p-4 no-underline shadow-[0_2px_8px_-6px_rgba(26,29,38,0.15)] transition-shadow hover:shadow-[0_8px_20px_-10px_rgba(26,29,38,0.3)]"
        >
          <span
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-white"
            style={{ background: l.color }}
          >
            <ArrowIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-anuphan text-sm font-bold text-ink">
              {l.title}
            </span>
            <span className="block text-xs text-ink-muted">{l.desc}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
