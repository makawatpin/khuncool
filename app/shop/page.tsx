import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import FaqAccordion from "./FaqAccordion";
import { CATS, FAQS, PRODUCTS, TRUST_CHIPS, priceToNumber } from "./data";

export const metadata: Metadata = {
  title: "ร้านค้าครู อุปกรณ์ห้องเรียน แนะนำโดยขุนคูล | khuncool",
  description:
    "รวมอุปกรณ์ห้องเรียนที่ครูใช้จริง กรอบป้ายแม่เหล็ก เครื่องเคลือบบัตร ขาตั้งโน้ตบุ๊ก ไมค์ลำโพงพกพา และกระบอกน้ำ พร้อมรีวิวและลิงก์สั่งซื้อ",
  alternates: {
    canonical: "https://www.khuncool.com/shop",
  },
  openGraph: {
    type: "website",
    title: "ร้านค้าครู อุปกรณ์ห้องเรียน แนะนำโดยขุนคูล",
    description: "อุปกรณ์ห้องเรียนที่ครูใช้จริง คัดสรรและรีวิวโดยทีมขุนคูล",
    images: ["https://www.khuncool.com/assets/magnet-frame-cover.png"],
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
          name: "ร้านค้าครู",
          item: "https://www.khuncool.com/shop",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "ร้านค้าครู",
      url: "https://www.khuncool.com/shop",
      inLanguage: "th-TH",
      description:
        "รวมอุปกรณ์ห้องเรียนที่ครูใช้จริง คัดสรรและรีวิวโดยทีมขุนคูล",
    },
    {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: PRODUCTS.length,
      itemListElement: PRODUCTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.title,
          image: `https://www.khuncool.com${p.img}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "THB",
            price: priceToNumber(p.price),
          },
        },
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

export default function ShopPage() {
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
            ร้านค้าครู
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-4 pb-0 pt-3 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-11 md:px-8 md:pb-[30px] md:pt-4">
        <div>
          <h1 className="m-0 mb-2.5 text-[26px] leading-[1.32] md:mb-3.5 md:max-w-[18ch] md:text-[42px] md:leading-[1.25]">
            <span className="md:hidden">
              อุปกรณ์ห้องเรียน
              <br />
              ที่ครูใช้จริง
            </span>
            <span className="hidden md:inline">
              อุปกรณ์ห้องเรียนที่ครูใช้จริง
            </span>
          </h1>
          <p className="m-0 mb-3.5 text-sm leading-[1.7] text-ink-secondary md:mb-4 md:max-w-[56ch] md:text-base md:leading-[1.8]">
            <span className="md:hidden">
              คัดสรรและรีวิวโดยทีมขุนคูล เน้นของที่คุ้มค่า ทนทาน ใช้งานง่าย
              ไม่รับสปอนเซอร์เพื่อจัดอันดับ
            </span>
            <span className="hidden md:inline">
              ทีมขุนคูลคัดเลือกและทดลองใช้อุปกรณ์ห้องเรียนด้วยตัวเอง
              ก่อนแนะนำต่อ เน้นของที่คุ้มค่า ทนทาน
              ใช้งานง่ายในชีวิตประจำวันของครู ไม่รับสปอนเซอร์เพื่อจัดอันดับ
              ลิงก์สั่งซื้อบางส่วนเป็นลิงก์พันธมิตร
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

        {/* Desktop-only categories panel */}
        <div className="mt-6 hidden rounded-card-lg border border-[#EEF0F4] bg-surface-light p-[20px_22px] md:block">
          <h2 className="m-0 mb-3 text-[15px]">หมวดหมู่</h2>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <span
                key={c.t}
                className="rounded-pill px-3.5 py-2 text-[13px] font-semibold"
                style={{ background: c.bg, color: c.color }}
              >
                {c.t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-only category chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 pt-0 md:hidden">
        {CATS.map((c) => (
          <span
            key={c.t}
            className="flex-none whitespace-nowrap rounded-pill px-[13px] py-[7px] text-[12.5px] font-semibold"
            style={{ background: c.bg, color: c.color }}
          >
            {c.t}
          </span>
        ))}
      </div>

      {/* Product grid */}
      <div className="px-4 pb-6 pt-3 md:px-8 md:pb-[34px] md:pt-0">
        <h2 className="m-0 mb-[18px] hidden text-2xl md:block">
          สินค้าแนะนำทั้งหมด
        </h2>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-6 md:gap-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.title} product={p} />
          ))}
        </div>
      </div>

      {/* FAQ + (desktop) editorial copy */}
      <div className="px-4 pb-6 md:grid md:grid-cols-2 md:items-start md:gap-11 md:px-8 md:pb-9">
        <div>
          <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
            คำถามที่ครูถามบ่อย
          </h2>
          <FaqAccordion />
        </div>

        {/* Desktop-only editorial column */}
        <div className="hidden md:block">
          <h2 className="m-0 mb-4 text-2xl">วิธีเลือกซื้ออุปกรณ์ห้องเรียน</h2>
          <p className="m-0 mb-3.5 text-[14.5px] leading-[1.85] text-ink-secondary">
            ของที่ดูดีในรูปไม่ได้แปลว่าใช้ทนในห้องเรียนจริง
            ทีมงานจึงเน้นทดลองใช้งานต่อเนื่องอย่างน้อย 2 สัปดาห์ก่อนแนะนำ
            ดูทั้งความทนทาน ความคุ้มราคา และความง่ายในการใช้งานประจำวัน
          </p>
          <p className="m-0 mb-[18px] text-[14.5px] leading-[1.85] text-ink-secondary">
            สินค้าที่มีบทความรีวิวแนบ จะมีปุ่ม “อ่านรีวิว”
            ให้กดไปดูรายละเอียดการใช้งานจริงก่อนตัดสินใจซื้อ
          </p>
          <div className="flex flex-col gap-[9px]">
            <Link
              href="/articles"
              className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-light p-[13px_15px] text-inherit no-underline hover:bg-[#F1F2FC]"
            >
              <span className="flex-1 text-sm text-ink-secondary">
                ดูบทความรีวิวสินค้าและสื่อการสอนทั้งหมด
              </span>
              <span className="flex-none text-[13px] text-primary">อ่าน ›</span>
            </Link>
            <Link
              href="/tools"
              className="flex items-center gap-2.5 rounded-xl border border-[#EEF0F4] bg-surface-light p-[13px_15px] text-inherit no-underline hover:bg-[#F1F2FC]"
            >
              <span className="flex-1 text-sm text-ink-secondary">
                เครื่องมือครูใช้สดในคาบเรียน ใช้ฟรี
              </span>
              <span className="flex-none text-[13px] text-primary">
                เปิดใช้ ›
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile-only footer link + disclosure */}
      <div className="border-t border-border bg-surface-light px-4 pb-7 pt-[22px] md:hidden">
        <h2 className="m-0 mb-2 text-[15px]">อยากอ่านรีวิวเต็ม ๆ</h2>
        <Link
          href="/articles"
          className="text-[13px] text-primary no-underline"
        >
          ดูบทความทั้งหมด ›
        </Link>
        <div className="mt-4 text-[11px] text-[#A9B0BE]">
          © 2568 khuncool.com · เพื่อครูไทยทุกคน · ลิงก์บางส่วนเป็นลิงก์พันธมิตร
        </div>
      </div>

      {/* Desktop-only affiliate disclosure footer */}
      <div className="hidden px-8 pb-[26px] text-[11.5px] text-[#A9B0BE] md:block">
        © 2568 khuncool.com · เพื่อครูไทยทุกคน ·
        ลิงก์สั่งซื้อบางส่วนเป็นลิงก์พันธมิตร
        ทีมงานอาจได้รับค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่มจากคุณ
      </div>
    </main>
  );
}
