import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import SignInCta from "./SignInCta";
import { APPS, CASES, FAQS, RELATED, TRUST_CHIPS } from "./data";

export const metadata: Metadata = {
  title: "แอปช่วยงานครู เช็กชื่อ ออมเงิน โฮมรูม ใช้ฟรี | khuncool",
  description:
    "รวมแอปช่วยงานครูใช้ฟรีในเว็บเดียว เช็กชื่อนักเรียน บันทึกเงินออม บันทึกโฮมรูม และกระดานคะแนนกลุ่ม เก็บข้อมูลรายห้องรายคนต่อเนื่อง ล็อกอินแล้วซิงก์ทุกเครื่อง ไม่ต้องติดตั้ง",
  alternates: {
    canonical: "https://www.khuncool.com/apps",
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
          name: "แอปช่วยงานครู",
          item: "https://www.khuncool.com/apps",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "แอปช่วยงานครู",
      url: "https://www.khuncool.com/apps",
      inLanguage: "th-TH",
      description:
        "รวมแอปบันทึกข้อมูลนักเรียนสำหรับครู ใช้ฟรีผ่านเว็บ ไม่ต้องติดตั้ง",
    },
    {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: APPS.length,
      itemListElement: APPS.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
        url: `https://www.khuncool.com${a.href}`,
      })),
    },
    {
      "@type": "SoftwareApplication",
      name: "khuncool แอปช่วยงานครู",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: "https://www.khuncool.com/apps",
      inLanguage: "th-TH",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "THB",
      },
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

export default function AppsPage() {
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
            แอปช่วยงานครู
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-4 pb-[22px] pt-3 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-11 md:px-8 md:pb-[30px] md:pt-4">
        <div>
          <h1 className="m-0 mb-2.5 text-[26px] leading-[1.32] md:mb-3.5 md:max-w-[17ch] md:text-[42px] md:leading-[1.25]">
            <span className="md:hidden">
              แอปช่วยงานครู
              <br />
              บันทึกข้อมูลนักเรียนใช้ฟรี
            </span>
            <span className="hidden md:inline">
              แอปช่วยงานครู บันทึกข้อมูลนักเรียนใช้ฟรี
            </span>
          </h1>
          <p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[56ch] md:text-base md:leading-[1.8]">
            <span className="md:hidden">
              เช็กชื่อ ออมเงิน บันทึกโฮมรูม และคะแนนกลุ่ม
              เก็บต่อเนื่องรายห้องรายคน
              เปิดจากมือถือระหว่างสอนแล้วทำสรุปต่อจากคอมที่บ้านได้
              ไม่ต้องติดตั้งโปรแกรม
            </span>
            <span className="hidden md:inline">
              khuncool รวมแอปที่ครูไทยต้องใช้ทุกวันไว้ในเว็บเดียว
              ทั้งเช็กชื่อนักเรียน บันทึกเงินออม บันทึกโฮมรูม
              และกระดานคะแนนกลุ่ม
              ต่างจากเครื่องมือใช้สดในคาบตรงที่แอปกลุ่มนี้เก็บข้อมูลต่อเนื่องรายห้องรายคน
              ย้อนดูได้ สรุปเป็นรายงานส่งโรงเรียนได้
              และเมื่อล็อกอินแล้วข้อมูลจะซิงก์ตามไปทุกเครื่องโดยไม่ต้องติดตั้งโปรแกรมใด
              ๆ
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
          <h2 className="m-0 mb-3 text-[15px]">เลือกจากงานที่ต้องทำวันนี้</h2>
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

      {/* App cards */}
      <div className="px-4 pb-6 md:px-8 md:pb-[34px]">
        <h2 className="m-0 hidden text-2xl md:mb-1.5 md:block">แอปทั้งหมด</h2>
        <p className="m-0 mb-[18px] hidden max-w-[62ch] text-[14.5px] leading-[1.7] text-ink-secondary md:block">
          แต่ละแอปมีหน้าของตัวเอง เปิดใช้ได้ทันทีโดยไม่ต้องสมัคร
          ล็อกอินเมื่อต้องการให้ข้อมูลตามไปทุกเครื่อง
        </p>
        <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
          {APPS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-card p-3.5 text-inherit no-underline hover:border-[#C6C9FB] hover:bg-[#FBFBFE] md:h-full md:rounded-card-lg md:p-[22px]"
            >
              <div className="flex items-center gap-[11px] md:mb-[13px] md:gap-3.5">
                <div
                  className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] text-xl md:h-[50px] md:w-[50px] md:rounded-[15px] md:text-2xl"
                  style={{ background: a.bg }}
                >
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 mb-0.5 text-base md:text-lg">{a.title}</h3>
                  <p className="m-0 text-xs text-ink-secondary md:text-[13px]">
                    {a.sub}
                  </p>
                </div>
                <span className="flex-none text-[13px] font-semibold text-primary md:hidden">
                  เปิด ›
                </span>
              </div>
              <p className="m-0 text-[12.5px] leading-[1.65] text-ink-secondary md:mb-3.5 md:flex-1 md:text-[13.5px] md:leading-[1.7]">
                {a.desc}
              </p>
              <div className="hidden flex-wrap gap-1.5 md:mb-3.5 md:flex">
                {a.feats.map((f) => (
                  <span
                    key={f}
                    className="rounded-lg bg-[#F1F2F6] px-2.5 py-1 text-xs text-ink-secondary"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="hidden items-center justify-between gap-2 md:flex">
                <span className="font-mono text-[11px] text-ink-faint">
                  {a.slug}
                </span>
                <span className="text-[13px] font-semibold text-primary">
                  เปิดใช้งาน ›
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile-only "pick by situation" list */}
      <div className="px-4 pb-6 md:hidden">
        <h2 className="m-0 mb-1 text-lg">ใช้ตอนไหนในงานประจำวัน</h2>
        <p className="m-0 mb-3 text-[13px] leading-[1.65] text-ink-secondary">
          เลือกจากงานที่ต้องทำวันนี้
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
            ทำไมงานเอกสารครูถึงควรอยู่ในที่เดียว
          </h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.85] text-ink-secondary">
            ครูส่วนใหญ่บันทึกการมาเรียนในสมุด บันทึกเงินออมในไฟล์ Excel
            และเขียนบันทึกโฮมรูมในอีกเล่ม
            พอถึงสิ้นเดือนต้องเปิดสามที่เพื่อทำรายงานเดียว
            การรวมทุกอย่างไว้ในบัญชีเดียวทำให้กรอกครั้งเดียวแล้วดึงสรุปออกมาได้ทันที
            และไม่ต้องกังวลว่าสมุดจะหายหรือไฟล์จะอยู่คนละเครื่อง
          </p>
          <p className="m-0 mb-[18px] text-[14.5px] leading-[1.85] text-ink-secondary">
            แอปทุกตัวใช้รายชื่อนักเรียนชุดเดียวกันกับเครื่องมือในคาบเรียน
            เพิ่มรายชื่อห้องหนึ่งครั้ง แล้วใช้ได้ทั้งการสุ่มชื่อ แบ่งกลุ่ม
            เช็กชื่อ และบันทึกเงินออม
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
        <h2 className="m-0 mb-2 text-[15px]">มองหาเครื่องมือใช้สดในคาบเรียน</h2>
        <Link href="/tools" className="text-[13px] text-primary no-underline">
          ดูเครื่องมือครูทั้งหมด ›
        </Link>
        <div className="mt-3 flex flex-col gap-[7px]">
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

      {/* Desktop-only sign-in CTA */}
      <div className="hidden items-center gap-4 border-t border-border bg-surface-light px-8 py-[26px] md:flex">
        <div className="flex-1">
          <div className="mb-[3px] text-sm font-semibold">
            ล็อกอินครั้งเดียว ใช้ต่อได้ทุกเครื่อง
          </div>
          <div className="text-[13px] text-ink-secondary">
            รายชื่อนักเรียน คะแนน และบันทึกทั้งหมดจะซิงก์ขึ้นบัญชีของคุณ
          </div>
        </div>
        <SignInCta />
      </div>
    </main>
  );
}
