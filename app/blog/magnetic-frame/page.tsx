import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง | Khuncool",
  description:
    "รีวิวกรอบป้ายติดผนังแม่เหล็กสำหรับห้องเรียน ติดตั้งง่ายไม่ต้องเจาะผนัง เปลี่ยนป้ายได้เร็ว เหมาะกับครูที่อยากจัดบอร์ดสวยไว",
  alternates: {
    canonical: "https://www.khuncool.com/blog/magnetic-frame",
  },
  // NOTE: source helmet has no og:*/twitter:* meta and no JSON-LD script for
  // this post — intentionally omitted here to match ground truth exactly.
};

const shopeeUrl = "https://s.shopee.co.th/7KvhYc7TtI";

const highlights = [
  "ไม่ต้องเจาะผนัง มีกาวสองหน้าในตัว ติดตั้งง่าย ไม่ทำผนังห้องเรียนเป็นรู",
  "ขอบแม่เหล็ก เปลี่ยนผลงานหรือเอกสารด้านในได้บ่อยเท่าไรก็ได้ ไม่ต้องแกะกรอบทั้งอัน",
  "ติดได้ทั้งแนวตั้งและแนวนอน ปรับตามพื้นที่บอร์ดหรือมุมที่ต้องการโชว์ผลงาน",
  "มีหลายขนาด A5, A4, A3 เลือกใช้ได้ตามขนาดผลงานเด็กหรือพื้นที่บอร์ด",
  "วัสดุใส มองเห็นชัด ทำให้ผลงานหรือป้ายประกาศดูโดดเด่น น่าสนใจ",
];

const reasons = [
  { icon: "🖼️", head: "บอร์ดผลงานสวยเป็นระเบียบ", body: "แทนที่จะใช้เทปกาวแปะตรง ๆ ซึ่งดูไม่เรียบร้อยและลอกยาก กรอบแม่เหล็กช่วยให้ผลงานแต่ละชิ้นดูเป็นระบบ เปลี่ยนได้ทุกสัปดาห์โดยผนังไม่เสียหาย" },
  { icon: "🔄", head: "เปลี่ยนบ่อยได้ ไม่เปลืองของ", body: "เหมาะกับบอร์ด “ผลงานประจำสัปดาห์” หรือบอร์ดหมุนเวียนแสดงชิ้นงานเด็กแต่ละคน" },
  { icon: "🏫", head: "ใช้ได้หลายจุดในโรงเรียน", body: "ไม่ใช่แค่ในห้องเรียน แต่ใช้ติดหน้าห้องพักครู บอร์ดประชาสัมพันธ์ ป้ายตารางเวร หรือป้ายประกาศหน้าห้องธุรการก็ได้" },
  { icon: "⏱️", head: "ประหยัดเวลาเตรียมบอร์ด", body: "ไม่ต้องมานั่งเจาะ ตอกตะปู หรือแกะกาวเก่าออกทุกครั้งที่เปลี่ยนผลงาน" },
  { icon: "📋", head: "เหมาะกับ PLC และการประเมิน", body: "ใช้โชว์ผลงานเด่นของนักเรียนตอนมีการนิเทศหรือประเมินชั้นเรียนได้แบบมืออาชีพ" },
];

const sizes = [
  { k: "A5", v: "ป้ายชื่อมุมกิจกรรม, ป้ายกำกับชั้นวางของ" },
  { k: "A4", v: "ผลงานเด็กชิ้นเดี่ยว, ใบประกาศ, ตารางเวร" },
  { k: "A3", v: "ผลงานภาพวาดขนาดใหญ่, โปสเตอร์, ป้ายประชาสัมพันธ์หน้าห้อง" },
];

const quickFacts = [
  { icon: "🧲", k: "ระบบขอบ", v: "แม่เหล็ก" },
  { icon: "🩹", k: "การติดตั้ง", v: "กาวในตัว" },
  { icon: "📐", k: "ขนาด", v: "A5 / A4 / A3" },
  { icon: "🔀", k: "ทิศทาง", v: "ตั้ง–นอน" },
  { icon: "🛒", k: "ช่องทางซื้อ", v: "Shopee" },
];

const tags = ["กรอบป้ายติดผนัง", "กรอบแม่เหล็ก", "ไม่ต้องเจาะผนัง", "บอร์ดผลงานนักเรียน", "สื่อการสอน", "อุปกรณ์ห้องเรียน", "รีวิวสินค้าครู"];

// NOTE: source data has no `href` for these related items (they reference
// posts not yet built in this site) — rendered as non-linking cards.
const related = [
  { title: "รีวิวเครื่องเคลือบบัตร A4 สำหรับครู เลือกรุ่นไหนดี", date: "20 ก.ค. 2568" },
  { title: "รีวิวสติกเกอร์รางวัลนักเรียน ชุดใหญ่ 1,000 ดวง", date: "12 ก.ค. 2568" },
  { title: "10 กิจกรรมสุ่มชื่อนักเรียนให้ห้องเรียนสนุกขึ้น", date: "5 ก.ค. 2568" },
];

export default function BlogMagneticFramePage() {
  return (
    <main className="flex-1">
      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">หน้าแรก</Link>
        <span>›</span>
        <Link href="/articles" className="text-ink-faint">บทความ</Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">รีวิวสินค้า</span>
      </div>

      <div className="px-4 pt-3 md:px-8 md:pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/magnet-frame-detail.jpg"
          alt="กรอบป้ายติดผนังแม่เหล็ก"
          className="mx-auto block max-h-[540px] w-full rounded-card-lg bg-[#F1F3F6] object-cover md:max-h-[600px] md:rounded-[20px]"
        />
      </div>

      <div className="px-4 pb-9 pt-4 md:grid md:grid-cols-[1fr_300px] md:gap-10 md:px-8 md:pt-6">
        <article className="min-w-0 md:max-w-[720px]">
          <div className="mb-3.5 flex flex-wrap items-center gap-2 md:mb-4">
            <span className="rounded-pill bg-[#FFEAD5] px-2.5 py-1 text-[12px] font-bold text-[#C2500B] md:px-[11px] md:py-[5px]">รีวิวสินค้า</span>
            <span className="rounded-pill bg-[#DFF5EF] px-2.5 py-1 text-[12px] font-semibold text-[#0A7A66] md:px-[11px] md:py-[5px]">ไม่ต้องเจาะผนัง</span>
            <span className="text-[12px] text-ink-faint">26 ก.ค. 2568 · อ่าน 4 นาที · โดย ทีมขุนคูล</span>
          </div>

          <h1 className="m-0 mb-3 text-[26px] leading-[1.32] md:mb-4 md:text-[38px] md:leading-[1.25]">
            รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง ตัวช่วยทำบอร์ดและติดผลงานเด็กที่ครูต้องมี
          </h1>
          <p className="m-0 mb-5 text-base leading-[1.75] text-[#434A58] md:mb-6 md:text-[17px]">
            ครูคนไหนกำลังปวดหัวเรื่อง “ทำบอร์ดติดผลงานเด็ก” แล้วเจอปัญหาผนังพัง เทปกาวลอก หรือเปลี่ยนผลงานทีต้องรื้อทั้งบอร์ด วันนี้ขุนคูลมีไอเทมตัวช่วยดี ๆ มาแนะนำ นั่นคือ <b>กรอบป้ายติดผนังแม่เหล็ก</b> ที่จะทำให้การจัดบอร์ดในห้องเรียนง่ายขึ้นอีกเยอะ
          </p>

          <h2 className="text-xl md:text-2xl">กรอบป้ายติดผนังแม่เหล็ก คืออะไร</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            กรอบป้ายติดผนังแม่เหล็กเป็นกรอบโชว์เอกสาร/ผลงาน ทำจากแผ่นใส 2 ชั้นประกบกันด้วยแถบแม่เหล็กตรงขอบ ด้านหลังมีกาวในตัว ไม่ต้องเจาะผนังหรือใช้ตะปู แค่ลอกแผ่นกาวแล้วแปะติดผนัง ปูน หรือบอร์ดได้ทันที
          </p>
          <p className="m-0 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
            จุดเด่นคือ <b>ขอบเป็นแม่เหล็ก</b> ทำให้สอดหรือเปลี่ยนกระดาษด้านในได้ง่าย ๆ แค่แงะขอบออกแล้วใส่แผ่นใหม่เข้าไป ไม่ต้องแกะกรอบทั้งอันออกจากผนัง
          </p>

          <h2 className="mt-8 text-xl md:text-2xl">จุดเด่นของสินค้า</h2>
          <div className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-[11px]">
            {highlights.map((h) => (
              <div key={h} className="flex items-start gap-2.5 rounded-2xl border border-[#E5E8EE] bg-white p-3 md:gap-[11px] md:p-3.5">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-[#FFF1E4] text-xs font-bold text-[#C2500B] md:h-[22px] md:w-[22px]">✓</span>
                <span className="text-sm leading-[1.7] text-[#2E3440] md:text-[14.5px] md:leading-[1.65]">{h}</span>
              </div>
            ))}
          </div>

          <div className="mt-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/magnet-frame-cover.png"
              alt="รายละเอียดกรอบป้ายติดผนังแม่เหล็ก"
              className="block w-full rounded-2xl border border-[#E5E8EE]"
            />
            <div className="mt-2 text-xs leading-[1.6] text-ink-faint">ตัวอย่างการใช้งาน คุณสมบัติ และวิธีติดตั้ง 3 ขั้นตอน · ภาพจากผู้ขาย</div>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">ทำไมครูควรมีกรอบป้ายแบบนี้ติดห้องเรียน</h2>
          <div className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5">
            {reasons.map((r) => (
              <div key={r.head} className="rounded-2xl border border-[#E5E8EE] bg-white p-3.5 md:p-4">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-lg md:text-[19px]">{r.icon}</span>
                  <span className="text-sm font-bold md:text-[15.5px]">{r.head}</span>
                </div>
                <div className="text-[13px] leading-[1.7] text-ink-secondary md:text-sm md:leading-[1.75]">{r.body}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">เลือกขนาดไหนดี ให้เหมาะกับการใช้งาน</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E8EE]">
            <div className="hidden gap-3.5 bg-surface-light px-[18px] py-3 text-xs font-bold text-ink-faint md:flex">
              <span className="w-[90px] flex-none">ขนาด</span>
              <span className="flex-1">เหมาะกับ</span>
            </div>
            {sizes.map((s) => (
              <div key={s.k} className="flex gap-2.5 border-t border-border bg-white p-3 first:border-t-0 md:gap-3.5 md:p-[14px_18px]">
                <span className="w-11 flex-none text-sm font-bold text-[#C2500B] md:w-[90px] md:text-base">{s.k}</span>
                <span className="flex-1 text-[13.5px] leading-[1.6] md:text-base md:font-medium">{s.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#FFD9BA] bg-[#FFFBF6] p-4 md:p-[20px_22px]">
            <div className="mb-1.5 text-xs font-bold text-[#C2500B] md:mb-2 md:text-[13px]">💡 เคล็ดลับจัดบอร์ด</div>
            <div className="text-[13.5px] leading-[1.75] text-[#2E3440] md:text-[15px] md:leading-[1.8]">
              ถ้าจะทำบอร์ด “ผลงานเด็กทั้งห้อง” แนะนำให้ใช้กรอบ A4 เรียงเป็นแถว ๆ จัดวางเป็นตารางบนบอร์ด จะได้บอร์ดที่ดูเป็นระเบียบ เปลี่ยนผลงานรายสัปดาห์ได้ง่ายโดยไม่ต้องรื้อกรอบใหม่ทุกครั้ง
            </div>
          </div>

          <h2 className="mt-8 text-xl md:text-2xl">จะหาซื้อกรอบป้ายแม่เหล็กแบบนี้ได้ที่ไหน</h2>
          <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:mb-[18px] md:text-[15.5px] md:leading-[1.85]">
            ตัวอย่างสินค้ากรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง มีกาวในตัว ดูรายละเอียดและสั่งซื้อได้ที่ Shopee
          </p>
          <div className="flex items-center gap-4 rounded-2xl border border-[#FFD9BA] bg-[#FFFBF6] p-4 md:p-[20px_22px]">
            <div className="flex-1">
              <div className="mb-1 text-base font-bold md:text-[16.5px]">กรอบป้ายติดผนัง กรอบโชว์ป้ายประกาศ แม่เหล็ก</div>
              <div className="text-[13.5px] text-ink-secondary">ไม่ต้องเจาะผนัง · มีกาวในตัว · เปิด-ปิดเปลี่ยนป้ายได้สะดวก</div>
            </div>
            <a
              href={shopeeUrl}
              target="_blank"
              rel="noopener sponsored"
              className="flex-none rounded-xl bg-[#F97316] px-5 py-3.5 text-sm font-bold text-white no-underline shadow-[0_10px_24px_-8px_rgba(249,115,22,.5)] hover:bg-[#EA6209]"
            >
              ดูสินค้าบน Shopee ↗
            </a>
          </div>
          <div className="mt-3 text-xs text-ink-faint">ลิงก์ร้านค้าภายนอก · ราคาและขนาดที่มีจำหน่ายอาจเปลี่ยนแปลงตามผู้ขาย</div>

          <div className="mt-8 border-t border-[#E5E8EE] pt-5">
            <h2 className="text-lg md:text-[22px]">สรุป</h2>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              สำหรับครูที่ต้องทำบอร์ดติดผลงานเด็กอยู่บ่อย ๆ <b>กรอบป้ายติดผนังแม่เหล็ก</b> ถือเป็นอุปกรณ์คุ้มค่าที่ช่วยลดเวลาเตรียมบอร์ด ทำให้ผนังห้องเรียนไม่เสียหายจากการเจาะหรือแปะกาว และยังทำให้บอร์ดผลงานดูเป็นระเบียบมืออาชีพมากขึ้น เป็นอีกหนึ่งไอเทมที่ขุนคูลอยากแนะนำให้ครูทุกคนลองมีติดห้องเรียนไว้สักชุด
            </p>
            <p className="m-0 mb-4 text-[14.5px] leading-[1.78] text-[#2E3440] md:text-[15.5px] md:leading-[1.85]">
              ติดตามรีวิวสื่อการสอนและอุปกรณ์ห้องเรียนดี ๆ แบบนี้ได้ที่ <Link href="/">Khuncool.com</Link> หมวดสื่อการสอน และแหล่งอบรมฟรี สำหรับครูไทยทุกคน
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-pill bg-surface-light px-2.5 py-1.5 text-[11.5px] font-medium text-ink-secondary">#{t}</span>
              ))}
            </div>
          </div>
        </article>

        <aside className="mt-8 flex flex-col gap-4 md:mt-0">
          <div className="rounded-2xl border border-[#E5E8EE] bg-white p-4 md:sticky md:top-5">
            <div className="mb-3 text-[13px] font-bold text-ink-faint">สรุปสินค้านี้</div>
            <div className="flex flex-col gap-2.5">
              {quickFacts.map((q) => (
                <div key={q.k} className="flex items-center gap-2.5">
                  <span className="flex-none text-base">{q.icon}</span>
                  <span className="flex-1 text-[13px] text-ink-faint">{q.k}</span>
                  <span className="flex-none text-[13.5px] font-bold">{q.v}</span>
                </div>
              ))}
            </div>
            <a
              href={shopeeUrl}
              target="_blank"
              rel="noopener sponsored"
              className="mt-4 block rounded-xl bg-[#F97316] p-3 text-center text-sm font-bold text-white no-underline hover:brightness-[1.06]"
            >
              สั่งซื้อบน Shopee ↗
            </a>
          </div>

          <div className="rounded-2xl border border-[#E5E8EE] bg-white p-4">
            <div className="mb-3 text-sm font-bold">📌 รีวิวอื่น ๆ</div>
            <div className="flex flex-col">
              {related.map((r) => (
                <div key={r.title} className="border-t border-border py-2.5">
                  <div className="mb-0.5 text-[11px] font-semibold text-[#C2500B]">รีวิวสินค้า</div>
                  <div className="text-[13.5px] font-semibold leading-[1.5]">{r.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-faint">{r.date}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
