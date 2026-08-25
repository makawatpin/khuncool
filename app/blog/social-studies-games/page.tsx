import type { Metadata } from "next";
import { KhuncoolOverviewArticle } from "../_components/KhuncoolOverviewArticle";
import { clusterArticleConfigs } from "../_components/clusterArticleConfigs";

const config = clusterArticleConfigs["social-studies-games"];
export const metadata: Metadata = {
  title: "6 เกมและกิจกรรมสังคมศึกษา ป.3–ป.6 อาเซียนและกฎหมายใกล้ตัว",
  description:
    "รวมเกมและกิจกรรมสังคมศึกษา ป.3–ป.6 เรื่องประชาคมอาเซียนและกฎหมายในชีวิตประจำวัน เปิดจากจอหน้าชั้นได้ทันที เน้นให้เด็กวิเคราะห์และอธิบายเหตุผล ใช้ฟรี",
  keywords: [
    "เกมสังคมศึกษา",
    "สื่อการสอนสังคมศึกษา",
    "อาเซียน",
    "ประชาคมอาเซียน",
    "กฎหมายใกล้ตัว",
    "หน้าที่พลเมือง",
    "สังคมศึกษา ป.4",
    "สังคมศึกษา ป.6",
    "สื่อการสอนออนไลน์",
  ],
  alternates: { canonical: "https://www.khuncool.com/blog/social-studies-games" },
  openGraph: { type: "article", title: config.title, description: config.lead, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.lead, images: [config.cover] },
};
export default function Page() { return <KhuncoolOverviewArticle config={config} />; }
