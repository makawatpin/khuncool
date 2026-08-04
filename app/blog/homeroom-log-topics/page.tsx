import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["homeroom-log-topics"];
export const metadata: Metadata = {
  title: "ตัวอย่างหัวข้อบันทึกโฮมรูมตลอดภาคเรียน พร้อมแนวทางเขียน",
  description: "รวมตัวอย่างหัวข้อบันทึกโฮมรูมสำหรับครูประจำชั้น พร้อมโครงสร้างการเขียน ข้อควรระวัง และแนวทางคุ้มครองข้อมูลนักเรียน",
  alternates: { canonical: "https://www.khuncool.com/blog/homeroom-log-topics" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
