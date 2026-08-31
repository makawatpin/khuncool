import type { ConfusionGroupId, FamilyId, FinalConsonantFamily } from "./types.ts";

const draftSeo = {
  status: "draft" as const,
  uniqueIntroduction: "",
  soundExplanation: "",
  consonantExplanation: "",
  commonErrors: [],
  contrastExplanation: "",
  classroomActivity: "",
  teacherCheck: "",
  faqs: [],
  metaTitle: "",
  metaDescription: "",
};

export const FAMILIES: FinalConsonantFamily[] = [
  { id: "kaa", name: "แม่ ก กา", shortName: "ก กา", group: "none", confusionGroupId: "glides", endingSound: "ไม่มีเสียงตัวสะกด", consonants: [], teachingTip: "ออกเสียงจบที่สระ ไม่มีพยัญชนะท้ายพยางค์", commonMistake: "เห็นคำลงท้ายด้วยสระแล้วคิดว่าต้องเป็นแม่เกยหรือแม่เกอว", color: "#F59E0B", seo: draftSeo },
  { id: "kong", name: "แม่กง", shortName: "กง", group: "direct", confusionGroupId: "nasals", endingSound: "ง", consonants: ["ง"], teachingTip: "แตะหลังลิ้นกับเพดานอ่อน เสียงก้องออกทางจมูก", commonMistake: "สับสนกับแม่กนและแม่กมเมื่อฟังคำเร็ว", color: "#14B8A6", seo: draftSeo },
  { id: "kom", name: "แม่กม", shortName: "กม", group: "direct", confusionGroupId: "nasals", endingSound: "ม", consonants: ["ม"], teachingTip: "ปิดริมฝีปากแล้วปล่อยเสียงก้องออกทางจมูก", commonMistake: "ฟังเป็นแม่กนเมื่อไม่สังเกตว่าริมฝีปากปิด", color: "#22C55E", seo: draftSeo },
  { id: "koei", name: "แม่เกย", shortName: "เกย", group: "direct", confusionGroupId: "glides", endingSound: "ย", consonants: ["ย"], teachingTip: "เสียงท้ายไหลไปทาง ย เช่น ขาย ลอย", commonMistake: "สับสนกับคำแม่ ก กา ที่มีรูปสระคล้ายกัน", color: "#8B5CF6", seo: draftSeo },
  { id: "koew", name: "แม่เกอว", shortName: "เกอว", group: "direct", confusionGroupId: "glides", endingSound: "ว", consonants: ["ว"], teachingTip: "เสียงท้ายไหลไปทาง ว และริมฝีปากห่อเล็กน้อย", commonMistake: "สับสนแม่เกยเมื่ออ่านเสียงท้ายไม่ชัด", color: "#EC4899", seo: draftSeo },
  { id: "kok", name: "แม่กก", shortName: "กก", group: "indirect", confusionGroupId: "stops", endingSound: "ก", consonants: ["ก", "ข", "ค", "ฆ"], teachingTip: "ไม่ว่ารูปท้ายเป็น ก ข ค หรือ ฆ ให้อ่านเป็นเสียง ก", commonMistake: "เลือกแม่จากรูปตัวอักษรแทนการฟังเสียง ก ท้ายคำ", color: "#F97316", seo: draftSeo },
  {
    id: "kot", name: "แม่กด", shortName: "กด", group: "indirect", confusionGroupId: "stops", endingSound: "ด", consonants: ["จ", "ช", "ซ", "ฎ", "ฏ", "ฐ", "ฑ", "ฒ", "ด", "ต", "ถ", "ท", "ธ", "ศ", "ษ", "ส"], teachingTip: "พยัญชนะท้ายหลายรูปออกเสียงปิดสั้นเป็นเสียง ด", commonMistake: "จำเฉพาะ ด และ ต แล้วพลาดคำอย่าง รถ บท กฎ หรือ อากาศ", color: "#E11D48",
    seo: {
      status: "ready",
      uniqueIntroduction: "แม่กดเป็นมาตราที่มีรูปตัวสะกดหลากหลายที่สุด เด็กจึงต้องฟังเสียงท้ายและฝึกเทียบคำ ไม่ใช่จำเพียง ด เด็ก",
      soundExplanation: "เมื่อเป็นตัวสะกด พยัญชนะในกลุ่มแม่กดออกเสียงปลายคำเป็นเสียง ด แบบสั้นและปิด เช่น มด รถ บท กฎ และอากาศ",
      consonantExplanation: "ตัวสะกดแม่กดที่ใช้เรียน ได้แก่ จ ช ซ ฎ ฏ ฐ ฑ ฒ ด ต ถ ท ธ ศ ษ และ ส แต่ควรเรียนผ่านคำจริงทีละกลุ่ม",
      commonErrors: [
        { word: "รถ", mistake: "จัดเป็นแม่กบเพราะเห็น ถ", explanation: "รถออกเสียงท้าย ด จึงอยู่แม่กด" },
        { word: "กฎ", mistake: "อ่านตัวท้ายตามชื่อ ฎ", explanation: "เมื่อ ฎ เป็นตัวสะกดให้ออกเสียงท้าย ด" },
        { word: "บท", mistake: "จัดตาม ท ทหาร", explanation: "ท ทหารเมื่ออยู่ท้ายคำออกเสียง ด" },
        { word: "อากาศ", mistake: "มองข้าม ศ เพราะเป็นคำหลายพยางค์", explanation: "พยางค์ กาศ ลงท้ายเสียง ด จึงเป็นแม่กด" },
        { word: "กระดาษ", mistake: "คิดว่าเป็นแม่กาดตามรูปคำ", explanation: "มาตราดูจากเสียงท้าย กระ-ดาด จึงเป็นแม่กด" },
      ],
      contrastExplanation: "เปรียบเทียบคำว่า มด–นก–กบ: ทั้งสามจบเสียงสั้น แต่ตำแหน่งปากต่างกัน จึงอยู่แม่กด แม่กก และแม่กบ",
      classroomActivity: "ให้เด็กแตะคอและสังเกตปากขณะพูดคำคู่ มด–นก–กบ ช้า ๆ จากนั้นชูบัตรบ้าน กด กก หรือ กบ",
      teacherCheck: "ใช้คำใหม่ที่ไม่ได้อยู่ในตัวอย่างสอนอย่าง รถ บท และรส ถ้าเด็กอธิบายเสียงท้ายได้ แสดงว่าไม่ได้จำเพียงตำแหน่งคำ",
      faqs: [
        { question: "ทำไมรถจึงอยู่แม่กด", answer: "เพราะ ถ ที่ท้ายคำรถออกเสียงเป็นเสียง ด เมื่อเป็นตัวสะกด" },
        { question: "แม่กดต่างจากแม่กกและแม่กบอย่างไร", answer: "ทั้งสามเป็นเสียงปิดสั้น แต่แม่กดจบเสียง ด แม่กกจบเสียง ก และแม่กบจบเสียง บ" },
        { question: "ควรให้เด็กท่องพยัญชนะทั้ง 16 ตัวหรือไม่", answer: "ควรเริ่มจากฟังเสียงและจัดคำจริงเป็นกลุ่ม แล้วใช้รายชื่อพยัญชนะเป็นแผนที่สรุปภายหลัง" },
      ],
      metaTitle: "แม่กด ป.1–ป.3 สื่อการสอนและเกมแยกแม่กด กก กบ | khuncool",
      metaDescription: "เรียนมาตราตัวสะกดแม่กดผ่านเสียงท้าย ตัวอย่างคำที่มักสับสน และเกมเปรียบเทียบแม่กด แม่กก แม่กบ ใช้ฟรีบนจอห้องเรียน",
    },
  },
  { id: "kon", name: "แม่กน", shortName: "กน", group: "indirect", confusionGroupId: "nasals", endingSound: "น", consonants: ["ญ", "ณ", "น", "ร", "ล", "ฬ"], teachingTip: "พยัญชนะท้ายหลายรูปออกเสียงเป็นเสียง น", commonMistake: "สับสนกับแม่กงและแม่กมซึ่งเป็นเสียงออกทางจมูกเหมือนกัน", color: "#2563EB", seo: draftSeo },
  { id: "kop", name: "แม่กบ", shortName: "กบ", group: "indirect", confusionGroupId: "stops", endingSound: "บ", consonants: ["บ", "ป", "พ", "ฟ", "ภ"], teachingTip: "ปิดริมฝีปากเพื่อจบเสียง บ ไม่ว่ารูปท้ายเป็น บ ป พ ฟ หรือ ภ", commonMistake: "สับสนกับแม่กดและแม่กกเพราะเป็นเสียงปิดสั้น", color: "#7C3AED", seo: draftSeo },
];

export const FAMILY_BY_ID = Object.fromEntries(FAMILIES.map((family) => [family.id, family])) as Record<FamilyId, FinalConsonantFamily>;

export const CONFUSION_GROUPS: Record<ConfusionGroupId, FamilyId[]> = {
  glides: ["kaa", "koei", "koew"],
  nasals: ["kong", "kom", "kon"],
  stops: ["kok", "kot", "kop"],
};

export const READY_FAMILY_ROUTES = FAMILIES
  .filter((family) => family.seo.status === "ready")
  .map((family) => ({ id: family.id, href: `/media/thai/mae-${family.id}` }));
