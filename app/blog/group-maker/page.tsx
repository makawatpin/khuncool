import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี | Random Group Maker สำหรับครู | Khuncool",
  description:
    "สุ่มแบ่งกลุ่มนักเรียนออนไลน์ฟรี ใช้งานง่าย รวดเร็ว รองรับห้องเรียนทุกขนาด เหมาะสำหรับครู อาจารย์ และวิทยากร ทดลองใช้เครื่องมือสุ่มแบ่งกลุ่มนักเรียนจาก Khuncool ได้ฟรี",
  alternates: {
    canonical: "https://www.khuncool.com/blog/group-maker",
  },
  openGraph: {
    type: "article",
    title: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี ใช้งานง่าย รวดเร็ว สำหรับครูยุคดิจิทัล",
    description:
      "วิธีใช้เครื่องมือสุ่มแบ่งกลุ่มนักเรียน พร้อมไอเดียนำไปใช้จริงในห้องเรียนและกิจกรรมอบรม",
    images: ["https://www.khuncool.com/assets/group-maker-blog-cover.webp"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const benefits = [
  {
    icon: "🆓",
    head: "ใช้งานฟรี ไม่ต้องสมัครสมาชิก",
    body: "เปิดเว็บไซต์แล้วใช้งานได้ทันที ไม่ต้องติดตั้งโปรแกรมหรือสร้างบัญชีผู้ใช้",
  },
  {
    icon: "⚖️",
    head: "สุ่มได้อย่างยุติธรรม",
    body: "ระบบสุ่มรายชื่อโดยอัตโนมัติ ลดความลำเอียงในการแบ่งกลุ่ม สร้างบรรยากาศการเรียนรู้ที่เท่าเทียม",
  },
  {
    icon: "👥",
    head: "รองรับนักเรียนจำนวนมาก",
    body: "ไม่ว่าจะเป็นห้องเรียนขนาดเล็กหรือขนาดใหญ่ ก็สามารถแบ่งกลุ่มได้ภายในไม่กี่วินาที",
  },
  {
    icon: "📱",
    head: "ใช้งานได้ทุกอุปกรณ์",
    body: "รองรับทั้งคอมพิวเตอร์ โน้ตบุ๊ก แท็บเล็ต และมือถือ เพียงมีอินเทอร์เน็ตก็ใช้งานได้ทุกที่",
  },
  {
    icon: "⏱️",
    head: "ประหยัดเวลาครู",
    body: "จากเดิมต้องจับสลากหรือแบ่งกลุ่มด้วยมือหลายนาที เหลือเพียงไม่กี่คลิก",
  },
];

const steps = [
  {
    n: "1",
    head: "เปิดหน้าเครื่องมือ",
    body: "เข้าไปที่หน้าเครื่องมือสุ่มแบ่งกลุ่มนักเรียนของ Khuncool ผ่านเบราว์เซอร์",
  },
  {
    n: "2",
    head: "วางรายชื่อนักเรียน",
    body: "พิมพ์หรือคัดลอกรายชื่อนักเรียนทีละบรรทัด (1 คนต่อ 1 บรรทัด)",
  },
  {
    n: "3",
    head: "เลือกรูปแบบการแบ่งกลุ่ม",
    body: "กำหนดจำนวนกลุ่ม หรือจำนวนสมาชิกต่อกลุ่มตามที่ต้องการ",
  },
  {
    n: "4",
    head: "กดสุ่มแบ่งกลุ่ม",
    body: "ระบบแสดงผลทันที บันทึกหรือพิมพ์รายชื่อแต่ละกลุ่มไปใช้งานต่อได้เลย",
  },
];

const ideas = [
  {
    icon: "🙋",
    head: "การเรียนแบบ Active Learning",
    body: "ช่วยให้เกิดการแลกเปลี่ยนความคิดเห็นระหว่างผู้เรียน",
  },
  {
    icon: "🧪",
    head: "Project-Based Learning (PBL)",
    body: "สุ่มสมาชิกในแต่ละทีมเพื่อทำโครงงานร่วมกัน",
  },
  {
    icon: "🔬",
    head: "กิจกรรม STEM",
    body: "แบ่งทีมสำหรับการทดลองหรือการแข่งขัน",
  },
  {
    icon: "🎲",
    head: "เกมในห้องเรียน",
    body: "สร้างความสนุกและลดการเลือกเพื่อนเอง",
  },
  {
    icon: "🎤",
    head: "การอบรมและเวิร์กชอป",
    body: "แบ่งผู้เข้าร่วมเป็นกลุ่มย่อยได้อย่างรวดเร็ว",
  },
];

// NOTE: keep in sync with the visible FAQ list rendered below.
const faqs = [
  {
    q: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนใช้ฟรีหรือไม่",
    a: "ใช้งานฟรีทั้งหมด ไม่มีค่าใช้จ่าย",
  },
  {
    q: "ต้องสมัครสมาชิกหรือไม่",
    a: "ไม่จำเป็น สามารถใช้งานได้ทันทีผ่านเบราว์เซอร์",
  },
  {
    q: "รองรับมือถือหรือไม่",
    a: "รองรับทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์",
  },
  {
    q: "สามารถใช้กับนักเรียนจำนวนมากได้หรือไม่",
    a: "ได้ เหมาะทั้งห้องเรียนขนาดเล็กและขนาดใหญ่",
  },
  {
    q: "เหมาะกับการอบรมหรือกิจกรรมองค์กรหรือไม่",
    a: "เหมาะอย่างยิ่ง เพราะสามารถแบ่งผู้เข้าร่วมออกเป็นทีมได้อย่างรวดเร็วและยุติธรรม",
  },
];

const toc = [
  "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนคืออะไร",
  "จุดเด่นของเครื่องมือ",
  "วิธีใช้งาน 4 ขั้นตอน",
  "เหมาะกับกิจกรรมอะไรบ้าง",
  "ทำไมครูควรใช้การสุ่มแบ่งกลุ่ม",
  "คำถามที่พบบ่อย",
];

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
          name: "สื่อการสอน",
          item: "https://www.khuncool.com/blog/group-maker",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      headline: "เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี ใช้งานง่าย รวดเร็ว สำหรับครูยุคดิจิทัล",
      inLanguage: "th",
      datePublished: "2026-08-02",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/group-maker-blog-cover.webp",
      mainEntityOfPage: "https://www.khuncool.com/blog/group-maker",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const tags = [
  "สุ่มแบ่งกลุ่มนักเรียน",
  "Random Group Maker",
  "แบ่งกลุ่มออนไลน์",
  "เครื่องมือสำหรับครู",
  "Active Learning",
  "ใช้ฟรี",
];

const related = [
  {
    cat: "สื่อการสอน",
    title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง",
    date: "27 ก.ค. 2569",
    href: "/blog/wheel",
  },
  {
    cat: "สื่อการสอน",
    title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
    date: "26 ก.ค. 2569",
    href: "/blog/random-name-activities",
  },
  {
    cat: "สื่อการสอน",
    title: "เกมแข่งเป็ดสุ่มชื่อ สื่อการสอนสนุกที่ครูควรมี",
    date: "31 ก.ค. 2569",
    href: "/blog/duck-race",
  },
];

export default function BlogGroupMakerPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
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
            สื่อการสอน
          </span>
        </div>
      </nav>

      {/* Cover image */}
      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/group-maker-blog-cover.webp"
          alt="เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี ใช้งานง่าย รวดเร็ว สำหรับครูยุคดิจิทัล"
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
              สื่อการสอน
            </span>
            <span className="rounded-pill bg-[#ECEDFE] px-2.5 py-1 text-[12px] font-semibold text-[#4A46D6] md:px-[11px] md:py-[5px]">
              ใช้ฟรี
            </span>
            <span className="text-[12px] text-ink-faint">
              2 ส.ค. 2569 · อ่าน 5 นาที · โดย ทีมคุณคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี ใช้งานง่าย รวดเร็ว สำหรับครูยุคดิจิทัล
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            การแบ่งกลุ่มนักเรียนเป็นกิจกรรมที่ครูทุกคนต้องทำอยู่เป็นประจำ
            ไม่ว่าจะเป็นการเรียนแบบ Active Learning, Project-Based Learning
            (PBL), กิจกรรม STEM หรือการนำเสนอหน้าชั้นเรียน
            แต่การแบ่งกลุ่มด้วยตนเองอาจใช้เวลานานและเกิดความลำเอียงโดยไม่ตั้งใจ{" "}
            <b>เครื่องมือสุ่มแบ่งกลุ่มนักเรียน</b> จาก Khuncool
            ช่วยให้ครูแบ่งกลุ่มได้อย่างรวดเร็ว ยุติธรรม และใช้งานฟรีผ่านเว็บเบราว์เซอร์
            โดยไม่ต้องติดตั้งโปรแกรม
          </p>

          <h2 className="text-xl md:text-2xl">
            เครื่องมือสุ่มแบ่งกลุ่มนักเรียนคืออะไร
          </h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            เครื่องมือสุ่มแบ่งกลุ่มนักเรียน (Random Group Maker)
            คือระบบที่ช่วยสุ่มรายชื่อนักเรียนออกเป็นหลายกลุ่มโดยอัตโนมัติ
            เพียงคัดลอกรายชื่อทั้งหมดลงในระบบ แล้วกำหนดจำนวนกลุ่มหรือจำนวนสมาชิกต่อกลุ่ม
            ระบบจะจัดสรรสมาชิกให้แต่ละกลุ่มอย่างสมดุลและเป็นธรรม
          </p>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            เหมาะสำหรับครูผู้สอนทุกระดับชั้น อาจารย์มหาวิทยาลัย วิทยากรอบรม
            ผู้จัดกิจกรรม และหัวหน้าทีมที่ต้องแบ่งสมาชิกเป็นกลุ่ม
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">
            จุดเด่นของเครื่องมือสุ่มแบ่งกลุ่มนักเรียน Khuncool
          </h2>
          <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
            {benefits.map((b) => (
              <div
                key={b.head}
                className="rounded-2xl border border-[#E5E8EE] p-3.5 md:p-4"
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-lg md:text-[19px]">{b.icon}</span>
                  <span className="text-sm font-bold md:text-[15.5px]">
                    {b.head}
                  </span>
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {b.body}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            วิธีใช้งานเครื่องมือสุ่มแบ่งกลุ่มนักเรียน
          </h2>
          <div className="mt-3 flex flex-col gap-3 md:gap-3.5">
            {steps.map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[#ECEDFE] text-[12.5px] font-bold text-[#4A46D6] md:h-[30px] md:w-[30px] md:rounded-[10px] md:text-[15px]">
                  {s.n}
                </span>
                <div>
                  <div className="mb-0.5 text-sm font-bold md:text-base">
                    {s.head}
                  </div>
                  <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            เครื่องมือสุ่มแบ่งกลุ่มนักเรียน เหมาะกับกิจกรรมอะไรบ้าง
          </h2>
          <div className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-[11px]">
            {ideas.map((i) => (
              <div
                key={i.head}
                className="flex items-start gap-2.5 rounded-xl bg-surface-light p-2.5 md:gap-[11px] md:rounded-2xl md:p-4"
              >
                <span className="flex-none text-base md:text-lg">{i.icon}</span>
                <div>
                  <div className="mb-0.5 text-[13.5px] font-bold">{i.head}</div>
                  <div className="text-[12.5px] leading-[1.65] text-ink-secondary md:text-[13.5px] md:leading-[1.7]">
                    {i.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            ทำไมครูควรใช้การสุ่มแบ่งกลุ่ม
          </h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            การสุ่มแบ่งกลุ่มช่วยให้นักเรียนได้ทำงานร่วมกับเพื่อนที่หลากหลาย
            ลดการจับกลุ่มเฉพาะเพื่อนสนิท ฝึกการทำงานร่วมกับผู้อื่น
            สร้างความยุติธรรมในห้องเรียน และส่งเสริมทักษะการสื่อสารและการทำงานเป็นทีม
          </p>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            แนวทางดังกล่าวสอดคล้องกับการจัดการเรียนรู้แบบร่วมมือ
            (Collaborative Learning) ซึ่งได้รับการสนับสนุนจากงานวิจัยด้านการศึกษาและถูกนำไปใช้ในโรงเรียนและมหาวิทยาลัยทั่วโลก
            ตามแนวทางที่{" "}
            <a
              href="https://www.unesco.org"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline"
            >
              UNESCO
            </a>{" "}
            และ{" "}
            <a
              href="https://www.oecd.org/education"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline"
            >
              OECD Education
            </a>{" "}
            ส่งเสริม รวมถึงแนวทางการนำเทคโนโลยีมาใช้ในห้องเรียนของ{" "}
            <a
              href="https://edu.google.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary underline"
            >
              Google for Education
            </a>
            .
          </p>

          <div className="mt-5 rounded-2xl border border-[#A9EBDA] bg-[#F6FFFC] p-4 md:mt-6 md:p-[20px_22px]">
            <div className="mb-1.5 text-xs font-bold text-[#0A7A66] md:mb-2 md:text-[13px]">
              💡 ทำไมต้องเลือกใช้ Khuncool Group Maker
            </div>
            <div className="text-[13.5px] leading-[1.75] text-[#2E3440] md:text-[15px] md:leading-[1.8]">
              แม้จะมีเครื่องมือสุ่มแบ่งกลุ่มหลายเว็บไซต์ แต่ Khuncool
              พัฒนาขึ้นโดยคำนึงถึงการใช้งานของครูไทยเป็นหลัก ภาษาไทยทั้งหมด
              ใช้งานง่าย ไม่ซับซ้อน รองรับการใช้งานบนมือถือ ใช้งานฟรี
              และเหมาะกับบริบทการเรียนการสอนในประเทศไทย
            </div>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            ลองใช้เครื่องมือสุ่มแบ่งกลุ่มนักเรียนของคุณคูล ฟรี
          </h2>
          <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:mb-[18px] md:text-[15.5px] md:leading-[1.85]">
            คุณคูลมีเครื่องมือสุ่มแบ่งกลุ่มนักเรียนให้ครูใช้ฟรี
            ไม่ต้องสมัครสมาชิก ไม่ต้องติดตั้งโปรแกรม
            เปิดผ่านเบราว์เซอร์บนคอมพิวเตอร์ แท็บเล็ต หรือมือถือได้ทันที
          </p>
          <div className="flex items-center gap-4 rounded-2xl border border-[#C6C9FB] bg-[#F7F7FE] p-4 md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">
                เครื่องมือสุ่มแบ่งกลุ่มนักเรียน Khuncool
              </div>
              <div className="text-[13.5px] text-ink-secondary">
                ใช้ฟรี · ไม่ต้องสมัคร · แบ่งกลุ่มทั้งห้องได้ในไม่กี่คลิก
              </div>
            </div>
            <Link
              href="/group-maker"
              className="flex-none rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] no-underline hover:bg-[#4A46D6]"
            >
              👥 เปิดเครื่องมือสุ่มแบ่งกลุ่ม
            </Link>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">คำถามที่พบบ่อย</h2>
          <div className="flex flex-col">
            {faqs.map((f) => (
              <div key={f.q} className="border-t border-border py-4">
                <div className="mb-1.5 text-sm font-bold md:text-base">
                  {f.q}
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">
                  {f.a}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">สรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              หากคุณกำลังมองหา<b>เครื่องมือสุ่มแบ่งกลุ่มนักเรียนฟรี</b>
              ที่ใช้งานง่าย รวดเร็ว และเหมาะสำหรับครูไทย Khuncool Group Maker
              เป็นอีกหนึ่งตัวเลือกที่ช่วยลดเวลาการเตรียมการสอน
              เพิ่มความยุติธรรมในการแบ่งกลุ่ม
              และสนับสนุนการจัดการเรียนรู้แบบ Active Learning ได้อย่างมีประสิทธิภาพ
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              ค้นหาเครื่องมือช่วยครูฟรี ๆ แบบนี้เพิ่มเติมได้ที่{" "}
              <Link href="/tools">หน้ารวมเครื่องมือสำหรับครู</Link> หรือ{" "}
              <Link href="/media">หน้ารวมสื่อการสอน</Link> ของ Khuncool.com
              สำหรับครูไทยทุกคน
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
          <div className="rounded-2xl border border-[#E5E8EE] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-ink-faint">
              สารบัญ
            </div>
            <div className="flex flex-col gap-2.5">
              {toc.map((c) => (
                <div
                  key={c}
                  className="text-[13.5px] leading-[1.5] text-ink-secondary"
                >
                  {c}
                </div>
              ))}
            </div>
            <Link
              href="/group-maker"
              className="mt-4 block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white no-underline hover:bg-[#4A46D6]"
            >
              👥 เปิดเครื่องมือสุ่มแบ่งกลุ่ม
            </Link>
          </div>

          <div className="rounded-2xl border border-[#E5E8EE] p-4">
            <div className="mb-1.5 text-sm font-bold">📌 บทความอื่น ๆ</div>
            <div className="flex flex-col">
              {related.map((r) => (
                <Link
                  key={r.title}
                  href={r.href}
                  className="block border-t border-border py-2.5 text-inherit no-underline hover:opacity-65"
                >
                  <div className="mb-0.5 text-[11px] font-semibold text-[#0A7A66]">
                    {r.cat}
                  </div>
                  <div className="text-[13.5px] font-semibold leading-[1.5]">
                    {r.title}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-faint">
                    {r.date}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
