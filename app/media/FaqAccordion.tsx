"use client";

import { useState } from "react";
import { FAQS } from "./data";

/** Expand/collapse FAQ list used on the /media hub. */
export default function FaqAccordion() {
  const [open, setOpen] = useState<number>(-1);

  return (
    <div className="flex flex-col gap-2 md:gap-[9px]">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="overflow-hidden rounded-2xl border border-border bg-surface-card md:rounded-[15px]"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent p-[13px] text-left font-sans hover:bg-surface-light md:gap-3 md:p-[15px_17px]"
            >
              <span className="flex-1 text-[13.5px] font-semibold leading-snug md:text-[15px]">
                {f.q}
              </span>
              <span className="flex-none text-[15px] text-ink-faint md:text-base">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className="m-0 px-[13px] pb-[14px] text-[13px] leading-relaxed text-ink-secondary md:px-[17px] md:pb-4 md:text-sm md:leading-[1.75]">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
