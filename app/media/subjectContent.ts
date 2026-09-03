import type { SubjectPageContent } from "./_components/SubjectResourcePage";
import { FAMILIES } from "./thai/final-consonants/familyData";

export const SUBJECT_CONTENT: Record<"mathematics" | "science" | "thai", SubjectPageContent> = {
  mathematics: {
    slug: "mathematics", name: "คณิตศาสตร์", icon: "🔢", accent: "#C85C12", soft: "#FFF0E4",
    educationalLevel: "ประถมศึกษาปีที่ 1–6", updated: "2026-09-01",
    headline: "เกมและสื่อการสอนคณิตศาสตร์ สำหรับครูประถม",
    intro: "เกมคณิตศาสตร์สำหรับใช้ทั้งห้อง เริ่มจากการบวกลบไม่เกิน 20 ด้วยภาพและเส้นจำนวนสำหรับ ป.1 ไปจนถึงคิดเลขเร็ว สมการ เศษส่วน ร้อยละ และการประมาณค่า ผ่านภารกิจตัดสายระเบิดสำหรับชั้นโต เล่นได้ทันทีบนจอหน้าชั้นเรียน",
    topics: ["การบวกและการลบ", "คิดเลขเร็ว", "สมการ", "เศษส่วน", "ร้อยละ"],
    resources: [
      { title: "Math Adventure ภารกิจบวกลบ", description: "เรียนด้วยภาพและเส้นจำนวน ฝึกตอบ เล่นรถไฟเก็บดาว และทำแบบทดสอบหลังเรียน", grades: "ป.1 · 10–20 นาที", type: "การบวกและการลบ", href: "/media/mathematics/math-adventure", image: "/assets/game-covers/math-adventure.webp" },
      { title: "รู้จักเศษส่วน", description: "เรียนจากภาพว่าแบ่งเท่า ๆ กันคืออะไร อ่านและเขียนเศษส่วน แล้วฝึกด้วยเกม 12 ข้อและคำถามหน้าชั้น", grades: "ป.2–ป.3 · 25–30 นาที", type: "เศษส่วน", href: "/media/mathematics/fractions-basic", image: "/assets/game-covers/fractions-basic.webp" },
      { title: "ถอดรหัสบอมบ์ตัวเลข", description: "แก้โจทย์ เลือกตัดสายคำตอบที่ถูกต้อง และหยุดระเบิดก่อนหมดเวลา", grades: "ป.3–ป.6 · 5–10 นาที", type: "คิดเลขเร็ว", href: "/media/mathematics/math-bomb-defusal", image: "/assets/game-covers/math-bomb-defusal.webp" },
    ],
    outcomes: ["เชื่อมแนวคิดนามธรรมกับภาพและสถานการณ์ใกล้ตัว", "สื่อสารกระบวนการคิดด้วยคำพูด ภาพ และสัญลักษณ์", "ตรวจสอบความสมเหตุสมผลของคำตอบได้ด้วยตนเอง"],
    relatedArticles: [
      { t: "8 เกมและกิจกรรมคณิตศาสตร์ ป.1–ป.6 เล่นทั้งห้องได้จากจอเดียว", href: "/blog/mathematics-games" },
      { t: "ตัวอย่างแผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล", href: "/blog/digital-teaching-media" },
      { t: "7 วิธีใช้สุ่มคำถามในห้องเรียน ให้เด็กทุกคนได้ตอบ", href: "/blog/random-question-activities" },
      { t: "จับเวลาในห้องเรียน 8 วิธีใช้ให้คุมคาบเรียนได้จริง", href: "/blog/classroom-timer-activities" },
    ],
  },
  science: {
    slug: "science", name: "วิทยาศาสตร์", icon: "🔬", accent: "#24805F", soft: "#EAF7E4",
    educationalLevel: "ประถมศึกษาปีที่ 3 ถึงมัธยมศึกษาปีที่ 2", updated: "2026-08-06",
    headline: "เกมและสื่อการสอนวิทยาศาสตร์ เรียนรู้ผ่านการสังเกต",
    intro: "เกมวิทยาศาสตร์สำหรับพาเด็กวิเคราะห์สถานการณ์ ตั้งคำถาม และใช้หลักฐานแก้ปัญหา ครอบคลุมสิ่งมีชีวิต สสาร แรง พลังงาน ไฟฟ้า โลก และอวกาศ",
    topics: ["สิ่งมีชีวิต", "สสาร", "แรงและพลังงาน", "โลกและอวกาศ", "กระบวนการสืบเสาะ"],
    resources: [
      { title: "ห้องทดลองฉุกเฉิน", description: "วิเคราะห์สถานการณ์ เลือกวิธีแก้ปัญหา และกู้ระบบห้องทดลองให้ครบ 10 ภารกิจ", grades: "ป.3–ป.6 · 8–12 นาที", type: "วิทยาศาสตร์รอบตัว", href: "/media/science/science-lab-crisis", image: "/assets/game-covers/science-lab-crisis.webp" },
      { title: "Motion Lab การเคลื่อนที่และแรง", description: "ทดลองตำแหน่ง ระยะทาง การกระจัด เวลา และอัตราเร็ว ผ่านรถจำลองบนเส้นจำนวน", grades: "ม.2 · 10–20 นาที", type: "การเคลื่อนที่และแรง", href: "/media/science/motion-lab" },
      { title: "Density Lab ความหนาแน่น", description: "เลือกวัตถุ ของเหลว และปริมาตร ทดลองการลอยจมพร้อมวิเคราะห์ค่าความหนาแน่น", grades: "ม.1 · 10–20 นาที", type: "สสารและสมบัติของสาร", href: "/media/science/density-lab" },
    ],
    outcomes: ["ตั้งคำถามและคาดการณ์จากความรู้เดิม", "เก็บและใช้หลักฐานจากการสังเกตหรือทดลอง", "อธิบายปรากฏการณ์ด้วยเหตุผลและคำศัพท์วิทยาศาสตร์"],
    relatedArticles: [
      { t: "7 กิจกรรมทดลองวิทยาศาสตร์บนจอ สอนได้แม้ห้องเรียนไม่มีอุปกรณ์", href: "/blog/science-lab-activities" },
      { t: "ตัวอย่างแผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล", href: "/blog/digital-teaching-media" },
      { t: "7 วิธีใช้สุ่มคำถามในห้องเรียน ให้เด็กทุกคนได้ตอบ", href: "/blog/random-question-activities" },
      { t: "จับเวลาในห้องเรียน 8 วิธีใช้ให้คุมคาบเรียนได้จริง", href: "/blog/classroom-timer-activities" },
    ],
  },
  thai: {
    slug: "thai", name: "ภาษาไทย", icon: "📖", accent: "#B4477C", soft: "#FDE8F3",
    educationalLevel: "ประถมศึกษาปีที่ 1–6", updated: "2026-09-03",
    headline: "เกมและสื่อการสอนภาษาไทย อ่านคล่อง เขียนสื่อความ",
    intro: "สื่อการสอนภาษาไทยสำหรับพัฒนาการอ่านและหลักภาษา ตั้งแต่พยัญชนะ ตำแหน่งสระ และการประสมคำ ไปจนถึงมาตราตัวสะกดและสำนวนไทย แต่ละเรื่องมีบทเรียนหรือเกมฝึกที่ช่วยให้เข้าใจและนำภาษาไปใช้ ออกแบบสำหรับจอหน้าชั้นเรียน แท็บเล็ต และโทรศัพท์มือถือ",
    topics: ["พยัญชนะไทย", "ตำแหน่งสระ", "ประสมคำ", "มาตราตัวสะกด", "สำนวนไทย", "การเขียน"],
    resources: [
      { title: "นักสืบสำนวนไทย 50 สำนวน", description: "ไขความหมายจากสถานการณ์และภาพคำใบ้ เติมคำ และเปิดคลังทบทวนสำนวนพร้อมความหมาย", grades: "ป.4–ป.6 · 5–10 นาที", type: "สำนวนไทย", href: "/media/thai/thai-idiom-detective", image: "/assets/game-covers/thai-idiom-detective.webp", imageLabel: "เกมสำนวนไทย 50 สำนวน" },
      { title: "หมู่บ้านมาตราตัวสะกด", description: "เรียนตัวสะกดครบ 9 มาตราแบบทีละตอน แล้วเล่นเกมส่งคำกลับบ้านจากเสียงท้าย", grades: "ป.1–ป.3 · 15–25 นาที", type: "มาตราตัวสะกด", href: "/media/thai/final-consonants", image: "/assets/final-consonants/village.webp", imageLabel: "มาตราตัวสะกด 9 มาตรา" },
      ...FAMILIES.map((family) => ({ title: `${family.name} ฟังเสียงให้ชัด`, description: `${family.seo.uniqueIntroduction} พร้อมบทเรียนและเกมเปรียบเทียบแม่ที่มักสับสน`, grades: "ป.1–ป.3 · 10–15 นาที", type: family.name, href: `/media/thai/mae-${family.id}`, image: `/assets/final-consonants/${family.id}.webp`, imageLabel: family.name })),
      { title: "อาณาจักรภาษาไทย อ่านออก เขียนได้", description: "รู้จักพยัญชนะ เรียนตำแหน่งสระ ประสมคำ ฝึกตอบ และเล่นรถไฟเก็บคำ", grades: "ป.1 · 15–25 นาที", type: "พยัญชนะ สระ และประสมคำ", href: "/media/thai/thai-kingdom", image: "/assets/game-covers/thai-kingdom.webp" },
    ],
    outcomes: ["บอกชื่อพยัญชนะและเชื่อมเสียงกับภาพคำได้", "รู้ตำแหน่งของสระและประสมคำได้", "จำแนกมาตราตัวสะกดจากเสียงท้ายและรูปพยัญชนะได้", "เข้าใจความหมายและเลือกใช้สำนวนให้เหมาะกับสถานการณ์", "อ่านออกเสียงคำและข้อความได้ถูกต้องคล่องแคล่ว"],
    relatedArticles: [
      { t: "8 กิจกรรมสอนอ่านเขียนภาษาไทย ป.1 พยัญชนะ สระ และการประสมคำ", href: "/blog/thai-reading-writing-activities" },
      { t: "ตัวอย่างแผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล", href: "/blog/digital-teaching-media" },
      { t: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที", href: "/blog/random-name-activities" },
      { t: "จับเวลาในห้องเรียน 8 วิธีใช้ให้คุมคาบเรียนได้จริง", href: "/blog/classroom-timer-activities" },
    ],
  },
};
