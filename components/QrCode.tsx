"use client";

import { useMemo } from "react";
import { createQrMatrix } from "@/lib/qr/qrCode";

export default function QrCode({ value, size = 216 }: { value: string; size?: number }) {
  const matrix = useMemo(() => createQrMatrix(value), [value]);
  const quiet = 4;
  const viewSize = matrix.length + quiet * 2;
  const path = matrix.flatMap((row, y) =>
    row.flatMap((dark, x) => (dark ? [`M${x + quiet} ${y + quiet}h1v1h-1z`] : [])),
  ).join("");
  return (
    <svg role="img" aria-label="QR code สำหรับเปิดกิจกรรม" viewBox={`0 0 ${viewSize} ${viewSize}`} width={size} height={size} shapeRendering="crispEdges">
      <rect width={viewSize} height={viewSize} fill="white" />
      <path d={path} fill="#171826" />
    </svg>
  );
}
