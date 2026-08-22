import type { MetadataRoute } from "next";
import { ALL_ARTICLES } from "./articles/data";
import { MEDIA as MEDIA_ENGLISH } from "./media/english/data";
import { APPS, TOOLS } from "./tools/data";

const BASE_URL = "https://www.khuncool.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, priority: 1.0 },
    { url: `${BASE_URL}/tools`, priority: 0.9 },
    { url: `${BASE_URL}/apps`, priority: 0.9 },
    { url: `${BASE_URL}/media`, priority: 0.9 },
    { url: `${BASE_URL}/media/mathematics`, priority: 0.8 },
    { url: `${BASE_URL}/media/mathematics/math-bomb-defusal`, priority: 0.7 },
    { url: `${BASE_URL}/media/science`, priority: 0.8 },
    { url: `${BASE_URL}/media/science/science-lab-crisis`, priority: 0.7 },
    { url: `${BASE_URL}/media/science/motion-lab`, priority: 0.7 },
    { url: `${BASE_URL}/media/science/density-lab`, priority: 0.7 },
    { url: `${BASE_URL}/media/thai`, priority: 0.8 },
    { url: `${BASE_URL}/media/english`, priority: 0.9 },
    { url: `${BASE_URL}/media/social-studies`, priority: 0.9 },
    { url: `${BASE_URL}/media/computer`, priority: 0.9 },
    { url: `${BASE_URL}/media/computer/digital-sort`, priority: 0.7 },
    { url: `${BASE_URL}/media/computer/coding-maze`, priority: 0.6 },
    { url: `${BASE_URL}/media/computer/typing-defense`, priority: 0.5 },
    { url: `${BASE_URL}/media/social-studies/asean-matching`, priority: 0.7 },
    { url: `${BASE_URL}/media/social-studies/law-daily`, priority: 0.7 },
    { url: `${BASE_URL}/articles`, priority: 0.9 },
    { url: `${BASE_URL}/shop`, priority: 0.8 },
    { url: `${BASE_URL}/about`, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, priority: 0.3 },
  ];

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

  const mediaEnglishRoutes: MetadataRoute.Sitemap = MEDIA_ENGLISH.map((m) => ({
    url: `${BASE_URL}${m.href}`,
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
