/**
 * เรขาคณิตของรูปเศษส่วน — ฟังก์ชันบริสุทธิ์ล้วน ไม่แตะ DOM ไม่แตะ React
 *
 * ทุกพิกัดอยู่ในระบบ viewBox "0 0 100 100" ขนาดจริงบนจอถูกกำหนดจาก CSS module
 * ของ FractionShape เท่านั้น (contract ข้อ 3 — ขนาดห้ามอยู่ใน inline style)
 */

const CX = 50;
const CY = 50;
const R = 50;

/** ปัดให้พาธสั้นและเทียบกันได้ตรง ๆ ระหว่างชิ้นที่ติดกัน */
const round = (value: number) => Math.round(value * 1000) / 1000;

const pointAt = (turns: number) => {
  // เริ่มที่ 12 นาฬิกา เดินตามเข็ม
  const angle = turns * Math.PI * 2 - Math.PI / 2;
  return { x: round(CX + R * Math.cos(angle)), y: round(CY + R * Math.sin(angle)) };
};

/**
 * พาธของชิ้นที่ `index` เมื่อวงกลมถูกแบ่ง `parts` ส่วนเท่า ๆ กัน
 *
 * `parts === 1` คืนวงกลมเต็มใบด้วยส่วนโค้งสองท่อน เพราะชิ้นเดียว 360°
 * จะมีจุดเริ่มกับจุดจบทับกันพอดี ทำให้ `A` วาดอะไรไม่ออก
 */
export function slicePath(index: number, parts: number): string {
  if (parts <= 1) {
    return `M${CX} ${CY - R} A${R} ${R} 0 1 1 ${CX} ${CY + R} A${R} ${R} 0 1 1 ${CX} ${CY - R} Z`;
  }
  const start = pointAt(index / parts);
  const end = pointAt((index + 1) / parts);
  const large = 1 / parts > 0.5 ? 1 : 0;
  return `M${CX} ${CY} L${start.x} ${start.y} A${R} ${R} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

/**
 * สัดส่วนความกว้างของการแบ่งแบบ "ไม่เท่ากัน" ใช้กับสไลด์ 1 (ตัวอย่างที่ไม่ใช่
 * เศษส่วน) และตัวลวงในเกม A ค่าคงที่ตายตัวเพื่อให้ภาพเหมือนเดิมทุกครั้ง
 * และเทสต์ทำซ้ำได้ จำนวนส่วนที่ไม่ได้กำหนดไว้ถอยไปเป็นแบ่งเท่ากัน
 */
const UNEQUAL: Record<number, number[]> = {
  2: [0.62, 0.38],
  3: [0.5, 0.3, 0.2],
  4: [0.4, 0.28, 0.19, 0.13],
};

export function unequalWeights(parts: number): number[] {
  return UNEQUAL[parts] ?? Array.from({ length: parts }, () => 1 / parts);
}

/** ขอบซ้ายและความกว้างของแถบที่ `index` ในระบบ 0–100 */
export function stripBounds(index: number, parts: number, unequal = false): { x: number; width: number } {
  const weights = unequal ? unequalWeights(parts) : Array.from({ length: parts }, () => 1 / parts);
  const before = weights.slice(0, index).reduce((sum, w) => sum + w, 0);
  return { x: round(before * 100), width: round(weights[index] * 100) };
}

/** อ่านเศษส่วนเป็นภาษาไทยสำหรับ aria-label และคำบรรยาย */
export function readFraction(numerator: number, denominator: number): string {
  if (numerator === 1 && denominator === 2) return "ครึ่งหนึ่ง";
  return `${numerator} ส่วน ${denominator}`;
}
