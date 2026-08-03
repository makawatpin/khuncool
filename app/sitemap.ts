import type { MetadataRoute } from "next";
import { ALL_ARTICLES } from "./articles/data";
import { MEDIA as MEDIA_ENGLISH } from "./media/english/data";
import { APPS, TOOLS } from "./tools/data";

const BASE_URL = "https://www.khuncool.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, priority: 1.0 },
    { url: `${BASE_URL}/tools`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/apps`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/media`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/media/english`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/media/social-studies`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/media/social-studies/asean-matching`, lastModified: now, priority: 0.7 },
    { url: `${BASE_URL}/articles`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/shop`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, priority: 0.3 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${BASE_URL}${t.href}`,
    lastModified: now,
    priority: 0.7,
  }));

  const appRoutes: MetadataRoute.Sitemap = APPS.map((a) => ({
    url: `${BASE_URL}${a.href}`,
    lastModified: now,
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = ALL_ARTICLES.map((a) => ({
    url: `${BASE_URL}${a.href}`,
    lastModified: new Date(a.dateISO),
    priority: 0.6,
  }));

  const mediaEnglishRoutes: MetadataRoute.Sitemap = MEDIA_ENGLISH.map((m) => ({
    url: `${BASE_URL}${m.href}`,
    lastModified: now,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...toolRoutes,
    ...appRoutes,
    ...articleRoutes,
    ...mediaEnglishRoutes,
  ];
}
