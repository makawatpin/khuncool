import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ม.มหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ มีใบเซอร์ | Khuncool",
  description:
    "รวมคอร์สเรียนออนไลน์ฟรีจากมหาวิทยาลัยมหิดล สำหรับคนรักสัตว์ ทั้งคอร์สเข้าใจพฤติกรรมสุนัขและคอร์สมือใหม่หัดเลี้ยงแมว เรียนจบมีใบเซอร์ สอนโดยอาจารย์สัตวแพทย์ตัวจริง",
  alternates: {
    canonical: "https://www.khuncool.com/blog/mahidol-pet-courses",
  },
  openGraph: {
    type: "article",
    title: "ม.มหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ มีใบเซอร์",
    description:
      "รวมคอร์สเรียนออนไลน์ฟรีจากมหาวิทยาลัยมหิดล สำหรับคนรักสัตว์ ทั้งคอร์สเข้าใจพฤติกรรมสุนัขและคอร์สมือใหม่หัดเลี้ยงแมว เรียนจบมีใบเซอร์",
    images: ["https://www.khuncool.com/assets/mahidol-pet-courses-cover.webp"],
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
          item: "https://www.khuncool.com/blog/mahidol-pet-courses",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      headline: "ม.มหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ มีใบเซอร์",
      inLanguage: "th",
      datePublished: "2026-07-31",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/mahidol-pet-courses-cover.webp",
      mainEntityOfPage: "https://www.khuncool.com/blog/mahidol-pet-courses",
    },
  ],
};

const courses = [
  {
    tag: "ทาสหมา 🐶",
    title: "เข้าใจพฤติกรรมสุนัขและการจัดการปัญหาในเบื้องต้น",
    desc: "เรียนรู้พฤติกรรมสุนัขผ่านภาษากาย พฤติกรรมที่เป็นปัญหาที่มักพบได้บ่อย ตลอดจนแนวทางการจัดการเบื้องต้น",
    duration: "1 ชั่วโมง 15 นาที",
    instructor: "อ. ดร. น.สพ.ปรารมภ์ ศรีภวัศราคม (หมอเอก)",
    instructorRole:
      "อาจารย์ประจำภาควิชาปรีคลินิกและสัตวศาสตร์ประยุกต์ คณะสัตวแพทยศาสตร์ ม.มหิดล",
    lessons: [
      { n: "1", h: "เข้าใจ “5 ภาษากาย” ของน้องหมา", t: "13.38 นาที" },
      {
        n: "2",
        h: "7 พฤติกรรมต้องห้าม ไม่ควรทำกับสุนัขเด็ดขาด",
        t: "14.24 นาที",
      },
      {
        n: "3",
        h: "วิธีแก้ปัญหาพฤติกรรมการขึ้นขี่ของสุนัข",
        t: "10.13 นาที",
      },
      { n: "4", h: "แก้นิสัยทำลายข้าวของของสุนัขและแมว", t: "13.57 นาที" },
      { n: "5", h: "วิธีลดความก้าวร้าวของน้องหมา", t: "12.53 นาที" },
    ],
    target:
      "เหมาะกับผู้เลี้ยงสุนัข ตลอดจนผู้ที่สนใจเกี่ยวกับพฤติกรรมและปัญหาพฤติกรรมของสุนัขและแมว",
    href: "https://bit.ly/3TjSa8X",
    accent: { bg: "#E1E3FD", color: "#3D38B4" },
  },
  {
    tag: "ทาสแมว 🐱",
    title: "มือใหม่หัดเลี้ยงแมว",
    desc: "ทำความเข้าใจวิธีเลี้ยงแมวตั้งแต่การจัดการที่อยู่อาศัย อาหาร รูปแบบการเลี้ยง ไปจนถึงการสังเกตพฤติกรรมที่บ่งชี้ปัญหาสุขภาพ",
    duration: "1 ชั่วโมง",
    instructor: "อ. ดร.รวงรัตน์ พุทธิรงควัตร",
    instructorRole:
      "อาจารย์ประจำภาควิชาเวชศาสตร์คลินิกและการสาธารณสุข คณะสัตวแพทยศาสตร์ มหาวิทยาลัยมหิดล",
    lessons: [
      { n: "1", h: "เมื่อแมวมาหา หมามาสู่ ต้องเลี้ยงดูอย่างไร", t: "10.00 นาที" },
      {
        n: "2",
        h: "อุปกรณ์จำเป็นและการเลือกอาหารสำหรับการเลี้ยงแมว",
        t: "5.17 นาที",
      },
      {
        n: "3",
        h: "เรียนรู้นิสัยแมว พฤติกรรมที่เปลี่ยนไปที่บ่งชี้ปัญหาสุขภาพ",
        t: "2.57 นาที",
      },
      { n: "4", h: "แมวนิสัยไม่ดี มีวิธีรับมืออย่างไร", t: "13.57 นาที" },
      { n: "5", h: "ความเข้าใจผิดเกี่ยวกับการเลี้ยงแมว", t: "13.38 นาที" },
    ],
    target: "เหมาะกับมือใหม่ที่กำลังจะเลี้ยงแมว หรือคนที่เลี้ยงอยู่แล้วแต่อยากเข้าใจแมวให้มากขึ้น",
    href: "https://bit.ly/4bfvJI8",
    accent: { bg: "#FFEAD5", color: "#C2500B" },
  },
];

const reasons = [
  {
    icon: "🎓",
    head: "สอนโดยอาจารย์สัตวแพทย์ตัวจริง",
    body: "ทั้งสองคอร์สสอนโดยอาจารย์ประจำคณะสัตวแพทยศาสตร์ มหาวิทยาลัยมหิดล เนื้อหาอ้างอิงหลักวิชาการ ไม่ใช่แค่ประสบการณ์ส่วนตัว",
  },
  {
    icon: "⏱️",
    head: "ใช้เวลาไม่นาน",
    body: "คอร์สละประมาณ 1 ชั่วโมง แบ่งเป็นบทเรียนสั้น ๆ 5 บท เรียนจบในวันเดียวได้สบาย ๆ",
  },
  {
    icon: "🆓",
    head: "เรียนฟรี มีใบเซอร์",
    body: "ไม่มีค่าใช้จ่าย สมัครสมาชิก Mahidol Channel แล้วเรียนได้ทันที เก็บใบเซอร์ไว้เป็นหลักฐานการพัฒนาตนเอง",
  },
  {
    icon: "🐾",
    head: "แก้ปัญหาที่เจอจริงในบ้าน",
    body: "ตั้งแต่พฤติกรรมก้าวร้าว ขึ้นขี่ ทำลายข้าวของ ไปจนถึงการเลือกอาหารและอุปกรณ์ เอาไปใช้ได้ทันทีกับสัตว์เลี้ยงที่บ้าน",
  },
];

const steps = [
  "กดลิงก์สมัครเรียนของคอร์สที่สนใจด้านล่าง",
  "สมัครสมาชิก Mahidol Channel ฟรี หรือล็อกอินหากมีบัญชีอยู่แล้ว",
  "ทำแบบทดสอบก่อนเรียน แล้วเริ่มดูวิดีโอบทเรียนตามลำดับ",
  "ทำแบบทดสอบหลังเรียนให้ครบตามเกณฑ์ที่กำหนด",
  "ดาวน์โหลดใบเซอร์เก็บไว้เป็นหลักฐานการเรียนรู้",
];

const tags = [
  "คอร์สเรียนฟรีมหิดล",
  "Mahidol Channel",
  "อบรมออนไลน์ฟรี",
  "คอร์สเลี้ยงแมว",
  "คอร์สพฤติกรรมสุนัข",
  "เรียนออนไลน์มีใบเซอร์",
  "คนรักสัตว์",
];

export default function BlogMahidolPetCoursesPage() {
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
          src="/assets/mahidol-pet-courses-cover.webp"
          alt="มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์"
          width={1200}
          height={340}
          priority
          className="block h-[200px] w-full rounded-card-lg bg-[#F1F3F6] object-cover md:h-[340px] md:rounded-[20px]"
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
              31 ก.ค. 2569 · อ่าน 6 นาที · โดย ทีมขุนคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ เรียนจบมีใบเซอร์
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            ใครที่เลี้ยงหมาเลี้ยงแมวอยู่ที่บ้าน หรือกำลังจะเริ่มเลี้ยง
            วันนี้ขุนคูลมีของดีมาฝาก มหาวิทยาลัยมหิดลเปิดคอร์สเรียนออนไลน์ฟรี 2
            คอร์สสำหรับคนรักสัตว์โดยเฉพาะ สอนโดยอาจารย์สัตวแพทย์ตัวจริง
            เรียนจบรับใบประกาศนียบัตรได้ฟรี ไม่มีค่าใช้จ่าย
          </p>

          <h2 className="text-xl md:text-2xl">คอร์สเหล่านี้เรียนที่ไหน</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            ทั้งสองคอร์สเปิดสอนผ่านแพลตฟอร์ม{" "}
            <b>Mahidol Channel</b> ระบบเรียนออนไลน์ของมหาวิทยาลัยมหิดล
            ที่รวบรวมคอร์สความรู้หลากหลายหมวดหมู่ไว้ในที่เดียว
            ผู้สอนเป็นอาจารย์ประจำคณะสัตวแพทยศาสตร์ มหาวิทยาลัยมหิดล
            ทำให้เนื้อหามีความน่าเชื่อถือและอ้างอิงหลักวิชาการจริง
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">2 คอร์สที่แนะนำ</h2>
          <div className="mt-3 flex flex-col gap-4">
            {courses.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-[#E5E8EE] bg-white p-4 md:p-5"
              >
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-pill px-2.5 py-1 text-[12px] font-bold"
                    style={{ background: c.accent.bg, color: c.accent.color }}
                  >
                    {c.tag}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    ⏱️ {c.duration}
                  </span>
                </div>
                <h3 className="m-0 mb-1.5 text-lg font-bold md:text-xl">
                  {c.title}
                </h3>
                <p className="m-0 mb-3 text-[14px] leading-[1.75] text-[#2E3440] md:text-[14.5px]">
                  {c.desc}
                </p>

                <div className="mb-3 rounded-xl bg-surface-light p-3">
                  <div className="mb-1 text-xs font-bold text-ink-faint">
                    ผู้สอน
                  </div>
                  <div className="text-[13.5px] font-semibold">
                    {c.instructor}
                  </div>
                  <div className="text-[12.5px] text-ink-secondary">
                    {c.instructorRole}
                  </div>
                </div>

                <div className="mb-3 flex flex-col gap-1.5">
                  {c.lessons.map((l) => (
                    <div
                      key={l.n}
                      className="flex items-center gap-2.5 text-[13px] text-[#2E3440] md:text-[13.5px]"
                    >
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {l.n}
                      </span>
                      <span className="flex-1">{l.h}</span>
                      <span className="flex-none text-ink-faint">{l.t}</span>
                    </div>
                  ))}
                </div>

                <p className="m-0 mb-3 text-[12.5px] italic text-ink-secondary">
                  {c.target}
                </p>

                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#4A46D6]"
                >
                  ลงทะเบียนเรียนฟรี ↗
                </a>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            ทำไมคนรักสัตว์ควรเรียน 2 คอร์สนี้
          </h2>
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

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#C6C9FB] bg-[#F5F6FF] p-4 md:flex-row md:items-center md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">
                พร้อมเริ่มเรียนแล้ว?
              </div>
              <div className="text-[13.5px] text-ink-secondary">
                สมัครสมาชิก Mahidol Channel ฟรี · เลือกเรียนคอร์สหมาหรือแมวได้เลย
              </div>
            </div>
            <div className="flex flex-none gap-2">
              <a
                href="https://bit.ly/3TjSa8X"
                target="_blank"
                rel="noopener"
                className="rounded-xl bg-primary px-4 py-3 text-[13px] font-bold text-white no-underline shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:bg-[#4A46D6]"
              >
                คอร์สหมา ↗
              </a>
              <a
                href="https://bit.ly/4bfvJI8"
                target="_blank"
                rel="noopener"
                className="rounded-xl bg-[#0A9380] px-4 py-3 text-[13px] font-bold text-white no-underline hover:brightness-[1.06]"
              >
                คอร์สแมว ↗
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">
              อยากหาคอร์สฟรีแบบนี้อีก ต้องดูที่ไหน
            </h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              นอกจาก 2 คอร์สนี้ Mahidol Channel ยังมีคอร์สฟรีอีกหลายสิบคอร์ส
              ครอบคลุมหมวดหมู่สุขภาพ เทคโนโลยี ภาษา และการพัฒนาทักษะ
              คนที่อยากพัฒนาตัวเองต่อเนื่องเลือกเรียนเพิ่มได้ที่เว็บไซต์
              Mahidol Channel โดยตรง ขุนคูลจะคอยรวบรวมแหล่งอบรมฟรีดี ๆ มาฝากเรื่อย
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
              <div className="flex items-center gap-2.5">
                <span className="flex-none text-base">🏛️</span>
                <span className="flex-1 text-[13px] text-ink-faint">
                  ผู้จัด
                </span>
                <span className="flex-none text-[13.5px] font-bold">
                  ม.มหิดล
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex-none text-base">💸</span>
                <span className="flex-1 text-[13px] text-ink-faint">
                  ค่าใช้จ่าย
                </span>
                <span className="flex-none text-[13.5px] font-bold">ฟรี</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex-none text-base">🎓</span>
                <span className="flex-1 text-[13px] text-ink-faint">
                  ใบเซอร์
                </span>
                <span className="flex-none text-[13.5px] font-bold">มี</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex-none text-base">📚</span>
                <span className="flex-1 text-[13px] text-ink-faint">
                  จำนวนคอร์ส
                </span>
                <span className="flex-none text-[13.5px] font-bold">
                  2 คอร์ส
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="https://bit.ly/3TjSa8X"
                target="_blank"
                rel="noopener"
                className="block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white no-underline hover:bg-[#4A46D6]"
              >
                สมัครคอร์สหมา ↗
              </a>
              <a
                href="https://bit.ly/4bfvJI8"
                target="_blank"
                rel="noopener"
                className="block rounded-xl bg-[#0A9380] p-3 text-center text-sm font-bold text-white no-underline hover:brightness-[1.06]"
              >
                สมัครคอร์สแมว ↗
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
