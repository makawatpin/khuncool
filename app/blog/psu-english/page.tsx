import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์ส PSU MOOC | Khuncool",
  description:
    "รีวิวคอร์สเรียนภาษาอังกฤษฟรีจาก PSU MOOC เรียนจบมีใบเซอร์ เหมาะกับครูที่อยากพัฒนาภาษาอังกฤษเพื่อสอบผลงาน",
  alternates: {
    canonical: "https://www.khuncool.com/blog/psu-english",
  },
  openGraph: {
    type: "article",
    title: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์ส PSU MOOC",
    description:
      "รีวิวคอร์สเรียนภาษาอังกฤษฟรีจาก PSU MOOC เรียนจบมีใบเซอร์ เหมาะกับครูที่อยากพัฒนาภาษาอังกฤษเพื่อสอบผลงาน",
    images: ["https://www.khuncool.com/assets/psu-english-cover.webp"],
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
          item: "https://www.khuncool.com/blog/psu-english",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      headline: "เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์ส PSU MOOC",
      inLanguage: "th",
      datePublished: "2025-07-25",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/psu-english-cover.webp",
      mainEntityOfPage: "https://www.khuncool.com/blog/psu-english",
    },
  ],
};

const outcomes = [
  "พูดภาษาอังกฤษในหัวข้อทั่วไปในชีวิตประจำวันได้อย่างมั่นใจและเป็นธรรมชาติ",
  "ขยายคลังความรู้ด้านภาษาอังกฤษให้กว้างขึ้น",
  "พัฒนาคำศัพท์ผ่านกิจกรรมออนไลน์",
  "ฝึกทักษะการพูดภาษาอังกฤษ",
  "ฝึกทักษะการฟังจากเจ้าของภาษาโดยตรง",
];

const specs = [
  { k: "ระยะเวลาเรียน", v: "5 ชั่วโมง" },
  { k: "ค่าใช้จ่าย", v: "ฟรี" },
  { k: "ระดับ", v: "ปานกลาง (Intermediate)" },
  { k: "กลุ่มเป้าหมาย", v: "ทุกคน" },
  { k: "เกณฑ์ผ่านคอร์ส", v: "ทำกิจกรรมครบ และสอบผ่าน post-test อย่างน้อย 75%" },
  { k: "ใบเซอร์", v: "มี ✅" },
];

const quickFacts = [
  { icon: "⏱️", k: "ระยะเวลา", v: "5 ชม." },
  { icon: "💸", k: "ค่าใช้จ่าย", v: "ฟรี" },
  { icon: "📊", k: "ระดับ", v: "Intermediate" },
  { icon: "🎓", k: "ใบเซอร์", v: "มี" },
  { icon: "🏛️", k: "ผู้จัด", v: "PSU MOOC" },
];

const reasons = [
  {
    icon: "⏱️",
    head: "ใช้เวลาไม่นาน",
    body: "แค่ 5 ชั่วโมงก็เรียนจบ เหมาะกับครูที่มีเวลาว่างจำกัด แบ่งเรียนช่วงเย็นหรือวันหยุดได้สบาย ๆ",
  },
  {
    icon: "🎓",
    head: "ได้ใบเซอร์ฟรี",
    body: "เก็บไว้เป็นหลักฐานการพัฒนาตนเอง ใช้ประกอบแฟ้มสะสมผลงานหรือการขอ วPA ได้",
  },
  {
    icon: "💬",
    head: "เนื้อหาเน้นใช้งานจริง",
    body: "ไม่ใช่แค่ไวยากรณ์ แต่เป็นบทสนทนาจริงที่เอาไปใช้สอนนักเรียนต่อได้ทันที",
  },
  {
    icon: "🌐",
    head: "เรียนออนไลน์ 100%",
    body: "เรียนที่ไหน เวลาไหนก็ได้ ตามความสะดวกของครูแต่ละคน",
  },
];

const steps = [
  {
    n: "1",
    text: "เข้าไปที่หน้าคอร์ส Intermediate Conversational English: Informal Conversations",
  },
  { n: "2", text: "กดปุ่ม Go To Course เพื่อเข้าสู่ระบบ PSU MOOC" },
  { n: "3", text: "สมัครสมาชิก หรือล็อกอินหากมีบัญชีอยู่แล้ว" },
  { n: "4", text: "เริ่มเรียนได้ทันที ทำกิจกรรมและแบบทดสอบให้ครบตามเกณฑ์" },
  { n: "5", text: "เมื่อผ่านเกณฑ์ 75% ขึ้นไป ดาวน์โหลดใบเซอร์ได้เลย" },
];

const tags = [
  "เรียนภาษาอังกฤษฟรี",
  "คอร์สออนไลน์มีใบเซอร์",
  "PSU MOOC",
  "อบรมครูฟรี",
  "พัฒนาภาษาอังกฤษสำหรับครู",
  "วPA",
  "แหล่งเรียนรู้ฟรีสำหรับครู",
];

// NOTE: source data has no `href` for these related items — rendered as
// non-linking cards.
const related = [
  {
    title: "รวมอบรมออนไลน์ฟรี ได้เกียรติบัตร ก.ค.–ส.ค. 2568",
    date: "15 ก.ค. 2568",
  },
  {
    title: "อบรมออนไลน์ได้เกียรติบัตร 20 ชั่วโมง · เปิดรับสมัครแล้ว",
    date: "10 ก.ค. 2568",
  },
  { title: "คอร์สฟรี AI สำหรับครู เรียนจบมีใบเซอร์", date: "2 ก.ค. 2568" },
];

export default function BlogPsuEnglishPage() {
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
          src="/assets/psu-english-cover.webp"
          alt="เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์ คอร์ส PSU MOOC"
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
              อบรมฟรี
            </span>
            <span className="rounded-pill bg-[#FFF8EE] px-2.5 py-1 text-[12px] font-semibold text-[#8A5A1A] md:px-[11px] md:py-[5px]">
              มีใบเซอร์ ✅
            </span>
            <span className="text-[12px] text-ink-faint">
              25 ก.ค. 2568 · อ่าน 4 นาที · โดย ทีมขุนคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            เรียนภาษาอังกฤษฟรี ออนไลน์ มีใบเซอร์! คอร์ส Intermediate
            Conversational English จาก PSU MOOC
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            ครูท่านไหนอยากพัฒนาภาษาอังกฤษเพื่อใช้สอน ใช้สมัครขอวิทยฐานะ
            หรือแค่อยากคุยกับนักเรียนต่างชาติได้คล่องขึ้น
            วันนี้ขุนคูลมีคอร์สเรียนภาษาอังกฤษฟรีมาแนะนำ
            เรียนจบรับใบประกาศนียบัตรได้จริง ไม่มีค่าใช้จ่ายแม้แต่บาทเดียว
          </p>

          <h2 className="text-xl md:text-2xl">คอร์สนี้คือคอร์สอะไร</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            คอร์ส{" "}
            <b>Intermediate Conversational English: Informal Conversations</b>{" "}
            เป็นคอร์สจากคณะการบริการและการท่องเที่ยว มหาวิทยาลัยสงขลานครินทร์
            วิทยาเขตภูเก็ต เปิดสอนผ่านแพลตฟอร์ม PSU MOOC
            ระบบเรียนออนไลน์ตลอดชีวิต (Lifelong Learning)
            ของมหาวิทยาลัยสงขลานครินทร์
          </p>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            คอร์สนี้เน้นให้ผู้เรียนกล้าพูดภาษาอังกฤษในสถานการณ์ชีวิตประจำวันแบบเป็นธรรมชาติ
            ผ่านการฟังบทสนทนาจริงจากเจ้าของภาษา
            พร้อมฝึกคำศัพท์และสำนวนที่คนพื้นเมืองใช้กันจริง ๆ
            ไม่ใช่แค่ภาษาอังกฤษแบบตำรา
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">
            ผู้เรียนจะได้อะไรบ้าง (Learning Outcomes)
          </h2>
          <div className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-[11px]">
            {outcomes.map((o) => (
              <div
                key={o}
                className="flex items-start gap-2.5 rounded-2xl border border-[#E5E8EE] bg-white p-3 md:gap-[11px] md:p-3.5"
              >
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-[#DFF5EF] text-xs font-bold text-[#0A7A66] md:h-[22px] md:w-[22px]">
                  ✓
                </span>
                <span className="text-sm leading-[1.7] text-[#2E3440] md:text-[14.5px] md:leading-[1.65]">
                  {o}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">รายละเอียดคอร์สแบบสรุป</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E8EE]">
            {specs.map((s) => (
              <div
                key={s.k}
                className="flex gap-2.5 border-t border-border bg-white p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]"
              >
                <span className="w-[104px] flex-none text-xs font-semibold text-ink-faint md:w-[170px] md:text-[13.5px]">
                  {s.k}
                </span>
                <span className="flex-1 text-[13.5px] font-medium md:text-base">
                  {s.v}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#E5E8EE] bg-surface-light p-4 md:mt-6 md:p-[20px_22px]">
            <div className="mb-2 text-xs font-bold text-ink-faint md:mb-2.5 md:text-[13px]">
              ผู้สอน
            </div>
            <div className="grid gap-3.5 md:grid-cols-2 md:gap-[18px]">
              <div className="text-sm leading-[1.7] md:text-[15px]">
                <b>Colin Gallagher</b>
                <div className="text-[13px] text-ink-secondary">
                  Assistant to the Dean for International Affairs and Student
                  Development
                </div>
              </div>
              <div className="text-sm leading-[1.7] md:text-[15px]">
                <b>Veronica Aguilos Jamieson</b>
                <div className="text-[13px] text-ink-secondary">
                  อาจารย์ประจำคณะการบริการและการท่องเที่ยว ม.อ. ภูเก็ต
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">ทำไมครูควรเรียนคอร์สนี้</h2>
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
            {steps.map((s) => (
              <div key={s.n} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:h-7 md:w-7 md:text-[13.5px]">
                  {s.n}
                </span>
                <span className="pt-0.5 text-sm leading-[1.65] text-[#2E3440] md:text-[15.5px] md:leading-[1.7]">
                  {s.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#C6C9FB] bg-[#F5F6FF] p-4 md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">
                พร้อมเริ่มเรียนแล้ว?
              </div>
              <div className="text-[13.5px] text-ink-secondary">
                สมัครสมาชิก PSU MOOC ฟรี · ทำกิจกรรมครบและสอบผ่าน 75%
                รับใบเซอร์ทันที
              </div>
            </div>
            <a
              href="https://mooc.psu.ac.th"
              target="_blank"
              rel="noopener"
              className="flex-none rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white no-underline shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] hover:bg-[#4A46D6]"
            >
              Go To Course ↗
            </a>
          </div>
          <div className="mt-3 text-xs text-ink-faint">
            เนื้อหาคอร์สเผยแพร่ภายใต้สัญญาอนุญาต Creative Commons (CC BY-NC-SA)
            ใช้เพื่อการเรียนรู้ได้อย่างเปิดกว้าง
          </div>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">
              อยากหาคอร์สฟรีแบบนี้อีก ต้องดูที่ไหน
            </h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              นอกจากคอร์สนี้ PSU MOOC ยังมีคอร์สฟรีอีกหลายร้อยคอร์ส
              ครอบคลุมหลายหมวดหมู่ เช่น ภาษา เทคโนโลยี การศึกษา ธุรกิจ และ AI
              ครูที่อยากพัฒนาตัวเองต่อเนื่องเลือกเรียนเพิ่มได้ที่เว็บไซต์ PSU
              MOOC โดยตรง ขุนคูลจะคอยรวบรวมแหล่งอบรมฟรีดี ๆ มาฝากเรื่อย ๆ
              ติดตามได้ที่หมวด <Link href="/">แหล่งอบรมฟรี</Link> ของเว็บไซต์นี้
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
              {quickFacts.map((q) => (
                <div key={q.k} className="flex items-center gap-2.5">
                  <span className="flex-none text-base">{q.icon}</span>
                  <span className="flex-1 text-[13px] text-ink-faint">
                    {q.k}
                  </span>
                  <span className="flex-none text-[13.5px] font-bold">
                    {q.v}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="https://mooc.psu.ac.th"
              target="_blank"
              rel="noopener"
              className="mt-4 block rounded-xl bg-[#0A9380] p-3 text-center text-sm font-bold text-white no-underline hover:brightness-[1.06]"
            >
              สมัครเรียนฟรี ↗
            </a>
          </div>

          <div className="rounded-2xl border border-[#E5E8EE] bg-white p-4">
            <div className="mb-3 text-sm font-bold">📌 อบรมฟรีอื่น ๆ</div>
            <div className="flex flex-col">
              {related.map((r) => (
                <div key={r.title} className="border-t border-border py-2.5">
                  <div className="mb-0.5 text-[11px] font-semibold text-[#0A7A66]">
                    อบรมฟรี
                  </div>
                  <div className="text-[13.5px] font-semibold leading-[1.5]">
                    {r.title}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-faint">
                    {r.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
