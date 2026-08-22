import type { Metadata } from "next";
import SubjectResourcePage from "../_components/SubjectResourcePage";
import { SUBJECT_CONTENT } from "../subjectContent";

export const metadata: Metadata = { title: "สื่อการสอนภาษาไทย ประถม ป.1–ป.6 | khuncool", description: "หน้ารวมสื่อการสอนภาษาไทยระดับประถม ฝึกอ่าน สระ วรรณยุกต์ หลักภาษา อ่านจับใจความ และการเขียน สำหรับเปิดใช้บนจอหน้าชั้นเรียน", keywords: ["สื่อการสอนภาษาไทย", "สื่อการสอนภาษาไทย ประถม", "เกมภาษาไทย", "ฝึกอ่านภาษาไทย", "สระและวรรณยุกต์", "หลักภาษาไทย", "อ่านจับใจความ"], alternates: { canonical: "https://www.khuncool.com/media/thai" }, openGraph: { type: "website", title: "สื่อการสอนภาษาไทย สำหรับครูประถม | khuncool", description: "สื่อภาษาไทยสำหรับครูประถม ป.1–ป.6 กำลังเตรียมเนื้อหาสำหรับใช้ในชั้นเรียน", url: "https://www.khuncool.com/media/thai", locale: "th_TH" } };
export default function Page() { return <SubjectResourcePage content={SUBJECT_CONTENT.thai} />; }
