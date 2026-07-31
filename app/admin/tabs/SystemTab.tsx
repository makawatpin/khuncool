export default function SystemTab() {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 space-y-3">
      <a
        href="https://supabase.com/dashboard/project/segfdmnxbdctntvsdprq"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-primary hover:underline text-sm"
      >
        Supabase project dashboard ↗
      </a>
      <a
        href="https://vercel.com/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-primary hover:underline text-sm"
      >
        Vercel deployments ↗
      </a>
    </div>
  );
}
