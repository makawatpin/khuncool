import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import MediaGrid from "./MediaGrid";
import {
  CASES,
  FAQS,
  MEDIA,
  RELATED_ARTICLES,
  RELATED_TOOLS,
  SUBJECTS,
  TRUST_CHIPS,
} from "./data";

export const metadata: Metadata = {
  title: "สื่อการสอนและเกมภาษาอังกฤษออนไลน์ ประถม ใช้ฟรี | khuncool",
  description:
    "รวมสื่อและเกมภาษาอังกฤษออนไลน์สำหรับครูประถม แยกตามทักษะ Phonics Vocabulary Grammar และ Speaking เปิดเล่นบนจอหน้าชั้นได้ทันที ไม่ต้องติดตั้ง ไม่ต้องสมัครสมาชิก",
  alternates: {
    canonical: "https://www.khuncool.com/media/english",
  },
  openGraph: {
    type: "website",
    title: "สื่อการสอนและเกมภาษาอังกฤษออนไลน์ ประถม ใช้ฟรี | khuncool",
    description:
      "รวมสื่อและเกมภาษาอังกฤษออนไลน์สำหรับครูประถม แยกตามทักษะ เปิดเล่นบนจอหน้าชั้นได้ทันที ไม่ต้องติดตั้ง ไม่ต้องสมัครสมาชิก",
    url: "https://www.khuncool.com/media/english",
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
          name: "สื่อการสอน",
          item: "https://www.khuncool.com/media/english",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "ภาษาอังกฤษ",
          item: "https://www.khuncool.com/media/english",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "สื่อการสอนและเกมภาษาอังกฤษออนไลน์",
      url: "https://www.khuncool.com/media/english",
      inLanguage: "th-TH",
      dateModified: "2026-08-04",
      educationalLevel: "ประถมศึกษาปีที่ 1–6",
      teaches: ["Phonics", "Vocabulary", "Grammar", "Speaking"],
      author: {
        "@type": "Organization",
        name: "Khuncool",
        url: "https://www.khuncool.com",
      },
      description: "รวมสื่อการสอนและเกมภาษาอังกฤษออนไลน์สำหรับครูประถม แยกตามทักษะ Phonics Vocabulary Grammar และ Speaking",
    },
    {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: MEDIA.length,
      itemListElement: MEDIA.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: m.title,
        url: `https://www.khuncool.com${m.href}`,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
  ],
};

export default function MediaEnglishPage() {
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
          <Link href="/media" className="text-ink-faint">
            สื่อการสอน
          </Link>
          <span>›</span>
          <span
            className="font-semibold text-ink-secondary"
            aria-current="page"
          >
            ภาษาอังกฤษ
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-4 pb-[22px] pt-3 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-11 md:px-8 md:pb-[30px] md:pt-4">
        <div>
          <h1 className="m-0 mb-2.5 text-[26px] leading-[1.32] md:mb-3.5 md:max-w-[16ch] md:text-[40px] md:leading-[1.24]">
            สื่อการสอนและเกมภาษาอังกฤษ เล่นได้ทั้งห้อง ใช้ฟรี
          </h1>
          <p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[58ch] md:text-[15.5px] md:leading-[1.75]">
            <span className="md:hidden">
              เกมและสื่อภาษาอังกฤษสำหรับครูประถม แยกตามทักษะที่กำลังสอน —
              Phonics, คำศัพท์, ไวยากรณ์ และการพูด ฉายขึ้นจอหน้าชั้นแล้วเริ่มได้ทันที
              ไม่ต้องเตรียมบัตรคำ ไม่ต้องปริ้นต์
            </span>
            <span className="hidden md:inline">
              รวมเกมและสื่อภาษาอังกฤษสำหรับครูประถมไว้ที่เดียว
              แยกตามทักษะที่กำลังสอน ทุกชิ้นเปิดจากเบราว์เซอร์
              ตัวอักษรใหญ่พอให้เด็กหลังห้องอ่านออก
              มีเสียงอ่านคำศัพท์ให้ครูที่ไม่มั่นใจการออกเสียง
              และไม่ต้องเตรียมบัตรคำล่วงหน้า
            </span>
          </p>
          <div className="flex flex-wrap gap-[7px] md:gap-2">
            {TRUST_CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-pill bg-success-bg px-2.5 py-[5px] text-[11.5px] font-semibold text-success md:px-3 md:py-1.5 md:text-[12.5px]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Desktop-only "start here" card */}
        <div className="mt-6 hidden rounded-card-lg border border-border bg-surface-light p-[20px_22px] md:block">
          <h2 className="m-0 mb-2.5 text-[15px]">
            เริ่มจากสื่อที่ครูใช้บ่อยที่สุด
          </h2>
          <Link
            href="/media/english/family-tree"
            className="flex items-center gap-[13px] rounded-2xl border border-border bg-surface-card p-3.5 text-inherit no-underline hover:border-[#C6C9FB]"
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#DFF6EF] text-[23px]">
              🌳
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="m-0 mb-0.5 text-[15.5px]">Family Tree Explorer</h3>
              <p className="m-0 text-[12.5px] text-ink-secondary">
                คำศัพท์ครอบครัว 4 ด่าน · ป.1–ป.4
              </p>
            </div>
            <span className="flex-none text-[13px] font-semibold text-primary">
              เล่น ›
            </span>
          </Link>
        </div>
      </div>

      {/* Skill filter + grid */}
      <div className="px-4 pb-6 md:px-8 md:pb-[34px]">
        <MediaGrid />
      </div>

      {/* Pick by situation */}
      <div className="border-y border-[#EEF0F4] bg-surface-light px-4 py-[22px] md:px-8 md:py-[26px]">
        <h2 className="m-0 mb-1.5 text-lg md:text-2xl">
          เลือกสื่อตามสิ่งที่กำลังจะสอน
        </h2>
        <p className="m-0 mb-3 max-w-[62ch] text-[13px] leading-[1.65] text-ink-secondary md:mb-[18px] md:text-[14.5px] md:leading-[1.7]">
          ครูส่วนใหญ่ไม่ได้หาชื่อเกม แต่หาว่า &ldquo;คาบนี้จะให้เด็กทำอะไร&rdquo;
          — เริ่มจากตรงนั้น
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-[9px]">
          {CASES.map((c) => (
            <Link
              key={c.q}
              href={c.href}
              className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-white p-[12px_13px] text-inherit no-underline hover:border-[#C6C9FB] md:p-[13px_15px]"
            >
              <span className="flex-1 text-[13px] text-ink-secondary md:text-sm">
                {c.q}
              </span>
              <span className="flex-none whitespace-nowrap text-xs font-semibold text-primary md:text-[13px]">
                {c.a} ›
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Classroom-management tools + other subjects */}
      <div className="px-4 py-[22px] md:flex md:gap-10 md:px-8 md:py-[28px]">
        <div className="mb-6 md:mb-0 md:flex-1">
          <h2 className="m-0 mb-1.5 text-lg md:text-2xl">ใช้คู่กับเครื่องมือครู</h2>
          <p className="m-0 mb-3 max-w-[58ch] text-[13px] leading-[1.65] text-ink-secondary md:mb-4 md:text-[14.5px] md:leading-[1.7]">
            สื่อในหน้านี้เป็นเนื้อหารายวิชา
            ส่วนเครื่องมือด้านล่างใช้คุมห้องระหว่างเล่นเกม เช่น
            จับเวลาแต่ละรอบ แบ่งกลุ่มแข่งกัน และให้คะแนน
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
            {RELATED_TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-[11px] rounded-2xl border border-border bg-white p-3.5 text-inherit no-underline hover:border-[#C6C9FB]"
              >
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-[19px]"
                  style={{ background: t.bg }}
                >
                  {t.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 mb-0.5 text-[15px]">{t.title}</h3>
                  <p className="m-0 text-xs text-ink-secondary">{t.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="md:w-[340px] md:flex-none">
          <h2 className="m-0 mb-1.5 text-lg md:text-2xl">วิชาอื่นที่กำลังทำ</h2>
          <p className="m-0 mb-3 text-[13px] leading-[1.65] text-ink-secondary md:mb-3.5 md:text-sm">
            โครงหน้านี้ใช้ซ้ำได้กับทุกวิชา บอกเราได้ว่าอยากได้วิชาไหนก่อน
          </p>
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-col">
            {SUBJECTS.map((s) => (
              <div
                key={s.t}
                className="flex items-center gap-[9px] rounded-2xl border border-dashed border-[#D8DCE5] p-[11px_12px]"
              >
                <span className="text-lg">{s.icon}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold md:text-[14.5px]">
                    {s.t}
                  </div>
                  <div className="text-[11px] text-ink-faint md:text-xs">
                    {s.st}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ + related reading */}
      <div className="px-4 pb-[26px] md:grid md:grid-cols-[1fr_340px] md:gap-10 md:px-8 md:pb-9">
        <div>
          <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
            คำถามที่ครูถามบ่อย
          </h2>
          <FaqAccordion />
        </div>

        <div className="mt-6 md:mt-0">
          <h2 className="m-0 mb-3 text-lg md:text-[19px]">อ่านเพิ่มเติม</h2>
          <div className="flex flex-col gap-2 md:gap-[9px]">
            {RELATED_ARTICLES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-light p-[13px_15px] text-inherit no-underline hover:bg-[#F1F2FC]"
              >
                <span className="flex-1 text-sm text-ink-secondary">{r.t}</span>
                <span className="flex-none text-[13px] text-primary">อ่าน ›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Request CTA */}
      <div className="flex items-center gap-4 border-t border-border bg-surface-light px-4 py-5 md:px-8 md:py-[22px]">
        <div className="flex-1">
          <div className="mb-[3px] text-sm font-semibold">
            อยากได้สื่อภาษาอังกฤษเรื่องไหนเพิ่ม
          </div>
          <div className="text-[13px] text-ink-secondary">
            บอกหัวข้อที่สอนแล้วหาสื่อยาก เราสร้างจากคำขอของครูจริง
          </div>
        </div>
        <a
          href="mailto:khuncoolhub@gmail.com?subject=%E0%B8%82%E0%B8%AD%E0%B8%AA%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B8%AD%E0%B8%B1%E0%B8%87%E0%B8%81%E0%B8%A4%E0%B8%A9%E0%B9%80%E0%B8%9E%E0%B8%B4%E0%B9%88%E0%B8%A1"
          title="ส่งอีเมลขอสื่อภาษาอังกฤษเพิ่ม"
          className="flex-none rounded-btn bg-primary px-5 py-[11px] text-sm font-semibold text-white no-underline hover:bg-primary-hover hover:text-white"
        >
          ส่งคำขอ
        </a>
      </div>
    </main>
  );
}
