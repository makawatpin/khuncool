import { describe, it, expect } from "vitest";
import { getLunarDate } from "./lunarDates";

describe("getLunarDate", () => {
  it("returns the known date for a covered year", () => {
    expect(getLunarDate("loy-krathong", 2026)).toBe("2026-11-24");
  });

  it("returns null for an uncovered year", () => {
    expect(getLunarDate("loy-krathong", 2030)).toBeNull();
  });

  it("returns null for an unknown key", () => {
    expect(getLunarDate("not-a-real-key", 2026)).toBeNull();
  });
});
