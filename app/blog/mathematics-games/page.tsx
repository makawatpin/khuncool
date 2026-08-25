import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["mathematics-games"];
export const metadata: Metadata = {
  title: "8 เกมและกิจกรรมคณิตศาสตร์ ป.1–ป.6 ใช้ฟรี เล่นได้ทั้งห้อง",
  description:
    "รวมเกมและกิจกรรมคณิตศาสตร์ ป.1–ป.6 เปิดจากจอหน้าชั้นได้ทันที ตั้งแต่บวกลบด้วยเส้นจำนวน คิดเลขเร็ว เศษส่วน ไปจนถึงโจทย์ปัญหา ใช้ฟรีไม่ต้องติดตั้ง",
  keywords: [
    "เกมคณิตศาสตร์",
    "สื่อการสอนคณิตศาสตร์",
    "กิจกรรมคณิตศาสตร์",
    "คณิตศาสตร์ ป.1",
    "คณิตศาสตร์ ป.4",
    "คณิตศาสตร์ ป.6",
    "คิดเลขเร็ว",
    "เศษส่วน",
    "สื่อการสอนออนไลน์",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/mathematics-games" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
