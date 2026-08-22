import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["computing-science-games"];
export const metadata: Metadata = {
  title: "8 เกมและกิจกรรมวิทยาการคำนวณ ป.4–ป.6 ใช้ฟรี ไม่ต้องมีห้องคอม",
  description:
    "รวมเกมและกิจกรรมวิทยาการคำนวณ ป.4–ป.6 ทั้งแบบเปิดจากจอหน้าชั้นและแบบ unplugged ฝึก Coding การเรียงลำดับคำสั่ง ฮาร์ดแวร์ซอฟต์แวร์ และการพิมพ์ ใช้ฟรีไม่ต้องติดตั้ง",
  keywords: [
    "วิทยาการคำนวณ",
    "เกมวิทยาการคำนวณ",
    "วิทยาการคำนวณ ป.4",
    "วิทยาการคำนวณ ป.5",
    "วิทยาการคำนวณ ป.6",
    "สื่อการสอนวิทยาการคำนวณ",
    "กิจกรรมวิทยาการคำนวณ",
    "Coding สำหรับเด็ก",
    "unplugged",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/computing-science-games" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
