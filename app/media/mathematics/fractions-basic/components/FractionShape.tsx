"use client";

import type { KeyboardEvent } from "react";
import { slicePath, stripBounds } from "../fractionGeometry";
import type { ShapeKind } from "../types";
import styles from "./FractionShape.module.css";

type Props = {
  shape: ShapeKind;
  parts: number;
  filled: number[];
  unequal?: boolean;
  /** ขนาดเป็น class ไม่ใช่ค่า inline — container query จึงยกค่าได้ (contract ข้อ 3) */
  size?: "sm" | "md" | "lg";
  /** เน้นส่วนไหน: ทุกส่วน (สอนตัวส่วน) หรือเฉพาะที่ระบาย (สอนตัวเศษ) */
  highlight?: "all" | "filled";
  /** ให้แตะเลือกได้ ใช้ใน PaintGame */
  onTapPart?: (index: number) => void;
  /** คำบรรยายรูปสำหรับคนที่มองไม่เห็น
   *
   * ส่วนย่อยที่ไม่ให้แตะถูกตั้ง aria-hidden ไว้ ป้ายนี้จึงเป็นข้อมูลเดียวที่เหลือ
   * ผู้เรียกต้องบอกให้ครบว่าแบ่งกี่ส่วน ระบายกี่ส่วน และแบ่งเท่ากันหรือไม่
   * ไม่มีอะไรในคอมโพเนนต์บังคับข้อนี้ได้ */
  label: string;
};

const SIZE_CLASS = { sm: styles.sizeSm, md: styles.sizeMd, lg: styles.sizeLg };

export default function FractionShape({
  shape, parts, filled, unequal = false, size = "md", highlight, onTapPart, label,
}: Props) {
  const interactive = Boolean(onTapPart);
  const indices = Array.from({ length: parts }, (_, i) => i);

  const partProps = (index: number) => {
    const isFilled = filled.includes(index);
    const classes = [
      styles.part,
      isFilled ? styles.filled : styles.empty,
      highlight === "all" ? styles.pulse : "",
      highlight === "filled" && isFilled ? styles.pulse : "",
      interactive ? styles.tappable : "",
    ].filter(Boolean).join(" ");

    if (!interactive) return { className: classes, "aria-hidden": true as const };

    return {
      className: classes,
      role: "button",
      tabIndex: 0,
      "aria-pressed": isFilled,
      "aria-label": `ส่วนที่ ${index + 1}`,
      onClick: () => onTapPart?.(index),
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onTapPart?.(index);
        }
      },
    };
  };

  // แท่งต้องยืดเต็มกล่องที่กว้างและเตี้ย จึงต้องปิด preserveAspectRatio
  //
  // viewBox เป็น 1:1 เสมอ ถ้าใช้ "meet" ภาพจะถูกย่อลงตามด้านที่สั้นกว่าแล้ววาง
  // กึ่งกลาง แปลว่าคลาส .bar ที่ตั้งกล่องให้เตี้ยกลับทำให้ทั้งรูปเล็กลงแทนที่จะแบนลง
  // ผลคือ "แท่งช็อกโกแลต" เรนเดอร์เป็นสี่เหลี่ยมจัตุรัสเล็ก ๆ หน้าตาเหมือน square
  // ทุกประการ ซึ่งทำให้สไลด์ 5 ที่วางวงกลม แท่ง และสี่เหลี่ยมเทียบกันเพื่อสอนว่า
  // "รูปต่างกันเขียนเป็นเศษส่วนเดียวกันได้" สอนไม่ได้เลย
  //
  // "none" ยืดแกน x กับ y คนละอัตรา ซึ่งไม่เสียความหมายเพราะแถบเป็นสี่เหลี่ยม
  // ยืดแล้วก็ยังเป็นสี่เหลี่ยม สัดส่วนพื้นที่ของแต่ละส่วนยังเท่าเดิม
  // ที่เสียคือเส้นขอบจะหนาไม่เท่ากันสองแกน จึงใส่ vector-effect ให้เส้นคงความหนาจริง
  //
  // วงกลมกับสี่เหลี่ยมยังใช้ meet ตามเดิม เพราะทั้งคู่ต้องคงอัตราส่วน 1:1
  const stretch = shape === "bar";

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.shape} ${SIZE_CLASS[size]} ${stretch ? styles.bar : ""}`}
      role={interactive ? "group" : "img"}
      aria-label={label}
      preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
    >
      {shape === "circle"
        ? indices.map((i) => <path key={i} d={slicePath(i, parts)} {...partProps(i)} />)
        : indices.map((i) => {
            const { x, width } = stripBounds(i, parts, unequal);
            return (
              <rect
                key={i}
                x={x}
                y={0}
                width={width}
                height={100}
                vectorEffect={stretch ? "non-scaling-stroke" : undefined}
                {...partProps(i)}
              />
            );
          })}
    </svg>
  );
}
