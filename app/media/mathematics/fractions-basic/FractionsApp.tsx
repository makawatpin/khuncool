"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KcSfx, hoverSfxDelegate } from "@/lib/kcSfx";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { useStage } from "../../_stage/useStage";
import ChoiceGame from "./components/ChoiceGame";
import LessonScreen from "./components/LessonScreen";
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

  // KcSfx จำสถานะปิดเสียงไว้ใน localStorage คีย์ kc-sfx-muted และใช้ร่วมกันทุกสื่อ
  // ครูที่ปิดเสียงไว้คาบก่อนจึงกลับมาเจอเสียงที่ปิดอยู่แล้ว ถ้าไม่ดึงค่ามา ปุ่มจะโชว์ 🔊 ทั้งที่เงียบ
  //
  // อ่านคีย์ตรง ๆ ไม่เรียก KcSfx.isMuted() เพราะ KcSfx อ่าน localStorage ใน init() ซึ่งทำงาน
  // ตอนสร้าง AudioContext ครั้งแรกเท่านั้น คือหลังผู้ใช้แตะจอแล้ว ก่อนหน้านั้น isMuted()
  // คืนค่าตั้งต้น false เสมอไม่ว่าใน storage จะเป็นอะไร — และจะเรียก setMuted เพื่อบังคับ init
  // ก็ไม่ได้ เพราะมันสร้าง AudioContext ตั้งแต่ยังไม่มี gesture ได้แค่ context ที่ถูก suspend
  // กับคำเตือนใน console ทุกครั้งที่เปิดหน้า
  //
  // อ่านใน effect ไม่ใช่ตอน initial state เพราะ server ไม่มี localStorage แล้ว hydration จะไม่ตรง
  // queueMicrotask ตามแพตเทิร์นเดียวกับ math-adventure — setState ตรง ๆ ใน effect ติดกฎ
  // react-hooks/set-state-in-effect
  useEffect(() => {
    queueMicrotask(() => {
      try { setSound(window.localStorage.getItem("kc-sfx-muted") !== "1"); } catch {}
    });
  }, []);

  // ไม่กรองด้วย sound ซ้ำอีกชั้น — KcSfx.play คืนค่าทันทีอยู่แล้วเมื่อถูกปิดเสียง
  // การมีสองด่านทำให้ hover ที่เรียก KcSfx ตรง ๆ กับที่นี่ตัดสินใจคนละทาง
  // ถ้าวันหนึ่ง setMuted ถูกลบเพราะดูซ้ำซ้อน เสียง hover จะดังต่อทั้งที่ครูปิดเสียงแล้ว
  const play = (name: Parameters<typeof KcSfx.play>[0]) => { KcSfx.play(name); };
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

        {screen === "lesson" && (
          <LessonScreen onFinish={() => go("game-choice")} onSound={play} />
        )}

        {screen === "game-choice" && (
          <ChoiceGame onFinish={() => setScreen("game-paint")} onSound={play} />
        )}
      </div>
    </div>
  );
}
