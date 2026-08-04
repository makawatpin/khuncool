import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "คอร์สเรียน Excel ฟรี สอนตั้งแต่พื้นฐาน เรียนจบมีใบเซอร์ | Khuncool",
  description:
    "รีวิวคอร์สเรียน Excel ฟรี Excel for Everyone จาก BorntoDev สอนตั้งแต่พื้นฐานถึง VLOOKUP, IF และ Dashboard เรียนจบมีใบประกาศนียบัตร ไม่ต้องมีพื้นฐานก็เรียนได้",
  alternates: {
    canonical: "https://www.khuncool.com/blog/excel-for-everyone",
  },
  openGraph: {
    type: "article",
    title: "คอร์สเรียน Excel ฟรี สอนตั้งแต่พื้นฐาน เรียนจบมีใบเซอร์",
    description:
      "รีวิวคอร์สเรียน Excel ฟรี Excel for Everyone จาก BorntoDev สอนตั้งแต่พื้นฐานถึง VLOOKUP, IF และ Dashboard เรียนจบมีใบประกาศนียบัตร",
    images: ["https://www.khuncool.com/assets/excel-for-everyone-cover.webp"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "หน้าแรก",
          item: "https://www.khuncool.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "บทความ",
          item: "https://www.khuncool.com/articles",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "แหล่งอบรมฟรี",
          item: "https://www.khuncool.com/blog/excel-for-everyone",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      headline: "คอร์สเรียน Excel ฟรี สอนตั้งแต่พื้นฐาน เรียนจบมีใบเซอร์",
      inLanguage: "th",
      datePublished: "2026-08-04",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/excel-for-everyone-cover.webp",
      mainEntityOfPage: "https://www.khuncool.com/blog/excel-for-everyone",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "คอร์ส Excel for Everyone เรียนฟรีจริงไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "เรียนฟรีจริง ไม่มีค่าใช้จ่ายใด ๆ เพียงสมัครสมาชิก BorntoDev School แล้วเริ่มเรียนได้ทันที",
          },
        },
        {
          "@type": "Question",
          name: "ไม่เคยใช้ Excel มาก่อนเรียนคอร์สนี้ได้ไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ได้ คอร์สนี้ออกแบบมาให้เริ่มจากศูนย์ สอนตั้งแต่การเปิดโปรแกรม การจัดการแผ่นงาน ไปจนถึงสูตรขั้นสูง เหมาะกับผู้ที่ไม่เคยใช้ Excel มาก่อน",
          },
        },
        {
          "@type": "Question",
          name: "เรียนจบแล้วได้ใบประกาศนียบัตรไหม",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ได้ หลังจากเรียนจบทุกบทเรียนและส่ง Project ท้ายคอร์สแล้ว จะได้รับใบประกาศนียบัตร (Certificate) ทันที",
          },
        },
      ],
    },
  ],
};

const stats = [
  {
    icon: "📈",
    head: "เงินเดือนสายที่ใช้ Excel มีแนวโน้มเพิ่มขึ้น",
    body: "ผลสำรวจเงินเดือนประจำปี 2024/2025 โดย Aon พบว่าเงินเดือนในไทยมีแนวโน้มเพิ่มขึ้นราว 5% และ Excel ยังเป็นเครื่องมือหลักที่องค์กรใช้จัดการข้อมูล",
  },
  {
    icon: "🌏",
    head: "ทักษะที่ต้องการมากที่สุดใน 15 ประเทศ",
    body: "จากข้อมูลของ GeeksforGeeks (2024) Excel ติดอันดับทักษะที่ต้องการมากที่สุดใน 15 ประเทศ และมีตำแหน่งงานรายได้สูงกว่า 20 ตำแหน่งที่กำหนดให้ Excel เป็นทักษะจำเป็น",
  },
];

const outcomes = [
  "จัดการและวิเคราะห์ข้อมูลได้อย่างมีประสิทธิภาพ",
  "ลดเวลาการทำงานด้วยสูตรและฟังก์ชันอัตโนมัติ",
  "สร้างรายงานและกราฟที่น่าเชื่อถือสำหรับการนำเสนอ",
  "เพิ่มมูลค่าให้ตัวเองในตลาดแรงงานด้วยทักษะที่องค์กรต้องการ",
];

const sections = [
  {
    n: "01",
    h: "ปูพื้นฐานกันใหม่กับ Excel",
    t: "การนำทางโปรแกรม การจัดการแผ่นงาน สูตร SUM() การตกแต่งตาราง และการบันทึกไฟล์ (มีพื้นฐานแล้วข้ามทำแบบฝึกหัดได้เลย)",
  },
  {
    n: "02",
    h: "ฟังก์ชันพื้นฐานที่ต้องใช้เกือบทุกงาน",
    t: "SUM, AVERAGE, COUNT และฟังก์ชันคำนวณที่ใช้บ่อยในการทำงานจริง",
  },
  {
    n: "03",
    h: "รู้จักกับเงื่อนไข",
    t: "ฟังก์ชันเชิงตรรกะอย่าง IF และ VLOOKUP เพื่อจัดการข้อมูลตามเงื่อนไขที่ซับซ้อนขึ้น",
  },
  {
    n: "04",
    h: "เทคนิคการใช้งาน Excel ที่พลาดไม่ได้",
    t: "การกรองและเรียงข้อมูลขนาดใหญ่ การสร้าง Chart และ Graph นำเสนอข้อมูลอย่างมืออาชีพ",
  },
  {
    n: "05",
    h: "ส่ง Project เพื่อรับ Certificate",
    t: "ลงมือทำโปรเจกต์จริงแล้วส่งงาน เพื่อรับใบประกาศนียบัตรเมื่อเรียนจบ",
  },
];

const specs = [
  { k: "ระยะเวลาเรียน", v: "2 ชั่วโมง (30 บทเรียน)" },
  { k: "ค่าใช้จ่าย", v: "ฟรี" },
  { k: "ระดับ", v: "เริ่มต้น ไม่ต้องมีพื้นฐาน" },
  { k: "รูปแบบเรียน", v: "ออนไลน์ 100%" },
  { k: "โปรเจกต์จบคอร์ส", v: "มี" },
  { k: "ใบเซอร์", v: "มี ✅" },
  { k: "หมวดหมู่", v: "Data & Analytics · Excel" },
  { k: "ซอฟต์แวร์ที่ใช้", v: "Microsoft Excel" },
];

const quickFacts = [
  { icon: "⏱️", k: "ระยะเวลา", v: "2 ชม." },
  { icon: "💸", k: "ค่าใช้จ่าย", v: "ฟรี" },
  { icon: "📚", k: "บทเรียน", v: "30 บท" },
  { icon: "🎓", k: "ใบเซอร์", v: "มี" },
  { icon: "🏛️", k: "ผู้จัด", v: "BorntoDev" },
];

const targets = [
  "ผู้ที่ไม่เคยใช้ Excel มาก่อน - เริ่มต้นจากศูนย์สู่การใช้งานได้จริง",
  "พนักงานออฟฟิศ - ที่ต้องการเพิ่มประสิทธิภาพการทำงาน",
  "นักศึกษา - เตรียมความพร้อมก่อนเข้าสู่ตลาดแรงงาน",
  "เจ้าของธุรกิจ - ที่ต้องการจัดการข้อมูลด้วยตนเอง",
  "ผู้ที่ต้องการเปลี่ยนสายงาน - เข้าสู่งานที่ต้องใช้การวิเคราะห์ข้อมูล",
  "คนที่ใช้ Excel ไม่คล่อง - ต้องการทบทวนและเพิ่มทักษะ",
];

const reasons = [
  {
    icon: "👨‍🏫",
    head: "สอนโดยผู้ก่อตั้ง BorntoDev ตัวจริง",
    body: "ผู้สอนมีประสบการณ์สอนด้านเทคโนโลยีมากกว่า 10 ปี มีผู้เรียนสะสมกว่า 3 แสนคนทั่วประเทศ และได้รับ Verified Certificate จาก MIT",
  },
  {
    icon: "🪜",
    head: "เรียนแบบ Step-by-Step",
    body: "เริ่มจากพื้นฐานไปสู่การใช้งานขั้นสูง พร้อม Workshop และ Case Study ที่ใช้ในการทำงานจริง ไม่ใช่แค่ทฤษฎี",
  },
  {
    icon: "🆓",
    head: "เรียนฟรี มีใบเซอร์",
    body: "ไม่มีค่าใช้จ่าย สมัครแล้วเริ่มเรียนได้ทันที เก็บใบเซอร์ไว้เป็นหลักฐานการพัฒนาตนเองหรือใช้ประกอบพอร์ตงาน",
  },
  {
    icon: "⭐",
    head: "รีวิวจากผู้เรียนจริงกว่า 5,700 คน",
    body: "คะแนนเฉลี่ย 4.9/5 จาก 241 รีวิว ผู้เรียนหลายคนยืนยันว่าสอนเข้าใจง่ายและนำไปใช้งานจริงได้ทันที",
  },
];

const steps = [
  "กดปุ่มลงทะเบียนเรียนที่ลิงก์ด้านล่าง",
  "สมัครสมาชิก BorntoDev School ฟรี หรือล็อกอินหากมีบัญชีอยู่แล้ว",
  "เริ่มเรียนตามลำดับ Section 1 ถึง Section 4 ทั้งหมด 30 บทเรียน",
  "ลงมือทำโปรเจกต์จริงใน Section 5 แล้วส่งงาน",
  "รับใบประกาศนียบัตร (Certificate) หลังส่งโปรเจกต์ผ่านเกณฑ์",
];

const tags = [
  "เรียน Excel ฟรี",
  "คอร์ส Excel มือใหม่",
  "คอร์สเรียนฟรีมีใบเซอร์",
  "BorntoDev",
  "VLOOKUP",
  "IF Excel",
  "อบรมออนไลน์ฟรี",
];

export default function BlogExcelForEveryonePage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="breadcrumb">
        <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
          <Link href="/" className="text-ink-faint">
            หน้าแรก
          </Link>
          <span>›</span>
          <Link href="/articles" className="text-ink-faint">
            บทความ
          </Link>
          <span>›</span>
          <span
            className="font-semibold text-ink-secondary"
            aria-current="page"
          >
            แหล่งอบรมฟรี
          </span>
        </div>
      </nav>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/excel-for-everyone-cover.webp"
          alt="คอร์สเรียน Excel ฟรี สอนตั้งแต่พื้นฐาน เรียนจบมีใบเซอร์ Excel for Everyone"
          width={1200}
          height={630}
          priority
          className="block w-full rounded-card-lg bg-[#F1F3F6] object-cover md:rounded-[20px]"
        />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#DFF5EF] px-2.5 py-1 text-[12px] font-bold text-[#0A7A66] md:px-[11px] md:py-[5px]">
              อบรมฟรี
            </span>
            <span className="rounded-pill bg-[#FFF8EE] px-2.5 py-1 text-[12px] font-semibold text-[#8A5A1A] md:px-[11px] md:py-[5px]">
              มีใบเซอร์ ✅
            </span>
            <span className="text-[12px] text-ink-faint">
              4 ส.ค. 2569 · อ่าน 6 นาที · โดย ทีมคุณคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            คอร์สเรียน Excel ฟรี สอนตั้งแต่พื้นฐาน เรียนจบมีใบเซอร์
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            ใครที่ยังใช้ Excel ไม่คล่อง หรือไม่เคยจับโปรแกรมนี้มาก่อนเลย
            วันนี้คุณคูลมีคอร์สเรียนฟรีมาแนะนำ &quot;Excel for Everyone&quot;
            จาก BorntoDev สอนตั้งแต่พื้นฐานสุด ๆ ไปจนถึงสูตรที่ใช้งานจริงในออฟฟิศ
            เรียนจบรับใบประกาศนียบัตรได้ฟรี ไม่มีค่าใช้จ่าย
          </p>

          <h2 className="text-xl md:text-2xl">คอร์สนี้คือคอร์สอะไร</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            <b>Excel for Everyone</b> เป็นคอร์สเรียนออนไลน์ฟรีจาก{" "}
            <b>BorntoDev School</b> แพลตฟอร์มเรียนออนไลน์ด้านเทคโนโลยีที่มีผู้เรียนสะสมกว่า
            111,241 คน สอนโดย Kittikorn Prasertsak ผู้ก่อตั้ง BorntoDev
            ออกแบบมาให้ผู้เรียนเริ่มจากศูนย์ได้จริง
            ไม่จำเป็นต้องมีพื้นฐาน Excel มาก่อน
          </p>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            คอร์สใช้เวลาเรียนประมาณ 2 ชั่วโมง แบ่งเป็น 30 บทเรียนสั้น ๆ
            เรียนจบในวันเดียวได้สบาย ๆ ปัจจุบันมีผู้เรียนแล้วกว่า 5,763 คน
            คะแนนรีวิวเฉลี่ย 4.9 จาก 5 (241 รีวิว)
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">
            ทำไม Excel ยังเป็นทักษะสำคัญในทุกสายอาชีพ
          </h2>
          <div className="mt-3 flex flex-col gap-2.5 md:gap-3.5">
            {stats.map((s) => (
              <div
                key={s.head}
                className="rounded-2xl border border-[#E5E8EE] bg-white p-3.5 md:p-4"
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-lg md:text-[19px]">{s.icon}</span>
                  <span className="text-sm font-bold md:text-[15.5px]">
                    {s.head}
                  </span>
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {s.body}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">ผู้เรียนจะได้อะไรบ้าง</h2>
          <div className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-[11px]">
            {outcomes.map((o) => (
              <div
                key={o}
                className="flex items-start gap-2.5 rounded-2xl border border-[#E5E8EE] bg-white p-3 md:gap-[11px] md:p-3.5"
              >
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-[#DFF5EF] text-xs font-bold text-[#0A7A66] md:h-[22px] md:w-[22px]">
                  ✓
                </span>
                <span className="text-sm leading-[1.7] text-[#2E3440] md:text-[14.5px] md:leading-[1.65]">
                  {o}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">เนื้อหาในคอร์ส (5 Section)</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {sections.map((s) => (
              <div
                key={s.n}
                className="flex gap-3 rounded-2xl border border-[#E5E8EE] bg-white p-3.5 md:gap-4 md:p-4"
              >
                <span className="flex-none text-lg font-black text-[#C6C9FB] md:text-xl">
                  {s.n}
                </span>
                <div>
                  <div className="text-sm font-bold md:text-[15.5px]">
                    {s.h}
                  </div>
                  <div className="mt-1 text-[13px] leading-[1.7] text-ink-secondary md:text-sm">
                    {s.t}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">รายละเอียดคอร์สแบบสรุป</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E8EE]">
            {specs.map((s) => (
              <div
                key={s.k}
                className="flex gap-2.5 border-t border-border bg-white p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]"
              >
                <span className="w-[104px] flex-none text-xs font-semibold text-ink-faint md:w-[170px] md:text-[13.5px]">
                  {s.k}
                </span>
                <span className="flex-1 text-[13.5px] font-medium md:text-base">
                  {s.v}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#E5E8EE] bg-surface-light p-4 md:mt-6 md:p-[20px_22px]">
            <div className="mb-2 text-xs font-bold text-ink-faint md:mb-2.5 md:text-[13px]">
              ผู้สอน
            </div>
            <div className="text-sm leading-[1.7] md:text-[15px]">
              <b>Kittikorn Prasertsak</b>
              <div className="mt-1 text-[13px] leading-[1.7] text-ink-secondary">
                จากนักศึกษาเกียรตินิยมอันดับ 1 สู่ผู้ก่อตั้ง BorntoDev
                มีประสบการณ์และความหลงใหลในการพัฒนาโปรแกรมมากกว่า 10 ปี
                ได้รับ Verified Certificate จาก Massachusetts Institute of
                Technology (MIT) และเป็นวิทยากรรับเชิญด้านเทคโนโลยีให้กับนิสิต
                นักศึกษา นักพัฒนาซอฟต์แวร์ และครูโรงเรียนมัธยมปลายทั่วประเทศ
                ปัจจุบันมีผู้เรียนกับ BorntoDev มากกว่า 111,241 คน จาก 68
                คอร์ส คะแนนรีวิวเฉลี่ย 4.9 ดาว
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">คอร์สนี้เหมาะกับใคร</h2>
          <div className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-[11px]">
            {targets.map((t) => (
              <div
                key={t}
                className="flex items-start gap-2.5 rounded-2xl border border-[#E5E8EE] bg-white p-3 md:gap-[11px] md:p-3.5"
              >
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-[#E1E3FD] text-xs font-bold text-[#3D38B4] md:h-[22px] md:w-[22px]">
                  ✦
                </span>
                <span className="text-sm leading-[1.7] text-[#2E3440] md:text-[14.5px] md:leading-[1.65]">
                  {t}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">ทำไมควรเรียนคอร์สนี้</h2>
          <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
            {reasons.map((r) => (
              <div
                key={r.head}
                className="rounded-2xl border border-[#E5E8EE] bg-white p-3.5 md:p-4"
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-lg md:text-[19px]">{r.icon}</span>
                  <span className="text-sm font-bold md:text-[15.5px]">
                    {r.head}
                  </span>
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {r.body}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">วิธีสมัครเรียน</h2>
          <div className="mt-3 flex flex-col gap-3 md:gap-[13px]">
            {steps.map((s, i) => (
              <div key={s} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:h-7 md:w-7 md:text-[13.5px]">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm leading-[1.65] text-[#2E3440] md:text-[15.5px] md:leading-[1.7]">
                  {s}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#C6C9FB] bg-[#F5F6FF] p-4 md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">
                พร้อมเริ่มเรียนแล้ว?
              </div>
              <div className="text-[13.5px] text-ink-secondary">
                สมัครสมาชิก BorntoDev School ฟรี · เรียนจบรับใบเซอร์ทันที
              </div>
            </div>
            <a
              href="https://school.borntodev.com/course/excel-for-everyone"
              target="_blank"
              rel="noopener"
              className="flex-none rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white no-underline shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:bg-[#4A46D6]"
            >
              ลงทะเบียนเรียนฟรี ↗
            </a>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">คำถามที่พบบ่อย</h2>
          <div className="mt-3 flex flex-col gap-3">
            <div className="rounded-2xl border border-[#E5E8EE] bg-white p-3.5 md:p-4">
              <div className="text-sm font-bold md:text-[15.5px]">
                คอร์ส Excel for Everyone เรียนฟรีจริงไหม
              </div>
              <div className="mt-1.5 text-[13px] leading-[1.7] text-ink-secondary md:text-sm">
                เรียนฟรีจริง ไม่มีค่าใช้จ่ายใด ๆ
                เพียงสมัครสมาชิก BorntoDev School แล้วเริ่มเรียนได้ทันที
              </div>
            </div>
            <div className="rounded-2xl border border-[#E5E8EE] bg-white p-3.5 md:p-4">
              <div className="text-sm font-bold md:text-[15.5px]">
                ไม่เคยใช้ Excel มาก่อนเรียนคอร์สนี้ได้ไหม
              </div>
              <div className="mt-1.5 text-[13px] leading-[1.7] text-ink-secondary md:text-sm">
                ได้ คอร์สนี้ออกแบบมาให้เริ่มจากศูนย์
                สอนตั้งแต่การเปิดโปรแกรม การจัดการแผ่นงาน ไปจนถึงสูตรขั้นสูง
                เหมาะกับผู้ที่ไม่เคยใช้ Excel มาก่อน
              </div>
            </div>
            <div className="rounded-2xl border border-[#E5E8EE] bg-white p-3.5 md:p-4">
              <div className="text-sm font-bold md:text-[15.5px]">
                เรียนจบแล้วได้ใบประกาศนียบัตรไหม
              </div>
              <div className="mt-1.5 text-[13px] leading-[1.7] text-ink-secondary md:text-sm">
                ได้ หลังจากเรียนจบทุกบทเรียนและส่ง Project ท้ายคอร์สแล้ว
                จะได้รับใบประกาศนียบัตร (Certificate) ทันที
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">
              อยากหาคอร์สฟรีแบบนี้อีก ต้องดูที่ไหน
            </h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              นอกจากคอร์สนี้ BorntoDev School ยังมีคอร์สเรียนฟรีในโครงการ OPEN
              ACCESS อีกหลายคอร์ส ครอบคลุมด้าน Data & Analytics และเทคโนโลยีอื่น
              ๆ ใครที่อยากพัฒนาตัวเองต่อเนื่องเลือกเรียนเพิ่มได้ที่เว็บไซต์
              BorntoDev School โดยตรง คุณคูลจะคอยรวบรวมแหล่งอบรมฟรีดี ๆ มาฝากเรื่อย
              ๆ ติดตามได้ที่หมวด <Link href="/">แหล่งอบรมฟรี</Link>{" "}
              ของเว็บไซต์นี้
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-pill bg-surface-light px-2.5 py-1.5 text-[11.5px] font-medium text-ink-secondary"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </article>

        <aside className="mt-8 flex flex-col gap-4 md:mt-0">
          <div className="rounded-2xl border border-[#E5E8EE] bg-white p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-ink-faint">
              สรุปคอร์สนี้
            </div>
            <div className="flex flex-col gap-2.5">
              {quickFacts.map((q) => (
                <div key={q.k} className="flex items-center gap-2.5">
                  <span className="flex-none text-base">{q.icon}</span>
                  <span className="flex-1 text-[13px] text-ink-faint">
                    {q.k}
                  </span>
                  <span className="flex-none text-[13.5px] font-bold">
                    {q.v}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="https://school.borntodev.com/course/excel-for-everyone"
              target="_blank"
              rel="noopener"
              className="mt-4 block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white no-underline hover:bg-[#4A46D6]"
            >
              สมัครเรียนฟรี ↗
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
