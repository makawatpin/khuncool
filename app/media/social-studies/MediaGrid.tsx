"use client";

import { useState } from "react";
import Link from "next/link";
import { MEDIA, TOPICS, type MediaTopic } from "./data";

export default function MediaGrid() {
  const [topic, setTopic] = useState<MediaTopic | "ทั้งหมด">("ทั้งหมด");
  const items = topic === "ทั้งหมด" ? MEDIA : MEDIA.filter((item) => item.topic === topic);

  return <div>
    <div className="mb-3 flex flex-wrap gap-[7px] md:gap-2">{TOPICS.map((item) => {
      const active = topic === item;
      return <button key={item} type="button" onClick={() => setTopic(item)} className={`cursor-pointer rounded-pill border px-3.5 py-2 text-[12.5px] font-semibold md:px-[17px] md:py-[9px] md:text-[13.5px] ${active ? "border-primary bg-primary text-white" : "border-border bg-white text-ink-secondary hover:bg-surface-light"}`}>{item}</button>;
    })}</div>
    <div className="grid grid-cols-2 gap-[9px] md:grid-cols-4 md:gap-3">{items.map((item) => <Link href={item.href} key={item.title} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card text-inherit no-underline hover:border-[#C6C9FB] hover:bg-[#FBFBFE]">
      <div className="flex h-[66px] items-center justify-center text-[26px] md:h-[88px] md:text-[32px]" style={{ background: item.bg }}>{item.icon}</div>
      <div className="flex flex-1 flex-col p-[10px_11px_11px] md:p-[11px_12px_12px]">
        <div className="mb-[5px] flex flex-wrap gap-[5px]"><span className="rounded-[6px] bg-[#EEEEFD] px-[6px] py-[2px] text-[10px] font-semibold text-primary">{item.topic}</span><span className="rounded-[6px] bg-success-bg px-[6px] py-[2px] text-[10px] font-semibold text-success">{item.status}</span></div>
        <h3 className="m-0 mb-[3px] text-[13.5px] leading-[1.35] md:text-[15px]">{item.title}</h3>
        <p className="m-0 mb-2 text-[11.5px] leading-[1.5] text-ink-secondary md:text-xs">{item.short}</p>
        <div className="mt-auto flex gap-2.5 text-[10.5px] text-ink-faint md:border-t md:border-[#F1F2F6] md:pt-[9px]"><span>{item.grade}</span><span className="hidden md:inline">{item.time}</span></div>
      </div>
    </Link>)}</div>
  </div>;
}
