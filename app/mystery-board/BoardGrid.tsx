"use client";

import styles from "./MysteryBoard.module.css";
import { isSuper, tileScore, tileSummary, type Tile } from "./boardModel";

type Props = {
  tiles: Tile[];
  spotlightId: number | null;
  busy: boolean;
  onPick: (id: number) => void;
};

export default function BoardGrid({ tiles, spotlightId, busy, onPick }: Props) {
  const density =
    tiles.length <= 12 ? "small" : tiles.length <= 20 ? "medium" : "large";

  return (
    <div
      className={styles.grid}
      data-density={density}
      data-count={tiles.length}
    >
      {tiles.map((tile, index) => {
        const grand = tile.opened && tile.prize ? isSuper(tile.prize) : false;
        return (
          <button
            key={tile.id}
            type="button"
            className={`${styles.tile} ${tile.opened ? styles.tileOpened : ""} ${
              grand ? styles.tileGrand : ""
            } ${spotlightId === tile.id ? styles.tileSpotlight : ""}`}
            style={{ ["--i" as string]: index }}
            disabled={busy}
            aria-label={
              tile.opened
                ? `ป้ายหมายเลข ${tile.id} เปิดแล้ว ${tileSummary(tile)}`
                : `ป้ายหมายเลข ${tile.id} ยังไม่เปิด`
            }
            onClick={() => onPick(tile.id)}
          >
            {tile.opened ? (
              <>
                {/* เปิดแล้วให้คะแนนเป็นพระเอก เลขป้ายหดไปมุมไว้อ้างอิงตอนคุยกัน */}
                <span className={styles.tileBadge}>{tile.id}</span>
                {tile.prize ? (
                  <span className={styles.tileResult}>
                    <span className={styles.tileEmoji}>{tile.prize.emoji}</span>
                    <span className={styles.tileScore}>
                      {tileScore(tile.prize)}
                    </span>
                  </span>
                ) : (
                  <span className={styles.tileResult}>
                    <span className={styles.tileEmoji}>✓</span>
                  </span>
                )}
              </>
            ) : (
              <span className={styles.tileNumber}>{tile.id}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
