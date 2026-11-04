import { describe, expect, it } from "vitest";
import { bangkokDay } from "./bangkokDay";

describe("bangkokDay", () => {
  it("formats as a sortable YYYY-MM-DD key", () => {
    expect(bangkokDay("2026-03-14T06:00:00Z")).toBe("2026-03-14");
  });

  it("keeps the early hours of a Thai day on that day", () => {
    // 00:30 and 06:59 in Bangkok are still the previous day in UTC. This is
    // the case the old `created_at.slice(0, 10)` and `setHours(0,0,0,0)`
    // both got wrong, moving those signups to the day before.
    expect(bangkokDay("2026-03-13T17:30:00Z")).toBe("2026-03-14"); // 00:30 ICT
    expect(bangkokDay("2026-03-13T23:59:00Z")).toBe("2026-03-14"); // 06:59 ICT
  });

  it("rolls over at Thai midnight, not UTC midnight", () => {
    expect(bangkokDay("2026-03-13T16:59:59Z")).toBe("2026-03-13"); // 23:59 ICT
    expect(bangkokDay("2026-03-13T17:00:00Z")).toBe("2026-03-14"); // 00:00 ICT
  });

  it("does not shift for daylight saving, which Thailand does not observe", () => {
    // Northern-hemisphere DST changeover; ICT is UTC+7 all year.
    expect(bangkokDay("2026-07-01T17:00:00Z")).toBe("2026-07-02");
    expect(bangkokDay("2026-01-01T17:00:00Z")).toBe("2026-01-02");
  });

  it("accepts a Date as well as an ISO string", () => {
    expect(bangkokDay(new Date("2026-03-13T17:00:00Z"))).toBe("2026-03-14");
  });
});
