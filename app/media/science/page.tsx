import type { Metadata } from "next";
import SubjectResourcePage from "../_components/SubjectResourcePage";
import { SUBJECT_CONTENT } from "../subjectContent";

export const metadata: Metadata = { title: "เกมและสื่อการสอนวิทยาศาสตร์ ประถม–มัธยม | khuncool", description: "รวมเกมและสื่อวิทยาศาสตร์แบบโต้ตอบสำหรับครู ตั้งแต่ระดับประถมถึงมัธยม ทดลองสิ่งมีชีวิต สสาร ความหนาแน่น แรง การเคลื่อนที่ และพลังงาน", keywords:["เกมวิทยาศาสตร์","สื่อการสอนวิทยาศาสตร์","สื่อวิทยาศาสตร์ ม.1","สื่อวิทยาศาสตร์ ม.2","ความหนาแน่น","การเคลื่อนที่และแรง"],alternates: { canonical: "https://www.khuncool.com/media/science" }, openGraph: { type: "website", title: "สื่อการสอนวิทยาศาสตร์ ประถม–มัธยม | khuncool", description: "ห้องทดลองฉุกเฉิน Motion Lab และ Density Lab สื่อโต้ตอบสำหรับฉายหน้าชั้นเรียน", url: "https://www.khuncool.com/media/science", locale: "th_TH" },twitter:{card:"summary_large_image"} };
export default function Page() { return <SubjectResourcePage content={SUBJECT_CONTENT.science} />; }
