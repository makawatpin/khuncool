"use client";

import { Fragment, useEffect, useRef } from "react";
import styles from "./GiftExchange.module.css";

export default function ChainStrip({ labels }: { labels: string[] }) {
  const ref = useRef<HTMLOListElement | null>(null);

  // เลื่อนให้คนล่าสุดอยู่ในจอเสมอ
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [labels.length]);

  if (labels.length === 0) return null;
  return (
    <ol ref={ref} className={styles.chainStrip} aria-label="ลำดับการแลกของขวัญ">
      {labels.map((label, i) => (
        <Fragment key={`${i}-${label}`}>
          {i > 0 && (
            <li className={styles.chainArrow} aria-hidden="true">
              →
            </li>
          )}
          <li className={`${styles.chainChip} ${i === labels.length - 1 ? styles.chainChipLast : ""}`}>
            {label}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
