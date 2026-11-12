"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const POSTER = "/assets/home/duck-race-hero-poster.webp";
const CLIP = "/assets/home/duck-race-hero.mp4";

/**
 * A silent, looping recording of the real duck race.
 *
 * The poster is a normal priority image, so it is the page's LCP and paints
 * without waiting for the 0.7 MB clip. The clip is only fetched after
 * hydration, and not at all for visitors who asked for reduced motion or
 * data saving; they keep the still poster.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduced || saveData) return;
    video.src = CLIP;
    video.play().catch(() => {});
  }, []);

  return (
    <>
      <Image
        src={POSTER}
        alt="เกมเป็ดสุ่มชื่อ เป็ดบนสเก็ตบอร์ดกำลังแข่งเข้าเส้นชัย"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 560px"
        className="object-cover"
      />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
