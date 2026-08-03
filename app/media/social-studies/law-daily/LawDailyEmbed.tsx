"use client";

import styles from "./LawDailyEmbed.module.css";

export default function LawDailyEmbed() {
  return (
    <div className={styles.shell}>
      <iframe
        className={styles.frame}
        src="/games/law-daily/index.html"
        title="เกมคดีเด็ด เมืองสันติสุข — กฎหมายในชีวิตประจำวัน"
        loading="eager"
        allow="fullscreen; autoplay"
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
}
