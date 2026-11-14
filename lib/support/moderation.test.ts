import { describe, expect, it } from "vitest";
import { parseMessageId, parseStatusFilter, parseStatusUpdate } from "./moderation";

describe("parseStatusUpdate", () => {
  it("accepts a positive integer id and a known status", () => {
    expect(parseStatusUpdate({ id: 4, status: "approved" })).toEqual({ id: 4, status: "approved" });
    expect(parseStatusUpdate({ id: 1, status: "hidden" })).toEqual({ id: 1, status: "hidden" });
    expect(parseStatusUpdate({ id: 9, status: "pending" })).toEqual({ id: 9, status: "pending" });
  });
  it.each([
    [null],
    [{}],
    [{ id: 0, status: "approved" }],
    [{ id: -1, status: "approved" }],
    [{ id: 1.5, status: "approved" }],
    [{ id: "4", status: "approved" }],
    [{ id: 4, status: "deleted" }],
    [{ id: 4 }],
  ])("rejects %j", (body) => {
    expect(parseStatusUpdate(body)).toBeNull();
  });
});

describe("parseMessageId", () => {
  it("reads a positive integer", () => {
    expect(parseMessageId("12")).toBe(12);
  });
  it.each([null, "", "0", "-3", "1.5", "12abc", "1e3"])("rejects %j", (raw) => {
    expect(parseMessageId(raw)).toBeNull();
  });
});

describe("parseStatusFilter", () => {
  it("defaults to pending", () => {
    expect(parseStatusFilter(null)).toBe("pending");
    expect(parseStatusFilter("nope")).toBe("pending");
  });
  it("keeps a known status", () => {
    expect(parseStatusFilter("approved")).toBe("approved");
    expect(parseStatusFilter("hidden")).toBe("hidden");
  });
});
