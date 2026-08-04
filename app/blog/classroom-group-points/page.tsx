import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["classroom-group-points"];
export const metadata: Metadata = {
  title: "ระบบคะแนนกลุ่มในห้องเรียน ให้คะแนนอย่างไรไม่ให้เด็กเสียกำลังใจ",
  description: "แนวทางออกแบบระบบคะแนนกลุ่มและเกณฑ์ให้คะแนนที่ส่งเสริมความร่วมมือ ไม่ตีตรานักเรียน พร้อมวิธีใช้กระดานคะแนนกลุ่ม KhunCool",
  alternates: { canonical: "https://www.khuncool.com/blog/classroom-group-points" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
