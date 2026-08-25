import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["weather-seasons-english"];
export const metadata: Metadata = {
  title: "8 กิจกรรมสอนคำศัพท์สภาพอากาศและฤดูกาล ภาษาอังกฤษ ป.1–ป.6",
  description:
    "รวม 8 กิจกรรมสอนคำศัพท์ Weather และ Seasons สำหรับเด็กประถม พร้อมวิธีพาเด็กจากคำเดี่ยวไปสู่ประโยค และวิธีอธิบายสี่ฤดูกับสามฤดูของไทยไม่ให้สับสน",
  keywords: [
    "คำศัพท์ภาษาอังกฤษ",
    "Weather",
    "Seasons",
    "สภาพอากาศภาษาอังกฤษ",
    "ฤดูกาลภาษาอังกฤษ",
    "สื่อการสอนภาษาอังกฤษ",
    "ภาษาอังกฤษ ป.1",
    "ภาษาอังกฤษ ป.6",
    "เกมคำศัพท์",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/weather-seasons-english" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
