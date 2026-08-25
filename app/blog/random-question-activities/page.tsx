import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["random-question-activities"];
export const metadata: Metadata = {
  title: "7 วิธีใช้สุ่มคำถามในห้องเรียน ให้เด็กทุกคนได้ตอบ ใช้ฟรี",
  description:
    "7 วิธีใช้เครื่องมือสุ่มคำถามให้การถามตอบกระจายถึงทุกคน ไม่วนอยู่ที่เด็กกลุ่มเดิม พร้อมกติกาที่ทำให้การถูกสุ่มไม่กลายเป็นการลงโทษ ใช้ฟรีไม่ต้องติดตั้ง",
  keywords: [
    "สุ่มคำถาม",
    "สุ่มคำถามในห้องเรียน",
    "เครื่องมือครู",
    "การมีส่วนร่วมในชั้นเรียน",
    "เทคนิคการตั้งคำถาม",
    "จัดการชั้นเรียน",
    "กิจกรรมในห้องเรียน",
    "สื่อการสอนออนไลน์",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/random-question-activities" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
