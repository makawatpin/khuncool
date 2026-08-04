import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["english-warm-up-activities"];
export const metadata: Metadata = {
  title: "7 กิจกรรม Warm-up ภาษาอังกฤษ 5 นาที สำหรับครูประถม",
  description: "รวม 7 กิจกรรม Warm-up ภาษาอังกฤษ 5 นาที ทบทวน Vocabulary, Phonics, Grammar และ Speaking เริ่มคาบให้เด็กพร้อมเรียนโดยไม่กินเวลา",
  alternates: { canonical: "https://www.khuncool.com/blog/english-warm-up-activities" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
