import type { CSSProperties } from "react";
import Image from "next/image";
import { HERO_MOCKUP_PAIRS, type HeroMockupTool } from "@/components/home/heroToolsMockupData";

const CYCLE_SECONDS = 8;
const PAIR_COUNT = HERO_MOCKUP_PAIRS.length;

function ToolFace({ tool }: { tool: HeroMockupTool }) {
  switch (tool.kind) {
    case "wheel":
      return (
        <>
          <div className="relative mx-auto mb-2 h-[92px] w-[92px]">
            <div className="absolute left-1/2 top-[-4px] z-[1] h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1A1D26]" />
            <div className="h-full w-full rounded-full border-[6px] border-[#1A1D26] p-0.5 shadow-[0_2px_6px_rgba(0,0,0,.2)]">
              <div className="relative h-full w-full animate-hero-spin rounded-full bg-[conic-gradient(#5C5EE6_0deg_45deg,#14B79A_45deg_90deg,#F97316_90deg_135deg,#3D38B4_135deg_180deg,#0A9380_180deg_225deg,#E0A400_225deg_270deg,#8B7BF0_270deg_315deg,#22B8A0_315deg_360deg)]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white/80"
                    style={{ transform: `rotate(${i * 45}deg) translate(0, -38px)` }}
                  />
                ))}
                <div className="absolute left-1/2 top-1/2 flex h-[32px] w-[32px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.12)]">
                  <span className="font-anuphan text-[13px] font-bold text-primary">k</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[10.5px] text-ink-secondary">
            🎉 <b className="text-ink">สมชาย ใจดี</b>
          </p>
        </>
      );
    case "groups":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">แบ่งกลุ่ม · 4 กลุ่ม</p>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-[#E1E3FD] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 1 <span className="text-ink-secondary/70">7 คน</span>
            </div>
            <div className="rounded-lg bg-[#D0FBEF] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 2 <span className="text-ink-secondary/70">7 คน</span>
            </div>
            <div className="rounded-lg bg-[#FFEAD5] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 3 <span className="text-ink-secondary/70">6 คน</span>
            </div>
            <div className="rounded-lg bg-[#E1E3FD] px-2 py-1.5 text-[9.5px] font-semibold text-ink-secondary">
              กลุ่ม 4 <span className="text-ink-secondary/70">6 คน</span>
            </div>
          </div>
        </>
      );
    case "meter":
      return (
        <>
          <p className="mb-1.5 text-[11px] font-bold text-ink">ระดับเสียงในห้อง</p>
          <div className="relative mx-auto h-[46px] w-[92px] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[92px] w-[92px] rounded-full bg-[conic-gradient(from_180deg,#22C55E_0deg,#EAB308_90deg,#EF4444_180deg,transparent_180deg_360deg)]" />
            <div className="absolute inset-x-0 top-[8px] h-[76px] w-[76px] rounded-full bg-white" style={{ left: 8 }} />
            <div
              className="absolute bottom-0 left-1/2 h-[36px] w-[2.5px] origin-bottom animate-hero-needle rounded-full bg-[#1A1D26]"
              style={{ marginLeft: "-1.25px" }}
            />
            <div className="absolute bottom-[-3px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-[#1A1D26]" />
          </div>
          <div className="mt-1.5 flex h-[20px] items-end justify-center gap-[3px]">
            {[40, 70, 100, 55, 85, 45, 65].map((h, i) => (
              <div
                key={i}
                className="w-[3px] animate-hero-wavebar rounded-full bg-[#14B79A]"
                style={{ animationDelay: `${i * 0.12}s`, "--wave-h": `${h}%` } as CSSProperties}
              />
            ))}
          </div>
          <p className="mt-1 text-center text-[10.5px] text-ink-secondary">ระดับ: ปานกลาง</p>
        </>
      );
    case "familyTree":
      return (
        <>
          <p className="mb-1.5 text-[11px] font-bold text-ink">Family Tree Explorer 🌳</p>
          <div className="relative mx-auto h-[74px] w-[168px]">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 168 74"
              fill="none"
            >
              <path
                d="M42 12 V26 H126 V12 M84 26 V38 M42 38 V50 M126 38 V50"
                stroke="#B8C0D9"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </svg>
            <div className="absolute left-[26px] top-0 flex h-[20px] w-[32px] items-center justify-center rounded-md border border-border-strong/60 bg-white text-[9px] text-ink-secondary/60">?</div>
            <div className="absolute left-[110px] top-0 flex h-[20px] w-[32px] items-center justify-center rounded-md border border-border-strong/60 bg-white text-[9px] text-ink-secondary/60">?</div>
            <div className="absolute left-[68px] top-[26px] flex h-[20px] w-[32px] items-center justify-center rounded-md bg-[#FFEAD5] text-[9px] font-semibold text-ink-secondary">Dad</div>
            <div className="absolute left-[26px] top-[50px] flex h-[20px] w-[32px] items-center justify-center rounded-md border border-border-strong/60 bg-white text-[9px] text-ink-secondary/60">?</div>
            <div className="absolute left-[68px] top-[50px] flex h-[20px] w-[32px] items-center justify-center rounded-md bg-primary text-[9px] font-semibold text-white">Me</div>
            <div className="absolute left-[110px] top-[50px] flex h-[20px] w-[32px] items-center justify-center rounded-md border border-border-strong/60 bg-white text-[9px] text-ink-secondary/60">?</div>
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className="rounded-full bg-[#D0FBEF] px-2 py-[3px] text-[9px] font-semibold text-ink-secondary">Mom</span>
            <span className="rounded-full bg-[#E1E3FD] px-2 py-[3px] text-[9px] font-semibold text-ink-secondary">Grandma</span>
          </div>
        </>
      );
    case "duckRace":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">เกมเป็ดสุ่มชื่อ</p>
          <div
            className="relative flex items-end justify-between gap-1 overflow-hidden rounded-xl px-2 pt-2"
            style={{ background: "linear-gradient(180deg, #BFEFFF 0%, #D0FBEF 55%, #FFEAD5 100%)" }}
          >
            <div className="absolute inset-x-0 bottom-0 h-[14px] bg-[#F7C873]" />
            <div className="absolute inset-x-0 bottom-[6px] h-[2px] bg-[repeating-linear-gradient(90deg,#fff_0_6px,transparent_6px_12px)]" />
            <Image src="/assets/duck-race/duck2.png" alt="" width={40} height={65} className="relative z-[1] h-[52px] w-auto -translate-y-1" />
            <Image src="/assets/duck-race/duck1.png" alt="" width={40} height={65} className="relative z-[1] h-[62px] w-auto" />
            <Image src="/assets/duck-race/duck3.png" alt="" width={40} height={65} className="relative z-[1] h-[46px] w-auto translate-y-1.5" />
          </div>
          <p className="mt-1.5 text-center text-[10.5px] text-ink-secondary">
            🏁 <b className="text-ink">น้องพลอย ถึงก่อน!</b>
          </p>
        </>
      );
    case "scoreboard":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">กระดานคะแนนกลุ่ม</p>
          <div className="flex flex-col gap-1 text-[9.5px] font-semibold text-ink-secondary">
            <div className="flex justify-between rounded-lg bg-[#E1E3FD] px-2 py-1">
              <span>กลุ่ม 1</span><span>120</span>
            </div>
            <div className="flex justify-between rounded-lg bg-[#D0FBEF] px-2 py-1">
              <span>กลุ่ม 2</span><span>95</span>
            </div>
          </div>
        </>
      );
    case "timer":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">จับเวลา</p>
          <p className="text-center font-anuphan text-[26px] font-bold text-ink">05:00</p>
        </>
      );
    case "attendance":
      return (
        <>
          <p className="mb-2 text-[11px] font-bold text-ink">เช็กชื่อนักเรียน</p>
          <div className="flex flex-col gap-1 text-[9.5px] font-semibold text-ink-secondary">
            <div className="flex justify-between">
              <span>สมชาย ใจดี</span><span>✅</span>
            </div>
            <div className="flex justify-between">
              <span>สมหญิง สายใจ</span><span>✅</span>
            </div>
          </div>
        </>
      );
  }
}

function Window({
  role,
  tool,
  pairIndex,
}: {
  role: "primary" | "secondary";
  tool: HeroMockupTool;
  pairIndex: number;
}) {
  return (
    <div
      key={pairIndex}
      className={
        role === "primary"
          ? "absolute left-[6%] top-[14%] z-[2] w-[190px] animate-hero-float-a rounded-2xl bg-white p-3 shadow-[0_14px_32px_rgba(30,20,90,.16)]"
          : "absolute left-[42%] top-[46%] z-[1] w-[190px] animate-hero-float-b rounded-2xl bg-white p-3 shadow-[0_14px_32px_rgba(30,20,90,.16)]"
      }
      style={{ animationDelay: role === "secondary" ? "0.3s" : undefined }}
    >
      <div className="mb-2 flex items-center gap-1.5 border-b border-border-strong/40 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF9E9E]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FFD08A]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#9AE6B4]" />
      </div>
      <ToolFace tool={tool} />
    </div>
  );
}

export default function HeroToolsMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden h-[300px] w-full max-w-[420px] overflow-hidden rounded-[20px] lg:block"
    >
      <span className="pointer-events-none absolute left-3 top-3 z-[3] rounded-full border border-border-strong/60 bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm">
        สลับอัตโนมัติ
      </span>
      {HERO_MOCKUP_PAIRS.map((pair, i) => (
        <div
          key={i}
          className="absolute inset-0 animate-hero-pair-cycle opacity-0"
          style={{ animationDelay: `${i * CYCLE_SECONDS}s` }}
        >
          <Window role="primary" tool={pair.primary} pairIndex={i} />
          <Window role="secondary" tool={pair.secondary} pairIndex={i} />
        </div>
      ))}
      <style>{`
        @keyframes hero-float-a { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes hero-float-b { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes hero-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hero-needle {
          0%, 100% { transform: rotate(-55deg); }
          50% { transform: rotate(55deg); }
        }
        @keyframes hero-wavebar {
          0%, 100% { height: 20%; }
          50% { height: var(--wave-h); }
        }
        @keyframes hero-pair-cycle {
          0% { opacity: 0; }
          3% { opacity: 1; }
          ${100 / PAIR_COUNT - 3}% { opacity: 1; }
          ${100 / PAIR_COUNT}% { opacity: 0; }
          100% { opacity: 0; }
        }
        .animate-hero-float-a { animation: hero-float-a 4s ease-in-out infinite; }
        .animate-hero-float-b { animation: hero-float-b 4.4s ease-in-out infinite; }
        .animate-hero-spin { animation: hero-spin 6s linear infinite; }
        .animate-hero-needle { animation: hero-needle 2.6s ease-in-out infinite; }
        .animate-hero-wavebar { animation: hero-wavebar 1.1s ease-in-out infinite; }
        .animate-hero-pair-cycle {
          animation: hero-pair-cycle ${CYCLE_SECONDS * PAIR_COUNT}s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-hero-float-a, .animate-hero-float-b, .animate-hero-spin,
          .animate-hero-needle, .animate-hero-wavebar {
            animation: none;
          }
          .animate-hero-pair-cycle {
            animation: none;
            opacity: 0;
          }
          .animate-hero-pair-cycle:first-child {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
