import { describe, expect, it } from "vitest";
import { isAlreadyInView } from "./stripMotion";

describe("isAlreadyInView", () => {
  const vh = 800;
  it("is true for a strip fully on screen at mount", () => {
    expect(isAlreadyInView({ top: 200, bottom: 266 }, vh)).toBe(true);
  });
  it("is true when only part of it shows at the bottom edge", () => {
    expect(isAlreadyInView({ top: 790, bottom: 856 }, vh)).toBe(true);
  });
  it("is false below the fold", () => {
    expect(isAlreadyInView({ top: 1400, bottom: 1466 }, vh)).toBe(false);
  });
  it("is false when scrolled past above", () => {
    expect(isAlreadyInView({ top: -200, bottom: -134 }, vh)).toBe(false);
  });
  it("is false with no viewport (hidden or zero-size window)", () => {
    expect(isAlreadyInView({ top: 0, bottom: 66 }, 0)).toBe(false);
  });
});
