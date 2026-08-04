import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { overviewConfigs } from "../_components/khuncoolOverviewConfigs";

const config = overviewConfigs["digital-teaching-media"];
export const metadata: Metadata = {
  title: "ตัวอย่างแผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล KhunCool",
  description: "ตัวอย่างแผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล KhunCool แบ่งกิจกรรม 5 ช่วง พร้อมเวลา เครื่องมือ หลักฐานการเรียนรู้ และแผนสำรอง",
  alternates: { canonical: "https://www.khuncool.com/blog/digital-teaching-media" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
