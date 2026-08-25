import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["classroom-timer-activities"];
export const metadata: Metadata = {
  title: "จับเวลาในห้องเรียน 8 วิธีใช้ให้คุมคาบเรียนได้จริง ใช้ฟรี",
  description:
    "8 วิธีใช้เครื่องจับเวลาในห้องเรียนให้คาบเดินตามแผน ตั้งแต่กิจกรรมต้นคาบ งานกลุ่ม การนำเสนอ ถึงการทบทวนท้ายคาบ พร้อมวิธีตั้งเวลาไม่ให้กลายเป็นการกดดัน",
  keywords: [
    "จับเวลาในห้องเรียน",
    "เครื่องจับเวลาออนไลน์",
    "นาฬิกาจับเวลา",
    "บริหารเวลาในคาบเรียน",
    "เครื่องมือครู",
    "จัดการชั้นเรียน",
    "กิจกรรมในห้องเรียน",
    "สื่อการสอนออนไลน์",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/classroom-timer-activities" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
