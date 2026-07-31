import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค. | Khuncool",
  description:
    "สพฐ. เปิดคัดเลือกนักเรียนและสถานศึกษาเพื่อรับรางวัลพระราชทาน ปีการศึกษา 2569 ยื่นความจำนงที่สำนักงานเขตพื้นที่การศึกษา 1–21 สิงหาคม 2569 พร้อมสรุปเอกสารที่ต้องเตรียม",
  alternates: {
    canonical: "https://www.khuncool.com/blog/royal-award-2569",
  },
  openGraph: {
    type: "article",
    title: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.",
    description: "สรุปช่วงเวลา ขั้นตอน และเอกสารที่โรงเรียนต้องเตรียม ก่อนยื่นความจำนงกับเขตพื้นที่",
    images: ["https://www.khuncool.com/assets/royal-award-cover.png"],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือกนักเรียนและสถานศึกษา",
  inLanguage: "th",
  datePublished: "2026-07-27",
  author: { "@type": "Organization", name: "ทีมคุณคูล" },
  publisher: { "@type": "Organization", name: "Khuncool" },
  image: "https://www.khuncool.com/assets/royal-award-cover.png",
  mainEntityOfPage: "https://www.khuncool.com/blog/royal-award-2569",
};

const summary = [
  "สพฐ. เปิดคัดเลือกนักเรียนและสถานศึกษาเพื่อรับรางวัลพระราชทาน ปีการศึกษา 2569",
  "ยื่นความจำนงขอรับการประเมินที่สำนักงานเขตพื้นที่การศึกษาที่สถานศึกษาตั้งอยู่",
  "ช่วงเวลายื่นสมัคร 1–21 สิงหาคม 2569",
];

const timeline = [
  { k: "ระดับที่คัดเลือก", v: "การศึกษาขั้นพื้นฐาน (ก่อนประถม, ประถม, มัธยม)" },
  { k: "หน่วยงานรับผิดชอบ", v: "สพฐ. ผ่านสำนักงานเขตพื้นที่การศึกษา" },
  { k: "ช่วงยื่นความจำนง", v: "1–21 สิงหาคม 2569" },
  { k: "สถานที่ยื่น", v: "สำนักงานเขตพื้นที่การศึกษาที่สถานศึกษาตั้งอยู่" },
  { k: "เอกสารที่ต้องศึกษา", v: "ประกาศ สพฐ., คู่มือประเมิน, แบบประเมิน ตามระดับสถานศึกษา" },
];

const docs = [
  "คู่มือและเกณฑ์การคัดเลือกผ่านเว็บไซต์ สพฐ.",
  "เว็บไซต์สำนักทดสอบทางการศึกษา",
  "เอกสารแนบท้ายหนังสือแจ้งเขตพื้นที่ฯ ได้แก่ หนังสือนำ ประกาศ สพฐ. คู่มือประเมินนักเรียนและสถานศึกษาระดับต่าง ๆ (ก่อนประถมศึกษา, ประถมศึกษาและมัธยมศึกษา) และแบบประเมินฉบับที่เกี่ยวข้อง",
];

const tags = ["รางวัลพระราชทาน 2569", "สพฐ. รางวัลพระราชทาน", "คัดเลือกนักเรียนรางวัลพระราชทาน", "คัดเลือกสถานศึกษารางวัลพระราชทาน", "ข่าวการศึกษา 2569", "เกณฑ์ประเมินรางวัลพระราชทาน"];

const related = [
  { cat: "สื่อการสอน", title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ใช้ฟรี ไม่ต้องติดตั้ง", date: "27 ก.ค. 2569", href: "/blog/wheel" },
  { cat: "สื่อการสอน", title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที", date: "27 ก.ค. 2569", href: "/blog/random-name-activities" },
  { cat: "รีวิวสินค้า", title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง", date: "26 ก.ค. 2569", href: "/blog/magnetic-frame" },
  { cat: "เครื่องมือครู", title: "แข่งเป็ดสุ่มชื่อ กิจกรรมสุ่มชื่อนักเรียนแบบสนุก", date: "27 ก.ค. 2569", href: "/duck-race" },
];

export default function BlogRoyalAward2569Page() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">หน้าแรก</Link>
        <span>›</span>
        <Link href="/articles" className="text-ink-faint">บทความ</Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">ข่าวการศึกษา</span>
      </div>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/royal-award-cover.png"
          alt="การคัดเลือกนักเรียนและสถานศึกษา รับรางวัลพระราชทาน ปีการศึกษา 2569"
          className="block w-full rounded-card-lg bg-[#F1F3F6] object-cover md:rounded-[20px]"
        />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#FBF1D8] px-2.5 py-1 text-[12px] font-bold text-[#8A6206] md:px-[11px] md:py-[5px]">ข่าวการศึกษา</span>
            <span className="rounded-pill bg-[#FDEAE8] px-2.5 py-1 text-[12px] font-semibold text-[#B3261E] md:px-[11px] md:py-[5px]">มีกำหนดเวลา</span>
            <span className="text-[12px] text-ink-faint">27 ก.ค. 2569 · อ่าน 4 นาที · โดย ทีมคุณคูล</span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            โรงเรียนไหนกำลังมองหาโอกาสส่งเสริมนักเรียนหรือยกระดับสถานศึกษาให้ได้รับการยอมรับระดับประเทศ ปีการศึกษา 2569 นี้ สพฐ. เปิดให้คัดเลือก{" "}
            <b>นักเรียนและสถานศึกษาเพื่อรับรางวัลพระราชทาน ระดับการศึกษาขั้นพื้นฐาน</b> แล้ว ขุนคูลสรุปสาระสำคัญ ช่วงเวลา และขั้นตอนที่ครูและผู้บริหารต้องรู้มาให้แบบเข้าใจง่าย
          </p>

          <h2 className="text-xl md:text-2xl">รางวัลพระราชทาน คืออะไร</h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            รางวัลพระราชทานเป็นรางวัลเกียรติยศที่มอบให้แก่นักเรียน นักศึกษา และสถานศึกษาที่มีผลการดำเนินงานโดดเด่น ตามระเบียบกระทรวงศึกษาธิการว่าด้วยรางวัลพระราชทานแก่นักเรียน นักศึกษา และสถานศึกษา พ.ศ. 2562 โดยในระดับการศึกษาขั้นพื้นฐาน สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.) เป็นหน่วยงานรับผิดชอบหลักในการดำเนินการคัดเลือก
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">สพฐ. สั่งเขตพื้นที่ฯ เดินหน้าคัดเลือกรอบปีการศึกษา 2569</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            สพฐ. ได้ทำหนังสือแจ้งไปยังผู้อำนวยการสำนักงานเขตพื้นที่การศึกษาทุกเขตทั่วประเทศ ให้ดำเนินการคัดเลือกนักเรียนและสถานศึกษาเพื่อรับรางวัลพระราชทาน ประจำปีการศึกษา 2569 โดยให้ยึดตามระเบียบและหลักเกณฑ์ที่กระทรวงศึกษาธิการกำหนดไว้ ทั้งจากประกาศหลักเกณฑ์และแนวทางการคัดเลือกฉบับลงวันที่ 17 พฤศจิกายน 2564
          </p>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            พร้อมกันนี้ สพฐ. ยังระบุถึงมาตรการเร่งรัดการเบิกจ่ายงบประมาณและการใช้จ่ายภาครัฐ ประจำปีงบประมาณ 2569 เพิ่มเติม เพื่อให้กระบวนการคัดเลือกในรอบนี้เป็นไปด้วยความเรียบร้อยและบรรลุเป้าหมายตามกำหนดเวลา
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">ช่วงเวลาที่ต้องรู้ สถานศึกษาสมัครได้เมื่อไหร่</h2>
          <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            สำนักงานเขตพื้นที่การศึกษาแต่ละแห่งมีหน้าที่ประชาสัมพันธ์ให้สถานศึกษาในสังกัดรับทราบ และเชิญชวนสถานศึกษาที่มีความพร้อมเสนอชื่อนักเรียนและสถานศึกษาเข้ารับการประเมิน
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#E8D9A6]">
            <div className="hidden gap-3.5 bg-[#FFFCF3] px-[18px] py-3 text-xs font-bold text-[#8A6206] md:flex">
              <span className="w-[150px] flex-none">รายการ</span>
              <span className="flex-1">รายละเอียด</span>
            </div>
            {timeline.map((t) => (
              <div key={t.k} className="flex gap-2.5 border-t border-[#F3EBD6] p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]">
                <span className="w-24 flex-none text-xs font-bold text-[#8A6206] md:w-[150px] md:text-[14.5px] md:font-bold md:text-[#1A1D26]">{t.k}</span>
                <span className="flex-1 text-[13px] leading-[1.6] md:text-base md:leading-[1.6]">{t.v}</span>
              </div>
            ))}
          </div>
          <p className="m-0 mt-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            หลังจากนั้นสำนักงานเขตพื้นที่การศึกษาจะดำเนินการคัดเลือกต่อไปตามประกาศ หลักเกณฑ์ และกรอบเวลาที่กระทรวงศึกษาธิการกำหนด
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">เตรียมตัวอย่างไร โรงเรียนควรดูเอกสารอะไรบ้าง</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            ก่อนยื่นสมัคร แนะนำให้ผู้บริหารและครูที่รับผิดชอบศึกษารายละเอียดหลักเกณฑ์การประเมินให้ครบถ้วน โดยสามารถดูข้อมูลเพิ่มเติมได้จาก
          </p>
          <div className="flex flex-col gap-2 md:gap-2.5">
            {docs.map((d) => (
              <div key={d} className="flex items-start gap-2.5 rounded-xl bg-surface-light p-2.5 md:gap-3 md:rounded-2xl md:p-4">
                <span className="flex-none text-sm md:text-base">📄</span>
                <span className="text-[13px] leading-[1.7] text-[#2E3440] md:text-[14.5px] md:leading-[1.75]">{d}</span>
              </div>
            ))}
          </div>
          <p className="m-0 mt-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            เนื่องจากเกณฑ์การประเมินแยกตามระดับชั้นและประเภทสถานศึกษา ครูควรตรวจสอบให้ตรงกับระดับที่โรงเรียนของตนเปิดสอน เพื่อเตรียมหลักฐานและข้อมูลประกอบการประเมินได้อย่างครบถ้วน
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">งบประมาณสนับสนุน</h2>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            สพฐ. ยังได้จัดสรรงบประมาณเพื่อสนับสนุนการดำเนินการคัดเลือกในระดับเขตพื้นที่การศึกษา พร้อมขอให้แต่ละเขตดำเนินการในส่วนที่เกี่ยวข้องให้แล้วเสร็จตามกรอบเวลา เพื่อให้การคัดเลือกเป็นไปอย่างถูกต้อง โปร่งใส และสะท้อนคุณภาพที่แท้จริงของผู้เรียนและสถานศึกษา
          </p>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">บทสรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              การคัดเลือกรางวัลพระราชทานปีการศึกษา 2569 ถือเป็นโอกาสสำคัญที่โรงเรียนจะได้แสดงศักยภาพและยกระดับชื่อเสียงในระดับประเทศ โรงเรียนที่สนใจควรรีบตรวจสอบคุณสมบัติและเตรียมเอกสารให้พร้อม ก่อนยื่นความจำนงกับสำนักงานเขตพื้นที่การศึกษาภายในกรอบเวลาที่กำหนด คือ <b>1–21 สิงหาคม 2569</b>
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              ขุนคูลจะติดตามความเคลื่อนไหวข่าวการศึกษาที่เป็นประโยชน์ต่อครูและโรงเรียนมาอัปเดตให้เรื่อย ๆ อย่าลืมติดตามหมวด <Link href="/">ข่าวการศึกษา</Link> ของเว็บไซต์เพื่อไม่พลาดข้อมูลสำคัญ
            </p>
            <div className="mb-4 text-[13px] text-ink-faint">ที่มา: สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-pill bg-surface-light px-2.5 py-1.5 text-[11.5px] font-medium text-ink-secondary">#{t}</span>
              ))}
            </div>
          </div>
        </article>

        <aside className="mt-8 flex flex-col gap-4 md:mt-0">
          <div className="rounded-2xl border border-[#E8D9A6] bg-[#FFFCF3] p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-[#8A6206]">สรุปสั้น</div>
            <div className="flex flex-col gap-2">
              {summary.map((s) => (
                <div key={s} className="text-[13.5px] leading-[1.7] text-[#2E3440]">• {s}</div>
              ))}
            </div>
            <div className="mt-4 border-t border-[#F0E4C2] pt-3.5">
              <div className="mb-1 text-[11.5px] font-bold text-[#8A6206]">ช่วงยื่นความจำนง</div>
              <div className="text-[22px] font-extrabold">1–21 ส.ค. 2569</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E8EE] p-4">
            <div className="mb-1.5 text-sm font-bold">📌 บทความอื่น ๆ</div>
            <div className="flex flex-col">
              {related.map((r) => (
                <Link key={r.title} href={r.href} className="block border-t border-border py-2.5 text-inherit no-underline hover:opacity-65">
                  <div className="mb-0.5 text-[11px] font-semibold text-[#0A7A66]">{r.cat}</div>
                  <div className="text-[13.5px] font-semibold leading-[1.5]">{r.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-faint">{r.date}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
