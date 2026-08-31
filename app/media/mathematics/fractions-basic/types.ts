export type ShapeKind = "circle" | "bar" | "square";

/** รูปเศษส่วนหนึ่งรูป — แบ่ง `parts` ส่วน ระบายส่วนที่อยู่ใน `filled` */
export type ShapeSpec = {
  shape: ShapeKind;
  parts: number;
  filled: number[];
  /** true = แบ่งไม่เท่ากัน ใช้เป็นตัวลวางและตัวอย่าง "แบบนี้ไม่ใช่เศษส่วน" */
  unequal?: boolean;
};

/** หนึ่งสเต็ปของสไลด์บทเรียน ครูกด → ทีละสเต็ป หรือกด ▶ ให้เดินเอง */
export type LessonStep = {
  caption: string;
  shapes: ShapeSpec[];
  /** ตัวเลขเศษส่วนโผล่แค่ไหนในสเต็ปนี้ */
  reveal: "none" | "denominator" | "full";
  /** ส่วนที่ให้กะพริบเน้นในสเต็ปนี้ */
  highlight?: "all" | "filled";
};

export type LessonSlide = {
  id: string;
  title: string;
  /** ตัวเลขเศษส่วนที่สไลด์นี้กำลังสอน null = สไลด์ที่ไม่มีตัวเลข */
  fraction: { numerator: number; denominator: number } | null;
  steps: LessonStep[];
};

export type ChoiceQuestion = {
  id: string;
  numerator: number;
  denominator: number;
  options: ShapeSpec[];
  answerIndex: number;
  explain: string;
};

export type PaintQuestion = {
  id: string;
  numerator: number;
  denominator: number;
  shape: ShapeKind;
  explain: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  shapes: ShapeSpec[];
  answer: string;
  note: string;
};

export type Screen = "home" | "lesson" | "game-choice" | "game-paint" | "quiz" | "result";
