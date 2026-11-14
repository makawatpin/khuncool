/* Input parsing for the admin moderation route (app/api/admin/support). */

export const SUPPORT_STATUSES = ["pending", "approved", "hidden"] as const;
export type SupportMessageStatus = (typeof SUPPORT_STATUSES)[number];

function isStatus(value: unknown): value is SupportMessageStatus {
  return (SUPPORT_STATUSES as readonly unknown[]).includes(value);
}

function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function parseStatusUpdate(
  body: unknown,
): { id: number; status: SupportMessageStatus } | null {
  if (typeof body !== "object" || body === null) return null;
  const { id, status } = body as Record<string, unknown>;
  return isId(id) && isStatus(status) ? { id, status } : null;
}

/** From a query string: digits only, so "1e3" or "12abc" never pass. */
export function parseMessageId(raw: string | null): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return isId(id) ? id : null;
}

export function parseStatusFilter(raw: string | null): SupportMessageStatus {
  return isStatus(raw) ? raw : "pending";
}
