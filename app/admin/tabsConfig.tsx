import type { ReactNode } from "react";

function OverviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="5.5" height="7" rx="1.2" />
      <rect x="10" y="2.5" width="5.5" height="4" rx="1.2" />
      <rect x="10" y="8.5" width="5.5" height="7" rx="1.2" />
      <rect x="2.5" y="11.5" width="5.5" height="4" rx="1.2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6.8" cy="6" r="2.5" />
      <path d="M2.5 15c0-2.5 1.9-4.2 4.3-4.2s4.3 1.7 4.3 4.2" />
      <circle cx="13" cy="5.5" r="2" />
      <path d="M11.7 10.9c1.9.3 3.3 1.8 3.3 4.1" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4.5a3 3 0 0 0-3.9 3.9l-5.1 5.1a1.4 1.4 0 0 0 2 2l5.1-5.1a3 3 0 0 0 3.9-3.9l-2 2-1.8-.4-.4-1.8 2-2Z" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="3" width="13" height="12" rx="1.5" />
      <line x1="5" y1="6.5" x2="13" y2="6.5" />
      <line x1="5" y1="9.5" x2="13" y2="9.5" />
      <line x1="5" y1="12.5" x2="10" y2="12.5" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="9" r="2.3" />
      <path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.6 4.6l1.4 1.4M12 12l1.4 1.4M4.6 13.4 6 12M12 6l1.4-1.4" />
    </svg>
  );
}

export const TABS = [
  {
    key: "overview",
    label: "ภาพรวม",
    description: "สรุปสถิติการใช้งานล่าสุด",
    Icon: OverviewIcon,
  },
  {
    key: "users",
    label: "ผู้ใช้",
    description: "รายชื่อสมาชิกทั้งหมด",
    Icon: UsersIcon,
  },
  {
    key: "tools",
    label: "เครื่องมือ",
    description: "สถิติการใช้งานเครื่องมือแต่ละตัว",
    Icon: ToolsIcon,
  },
  {
    key: "content",
    label: "เนื้อหา",
    description: "รายการบทความทั้งหมด",
    Icon: ContentIcon,
  },
  {
    key: "system",
    label: "ระบบ",
    description: "ลิงก์ไปยังระบบหลังบ้าน",
    Icon: SystemIcon,
  },
] as const satisfies readonly { key: string; label: string; description: string; Icon: () => ReactNode }[];

export type TabKey = (typeof TABS)[number]["key"];
