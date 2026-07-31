import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "เครื่องวัดเสียงในห้องเรียน สื่อการสอนที่ช่วยคุมความดังได้จริง ใช้ฟรี | Khuncool",
  description:
    "รู้จักเครื่องวัดเสียงในห้องเรียน สื่อการสอนออนไลน์ที่ช่วยให้นักเรียนเห็นและควบคุมความดังของตัวเองแบบเรียลไทม์ พร้อมวิธีใช้และไอเดียนำไปใช้จริง",
  alternates: {
    canonical: "https://www.khuncool.com/blog/noise-meter",
  },
  openGraph: {
    type: "article",
    title: "เครื่องวัดเสียงในห้องเรียน สื่อการสอนที่ช่วยคุมความดังได้จริง",
    description:
      "รู้จักเครื่องวัดเสียงในห้องเรียน พร้อมวิธีใช้และไอเดียนำไปใช้จริงในห้องเรียน",
    images: ["https://www.khuncool.com/assets/noise-meter-blog-cover.webp"],
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
          name: "สื่อการสอน",
          item: "https://www.khuncool.com/blog/noise-meter",
        },
      ],
    },
    {
      "@type": "Article",
      headline:
        "เครื่องวัดเสียงในห้องเรียน สื่อการสอนที่ช่วยคุมความดังได้จริง",
      inLanguage: "th",
      datePublished: "2026-07-31",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/noise-meter-blog-cover.webp",
      mainEntityOfPage: "https://www.khuncool.com/blog/noise-meter",
    },
  ],
};

const summary = [
  "เครื่องวัดเสียงในห้องเรียน คือสื่อการสอนออนไลน์ที่วัดระดับความดังแบบเรียลไทม์",
  "ใช้ฟรี ไม่ต้องติดตั้ง เสียงถูกประมวลผลในเครื่องเท่านั้น ไม่มีการอัดหรือส่งข้อมูลออกไป",
  "ช่วยให้นักเรียนเห็นระดับเสียงของตัวเองและช่วยกันควบคุมโดยไม่ต้องให้ครูคอยเตือน",
];

const steps = [
  {
    k: "1. อนุญาตไมโครโฟน",
    v: "เมื่อเปิดหน้านี้ครั้งแรก เบราว์เซอร์จะขออนุญาตใช้ไมโครโฟน กดอนุญาตเพื่อเริ่มวัดเสียง",
  },
  {
    k: "2. ดูระดับเสียงเรียลไทม์",
    v: "หน้าจอแสดงระดับความดังของเสียงในห้องแบบเรียลไทม์ พร้อมสีที่เปลี่ยนตามความดัง",
  },
  {
    k: "3. ฉายขึ้นจอ",
    v: "ฉายหน้าจอขึ้นโปรเจกเตอร์หรือทีวี ให้นักเรียนเห็นระดับเสียงและช่วยกันควบคุมความดังด้วยตัวเอง",
  },
  {
    k: "4. ปรับเกณฑ์ตามกิจกรรม",
    v: "ตั้งค่าระดับเสียงที่ยอมรับได้ให้เหมาะกับแต่ละกิจกรรม เช่น ทำงานกลุ่มหรือช่วงสอบย่อย",
  },
];

const ideas = [
  {
    icon: "🔇",
    head: "ควบคุมความดังระหว่างทำงานกลุ่ม",
    body: "ให้นักเรียนเห็นระดับเสียงของตัวเองและช่วยกันควบคุมความดังโดยไม่ต้องให้ครูคอยเตือน",
  },
  {
    icon: "📖",
    head: "ช่วงทำงานเงียบหรืออ่านหนังสือ",
    body: "ใช้เตือนเมื่อระดับเสียงในห้องดังเกินไป เหมาะกับกิจกรรมที่ต้องการสมาธิ",
  },
  {
    icon: "📝",
    head: "ช่วงสอบย่อยหรือทำแบบทดสอบ",
    body: "รักษาความเงียบในห้องระหว่างทำข้อสอบ ลดการรบกวนจากเสียงพูดคุย",
  },
  {
    icon: "🎮",
    head: "ใช้เป็นเกมแข่งความเงียบ",
    body: "จับเวลาแข่งกันว่ากลุ่มไหนควบคุมความเงียบได้นานที่สุด สร้างความสนุกในการฝึกวินัย",
  },
];

const tags = [
  "เครื่องวัดเสียงในห้องเรียน",
  "คุมความดังห้องเรียน",
  "สื่อการสอนออนไลน์",
  "noise meter",
  "เครื่องมือครูฟรี",
  "วินัยในห้องเรียน",
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
    title: "เกมแข่งเป็ดสุ่มชื่อ สื่อการสอนสนุกที่ครูควรมี",
    date: "31 ก.ค. 2569",
    href: "/blog/duck-race",
  },
  {
    cat: "เครื่องมือครู",
    title: "เปิดเครื่องวัดเสียงในห้องเรียน ใช้ฟรีทันที",
    date: "",
    href: "/classroom-noise-meter",
  },
];

export default function BlogNoiseMeterPage() {
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
            สื่อการสอน
          </span>
        </div>
      </nav>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/noise-meter-blog-cover.webp"
          alt="เครื่องวัดเสียงในห้องเรียน สื่อการสอนออนไลน์"
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
            <span className="text-[12px] text-ink-faint">
              31 ก.ค. 2569 · อ่าน 5 นาที · โดย ทีมคุณคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            เครื่องวัดเสียงในห้องเรียน สื่อการสอนที่ช่วยคุมความดังได้จริง
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            ห้องเรียนเสียงดังจนต้องคอยตะโกนเตือนบ่อย ๆ ไหมครับ{" "}
            <b>เครื่องวัดเสียงในห้องเรียน</b>{" "}
            คือสื่อการสอนออนไลน์ที่ให้นักเรียนเห็นระดับความดังของตัวเองแบบเรียลไทม์
            และช่วยกันควบคุมได้เองโดยไม่ต้องให้ครูคอยเตือน ใช้ฟรี
            ไม่ต้องติดตั้ง ขุนคูลสรุปวิธีใช้และไอเดียนำไปใช้จริงมาให้แบบเข้าใจง่าย
          </p>

          <h2 className="text-xl md:text-2xl">
            เครื่องวัดเสียงในห้องเรียน คืออะไร
          </h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            เครื่องวัดเสียงในห้องเรียน เป็นสื่อการสอนที่ใช้ไมโครโฟนของอุปกรณ์วัดระดับความดังของเสียงในห้องแบบเรียลไทม์
            แล้วแสดงผลเป็นแถบสีที่เปลี่ยนไปตามความดัง เมื่อฉายขึ้นจอหรือโปรเจกเตอร์
            นักเรียนจะเห็นระดับเสียงของตัวเองและช่วยกันควบคุมความดังได้ทันที
            โดยเสียงทั้งหมดถูกประมวลผลในเครื่องของผู้ใช้เท่านั้น
            ไม่มีการอัดเสียงหรือส่งข้อมูลออกไปที่ใดทั้งสิ้น
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">ทำไมครูควรมีเครื่องมือนี้</h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            การคุมความดังในห้องเรียนเป็นเรื่องที่ครูต้องเจอแทบทุกวัน
            โดยเฉพาะช่วงทำงานกลุ่มหรือกิจกรรมที่นักเรียนตื่นเต้น
            การมีเครื่องมือที่แสดงระดับเสียงให้เห็นชัดเจนช่วยเปลี่ยนบทบาทของครูจาก
            &quot;คนคอยเตือน&quot; เป็น &quot;คนกำหนดกติกา&quot;
            ให้นักเรียนได้ฝึกสังเกตและควบคุมพฤติกรรมของตัวเอง
            ซึ่งเป็นทักษะการจัดการตนเองที่มีประโยชน์ในระยะยาว
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">วิธีใช้งาน 4 ขั้นตอน</h2>
          <div className="overflow-hidden rounded-2xl border border-[#CDEEE3]">
            <div className="hidden gap-3.5 bg-[#F2FBF8] px-[18px] py-3 text-xs font-bold text-[#0A7A66] md:flex">
              <span className="w-[170px] flex-none">ขั้นตอน</span>
              <span className="flex-1">รายละเอียด</span>
            </div>
            {steps.map((s) => (
              <div
                key={s.k}
                className="flex gap-2.5 border-t border-[#E3F5EF] p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]"
              >
                <span className="w-24 flex-none text-xs font-bold text-[#0A7A66] md:w-[170px] md:text-[14.5px] md:font-bold md:text-[#1A1D26]">
                  {s.k}
                </span>
                <span className="flex-1 text-[13px] leading-[1.6] md:text-base md:leading-[1.6]">
                  {s.v}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">ใช้ทำอะไรได้บ้าง</h2>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3.5">
            {ideas.map((u) => (
              <div
                key={u.head}
                className="rounded-2xl border border-border bg-surface-light p-3.5 md:p-4"
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-lg md:text-[19px]">{u.icon}</span>
                  <span className="text-sm font-bold md:text-[15.5px]">
                    {u.head}
                  </span>
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {u.body}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            ข้อมูลเสียงปลอดภัยแค่ไหน
          </h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            หลายคนกังวลว่าการอนุญาตให้เว็บใช้ไมโครโฟนจะมีการอัดเสียงเก็บไว้หรือไม่
            คำตอบคือไม่มี ระดับเสียงถูกวัดและประมวลผลอยู่ในเครื่องของผู้ใช้เท่านั้น
            ไม่มีการบันทึกหรือส่งข้อมูลเสียงออกไปนอกเครื่องแต่อย่างใด
            จึงมั่นใจได้ว่าปลอดภัยสำหรับใช้ในห้องเรียน
          </p>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">บทสรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              เครื่องวัดเสียงในห้องเรียน เป็นสื่อการสอนออนไลน์ฟรีที่ช่วยให้การควบคุมความดังในห้องเรียนง่ายขึ้นและยั่งยืนกว่าการตะโกนเตือน
              ใช้งานง่าย ปลอดภัย ไม่ต้องติดตั้ง ลองเปิดใช้งานได้เลยที่{" "}
              <Link href="/classroom-noise-meter">
                หน้าเครื่องวัดเสียงในห้องเรียน
              </Link>
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              ขุนคูลจะรวบรวมสื่อการสอนและเครื่องมือฟรีสำหรับครูมาอัปเดตให้เรื่อย ๆ
              อย่าลืมติดตามหมวด <Link href="/tools">สื่อการสอนออนไลน์</Link>{" "}
              ของเว็บไซต์เพื่อไม่พลาดเครื่องมือใหม่ ๆ
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
          <div className="rounded-2xl border border-[#CDEEE3] bg-[#F2FBF8] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-[#0A7A66]">
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
            <div className="mt-4 border-t border-[#DDF2EB] pt-3.5">
              <Link
                href="/classroom-noise-meter"
                className="block rounded-xl bg-[#0A7A66] px-4 py-2.5 text-center text-[13.5px] font-bold text-white no-underline hover:opacity-90"
              >
                🔊 เปิดเครื่องวัดเสียง
              </Link>
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
                  {r.date && (
                    <div className="mt-0.5 text-[11.5px] text-ink-faint">
                      {r.date}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
