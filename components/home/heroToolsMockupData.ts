// Static content for the animated hero tools mockup (decorative preview only).

export type HeroMockupTool = {
  kind: "wheel" | "groups" | "meter" | "familyTree" | "duckRace" | "scoreboard" | "timer" | "attendance";
  label: string;
};

export type HeroMockupPair = {
  primary: HeroMockupTool;
  secondary: HeroMockupTool;
};

export const HERO_MOCKUP_PAIRS: HeroMockupPair[] = [
  {
    primary: { kind: "wheel", label: "วงล้อสุ่มชื่อ" },
    secondary: { kind: "groups", label: "แบ่งกลุ่มนักเรียน" },
  },
  {
    primary: { kind: "meter", label: "วัดเสียงในห้อง" },
    secondary: { kind: "familyTree", label: "Family Tree" },
  },
  {
    primary: { kind: "duckRace", label: "เกมเป็ดสุ่มชื่อ" },
    secondary: { kind: "scoreboard", label: "กระดานคะแนนกลุ่ม" },
  },
  {
    primary: { kind: "timer", label: "จับเวลา" },
    secondary: { kind: "attendance", label: "เช็กชื่อนักเรียน" },
  },
];
