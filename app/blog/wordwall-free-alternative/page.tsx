import type { Metadata } from "next";
import { ComparisonArticle } from "../_components/ComparisonArticle";
import { comparisonConfigs } from "../_components/comparisonConfigs";

const config = comparisonConfigs["wordwall-free-alternative"];
export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: { canonical: `https://www.khuncool.com/blog/${config.slug}` },
  openGraph: { type: "article", title: config.title, description: config.description, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.description, images: [config.cover] },
};
export default function Page() { return <ComparisonArticle config={config} />; }
