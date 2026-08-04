import type { Metadata } from "next";
import { SeoClusterArticle } from "../_components/SeoClusterArticle";
import { seoClusterConfigs } from "../_components/seoClusterConfigs";

const config = seoClusterConfigs["random-student-picker-games"];
export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: { canonical: `https://www.khuncool.com/blog/${config.slug}` },
  openGraph: { type: "article", title: config.title, description: config.description, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.description, images: [config.cover] },
};
export default function Page() { return <SeoClusterArticle config={config} />; }
