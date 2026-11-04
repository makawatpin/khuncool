import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createServiceRoleClient } from "@/lib/supabase/serviceClient";
import { fetchBlogViewCounts } from "@/lib/admin/fetchBlogViewCounts";
import { ALL_ARTICLES } from "@/app/articles/data";

/** `/blog/<slug>` -> `<slug>`, matching how view events are keyed. */
const BLOG_SLUGS = ALL_ARTICLES.flatMap((article) =>
  article.href.startsWith("/blog/") ? [article.href.slice("/blog/".length)] : [],
);

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServiceRoleClient();
  let viewCounts: Map<string, number>;
  try {
    viewCounts = await fetchBlogViewCounts(supabase);
  } catch (error) {
    const message = error instanceof Error ? error.message : "query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  /* The post list comes from ALL_ARTICLES, the same data the blog index and
     the sitemap are built from, rather than from `readdir(app/blog)`.
     Reading the directory meant this route depended on its own source tree
     being on disk next to it at request time. Next traces the files a route
     imports; a path assembled at runtime from `process.cwd()` is not one of
     them, so the app/blog directories are not guaranteed to be in the
     deployed function bundle and the readdir could throw ENOENT in
     production while working locally. Importing the data makes the
     dependency static, so the build fails loudly if it ever breaks instead
     of the route 500ing after deploy.

     The two sources are equivalent: every one of the 36 blog directories
     has exactly one ALL_ARTICLES entry and vice versa. The response shape
     is unchanged. */
  const posts = BLOG_SLUGS.map((slug) => ({
    slug,
    href: `/blog/${slug}`,
    views: viewCounts.get(slug) ?? 0,
  })).sort((a, b) => b.views - a.views || a.slug.localeCompare(b.slug));

  return NextResponse.json({ posts });
}
