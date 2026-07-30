import Link from "next/link";
import type { Product } from "@/app/shop/data";

type Props = {
  product: Product;
};

export default function ProductCard({ product: p }: Props) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[13px] border border-border bg-surface-card md:rounded-2xl md:hover:border-[#C6C9FB] md:hover:shadow-[0_10px_22px_-10px_rgba(26,29,38,.16)]">
      {p.badge && (
        <span className="absolute left-[6px] top-[6px] z-[2] rounded-full bg-[rgba(26,29,38,.75)] px-[7px] py-[3px] text-[9px] font-bold text-white backdrop-blur-sm md:left-[7px] md:top-[7px]">
          {p.badge}
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.img}
        alt={p.alt}
        className="block aspect-square w-full bg-[#F1F3F6] object-cover"
      />
      <div className="flex flex-1 flex-col p-[9px_10px_11px] md:p-[10px_11px_12px]">
        <div className="mb-0.5 text-[10px] font-semibold text-success">
          {p.cat}
        </div>
        <h3 className="m-0 mb-1 text-[12.5px] leading-[1.35] md:mb-[5px] md:flex-1">
          {p.title}
        </h3>
        <div className="mb-1.5 flex items-center gap-[5px]">
          <span className="text-[10.5px] text-[#F59E0B] md:text-[11px]">
            ★★★★★
          </span>
          <span className="text-[10px] text-ink-faint">{p.rating}</span>
        </div>
        <div className="mb-2">
          <span className="text-[15px] font-bold text-[#C2500B]">
            {p.price}
          </span>{" "}
          <span className="text-[10.5px] text-[#A9B0BE] line-through">
            {p.oldPrice}
          </span>
        </div>
        <a
          href={p.buyHref}
          rel="sponsored"
          className="block rounded-lg border-none bg-[#F97316] p-[7px] text-center text-[11.5px] font-bold text-white no-underline hover:bg-[#EA6A0C] hover:text-white"
        >
          ดูราคา ›
        </a>
        {p.reviewHref && (
          <Link
            href={p.reviewHref}
            className="mt-1.5 block p-1.5 text-center text-[11px] font-semibold text-ink-secondary no-underline"
          >
            อ่านรีวิว
          </Link>
        )}
      </div>
    </div>
  );
}
