import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "ทำแบบทดสอบรับเกียรติบัตรฟรี อบรมออนไลน์ สพฐ. เรื่อง AI ประกันคุณภาพการศึกษา โมดูล 1 | Khuncool",
  description:
    "รวมลิงก์ทำแบบทดสอบหลังเรียน อบรมออนไลน์ สพฐ. หลักสูตรการประยุกต์ใช้ AI ในการประกันคุณภาพภายในสถานศึกษา โมดูล 1 พร้อมเอกสารประกอบการอบรม เงื่อนไขรับเกียรติบัตร และวิธีทำแบบทดสอบให้ผ่านฉลุย",
  alternates: {
    canonical: "https://www.khuncool.com/blog/ai-qa-cert-module1",
  },
  openGraph: {
    type: "article",
    title:
      "ทำแบบทดสอบรับเกียรติบัตรฟรี อบรมออนไลน์ สพฐ. เรื่อง AI ประกันคุณภาพการศึกษา โมดูล 1",
    description:
      "รวมลิงก์ทำแบบทดสอบหลังเรียน อบรมออนไลน์ สพฐ. เรื่อง AI ประกันคุณภาพการศึกษา โมดูล 1 พร้อมเงื่อนไขรับเกียรติบัตรและคำแนะนำก่อนกดส่งคำตอบ",
    images: ["https://www.khuncool.com/assets/ai-qa-cert-module1-cover.webp"],
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
          name: "คอร์สเรียน",
          item: "https://www.khuncool.com/blog/ai-qa-cert-module1",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      headline:
        "ทำแบบทดสอบรับเกียรติบัตรฟรี อบรมออนไลน์ สพฐ. เรื่อง AI ประกันคุณภาพการศึกษา โมดูล 1",
      inLanguage: "th",
      datePublished: "2026-08-02",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/ai-qa-cert-module1-cover.webp",
      mainEntityOfPage: "https://www.khuncool.com/blog/ai-qa-cert-module1",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "ต้องได้คะแนนเท่าไหร่ถึงจะได้เกียรติบัตร?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ต้องทำแบบทดสอบให้ได้คะแนนไม่น้อยกว่าร้อยละ 60",
          },
        },
        {
          "@type": "Question",
          name: "ถ้าไม่ได้ดูสดวันอบรม จะยังทำแบบทดสอบได้ไหม?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ได้ สามารถรับชมคลิปย้อนหลังทาง YouTube Channel ของ OBEC Channel เพื่อทบทวนเนื้อหาก่อนทำแบบทดสอบ",
          },
        },
        {
          "@type": "Question",
          name: "กรอกชื่อผิดในแบบทดสอบ แก้ไขได้ไหม?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ควรตรวจสอบชื่อ-นามสกุลให้ถูกต้องก่อนกดส่งคำตอบทุกครั้ง เนื่องจากเกียรติบัตรจะออกตามข้อมูลที่กรอกในระบบ",
          },
        },
      ],
    },
  ],
};

const summary = [
  "อบรมออนไลน์ สพฐ. หลักสูตร AI ประกันคุณภาพการศึกษา โมดูล 1",
  "ทำแบบทดสอบหลังเรียนให้ได้คะแนนไม่ต่ำกว่าร้อยละ 60 จึงจะได้เกียรติบัตร",
  "ตรวจสอบชื่อ-นามสกุลให้ถูกต้องก่อนกดส่งคำตอบทุกครั้ง",
];

const steps = [
  {
    n: "1",
    head: "ศึกษาเนื้อหาก่อน",
    text: "อ่านเอกสารประกอบการอบรม หรือรับชมคลิปวิดีโอย้อนหลังทาง YouTube Channel ของ OBEC Channel เพื่อทบทวนเนื้อหาโมดูลที่ 1",
  },
  {
    n: "2",
    head: "ตรวจสอบข้อมูลส่วนตัว",
    text: "เตรียมชื่อ-นามสกุล และข้อมูลที่จำเป็นสำหรับกรอกแบบฟอร์มให้พร้อม",
  },
  {
    n: "3",
    head: "เข้าทำแบบทดสอบ",
    text: "คลิกลิงก์แบบทดสอบ (Google Form) แล้วตอบคำถามให้ครบทุกข้อ",
  },
  {
    n: "4",
    head: "ตรวจทานก่อนส่ง",
    text: "อ่านทวนชื่อ-นามสกุลอีกครั้งก่อนกดยืนยันส่งคำตอบ",
  },
  {
    n: "5",
    head: "รอรับเกียรติบัตร",
    text: "หากได้คะแนนผ่านเกณฑ์ร้อยละ 60 ขึ้นไป ระบบจะดำเนินการออกเกียรติบัตรตามขั้นตอนของ สพฐ.",
  },
];

const docs = [
  {
    label: "เอกสารคู่มือการประยุกต์ใช้ AI ในการพัฒนาระบบประกันคุณภาพการศึกษา",
    href: "https://www.kruwandee.com/datas/file/1785553680.pdf",
  },
  {
    label:
      "เอกสารประกอบโมดูลที่ 1 เรื่องการประกันคุณภาพภายในสถานศึกษาและการประยุกต์ใช้ AI",
    href: "https://www.kruwandee.com/datas/file/1785553809.pdf",
  },
  {
    label: "ลิงก์สำรอง Google Drive ต้นทางจาก สพฐ. (รวมเอกสารทั้งหมด)",
    href: "https://drive.google.com/drive/folders/1q87DTtw38qfZJB2evu0AkQgBglUPIBSx",
  },
];

const faqs = [
  {
    q: "ต้องได้คะแนนเท่าไหร่ถึงจะได้เกียรติบัตร?",
    a: "ต้องทำแบบทดสอบให้ได้คะแนนไม่น้อยกว่าร้อยละ 60",
  },
  {
    q: "ถ้าไม่ได้ดูสดวันอบรม จะยังทำแบบทดสอบได้ไหม?",
    a: "ได้ สามารถรับชมคลิปย้อนหลังทาง YouTube Channel ของ OBEC Channel เพื่อทบทวนเนื้อหาก่อนทำแบบทดสอบ",
  },
  {
    q: "กรอกชื่อผิดในแบบทดสอบ แก้ไขได้ไหม?",
    a: "ควรตรวจสอบชื่อ-นามสกุลให้ถูกต้องก่อนกดส่งคำตอบทุกครั้ง เนื่องจากเกียรติบัตรจะออกตามข้อมูลที่กรอกในระบบ",
  },
];

const tags = [
  "แบบทดสอบรับเกียรติบัตร",
  "AI ประกันคุณภาพการศึกษา",
  "อบรมออนไลน์ สพฐ.",
  "เกียรติบัตรฟรี 2569",
  "OBEC Channel",
  "ประกันคุณภาพภายในสถานศึกษา",
];

const related = [
  {
    cat: "คอร์สเรียน",
    title: "มหาวิทยาลัยมหิดล เปิด 2 คอร์สเรียนฟรี สำหรับคนรักสัตว์ มีใบเซอร์",
    date: "31 ก.ค. 2569",
    href: "/blog/mahidol-pet-courses",
  },
  {
    cat: "คอร์สเรียน",
    title: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์สที่ครูควรรู้",
    date: "25 ก.ค. 2568",
    href: "/blog/psu-english",
  },
  {
    cat: "ข่าวการศึกษา",
    title: "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา",
    date: "31 ก.ค. 2569",
    href: "/blog/prachinburi2-recruit-2569",
  },
  {
    cat: "ข่าวการศึกษา",
    title: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.",
    date: "25 ก.ค. 2569",
    href: "/blog/royal-award-2569",
  },
];

export default function BlogAiQaCertModule1Page() {
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
            คอร์สเรียน
          </span>
        </div>
      </nav>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/ai-qa-cert-module1-cover.webp"
          alt="ทำแบบทดสอบรับเกียรติบัตรฟรี อบรมออนไลน์ สพฐ. เรื่อง AI ประกันคุณภาพการศึกษา โมดูล 1"
          width={1200}
          height={630}
          priority
          className="block w-full rounded-card-lg bg-[#F1F3F6] object-cover md:rounded-[20px]"
        />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#FFF8EE] px-2.5 py-1 text-[12px] font-bold text-[#8A5A1A] md:px-[11px] md:py-[5px]">
              คอร์สเรียน
            </span>
            <span className="rounded-pill bg-[#DFF5EF] px-2.5 py-1 text-[12px] font-semibold text-[#0A7A66] md:px-[11px] md:py-[5px]">
              มีเกียรติบัตร ✅
            </span>
            <span className="text-[12px] text-ink-faint">
              2 ส.ค. 2569 · อ่าน 4 นาที · โดย ทีมขุนคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            ทำแบบทดสอบรับเกียรติบัตรฟรี อบรมออนไลน์ สพฐ. เรื่อง AI
            ประกันคุณภาพการศึกษา (โมดูล 1)
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            หากคุณครูหรือผู้บริหารสถานศึกษาท่านใดกำลังมองหา
            ลิงก์ทำแบบทดสอบหลังเรียนเพื่อรับเกียรติบัตร
            จากการอบรมออนไลน์ของสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
            ในหลักสูตร{" "}
            <b>
              &ldquo;การดำเนินงานประกันคุณภาพภายในสถานศึกษาด้วยปัญญาประดิษฐ์
              (AI)&rdquo;
            </b>{" "}
            บทความนี้รวบรวมข้อมูลที่จำเป็นทั้งหมดไว้ให้แล้ว
            ทั้งลิงก์ทำแบบทดสอบ เอกสารประกอบการอบรม เงื่อนไขการรับเกียรติบัตร
            และคำแนะนำก่อนกดส่งคำตอบ
          </p>

          <h2 className="text-xl md:text-2xl">หลักสูตรนี้เกี่ยวกับอะไร</h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            หลักสูตรอบรมออนไลน์นี้จัดทำโดย สพฐ.
            มีเป้าหมายเพื่อส่งเสริมให้ครูและผู้บริหารสถานศึกษานำเทคโนโลยีปัญญาประดิษฐ์
            (AI) มาประยุกต์ใช้ในกระบวนการประกันคุณภาพภายในสถานศึกษา
            โดยเนื้อหาของ <b>โมดูลที่ 1</b>{" "}
            ครอบคลุมเรื่องหลักการประกันคุณภาพภายในสถานศึกษา
            และแนวทางการนำ AI เข้ามาช่วยสนับสนุนกระบวนการดังกล่าว
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">เงื่อนไขการรับเกียรติบัตร</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            ผู้เข้าร่วมอบรมต้องทำแบบทดสอบหลังเรียนให้ได้คะแนนไม่ต่ำกว่า{" "}
            <b>ร้อยละ 60</b> จึงจะได้รับเกียรติบัตรจาก สพฐ.
            ดังนั้นก่อนทำแบบทดสอบ
            ขอแนะนำให้ศึกษาเอกสารประกอบการอบรมหรือรับชมคลิปย้อนหลังให้ครบถ้วนก่อน
            เพื่อให้มั่นใจว่าจะผ่านเกณฑ์ในครั้งเดียว
          </p>
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#F3D9A6] bg-[#FFFAEF] p-3.5 md:p-4">
            <span className="flex-none text-base">⚠️</span>
            <span className="text-[13.5px] leading-[1.7] text-[#2E3440] md:text-sm md:leading-[1.75]">
              <b>สิ่งสำคัญที่ต้องตรวจสอบก่อนกดส่งคำตอบ:</b>{" "}
              ชื่อ-นามสกุลที่กรอกในแบบฟอร์มต้องถูกต้องครบถ้วน
              เพราะระบบจะออกเกียรติบัตรตามข้อมูลที่กรอกไว้
              หากพิมพ์ผิดอาจไม่สามารถแก้ไขย้อนหลังได้
            </span>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            ขั้นตอนการทำแบบทดสอบเพื่อรับเกียรติบัตร
          </h2>
          <div className="mt-3 flex flex-col gap-3 md:gap-[13px]">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:h-7 md:w-7 md:text-[13.5px]">
                  {s.n}
                </span>
                <span className="pt-0.5 text-sm leading-[1.65] text-[#2E3440] md:text-[15.5px] md:leading-[1.7]">
                  <b>{s.head}</b> — {s.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#C6C9FB] bg-[#F5F6FF] p-4 md:flex-row md:items-center md:gap-4 md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">
                พร้อมทำแบบทดสอบแล้ว?
              </div>
              <div className="text-[13.5px] text-ink-secondary">
                คลิกลิงก์ทำแบบทดสอบ (Google Form) — ตอบให้ครบทุกข้อ
                และตรวจชื่อ-นามสกุลก่อนกดส่ง
              </div>
            </div>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd4gGwIiFmBz5JKEblE6wHNscN7j6wl3XexKS5dWHHmRX4pcg/viewform"
              target="_blank"
              rel="noopener"
              className="flex-none rounded-xl bg-primary px-5 py-3.5 text-center text-sm font-bold text-white no-underline shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:bg-[#4A46D6]"
            >
              ทำแบบทดสอบ ↗
            </a>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            เอกสารประกอบการอบรม (ดาวน์โหลดฟรี)
          </h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            สำหรับคุณครูที่ต้องการทบทวนเนื้อหาก่อนทำแบบทดสอบ
            สามารถดาวน์โหลดเอกสารต้นฉบับจาก สพฐ. ได้ที่ลิงก์ทางการด้านล่างนี้
          </p>
          <div className="flex flex-col gap-2 md:gap-2.5">
            {docs.map((d) => (
              <a
                key={d.label}
                href={d.href}
                target="_blank"
                rel="noopener"
                className="flex items-start gap-2.5 rounded-xl bg-surface-light p-2.5 text-inherit no-underline hover:opacity-75 md:gap-3 md:rounded-2xl md:p-4"
              >
                <span className="flex-none text-sm md:text-base">📄</span>
                <span className="text-[13px] leading-[1.7] text-[#2E3440] md:text-[14.5px] md:leading-[1.75]">
                  {d.label}
                </span>
              </a>
            ))}
          </div>
          <p className="m-0 mt-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            เนื่องจากลิงก์ดาวน์โหลดเอกสารและลิงก์แบบทดสอบเป็นไฟล์ทางการที่
            สพฐ. เผยแพร่ผ่านช่องทางของ OBEC และหน่วยงานที่เกี่ยวข้อง
            แนะนำให้ตรวจสอบและเข้าถึงผ่านประกาศทางการหรือเว็บไซต์ของ สพฐ.
            โดยตรง เพื่อความถูกต้องและปลอดภัยของข้อมูล
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">รับชมคลิปอบรมย้อนหลัง</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            หากพลาดการรับชมถ่ายทอดสดในวันที่จัดอบรม
            สามารถรับชมคลิปย้อนหลังเพื่อทบทวนเนื้อหาก่อนทำแบบทดสอบได้ทางช่อง
            YouTube ของ <b>OBEC Channel</b>{" "}
            ซึ่งเป็นช่องทางการเผยแพร่เนื้อหาการอบรมอย่างเป็นทางการของ สพฐ.
          </p>
          <a
            href="https://www.youtube.com/@OBECChannel"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDEAE8] px-4 py-2.5 text-[13.5px] font-bold text-[#B3261E] no-underline hover:opacity-80 md:text-sm"
          >
            ▶ รับชมคลิปย้อนหลัง OBEC Channel ↗
          </a>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">คำถามที่พบบ่อย (FAQ)</h2>
            <div className="flex flex-col gap-3.5">
              {faqs.map((f) => (
                <div key={f.q}>
                  <div className="mb-1 text-[14.5px] font-bold md:text-[15.5px]">
                    {f.q}
                  </div>
                  <div className="text-[13.5px] leading-[1.75] text-[#2E3440] md:text-sm md:leading-[1.8]">
                    {f.a}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <p className="m-0 mb-4 text-[13px] leading-[1.75] text-ink-faint">
  บทความนี้เรียบเรียงขึ้นเพื่อรวบรวมข้อมูลเกี่ยวกับการอบรมออนไลน์และการทำแบบทดสอบรับเกียรติบัตรของ
              สพฐ. โดยอ้างอิงจากประกาศทางการที่เผยแพร่
              ทั้งนี้ผู้อ่านควรตรวจสอบลิงก์และรายละเอียดล่าสุดจากช่องทางทางการของ
              สพฐ. หรือ OBEC Channel อีกครั้งก่อนดำเนินการ
            </p>
            <div className="mb-4 text-[13px] text-ink-faint">
              ที่มา:{" "}
              <a
                href="https://www.kruwandee.com/news-id58652.html"
                target="_blank"
                rel="noopener"
                className="text-ink-faint underline"
              >
                kruwandee.com
              </a>
            </div>
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
              สรุปสั้น
            </div>
            <div className="flex flex-col gap-2">
              {summary.map((s) => (
                <div
                  key={s}
                  className="text-[13.5px] leading-[1.7] text-[#2E3440]"
                >
                  • {s}
                </div>
              ))}
            </div>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd4gGwIiFmBz5JKEblE6wHNscN7j6wl3XexKS5dWHHmRX4pcg/viewform"
              target="_blank"
              rel="noopener"
              className="mt-4 block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white no-underline hover:bg-[#4A46D6]"
            >
              ทำแบบทดสอบ ↗
            </a>
            <a
              href="https://www.youtube.com/@OBECChannel"
              target="_blank"
              rel="noopener"
              className="mt-2 block rounded-xl border border-[#E5E8EE] p-3 text-center text-sm font-bold text-ink-secondary no-underline hover:bg-surface-light"
            >
              ▶ ดูคลิปย้อนหลัง ↗
            </a>
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
