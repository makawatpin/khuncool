/**
 * Everything a child can choose when designing a krathong, and the rules
 * between those choices. Pure data and pure functions only, so the 3D
 * builder, the picker UI and the tests all read from the same catalog.
 */

export type BaseMaterial = "banana" | "bread" | "coconut" | "lotusLeaf";
export type BaseShape = "round" | "lotus" | "heart" | "star";
export type PetalStyle = "leafPointed" | "leafRose" | "lotusPink" | "none";
export type Centerpiece = "budPink" | "budWhite" | "bloomPink" | "leafCone" | "marigoldTower" | "none";
export type FlowerKind = "marigold" | "plumeria" | "rose" | "globe" | "crown";
export type Trim = "gold" | "pearl" | "none";
export type CandleColor = "white" | "yellow" | "pink";

/** Flowers sit in fixed slots around the rim. The back of the rim is kept
 *  free for the candle and incense, so the slots only span the front 270°. */
export const SLOT_COUNT = 10;

export interface KrathongDesign {
  material: BaseMaterial;
  shape: BaseShape;
  petals: PetalStyle;
  center: Centerpiece;
  flowers: (FlowerKind | null)[];
  trim: Trim;
  candle: CandleColor;
  incense: boolean;
}

export interface Option<T extends string> {
  id: T;
  label: string;
  /** One short line shown under the picker for the selected option. */
  note: string;
}

export const MATERIALS: Option<BaseMaterial>[] = [
  { id: "banana", label: "หยวกกล้วย", note: "วัสดุดั้งเดิม ย่อยสลายได้เองตามธรรมชาติ" },
  { id: "bread", label: "ขนมปัง", note: "ปลากินได้ จึงไม่กลายเป็นขยะในแม่น้ำ" },
  { id: "coconut", label: "กะลามะพร้าว", note: "นำกะลาที่เหลือจากครัวมาใช้ใหม่ ลอยน้ำได้ดี" },
  { id: "lotusLeaf", label: "ใบบัว", note: "ผิวใบบัวกันน้ำได้เอง จึงลอยได้ดี" },
];

export const SHAPES: Option<BaseShape>[] = [
  { id: "round", label: "กลม", note: "ทรงดั้งเดิมที่พบบ่อยที่สุด" },
  { id: "lotus", label: "กลีบบัว", note: "ขอบหยักเป็นกลีบรอบตัว" },
  { id: "heart", label: "หัวใจ", note: "ทรงหัวใจ น่ารักทันสมัย" },
  { id: "star", label: "ดาว", note: "ขอบห้าแฉกโค้งมน" },
];

export const PETALS: Option<PetalStyle>[] = [
  { id: "leafPointed", label: "ใบตองพับแหลม", note: "ลายกลีบแหลมเรียงซ้อนกัน แบบที่เห็นบ่อยที่สุด" },
  { id: "leafRose", label: "ใบตองพับกุหลาบ", note: "พับใบตองให้ปลายมนเหมือนกลีบกุหลาบ" },
  { id: "lotusPink", label: "กลีบบัวชมพู", note: "ใช้กลีบดอกบัวจริงเรียงรอบฐาน" },
  { id: "none", label: "ไม่ใส่กลีบ", note: "โชว์เนื้อวัสดุของฐานให้เห็นชัด" },
];

export const CENTERS: Option<Centerpiece>[] = [
  { id: "budPink", label: "บัวตูมชมพู", note: "ดอกบัวตูม สัญลักษณ์ของการบูชา" },
  { id: "budWhite", label: "บัวตูมขาว", note: "บัวขาว ดูสะอาดและสงบ" },
  { id: "bloomPink", label: "บัวบาน", note: "ดอกบัวบานเต็มที่ เห็นเกสรกลางดอก" },
  { id: "leafCone", label: "พุ่มใบตอง", note: "ใบตองพับซ้อนขึ้นเป็นยอดแหลม" },
  { id: "marigoldTower", label: "พุ่มดาวเรือง", note: "ดาวเรืองเรียงซ้อนเป็นพุ่มสีทอง" },
  { id: "none", label: "ไม่มียอด", note: "เหลือที่ตรงกลางให้ดอกไม้กับเทียนเด่นขึ้น" },
];

export const FLOWERS: Option<FlowerKind>[] = [
  { id: "marigold", label: "ดาวเรือง", note: "สีทองสดใส" },
  { id: "plumeria", label: "ลีลาวดี", note: "กลีบขาวโคนเหลือง" },
  { id: "rose", label: "กุหลาบ", note: "กลีบแดงซ้อนกัน" },
  { id: "globe", label: "บานไม่รู้โรย", note: "ช่อกลมสีม่วง" },
  { id: "crown", label: "ดอกรัก", note: "ดอกเล็กสีม่วงอ่อน" },
];

export const TRIMS: Option<Trim>[] = [
  { id: "gold", label: "ลูกปัดทอง", note: "" },
  { id: "pearl", label: "มุกขาว", note: "" },
  { id: "none", label: "ไม่ใส่", note: "" },
];

export const CANDLES: Option<CandleColor>[] = [
  { id: "white", label: "เทียนขาว", note: "" },
  { id: "yellow", label: "เทียนเหลือง", note: "" },
  { id: "pink", label: "เทียนชมพู", note: "" },
];

export const WISHES = [
  "ขอขมาพระแม่คงคา",
  "ขอให้เรียนเก่ง",
  "ขอให้ครอบครัวมีความสุข",
  "ขอให้สุขภาพแข็งแรง",
] as const;

export const STEPS = [
  { key: "base", title: "เลือกฐาน", hint: "เลือกวัสดุและรูปทรงของฐานกระทง" },
  { key: "petals", title: "ใส่กลีบรอบฐาน", hint: "เลือกลายกลีบและลูกปัดที่จะเรียงรอบฐาน" },
  { key: "center", title: "เลือกยอดกระทง", hint: "เลือกสิ่งที่จะตั้งไว้ตรงกลาง" },
  { key: "flowers", title: "ประดับดอกไม้", hint: "เลือกดอกไม้ แล้วแตะช่องรอบขอบกระทง" },
  { key: "candle", title: "ปักธูปเทียน", hint: "เลือกเทียน แล้วกดจุดไฟ" },
  { key: "wish", title: "อธิษฐานแล้วลอย", hint: "เลือกคำอธิษฐาน แล้วลอยกระทงลงแม่น้ำ" },
] as const;

export const DEFAULT_DESIGN: KrathongDesign = {
  material: "banana",
  shape: "round",
  petals: "leafPointed",
  center: "budPink",
  flowers: Array.from({ length: SLOT_COUNT }, (_, i) => (i % 2 === 0 ? "marigold" : null)),
  trim: "gold",
  candle: "white",
  incense: true,
};

/** A coconut shell has one shape: the shell it came in. */
export function shapeLocked(material: BaseMaterial): boolean {
  return material === "coconut";
}

/** Apply the rules between choices, so every design the UI can produce is
 *  one the builder can draw. */
export function normalize(d: KrathongDesign): KrathongDesign {
  const flowers = Array.from({ length: SLOT_COUNT }, (_, i) => d.flowers[i] ?? null);
  return { ...d, shape: shapeLocked(d.material) ? "round" : d.shape, flowers };
}

/** Tap a slot: place the chosen flower, or take it out if it is already there. */
export function toggleSlot(d: KrathongDesign, slot: number, kind: FlowerKind | null): KrathongDesign {
  const flowers = [...d.flowers];
  flowers[slot] = kind === null || flowers[slot] === kind ? null : kind;
  return { ...d, flowers };
}

export function fillSlots(d: KrathongDesign, kind: FlowerKind | null, every: 1 | 2): KrathongDesign {
  const flowers = d.flowers.map((f, i) => (i % every === 0 ? kind : every === 1 ? kind : f));
  return { ...d, flowers };
}

export function flowerCount(d: KrathongDesign): number {
  return d.flowers.filter(Boolean).length;
}

/** A random but always valid design, for the other krathongs on the river. */
export function randomDesign(rand: () => number): KrathongDesign {
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const kinds = FLOWERS.map((f) => f.id);
  const a = pick(kinds), b = pick(kinds);
  const pattern = rand();
  return normalize({
    material: pick(MATERIALS).id,
    shape: pick(SHAPES).id,
    petals: pick(PETALS.filter((p) => p.id !== "none")).id,
    center: pick(CENTERS.filter((c) => c.id !== "none")).id,
    flowers: Array.from({ length: SLOT_COUNT }, (_, i) => (pattern < 0.5 ? (i % 2 === 0 ? a : b) : i % 2 === 0 ? a : null)),
    trim: pick(TRIMS).id,
    candle: pick(CANDLES).id,
    incense: rand() < 0.7,
  });
}

export function labelOf<T extends string>(list: Option<T>[], id: T): string {
  return list.find((o) => o.id === id)?.label ?? "";
}
