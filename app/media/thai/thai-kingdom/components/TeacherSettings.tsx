"use client";

import { PRESETS } from "../wordData";
import { thaiVowelLabel } from "../thaiText";
import styles from "../ThaiKingdomApp.module.css";
import type { Difficulty, TeacherConfig, ThaiVowel } from "../types";

function Choice<T extends string | number>({ value, current, label, onSelect }: { value: T; current: T; label: string; onSelect: (value: T) => void }) {
  const active = value === current;
  return <button type="button" className={`kc-tap ${styles.choiceChip} ${active ? styles.choiceActive : ""}`} aria-pressed={active} onClick={() => onSelect(value)}>{active ? "✓ " : ""}{label}</button>;
}

export default function TeacherSettings({ config, title, onChange, onStart, onBack }: { config: TeacherConfig; title: string; onChange: (config: TeacherConfig) => void; onStart: () => void; onBack: () => void }) {
  const set = <K extends keyof TeacherConfig>(key: K, value: TeacherConfig[K]) => onChange({ ...config, [key]: value });
  const toggleVowel = (vowel: ThaiVowel) => set("vowels", config.vowels.includes(vowel) ? (config.vowels.length === 1 ? config.vowels : config.vowels.filter((item) => item !== vowel)) : [...config.vowels, vowel]);
  return <main className={`${styles.screen} ${styles.settings}`} data-stage="settings" aria-labelledby="settings-title">
    <div className={styles.screenHeading}><span className={styles.eyebrow}>ตั้งค่าสำหรับครู</span><h2 id="settings-title">{title}</h2><p>เลือกชุดที่เหมาะกับห้องเรียน แล้วเริ่มได้เลย</p></div>
    <div className={styles.presetRow} aria-label="ชุดพร้อมใช้">{PRESETS.map((preset) => <button type="button" key={preset.id} className={`kc-tap ${styles.presetButton}`} onClick={() => onChange({ ...config, vowels: preset.vowels })}>{preset.label}</button>)}</div>
    <div className={styles.settingsGrid}>
      <fieldset className={styles.settingGroup}><legend>ชุดพยัญชนะ</legend><div className={styles.choiceRow}><Choice value="starter" current={config.consonantSet} label="พื้นฐาน" onSelect={(value) => set("consonantSet", value)} /><Choice value="extended" current={config.consonantSet} label="เสริม" onSelect={(value) => set("consonantSet", value)} /><Choice value="all" current={config.consonantSet} label="ทั้งหมด" onSelect={(value) => set("consonantSet", value)} /></div></fieldset>
      <fieldset className={styles.settingGroup}><legend>สระ</legend><div className={styles.choiceRow}>{(["า", "ี", "ู"] as ThaiVowel[]).map((vowel) => <button type="button" key={vowel} className={`kc-tap ${styles.choiceChip} ${config.vowels.includes(vowel) ? styles.choiceActive : ""}`} aria-pressed={config.vowels.includes(vowel)} onClick={() => toggleVowel(vowel)}>{config.vowels.includes(vowel) ? "✓ " : ""}{thaiVowelLabel(vowel)}</button>)}</div></fieldset>
      <fieldset className={styles.settingGroup}><legend>จำนวนข้อ</legend><div className={styles.choiceRow}>{([5, 10, 15] as const).map((count) => <Choice key={count} value={count} current={config.questionCount} label={`${count} ข้อ`} onSelect={(value) => set("questionCount", value)} />)}</div></fieldset>
      <fieldset className={styles.settingGroup}><legend>ระดับ</legend><div className={styles.choiceRow}>{([1, 2, 3] as Difficulty[]).map((level) => <Choice key={level} value={level} current={config.difficulty} label={level === 1 ? "เริ่มต้น" : level === 2 ? "กำลังดี" : "ท้าทาย"} onSelect={(value) => set("difficulty", value)} />)}</div></fieldset>
      <fieldset className={styles.settingGroup}><legend>ตัวช่วย</legend><div className={styles.choiceRow}><Choice value="on" current={config.sound ? "on" : "off"} label="เสียง" onSelect={() => set("sound", !config.sound)} /><Choice value="on" current={config.hints ? "on" : "off"} label="คำใบ้" onSelect={() => set("hints", !config.hints)} /><Choice value="on" current={config.timer ? "on" : "off"} label="เวลา" onSelect={() => set("timer", !config.timer)} /></div></fieldset>
      <fieldset className={`${styles.settingGroup} ${config.playMode === "teams" ? styles.teamSettingExpanded : ""}`}><legend>การเล่น</legend><div className={styles.choiceRow}><Choice value="whole" current={config.playMode} label="ทั้งห้อง" onSelect={(value) => set("playMode", value)} /><Choice value="teams" current={config.playMode} label="แบ่งทีม" onSelect={(value) => set("playMode", value)} />{config.playMode === "teams" && ([2, 3, 4] as const).map((count) => <Choice key={count} value={count} current={config.teamCount} label={`${count} ทีม`} onSelect={(value) => set("teamCount", value)} />)}</div></fieldset>
      <fieldset className={styles.settingGroup}><legend>เปิดคำตอบ</legend><div className={styles.choiceRow}><Choice value="instant" current={config.instantAnswer ? "instant" : "teacher"} label="ทันที" onSelect={() => set("instantAnswer", true)} /><Choice value="teacher" current={config.instantAnswer ? "instant" : "teacher"} label="ครูเปิด" onSelect={() => set("instantAnswer", false)} /></div></fieldset>
    </div>
    <div className={styles.actions}><button type="button" className={`kc-tap ${styles.ghostButton}`} onClick={onBack}>← เมนู</button><button type="button" className={`kc-tap ${styles.primaryButton}`} onClick={onStart}>เริ่มภารกิจ →</button></div>
  </main>;
}
