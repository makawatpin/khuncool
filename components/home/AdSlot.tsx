/** Standalone in-feed / leaderboard ad placeholder between the tools and affiliate sections. */
export default function AdSlot() {
  return (
    <div className="mx-4 mt-5 flex h-[100px] flex-col items-center justify-center rounded-card border-[1.5px] border-dashed border-border-strong bg-surface-light md:mx-6 md:mt-7 lg:mx-8 lg:mt-9 lg:h-[110px]">
      <span className="font-mono text-[10px] tracking-wider text-ink-faint md:text-[11px]">
        <span className="md:hidden">ADVERTISEMENT · 336×100</span>
        <span className="hidden md:inline lg:hidden">
          ADVERTISEMENT · 728×90 LEADERBOARD
        </span>
        <span className="hidden lg:inline">
          ADVERTISEMENT · 970×110 LEADERBOARD
        </span>
      </span>
      <span className="mt-0.5 text-[11px] text-ink-faint md:mt-1 md:text-[11.5px] lg:mt-1 lg:text-xs">
        <span className="md:hidden">Google AdSense — in-feed</span>
        <span className="hidden md:inline lg:hidden">
          Google AdSense — คั่นระหว่างคอนเทนต์
        </span>
        <span className="hidden lg:inline">
          Google AdSense — คั่นระหว่างคอนเทนต์ ไม่แทรกกลางการอ่าน
        </span>
      </span>
    </div>
  );
}
