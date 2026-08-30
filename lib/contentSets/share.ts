"use client";

import { getSupabase } from "@/lib/supabase/client";
import type { ShareTemplate } from "./types";

const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

function createSlug(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => SLUG_ALPHABET[byte % SLUG_ALPHABET.length]).join("");
}

export type CreateShareInput = {
  ownerId: string;
  title: string;
  items: readonly string[];
  template: ShareTemplate;
  templateConfig?: Record<string, unknown>;
};

export async function createUnlistedShare(input: CreateShareInput): Promise<string> {
  const items = input.items.map((item) => item.trim()).filter(Boolean).slice(0, 200);
  const scoreBoard = input.template === "mystery-board" && input.templateConfig?.mode === "score";
  if (items.length === 0 && !scoreBoard) throw new Error("กรุณาใส่คำถามก่อนสร้างลิงก์");

  const supabase = await getSupabase();
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = createSlug();
    const { error } = await supabase.from("kc_content_sets").insert({
      owner_id: input.ownerId,
      slug,
      title: input.title.trim().slice(0, 120),
      kind: "list",
      items,
      visibility: "unlisted",
      default_template: input.template,
      template_config: input.templateConfig ?? {},
    });

    if (!error) return `${window.location.origin}/play/${slug}/${input.template}`;
    if (error.code !== "23505") {
      if (error.code === "42P01" || error.code === "PGRST205") {
        throw new Error("ยังไม่พบตารางแชร์ใน Supabase กรุณาติดตั้ง schema ก่อน");
      }
      throw new Error(error.message || "สร้างลิงก์ไม่สำเร็จ");
    }
  }
  throw new Error("สร้างรหัสลิงก์ไม่สำเร็จ กรุณาลองใหม่");
}
