import Image from "next/image";
import { PRODUCTS } from "./data";

export default function AffiliateProductsSection() {
  return (
    <section className="px-4 pb-1 pt-6 md:px-6 md:pt-[34px] lg:px-8 lg:pt-11">
      <h2 className="m-0 mb-2.5 whitespace-nowrap text-[17px] font-bold md:text-[19px] lg:text-xl">
        รีวิว & แนะนำสินค้า<span className="hidden md:inline">สำหรับครู</span>
      </h2>
      <div className="mb-3.5 flex items-start gap-2 rounded-card-sm border border-[#FCE4CC] bg-[#FFF6ED] px-3 py-2.5 md:mb-4 lg:mb-[18px] lg:max-w-[760px]">
        <span className="flex-none text-[13px] leading-normal md:text-[14px] lg:text-[15px]">
          ⓘ
        </span>
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
  );
}
