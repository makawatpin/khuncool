// The home page's seasonal spotlight: one banner that changes with the
// calendar. Add an entry here to schedule a new one; outside every window the
// page shows DEFAULT_SPOTLIGHT.

export type Spotlight = {
  /** Small pill above the title, e.g. "ช่วงนี้ · ลอยกระทง". */
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string;
};

type Scheduled = Spotlight & {
  /** Inclusive month-day window, "MM-DD". `to` may be earlier than `from`
   *  for a window that crosses New Year. */
  from: string;
  to: string;
};

// Windows repeat every year and must not overlap. Loy Krathong follows the
// lunar calendar (late October to late November); the whole of November
// covers nearly every year without needing a date per year.
export const SEASONAL: Scheduled[] = [
  {
    from: "10-01",
    to: "10-31",
    kicker: "🎃 ช่วงนี้ · ฮาโลวีน",
    title: "Halloween Wordle ทายคำศัพท์ฮาโลวีน",
    text: "เกมทายคำภาษาอังกฤษธีมฮาโลวีน เล่นทั้งห้องได้จากจอเดียว",
    cta: "เล่นเลย",
    href: "/media/english/halloween-wordle",
    image: "/assets/game-covers/halloween-wordle.webp",
  },
  {
    from: "11-01",
    to: "11-30",
    kicker: "🏮 ช่วงนี้ · ลอยกระทง",
    title: "ลอยกระทงออนไลน์ ทำกระทง 3 มิติเอง",
    text: "ให้นักเรียนออกแบบกระทง แล้วบันทึกเป็นโปสเตอร์หรือวิดีโอ",
    cta: "ทำกระทงเลย",
    href: "/media/social-studies/krathong-designer",
    image: "/assets/loy-krathong-online-cover.webp",
  },
  {
    from: "12-01",
    to: "12-25",
    kicker: "🎄 ช่วงนี้ · คริสต์มาส",
    title: "Santa Sleigh ฝึกภาษาอังกฤษไปกับซานต้า",
    text: "เกมภาษาอังกฤษธีมคริสต์มาส เปิดเล่นหน้าชั้นได้ทันที",
    cta: "เล่นเลย",
    href: "/media/english/santa-sleigh",
    image: "/assets/game-covers/santa-sleigh.webp",
  },
  {
    from: "12-26",
    to: "01-05",
    kicker: "🎁 ช่วงนี้ · ปีใหม่",
    title: "สุ่มจับของขวัญปีใหม่ในห้องเรียน",
    text: "ใส่รายชื่อแล้วสุ่มจับคู่แลกของขวัญ ไม่มีใครจับได้ชื่อตัวเอง",
    cta: "เริ่มจับของขวัญ",
    href: "/gift-exchange",
    image: "/assets/tool-covers/gift-exchange.webp",
  },
];

export const DEFAULT_SPOTLIGHT: Spotlight = {
  kicker: "⭐ เครื่องมือแนะนำ",
  title: "วงล้อสุ่มชื่อนักเรียน",
  text: "ใส่รายชื่อทั้งห้องแล้วหมุนเลือกคนตอบ กันชื่อซ้ำได้ ไม่ต้องติดตั้ง",
  cta: "เปิดวงล้อสุ่ม",
  href: "/random-name-picker",
  image: "/assets/tool-covers/random-name-wheel.webp",
};

/** Today's month-day in Thailand, whatever timezone the server runs in. */
function bangkokMonthDay(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("month")}-${get("day")}`;
}

export function pickSpotlight(now: Date): Spotlight {
  const today = bangkokMonthDay(now);
  const hit = SEASONAL.find(({ from, to }) =>
    from <= to ? today >= from && today <= to : today >= from || today <= to,
  );
  return hit ?? DEFAULT_SPOTLIGHT;
}
