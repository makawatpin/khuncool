import type { Metadata } from "next";
import SubjectResourcePage from "../_components/SubjectResourcePage";
import { SUBJECT_CONTENT } from "../subjectContent";

const PAGE_URL = "https://www.khuncool.com/media/thai";
const TITLE = "สื่อการสอนภาษาไทย เกมภาษาไทยประถม เล่นฟรี | khuncool";
const DESCRIPTION = "รวมสื่อการสอนและเกมภาษาไทยออนไลน์สำหรับครูประถม เรียนพยัญชนะ ตำแหน่งสระ และการประสมคำ ผ่านภาพ เสียงอ่าน และเกมรถไฟเก็บคำ เปิดใช้บนจอหน้าชั้นได้ฟรี";
const OG_IMAGE = { url: "https://www.khuncool.com/assets/game-covers/thai-kingdom.webp", width: 1200, height: 675, alt: "เกมอาณาจักรภาษาไทย อ่านออก เขียนได้ สื่อการสอนภาษาไทย ป.1" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "สื่อการสอนภาษาไทย",
    "สื่อการสอนภาษาไทย ประถม",
    "เกมภาษาไทย",
    "เกมภาษาไทย ป.1",
    "ฝึกอ่านภาษาไทย",
    "พยัญชนะไทย",
    "สระและวรรณยุกต์",
    "ประสมคำ",
    "อ่านจับใจความ",
  ],
  category: "education",
  creator: "Khuncool",
  publisher: "Khuncool",
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Khuncool",
    locale: "th_TH",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function Page() {
  return <SubjectResourcePage content={SUBJECT_CONTENT.thai} />;
}
