import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchBlogViewCounts } from "@/lib/admin/fetchBlogViewCounts";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const blogDir = path.join(process.cwd(), "app", "blog");
  const entries = await readdir(blogDir, { withFileTypes: true });

  const supabase = createServiceRoleClient();
  let viewCounts: Map<string, number>;
  try {
    viewCounts = await fetchBlogViewCounts(supabase);
  } catch (error) {
    const message = error instanceof Error ? error.message : "query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const posts = entries
    .filter((e) => e.isDirectory() && e.name !== "_components")
    .map((e) => ({
      slug: e.name,
      href: `/blog/${e.name}`,
      views: viewCounts.get(e.name) ?? 0,
    }))
    .sort((a, b) => b.views - a.views || a.slug.localeCompare(b.slug));

  return NextResponse.json({ posts });
}
