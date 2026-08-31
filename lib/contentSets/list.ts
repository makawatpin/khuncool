"use client";

import { getSupabase } from "@/lib/supabase/client";
import { isShareTemplate, type ShareTemplate } from "./types";

export type MyShare = {
  slug: string;
  title: string;
  template: ShareTemplate;
  visibility: string;
  itemCount: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
  url: string;
};

/** Thrown when the database has not had the /sets migration applied yet. */
export class MissingListFunctionError extends Error {
  constructor() {
    super("ยังไม่ได้ติดตั้งฟังก์ชัน list_my_kc_content_sets ใน Supabase");
    this.name = "MissingListFunctionError";
  }
}

type Row = {
  slug: string;
  title: string;
  visibility: string;
  default_template: string;
  item_count: number | null;
  play_count: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Share links the signed-in teacher created. Goes through an RPC rather than a
 * select because `authenticated` cannot read `owner_id`, and the read policy
 * would otherwise return other teachers' unlisted rows too.
 */
export async function listMyShares(): Promise<MyShare[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("list_my_kc_content_sets");

  if (error) {
    // PGRST202 = no such function in the schema cache; 42883 = undefined_function.
    if (error.code === "PGRST202" || error.code === "42883") {
      throw new MissingListFunctionError();
    }
    throw new Error(error.message || "โหลดรายการลิงก์ไม่สำเร็จ");
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return ((data ?? []) as Row[])
    .filter((row) => isShareTemplate(row.default_template))
    .map((row) => ({
      slug: row.slug,
      title: row.title,
      template: row.default_template as ShareTemplate,
      visibility: row.visibility,
      itemCount: row.item_count ?? 0,
      playCount: row.play_count ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      url: `${origin}/play/${row.slug}/${row.default_template}`,
    }));
}

/** Owner-only delete; RLS refuses rows the caller does not own. */
export async function deleteShare(slug: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("kc_content_sets")
    .delete()
    .eq("slug", slug);
  if (error) throw new Error(error.message || "ลบลิงก์ไม่สำเร็จ");
}
