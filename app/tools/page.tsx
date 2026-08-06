import type { Metadata } from "next";
import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import FaqAccordion from "./FaqAccordion";
import { APPS, CASES, FAQS, RELATED, TOOLS, TRUST_CHIPS } from "./data";

export const metadata: Metadata = {
  title: "เครื่องมือครูออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
  description:
    "รวมเครื่องมือครูออนไลน์ใช้ฟรีในเว็บเดียว วงล้อสุ่มชื่อนักเรียน สุ่มแบ่งกลุ่ม จับเวลา เครื่องวัดเสียงในห้องเรียน และกระดานคะแนนกลุ่ม เปิดใช้ได้ทันทีบนมือถือและคอมพิวเตอร์ ไม่ต้องสมัครสมาชิก",
  alternates: {
    canonical: "https://www.khuncool.com/tools",
  },
  openGraph: {
    type: "website",
    title: "เครื่องมือครูออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง | khuncool",
    description:
      "รวมเครื่องมือครูออนไลน์ใช้ฟรีในเว็บเดียว วงล้อสุ่มชื่อนักเรียน สุ่มแบ่งกลุ่ม จับเวลา เครื่องวัดเสียงในห้องเรียน และกระดานคะแนนกลุ่ม เปิดใช้ได้ทันทีบนมือถือและคอมพิวเตอร์ ไม่ต้องสมัครสมาชิก",
    url: "https://www.khuncool.com/tools",
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
          name: "เครื่องมือครู",
          item: "https://www.khuncool.com/tools",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "เครื่องมือครูออนไลน์",
      url: "https://www.khuncool.com/tools",
      inLanguage: "th-TH",
      description: "รวมเครื่องมือช่วยสอนใช้ฟรีผ่านเว็บ ไม่ต้องติดตั้ง",
    },
    {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: TOOLS.length,
      itemListElement: TOOLS.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.title,
        url: `https://www.khuncool.com${t.href}`,
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

export default function ToolsPage() {
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
          <span
            className="font-semibold text-ink-secondary"
            aria-current="page"
          >
            เครื่องมือครู
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-4 pb-[22px] pt-3 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-11 md:px-8 md:pb-[30px] md:pt-4">
        <div>
          <h1 className="m-0 mb-2.5 text-[26px] leading-[1.32] md:mb-3.5 md:max-w-[15ch] md:text-[42px] md:leading-[1.25]">
            <span className="md:hidden">
              เครื่องมือครูออนไลน์
              <br />
              ใช้ฟรี ไม่ต้องติดตั้ง
            </span>
            <span className="hidden md:inline">
              เครื่องมือครูออนไลน์ ใช้ฟรี ไม่ต้องติดตั้ง
            </span>
          </h1>
          <p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[56ch] md:text-base md:leading-[1.8]">
            <span className="md:hidden">
              รวมเครื่องมือช่วยสอนที่ครูไทยใช้บ่อยที่สุดไว้ในที่เดียว —
              สุ่มชื่อนักเรียน แบ่งกลุ่ม จับเวลา คุมเสียงในห้อง และให้คะแนนกลุ่ม
              เปิดจากมือถือหรือฉายขึ้นจอหน้าชั้นได้ทันที ไม่ต้องสมัครสมาชิก
            </span>
            <span className="hidden md:inline">
              khuncool รวมเครื่องมือช่วยสอนที่ครูไทยใช้บ่อยที่สุดไว้ในเว็บเดียว
              ตั้งแต่วงล้อสุ่มชื่อนักเรียน สุ่มแบ่งกลุ่ม จับเวลากิจกรรม
              เครื่องวัดเสียงในห้องเรียน ไปจนถึงกระดานคะแนนกลุ่ม
              ทุกตัวเปิดใช้งานผ่านเบราว์เซอร์ได้ทันที
              ฉายขึ้นโปรเจกเตอร์หรือกระดานอัจฉริยะหน้าชั้นได้
              และใช้ได้ฟรีโดยไม่ต้องสมัครสมาชิก
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

        {/* Desktop-only "pick by situation" panel */}
        <div className="mt-6 hidden rounded-card-lg border border-border bg-surface-light p-[20px_22px] md:block">
          <h2 className="m-0 mb-3 text-[15px]">เลือกจากสิ่งที่จะทำในคาบนี้</h2>
          <div className="flex flex-col gap-[7px]">
            {CASES.map((c) => (
              <Link
                key={c.q}
                href={c.href}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-card p-[11px_13px] text-inherit no-underline hover:border-[#C6C9FB]"
              >
                <span className="flex-1 text-[13.5px] text-ink-secondary">
                  {c.q}
                </span>
                <span className="flex-none whitespace-nowrap text-[12.5px] font-semibold text-primary">
                  {c.a} ›
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-only "pick by situation" list (appears after the tools grid on mobile) */}

      {/* All tools grid */}
      <div className="px-4 pb-6 md:px-8 md:pb-[34px]">
        <h2 className="m-0 hidden text-2xl md:mb-1.5 md:block">
          เครื่องมือทั้งหมด
        </h2>
        <p className="m-0 mb-[18px] hidden max-w-[62ch] text-[14.5px] leading-[1.7] text-ink-secondary md:block">
          แต่ละตัวมีหน้าของตัวเองที่เปิดใช้ได้เลย
          ไม่มีขั้นตอนติดตั้งและไม่มีโฆษณาคั่นระหว่างใช้งาน
        </p>
        <div className="grid grid-cols-2 gap-[9px] md:grid-cols-3 md:gap-3 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <ToolCard
              key={t.href}
              href={t.href}
              icon={t.icon}
              title={t.title}
              bg={t.bg}
              image={t.image}
              short={t.short}
              desc={t.desc}
            />
          ))}
        </div>
      </div>

      {/* Mobile-only "pick by situation" list */}
      <div className="px-4 pb-6 md:hidden">
        <h2 className="m-0 mb-1 text-lg">
          เลือกเครื่องมือตามสถานการณ์ในห้องเรียน
        </h2>
        <p className="m-0 mb-3 text-[13px] leading-[1.65] text-ink-secondary">
          ไม่แน่ใจว่าจะใช้ตัวไหน ลองดูจากสิ่งที่กำลังจะทำในคาบนี้
        </p>
        <div className="flex flex-col gap-2">
          {CASES.map((c) => (
            <Link
              key={c.q}
              href={c.href}
              className="flex items-center gap-2.5 rounded-[13px] border border-[#EEF0F4] bg-surface-light p-[12px_13px] text-inherit no-underline hover:bg-[#F1F2FC]"
            >
              <span className="flex-1 text-[13px] leading-[1.55] text-ink-secondary">
                {c.q}
              </span>
              <span className="flex-none whitespace-nowrap text-xs font-semibold text-primary">
                {c.a} ›
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Apps cross-link */}
      <div className="px-4 pb-6 md:px-8 md:pb-[34px]">
        <h2 className="m-0 mb-1 text-lg md:mb-1.5 md:text-2xl">
          <Link href="/apps" className="text-inherit no-underline">
            แอปช่วยงานครู ›
          </Link>
        </h2>
        <p className="m-0 mb-3 text-[13px] leading-[1.65] text-ink-secondary md:mb-[18px] md:max-w-[62ch] md:text-[14.5px] md:leading-[1.7]">
          <span className="md:hidden">
            งานเอกสารประจำวันที่ต้องเก็บข้อมูลต่อเนื่อง เช็กชื่อ ออมเงิน
            และบันทึกโฮมรูม
          </span>
          <span className="hidden md:inline">
            ต่างจากเครื่องมือด้านบนตรงที่แอปกลุ่มนี้เก็บข้อมูลต่อเนื่องรายห้องรายคน
            ล็อกอินแล้วข้อมูลจะตามไปทุกเครื่อง
          </span>
        </p>
        <div className="flex flex-col gap-[9px] md:grid md:grid-cols-3 md:gap-3.5">
          {APPS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-[11px] rounded-2xl border border-border bg-surface-card p-[13px] text-inherit no-underline hover:border-[#C6C9FB] hover:bg-[#FBFBFE] md:gap-[13px] md:rounded-card-lg md:p-[18px]"
            >
              <div
                className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-[19px] md:h-[46px] md:w-[46px] md:rounded-2xl md:text-[22px]"
                style={{ background: a.bg }}
              >
                {a.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="m-0 mb-0.5 text-[15px] md:mb-[3px] md:text-[16.5px]">
                  {a.title}
                </h3>
                <p className="m-0 text-xs text-ink-secondary md:text-[13px]">
                  {a.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ + (desktop) editorial copy */}
      <div className="px-4 pb-[26px] md:grid md:grid-cols-2 md:gap-11 md:px-8 md:pb-9">
        <div>
          <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
            คำถามที่ครูถามบ่อย
          </h2>
          <FaqAccordion />
        </div>

        {/* Desktop-only editorial column */}
        <div className="hidden md:block">
          <h2 className="m-0 mb-4 text-2xl">
            ใช้เครื่องมือให้ได้ผลจริงในห้องเรียน
          </h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.85] text-ink-secondary">
            เครื่องมือสุ่มชื่อไม่ได้มีไว้แค่เรียกคนตอบคำถาม
            ครูหลายคนใช้เปิดคาบเพื่อดึงความสนใจ ใช้จับคู่เพื่อนทำงาน
            หรือใช้สุ่มลำดับการนำเสนอเพื่อให้ทุกคนเตรียมตัวมาเท่ากัน
            เช่นเดียวกับเครื่องวัดเสียงที่ใช้เป็นสัญญาณเตือนแทนการดุ
            ทำให้บรรยากาศในห้องดีขึ้นโดยครูไม่ต้องขึ้นเสียง
          </p>
          <p className="m-0 mb-[18px] text-[14.5px] leading-[1.85] text-ink-secondary">
            เราเขียนบทความแนะนำวิธีใช้แต่ละตัวจากประสบการณ์ครูจริง
            พร้อมตัวอย่างกิจกรรมที่นำไปใช้ได้ทันทีในคาบถัดไป
          </p>
          <div className="flex flex-col gap-[9px]">
            {RELATED.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-light p-[13px_15px] text-inherit no-underline hover:bg-[#F1F2FC]"
              >
                <span className="flex-1 text-sm text-ink-secondary">{r.t}</span>
                <span className="flex-none text-[13px] text-primary">
                  อ่าน ›
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-only related reading */}
      <div className="border-t border-border bg-surface-light px-4 pb-7 pt-[22px] md:hidden">
        <h2 className="m-0 mb-2 text-[15px]">
          อ่านเพิ่มเติมเรื่องการใช้เครื่องมือในห้องเรียน
        </h2>
        <div className="flex flex-col gap-[7px]">
          {RELATED.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="text-[13px] leading-[1.6] text-primary no-underline"
            >
              {r.t}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop-only tool request CTA */}
      <div className="hidden items-center gap-4 border-t border-border bg-surface-light px-8 py-[26px] md:flex">
        <div className="flex-1">
          <div className="mb-[3px] text-sm font-semibold">
            ยังไม่เจอเครื่องมือที่ต้องการ
          </div>
          <div className="text-[13px] text-ink-secondary">
            บอกเราได้ว่าอยากให้ทำอะไรเพิ่ม เราสร้างจากคำขอของครูจริง
          </div>
        </div>
        <Link
          href="/account"
          title="เข้าสู่ระบบหรือสมัครสมาชิกเพื่อส่งคำขอเครื่องมือใหม่"
          className="flex-none rounded-btn bg-primary px-5 py-[11px] text-sm font-semibold text-white no-underline hover:bg-primary-hover hover:text-white"
        >
          ส่งคำขอเครื่องมือ (เข้าสู่ระบบ)
        </Link>
      </div>
    </main>
  );
}
