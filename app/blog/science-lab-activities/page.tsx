import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["science-lab-activities"];
export const metadata: Metadata = {
  title: "7 กิจกรรมทดลองวิทยาศาสตร์บนจอ ไม่ต้องมีห้องแล็บ ใช้ฟรี",
  description:
    "รวม 7 การทดลองวิทยาศาสตร์ที่สาธิตได้จากจอหน้าชั้นหรือทำจริงด้วยของในครัว พร้อมสื่อจำลองความหนาแน่นและการเคลื่อนที่ สำหรับห้องเรียนที่ไม่มีอุปกรณ์",
  keywords: [
    "กิจกรรมวิทยาศาสตร์",
    "การทดลองวิทยาศาสตร์",
    "สื่อการสอนวิทยาศาสตร์",
    "วิทยาศาสตร์ ป.3",
    "วิทยาศาสตร์ ม.1",
    "ความหนาแน่น",
    "การเคลื่อนที่และแรง",
    "ทดลองวิทยาศาสตร์ง่ายๆ",
    "สื่อการสอนออนไลน์",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/science-lab-activities" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
