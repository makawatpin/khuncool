import type { Metadata } from "next";
import SubjectResourcePage from "../_components/SubjectResourcePage";
import { SUBJECT_CONTENT } from "../subjectContent";

const PAGE_URL = "https://www.khuncool.com/media/mathematics";
const TITLE = "สื่อการสอนคณิตศาสตร์ เกมคณิตศาสตร์ประถม เล่นฟรี | khuncool";
const DESCRIPTION = "รวมสื่อการสอนและเกมคณิตศาสตร์ออนไลน์สำหรับครูประถม ป.1–ป.6 ฝึกบวกลบไม่เกิน 20 ด้วยเส้นจำนวน คิดเลขเร็ว สมการ เศษส่วน ร้อยละ และการประมาณค่า เปิดเล่นบนจอหน้าชั้นได้ฟรี";
const OG_IMAGE = { url: "https://www.khuncool.com/assets/game-covers/math-adventure.webp", width: 960, height: 540, alt: "เกม Math Adventure ภารกิจบวกลบ สื่อการสอนคณิตศาสตร์ ป.1" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "สื่อการสอนคณิตศาสตร์",
    "เกมคณิตศาสตร์",
    "เกมคณิตศาสตร์ประถม",
    "สื่อคณิตศาสตร์ประถม",
    "เกมบวกลบ ป.1",
    "เกมคิดเลขเร็ว",
    "เกมสมการ",
    "เกมเศษส่วน",
    "เกมร้อยละ",
    "กิจกรรมคณิตศาสตร์ในห้องเรียน",
    "สื่อการสอน ป.1",
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
  return <SubjectResourcePage content={SUBJECT_CONTENT.mathematics} />;
}
