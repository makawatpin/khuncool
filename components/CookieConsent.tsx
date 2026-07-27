"use client";

import { useState } from "react";

/**
 * PDPA cookie-consent banner, ported from screens/Home.dc.html.
 * Copy/layout differs per breakpoint in the source:
 *  - mobile   (~lines 241-249): stacked full-width buttons, accept button first
 *  - tablet   (~lines 472-481): 🍪 emoji + inline row, "เฉพาะที่จำเป็น" first
 *  - desktop  (~lines 715-724): 🍪 emoji + inline row, longer copy
 *
 * NOTE: this currently lives on the home page only (Task 5 scope). It is a
 * site-wide compliance concern, so it likely belongs in the root layout /
 * app shell once a later task revisits Header/Footer — flagging here rather
 * than silently leaving it out.
 */
export default function CookieConsent() {
  const [accepted, setAccepted] = useState(false);

  if (accepted) return null;

  return (
    <div className="sticky bottom-0 z-[25] mx-2.5 mb-2.5 rounded-card-sm bg-ink text-white shadow-device-frame md:mx-4 md:mb-4 md:flex md:items-center md:gap-4 md:rounded-card md:px-5 md:py-[15px] lg:mx-5 lg:mb-[18px] lg:gap-5 lg:px-6 lg:py-[18px]">
      <div className="p-3.5 pb-0 md:hidden">
        <p className="m-0 mb-[11px] text-xs leading-relaxed text-[#D8DBE2]">
          เราใช้คุกกี้เพื่อให้เว็บใช้งานได้ดีขึ้น วิเคราะห์ทราฟฟิก
          และแสดงโฆษณาตามความสนใจ ตาม{" "}
          <span className="cursor-pointer underline">
            นโยบายความเป็นส่วนตัว (PDPA)
          </span>
        </p>
      </div>

      <span className="hidden flex-none text-2xl md:block lg:text-[24px]">
        🍪
      </span>

      <p className="m-0 hidden flex-1 text-[12.5px] leading-relaxed text-[#D8DBE2] md:block lg:text-[13px]">
        <span className="lg:hidden">
          เราใช้คุกกี้เพื่อการใช้งานที่ดีขึ้น วิเคราะห์ทราฟฟิก
          และแสดงโฆษณาตามความสนใจ ตาม{" "}
        </span>
        <span className="hidden lg:inline">
          เราใช้คุกกี้เพื่อให้เว็บใช้งานได้ดีขึ้น วิเคราะห์ทราฟฟิก
          และแสดงโฆษณา/คอนเทนต์ตามความสนใจ เราเคารพข้อมูลส่วนบุคคลตาม{" "}
        </span>
        <span className="cursor-pointer underline">
          นโยบายความเป็นส่วนตัว (PDPA)
        </span>
      </p>

      <div className="flex gap-2 p-3.5 pt-0 md:flex-none md:gap-2.5 md:p-0 lg:gap-[10px]">
        <button
          type="button"
          onClick={() => setAccepted(true)}
          className="order-1 flex-1 whitespace-nowrap rounded-[9px] bg-primary py-2.5 text-[12.5px] font-semibold text-white hover:bg-primary-hover md:order-2 md:flex-none md:rounded-[10px] md:px-[18px] md:py-2.5 md:text-[13px] lg:px-[22px] lg:py-2.5"
        >
          ยอมรับทั้งหมด
        </button>
        <button
          type="button"
          onClick={() => setAccepted(true)}
          className="order-2 flex-1 whitespace-nowrap rounded-[9px] border border-white/30 bg-transparent py-2.5 text-[12.5px] font-semibold text-white hover:bg-white/10 md:order-1 md:flex-none md:rounded-[10px] md:px-[15px] md:py-2.5 md:text-[13px] lg:px-[18px] lg:py-2.5"
        >
          เฉพาะที่จำเป็น
        </button>
      </div>
    </div>
  );
}
