import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import {
  AUTHOR_META,
  EEAT_CARDS,
  FAQS,
  POPULAR,
  RELATED_ARTICLES,
  RELATED_TOOLS,
  SUBJECTS,
  TRUST_CHIPS,
  subjectMeta,
} from "./data";
import { mediaLabel } from "./catalog";

export const metadata: Metadata = {
  title: "สื่อการสอนออนไลน์ ฟรี ทุกวิชา ป.1–ป.6 | khuncool",
  description:
    "รวมสื่อการสอนและเกมออนไลน์สำหรับครูประถม แยกตามวิชา ภาษาอังกฤษ คณิตศาสตร์ วิทยาศาสตร์ และภาษาไทย เปิดบนจอหน้าชั้นได้ทันที ใช้ฟรี ไม่ต้องติดตั้ง ไม่ต้องสมัครสมาชิก",
  alternates: {
    canonical: "https://www.khuncool.com/media",
  },
  openGraph: {
    type: "website",
    title: "สื่อการสอนออนไลน์ ฟรี ทุกวิชา ป.1–ป.6 | khuncool",
    description:
      "สื่อและเกมสำหรับครูประถม แยกตามวิชาและทักษะ ฉายจอหน้าชั้นแล้วเริ่มสอนได้ทันที",
    url: "https://www.khuncool.com/media",
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
          item: "https://www.khuncool.com/media",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "สื่อการสอนออนไลน์ ทุกวิชา",
      url: "https://www.khuncool.com/media",
      inLanguage: "th-TH",
      description: "รวมสื่อการสอนและเกมออนไลน์สำหรับครูประถม แยกตามวิชา",
    },
    {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: SUBJECTS.length,
      itemListElement: SUBJECTS.filter((s) => s.href !== "#").map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `สื่อการสอน${s.t}`,
        url: `https://www.khuncool.com${s.href}`,
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

export default function MediaPage() {
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
            สื่อการสอน
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-4 pb-[22px] pt-3 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-11 md:px-8 md:pb-[30px] md:pt-4">
        <div>
          <h1 className="m-0 mb-2.5 text-[26px] leading-[1.32] md:mb-3.5 md:max-w-[16ch] md:text-[40px] md:leading-[1.24]">
            <span className="md:hidden">
              สื่อการสอนออนไลน์
              <br />
              ทุกวิชา ใช้ฟรี
            </span>
            <span className="hidden md:inline">
              สื่อการสอนออนไลน์ ทุกวิชา สำหรับครูประถม
            </span>
          </h1>
          <p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[58ch] md:text-[15.5px] md:leading-[1.75]">
            <span className="md:hidden">
              สื่อและเกมสำหรับครูประถม แยกตามวิชาที่กำลังสอน
              ทุกชิ้นพัฒนาโดยครูที่สอนจริง ทดลองใช้ในห้องเรียนก่อนเผยแพร่
              ฉายขึ้นจอหน้าชั้นแล้วเริ่มได้ทันที
            </span>
            <span className="hidden md:inline">
              รวมสื่อและเกมการเรียนรู้แยกตามวิชาและทักษะ ทุกชิ้นพัฒนาโดยครูผู้สอนจริง
              ผ่านการใช้งานในห้องเรียนก่อนเผยแพร่ เปิดจากเบราว์เซอร์ได้ทันที
              ตัวอักษรใหญ่พอสำหรับเด็กหลังห้อง และออกแบบให้จบภายในคาบเรียนเดียว
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
            เริ่มจากวิชาที่มีสื่อครบที่สุด
          </h2>
          <Link
            href="/media/english"
            className="flex items-center gap-[13px] rounded-2xl border border-border bg-surface-card p-3.5 text-inherit no-underline hover:border-[#C6C9FB]"
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[#EEEEFD] text-[23px]">
              🔤
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="m-0 mb-0.5 text-[15.5px]">สื่อการสอนภาษาอังกฤษ</h3>
              <p className="m-0 text-[12.5px] text-ink-secondary">
                {mediaLabel("english")} · Phonics, คำศัพท์, ไวยากรณ์, การพูด
              </p>
            </div>
            <span className="flex-none text-[13px] font-semibold text-primary">
              เปิด ›
            </span>
          </Link>
        </div>
      </div>

      {/* Subjects grid */}
      <div className="px-4 pb-6 md:px-8 md:pb-[34px]">
        <h2 className="m-0 mb-1.5 text-lg md:text-2xl">เลือกตามวิชา</h2>
        <p className="m-0 mb-3 max-w-[62ch] text-[13px] leading-[1.65] text-ink-secondary md:mb-[18px] md:text-[14.5px] md:leading-[1.7]">
          แต่ละวิชามีหน้าของตัวเอง แยกสื่อตามทักษะและระดับชั้น
          เพื่อให้ครูหยิบไปวางในแผนการสอนได้ตรงจุด
        </p>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          {SUBJECTS.map((s) => (
            <Link
              key={s.t}
              href={s.href}
              className="flex items-start gap-3 rounded-2xl border border-border bg-white p-3.5 text-inherit no-underline hover:border-[#C6C9FB] hover:bg-[#FBFBFE] md:gap-[15px] md:p-[18px]"
            >
              <div
                className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-2xl text-[22px] md:h-[54px] md:w-[54px] md:text-[26px]"
                style={{ background: s.bg }}
              >
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5 md:mb-[5px] md:gap-2">
                  <h3 className="m-0 text-[15.5px] md:text-lg">{s.t}</h3>
                  <span
                    className="rounded-md px-[7px] py-0.5 text-[10px] font-semibold md:px-2 md:py-[3px] md:text-[10.5px]"
                    style={{ color: s.stFg, background: s.stBg }}
                  >
                    {mediaLabel(s.slug)}
                  </span>
                </div>
                <p className="m-0 mb-1.5 text-[12.5px] leading-[1.6] text-ink-secondary md:mb-2 md:text-[13.5px] md:leading-[1.65]">
                  {s.desc}
                </p>
                <div className="hidden flex-wrap gap-[7px] md:flex">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#EEEEFD] px-2 py-[3px] text-[11px] font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-ink-faint md:hidden">
                  {subjectMeta(s)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Most popular */}
      <div className="border-y border-[#EEF0F4] bg-surface-light px-4 py-[22px] md:px-8 md:py-[26px]">
        <h2 className="m-0 mb-1.5 text-lg md:text-2xl">
          สื่อที่ครูเปิดบ่อยที่สุดเดือนนี้
        </h2>
        <p className="m-0 mb-3 text-[13px] leading-[1.65] text-ink-secondary md:mb-[18px] md:text-[14.5px] md:leading-[1.7]">
          ข้ามหน้าวิชาไปเปิดสื่อได้เลย ทุกชิ้นมีลิงก์ของตัวเองสำหรับแชร์ในกลุ่มไลน์ครู
        </p>
        <div className="grid grid-cols-2 gap-[9px] md:grid-cols-4 md:gap-3">
          {POPULAR.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#EEF0F4] bg-white text-inherit no-underline hover:border-[#C6C9FB]"
            >
              <div
                className="relative aspect-video overflow-hidden"
                style={{ background: p.bg }}
              >
                <Image
                  src={p.image}
                  alt={`ภาพประกอบเกม ${p.t}`}
                  fill
                  sizes="(max-width: 767px) 50vw, 260px"
                  className="object-cover"
                />
              </div>
              <div className="p-[10px_11px_11px] md:p-3">
                <div className="mb-[3px] font-anuphan text-[13px] font-semibold md:text-[15px]">
                  {p.t}
                </div>
                <p className="m-0 hidden text-xs leading-[1.55] text-ink-secondary md:mb-2 md:block">
                  {p.desc}
                </p>
                <div className="text-[11px] text-ink-faint">{p.meta}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* E-E-A-T / author */}
      <div className="px-4 py-[22px] md:flex md:gap-10 md:px-8 md:py-[28px]">
        <div className="mb-6 md:mb-0 md:flex-1">
          <h2 className="m-0 mb-1.5 text-lg md:text-2xl">
            สื่อเหล่านี้ทำโดยใคร และเชื่อถือได้อย่างไร
          </h2>
          <p className="m-0 mb-3 max-w-[66ch] text-[13px] leading-[1.65] text-ink-secondary md:mb-4 md:text-[14.5px] md:leading-[1.75]">
            khuncool ไม่ใช่คลังไฟล์ที่รวบรวมจากที่อื่น
            ทุกชิ้นเขียนขึ้นใหม่โดยครูผู้สอนระดับประถมศึกษา
            ทดลองใช้ในห้องเรียนของตัวเองอย่างน้อยหนึ่งภาคเรียนก่อนเผยแพร่
            และแก้ตามสิ่งที่พังจริงหน้าชั้น
          </p>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-[11px]">
            {EEAT_CARDS.map((e) => (
              <div
                key={e.k}
                className="rounded-2xl border border-border bg-white p-3.5 md:rounded-[15px] md:p-4"
              >
                <div className="mb-1.5 font-mono text-[10.5px] font-semibold tracking-[.08em] text-success">
                  {e.k}
                </div>
                <h3 className="m-0 mb-[5px] text-[15px] md:text-[15.5px]">
                  {e.t}
                </h3>
                <p className="m-0 text-[12.5px] leading-[1.65] text-ink-secondary md:text-[13px] md:leading-[1.7]">
                  {e.d}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 md:mt-0 md:w-[340px] md:flex-none">
          <div className="rounded-2xl border border-border bg-surface-light p-4 md:rounded-card-lg md:p-5">
            <div className="mb-2.5 flex items-center gap-3 md:mb-3">
              <Image
                src="/assets/khuncool-logo.webp"
                alt=""
                width={52}
                height={52}
                className="flex-none rounded-2xl border border-border bg-white object-contain p-1.5 md:p-[7px]"
              />
              <div>
                <div className="font-anuphan text-[15px] font-bold md:text-base">
                  คุณคูล
                </div>
                <div className="text-xs leading-[1.5] text-ink-secondary md:text-[12.5px]">
                  ครูผู้สอนภาษาอังกฤษ
                  <br className="hidden md:block" /> ระดับประถมศึกษา
                </div>
              </div>
            </div>
            <p className="m-0 mb-3.5 text-[12.5px] leading-[1.75] text-ink-secondary md:text-[13px]">
              ผู้เขียนและผู้ตรวจสอบเนื้อหาทุกชิ้นในหน้านี้
              ออกแบบสื่อจากปัญหาที่เจอในคาบเรียนของตัวเอง
              แล้วเปิดให้ครูคนอื่นใช้ฟรี
            </p>
            <div className="flex flex-col gap-2 border-t border-border pt-3.5">
              {AUTHOR_META.map((m) => (
                <div
                  key={m.k}
                  className="flex items-center justify-between gap-3 text-[12.5px]"
                >
                  <span className="text-ink-faint">{m.k}</span>
                  <span className="text-right font-semibold text-ink-secondary">
                    {m.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ + related reading + tools */}
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

          <h2 className="m-0 mb-3 mt-6 text-lg md:text-[19px]">
            ใช้คู่กับเครื่องมือครู
          </h2>
          <div className="flex flex-col gap-2 md:gap-[9px]">
            {RELATED_TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-[11px] rounded-2xl border border-border bg-white p-3.5 text-inherit no-underline hover:border-[#C6C9FB]"
              >
                <div
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl text-[18px]"
                  style={{ background: t.bg }}
                >
                  {t.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-anuphan text-[14.5px] font-semibold">
                    {t.title}
                  </div>
                  <div className="text-xs text-ink-secondary">{t.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Request CTA */}
      <div className="flex items-center gap-4 border-t border-border bg-surface-light px-4 py-5 md:px-8 md:py-[22px]">
        <div className="flex-1">
          <div className="mb-[3px] text-sm font-semibold">
            อยากได้สื่อวิชาไหนก่อน
          </div>
          <div className="text-[13px] text-ink-secondary">
            ลำดับการพัฒนามาจากคำขอของครูผู้ใช้จริง บอกหัวข้อที่สอนแล้วหาสื่อยากได้เลย
          </div>
        </div>
        <Link
          href="/account"
          title="เข้าสู่ระบบหรือสมัครสมาชิกเพื่อส่งคำขอสื่อการสอนใหม่"
          className="flex-none rounded-btn bg-primary px-5 py-[11px] text-sm font-semibold text-white no-underline hover:bg-primary-hover hover:text-white"
        >
          ส่งคำขอ
        </Link>
      </div>
    </main>
  );
}
