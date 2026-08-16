import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ทำไมครูควรใช้เกมแข่งเป็ดสุ่มชื่อในห้องเรียน | Khuncool",
  description:
    "เกมแข่งเป็ดสุ่มชื่อคืออะไร ทำไมครูควรมีติดห้องเรียน พร้อมเทียบกับวงล้อสุ่มว่าควรเลือกใช้แบบไหนในแต่ละสถานการณ์",
  alternates: {
    canonical: "https://www.khuncool.com/blog/duck-race",
  },
  openGraph: {
    type: "article",
    title: "ทำไมครูควรใช้เกมแข่งเป็ดสุ่มชื่อในห้องเรียน",
    description:
      "เกมแข่งเป็ดสุ่มชื่อคืออะไร ทำไมครูควรมีติดห้องเรียน พร้อมเทียบกับวงล้อสุ่ม",
    images: ["https://www.khuncool.com/assets/duck-race-blog-cover.webp"],
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
          name: "ทำไมครูควรใช้เกมแข่งเป็ดสุ่มชื่อ",
          item: "https://www.khuncool.com/blog/duck-race",
        },
      ],
    },
    {
      "@type": "Article",
      headline: "ทำไมครูควรใช้เกมแข่งเป็ดสุ่มชื่อในห้องเรียน",
      inLanguage: "th",
      datePublished: "2026-07-31",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/duck-race-blog-cover.webp",
      mainEntityOfPage: "https://www.khuncool.com/blog/duck-race",
    },
  ],
};

const summary = [
  "เกมแข่งเป็ดสุ่มชื่อ คือสื่อการสอนออนไลน์ที่สุ่มชื่อนักเรียนผ่านการแข่งขันแบบมีลุ้น",
  "ใช้ฟรี ไม่ต้องติดตั้ง ไม่ต้องสมัครสมาชิก เปิดผ่านเบราว์เซอร์ได้ทันที",
  "เหมาะกับการฉายขึ้นจอโปรเจกเตอร์หรือทีวีในห้องเรียน",
];

const tags = [
  "แข่งเป็ดสุ่มชื่อ",
  "สื่อการสอนออนไลน์",
  "สุ่มชื่อนักเรียน",
  "เกมในห้องเรียน",
  "เครื่องมือครูฟรี",
  "duck race",
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
    cat: "เครื่องมือครู",
    title: "เล่นเกมแข่งเป็ดสุ่มชื่อ ใช้ฟรีทันที",
    date: "",
    href: "/duck-race",
  },
];

export default function BlogDuckRacePage() {
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
          src="/assets/duck-race-blog-cover.webp"
          alt="เกมแข่งเป็ดสุ่มชื่อนักเรียน สื่อการสอนออนไลน์"
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
            ทำไมครูควรใช้เกมแข่งเป็ดสุ่มชื่อในห้องเรียน
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            เบื่อการสุ่มชื่อแบบเดิม ๆ ไหมครับ{" "}
            <b>เกมแข่งเป็ดสุ่มชื่อนักเรียน</b>{" "}
            คือสื่อการสอนออนไลน์ที่เปลี่ยนการสุ่มชื่อให้กลายเป็นกิจกรรมที่เด็กลุ้นและเชียร์กันสนุก
            ใช้ฟรี ไม่ต้องติดตั้ง คุณคูลสรุปวิธีใช้และไอเดียนำไปใช้จริงในห้องเรียนมาให้แบบเข้าใจง่าย
          </p>

          <h2 className="text-xl md:text-2xl">
            เกมแข่งเป็ดสุ่มชื่อ คืออะไร
          </h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            เกมแข่งเป็ดสุ่มชื่อ เป็นสื่อการสอนที่แปลงรายชื่อนักเรียนแต่ละคนให้กลายเป็นเป็ดหนึ่งตัวในสนามแข่ง
            เมื่อกดเริ่ม เป็ดทุกตัวจะว่ายแข่งไปยังเส้นชัยแบบสุ่ม
            ต่างจากวงล้อสุ่มที่รู้ผลทันทีเมื่อหมุนเสร็จ
            เกมแข่งเป็ดจะมีช่วงเวลาลุ้นระหว่างที่เป็ดกำลังว่ายแข่ง
            ทำให้บรรยากาศในห้องเรียนสนุกและตื่นเต้นกว่าเดิม
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">ทำไมครูควรมีเครื่องมือนี้</h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            การสุ่มชื่อเป็นกิจกรรมที่ครูใช้แทบทุกวัน ไม่ว่าจะสุ่มถามคำถาม
            สุ่มลำดับนำเสนอ หรือสุ่มแจกรางวัล
            การมีเครื่องมือที่สนุกและเปิดใช้งานได้ทันทีบนเว็บเบราว์เซอร์
            ช่วยลดเวลาการเตรียมกิจกรรม และยังช่วยดึงความสนใจของนักเรียนกลับมาที่หน้าชั้นเรียนได้ง่าย
            ๆ โดยไม่ต้องอาศัยอุปกรณ์เพิ่มเติมนอกจากคอมพิวเตอร์หรือมือถือที่เชื่อมต่ออินเทอร์เน็ต
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">เริ่มเล่นได้ในไม่กี่ขั้นตอน</h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            ใส่รายชื่อนักเรียน เลือกความยาวสนามแข่ง แล้วกดเริ่มได้ทันที
            เป็ดทุกตัวจะว่ายแข่งไปเส้นชัยพร้อมนับถอยหลัง เมื่อจบระบบขึ้นโพเดียมอันดับ 1-3 ให้ทันที
            ดูขั้นตอนแบบละเอียดพร้อมเล่นได้เลยที่หน้า{" "}
            <Link href="/duck-race">เกมแข่งเป็ดสุ่มชื่อ</Link>
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">อยากได้ไอเดียใช้งานเพิ่ม</h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            นอกจากสุ่มชื่อตอบคำถามหรือสุ่มลำดับนำเสนอ ยังมีไอเดียใช้เกมแข่งเป็ดในห้องเรียนอีกหลายแบบ
            อ่านต่อได้ที่{" "}
            <Link href="/blog/duck-race-classroom-activities">
              10 กิจกรรมใช้เกมเป็ดสุ่มในห้องเรียน
            </Link>
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">
            ต่างจากวงล้อสุ่มยังไง
          </h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            วงล้อสุ่มและเกมแข่งเป็ดต่างก็เป็นเครื่องมือสุ่มชื่อที่ครูใช้ได้ฟรีจากคุณคูล
            แต่ให้ความรู้สึกต่างกัน วงล้อสุ่มเหมาะกับการสุ่มที่ต้องการผลลัพธ์ไว
            ส่วนเกมแข่งเป็ดเหมาะกับกิจกรรมที่อยากให้เด็กได้ลุ้นและเชียร์กันนานขึ้น
            ครูสามารถสลับใช้ทั้งสองแบบให้เข้ากับบรรยากาศของแต่ละคาบเรียนได้
          </p>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">บทสรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              เกมแข่งเป็ดสุ่มชื่อ เป็นสื่อการสอนออนไลน์ฟรีที่ช่วยให้การสุ่มชื่อนักเรียนสนุกขึ้นทันที
              ใช้งานง่าย ไม่ต้องติดตั้ง เหมาะกับทุกกิจกรรมในห้องเรียนที่ต้องการความสุ่มแบบมีลุ้น
              ลองเปิดใช้งานได้เลยที่{" "}
              <Link href="/duck-race">เปิดเกมเป็ดสุ่มชื่อฟรี</Link>
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              คุณคูลจะรวบรวมสื่อการสอนและเครื่องมือฟรีสำหรับครูมาอัปเดตให้เรื่อย ๆ
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
                href="/duck-race"
                className="block rounded-xl bg-[#0A7A66] px-4 py-2.5 text-center text-[13.5px] font-bold text-white no-underline hover:opacity-90"
              >
                🦆 เปิดเกมเป็ดสุ่มชื่อฟรี
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
