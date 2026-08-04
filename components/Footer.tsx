import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { t: "เครื่องมือออนไลน์", href: "/tools" },
  { t: "แอปช่วยงานครู", href: "/apps" },
  { t: "บทความครู", href: "/articles" },
  { t: "ร้านค้าแนะนำ", href: "/shop" },
  { t: "เกี่ยวกับเรา", href: "/about" },
  { t: "ติดต่อเรา", href: "/about#contact" },
  { t: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-light px-4 pb-[30px] pt-6">
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-3.5 flex items-center gap-2">
          <Image
            src="/assets/khuncool-logo.webp"
            alt="khuncool"
            width={26}
            height={26}
            className="flex-none object-contain"
          />
          <span className="font-anuphan text-[15px] font-bold">khuncool</span>
        </div>
        <div className="mb-3.5 flex flex-wrap gap-x-[18px] gap-y-2">
          {FOOTER_LINKS.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="text-[12.5px] text-ink-secondary no-underline hover:text-primary"
            >
              {f.t}
            </Link>
          ))}
        </div>
        <div className="text-[11px] text-ink-faint">
          © 2568 khuncool.com · เพื่อครูไทยทุกคน
        </div>
      </div>
    </footer>
  );
}
