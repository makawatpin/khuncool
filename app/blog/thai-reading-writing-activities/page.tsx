import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["thai-reading-writing-activities"];
export const metadata: Metadata = {
  title: "8 กิจกรรมสอนอ่านเขียนภาษาไทย ป.1 พยัญชนะ สระ ประสมคำ",
  description:
    "รวม 8 กิจกรรมสอนอ่านเขียนภาษาไทย ป.1 ตั้งแต่รูปและเสียงพยัญชนะ ตำแหน่งสระ การประสมคำ ถึงการอ่านออกเสียง พร้อมสื่อที่มีเสียงอ่านให้ฟังทุกคำ ใช้ฟรี",
  keywords: [
    "สอนอ่านเขียนภาษาไทย",
    "ภาษาไทย ป.1",
    "สื่อการสอนภาษาไทย",
    "การประสมคำ",
    "สระภาษาไทย",
    "พยัญชนะไทย",
    "แก้ปัญหาอ่านไม่ออก",
    "กิจกรรมภาษาไทย",
    "สื่อการสอนออนไลน์",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/thai-reading-writing-activities" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
