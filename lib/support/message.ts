/* Validation and submission rules for เลี้ยงกาแฟ messages.
 *
 * No `server-only` here: the sheet imports the limits for its inputs'
 * maxLength. The database goes behind `SupportStore` (see ./store.ts) so the
 * rules can be tested without Supabase. */

export const SUPPORT_NAME_MAX = 60;
export const SUPPORT_MESSAGE_MAX = 500;
/** New messages are refused while this many are waiting for moderation. */
export const SUPPORT_QUEUE_CAP = 20;

export type SupportMessageInput = { name: string | null; message: string };

export interface SupportStore {
  countPending(): Promise<number>;
  insert(row: SupportMessageInput): Promise<void>;
}

export type SubmitResult = "ok" | "invalid" | "queue_full";

const INVALID = { ok: false, error: "invalid" } as const;

/** Code points, matching Postgres char_length used by the table's checks. */
function length(text: string): number {
  return [...text].length;
}

export function validateSupportMessage(
  body: unknown,
): { ok: true; value: SupportMessageInput } | typeof INVALID {
  if (typeof body !== "object" || body === null) return INVALID;
  const { name, message } = body as Record<string, unknown>;

  if (typeof message !== "string") return INVALID;
  const text = message.trim();
  if (length(text) < 1 || length(text) > SUPPORT_MESSAGE_MAX) return INVALID;

  if (name !== undefined && name !== null && typeof name !== "string") return INVALID;
  const who = typeof name === "string" ? name.trim() : "";
  if (length(who) > SUPPORT_NAME_MAX) return INVALID;

  return { ok: true, value: { name: who || null, message: text } };
}

export async function submitSupportMessage(
  store: SupportStore,
  body: unknown,
): Promise<SubmitResult> {
  const checked = validateSupportMessage(body);
  if (!checked.ok) return "invalid";
  if ((await store.countPending()) >= SUPPORT_QUEUE_CAP) return "queue_full";
  await store.insert(checked.value);
  return "ok";
}
