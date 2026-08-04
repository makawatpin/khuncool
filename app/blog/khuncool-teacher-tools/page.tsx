import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { overviewConfigs } from "../_components/khuncoolOverviewConfigs";

const config = overviewConfigs["khuncool-teacher-tools"];
export const metadata: Metadata = {
  title: "แนะนำ KhunCool เว็บไซต์รวมเครื่องมือครูและสื่อการสอนใช้ฟรี",
  description: "รู้จัก KhunCool เว็บไซต์รวมเครื่องมือครูและสื่อการสอนออนไลน์ใช้ฟรี ใช้งานผ่านเว็บ พร้อมแนวทางเริ่มใช้และเลือกเครื่องมือให้เหมาะกับห้องเรียน",
  alternates: { canonical: "https://www.khuncool.com/blog/khuncool-teacher-tools" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
