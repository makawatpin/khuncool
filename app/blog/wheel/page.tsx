import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง | Khuncool",
  description:
    "รู้จักวงล้อสุ่มชื่อ สื่อการสอนออนไลน์ที่ช่วยให้ห้องเรียนสนุกและยุติธรรมขึ้น พร้อมวิธีใช้ 4 ขั้นตอน และ 8 ไอเดียใช้งานจริงในห้องเรียน",
  alternates: {
    canonical: "https://www.khuncool.com/blog/wheel",
  },
  openGraph: {
    type: "article",
    title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง",
    description: "วิธีใช้วงล้อสุ่มชื่อในห้องเรียน พร้อม 8 ไอเดียใช้งานจริง",
    images: ["https://www.khuncool.com/assets/wheel-cover.png"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const benefits = [
  {
    icon: "⚖️",
    head: "ยุติธรรมกับทุกคน",
    body: "ไม่มีเด็กคนไหนรู้สึกว่าครูเรียกแต่คนโปรด เพราะผลการสุ่มเกิดขึ้นต่อหน้าทั้งห้อง",
  },
  {
    icon: "🙋",
    head: "ดึงเด็กเงียบให้มีส่วนร่วม",
    body: "เด็กที่ไม่กล้ายกมือจะได้มีโอกาสพูด และมักพบว่าหลายคนตอบได้ดีกว่าที่ครูคิด",
  },
  {
    icon: "⚡",
    head: "เปลี่ยนบรรยากาศได้ใน 10 วินาที",
    body: "ช่วงบ่ายที่เด็กเริ่มหลับ วงล้อหมุนครั้งเดียวก็ปลุกความสนใจกลับมาได้",
  },
  {
    icon: "🧰",
    head: "ไม่ต้องเตรียมอุปกรณ์",
    body: "ไม่ต้องตัดกระดาษ ไม่ต้องหากล่องฉลาก ใส่รายชื่อครั้งเดียวใช้ได้ทั้งเทอม",
  },
  {
    icon: "📊",
    head: "ใช้ได้หลายวิชาหลายระดับชั้น",
    body: "ตั้งแต่อนุบาลจนถึงมัธยม ปรับรายการในวงล้อให้เข้ากับเนื้อหาได้ทันที",
  },
];

const steps = [
  {
    n: "1",
    head: "ใส่รายการที่ต้องการสุ่ม",
    body: "พิมพ์ชื่อนักเรียนทีละบรรทัด หรือคัดลอกรายชื่อทั้งห้องจาก Excel / Google Sheets มาวางทีเดียว",
  },
  {
    n: "2",
    head: "ตรวจและปรับรายการ",
    body: "ลบชื่อคนที่ลาหรือคนที่ถูกสุ่มไปแล้ว เพื่อให้โอกาสกระจายทั่วถึง",
  },
  {
    n: "3",
    head: "กดหมุน",
    body: "ฉายขึ้นจอโปรเจกเตอร์แล้วให้เด็กช่วยกันนับถอยหลัง จะสนุกกว่าครูกดเงียบ ๆ คนเดียว",
  },
  {
    n: "4",
    head: "ต่อยอดผลที่ได้",
    body: "ให้คนที่ถูกสุ่มตอบคำถาม เล่าสิ่งที่เรียนวันนี้ หรือเลือกเพื่อนคนถัดไปเอง",
  },
];

const ideas = [
  {
    icon: "❓",
    head: "สุ่มคนตอบคำถาม",
    body: "แทนการเรียกตามเลขที่ ให้ทุกคนต้องเตรียมพร้อมเสมอ",
  },
  {
    icon: "🧹",
    head: "สุ่มเวรประจำวัน",
    body: "จัดเวรทำความสะอาดแบบไม่มีใครบ่นว่าไม่ยุติธรรม",
  },
  {
    icon: "👥",
    head: "สุ่มจับกลุ่ม",
    body: "สุ่มหัวหน้ากลุ่มก่อน แล้วให้เลือกสมาชิกสลับกัน",
  },
  {
    icon: "🎁",
    head: "สุ่มรางวัลท้ายคาบ",
    body: "ใส่รางวัลเล็ก ๆ เช่น สติกเกอร์ คะแนนพิเศษ หรือสิทธิ์เลือกที่นั่ง",
  },
  {
    icon: "📖",
    head: "สุ่มหัวข้อรายงาน",
    body: "ให้แต่ละกลุ่มหมุนเลือกหัวข้อ ลดปัญหาแย่งหัวข้อยอดนิยม",
  },
  {
    icon: "🎭",
    head: "สุ่มบทบาทในกิจกรรม",
    body: "เช่น ผู้จดบันทึก ผู้นำเสนอ ผู้จับเวลา สลับกันทุกครั้ง",
  },
  {
    icon: "🔥",
    head: "เกมวอร์มอัพต้นคาบ",
    body: "ใส่คำศัพท์หรือคำถามทบทวน สุ่มมาถามเร็ว ๆ 5 ข้อ",
  },
  {
    icon: "🍀",
    head: "สุ่มกิจกรรมพักสมอง",
    body: "ใส่กิจกรรมสั้น ๆ เช่น ยืดเส้น ร้องเพลง เล่าเรื่องตลก",
  },
];

// NOTE: keep in sync with the visible FAQ list rendered below.
const faqs = [
  {
    q: "วงล้อสุ่มของคุณคูลใช้ฟรีไหม",
    a: "ใช้ฟรีทั้งหมด ไม่ต้องสมัครสมาชิก ไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์ได้ทันที",
  },
  {
    q: "ใส่รายชื่อนักเรียนได้กี่คน",
    a: "ใส่ได้ทั้งห้อง สามารถวางรายชื่อทีละหลายบรรทัดจาก Excel หรือ Google Sheets ได้ในครั้งเดียว",
  },
  {
    q: "ใช้บนมือถือหรือแท็บเล็ตได้ไหม",
    a: "ได้ รองรับทั้งคอมพิวเตอร์ แท็บเล็ต และมือถือ เหมาะกับการฉายขึ้นจอโปรเจกเตอร์ในห้องเรียน",
  },
];

const toc = [
  "วงล้อสุ่มคืออะไร",
  "ทำไมครูถึงควรใช้",
  "วิธีใช้ 4 ขั้นตอน",
  "8 ไอเดียใช้ในห้องเรียน",
  "คำถามที่ครูถามบ่อย",
];

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
          item: "https://www.khuncool.com/blog/wheel",
        },
      ],
    },
    {
      "@type": "BlogPosting",
      headline: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง",
      inLanguage: "th",
      datePublished: "2026-07-27",
      author: {
        "@type": "Person",
        name: "อาวล์",
        url: "https://www.khuncool.com/about",
      },
      publisher: { "@type": "Organization", name: "Khuncool" },
      image: "https://www.khuncool.com/assets/wheel-cover.png",
      mainEntityOfPage: "https://www.khuncool.com/blog/wheel",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const tags = [
  "วงล้อสุ่ม",
  "สุ่มชื่อนักเรียน",
  "สื่อการสอน",
  "เครื่องมือครู",
  "กิจกรรมในห้องเรียน",
  "ใช้ฟรี",
];

const related = [
  {
    cat: "สื่อการสอน",
    title: "จับเวลาในห้องเรียน ใช้ยังไงให้เด็กทำงานเสร็จทันเวลา",
    date: "22 ก.ค. 2569",
    href: "/timer",
  },
  {
    cat: "รีวิวสินค้า",
    title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง",
    date: "26 ก.ค. 2569",
    href: "/blog/magnetic-frame",
  },
  {
    cat: "สื่อการสอน",
    title: "วัดเสียงในห้องเรียน ช่วยคุมระดับเสียงเด็กแบบไม่ต้องดุ",
    date: "15 ก.ค. 2569",
    href: "/classroom-noise-meter",
  },
  {
    cat: "เครื่องมือครู",
    title: "แข่งเป็ดสุ่มชื่อ กิจกรรมสุ่มชื่อนักเรียนแบบสนุก",
    date: "27 ก.ค. 2569",
    href: "/duck-race",
  },
];

export default function BlogWheelPage() {
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

      {/* Cover image */}
      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <Image
          src="/assets/wheel-cover.png"
          alt="วงล้อสุ่ม สื่อการสอนที่ครูควรมี ช่วยให้ห้องเรียนสนุกและยุติธรรมขึ้น"
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
            <span className="rounded-pill bg-[#ECEDFE] px-2.5 py-1 text-[12px] font-semibold text-[#4A46D6] md:px-[11px] md:py-[5px]">
              ใช้ฟรี
            </span>
            <span className="text-[12px] text-ink-faint">
              27 ก.ค. 2569 · อ่าน 5 นาที · โดย ทีมคุณคูล
            </span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            วงล้อสุ่ม สื่อการสอนที่ครูควรมี ช่วยให้ห้องเรียนสนุกและยุติธรรมขึ้น
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            “ใครจะตอบคำถามข้อนี้ดี” — คำถามที่ครูถามทุกวัน
            แล้วก็มักจบลงที่เด็กกลุ่มเดิมยกมือ ส่วนเด็กเงียบ ๆ ก็เงียบต่อไป{" "}
            <b>วงล้อสุ่ม</b> คือเครื่องมือเล็ก ๆ ที่แก้ปัญหานี้ได้ตรงจุด
            และเปลี่ยนช่วงเวลาน่าเบื่อให้เป็นช่วงที่เด็กทั้งห้องลุ้นไปด้วยกัน
          </p>

          <h2 className="text-xl md:text-2xl">วงล้อสุ่มคืออะไร</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            วงล้อสุ่ม (Random Wheel / Spin Wheel)
            คือสื่อการสอนออนไลน์ที่ให้ครูใส่รายการอะไรก็ได้ลงไป เช่น
            ชื่อนักเรียนทั้งห้อง คำถามท้ายบท หัวข้อรายงาน หรือรางวัลเล็ก ๆ น้อย
            ๆ แล้วกดหมุนเพื่อสุ่มผลลัพธ์แบบสุ่มจริงต่อหน้าเด็กทั้งห้อง
          </p>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            ข้อดีที่เหนือกว่าการจับฉลากในกล่องคือ <b>ทุกคนเห็นพร้อมกัน</b>{" "}
            ไม่มีใครสงสัยว่าครูเลือกเอง และจังหวะที่วงล้อค่อย ๆ
            ช้าลงก่อนหยุดก็สร้างความลุ้นได้ดีกว่ามาก
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">
            ทำไมครูถึงควรใช้วงล้อสุ่ม
          </h2>
          <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
            {benefits.map((b) => (
              <div
                key={b.head}
                className="rounded-2xl border border-[#E5E8EE] p-3.5 md:p-4"
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-lg md:text-[19px]">{b.icon}</span>
                  <span className="text-sm font-bold md:text-[15.5px]">
                    {b.head}
                  </span>
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">
                  {b.body}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            วิธีใช้วงล้อสุ่ม 4 ขั้นตอน
          </h2>
          <div className="mt-3 flex flex-col gap-3 md:gap-3.5">
            {steps.map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-[#ECEDFE] text-[12.5px] font-bold text-[#4A46D6] md:h-[30px] md:w-[30px] md:rounded-[10px] md:text-[15px]">
                  {s.n}
                </span>
                <div>
                  <div className="mb-0.5 text-sm font-bold md:text-base">
                    {s.head}
                  </div>
                  <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">
                    {s.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            8 ไอเดียใช้วงล้อสุ่มในห้องเรียน
          </h2>
          <div className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-[11px]">
            {ideas.map((i) => (
              <div
                key={i.head}
                className="flex items-start gap-2.5 rounded-xl bg-surface-light p-2.5 md:gap-[11px] md:rounded-2xl md:p-4"
              >
                <span className="flex-none text-base md:text-lg">{i.icon}</span>
                <div>
                  <div className="mb-0.5 text-[13.5px] font-bold">{i.head}</div>
                  <div className="text-[12.5px] leading-[1.65] text-ink-secondary md:text-[13.5px] md:leading-[1.7]">
                    {i.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[#A9EBDA] bg-[#F6FFFC] p-4 md:mt-6 md:p-[20px_22px]">
            <div className="mb-1.5 text-xs font-bold text-[#0A7A66] md:mb-2 md:text-[13px]">
              💡 เคล็ดลับจากครูที่ใช้จริง
            </div>
            <div className="text-[13.5px] leading-[1.75] text-[#2E3440] md:text-[15px] md:leading-[1.8]">
              ถ้าห้องมีเด็กที่ไม่ชอบถูกสุ่ม ให้บอกกติกาไว้ล่วงหน้าว่า
              “ถูกสุ่มแล้วขอผ่านได้ 1 ครั้ง”
              เด็กจะรู้สึกปลอดภัยและกล้าเล่นกับกิจกรรมมากขึ้น
              และอย่าลืมเปิดโหมดไม่สุ่มซ้ำเมื่อต้องการให้ทุกคนได้พูดครบทั้งห้อง
            </div>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">
            ลองใช้วงล้อสุ่มของคุณคูล ฟรี
          </h2>
          <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:mb-[18px] md:text-[15.5px] md:leading-[1.85]">
            คุณคูลมีวงล้อสุ่มให้ครูใช้ฟรี ไม่ต้องสมัครสมาชิก
            ไม่ต้องติดตั้งโปรแกรม เปิดผ่านเบราว์เซอร์บนคอมพิวเตอร์ แท็บเล็ต
            หรือมือถือได้ทันที และฉายขึ้นจอโปรเจกเตอร์ได้เลย
          </p>
          <div className="flex items-center gap-4 rounded-2xl border border-[#C6C9FB] bg-[#F7F7FE] p-4 md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">
                วงล้อสุ่มชื่อ Khuncool
              </div>
              <div className="text-[13.5px] text-ink-secondary">
                ใช้ฟรี · ไม่ต้องสมัคร · วางรายชื่อทั้งห้องได้ในคลิกเดียว
              </div>
            </div>
            <Link
              href="/random-name-picker"
              className="flex-none rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(92,94,230,.5)] no-underline hover:bg-[#4A46D6]"
            >
              🎡 เปิดวงล้อสุ่ม
            </Link>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">คำถามที่ครูถามบ่อย</h2>
          <div className="flex flex-col">
            {faqs.map((f) => (
              <div key={f.q} className="border-t border-border py-4">
                <div className="mb-1.5 text-sm font-bold md:text-base">
                  {f.q}
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">
                  {f.a}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">สรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              วงล้อสุ่มเป็นสื่อการสอนที่เรียบง่ายแต่ได้ผลจริง
              ช่วยให้การเรียกชื่อยุติธรรม กระจายโอกาสให้เด็กทุกคน
              และเพิ่มพลังงานในห้องเรียนโดยแทบไม่ต้องเตรียมอะไรเลย
              ครูที่ยังไม่เคยลอง แนะนำให้เริ่มจากใส่รายชื่อนักเรียนห้องเดียวก่อน
              แล้วค่อยขยายไปใช้กับกิจกรรมอื่น ๆ
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              ติดตามสื่อการสอนและเครื่องมือช่วยครูฟรี ๆ แบบนี้ได้ที่{" "}
              <Link href="/">Khuncool.com</Link> สำหรับครูไทยทุกคน
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
          <div className="rounded-2xl border border-[#E5E8EE] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-ink-faint">
              สารบัญ
            </div>
            <div className="flex flex-col gap-2.5">
              {toc.map((c) => (
                <div
                  key={c}
                  className="text-[13.5px] leading-[1.5] text-ink-secondary"
                >
                  {c}
                </div>
              ))}
            </div>
            <Link
              href="/random-name-picker"
              className="mt-4 block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white no-underline hover:bg-[#4A46D6]"
            >
              🎡 เปิดวงล้อสุ่ม
            </Link>
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
