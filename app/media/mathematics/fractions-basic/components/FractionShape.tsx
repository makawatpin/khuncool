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
  /** คำบรรยายรูปสำหรับคนที่มองไม่เห็น */
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
      role: "checkbox",
      tabIndex: 0,
      "aria-checked": isFilled,
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

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${styles.shape} ${SIZE_CLASS[size]} ${shape === "bar" ? styles.bar : ""}`}
      role={interactive ? "group" : "img"}
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {shape === "circle"
        ? indices.map((i) => <path key={i} d={slicePath(i, parts)} {...partProps(i)} />)
        : indices.map((i) => {
            const { x, width } = stripBounds(i, parts, unequal);
            return <rect key={i} x={x} y={0} width={width} height={100} {...partProps(i)} />;
          })}
    </svg>
  );
}
