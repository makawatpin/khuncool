import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CookieConsent from "@/components/CookieConsent";
import OfflineIndicator from "@/components/OfflineIndicator";

export const metadata: Metadata = {
  title: "Khuncool | แหล่งรวมความรู้และเครื่องมือสำหรับครูไทย ใช้ฟรี",
  description:
    "ขุนคูล (Khuncool) ศูนย์รวมบทความครู สื่อการสอนออนไลน์ และแอปช่วยงานครู เช่น วงล้อสุ่มชื่อ เช็กชื่อ บันทึกโฮมรูม ใช้งานฟรีบนเว็บ ไม่ต้องติดตั้ง",
  alternates: {
    canonical: "https://www.khuncool.com/",
  },
  openGraph: {
    type: "website",
    title: "Khuncool | แหล่งรวมความรู้และเครื่องมือสำหรับครูไทย ใช้ฟรี",
    description:
      "ขุนคูล (Khuncool) ศูนย์รวมบทความครู สื่อการสอนออนไลน์ และแอปช่วยงานครู เช่น วงล้อสุ่มชื่อ เช็กชื่อ บันทึกโฮมรูม ใช้งานฟรีบนเว็บ ไม่ต้องติดตั้ง",
    url: "https://www.khuncool.com/",
    images: ["https://www.khuncool.com/assets/wheel-cover.png"],
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
      "@type": "Organization",
      name: "khuncool",
      url: "https://www.khuncool.com/",
      logo: "https://www.khuncool.com/assets/khuncool-logo.png",
    },
    {
      "@type": "WebSite",
      name: "khuncool",
      url: "https://www.khuncool.com/",
      inLanguage: "th-TH",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.khuncool.com/articles?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const PILLARS = [
  {
    icon: "📰",
    title: "บทความ",
    path: "/articles",
    bg: "bg-[#E1E3FD]",
    href: "/articles/wheel",
  },
  {
    icon: "🎡",
    title: "สื่อการสอนออนไลน์",
    path: "/tools",
    bg: "bg-[#D0FBEF]",
    href: "/tools",
  },
  {
    icon: "🛒",
    title: "แนะนำสินค้า",
    path: "/shop",
    bg: "bg-[#FFEAD5]",
    href: "/shop",
  },
  {
    icon: "📱",
    title: "แอป",
    path: "/apps",
    bg: "bg-[#E1E3FD]",
    href: "/apps",
  },
];

const TOOLS = [
  { icon: "🎡", title: "วงล้อสุ่มชื่อ", tag: "ยอดนิยม", bg: "bg-[#E1E3FD]", href: "/tools/wheel" },
  { icon: "🏆", title: "กระดานคะแนนกลุ่ม", tag: "ใหม่", bg: "bg-[#E1E3FD]", href: "/tools/scoreboard" },
  { icon: "🎤", title: "เครื่องวัดเสียงในห้อง", tag: "ใหม่", bg: "bg-[#D0FBEF]", href: "/tools/noise-meter" },
  { icon: "🦆", title: "เกมแข่งเป็ด", tag: "สนุก สุ่มชื่อ", bg: "bg-[#D0FBEF]", href: "/tools/duck-race" },
];

const ARTICLES = [
  {
    rank: "1",
    cat: "อบรมฟรี",
    catColor: "text-success",
    title:
      "เรียนภาษาอังกฤษฟรี มีใบเซอร์! คอร์ส Intermediate Conversational English จาก PSU MOOC",
    date: "25 ก.ค. 2568",
    read: "อ่าน 4 นาที",
    cover: "/assets/psu-english-cover.webp",
    linksTool: "",
    href: "/articles/psu-english",
  },
  {
    rank: "2",
    cat: "สื่อการสอน",
    catColor: "text-[#3D38B4]",
    title: "วงล้อสุ่ม สื่อการสอนที่ครูควรมี ช่วยให้ห้องเรียนสนุกและยุติธรรมขึ้น",
    date: "27 ก.ค. 2569",
    read: "อ่าน 5 นาที",
    cover: "/assets/wheel-cover.png",
    linksTool: "วงล้อสุ่ม /tools/wheel",
    href: "/articles/wheel",
  },
  {
    rank: "3",
    cat: "รีวิวสินค้า",
    catColor: "text-[#C2500B]",
    title: "รีวิว กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง ตัวช่วยทำบอร์ดผลงานเด็ก",
    date: "26 ก.ค. 2568",
    read: "อ่าน 4 นาที",
    cover: "/assets/magnet-frame-detail.jpg",
    linksTool: "",
    href: "/articles/magnetic-frame",
  },
  {
    rank: "4",
    cat: "สื่อการสอน",
    catColor: "text-[#3D38B4]",
    title: "10 กิจกรรมสุ่มชื่อนักเรียน ทำให้ห้องเรียนสนุกขึ้นทันที",
    date: "27 ก.ค. 2569",
    read: "อ่าน 6 นาที",
    cover: "/assets/random-name-cover.png",
    linksTool: "วงล้อสุ่ม /tools/wheel",
    href: "/articles/random-name-activities",
  },
  {
    rank: "5",
    cat: "ข่าวครู",
    catColor: "text-[#8A6206]",
    title: "รางวัลพระราชทาน 2569 สพฐ. เปิดคัดเลือก ยื่น 1–21 ส.ค.",
    date: "27 ก.ค. 2569",
    read: "อ่าน 4 นาที",
    cover: "/assets/royal-award-cover.png",
    linksTool: "",
    href: "/articles/royal-award-2569",
  },
];

const PRODUCTS = [
  {
    name: "กรอบป้ายติดผนังแม่เหล็ก ไม่ต้องเจาะผนัง มีกาวในตัว",
    rating: "4.9 (320)",
    price: "฿16",
    cover: "/assets/magnet-frame-product.webp",
    href: "https://s.shopee.co.th/7KvhYc7TtI",
  },
  {
    name: "เครื่องเคลือบบัตร A4 พร้อมฟิล์ม 50 แผ่น",
    rating: "4.8 (156)",
    price: "฿469",
    cover: "/assets/laminator-product.jpg",
    href: "https://s.shopee.co.th/9ANLl4nOwr",
  },
  {
    name: "แท่นวางแล็ปท็อป iPad ปรับสูงต่ำ หมุนได้ 360°",
    rating: "5.0 (892)",
    price: "฿399",
    cover: "/assets/laptop-stand-product.webp",
    href: "https://s.shopee.co.th/3Viz1JMJ8g",
  },
  {
    name: "ไมค์ช่วยสอน K500 ลำโพงพกพา สำหรับครู",
    rating: "4.7 (241)",
    price: "฿436",
    cover: "/assets/mic-speaker-product.webp",
    href: "https://s.shopee.co.th/50XmnMcQXy",
  },
  {
    name: "แก้วเก็บความเย็น Bottle Bottle เซรามิก มีหลอด",
    rating: "4.8 (410)",
    price: "฿599",
    cover: "/assets/tumbler-1.webp",
    href: "https://s.shopee.co.th/1gHKqEUGWH",
  },
  {
    name: "แก้วเก็บความเย็น CIVAGO เซรามิก เย็น 24 ชม.",
    rating: "4.9 (275)",
    price: "฿324",
    cover: "/assets/tumbler-2.webp",
    href: "https://s.shopee.co.th/20uBElffiQ",
  },
];

const APPS = [
  {
    icon: "📋",
    title: "บันทึกโฮมรูม",
    sub: "ตั้งหัวข้อเอง พิมพ์แบบฟอร์มได้",
    bg: "bg-[#E1E3FD]",
    href: "/apps/homeroom",
  },
  {
    icon: "✅",
    title: "เช็กชื่อนักเรียน",
    sub: "บันทึกการมาเรียน สรุปสถิติ",
    bg: "bg-[#D0FBEF]",
    href: "/apps/attendance",
  },
  {
    icon: "💰",
    title: "ออมเงินนักเรียน",
    sub: "บันทึกเงินออมรายคน รายห้อง",
    bg: "bg-[#FFEAD5]",
    href: "/apps/savings",
  },
  {
    icon: "🔀",
    title: "สุ่มแบ่งกลุ่ม",
    sub: "แบ่งกลุ่มเท่า ๆ กันอัตโนมัติ",
    bg: "bg-[#E1E3FD]",
    href: "/apps/groups",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* hero */}
      <section
        className="px-4 pb-5 pt-[22px] md:px-6 md:pb-7 md:pt-[34px] lg:px-8 lg:pb-9 lg:pt-12"
        style={{
          background:
            "radial-gradient(120% 90% at 100% 0%, #EFF0FE, #fff)",
        }}
      >
        <div className="lg:max-w-[680px] md:max-w-[560px]">
          <h1 className="m-0 mb-2.5 font-anuphan text-[25px] font-bold leading-[1.28] tracking-[-.01em] md:text-[34px] md:leading-[1.18] md:tracking-[-.02em] lg:text-[44px] lg:leading-[1.16]">
            <span className="md:hidden">
              แหล่งรวมความรู้
              <br />
              และเครื่องมือ
              <span className="text-primary">สำหรับครูไทย</span>
            </span>
            <span className="hidden md:inline">
              แหล่งรวมความรู้และเครื่องมือ
              <br />
              <span className="bg-brand bg-clip-text text-transparent">
                สำหรับครูไทย
              </span>
            </span>
          </h1>
          <p className="m-0 mb-4 text-[14.5px] leading-relaxed text-ink-secondary md:mb-[22px] md:text-base lg:mb-[26px] lg:text-lg">
            บทความครู · สื่อการสอนออนไลน์ที่เล่นบนเว็บได้เลย · แอปช่วยงานครู —
            เปิดใช้ฟรี ไม่ต้องติดตั้ง
          </p>
          <div className="flex gap-2.5 md:gap-[11px] lg:gap-3">
            <a
              href="#tools"
              className="flex-1 whitespace-nowrap rounded-btn bg-primary px-3 py-3 text-center text-sm font-semibold text-white shadow-cta hover:bg-primary-hover md:flex-none md:px-[22px] md:py-[13px] md:text-[14.5px] lg:px-[26px] lg:py-3.5 lg:text-[15.5px]"
            >
              ลองเครื่องมือ<span className="hidden md:inline">ออนไลน์</span>
            </a>
            <a
              href="#articles"
              className="flex-1 whitespace-nowrap rounded-btn border border-border-strong bg-surface-card px-3 py-3 text-center text-sm font-semibold text-ink hover:bg-surface-light md:flex-none md:px-[22px] md:py-[13px] md:text-[14.5px] lg:px-[26px] lg:py-3.5 lg:text-[15.5px]"
            >
              อ่านบทความ<span className="hidden md:inline">ครู</span>
            </a>
          </div>
        </div>
      </section>

      {/* articles + sidebar */}
      <section
        id="articles"
        className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-8 lg:pt-11"
      >
        <div>
          <div className="mb-3 flex items-baseline justify-between md:mb-4 lg:mb-[18px]">
            <h2 className="m-0 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
              ข่าวสารครู
            </h2>
            <Link
              href="/articles"
              className="text-[12.5px] text-primary md:text-[13.5px] lg:text-sm"
            >
              ดูทั้งหมด ›
            </Link>
          </div>

          <div className="flex flex-col gap-3.5 md:grid md:grid-cols-2 md:gap-4 lg:gap-[18px]">
            {ARTICLES.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="block text-inherit no-underline"
              >
                <div className="flex items-start gap-2.5 md:block">
                  <div className="relative aspect-video w-[132px] flex-none overflow-hidden rounded-card-sm md:mb-2.5 md:w-full lg:mb-[11px] lg:rounded-card">
                    <Image
                      src={a.cover}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-[10.5px] font-semibold ${a.catColor} md:text-[11px]`}>
                      {a.cat}
                    </span>
                    <div className="my-0.5 line-clamp-3 text-[13px] font-semibold leading-snug md:line-clamp-2 md:text-[15px] lg:text-base">
                      {a.title}
                    </div>
                    <div className="text-[10.5px] text-ink-faint md:text-[11.5px] lg:text-xs">
                      {a.date} · {a.read}
                    </div>
                    {a.linksTool && (
                      <div className="mt-1.5 ml-[143px] text-[11.5px] text-primary md:ml-0 md:mt-1 lg:mt-1.5">
                        → เกี่ยวข้อง: <span className="font-semibold">{a.linksTool}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* sidebar: ad + popular (desktop/tablet only) */}
        <div className="mt-7 hidden md:mt-8 md:block lg:mt-0">
          <div className="flex flex-col gap-4 lg:sticky lg:top-20">
            <div className="flex h-[180px] flex-col items-center justify-center rounded-card border-[1.5px] border-dashed border-border-strong bg-surface-light lg:h-[280px]">
              <span className="font-mono text-[11px] tracking-wider text-ink-faint">
                <span className="lg:hidden">AD · 336×280</span>
                <span className="hidden lg:inline">AD · 300×250</span>
              </span>
              <span className="mt-1 text-[11.5px] text-ink-faint">
                <span className="lg:hidden">AdSense — in-content</span>
                <span className="hidden lg:inline">AdSense — sticky sidebar</span>
              </span>
            </div>
            <div className="rounded-card border border-border bg-surface-card p-4 pb-1.5 lg:p-[18px] lg:pb-2">
              <h3 className="m-0 mb-2.5 flex items-center gap-1.5 text-sm font-bold">
                🔥 อ่านมากสัปดาห์นี้
              </h3>
              {ARTICLES.map((a) => (
                <div
                  key={a.rank}
                  className="flex gap-2.5 border-t border-surface-panel py-2 hover:opacity-70 lg:gap-[11px] lg:py-2.5"
                >
                  <span className="w-[18px] flex-none font-mono text-[15px] font-extrabold text-border-strong lg:w-5 lg:text-[17px]">
                    {a.rank}
                  </span>
                  <div>
                    <div className={`mb-0.5 hidden text-[11px] font-semibold ${a.catColor} lg:block`}>
                      {a.cat}
                    </div>
                    <div className="text-xs font-semibold leading-snug">
                      {a.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 pillar hubs */}
      <section className="px-4 pb-1 pt-2 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-4 lg:gap-3.5">
          {PILLARS.map((p) => (
            <Link
              key={p.path}
              href={p.href}
              className="flex items-center gap-2.5 rounded-card-sm border border-border bg-surface-card p-2.5 no-underline hover:border-primary/40 md:gap-3 md:rounded-card md:p-3.5 lg:gap-[13px] lg:rounded-card lg:p-4"
            >
              <div
                className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-card-sm text-[17px] ${p.bg} md:h-10 md:w-10 md:text-xl lg:h-[42px] lg:w-[42px] lg:text-xl`}
              >
                {p.icon}
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold leading-tight text-ink md:text-[15px] lg:text-[15.5px]">
                  {p.title}
                </div>
                <div className="mt-0.5 hidden font-mono text-[11px] text-ink-faint md:block">
                  {p.path}
                </div>
              </div>
              <span className="hidden text-[17px] text-border-strong md:inline">
                ›
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* featured wheel + tools grid */}
      <section id="tools" className="px-4 pb-1 pt-6 md:px-6 md:pt-7 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-stretch lg:gap-5 lg:px-8 lg:pt-11">
        <div
          className="relative mx-0.5 overflow-hidden rounded-card-lg p-[22px] text-white md:mx-0 md:p-[30px] lg:flex lg:flex-col lg:justify-center lg:p-9"
          style={{
            background: "linear-gradient(150deg,#2A2775,#0A9380)",
          }}
        >
          <div className="pointer-events-none absolute -right-[30px] -top-[30px] h-[130px] w-[130px] rounded-full bg-white/[.08] md:-right-10 md:-top-10 md:h-[180px] md:w-[180px] lg:-right-[50px] lg:-top-[50px] lg:h-[220px] lg:w-[220px]" />
          <div className="relative md:max-w-[440px]">
            <span className="whitespace-nowrap rounded-pill bg-white/[.18] px-2.5 py-1 text-[10.5px] font-semibold md:px-3 md:py-1.5 md:text-[11.5px] lg:px-3 lg:py-1.5 lg:text-xs">
              ⭐ เครื่องมือแนะนำ
            </span>
            <h2 className="my-3 text-[21px] font-bold text-white md:my-3.5 md:text-[26px] lg:my-3.5 lg:text-[30px]">
              วงล้อสุ่มชื่อนักเรียน
            </h2>
            <p className="mb-4 text-[13px] leading-relaxed text-[#C6C9FB] md:mb-5 md:text-sm lg:mb-[22px] lg:max-w-[420px] lg:text-[15px]">
              สุ่มเลือกคน แบ่งกลุ่ม สุ่มคำถาม — ใส่รายชื่อแล้วหมุนได้เลยบนเว็บ
              ไม่ต้องติดตั้ง
            </p>
            <Link
              href="/tools/wheel"
              className="block whitespace-nowrap rounded-btn bg-white px-6 py-3 text-center text-sm font-semibold text-[#2A2775] hover:bg-[#EFF0FE] md:inline-block md:px-6 md:py-3 md:text-[14.5px] lg:px-[26px] lg:py-[13px] lg:text-[15px]"
            >
              เปิดวงล้อสุ่ม →
            </Link>
          </div>
        </div>

        <div className="mt-5 md:mt-7 lg:mt-0">
          <div className="mb-3 flex items-baseline justify-between md:mb-3.5 lg:mb-[14px]">
            <h2 className="m-0 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
              สื่อการสอนออนไลน์
            </h2>
            <Link href="/tools" className="text-[12.5px] text-primary md:text-[13.5px] lg:text-sm">
              ทั้งหมด ›
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3.5 lg:grid-cols-2 lg:gap-3.5">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="block rounded-card-sm border border-border bg-surface-card p-3.5 text-inherit no-underline hover:border-primary/40 hover:shadow-[0_8px_20px_-10px_rgba(26,29,38,.16)] md:rounded-card md:p-[15px] lg:p-4"
              >
                <div
                  className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-card-sm text-xl ${t.bg} md:h-[42px] md:w-[42px] lg:h-11 lg:w-11`}
                >
                  {t.icon}
                </div>
                <div className="mb-0.5 text-[13.5px] font-semibold leading-snug md:text-sm lg:text-[15px]">
                  {t.title}
                </div>
                <div className="text-[11px] text-ink-faint md:text-[11.5px] lg:text-xs">
                  {t.tag}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ad in-feed / leaderboard */}
      <div className="mx-4 mt-5 flex h-[100px] flex-col items-center justify-center rounded-card border-[1.5px] border-dashed border-border-strong bg-surface-light md:mx-6 md:mt-7 lg:mx-8 lg:mt-9 lg:h-[110px]">
        <span className="font-mono text-[10px] tracking-wider text-ink-faint md:text-[11px]">
          <span className="md:hidden">ADVERTISEMENT · 336×100</span>
          <span className="hidden md:inline lg:hidden">ADVERTISEMENT · 728×90 LEADERBOARD</span>
          <span className="hidden lg:inline">ADVERTISEMENT · 970×110 LEADERBOARD</span>
        </span>
        <span className="mt-0.5 text-[11px] text-ink-faint md:mt-1 md:text-[11.5px] lg:mt-1 lg:text-xs">
          <span className="md:hidden">Google AdSense — in-feed</span>
          <span className="hidden md:inline lg:hidden">Google AdSense — คั่นระหว่างคอนเทนต์</span>
          <span className="hidden lg:inline">Google AdSense — คั่นระหว่างคอนเทนต์ ไม่แทรกกลางการอ่าน</span>
        </span>
      </div>

      {/* affiliate products */}
      <section className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11">
        <h2 className="m-0 mb-2.5 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
          รีวิว & แนะนำสินค้า<span className="hidden md:inline">สำหรับครู</span>
        </h2>
        <div className="mb-3.5 flex items-start gap-2 rounded-card-sm border border-[#FCE4CC] bg-[#FFF6ED] px-3 py-2.5 md:mb-4 lg:mb-[18px] lg:max-w-[760px]">
          <span className="flex-none text-[13px] leading-normal md:text-[14px] lg:text-[15px]">ⓘ</span>
          <p className="m-0 text-[11.5px] leading-relaxed text-[#8A5A28] md:text-xs lg:text-[12.5px]">
            <span className="md:hidden">
              ลิงก์ในหน้านี้เป็น <b>ลิงก์แนะนำ (Affiliate)</b> หากซื้อผ่านลิงก์
              khuncool อาจได้ค่าคอมมิชชันโดยราคาที่คุณจ่ายไม่เปลี่ยนแปลง
            </span>
            <span className="hidden md:inline lg:hidden">
              <b>การเปิดเผย:</b> ลิงก์สินค้าเป็นลิงก์แนะนำ (Affiliate) — khuncool
              อาจได้ค่าคอมมิชชันเมื่อซื้อผ่านลิงก์ โดยราคาไม่เปลี่ยนแปลง
            </span>
            <span className="hidden lg:inline">
              <b>การเปิดเผย:</b> ลิงก์สินค้าในหน้านี้เป็นลิงก์แนะนำ (Affiliate) —
              เมื่อคุณซื้อผ่านลิงก์ Shopee/Lazada ทาง khuncool
              อาจได้รับค่าคอมมิชชันเล็กน้อย โดยราคาที่คุณจ่ายไม่เปลี่ยนแปลง ·
              เราคัดสินค้าจากการใช้งานจริงของครู
            </span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3.5 lg:grid-cols-6 lg:gap-3">
          {PRODUCTS.map((p) => (
            <a
              key={p.href}
              href={p.href}
              target="_blank"
              rel="noopener sponsored"
              className="block overflow-hidden rounded-card-sm border border-border bg-surface-card text-inherit no-underline hover:shadow-[0_10px_24px_-10px_rgba(26,29,38,.16)] md:rounded-card"
            >
              <div className="relative aspect-square">
                <Image src={p.cover} alt={p.name} fill className="object-cover" />
              </div>
              <div className="p-2.5 md:p-3">
                <div className="mb-1.5 h-[33px] overflow-hidden text-xs font-semibold leading-snug md:text-[12.5px]">
                  {p.name}
                </div>
                <div className="mb-1.5 flex items-center gap-1 md:mb-2">
                  <span className="text-[11px] text-[#F59E0B] lg:text-[13px]">
                    <span className="lg:hidden">★</span>
                    <span className="hidden lg:inline">★★★★★</span>
                  </span>
                  <span className="text-[11px] text-ink-muted">{p.rating}</span>
                </div>
                <div className="mb-2 text-[15px] font-bold text-[#C2500B] md:text-base">
                  {p.price}
                </div>
                <span className="block w-full rounded-card-sm bg-[#F97316] py-2 text-center text-[11px] font-semibold text-white md:text-[11.5px]">
                  เช็กราคา<span className="hidden md:inline"> Shopee</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* apps */}
      <section className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11">
        <div className="mb-3 flex items-baseline justify-between md:mb-4 lg:mb-[18px]">
          <h2 className="m-0 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
            แอปช่วยงานครู<span className="hidden lg:inline"> · ใช้ผ่านเว็บได้เลย</span>
          </h2>
          <Link href="/apps" className="text-[12.5px] text-primary md:text-[13.5px] lg:text-sm">
            ทั้งหมด ›
          </Link>
        </div>
        <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3.5 lg:grid-cols-3 lg:gap-[18px]">
          {APPS.map((ap) => (
            <Link
              key={ap.href}
              href={ap.href}
              className="flex items-center gap-3 rounded-card-sm border border-border bg-surface-card p-3 text-inherit no-underline hover:border-primary/40 hover:shadow-[0_8px_20px_-10px_rgba(26,29,38,.14)] md:gap-3.5 md:rounded-card md:p-[15px] lg:gap-[14px] lg:p-[18px]"
            >
              <div
                className={`flex h-11 w-11 flex-none items-center justify-center rounded-card-sm text-xl ${ap.bg} md:h-12 md:w-12 md:rounded-card lg:h-[52px] lg:w-[52px] lg:text-2xl`}
              >
                {ap.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold md:text-[15px] lg:text-[15.5px]">
                  {ap.title}
                </div>
                <div className="text-[11.5px] text-ink-faint md:text-xs lg:text-[12.5px]">
                  {ap.sub}
                </div>
              </div>
              <span className="flex-none whitespace-nowrap rounded-pill bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success lg:px-[11px] lg:text-xs">
                เปิดใช้
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CookieConsent />
      <OfflineIndicator />
    </main>
  );
}
