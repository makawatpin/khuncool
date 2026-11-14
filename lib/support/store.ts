import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import type { SupportMessageInput, SupportStore } from "./message";
import type { SupportMessageStatus } from "./moderation";

export type SupportMessageRow = {
  id: number;
  name: string | null;
  message: string;
  status: SupportMessageStatus;
  created_at: string;
};

export const SUPPORT_TABLE = "kc_support_messages";

export function createSupportStore(): SupportStore {
  const supabase = createServiceRoleClient();
  return {
    async countPending() {
      const { count, error } = await supabase
        .from(SUPPORT_TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
    async insert(row: SupportMessageInput) {
      const { error } = await supabase.from(SUPPORT_TABLE).insert(row);
      if (error) throw new Error(error.message);
    },
  };
}

/** Approved messages for the /support thank-you wall, newest first. Returns
 *  [] on any failure, including a build or preview without the service-role
 *  key, so the page still renders. */
export async function fetchApprovedMessages(limit = 30): Promise<SupportMessageRow[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from(SUPPORT_TABLE)
      .select("id, name, message, status, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as SupportMessageRow[];
  } catch (error) {
    console.warn(
      "fetchApprovedMessages failed:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}
