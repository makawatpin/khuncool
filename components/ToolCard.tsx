import Link from "next/link";
import Image from "next/image";

type ToolCardProps = {
  href: string;
  icon: string;
  title: string;
  bg: string;
  image: string;
  /** Short copy shown on mobile (2-col grid). */
  short: string;
  /** Longer copy shown on desktop (3-col grid). */
  desc: string;
};

/** Repeating tool card used on the /tools hub, mobile-compact and desktop-rich variants in one component. */
export default function ToolCard({
  href,
  icon,
  title,
  bg,
  image,
  short,
  desc,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[118px] flex-col overflow-hidden rounded-[15px] border border-border bg-surface-card text-inherit no-underline transition hover:-translate-y-0.5 hover:border-[#C6C9FB] hover:shadow-md md:min-h-0 md:rounded-card-lg"
    >
      <div className="relative aspect-video overflow-hidden" style={{ background: bg }}>
        <Image
          src={image}
          alt={`ภาพประกอบเครื่องมือ ${title}`}
          fill
          sizes="(max-width: 767px) 50vw, 360px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
        />
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-3.5">
        <div className="mb-1.5 flex items-start gap-2">
          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-sm md:h-[30px] md:w-[30px] md:text-[15px]" style={{ background: bg }} aria-hidden="true">{icon}</span>
          <h2 className="m-0 pt-0.5 text-sm leading-snug md:text-base">{title}</h2>
        </div>
        <p className="mb-0 mt-auto text-[11.5px] leading-normal text-ink-secondary md:mt-1 md:flex-1 md:text-[12.5px] md:leading-relaxed">
          <span className="md:hidden">{short}</span>
          <span className="hidden md:inline">{desc}</span>
        </p>
        <div className="mt-2.5 hidden items-center justify-between gap-2 border-t border-border pt-2.5 md:flex">
          <span className="font-mono text-[10px] text-ink-faint">{href}</span>
          <span className="text-xs font-semibold text-primary">เปิดใช้งาน ›</span>
        </div>
      </div>
    </Link>
  );
}
