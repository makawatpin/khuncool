"use client";

import { useState } from "react";
import Link from "next/link";
import { MEDIA, SKILLS, type ComputerSkill } from "./data";

export default function MediaGrid() {
  const [skill, setSkill] = useState<ComputerSkill | "ทั้งหมด">("ทั้งหมด");
  const items = skill === "ทั้งหมด" ? MEDIA : MEDIA.filter((item) => item.skill === skill);

  return <div>
    <div className="mb-3 flex flex-wrap gap-[7px] md:gap-2" role="group" aria-label="กรองสื่อตามทักษะ">
      {SKILLS.map((item) => {
        const active = skill === item;
        return <button key={item} type="button" onClick={() => setSkill(item)} aria-pressed={active} className={`cursor-pointer rounded-pill border px-3.5 py-2 text-[12.5px] font-semibold md:px-[17px] md:py-[9px] md:text-[13.5px] ${active ? "border-primary bg-primary text-white" : "border-border bg-white text-ink-secondary hover:bg-surface-light"}`}>{item}</button>;
      })}
    </div>
    {items.length > 0 ? <div className="grid grid-cols-2 gap-[9px] md:grid-cols-4 md:gap-3">
      {items.map((item) => { const content = <>
        <div className="flex h-[72px] items-center justify-center text-[30px] md:h-[96px] md:text-[38px]" style={{ background: item.bg }}>{item.icon}</div>
        <div className="flex flex-1 flex-col p-[10px_11px_12px] md:p-[12px_13px_13px]">
          <div className="mb-[6px] flex flex-wrap gap-[5px]"><span className="rounded-[6px] bg-[#EEEEFD] px-[6px] py-[2px] text-[10px] font-semibold text-primary">{item.skill}</span><span className="rounded-[6px] bg-[#FFF3CC] px-[6px] py-[2px] text-[10px] font-semibold text-[#8A6A00]">{item.status}</span></div>
          <h3 className="m-0 mb-[4px] text-[13.5px] leading-[1.35] md:text-[15px]">{item.title}</h3>
          <p className="m-0 mb-2 text-[11.5px] leading-[1.55] text-ink-secondary md:text-xs">{item.short}</p>
          <div className="mt-auto flex gap-2.5 text-[10.5px] text-ink-faint md:border-t md:border-[#F1F2F6] md:pt-[9px]"><span>{item.grade}</span><span className="hidden md:inline">{item.time}</span></div>
        </div>
      </>; return item.href ? <Link href={item.href} key={item.title} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card text-inherit no-underline hover:border-[#C6C9FB]">{content}</Link> : <article key={item.title} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card">{content}</article>; })}
    </div> : <div className="rounded-2xl border border-dashed border-border bg-surface-light px-5 py-8 text-center text-sm text-ink-secondary">กำลังวางแผนสื่อในทักษะนี้</div>}
  </div>;
}
