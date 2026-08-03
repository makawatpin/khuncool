"use client";

import { useState } from "react";
import { FAQS } from "./data";

export default function FaqAccordion() {
  const [open, setOpen] = useState(-1);
  return <div className="flex flex-col gap-2">{FAQS.map((item, index) => {
    const active = open === index;
    return <div key={item.q} className="overflow-hidden rounded-2xl border border-border bg-white">
      <button type="button" onClick={() => setOpen(active ? -1 : index)} className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-4 text-left font-sans hover:bg-surface-light">
        <span className="flex-1 text-sm font-semibold md:text-[15px]">{item.q}</span><span className="text-ink-faint">{active ? "−" : "+"}</span>
      </button>
      {active && <p className="m-0 px-4 pb-4 text-sm leading-7 text-ink-secondary">{item.a}</p>}
    </div>;
  })}</div>;
}
