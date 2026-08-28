export type Finger = "L4" | "L3" | "L2" | "L1" | "R1" | "R2" | "R3" | "R4";

export type KeyDef = {
  code: string;
  w?: number;
  label?: string;
  finger?: Finger;
};

export type KeyLabel = { base: string; shift: string };

const key = (code: string, finger: Finger, w = 1): KeyDef => ({ code, finger, w });
const special = (code: string, label: string, w: number, finger?: Finger): KeyDef => ({ code, label, w, finger });

export const ROWS: KeyDef[][] = [
  [
    key("Backquote", "L4"), key("Digit1", "L4"), key("Digit2", "L4"), key("Digit3", "L3"),
    key("Digit4", "L2"), key("Digit5", "L1"), key("Digit6", "L1"), key("Digit7", "R1"),
    key("Digit8", "R1"), key("Digit9", "R2"), key("Digit0", "R3"), key("Minus", "R4"),
    key("Equal", "R4"), special("Backspace", "ลบ", 2, "R4"),
  ],
  [
    special("Tab", "Tab", 1.45, "L4"), key("KeyQ", "L4"), key("KeyW", "L3"), key("KeyE", "L2"),
    key("KeyR", "L1"), key("KeyT", "L1"), key("KeyY", "R1"), key("KeyU", "R1"),
    key("KeyI", "R2"), key("KeyO", "R3"), key("KeyP", "R4"), key("BracketLeft", "R4"),
    key("BracketRight", "R4"), key("Backslash", "R4", 1.55),
  ],
  [
    special("CapsLock", "Caps", 1.75, "L4"), key("KeyA", "L4"), key("KeyS", "L3"), key("KeyD", "L2"),
    key("KeyF", "L1"), key("KeyG", "L1"), key("KeyH", "R1"), key("KeyJ", "R1"),
    key("KeyK", "R2"), key("KeyL", "R3"), key("Semicolon", "R4"), key("Quote", "R4"),
    special("Enter", "Enter", 2.25, "R4"),
  ],
  [
    special("ShiftLeft", "Shift", 2.3, "L4"), key("KeyZ", "L4"), key("KeyX", "L3"), key("KeyC", "L2"),
    key("KeyV", "L1"), key("KeyB", "L1"), key("KeyN", "R1"), key("KeyM", "R1"),
    key("Comma", "R2"), key("Period", "R3"), key("Slash", "R4"), special("ShiftRight", "Shift", 2.75, "R4"),
  ],
  [special("Space", "เว้นวรรค", 7.2)],
];

export const LABELS: Record<string, KeyLabel> = {
  Backquote: { base: "_", shift: "%" }, Digit1: { base: "ๅ", shift: "+" },
  Digit2: { base: "/", shift: "๑" }, Digit3: { base: "-", shift: "๒" },
  Digit4: { base: "ภ", shift: "๓" }, Digit5: { base: "ถ", shift: "๔" },
  Digit6: { base: "ุ", shift: "ู" }, Digit7: { base: "ึ", shift: "฿" },
  Digit8: { base: "ค", shift: "๕" }, Digit9: { base: "ต", shift: "๖" },
  Digit0: { base: "จ", shift: "๗" }, Minus: { base: "ข", shift: "๘" },
  Equal: { base: "ช", shift: "๙" }, KeyQ: { base: "ๆ", shift: "๐" },
  KeyW: { base: "ไ", shift: "\"" }, KeyE: { base: "ำ", shift: "ฎ" },
  KeyR: { base: "พ", shift: "ฑ" }, KeyT: { base: "ะ", shift: "ธ" },
  KeyY: { base: "ั", shift: "ํ" }, KeyU: { base: "ี", shift: "๊" },
  KeyI: { base: "ร", shift: "ณ" }, KeyO: { base: "น", shift: "ฯ" },
  KeyP: { base: "ย", shift: "ญ" }, BracketLeft: { base: "บ", shift: "ฐ" },
  BracketRight: { base: "ล", shift: "," }, Backslash: { base: "ฃ", shift: "ฅ" },
  KeyA: { base: "ฟ", shift: "ฤ" }, KeyS: { base: "ห", shift: "ฆ" },
  KeyD: { base: "ก", shift: "ฏ" }, KeyF: { base: "ด", shift: "โ" },
  KeyG: { base: "เ", shift: "ฌ" }, KeyH: { base: "้", shift: "็" },
  KeyJ: { base: "่", shift: "๋" }, KeyK: { base: "า", shift: "ษ" },
  KeyL: { base: "ส", shift: "ศ" }, Semicolon: { base: "ว", shift: "ซ" },
  Quote: { base: "ง", shift: "." }, KeyZ: { base: "ผ", shift: "(" },
  KeyX: { base: "ป", shift: ")" }, KeyC: { base: "แ", shift: "ฉ" },
  KeyV: { base: "อ", shift: "ฮ" }, KeyB: { base: "ิ", shift: "ฺ" },
  KeyN: { base: "ื", shift: "์" }, KeyM: { base: "ท", shift: "?" },
  Comma: { base: "ม", shift: "ฒ" }, Period: { base: "ใ", shift: "ฬ" },
  Slash: { base: "ฝ", shift: "ฦ" }, Space: { base: " ", shift: " " },
};

export const FINGER_COLORS: Record<Finger, string> = {
  L4: "#F5C2D4", L3: "#E4CBF7", L2: "#C8D9FA", L1: "#AEE5EA",
  R1: "#BDE8C5", R2: "#F1E7A4", R3: "#F8D2A6", R4: "#EDBDB3",
};

export const FINGER_NAMES: Record<Finger, string> = {
  L4: "ก้อยซ้าย", L3: "นางซ้าย", L2: "กลางซ้าย", L1: "ชี้ซ้าย",
  R1: "ชี้ขวา", R2: "กลางขวา", R3: "นางขวา", R4: "ก้อยขวา",
};

export type KeyTarget = { code: string; shift: boolean };

export const CHAR_TO_KEY = Object.entries(LABELS).reduce<Record<string, KeyTarget>>((map, [code, label]) => {
  map[label.base] ??= { code, shift: false };
  if (label.shift !== label.base) map[label.shift] ??= { code, shift: true };
  return map;
}, {});

export const ALL_KEYS = ROWS.flat();

