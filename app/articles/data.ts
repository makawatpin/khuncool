export type Category = "สื่อการสอน" | "รีวิวสินค้า" | "ข่าวการศึกษา" | "คอร์สเรียน";

export const CAT_MAP: Record<Category, { bg: string; color: string }> = {
  สื่อการสอน: { bg: "#DFF5EF", color: "#0A7A66" },
  รีวิวสินค้า: { bg: "#FFEAD5", color: "#C2500B" },
  ข่าวการศึกษา: { bg: "#E1E3FD", color: "#3D38B4" },
  คอร์สเรียน: { bg: "#FFF8EE", color: "#8A5A1A" },
};

export const CATS = (Object.keys(CAT_MAP) as Category[]).map((t) => ({
  t,
  bg: CAT_MAP[t].bg,
  color: CAT_MAP[t].color,
}));

export type Article = {
  title: string;
  cat: Category;
  date: string;
  /** ISO date (YYYY-MM-DD) backing `date` — used for JSON-LD and sitemap lastmod. */
  dateISO: string;
  readTime: string;
  img: string;
  alt: string;
  href: string;
  excerpt: string;
  /** Optional related-tool callout shown on the homepage article list (desktop/tablet only). */
  linksTool?: { label: string; href: string };
};

export const ALL_ARTICLES: Article[] = [
  {
    title: "8 เกมและกิจกรรมวิทยาการคำนวณ ป.4–ป.6 สอนได้ด้วยจอเดียว",
    cat: "สื่อการสอน",
    date: "22 ส.ค. 2569",
    dateISO: "2026-08-22",
    readTime: "9 นาที",
    img: "/assets/computing-science-games-cover.webp",
    alt: "เกมและกิจกรรมวิทยาการคำนวณ ป.4-ป.6 สำหรับครู",
    href: "/blog/computing-science-games",
    excerpt:
      "เกมและกิจกรรมวิทยาการคำนวณที่เปิดจากจอหน้าชั้นได้ทันที พร้อมกิจกรรมแบบไม่ใช้เครื่องสำหรับห้องที่ไม่มีคอมพิวเตอร์",
    linksTool: { label: "สื่อวิทยาการคำนวณ", href: "/media/computer" },
  },
  {
    title: "8 กิจกรรมสอนคำศัพท์ครอบครัวภาษาอังกฤษ ด้วยผัง Family Tree",
    cat: "สื่อการสอน",
    date: "22 ส.ค. 2569",
    dateISO: "2026-08-22",
    readTime: "9 นาที",
    img: "/assets/family-tree-english-cover.webp",
    alt: "กิจกรรมสอนคำศัพท์ครอบครัวภาษาอังกฤษด้วยผัง Family Tree",
    href: "/blog/family-tree-english",
    excerpt:
      "สอนคำศัพท์ครอบครัวจากผังความสัมพันธ์ก่อนท่องคำ พร้อมจุดที่นักเรียนไทยพลาดบ่อยอย่าง ลุง ป้า น้า อา และการบอกพี่หรือน้อง",
    linksTool: { label: "เปิดผัง Family Tree", href: "/media/english/family-tree" },
  },
  {
    title: "7 เกมสุ่มชื่อนักเรียนออนไลน์ฟรี ใช้ได้ทันทีในห้องเรียน",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "8 นาที",
    img: "/assets/random-student-picker-games-cover.webp",
    alt: "7 เกมสุ่มชื่อนักเรียนออนไลน์ฟรีสำหรับครู",
    href: "/blog/random-student-picker-games",
    excerpt: "รวมวงล้อสุ่ม เกมเป็ดสุ่ม แบ่งกลุ่ม และสุ่มคำถาม พร้อมแนวทางเลือกเครื่องมือให้เหมาะกับแต่ละกิจกรรม",
    linksTool: { label: "เกมเป็ดสุ่มชื่อ", href: "/duck-race" },
  },
  {
    title: "10 กิจกรรมใช้เกมเป็ดสุ่มในห้องเรียน สนุกและได้เรียนรู้",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "8 นาที",
    img: "/assets/duck-race-classroom-activities-cover.webp",
    alt: "10 กิจกรรมใช้เกมเป็ดสุ่มในห้องเรียน",
    href: "/blog/duck-race-classroom-activities",
    excerpt: "ไอเดียใช้เกมเป็ดสุ่มกับการทบทวนบทเรียน นำเสนอ แบ่งบทบาท และ Exit Ticket โดยไม่ให้เกมแย่งเป้าหมายการเรียนรู้",
    linksTool: { label: "เปิดเกมเป็ดสุ่ม", href: "/duck-race" },
  },
  {
    title: "วงล้อสุ่ม vs เกมเป็ดสุ่ม ใช้อันไหนดีในห้องเรียน",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "7 นาที",
    img: "/assets/wheel-vs-duck-race-cover.webp",
    alt: "เปรียบเทียบวงล้อสุ่มกับเกมเป็ดสุ่มในห้องเรียน",
    href: "/blog/wheel-vs-duck-race",
    excerpt: "เปรียบเทียบความเร็ว บรรยากาศ จำนวนรอบ และสถานการณ์ใช้งาน เพื่อเลือกเครื่องมือสุ่มชื่อให้เหมาะกับคาบเรียน",
    linksTool: { label: "เปรียบเทียบเครื่องมือ", href: "/blog/wheel-vs-duck-race" },
  },
  {
    title: "สุ่มเลขที่นักเรียนด้วยเกมเป็ดสุ่ม (Duck Race) ใช้ยังไง ให้สนุกกว่าเรียกชื่อทีละคน",
    cat: "สื่อการสอน",
    date: "18 ส.ค. 2569",
    dateISO: "2026-08-18",
    readTime: "6 นาที",
    img: "/assets/duck-race-roll-number-cover.webp",
    alt: "สุ่มเลขที่นักเรียนด้วยเกมเป็ดสุ่ม Duck Race",
    href: "/blog/duck-race-roll-number",
    excerpt: "วิธีใส่เลขที่นักเรียนแทนชื่อในเกมเป็ดสุ่ม พร้อมเทียบว่าเมื่อไรควรสุ่มด้วยเลขที่ เมื่อไรควรสุ่มด้วยชื่อ",
    linksTool: { label: "เปิดเกมเป็ดสุ่ม", href: "/duck-race" },
  },
  {
    title: "15 เกมคำศัพท์ภาษาอังกฤษในห้องเรียน เด็กประถมเล่นได้",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "10 นาที",
    img: "/assets/english-vocabulary-games-cover.webp",
    alt: "15 เกมคำศัพท์ภาษาอังกฤษในห้องเรียนสำหรับเด็กประถม",
    href: "/blog/english-vocabulary-games",
    excerpt: "รวม Vocabulary Arcade, Phonics Bingo, Family Tree และกิจกรรมฝึกคำศัพท์ พร้อมวิธีต่อยอดสู่การพูดและเขียน",
    linksTool: { label: "เกมภาษาอังกฤษ", href: "/media/english" },
  },
  {
    title: "10 สื่อการสอนออนไลน์ใช้ฟรีจาก KhunCool ตัวช่วยจัดการห้องเรียนสำหรับครูยุคดิจิทัล",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "9 นาที",
    img: "/assets/10-free-teaching-tools-cover.webp",
    alt: "10 สื่อการสอนออนไลน์ใช้ฟรีจาก KhunCool สำหรับจัดการห้องเรียน",
    href: "/blog/10-free-teaching-tools",
    excerpt: "รวม 10 เครื่องมือครูออนไลน์ พร้อมตัวอย่างใช้จริง ตั้งแต่สุ่มชื่อ แบ่งกลุ่ม จับเวลา ไปจนถึงเช็กชื่อและบันทึกโฮมรูม",
    linksTool: { label: "เครื่องมือทั้งหมด", href: "/tools" },
  },
  {
    title: "ตัวอย่างแผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล KhunCool",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "10 นาที",
    img: "/assets/digital-teaching-media-cover-v2.webp",
    alt: "ตัวอย่างแผนจัดการเรียนรู้ 50 นาทีด้วยสื่อดิจิทัล KhunCool",
    href: "/blog/digital-teaching-media",
    excerpt: "ตัวอย่างลำดับกิจกรรม 5 ช่วง ตั้งแต่นำเข้าสู่บทเรียน ทำงานกลุ่ม ไปจนถึง Exit Ticket พร้อมเวลาที่ใช้และหลักฐานการเรียนรู้",
    linksTool: { label: "ดูแผน 50 นาที", href: "/blog/digital-teaching-media" },
  },
  {
    title: "ตัวอย่างแผนสอนคำศัพท์ภาษาอังกฤษ 50 นาที สำหรับนักเรียนประถม",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "9 นาที",
    img: "/assets/english-vocabulary-lesson-plan-cover.webp",
    alt: "ตัวอย่างแผนสอนคำศัพท์ภาษาอังกฤษ 50 นาที สำหรับนักเรียนประถม",
    href: "/blog/english-vocabulary-lesson-plan",
    excerpt: "แผนสอนคำศัพท์ 5 ช่วง ตั้งแต่กระตุ้นความรู้เดิม ฟังเสียง เล่นเกม สร้างประโยค ไปจนถึง Exit Ticket",
    linksTool: { label: "สื่อภาษาอังกฤษ", href: "/media/english" },
  },
  {
    title: "7 กิจกรรม Warm-up ภาษาอังกฤษ 5 นาที เริ่มคาบให้เด็กพร้อมเรียน",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "8 นาที",
    img: "/assets/english-warm-up-activities-cover.webp",
    alt: "7 กิจกรรม Warm-up ภาษาอังกฤษ 5 นาที สำหรับครูประถม",
    href: "/blog/english-warm-up-activities",
    excerpt: "กิจกรรมสั้นสำหรับทบทวน Vocabulary, Phonics, Grammar และ Speaking โดยไม่กินเวลาจากบทเรียนหลัก",
    linksTool: { label: "เกมภาษาอังกฤษ", href: "/media/english" },
  },
  {
    title: "ระบบคะแนนกลุ่มในห้องเรียน ให้คะแนนอย่างไรไม่ให้เด็กเสียกำลังใจ",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "8 นาที",
    img: "/assets/scoreboard-cover.webp",
    alt: "ระบบคะแนนกลุ่มในห้องเรียนและกระดานคะแนนกลุ่มออนไลน์",
    href: "/blog/classroom-group-points",
    excerpt: "ออกแบบเกณฑ์คะแนนที่ส่งเสริมเหตุผล การรับฟัง และความร่วมมือ โดยไม่ตีตราหรือสร้างผู้แพ้ถาวร",
    linksTool: { label: "กระดานคะแนน", href: "/group-scoreboard" },
  },
  {
    title: "ตัวอย่างหัวข้อบันทึกโฮมรูมตลอดภาคเรียน พร้อมแนวทางเขียน",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "9 นาที",
    img: "/assets/homeroom-cover.webp",
    alt: "ตัวอย่างหัวข้อบันทึกโฮมรูมตลอดภาคเรียนสำหรับครูประจำชั้น",
    href: "/blog/homeroom-log-topics",
    excerpt: "หัวข้อโฮมรูมสำหรับการปรับตัว ความปลอดภัย สุขภาวะ และการเรียน พร้อมหลักการจดข้อเท็จจริง",
    linksTool: { label: "บันทึกโฮมรูม", href: "/tools/homeroom" },
  },
  {
    title: "แนวทางจัดกิจกรรมออมเงินนักเรียน พร้อมวิธีบันทึกยอดอย่างโปร่งใส",
    cat: "สื่อการสอน",
    date: "5 ส.ค. 2569",
    dateISO: "2026-08-05",
    readTime: "9 นาที",
    img: "/assets/savings-cover.webp",
    alt: "แนวทางจัดกิจกรรมออมเงินนักเรียนและบันทึกยอดอย่างโปร่งใส",
    href: "/blog/student-savings-activity",
    excerpt: "วางระบบรับฝาก ออกหลักฐาน ตรวจยอด และคุ้มครองข้อมูล โดยเน้นความสมัครใจและไม่เปรียบเทียบยอด",
    linksTool: { label: "บันทึกออมเงิน", href: "/tools/savings" },
  },
  {
    title: "คอร์สเรียน Excel ฟรี สอนตั้งแต่พื้นฐาน เรียนจบมีใบเซอร์",
    cat: "คอร์สเรียน",
    date: "4 ส.ค. 2569",
    dateISO: "2026-08-04",
    readTime: "6 นาที",
    img: "/assets/excel-for-everyone-cover.webp",
    alt: "คอร์สเรียน Excel ฟรี สอนตั้งแต่พื้นฐาน เรียนจบมีใบเซอร์",
    href: "/blog/excel-for-everyone",
    excerpt:
      "รีวิวคอร์สเรียน Excel ฟรี Excel for Everyone จาก BorntoDev สอนตั้งแต่พื้นฐานถึง VLOOKUP, IF และ Dashboard เรียนจบมีใบประกาศนียบัตร",
  },
  {
    title: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี ใช้งานง่าย รวดเร็ว สำหรับครูยุคดิจิทัล",
    cat: "สื่อการสอน",
    date: "2 ส.ค. 2569",
    dateISO: "2026-08-02",
    readTime: "5 นาที",
    img: "/assets/group-maker-blog-cover.webp",
    alt: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี สื่อการสอนออนไลน์",
    href: "/blog/group-maker",
    excerpt:
      "รู้จักเครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี ใช้งานง่าย รวดเร็ว รองรับห้องเรียนทุกขนาด พร้อมวิธีใช้ 4 ขั้นตอน และไอเดียนำไปใช้จริง",
    linksTool: { label: "สุ่มแบ่งกลุ่ม", href: "/group-maker" },
  },
  {
    title: "เครื่องวัดเสียงในห้องเรียน สื่อการสอนที่ช่วยคุมความดังได้จริง",
    cat: "สื่อการสอน",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "5 นาที",
    img: "/assets/noise-meter-blog-cover.webp",
    alt: "เครื่องวัดเสียงในห้องเรียน สื่อการสอนออนไลน์",
    href: "/blog/noise-meter",
    excerpt:
      "รู้จักเครื่องวัดเสียงในห้องเรียน สื่อการสอนออนไลน์ที่ช่วยให้นักเรียนเห็นและควบคุมความดังของตัวเองแบบเรียลไทม์ พร้อมวิธีใช้และไอเดียนำไปใช้จริง",
    linksTool: { label: "วัดเสียงในห้อง", href: "/classroom-noise-meter" },
  },
  {
    title: "วิธีใช้เกมแข่งเป็ดในห้องเรียน พร้อม 6 ไอเดียกิจกรรม",
    cat: "สื่อการสอน",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "5 นาที",
    img: "/assets/duck-race-blog-cover.webp",
    alt: "เกมแข่งเป็ดสุ่มชื่อนักเรียน สื่อการสอนออนไลน์",
    href: "/blog/duck-race",
    excerpt:
      "เรียนรู้วิธีใช้เกมแข่งเป็ดสุ่มชื่อ พร้อม 6 ไอเดียนำไปใช้จริงกับกิจกรรมในห้องเรียน",
    linksTool: { label: "แข่งเป็ด", href: "/duck-race" },
  },
  {
    title: "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา",
    cat: "ข่าวการศึกษา",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "4 นาที",
    img: "/assets/prachinburi2-recruit-2569-cover.webp",
    alt: "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา",
    href: "/blog/prachinburi2-recruit-2569",
    excerpt:
      "สรุปตำแหน่ง จำนวนอัตรา และช่วงเวลารับสมัครพนักงานราชการทั่วไป สพป.ปราจีนบุรี เขต 2 สมัคร 3-7 สิงหาคม 2569",
  },
  {
    title: "มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ มีใบเซอร์",
    cat: "คอร์สเรียน",
    date: "31 ก.ค. 2569",
    dateISO: "2026-07-31",
    readTime: "6 นาที",
    img: "/assets/mahidol-pet-courses-cover.webp",
    alt: "มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์",
    href: "/blog/mahidol-pet-courses",
    excerpt:
      "รวมคอร์สเรียนออนไลน์ฟรีจากมหาวิทยาลัยมหิดล ทั้งคอร์สเข้าใจพฤติกรรมสุนัขและคอร์สมือใหม่หัดเลี้ยงแมว เรียนจบมีใบเซอร์ สอนโดยอาจารย์สัตวแพทย์ตัวจริง",
  },
  {
    title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง",
    cat: "สื่อการสอน",
    date: "27 ก.ค. 2569",
    dateISO: "2026-07-27",
    readTime: "5 นาที",
    img: "/assets/wheel-cover.webp",
    alt: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี",
    href: "/blog/wheel",
    excerpt:
      "รู้จักวงล้อสุ่มชื่อ สื่อการสอนออนไลน์ที่ช่วยให้ห้องเรียนสนุกและยุติธรรมขึ้น พร้อมวิธีใช้ 4 ขั้นตอน และ 8 ไอเดียใช้งานจริง",
    linksTool: { label: "วงล้อสุ่ม", href: "/random-name-picker" },
  },
  {
    title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
    cat: "สื่อการสอน",
    date: "26 ก.ค. 2569",
    dateISO: "2026-07-26",
    readTime: "6 นาที",
    img: "/assets/random-name-cover.webp",
    alt: "10 กิจกรรมสุ่มชื่อนักเรียน",
    href: "/blog/random-name-activities",
    excerpt:
      "รวม 10 กิจกรรมสุ่มชื่อนักเรียนที่ครูเอาไปใช้ได้ทันที ตั้งแต่วอร์มอัพต้นคาบไปจนถึงกิจกรรมท้ายชั่วโมง",
    linksTool: { label: "วงล้อสุ่ม", href: "/random-name-picker" },
  },
  {
    title: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.",
    cat: "ข่าวการศึกษา",
    date: "25 ก.ค. 2569",
    dateISO: "2026-07-25",
    readTime: "4 นาที",
    img: "/assets/royal-award-cover.webp",
    alt: "รางวัลพระราชทาน 2569",
    href: "/blog/royal-award-2569",
    excerpt:
      "สรุปช่วงเวลา ขั้นตอน และเอกสารที่โรงเรียนต้องเตรียม ก่อนยื่นคัดเลือกรางวัลพระราชทานปี 2569",
  },
  {
    title: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์สที่ครูควรรู้",
    cat: "คอร์สเรียน",
    date: "25 ก.ค. 2568",
    dateISO: "2025-07-25",
    readTime: "4 นาที",
    img: "/assets/psu-english-cover.webp",
    alt: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์",
    href: "/blog/psu-english",
    excerpt:
      "ครูท่านไหนอยากพัฒนาภาษาอังกฤษเพื่อสอบเลื่อนวิทยฐานะ คอร์สนี้เรียนฟรีและมีใบประกาศนียบัตร",
  },
  {
    title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง",
    cat: "รีวิวสินค้า",
    date: "26 ก.ค. 2568",
    dateISO: "2025-07-26",
    readTime: "4 นาที",
    img: "/assets/magnet-frame-cover-v2.webp",
    alt: "รีวิว กรอบป้ายติดผนังแม่เหล็ก",
    href: "/blog/magnetic-frame",
    excerpt:
      "จัดบอร์ดห้องเรียนให้เรียบร้อยโดยไม่ต้องเจาะผนัง รีวิวการใช้งานจริงพร้อมข้อดีข้อสังเกต",
  },
];

export const FEATURED: Article & { bg: string; color: string } = {
  ...ALL_ARTICLES[0],
  bg: CAT_MAP[ALL_ARTICLES[0].cat].bg,
  color: CAT_MAP[ALL_ARTICLES[0].cat].color,
};

export const ARTICLES: (Article & { bg: string; color: string })[] = ALL_ARTICLES.slice(
  1,
).map((a) => ({ ...a, bg: CAT_MAP[a.cat].bg, color: CAT_MAP[a.cat].color }));
