"use client";

import Link from "next/link";
import { useState } from "react";
import { MEDIA, SKILLS, type MediaSkill } from "./data";

/** Skill-filter chips + media grid for the /media/english hub. */
export default function MediaGrid() {
  const [skill, setSkill] = useState<MediaSkill | "ทั้งหมด">("ทั้งหมด");
  const items = skill === "ทั้งหมด" ? MEDIA : MEDIA.filter((m) => m.skill === skill);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-[7px] md:mb-3 md:gap-2">
        {SKILLS.map((s) => {
          const on = skill === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSkill(s)}
              className={`cursor-pointer rounded-pill border px-3.5 py-2 text-[12.5px] font-semibold md:px-[17px] md:py-[9px] md:text-[13.5px] ${
                on
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-ink-secondary hover:bg-surface-light"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-[9px] md:grid-cols-4 md:gap-3">
        {items.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-card text-inherit no-underline hover:border-[#C6C9FB] hover:bg-[#FBFBFE]"
          >
            <div
              className="flex h-[66px] items-center justify-center text-[26px] md:h-[88px] md:text-[32px]"
              style={{ background: m.bg }}
            >
              {m.icon}
            </div>
            <div className="flex flex-1 flex-col p-[10px_11px_11px] md:p-[11px_12px_12px]">
              <div className="mb-[5px] flex flex-wrap items-center gap-[5px] md:mb-1.5">
                <span className="rounded-[6px] bg-[#EEEEFD] px-[6px] py-[2px] text-[10px] font-semibold text-primary md:px-[7px] md:text-[10.5px]">
                  {m.skill}
                </span>
              </div>
              <h3 className="m-0 mb-[3px] text-[13.5px] leading-[1.35] md:text-[15px]">
                {m.title}
              </h3>
              <p className="m-0 mb-2 text-[11.5px] leading-[1.5] text-ink-secondary md:mb-2.5 md:text-xs md:leading-[1.55]">
                {m.short}
              </p>
              <div className="mt-auto flex gap-2.5 text-[10.5px] text-ink-faint md:border-t md:border-[#F1F2F6] md:pt-[9px]">
                <span>{m.grade}</span>
                <span className="hidden md:inline">{m.time}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
