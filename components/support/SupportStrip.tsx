"use client";

import { useEffect, useRef, useState } from "react";
import { trackToolEvent } from "@/lib/trackToolEvent";
import { isAlreadyInView } from "@/lib/support/stripMotion";
import CoffeeCup from "./CoffeeCup";
import { useRaceBusy } from "./RaceStateProvider";
import { useSupportSheet } from "./SupportSheet";
import styles from "./SupportStrip.module.css";

const CUP = 76;

/** The เลี้ยงกาแฟ strip. No close button and no "seen" memory: the owner
 *  chose for it to stay (spec §4). Never put this on the race winner card. */
export default function SupportStrip() {
  const { openSupportSheet } = useSupportSheet();
  const busy = useRaceBusy();
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  // Set once the observer is watching a strip that starts off screen: only
  // then is it safe to hide it until its pop-in plays. A strip already on
  // screen at mount (top of /support, short pages) was painted visible by the
  // server and stays that way; hiding it now would read as a blink. Without
  // JS or an observer it simply shows.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (!isAlreadyInView(el.getBoundingClientRect(), window.innerHeight)) setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          trackToolEvent("support-strip", "view");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const motion = [styles.strip, armed && styles.armed, seen && styles.play, busy && styles.still]
    .filter(Boolean)
    .join(" ");

  return (
    // Top padding leaves room for the smoke, which rises above the strip.
    <section aria-label="สนับสนุน khuncool" className="pt-[46px]">
      <div
        ref={ref}
        className={`${motion} flex items-center gap-[15px] rounded-card bg-[#3F41C9] py-2.5 pl-3.5 pr-3`}
      >
        <span
          className="relative h-[46px] flex-none overflow-visible"
          style={{ width: CUP * 0.62 }}
        >
          <CoffeeCup
            className="absolute left-1/2 block -translate-x-1/2"
            // Larger than its slot and anchored low, so the strip stays two
            // lines tall and the smoke overflows upward.
            style={{ width: CUP, height: CUP, bottom: CUP * -0.05 }}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-anuphan text-[13.5px] font-semibold leading-snug text-white">
            เว็บนี้ฟรี เพราะมีคนช่วยค่าเซิร์ฟเวอร์
          </span>
          <span className="block text-[11.5px] leading-normal text-white/90">
            เลี้ยงกาแฟคุณคูลสักแก้วไหม
          </span>
        </span>
        <button
          type="button"
          onClick={openSupportSheet}
          className="flex-none whitespace-nowrap rounded-pill bg-white px-[15px] py-2 font-anuphan text-[13px] font-semibold text-[#3F41C9] shadow-[0_6px_16px_-6px_rgba(12,13,56,.55)] transition-colors hover:bg-[#ECECFB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          เลี้ยงกาแฟ
        </button>
      </div>
    </section>
  );
}
