"use client";

import { useState } from "react";
import Link from "next/link";
import type { SubjectResource } from "./SubjectResourcePage";

export default function GamePlaceholderGrid({ games, accent, soft }: { games: SubjectResource[]; accent: string; soft: string }) {
  const categories = ["ทั้งหมด", ...Array.from(new Set(games.map((game) => game.type)))];
  const [active, setActive] = useState("ทั้งหมด");
  const visible = active === "ทั้งหมด" ? games : games.filter((game) => game.type === active);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" aria-label="กรองเกมตามหัวข้อ">
        {categories.map((category) => (
          <button key={category} type="button" onClick={() => setActive(category)} aria-pressed={active === category} className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors" style={active === category ? { color: "white", background: accent, borderColor: accent } : { color: "#4B5563", background: "white", borderColor: "#E1E4EA" }}>
            {category}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((game, index) => {
          const card = <article className="flex min-h-[230px] flex-col overflow-hidden rounded-2xl border border-border bg-white transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
            <div className="flex h-[88px] items-center justify-center text-3xl" style={{ background: soft }} aria-hidden="true">🎮</div>
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-md px-2 py-1 text-[10px] font-semibold" style={{ color: accent, background: soft }}>{game.type}</span>
                <span className={`text-[10px] font-semibold ${game.href ? "text-success" : "text-ink-faint"}`}>{game.href ? "เล่นได้แล้ว" : "เร็ว ๆ นี้"}</span>
              </div>
              <h3 className="m-0 text-base">{game.title || "รอชื่อเกม"}</h3>
              <p className="mb-3 mt-1.5 text-xs leading-5 text-ink-secondary">{game.description}</p>
              <p className="mt-auto border-t border-border pt-3 text-[11px] text-ink-faint">{game.grades}</p>
            </div>
          </article>;
          return game.href ? <Link key={`${game.type}-${index}`} href={game.href} className="text-inherit no-underline">{card}</Link> : <div key={`${game.type}-${index}`}>{card}</div>;
        })}
      </div>
    </>
  );
}
