import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["family-tree-english"];
export const metadata: Metadata = {
  title: "คำศัพท์ครอบครัวภาษาอังกฤษ 8 กิจกรรมสอนด้วยผัง Family Tree",
  description:
    "สอนคำศัพท์ครอบครัวภาษาอังกฤษด้วยผัง Family Tree พร้อม 8 กิจกรรมจากคำเดี่ยวสู่ประโยค อธิบายจุดที่นักเรียนไทยพลาดบ่อย เช่น ลุง ป้า น้า อา และการบอกพี่หรือน้อง",
  keywords: [
    "คำศัพท์ครอบครัวภาษาอังกฤษ",
    "family tree ภาษาอังกฤษ",
    "family members",
    "ลุง ป้า น้า อา ภาษาอังกฤษ",
    "สอนคำศัพท์ภาษาอังกฤษ",
    "ภาษาอังกฤษประถม",
    "สื่อการสอนภาษาอังกฤษ",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/family-tree-english" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
