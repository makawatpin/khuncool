import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/app/articles/data";

type Props = {
  article: Article & { bg: string; color: string };
  variant?: "featured" | "list";
};

export default function ArticleCard({ article: a, variant = "list" }: Props) {
  if (variant === "featured") {
    return (
      <Link
        href={a.href}
        className="block overflow-hidden rounded-2xl border border-border bg-surface-card text-inherit no-underline hover:border-[#C6C9FB] md:grid md:grid-cols-2 md:rounded-[20px]"
      >
        <Image
          src={a.img}
          alt={a.alt}
          width={640}
          height={360}
          className="block aspect-video w-full bg-[#F1F3F6] object-contain object-top md:aspect-auto md:h-full md:min-h-[280px]"
        />
        <div className="p-3.5 md:flex md:flex-col md:justify-center md:p-8">
          <div className="mb-2 flex items-center gap-2 md:mb-3 md:gap-[9px]">
            <span
              className="rounded-pill px-2.5 py-1 text-[11px] font-bold md:px-[11px] md:py-[5px] md:text-xs"
              style={{ background: a.bg, color: a.color }}
            >
              {a.cat}
            </span>
            <span className="text-[11px] text-ink-faint md:text-[12.5px]">
              {a.date}
            </span>
          </div>
          <h2 className="m-0 mb-1.5 text-[17px] leading-[1.4] md:mb-3 md:text-2xl md:leading-[1.3]">
            {a.title}
          </h2>
          <p className="m-0 text-[12.5px] leading-[1.6] text-ink-secondary md:mb-4 md:text-[15px] md:leading-[1.75]">
            {a.excerpt}
          </p>
          <span className="hidden text-sm font-bold text-primary md:inline">
            อ่านบทความ ›
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={a.href}
      className="flex gap-3 overflow-hidden rounded-[14px] border border-border bg-surface-card p-2.5 text-inherit no-underline hover:border-[#C6C9FB] md:flex-col md:rounded-[18px] md:p-0 md:hover:shadow-[0_12px_28px_-10px_rgba(26,29,38,.16)]"
    >
      <Image
        src={a.img}
        alt={a.alt}
        width={170}
        height={170}
        className="aspect-video h-24 w-auto flex-none rounded-[10px] bg-[#F1F3F6] object-contain object-top md:h-auto md:w-full md:rounded-none"
      />
      <div className="min-w-0 flex-1 md:flex md:flex-1 md:flex-col md:p-4">
        <div className="mb-[5px] flex items-center gap-1.5 md:mb-2">
          <span
            className="rounded-pill px-2 py-[3px] text-[10.5px] font-bold md:px-[9px] md:py-1 md:text-[11px]"
            style={{ background: a.bg, color: a.color }}
          >
            {a.cat}
          </span>
        </div>
        <h3 className="m-0 mb-1 text-sm leading-[1.4] md:mb-2 md:flex-1 md:text-[16.5px]">
          {a.title}
        </h3>
        <div className="text-[11px] text-ink-faint md:text-xs">
          {a.date} · อ่าน {a.readTime}
        </div>
      </div>
    </Link>
  );
}
