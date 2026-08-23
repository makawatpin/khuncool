import styles from "../MathAdventureApp.module.css";
import type { TeacherConfig } from "../types";

function Choice<T extends string | number>({ value, selected, children, onSelect }: { value: T; selected: boolean; children: React.ReactNode; onSelect: (value: T) => void }) {
  return <button type="button" className={`kc-tap ${styles.choiceChip} ${selected ? styles.choiceChipActive : ""}`} aria-pressed={selected} onClick={() => onSelect(value)}>{children}</button>;
}
export default function TeacherSettings({ config, onChange, onStart, onBack, title }: {
  config: TeacherConfig;
  onChange: (config: TeacherConfig) => void;
  onStart: () => void;
  onBack: () => void;
  title: string;
}) {
  const patch = <K extends keyof TeacherConfig>(key: K, value: TeacherConfig[K]) => onChange({ ...config, [key]: value });
  return <section className={`${styles.screen} ${styles.settings}`} data-stage="settings" aria-labelledby="settings-title">
    <div className={styles.screenHeading}>
      <span className={styles.eyebrow}>ตั้งค่าสำหรับครู</span>
      <h2 id="settings-title">{title}</h2>
      <p>เลือกให้เหมาะกับห้องเรียน แล้วเริ่มได้เลย</p>
    </div>
    <div className={styles.settingsGrid}>
      <fieldset className={styles.settingGroup}><legend>จำนวนไม่เกิน</legend><div className={styles.choiceRow}>
        <Choice value={10} selected={config.limit === 10} onSelect={(v) => patch("limit", v)}>10</Choice>
        <Choice value={20} selected={config.limit === 20} onSelect={(v) => patch("limit", v)}>20</Choice>
      </div></fieldset>
      <fieldset className={styles.settingGroup}><legend>โจทย์</legend><div className={styles.choiceRow}>
        <Choice value="addition" selected={config.operation === "addition"} onSelect={(v) => patch("operation", v)}>บวก</Choice>
        <Choice value="subtraction" selected={config.operation === "subtraction"} onSelect={(v) => patch("operation", v)}>ลบ</Choice>
        <Choice value="mixed" selected={config.operation === "mixed"} onSelect={(v) => patch("operation", v)}>ผสม</Choice>
      </div></fieldset>
      <fieldset className={styles.settingGroup}><legend>จำนวนข้อ</legend><div className={styles.choiceRow}>
        {[5, 10, 15].map((n) => <Choice key={n} value={n as 5 | 10 | 15} selected={config.questionCount === n} onSelect={(v) => patch("questionCount", v)}>{n} ข้อ</Choice>)}
      </div></fieldset>
      <fieldset className={styles.settingGroup}><legend>รูปแบบเล่น</legend><div className={styles.choiceRow}>
        <Choice value="whole" selected={config.playMode === "whole"} onSelect={(v) => patch("playMode", v)}>ทั้งห้อง</Choice>
        <Choice value="teams" selected={config.playMode === "teams"} onSelect={(v) => patch("playMode", v)}>แบ่งทีม</Choice>
      </div></fieldset>
      {config.playMode === "teams" && <fieldset className={styles.settingGroup}><legend>จำนวนทีม</legend><div className={styles.choiceRow}>
        {[2, 3, 4].map((n) => <Choice key={n} value={n as 2 | 3 | 4} selected={config.teamCount === n} onSelect={(v) => patch("teamCount", v)}>{n} ทีม</Choice>)}
      </div></fieldset>}
      <fieldset className={styles.settingGroup}><legend>ตัวช่วย</legend><div className={styles.choiceRow}>
        <Choice value="timer" selected={config.timer} onSelect={() => patch("timer", !config.timer)}>⏱ เวลา</Choice>
        <Choice value="hints" selected={config.hints} onSelect={() => patch("hints", !config.hints)}>💡 คำใบ้</Choice>
        <Choice value="sound" selected={config.sound} onSelect={() => patch("sound", !config.sound)}>🔊 เสียง</Choice>
      </div></fieldset>
    </div>
    <div className={styles.actions}><button type="button" className={`kc-tap ${styles.secondaryButton}`} onClick={onBack}>← กลับ</button><button type="button" className={`kc-tap ${styles.primaryButton}`} onClick={onStart}>เริ่มภารกิจ 🚀</button></div>
  </section>;
}
