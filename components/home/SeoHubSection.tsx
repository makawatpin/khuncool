import Link from "next/link";

const CLUSTERS = [
  {
    icon: "🎲",
    title: "เครื่องมือสุ่มและจัดกิจกรรม",
    description: "สุ่มชื่อนักเรียน แบ่งกลุ่ม เลือกคำถาม และสร้างกิจกรรมแบบมีลุ้นหน้าชั้นเรียน",
    links: [
      { label: "วงล้อสุ่มชื่อ", href: "/random-name-picker" },
      { label: "เกมเป็ดสุ่มชื่อ", href: "/duck-race" },
      { label: "สุ่มแบ่งกลุ่ม", href: "/group-maker" },
      { label: "สุ่มคำถาม", href: "/random-question" },
    ],
  },
  {
    icon: "🏫",
    title: "เครื่องมือจัดการห้องเรียน",
    description: "ช่วยครูคุมเวลา บันทึกการมาเรียน จัดคะแนนกลุ่ม และดูแลบรรยากาศในห้อง",
    links: [
      { label: "ตัวจับเวลา", href: "/timer" },
      { label: "เช็กชื่อนักเรียน", href: "/tools/attendance" },
      { label: "กระดานคะแนนกลุ่ม", href: "/group-scoreboard" },
      { label: "เครื่องวัดเสียง", href: "/classroom-noise-meter" },
    ],
  },
  {
    icon: "🔤",
    title: "เกมและสื่อภาษาอังกฤษ",
    description: "สื่อสำหรับครูประถม แยกตามทักษะ Vocabulary, Phonics, Grammar และ Speaking",
    links: [
      { label: "Vocabulary Arcade", href: "/media/english/vocabulary-arcade" },
      { label: "Family Tree", href: "/media/english/family-tree" },
      { label: "Phonics Bingo", href: "/media/english/phonics-bingo" },
      { label: "เกมภาษาอังกฤษทั้งหมด", href: "/media/english" },
    ],
  },
];

export default function SeoHubSection() {
  return (
    <section className="px-4 pb-2 pt-7 md:px-6 md:pt-9 lg:px-8 lg:pt-12" aria-labelledby="seo-hub-heading">
      <div className="rounded-[20px] border border-border bg-surface-light p-4 md:p-6 lg:p-8">
        <div className="max-w-[780px]">
          <h2 id="seo-hub-heading" className="m-0 text-xl md:text-[26px]">
            เครื่องมือครูและสื่อการสอนออนไลน์ เลือกใช้ได้ตามเป้าหมาย
          </h2>
          <p className="mb-0 mt-3 text-[14px] leading-[1.8] text-ink-secondary md:text-[15px] md:leading-[1.85]">
            Khuncool รวมเครื่องมือและสื่อการสอนออนไลน์สำหรับครูไทยไว้ในที่เดียว
            ทั้งวงล้อสุ่มชื่อ เกมเป็ดสุ่ม แบ่งกลุ่ม จับเวลา เช็กชื่อ และกระดานคะแนน
            รวมถึงเกมภาษาอังกฤษสำหรับนักเรียนประถม ทุกหน้าหลักเปิดใช้งานผ่านเว็บได้ทันที
            ไม่ต้องติดตั้งโปรแกรม ครูสามารถเลือกเครื่องมือจากงานที่ต้องทำหรือทักษะที่กำลังสอน
            แล้วนำไปฉายบนจอหน้าชั้น ใช้จัดกิจกรรมทั้งห้อง หรือแชร์ลิงก์ให้นักเรียนฝึกด้วยตนเองได้
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4">
          {CLUSTERS.map((cluster) => (
            <div key={cluster.title} className="rounded-2xl border border-border bg-white p-4 md:p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="text-xl" aria-hidden="true">{cluster.icon}</span>
                <h3 className="m-0 text-[15px] leading-snug md:text-base">{cluster.title}</h3>
              </div>
              <p className="m-0 text-[13px] leading-[1.7] text-ink-secondary">{cluster.description}</p>
              <ul className="mb-0 mt-3 grid list-none gap-2 p-0">
                {cluster.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13px] font-semibold text-primary no-underline hover:underline">
                      {link.label} ›
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-[13px]">
          <span className="font-semibold text-ink">บทความแนะนำ:</span>
          <Link href="/blog/random-student-picker-games">7 เกมสุ่มชื่อนักเรียนออนไลน์</Link>
          <span aria-hidden="true">·</span>
          <Link href="/blog/duck-race-classroom-activities">10 กิจกรรมเกมเป็ดสุ่ม</Link>
          <span aria-hidden="true">·</span>
          <Link href="/blog/duck-race-roll-number">สุ่มเลขที่นักเรียนด้วยเกมเป็ดสุ่ม</Link>
          <span aria-hidden="true">·</span>
          <Link href="/blog/english-vocabulary-games">15 เกมคำศัพท์ภาษาอังกฤษ</Link>
        </div>
      </div>
    </section>
  );
}
