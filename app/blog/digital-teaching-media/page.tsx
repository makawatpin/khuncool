import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { overviewConfigs } from "../_components/khuncoolOverviewConfigs";

const config = overviewConfigs["digital-teaching-media"];
export const metadata: Metadata = {
  title: "สื่อการสอนดิจิทัลใช้ฟรีจาก KhunCool ห้องเรียนสนุก จัดการง่าย",
  description: "แนวทางใช้สื่อการสอนดิจิทัลฟรีจาก KhunCool เพิ่มการมีส่วนร่วม จัดเวลา แบ่งกลุ่ม และลดงานซ้ำ โดยคำนึงถึงเป้าหมายและความปลอดภัย",
  alternates: { canonical: "https://www.khuncool.com/blog/digital-teaching-media" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
