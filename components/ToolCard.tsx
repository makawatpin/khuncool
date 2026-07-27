import Link from "next/link";

type ToolCardProps = {
  href: string;
  icon: string;
  title: string;
  bg: string;
  /** Short copy shown on mobile (2-col grid). */
  short: string;
  /** Longer copy shown on desktop (3-col grid). */
  desc: string;
  /** Slug shown in mono font on the desktop card only. */
  slug: string;
};

/** Repeating tool card used on the /tools hub, mobile-compact and desktop-rich variants in one component. */
export default function ToolCard({
  href,
  icon,
  title,
  bg,
  short,
  desc,
  slug,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[118px] flex-col gap-2 rounded-[15px] border border-border bg-surface-card p-3 text-inherit no-underline hover:border-[#C6C9FB] hover:bg-[#FBFBFE] md:min-h-0 md:gap-0 md:rounded-card-lg md:p-5"
    >
      <div
        className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-lg md:mb-[13px] md:h-[50px] md:w-[50px] md:rounded-[15px] md:text-2xl"
        style={{ background: bg }}
      >
        {icon}
      </div>
      <h2 className="m-0 text-sm leading-snug md:mb-1.5 md:text-lg">
        {title}
      </h2>
      <p className="mt-auto mb-0 text-[11.5px] leading-normal text-ink-secondary md:mb-3 md:mt-0 md:flex-1 md:text-[13.5px] md:leading-relaxed">
        <span className="md:hidden">{short}</span>
        <span className="hidden md:inline">{desc}</span>
      </p>
      <div className="hidden items-center justify-between gap-2 md:flex">
        <span className="font-mono text-[11px] text-ink-faint">{slug}</span>
        <span className="text-[13px] font-semibold text-primary">
          เปิดใช้งาน ›
        </span>
      </div>
    </Link>
  );
}
