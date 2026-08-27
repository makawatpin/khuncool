import type { Metadata } from "next";
import { ClassroomStoryArticle } from "../_components/ClassroomStoryArticle";
import { classroomStoryConfigs } from "../_components/classroomStoryConfigs";

const config = classroomStoryConfigs["tablet-english-classroom"];
export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: { canonical: "https://www.khuncool.com/blog/tablet-english-classroom" },
  openGraph: { type: "article", title: config.title, description: config.description, images: [config.cover], locale: "th_TH" },
  twitter: { card: "summary_large_image", title: config.title, description: config.description, images: [config.cover] },
};
export default function Page() { return <ClassroomStoryArticle config={config} />; }
