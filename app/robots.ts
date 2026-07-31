import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/account",
    },
    sitemap: "https://www.khuncool.com/sitemap.xml",
  };
}
