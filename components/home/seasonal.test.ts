import { describe, expect, it } from "vitest";
import { DEFAULT_SPOTLIGHT, SEASONAL, pickSpotlight } from "./seasonal";

const at = (iso: string) => pickSpotlight(new Date(iso)).href;

describe("pickSpotlight", () => {
  it("shows Loy Krathong through November", () => {
    expect(at("2026-11-12T05:00:00Z")).toBe("/media/social-studies/krathong-designer");
    expect(at("2027-11-30T10:00:00Z")).toBe("/media/social-studies/krathong-designer");
  });

  it("uses the date in Thailand, not UTC", () => {
    // 31 Oct 18:00 UTC is already 1 Nov 01:00 in Bangkok.
    expect(at("2026-10-31T18:00:00Z")).toBe("/media/social-studies/krathong-designer");
    expect(at("2026-10-31T16:00:00Z")).toBe("/media/english/halloween-wordle");
  });

  it("handles the window that crosses New Year", () => {
    expect(at("2026-12-28T05:00:00Z")).toBe("/gift-exchange");
    expect(at("2027-01-03T05:00:00Z")).toBe("/gift-exchange");
    expect(at("2027-01-06T05:00:00Z")).toBe(DEFAULT_SPOTLIGHT.href);
  });

  it("falls back outside every window", () => {
    expect(at("2027-06-15T05:00:00Z")).toBe(DEFAULT_SPOTLIGHT.href);
  });

  it("never has two windows covering the same day", () => {
    const covers = (md: string) =>
      SEASONAL.filter(({ from, to }) =>
        from <= to ? md >= from && md <= to : md >= from || md <= to,
      ).length;
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 31; d++) {
        const md = `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        expect(covers(md), md).toBeLessThanOrEqual(1);
      }
    }
  });
});
