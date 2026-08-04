import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { overviewConfigs } from "../_components/khuncoolOverviewConfigs";

const config = overviewConfigs["10-free-teaching-tools"];
export const metadata: Metadata = {
  title: "10 สื่อการสอนออนไลน์ใช้ฟรีจาก KhunCool สำหรับครูยุคดิจิทัล",
  description: "รวม 10 สื่อการสอนออนไลน์ใช้ฟรีจาก KhunCool พร้อมตัวอย่างใช้จริง ช่วยสุ่มชื่อ แบ่งกลุ่ม จับเวลา เช็กชื่อ และจัดการห้องเรียน ไม่ต้องติดตั้ง",
  alternates: { canonical: "https://www.khuncool.com/blog/10-free-teaching-tools" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
