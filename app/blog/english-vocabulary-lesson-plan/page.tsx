import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["english-vocabulary-lesson-plan"];
export const metadata: Metadata = {
  title: "แผนสอนคำศัพท์ภาษาอังกฤษ 50 นาที สำหรับนักเรียนประถม",
  description: "ตัวอย่างแผนสอนคำศัพท์ภาษาอังกฤษ 50 นาที พร้อมกิจกรรมก่อนเรียน เกมคำศัพท์ งานคู่ และ Exit Ticket สำหรับครูประถม นำไปปรับใช้ได้ทันที",
  alternates: { canonical: "https://www.khuncool.com/blog/english-vocabulary-lesson-plan" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
