export function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-error-border bg-error-bg text-error text-sm p-4">
      โหลดไม่สำเร็จ: {message}
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 text-sm text-ink-muted">
      กำลังโหลด...
    </div>
  );
}
