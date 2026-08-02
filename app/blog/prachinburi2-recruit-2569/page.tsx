import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการ 6 อัตรา สมัคร 3-7 ส.ค. 69 | Khuncool",
  description:
    "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา ครูคณิตศาสตร์ ภาษาอังกฤษ สังคมศึกษา ประถมศึกษา และพนักงานพี่เลี้ยง สมัคร 3-7 สิงหาคม 2569",
  alternates: {
    canonical: "https://www.khuncool.com/blog/prachinburi2-recruit-2569",
  },
  openGraph: {
    type: "article",
    title: "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา",
    description:
      "สรุปตำแหน่ง จำนวนอัตรา และช่วงเวลารับสมัครพนักงานราชการทั่วไป สพป.ปราจีนบุรี เขต 2 ปี 2569",
    images: [
      "https://www.khuncool.com/assets/prachinburi2-recruit-2569-cover.webp",
    ],
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
          name: "ข่าวการศึกษา",
          item: "https://www.khuncool.com/blog/prachinburi2-recruit-2569",
        },
      ],
    },
    {
      "@type": "NewsArticle",
      headline:
        "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา",
      inLanguage: "th",
      datePublished: "2026-07-31",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image:
        "https://www.khuncool.com/assets/prachinburi2-recruit-2569-cover.webp",
      mainEntityOfPage:
        "https://www.khuncool.com/blog/prachinburi2-recruit-2569",
    },
  ],
};

const summary = [
  "สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป รวม 6 อัตรา",
  "ครอบคลุมวิชาเอกคณิตศาสตร์ ภาษาอังกฤษ สังคมศึกษา ประถมศึกษา และพนักงานพี่เลี้ยง",
  "เปิดรับสมัคร 3-7 สิงหาคม 2569",
];

const positions = [
  { k: "คณิตศาสตร์", v: "1 อัตรา" },
  { k: "ภาษาอังกฤษ", v: "1 อัตรา" },
  { k: "สังคมศึกษา", v: "1 อัตรา" },
  { k: "ประถมศึกษา", v: "2 อัตรา" },
  { k: "พนักงานพี่เลี้ยง", v: "1 อัตรา" },
];

const tips = [
  "อ่านประกาศรับสมัครฉบับเต็มอย่างละเอียด เพื่อตรวจสอบคุณวุฒิ/วิชาเอกที่ตรงตามเกณฑ์",
  "เตรียมเอกสารหลักฐานการสมัครให้ครบถ้วนก่อนถึงวันยื่นใบสมัคร",
  "ติดตามประกาศรายชื่อผู้มีสิทธิสอบและกำหนดการสอบผ่านช่องทางทางการของหน่วยงานอย่างสม่ำเสมอ",
  "หากมีข้อสงสัย ควรติดต่อสอบถามโดยตรงกับกลุ่มบริหารงานบุคคล สพป.ปราจีนบุรี เขต 2",
];

const tags = [
  "สพป.ปราจีนบุรี เขต 2",
  "พนักงานราชการ 2569",
  "สมัครงานครู",
  "ข่าวการศึกษา 2569",
  "รับสมัครครูผู้สอน",
];

const related = [
  {
    cat: "ข่าวการศึกษา",
    title: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.",
    date: "25 ก.ค. 2569",
    href: "/blog/royal-award-2569",
  },
  {
    cat: "คอร์สเรียน",
    title: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์สที่ครูควรรู้",
    date: "25 ก.ค. 2568",
    href: "/blog/psu-english",
  },
  {
    cat: "สื่อการสอน",
    title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง",
    date: "27 ก.ค. 2569",
    href: "/blog/wheel",
  },
];

export default function BlogPrachinburi2Recruit2569Page() {
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
            ข่าวการศึกษา
          </span>
        </div>
      </nav>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/prachinburi2-recruit-2569-cover.webp"
          alt="สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา"
          width={1200}
          height={630}
          priority
          className="block w-full rounded-card-lg bg-[#F1F3F6] object-cover md:rounded-[20px]"
        />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#E1E3FD] px-2.5 py-1 text-[12px] font-bold text-[#3D38B4] md:px-[11px] md:py-[5px]">
              ข่าวการศึกษา
            </span>
            <span className="rounded-pill bg-[#FDEAE8] px-2.5 py-1 text-[12px] font-semibold text-[#B3261E] md:px-[11px] md:py-[5px]">
              มีกำหนดเวลา
            </span>
            <span className="text-[12px] text-ink-faint">
              31 ก.ค. 2569 · อ่าน 4 นาที · โดย ทีมคุณคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป 6 อัตรา
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            สำนักงานเขตพื้นที่การศึกษาประถมศึกษาปราจีนบุรี เขต 2
            (สพป.ปราจีนบุรี เขต 2) ประกาศเปิดรับสมัครบุคคลเพื่อเลือกสรรเป็น{" "}
            <b>พนักงานราชการทั่วไป ประจำปีงบประมาณ 2569 จำนวน 6 อัตรา</b>{" "}
            สำหรับผู้ที่สนใจสมัครงานสายครูและบุคลากรทางการศึกษาในพื้นที่จังหวัดปราจีนบุรี
            คุณคูลสรุปตำแหน่ง จำนวนอัตรา
            และช่วงเวลารับสมัครมาให้แบบเข้าใจง่าย
          </p>

          <h2 className="text-xl md:text-2xl">ตำแหน่งที่เปิดรับสมัคร</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            สพป.ปราจีนบุรี เขต 2 เปิดรับสมัครพนักงานราชการทั่วไป
            ตำแหน่งครูผู้สอนและพนักงานพี่เลี้ยง รวมทั้งสิ้น 6 อัตรา
            แบ่งตามกลุ่มวิชาเอกและตำแหน่ง ดังนี้
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#D6D9F5]">
            <div className="hidden gap-3.5 bg-[#F4F5FE] px-[18px] py-3 text-xs font-bold text-[#3D38B4] md:flex">
              <span className="w-[200px] flex-none">กลุ่มวิชา/ตำแหน่ง</span>
              <span className="flex-1">จำนวนอัตรา</span>
            </div>
            {positions.map((p) => (
              <div
                key={p.k}
                className="flex gap-2.5 border-t border-[#E9EAFA] p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]"
              >
                <span className="w-24 flex-none text-xs font-bold text-[#3D38B4] md:w-[200px] md:text-[14.5px] md:font-bold md:text-[#1A1D26]">
                  {p.k}
                </span>
                <span className="flex-1 text-[13px] leading-[1.6] md:text-base md:leading-[1.6]">
                  {p.v}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">ระยะเวลารับสมัคร</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            เปิดรับสมัครระหว่างวันที่ <b>3-7 สิงหาคม 2569</b>
            ผู้สนใจควรเตรียมเอกสารและวางแผนการเดินทางไปยื่นใบสมัครล่วงหน้า
            เพื่อไม่ให้พลาดโอกาสภายในกรอบเวลาที่กำหนด
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">
            รายละเอียดเพิ่มเติมและคุณสมบัติผู้สมัคร
          </h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            ผู้สนใจสมัครควรตรวจสอบคุณสมบัติเฉพาะตำแหน่ง วุฒิการศึกษา
            เกณฑ์การคัดเลือก และเอกสารประกอบการสมัครที่ครบถ้วน
            โดยสามารถดาวน์โหลดประกาศฉบับเต็มได้จากเว็บไซต์ทางการของสำนักงานเขตพื้นที่การศึกษาประถมศึกษาปราจีนบุรี
            เขต 2 ที่{" "}
            <a
              href="https://prachinburiarea2.go.th/web/pdf/news/news_84.pdf"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              prachinburiarea2.go.th
            </a>
          </p>
          <div className="flex flex-col gap-2 md:gap-2.5">
            {tips.map((t) => (
              <div
                key={t}
                className="flex items-start gap-2.5 rounded-xl bg-surface-light p-2.5 md:gap-3 md:rounded-2xl md:p-4"
              >
                <span className="flex-none text-sm md:text-base">✅</span>
                <span className="text-[13px] leading-[1.7] text-[#2E3440] md:text-[14.5px] md:leading-[1.75]">
                  {t}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">บทสรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              การเปิดรับสมัครพนักงานราชการทั่วไปของ สพป.ปราจีนบุรี เขต 2
              ในครั้งนี้ถือเป็นโอกาสดีสำหรับผู้ที่มีวุฒิตรงตามสาขาที่เปิดรับ
              ผู้สนใจควรตรวจสอบคุณสมบัติและเตรียมเอกสารให้พร้อม
              ก่อนยื่นใบสมัครภายในกรอบเวลา <b>3-7 สิงหาคม 2569</b>
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              คุณคูลจะติดตามความเคลื่อนไหวข่าวการศึกษาที่เป็นประโยชน์ต่อครูและผู้สมัครงานมาอัปเดตให้เรื่อย
              ๆ อย่าลืมติดตามหมวด <Link href="/">ข่าวการศึกษา</Link>{" "}
              ของเว็บไซต์เพื่อไม่พลาดข้อมูลสำคัญ
            </p>
            <div className="mb-4 text-[13px] text-ink-faint">
              ที่มา: สำนักงานเขตพื้นที่การศึกษาประถมศึกษาปราจีนบุรี เขต 2
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
          <div className="rounded-2xl border border-[#D6D9F5] bg-[#F4F5FE] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-[#3D38B4]">
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
            <div className="mt-4 border-t border-[#E1E3FD] pt-3.5">
              <div className="mb-1 text-[11.5px] font-bold text-[#3D38B4]">
                ช่วงเวลารับสมัคร
              </div>
              <div className="text-[22px] font-extrabold">3-7 ส.ค. 2569</div>
            </div>
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
