import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["student-savings-activity"];
export const metadata: Metadata = {
  title: "กิจกรรมออมเงินนักเรียน พร้อมวิธีบันทึกยอดอย่างโปร่งใส",
  description: "แนวทางจัดกิจกรรมออมเงินนักเรียน ตั้งแต่กำหนดกติกา รับฝาก ออกหลักฐาน ตรวจยอด และคุ้มครองข้อมูล โดยเน้นความสมัครใจและโปร่งใส",
  alternates: { canonical: "https://www.khuncool.com/blog/student-savings-activity" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
