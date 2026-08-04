import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { overviewConfigs } from "../_components/khuncoolOverviewConfigs";

const config = overviewConfigs["free-online-teaching-media"];
export const metadata: Metadata = {
  title: "รวมสื่อการสอนออนไลน์ใช้ฟรี ไม่ต้องติดตั้ง ใช้งานง่ายสำหรับครู",
  description: "รวมสื่อการสอนออนไลน์ใช้ฟรี ไม่ต้องติดตั้ง พร้อมวิธีเลือกและจัดลำดับการใช้ในหนึ่งคาบ ตั้งแต่สุ่มชื่อ แบ่งกลุ่ม จับเวลา ถึงสรุปบทเรียน",
  alternates: { canonical: "https://www.khuncool.com/blog/free-online-teaching-media" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
