import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const blogDir = path.join(process.cwd(), "app", "blog");
  const entries = await readdir(blogDir, { withFileTypes: true });
  const posts = entries
    .filter((e) => e.isDirectory())
    .map((e) => ({ slug: e.name, href: `/blog/${e.name}` }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return NextResponse.json({ posts });
}
