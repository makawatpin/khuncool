/**
 * What makes the shared daily record into a particular activity: its
 * statuses and wording. Everything else (per-day storage, month table, print
 * sheet, holidays, cloud sync) is the same for every kind.
 */
export type DailyCheckKind = "attendance" | "toothbrushing" | "milk";

export interface StatusOption {
  key: string;
  /** Full word: buttons with text, summaries, help. */
  label: string;
  /** What a day's Excel file and day print show in the status column. */
  cell: string;
  /** One-character mark for the month table and month print. */
  mark: string;
  color: string;
  /** Counts toward the percentage (มา, สาย / แปรงแล้ว). */
  positive: boolean;
}

export interface DailyCheckConfig {
  kind: DailyCheckKind;
  /** localStorage slot; also the useCloudSync key's storage (see LOCAL_STORAGE_KEY). */
  lsKey: string;
  emoji: string;
  /** Tool name: help heading, print heading ("เช็กชื่อนักเรียน", "บันทึกการแปรงฟัน"). */
  title: string;
  statuses: StatusOption[];
  /** Status buttons show `cell` as a large icon (✓/✗) instead of the label. */
  iconButtons: boolean;
  /** Status the one-tap button gives everyone still blank. */
  allDoneKey: string;
  allDoneLabel: string;
  /** Second line of the "not recorded yet" prompt. */
  startHint: string;
  /** Status for students the attendance check marked absent or on leave; null = this app is the attendance check. */
  notInClassKey: string | null;
  /** Shown in the month view next to students with more than three non-positive days. */
  watchLabel: string;
  /** Percentage column heading in the month view. */
  percentLabel: string;
  /** Heading of the printed monthly form. */
  monthFormTitle: string;
  /** Prefix for exported file names and the sheet name. */
  fileStem: string;
}

const DONE_SKIPPED = (done: string, skipped: string): StatusOption[] => [
  { key: "done", label: done, cell: "✓", mark: "✓", color: "#0A9380", positive: true },
  { key: "skipped", label: skipped, cell: "✗", mark: "✗", color: "#DC2626", positive: false },
];

export const DAILY_CHECKS: Record<DailyCheckKind, DailyCheckConfig> = {
  attendance: {
    kind: "attendance",
    lsKey: "khuncool_attendance_v1",
    emoji: "✅",
    title: "เช็กชื่อนักเรียน",
    statuses: [
      { key: "present", label: "มา", cell: "มา", mark: "/", color: "#0A9380", positive: true },
      { key: "late", label: "สาย", cell: "สาย", mark: "ส", color: "#B4820A", positive: true },
      { key: "leave", label: "ลา", cell: "ลา", mark: "ล", color: "#3D38B4", positive: false },
      { key: "absent", label: "ขาด", cell: "ขาด", mark: "ข", color: "#DC2626", positive: false },
    ],
    iconButtons: false,
    allDoneKey: "present",
    allDoneLabel: "ทั้งหมดมา",
    startHint: "กดปุ่มนี้ครั้งเดียว แล้วแตะ สาย ลา หรือ ขาด ให้คนที่ไม่ได้มาตรงเวลา",
    notInClassKey: null,
    watchLabel: "ขาดหรือลาเกิน 3 วันในเดือนนี้",
    percentLabel: "% มา",
    monthFormTitle: "บัญชีเรียกชื่อนักเรียนประจำเดือน",
    fileStem: "เช็กชื่อ",
  },
  toothbrushing: {
    kind: "toothbrushing",
    lsKey: "khuncool_toothbrushing_v1",
    emoji: "🪥",
    title: "บันทึกการแปรงฟัน",
    statuses: DONE_SKIPPED("แปรงแล้ว", "ไม่แปรง"),
    iconButtons: true,
    allDoneKey: "done",
    allDoneLabel: "แปรงครบทุกคน",
    startHint: "กดปุ่มนี้ครั้งเดียว แล้วแตะ ✗ ให้คนที่ไม่แปรง",
    notInClassKey: "skipped",
    watchLabel: "ไม่แปรงเกิน 3 วันในเดือนนี้",
    percentLabel: "%",
    monthFormTitle: "แบบบันทึกการแปรงฟันหลังอาหารกลางวัน",
    fileStem: "แปรงฟัน",
  },
  milk: {
    kind: "milk",
    lsKey: "khuncool_milk_v1",
    emoji: "🥛",
    title: "บันทึกการดื่มนม",
    statuses: DONE_SKIPPED("ดื่มแล้ว", "ไม่ดื่ม"),
    iconButtons: true,
    allDoneKey: "done",
    allDoneLabel: "ดื่มครบทุกคน",
    startHint: "กดปุ่มนี้ครั้งเดียว แล้วแตะ ✗ ให้คนที่ไม่ดื่ม",
    notInClassKey: "skipped",
    watchLabel: "ไม่ดื่มเกิน 3 วันในเดือนนี้",
    percentLabel: "%",
    monthFormTitle: "แบบบันทึกการดื่มนมโรงเรียน",
    fileStem: "ดื่มนม",
  },
};

export function statusOption(config: DailyCheckConfig, key: string | null): StatusOption | undefined {
  return config.statuses.find((s) => s.key === key);
}
