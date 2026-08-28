"use client";

import styles from "./MysteryBoard.module.css";
import { tileSummary, type Tile } from "./boardModel";

type Props = {
  tiles: Tile[];
  spotlightId: number | null;
  busy: boolean;
  onPick: (id: number) => void;
};

export default function BoardGrid({ tiles, spotlightId, busy, onPick }: Props) {
  return (
    <div className={styles.grid}>
      {tiles.map((tile, index) => (
        <button
          key={tile.id}
          type="button"
          className={`${styles.tile} ${tile.opened ? styles.tileOpened : ""} ${
            spotlightId === tile.id ? styles.tileSpotlight : ""
          }`}
          style={{ ["--i" as string]: index }}
          disabled={busy}
          aria-label={
            tile.opened
              ? `ป้ายหมายเลข ${tile.id} เปิดแล้ว`
              : `ป้ายหมายเลข ${tile.id} ยังไม่เปิด`
          }
          onClick={() => onPick(tile.id)}
        >
          <span className={styles.tileNumber}>{tile.id}</span>
          {tile.opened && (
            <span className={styles.tileSummary}>{tileSummary(tile)}</span>
          )}
        </button>
      ))}
    </div>
  );
}
