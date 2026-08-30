import type { MetadataRoute } from "next";
import { ALL_ARTICLES } from "./articles/data";
import { MEDIA_ROUTES } from "./media/catalog";
import { APPS, TOOLS } from "./tools/data";

const BASE_URL = "https://www.khuncool.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, priority: 1.0 },
    { url: `${BASE_URL}/tools`, priority: 0.9 },
    { url: `${BASE_URL}/apps`, priority: 0.9 },
    { url: `${BASE_URL}/articles`, priority: 0.9 },
    { url: `${BASE_URL}/shop`, priority: 0.8 },
    { url: `${BASE_URL}/about`, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, priority: 0.3 },
  ];

  /* Derived from the subject data files rather than listed here, so a new game
     reaches search engines as soon as its card goes up. Hubs outrank the
     individual games they link to. */
  const mediaRoutes: MetadataRoute.Sitemap = MEDIA_ROUTES.map((href) => ({
    url: `${BASE_URL}${href}`,
    priority: href.split("/").length > 3 ? 0.7 : 0.9,
  }));

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${BASE_URL}${t.href}`,
    priority: 0.7,
  }));

  const appRoutes: MetadataRoute.Sitemap = APPS.map((a) => ({
    url: `${BASE_URL}${a.href}`,
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = ALL_ARTICLES.map((a) => ({
    url: `${BASE_URL}${a.href}`,
    lastModified: new Date(a.dateISO),
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...mediaRoutes,
    ...toolRoutes,
    ...appRoutes,
    ...articleRoutes,
  ];
}
