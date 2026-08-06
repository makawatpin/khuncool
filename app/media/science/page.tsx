import type { Metadata } from "next";
import SubjectResourcePage from "../_components/SubjectResourcePage";
import { SUBJECT_CONTENT } from "../subjectContent";

export const metadata: Metadata = { title: "เกมและสื่อการสอนวิทยาศาสตร์ ประถม เล่นฟรี | khuncool", description: "รวมเกมวิทยาศาสตร์ออนไลน์สำหรับครูประถม ฝึกสิ่งมีชีวิต สสาร แรง พลังงาน ไฟฟ้า โลกและอวกาศ เปิดเล่นบนจอหน้าชั้นได้ฟรี", keywords:["เกมวิทยาศาสตร์","สื่อการสอนวิทยาศาสตร์","เกมวิทยาศาสตร์ประถม","กิจกรรมวิทยาศาสตร์ในห้องเรียน"],alternates: { canonical: "https://www.khuncool.com/media/science" }, openGraph: { type: "website", title: "เกมวิทยาศาสตร์ สำหรับครูประถม | khuncool", description: "เกมห้องทดลองฉุกเฉินสำหรับเรียนวิทยาศาสตร์ผ่านสถานการณ์ เล่นฟรีผ่านเบราว์เซอร์", url: "https://www.khuncool.com/media/science", locale: "th_TH" },twitter:{card:"summary_large_image"} };
export default function Page() { return <SubjectResourcePage content={SUBJECT_CONTENT.science} />; }
