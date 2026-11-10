import { describe, expect, it } from "vitest";
import {
  CENTERS, DEFAULT_DESIGN, FLOWERS, MATERIALS, PETALS, SHAPES, SLOT_COUNT,
  fillSlots, flowerCount, normalize, randomDesign, toggleSlot,
} from "./designOptions";

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

describe("catalog", () => {
  it("has unique ids in every list", () => {
    for (const list of [MATERIALS, SHAPES, PETALS, CENTERS, FLOWERS]) {
      const ids = list.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("starts with a full set of slots", () => {
    expect(DEFAULT_DESIGN.flowers).toHaveLength(SLOT_COUNT);
  });
});

describe("rules", () => {
  it("forces a coconut base back to round", () => {
    expect(normalize({ ...DEFAULT_DESIGN, material: "coconut", shape: "heart" }).shape).toBe("round");
    expect(normalize({ ...DEFAULT_DESIGN, material: "bread", shape: "heart" }).shape).toBe("heart");
  });

  it("pads or trims flower slots to the slot count", () => {
    expect(normalize({ ...DEFAULT_DESIGN, flowers: ["rose"] }).flowers).toHaveLength(SLOT_COUNT);
    expect(normalize({ ...DEFAULT_DESIGN, flowers: Array(20).fill("rose") }).flowers).toHaveLength(SLOT_COUNT);
  });

  it("toggles a slot on and off with the same flower", () => {
    const empty = { ...DEFAULT_DESIGN, flowers: Array(SLOT_COUNT).fill(null) };
    const one = toggleSlot(empty, 3, "rose");
    expect(one.flowers[3]).toBe("rose");
    expect(toggleSlot(one, 3, "rose").flowers[3]).toBeNull();
    expect(toggleSlot(one, 3, "globe").flowers[3]).toBe("globe");
    expect(toggleSlot(one, 3, null).flowers[3]).toBeNull();
  });

  it("fills every slot or every other slot without touching the rest", () => {
    const all = fillSlots(DEFAULT_DESIGN, "rose", 1);
    expect(flowerCount(all)).toBe(SLOT_COUNT);
    const mixed = fillSlots(all, "globe", 2);
    expect(mixed.flowers[0]).toBe("globe");
    expect(mixed.flowers[1]).toBe("rose");
    expect(flowerCount(fillSlots(all, null, 1))).toBe(0);
  });

  it("only produces valid designs at random", () => {
    const rand = seeded(42);
    for (let i = 0; i < 200; i++) {
      const d = randomDesign(rand);
      expect(d.flowers).toHaveLength(SLOT_COUNT);
      if (d.material === "coconut") expect(d.shape).toBe("round");
      expect(d.petals).not.toBe("none");
      expect(d.center).not.toBe("none");
    }
  });
});
