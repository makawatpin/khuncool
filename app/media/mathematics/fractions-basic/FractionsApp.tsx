"use client";

import Link from "next/link";
import { useState } from "react";
import { KcSfx, hoverSfxDelegate } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import Mascot from "./components/Mascot";
import type { Screen } from "./types";
import styles from "./FractionsApp.module.css";

const HOME_CARDS: { screen: Screen; icon: string; title: string; desc: string }[] = [
  { screen: "lesson", icon: "📖", title: "บทเรียน", desc: "รู้จักเศษส่วนจากภาพ 5 สไลด์" },
  { screen: "game-choice", icon: "🎯", title: "เกมฝึก", desc: "2 เกม รวม 12 ข้อ" },
  { screen: "quiz", icon: "🙋", title: "ถามหน้าชั้น", desc: "8 คำถาม ครูถาม เด็กชูมือ" },
];

export default function FractionsApp() {
  useTrackToolUse("media-mathematics-fractions-basic");
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const [screen, setScreen] = useState<Screen>("home");
  const [sound, setSound] = useState(true);

  const play = (name: Parameters<typeof KcSfx.play>[0]) => { if (sound) KcSfx.play(name); };
  const go = (next: Screen) => { play("click"); setScreen(next); };
  const home = () => setScreen("home");

  return (
    <div {...stageProps} className="kc-stage">
      <div className={`kc-stage-body ${styles.body}`} onMouseOver={hoverSfxDelegate}>
        <div className={styles.decorations} aria-hidden="true">
          <span>½</span><span>¼</span><span>●</span><span>◔</span><span>⅓</span>
        </div>

        <header className={styles.toolbar}>
          <button type="button" className={`kc-tap-chrome ${styles.brandButton}`} onClick={home} aria-label="กลับเมนูสื่อ">
            <strong className="kc-title">รู้จักเศษส่วน</strong>
          </button>
          <div className={styles.toolbarActions}>
            <Link href="/media/mathematics" className={`kc-tap-chrome ${styles.toolbarButton}`}>☰ <span>เมนู</span></Link>
            <button
              type="button"
              className={`kc-tap-chrome ${styles.toolbarButton}`}
              aria-pressed={!sound}
              aria-label={sound ? "ปิดเสียง" : "เปิดเสียง"}
              onClick={() => { const next = !sound; setSound(next); KcSfx.setMuted(!next); }}
            >{sound ? "🔊" : "🔇"}</button>
            <button
              type="button"
              className={`kc-tap-chrome ${styles.toolbarButton}`}
              onClick={toggle}
              aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
            >{isFull ? "↙" : "⛶"}</button>
          </div>
        </header>

        {screen === "home" && (
          <main className={`${styles.screen} ${styles.home}`} data-stage="home">
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>คณิตศาสตร์ ป.2–3</span>
              <h1>รู้จักเศษส่วน</h1>
              <p className={styles.heroLead}>แบ่งเท่า ๆ กัน แล้วเขียนเป็นตัวเลขได้ยังไง</p>
            </div>
            <div className={styles.homeGrid}>
              {HOME_CARDS.map((card) => (
                <button key={card.screen} type="button" className={`kc-tap ${styles.homeCard}`} onClick={() => go(card.screen)}>
                  <span className={styles.homeIcon} aria-hidden="true">{card.icon}</span>
                  <span className={styles.homeText}>
                    <strong>{card.title}</strong>
                    <small>{card.desc}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.homeFooter}>
              <Mascot size="sm" />
              <button type="button" className={`kc-tap ${styles.primary}`} onClick={() => go("lesson")}>
                ▶️ เริ่มตั้งแต่ต้น
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
