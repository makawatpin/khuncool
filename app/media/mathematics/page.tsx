import type { Metadata } from "next";
import SubjectResourcePage from "../_components/SubjectResourcePage";
import { SUBJECT_CONTENT } from "../subjectContent";

const PAGE_URL = "https://www.khuncool.com/media/mathematics";
const TITLE = "สื่อการสอนคณิตศาสตร์ เกมคณิตศาสตร์ประถม เล่นฟรี | khuncool";
const DESCRIPTION = "รวมสื่อการสอนและเกมคณิตศาสตร์ออนไลน์สำหรับครูประถม ป.3–ป.6 ฝึกคิดเลขเร็ว สมการ เศษส่วน ร้อยละ และการประมาณค่า เปิดเล่นบนจอหน้าชั้นได้ฟรี";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "สื่อการสอนคณิตศาสตร์",
    "เกมคณิตศาสตร์",
    "เกมคณิตศาสตร์ประถม",
    "สื่อคณิตศาสตร์ประถม",
    "เกมคิดเลขเร็ว",
    "เกมสมการ",
    "เกมเศษส่วน",
    "เกมร้อยละ",
    "กิจกรรมคณิตศาสตร์ในห้องเรียน",
    "สื่อการสอน ป.3",
    "สื่อการสอน ป.4",
    "สื่อการสอน ป.5",
    "สื่อการสอน ป.6",
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
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <SubjectResourcePage content={SUBJECT_CONTENT.mathematics} />;
}
