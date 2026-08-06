function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 2.5 16 15H2L9 2.5Z" />
      <line x1="9" y1="7" x2="9" y2="10.5" />
      <circle cx="9" cy="12.7" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[--radius-card] border border-error-border bg-error-bg p-4 text-sm text-error">
      <span className="mt-0.5 flex-none text-error-strong">
        <WarningIcon />
      </span>
      <span>โหลดไม่สำเร็จ: {message}</span>
    </div>
  );
}

/** Kept for tabs that don't have a shaped skeleton yet. */
export function LoadingCard() {
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 text-sm text-ink-muted">
      กำลังโหลด...
    </div>
  );
}

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-panel ${className}`}
    />
  );
}

export function StatGridSkeleton() {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[--radius-card] border border-border bg-surface-card p-4"
          >
            <Shimmer className="mb-3 h-3 w-2/3" />
            <Shimmer className="h-6 w-1/2" />
          </div>
        ))}
      </div>
      <div className="rounded-[--radius-card] border border-border bg-surface-card p-4">
        <Shimmer className="mb-3 h-3 w-1/3" />
        <Shimmer className="h-32 w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div>
      <Shimmer className="mb-4 h-9 w-full max-w-sm" />
      <div className="overflow-hidden rounded-[--radius-card] border border-border bg-surface-card p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="mb-2 h-6 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}

export function BarsSkeleton() {
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <Shimmer className="mb-1 h-3 w-1/4" />
          <Shimmer className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="rounded-[--radius-card] border border-border bg-surface-card p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Shimmer key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}
